# Architecture technique — LOGIHUB

## Vue d'ensemble

Application web fullstack Next.js 15 (App Router) déployée sur Vercel.  
Base de données PostgreSQL hébergée sur Neon (serverless).  
Authentification gérée par Clerk.  
Design : thème Smart Africain + avatars IA générés par DiceBear + animations Framer Motion.

---

## Structure des dossiers (src/)

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/               # Pages publiques (landing, tarifs, à propos)
│   │   │   └── page.tsx            # Landing page
│   │   ├── (auth)/                 # Pages Clerk (sign-in, sign-up)
│   │   └── (dashboard)/            # Pages protégées
│   │       ├── dashboard/
│   │       │   ├── page.tsx        # Redirect selon le rôle
│   │       │   ├── expediteur/     # Dashboard expéditeur
│   │       │   ├── transporteur/   # Dashboard transporteur
│   │       │   ├── entrepot/       # Dashboard entrepôt
│   │       │   └── admin/          # Dashboard admin
│   │       ├── envois/
│   │       │   ├── page.tsx        # Liste des envois
│   │       │   ├── nouveau/        # Formulaire création
│   │       │   └── [id]/           # Détail + tracking
│   │       ├── entrepots/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       └── transporteurs/
│   └── api/
│       ├── envois/                 # CRUD envois
│       ├── entrepots/              # CRUD entrepôts
│       ├── paiements/
│       │   ├── stripe/             # Checkout Stripe
│       │   ├── mobile-money/       # CinetPay MTN/Orange
│       │   └── interac/            # Interac semi-manuel
│       ├── notifications/
│       └── webhooks/               # Stripe + CinetPay webhooks
├── components/
│   ├── ui/                         # shadcn/ui (boutons, cards, etc.)
│   ├── layout/                     # Navbar, Sidebar, Footer
│   ├── envois/                     # Composants liés aux envois
│   ├── entrepots/                  # Composants entrepôts
│   ├── paiements/                  # Composants paiement
│   ├── dashboard/                  # Widgets dashboard
│   └── avatar/                     # UserAvatar — DiceBear IA généré
├── lib/
│   ├── prisma.ts                   # Client Prisma singleton
│   ├── stripe.ts                   # Client Stripe
│   ├── cinetpay.ts                 # Client CinetPay
│   ├── resend.ts                   # Client Resend (emails)
│   ├── avatar.ts                   # Générateur d'avatar DiceBear
│   └── utils.ts                    # Fonctions utilitaires
└── middleware.ts                   # Clerk auth + next-intl + rate limiting
```

---

## Schéma base de données

### Entités principales

| Modèle | Description |
|---|---|
| `User` | Tous les utilisateurs (clerkId, rôle, pays) |
| `Shipment` | Un envoi (expéditeur → transporteur, statut, prix) |
| `TrackingEvent` | Événement de suivi d'un envoi |
| `Payment` | Paiement lié à un envoi (Stripe / Mobile Money / Interac) |
| `Warehouse` | Entrepôt (Canada ou Cameroun) |
| `WarehouseItem` | Colis présent dans un entrepôt |
| `Notification` | Notification in-app pour un utilisateur |

### Statuts d'un envoi (ShipmentStatus)

```
EN_ATTENTE → EN_COURS_MATCHING → ACCEPTE → EN_ENTREPOT_CA
→ EN_TRANSIT → EN_ENTREPOT_CM → EN_LIVRAISON → LIVRE
                                              ↘ ANNULE / LITIGE
```

---

## Sécurité

| Mesure | Implémentation |
|---|---|
| Headers HTTP | `next.config.ts` (CSP, HSTS, X-Frame-Options) |
| Rate limiting | `@upstash/ratelimit` sur toutes les routes `/api/*` |
| Validation entrées | Zod sur chaque route API (body + params) |
| Authentification | Clerk middleware — routes `(dashboard)` + `/api/*` |
| Injection SQL | Prisma (requêtes paramétrées) |
| Secrets | `@t3-oss/env-nextjs` — validation au build |

---

## Flux de données

```
Client (Next.js)
    ↓ fetch
API Routes (/api/*)
    ↓ Zod validation
    ↓ Prisma query
PostgreSQL (Neon)
    ↓ response
Client
```

---

## Internationalisation

- Bibliothèque : `next-intl`
- Langues : Français (`fr`) + Anglais (`en`)
- Fichiers de traduction : `messages/fr.json` + `messages/en.json`
- Routing : `/{locale}/...` (ex: `/fr/dashboard`, `/en/dashboard`)
