import React, { FC, useRef, useState, useEffect } from 'react';
import videojs from 'video.js';
import 'videojs-contrib-quality-levels';
import { CorsProxyManager } from '../utils/corsProxy';
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
    const [currentProxyIndex, setCurrentProxyIndex] = useState<number>(0);
    const [retryCount, setRetryCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const maxRetries = 3;

    const createPlayer = async (url: string, proxyIndex: number) => {
        if (!videoRef.current) return null;

        const player = videojs(videoRef.current, {
            controls: true,
            responsive: true,
            fluid: true,
            fill: true,
            autoplay: true,
            preload: 'auto',
            sources: [{
                src: url,
                type: 'application/x-mpegURL'
            }],
            html5: {
                vhs: {
                    overrideNative: true,
                    enableLowInitialPlaylist: true,
                    smoothQualityChange: true,
                    useBandwidthFromLocalStorage: true,
                    // Limit retries to prevent infinite loops
                    maxPlaylistRetries: 2,
                    playlistExclusionDuration: 60
                }
            },
            plugins: {
                qualityLevels: {}
            }
        });

        // Enhanced error handling
        let errorTimeout: NodeJS.Timeout;
        
        player.on('error', () => {
            const error = player.error();
            console.error('Video.js error:', error);
            
            // Clear any existing timeout
            if (errorTimeout) clearTimeout(errorTimeout);
            
            // Mark current proxy as failed if it's a network error
            if (error && (error.code === 2 || error.code === 4)) {
                CorsProxyManager.markProxyAsFailed(proxyIndex);
                
                // Try next proxy if we haven't exceeded max retries
                if (retryCount < maxRetries) {
                    errorTimeout = setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        // This will trigger a re-render and try the next proxy
                    }, 1000);
                    return;
                }
            }
            
            setStreamError(true);
        });

        // Handle successful ready state
        player.ready(() => {
            setIsPlayerReady(true);
            setStreamError(false);
            setRetryCount(0); // Reset retry count on success
            
            // Initialize quality levels plugin
            if (player.qualityLevels) {
                const qualityLevels = player.qualityLevels();
                
                qualityLevels.on('addqualitylevel', () => {
                    console.log('Quality level added');
                });
                
                qualityLevels.on('change', () => {
                    console.log('Quality level changed');
                });
            }
            
            // Attempt autoplay with error handling
            player.play().catch((e: any) => {
                console.warn("Autoplay blocked:", e);
            });
        });

        return player;
    };

    useEffect(() => {
        if (!streamUrl || !videoRef.current) return;

        const initializePlayer = async () => {
            // Destroy previous player
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }

            setIsPlayerReady(false);
            setIsLoading(true);
            
            // Get proxied URL
            const { url: proxiedUrl, proxyIndex } = CorsProxyManager.getProxiedUrl(streamUrl);
            setCurrentProxyIndex(proxyIndex);
            
            console.log(`Attempting to load stream via proxy ${proxyIndex}: ${proxiedUrl}`);
            
            // Create new player
            const player = await createPlayer(proxiedUrl, proxyIndex);
            if (player) {
                playerRef.current = player;
            }
            
            setIsLoading(false);
        };

        initializePlayer();

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
            setIsPlayerReady(false);
            setShowQualitySelector(false);
            setStreamError(false);
        };
    }, [streamUrl, retryCount]); // Include retryCount to trigger re-initialization

    return (
        <div className="bg-black w-full h-full flex items-center justify-center relative">
            <div data-vjs-player className="w-full h-full">
                <video
                    ref={videoRef}
                    className="video-js vjs-default-skin w-full h-full"
                    style={{ opacity: streamError || isLoading ? 0 : 1 }}
                />
            </div>
            
            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                    <div className="flex flex-col items-center gap-3 text-white">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <p className="text-sm">Chargement du flux...</p>
                        {retryCount > 0 && (
                            <p className="text-xs text-gray-300">Tentative {retryCount + 1}/{maxRetries + 1}</p>
                        )}
                    </div>
                </div>
            )}
            
            {/* Control buttons */}
            {isPlayerReady && !streamError && !isLoading && (
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
            
            {/* Quality selector */}
            <QualitySelector
                player={playerRef.current}
                isVisible={showQualitySelector}
                onClose={() => setShowQualitySelector(false)}
            />
            
            {/* Quality info */}
            <QualityInfo
                player={playerRef.current}
                isVisible={showQualityInfo}
            />
            
            {/* Error state */}
            {streamError && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                    <div className="flex flex-col items-center gap-4 text-white text-center p-6">
                        <StreamErrorIcon />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Erreur de lecture</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Impossible de charger le flux vidéo après {maxRetries + 1} tentatives.
                            </p>
                            <button
                                onClick={() => {
                                    setRetryCount(0);
                                    setStreamError(false);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};