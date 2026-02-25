import * as AnaesthetistRecord from '../models/anaesthetistModel.js';

/**
 * @desc    Get all anaesthetists
 * @route   GET /api/anaesthetists
 * @access  Private (Coordinator/Admin)
 */
export const getAnaesthetists = async (req, res) => {
    try {
        const anaesthetists = await AnaesthetistRecord.getAllAnaesthetists();
        res.status(200).json({
            success: true,
            count: anaesthetists.length,
            data: anaesthetists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching anaesthetists',
            error: error.message
        });
    }
};

/**
 * @desc    Get available anaesthetists
 * @route   GET /api/anaesthetists/available
 * @access  Private (Coordinator/Admin)
 */
export const getAvailableAnaesthetists = async (req, res) => {
    try {
        const anaesthetists = await AnaesthetistRecord.getAvailableAnaesthetists();
        res.status(200).json({
            success: true,
            count: anaesthetists.length,
            data: anaesthetists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching available anaesthetists',
            error: error.message
        });
    }
};

/**
 * @desc    Create new anaesthetist
 * @route   POST /api/anaesthetists
 * @access  Private (Admin)
 */
export const createAnaesthetist = async (req, res) => {
    try {
        const { name, email, phone, specialization, license_number, years_of_experience, qualification, shift_preference } = req.body;

        // Basic validation
        if (!name || !email || !specialization || !license_number) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const newAnaesthetist = await AnaesthetistRecord.createAnaesthetist({
            name,
            email,
            phone,
            specialization,
            license_number,
            years_of_experience,
            qualification,
            shift_preference
        });

        res.status(201).json({
            success: true,
            message: 'Anaesthetist created successfully',
            data: newAnaesthetist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating anaesthetist',
            error: error.message
        });
    }
};

/**
 * @desc    Update anaesthetist availability
 * @route   PUT /api/anaesthetists/:id/availability
 * @access  Private (Coordinator/Admin)
 */
export const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_available } = req.body;

        if (is_available === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide is_available status'
            });
        }

        const updated = await AnaesthetistRecord.updateAnaesthetistAvailability(id, is_available);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Anaesthetist not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Availability updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating availability',
            error: error.message
        });
    }
};
