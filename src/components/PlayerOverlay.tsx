import React, { FC } from 'react';
import { VideoPlayer } from './VideoPlayer';

interface PlayerOverlayProps {
    streamUrl: string;
    onClose: () => void;
}

export const PlayerOverlay: FC<PlayerOverlayProps> = ({ streamUrl, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white text-4xl z-10 hover:text-red-500 transition-colors rounded-full hover:bg-white/10 p-1" 
                aria-label="Fermer le lecteur"
            >
                &times;
            </button>
            <div className="w-full h-full max-w-screen-2xl">
                <VideoPlayer streamUrl={streamUrl} />
            </div>
        </div>
    );
};