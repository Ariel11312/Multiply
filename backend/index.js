import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

// Import your routes and database connection
import { dbConnection } from './database/connection.js';
import authRoutes from './routes/auth-route.js';
import memberRoutes from './routes/member-route.js';
import itemRoutes from './routes/item-route.js';
import userRoutes from './routes/user-route.js';
import paymongoRoutes from './routes/paymongo-route.js';
import transactionRoutes from './routes/transaction-route.js';
import goldensRoutes from './routes/golden-seats-route.js';
import cartRoutes from './routes/cart-route.js';
import placeOrder from './routes/order-route.js';
import Notification from './routes/notification-route.js';

// Get proper directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'https://wemultiplyapp.com',
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Handle Preflight Requests for CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || 'https://wemultiplyapp.com');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Serve static files from the uploads directory
// IMPORTANT: Ensure this path matches where your files are actually stored
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add MIME type for AVIF files
express.static.mime.define({'image/avif': ['avif']});

// Database connection
dbConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/user', userRoutes);
app.use('/api/paymongo', paymongoRoutes);
app.use('/api/trans', transactionRoutes);
app.use('/api/golden', goldensRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', placeOrder); // Ensure this is the correct route for placing orders
app.use('/api/notification', Notification);

// Debug endpoint to check the server configuration
app.get('/debug', (req, res) => {
    res.json({
        dirname: __dirname,
        uploadsPath: path.join(__dirname, 'uploads'),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
