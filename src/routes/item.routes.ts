import {Router} from 'express';
import {createItem, deleteItem, getItemById, getItems, updateItem} from '../controllers/item.controller';

const router: Router = Router();

router.post('/', createItem);
router.get('/', getItems);
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
