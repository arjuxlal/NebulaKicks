import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET() {
    try {
        const categoriesRef = db.collection("categories");
        const snapshot = await categoriesRef.orderBy("name", "asc").get();

        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, description, icon } = body;

        if (!name) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        const categoryData = {
            name,
            description: description || "",
            icon: icon || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const categoryRef = db.collection("categories").doc();
        await categoryRef.set(categoryData);

        return NextResponse.json({ id: categoryRef.id, ...categoryData }, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, description, icon } = body;

        if (!id || !name) {
            return NextResponse.json({ error: "Category ID and name are required" }, { status: 400 });
        }

        const categoryRef = db.collection("categories").doc(id);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        const updateData = {
            name,
            description: description || "",
            icon: icon || "",
            updatedAt: new Date().toISOString()
        };

        await categoryRef.update(updateData);

        return NextResponse.json({ id, ...updateData });
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        const categoryRef = db.collection("categories").doc(id);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        await categoryRef.delete();

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
