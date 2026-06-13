# Journal des modifications — LOGIHUB

> Ce fichier est maintenu par Claude. Chaque modification significative, ajustement d'architecture ou décision technique est enregistré ici avec la date et la justification.

---

## Format d'entrée

```
### [YYYY-MM-DD] Titre de la modification
**Type :** Feature | Fix | Architecture | Sécurité | DB | Config
**Fichiers touchés :** liste des fichiers modifiés
**Raison :** pourquoi ce changement a été fait
**Impact :** ce que ça change dans le comportement ou la structure
```

---

## Historique

### [2026-06-12] Initialisation de la structure du projet
**Type :** Architecture  
**Fichiers touchés :** README.md, docs/*, migrations/README.md, .claude/MODIFICATIONS.md  
**Raison :** Mise en place de la structure de base avant le développement  
**Impact :** Définit l'organisation complète du projet : code, documentation, migrations, suivi Claude

### [2026-06-13] Phase 2 — Auth, Onboarding, Landing page
**Type :** Feature  
**Fichiers touchés :**
- `src/app/layout.tsx` — root layout minimal (redirect /fr)
- `src/app/page.tsx` — redirect vers /fr
- `src/app/[locale]/layout.tsx` — layout avec Clerk + next-intl + ThemeProvider + polices Syne/DM Sans
- `src/app/[locale]/(auth)/sign-in/` — page sign-in Clerk (thème africain)
- `src/app/[locale]/(auth)/sign-up/` — page sign-up Clerk
- `src/app/[locale]/(auth)/onboarding/` — sélection de rôle avec Framer Motion
- `src/app/[locale]/(public)/page.tsx` — landing page
- `src/app/[locale]/(dashboard)/dashboard/page.tsx` — redirect par rôle
- `src/app/api/users/role/route.ts` — API POST enregistrement rôle + upsert user DB
- `src/app/api/webhooks/clerk/route.ts` — webhook Clerk (user.updated, user.deleted)
- `src/components/layout/Navbar.tsx` — navbar sticky avec switch langue FR/EN
- `src/components/layout/HeroSection.tsx` — hero avec avatars DiceBear orbitaux
- `src/components/layout/HowItWorks.tsx` — section 3 étapes animée
- `src/components/avatar/UserAvatar.tsx` — composant avatar DiceBear par rôle
- `src/lib/avatar.ts` — fix types DiceBear (cast any pour union)
- `src/lib/stripe.ts` — fix version API Stripe (2026-05-27.dahlia)
- `src/lib/utils.ts` — export buttonVariants

**Raison :** Phase 2 — flux d'authentification complet avec sélection de rôle et synchronisation DB  
**Impact :** L'utilisateur peut s'inscrire, choisir son rôle, être créé en base et redirigé vers son dashboard

### [2026-06-13] Fix Prisma 7 — driver adapter @prisma/adapter-neon
**Type :** Fix / Architecture  
**Fichiers touchés :** `src/lib/prisma.ts`, `scripts/test-db.ts`, `package.json`  
**Raison :** Prisma 7 breaking change — le constructeur `PrismaClient` n'accepte plus d'URL directe, il faut obligatoirement un driver adapter (`SqlDriverAdapterFactory`) ou `accelerateUrl`. Pour Neon serverless on utilise `@prisma/adapter-neon`.  
**Impact :** Tous les tests passent — 7 tables opérationnelles, CRUD + relations vérifiés.

### [2026-06-13] Migration Prisma initiale sur Neon
**Type :** DB  
**Fichiers touchés :** `prisma/migrations/20260613005552_init_schema/migration.sql`, `migrations/2026-06-13_init_schema.sql`, `prisma.config.ts`  
**Raison :** Connexion à la base Neon établie. `prisma.config.ts` corrigé pour charger `.env.local` en priorité (convention Next.js)  
**Impact :** Toutes les tables créées en production sur Neon : users, shipments, tracking_events, payments, warehouses, warehouse_items, notifications. Client Prisma généré dans `src/generated/prisma`.

### [2026-06-12] Phase 1 — Fondations complètes
**Type :** Architecture / Config  
**Fichiers touchés :**
- `next.config.ts` — headers sécurité (CSP, HSTS, X-Frame, etc.) + next-intl plugin
- `src/env.ts` — validation des variables d'environnement avec @t3-oss/env-nextjs + Zod
- `.env.example` — template de toutes les variables nécessaires
- `prisma/schema.prisma` — schéma complet (User, Shipment, TrackingEvent, Payment, Warehouse, WarehouseItem, Notification)
- `prisma.config.ts` — config Prisma 7 avec path migrations
- `src/middleware.ts` — Clerk auth + next-intl routing
- `src/i18n/routing.ts` — locales FR/EN, default FR
- `src/i18n/request.ts` — chargement messages par locale
- `messages/fr.json` + `messages/en.json` — traductions complètes
- `src/lib/prisma.ts` — client Prisma singleton
- `src/lib/rate-limit.ts` — rate limiting Upstash (20 req/10s)
- `src/lib/avatar.ts` — générateur DiceBear par rôle (lorelei/adventurer/personas/notionists)
- `src/lib/animations.ts` — variantes Framer Motion (fadeInUp, staggerContainer, cardHover, pulse...)
- `src/lib/stripe.ts` — client Stripe
- `src/lib/resend.ts` — client Resend
- `src/lib/utils.ts` — cn, formatCurrency, formatDate, formatWeight, shipmentPriceCAD
- `src/app/globals.css` — thème Smart Africain (palette Or/Vert/Terracotta, dark mode, motif kente, scrollbar)
- shadcn/ui initialisé avec : button, card, badge, input, label, select, dialog, dropdown-menu, avatar, separator, table, form, sheet, tabs, progress, sonner

**Raison :** Phase 1 du plan d'implémentation : fondations complètes avant les pages  
**Impact :** Projet Next.js 16 opérationnel, sécurisé, prêt pour les phases suivantes

### [2026-06-12] Initialisation du dépôt Git + push GitHub
**Type :** Config  
**Fichiers touchés :** tous les fichiers existants  
**Raison :** Lier le projet local au dépôt GitHub `ulfrank2024/LogiHub` pour déploiement continu  
**Impact :** Dépôt sur `main`, remote origin = `https://github.com/ulfrank2024/LogiHub.git`. Chaque modification sera commitée et poussée après chaque changement significatif.

### [2026-06-12] Ajout du thème Smart Africain + avatars IA + Framer Motion
**Type :** Architecture / Design  
**Fichiers touchés :** docs/design-system.md (nouveau), docs/architecture.md  
**Raison :** Le client souhaite une identité visuelle africaine moderne, des avatars IA pour les utilisateurs et des animations fluides  
**Impact :**
- Nouveau stack UI : Framer Motion (animations), DiceBear (avatars IA), next-themes (dark mode)
- Polices : Syne (titres) + DM Sans (corps)
- Palette : Or Africain #D4A017, Vert Forêt #1B4332, Terracotta #C1440E
- Avatars générés automatiquement par rôle (lorelei / adventurer / personas / notionists)
- Motifs géométriques kente en background (opacité ≤5%, décoratif seulement)
- Variantes d'animation standards définies dans `src/lib/animations.ts`

---
