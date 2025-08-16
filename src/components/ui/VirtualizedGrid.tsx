import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import { Channel } from '../../types';
import { StatusIndicator } from './StatusIndicator';
import { ImageWithFallback } from './ImageWithFallback';

interface VirtualizedGridProps {
    channels: Channel[];
    onSelect: (url: string) => void;
    onCheckStatus: (channel: Channel) => void;
    onShowMetadata?: (channel: Channel) => void;
    searchTerm?: string;
    itemHeight?: number;
    containerHeight?: number;
}

interface VirtualItem {
    index: number;
    channel: Channel;
    style: React.CSSProperties;
}

export const VirtualizedGrid: FC<VirtualizedGridProps> = ({
    channels,
    onSelect,
    onCheckStatus,
    onShowMetadata,
    searchTerm,
    itemHeight = 200,
    containerHeight = 600
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculer le nombre de colonnes basé sur la largeur du conteneur
    const columnsCount = useMemo(() => {
        if (containerWidth < 640) return 2;      // mobile
        if (containerWidth < 768) return 3;      // sm
        if (containerWidth < 1024) return 4;     // md
        if (containerWidth < 1280) return 5;     // lg
        if (containerWidth < 1536) return 6;     // xl
        return 8;                                // 2xl+
    }, [containerWidth]);

    // Calculer les dimensions
    const itemWidth = containerWidth / columnsCount;
    const rowsCount = Math.ceil(channels.length / columnsCount);
    const totalHeight = rowsCount * itemHeight;

    // Calculer les éléments visibles
    const visibleItems = useMemo(() => {
        const startRow = Math.floor(scrollTop / itemHeight);
        const endRow = Math.min(
            rowsCount - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight)
        );

        const items: VirtualItem[] = [];

        for (let row = startRow; row <= endRow; row++) {
            for (let col = 0; col < columnsCount; col++) {
                const index = row * columnsCount + col;
                if (index >= channels.length) break;

                const channel = channels[index];
                const style: React.CSSProperties = {
                    position: 'absolute',
                    top: row * itemHeight,
                    left: col * itemWidth,
                    width: itemWidth - 12, // gap
                    height: itemHeight - 12, // gap
                    padding: '12px'
                };

                items.push({ index, channel, style });
            }
        }

        return items;
    }, [channels, scrollTop, containerHeight, itemHeight, columnsCount, itemWidth, rowsCount]);

    // Observer les changements de taille
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Gérer le scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    if (channels.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg">
                    {searchTerm ? 'Aucune chaîne trouvée.' : 'Aucune chaîne disponible.'}
                </p>
                <p className="text-sm">
                    {searchTerm ? 'Essayez de modifier votre recherche.' : 'Sélectionnez un autre groupe.'}
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Indicateur de virtualisation */}
            {channels.length > 50 && (
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Mode haute performance activé ({channels.length} chaînes)
                </div>
            )}

            <div
                ref={containerRef}
                className="overflow-auto custom-scrollbar"
                style={{ height: containerHeight }}
                onScroll={handleScroll}
            >
                <div style={{ height: totalHeight, position: 'relative' }}>
                    {visibleItems.map(({ index, channel, style }) => (
                        <div
                            key={`${channel.url}-${index}`}
                            style={style}
                            className="channel-card group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-red-500 dark:hover:border-red-400"
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

            {/* Indicateur de scroll */}
            {totalHeight > containerHeight && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Ligne {Math.floor(scrollTop / itemHeight) + 1} sur {rowsCount}
                </div>
            )}
        </div>
    );
};