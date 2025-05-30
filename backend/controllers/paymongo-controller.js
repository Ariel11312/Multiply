import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_API_URL = "https://api.xendit.co";

// Validate configuration on startup
if (!XENDIT_SECRET_KEY) {
    console.error("FATAL: Xendit secret key is not configured");
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

        // Prepare invoice data
        const externalId = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const roundedAmount = Math.round(Number(amount));
        
        const invoiceData = {
            external_id: externalId,
            amount: roundedAmount,
            currency: "PHP",
            description,
            invoice_duration: 86400, // 24 hours in seconds
            customer: {
                given_names: name || "Customer",
                email: email || "customer@example.com",
                mobile_number: phone || "+639123456789",
            },
            customer_notification_preference: {
                invoice_created: ["email"],
                invoice_reminder: ["email"],
                invoice_paid: ["email"],
                invoice_expired: ["email"]
            },
            success_redirect_url: `${process.env.PAYMENT_SUCCESS_URL || process.env.VITE_URL}/verify-payment?invoiceId=${externalId}`,
            failure_redirect_url: `${process.env.PAYMENT_FAILURE_URL || process.env.VITE_URL}/payment-failed?invoiceId=${externalId}`,
            payment_methods: ["GCASH", "GRABPAY", "PAYMAYA", "BPI", "BDO", "UNIONBANK", "RCBC"],
            fees: [{
                type: "ADMIN",
                value: 0
            }]
        };

        console.log("Creating Xendit invoice with data:", invoiceData);

        // Create invoice
        const response = await axios.post(
            `${XENDIT_API_URL}/v2/invoices`,
            invoiceData,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
                    "Content-Type": "application/json",
                },
                timeout: 10000 // 10 second timeout
            }
        );

        // Return response
        return res.json({
            success: true,
            checkoutUrl: response.data.invoice_url,
            invoiceId: response.data.id,
            externalId: response.data.external_id,
            status: response.data.status,
            expiryDate: response.data.expiry_date,
        });

    } catch (error) {
        console.error("Payment creation error:", {
            message: error.message,
            response: error.response?.data,
            stack: error.stack,
        });

        if (error.response?.data?.error_code) {
            return res.status(error.response.status || 400).json({
                success: false,
                error: {
                    message: error.response.data.message,
                    code: error.response.data.error_code,
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