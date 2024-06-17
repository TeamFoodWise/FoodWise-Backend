import {Request, Response} from 'express';
import ItemModel from '../../models/item.model';
import {AuthenticatedRequest, Item} from '../../utils/interface'
import formattedCurrentDate from "../../utils/formattedCurrentDate";
import parseDate from "../../utils/parseDate";
import {getConsumedItems} from "../../controllers/consumption.controller";

const validateItemData = (name: string, quantity: number, measure: string, expiration_date: string): [boolean, string] => {
    if (!name || quantity == null || !measure || !expiration_date) {
        return [false, 'Please fill in all the required data'];
    }

    if (quantity < 0) {
        return [false, 'Quantity should be a positive number'];
    }

    const weight: number = parseInt(measure.split('g' || 'G')[0]);
    if (isNaN(weight) || weight < 0) {
        return [false, 'Invalid weight'];
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

    const [isValid, message] = validateItemData(name, quantity, measure, expiration_date);

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
                purchase_date: purchaseDate,
                expiration_date,
                inventory_id
            });
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

const listExpiredItems = async (items: Item[], userId: number) => {
    const consumedByUser = await getConsumedItems(userId);

    const consumedButNotFinishedItems = items.filter(item => {
        return consumedByUser.find(consumption => consumption.item_id === item.id && consumption.quantity < item.quantity && parseDate(item.expiration_date) < new Date());
    })
        .map(item => {
            const consumedQuantity = consumedByUser.find(consumption => consumption.item_id === item.id)?.quantity;
            return {
                id: item.id,
                name: item.name,
                quantity: item.quantity - (consumedQuantity || 0),
                measure: item.measure,
                expiration_date: item.expiration_date
            }
        })

    const notConsumedAndExpiredItems: Item[] = items.filter(item => {
        const consumedItem = consumedByUser.find(consumption => consumption.item_id === item.id);
        return !consumedItem && parseDate(item.expiration_date) < new Date();
    })

    return [...consumedButNotFinishedItems, ...notConsumedAndExpiredItems];
}

const listConsumedItems = async (items: Item[], userId: number) => {
    const consumedByUser = await getConsumedItems(userId)
    const expiredItems = await listExpiredItems(items, userId);

    return items.filter(item => {
        const consumedItem = consumedByUser.find(consumption => consumption.item_id === item.id);
        return consumedItem && !expiredItems.find(expiredItem => expiredItem.id === item.id);
    })
        .map(item => {
            const consumedItem = consumedByUser.find(consumption => consumption.item_id === item.id);
            return {
                id: item.id,
                name: item.name,
                quantity: consumedItem?.quantity,
                measure: item.measure,
                expiration_date: item.expiration_date,
            }
        })
}

const listInStockItems = async (items: Item[], userId: number) => {
    const consumedByUser = await getConsumedItems(userId);
    const notExpiredItems = items.filter(item => {
        return parseDate(item.expiration_date) > new Date();
    })

    return notExpiredItems.filter(item => {
        return consumedByUser.find(consumption => consumption.item_id === item.id && consumption.quantity < item.quantity);
    }).map(item => {
        const consumedQuantity = consumedByUser.find(consumption => consumption.item_id === item.id)?.quantity;
        return {
            id: item.id,
            name: item.name,
            quantity: item.quantity - (consumedQuantity || 0),
            measure: item.measure,
            expiration_date: item.expiration_date
        }
    });
}

export const getItemsByUserId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.params.page);
        const size = parseInt(req.params.size);
        const type = parseInt(req.params.type);
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({error: 'Please Login first'});
            return;
        }
        const startIndex = (page - 1) * size;
        const endIndex = page * size;

        let items, result;

        if (type === 1) {
            items = await ItemModel.findByUserId(userId);
            if (!items) {
                res.status(404).json({items: [], message: 'No items found'});
                return;
            }
            result = await listInStockItems(items, userId);
        }

        if (type === 2) {
            items = await ItemModel.findByUserId(userId);
            if (!items) {
                res.status(404).json({items: [], message: 'No items found'});
                return;
            }
            result = await listConsumedItems(items, userId);
        }

        if (type === 3) {
            items = await ItemModel.findByUserId(userId);
            if (!items) {
                res.status(404).json({items: [], message: 'No items found'});
                return;
            }
            result = await listExpiredItems(items, userId);
        }

        if (!result) {
            res.status(404).json({items: [], message: 'No items found'});
            return;
        }

        const sortedItems = result.sort((a, b) => {
            const dateA = parseDate(a.expiration_date);
            const dateB = parseDate(b.expiration_date);
            return dateA.getTime() - dateB.getTime();
        });
        const response = sortedItems.slice(startIndex, endIndex).map(item => {
            return {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                measure: item.measure,
                expiration_date: item.expiration_date
            }
        })

        res.status(200).json({foods: response})
        return;
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

    const [isValid, message] = validateItemData(name, quantity, measure, expiration_date);

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
