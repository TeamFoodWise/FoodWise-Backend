import {Router} from 'express';
import userRoutes from './user';
import authRoutes from './auth';
import inventoryRoutes from './inventory';

const router: Router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);

export const routes = router;
