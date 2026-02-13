import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            firestore_order_id,
        } = await req.json();

        // Verify payment signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Update order status in Firestore
        if (firestore_order_id) {
            const orderRef = db.collection("orders").doc(firestore_order_id);
            await orderRef.update({
                status: "Paid",
                paymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                paidAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully",
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Payment verification failed" },
            { status: 500 }
        );
    }
}
