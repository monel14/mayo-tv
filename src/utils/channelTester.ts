import { Channel } from '../types';
import { CorsProxyManager } from './corsProxy';

export const testChannelStatus = async (channel: Channel): Promise<'working' | 'error'> => {
    try {
        const { url: proxiedStreamUrl, proxyIndex } = CorsProxyManager.getProxiedUrl(channel.url);
        
        // Test avec une requête HEAD pour vérifier la disponibilité
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

        const response = await fetch(proxiedStreamUrl, {
            method: 'HEAD',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
            // Mark proxy as failed if we get a bad response
            CorsProxyManager.markProxyAsFailed(proxyIndex);
            return 'error';
        }
        
        return 'working';
    } catch (error) {
        console.error('Erreur lors du test de la chaîne:', error);
        return 'error';
    }
};