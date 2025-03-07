import { Item } from "../models/item.js";
import { Cart } from "../models/cart.js";
import jwt from "jsonwebtoken";

export const addCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is missing.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;
        const { itemId, quantity = 1 } = req.body;

        if (!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (!item.inStock) {
            return res.status(400).json({ message: 'Item is out of stock' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [], totalAmount: 0 });
        }

        const existingItemIndex = cart.items.findIndex(
            i => i.itemId.toString() === itemId.toString()
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                itemId: item._id,
                name: item.name,
                quantity,
                price: item.price,
                imageUrl: item.imageUrl
            });
        }

        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate("items.itemId");

        return res.status(200).json({
            message: 'Item added to cart successfully',
            cart: populatedCart
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({ 
            message: 'Failed to add item to cart',
            error: error.message 
        });
    }
};

// Get user's cart
export const userCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is missing.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;

        const cart = await Cart.findOne({ userId }).populate("items.itemId");
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        return res.status(200).json(cart);
        
    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({ 
            message: 'Failed to retrieve cart',
            error: error.message 
        });
    }
};

// Update cart item quantity
export const updateCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is missing.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;
        const { itemId, quantity } = req.body;

        if (!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            i => i.itemId.toString() === itemId.toString()
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        return res.status(200).json({
            message: 'Cart updated successfully',
            cart
        });

    } catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({ 
            message: 'Failed to update cart',
            error: error.message 
        });
    }
};

// Clear cart or remove item
export const deleteCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is missing.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;
        const { itemId } = req.query;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (itemId) {
            const itemIndex = cart.items.findIndex(
                i => i.itemId.toString() === itemId.toString()
            );

            if (itemIndex === -1) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }

            cart.items.splice(itemIndex, 1);
            await cart.save();

            return res.status(200).json({
                message: 'Item removed from cart successfully',
                cart
            });
        } else {
            await Cart.findOneAndDelete({ userId });
            return res.status(200).json({
                message: 'Cart cleared successfully'
            });
        }

    } catch (error) {
        console.error('Delete cart error:', error);
        return res.status(500).json({ 
            message: 'Failed to clear cart',
            error: error.message 
        });
    }
};
