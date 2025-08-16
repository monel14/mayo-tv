import { useState, useEffect } from 'react';
import { Channel } from '../types';

export const useImagePreloader = (channels: Channel[], enabled: boolean = true) => {
    const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
    const [preloadProgress, setPreloadProgress] = useState(0);

    useEffect(() => {
        if (!enabled || channels.length === 0) return;

        const preloadImages = async () => {
            const imageUrls = channels
                .map(channel => channel.logo)
                .filter(logo => logo && logo.trim() !== '')
                .slice(0, 50); // Limiter à 50 images pour éviter la surcharge

            if (imageUrls.length === 0) return;

            let loadedCount = 0;
            const loaded = new Set<string>();

            const preloadPromises = imageUrls.map(url => {
                return new Promise<void>((resolve) => {
                    const img = new Image();
                    
                    const onLoad = () => {
                        loaded.add(url);
                        loadedCount++;
                        setPreloadProgress((loadedCount / imageUrls.length) * 100);
                        resolve();
                    };

                    const onError = () => {
                        loadedCount++;
                        setPreloadProgress((loadedCount / imageUrls.length) * 100);
                        resolve(); // Résoudre même en cas d'erreur
                    };

                    img.onload = onLoad;
                    img.onerror = onError;
                    
                    // Timeout pour éviter les blocages
                    setTimeout(() => {
                        if (!loaded.has(url)) {
                            onError();
                        }
                    }, 5000);

                    img.src = url;
                });
            });

            await Promise.all(preloadPromises);
            setPreloadedImages(loaded);
        };

        // Délai pour ne pas bloquer le rendu initial
        const timeoutId = setTimeout(preloadImages, 1000);
        return () => clearTimeout(timeoutId);
    }, [channels, enabled]);

    return { preloadedImages, preloadProgress };
};