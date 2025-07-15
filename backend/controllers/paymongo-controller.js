import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HITPAY_SECRET_KEY = process.env.HITPAY_SECRET_KEY;
const HITPAY_API_URL = process.env.NODE_ENV === 'production' 
    ? "https://api.hit-pay.com/v1" 
    : "https://api.sandbox.hit-pay.com/v1";

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

        if (!email) {
            return res.status(400).json({
                error: "Email is required for HitPay payments",
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

        // Prepare form data (URL encoded format as per HitPay API)
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('redirect_url', `${process.env.PAYMENT_SUCCESS_URL || process.env.VITE_URL}/verify-payment?referenceNumber=${referenceNumber}`);
        formData.append('reference_number', referenceNumber);
        formData.append('currency', 'SGD'); // HitPay primarily uses SGD
        formData.append('amount', roundedAmount.toString());
        
        // Optional fields
        if (name) formData.append('name', name);
        if (phone) formData.append('phone', phone);
        if (description) formData.append('purpose', description);
        
        // Add webhook if configured
        if (process.env.WEBHOOK_URL) {
            formData.append('webhook', `${process.env.WEBHOOK_URL}/api/webhook/hitpay`);
        }

        console.log("Creating HitPay payment request with data:", Object.fromEntries(formData));
        console.log("Using API URL:", `${HITPAY_API_URL}/payment-requests`);
        console.log("Using API Key (first 10 chars):", HITPAY_SECRET_KEY.substring(0, 10) + "...");

        // Create payment request
        const response = await axios.post(
            `${HITPAY_API_URL}/payment-requests`,
            formData,
            {
                headers: {
                    "X-BUSINESS-API-KEY": HITPAY_SECRET_KEY,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
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
            amount: response.data.amount,
            currency: response.data.currency
        });

    } catch (error) {
        console.error("Payment creation error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data
            },
            stack: error.stack,
        });

        // Handle HitPay specific errors
        if (error.response?.data) {
            const errorData = error.response.data;
            return res.status(error.response.status || 400).json({
                success: false,
                error: {
                    message: errorData.message || errorData.error || "Payment processing failed",
                    code: errorData.error_code || "PAYMENT_ERROR",
                    details: errorData,
                    status: error.response.status
                },
            });
        }

        // Network or other errors
        return res.status(500).json({
            success: false,
            error: {
                message: "Payment processing failed",
                details: error.message,
                type: error.code || "UNKNOWN_ERROR"
            },
        });
    }
};

// Webhook handler for payment status updates
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

// Helper function to get payment status
export const getPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const response = await axios.get(
            `${HITPAY_API_URL}/payment-requests/${paymentId}`,
            {
                headers: {
                    "X-BUSINESS-API-KEY": HITPAY_SECRET_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout: 10000
            }
        );

        return res.json({
            success: true,
            payment: {
                id: response.data.id,
                status: response.data.status,
                amount: response.data.amount,
                currency: response.data.currency,
                reference_number: response.data.reference_number,
                url: response.data.url,
                expires_at: response.data.expires_at
            }
        });

    } catch (error) {
        console.error("Get payment status error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to retrieve payment status"
        });
    }
};