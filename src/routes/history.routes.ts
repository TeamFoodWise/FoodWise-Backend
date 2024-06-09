import {Router} from 'express';
import {getHistory, getHistoryById, createHistory, updateHistory, deleteHistory} from '../controllers/history.controller';

const router: Router = Router();

router.post('/', createHistory);
router.get('/', getHistory);
router.get('/:id', getHistoryById);
router.put('/:id', updateHistory);
router.delete('/:id', deleteHistory);

export default router;