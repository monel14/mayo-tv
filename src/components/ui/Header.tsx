import React, { FC } from 'react';
import { ChevronLeftIcon } from '../icons';

interface HeaderProps {
    title: string;
    onBack?: () => void;
    showBack: boolean;
    onTestAll?: () => void;
    showTestAll?: boolean;
    preloadProgress?: number;
}

export const Header: FC<HeaderProps> = ({ title, onBack, showBack, onTestAll, showTestAll, preloadProgress }) => (
    <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="w-1/3">
            {showBack && (
                <button onClick={onBack} aria-label="Go back" className="-ml-2 p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ChevronLeftIcon />
                </button>
            )}
        </div>
        <h1 className="text-xl font-bold text-center truncate w-1/3">{title}</h1>
        <div className="w-1/3 flex justify-end items-center gap-2">
            {preloadProgress !== undefined && preloadProgress < 100 && (
                <div className="text-xs text-white/80 flex items-center gap-1">
                    <div className="w-3 h-3 border border-white/50 rounded-full animate-spin border-t-white"></div>
                    {Math.round(preloadProgress)}%
                </div>
            )}
            {showTestAll && (
                <button
                    onClick={onTestAll}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
                >
                    Tester tout
                </button>
            )}
        </div>
    </header>
);