import {AuthenticatedRequest} from "../../utils/interface";
import dotenv from 'dotenv';
import {Response} from 'express';
import UserModel from "../../models/user.model";
import ConsumptionModel from "../../models/consumption.model";

dotenv.config()

export const showUserStatistics = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(400).json({error: 'User not found'});
        }

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({error: 'User not found'});
        }

        const consumptions = await ConsumptionModel.getConsumptionsByUserId(req.userId);

        let consumed_count = 0;
        let in_stock_count = 0;
        let expired_count = 0;
        let current_progress = 0; // consumed / (consumed + in_stock + expired) * 100


        res.send({
            consumed_count: 10,
            in_stock_count: 10,
            expired_count: 10,
            current_progress: 90,
            remaining_days: 2,
            history_progress: 80
        })

    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}