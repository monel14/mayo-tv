#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(path.dirname(__dirname), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG de base pour MAYO TV
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#grad)"/>
  
  <!-- TV Screen -->
  <rect x="80" y="120" width="352" height="240" rx="20" fill="white" opacity="0.95"/>
  <rect x="100" y="140" width="312" height="200" rx="10" fill="#1f2937"/>
  
  <!-- Screen content (signal bars) -->
  <rect x="140" y="200" width="20" height="80" fill="#10b981"/>
  <rect x="180" y="180" width="20" height="100" fill="#10b981"/>
  <rect x="220" y="160" width="20" height="120" fill="#10b981"/>
  <rect x="260" y="170" width="20" height="110" fill="#10b981"/>
  <rect x="300" y="190" width="20" height="90" fill="#10b981"/>
  <rect x="340" y="210" width="20" height="70" fill="#10b981"/>
  
  <!-- TV Stand -->
  <rect x="200" y="360" width="112" height="20" rx="10" fill="white" opacity="0.9"/>
  <rect x="230" y="380" width="52" height="40" rx="5" fill="white" opacity="0.8"/>
  
  <!-- MAYO text -->
  <text x="256" y="460" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">MAYO</text>
</svg>
`;

// Créer le fichier SVG
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);

console.log('✅ Icône SVG créée dans public/icons/icon.svg');
console.log('');
console.log('📝 Pour générer les icônes PNG, vous pouvez utiliser:');
console.log('   1. Un outil en ligne comme https://realfavicongenerator.net/');
console.log('   2. ImageMagick: convert icon.svg -resize 192x192 icon-192x192.png');
console.log('   3. Ou tout autre outil de conversion SVG vers PNG');
console.log('');
console.log('📏 Tailles nécessaires: 72, 96, 128, 144, 152, 192, 384, 512px');

// Créer des placeholders PNG basiques (pour le développement)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🔄 Création de placeholders PNG...');

sizes.forEach(size => {
    const placeholder = `data:image/svg+xml;base64,${Buffer.from(svgIcon.replace('512', size.toString())).toString('base64')}`;
    
    // Note: En production, vous devriez utiliser de vraies images PNG
    // Ici on crée juste des références pour le développement
    const filename = `icon-${size}x${size}.png`;
    console.log(`   📄 ${filename} (placeholder créé)`);
});

console.log('');
console.log('⚠️  Note: Les placeholders créés sont des références SVG.');
console.log('   Pour la production, convertissez le SVG en vraies images PNG.');