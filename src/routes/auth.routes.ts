import { Router } from 'express';
import {
    register,
    login,
    logout,
    showCurrentUser,
    refreshToken,
    updateProfile2
} from '../services/auth/auth.services';
import validateSchema from '../middleware/validateSchema';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import {authenticateRefreshToken, authenticateToken} from "../middleware/auth";
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const router = Router();
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        const error: any = new Error('Unsupported file type');
        cb(error, false);
    }
};

const storage = multer.memoryStorage();

const upload = multer({ storage, fileFilter });

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', authenticateToken, logout);
router.post('/current-user', authenticateToken, showCurrentUser);
router.post('/refresh-token', authenticateRefreshToken, refreshToken);
router.post('/new-update-profile', authenticateToken, upload.single('file'), updateProfile2);

export default router;
