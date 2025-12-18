# Stock AI - Backtesting Platform

Application de backtesting de stratégies de trading avec IA.

## 🚀 Installation

```bash
npm install
```

## 💻 Développement

```bash
npm run dev 
```

L'application sera disponible sur `http://localhost:5173`

## 🔨 Build

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

## 🧪 Tests

```bash
npm test
```

## 📦 Déploiement sur Cloudflare Pages

### Configuration du Build

Dans Cloudflare Pages, configurez :

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (racine du projet)

### Variables d'environnement

Aucune variable d'environnement n'est requise pour le moment.

## 🔐 Authentification

Identifiants par défaut :
- **Username**: `admin`
- **Password**: `stock2025`

## 📊 Fonctionnalités

- ✅ Backtesting de stratégies de trading
- ✅ Indicateurs techniques (SMA, EMA, RSI, ROC, MACD)
- ✅ Visualisation graphique avec lightweight-charts
- ✅ Optimisation IA des stratégies ("Think!")
- ✅ Règles personnalisables avec conditions complexes
- ✅ Support de multiples actifs (AAPL, MSFT, NVDA, TSLA, BTC, etc.)
- ✅ Authentification par session

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript 5
- **Build**: Vite
- **Charts**: lightweight-charts 4.2.0
- **Styling**: CSS Modules

## 📝 License

MIT
