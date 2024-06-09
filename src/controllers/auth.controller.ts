import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, getUserByEmail } from './user.controller';
import { User } from '../utils/interface';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || '';

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
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
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
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
};
