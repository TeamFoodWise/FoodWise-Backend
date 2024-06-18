import {Router} from 'express';
import {
    createItem,
    deleteItem,
    getItemById,
    getItems, getItemsByUserId,
    updateItem,
} from '../services/Inventory/item.services';
import {authenticateToken} from "../middleware/auth";
import {getExpiringSoonItems} from "../services/Homepage/expiring.services"

const router: Router = Router();

router.post('/', authenticateToken, createItem);
router.get('/all', getItems);
router.get('/expiring-soon', authenticateToken, getExpiringSoonItems);
router.get('/', authenticateToken, getItemsByUserId)
router.get('/:id', getItemById);
router.put('/:id', authenticateToken, updateItem);
router.delete('/', authenticateToken, deleteItem)

export default router;