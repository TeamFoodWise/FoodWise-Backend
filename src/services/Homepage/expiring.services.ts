import {AuthenticatedRequest, Item} from "../../utils/interface";
import dotenv from 'dotenv';
import {Response} from 'express';
import ItemModel from "../../models/item.model";
import InventoryModel from "../../models/inventory.model";
import parseDate from "../../utils/utilities";

dotenv.config()

export const getExpiringSoonItems = async (req: AuthenticatedRequest, res: Response) => {
    try {
        console.log("huwuw")
        // const userId = req.userId;
        //
        // if (!userId) {
        //     return res.status(400).json({message: 'User ID is required'});
        // }
        //
        // const userInventories = await InventoryModel.findByUserId(userId);
        //
        // let allItemsByInventoryID: Item[] = [];
        // for (const inventory of userInventories) {
        //     const inventoryItems = await ItemModel.findByInventoryId(inventory.id);
        //     allItemsByInventoryID = allItemsByInventoryID.concat(inventoryItems);
        // }
        //
        // const currentDate = new Date();
        //
        // const expiringSoonItems = allItemsByInventoryID
        //     .filter(item => parseDate(item.expiration_date) > currentDate)
        //     .sort((a, b) => parseDate(a.expiration_date).getTime() - parseDate(b.expiration_date).getTime())
        //     .slice(0, 6);

        return res.status(200).json("huwuw");

    } catch {
        return res.status(500).json({message: 'Internal server error'});
    }
}