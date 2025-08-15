import { useState, useEffect } from 'react';
import { ChannelsByCountry } from '../types';
import { M3U_URL } from '../config/constants';
import { parseM3uPlaylist } from '../utils/m3uParser';

export const useChannels = () => {
    const [channelsByCountry, setChannelsByCountry] = useState<ChannelsByCountry>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchM3uPlaylist = async () => {
            try {
                const response = await fetch(M3U_URL);
                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
                const data = await response.text();
                const parsedData = parseM3uPlaylist(data);
                setChannelsByCountry(parsedData);
            } catch (err: any) {
                console.error('Impossible de charger la playlist M3U:', err);
                setError('Impossible de charger la playlist. Vérifiez l\'URL et votre connexion.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchM3uPlaylist();
    }, []);

    return { channelsByCountry, setChannelsByCountry, isLoading, error };
};