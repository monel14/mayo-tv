import React from 'react';
import { createRoot } from 'react-dom/client';
import { LazyModernApp } from './LazyModernApp';
import { ThemeProvider } from './components/ui/ThemeProvider';
import 'video.js/dist/video-js.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <ThemeProvider>
        <LazyModernApp />
    </ThemeProvider>
);