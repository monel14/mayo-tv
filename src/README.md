# Structure du projet MAYO TV

## 📁 Organisation des fichiers

```
src/
├── components/           # Composants React
│   ├── ui/              # Composants UI réutilisables
│   │   ├── Loader.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Header.tsx
│   │   ├── StatusIndicator.tsx
│   │   ├── ImageWithFallback.tsx
│   │   └── index.ts
│   ├── icons/           # Icônes SVG
│   │   └── index.tsx
│   ├── CountryList.tsx  # Liste des pays
│   ├── ChannelGrid.tsx  # Grille des chaînes
│   ├── VideoPlayer.tsx  # Lecteur vidéo
│   ├── PlayerOverlay.tsx # Overlay du lecteur
│   └── index.ts
├── hooks/               # Hooks personnalisés
│   └── useChannels.ts   # Hook pour gérer les chaînes
├── utils/               # Utilitaires
│   ├── m3uParser.ts     # Parser M3U
│   └── channelTester.ts # Testeur de chaînes
├── types/               # Types TypeScript
│   └── index.ts
├── config/              # Configuration
│   └── constants.ts     # Constantes
├── App.tsx              # Composant principal
└── main.tsx             # Point d'entrée
```

## 🎯 Avantages de cette structure

- **Séparation des responsabilités** : Chaque fichier a un rôle spécifique
- **Réutilisabilité** : Composants UI modulaires
- **Maintenabilité** : Code organisé et facile à naviguer
- **Testabilité** : Fonctions utilitaires isolées
- **Scalabilité** : Structure extensible pour de nouvelles fonctionnalités

## 🔧 Points d'entrée

- `main.tsx` : Point d'entrée principal
- `App.tsx` : Composant racine de l'application
- `components/index.ts` : Exports des composants
- `types/index.ts` : Types TypeScript centralisés