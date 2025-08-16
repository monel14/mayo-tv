import React, { FC, useEffect, useState } from 'react';
import { Channel } from '../../types';
import { ChannelCardSkeleton } from './SkeletonLoader';

interface LazyGroupLoaderProps {
    groupName: string;
    isLoading: boolean;
    error?: string;
    channels: Channel[];
    onLoad: (groupName: string) => Promise<Channel[]>;
    onSelect: (url: string) => void;
    onCheckStatus: (channel: Channel) => void;
    onShowMetadata?: (channel: Channel) => void;
    searchTerm?: string;
}

export const LazyGroupLoader: FC<LazyGroupLoaderProps> = ({
    groupName,
    isLoading,
    error,
    channels,
    onLoad,
    onSelect,
    onCheckStatus,
    onShowMetadata,
    searchTerm
}) => {
    const [hasTriggeredLoad, setHasTriggeredLoad] = useState(false);

    // Déclencher le chargement automatiquement
    useEffect(() => {
        if (!hasTriggeredLoad && channels.length === 0 && !isLoading && !error) {
            setHasTriggeredLoad(true);
            onLoad(groupName);
        }
    }, [groupName, channels.length, isLoading, error, hasTriggeredLoad, onLoad]);

    // Filtrer les chaînes selon la recherche
    const filteredChannels = React.useMemo(() => {
        if (!searchTerm) return channels;
        return channels.filter(channel =>
            channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            channel.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            channel.country?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [channels, searchTerm]);

    // État de chargement
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">
                            Chargement de {groupName}...
                        </span>
                    </div>
                </div>
                
                {/* Skeleton des chaînes */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                    {[...Array(12)].map((_, index) => (
                        <ChannelCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Erreur de chargement
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Impossible de charger les chaînes de {groupName}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    {error}
                </p>
                <button
                    onClick={() => {
                        setHasTriggeredLoad(false);
                        onLoad(groupName);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    // Aucune chaîne trouvée
    if (filteredChannels.length === 0 && channels.length > 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Aucune chaîne trouvée
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Aucune chaîne ne correspond à "{searchTerm}" dans {groupName}
                </p>
            </div>
        );
    }

    // Groupe vide
    if (channels.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Groupe vide
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Aucune chaîne disponible dans {groupName}
                </p>
            </div>
        );
    }

    // Affichage des chaînes
    return (
        <div className="space-y-4">
            {/* Indicateur de chargement réussi */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                    {filteredChannels.length} chaîne{filteredChannels.length > 1 ? 's' : ''} 
                    {searchTerm && ` (filtrées sur "${searchTerm}")`}
                </span>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Chargé</span>
                </div>
            </div>

            {/* Grille des chaînes */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                {filteredChannels.map((channel, index) => (
                    <div
                        key={`${channel.url}-${index}`}
                        className="channel-card group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-red-500 dark:hover:border-red-400 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                        title={channel.name}
                    >
                        {/* Badge de statut */}
                        {channel.status && (
                            <div className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                                channel.status === 'working' ? 'bg-green-500' :
                                channel.status === 'error' ? 'bg-red-500' :
                                channel.status === 'checking' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}>
                                {channel.status === 'working' ? '✓' :
                                 channel.status === 'error' ? '✗' :
                                 channel.status === 'checking' ? '⟳' : '?'}
                            </div>
                        )}
                        
                        {/* Logo */}
                        <div
                            className="w-full h-16 sm:h-20 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                            onClick={() => onSelect(channel.url)}
                        >
                            {channel.logo ? (
                                <img
                                    src={channel.logo}
                                    alt={channel.name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center rounded-md bg-blue-500 ${channel.logo ? 'hidden' : ''}`}>
                                <span className="text-white font-bold text-2xl">
                                    {channel.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        {/* Nom de la chaîne */}
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 h-8 flex items-center justify-center w-full break-words mb-2 line-clamp-2">
                            {channel.name}
                        </h3>
                        
                        {/* Boutons */}
                        <div className="flex gap-1 w-full mt-auto">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCheckStatus(channel);
                                }}
                                className="flex-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-1.5 rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                disabled={channel.status === 'checking'}
                            >
                                {channel.status === 'checking' ? (
                                    <span className="flex items-center justify-center gap-1">
                                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="hidden sm:inline">Test...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-1">
                                        🔍 <span className="hidden sm:inline">Tester</span>
                                    </span>
                                )}
                            </button>
                            
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShowMetadata?.(channel);
                                }}
                                className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1.5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
                                title="Voir les détails"
                            >
                                ℹ️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};