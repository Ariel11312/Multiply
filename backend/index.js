import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import fs from 'fs'
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
import { Proof } from './models/proof.js';

// Get proper directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Load environment variables
dotenv.config();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Serve static files from the uploads directory
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
app.use('/api/order', placeOrder);
app.use('/api/notification', Notification);

// File upload endpoint
app.post("/api/upload", upload.single('paymentProof'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get data from request body
    const { memberId, date } = req.body;
    
    console.log('Member ID:', memberId);
    console.log('Date:', date);
    console.log('Uploaded file:', req.file);

    // Validate required fields
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Create file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Create new proof document
    const newUpload = new Proof({
      id: memberId, // Use memberId from request body
      image: fileUrl, // Use the file URL, not req.paymentProof
      date: date || new Date() // Use provided date or current date
    });

    // Save to database
    await newUpload.save();

    // Send success response
    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: fileUrl,
      size: req.file.size,
      proofId: newUpload._id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to save proof',
      details: error.message 
    });
  }
});
// Debug endpoint to check the server configuration
app.get('/debug', (req, res) => {
    res.json({
        dirname: __dirname,
        uploadsPath: path.join(__dirname, 'uploads'),
        environment: process.env.NODE_ENV || 'development',
        uploadConfig: {
            dest: path.join(__dirname, 'uploads'),
            exists: require('fs').existsSync(path.join(__dirname, 'uploads'))
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        });
    }
    
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    });
});

// Start server
// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, 'uploads');
    try {
        await fs.promises.access(uploadDir);
    } catch (err) {
        await fs.promises.mkdir(uploadDir, { recursive: true });
        console.log(`Created uploads directory at ${uploadDir}`);
    }
    
    console.log(`Server running on port ${PORT}`);
    console.log(`Upload directory: ${uploadDir}`);
});
export default app;