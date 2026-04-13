import * as functionsV1 from "firebase-functions/v1";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import axios from "axios";

initializeApp();
const db = getFirestore();

// Secrets
const PAYSTACK_SECRET_KEY = defineSecret("PAYSTACK_SECRET_KEY");

/**
 * Function 1: onUserCreated
 * Trigger: Firebase Auth onCreate (Using v1 as v2 does not support async auth triggers yet)
 * Action: Create Firestore document users/{uid}
 */
export const newUserCreated = functionsV1.auth.user().onCreate(async (user) => {
  if (!user) return;

  try {
    // 1. Read default free_credits from app_config/main_settings
    const configDoc = await db.collection("app_config").doc("main_settings").get();
    const freeCredits = configDoc.exists ? (configDoc.data()?.free_credits || 100) : 100;

    // 2. Create the user document
    const userDoc = {
      email: user.email || "",
      displayName: user.displayName || "",
      role: "student",
      subscription_tier: "explorer",
      subscription_expiry: null,
      credits: freeCredits,
      institution_id: null,
      last_test_at: null,
      created_at: FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(user.uid).set(userDoc);
    logger.info(`✓ Profile created for user: ${user.uid}`);
  } catch (error) {
    logger.error("✗ Error in onUserCreated:", error);
  }
});

/**
 * Function 2: verifyPaystackPayment
 * Trigger: HTTPS callable
 */
export const verifyPaystackPayment = onCall({ secrets: [PAYSTACK_SECRET_KEY] }, async (request) => {
  const { reference, plan, user_uid } = request.data;
  if (!reference || !plan || !user_uid) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  try {
    // 1. Verify with Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY.value()}`,
      },
    });

    if (response.data.status !== true || response.data.data.status !== "success") {
      throw new HttpsError("failed-precondition", "Payment verification failed.");
    }

    // 2. Map plan to tier and expiry
    let targetTier = "explorer";
    let expiryDate: Date | null = null;
    let createInstitution = false;

    const now = new Date();
    
    switch (plan) {
      case "scholar":
        targetTier = "scholar";
        expiryDate = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case "scholar_pro":
        targetTier = "scholar_pro";
        expiryDate = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case "scholar_6m":
        targetTier = "scholar";
        expiryDate = new Date(now.setMonth(now.getMonth() + 6));
        break;
      case "scholar_lifetime":
        targetTier = "scholar_pro";
        expiryDate = null;
        break;
      case "academy_6m":
        targetTier = "academy";
        expiryDate = new Date(now.setMonth(now.getMonth() + 6));
        createInstitution = true;
        break;
      case "academy_elite":
        targetTier = "academy_elite";
        expiryDate = null;
        createInstitution = true;
        break;
    }

    // 3. Update User Document
    await db.collection("users").doc(user_uid).update({
      subscription_tier: targetTier,
      subscription_expiry: expiryDate ? Timestamp.fromDate(expiryDate) : null,
    });

    // 4. Create Institution if applicable
    if (createInstitution) {
      const inviteCode = `EXCEL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await db.collection("institutions").add({
        owner_uid: user_uid,
        invite_code: inviteCode,
        student_count: 0,
        is_active: true,
        created_at: FieldValue.serverTimestamp(),
      });
    }

    return { success: true, tier: targetTier };
  } catch (error) {
    logger.error("✗ Error in verifyPaystackPayment:", error);
    throw new HttpsError("internal", "Verification process encountered an error.");
  }
});

/**
 * Function 3: joinInstitution
 * Trigger: HTTPS callable
 */
export const joinInstitution = onCall(async (request) => {
  const { invite_code } = request.data;
  const uid = request.auth?.uid;

  if (!invite_code || !uid) {
    throw new HttpsError("invalid-argument", "Invite code and auth are required.");
  }

  return await db.runTransaction(async (transaction) => {
    // 1. Find institution
    const instQuery = await db.collection("institutions")
      .where("invite_code", "==", invite_code)
      .where("is_active", "==", true)
      .limit(1)
      .get();

    if (instQuery.empty) {
      throw new HttpsError("not-found", "Invalid or inactive invite code.");
    }

    const instDoc = instQuery.docs[0];
    const instData = instDoc.data();

    // 2. Check student limits
    const configDoc = await transaction.get(db.collection("app_config").doc("main_settings"));
    const maxStudents = configDoc.exists ? (configDoc.data()?.max_institution_students || 200) : 200;

    if (instData.student_count >= maxStudents) {
      throw new HttpsError("resource-exhausted", "Institution is full.");
    }

    // 3. Update User and Institution
    transaction.update(db.collection("users").doc(uid), { institution_id: instDoc.id });
    transaction.update(instDoc.ref, { student_count: FieldValue.increment(1) });

    return { success: true, institution_id: instDoc.id };
  });
});

/**
 * Function 4: syncOfflineResults
 * Trigger: HTTPS callable
 */
interface TestResult {
  subject_id: string;
  exam_body: string;
  score: number;
  completed_at: any;
}

export const syncOfflineResults = onCall(async (request) => {
  const { results } = request.data as { results: TestResult[] };
  const uid = request.auth?.uid;

  if (!results || !Array.isArray(results) || !uid) {
    throw new HttpsError("invalid-argument", "Invalid results array or auth.");
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData) throw new HttpsError("not-found", "User not found.");

    await db.runTransaction(async (transaction) => {
      let currentCredits = userData.credits || 0;
      const isExplorer = userData.subscription_tier === "explorer";

      // 1. Process each result
      for (const result of results) {
        const sessionRef = db.collection("test_sessions").doc();
        transaction.set(sessionRef, {
          user_id: uid,
          ...result,
          synced_at: FieldValue.serverTimestamp(),
        });

        // 2. Deduct credits if Explorer
        if (isExplorer) {
          const configDoc = await transaction.get(db.collection("app_config").doc("main_settings"));
          const creditCost = configDoc.exists ? (configDoc.data()?.credits_per_question || 10) : 10;
          currentCredits -= creditCost;
        }
      }

      // 3. Update User State
      transaction.update(userRef, {
        credits: currentCredits,
        last_test_at: FieldValue.serverTimestamp(),
      });
    });

    return { synced: results.length };
  } catch (error) {
    logger.error("✗ Error in syncOfflineResults:", error);
    throw new HttpsError("internal", "Syncing failed.");
  }
});
