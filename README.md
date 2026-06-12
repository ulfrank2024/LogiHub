# LOGIHUB

**Plateforme de Mise en Relation Logistique — Corridor Canada–Cameroun**

> Version 2.0 — Juin 2026

---

## Vue d'ensemble

LOGIHUB connecte des expéditeurs (diaspora), des transporteurs partenaires et deux entrepôts (1 Canada, 1 Cameroun) pour simplifier l'envoi de colis sur le corridor Canada–Cameroun.

**Objectifs An 1 :** 150–200 transactions · ~10 000 CAD de revenus

---

## Structure du projet

```
LogiHub/
├── .claude/              # Suivi des modifications Claude (journal)
├── docs/                 # Documentation technique et fonctionnelle
├── migrations/           # Exports SQL de référence des migrations
├── prisma/               # Schéma Prisma + migrations auto-générées (créé au setup)
├── src/                  # Code source Next.js (créé au setup)
├── public/               # Assets statiques (créé au setup)
└── README.md             # Ce fichier
```

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| Base de données | PostgreSQL (Neon) + Prisma ORM |
| Authentification | Clerk |
| Paiements | Stripe · CinetPay (MTN/Orange) · Interac (semi-manuel) |
| Email | Resend |
| Stockage fichiers | Vercel Blob |
| i18n | next-intl (FR/EN) |
| Validation | Zod |
| Déploiement | Vercel |

---

## Rôles utilisateurs

| Rôle | Description |
|---|---|
| `EXPEDITEUR` | Crée des envois, suit ses colis, paie |
| `TRANSPORTEUR` | Accepte des envois, met à jour le statut |
| `RESPONSABLE_ENTREPOT` | Gère les colis en entrepôt (CA ou CM) |
| `ADMIN` | Vue complète : utilisateurs, transactions, litiges |

---

## Lancer le projet

```bash
# Installation
npm install

# Variables d'environnement
cp .env.example .env.local

# Base de données
npx prisma migrate dev

# Développement
npm run dev
```

---

## Documentation

- [Architecture technique](docs/architecture.md)
- [Design System (thème, avatars, animations)](docs/design-system.md)
- [Flux par rôle](docs/roles-flows.md)
- [Documentation API](docs/api.md)
- [Guide de déploiement](docs/deployment.md)
