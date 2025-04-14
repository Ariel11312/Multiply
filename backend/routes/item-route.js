import express from "express"
import { CreateItem, fetchItems, getItemById, updateItems } from "../controllers/items-controller.js";

const router = express.Router();

// Get all items
router.post('/create-item', CreateItem);
router.get('/get-all', fetchItems);
router.put('/update-item/:id', updateItems);
router.get('/item/:id', getItemById);

// // Get item by ID
// router.get('/:id', itemController.getItemById);

// // Create a new item
// router.post('/', itemController.createItem);

// // Update an item by ID
// router.put('/:id', itemController.updateItem);

// // Delete an item by ID
// router.delete('/:id', itemController.deleteItem);

export default router