import { useState, useMemo, useCallback } from 'react';
import { Channel, ChannelsByCountry } from '../types';
import { OrganizationMode, AdvancedM3uParser } from '../utils/advancedM3uParser';

export const useChannelOrganization = (allChannels: Channel[]) => {
    const [organizationMode, setOrganizationMode] = useState<OrganizationMode>('country');

    // Calcul des organisations disponibles
    const availableOrganizations = useMemo(() => {
        if (allChannels.length === 0) return [];
        return AdvancedM3uParser.getAvailableOrganizations(allChannels);
    }, [allChannels]);

    // Organisation des chaînes selon le mode sélectionné
    const organizedChannels = useMemo(() => {
        if (allChannels.length === 0) return {};
        return AdvancedM3uParser.organizeChannels(allChannels, organizationMode);
    }, [allChannels, organizationMode]);

    // Statistiques par organisation
    const organizationStats = useMemo(() => {
        const stats = {
            totalChannels: allChannels.length,
            totalGroups: Object.keys(organizedChannels).length,
            byType: {} as Record<string, number>,
            byQuality: {} as Record<string, number>,
            byCategory: {} as Record<string, number>,
            byCountry: {} as Record<string, number>,
            byLanguage: {} as Record<string, number>
        };

        allChannels.forEach(channel => {
            // Par type
            const type = channel.type || 'Unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Par qualité
            const quality = channel.quality || 'Unknown';
            stats.byQuality[quality] = (stats.byQuality[quality] || 0) + 1;

            // Par catégorie
            const category = channel.category || 'Unknown';
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

            // Par pays
            const country = channel.country || 'Unknown';
            stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;

            // Par langue
            const language = channel.language || 'Unknown';
            stats.byLanguage[language] = (stats.byLanguage[language] || 0) + 1;
        });

        return stats;
    }, [allChannels, organizedChannels]);

    // Fonction pour changer le mode d'organisation
    const changeOrganizationMode = useCallback((mode: OrganizationMode) => {
        setOrganizationMode(mode);
        // Sauvegarder la préférence
        localStorage.setItem('mayo-tv-organization-mode', mode);
    }, []);

    // Fonction pour obtenir les suggestions de recherche
    const getSearchSuggestions = useCallback((searchTerm: string, groupKey?: string): string[] => {
        const channels = groupKey ? organizedChannels[groupKey] || [] : allChannels;
        
        if (!searchTerm || searchTerm.length < 2) return [];

        const suggestions = new Set<string>();
        const searchLower = searchTerm.toLowerCase();

        channels.forEach(channel => {
            // Nom de la chaîne
            if (channel.name.toLowerCase().includes(searchLower)) {
                suggestions.add(channel.name);
            }
            
            // Catégorie
            if (channel.category?.toLowerCase().includes(searchLower)) {
                suggestions.add(channel.category);
            }
            
            // Pays
            if (channel.country?.toLowerCase().includes(searchLower)) {
                suggestions.add(channel.country);
            }
            
            // Langue
            if (channel.language?.toLowerCase().includes(searchLower)) {
                suggestions.add(channel.language);
            }
        });

        return Array.from(suggestions).slice(0, 5);
    }, [allChannels, organizedChannels]);

    // Fonction pour filtrer les chaînes avec recherche avancée
    const filterChannels = useCallback((channels: Channel[], searchTerm: string): Channel[] => {
        if (!searchTerm) return channels;

        const searchLower = searchTerm.toLowerCase();
        
        return channels.filter(channel => {
            return (
                channel.name.toLowerCase().includes(searchLower) ||
                channel.category?.toLowerCase().includes(searchLower) ||
                channel.country?.toLowerCase().includes(searchLower) ||
                channel.language?.toLowerCase().includes(searchLower) ||
                channel.type?.toLowerCase().includes(searchLower) ||
                channel.quality?.toLowerCase().includes(searchLower)
            );
        });
    }, []);

    // Initialisation du mode depuis le localStorage
    useState(() => {
        const savedMode = localStorage.getItem('mayo-tv-organization-mode') as OrganizationMode;
        if (savedMode && availableOrganizations.some(org => org.mode === savedMode)) {
            setOrganizationMode(savedMode);
        }
    });

    return {
        organizationMode,
        organizedChannels,
        availableOrganizations,
        organizationStats,
        changeOrganizationMode,
        getSearchSuggestions,
        filterChannels
    };
};