import React, { FC } from 'react';
import { Channel } from '../../types';

interface StatusIndicatorProps {
    status: Channel['status'];
}

export const StatusIndicator: FC<StatusIndicatorProps> = ({ status }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'working':
                return { color: 'bg-green-500', icon: '✓', text: 'Fonctionne' };
            case 'error':
                return { color: 'bg-red-500', icon: '✗', text: 'Erreur' };
            case 'checking':
                return { color: 'bg-yellow-500', icon: '⟳', text: 'Vérification...' };
            default:
                return { color: 'bg-gray-400', icon: '?', text: 'Inconnu' };
        }
    };

    const config = getStatusConfig();

    return (
        <div
            className={`absolute top-1 right-1 w-6 h-6 ${config.color} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}
            title={config.text}
        >
            <span className={status === 'checking' ? 'animate-spin' : ''}>{config.icon}</span>
        </div>
    );
};