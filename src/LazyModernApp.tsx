import React, { FC, useState, useMemo, useEffect } from 'react';
import { Channel } from './types';
import { useLazyChannels } from './hooks/useLazyChannels';
import { useImagePreloader } from './hooks/useImagePreloader';
import { useToast } from './hooks/useToast';
import { testChannelStatus } from './utils/channelTester';
import { 
    OptimizedLoader, 
    SkeletonScreen,
    ModernHeader, 
    EnhancedSearch, 
    OrganizationSelector,
    StatsPanel,
    ChannelMetadata,
    Toast,
    PWAInstallPrompt,
    PWAStatusIndicator,
    LazyGroupLoader
} from './components/ui';
import { PlayerOverlay } from './components/PlayerOverlay';
import { OrganizationMode, AdvancedM3uParser } from './utils/advancedM3uParser';

export const LazyModernApp: FC = () => {
    const { 
        groupsIndex,
        loadedChannels,
        loadingState, 
        error, 
        loadGroupChannels,
        preloadPopularGroups,
        isGroupLoaded,
        isGroupLoading,
        getGroupError
    } = useLazyChannels();

    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [channelSearchTerm, setChannelSearchTerm] = useState('');
    const [selectedChannelForMetadata, setSelectedChannelForMetadata] = useState<Channel | null>(null);
    const [organizationMode, setOrganizationMode] = useState<OrganizationMode>('country');

    const { toast, hideToast, showSuccess, showError, showInfo } = useToast();

    // Préchargement des images pour le groupe sélectionné
    const currentChannels = selectedGroup ? loadedChannels[selectedGroup] || [] : [];
    const { preloadProgress } = useImagePreloader(currentChannels, !!selectedGroup);

    // Statistiques des groupes
    const groupStats = useMemo(() => {
        const totalGroups = Object.keys(groupsIndex).length;
        const totalChannels = Object.values(groupsIndex).reduce((sum, group) => sum + group.count, 0);
        const loadedGroups = Object.values(groupsIndex).filter(group => group.loaded).length;
        const loadedChannelsCount = Object.values(loadedChannels).reduce((sum, channels) => sum + channels.length, 0);

        return {
            totalGroups,
            totalChannels,
            loadedGroups,
            loadedChannelsCount
        };
    }, [groupsIndex, loadedChannels]);

    // Organisations disponibles (simulées pour la compatibilité)
    const availableOrganizations = useMemo(() => [
        { mode: 'country' as OrganizationMode, label: 'Par pays', count: groupStats.totalGroups },
        { mode: 'category' as OrganizationMode, label: 'Par catégorie', count: Math.floor(groupStats.totalGroups * 0.6) },
        { mode: 'alphabetical' as OrganizationMode, label: 'Alphabétique', count: 26 }
    ], [groupStats.totalGroups]);

    const handleSelectGroup = async (group: string) => {
        setSelectedGroup(group);
        setChannelSearchTerm('');
        
        // Charger les chaînes si pas encore chargées
        if (!isGroupLoaded(group)) {
            showInfo(`Chargement des chaînes de ${group}...`);
        }
    };

    const handleBackToGroups = () => {
        setSelectedGroup(null);
        setGroupSearchTerm('');
    };

    const handleSelectChannel = (url: string) => {
        setCurrentStreamUrl(url);
    };

    const handleClosePlayer = () => {
        setCurrentStreamUrl(null);
    };

    const handleCheckChannelStatus = async (channel: Channel) => {
        if (!selectedGroup) return;

        // Mettre à jour le statut à "checking" dans le groupe chargé
        const updatedChannels = loadedChannels[selectedGroup]?.map(ch =>
            ch.url === channel.url ? { ...ch, status: 'checking' as const } : ch
        ) || [];

        // Mise à jour locale temporaire
        const status = await testChannelStatus(channel);

        // Mettre à jour le statut final
        const finalChannels = updatedChannels.map(ch =>
            ch.url === channel.url ? { ...ch, status } : ch
        );

        // Note: Dans une vraie app, on mettrait à jour le state global ici
        showSuccess(`Chaîne ${channel.name}: ${status === 'working' ? 'Fonctionne' : 'Erreur'}`);
    };

    const handleTestAllChannels = async () => {
        if (!selectedGroup || !loadedChannels[selectedGroup]) return;

        const channels = loadedChannels[selectedGroup];
        showInfo(`Test de ${channels.length} chaînes en cours...`);
        
        const batchSize = 5;
        let testedCount = 0;
        
        for (let i = 0; i < channels.length; i += batchSize) {
            const batch = channels.slice(i, i + batchSize);
            await Promise.all(batch.map(channel => handleCheckChannelStatus(channel)));
            
            testedCount += batch.length;
            
            if (i + batchSize < channels.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        showSuccess(`Test terminé ! ${testedCount} chaînes testées.`);
    };

    // Filtrer les groupes selon la recherche
    const filteredGroups = useMemo(() => {
        const groups = Object.keys(groupsIndex).sort();
        if (!groupSearchTerm) return groups;
        return groups.filter(group =>
            group.toLowerCase().includes(groupSearchTerm.toLowerCase())
        );
    }, [groupsIndex, groupSearchTerm]);

    // Suggestions de recherche pour les groupes
    const groupSuggestions = useMemo(() => {
        return Object.keys(groupsIndex).slice(0, 5);
    }, [groupsIndex]);

    // Précharger les groupes populaires après le chargement initial
    useEffect(() => {
        if (!loadingState.isInitialLoading && Object.keys(groupsIndex).length > 0) {
            const popularGroups = Object.keys(groupsIndex)
                .sort((a, b) => groupsIndex[b].count - groupsIndex[a].count)
                .slice(0, 3);
            
            setTimeout(() => {
                preloadPopularGroups(popularGroups);
            }, 2000); // Attendre 2 secondes après le chargement initial
        }
    }, [loadingState.isInitialLoading, groupsIndex, preloadPopularGroups]);

    // Chargement initial
    if (loadingState.isInitialLoading) {
        if (loadingState.progress > 30) {
            return <SkeletonScreen type="groups" />;
        }
        
        return (
            <OptimizedLoader 
                loadingState={loadingState}
                onRefresh={error ? () => window.location.reload() : undefined}
                isCacheValid={false}
            />
        );
    }
    
    if (error) {
        return (
            <OptimizedLoader 
                loadingState={loadingState}
                onRefresh={() => window.location.reload()}
                isCacheValid={false}
            />
        );
    }

    const renderGroupList = () => (
        <div key="group-list" className="max-w-4xl mx-auto">
            {/* Statistiques globales */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mb-6 border border-blue-200 dark:border-gray-600">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{groupStats.totalGroups}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Groupes disponibles</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{groupStats.totalChannels}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Chaînes totales</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{groupStats.loadedGroups}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Groupes chargés</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {groupStats.totalChannels > 0 ? Math.round((groupStats.loadedChannelsCount / groupStats.totalChannels) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Progression</div>
                    </div>
                </div>
            </div>

            {/* Sélecteur d'organisation (simplifié) */}
            <OrganizationSelector
                currentMode={organizationMode}
                availableOrganizations={availableOrganizations}
                onModeChange={setOrganizationMode}
            />

            {/* Recherche de groupes */}
            <EnhancedSearch
                placeholder="Rechercher un groupe..."
                value={groupSearchTerm}
                onChange={setGroupSearchTerm}
                suggestions={groupSuggestions}
                onSuggestionSelect={setGroupSearchTerm}
            />

            {/* Liste des groupes */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGroups.length > 0 ? filteredGroups.map(group => {
                    const groupInfo = groupsIndex[group];
                    const isLoaded = groupInfo.loaded;
                    const isLoading = groupInfo.loading;
                    const channelCount = groupInfo.count;

                    return (
                        <button
                            key={group}
                            onClick={() => handleSelectGroup(group)}
                            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-red-500 dark:hover:border-red-400 animate-slide-up"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                    {group}
                                </h3>
                                <div className="text-2xl">
                                    {organizationMode === 'country' ? '🌍' :
                                     organizationMode === 'category' ? '📂' : '🔤'}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Chaînes</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{channelCount}</span>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Statut</span>
                                    <span className={`font-semibold ${
                                        isLoaded ? 'text-green-600 dark:text-green-400' :
                                        isLoading ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {isLoaded ? '✅ Chargé' :
                                         isLoading ? '⏳ Chargement...' :
                                         '💤 À charger'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                {isLoaded ? 'Prêt à explorer' : 'Cliquez pour charger'}
                            </div>
                        </button>
                    );
                }) : (
                    <div className="col-span-full text-center text-gray-500 dark:text-gray-400 mt-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-lg">Aucun groupe trouvé.</p>
                        <p className="text-sm">Essayez de modifier votre recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderChannelView = () => {
        if (!selectedGroup) return null;

        const groupInfo = groupsIndex[selectedGroup];
        const channels = loadedChannels[selectedGroup] || [];
        const isLoading = isGroupLoading(selectedGroup);
        const error = getGroupError(selectedGroup);

        return (
            <div key={selectedGroup}>
                {/* Statistiques du groupe */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mb-6 border border-green-200 dark:border-gray-600">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{groupInfo.count}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Chaînes totales</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">{channels.length}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Chargées</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                {groupInfo.count > 0 ? Math.round((channels.length / groupInfo.count) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Progression</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {isLoading ? '⏳' : channels.length > 0 ? '✅' : '💤'}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Statut</div>
                        </div>
                    </div>
                </div>

                {/* Recherche de chaînes */}
                <EnhancedSearch
                    placeholder={`Rechercher dans ${selectedGroup}...`}
                    value={channelSearchTerm}
                    onChange={setChannelSearchTerm}
                    suggestions={[]}
                />

                {/* Chargeur de groupe paresseux */}
                <LazyGroupLoader
                    groupName={selectedGroup}
                    isLoading={isLoading}
                    error={error}
                    channels={channels}
                    onLoad={loadGroupChannels}
                    onSelect={handleSelectChannel}
                    onCheckStatus={handleCheckChannelStatus}
                    onShowMetadata={setSelectedChannelForMetadata}
                    searchTerm={channelSearchTerm}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto shadow-2xl bg-white dark:bg-gray-800 min-h-screen flex flex-col">
                <ModernHeader
                    title={selectedGroup || 'MAYO TV'}
                    onBack={handleBackToGroups}
                    showBack={!!selectedGroup}
                    onTestAll={handleTestAllChannels}
                    showTestAll={!!selectedGroup && loadedChannels[selectedGroup]?.length > 0}
                    preloadProgress={selectedGroup ? preloadProgress : undefined}
                    channelCount={selectedGroup ? groupsIndex[selectedGroup]?.count : groupStats.totalChannels}
                >
                    <PWAStatusIndicator />
                </ModernHeader>
                
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {selectedGroup ? renderChannelView() : renderGroupList()}
                </main>

                {/* Lecteur vidéo */}
                {currentStreamUrl && (
                    <PlayerOverlay
                        streamUrl={currentStreamUrl}
                        onClose={handleClosePlayer}
                    />
                )}

                {/* Métadonnées de chaîne */}
                {selectedChannelForMetadata && (
                    <ChannelMetadata
                        channel={selectedChannelForMetadata}
                        isVisible={!!selectedChannelForMetadata}
                        onClose={() => setSelectedChannelForMetadata(null)}
                    />
                )}

                {/* Notifications */}
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={hideToast}
                />

                {/* PWA Install Prompt */}
                <PWAInstallPrompt />
            </div>
        </div>
    );
};