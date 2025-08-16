import React, { FC, useState, useEffect } from 'react';

interface QualityInfoProps {
    player: any;
    isVisible: boolean;
}

interface StreamStats {
    currentQuality: string;
    bitrate: number;
    droppedFrames: number;
    bandwidth: number;
    bufferLength: number;
}

export const QualityInfo: FC<QualityInfoProps> = ({ player, isVisible }) => {
    const [stats, setStats] = useState<StreamStats | null>(null);

    useEffect(() => {
        if (!player || !isVisible) return;

        const updateStats = () => {
            try {
                const tech = player.tech();
                const vhs = tech?.vhs;
                
                if (vhs) {
                    const qualityLevels = player.qualityLevels();
                    const currentLevel = qualityLevels?.selectedIndex >= 0 
                        ? qualityLevels[qualityLevels.selectedIndex] 
                        : null;

                    const newStats: StreamStats = {
                        currentQuality: currentLevel?.height 
                            ? `${currentLevel.height}p` 
                            : 'Auto',
                        bitrate: currentLevel?.bitrate || 0,
                        droppedFrames: tech.el()?.getVideoPlaybackQuality?.()?.droppedVideoFrames || 0,
                        bandwidth: vhs.bandwidth || 0,
                        bufferLength: player.buffered().length > 0 
                            ? player.buffered().end(0) - player.currentTime() 
                            : 0
                    };

                    setStats(newStats);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des stats:', error);
            }
        };

        const interval = setInterval(updateStats, 1000);
        updateStats(); // Mise à jour immédiate

        return () => clearInterval(interval);
    }, [player, isVisible]);

    if (!isVisible || !stats) return null;

    return (
        <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-40">
            <div className="space-y-1">
                <div>Qualité: <span className="text-green-400">{stats.currentQuality}</span></div>
                <div>Débit: <span className="text-blue-400">{Math.round(stats.bitrate / 1000)} kbps</span></div>
                <div>Bande passante: <span className="text-yellow-400">{Math.round(stats.bandwidth / 1000)} kbps</span></div>
                <div>Buffer: <span className="text-purple-400">{stats.bufferLength.toFixed(1)}s</span></div>
                <div>Images perdues: <span className="text-red-400">{stats.droppedFrames}</span></div>
            </div>
        </div>
    );
};