import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {JwtPayload, AuthenticatedRequest, User} from '../utils/interface';

dotenv.config();

const jwtSecret = process.env.jwt_secret || '';
const tokenBlacklist = new Set<string>();
const refreshTokens = new Set<string>();

const generateAccessToken = (user: User) => {
    return jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
};

const generateRefreshToken = (user: User) => {
    const refreshToken = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '14d' });
    refreshTokens.add(refreshToken);
    return refreshToken;
};

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    if (tokenBlacklist.has(token)) {
        return res.status(403).json({ error: 'Token has been invalidated' });
    }

    jwt.verify(token, jwtSecret, (err, payload) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.userId = parseInt((payload as JwtPayload).userId);
        req.access_token = token;
        next();
    });
};

const authenticateRefreshToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
    const { refresh_token } = req.body;

    if (!refresh_token || !refreshTokens.has(refresh_token)) {
        return res.status(403).json({ error: 'Invalid or missing refresh token' });
    }

    jwt.verify(refresh_token, jwtSecret, (err: any, payload: any) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate refresh token' });
        }
        req.userId = parseInt((payload as JwtPayload).userId);
        next();
    });
};

const invalidateToken = (token: string) => {
    tokenBlacklist.add(token);
    refreshTokens.delete(token);
};

export { authenticateToken, invalidateToken, authenticateRefreshToken, generateRefreshToken, generateAccessToken, refreshTokens };
