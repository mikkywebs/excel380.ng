const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccountKey.json not found in the root directory.');
  console.error('Please ensure the key is placed in the project root.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function makeAdmin(email) {
  try {
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      console.log(`User with email "${email}" not found in Firestore.`);
      process.exit(1);
    }
    
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({ role: 'admin' });
    
    console.log(`✅ Successfully promoted "${email}" to ADMIN!`);
    console.log(`You can now log in at http://localhost:3000/admin`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to make user admin:', error);
    process.exit(1);
  }
}

const targetEmail = process.argv[2];
if (!targetEmail) {
  console.log('Usage: node make-admin.js <your-email-address>');
  console.log('Example: node make-admin.js john@example.com');
  process.exit(1);
}

makeAdmin(targetEmail);
