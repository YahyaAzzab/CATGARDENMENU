# Cat's Garden — Menu Digital — Documentation Technique

> Document de passation pour qu'une autre IA ou développeur puisse reprendre le projet.

---

## 1. Contexte & Objectif

**Cat's Garden** est un café-restaurant à thème chat à **Fès, Maroc**.
Le menu digital est accessible par **QR code / NFC** sur les tables.

- **100% mobile-first** (360–430 px), adapté tablette/desktop
- **Bilingue** : FR (défaut), EN — structure i18n prête pour AR (RTL)
- **Aucun backend** : toutes les données sont dans des fichiers TypeScript typés

### Liens utiles
- Instagram : https://www.instagram.com/catsgardenfes/
- Crédit footer : [Bitaqa](https://bitaqa-project.vercel.app/fr)

---

## 2. Stack Technique

| Techno | Version | Rôle |
|--------|---------|------|
| **Vite** | 6.x | Bundler / Dev server |
| **React** | 19.x | UI Framework |
| **TypeScript** | 5.x | Typage strict |
| **Tailwind CSS** | v4 | Utility-first CSS (via `@import "tailwindcss"`) |
| **Framer Motion** | 12.x | Animations (splash, cards, bottom sheet) |

### Commandes
```bash
npm run dev      # Dev server → http://localhost:5173/
npm run build    # Build production
npx tsc --noEmit # Type-check sans build
```

---

## 3. Arborescence des fichiers

```
src/
├── App.tsx                    # Orchestrateur principal (splash → menu)
├── config.ts                  # Liens externes (WhatsApp, Instagram, Maps)
├── index.css                  # Design system complet (thème, CSS custom)
├── main.tsx                   # Point d'entrée React
├── vite-env.d.ts
│
├── components/
│   ├── CategoryNav.tsx        # Pills de catégories sticky + scrollspy
│   ├── FilterChips.tsx        # Chips de filtre (Végétarien, Chocolat, etc.)
│   ├── Footer.tsx             # Footer avec réseaux sociaux + crédit Bitaqa
│   ├── Header.tsx             # Header compact sticky (logo + lang switch)
│   ├── HeroSection.tsx        # Section d'accueil + badge table
│   ├── Icons.tsx              # Icônes SVG inline (Whiskers, PawPrint, etc.)
│   ├── LanguageSwitcher.tsx   # Bascule FR/EN
│   ├── MenuItemCard.tsx       # Carte produit tappable avec paw effect
│   ├── ProductBottomSheet.tsx # Bottom sheet détails produit (swipe-down)
│   ├── SearchBar.tsx          # Barre de recherche expandable
│   └── UIComponents.tsx       # Badge et Chip réutilisables
│
├── data/
│   ├── menu.ts                # 138 articles, 12 catégories, tout le menu
│   └── types.ts               # Interfaces TypeScript (MenuItem, Category, etc.)
│
└── i18n/
    ├── I18nContext.tsx         # Context React pour la langue courante
    └── translations.ts        # Dictionnaires FR/EN complets
```

---

## 4. Architecture & Flux de Données

### 4.1 Flux principal (App.tsx)

```
URL (?table=5) → App
  ├── SplashScreen (une seule fois par session via sessionStorage)
  │   └── Transition iris → MenuPage
  └── MenuPage
      ├── Header (sticky, logo + FR/EN)
      ├── HeroSection (table badge si ?table=X)
      ├── SearchBar (expand au tap, filtre instantané)
      ├── CategoryNav (pills sticky, scrollspy via IntersectionObserver)
      ├── FilterChips (Végétarien, Chocolat, Traditionnel, Signature, Populaire)
      ├── Sections de catégories
      │   └── MenuItemCard[] (fade-in au scroll, tap → bottom sheet)
      ├── Footer (Instagram, Maps, Review, WhatsApp, crédit Bitaqa)
      └── ProductBottomSheet (overlay, swipe-down, détails complets)
```

### 4.2 Données (src/data/)

**`types.ts`** définit :
- `Category` : id, nameFr/En, noteFr/En, icon, order
- `MenuItem` : id, categoryId, nameFr/En, descriptionFr/En, price, priceNoteFr/En, servingNoteFr/En, tags[], badges[], available, options[], supplements[], includedChoices[]
- `Tag` : union type (vegetarian, vegan, chocolate, spicy, traditional, hot, cold, etc.)
- `Badge` : 'new' | 'signature' | 'popular'

**`menu.ts`** contient :
- 12 catégories (brunch, a-la-carte, catffee, chocomelk, thes, jus, smoothies, milkshakes, cocktails, burgers, desserts, sharing)
- 138 articles avec toutes les données (prix, descriptions, tags, options, suppléments, choix inclus)
- Fonctions utilitaires : `getItemsByCategory()`, `getCategoryById()`

### 4.3 Internationalisation (src/i18n/)

- `I18nContext.tsx` : React Context avec `locale`, `setLocale`, `t` (traductions), `localized(obj, field)` helper
- `translations.ts` : Dictionnaire complet avec clés pour splash, header, hero, filtres, tags, badges, bottom sheet, footer
- Chaque `MenuItem` et `Category` a des champs `*Fr` et `*En`
- Pour ajouter l'arabe : ajouter `ar` à `Locale`, créer les traductions, ajouter les champs `*Ar` aux types, gérer RTL dans le CSS

---

## 5. Direction Artistique

### 5.1 Palette

| Nom | Hex | Usage |
|-----|-----|-------|
| Cream | `#FDF6EC` | Fond principal |
| Sage | `#8BA888` | Accents verts "jardin" |
| Sage Dark | `#6B8E6B` | Prix, liens actifs |
| Peach | `#E8A87C` | Accents "poil de chat" |
| Chocolate | `#3E2723` | Texte principal |
| Chocolate Muted | `#8D6E63` | Texte secondaire |
| Rose | `#F2C6C2` | Badge "Populaire" |

### 5.2 Typographie

- **Display** : Libre Baskerville (serif, élégant) — titres, noms de plats, prix
- **Body** : Nunito (sans-serif, arrondi) — corps de texte, descriptions, UI

### 5.3 Iconographie

- **Aucun emoji dans l'UI** (sauf dans les filter chips par choix)
- **SVG inline** dans `Icons.tsx` : Whiskers, PawPrint, SleepingCat, CategoryIcon (brunch, coffee, dessert, etc.)
- Chaque catégorie a un `icon` string (ex: 'brunch', 'coffee') mappé par `CategoryIcon`

---

## 6. Composants — Détails Techniques

### 6.1 SplashScreen

- **Séquence animée** : lettres une par une (spring) → oreilles SVG → yeux avec clignement → queue (path drawing) → tagline fade-in
- **Transition de sortie** : clip-path circulaire (iris de chat)
- **Session** : `sessionStorage.setItem('catsgarden_splash', '1')` — ne joue qu'une fois
- **Skip** : tap n'importe où
- **Accessibilité** : `useReducedMotion()` → version simple en fondu

### 6.2 CategoryNav (Scrollspy)

- **Sticky** à `top: 52px` (sous le header)
- **Scrollspy** via `IntersectionObserver` dans App.tsx — met à jour `scrollspyCategory` (visuel seulement, ne scrolle pas la page)
- **Bug fix important** : `scrollIntoView()` remplacé par `container.scrollTo({ left })` pour éviter le hijack du scroll vertical
- **Séparation claire** : `activeCategory` (sélection manuelle) vs `scrollspyHighlight` (visuel passif)

### 6.3 ProductBottomSheet

- **Spring animation** : `type: 'spring', damping: 30, stiffness: 350`
- **Swipe-down** : `drag="y"` avec `onDragEnd` qui ferme si `offset.y > 100` ou `velocity.y > 500`
- **Body scroll lock** : `document.body.style.overflow = 'hidden'` quand ouvert
- **ESC** : ferme via `keydown` listener
- **Contenu** : image placeholder, nom/prix, badges, composition, tags, options, choix inclus (brunch), suppléments, note de service

### 6.4 SearchBar

- **Etat fermé** : icône loupe (44×44 touch target)
- **Etat ouvert** : champ plein largeur avec animation morph
- **Font-size 16px** : empêche le zoom iOS à la mise au point
- **Filtre** : instantané sur `nameFr`, `nameEn`, `descriptionFr`, `descriptionEn`

### 6.5 FilterChips

- 5 filtres : Végétarien (`tags.includes('vegetarian')`), Chocolat, Traditionnel, Signature (`badges.includes('signature')`), Populaire
- **Logique** : tous les filtres actifs doivent matcher (AND)
- **Scroll horizontal** avec `scrollbar-hide`

### 6.6 MenuItemCard

- **Layout** : image placeholder 72×72 + contenu (nom, description tronquée 2 lignes, prix)
- **Paw tap effect** : SVG patte qui apparaît à l'endroit du clic et scale up avec fade out
- **Fade-in** : `useInView` de Framer Motion, une seule fois, margin -30px
- **Indisponible** : `opacity-50 grayscale` + badge "Épuisé"
- **Brunch hint** : affiche "✦ Inclus : Boisson chaude + Jus" sous la carte

---

## 7. CSS & Design System (index.css)

Le fichier CSS utilise **Tailwind CSS v4** avec `@theme` pour les custom properties :

```css
@theme {
  --color-cream: #FDF6EC;
  --color-sage: #8BA888;
  --font-display: 'Libre Baskerville', serif;
  --font-body: 'Nunito', sans-serif;
  /* ... etc */
}
```

### Classes custom importantes
- `.card-menu` : carte blanche avec ombre et border sage
- `.category-pill` / `.category-pill-active` : pills de navigation
- `.badge-new`, `.badge-signature`, `.badge-popular` : badges colorés
- `.chip-vegetarian`, `.chip-chocolate`, etc. : chips de tag
- `.price-tag` : prix en Libre Baskerville vert sage
- `.lang-switch` : toggle FR/EN
- `.paw-watermark` : patte décorative fixe en bas à droite
- `.category-note` : note italique avec bordure gauche sage
- `.scrollbar-hide` : masque les scrollbars

### Responsive
- **Mobile** (défaut) : plein écran
- **Tablette** (≥768px) : max-width 520px centré, fond décoratif avec radial gradients
- **Desktop** (≥1024px) : max-width 480px

### Accessibilité
- `prefers-reduced-motion` : désactive toutes les animations
- `:focus-visible` : outline sage 2px
- `-webkit-tap-highlight-color: transparent` : supprime le highlight au tap
- `env(safe-area-inset-*)` : support iPhone notch

---

## 8. Configuration (config.ts)

```typescript
export const config = {
  whatsappNumber: '212600000000',    // TODO: numéro réel
  instagramUrl: 'https://www.instagram.com/catsgardenfes/',
  googleMapsUrl: '...',              // TODO: lien exact
  googleReviewsUrl: '...',           // TODO: lien exact
  createdBy: 'DevX',                 // Non affiché (remplacé par Bitaqa en dur dans Footer.tsx)
};
```

---

## 9. Décisions de design prises

| Décision | Raison |
|----------|--------|
| Pas d'emoji dans l'UI (sauf filter chips) | Direction artistique premium, SVG inline |
| `scrollIntoView` → `scrollTo({ left })` | Bug fix : empêche le hijack vertical |
| Scrollspy en prop séparée (`scrollspyHighlight`) | Sépare l'état visuel du filtre actif |
| Font-size 16px sur les inputs | Empêche le zoom automatique iOS |
| `sessionStorage` pour le splash | Joue une seule fois par onglet |
| Body scroll lock dans le bottom sheet | Empêche le double-scroll mobile |
| Pas d'étiquette "Contient du porc" | Supprimé — client confirme que rien ne contient du porc |
| Crédit footer "Bitaqa" cliquable | Demande explicite du client |

---

## 10. Bugs connus & Points à compléter

### TODO avant mise en production

- [ ] **config.ts** : Renseigner le vrai numéro WhatsApp
- [ ] **config.ts** : Renseigner le lien Google Maps exact
- [ ] **config.ts** : Renseigner le lien Google Reviews exact
- [ ] **menu.ts** : Prix des 3 burgers à confirmer (actuellement `price: null`, affichent "Prix à confirmer")
- [ ] **Images** : Remplacer les placeholders (icônes de catégorie) par de vraies photos de plats
- [ ] **SEO** : Ajouter `<meta>` description dynamique et Open Graph tags dans `index.html`
- [ ] **PWA** : Envisager un `manifest.json` + service worker pour mode hors-ligne
- [ ] **Analytics** : Intégrer un tracking (Google Analytics, Plausible, etc.)

### Points d'attention

- Le CSS `@import` Google Fonts doit rester **avant** `@import "tailwindcss"` sinon PostCSS affiche un warning
- Tailwind v4 utilise `@theme` au lieu de `tailwind.config.js` — ne pas essayer de migrer vers la config classique
- Le splash utilise `clip-path: circle()` pour la transition iris — pas supporté sur IE (non pertinent pour mobile)

---

## 11. Comment ajouter un nouvel article au menu

1. Ouvrir `src/data/menu.ts`
2. Trouver la catégorie appropriée (ex: la section `// ─── Catffee ───`)
3. Ajouter un objet `MenuItem` :

```typescript
{
  id: 'catffee-nouveau',
  categoryId: 'catffee',
  nameFr: 'Nouveau Café',
  nameEn: 'New Coffee',
  descriptionFr: 'Description en français',
  descriptionEn: 'Description in English',
  price: 25,
  priceNoteFr: null,
  priceNoteEn: null,
  servingNoteFr: null,
  servingNoteEn: null,
  tags: ['hot'],
  badges: ['new'],
  available: true,
  options: [
    { nameFr: 'Lait d\'avoine', nameEn: 'Oat milk', extraPrice: 5 },
  ],
  supplements: [],
  includedChoices: [],
},
```

4. TypeScript vous guidera si un champ manque.

---

## 12. Comment ajouter une nouvelle langue (ex: Arabe)

1. Dans `translations.ts` : ajouter `'ar'` au type `Locale`, créer le dictionnaire `ar: { ... }`
2. Dans `types.ts` : ajouter `nameAr`, `descriptionAr`, etc. aux interfaces
3. Dans `menu.ts` : ajouter les champs arabes à chaque item
4. Dans `I18nContext.tsx` : mettre à jour le context
5. Dans `LanguageSwitcher.tsx` : ajouter le bouton AR
6. Dans `index.css` : ajouter les styles RTL (`[dir="rtl"]`)
7. Dans `App.tsx` : appliquer `dir="rtl"` quand `locale === 'ar'`

---

*Dernière mise à jour : 15 octobre 2026*
