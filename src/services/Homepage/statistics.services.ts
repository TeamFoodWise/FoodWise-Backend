import {AuthenticatedRequest} from "../../utils/interface";
import dotenv from 'dotenv';
import {Request, Response} from 'express';
import UserModel from "../../models/user.model";

dotenv.config()

export const showUserStatistics = async (req: AuthenticatedRequest, res: Response) => {
    // {
    //     "consumed_count": 10,
    //     "in_stock_count": 10,
    //     "expired_count": 10,
    //     "current_progress": 90,
    //     "remaining_days": 2,
    //     "history_progress": 80
    // }

    try {
        if (!req.userId) {
            return res.status(400).json({error: 'User not found'});
        }

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({error: 'User not found'});
        }

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