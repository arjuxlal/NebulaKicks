import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET() {
    try {
        const productsRef = db.collection("products");
        const snapshot = await productsRef.get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(products);
    } catch (error) {
        console.error("GET Products Error Debug:", error);
        return NextResponse.json({ error: "Failed to fetch products", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const productsRef = db.collection("products");

        // Ensure both image (singular) and images (plural) are present for compatibility
        const productData = {
            ...body,
            image: body.image || (body.images && body.images.length > 0 ? body.images[0] : ""),
            images: body.images || (body.image ? [body.image] : []),
            createdAt: new Date().toISOString()
        };

        const newDoc = await productsRef.add(productData);

        return NextResponse.json({ id: newDoc.id, ...productData }, { status: 201 });
    } catch (_error) {
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
