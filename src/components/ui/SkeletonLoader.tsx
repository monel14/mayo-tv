import React, { FC } from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height,
    animation = 'pulse'
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'circular':
                return 'rounded-full';
            case 'rectangular':
                return 'rounded-lg';
            case 'text':
            default:
                return 'rounded';
        }
    };

    const getAnimationClasses = () => {
        switch (animation) {
            case 'wave':
                return 'animate-wave';
            case 'pulse':
                return 'animate-pulse';
            case 'none':
            default:
                return '';
        }
    };

    const style = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1em' : undefined)
    };

    return (
        <div
            className={`bg-gray-300 dark:bg-gray-700 ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
            style={style}
        />
    );
};

// Skeleton pour les cartes de groupes
export const GroupCardSkeleton: FC = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 animate-pulse">
        <div className="flex items-start justify-between mb-3">
            <Skeleton variant="text" width="60%" height="1.5rem" />
            <Skeleton variant="circular" width="2rem" height="2rem" />
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Skeleton variant="text" width="40%" height="0.875rem" />
                <Skeleton variant="text" width="20%" height="0.875rem" />
            </div>
            <div className="flex items-center justify-between">
                <Skeleton variant="text" width="35%" height="0.875rem" />
                <Skeleton variant="text" width="25%" height="0.875rem" />
            </div>
        </div>

        <div className="mt-4">
            <Skeleton variant="text" width="50%" height="0.75rem" />
        </div>
    </div>
);

// Skeleton pour les cartes de chaînes
export const ChannelCardSkeleton: FC = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 animate-pulse">
        {/* Logo skeleton */}
        <div className="w-full h-16 sm:h-20 flex items-center justify-center mb-3">
            <Skeleton variant="rectangular" width="100%" height="100%" />
        </div>
        
        {/* Nom de la chaîne */}
        <div className="mb-2">
            <Skeleton variant="text" width="80%" height="0.875rem" className="mx-auto" />
        </div>
        
        {/* Boutons */}
        <div className="flex gap-1">
            <Skeleton variant="rectangular" width="100%" height="1.75rem" className="rounded-full" />
            <Skeleton variant="rectangular" width="2rem" height="1.75rem" className="rounded-full" />
        </div>
    </div>
);

// Skeleton pour l'en-tête
export const HeaderSkeleton: FC = () => (
    <div className="bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800 p-4 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
                <Skeleton variant="circular" width="2rem" height="2rem" className="bg-white/20" />
                <div className="flex-1">
                    <Skeleton variant="text" width="40%" height="1.5rem" className="bg-white/20" />
                    <Skeleton variant="text" width="60%" height="0.875rem" className="bg-white/20 mt-1" />
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Skeleton variant="rectangular" width="4rem" height="2rem" className="bg-white/20 rounded-full" />
                <Skeleton variant="circular" width="2rem" height="2rem" className="bg-white/20" />
            </div>
        </div>
    </div>
);

// Skeleton pour le panneau de statistiques
export const StatsPanelSkeleton: FC = () => (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mb-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[...Array(4)].map((_, i) => (
                <div key={i}>
                    <Skeleton variant="text" width="2rem" height="1.5rem" className="mx-auto mb-1" />
                    <Skeleton variant="text" width="80%" height="0.75rem" className="mx-auto" />
                </div>
            ))}
        </div>
    </div>
);

// Skeleton pour le sélecteur d'organisation
export const OrganizationSelectorSkeleton: FC = () => (
    <div className="mb-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
                    <div>
                        <Skeleton variant="text" width="8rem" height="1rem" />
                        <Skeleton variant="text" width="6rem" height="0.75rem" className="mt-1" />
                    </div>
                </div>
                <Skeleton variant="circular" width="1.25rem" height="1.25rem" />
            </div>
        </div>
    </div>
);

// Skeleton pour la barre de recherche
export const SearchSkeleton: FC = () => (
    <div className="relative mb-6">
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl py-4 pl-12 pr-4 animate-pulse">
            <Skeleton variant="text" width="50%" height="1rem" />
        </div>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
            <Skeleton variant="circular" width="1.25rem" height="1.25rem" />
        </div>
    </div>
);