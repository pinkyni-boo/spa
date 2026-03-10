import API_URL from '../config/api.js';

const BRANCHES_CACHE_KEY = 'spa_public_branches_v1';
const BRANCHES_CACHE_TTL_MS = 10 * 60 * 1000;

let memoryCache = {
    branches: [],
    fetchedAt: 0
};

let inFlightRequest = null;

const isFresh = (fetchedAt) => fetchedAt > 0 && Date.now() - fetchedAt < BRANCHES_CACHE_TTL_MS;

const readStorageCache = () => {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(BRANCHES_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.branches) || typeof parsed?.fetchedAt !== 'number') return null;

        return parsed;
    } catch {
        return null;
    }
};

const writeStorageCache = (branches, fetchedAt) => {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(
            BRANCHES_CACHE_KEY,
            JSON.stringify({ branches, fetchedAt })
        );
    } catch {
        // Ignore storage quota or privacy mode errors.
    }
};

const getCacheSnapshot = () => {
    if (memoryCache.fetchedAt > 0) return memoryCache;

    const storageCache = readStorageCache();
    if (!storageCache) return null;

    memoryCache = storageCache;
    return storageCache;
};

const saveCache = (branches) => {
    const fetchedAt = Date.now();
    memoryCache = { branches, fetchedAt };
    writeStorageCache(branches, fetchedAt);
};

const fetchBranchesFromApi = async () => {
    const response = await fetch(`${API_URL}/api/branches`);
    if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.status}`);
    }

    const data = await response.json();
    if (!data?.success || !Array.isArray(data?.branches)) {
        return [];
    }

    return data.branches;
};

export const getCachedBranches = () => getCacheSnapshot()?.branches || [];

export const hasBranchesCache = () => Boolean(getCacheSnapshot());

export const loadBranches = async ({ force = false } = {}) => {
    const cache = getCacheSnapshot();
    if (!force && cache && isFresh(cache.fetchedAt)) {
        return cache.branches;
    }

    if (inFlightRequest) return inFlightRequest;

    inFlightRequest = fetchBranchesFromApi()
        .then((branches) => {
            saveCache(branches);
            return branches;
        })
        .finally(() => {
            inFlightRequest = null;
        });

    return inFlightRequest;
};

export const prefetchBranches = async () => {
    try {
        return await loadBranches();
    } catch {
        return getCachedBranches();
    }
};
