import Razorpay from 'razorpay';

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
    console.warn("Razorpay credentials not found. Payment features will not work.");
}

export const razorpay = (key_id && key_secret)
    ? new Razorpay({
        key_id,
        key_secret,
    })
    : {
        orders: {
            create: async (options: any) => ({
                id: "order_mock",
                entity: "order",
                amount: options.amount,
                amount_paid: 0,
                amount_due: options.amount,
                currency: "INR",
                receipt: "mock_receipt",
                status: "created",
                attempts: 0,
                notes: [],
                created_at: Math.floor(Date.now() / 1000),
            }),
        },
    } as any;

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
    const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        throw error;
    }
};

export const verifyPaymentSignature = (
    orderId: string,
    paymentId: string,
    signature: string
): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    return generatedSignature === signature;
};
