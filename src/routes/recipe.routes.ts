import {Router} from 'express';
import {authenticateToken} from "../middleware/auth";
import {getRecommendation} from "../services/Recipes/recommendation.services";
import {getRecommendationDetail} from "../services/Recipes/detail.services";

const router: Router = Router();

router.get('/recommendation', authenticateToken, getRecommendation);
router.get('/recommendation/:id', authenticateToken, getRecommendationDetail);

export default router;
