import {AuthenticatedRequest, Consumption, Inventory, Item} from "../../utils/interface";
import dotenv from 'dotenv';
import {Response} from 'express';
import UserModel from "../../models/user.model";
import ConsumptionModel from "../../models/consumption.model";
import ItemModel from "../../models/item.model";
import InventoryModel from "../../models/inventory.model";
import cron from 'node-cron';

dotenv.config()

function parseDate(dateString: string) {
    const [day, month, year] = dateString.split(' - ').map(Number);
    return new Date(year, month - 1, day);
}

const countExpiredAndInStock = (inventoryItems: Item[]) => {
    let expiredCount = 0;
    let inStockCount = 0;
    const currentDate = new Date();
    const lastDayOfLastMonth = calculateLastDayOfLastMonth(currentDate)

    for (const item of inventoryItems) {
        const itemDate = parseDate(item.expiration_date);
        if (itemDate < currentDate && itemDate > lastDayOfLastMonth) {
            expiredCount += item.quantity;
        } else {
            inStockCount += item.quantity;
        }
    }

    return {expiredCount, inStockCount};
}

const countConsumed = (userConsumptions: Consumption[]) => {
    let consumedCount = 0;

    for (const consumption of userConsumptions) {
        consumedCount += consumption.quantity;
    }

    return consumedCount;
}

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

const calculateWholeHistoryProgress = async (totalConsumedBeforeThisMonth: number, currentDate: Date, userInventories: Inventory[]) => {
    if (totalConsumedBeforeThisMonth === 0) {
        return null;
    }

    let allItemsByInventoryID: Item[] = [];
    for (const inventory of userInventories) {
        const inventoryItems = await ItemModel.findByInventoryId(inventory.id);
        allItemsByInventoryID = allItemsByInventoryID.concat(inventoryItems);
    }

    const lastDayOfLastMonth = calculateLastDayOfLastMonth(currentDate);

    const totalQuantityBeforeThisMonth = calculateTotalQuantityBeforeThisMonth(lastDayOfLastMonth, allItemsByInventoryID);

    return totalConsumedBeforeThisMonth / totalQuantityBeforeThisMonth * 100;
}

export const showUserStatistics = async (req: AuthenticatedRequest, res: Response) => {
    let consumedCount;
    let inStockCount = 0;
    let expiredCount = 0;
    let currentProgress;
    let remainingDays;
    let lastMonthProgress;
    let wholeHistoryProgress;

    try {
        if (!req.userId) {
            return res.status(400).json({error: 'User not found'});
        }

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({error: 'User not found'});
        }

        const userConsumptions = await ConsumptionModel.getConsumptionsByUserId(req.userId);

        const userConsumptionsThisMonth = userConsumptions.filter((consumption: Consumption) => {
            const currentDate = new Date();
            const consumptionDate = parseDate(consumption.date);
            return consumptionDate.getMonth() === currentDate.getMonth() && consumptionDate.getFullYear() === currentDate.getFullYear();
        })
        consumedCount = countConsumed(userConsumptionsThisMonth);

        const userInventories = await InventoryModel.findByUserId(req.userId);
        for (let i = 0; i < userInventories.length; i++) {
            const inventoryItems = await ItemModel.findByInventoryId(userInventories[i].id);
            const {
                expiredCount: currentExpiredCount,
                inStockCount: currentInStockCount
            } = countExpiredAndInStock(inventoryItems);
            expiredCount += currentExpiredCount;
            inStockCount += currentInStockCount;
        }

        currentProgress = calculateCurrentProgress(consumedCount, inStockCount, expiredCount);

        const currentDate = new Date();
        remainingDays = calculateRemainingDays(currentDate);

        const totalConsumedBeforeThisMonth = calculateTotalConsumedBeforeThisMonth(userConsumptions, currentDate);

        if (user.last_month_progress === null || user.last_month_progress === undefined) {
            lastMonthProgress = null;
        }

        wholeHistoryProgress = calculateWholeHistoryProgress(totalConsumedBeforeThisMonth, currentDate, userInventories)

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

cron.schedule('0 0 0 L * ?', async () => {
    const users = await UserModel.findAll();

    for (let user of users) {
        if (!user.id) {
            return;
        }
        const userConsumption = await ConsumptionModel.getConsumptionsByUserId(user.id);

        const consumedCount = countConsumed(userConsumption);
        let inStockCount = 0;
        let expiredCount = 0;

        const userInventories = await InventoryModel.findByUserId(user.id);
        for (let i = 0; i < userInventories.length; i++) {
            const inventoryItems = await ItemModel.findByInventoryId(userInventories[i].id);
            const {
                expiredCount: currentExpiredCount,
                inStockCount: currentInStockCount
            } = countExpiredAndInStock(inventoryItems);
            expiredCount += currentExpiredCount;
            inStockCount += currentInStockCount;
        }

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