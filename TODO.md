# TODO – Cat's Garden Menu Digital

## ✅ Fait

- [x] Menu complet : 138 articles, 12 catégories, descriptions FR/EN
- [x] Splash screen animé (cat ears, eyes blink, tail, iris transition)
- [x] Header compact sticky avec logo + bascule FR/EN
- [x] Hero section avec badge table (?table=X)
- [x] Catégories sticky avec scrollspy (IntersectionObserver)
- [x] Recherche instantanée (filtre sur nom + description FR/EN)
- [x] Filtres chips (Végétarien, Chocolat, Traditionnel, Signature, Populaire)
- [x] Cartes produit tappables avec paw effect + fade-in au scroll
- [x] Bottom sheet produit (swipe-down, composition, options, suppléments, choix inclus)
- [x] Footer (Instagram, Maps, Review, WhatsApp) + crédit Bitaqa
- [x] Bug fix : scroll hijack par scrollIntoView → scrollTo({ left })
- [x] Suppression tag "Contient du porc" (rien ne contient du porc)
- [x] Documentation PROJECT_HANDOFF.md pour passation

## ⚠️ Prix manquants (à confirmer avec le client)

- [ ] **Gaufre Fruits Nutella** (`gaufre-fruits-nutella`) : `price: null`
- [ ] **Cat'Cheese Burger** (`burger-catcheese`) : `price: null`
- [ ] **Crispy Chicken Burger** (`burger-crispy-chicken`) : `price: null`
- [ ] **Cat's Mix Burger** (`burger-cats-mix`) : `price: null`

## 🔧 Configuration à renseigner (config.ts)

- [ ] Numéro WhatsApp réel (actuellement `212600000000`)
- [ ] Lien Google Maps exact
- [ ] Lien Google Reviews exact

## 🚀 Améliorations futures

- [ ] Ajouter les images réelles des plats (remplacer les placeholders SVG)
- [ ] Implémenter le support RTL pour l'arabe (AR) — structure i18n prête
- [ ] PWA : manifest.json + service worker pour usage offline
- [ ] SEO : meta description + Open Graph tags dans index.html
- [ ] Analytics : Google Analytics ou Plausible
- [ ] Mode admin : interface simple pour marquer un plat "épuisé" sans toucher au code
