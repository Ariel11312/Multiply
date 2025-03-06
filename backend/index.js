import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { dbConnection } from './database/connection.js';
import authRoutes from './routes/auth-route.js';
import memberRoutes from './routes/member-route.js';
import itemRoutes from './routes/item-route.js';
import userRoutes from './routes/user-route.js';
import paymongoRoutes from './routes/paymongo-route.js';
import transactionRoutes from './routes/transaction-route.js';
import goldensRoutes from './routes/golden-seats-route.js';
import cartRoutes from './routes/cart-route.js';
import path from 'path';

// Fix path calculation for Windows
const __dirname = path.dirname(new URL(import.meta.url).pathname).substring(1); // Remove leading slash

const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(cookieParser());
app.use(express.json());

// ✅ CORS FIX: Allow requests from CLIENT_URL
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Change this to your frontend URL
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
}));

// ✅ Handle Preflight Requests for CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || 'http://localhost:3000');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// ✅ Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// ✅ Database connection
dbConnection();

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/user', userRoutes);
app.use('/api/paymongo', paymongoRoutes);
app.use('/api/trans', transactionRoutes);
app.use('/api/golden', goldensRoutes);
app.use('/api/cart', cartRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
