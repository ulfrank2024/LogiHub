# Design System — LOGIHUB
## Thème Smart Africain

---

## Philosophie

L'interface de LOGIHUB s'inspire du **dynamisme de l'Afrique moderne** :  
- Couleurs chaudes et riches (or, terracotta, vert forêt)  
- Motifs géométriques discrets inspirés du kente et des tissus africains  
- UI moderne, épurée — pas folklorique, mais **authentiquement africaine**  
- Avatars IA uniques pour chaque utilisateur (inclusifs, représentatifs)  
- Animations fluides (Framer Motion) pour une expérience premium

---

## Palette de couleurs

### Couleurs primaires

| Nom | Hex | Usage |
|---|---|---|
| **Or Africain** | `#D4A017` | CTA principaux, accents forts, badges |
| **Vert Forêt** | `#1B4332` | Fond sidebar, éléments de confiance |
| **Terracotta** | `#C1440E` | Alertes, statuts urgents, éléments chauds |
| **Nuit Profonde** | `#0D1B2A` | Fond dark mode, headers |

### Couleurs secondaires

| Nom | Hex | Usage |
|---|---|---|
| **Sable Chaud** | `#F5E6C8` | Fonds light mode, cards |
| **Ocre** | `#E07B39` | Hover states, icônes actives |
| **Vert Clair** | `#52B788` | Succès, statuts positifs, LIVRE |
| **Bleu Nuit** | `#1A3A5C` | Liens, info, éléments secondaires |

### Neutres

| Nom | Hex | Usage |
|---|---|---|
| `gray-950` | `#0A0A0A` | Texte principal dark |
| `gray-800` | `#1F2937` | Texte secondaire |
| `gray-200` | `#E5E7EB` | Bordures, séparateurs |
| `gray-50` | `#F9FAFB` | Fond général light |

---

## Typographie

```css
/* Titres — Modernité + Impact */
font-family: 'Syne', sans-serif;
/* Disponible sur Google Fonts — géométrique, fort, distinctif */

/* Corps de texte — Lisibilité */
font-family: 'DM Sans', sans-serif;
/* Moderne, excellent rendu à petite taille */

/* Monospace (codes de suivi, références) */
font-family: 'JetBrains Mono', monospace;
```

### Échelle typographique

| Token | Taille | Usage |
|---|---|---|
| `text-hero` | 56px / bold | Titre hero landing |
| `text-h1` | 36px / semibold | Titres de page |
| `text-h2` | 24px / semibold | Sous-titres |
| `text-h3` | 18px / medium | Titres de cards |
| `text-body` | 16px / regular | Texte courant |
| `text-sm` | 14px / regular | Labels, metadata |
| `text-xs` | 12px / medium | Badges, statuts |

---

## Motifs africains (subtils)

Utilisés en **backgrounds décoratifs uniquement** (pas sur le contenu).

```css
/* Motif kente géométrique — SVG inline ou CSS */
/* Exemple : pattern en losanges sur le hero */
background-image: url("data:image/svg+xml,...")
opacity: 0.04; /* Très subtil — ambiance, pas distraction */
```

### Règles d'usage des motifs
- Opacité max : `5%` en light mode, `8%` en dark mode
- Uniquement sur les grandes zones de fond (hero, sidebar)
- Jamais sur les cards de contenu ou les formulaires
- Couleur du motif : `#D4A017` (Or Africain)

---

## Avatars IA — DiceBear

### Bibliothèque

```bash
npm install @dicebear/core @dicebear/collection
```

### Configuration

```typescript
// src/lib/avatar.ts
import { createAvatar } from '@dicebear/core'
import { lorelei } from '@dicebear/collection'

export function generateAvatar(seed: string): string {
  const avatar = createAvatar(lorelei, {
    seed,
    // Tons de peau diversifiés et chaleureux
    backgroundColor: ['D4A017', 'C1440E', '1B4332', 'E07B39'],
    radius: 50,
    size: 80,
  })
  return avatar.toDataUri()
}
```

### Styles disponibles par rôle

| Rôle | Style DiceBear | Raison |
|---|---|---|
| `EXPEDITEUR` | `lorelei` | Artistique, chaleureux, inclusif |
| `TRANSPORTEUR` | `adventurer` | Dynamique, actif |
| `RESPONSABLE_ENTREPOT` | `personas` | Professionnel |
| `ADMIN` | `notionists` | Distinct, autorité |

### Composant UserAvatar

```tsx
// src/components/avatar/UserAvatar.tsx
// Avatar généré automatiquement depuis (userId + firstName)
// Affiche un badge de statut en ligne (online/offline)
// Sizes: sm (32px), md (48px), lg (80px), xl (120px)
```

### Règles d'affichage
- Chaque utilisateur a **toujours** son avatar (jamais d'initiales seules)
- L'avatar est généré côté client à partir du `userId` + `firstName` comme seed
- Le seed est stable → même seed = même avatar toujours
- Tooltip au survol : affiche le nom complet + rôle

---

## Animations — Framer Motion

```bash
npm install framer-motion
```

### Variantes standards (réutilisables)

```typescript
// src/lib/animations.ts

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
}

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  hover: { scale: 1.02, boxShadow: '0 8px 32px rgba(212,160,23,0.2)', transition: { duration: 0.2 } }
}
```

### Usages par composant

| Composant | Animation |
|---|---|
| Landing hero | `fadeInUp` + `staggerContainer` sur les éléments |
| Cards d'envoi | `scaleIn` à l'entrée + `cardHover` au survol |
| Sidebar | `slideInLeft` à l'ouverture |
| Notifications | `fadeInUp` depuis le bas |
| Timeline tracking | Entrée séquentielle `staggerChildren` |
| Badges de statut | Pulse animé pour statuts EN_TRANSIT |
| Modals | `scaleIn` + backdrop fade |
| Page transitions | `AnimatePresence` entre les routes |

### Règles d'animation
- Durée max : `400ms` — jamais plus (UX, pas de show-off)
- Préférer `ease-out` pour les entrées, `ease-in` pour les sorties
- Désactiver si `prefers-reduced-motion` (accessibilité)
- Pas d'animations sur les formulaires (distraction cognitive)

---

## Composants UI spécifiques au thème

### StatusBadge (statut d'envoi)

| Statut | Couleur | Animation |
|---|---|---|
| EN_ATTENTE | Gris | Aucune |
| ACCEPTE | Or `#D4A017` | Pulse léger |
| EN_TRANSIT | Bleu `#1A3A5C` | Pulse continu |
| EN_ENTREPOT_CA/CM | Ocre `#E07B39` | Aucune |
| LIVRE | Vert `#52B788` | Check animé |
| ANNULE | Rouge | Aucune |
| LITIGE | Terracotta `#C1440E` | Shake léger |

### HeroSection (landing)

```
┌─────────────────────────────────────────────────────┐
│  [motif kente subtle en background]                  │
│                                                      │
│  LOGIHUB                    [Avatar client 1]        │
│  Envoyez, en toute          [Avatar client 2]        │
│  confiance.                 [Avatar client 3]        │
│  Canada ↔ Cameroun                                   │
│                                                      │
│  [CTA: Commencer] [CTA: En savoir plus]             │
│                                                      │
│  ✓ 2 entrepôts  ✓ 150+ clients  ✓ 3 modes paiement │
└─────────────────────────────────────────────────────┘
```

### Dashboard cards

```
┌─────────────────────┐
│ [Icône]  Mes Envois │ ← titre avec icône colorée (Or)
│                     │
│    12               │ ← chiffre grand format
│    envois actifs    │
│                     │
│ ↑ +3 ce mois       │ ← delta en Vert
└─────────────────────┘
↑ cardHover animation + bordure gauche colorée selon rôle
```

---

## Dark mode

Le thème supporte le dark mode natif (`class="dark"` sur `<html>`).

| Variable | Light | Dark |
|---|---|---|
| `--bg-base` | `#F9FAFB` | `#0D1B2A` |
| `--bg-card` | `#FFFFFF` | `#132337` |
| `--text-primary` | `#0A0A0A` | `#F5E6C8` |
| `--text-secondary` | `#4B5563` | `#9CA3AF` |
| `--accent` | `#D4A017` | `#E8B84B` |

---

## Librairies design (résumé)

```bash
npm install framer-motion              # Animations
npm install @dicebear/core @dicebear/collection  # Avatars IA
npm install next-themes                # Dark/Light mode
```

Polices (via `next/font/google`) :
```typescript
import { Syne, DM_Sans } from 'next/font/google'
```
