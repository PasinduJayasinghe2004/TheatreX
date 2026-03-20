import { api } from './authService';

const settingsService = {
    async getSettings() {
        const response = await api.get('/auth/settings');
        return response.data;
    },

    async updateSettings(payload) {
        const response = await api.put('/auth/settings', payload);
        return response.data;
    },

    async getSettingsHistory() {
        const response = await api.get('/auth/settings/history');
        return response.data;
    },

    async changePassword(payload) {
        const response = await api.post('/auth/change-password', payload);
        return response.data;
    },

    async getSessions() {
        const response = await api.get('/auth/sessions');
        return response.data;
    },

    async logoutOtherSessions(keepSessionId) {
        const response = await api.post('/auth/sessions/logout-others', { keepSessionId });
        return response.data;
    },

    async exportMyData() {
        const response = await api.get('/auth/export-data');
        return response.data;
    },

    async deactivateAccount() {
        const response = await api.post('/auth/deactivate');
        return response.data;
    },

    async deleteAccount() {
        const response = await api.delete('/auth/account');
        return response.data;
    },
};

export default settingsService;
