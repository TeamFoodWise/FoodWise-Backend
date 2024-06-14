import {Router} from 'express';
import {createItem, deleteItem, getItemById, getItems, updateItem, createManyItems} from '../controllers/item.controller';

const router: Router = Router();

router.post('/', createItem);
router.get('/', getItems);
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/multiple', createManyItems);

export default router;