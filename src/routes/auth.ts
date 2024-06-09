import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {body, validationResult} from 'express-validator';
import supabase from '../config/supabase'
import {Request, Response} from 'express';

const router = Router();

router.post('/register',
    [
        body('name').isString().notEmpty(),
        body('email').isEmail(),
        body('password').isLength({min: 6})
    ],
    async (req: Request, res: Response) => {
        const errors: any = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {name, email, password} = req.body;
        const hashed_password = await bcrypt.hash(password, 10);

        const {data, error} = await supabase
            .from('users')
            .insert([{name, email, hashed_password}]);

        if (error) {
            return res.status(400).json({error: error.message});
        }

        res.status(201).json(data);
    }
);

router.post('/login',
    [
        body('email').isEmail(),
        body('password').isString().notEmpty()
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;

        const {data: users, error} = await supabase
            .from('users')
            .select('id, name, email, hashed_password')
            .eq('email', email);

        if (error) {
            return res.status(400).json({error: error.message});
        }

        if (users.length === 0) {
            return res.status(400).json({error: 'Invalid email or password'});
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.hashed_password);

        if (!isValidPassword) {
            return res.status(400).json({error: 'Invalid email or password'});
        }

        res.status(200).json({message: 'Login successful', user: {id: user.id, name: user.name, email: user.email}});
    }
);

export default router;
