import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        await db.collection("products").doc(id).delete();

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("DELETE Product Error:", error);
        return NextResponse.json(
            { error: "Failed to delete product", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
