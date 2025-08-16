import React, { FC } from 'react';

interface Tab {
    id: string;
    label: string;
    icon: string;
    count?: number;
}

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export const TabNavigation: FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        activeTab === tab.id
                            ? 'bg-red-500 text-white shadow-lg transform scale-105'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.count !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            activeTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                        }`}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};