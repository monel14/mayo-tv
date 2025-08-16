import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPrompt {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
    isInstallable: boolean;
    isInstalled: boolean;
    isOffline: boolean;
    swRegistration: ServiceWorkerRegistration | null;
}

export const usePWA = () => {
    const [pwaState, setPwaState] = useState<PWAState>({
        isInstallable: false,
        isInstalled: false,
        isOffline: !navigator.onLine,
        swRegistration: null
    });
    
    const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);

    // Enregistrer le Service Worker
    const registerServiceWorker = useCallback(async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                
                setPwaState(prev => ({
                    ...prev,
                    swRegistration: registration
                }));

                console.log('[PWA] Service Worker enregistré:', registration);

                // Écouter les mises à jour
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Nouvelle version disponible
                                console.log('[PWA] Nouvelle version disponible');
                            }
                        });
                    }
                });

                return registration;
            } catch (error) {
                console.error('[PWA] Erreur enregistrement Service Worker:', error);
                return null;
            }
        }
        return null;
    }, []);

    // Installer l'application
    const installApp = useCallback(async () => {
        if (installPrompt) {
            try {
                await installPrompt.prompt();
                const choiceResult = await installPrompt.userChoice;
                
                if (choiceResult.outcome === 'accepted') {
                    console.log('[PWA] Installation acceptée');
                    setPwaState(prev => ({
                        ...prev,
                        isInstalled: true,
                        isInstallable: false
                    }));
                } else {
                    console.log('[PWA] Installation refusée');
                }
                
                setInstallPrompt(null);
            } catch (error) {
                console.error('[PWA] Erreur installation:', error);
            }
        }
    }, [installPrompt]);

    // Vérifier si l'app est déjà installée
    const checkIfInstalled = useCallback(() => {
        // Vérifier si lancé en mode standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = (window.navigator as any).standalone === true;
        
        return isStandalone || isIOSStandalone;
    }, []);

    // Mettre à jour le Service Worker
    const updateServiceWorker = useCallback(async () => {
        if (pwaState.swRegistration) {
            try {
                await pwaState.swRegistration.update();
                console.log('[PWA] Service Worker mis à jour');
            } catch (error) {
                console.error('[PWA] Erreur mise à jour Service Worker:', error);
            }
        }
    }, [pwaState.swRegistration]);

    // Vider le cache
    const clearCache = useCallback(async () => {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('[PWA] Cache vidé');
                return true;
            } catch (error) {
                console.error('[PWA] Erreur vidage cache:', error);
                return false;
            }
        }
        return false;
    }, []);

    // Obtenir la taille du cache
    const getCacheSize = useCallback(async () => {
        if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    used: estimate.usage || 0,
                    available: estimate.quota || 0,
                    percentage: estimate.usage && estimate.quota 
                        ? Math.round((estimate.usage / estimate.quota) * 100) 
                        : 0
                };
            } catch (error) {
                console.error('[PWA] Erreur estimation stockage:', error);
                return null;
            }
        }
        return null;
    }, []);

    useEffect(() => {
        // Vérifier si déjà installé
        setPwaState(prev => ({
            ...prev,
            isInstalled: checkIfInstalled()
        }));

        // Écouter l'événement d'installation
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as any);
            setPwaState(prev => ({
                ...prev,
                isInstallable: true
            }));
        };

        // Écouter les changements de connexion
        const handleOnline = () => {
            setPwaState(prev => ({ ...prev, isOffline: false }));
        };

        const handleOffline = () => {
            setPwaState(prev => ({ ...prev, isOffline: true }));
        };

        // Écouter l'installation réussie
        const handleAppInstalled = () => {
            console.log('[PWA] Application installée');
            setPwaState(prev => ({
                ...prev,
                isInstalled: true,
                isInstallable: false
            }));
            setInstallPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Enregistrer le Service Worker
        registerServiceWorker();

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [registerServiceWorker, checkIfInstalled]);

    return {
        ...pwaState,
        installApp,
        updateServiceWorker,
        clearCache,
        getCacheSize
    };
};