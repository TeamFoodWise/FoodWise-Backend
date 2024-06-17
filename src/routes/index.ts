import {Router} from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import inventoryRoutes from './inventory.routes';
import itemRoutes from './item.routes';
import {authenticateToken} from "../middleware/auth";

const router: Router = Router();

router.use('/auth', authRoutes);

router.get('/protected', authenticateToken, (req, res) => {
    res.json({message: 'Protected route'});
})

router.use('/users', userRoutes);
router.use('/inventories', inventoryRoutes);
router.use('/items', itemRoutes)


export const routes = router;
