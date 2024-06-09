import {Router} from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import inventoryRoutes from './inventory.routes';
import {authenticateToken} from "../middleware/auth";

const router: Router = Router();

router.use('/auth', authRoutes);

router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Protected route' });
})

router.use('/users', userRoutes);
router.use('/inventory', inventoryRoutes);

export const routes = router;
