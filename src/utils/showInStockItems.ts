import {Item} from "./interface";
import ConsumptionModel from "../models/consumption.model";
import parseDate from "./parseDate";

const showInStockIngredients = async (items: Item[], userId: number): Promise<Item[]> => {
    const consumedByUsers = await ConsumptionModel.getConsumptionsByUserId(userId);
    let inStockIngredients: Item[] = [];
    for (const item of items) {
        const consumedItem = consumedByUsers.find(consumption => consumption.item_id === item.id);
        if (!consumedItem && parseDate(item.expiration_date) > new Date()) {
            inStockIngredients.push(item);
        }
        if (consumedItem && consumedItem.quantity < item.quantity) {
            inStockIngredients.push({
                ...item,
                quantity: item.quantity - consumedItem.quantity
            });
        }
    }

    return inStockIngredients;
}

export default showInStockIngredients;