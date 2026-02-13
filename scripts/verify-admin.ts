
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

// Initialize Firebase manually to ensure we use local env vars
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('FIREBASE_PRIVATE_KEY is missing in .env');
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin Initialized for script");
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        process.exit(1);
    }
}

const db = admin.firestore();

async function verifyAdmin() {
    const email = "admin@nebula.com";
    console.log(`Checking for user: ${email}...`);

    try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", email).get();

        if (snapshot.empty) {
            console.log("User does not exist.");
            console.log("To fix this, log in once on the website with:");
            console.log("Email: admin@nebula.com");
            console.log("Password: admin123");
            console.log("The system will auto-create the admin.");
        } else {
            snapshot.forEach(async (doc) => {
                const data = doc.data();
                console.log("User found:");
                console.log(`- ID: ${doc.id}`);
                console.log(`- Role: ${data.role}`);
                console.log(`- Email: ${data.email}`);

                if (data.role !== "ADMIN") {
                    console.log("User is NOT an ADMIN. Updating role...");
                    await doc.ref.update({ role: "ADMIN" });
                    console.log("SUCCESS: User updated to ADMIN role.");
                } else {
                    console.log("User is already an ADMIN.");
                }
            });
        }
    } catch (error) {
        console.error("Error verifying admin:", error);
    }
}

verifyAdmin();
