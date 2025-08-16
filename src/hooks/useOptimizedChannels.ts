import { useState, useEffect, useCallback } from 'react';
import { ChannelsByCountry, Channel } from '../types';
import { rawM3uUrl } from '../config/constants';
import { CorsProxyManager } from '../utils/corsProxy';
import { AdvancedM3uParser } from '../utils/advancedM3uParser';
import { cacheChannels, getCachedChannels, isCacheValid } from '../utils/cache';

interface LoadingState {
    isLoading: boolean;
    progress: number;
    stage: 'cache' | 'network' | 'parsing' | 'complete';
    message: string;
}

export const useOptimizedChannels = () => {
    const [channelsByCountry, setChannelsByCountry] = useState<ChannelsByCountry>({});
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        progress: 0,
        stage: 'cache',
        message: 'Vérification du cache...'
    });
    const [error, setError] = useState<string | null>(null);

    const updateLoadingState = useCallback((updates: Partial<LoadingState>) => {
        setLoadingState(prev => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        const loadChannels = async () => {
            try {
                // Étape 1: Vérifier le cache
                updateLoadingState({ 
                    stage: 'cache', 
                    progress: 10, 
                    message: 'Vérification du cache...' 
                });

                const cachedChannels = getCachedChannels();
                if (cachedChannels && Object.keys(cachedChannels).length > 0) {
                    setChannelsByCountry(cachedChannels);
                    updateLoadingState({ 
                        stage: 'complete', 
                        progress: 100, 
                        message: 'Chargé depuis le cache',
                        isLoading: false 
                    });
                    return;
                }

                // Étape 2: Téléchargement réseau avec fallback CORS proxy
                updateLoadingState({ 
                    stage: 'network', 
                    progress: 30, 
                    message: 'Téléchargement de la playlist...' 
                });

                let response: Response | null = null;
                let lastError: Error | null = null;
                let proxyIndex = 0;

                // Essayer avec différents proxies CORS
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        const { url: proxiedUrl, proxyIndex: currentProxyIndex } = CorsProxyManager.getProxiedUrl(rawM3uUrl);
                        proxyIndex = currentProxyIndex;
                        
                        updateLoadingState({ 
                            message: `Téléchargement via proxy ${proxyIndex + 1}...` 
                        });

                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

                        response = await fetch(proxiedUrl, {
                            signal: controller.signal,
                            headers: {
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache'
                            }
                        });

                        clearTimeout(timeoutId);

                        if (response.ok) {
                            break; // Success, exit retry loop
                        } else {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }
                    } catch (err: any) {
                        lastError = err;
                        console.warn(`Proxy ${proxyIndex} failed:`, err.message);
                        CorsProxyManager.markProxyAsFailed(proxyIndex);
                        
                        if (attempt < 2) {
                            updateLoadingState({ 
                                message: `Proxy ${proxyIndex + 1} échoué, essai suivant...` 
                            });
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                        }
                    }
                }

                if (!response || !response.ok) {
                    throw lastError || new Error('Tous les proxies CORS ont échoué');
                }

                updateLoadingState({ 
                    progress: 60, 
                    message: 'Réception des données...' 
                });

                // Étape 3: Lecture progressive du stream
                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('Impossible de lire la réponse');
                }

                let receivedData = '';
                let totalSize = 0;
                const contentLength = response.headers.get('content-length');
                const expectedSize = contentLength ? parseInt(contentLength) : 0;

                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) break;
                    
                    receivedData += new TextDecoder().decode(value);
                    totalSize += value.length;
                    
                    if (expectedSize > 0) {
                        const progress = Math.min(60 + (totalSize / expectedSize) * 20, 80);
                        updateLoadingState({ 
                            progress, 
                            message: `Téléchargement... ${Math.round(totalSize / 1024)}KB` 
                        });
                    }
                }

                // Étape 4: Parsing optimisé
                updateLoadingState({ 
                    stage: 'parsing', 
                    progress: 85, 
                    message: 'Analyse de la playlist...' 
                });

                const parsedData = AdvancedM3uParser.parseM3uPlaylist(receivedData);
                
                // Extraire tous les canaux pour les statistiques
                const allChannelsArray = Object.values(parsedData).flat();
                setAllChannels(allChannelsArray);
                
                // Étape 5: Mise en cache et finalisation
                updateLoadingState({ 
                    progress: 95, 
                    message: 'Finalisation...' 
                });

                cacheChannels(parsedData);
                setChannelsByCountry(parsedData);

                updateLoadingState({ 
                    stage: 'complete', 
                    progress: 100, 
                    message: `${Object.keys(parsedData).length} pays chargés`,
                    isLoading: false 
                });

            } catch (err: any) {
                console.error('Erreur lors du chargement:', err);
                
                let errorMessage = 'Erreur de chargement';
                if (err.name === 'AbortError') {
                    errorMessage = 'Timeout: Le chargement a pris trop de temps';
                } else if (err.message.includes('HTTP')) {
                    errorMessage = 'Erreur serveur: Impossible d\'accéder à la playlist';
                } else if (err.message.includes('réseau')) {
                    errorMessage = 'Erreur réseau: Vérifiez votre connexion';
                } else {
                    errorMessage = `Erreur: ${err.message}`;
                }

                setError(errorMessage);
                updateLoadingState({ 
                    isLoading: false, 
                    message: errorMessage 
                });
            }
        };

        loadChannels();
    }, [updateLoadingState]);

    const refreshChannels = useCallback(async () => {
        setError(null);
        updateLoadingState({ 
            isLoading: true, 
            progress: 0, 
            stage: 'network', 
            message: 'Actualisation...' 
        });
        
        // Force le rechargement en ignorant le cache
        const loadChannels = async () => {
            try {
                const { url: proxiedUrl } = CorsProxyManager.getProxiedUrl(rawM3uUrl + '?t=' + Date.now());
                const response = await fetch(proxiedUrl);
                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
                
                const data = await response.text();
                const parsedData = AdvancedM3uParser.parseM3uPlaylist(data);
                const allChannelsArray = Object.values(parsedData).flat();
                setAllChannels(allChannelsArray);
                
                cacheChannels(parsedData);
                setChannelsByCountry(parsedData);
                
                updateLoadingState({ 
                    stage: 'complete', 
                    progress: 100, 
                    message: 'Actualisé avec succès',
                    isLoading: false 
                });
            } catch (err: any) {
                setError('Erreur lors de l\'actualisation');
                updateLoadingState({ isLoading: false });
            }
        };
        
        await loadChannels();
    }, [updateLoadingState]);

    return { 
        channelsByCountry, 
        setChannelsByCountry, 
        allChannels,
        loadingState, 
        error, 
        refreshChannels,
        isCacheValid: isCacheValid()
    };
};