import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

const validateSchema = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (e: any) {
        return res.status(400).json({ errors: e.errors });
    }
};

export default validateSchema;
