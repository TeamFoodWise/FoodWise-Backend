import {AuthenticatedRequest, Item} from "../../utils/interface";
import dotenv from 'dotenv';
import {Response} from 'express';
import ItemModel from "../../models/item.model";
import parseDate from "../../utils/parseDate";

dotenv.config()

const countRemainingDays = (expirationDate: Date) => {
    const currentDate = new Date();
    const diff = expirationDate.getTime() - currentDate.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));

}

export const getExpiringSoonItems = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({message: 'User ID is required'});
        }

        const allItemsByUserId = await ItemModel.findByUserId(userId);

        const currentDate = new Date();

        const expiringSoonItems = allItemsByUserId
            .filter(item => parseDate(item.expiration_date) > currentDate)
            .sort((a, b) => parseDate(a.expiration_date).getTime() - parseDate(b.expiration_date).getTime())
            .slice(0, 6);

        const response = expiringSoonItems.map(item => {
            return {
                "name": item.name,
                "remaining_days": countRemainingDays(parseDate(item.expiration_date))
            }
        })

        return res.status(200).json({"food_item": response});

    } catch {
        return res.status(500).json({message: 'Internal server error'});
    }
}