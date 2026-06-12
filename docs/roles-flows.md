# Flux par rôle — LOGIHUB

## Expéditeur (diaspora)

```
Inscription → Choisir rôle EXPEDITEUR
    ↓
Créer un envoi
  - Origine (Canada / Cameroun)
  - Poids, dimensions
  - Description du colis
  - Valeur déclarée
    ↓
Voir le prix calculé automatiquement
    ↓
Choisir méthode de paiement
  - Stripe (carte bancaire)
  - Interac e-Transfer
  - MTN / Orange Money
    ↓
Payer → Envoi en attente d'un transporteur
    ↓
Suivre le colis (timeline avec statuts)
    ↓
Recevoir notifications email à chaque étape
```

---

## Transporteur / Partenaire logistique

```
Inscription → Choisir rôle TRANSPORTEUR
  (validation par Admin requise)
    ↓
Accéder au marketplace des envois disponibles
  - Filtres : origine, destination, poids, date
    ↓
Accepter un envoi → statut ACCEPTE
    ↓
Mettre à jour les statuts au fil du transport :
  EN_ENTREPOT_CA → EN_TRANSIT → EN_ENTREPOT_CM
  → EN_LIVRAISON → LIVRE
    ↓
Recevoir paiement (via Admin)
```

---

## Responsable entrepôt

```
Inscription → Rôle RESPONSABLE_ENTREPOT
  (assigné à un entrepôt Canada OU Cameroun)
    ↓
Tableau de bord entrepôt
  - Inventaire des colis présents
  - Occupation / Capacité
    ↓
Check-in : enregistrer arrivée d'un colis
  → Statut mis à jour : EN_ENTREPOT_CA ou EN_ENTREPOT_CM
    ↓
Check-out : enregistrer départ d'un colis
  → Statut mis à jour : EN_TRANSIT ou EN_LIVRAISON
    ↓
Vue historique des colis traités
```

---

## Administrateur plateforme

```
Dashboard admin — vue globale
    ↓
Gestion des utilisateurs
  - Valider les comptes transporteurs
  - Suspendre / activer des comptes
    ↓
Gestion des envois
  - Vue complète de tous les envois
  - Intervenir sur les litiges
    ↓
Gestion des paiements
  - Confirmer les Interac reçus
  - Voir toutes les transactions
    ↓
Rapports & Analytics
  - Nombre de transactions / période
  - Revenus
  - Transporteurs les plus actifs
    ↓
Gestion des entrepôts
  - Affecter des responsables
  - Voir l'occupation en temps réel
```
