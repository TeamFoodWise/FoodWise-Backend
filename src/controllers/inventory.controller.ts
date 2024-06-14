import {Request, Response} from 'express';
import InventoryModel from '../models/inventory.model';
import {Inventory} from "../utils/interface";

export const createInventory = async (req: Request, res: Response): Promise<void> => {
    const {name, user_id} = req.body;

    if (!name || !user_id) {
        res.status(400).json({error: 'Name and user_id are required'});
        return;
    }

    if (typeof name !== 'string' || typeof user_id !== 'number') {
        res.status(400).json({error: 'Invalid data type'});
        return;
    }

    if (name.length < 3) {
        res.status(400).json({error: 'Name should be at least 3 characters long'});
        return;
    }

    try {
        const inventories = await InventoryModel.findAll();
        const inventoryExists = inventories.find(inventory => inventory.name === name);

        if (inventoryExists) {
            res.status(400).json({error: 'Inventory already exists'});
            return;
        }

        const inventory: Inventory = await InventoryModel.create(req.body);

        if (!inventory) {
            res.status(400).json({error: 'Inventory not created'});
            return;
        }

        res.status(201).json({
            id: inventory.id,
            name: name,
            user_id: user_id
        });
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