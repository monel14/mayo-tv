import { CORS_PROXIES } from '../config/constants';

export interface ProxyResult {
  url: string;
  proxyIndex: number;
}

export class CorsProxyManager {
  private static currentProxyIndex = 0;
  private static failedProxies = new Set<number>();
  private static lastResetTime = Date.now();
  private static readonly RESET_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static getCurrentProxy(): ProxyResult {
    // Reset failed proxies every 5 minutes
    if (Date.now() - this.lastResetTime > this.RESET_INTERVAL) {
      this.failedProxies.clear();
      this.currentProxyIndex = 0;
      this.lastResetTime = Date.now();
    }

    // Find next working proxy
    let attempts = 0;
    while (attempts < CORS_PROXIES.length) {
      if (!this.failedProxies.has(this.currentProxyIndex)) {
        const proxy = CORS_PROXIES[this.currentProxyIndex];
        return {
          url: proxy,
          proxyIndex: this.currentProxyIndex
        };
      }
      this.currentProxyIndex = (this.currentProxyIndex + 1) % CORS_PROXIES.length;
      attempts++;
    }

    // If all proxies failed, reset and use first one
    this.failedProxies.clear();
    this.currentProxyIndex = 0;
    return {
      url: CORS_PROXIES[0],
      proxyIndex: 0
    };
  }

  static markProxyAsFailed(proxyIndex: number) {
    this.failedProxies.add(proxyIndex);
    console.warn(`CORS proxy ${CORS_PROXIES[proxyIndex]} marked as failed`);
  }

  static getProxiedUrl(originalUrl: string): { url: string; proxyIndex: number } {
    const { url: proxyUrl, proxyIndex } = this.getCurrentProxy();
    
    // Handle different proxy URL formats
    let proxiedUrl: string;
    if (proxyUrl.includes('allorigins.win')) {
      proxiedUrl = `${proxyUrl}${encodeURIComponent(originalUrl)}`;
    } else if (proxyUrl.includes('thingproxy.freeboard.io')) {
      proxiedUrl = `${proxyUrl}${originalUrl}`;
    } else {
      // Default format for corsproxy.io and cors-anywhere
      proxiedUrl = `${proxyUrl}${encodeURIComponent(originalUrl)}`;
    }

    return { url: proxiedUrl, proxyIndex };
  }

  static async testProxy(proxyUrl: string, testUrl: string = 'https://httpbin.org/get'): Promise<boolean> {
    try {
      const { url } = this.getProxiedUrl(testUrl);
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}