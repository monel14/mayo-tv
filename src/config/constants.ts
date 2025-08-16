export const rawM3uUrl = 'https://iptv-org.github.io/iptv/index.country.m3u';

// Multiple CORS proxies for fallback
export const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://corsproxy.io/?'
];

export const CORS_PROXY_URL = CORS_PROXIES[0];
export const M3U_URL = `${CORS_PROXY_URL}${encodeURIComponent(rawM3uUrl)}`;