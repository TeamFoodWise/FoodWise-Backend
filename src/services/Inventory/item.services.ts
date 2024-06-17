import {Request, Response} from 'express';
import ItemModel from '../../models/item.model';
import {AuthenticatedRequest, Item} from '../../utils/interface'
import formattedCurrentDate from "../../utils/formattedCurrentDate";
import parseDate from "../../utils/parseDate";

const validateItemData = (name: string, quantity: number, category: string, measure: string, expiration_date: string): [boolean, string] => {
    if (!name || quantity == null || !category || !measure || !expiration_date) {
        return [false, 'Please fill in all the required data'];
    }

    if (quantity < 0) {
        return [false, 'Quantity should be a positive number'];
    }

    const weight: number = parseInt(measure.split('g' || 'G')[0]);
    if (isNaN(weight) || weight < 0) {
        return [false, 'Invalid weight'];
    }

    if (category.trim().toLowerCase() !== 'food' && category.trim().toLowerCase() !== 'beverages') {
        return [false, 'Invalid category'];
    }

    return [true, 'Validated'];
};

export const createItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({error: 'Please Login first'});
        return;
    }

    let {name, quantity, category, measure, expiration_date, purchase_date, inventory_id} = req.body;

    const [isValid, message] = validateItemData(name, quantity, category, measure, expiration_date);

    if (!isValid) {
        res.status(400).json({error: message});
        return;
    }

    let purchaseDate = purchase_date;
    if (!purchase_date) {
        purchaseDate = formattedCurrentDate();
    }

    if (!inventory_id) {
        inventory_id = userId;
    }

    const productName = name.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    try {
        const incrementItem = await ItemModel.findByNameAndExpirationDate(productName, expiration_date);
        if (incrementItem) {
            quantity += incrementItem.quantity;
            await ItemModel.update(incrementItem.id, {
                ...incrementItem,
                quantity
            });

            const incrementedItem = await ItemModel.findById(incrementItem.id);
            res.status(200).json({message: 'Item updated', item: incrementedItem});
            return;
        } else {
            const item: Item = {
                name: productName,
                quantity,
                category,
                measure,
                expiration_date,
                purchase_date: purchaseDate,
                inventory_id
            };

            const createdItem = await ItemModel.create(item);

            if (!createdItem) {
                res.status(400).json({error: 'Item not created'});
                return;
            }

            res.status(201).json({
                id: createdItem.id,
                name: productName,
                quantity,
                measure,
                category,
                purchase_date: purchaseDate,
                expiration_date,
                inventory_id
            });
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const getItemsByUserId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({error: 'Please Login first'});
            return;
        }

        const items = await ItemModel.findByUserId(userId);
        const sortedItems = items.sort((a, b) => {
            const dateA = parseDate(a.expiration_date);
            const dateB = parseDate(b.expiration_date);
            return dateA.getTime() - dateB.getTime();
        });

        res.status(200).json(sortedItems);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

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

export const updateItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({error: 'Please Login first'});
        return;
    }

    let {name, quantity, category, measure, expiration_date, purchase_date, inventory_id} = req.body;

    const [isValid, message] = validateItemData(name, quantity, category, measure, expiration_date);

    purchase_date = purchase_date || formattedCurrentDate();
    inventory_id = inventory_id || userId;

    if (!isValid) {
        res.status(400).json({error: message});
        return;
    }

    const productName = name.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const updatedItem: Item = {
        name: productName,
        quantity,
        category,
        measure,
        expiration_date,
        purchase_date,
        inventory_id
    }

    try {
        const item = await ItemModel.update(parseInt(req.params.id), updatedItem);
        if (item) {
            res.status(200).json({message: 'item updated', item: item});
        } else {
            res.status(404).json({error: 'Item not found'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

export const deleteItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({error: 'Please Login first'});
            return;
        }

        const {id} = req.body;
        const itemId = parseInt(id);

        if (!await ItemModel.isItemUsers(itemId, userId)) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }

        const item = await ItemModel.findById(itemId);
        if (!item) {
            res.status(404).json({error: 'Item not found'});
            return;
        }

        await ItemModel.delete(itemId);

        res.status(200).json({message: 'Item deleted', item: item});
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};
