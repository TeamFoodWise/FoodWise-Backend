import {Router} from 'express';
import {createUser, deleteUser, getUserById, getUsers, updateUser} from '../controllers/user.controller';
import {showUserStatistics} from "../services/Homepage/statistics.services";

const router: Router = Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/statistics', showUserStatistics);

export default router;
