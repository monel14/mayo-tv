export interface Channel {
    name: string;
    group: string;
    logo: string;
    url: string;
    status?: 'unknown' | 'working' | 'error' | 'checking';
    // Métadonnées étendues
    tvgId?: string;
    tvgName?: string;
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
    // Métadonnées dérivées
    category?: string;
    language?: string;
    country?: string;
    quality?: 'SD' | 'HD' | 'FHD' | '4K' | 'Unknown';
    type?: 'TV' | 'Radio' | 'Movie' | 'Series' | 'Sport' | 'News' | 'Music' | 'Kids' | 'Adult' | 'Other';
}

export type ChannelsByCountry = Record<string, Channel[]>;