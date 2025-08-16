import { useState, useEffect, useCallback } from 'react';

interface QualityLevel {
    id: string;
    label: string;
    height?: number;
    width?: number;
    bitrate?: number;
    enabled: boolean;
}

export const useVideoQuality = (player: any) => {
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
    const [currentQuality, setCurrentQuality] = useState<string>('auto');
    const [isAutoQuality, setIsAutoQuality] = useState(true);

    useEffect(() => {
        if (!player) return;

        const updateQualityLevels = () => {
            const qualityLevelsPlugin = player.qualityLevels();
            if (!qualityLevelsPlugin) return;

            const levels: QualityLevel[] = [];
            
            // Ajouter l'option automatique
            levels.push({
                id: 'auto',
                label: 'Auto',
                enabled: true
            });

            // Ajouter les niveaux de qualité disponibles
            for (let i = 0; i < qualityLevelsPlugin.length; i++) {
                const level = qualityLevelsPlugin[i];
                levels.push({
                    id: i.toString(),
                    label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`,
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate,
                    enabled: level.enabled
                });
            }

            setQualityLevels(levels);
        };

        player.ready(() => {
            updateQualityLevels();
            
            const qualityLevelsPlugin = player.qualityLevels();
            if (qualityLevelsPlugin) {
                qualityLevelsPlugin.on('addqualitylevel', updateQualityLevels);
                qualityLevelsPlugin.on('change', updateQualityLevels);
            }
        });

        return () => {
            const qualityLevelsPlugin = player.qualityLevels();
            if (qualityLevelsPlugin) {
                qualityLevelsPlugin.off('addqualitylevel', updateQualityLevels);
                qualityLevelsPlugin.off('change', updateQualityLevels);
            }
        };
    }, [player]);

    const changeQuality = useCallback((qualityId: string) => {
        if (!player) return;

        const qualityLevelsPlugin = player.qualityLevels();
        if (!qualityLevelsPlugin) return;

        if (qualityId === 'auto') {
            // Activer la sélection automatique
            for (let i = 0; i < qualityLevelsPlugin.length; i++) {
                qualityLevelsPlugin[i].enabled = true;
            }
            setIsAutoQuality(true);
        } else {
            // Désactiver tous les niveaux sauf celui sélectionné
            for (let i = 0; i < qualityLevelsPlugin.length; i++) {
                qualityLevelsPlugin[i].enabled = i === parseInt(qualityId);
            }
            setIsAutoQuality(false);
        }

        setCurrentQuality(qualityId);
    }, [player]);

    const getCurrentQualityInfo = useCallback(() => {
        if (!player) return null;

        const qualityLevelsPlugin = player.qualityLevels();
        if (!qualityLevelsPlugin || qualityLevelsPlugin.selectedIndex < 0) return null;

        const currentLevel = qualityLevelsPlugin[qualityLevelsPlugin.selectedIndex];
        return {
            height: currentLevel.height,
            width: currentLevel.width,
            bitrate: currentLevel.bitrate,
            label: currentLevel.height ? `${currentLevel.height}p` : 'Auto'
        };
    }, [player]);

    return {
        qualityLevels,
        currentQuality,
        isAutoQuality,
        changeQuality,
        getCurrentQualityInfo
    };
};