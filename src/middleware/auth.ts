import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtPayload, AuthenticatedRequest } from '../utils/interface';

dotenv.config();

const jwtSecret = process.env.jwt_secret || '';
const tokenBlacklist = new Set<string>();

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
        req.token = token;
        next();
    });
};

const invalidateToken = (token: string) => {
    tokenBlacklist.add(token);
};

export { authenticateToken, invalidateToken };
