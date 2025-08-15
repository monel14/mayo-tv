import React, { FC, useRef, useState, useEffect } from 'react';
import videojs from 'video.js';
import { CORS_PROXY_URL } from '../config/constants';
import { StreamErrorIcon } from './icons';

interface VideoPlayerProps {
    streamUrl: string | null;
}

export const VideoPlayer: FC<VideoPlayerProps> = ({ streamUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);
    const [streamError, setStreamError] = useState(false);

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
                    overrideNative: true
                }
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
            player.play().catch((e: any) => {
                console.error("La lecture automatique a été bloquée:", e);
            });
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
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
            {streamError && <StreamErrorIcon />}
        </div>
    );
};