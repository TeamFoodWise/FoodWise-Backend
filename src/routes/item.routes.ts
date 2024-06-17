import {Router} from 'express';
import {createItem, deleteItem, getItemById, getItems, updateItem, createManyItems} from '../controllers/item.controller';
import {authenticateToken} from "../middleware/auth";
import {getExpiringSoonItems} from "../services/Homepage/expiring.services";
import parseDate from "../utils/utilities";

const router: Router = Router();

router.post('/', createItem);
router.get('/', authenticateToken, getItems);
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/multiple', createManyItems);
router.get('/expiring-soon', authenticateToken, getExpiringSoonItems);

export default router;