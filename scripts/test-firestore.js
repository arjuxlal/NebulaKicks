
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env' });

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testConnection() {
    try {
        console.log("Attempting to list collections...");
        const collections = await db.listCollections();
        console.log("Collections:", collections.map(c => c.id));
    } catch (error) {
        console.error("Connection Error:", error);
    }
}

testConnection();
