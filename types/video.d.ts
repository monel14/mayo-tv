declare module 'video.js' {
  interface VideoJsPlayer {
    dispose(): void;
    ready(callback: () => void): void;
    play(): Promise<void>;
    on(event: string, callback: (event?: any) => void): void;
    error(): any;
  }

  interface VideoJsPlayerOptions {
    controls?: boolean;
    responsive?: boolean;
    fluid?: boolean;
    fill?: boolean;
    autoplay?: boolean;
    preload?: string;
    sources?: Array<{
      src: string;
      type: string;
    }>;
    html5?: {
      vhs?: {
        overrideNative?: boolean;
      };
    };
  }

  function videojs(element: HTMLVideoElement, options?: VideoJsPlayerOptions): VideoJsPlayer;
  export = videojs;
}