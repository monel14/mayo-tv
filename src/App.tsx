import React, { FC, useState, useMemo } from 'react';
import { Channel } from './types';
import { useChannels } from './hooks/useChannels';
import { testChannelStatus } from './utils/channelTester';
import { Loader } from './components/ui/Loader';
import { SearchInput } from './components/ui/SearchInput';
import { Header } from './components/ui/Header';
import { CountryList } from './components/CountryList';
import { ChannelGrid } from './components/ChannelGrid';
import { PlayerOverlay } from './components/PlayerOverlay';

export const App: FC = () => {
    const { channelsByCountry, setChannelsByCountry, isLoading, error } = useChannels();
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const [channelSearchTerm, setChannelSearchTerm] = useState('');

    const handleSelectCountry = (country: string) => {
        setSelectedCountry(country);
        setChannelSearchTerm('');
    };

    const handleBackToCountries = () => {
        setSelectedCountry(null);
    };

    const handleSelectChannel = (url: string) => {
        setCurrentStreamUrl(url);
    };

    const handleClosePlayer = () => {
        setCurrentStreamUrl(null);
    };

    const handleCheckChannelStatus = async (channel: Channel) => {
        // Mettre à jour le statut à "checking"
        setChannelsByCountry(prev => ({
            ...prev,
            [selectedCountry!]: prev[selectedCountry!].map(ch =>
                ch.url === channel.url ? { ...ch, status: 'checking' } : ch
            )
        }));

        const status = await testChannelStatus(channel);

        // Mettre à jour le statut final
        setChannelsByCountry(prev => ({
            ...prev,
            [selectedCountry!]: prev[selectedCountry!].map(ch =>
                ch.url === channel.url ? { ...ch, status } : ch
            )
        }));
    };

    const handleTestAllChannels = async () => {
        if (!selectedCountry) return;

        const channels = channelsByCountry[selectedCountry];

        // Tester les chaînes par petits groupes pour éviter de surcharger
        const batchSize = 5;
        for (let i = 0; i < channels.length; i += batchSize) {
            const batch = channels.slice(i, i + batchSize);
            await Promise.all(batch.map(channel => handleCheckChannelStatus(channel)));

            // Petite pause entre les groupes
            if (i + batchSize < channels.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    };

    const filteredCountries = useMemo(() => {
        const countries = Object.keys(channelsByCountry).sort();
        if (!countrySearchTerm) return countries;
        return countries.filter(country =>
            country.toLowerCase().includes(countrySearchTerm.toLowerCase())
        );
    }, [channelsByCountry, countrySearchTerm]);

    const filteredChannels = useMemo(() => {
        if (!selectedCountry) return [];
        const channels = channelsByCountry[selectedCountry] || [];
        if (!channelSearchTerm) return channels;
        return channels.filter(channel =>
            channel.name.toLowerCase().includes(channelSearchTerm.toLowerCase())
        );
    }, [channelsByCountry, selectedCountry, channelSearchTerm]);

    if (isLoading) return <Loader message="Chargement de la playlist..." />;
    if (error) return <Loader message={error} />;

    const renderContent = () => {
        if (selectedCountry) {
            return (
                <div key={selectedCountry}>
                    <SearchInput
                        placeholder={`Rechercher dans ${selectedCountry}...`}
                        value={channelSearchTerm}
                        onChange={setChannelSearchTerm}
                    />
                    <ChannelGrid
                        channels={filteredChannels}
                        onSelect={handleSelectChannel}
                        onCheckStatus={handleCheckChannelStatus}
                    />
                </div>
            );
        }
        return (
            <div key="country-list" className="max-w-lg mx-auto">
                <SearchInput
                    placeholder="Rechercher un pays..."
                    value={countrySearchTerm}
                    onChange={setCountrySearchTerm}
                />
                <CountryList
                    countries={filteredCountries}
                    onSelect={handleSelectCountry}
                />
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto h-screen bg-white shadow-2xl flex flex-col">
            <Header
                title={selectedCountry || 'MAYO TV'}
                onBack={handleBackToCountries}
                showBack={!!selectedCountry}
                onTestAll={handleTestAllChannels}
                showTestAll={!!selectedCountry}
            />
            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50">
                {renderContent()}
            </main>
            {currentStreamUrl && (
                <PlayerOverlay
                    streamUrl={currentStreamUrl}
                    onClose={handleClosePlayer}
                />
            )}
        </div>
    );
};