import React, { FC, useState } from 'react';
import { usePWA } from '../../hooks/usePWA';

export const PWAInstallPrompt: FC = () => {
    const { isInstallable, isInstalled, isOffline, installApp } = usePWA();
    const [isVisible, setIsVisible] = useState(true);

    if (!isInstallable || isInstalled || !isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">📺</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Installer MAYO TV
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Accès rapide depuis votre écran d'accueil
                        </p>
                        
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={installApp}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                            >
                                Installer
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                Plus tard
                            </button>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PWAStatusIndicator: FC = () => {
    const { isInstalled, isOffline } = usePWA();

    if (!isInstalled && !isOffline) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {isInstalled && (
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">App installée</span>
                </div>
            )}
            
            {isOffline && (
                <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="hidden sm:inline">Mode hors ligne</span>
                </div>
            )}
        </div>
    );
};