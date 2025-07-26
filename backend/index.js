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

// Load environment variables FIRST
dotenv.config();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common image formats
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// CORS configuration - MUST be before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Define allowed origins
    const allowedOrigins = [
      'https://wemultiplyapp.com',
      'https://www.wemultiplyapp.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Add CLIENT_URL from environment if it exists
    if (process.env.CLIENT_URL) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS Error - Origin not allowed:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Basic middleware
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Set proper MIME types for images
    if (path.endsWith('.avif')) {
      res.setHeader('Content-Type', 'image/avif');
    }
  }
}));

// Add MIME type for AVIF files
if (express.static.mime) {
  express.static.mime.define({ 'image/avif': ['avif'] });
}

// Database connection
dbConnection();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'WeMultiply API Server'
  });
});

// CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.get('origin'),
    host: req.get('host'),
    timestamp: new Date().toISOString(),
    headers: {
      'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
      'access-control-allow-credentials': res.getHeader('access-control-allow-credentials')
    }
  });
});

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

// File upload endpoint with enhanced error handling
app.post("/api/upload", upload.single('paymentProof'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Origin:', req.get('origin'));
    console.log('Content-Type:', req.get('content-type'));
    
    // Check if file was uploaded
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ 
        error: 'No file uploaded',
        received: {
          body: req.body,
          files: req.files,
          file: req.file
        }
      });
    }

    // Get data from request body
    const { memberId, date } = req.body;

    console.log('Upload data:', {
      memberId,
      date,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Validate required fields
    if (!memberId) {
      // Clean up uploaded file if validation fails
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Create file URL - handle both development and production
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    console.log('Generated file URL:', fileUrl);

    // Create new proof document
    const newUpload = new Proof({
      id: memberId,
      image: fileUrl,
      date: date ? new Date(date) : new Date()
    });

    // Save to database
    const savedProof = await newUpload.save();
    console.log('Proof saved to database:', savedProof._id);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
        proofId: savedProof._id,
        memberId: memberId,
        uploadDate: savedProof.date
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file due to error');
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to save proof',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    server: {
      dirname: __dirname,
      uploadsPath: path.join(__dirname, 'uploads'),
      uploadsExists: fs.existsSync(path.join(__dirname, 'uploads')),
      environment: process.env.NODE_ENV || 'development',
      clientUrl: process.env.CLIENT_URL,
      port: process.env.PORT || 3001
    },
    request: {
      origin: req.get('origin'),
      host: req.get('host'),
      protocol: req.protocol,
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.get('user-agent'),
        'content-type': req.get('content-type'),
        'authorization': req.get('authorization') ? 'Present' : 'Not present'
      }
    },
    cors: {
      allowedOrigins: [
        'https://wemultiplyapp.com',
        'https://www.wemultiplyapp.com',
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.CLIENT_URL
      ].filter(Boolean)
    }
  });
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    method: req.method,
    url: req.originalUrl,
    message: 'The requested endpoint does not exist'
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);

  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: err.message,
      origin: req.get('origin')
    });
  }

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 10MB';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = err.message;
    }

    return res.status(statusCode).json({
      error: 'Upload Error',
      message: message,
      code: err.code
    });
  }

  // Handle file type validation errors
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message
    });
  }

  // Generic error handler
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, 'uploads');
  try {
    await fs.promises.access(uploadDir);
    console.log(`✓ Uploads directory exists: ${uploadDir}`);
  } catch (err) {
    await fs.promises.mkdir(uploadDir, { recursive: true });
    console.log(`✓ Created uploads directory: ${uploadDir}`);
  }

  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'https://wemultiplyapp.com'}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 CORS test: http://localhost:${PORT}/api/test-cors`);
});

export default app;