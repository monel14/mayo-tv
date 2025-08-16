#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Nettoyage et installation propre de MAYO TV...\n');

// Supprimer node_modules et package-lock.json
console.log('📦 Suppression des anciens modules...');
try {
    if (fs.existsSync('node_modules')) {
        fs.rmSync('node_modules', { recursive: true, force: true });
        console.log('✅ node_modules supprimé');
    }
    
    if (fs.existsSync('package-lock.json')) {
        fs.unlinkSync('package-lock.json');
        console.log('✅ package-lock.json supprimé');
    }
} catch (error) {
    console.log('⚠️  Erreur lors du nettoyage:', error.message);
}

// Vérifier la cohérence des versions React
console.log('\n🔍 Vérification des versions React...');
const packageJson = JSON.parse(fs.readFileSync(path.join(path.dirname(__dirname), 'package.json'), 'utf8'));

const reactVersion = packageJson.dependencies.react;
const reactDomVersion = packageJson.dependencies['react-dom'];

if (reactVersion === '18.2.0' && reactDomVersion === '18.2.0') {
    console.log('✅ Versions React cohérentes (18.2.0)');
} else {
    console.log('❌ Versions React incohérentes:');
    console.log(`   React: ${reactVersion}`);
    console.log(`   React-DOM: ${reactDomVersion}`);
}

// Installation propre
console.log('\n📥 Installation des dépendances...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Installation terminée');
} catch (error) {
    console.log('❌ Erreur lors de l\'installation:', error.message);
    process.exit(1);
}

console.log('\n🎉 Nettoyage terminé ! Vous pouvez maintenant lancer:');
console.log('   npm run dev');