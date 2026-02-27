import express from 'express';
import {
    getAnaesthetists,
    getAvailableAnaesthetists,
    createAnaesthetist,
    updateAnaesthetist,
    deleteAnaesthetist,
    updateAvailability
} from '../controllers/anaesthetistController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadProfilePicture } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all anaesthetists - Coordinator and Admin
router.get('/', authorize('coordinator', 'admin'), getAnaesthetists);

// Get available anaesthetists - Coordinator and Admin
router.get('/available', authorize('coordinator', 'admin'), getAvailableAnaesthetists);

// Create new anaesthetist - Admin only
router.post('/', authorize('admin'), uploadProfilePicture, createAnaesthetist);

// Update anaesthetist - Coordinator and Admin
router.put('/:id', authorize('coordinator', 'admin'), uploadProfilePicture, updateAnaesthetist);

// Delete anaesthetist - Admin only
router.delete('/:id', authorize('admin'), deleteAnaesthetist);

// Update availability - Coordinator and Admin
router.put('/:id/availability', authorize('coordinator', 'admin'), updateAvailability);

export default router;
