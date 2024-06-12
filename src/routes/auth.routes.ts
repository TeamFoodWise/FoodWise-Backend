import { Router } from 'express';
import {register, login, logout, showCurrentUser, updateProfile, refreshToken} from '../services/auth.services';
import validateSchema from '../middleware/validateSchema';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import {authenticateRefreshToken, authenticateToken} from "../middleware/auth";

const router = Router();

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', authenticateToken, logout);
router.post('/current_user', authenticateToken, showCurrentUser);
router.put('/update_profile', authenticateToken, updateProfile);
router.post('/refresh_token', authenticateRefreshToken, refreshToken);

export default router;
