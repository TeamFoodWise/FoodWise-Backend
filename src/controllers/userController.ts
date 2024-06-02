import {Request, Response} from 'express';
import {User} from '../models/userModel';

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {

}

export const getUserById = async (req: Request, res: Response): Promise<void> => {

}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
}