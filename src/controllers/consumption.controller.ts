import ConsumptionModel from "../models/consumption.model";
import {AuthenticatedRequest} from "../utils/interface";
import {Response} from 'express'
import ItemModel from "../models/item.model";
import formattedCurrentDate from "../utils/formattedCurrentDate";

export const getAllUsersConsumedItems = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({error: 'Invalid user ID'});
    }

    const consumedItems = await ConsumptionModel.getConsumptionsByUserId(userId);

    if (!consumedItems) {
        return res.status(404).json({error: 'No consumed items found'});
    }

    return res.status(200).json(consumedItems);
}

export const createConsumption = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({error: 'Invalid user ID'});
    }

    const {item_name, quantity, expiration_date, item_id} = req.body;

    // item_id is required if item_name and expiration_date is not provided
    // item_name and expiration_date is required if item_id is not provided
    if ((!item_name || !expiration_date) && !item_id) {
        return res.status(400).json({error: 'Missing required fields'});
    }

    if (item_id && (item_name || expiration_date)) {
        return res.status(400).json({error: 'Invalid request'});
    }

    if (!quantity) {
        return res.status(400).json({error: 'Missing required fields'});
    }

    if (quantity < 1) {
        return res.status(400).json({error: 'Invalid quantity'});
    }

    const date = formattedCurrentDate()

    const foundItem = await ItemModel.findByNameAndExpirationDate(item_name, expiration_date);

    const createdConsumption = await ConsumptionModel.create({
        user_id: userId,
        item_id: foundItem.id,
        quantity,
        date
    });

    return res.status(201).json(createdConsumption);
}