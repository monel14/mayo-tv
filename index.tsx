import React, { useState, useEffect, useRef, FC, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPE DEFINITIONS ---
interface Channel {
    name: string;
    group: string;
    logo: string;
    url: string;
}

type ChannelsByCountry = Record<string, Channel[]>;

// --- CONFIGURATION ---
const rawM3uUrl = 'https://iptv-org.github.io/iptv/index.country.m3u';
const CORS_PROXY_URL = 'https://corsproxy.io/?';
const M3U_URL = `${CORS_PROXY_URL}${encodeURIComponent(rawM3uUrl)}`;


// --- SVG ICONS ---
const ChevronLeftIcon: FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
    </svg>
);

const StreamErrorIcon: FC = () => (
     <div className="text-red-500/80 absolute inset-0 flex flex-col items-center justify-center bg-black/50">
        <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
        <p className="mt-4 text-center font-medium text-white">Erreur de lecture</p>
        <p className="mt-1 text-sm text-center text-red-400">Le flux est peut-être indisponible.</p>
    </div>
);

const SearchIcon: FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
);

const EmptyStateIcon: FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 13.5h-6" />
    </svg>
);


// --- COMPONENTS ---

const Loader: FC<{ message: string }> = ({ message }) => (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-red-500 mx-auto"></div>
            <p className="text-gray-700 text-lg mt-4">{message}</p>
        </div>
    </div>
);

const SearchInput: FC<{
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}> = ({ placeholder, value, onChange }) => (
    <div className="relative mb-4">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="search-input w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-11 pr-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
    </div>
);

const Header: FC<{ title: string; onBack?: () => void; showBack: boolean }> = ({ title, onBack, showBack }) => (
    <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="w-1/3">
            {showBack && (
                <button onClick={onBack} aria-label="Go back" className="-ml-2 p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ChevronLeftIcon />
                </button>
            )}
        </div>
        <h1 className="text-xl font-bold text-center truncate w-1/3">{title}</h1>
        <div className="w-1/3"></div> {/* Spacer */}
    </header>
);

const CountryList: FC<{ countries: string[]; onSelect: (country: string) => void }> = ({ countries, onSelect }) => (
    <div className="space-y-3 animate-fade-in">
        {countries.length > 0 ? countries.map(country => (
            <button
                key={country}
                onClick={() => onSelect(country)}
                className="category-item bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3.5 px-4 rounded-lg border-b-4 border-red-800 text-center block w-full transition-transform duration-200 transform hover:scale-[1.03] active:scale-[0.98] active:border-b-2"
            >
                {country.toUpperCase()}
            </button>
        )) : (
            <div className="text-center text-gray-500 mt-12 animate-fade-in">
                <EmptyStateIcon className="mx-auto text-gray-400" />
                <p className="mt-4 text-lg">Aucun pays trouvé.</p>
                <p className="text-sm">Essayez de modifier votre recherche.</p>
            </div>
        )}
    </div>
);

const LogoFallback: FC<{ name: string }> = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500'];
    const color = colors[name.charCodeAt(0) % colors.length];

    return (
        <div className={`w-full h-full flex items-center justify-center rounded-md ${color}`}>
            <span className="text-white font-bold text-3xl">{initial}</span>
        </div>
    );
};

const ImageWithFallback: FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (hasError || !src) {
        return <LogoFallback name={alt} />;
    }

    return (
         <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-full object-contain"
            onError={() => setHasError(true)} 
        />
    );
};


const ChannelGrid: FC<{ channels: Channel[]; onSelect: (url: string) => void; }> = ({ channels, onSelect }) => (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 sm:gap-3 animate-fade-in">
        {channels.length > 0 ? channels.map((channel, index) => (
            <div
                key={`${channel.url}-${index}`}
                onClick={() => onSelect(channel.url)}
                className="channel-item bg-white border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-start text-center cursor-pointer transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1.5 hover:border-red-500 group"
                title={channel.name}
            >
                <div className="w-full h-20 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110">
                   <ImageWithFallback src={channel.logo} alt={channel.name} />
                </div>
                <span className="text-black text-xs font-semibold h-10 flex items-center justify-center w-full break-words">{channel.name}</span>
            </div>
        )) : (
            <div className="col-span-full text-center text-gray-500 mt-12 animate-fade-in">
                 <EmptyStateIcon className="mx-auto text-gray-400" />
                <p className="mt-4 text-lg">Aucune chaîne trouvée.</p>
                <p className="text-sm">Essayez de modifier votre recherche.</p>
            </div>
        )}
    </div>
);

const VideoPlayer: FC<{ streamUrl: string | null }> = ({ streamUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<any>(null);
    const [streamError, setStreamError] = useState(false);

    useEffect(() => {
        if (!streamUrl) return;

        const proxiedStreamUrl = `${CORS_PROXY_URL}${encodeURIComponent(streamUrl)}`;
        setStreamError(false);
        const video = videoRef.current;
        if (!video) return;

        if (hlsRef.current) hlsRef.current.destroy();

        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(proxiedStreamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.error("La lecture automatique a été bloquée:", e));
            });
            hls.on(Hls.Events.ERROR, (event: any, data: any) => {
                if (data.fatal) {
                    console.error('Erreur HLS fatale:', data);
                    setStreamError(true);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = proxiedStreamUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => console.error("La lecture automatique a été bloquée:", e));
            });
             video.addEventListener('error', () => setStreamError(true));
        }
        
        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [streamUrl]);

    return (
        <div className="bg-black w-full h-full flex items-center justify-center relative">
            <video ref={videoRef} className="w-full h-full" style={{ opacity: streamError ? 0 : 1 }} controls autoPlay />
            {streamError && <StreamErrorIcon />}
        </div>
    );
};

const PlayerOverlay: FC<{ streamUrl: string; onClose: () => void }> = ({ streamUrl, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in">
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl z-10 hover:text-red-500 transition-colors rounded-full hover:bg-white/10 p-1" aria-label="Fermer le lecteur">&times;</button>
            <div className="w-full h-full max-w-screen-2xl">
                <VideoPlayer streamUrl={streamUrl} />
            </div>
        </div>
    );
};


const App: FC = () => {
    const [channelsByCountry, setChannelsByCountry] = useState<ChannelsByCountry>({});
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const [channelSearchTerm, setChannelSearchTerm] = useState('');

    useEffect(() => {
        const fetchM3uPlaylist = async () => {
            try {
                const response = await fetch(M3U_URL);
                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
                const data = await response.text();
                parseM3uPlaylist(data);
            } catch (err: any) {
                console.error('Impossible de charger la playlist M3U:', err);
                setError('Impossible de charger la playlist. Vérifiez l\'URL et votre connexion.');
            } finally {
                setIsLoading(false);
            }
        };

        const parseM3uPlaylist = (m3uText: string) => {
            const lines = m3uText.split('\n');
            let currentChannel: Partial<Channel> = {};
            const parsedData: ChannelsByCountry = {};

            for (const line of lines) {
                if (line.startsWith('#EXTINF:')) {
                    const name = line.split(',').pop()?.trim();
                    const groupMatch = line.match(/group-title="([^"]*)"/);
                    const logoMatch = line.match(/tvg-logo="([^"]*)"/);

                    currentChannel = {
                        name: name || 'Chaîne inconnue',
                        group: groupMatch ? groupMatch[1] : 'Non classé',
                        logo: logoMatch ? logoMatch[1] : '',
                    };
                } else if (line.trim() && !line.startsWith('#')) {
                    currentChannel.url = line.trim();
                    if (currentChannel.group && currentChannel.name && currentChannel.url) {
                        if (!parsedData[currentChannel.group]) {
                            parsedData[currentChannel.group] = [];
                        }
                        parsedData[currentChannel.group].push(currentChannel as Channel);
                        currentChannel = {};
                    }
                }
            }
            setChannelsByCountry(parsedData);
        };
        
        fetchM3uPlaylist();
    }, []);

    const handleSelectCountry = (country: string) => {
        setSelectedCountry(country);
        setChannelSearchTerm(''); // Reset search when changing country
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
                <div key={selectedCountry}> {/* Key change triggers animation */}
                    <SearchInput 
                        placeholder={`Rechercher dans ${selectedCountry}...`}
                        value={channelSearchTerm}
                        onChange={setChannelSearchTerm}
                    />
                    <ChannelGrid 
                        channels={filteredChannels}
                        onSelect={handleSelectChannel}
                    />
                </div>
            );
        }
        return (
            <div key="country-list" className="max-w-lg mx-auto"> {/* Centered content */}
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

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);