#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validation de la configuration MAYO TV...\n');

let hasErrors = false;

// Vérifier package.json
console.log('📦 Vérification du package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(path.dirname(__dirname), 'package.json'), 'utf8'));
    
    // Vérifier React
    if (packageJson.dependencies.react === '18.2.0') {
        console.log('✅ React 18.2.0 - OK');
    } else {
        console.log('❌ React version incorrecte:', packageJson.dependencies.react);
        hasErrors = true;
    }
    
    // Vérifier React-DOM
    if (packageJson.dependencies['react-dom'] === '18.2.0') {
        console.log('✅ React-DOM 18.2.0 - OK');
    } else {
        console.log('❌ React-DOM version incorrecte:', packageJson.dependencies['react-dom']);
        hasErrors = true;
    }
    
    // Vérifier Video.js
    if (packageJson.dependencies['video.js']) {
        console.log('✅ Video.js présent - OK');
    } else {
        console.log('❌ Video.js manquant');
        hasErrors = true;
    }
    
} catch (error) {
    console.log('❌ Erreur lecture package.json:', error.message);
    hasErrors = true;
}

// Vérifier index.html
console.log('\n🌐 Vérification du index.html...');
try {
    const htmlContent = fs.readFileSync(path.join(path.dirname(__dirname), 'index.html'), 'utf8');
    
    if (htmlContent.includes('react@18.2.0')) {
        console.log('✅ Import map React 18.2.0 - OK');
    } else {
        console.log('❌ Import map React incorrect');
        hasErrors = true;
    }
    
    if (htmlContent.includes('/src/main.tsx')) {
        console.log('✅ Script principal - OK');
    } else {
        console.log('❌ Script principal manquant');
        hasErrors = true;
    }
    
} catch (error) {
    console.log('❌ Erreur lecture index.html:', error.message);
    hasErrors = true;
}

// Vérifier les fichiers principaux
console.log('\n📁 Vérification des fichiers...');
const requiredFiles = [
    'src/main.tsx',
    'src/ModernApp.tsx',
    'src/types/index.ts',
    'src/utils/advancedM3uParser.ts',
    'src/hooks/useOptimizedChannels.ts',
    'src/components/ui/ThemeProvider.tsx'
];

const projectRoot = path.dirname(__dirname);
requiredFiles.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file} - OK`);
    } else {
        console.log(`❌ ${file} - MANQUANT`);
        hasErrors = true;
    }
});

// Vérifier tsconfig.json
console.log('\n⚙️  Vérification du tsconfig.json...');
try {
    const tsConfig = JSON.parse(fs.readFileSync(path.join(path.dirname(__dirname), 'tsconfig.json'), 'utf8'));
    
    if (tsConfig.compilerOptions.jsx === 'react-jsx') {
        console.log('✅ JSX Transform - OK');
    } else {
        console.log('❌ JSX Transform incorrect');
        hasErrors = true;
    }
    
} catch (error) {
    console.log('❌ Erreur lecture tsconfig.json:', error.message);
    hasErrors = true;
}

// Résultat final
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ VALIDATION ÉCHOUÉE - Des erreurs ont été détectées');
    console.log('\n💡 Solutions:');
    console.log('   1. Exécuter: npm run clean');
    console.log('   2. Vérifier les fichiers manquants');
    console.log('   3. Consulter VERSION_CHECK.md');
    process.exit(1);
} else {
    console.log('✅ VALIDATION RÉUSSIE - Configuration correcte !');
    console.log('\n🎉 MAYO TV est prêt à être lancé:');
    console.log('   npm run dev');
}
console.log('='.repeat(50));