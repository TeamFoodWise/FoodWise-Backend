import {Request, Response} from 'express';
import ItemModel from '../models/item.model';
import {Item} from '../utils/interface';

export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const item: Item = req.body;
        const createdItem = await ItemModel.create(item);
        res.status(201).json(createdItem);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await ItemModel.findAll();
        res.status(200).json(items);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const getItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        const item = await ItemModel.findById(parseInt(req.params.id));
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({error: 'Item not found'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const item = await ItemModel.update(parseInt(req.params.id), req.body);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({error: 'Item not found'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    try {
        await ItemModel.delete(parseInt(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};
