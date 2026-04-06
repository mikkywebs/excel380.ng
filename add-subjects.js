const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase config (you'll need your actual config)
const firebaseConfig = {
  // Add your Firebase config here from .env.local or Firebase console
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const subjects = [
  'Accounting',
  'Marketing', 
  'Office Practice',
  'French',
  'Visual Arts',
  'Music',
  'Igbo',
  'Hausa', 
  'Yoruba',
  'Nigerian History',
  'Christian Religious Studies',
  'Islamic Studies',
  'Geography',
  'Further Mathematics',
  'Technical Drawing',
  'Agricultural Science'
];

async function addSubjects() {
  try {
    for (const subject of subjects) {
      const subjectId = subject.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      await setDoc(doc(db, 'subjects', subjectId), {
        name: subject,
        id: subjectId,
        active: true,
        created_at: new Date(),
        question_count: 0
      });
      console.log(`Added: ${subject}`);
    }
    console.log('All subjects added successfully!');
  } catch (error) {
    console.error('Error adding subjects:', error);
  }
}

addSubjects();
