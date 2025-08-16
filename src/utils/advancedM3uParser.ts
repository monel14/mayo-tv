import { Channel, ChannelsByCountry } from '../types';

interface ParsedMetadata {
    tvgId?: string;
    tvgName?: string;
    tvgLogo?: string;
    tvgLanguage?: string;
    tvgCountry?: string;
    tvgShift?: string;
    groupTitle?: string;
    radioFlag?: boolean;
    aspectRatio?: string;
    resolution?: string;
    frameRate?: string;
    audioCodec?: string;
    videoCodec?: string;
}

export type OrganizationMode = 
    | 'country'      // Par pays (défaut)
    | 'category'     // Par catégorie (Sport, News, etc.)
    | 'language'     // Par langue
    | 'quality'      // Par qualité (HD, SD, etc.)
    | 'type'         // Par type (TV, Radio, etc.)
    | 'alphabetical' // Alphabétique
    | 'mixed';       // Vue mixte intelligente

// Patterns pour détecter les catégories
const CATEGORY_PATTERNS = {
    sport: /sport|football|soccer|basketball|tennis|golf|hockey|racing|f1|formula|olympic/i,
    news: /news|info|actualit|journal|bfm|cnn|bbc|france24|euronews/i,
    music: /music|mtv|mcm|trace|nrj|radio|fm|hits|rock|pop|jazz/i,
    movies: /cine|movie|film|cinema|paramount|warner|disney|netflix/i,
    kids: /kids|enfant|junior|cartoon|disney|nickelodeon|gulli|tiji/i,
    documentary: /doc|discovery|national|geographic|history|arte|planete/i,
    entertainment: /entertainment|divertissement|reality|show|comedy/i,
    adult: /adult|xxx|porn|sexy|hot|18\+/i,
    religious: /relig|church|islam|christian|catholic|spiritual/i,
    shopping: /shop|shopping|teleachat|qvc|hsn/i
};

// Patterns pour détecter la qualité
const QUALITY_PATTERNS = {
    '4K': /4k|uhd|2160p/i,
    'FHD': /fhd|1080p|full.*hd/i,
    'HD': /hd|720p/i,
    'SD': /sd|480p|576p/i
};

// Patterns pour détecter le type
const TYPE_PATTERNS = {
    radio: /radio|fm|am|\bfm\b/i,
    tv: /tv|television/i
};

export class AdvancedM3uParser {
    private static extractMetadata(extinf: string): ParsedMetadata {
        const metadata: ParsedMetadata = {};
        
        // Extraction des attributs TVG
        const patterns = {
            tvgId: /tvg-id="([^"]*)"/i,
            tvgName: /tvg-name="([^"]*)"/i,
            tvgLogo: /tvg-logo="([^"]*)"/i,
            tvgLanguage: /tvg-language="([^"]*)"/i,
            tvgCountry: /tvg-country="([^"]*)"/i,
            tvgShift: /tvg-shift="([^"]*)"/i,
            groupTitle: /group-title="([^"]*)"/i,
            aspectRatio: /aspect-ratio="([^"]*)"/i,
            resolution: /resolution="([^"]*)"/i,
            frameRate: /frame-rate="([^"]*)"/i,
            audioCodec: /audio-codec="([^"]*)"/i,
            videoCodec: /video-codec="([^"]*)"/i
        };

        Object.entries(patterns).forEach(([key, pattern]) => {
            const match = extinf.match(pattern);
            if (match) {
                (metadata as any)[key] = match[1];
            }
        });

        // Détection du flag radio
        metadata.radioFlag = /radio="true"/i.test(extinf);

        return metadata;
    }

    private static detectCategory(name: string, group: string): string {
        const searchText = `${name} ${group}`.toLowerCase();
        
        for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
            if (pattern.test(searchText)) {
                return category;
            }
        }
        
        return 'general';
    }

    private static detectQuality(name: string, metadata: ParsedMetadata): Channel['quality'] {
        const searchText = `${name} ${metadata.resolution || ''}`.toLowerCase();
        
        for (const [quality, pattern] of Object.entries(QUALITY_PATTERNS)) {
            if (pattern.test(searchText)) {
                return quality as Channel['quality'];
            }
        }
        
        return 'Unknown';
    }

    private static detectType(name: string, group: string, metadata: ParsedMetadata): Channel['type'] {
        if (metadata.radioFlag) return 'Radio';
        
        const searchText = `${name} ${group}`.toLowerCase();
        
        // Détection spécifique par catégorie
        if (CATEGORY_PATTERNS.sport.test(searchText)) return 'Sport';
        if (CATEGORY_PATTERNS.news.test(searchText)) return 'News';
        if (CATEGORY_PATTERNS.music.test(searchText)) return 'Music';
        if (CATEGORY_PATTERNS.movies.test(searchText)) return 'Movie';
        if (CATEGORY_PATTERNS.kids.test(searchText)) return 'Kids';
        if (TYPE_PATTERNS.radio.test(searchText)) return 'Radio';
        
        return 'TV';
    }

    private static normalizeCountry(country?: string, group?: string): string {
        if (country) return country;
        if (!group) return 'Unknown';
        
        // Normalisation des noms de pays courants
        const countryMap: Record<string, string> = {
            'fr': 'France',
            'france': 'France',
            'french': 'France',
            'uk': 'United Kingdom',
            'gb': 'United Kingdom',
            'britain': 'United Kingdom',
            'us': 'United States',
            'usa': 'United States',
            'america': 'United States',
            'de': 'Germany',
            'deutschland': 'Germany',
            'german': 'Germany',
            'es': 'Spain',
            'spain': 'Spain',
            'spanish': 'Spain',
            'it': 'Italy',
            'italia': 'Italy',
            'italian': 'Italy',
            'pt': 'Portugal',
            'portugal': 'Portugal',
            'portuguese': 'Portugal',
            'br': 'Brazil',
            'brasil': 'Brazil',
            'brazil': 'Brazil',
            'ca': 'Canada',
            'canada': 'Canada',
            'canadian': 'Canada'
        };

        const normalized = group.toLowerCase();
        return countryMap[normalized] || group;
    }

    private static normalizeLanguage(language?: string, country?: string): string {
        if (language) return language;
        
        // Déduction de la langue depuis le pays
        const languageMap: Record<string, string> = {
            'France': 'Français',
            'United Kingdom': 'English',
            'United States': 'English',
            'Germany': 'Deutsch',
            'Spain': 'Español',
            'Italy': 'Italiano',
            'Portugal': 'Português',
            'Brazil': 'Português',
            'Canada': 'English/Français'
        };

        return languageMap[country || ''] || 'Unknown';
    }

    public static parseM3uPlaylist(m3uText: string): ChannelsByCountry {
        const lines = m3uText.split('\n');
        const channels: Channel[] = [];
        let currentChannel: Partial<Channel> = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('#EXTINF:')) {
                // Extraction du nom
                const commaIndex = line.lastIndexOf(',');
                const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Chaîne inconnue';

                // Extraction des métadonnées
                const metadata = this.extractMetadata(line);

                // Création du channel avec métadonnées enrichies
                currentChannel = {
                    name: name || 'Chaîne inconnue',
                    group: metadata.groupTitle || 'Non classé',
                    logo: metadata.tvgLogo || '',
                    tvgId: metadata.tvgId,
                    tvgName: metadata.tvgName,
                    tvgLanguage: metadata.tvgLanguage,
                    tvgCountry: metadata.tvgCountry,
                    tvgShift: metadata.tvgShift,
                    groupTitle: metadata.groupTitle,
                    radioFlag: metadata.radioFlag,
                    aspectRatio: metadata.aspectRatio,
                    resolution: metadata.resolution,
                    frameRate: metadata.frameRate,
                    audioCodec: metadata.audioCodec,
                    videoCodec: metadata.videoCodec
                };

                // Enrichissement automatique
                currentChannel.category = this.detectCategory(name, metadata.groupTitle || '');
                currentChannel.quality = this.detectQuality(name, metadata);
                currentChannel.type = this.detectType(name, metadata.groupTitle || '', metadata);
                currentChannel.country = this.normalizeCountry(metadata.tvgCountry, metadata.groupTitle);
                currentChannel.language = this.normalizeLanguage(metadata.tvgLanguage, currentChannel.country);

            } else if (line && !line.startsWith('#')) {
                currentChannel.url = line;
                
                if (currentChannel.name && currentChannel.url) {
                    channels.push(currentChannel as Channel);
                    currentChannel = {};
                }
            }
        }

        // Organisation par pays (défaut)
        return this.organizeChannels(channels, 'country');
    }

    public static organizeChannels(channels: Channel[], mode: OrganizationMode): ChannelsByCountry {
        const organized: ChannelsByCountry = {};

        channels.forEach(channel => {
            let key: string;

            switch (mode) {
                case 'category':
                    key = channel.category || 'Autres';
                    break;
                case 'language':
                    key = channel.language || 'Langue inconnue';
                    break;
                case 'quality':
                    key = channel.quality || 'Qualité inconnue';
                    break;
                case 'type':
                    key = channel.type || 'Type inconnu';
                    break;
                case 'alphabetical':
                    key = channel.name.charAt(0).toUpperCase();
                    break;
                case 'mixed':
                    // Organisation intelligente : pays > catégorie
                    key = `${channel.country} - ${channel.category}`;
                    break;
                case 'country':
                default:
                    key = channel.country || channel.group || 'Non classé';
                    break;
            }

            if (!organized[key]) {
                organized[key] = [];
            }
            organized[key].push(channel);
        });

        // Tri des groupes et des chaînes
        const sortedData: ChannelsByCountry = {};
        Object.keys(organized)
            .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
            .forEach(key => {
                sortedData[key] = organized[key].sort((a, b) => 
                    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
                );
            });

        return sortedData;
    }

    public static getAvailableOrganizations(channels: Channel[]): Array<{mode: OrganizationMode, label: string, count: number}> {
        const organizations = [
            { mode: 'country' as OrganizationMode, label: 'Par pays', count: new Set(channels.map(c => c.country)).size },
            { mode: 'category' as OrganizationMode, label: 'Par catégorie', count: new Set(channels.map(c => c.category)).size },
            { mode: 'language' as OrganizationMode, label: 'Par langue', count: new Set(channels.map(c => c.language)).size },
            { mode: 'quality' as OrganizationMode, label: 'Par qualité', count: new Set(channels.map(c => c.quality)).size },
            { mode: 'type' as OrganizationMode, label: 'Par type', count: new Set(channels.map(c => c.type)).size },
            { mode: 'alphabetical' as OrganizationMode, label: 'Alphabétique', count: 26 },
            { mode: 'mixed' as OrganizationMode, label: 'Vue mixte', count: new Set(channels.map(c => `${c.country}-${c.category}`)).size }
        ];

        return organizations.filter(org => org.count > 1);
    }
}