import React, { FC } from 'react';

interface LoadingState {
    isLoading: boolean;
    progress: number;
    stage: 'cache' | 'network' | 'parsing' | 'complete';
    message: string;
}

interface OptimizedLoaderProps {
    loadingState: LoadingState;
    onRefresh?: () => void;
    isCacheValid?: boolean;
}

export const OptimizedLoader: FC<OptimizedLoaderProps> = ({ 
    loadingState, 
    onRefresh, 
    isCacheValid 
}) => {
    const getStageIcon = () => {
        switch (loadingState.stage) {
            case 'cache':
                return '💾';
            case 'network':
                return '🌐';
            case 'parsing':
                return '⚙️';
            case 'complete':
                return '✅';
            default:
                return '⏳';
        }
    };

    const getProgressColor = () => {
        if (loadingState.progress < 30) return 'bg-blue-500';
        if (loadingState.progress < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            <div className="text-center max-w-md mx-auto p-6">
                {/* Icône de stage */}
                <div className="text-6xl mb-4 animate-pulse">
                    {getStageIcon()}
                </div>

                {/* Titre */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">MAYO TV</h2>
                
                {/* Message de statut */}
                <p className="text-gray-600 mb-4">{loadingState.message}</p>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                        className={`h-full ${getProgressColor()} transition-all duration-300 ease-out rounded-full`}
                        style={{ width: `${loadingState.progress}%` }}
                    />
                </div>

                {/* Pourcentage */}
                <div className="text-sm text-gray-500 mb-4">
                    {loadingState.progress}% - {loadingState.stage.toUpperCase()}
                </div>

                {/* Informations cache */}
                {isCacheValid && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded mb-4">
                        💾 Cache disponible - Chargement rapide
                    </div>
                )}

                {/* Bouton d'actualisation (si erreur) */}
                {onRefresh && !loadingState.isLoading && (
                    <button
                        onClick={onRefresh}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        🔄 Réessayer
                    </button>
                )}

                {/* Conseils de performance */}
                {loadingState.stage === 'network' && (
                    <div className="text-xs text-gray-400 mt-4 space-y-1">
                        <p>💡 Première fois ? Le chargement peut prendre quelques secondes</p>
                        <p>⚡ Les prochains chargements seront plus rapides grâce au cache</p>
                    </div>
                )}
            </div>
        </div>
    );
};