import {Router} from 'express';
import {createInventory, deleteInventory, getInventoryById, getInventories, updateInventory} from '../controllers/inventory.controller';

const router: Router = Router();

router.post('/', createInventory);
router.get('/', getInventories);
router.get('/:id', getInventoryById);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

export default router;