import React, { FC, useState } from 'react';
import { OrganizationMode } from '../../utils/advancedM3uParser';

interface OrganizationOption {
    mode: OrganizationMode;
    label: string;
    count: number;
    icon: string;
    description: string;
}

interface OrganizationSelectorProps {
    currentMode: OrganizationMode;
    availableOrganizations: Array<{mode: OrganizationMode, label: string, count: number}>;
    onModeChange: (mode: OrganizationMode) => void;
}

export const OrganizationSelector: FC<OrganizationSelectorProps> = ({
    currentMode,
    availableOrganizations,
    onModeChange
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const organizationIcons: Record<OrganizationMode, {icon: string, description: string}> = {
        country: { icon: '🌍', description: 'Organisé par pays d\'origine' },
        category: { icon: '📂', description: 'Groupé par type de contenu' },
        language: { icon: '🗣️', description: 'Classé par langue' },
        quality: { icon: '📺', description: 'Trié par qualité vidéo' },
        type: { icon: '🎭', description: 'Séparé par type de média' },
        alphabetical: { icon: '🔤', description: 'Ordre alphabétique' },
        mixed: { icon: '🎯', description: 'Vue intelligente mixte' }
    };

    const currentOption = availableOrganizations.find(org => org.mode === currentMode);
    const currentIcon = organizationIcons[currentMode];

    return (
        <div className="relative mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 flex items-center justify-between hover:border-red-500 dark:hover:border-red-400 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{currentIcon.icon}</span>
                    <div className="text-left">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                            {currentOption?.label || 'Organisation'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {currentOption?.count} groupe{(currentOption?.count || 0) > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {availableOrganizations.map((org) => {
                        const orgIcon = organizationIcons[org.mode];
                        const isSelected = org.mode === currentMode;
                        
                        return (
                            <button
                                key={org.mode}
                                onClick={() => {
                                    onModeChange(org.mode);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                    isSelected ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{orgIcon.icon}</span>
                                    <div className="flex-1">
                                        <div className={`font-medium ${
                                            isSelected 
                                                ? 'text-red-700 dark:text-red-300' 
                                                : 'text-gray-800 dark:text-gray-200'
                                        }`}>
                                            {org.label}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {orgIcon.description}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {org.count} groupe{org.count > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Overlay pour fermer */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};