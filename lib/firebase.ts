
import * as admin from 'firebase-admin';

// Check for required environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
            console.log("Firebase Admin Initialized");
        } catch (error) {
            console.error("Firebase Admin Initialization Error", error);
        }
    } else {
        console.warn("Firebase credentials missing. Skipping initialization. APIs using Firebase will fail.");
    }
}

// Export initialized instances or mocks to prevent build crashes
export const db = admin.apps.length ? admin.firestore() : {
    collection: () => ({
        doc: () => ({
            get: async () => ({ exists: false, data: () => ({}) }),
            set: async () => { },
            update: async () => { },
            delete: async () => { },
        }),
        where: () => ({
            limit: () => ({
                get: async () => ({ empty: true, docs: [] }),
            }),
            get: async () => ({ empty: true, docs: [] }),
        }),
        get: async () => ({ docs: [] }),
        add: async () => ({ id: "mock-id" }),
    })
} as any;

export const auth = admin.apps.length ? admin.auth() : {
    getUser: async () => ({}),
    verifyIdToken: async () => ({}),
} as any;
