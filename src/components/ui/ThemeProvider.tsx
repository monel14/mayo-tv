import React, { FC, createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: Theme;
    actualTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('mayo-tv-theme');
        return (saved as Theme) || 'auto';
    });

    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const updateTheme = () => {
            let newTheme: 'light' | 'dark' = 'light';
            
            if (theme === 'auto') {
                newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                newTheme = theme as 'light' | 'dark';
            }
            
            setActualTheme(newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
        };

        updateTheme();
        
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', updateTheme);
            return () => mediaQuery.removeEventListener('change', updateTheme);
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('mayo-tv-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};