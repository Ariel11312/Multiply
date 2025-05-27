// controllers/itemController.js
import { Item } from "../models/item.js";
import multer from "multer";
import path from "path";
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get proper directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer to handle file uploads with absolute path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Use absolute path to uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)); // More unique file name
    },
});

// Add file filter to only allow certain image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and AVIF are allowed.'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});

// Create a new item with multiple images
export const CreateItem = async (req, res) => {
    // Use multer to handle multiple uploaded images (up to 5)
    const uploadMultipleImages = upload.array("images", 5); // "images" is the field name in the form, max 5 files

    uploadMultipleImages(req, res, async (err) => {
        if (err) {
            console.log("Error during image upload:", err);
            return res.status(400).json({ message: "Error uploading images: " + err.message });
        }

        const { name, price, description, category, inStock, memberId } = req.body;

        // Ensure at least one image is uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        // Create array of image URLs
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

        // Check if all required fields are present
        if (!name || !price || !description || !category || inStock === undefined || !memberId) {
            console.log("All fields are required");
            
            // Clean up uploaded files if validation fails
            imagePaths.forEach(imagePath => {
                const fullPath = path.join(__dirname, '..', imagePath.substring(1));
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
            
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            // Prepare the item object with multiple images
            const item = new Item({
                name,
                price,
                description,
                category,
                inStock,
                memberId,
                images: imagePaths,
                imageUrl: imagePaths[0] // Set the first image as the main imageUrl for backward compatibility
            });

            // Save the item to the database
            const newItem = await item.save();
            res.status(201).json(newItem);

        } catch (err) {
            console.log("Error saving item:", err);
            
            // Clean up uploaded files if database operation fails
            imagePaths.forEach(imagePath => {
                const fullPath = path.join(__dirname, '..', imagePath.substring(1));
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
            
            res.status(400).json({ message: err.message });
        }
    });
};

// Update an item by ID with multiple images
export const updateItems = async (req, res) => {
    // Use multer to handle multiple uploaded images
    const uploadMultipleImages = upload.array("images", 5);

    uploadMultipleImages(req, res, async (err) => {
        if (err) {
            console.log("Error during image upload:", err);
            return res.status(400).json({ message: "Error uploading images: " + err.message });
        }

        try {
            // Find the item by ID
            const item = await Item.findById(req.params.id);
            if (!item) {
                // Clean up any uploaded files since we won't be using them
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => {
                        const fullPath = path.join(__dirname, '..', 'uploads', file.filename);
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                        }
                    });
                }
                return res.status(404).json({ message: 'Item not found' });
            }

            // Update fields
            if (req.body.name != null) {
                item.name = req.body.name;
            }
            if (req.body.description != null) {
                item.description = req.body.description;
            }
            if (req.body.price != null) {
                item.price = req.body.price;
            }
            if (req.body.category != null) {
                item.category = req.body.category;
            }
            if (req.body.inStock != null) {
                item.inStock = req.body.inStock;
            }

            // If new images are uploaded, handle them
            if (req.files && req.files.length > 0) {
                // Get new image paths
                const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
                
                // Delete old image files if they exist
                if (item.images && item.images.length > 0) {
                    item.images.forEach(imagePath => {
                        const fullPath = path.join(__dirname, '..', imagePath.substring(1));
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                        }
                    });
                } else if (item.imageUrl) {
                    // Handle legacy single imageUrl
                    const imagePath = path.join(__dirname, '..', item.imageUrl.substring(1));
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
                
                // Update both images array and main imageUrl
                item.images = newImagePaths;
                item.imageUrl = newImagePaths[0]; // Set the first image as the main imageUrl
            }

            // Save the updated item
            const updatedItem = await item.save();
            res.json(updatedItem);
        } catch (err) {
            // Clean up any uploaded files since we won't be using them due to error
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    const fullPath = path.join(__dirname, '..', 'uploads', file.filename);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                });
            }
            res.status(400).json({ message: err.message });
        }
    });
};



export const deleteItem = async (req, res) => {
    try {
        // Validate ID parameter
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid item ID format' });
        }

        const item = await Item.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Delete associated images
        try {
            if (item.images && item.images.length > 0) {
                for (const imagePath of item.images) {
                    try {
                        const fullPath = path.join(process.cwd(), 'public', imagePath);
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                            console.log(`Deleted image: ${fullPath}`);
                        }
                    } catch (fileError) {
                        console.error(`Error deleting image ${imagePath}:`, fileError);
                        // Continue with deletion even if image deletion fails
                    }
                }
            } else if (item.imageUrl) {
                // Handle legacy single image
                try {
                    const fullPath = path.join(process.cwd(), 'public', item.imageUrl);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                        console.log(`Deleted legacy image: ${fullPath}`);
                    }
                } catch (fileError) {
                    console.error(`Error deleting legacy image ${item.imageUrl}:`, fileError);
                }
            }
        } catch (fileSystemError) {
            console.error('Error during image cleanup:', fileSystemError);
            // Continue with database deletion even if file cleanup fails
        }

        // Delete from database
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found during deletion' });
        }

        res.json({ 
            success: true,
            message: 'Item deleted successfully',
            deletedItemId: deletedItem._id 
        });

    } catch (err) {
        console.error('Error in deleteItem controller:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error during item deletion',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Keep other functions the same
export const fetchItems = async (req, res) => {
    try {
        const items = await Item.find({}); // Fetch all documents

        if (!items.length) {
            return res.status(404).json({
                success: false,
                message: "No items found",
            });
        }

        res.json({
            success: true,
            data: items,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// Get a single item by ID
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};