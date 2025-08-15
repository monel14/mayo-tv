import { Channel } from '../types';
import { CORS_PROXY_URL } from '../config/constants';

export const testChannelStatus = async (channel: Channel): Promise<'working' | 'error'> => {
    try {
        const proxiedStreamUrl = `${CORS_PROXY_URL}${encodeURIComponent(channel.url)}`;
        
        // Test avec une requête HEAD pour vérifier la disponibilité
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

        const response = await fetch(proxiedStreamUrl, {
            method: 'HEAD',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response.ok ? 'working' : 'error';
    } catch (error) {
        console.error('Erreur lors du test de la chaîne:', error);
        return 'error';
    }
};