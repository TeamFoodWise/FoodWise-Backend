import {Router} from 'express';
import {
    createInventory,
    deleteInventory,
    getInventoryById,
    getInventories,
    updateInventory,
} from '../controllers/inventory.controller';
import {authenticateToken} from "../middleware/auth";
import {showInventorySummary} from "../services/Inventory/summary.services";

const router: Router = Router();

router.post('/', createInventory);
router.get('/', getInventories);
router.get('/:id', getInventoryById);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);
router.get('/summary', authenticateToken, showInventorySummary)

export default router;