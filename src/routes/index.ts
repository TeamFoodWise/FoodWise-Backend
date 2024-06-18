import {Router} from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import inventoryRoutes from './inventory.routes';
import itemRoutes from './item.routes';
import consumptionRoutes from './consumption.routes'
import recipeRoutes from "./recipe.routes";

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/inventories', inventoryRoutes);
router.use('/items', itemRoutes);
router.use('/consumptions', consumptionRoutes);
router.use('/recipes', recipeRoutes)

export const routes = router;
