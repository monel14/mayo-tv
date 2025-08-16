import React, { FC, useState, useEffect } from 'react';

interface QualityLevel {
    id: string;
    label: string;
    height?: number;
    width?: number;
    bitrate?: number;
    enabled: boolean;
}

interface QualitySelectorProps {
    player: any;
    isVisible: boolean;
    onClose: () => void;
}

export const QualitySelector: FC<QualitySelectorProps> = ({ player, isVisible, onClose }) => {
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
    const [currentQuality, setCurrentQuality] = useState<string>('auto');

    useEffect(() => {
        if (!player || !isVisible) return;

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

        // Écouter les changements de qualité
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
    }, [player, isVisible]);

    const handleQualityChange = (qualityId: string) => {
        if (!player) return;

        const qualityLevelsPlugin = player.qualityLevels();
        if (!qualityLevelsPlugin) return;

        if (qualityId === 'auto') {
            // Activer la sélection automatique
            for (let i = 0; i < qualityLevelsPlugin.length; i++) {
                qualityLevelsPlugin[i].enabled = true;
            }
        } else {
            // Désactiver tous les niveaux sauf celui sélectionné
            for (let i = 0; i < qualityLevelsPlugin.length; i++) {
                qualityLevelsPlugin[i].enabled = i === parseInt(qualityId);
            }
        }

        setCurrentQuality(qualityId);
        onClose();
    };

    if (!isVisible || qualityLevels.length <= 1) return null;

    return (
        <div className="absolute bottom-16 right-4 bg-black/90 rounded-lg p-2 min-w-32 z-50">
            <div className="text-white text-sm font-semibold mb-2 px-2">Qualité</div>
            <div className="space-y-1">
                {qualityLevels.map((level) => (
                    <button
                        key={level.id}
                        onClick={() => handleQualityChange(level.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                            currentQuality === level.id
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <span>{level.label}</span>
                            {currentQuality === level.id && (
                                <span className="text-xs">✓</span>
                            )}
                        </div>
                        {level.bitrate && level.id !== 'auto' && (
                            <div className="text-xs text-gray-400">
                                {Math.round(level.bitrate / 1000)} kbps
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};