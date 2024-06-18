import ItemModel from "../../models/item.model";
import ConsumptionModel from "../../models/consumption.model";
import {AuthenticatedRequest, Item} from "../../utils/interface";
import {Response} from 'express';
import parseDate from "../../utils/parseDate";

const countInStock = async (items: Item[], userId: number): Promise<number> => {
    const consumedByUsers = await ConsumptionModel.getConsumptionsByUserId(userId);
    let inStockCount = 0;
    for (const item of items) {
        const consumedItem = consumedByUsers.find(consumption => consumption.item_id === item.id);
        if (!consumedItem && parseDate(item.expiration_date) > new Date()){
            inStockCount += item.quantity;
        }
        if (consumedItem && consumedItem.quantity < item.quantity) {
            inStockCount += item.quantity - consumedItem.quantity;
        }
    }

    return inStockCount
}

const countConsumed = async (items: Item[], userId: number): Promise<number> => {
    const consumedByUser = await ConsumptionModel.getConsumptionsByUserId(userId);

    let consumedCount = 0;
    for (const item of items) {
        const consumedItem = consumedByUser.find(consumption => consumption.item_id === item.id);
        if (consumedItem) {
            consumedCount += consumedItem.quantity;
        }
    }
    return consumedCount;
}

const countExpired = async (items: Item[], userId: number): Promise<number> => {
    const consumedByUser = await ConsumptionModel.getConsumptionsByUserId(userId);

    let expiredCount = 0;
    for (const item of items) {
        const consumedItem = consumedByUser.find(consumption => consumption.item_id === item.id);
        if (!consumedItem && parseDate(item.expiration_date) < new Date()) {
            expiredCount += item.quantity;
        }
    }

    return expiredCount;
}

export const showInventorySummary = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({message: 'User ID is required'});
        }
        const allItemsByUserID: Item[] = await ItemModel.findByUserId(userId);

        res.status(200).json({
            "in_stock_count": await countInStock(allItemsByUserID, userId),
            "consumed_count": await countConsumed(allItemsByUserID, userId),
            "expired_count": await countExpired(allItemsByUserID, userId),
        })

    } catch {
        return res.status(500).json({message: 'Internal server error'});
    }
}
