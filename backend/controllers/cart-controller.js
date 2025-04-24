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
        const { itemId, quantity = 1,imageUrl } = req.body;

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
                imageUrl,
                price: item.price,
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

        return res.status(200).json(cart);
        
    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({ 
            message: 'Failed to retrieve cart',
            error: error.message 
        });
    }
};

export const decreaseQuantity = async (req, res) => {
    try {
      const { cartId, itemId } = req.params;
  console.log("Received cartId:", cartId, "and itemId:", itemId);
      if (!cartId || !itemId) {
        return res.status(400).json({
          success: false,
          message: "Cart ID and Item ID are required"
        });
      }
  
      // 1. Find the cart
      const cart = await Cart.findById(cartId);
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found"
        });
      }
      console.log("Cart found:", cart);
  
      // 2. Find the specific item in the cart
      const itemIndex = cart.items.findIndex(
        (item) => item.itemId._id.toString() === itemId
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart"
        });
      }
  
      // 3. Decrease or remove the item
      if (cart.items[itemIndex].quantity === 1) {
        cart.items.splice(itemIndex, 1); // Remove item from array
      } else {
        cart.items[itemIndex].quantity -= 1; // Decrease quantity
      }
  
      // 4. Recalculate total amount
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
  
      // 5. Save the cart
      const updatedCart = await cart.save();
  
      return res.status(200).json({
        success: true,
        message: "Quantity updated",
        data: updatedCart
      });
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  };
  export const QuantityIncrease = async (req, res) => {
    try {
      const { cartId, itemId } = req.params;
      console.log("Received cartId:", cartId, "and itemId:", itemId);
  
      if (!cartId || !itemId) {
        return res.status(400).json({
          success: false,
          message: "Cart ID and Item ID are required"
        });
      }
  
      // 1. Find the cart by ID
      const cart = await Cart.findById(cartId);
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found"
        });
      }
  
      // 2. Find the item inside the cart
      const itemIndex = cart.items.findIndex(
        (item) => item.itemId._id.toString() === itemId
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart"
        });
      }
  
      // ✅ 3. Increase the quantity
      cart.items[itemIndex].quantity += 1;
  
      // 4. Recalculate total amount
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
  
      // 5. Save and return the updated cart
      const updatedCart = await cart.save();
  
      return res.status(200).json({
        success: true,
        message: "Quantity increased successfully",
        data: updatedCart
      });
  
    } catch (error) {
      console.error("Error increasing quantity:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  };
  
  // Updated version of your existing updateQuantity function

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
        // Remove item from cart
        // First, find the item in the cart items array
        const itemIndex = cart.items.findIndex(item => {
          // Handle both direct _id and nested itemId._id scenarios
          const itemObjectId = item.itemId && item.itemId._id 
            ? item.itemId._id.toString() 
            : item.itemId.toString();
            
          return itemObjectId === itemId.toString();
        });
        
        if (itemIndex === -1) {
          return res.status(404).json({ 
            message: 'Item not found in cart',
            providedId: itemId,
            availableItems: cart.items.map(item => ({
              id: item.itemId && item.itemId._id ? item.itemId._id.toString() : item.itemId.toString(),
              name: item.name
            }))
          });
        }
        
        // Calculate amount to subtract from total
        const itemToRemove = cart.items[itemIndex];
        const itemSubtotal = itemToRemove.price * itemToRemove.quantity;
        
        // Remove the item from the array
        cart.items.splice(itemIndex, 1);
        
        // Update total amount
        cart.totalAmount = Math.max(0, cart.totalAmount - itemSubtotal);
        
        await cart.save();
        
        return res.status(200).json({
          message: 'Item removed from cart successfully',
          cart
        });
      } else {
        // Clear entire cart
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        
        return res.status(200).json({
          message: 'Cart cleared successfully',
          cart
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