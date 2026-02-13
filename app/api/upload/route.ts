import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replaceAll(" ", "_")}`;

        const bucket = storage.bucket();
        const storageFile = bucket.file(`products/${filename}`);

        await storageFile.save(buffer, {
            contentType: file.type,
            metadata: {
                firebaseStorageDownloadTokens: crypto.randomUUID(),
            }
        });

        // Make the file public
        await storageFile.makePublic();

        const publicUrl = storageFile.publicUrl();

        return NextResponse.json({ url: publicUrl }, { status: 201 });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({
            error: "Failed to upload file.",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
