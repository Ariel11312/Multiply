import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HITPAY_SECRET_KEY = process.env.HITPAY_SECRET_KEY;
const HITPAY_API_URL = "https://api.hit-pay.com/v1";

// Validate configuration on startup
if (!HITPAY_SECRET_KEY) {
    console.error("FATAL: HitPay secret key is not configured");
    process.exit(1);
}

export const createPayment = async (req, res) => {
    try {
        const { amount, description, name, email, phone } = req.body;

        // Input validation
        if (!amount || !description) {
            return res.status(400).json({
                error: "Missing required fields: amount and description are required",
            });
        }

        if (isNaN(amount)) {
            return res.status(400).json({
                error: "Amount must be a valid number",
            });
        }

        // Prepare payment request data
        const referenceNumber = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const roundedAmount = Math.round(Number(amount) * 100) / 100; // Round to 2 decimal places

        const paymentData = {
            amount: roundedAmount,
            currency: "PHP",
            name: name || "Customer",
            email: email || "customer@example.com",
            phone: phone || "+639123456789",
            purpose: description,
            reference_number: referenceNumber,
            redirect_url: `${process.env.PAYMENT_SUCCESS_URL || process.env.VITE_URL}/verify-payment?referenceNumber=${referenceNumber}`,
            webhook: `${process.env.WEBHOOK_URL || process.env.VITE_URL}/api/webhook/hitpay`,
            payment_methods: ["paynow", "grabpay", "card", "fpx"], // Common HitPay payment methods
            expires_after: 1440, // 24 hours in minutes
            allow_repeated_payments: false
        };

        console.log("Creating HitPay payment request with data:", paymentData);

        // Create payment request
        const response = await axios.post(
            `${HITPAY_API_URL}/payment-requests`,
            paymentData,
            {
                headers: {
                    "X-BUSINESS-API-KEY": HITPAY_SECRET_KEY,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout: 10000 // 10 second timeout
            }
        );

        // Return response
        return res.json({
            success: true,
            checkoutUrl: response.data.url,
            paymentId: response.data.id,
            referenceNumber: response.data.reference_number,
            status: response.data.status,
            expiryDate: response.data.expires_at,
        });

    } catch (error) {
        console.error("Payment creation error:", {
            message: error.message,
            response: error.response?.data,
            stack: error.stack,
        });

        if (error.response?.data?.error) {
            return res.status(error.response.status || 400).json({
                success: false,
                error: {
                    message: error.response.data.error,
                    code: error.response.data.error_code || "PAYMENT_ERROR",
                },
            });
        }

        return res.status(500).json({
            success: false,
            error: {
                message: "Payment processing failed",
                details: error.message,
            },
        });
    }
};

// Optional: Add webhook handler for payment status updates
export const handleWebhook = async (req, res) => {
    try {
        const { payment_id, status, reference_number, amount, currency } = req.body;
        
        // Verify webhook signature (recommended for production)
        // const signature = req.headers['x-hitpay-signature'];
        // if (!verifyWebhookSignature(req.body, signature)) {
        //     return res.status(400).json({ error: "Invalid signature" });
        // }

        console.log("HitPay webhook received:", {
            payment_id,
            status,
            reference_number,
            amount,
            currency
        });

        // Handle different payment statuses
        switch (status) {
            case "completed":
                // Payment successful - update your database
                console.log(`Payment ${payment_id} completed successfully`);
                break;
            case "failed":
                // Payment failed
                console.log(`Payment ${payment_id} failed`);
                break;
            case "pending":
                // Payment pending
                console.log(`Payment ${payment_id} is pending`);
                break;
            default:
                console.log(`Unknown payment status: ${status}`);
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ error: "Webhook processing failed" });
    }
};