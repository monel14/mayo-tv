import React, { FC } from 'react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: FC = () => {
    const { theme, actualTheme, setTheme } = useTheme();

    const getIcon = () => {
        switch (actualTheme) {
            case 'dark':
                return '🌙';
            case 'light':
                return '☀️';
            default:
                return '🌓';
        }
    };

    const cycleTheme = () => {
        const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    return (
        <button
            onClick={cycleTheme}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title={`Thème: ${theme} (${actualTheme})`}
        >
            <span className="text-lg">{getIcon()}</span>
        </button>
    );
};