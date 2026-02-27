import express from 'express';
import {
    createTechnician,
    getAllTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician
} from '../controllers/technicianController.js';
import { uploadProfilePicture } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', uploadProfilePicture, createTechnician);
router.get('/', getAllTechnicians);
router.get('/:id', getTechnicianById);
router.put('/:id', uploadProfilePicture, updateTechnician);
router.delete('/:id', deleteTechnician);

export default router;
