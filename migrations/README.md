# Migrations — LOGIHUB

Ce dossier contient les exports SQL de référence des migrations de base de données.

Les migrations **auto-générées par Prisma** se trouvent dans `prisma/migrations/` (créé lors du setup).  
Ce dossier `migrations/` à la racine sert de référence manuelle et d'archivage.

---

## Convention de nommage

```
YYYY-MM-DD_description_courte.sql
```

Exemple :
```
2026-06-12_init_schema.sql
2026-06-15_add_tracking_events.sql
```

---

## Appliquer une migration Prisma

```bash
# Créer et appliquer une migration
npx prisma migrate dev --name description_de_la_migration

# Appliquer en production
npx prisma migrate deploy

# Voir l'état des migrations
npx prisma migrate status
```

---

## Migrations appliquées

| Date | Nom | Description |
|---|---|---|
| 2026-06-13 | `init_schema` | Schéma initial : User, Shipment, TrackingEvent, Payment, Warehouse, WarehouseItem, Notification |
