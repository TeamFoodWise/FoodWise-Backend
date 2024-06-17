import {Router} from 'express';
import {
    createInventory,
    deleteInventory,
    getInventoryById,
    getInventories,
    updateInventory,
    getInventoriesByUserId
} from '../controllers/inventory.controller';
import {authenticateToken} from "../middleware/auth";

const router: Router = Router();

router.post('/', createInventory);
router.get('/', getInventories);
router.get('/:id', getInventoryById);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

export default router;