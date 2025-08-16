import React, { FC } from 'react';
import { ChevronLeftIcon } from '../icons';
import { ThemeToggle } from './ThemeToggle';

interface ModernHeaderProps {
    title: string;
    onBack?: () => void;
    showBack: boolean;
    onTestAll?: () => void;
    showTestAll?: boolean;
    preloadProgress?: number;
    channelCount?: number;
    children?: React.ReactNode;
}

export const ModernHeader: FC<ModernHeaderProps> = ({ 
    title, 
    onBack, 
    showBack, 
    onTestAll, 
    showTestAll, 
    preloadProgress,
    channelCount,
    children
}) => (
    <header className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 dark:from-red-700 dark:via-red-800 dark:to-red-900 text-white shadow-2xl">
        <div className="px-4 py-4">
            <div className="flex items-center justify-between">
                {/* Section gauche */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {showBack && (
                        <button 
                            onClick={onBack} 
                            aria-label="Retour" 
                            className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 transform hover:scale-110"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold truncate">
                            {title}
                        </h1>
                        {channelCount && (
                            <p className="text-xs text-white/80 mt-0.5">
                                {channelCount} chaîne{channelCount > 1 ? 's' : ''} disponible{channelCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                {/* Section droite */}
                <div className="flex items-center gap-2">
                    {/* Indicateur de préchargement */}
                    {preloadProgress !== undefined && preloadProgress < 100 && (
                        <div className="hidden sm:flex items-center gap-2 text-xs text-white/90 bg-white/10 px-3 py-1.5 rounded-full">
                            <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            <span>Images {Math.round(preloadProgress)}%</span>
                        </div>
                    )}

                    {/* Bouton tester tout */}
                    {showTestAll && (
                        <button
                            onClick={onTestAll}
                            className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            <span className="hidden sm:inline">🧪 Tester tout</span>
                            <span className="sm:hidden">🧪</span>
                        </button>
                    )}

                    {/* Composants additionnels */}
                    {children}

                    {/* Toggle thème */}
                    <ThemeToggle />
                </div>
            </div>
        </div>

        {/* Barre de progression pour le préchargement mobile */}
        {preloadProgress !== undefined && preloadProgress < 100 && (
            <div className="sm:hidden px-4 pb-2">
                <div className="flex items-center gap-2 text-xs text-white/80">
                    <span>Chargement images...</span>
                    <div className="flex-1 bg-white/20 rounded-full h-1">
                        <div 
                            className="bg-white h-1 rounded-full transition-all duration-300"
                            style={{ width: `${preloadProgress}%` }}
                        />
                    </div>
                    <span>{Math.round(preloadProgress)}%</span>
                </div>
            </div>
        )}
    </header>
);