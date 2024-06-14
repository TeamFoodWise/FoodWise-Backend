import {Request, Response} from 'express';
import ItemModel from '../models/item.model';
import {Item} from '../utils/interface';

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day} - ${month} - ${year}`;
}

export const createManyItems = async (req: Request, res: Response): Promise<void> => {
    const items: Item[] = req.body;

    if (!items) {
        res.status(400).json({error: 'Items are required'});
        return;
    }

    if (!Array.isArray(items)) {
        res.status(400).json({error: 'Items should be an array'});
        return;
    }

    try {
        const createdItems: Item[] = [];

        for (let i = 0; i < items.length; i++) {
            const {name, quantity, category, purchase_date, expiration_date, inventory_id} = items[i];

            const purchaseDate = formatDate(purchase_date);
            const expirationDate = formatDate(expiration_date);

            const productName = name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            const item: Item = {
                name: productName,
                quantity: quantity,
                category: category,
                purchase_date: purchaseDate,
                expiration_date: expirationDate,
                inventory_id: inventory_id
            };

            const createdItem = await ItemModel.create(item);
            if (!createdItem) {
                res.status(400).json({error: 'Item not created'});
                return;
            }
            createdItems.push({
                id: createdItem.id,
                name: productName,
                quantity: quantity,
                category: category,
                purchase_date: purchaseDate,
                expiration_date: expirationDate,
                inventory_id: inventory_id,
            });
        }

        res.status(201).json(createdItems);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

export const createItem = async (req: Request, res: Response): Promise<void> => {
    const {name, quantity, category, purchase_date, expiration_date, inventory_id} = req.body;

    if (!name || !quantity || !category || !purchase_date || !expiration_date || !inventory_id) {
        res.status(400).json({error: 'All fields are required'});
        return;
    }

    if (typeof name !== 'string' || typeof quantity !== 'number' || typeof category !== 'string' || typeof purchase_date !== 'string' || typeof expiration_date !== 'string' || typeof inventory_id !== 'number') {
        res.status(400).json({error: 'Invalid data type'});
        return;
    }

    const purchaseDate = formatDate(purchase_date);
    const expirationDate = formatDate(expiration_date);
    const productName = name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    try {
        const item: Item = req.body;
        const createdItem = await ItemModel.create({
            ...item,
            name: productName,
            purchase_date: purchaseDate,
            expiration_date: expirationDate
        });

        if (!createdItem) {
            res.status(400).json({error: 'Item not created'});
            return;
        }

        res.status(201).json({
            id: createdItem.id,
            name: productName,
            quantity: quantity,
            category: category,
            purchase_date: purchaseDate,
            expiration_date: expirationDate,
            inventory_id: inventory_id
        });
        return;

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
