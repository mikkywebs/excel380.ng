const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Path to service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccountKey.json not found in the root directory.');
  console.error('Please download it from Firebase Console > Project Settings > Service accounts and place it here.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedData() {
  try {
    console.log('--- Starting Firestore Seeding ---');

    // 1. Create app_config/main_settings
    const mainSettings = {
      primary_color: "#45a257",
      free_credits: 100,
      credits_per_question: 10,
      free_questions_per_test: 5,
      pause_between_tests_minutes: 10,
      jamb_time_minutes: 120,
      waec_time_minutes: 180,
      neco_time_minutes: 180,
      nabteb_time_minutes: 120,
      max_institution_students: 200,
      maintenance_mode: false,
      ai_generation_enabled: true,
      subscription_plans: {
        scholar_6m: { price: 5000, duration_months: 6, label: "Scholar" },
        scholar_lifetime: { price: 24000, duration_months: null, label: "Scholar Pro" },
        academy_6m: { price: 25000, duration_months: 6, label: "Academy" },
        academy_elite: { price: 50000, duration_months: null, label: "Academy Elite" }
      },
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('app_config').doc('main_settings').set(mainSettings);
    console.log('✓ Successfully seeded app_config/main_settings');

    // 2. Create Subjects
    const subjects = [
      { id: 'english', name: 'English', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: true },
      { id: 'mathematics', name: 'Mathematics', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: true },
      { id: 'economics', name: 'Economics', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'government', name: 'Government', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'literature-in-english', name: 'Literature in English', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'commerce', name: 'Commerce', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'physics', name: 'Physics', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'biology', name: 'Biology', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'chemistry', name: 'Chemistry', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'accounting', name: 'Accounting', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'marketing', name: 'Marketing', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'office-practice', name: 'Office Practice', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'french', name: 'French', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'visual-arts-music', name: 'Visual Arts/ Music', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'nigerian-languages', name: 'Nigerian languages (Igbo, Hausa, Yoruba)', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'nigerian-history', name: 'Nigerian History', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'crs', name: 'Christian Religious Studies (CRS)', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'islamic-studies', name: 'Islamic Studies', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'geography', name: 'Geography', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'further-mathematics', name: 'Further Mathematics', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'technical-drawing', name: 'Technical Drawing', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false },
      { id: 'agricultural-science', name: 'Agricultural Science', exam_bodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB'], is_compulsory: false }
    ];

    for (const subject of subjects) {
      const { id, ...data } = subject;
      await db.collection('subjects').doc(id).set({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✓ Seeded subject: ${subject.name}`);
    }

    // 3. Seed 5 Sample Questions for English Language (JAMB)
    const sampleQuestions = [
      {
        subject_id: 'english',
        exam_body: 'JAMB',
        question_text: 'Choose the option opposite in meaning to the underlined word: The manager was **versatile** in his approach to the problem.',
        options: {
          a: 'Limited',
          b: 'Resourceful',
          c: 'Inflexible',
          d: 'Dynamic'
        },
        correct_option: 'a',
        explanation: '"Versatile" means able to adapt or be used in many different ways. The opposite is "Limited".',
        is_approved: true,
        source: 'admin',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        subject_id: 'english',
        exam_body: 'JAMB',
        question_text: 'Choose the word that has the same vowel sound as the one represented by the underlined letter: B**oo**t',
        options: {
          a: 'Foot',
          b: 'Blood',
          c: 'Route',
          d: 'Door'
        },
        correct_option: 'c',
        explanation: '"Boot" and "Route" share the same long /uː/ sound.',
        is_approved: true,
        source: 'admin',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        subject_id: 'english',
        exam_body: 'JAMB',
        question_text: 'Choose the most appropriate option to fill the gap: Neither the teachers nor the principal ___ present at the meeting.',
        options: {
          a: 'were',
          b: 'is',
          c: 'was',
          d: 'have been'
        },
        correct_option: 'c',
        explanation: 'When "neither...nor" is used, the verb agrees with the closer subject. "Principal" is singular, so "was" is correct.',
        is_approved: true,
        source: 'admin',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        subject_id: 'english',
        exam_body: 'JAMB',
        question_text: 'Choose the option nearest in meaning to the underlined word: The lecture was **pedagogical** in nature.',
        options: {
          a: 'Scientific',
          b: 'Educational',
          c: 'Political',
          d: 'Philosophical'
        },
        correct_option: 'b',
        explanation: '"Pedagogical" relates to teaching or education.',
        is_approved: true,
        source: 'admin',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        subject_id: 'english',
        exam_body: 'JAMB',
        question_text: 'Identify the word with a different stress pattern:',
        options: {
          a: 'Education',
          b: 'Information',
          c: 'Organization',
          d: 'Develop'
        },
        correct_option: 'd',
        explanation: '"Develop" is stressed on the second syllable, while the others are stressed on the penultimate syllable.',
        is_approved: true,
        source: 'admin',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (let i = 0; i < sampleQuestions.length; i++) {
      await db.collection('questions').add(sampleQuestions[i]);
    }
    console.log('✓ Successfully seeded 5 sample English questions (JAMB)');

    // 4. Create Exam Bodies
    const examBodies = [
      { id: 'JAMB', name: 'JAMB', full_name: 'Joint Admissions and Matriculation Board', description: 'Unified Tertiary Matriculation Examination (UTME) for Nigerian universities.', is_active: true },
      { id: 'WAEC', name: 'WAEC', full_name: 'West African Examinations Council', description: 'Senior School Certificate Examination (SSCE) for West African countries.', is_active: true },
      { id: 'NECO', name: 'NECO', full_name: 'National Examinations Council', description: 'National Senior School Certificate Examination (SSCE) for Nigerian students.', is_active: true },
      { id: 'NABTEB', name: 'NABTEB', full_name: 'National Business and Technical Examinations Board', description: 'National Business and Technical Certificate Examinations.', is_active: true }
    ];

    for (const body of examBodies) {
      const { id, ...data } = body;
      await db.collection('exam_bodies').doc(id).set({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✓ Seeded exam body: ${body.name}`);
    }

    console.log('--- Firestore Seeding Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error during seeding:', error);
    process.exit(1);
  }
}

seedData();
