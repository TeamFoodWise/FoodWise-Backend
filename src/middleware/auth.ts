import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtPayload } from '../utils/interface';

dotenv.config();

const jwtSecret = process.env.jwt_secret || '';
const tokenBlacklist = new Set<string>();

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
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

        req.user = (payload as JwtPayload).userId;
        next();
    });
};

const invalidateToken = (token: string) => {
    tokenBlacklist.add(token);
};

export { authenticateToken, invalidateToken };