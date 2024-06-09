import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, getUserByEmail } from '../controllers/userController';
import {User} from '../utils/interface';
import { Request, Response } from 'express';

dotenv.config();

const router = Router();
const jwtSecret = process.env.JWT_SECRET || '';

// Rute Pendaftaran
router.post('/register',
    [
        body('name').isString().notEmpty(),
        body('email').isEmail(),
        body('password').isLength({ min: 6 })
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password } = req.body;
            const hashed_password = await bcrypt.hash(password, 10);

            const user: User = {
                name,
                email,
                hashed_password,
                preferences: {}
            };

            const createdUser = await createUser(user);
            res.status(201).json(createdUser);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/login',
    [
        body('email').isEmail(),
        body('password').isString().notEmpty()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            const user = await getUserByEmail(email);

            if (!user) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }

            const isValidPassword = await bcrypt.compare(password, user.hashed_password);

            if (!isValidPassword) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });

            res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
);

export default router;
