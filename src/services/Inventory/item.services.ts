import {Request, Response} from 'express';
import ItemModel from '../../models/item.model';
import {AuthenticatedRequest, Item} from '../../utils/interface'
import formattedCurrentDate from "../../utils/formattedCurrentDate";
import parseDate from "../../utils/parseDate";
import ConsumptionModel from "../../models/consumption.model";

const validateItemData = (name: string, quantity: number, measure: string, expiration_date: string, type: string): [boolean, string] => {
    if (!name || quantity == null || !measure || !expiration_date) {
        return [false, 'Please fill in all the required data'];
    }

    if (quantity < 0) {
        return [false, 'Quantity should be a positive number'];
    }

    if (!parseInt(measure)) {
        return [false, 'Measure must contain only numbers'];
    }

    if (type !== 'Gr' && type !== 'mL') {
        return [false, 'Invalid unit, must be either Gr or mL'];
    }

    let weight: number = 0;
    if (type === 'Gr' && !measure.includes('g')) {
        weight = parseInt(measure.trim());
    }

    if (type === 'mL' && !measure.includes('ml')) {
        weight = parseInt(measure.trim());
    }

    if (isNaN(weight) || weight <= 0) {
        return [false, 'Weight must be a positive number'];
    }

    return [true, 'Validated'];
};

export const createItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({error: 'Please Login first'});
        return;
    }

    let {name, quantity, measure, expiration_date, purchase_date, type} = req.body;

    const [isValid, message] = validateItemData(name, quantity, measure, expiration_date, type);

    if (!isValid) {
        res.status(400).json({error: message});
        return;
    }

    let purchaseDate = purchase_date;
    if (!purchase_date) {
        purchaseDate = formattedCurrentDate();
    }

    const inventory_id = userId
    const unit = type

    const productName = name.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    try {
        let incrementItem = await ItemModel.findByNameAndExpirationDateAndInventory(productName, expiration_date, userId);

        if (!incrementItem || incrementItem.inventory_id !== userId) {
            incrementItem = null;
        } else if (incrementItem.unit !== unit) {
            res.status(400).json({error: 'Units do not match'});
            return;
        }

        const item: Item = {
            name: productName,
            quantity,
            unit,
            measure,
            expiration_date,
            purchase_date: purchaseDate,
            inventory_id
        };

        if (incrementItem) {
            const itemWithLowestMeasure = parseInt(incrementItem.measure) < parseInt(measure) ? incrementItem : item;
            const itemWithHighestMeasure = parseInt(incrementItem.measure) < parseInt(measure) ? item : incrementItem;

            const finalQuantity = itemWithHighestMeasure.quantity * Math.ceil(parseInt(itemWithHighestMeasure.measure) / parseInt(itemWithLowestMeasure.measure)) + itemWithLowestMeasure.quantity
            const newMeasure = itemWithLowestMeasure.measure;
            await ItemModel.update(incrementItem.id, {
                ...incrementItem,
                measure: newMeasure,
                quantity: finalQuantity
            });

            const incrementedItem = await ItemModel.findById(incrementItem.id);
            res.status(200).json({message: 'Item updated', item: incrementedItem});
            return;
        } else {
            console.log(item)
            const createdItem = await ItemModel.create(item);


            if (!createdItem) {
                res.status(400).json({error: 'Item not created'});
                return;
            }

            res.status(201).json({
                message: 'New Item created', item: {
                    id: createdItem.id,
                    name: productName,
                    quantity,
                    measure,
                    unit,
                    purchase_date: purchaseDate,
                    expiration_date,
                    inventory_id
                }
            });
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

const listExpiredItems = async (items: Item[], userId: number) => {
    const consumedByUser = await ConsumptionModel.getConsumptionsByUserId(userId);

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
                unit: item.unit,
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
    const consumedByUser = await ConsumptionModel.getConsumptionsByUserId(userId)
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
                unit: item.unit,
                expiration_date: item.expiration_date,
            }
        })
}

const listInStockItems = async (items: Item[], userId: number) => {
    const consumedByUser = await ConsumptionModel.getConsumptionsByUserId(userId);
    const notExpiredItems = items.filter(item => {
        return parseDate(item.expiration_date) >= new Date();
    })

    for (let item of notExpiredItems) {
        const consumedItem = consumedByUser.find(consumption => consumption.item_id === item.id);
        if (consumedItem) {
            item.quantity -= consumedItem.quantity;
        }
    }

    return notExpiredItems.filter(item => item.quantity > 0);
}

export const getItemsByUserId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(<string>req.query.page) || 1;
        const size = parseInt(<string>req.query.size) || 10;
        const type = parseInt(<string>req.query.type) || 1;
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({error: 'Please Login first'});
            return;
        }
        const startIndex = (page - 1) * size;
        const endIndex = page * size;

        let items = await ItemModel.findByUserId(userId);
        if (!items) {
            res.status(404).json({items: [], message: 'No items found'});
            return;
        }
        let result;

        if (type === 1) {
            result = await listInStockItems(items, userId);
        }

        if (type === 2) {
            result = await listConsumedItems(items, userId);
        }

        if (type === 3) {
            result = await listExpiredItems(items, userId);
        }

        if (!result) {
            res.status(200).json({items: [], message: 'No items found'});
            return;
        }

        const sortedItems = result.sort((a, b) => {
            const dateA = parseDate(a.expiration_date);
            const dateB = parseDate(b.expiration_date);
            return dateA.getTime() - dateB.getTime();
        });

        const responseItems = sortedItems.slice(startIndex, endIndex).map(item => {
            return {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                measure: item.measure,
                unit: item.unit,
                expiration_date: item.expiration_date
            }
        })
        res.status(200).json({foods: responseItems})
        return;
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

export const getItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const items = await ItemModel.findByUserId(userId);
        if (!items) {
            res.status(404).json({error: 'No items found'});
            return;
        }
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

    let {name, quantity, measure, expiration_date, purchase_date, inventory_id, type} = req.body;

    const [isValid, message] = validateItemData(name, quantity, measure, expiration_date, type);

    const unit = type

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
        unit,
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
