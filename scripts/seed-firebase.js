
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env' });

if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.error("Missing FIREBASE_PRIVATE_KEY");
    process.exit(1);
}

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const products = [
    {
        name: "Nebula 97 Starfall",
        brand: "Nebula",
        price: 189.99,
        category: "Running",
        images: ["/uploads/shoe1.png"], // Placeholder, assumes you upload one or use valid URL
        description: "The classic silhouette reimaged for zero-g enviroments.",
        sizes: [7, 8, 9, 10, 11],
        inStock: true,
        createdAt: new Date().toISOString()
    },
    {
        name: "CyberRunner V2",
        brand: "Nebula",
        price: 249.99,
        category: "Lifestyle",
        images: ["/uploads/shoe2.png"],
        description: "Built for the neon streets. Reactive LED soles included.",
        sizes: [8, 9, 10, 11, 12],
        inStock: true,
        createdAt: new Date().toISOString()
    }
];

async function seed() {
    try {
        const batch = db.batch();

        for (const product of products) {
            const ref = db.collection('products').doc();
            batch.set(ref, product);
        }

        await batch.commit();
        console.log(`Seeded ${products.length} products to Firestore.`);
    } catch (error) {
        console.error("Seeding Failed:", error);
    }
}

seed();
