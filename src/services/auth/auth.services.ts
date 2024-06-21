import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {getUserByEmail, registerUser} from '../../controllers/user.controller';
import {AuthenticatedRequest, User} from '../../utils/interface';
import {generateAccessToken, generateRefreshToken, invalidateToken, refreshTokens} from "../../middleware/auth";
import UserModel from "../../models/user.model";
import InventoryModel from "../../models/inventory.model";
import supabase from "../../config/supabase";
import {decode} from "base64-arraybuffer";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || '';

export const updateProfile2 = async (req: AuthenticatedRequest, res: Response) => {
    let {full_name, new_password, confirmation_new_password} = req.body;

    try {
        const userId = (req as any).userId;
        if (!userId) {
            return res.status(400).json({error: 'User not found'});
        }

        const currentUser = await UserModel.findById(userId);
        if (!currentUser) {
            return res.status(400).json({error: 'User not found'});
        }

        if (full_name) {
            currentUser.full_name = full_name;
        }

        let profile_url = currentUser.profile_url;

        if (req.file) {
            const file = req.file;
            const fileBase64 = decode(file.buffer.toString('base64'));

            const {data, error} = await supabase
                .storage
                .from('profile-pictures')
                .upload(`public/${file.originalname}`, fileBase64, {
                    contentType: "image/png",
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                throw new Error(`Error uploading file: ${error.message}`);
            }

            const {data : {publicUrl}} = supabase.storage.from('profile-pictures').getPublicUrl(`public/${file.originalname}`);
            profile_url = publicUrl;
        }

        if (new_password || confirmation_new_password) {
            if (new_password !== confirmation_new_password) {
                return res.status(400).json({error: 'Passwords do not match'});
            }

            if (!confirmation_new_password) {
                return res.status(400).json({error: 'Please confirm your new password'});
            }

            currentUser.hashed_password = await bcrypt.hash(new_password, 10);
        }

        currentUser.profile_url = profile_url;

        const updated = await UserModel.update(userId, currentUser);
        if (updated) {
            res.status(200).json({
                message: 'Profile updated',
                user: {
                    full_name: updated.full_name,
                    email: updated.email,
                    profile_url: updated.profile_url
                }
            });
        } else {
            res.status(404).json({error: 'User not found'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};


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

        const createdUser = await registerUser(user);
        console.log(createdUser);
        const accessToken = generateAccessToken(createdUser);
        const refreshToken = generateRefreshToken(createdUser);
        refreshTokens.add(refreshToken);

        const defaultInventory = {
            name: 'Default',
            user_id: createdUser?.id
        };

        await InventoryModel.create(defaultInventory);

        res.status(201).json({
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: createdUser?.id,
                full_name: createdUser?.full_name,
                email: createdUser?.email,
                profile_url: createdUser?.profile_url
            }
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

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.add(refreshToken);

        res.status(200).json({
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                profile_url: user.profile_url
            }
        });
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
    const {refresh_token} = req.body;
    if (!refresh_token) {
        return res.status(401).json({error: 'No refresh token provided'});
    }

    try {
        invalidateToken(refresh_token);
        res.status(200).json({message: 'Logout successful'});
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const showCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(400).json({error: 'User not found'});
        }

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({error: 'User not found'});
        }

        res.status(200).json({
            user: {
                full_name: user.full_name,
                email: user.email,
                profile_url: user.profile_url
            }
        });
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const refreshToken = async (req: AuthenticatedRequest, res: Response) => {
    const {refresh_token} = req.body;

    if (!refresh_token || !refreshTokens.has(refresh_token)) {
        return res.status(403).json({error: 'Invalid or missing refresh token'});
    }

    try {
        jwt.verify(refresh_token, jwtSecret, async (err: any, payload: any) => {
            if (err) {
                return res.status(403).json({error: 'Invalid refresh token'});
            }

            if (!req.userId) {
                return res.status(403).json({error: 'User not found'});
            }

            const user = await UserModel.findById(req.userId);

            if (!user) {
                return res.status(403).json({error: 'User not found'});
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            res.status(200).json({access_token: accessToken, refresh_token: refreshToken});
        });
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};