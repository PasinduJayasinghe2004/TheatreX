// ============================================================================
// Chatbot Service
// ============================================================================
// Handles AI chatbot API calls (Gemini Flash backend)
// Uses the same authenticated axios instance as other services
// ============================================================================

import { api } from './authService.js';

const chatbotService = {
    // Send a message and get AI response
    sendMessage: async (message) => {
        const res = await api.post('/chatbot/message', { message });
        return res.data;
    },

    // Get conversation history
    getHistory: async (limit = 50) => {
        const res = await api.get('/chatbot/history', { params: { limit } });
        return res.data;
    },

    // Clear conversation history
    clearHistory: async () => {
        const res = await api.delete('/chatbot/history');
        return res.data;
    },
};

export default chatbotService;
