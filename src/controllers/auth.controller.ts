import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { registerUser, getUserByEmail } from './user.controller';
import { User } from '../utils/interface';
import {invalidateToken} from "../middleware/auth";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || '';

export const register = async (req: Request, res: Response) => {
    const { full_name, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashed_password = await bcrypt.hash(password, 10);

        const user: User = {
            full_name,
            email,
            hashed_password,
            preferences: []
        };

        const createdUser = await registerUser(user);
        if (!res.headersSent) {
            res.status(201).json(createdUser);
        }
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

        res.status(200).json({ "access_token": token, user: { id: user.id, full_name: user.full_name, email: user.email } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'No token provided' });
    }

    try {
        invalidateToken(token);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
