const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Add your Firebase config from .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newSubjects = [
  'Accounting', 'Marketing', 'Office Practice', 'French', 
  'Visual Arts', 'Music', 'Igbo', 'Hausa', 'Yoruba',
  'Nigerian History', 'Christian Religious Studies', 'Islamic Studies',
  'Geography', 'Further Mathematics', 'Technical Drawing', 'Agricultural Science'
];

async function addNewSubjects() {
  try {
    console.log('Ì≥ö Adding new subjects to existing database...');
    
    for (const subject of newSubjects) {
      const subjectId = subject.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      
      await setDoc(doc(db, 'subjects', subjectId), {
        name: subject,
        id: subjectId,
        active: true,
        created_at: new Date(),
        question_count: 0
      });
      
      console.log(`‚úÖ Added: ${subject}`);
    }
    
    console.log('Ìæâ All new subjects added successfully!');
  } catch (error) {
    console.error('‚ùå Error adding subjects:', error);
  }
}

addNewSubjects();
