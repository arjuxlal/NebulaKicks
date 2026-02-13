import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();

        const ordersRef = db.collection("orders");

        const orderData = {
            ...body,
            status: body.status || "Pending",
            createdAt: new Date().toISOString(),
            userId: session?.user?.id || null,
            customerEmail: session?.user?.email || body.customerEmail,
        };

        // Create a new document reference with auto-generated ID
        const newDocRef = ordersRef.doc();
        await newDocRef.set(orderData);

        return NextResponse.json({ id: newDocRef.id, ...orderData }, { status: 201 });
    } catch (error) {
        console.error("Order Creation Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ordersRef = db.collection("orders");
        // Firestore doesn't verify relation existence easily like Prisma, 
        // but we'll fetch all orders and the client can display what it has.
        // If we needed user details, we'd fetch them separately or embed them at creation.
        // For now, simple fetch.

        const snapshot = await ordersRef.orderBy("createdAt", "desc").get();
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(orders);
    } catch (error) {
        console.error("GET Orders Error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const orderRef = db.collection("orders").doc(id);
        await orderRef.update({ status });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
