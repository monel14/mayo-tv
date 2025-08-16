import { ChannelsByCountry } from '../types';

const CACHE_KEY = 'mayo-tv-channels';
const CACHE_EXPIRY_KEY = 'mayo-tv-channels-expiry';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const cacheChannels = (channels: ChannelsByCountry) => {
    try {
        const cacheData = {
            data: channels,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
        console.warn('Impossible de mettre en cache les chaînes:', error);
    }
};

export const getCachedChannels = (): ChannelsByCountry | null => {
    try {
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (!expiry || Date.now() > parseInt(expiry)) {
            // Cache expiré
            clearCache();
            return null;
        }

        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const cacheData = JSON.parse(cached);
        return cacheData.data;
    } catch (error) {
        console.warn('Erreur lors de la lecture du cache:', error);
        clearCache();
        return null;
    }
};

export const clearCache = () => {
    try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
    } catch (error) {
        console.warn('Erreur lors du nettoyage du cache:', error);
    }
};

export const isCacheValid = (): boolean => {
    try {
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        return expiry ? Date.now() < parseInt(expiry) : false;
    } catch {
        return false;
    }
};