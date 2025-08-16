#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer des icônes PNG temporaires pour le développement
const iconsDir = path.join(path.dirname(__dirname), 'public', 'icons');

// SVG de base en format data URL
const createIconDataURL = (size) => {
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#grad)"/>
  <rect x="80" y="120" width="352" height="240" rx="20" fill="white" opacity="0.95"/>
  <rect x="100" y="140" width="312" height="200" rx="10" fill="#1f2937"/>
  <rect x="140" y="200" width="20" height="80" fill="#10b981"/>
  <rect x="180" y="180" width="20" height="100" fill="#10b981"/>
  <rect x="220" y="160" width="20" height="120" fill="#10b981"/>
  <rect x="260" y="170" width="20" height="110" fill="#10b981"/>
  <rect x="300" y="190" width="20" height="90" fill="#10b981"/>
  <rect x="340" y="210" width="20" height="70" fill="#10b981"/>
  <rect x="200" y="360" width="112" height="20" rx="10" fill="white" opacity="0.9"/>
  <rect x="230" y="380" width="52" height="40" rx="5" fill="white" opacity="0.8"/>
  <text x="256" y="460" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">MAYO</text>
</svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// Créer un fichier HTML temporaire pour convertir SVG en PNG
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const htmlConverter = `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Converter</title>
</head>
<body>
    <canvas id="canvas" style="display: none;"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        const sizes = ${JSON.stringify(sizes)};
        let currentIndex = 0;
        
        function convertIcon(size) {
            canvas.width = size;
            canvas.height = size;
            
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, size, size);
                
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`icon-\${size}x\${size}.png\`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    currentIndex++;
                    if (currentIndex < sizes.length) {
                        setTimeout(() => convertIcon(sizes[currentIndex]), 100);
                    }
                }, 'image/png');
            };
            
            img.src = '${createIconDataURL(512)}';
        }
        
        // Démarrer la conversion
        convertIcon(sizes[0]);
    </script>
</body>
</html>
`;

// Créer le fichier HTML temporaire
fs.writeFileSync(path.join(iconsDir, 'converter.html'), htmlConverter);

console.log('🔧 Créateur d\'icônes temporaire généré !');
console.log('');
console.log('📋 Pour créer les icônes PNG :');
console.log('   1. Ouvrez public/icons/converter.html dans votre navigateur');
console.log('   2. Les téléchargements des icônes PNG démarreront automatiquement');
console.log('   3. Déplacez les fichiers téléchargés dans public/icons/');
console.log('');
console.log('🎯 Alternative rapide : Créer des icônes placeholder...');

// Créer des icônes placeholder simples
sizes.forEach(size => {
    const placeholderSvg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#dc2626"/>
        <text x="${size/2}" y="${size/2}" font-family="Arial" font-size="${size/8}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">MAYO</text>
    </svg>`;
    
    fs.writeFileSync(
        path.join(iconsDir, `icon-${size}x${size}.svg`), 
        placeholderSvg
    );
});

console.log('✅ Icônes SVG placeholder créées pour le développement');
console.log('⚠️  Pour la production, utilisez de vraies images PNG');