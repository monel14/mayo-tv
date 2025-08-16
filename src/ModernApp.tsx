import React, { FC, useState, useMemo } from 'react';
import { Channel } from './types';
import { useOptimizedChannels } from './hooks/useOptimizedChannels';
import { useChannelOrganization } from './hooks/useChannelOrganization';
import { useImagePreloader } from './hooks/useImagePreloader';
import { useToast } from './hooks/useToast';
import { testChannelStatus } from './utils/channelTester';
import { 
    OptimizedLoader, 
    SkeletonScreen,
    ModernHeader, 
    EnhancedSearch, 
    OrganizationSelector,
    AnimatedGrid,
    VirtualizedGrid,
    StatsPanel,
    ChannelMetadata,
    Toast,
    PWAInstallPrompt,
    PWAStatusIndicator
} from './components/ui';
import { PlayerOverlay } from './components/PlayerOverlay';

export const ModernApp: FC = () => {
    const { 
        channelsByCountry, 
        setChannelsByCountry, 
        allChannels,
        loadingState, 
        error, 
        refreshChannels,
        isCacheValid 
    } = useOptimizedChannels();

    const {
        organizationMode,
        organizedChannels,
        availableOrganizations,
        organizationStats,
        changeOrganizationMode,
        getSearchSuggestions,
        filterChannels
    } = useChannelOrganization(allChannels);

    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [channelSearchTerm, setChannelSearchTerm] = useState('');
    const [selectedChannelForMetadata, setSelectedChannelForMetadata] = useState<Channel | null>(null);
    
    const { toast, hideToast, showSuccess, showError, showInfo } = useToast();

    // Préchargement des images pour le groupe sélectionné
    const currentChannels = selectedGroup ? organizedChannels[selectedGroup] || [] : [];
    const { preloadProgress } = useImagePreloader(currentChannels, !!selectedGroup);

    const handleSelectGroup = (group: string) => {
        setSelectedGroup(group);
        setChannelSearchTerm('');
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

        // Mettre à jour le statut à "checking"
        setChannelsByCountry(prev => {
            const newData = { ...prev };
            Object.keys(newData).forEach(key => {
                newData[key] = newData[key].map(ch =>
                    ch.url === channel.url ? { ...ch, status: 'checking' } : ch
                );
            });
            return newData;
        });

        const status = await testChannelStatus(channel);

        // Mettre à jour le statut final
        setChannelsByCountry(prev => {
            const newData = { ...prev };
            Object.keys(newData).forEach(key => {
                newData[key] = newData[key].map(ch =>
                    ch.url === channel.url ? { ...ch, status } : ch
                );
            });
            return newData;
        });
    };

    const handleTestAllChannels = async () => {
        if (!selectedGroup) return;

        const channels = organizedChannels[selectedGroup];
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

    const filteredGroups = useMemo(() => {
        const groups = Object.keys(organizedChannels).sort();
        if (!groupSearchTerm) return groups;
        return groups.filter(group =>
            group.toLowerCase().includes(groupSearchTerm.toLowerCase())
        );
    }, [organizedChannels, groupSearchTerm]);

    const filteredChannels = useMemo(() => {
        if (!selectedGroup) return [];
        const channels = organizedChannels[selectedGroup] || [];
        return filterChannels(channels, channelSearchTerm);
    }, [organizedChannels, selectedGroup, channelSearchTerm, filterChannels]);

    const groupSuggestions = useMemo(() => {
        return Object.keys(organizedChannels).slice(0, 5);
    }, [organizedChannels]);

    const channelSuggestions = useMemo(() => {
        return getSearchSuggestions(channelSearchTerm, selectedGroup);
    }, [channelSearchTerm, selectedGroup, getSearchSuggestions]);

    if (loadingState.isLoading) {
        // Utiliser skeleton loader au lieu du loader classique
        if (loadingState.progress > 30) {
            return <SkeletonScreen type={selectedGroup ? 'channels' : 'groups'} />;
        }
        
        return (
            <OptimizedLoader 
                loadingState={loadingState}
                onRefresh={error ? refreshChannels : undefined}
                isCacheValid={isCacheValid}
            />
        );
    }
    
    if (error) {
        return (
            <OptimizedLoader 
                loadingState={loadingState}
                onRefresh={refreshChannels}
                isCacheValid={isCacheValid}
            />
        );
    }

    const renderGroupList = () => (
        <div key="group-list" className="max-w-4xl mx-auto">
            {/* Statistiques globales */}
            <StatsPanel 
                channelsByCountry={organizedChannels}
                selectedCountry={null}
            />

            {/* Sélecteur d'organisation */}
            <OrganizationSelector
                currentMode={organizationMode}
                availableOrganizations={availableOrganizations}
                onModeChange={changeOrganizationMode}
            />

            {/* Recherche de groupes */}
            <EnhancedSearch
                placeholder={`Rechercher dans ${availableOrganizations.find(org => org.mode === organizationMode)?.label.toLowerCase() || 'les groupes'}...`}
                value={groupSearchTerm}
                onChange={setGroupSearchTerm}
                suggestions={groupSuggestions}
                onSuggestionSelect={setGroupSearchTerm}
            />

            {/* Liste des groupes */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGroups.length > 0 ? filteredGroups.map(group => {
                    const channelCount = organizedChannels[group]?.length || 0;
                    const workingCount = organizedChannels[group]?.filter(ch => ch.status === 'working').length || 0;
                    const successRate = channelCount > 0 ? Math.round((workingCount / channelCount) * 100) : 0;

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
                                     organizationMode === 'category' ? '📂' :
                                     organizationMode === 'language' ? '🗣️' :
                                     organizationMode === 'quality' ? '📺' :
                                     organizationMode === 'type' ? '🎭' :
                                     organizationMode === 'alphabetical' ? '🔤' : '🎯'}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Chaînes</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{channelCount}</span>
                                </div>
                                
                                {workingCount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Testées</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            {workingCount} ({successRate}%)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                Cliquez pour explorer
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

    const renderChannelGrid = () => (
        <div key={selectedGroup}>
            {/* Statistiques du groupe */}
            <StatsPanel 
                channelsByCountry={organizedChannels}
                selectedCountry={selectedGroup}
            />

            {/* Recherche de chaînes */}
            <EnhancedSearch
                placeholder={`Rechercher dans ${selectedGroup}...`}
                value={channelSearchTerm}
                onChange={setChannelSearchTerm}
                suggestions={channelSuggestions}
                onSuggestionSelect={setChannelSearchTerm}
            />

            {/* Grille des chaînes - Virtualisée si plus de 50 chaînes */}
            {filteredChannels.length > 50 ? (
                <VirtualizedGrid
                    channels={filteredChannels}
                    onSelect={handleSelectChannel}
                    onCheckStatus={handleCheckChannelStatus}
                    onShowMetadata={setSelectedChannelForMetadata}
                    searchTerm={channelSearchTerm}
                    containerHeight={600}
                />
            ) : (
                <AnimatedGrid
                    channels={filteredChannels}
                    onSelect={handleSelectChannel}
                    onCheckStatus={handleCheckChannelStatus}
                    onShowMetadata={setSelectedChannelForMetadata}
                    searchTerm={channelSearchTerm}
                />
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto shadow-2xl bg-white dark:bg-gray-800 min-h-screen flex flex-col">
                <ModernHeader
                    title={selectedGroup || 'MAYO TV'}
                    onBack={handleBackToGroups}
                    showBack={!!selectedGroup}
                    onTestAll={handleTestAllChannels}
                    showTestAll={!!selectedGroup}
                    preloadProgress={selectedGroup ? preloadProgress : undefined}
                    channelCount={selectedGroup ? filteredChannels.length : organizationStats.totalChannels}
                >
                    <PWAStatusIndicator />
                </ModernHeader>
                
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {selectedGroup ? renderChannelGrid() : renderGroupList()}
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