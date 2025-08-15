import React, { FC } from 'react';
import { Channel } from '../types';
import { EmptyStateIcon } from './icons';
import { StatusIndicator } from './ui/StatusIndicator';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface ChannelGridProps {
    channels: Channel[];
    onSelect: (url: string) => void;
    onCheckStatus: (channel: Channel) => void;
}

export const ChannelGrid: FC<ChannelGridProps> = ({ channels, onSelect, onCheckStatus }) => (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 sm:gap-3 animate-fade-in">
        {channels.length > 0 ? channels.map((channel, index) => (
            <div
                key={`${channel.url}-${index}`}
                className="channel-item bg-white border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-start text-center cursor-pointer transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1.5 hover:border-red-500 group relative"
                title={channel.name}
            >
                <StatusIndicator status={channel.status} />
                <div
                    className="w-full h-20 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110"
                    onClick={() => onSelect(channel.url)}
                >
                    <ImageWithFallback src={channel.logo} alt={channel.name} />
                </div>
                <span className="text-black text-xs font-semibold h-8 flex items-center justify-center w-full break-words mb-1">{channel.name}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCheckStatus(channel);
                    }}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                    disabled={channel.status === 'checking'}
                >
                    {channel.status === 'checking' ? 'Test...' : 'Tester'}
                </button>
            </div>
        )) : (
            <div className="col-span-full text-center text-gray-500 mt-12 animate-fade-in">
                <EmptyStateIcon className="mx-auto text-gray-400" />
                <p className="mt-4 text-lg">Aucune chaîne trouvée.</p>
                <p className="text-sm">Essayez de modifier votre recherche.</p>
            </div>
        )}
    </div>
);