import React, { FC } from 'react';

interface QuickStatsProps {
    totalChannels: number;
    workingChannels: number;
    currentGroup?: string;
    isCompact?: boolean;
}

export const QuickStats: FC<QuickStatsProps> = ({ 
    totalChannels, 
    workingChannels, 
    currentGroup,
    isCompact = false 
}) => {
    const successRate = totalChannels > 0 ? Math.round((workingChannels / totalChannels) * 100) : 0;

    if (isCompact) {
        return (
            <div className="flex items-center gap-2 text-xs text-white/90">
                <span className="bg-white/10 px-2 py-1 rounded-full">
                    📺 {totalChannels}
                </span>
                {workingChannels > 0 && (
                    <span className="bg-green-500/20 px-2 py-1 rounded-full">
                        ✅ {workingChannels} ({successRate}%)
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 rounded-lg p-2">
                <div className="text-lg font-bold">📺</div>
                <div className="text-xs text-white/80">
                    {totalChannels} chaîne{totalChannels > 1 ? 's' : ''}
                </div>
            </div>
            
            {workingChannels > 0 && (
                <>
                    <div className="bg-green-500/20 rounded-lg p-2">
                        <div className="text-lg font-bold">✅</div>
                        <div className="text-xs text-white/80">
                            {workingChannels} testée{workingChannels > 1 ? 's' : ''}
                        </div>
                    </div>
                    
                    <div className="bg-blue-500/20 rounded-lg p-2">
                        <div className="text-lg font-bold">{successRate}%</div>
                        <div className="text-xs text-white/80">
                            Taux de succès
                        </div>
                    </div>
                </>
            )}
            
            {currentGroup && (
                <div className="bg-purple-500/20 rounded-lg p-2">
                    <div className="text-lg font-bold">🎯</div>
                    <div className="text-xs text-white/80 truncate">
                        {currentGroup}
                    </div>
                </div>
            )}
        </div>
    );
};