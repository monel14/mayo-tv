import { useState, useEffect, useCallback } from 'react';
import { ChannelsByCountry, Channel } from '../types';
import { M3U_URL } from '../config/constants';
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

                // Étape 2: Téléchargement réseau avec timeout optimisé
                updateLoadingState({ 
                    stage: 'network', 
                    progress: 30, 
                    message: 'Téléchargement de la playlist...' 
                });

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

                const response = await fetch(M3U_URL, {
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
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
                const response = await fetch(M3U_URL + '&t=' + Date.now());
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