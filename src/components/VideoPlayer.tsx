import React, { FC, useRef, useState, useEffect } from 'react';
import videojs from 'video.js';
import 'videojs-contrib-quality-levels';
import { CORS_PROXY_URL } from '../config/constants';
import { StreamErrorIcon } from './icons';
import { QualitySelector } from './ui/QualitySelector';
import { QualityButton } from './ui/QualityButton';
import { QualityInfo } from './ui/QualityInfo';

interface VideoPlayerProps {
    streamUrl: string | null;
}

export const VideoPlayer: FC<VideoPlayerProps> = ({ streamUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);
    const [streamError, setStreamError] = useState(false);
    const [showQualitySelector, setShowQualitySelector] = useState(false);
    const [showQualityInfo, setShowQualityInfo] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    useEffect(() => {
        if (!streamUrl || !videoRef.current) return;

        const proxiedStreamUrl = `${CORS_PROXY_URL}${encodeURIComponent(streamUrl)}`;
        setStreamError(false);

        // Détruire le lecteur précédent s'il existe
        if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
        }

        // Créer le lecteur Video.js
        const player = videojs(videoRef.current, {
            controls: true,
            responsive: true,
            fluid: true,
            fill: true,
            autoplay: true,
            preload: 'auto',
            sources: [{
                src: proxiedStreamUrl,
                type: 'application/x-mpegURL'
            }],
            html5: {
                vhs: {
                    overrideNative: true,
                    enableLowInitialPlaylist: true,
                    smoothQualityChange: true,
                    useBandwidthFromLocalStorage: true
                }
            },
            plugins: {
                qualityLevels: {}
            }
        });

        playerRef.current = player;

        // Gestion des erreurs
        player.on('error', () => {
            console.error('Erreur Video.js:', player.error());
            setStreamError(true);
        });

        // Gestion de la lecture
        player.ready(() => {
            setIsPlayerReady(true);
            
            // Initialiser le plugin quality levels
            if (player.qualityLevels) {
                const qualityLevels = player.qualityLevels();
                
                // Écouter les changements de qualité
                qualityLevels.on('addqualitylevel', () => {
                    console.log('Nouveau niveau de qualité ajouté');
                });
                
                qualityLevels.on('change', () => {
                    console.log('Niveau de qualité changé');
                });
            }
            
            player.play().catch((e: any) => {
                console.error("La lecture automatique a été bloquée:", e);
            });
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
            setIsPlayerReady(false);
            setShowQualitySelector(false);
        };
    }, [streamUrl]);

    return (
        <div className="bg-black w-full h-full flex items-center justify-center relative">
            <div data-vjs-player className="w-full h-full">
                <video
                    ref={videoRef}
                    className="video-js vjs-default-skin w-full h-full"
                    style={{ opacity: streamError ? 0 : 1 }}
                />
            </div>
            
            {/* Boutons de contrôle */}
            {isPlayerReady && !streamError && (
                <div className="absolute top-4 left-4 flex gap-2 z-40">
                    <QualityButton
                        onClick={() => setShowQualitySelector(!showQualitySelector)}
                    />
                    <button
                        onClick={() => setShowQualityInfo(!showQualityInfo)}
                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        title="Afficher les informations"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                </div>
            )}
            
            {/* Sélecteur de qualité */}
            <QualitySelector
                player={playerRef.current}
                isVisible={showQualitySelector}
                onClose={() => setShowQualitySelector(false)}
            />
            
            {/* Informations de qualité */}
            <QualityInfo
                player={playerRef.current}
                isVisible={showQualityInfo}
            />
            
            {streamError && <StreamErrorIcon />}
        </div>
    );
};