import React, { FC, useState, useEffect } from 'react';
import { Channel } from '../../types';
import { EmptyStateIcon } from '../icons';
import { StatusIndicator } from './StatusIndicator';
import { ImageWithFallback } from './ImageWithFallback';

interface AnimatedGridProps {
    channels: Channel[];
    onSelect: (url: string) => void;
    onCheckStatus: (channel: Channel) => void;
    onShowMetadata?: (channel: Channel) => void;
    searchTerm?: string;
}

export const AnimatedGrid: FC<AnimatedGridProps> = ({ 
    channels, 
    onSelect, 
    onCheckStatus, 
    onShowMetadata,
    searchTerm 
}) => {
    const [visibleChannels, setVisibleChannels] = useState<Channel[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (channels.length === 0) {
            setVisibleChannels([]);
            return;
        }

        setIsAnimating(true);
        
        // Animation échelonnée
        const timer = setTimeout(() => {
            setVisibleChannels(channels);
            setIsAnimating(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [channels]);

    const getChannelDelay = (index: number) => {
        return `${index * 50}ms`;
    };

    if (channels.length === 0) {
        return (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 mt-12 animate-fade-in">
                <EmptyStateIcon className="mx-auto text-gray-400 dark:text-gray-500" />
                <p className="mt-4 text-lg">
                    {searchTerm ? 'Aucune chaîne trouvée.' : 'Aucune chaîne disponible.'}
                </p>
                <p className="text-sm">
                    {searchTerm ? 'Essayez de modifier votre recherche.' : 'Sélectionnez un autre pays.'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {visibleChannels.map((channel, index) => (
                <div
                    key={`${channel.url}-${index}`}
                    className="channel-card group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-red-500 dark:hover:border-red-400 animate-fade-in"
                    style={{ 
                        animationDelay: getChannelDelay(index),
                        opacity: isAnimating ? 0 : 1 
                    }}
                    title={channel.name}
                >
                    {/* Badge de statut */}
                    <StatusIndicator status={channel.status} />
                    
                    {/* Logo avec effet hover */}
                    <div
                        className="w-full h-16 sm:h-20 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                        onClick={() => onSelect(channel.url)}
                    >
                        <ImageWithFallback src={channel.logo} alt={channel.name} />
                    </div>
                    
                    {/* Nom de la chaîne */}
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 h-8 flex items-center justify-center w-full break-words mb-2 line-clamp-2">
                        {channel.name}
                    </h3>
                    
                    {/* Bouton de test avec animation */}
                    <div className="flex gap-1 w-full">
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
    );
};