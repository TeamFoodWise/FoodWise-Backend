import {Request, Response} from 'express';
import HistoryModel from '../../models/inventory.model';

const getHistory = async (req: Request, res: Response) => {
    try {
        const histories = await HistoryModel.findAll();
        res.status(200).json(histories);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

const getHistoryById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const history = await HistoryModel.findById(id);
        if (!history) {
            return res.status(404).json({error: 'History not found'});
        }
        res.status(200).json(history);
    }
    catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

const createHistory = async (req: Request, res: Response) => {
    try {
        const history = req.body;
        const createdHistory = await HistoryModel.create(history);
        res.status(201).json(createdHistory);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

const updateHistory = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const history = req.body;
        const updatedHistory = await HistoryModel.update(id, history);
        if (!updatedHistory) {
            return res.status(404).json({error: 'History not found'});
        }
        res.status(200).json(updatedHistory);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

const deleteHistory = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await HistoryModel.delete(id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

export {getHistory, getHistoryById, createHistory, updateHistory, deleteHistory};