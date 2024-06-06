import {Request, Response} from 'express';
import UserModel from '../models/userModel';

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.create(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await UserModel.findAll();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById(parseInt(req.params.id));
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({error: 'User not found'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.update(parseInt(req.params.id), req.body);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({error: 'User not found'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        await UserModel.delete(parseInt(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};
