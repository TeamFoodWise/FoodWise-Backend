import {Router} from 'express';
import {createConsumption, getConsumptions, getConsumptionById, updateConsumption, deleteConsumption} from "../controllers/consumption.controller";

const router = Router();

router.post('/', createConsumption);
router.get('/', getConsumptions);
router.get('/:id', getConsumptionById);
router.put('/:id', updateConsumption);
router.delete('/:id', deleteConsumption);

export default router;