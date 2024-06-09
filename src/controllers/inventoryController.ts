import {Request, Response} from 'express';
import InventoryModel from '../models/inventoryModel';

export const createInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventory = await InventoryModel.create(req.body);
        res.status(201).json(inventory);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const getInventories = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventories = await InventoryModel.findAll();
        res.status(200).json(inventories);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const getInventoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventory = await InventoryModel.findById(parseInt(req.params.id));
        if (inventory) {
            res.status(200).json(inventory);
        } else {
            res.status(404).json({error: 'Inventory not found'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const updateInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventory = await InventoryModel.update(parseInt(req.params.id), req.body);
        if (inventory) {
            res.status(200).json(inventory);
        } else {
            res.status(404).json({error: 'Inventory not found'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const deleteInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        await InventoryModel.delete(parseInt(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};