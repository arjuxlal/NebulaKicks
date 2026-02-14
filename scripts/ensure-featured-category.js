const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function ensureFeaturedCategory() {
    console.log('Checking for "Featured" category...');
    const categoriesRef = db.collection('categories');
    const q = categoriesRef.where('name', '==', 'Featured');
    const snapshot = await q.get();

    if (snapshot.empty) {
        console.log('Category not found. Creating "Featured" category...');
        await categoriesRef.add({
            name: 'Featured',
            description: 'Hand-picked futuristic footwear.',
            icon: 'Zap',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        console.log('Category "Featured" created successfully.');
    } else {
        console.log('Category "Featured" already exists.');
    }
}

ensureFeaturedCategory()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error ensuring featured category:', err);
        process.exit(1);
    });
