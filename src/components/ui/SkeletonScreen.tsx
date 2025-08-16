import React, { FC } from 'react';
import { 
    HeaderSkeleton, 
    StatsPanelSkeleton, 
    OrganizationSelectorSkeleton, 
    SearchSkeleton, 
    GroupCardSkeleton, 
    ChannelCardSkeleton 
} from './SkeletonLoader';

interface SkeletonScreenProps {
    type: 'groups' | 'channels';
    itemCount?: number;
}

export const SkeletonScreen: FC<SkeletonScreenProps> = ({ type, itemCount = 12 }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto shadow-2xl bg-white dark:bg-gray-800 min-h-screen flex flex-col">
                {/* En-tête skeleton */}
                <HeaderSkeleton />
                
                <main className="flex-1 overflow-y-auto p-6">
                    {type === 'groups' ? (
                        <div className="max-w-4xl mx-auto">
                            {/* Statistiques skeleton */}
                            <StatsPanelSkeleton />
                            
                            {/* Sélecteur d'organisation skeleton */}
                            <OrganizationSelectorSkeleton />
                            
                            {/* Recherche skeleton */}
                            <SearchSkeleton />
                            
                            {/* Grille des groupes skeleton */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[...Array(itemCount)].map((_, index) => (
                                    <GroupCardSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Statistiques skeleton */}
                            <StatsPanelSkeleton />
                            
                            {/* Recherche skeleton */}
                            <SearchSkeleton />
                            
                            {/* Grille des chaînes skeleton */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                                {[...Array(itemCount)].map((_, index) => (
                                    <ChannelCardSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};