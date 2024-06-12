import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {editProfile, getUserByEmail, registerUser} from '../controllers/user.controller';
import {AuthenticatedRequest, User} from '../utils/interface';
import {invalidateToken} from "../middleware/auth";
import UserModel from "../models/user.model";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || '';

export const register = async (req: Request, res: Response) => {
    const {full_name, email, password, confirm_password} = req.body;

    if (password !== confirm_password) {
        return res.status(400).json({error: 'Passwords do not match'});
    }

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({error: 'User with this email already exists'});
        }

        const hashed_password = await bcrypt.hash(password, 10);

        const user: User = {
            full_name,
            email,
            hashed_password,
            preferences: []
        };

        const token = jwt.sign({userId: user.id}, jwtSecret, {expiresIn: '1h'});

        const createdUser = await registerUser(user);
        res.status(200).json({
            "access_token": token,
            user: createdUser
        });
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    try {
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(400).json({error: 'Invalid email or password'});
        }

        const isValidPassword = await bcrypt.compare(password, user.hashed_password);

        if (!isValidPassword) {
            return res.status(400).json({error: 'Invalid email or password'});
        }

        const token = jwt.sign({userId: user.id}, jwtSecret, {expiresIn: '1h'});

        res.status(200).json({
            "access_token": token,
            user: user
        });
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
    const token = req.token;

    if (!token) {
        return res.status(401).json({error: 'No token provided'});
    }
    try {
        invalidateToken(token);
        res.status(200).json({message: 'Logout successful'});
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const showCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(400).json({ error: 'User not found' });
        }

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    const { full_name, new_password, confirmation_new_password } = req.body;

    if (new_password !== confirmation_new_password) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        if (!req.userId) {
            return res.status(400).json({ error: 'User not found' });
        }

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const hashed_password = await bcrypt.hash(new_password, 10);

        const updatedUser = {
            ...user,
            full_name,
            hashed_password,
        };

        const updated = await editProfile(updatedUser);
        if (updated) {
            res.status(200).json(updated);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
