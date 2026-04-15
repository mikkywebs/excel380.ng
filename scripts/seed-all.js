/**
 * Excel 380 — Full Firestore Seeder
 * Uses the Firebase REST API (no Admin SDK / service account needed).
 *
 * Usage:
 *   node scripts/seed-all.js <admin-email> <admin-password>
 *
 * Example:
 *   node scripts/seed-all.js admin@excel380.ng MyPassword123
 */

const https = require('https');
const path  = require('path');
const fs    = require('fs');

// ── Config from .env.local ──────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌  .env.local not found');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env   = {};
  for (const line of lines) {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  }
  return env;
}

const env        = loadEnv();
const API_KEY    = env['NEXT_PUBLIC_FIREBASE_API_KEY'];
const PROJECT_ID = env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];

if (!API_KEY || !PROJECT_ID) {
  console.error('❌  NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID missing from .env.local');
  process.exit(1);
}

const [,, EMAIL, PASSWORD] = process.argv;
if (!EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/seed-all.js <admin-email> <admin-password>');
  process.exit(1);
}

// ── Tiny HTTP helpers ───────────────────────────────────────────────────────
function request(url, method, body, bearerToken) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const u       = new URL(url);
    const headers = { 'Content-Type': 'application/json' };
    if (bearerToken) headers['Authorization'] = `Bearer ${bearerToken}`;
    if (payload)     headers['Content-Length'] = Buffer.byteLength(payload);

    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try   { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Firebase Auth: sign in with email/password ─────────────────────────────
async function signIn(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  const res = await request(url, 'POST', { email, password, returnSecureToken: true });
  if (res.status !== 200) {
    console.error('❌  Sign-in failed:', JSON.stringify(res.body));
    process.exit(1);
  }
  console.log(`✅  Signed in as ${email}`);
  return res.body.idToken;
}

// ── Firestore REST: set a document (merge) ──────────────────────────────────
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean')          return { booleanValue: val };
  if (typeof val === 'number')           return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'string')           return { stringValue: val };
  if (Array.isArray(val))                return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (val && typeof val === 'object')    return { mapValue: { fields: toFirestoreFields(val) } };
  return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  }
  return fields;
}

async function setDoc(collection, docId, data, idToken) {
  const url = `${FIRESTORE_BASE}/${collection}/${docId}?currentDocument.exists=false||currentDocument.exists=true`;
  // Use PATCH with updateMask to behave like merge:true
  const allFields = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const patchUrl  = `${FIRESTORE_BASE}/${collection}/${encodeURIComponent(docId)}?${allFields}`;
  const res = await request(patchUrl, 'PATCH', { fields: toFirestoreFields(data) }, idToken);
  if (res.status >= 400) {
    throw new Error(`Firestore write failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return res.body;
}

async function deleteDoc(collection, docId, idToken) {
  const url = `${FIRESTORE_BASE}/${collection}/${encodeURIComponent(docId)}`;
  const res = await request(url, 'DELETE', null, idToken);
  // 404 is fine (doc didn't exist)
  if (res.status >= 400 && res.status !== 404) {
    console.warn(`  ⚠  Could not delete ${collection}/${docId} (${res.status})`);
  }
}

// ── Seed: app_config/main_settings ─────────────────────────────────────────
async function seedAppConfig(idToken) {
  console.log('\n📋  Seeding app_config/main_settings …');
  const data = {
    primary_color:              '#45a257',
    free_credits:               100,
    credits_per_question:       1,
    free_questions_per_test:    10,
    pause_window_minutes:       30,
    pause_between_tests_minutes:30,
    exam_time_minutes:          120,
    jamb_time_minutes:          120,
    waec_time_minutes:          180,
    neco_time_minutes:          180,
    nabteb_time_minutes:        120,
    questions_per_exam:         40,
    passing_percentage:         50,
    subjects_available:         24,
    institutions_available:     900,
    max_institution_students:   500,
    maintenance_mode:           false,
    ai_generation_enabled:      true,
    subscription_plans: {
      scholar_6m:      { label: 'Scholar',        price: 5000,  duration_months: 6 },
      scholar_lifetime:{ label: 'Scholar Pro',    price: 24000, duration_months: 0 },
      academy_6m:      { label: 'Academy',        price: 25000, duration_months: 6 },
      academy_elite:   { label: 'Academy Elite',  price: 50000, duration_months: 0 },
    },
  };
  await setDoc('app_config', 'main_settings', data, idToken);
  console.log('  ✅  app_config/main_settings done');
}

// ── Seed: 24 subjects ───────────────────────────────────────────────────────
async function seedSubjects(idToken) {
  console.log('\n📚  Seeding subjects …');
  const subjects = [
    { id: 'english_language',      name: 'English Language',                    is_compulsory: true  },
    { id: 'mathematics',           name: 'Mathematics',                          is_compulsory: true  },
    { id: 'economics',             name: 'Economics',                            is_compulsory: false },
    { id: 'government',            name: 'Government',                           is_compulsory: false },
    { id: 'literature-in-english', name: 'Literature in English',               is_compulsory: false },
    { id: 'commerce',              name: 'Commerce',                             is_compulsory: false },
    { id: 'physics',               name: 'Physics',                              is_compulsory: false },
    { id: 'biology',               name: 'Biology',                              is_compulsory: false },
    { id: 'chemistry',             name: 'Chemistry',                            is_compulsory: false },
    { id: 'accounting',            name: 'Accounting',                           is_compulsory: false },
    { id: 'marketing',             name: 'Marketing',                            is_compulsory: false },
    { id: 'office-practice',       name: 'Office Practice',                      is_compulsory: false },
    { id: 'french',                name: 'French',                               is_compulsory: false },
    { id: 'visual-arts-music',     name: 'Visual Arts/ Music',                   is_compulsory: false },
    { id: 'igbo',                  name: 'Igbo',                                 is_compulsory: false },
    { id: 'hausa',                 name: 'Hausa',                                is_compulsory: false },
    { id: 'yoruba',                name: 'Yoruba',                               is_compulsory: false },
    { id: 'nigerian-history',      name: 'Nigerian History',                     is_compulsory: false },
    { id: 'crs',                   name: 'Christian Religious Studies (CRS)',    is_compulsory: false },
    { id: 'islamic-studies',       name: 'Islamic Studies',                      is_compulsory: false },
    { id: 'geography',             name: 'Geography',                            is_compulsory: false },
    { id: 'further-mathematics',   name: 'Further Mathematics',                  is_compulsory: false },
    { id: 'technical-drawing',     name: 'Technical Drawing',                    is_compulsory: false },
    { id: 'agricultural-science',  name: 'Agricultural Science',                 is_compulsory: false },
  ];

  for (const { id, ...rest } of subjects) {
    await setDoc('subjects', id, {
      ...rest,
      exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'],
    }, idToken);
    process.stdout.write(`  ✅  ${rest.name}\n`);
  }

  // Cleanup old/duplicate IDs
  const staleIds = ['nigerian-languages','english','english-language','use-of-english','use_of_english'];
  for (const old of staleIds) await deleteDoc('subjects', old, idToken);
  console.log('  🧹  Old duplicate subjects removed');
}

// ── Seed: Nigerian institutions (university_cutoffs) ───────────────────────
async function seedInstitutions(idToken) {
  const institutionsPath = path.join(__dirname, '..', 'src', 'data', 'institutions.json');
  if (!fs.existsSync(institutionsPath)) {
    console.error('❌  institutions.json not found at src/data/institutions.json');
    return;
  }
  const institutions = JSON.parse(fs.readFileSync(institutionsPath, 'utf8'));
  console.log(`\n🏫  Seeding ${institutions.length} institutions …`);

  let done = 0;
  for (const inst of institutions) {
    if (!inst.name || !inst.id) continue;
    await setDoc('university_cutoffs', String(inst.id), {
      name:     inst.name,
      score:    Number(inst.score) || 160,
      category: inst.category || 'Degree-Awarding Institutions',
    }, idToken);
    done++;
    if (done % 50 === 0) process.stdout.write(`  … ${done}/${institutions.length}\n`);
  }
  console.log(`  ✅  ${done} institutions seeded`);
}

// ── Main ────────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀  Excel 380 Firestore Seeder');
  console.log(`   Project: ${PROJECT_ID}`);

  const idToken = await signIn(EMAIL, PASSWORD);

  await seedAppConfig(idToken);
  await seedSubjects(idToken);
  await seedInstitutions(idToken);

  console.log('\n🎉  All seeding complete!\n');
  process.exit(0);
})();
