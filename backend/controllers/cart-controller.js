import { Item } from "../models/item.js";
import { Cart } from "../models/cart.js";
import jwt from "jsonwebtoken";

export const addCart = async (req, res) => {
   
       const token = req.cookies.token;
       if (!token) {
           return response.status(401).json({
               success: false,
               message: 'Authentication token is missing.',
           });
       }
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
    try {
const { userId } = decoded;
      const { itemId, quantity = 1 } = req.body;
      
      // Validate inputs
      if (!itemId) {
        return res.status(400).json({ message: 'Item ID is required' });
      }
      
      if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0' });
      }
      
      // Find the item
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      // Check if item is in stock
      if (!item.inStock) {
        return res.status(400).json({ message: 'Item is out of stock' });
      }
      
      // Find user's cart or create new one
      let cart = await Cart.findOne({ userId });
      
      if (!cart) {
        // Create new cart if one doesn't exist
        cart = new Cart({
          userId,
          items: [],
          totalAmount: 0
        });
      }
      
      // Check if item is already in cart
      const existingItemIndex = cart.items.findIndex(
        i => i.itemId.toString() === itemId.toString()
      );
      
      if (existingItemIndex > -1) {
        // Update quantity if item already exists in cart
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          itemId: item._id,
          name: item.name,
          quantity,
          price: item.price,
          imageUrl: item.imageUrl
        });
      }
      
      // Save cart
      await cart.save();
      
      // Return updated cart with populated items
      const populatedCart = await Cart.findById(cart._id);
      
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
    const token = req.cookies.token;
    if (!token) {
        return response.status(401).json({
            success: false,
            message: 'Authentication token is missing.',
        });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    try {
        const { userId } = decoded;
      
      // Ensure the requesting user matches the cart user
      
      // Find user's cart
      const cart = await Cart.findOne({ userId });
      
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
  const updateCart = async (req, res) => {
    try {
      const { userId, itemId, quantity } = req.body;
      
      if (!itemId) {
        return res.status(400).json({ message: 'Item ID is required' });
      }
      
      // Find user's cart
      const cart = await Cart.findOne({ userId });
      
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      // Find item in cart
      const itemIndex = cart.items.findIndex(
        i => i.itemId.toString() === itemId.toString()
      );
      
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
      
      // Remove item if quantity is 0 or less
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }
      
      // Save cart
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
  const deleteCart = async (req, res) => {
    try {
      const { userId } = req.params;
      const { itemId } = req.query;
      
      // Ensure the requesting user matches the cart user
      if (req.body.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized access to cart' });
      }
      
      // Find user's cart
      const cart = await Cart.findOne({ userId });
      
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      if (itemId) {
        // Remove specific item from cart
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
        // Clear entire cart
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
