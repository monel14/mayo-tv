import { Channel, ChannelsByCountry } from '../types';

export const parseM3uPlaylist = (m3uText: string): ChannelsByCountry => {
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
    
    return parsedData;
};