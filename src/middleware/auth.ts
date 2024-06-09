// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtPayload } from '../utils/interface';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || '';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, payload) => {
        if (err) return res.sendStatus(403);

        req.user = (payload as JwtPayload).userId;
        next();
    });
};

export { authenticateToken };
