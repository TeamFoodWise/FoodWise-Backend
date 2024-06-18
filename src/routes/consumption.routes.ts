import {Router} from 'express';
import {getAllUsersConsumedItems,createConsumption} from '../controllers/consumption.controller';
import {authenticateToken} from "../middleware/auth";

const router: Router = Router();

router.get('/', authenticateToken, getAllUsersConsumedItems);
router.post('/', authenticateToken, createConsumption);

export default router;
