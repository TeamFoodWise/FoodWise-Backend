import { Request, Response } from 'express';
import ConsumptionModel from '../models/consumption.model';
import { Consumption } from '../utils/interface';

export const createConsumption = async (req: Request, res: Response): Promise<void> => {
    const consumption: Consumption = req.body;

    try {
        const createdConsumption = await ConsumptionModel.create(consumption);
        res.status(201).json(createdConsumption);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getConsumptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const consumptions = await ConsumptionModel.findAll();
        res.status(200).json(consumptions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getConsumptionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const consumption = await ConsumptionModel.findById(parseInt(req.params.id));
        if (consumption) {
            res.status(200).json(consumption);
        } else {
            res.status(404).json({ error: 'Consumption not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateConsumption = async (req: Request, res: Response): Promise<void> => {
    try {
        const consumption = await ConsumptionModel.update(parseInt(req.params.id), req.body);
        if (consumption) {
            res.status(200).json(consumption);
        } else {
            res.status(404).json({ error: 'Consumption not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteConsumption = async (req: Request, res: Response): Promise<void> => {
    try {
        await ConsumptionModel.delete(parseInt(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



