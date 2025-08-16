import React, { FC } from 'react';
import { Channel } from '../../types';

interface ChannelMetadataProps {
    channel: Channel;
    isVisible: boolean;
    onClose: () => void;
}

export const ChannelMetadata: FC<ChannelMetadataProps> = ({ channel, isVisible, onClose }) => {
    if (!isVisible) return null;

    const getQualityColor = (quality?: string) => {
        switch (quality) {
            case '4K': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
            case 'FHD': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
            case 'HD': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'SD': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
        }
    };

    const getTypeIcon = (type?: string) => {
        switch (type) {
            case 'TV': return '📺';
            case 'Radio': return '📻';
            case 'Movie': return '🎬';
            case 'Series': return '📺';
            case 'Sport': return '⚽';
            case 'News': return '📰';
            case 'Music': return '🎵';
            case 'Kids': return '🧸';
            case 'Adult': return '🔞';
            default: return '📺';
        }
    };

    const getCategoryIcon = (category?: string) => {
        switch (category) {
            case 'sport': return '⚽';
            case 'news': return '📰';
            case 'music': return '🎵';
            case 'movies': return '🎬';
            case 'kids': return '🧸';
            case 'documentary': return '🎓';
            case 'entertainment': return '🎭';
            case 'religious': return '⛪';
            case 'shopping': return '🛒';
            default: return '📂';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                {/* En-tête */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                                {channel.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Informations détaillées
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-4">
                    {/* Badges principaux */}
                    <div className="flex flex-wrap gap-2">
                        {channel.type && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {getTypeIcon(channel.type)} {channel.type}
                            </span>
                        )}
                        {channel.quality && channel.quality !== 'Unknown' && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(channel.quality)}`}>
                                {channel.quality}
                            </span>
                        )}
                        {channel.radioFlag && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                📻 Radio
                            </span>
                        )}
                    </div>

                    {/* Informations géographiques */}
                    <div className="grid grid-cols-2 gap-4">
                        {channel.country && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Pays
                                </label>
                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                                    🌍 {channel.country}
                                </p>
                            </div>
                        )}
                        {channel.language && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Langue
                                </label>
                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                                    🗣️ {channel.language}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Catégorie */}
                    {channel.category && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Catégorie
                            </label>
                            <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                                {getCategoryIcon(channel.category)} {channel.category.charAt(0).toUpperCase() + channel.category.slice(1)}
                            </p>
                        </div>
                    )}

                    {/* Informations techniques */}
                    {(channel.resolution || channel.frameRate || channel.aspectRatio) && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Technique
                            </label>
                            <div className="mt-2 space-y-1">
                                {channel.resolution && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        📐 Résolution: {channel.resolution}
                                    </p>
                                )}
                                {channel.frameRate && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        🎬 FPS: {channel.frameRate}
                                    </p>
                                )}
                                {channel.aspectRatio && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        📺 Ratio: {channel.aspectRatio}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Codecs */}
                    {(channel.videoCodec || channel.audioCodec) && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Codecs
                            </label>
                            <div className="mt-2 space-y-1">
                                {channel.videoCodec && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        🎥 Vidéo: {channel.videoCodec}
                                    </p>
                                )}
                                {channel.audioCodec && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        🔊 Audio: {channel.audioCodec}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Métadonnées TVG */}
                    {(channel.tvgId || channel.tvgName || channel.tvgShift) && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Guide TV
                            </label>
                            <div className="mt-2 space-y-1">
                                {channel.tvgId && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        🆔 ID: {channel.tvgId}
                                    </p>
                                )}
                                {channel.tvgName && channel.tvgName !== channel.name && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        📝 Nom TVG: {channel.tvgName}
                                    </p>
                                )}
                                {channel.tvgShift && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        ⏰ Décalage: {channel.tvgShift}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* URL (tronquée) */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Source
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">
                            {channel.url.length > 50 ? `${channel.url.substring(0, 50)}...` : channel.url}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};