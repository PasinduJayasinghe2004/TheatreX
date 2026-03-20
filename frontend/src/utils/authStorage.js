const STORAGE_KEYS = {
    token: 'theatrex.auth.token',
    refreshToken: 'theatrex.auth.refreshToken',
    user: 'theatrex.auth.user'
};

let hasMigratedLegacyKeys = false;
const memoryStore = new Map();

const getSessionStore = () => {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            return window.sessionStorage;
        }
    } catch (_error) {
        // Ignore storage access errors and fallback to in-memory storage.
    }

    return null;
};

const read = (key) => {
    const storage = getSessionStore();

    if (storage) {
        return storage.getItem(key);
    }

    return memoryStore.get(key) || null;
};

const write = (key, value) => {
    const storage = getSessionStore();

    if (storage) {
        storage.setItem(key, value);
        return;
    }

    memoryStore.set(key, value);
};

const remove = (key) => {
    const storage = getSessionStore();

    if (storage) {
        storage.removeItem(key);
        return;
    }

    memoryStore.delete(key);
};

const migrateLegacyStorage = () => {
    if (hasMigratedLegacyKeys || typeof window === 'undefined') {
        return;
    }

    hasMigratedLegacyKeys = true;

    try {
        const legacyStorage = window.localStorage;
        const sessionStorage = getSessionStore();

        if (!legacyStorage || !sessionStorage) {
            return;
        }

        const legacyToken = legacyStorage.getItem('token');
        const legacyRefreshToken = legacyStorage.getItem('refreshToken');
        const legacyUser = legacyStorage.getItem('user');

        if (legacyToken && !sessionStorage.getItem(STORAGE_KEYS.token)) {
            sessionStorage.setItem(STORAGE_KEYS.token, legacyToken);
        }

        if (legacyRefreshToken && !sessionStorage.getItem(STORAGE_KEYS.refreshToken)) {
            sessionStorage.setItem(STORAGE_KEYS.refreshToken, legacyRefreshToken);
        }

        if (legacyUser && !sessionStorage.getItem(STORAGE_KEYS.user)) {
            sessionStorage.setItem(STORAGE_KEYS.user, legacyUser);
        }

        legacyStorage.removeItem('token');
        legacyStorage.removeItem('refreshToken');
        legacyStorage.removeItem('user');
    } catch (_error) {
        // Ignore migration errors. App can continue using whichever storage works.
    }
};

export const authStorage = {
    getToken() {
        migrateLegacyStorage();
        return read(STORAGE_KEYS.token);
    },

    setToken(token) {
        if (!token) {
            remove(STORAGE_KEYS.token);
            return;
        }

        write(STORAGE_KEYS.token, token);
    },

    getRefreshToken() {
        migrateLegacyStorage();
        return read(STORAGE_KEYS.refreshToken);
    },

    setRefreshToken(refreshToken) {
        if (!refreshToken) {
            remove(STORAGE_KEYS.refreshToken);
            return;
        }

        write(STORAGE_KEYS.refreshToken, refreshToken);
    },

    getUser() {
        migrateLegacyStorage();
        const userRaw = read(STORAGE_KEYS.user);
        if (!userRaw) {
            return null;
        }

        try {
            return JSON.parse(userRaw);
        } catch (_error) {
            remove(STORAGE_KEYS.user);
            return null;
        }
    },

    setUser(user) {
        if (!user) {
            remove(STORAGE_KEYS.user);
            return;
        }

        write(STORAGE_KEYS.user, JSON.stringify(user));
    },

    clear() {
        remove(STORAGE_KEYS.token);
        remove(STORAGE_KEYS.refreshToken);
        remove(STORAGE_KEYS.user);
    }
};

export default authStorage;
