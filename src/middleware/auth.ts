import {NextFunction, Response} from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {AuthenticatedRequest, JwtPayload, User} from '../utils/interface';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || '';
const tokenBlacklist = new Set<string>();
const refreshTokens = new Set<string>();

const generateAccessToken = (user: User | null) => {
    return jwt.sign({ userId: user?.id }, jwtSecret, { expiresIn: '14d' });
};

const generateRefreshToken = (user: User | null) => {
    const refreshToken = jwt.sign({ userId: user?.id }, jwtSecret, { expiresIn: '14d' });
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
        if (err || !payload) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }

        const jwtPayload = payload as JwtPayload;

        req.userId = parseInt(jwtPayload.userId, 10);
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
        if (err || !payload) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }

        const jwtPayload = payload as JwtPayload;
        const userId = parseInt(jwtPayload.userId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        req.userId = userId;
        next();
    });
};

const invalidateToken = (token: string) => {
    tokenBlacklist.add(token);
    refreshTokens.delete(token);
};

export { authenticateToken, invalidateToken, authenticateRefreshToken, generateRefreshToken, generateAccessToken, refreshTokens };
