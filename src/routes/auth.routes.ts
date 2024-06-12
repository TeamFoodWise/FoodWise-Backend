import { Router } from 'express';
import {register, login, logout} from '../controllers/auth.controller';
import validateSchema from '../middleware/validateSchema';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import {authenticateToken} from "../middleware/auth";

const router = Router();

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', authenticateToken, logout)

export default router;
