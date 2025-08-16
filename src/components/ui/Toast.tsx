import React, { FC, useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: FC<ToastProps> = ({ 
    message, 
    type, 
    isVisible, 
    onClose, 
    duration = 3000 
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setTimeout(onClose, 300); // Attendre la fin de l'animation
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible && !isAnimating) return null;

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 text-white';
            case 'error':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-yellow-500 text-white';
            case 'info':
            default:
                return 'bg-blue-500 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
            isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className={`${getToastStyles()} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}>
                <span className="text-lg">{getIcon()}</span>
                <span className="text-sm font-medium">{message}</span>
                <button
                    onClick={() => {
                        setIsAnimating(false);
                        setTimeout(onClose, 300);
                    }}
                    className="ml-2 text-white/80 hover:text-white transition-colors"
                >
                    ×
                </button>
            </div>
        </div>
    );
};