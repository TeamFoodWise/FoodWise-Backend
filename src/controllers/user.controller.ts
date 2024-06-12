import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import { User } from '../utils/interface';

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const user: User = req.body;

    try {
        const createdUser = await UserModel.create(user);
        res.status(201).json(createdUser);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await UserModel.findAll();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        return await UserModel.findByEmail(email);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById(parseInt(req.params.id));
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.update(parseInt(req.params.id), req.body);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        await UserModel.delete(parseInt(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const registerUser = async(user: User): Promise<User | null> => {
    try {
        return await UserModel.create(user);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const editProfile = async (user: User): Promise<User | null> => {
    if (user.id === undefined) {
        throw new Error('User ID is required');
    }

    try {
        return await UserModel.update(user.id, user);
    } catch (error: any) {
        throw new Error(error.message);
    }
}


