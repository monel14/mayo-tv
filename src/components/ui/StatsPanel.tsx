import React, { FC } from 'react';
import { ChannelsByCountry } from '../../types';

interface StatsPanelProps {
    channelsByCountry: ChannelsByCountry;
    selectedCountry?: string | null;
}

export const StatsPanel: FC<StatsPanelProps> = ({ channelsByCountry, selectedCountry }) => {
    const totalCountries = Object.keys(channelsByCountry).length;
    const totalChannels = Object.values(channelsByCountry).reduce((sum, channels) => sum + channels.length, 0);
    const currentChannels = selectedCountry ? channelsByCountry[selectedCountry]?.length || 0 : 0;

    const workingChannels = selectedCountry 
        ? channelsByCountry[selectedCountry]?.filter(ch => ch.status === 'working').length || 0
        : 0;

    const errorChannels = selectedCountry 
        ? channelsByCountry[selectedCountry]?.filter(ch => ch.status === 'error').length || 0
        : 0;

    if (!selectedCountry) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mb-6 border border-blue-200 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCountries}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Pays disponibles</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalChannels}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Chaînes totales</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mb-6 border border-green-200 dark:border-gray-600">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{currentChannels}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Chaînes</div>
                </div>
                {workingChannels > 0 && (
                    <div>
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">{workingChannels}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Fonctionnelles</div>
                    </div>
                )}
                {errorChannels > 0 && (
                    <div>
                        <div className="text-xl font-bold text-red-600 dark:text-red-400">{errorChannels}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">En erreur</div>
                    </div>
                )}
                <div>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {workingChannels > 0 ? Math.round((workingChannels / currentChannels) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Taux de succès</div>
                </div>
            </div>
        </div>
    );
};