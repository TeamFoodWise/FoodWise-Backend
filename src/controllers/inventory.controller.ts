import {Request, Response} from 'express';
import InventoryModel from '../models/inventory.model';
import {AuthenticatedRequest, Inventory} from "../utils/interface";

export const createInventory = async (req: Request, res: Response): Promise<void> => {
    const {name, user_id} = req.body;

    if (!name || !user_id) {
        res.status(400).json({error: 'Name and user_id are required'});
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

export const getInventories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

export const getInventoriesByUserId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(400).json({error: 'User ID is required'});
            return;
        }

        const inventories = await InventoryModel.findByUserId(req.userId);
        res.status(200).json(inventories);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}