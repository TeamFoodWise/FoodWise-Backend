import {Router} from 'express';
import userRoutes from './user';

const router: Router = Router();

router.use('/users', userRoutes);

export const routes = router;
