import {AuthenticatedRequest, Consumption, Item} from "../../utils/interface";
import dotenv from 'dotenv';
import {Response} from 'express';
import UserModel from "../../models/user.model";
import ConsumptionModel from "../../models/consumption.model";
import ItemModel from "../../models/item.model";
import cron from 'node-cron';
import parseDate from "../../utils/parseDate";
import {countConsumed, countExpired, countInStock} from "../Inventory/summary.services";

dotenv.config()

// const countExpiredAndInStock = (inventoryItems: Item[], userConsumptions: Consumption[]) => {
//     let expiredCount = 0;
//     let inStockCount = 0;
//     const currentDate = new Date();
//     const lastDayOfLastMonth = calculateLastDayOfLastMonth(currentDate)
//
//     for (const item of inventoryItems) {
//         const itemDate = parseDate(item.expiration_date);
//         if (itemDate < currentDate && itemDate > lastDayOfLastMonth) {
//             expiredCount += item.quantity;
//         } else {
//             inStockCount += item.quantity;
//             if (userConsumptions.length > 0) {
//                 const consumedItem = userConsumptions.find(consumption => consumption.item_id === item.id);
//                 if (consumedItem && consumedItem.quantity < item.quantity) {
//                     inStockCount -= consumedItem.quantity;
//                 }
//             }
//         }
//     }
//     return {expiredCount, inStockCount};
// }
//
// const countConsumed = (userConsumptions: Consumption[]) => {
//     let consumedCount = 0;
//
//     for (const consumption of userConsumptions) {
//         consumedCount += consumption.quantity;
//     }
//
//     return consumedCount;
// }

const calculateCurrentProgress = (consumedCount: number, inStockCount: number, expiredCount: number) => {
    return consumedCount / (consumedCount + inStockCount + expiredCount) * 100;
}

const calculateRemainingDays = (currentDate: Date) => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() - currentDate.getDate();
}

const calculateLastDayOfLastMonth = (currentDate: Date) => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
}

const calculateTotalConsumedBeforeThisMonth = (userConsumptions: Consumption[], currentDate: Date) => {
    if (userConsumptions.length === 0) {
        return 0;
    }

    let totalConsumedBeforeThisMonth = 0;
    const lastDayOfLastMonth = calculateLastDayOfLastMonth(currentDate);

    const lastDayOfLastMonthConsumption = userConsumptions.filter((consumption: Consumption) => {
        const consumptionDate = parseDate(consumption.date);
        return consumptionDate < lastDayOfLastMonth;
    })

    if (lastDayOfLastMonthConsumption.length === 0) {
        return 0;
    }

    for (const consumption of lastDayOfLastMonthConsumption) {
        totalConsumedBeforeThisMonth += consumption.quantity;
    }

    return totalConsumedBeforeThisMonth;
}

const calculateTotalQuantityBeforeThisMonth = (lastDayOfLastMonth: Date, allItemsByInventoryID: Item[]) => {
    let totalQuantityBeforeThisMonth = 0;

    for (const item of allItemsByInventoryID) {
        const itemDate = parseDate(item.expiration_date);
        if (itemDate < lastDayOfLastMonth) {
            totalQuantityBeforeThisMonth += item.quantity;
        }
    }

    return totalQuantityBeforeThisMonth;
}

const calculateWholeHistoryProgress = async (totalConsumedBeforeThisMonth: number, currentDate: Date, userItems: Item[]) => {
    if (totalConsumedBeforeThisMonth === 0) {
        return null;
    }

    const lastDayOfLastMonth = calculateLastDayOfLastMonth(currentDate);

    const totalQuantityBeforeThisMonth = calculateTotalQuantityBeforeThisMonth(lastDayOfLastMonth, userItems);

    return totalConsumedBeforeThisMonth / totalQuantityBeforeThisMonth * 100;
}

export const showUserStatistics = async (req: AuthenticatedRequest, res: Response) => {
    let consumedCount;
    let inStockCount;
    let expiredCount;
    let currentProgress;
    let remainingDays;
    let lastMonthProgress;
    let wholeHistoryProgress;

    try {
        if (!req.userId) {
            return res.status(400).json({error: 'User not found'});
        }
        const userId = req.userId;

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({error: 'User not found'});
        }

        const userConsumptions = await ConsumptionModel.getConsumptionsByUserId(userId);
        const userItems = await ItemModel.findByUserId(user.id);

        consumedCount = await countConsumed(userItems, req.userId);
        expiredCount = await countExpired(userItems, req.userId);
        inStockCount = await countInStock(userItems, req.userId);
        currentProgress = calculateCurrentProgress(consumedCount, inStockCount, expiredCount);

        const currentDate = new Date();
        remainingDays = calculateRemainingDays(currentDate);

        const totalConsumedBeforeThisMonth = calculateTotalConsumedBeforeThisMonth(userConsumptions, currentDate);

        if (user.last_month_progress === null || user.last_month_progress === undefined) {
            lastMonthProgress = null;
        }

        wholeHistoryProgress = calculateWholeHistoryProgress(totalConsumedBeforeThisMonth, currentDate, userItems)

        res.status(200).json({
            consumed_count: consumedCount,
            in_stock_count: inStockCount,
            expired_count: expiredCount,
            current_progress: currentProgress,
            remaining_days: remainingDays,
            history_progress: lastMonthProgress,
            whole_history_progress: wholeHistoryProgress
        })

    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

const isLastDayOfMonth = (date: Date) => {
    const testDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return date.getDate() === testDate.getDate();
};

cron.schedule('0 0 0 * * *', async () => {
    const currentDate = new Date();

    if (!isLastDayOfMonth(currentDate)) {
        return;
    }

    const users = await UserModel.findAll();

    for (let user of users) {
        if (!user.id) {
            return;
        }
        const userConsumptions = await ConsumptionModel.getConsumptionsByUserId(user.id);

        const userItems = await ItemModel.findByUserId(user.id);

        const consumedCount = await countConsumed(userItems, user.id);
        const expiredCount = await countExpired(userItems, user.id);
        const inStockCount = await countInStock(userItems, user.id);

        const currentProgress = calculateCurrentProgress(consumedCount, inStockCount, expiredCount);
        if (!user.id) {
            return;
        }

        const updatedUserData = {
            ...user,
            last_month_progress: currentProgress
        }

        await UserModel.update(user.id, updatedUserData);
    }
})