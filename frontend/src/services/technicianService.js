import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getTechnicians = async () => {
    const response = await axios.get(`${API_URL}/technicians`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

const createTechnician = async (formData) => {
    const response = await axios.post(`${API_URL}/technicians`, formData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const updateTechnician = async (id, formData) => {
    const response = await axios.put(`${API_URL}/technicians/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const deleteTechnician = async (id) => {
    const response = await axios.delete(`${API_URL}/technicians/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

const technicianService = {
    getTechnicians,
    createTechnician,
    updateTechnician,
    deleteTechnician
};

export default technicianService;
