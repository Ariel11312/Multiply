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
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
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
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create a new item
export const CreateItem = async (req, res) => {
    // Use multer to handle the uploaded image
    const uploadSingleImage = upload.single("image"); // "image" is the field name in the form

    uploadSingleImage(req, res, async (err) => {
        if (err) {
            console.log("Error during image upload:", err);
            return res.status(400).json({ message: "Error uploading image: " + err.message });
        }

        const { name, price, description, category, inStock, memberId } = req.body;

        // Ensure the image is uploaded and file exists
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Check if all required fields are present
        if (!name || !price || !description || !category || !inStock || !memberId || !imageUrl) {
            console.log("All fields are required");
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            // Prepare the item object, including the image URL
            const item = new Item({
                name,
                price,
                description,
                category,
                inStock,
                memberId,
                imageUrl,
            });

            // Save the item to the database
            const newItem = await item.save();
            res.status(201).json(newItem);

        } catch (err) {
            console.log("Error saving item:", err);
            res.status(400).json({ message: err.message });
        }
    });
};

// Get all items
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

// Update an item by ID
export const updateItems = async (req, res) => {
    try {
        // Find the item by ID
        const item = await Item.findById(req.params.id);
        if (!item) {
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

        // If an image is uploaded, handle that too
        if (req.file) {
            item.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Save the updated item
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete an item by ID
export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Delete the associated image file if it exists
        if (item.imageUrl) {
            const imagePath = path.join(__dirname, '..', item.imageUrl.substring(1));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
