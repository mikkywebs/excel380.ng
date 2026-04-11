const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccountKey.json not found in the root directory.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixCredits() {
  try {
    console.log('--- Starting Credit Fix ---');
    const snapshot = await db.collection('users').where('credits', '==', 0).get();
    
    if (snapshot.empty) {
      console.log('No users found with 0 credits.');
      process.exit(0);
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { credits: 100 });
      console.log(`Setting credits to 100 for user: ${doc.id}`);
    });

    await batch.commit();
    console.log(`--- Finished updating ${snapshot.size} users ---`);
    process.exit(0);
  } catch (err) {
    console.error('Error fixing credits:', err);
    process.exit(1);
  }
}

fixCredits();
