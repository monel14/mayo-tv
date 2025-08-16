import { useState, useEffect, useCallback, useRef } from 'react';
import { Channel, ChannelsByCountry } from '../types';
import { M3U_URL } from '../config/constants';
import { AdvancedM3uParser } from '../utils/advancedM3uParser';
import { cacheChannels, getCachedChannels, isCacheValid } from '../utils/cache';

interface GroupInfo {
    name: string;
    count: number;
    loaded: boolean;
    loading: boolean;
    error?: string;
}

interface LazyLoadingState {
    isInitialLoading: boolean;
    progress: number;
    stage: 'cache' | 'network' | 'parsing' | 'indexing' | 'complete';
    message: string;
}

export const useLazyChannels = () => {
    const [groupsIndex, setGroupsIndex] = useState<Record<string, GroupInfo>>({});
    const [loadedChannels, setLoadedChannels] = useState<ChannelsByCountry>({});
    const [allChannelsData, setAllChannelsData] = useState<string>(''); // Raw M3U data
    const [loadingState, setLoadingState] = useState<LazyLoadingState>({
        isInitialLoading: true,
        progress: 0,
        stage: 'cache',
        message: 'Vérification du cache...'
    });
    const [error, setError] = useState<string | null>(null);
    
    const loadingQueue = useRef<Set<string>>(new Set());
    const abortControllers = useRef<Map<string, AbortController>>(new Map());

    const updateLoadingState = useCallback((updates: Partial<LazyLoadingState>) => {
        setLoadingState(prev => ({ ...prev, ...updates }));
    }, []);

    // Chargement initial : récupérer seulement l'index des groupes
    const loadGroupsIndex = useCallback(async () => {
        try {
            updateLoadingState({ 
                stage: 'cache', 
                progress: 10, 
                message: 'Vérification du cache...' 
            });

            // Vérifier le cache
            const cachedChannels = getCachedChannels();
            if (cachedChannels && Object.keys(cachedChannels).length > 0) {
                // Créer l'index depuis le cache
                const index: Record<string, GroupInfo> = {};
                Object.entries(cachedChannels).forEach(([groupName, channels]) => {
                    index[groupName] = {
                        name: groupName,
                        count: channels.length,
                        loaded: true,
                        loading: false
                    };
                });
                
                setGroupsIndex(index);
                setLoadedChannels(cachedChannels);
                setLoadingState({
                    isInitialLoading: false,
                    progress: 100,
                    stage: 'complete',
                    message: 'Chargé depuis le cache'
                });
                return;
            }

            // Télécharger les données M3U
            updateLoadingState({ 
                stage: 'network', 
                progress: 30, 
                message: 'Téléchargement de la playlist...' 
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

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

            const m3uData = await response.text();
            setAllChannelsData(m3uData);

            // Parser seulement pour créer l'index
            updateLoadingState({ 
                stage: 'indexing', 
                progress: 80, 
                message: 'Création de l\'index...' 
            });

            const index = createGroupsIndex(m3uData);
            setGroupsIndex(index);

            updateLoadingState({
                isInitialLoading: false,
                progress: 100,
                stage: 'complete',
                message: `${Object.keys(index).length} groupes indexés`
            });

        } catch (err: any) {
            console.error('Erreur lors du chargement de l\'index:', err);
            
            let errorMessage = 'Erreur de chargement';
            if (err.name === 'AbortError') {
                errorMessage = 'Timeout: Le chargement a pris trop de temps';
            } else if (err.message.includes('HTTP')) {
                errorMessage = 'Erreur serveur: Impossible d\'accéder à la playlist';
            } else {
                errorMessage = `Erreur: ${err.message}`;
            }

            setError(errorMessage);
            setLoadingState(prev => ({ 
                ...prev, 
                isInitialLoading: false, 
                message: errorMessage 
            }));
        }
    }, [updateLoadingState]);

    // Créer l'index des groupes sans parser toutes les chaînes
    const createGroupsIndex = useCallback((m3uData: string): Record<string, GroupInfo> => {
        const lines = m3uData.split('\n');
        const groupCounts: Record<string, number> = {};
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('#EXTINF:')) {
                const groupMatch = line.match(/group-title="([^"]*)"/);
                const groupName = groupMatch?.[1] || 'Non classé';
                groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
            }
        }

        const index: Record<string, GroupInfo> = {};
        Object.entries(groupCounts).forEach(([groupName, count]) => {
            index[groupName] = {
                name: groupName,
                count,
                loaded: false,
                loading: false
            };
        });

        return index;
    }, []);

    // Charger les chaînes d'un groupe spécifique
    const loadGroupChannels = useCallback(async (groupName: string): Promise<Channel[]> => {
        // Éviter les chargements multiples
        if (loadingQueue.current.has(groupName)) {
            return loadedChannels[groupName] || [];
        }

        // Si déjà chargé, retourner immédiatement
        if (loadedChannels[groupName]) {
            return loadedChannels[groupName];
        }

        loadingQueue.current.add(groupName);

        // Mettre à jour le statut de chargement
        setGroupsIndex(prev => ({
            ...prev,
            [groupName]: {
                ...prev[groupName],
                loading: true,
                error: undefined
            }
        }));

        try {
            // Annuler le chargement précédent s'il existe
            if (abortControllers.current.has(groupName)) {
                abortControllers.current.get(groupName)?.abort();
            }

            const controller = new AbortController();
            abortControllers.current.set(groupName, controller);

            // Parser seulement les chaînes du groupe demandé
            const channels = await parseGroupChannels(allChannelsData, groupName, controller.signal);

            // Mettre à jour les données
            setLoadedChannels(prev => ({
                ...prev,
                [groupName]: channels
            }));

            setGroupsIndex(prev => ({
                ...prev,
                [groupName]: {
                    ...prev[groupName],
                    loaded: true,
                    loading: false
                }
            }));

            // Mettre en cache si c'est le premier groupe chargé
            if (Object.keys(loadedChannels).length === 0) {
                const fullData = AdvancedM3uParser.parseM3uPlaylist(allChannelsData);
                cacheChannels(fullData);
            }

            return channels;

        } catch (err: any) {
            console.error(`Erreur lors du chargement du groupe ${groupName}:`, err);
            
            setGroupsIndex(prev => ({
                ...prev,
                [groupName]: {
                    ...prev[groupName],
                    loading: false,
                    error: err.message
                }
            }));

            return [];
        } finally {
            loadingQueue.current.delete(groupName);
            abortControllers.current.delete(groupName);
        }
    }, [allChannelsData, loadedChannels]);

    // Parser les chaînes d'un groupe spécifique
    const parseGroupChannels = useCallback(async (
        m3uData: string, 
        targetGroup: string, 
        signal: AbortSignal
    ): Promise<Channel[]> => {
        return new Promise((resolve, reject) => {
            const checkAbort = () => {
                if (signal.aborted) {
                    reject(new Error('Chargement annulé'));
                    return true;
                }
                return false;
            };

            setTimeout(() => {
                if (checkAbort()) return;

                try {
                    const lines = m3uData.split('\n');
                    const channels: Channel[] = [];
                    let currentChannel: Partial<Channel> = {};
                    let isTargetGroup = false;

                    for (let i = 0; i < lines.length; i++) {
                        if (checkAbort()) return;

                        const line = lines[i];

                        if (line.startsWith('#EXTINF:')) {
                            const groupMatch = line.match(/group-title="([^"]*)"/);
                            const groupName = groupMatch?.[1] || 'Non classé';
                            isTargetGroup = groupName === targetGroup;

                            if (isTargetGroup) {
                                // Parser complètement cette chaîne
                                const commaIndex = line.lastIndexOf(',');
                                const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Chaîne inconnue';
                                
                                const logoMatch = line.match(/tvg-logo="([^"]*)"/);
                                const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
                                const tvgLanguageMatch = line.match(/tvg-language="([^"]*)"/);
                                const tvgCountryMatch = line.match(/tvg-country="([^"]*)"/);

                                currentChannel = {
                                    name: name || 'Chaîne inconnue',
                                    group: groupName,
                                    logo: logoMatch?.[1] || '',
                                    tvgId: tvgIdMatch?.[1],
                                    tvgLanguage: tvgLanguageMatch?.[1],
                                    tvgCountry: tvgCountryMatch?.[1],
                                    // Enrichissement automatique
                                    category: detectCategory(name, groupName),
                                    quality: detectQuality(name),
                                    type: detectType(name, groupName),
                                    country: normalizeCountry(tvgCountryMatch?.[1], groupName),
                                    language: normalizeLanguage(tvgLanguageMatch?.[1])
                                };
                            }
                        } else if (line.trim() && !line.startsWith('#') && isTargetGroup) {
                            currentChannel.url = line.trim();
                            
                            if (currentChannel.name && currentChannel.url) {
                                channels.push(currentChannel as Channel);
                                currentChannel = {};
                            }
                        }
                    }

                    resolve(channels.sort((a, b) => a.name.localeCompare(b.name)));
                } catch (error) {
                    reject(error);
                }
            }, 0); // Permettre à l'UI de se mettre à jour
        });
    }, []);

    // Fonctions d'enrichissement simplifiées
    const detectCategory = (name: string, group: string): string => {
        const searchText = `${name} ${group}`.toLowerCase();
        if (/sport|football|soccer/.test(searchText)) return 'sport';
        if (/news|info|actualit/.test(searchText)) return 'news';
        if (/music|mtv|radio/.test(searchText)) return 'music';
        if (/cine|movie|film/.test(searchText)) return 'movies';
        if (/kids|enfant|cartoon/.test(searchText)) return 'kids';
        return 'general';
    };

    const detectQuality = (name: string): Channel['quality'] => {
        const searchText = name.toLowerCase();
        if (/4k|uhd|2160p/.test(searchText)) return '4K';
        if (/fhd|1080p|full.*hd/.test(searchText)) return 'FHD';
        if (/hd|720p/.test(searchText)) return 'HD';
        if (/sd|480p|576p/.test(searchText)) return 'SD';
        return 'Unknown';
    };

    const detectType = (name: string, group: string): Channel['type'] => {
        const searchText = `${name} ${group}`.toLowerCase();
        if (/radio|fm|am/.test(searchText)) return 'Radio';
        return 'TV';
    };

    const normalizeCountry = (country?: string, group?: string): string => {
        if (country) return country;
        if (!group) return 'Unknown';
        
        const countryMap: Record<string, string> = {
            'fr': 'France', 'france': 'France',
            'us': 'United States', 'usa': 'United States',
            'uk': 'United Kingdom', 'gb': 'United Kingdom',
            'de': 'Germany', 'deutschland': 'Germany',
            'es': 'Spain', 'spain': 'Spain',
            'it': 'Italy', 'italia': 'Italy'
        };

        return countryMap[group.toLowerCase()] || group;
    };

    const normalizeLanguage = (language?: string): string => {
        if (language) return language;
        return 'Unknown';
    };

    // Précharger les groupes populaires
    const preloadPopularGroups = useCallback(async (groupNames: string[]) => {
        const promises = groupNames
            .filter(name => groupsIndex[name] && !groupsIndex[name].loaded)
            .slice(0, 3) // Limiter à 3 groupes
            .map(name => loadGroupChannels(name));
        
        await Promise.allSettled(promises);
    }, [groupsIndex, loadGroupChannels]);

    // Nettoyer les contrôleurs d'annulation
    useEffect(() => {
        return () => {
            abortControllers.current.forEach(controller => controller.abort());
            abortControllers.current.clear();
        };
    }, []);

    // Chargement initial
    useEffect(() => {
        loadGroupsIndex();
    }, [loadGroupsIndex]);

    return {
        groupsIndex,
        loadedChannels,
        loadingState,
        error,
        loadGroupChannels,
        preloadPopularGroups,
        isGroupLoaded: (groupName: string) => !!loadedChannels[groupName],
        isGroupLoading: (groupName: string) => groupsIndex[groupName]?.loading || false,
        getGroupError: (groupName: string) => groupsIndex[groupName]?.error
    };
};