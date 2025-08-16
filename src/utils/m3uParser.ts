import { Channel, ChannelsByCountry } from '../types';

export const parseM3uPlaylist = (m3uText: string): ChannelsByCountry => {
    const lines = m3uText.split('\n');
    const parsedData: ChannelsByCountry = {};
    let currentChannel: Partial<Channel> = {};

    // Pré-compiler les regex pour de meilleures performances
    const groupRegex = /group-title="([^"]*)"/;
    const logoRegex = /tvg-logo="([^"]*)"/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('#EXTINF:')) {
            // Extraction optimisée du nom
            const commaIndex = line.lastIndexOf(',');
            const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Chaîne inconnue';

            // Extraction optimisée des métadonnées
            const groupMatch = line.match(groupRegex);
            const logoMatch = line.match(logoRegex);

            currentChannel = {
                name: name || 'Chaîne inconnue',
                group: groupMatch?.[1] || 'Non classé',
                logo: logoMatch?.[1] || '',
            };
        } else if (line.trim() && !line.startsWith('#')) {
            currentChannel.url = line.trim();

            // Validation et ajout optimisés
            if (currentChannel.group && currentChannel.name && currentChannel.url) {
                const group = currentChannel.group;

                // Initialisation paresseuse du groupe
                if (!parsedData[group]) {
                    parsedData[group] = [];
                }

                parsedData[group].push(currentChannel as Channel);
                currentChannel = {};
            }
        }
    }

    // Tri des groupes pour une meilleure UX
    const sortedData: ChannelsByCountry = {};
    Object.keys(parsedData)
        .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
        .forEach(key => {
            sortedData[key] = parsedData[key];
        });

    return sortedData;
};