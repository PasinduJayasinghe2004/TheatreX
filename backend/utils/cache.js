const cacheStore = new Map();

const now = () => Date.now();

export const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= now()) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value;
};

export const setCache = (key, value, ttlMs = 15000) => {
  cacheStore.set(key, {
    value,
    expiresAt: now() + ttlMs
  });
};

export const clearCacheByPrefix = (prefix) => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};

export const clearAllCache = () => {
  cacheStore.clear();
};
