import Stripe from 'stripe';
import dotenv from "dotenv";
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Validate configuration on startup
if (!STRIPE_SECRET_KEY) {
    console.error("FATAL: Stripe secret key is not configured");
    console.error("Please set STRIPE_SECRET_KEY in your .env file");
    console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('STRIPE')));
    process.exit(1);
}

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Use a specific API version
});

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
                error: "Email is required for Stripe payments",
            });
        }

        if (isNaN(amount)) {
            return res.status(400).json({
                error: "Amount must be a valid number",
            });
        }

        // Prepare payment request data
        const referenceNumber = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const amountInCents = Math.round(Number(amount) * 100); // Stripe uses cents

        console.log("Creating Stripe payment intent with data:", {
            amount: amountInCents,
            currency: 'sgd',
            description,
            email,
            referenceNumber
        });

        // Create customer (optional but recommended)
        let customer = null;
        try {
            customer = await stripe.customers.create({
                email: email,
                name: name,
                phone: phone,
                metadata: {
                    reference_number: referenceNumber
                }
            });
        } catch (customerError) {
            console.warn("Failed to create customer:", customerError.message);
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'sgd', // Singapore Dollar
            customer: customer?.id,
            description: description,
            metadata: {
                reference_number: referenceNumber,
                name: name || '',
                phone: phone || ''
            },
            automatic_payment_methods: {
                enabled: true,
            },
            receipt_email: email,
        });

        // Create checkout session for hosted checkout experience
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customer?.id,
            customer_email: !customer ? email : undefined,
            line_items: [
                {
                    price_data: {
                        currency: 'sgd',
                        product_data: {
                            name: description,
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.PAYMENT_SUCCESS_URL || process.env.VITE_URL}/verify-payment?referenceNumber=${referenceNumber}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.PAYMENT_CANCEL_URL || process.env.VITE_URL}/payment-cancelled`,
            metadata: {
                reference_number: referenceNumber,
                payment_intent_id: paymentIntent.id
            }
        });

        // Return response
        return res.json({
            success: true,
            checkoutUrl: checkoutSession.url,
            paymentId: paymentIntent.id,
            checkoutSessionId: checkoutSession.id,
            referenceNumber: referenceNumber,
            status: paymentIntent.status,
            clientSecret: paymentIntent.client_secret, // For custom integration
            amount: (paymentIntent.amount / 100), // Convert back to dollars
            currency: paymentIntent.currency.toUpperCase()
        });

    } catch (error) {
        console.error("Payment creation error:", {
            message: error.message,
            type: error.type,
            code: error.code,
            decline_code: error.decline_code,
            param: error.param,
            stack: error.stack,
        });

        // Handle Stripe specific errors
        if (error.type) {
            let errorMessage = "Payment processing failed";
            let errorCode = error.code || "PAYMENT_ERROR";

            switch (error.type) {
                case 'StripeCardError':
                    errorMessage = error.message || "Your card was declined";
                    break;
                case 'StripeRateLimitError':
                    errorMessage = "Too many requests made to the API too quickly";
                    break;
                case 'StripeInvalidRequestError':
                    errorMessage = error.message || "Invalid parameters were supplied to Stripe's API";
                    break;
                case 'StripeAPIError':
                    errorMessage = "An error occurred internally with Stripe's API";
                    break;
                case 'StripeConnectionError':
                    errorMessage = "Some kind of error occurred during the HTTPS communication";
                    break;
                case 'StripeAuthenticationError':
                    errorMessage = "You probably used an incorrect API key";
                    break;
                default:
                    errorMessage = error.message || "An unexpected error occurred";
            }

            return res.status(400).json({
                success: false,
                error: {
                    message: errorMessage,
                    code: errorCode,
                    type: error.type,
                    param: error.param
                },
            });
        }

        // Network or other errors
        return res.status(500).json({
            success: false,
            error: {
                message: "Payment processing failed",
                details: error.message,
                type: "UNKNOWN_ERROR"
            },
        });
    }
};

// Webhook handler for payment status updates
export const handleWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.warn("Stripe webhook secret not configured");
            return res.status(400).json({ error: "Webhook secret not configured" });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error(`Webhook signature verification failed:`, err.message);
            return res.status(400).json({ error: `Webhook Error: ${err.message}` });
        }

        console.log("Stripe webhook received:", {
            type: event.type,
            id: event.data.object.id
        });

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`Payment ${paymentIntent.id} succeeded for amount ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
                // Update your database here
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log(`Payment ${failedPayment.id} failed`);
                // Handle failed payment
                break;

            case 'checkout.session.completed':
                const session = event.data.object;
                console.log(`Checkout session ${session.id} completed`);
                // Handle successful checkout
                break;

            case 'checkout.session.expired':
                const expiredSession = event.data.object;
                console.log(`Checkout session ${expiredSession.id} expired`);
                // Handle expired checkout
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ error: "Webhook processing failed" });
    }
};

// Helper function to get payment status
export const getPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;

        // Try to retrieve as payment intent first
        let payment;
        try {
            payment = await stripe.paymentIntents.retrieve(paymentId);
        } catch (error) {
            // If not a payment intent, try as checkout session
            if (error.code === 'resource_missing') {
                payment = await stripe.checkout.sessions.retrieve(paymentId);
            } else {
                throw error;
            }
        }

        const response = {
            success: true,
            payment: {
                id: payment.id,
                status: payment.status,
                amount: payment.amount ? (payment.amount / 100) : (payment.amount_total / 100),
                currency: payment.currency ? payment.currency.toUpperCase() : 'SGD',
                reference_number: payment.metadata?.reference_number,
                client_secret: payment.client_secret || null,
                created: payment.created,
            }
        };

        // Add checkout session specific fields if applicable
        if (payment.object === 'checkout.session') {
            response.payment.url = payment.url;
            response.payment.expires_at = payment.expires_at;
            response.payment.payment_intent = payment.payment_intent;
        }

        return res.json(response);

    } catch (error) {
        console.error("Get payment status error:", error);
        
        if (error.code === 'resource_missing') {
            return res.status(404).json({
                success: false,
                error: "Payment not found"
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to retrieve payment status"
        });
    }
};

// Helper function to refund a payment
export const refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { amount, reason = 'requested_by_customer' } = req.body;

        const refund = await stripe.refunds.create({
            payment_intent: paymentId,
            amount: amount ? Math.round(Number(amount) * 100) : undefined, // Partial refund if amount specified
            reason: reason
        });

        return res.json({
            success: true,
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                currency: refund.currency.toUpperCase(),
                status: refund.status,
                reason: refund.reason
            }
        });

    } catch (error) {
        console.error("Refund error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to process refund"
        });
    }
};