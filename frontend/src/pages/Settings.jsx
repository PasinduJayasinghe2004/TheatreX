import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import settingsService from '../services/settingsService';
import Loading from '../components/common/Loading';

const defaultSettingsByRole = (role) => {
    const isManager = role === 'admin' || role === 'coordinator';
    return {
        notifications: {
            scheduleChanges: { email: true, inApp: true, push: false },
            theatreStatus: { email: false, inApp: true, push: false },
            dailySummary: { email: true, inApp: false, push: false },
        },
        preferences: {
            timezone: 'UTC',
            dateFormat: 'DD/MM/YYYY',
            language: 'en',
            defaultLanding: isManager ? 'coordinator' : 'dashboard',
            density: 'comfortable',
        },
        appearance: {
            themeMode: 'system',
            highContrast: false,
        },
        privacy: {
            analyticsConsent: true,
            allowDataExport: true,
        },
        security: {
            twoFactorEnabled: false,
        },
    };
};

const mergeSettings = (base, incoming) => ({
    notifications: {
        ...base.notifications,
        ...(incoming?.notifications || {}),
        scheduleChanges: {
            ...base.notifications.scheduleChanges,
            ...(incoming?.notifications?.scheduleChanges || {}),
        },
        theatreStatus: {
            ...base.notifications.theatreStatus,
            ...(incoming?.notifications?.theatreStatus || {}),
        },
        dailySummary: {
            ...base.notifications.dailySummary,
            ...(incoming?.notifications?.dailySummary || {}),
        },
    },
    preferences: {
        ...base.preferences,
        ...(incoming?.preferences || {}),
    },
    appearance: {
        ...base.appearance,
        ...(incoming?.appearance || {}),
    },
    privacy: {
        ...base.privacy,
        ...(incoming?.privacy || {}),
    },
    security: {
        ...base.security,
        ...(incoming?.security || {}),
    },
});

const ToggleRow = ({ title, description, checked, onChange }) => (
    <label className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
        <div>
            <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{title}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
        </div>
        <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-blue-600" />
    </label>
);

const Settings = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { setThemeMode, setDensity, setHighContrast } = useTheme();

    const defaultSettings = useMemo(() => defaultSettingsByRole(user?.role), [user?.role]);

    const [settings, setSettings] = useState(defaultSettings);
    const [savedSnapshot, setSavedSnapshot] = useState(defaultSettings);
    const [meta, setMeta] = useState(null);
    const [history, setHistory] = useState([]);
    const [sessions, setSessions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [securityLoading, setSecurityLoading] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSnapshot);

    const applyAppearancePreview = (nextSettings) => {
        setThemeMode(nextSettings.appearance.themeMode);
        setDensity(nextSettings.preferences.density);
        setHighContrast(nextSettings.appearance.highContrast);
    };

    const loadAll = async () => {
        setLoading(true);
        try {
            const [settingsRes, historyRes, sessionsRes] = await Promise.all([
                settingsService.getSettings(),
                settingsService.getSettingsHistory(),
                settingsService.getSessions(),
            ]);

            const merged = mergeSettings(defaultSettingsByRole(user?.role), settingsRes?.settings || {});
            setSettings(merged);
            setSavedSnapshot(merged);
            setMeta(settingsRes?.meta || null);
            setHistory(historyRes?.history || []);
            setSessions(sessionsRes?.sessions || []);
            applyAppearancePreview(merged);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handler = (event) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    const setCategoryToggle = (category, channel, value) => {
        setSettings((prev) => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [category]: {
                    ...prev.notifications[category],
                    [channel]: value,
                },
            },
        }));
    };

    const setPreference = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: value,
            },
        }));

        if (key === 'density') {
            setDensity(value);
        }
    };

    const setAppearance = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            appearance: {
                ...prev.appearance,
                [key]: value,
            },
        }));

        if (key === 'themeMode') {
            setThemeMode(value);
        }
        if (key === 'highContrast') {
            setHighContrast(value);
        }
    };

    const setPrivacy = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [key]: value,
            },
        }));
    };

    const setSecurity = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            security: {
                ...prev.security,
                [key]: value,
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await settingsService.updateSettings(settings);
            const merged = mergeSettings(defaultSettings, response?.settings || settings);
            setSettings(merged);
            setSavedSnapshot(merged);
            setMeta(response?.meta || null);
            toast.success(response?.message || 'Settings saved');
            const historyRes = await settingsService.getSettingsHistory();
            setHistory(historyRes?.history || []);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setSettings(savedSnapshot);
        applyAppearancePreview(savedSnapshot);
        toast.info('Unsaved changes discarded');
    };

    const handleResetDefaults = () => {
        setSettings(defaultSettings);
        applyAppearancePreview(defaultSettings);
        toast.info('Defaults restored. Save to apply permanently.');
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        setSecurityLoading(true);
        try {
            const response = await settingsService.changePassword(passwordForm);
            toast.success(response?.message || 'Password updated');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to change password');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleLogoutOtherSessions = async () => {
        setSecurityLoading(true);
        try {
            const response = await settingsService.logoutOtherSessions();
            toast.success(response?.message || 'Logged out other sessions');
            const sessionsRes = await settingsService.getSessions();
            setSessions(sessionsRes?.sessions || []);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to logout other sessions');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await settingsService.exportMyData();
            const blob = new Blob([JSON.stringify(response?.data || {}, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `theatrex-my-data-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Data export generated');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to export data');
        }
    };

    const handleDeactivate = async () => {
        const confirmDeactivate = window.confirm('Deactivate your account? You can ask an admin to reactivate it later.');
        if (!confirmDeactivate) return;

        try {
            const response = await settingsService.deactivateAccount();
            toast.success(response?.message || 'Account deactivated');
            logout();
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to deactivate account');
        }
    };

    const handleDelete = async () => {
        const typed = window.prompt('Type DELETE to permanently remove your account.');
        if (typed !== 'DELETE') return;

        try {
            const response = await settingsService.deleteAccount();
            toast.success(response?.message || 'Account deleted');
            logout();
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to delete account');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
                    <Loading size="lg" text="Loading settings" className="text-blue-600" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    Manage account, security, notifications, privacy, and app behavior.
                                </p>
                                {meta?.updated_at && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                                        Last updated: {new Date(meta.updated_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleResetDefaults}
                                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200"
                                >
                                    Reset Defaults
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    disabled={!isDirty || saving}
                                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 disabled:opacity-50"
                                >
                                    Discard
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={!isDirty || saving}
                                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Account</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Name</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">{user?.name || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Email</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">{user?.email || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Role</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-slate-100 capitalize">{user?.role || 'user'}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Password</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">Update in Security section below</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Notifications</h2>
                        <div className="mt-4 space-y-4">
                            {[
                                ['scheduleChanges', 'Schedule Changes'],
                                ['theatreStatus', 'Theatre Status'],
                                ['dailySummary', 'Daily Summary'],
                            ].map(([key, label]) => (
                                <div key={key} className="p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{label}</p>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {['email', 'inApp', 'push'].map((channel) => (
                                            <ToggleRow
                                                key={`${key}-${channel}`}
                                                title={channel === 'inApp' ? 'In-App' : channel.charAt(0).toUpperCase() + channel.slice(1)}
                                                description={`Enable ${channel === 'inApp' ? 'in-app' : channel} alerts`}
                                                checked={Boolean(settings.notifications[key][channel])}
                                                onChange={(e) => setCategoryToggle(key, channel, e.target.checked)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Preferences & Appearance</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Timezone</label>
                                <input
                                    type="text"
                                    value={settings.preferences.timezone}
                                    onChange={(e) => setPreference('timezone', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Date Format</label>
                                <select
                                    value={settings.preferences.dateFormat}
                                    onChange={(e) => setPreference('dateFormat', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Language</label>
                                <select
                                    value={settings.preferences.language}
                                    onChange={(e) => setPreference('language', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                >
                                    <option value="en">English</option>
                                    <option value="si">Sinhala</option>
                                    <option value="ta">Tamil</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Default Landing</label>
                                <select
                                    value={settings.preferences.defaultLanding}
                                    onChange={(e) => setPreference('defaultLanding', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                >
                                    <option value="dashboard">Dashboard</option>
                                    {(user?.role === 'coordinator' || user?.role === 'admin') && <option value="coordinator">Coordinator</option>}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Density</label>
                                <select
                                    value={settings.preferences.density}
                                    onChange={(e) => setPreference('density', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                >
                                    <option value="comfortable">Comfortable</option>
                                    <option value="compact">Compact</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Theme</label>
                                <select
                                    value={settings.appearance.themeMode}
                                    onChange={(e) => setAppearance('themeMode', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                >
                                    <option value="system">System</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ToggleRow
                                title="High Contrast"
                                description="Increase contrast for readability and critical statuses"
                                checked={Boolean(settings.appearance.highContrast)}
                                onChange={(e) => setAppearance('highContrast', e.target.checked)}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Security</h2>
                        <div className="mt-4 space-y-4">
                            <ToggleRow
                                title="Two-Factor Authentication"
                                description="Require an additional verification step during login"
                                checked={Boolean(settings.security.twoFactorEnabled)}
                                onChange={(e) => setSecurity('twoFactorEnabled', e.target.checked)}
                            />

                            <form onSubmit={handlePasswordChange} className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 space-y-3">
                                <p className="text-sm font-medium text-gray-800 dark:text-slate-200">Change Password</p>
                                <input
                                    type="password"
                                    placeholder="Current password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                />
                                <input
                                    type="password"
                                    placeholder="New password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                                />
                                <button
                                    type="submit"
                                    disabled={securityLoading}
                                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                                >
                                    {securityLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>

                            <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">Active Sessions ({sessions.length})</p>
                                    <button
                                        type="button"
                                        onClick={handleLogoutOtherSessions}
                                        disabled={securityLoading}
                                        className="px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 disabled:opacity-50"
                                    >
                                        Logout Other Sessions
                                    </button>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {sessions.length === 0 && (
                                        <p className="text-xs text-gray-500 dark:text-slate-400">No active sessions found.</p>
                                    )}
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="rounded-lg border border-gray-100 dark:border-slate-700 px-3 py-2 text-xs text-gray-600 dark:text-slate-300"
                                        >
                                            <p className="font-medium">Session #{session.id}</p>
                                            <p>{session.user_agent || 'Unknown device'}</p>
                                            <p>{session.ip_address || 'Unknown IP'}</p>
                                            <p>Last active: {session.last_seen_at ? new Date(session.last_seen_at).toLocaleString() : 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Privacy & Account Lifecycle</h2>
                        <div className="mt-4 space-y-4">
                            <ToggleRow
                                title="Analytics Consent"
                                description="Allow anonymous usage analytics to improve system quality"
                                checked={Boolean(settings.privacy.analyticsConsent)}
                                onChange={(e) => setPrivacy('analyticsConsent', e.target.checked)}
                            />
                            <ToggleRow
                                title="Allow Data Export"
                                description="Enable one-click export of your data bundle"
                                checked={Boolean(settings.privacy.allowDataExport)}
                                onChange={(e) => setPrivacy('allowDataExport', e.target.checked)}
                            />

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleExportData}
                                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200"
                                >
                                    Export My Data
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeactivate}
                                    className="px-3 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    Deactivate Account
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-3 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Settings Activity</h2>
                        <div className="mt-4 space-y-2">
                            {history.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-slate-400">No settings changes recorded yet.</p>
                            )}
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-gray-100 dark:border-slate-700 px-3 py-2 text-sm text-gray-700 dark:text-slate-300"
                                >
                                    <p>Changed by user #{item.changed_by || 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;