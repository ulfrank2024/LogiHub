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
