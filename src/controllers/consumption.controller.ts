import ConsumptionModel from "../models/consumption.model";
import {AuthenticatedRequest, Item} from "../utils/interface";
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
    if ((!item_name || !expiration_date) && !item_id) {
        return res.status(400).json({error: 'Missing required fields'});
    }

    if (item_id && (item_name || expiration_date)) {
        return res.status(400).json({error: 'Item_id should be the only field provided or item_name + expiration_date should be provided'});
    }

    if (!quantity || quantity < 0) {
        return res.status(400).json({error: 'Quantity should be a positive integer'});
    }

    const date = formattedCurrentDate()

    let foundItem: Item | null = {} as Item

    if (item_id) {
        foundItem = await ItemModel.findById(item_id);
    }

    if (item_name && expiration_date) {
        foundItem = await ItemModel.findByNameAndExpirationDateAndInventory(item_name, expiration_date, userId);
    }

    if (!foundItem) {
        return res.status(404).json({error: 'Item not found'});
    }

    const consumedItems = await ConsumptionModel.getConsumptionsByUserId(userId);
    const alreadyConsumedItem = consumedItems.find(consumption => consumption.item_id === foundItem.id);

    if (!alreadyConsumedItem && quantity > foundItem.quantity) {
        return res.status(400).json({error: 'Not enough items in inventory'});
    }

    if (alreadyConsumedItem) {
        const updatedConsumption = {
            ...alreadyConsumedItem,
            quantity: alreadyConsumedItem.quantity + quantity}
        await ConsumptionModel.update(alreadyConsumedItem.id, updatedConsumption);
        return res.status(200).json({message: 'Consumption made successfully', updatedConsumption: updatedConsumption});
    } else {
        const createdConsumption = await ConsumptionModel.create({
            user_id: userId,
            item_id: foundItem.id,
            quantity,
            date
        });

        return res.status(201).json({message: 'Consumption made successfully', createdConsumption: createdConsumption});
    }


}