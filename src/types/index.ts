export interface Channel {
    name: string;
    group: string;
    logo: string;
    url: string;
    status?: 'unknown' | 'working' | 'error' | 'checking';
}

export type ChannelsByCountry = Record<string, Channel[]>;