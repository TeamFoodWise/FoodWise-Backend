import ConsumptionModel from "../models/consumption.model";

export const getConsumedItems = async (userId: number) => {
    return await ConsumptionModel.getConsumptionsByUserId(userId)
}