# RecyClique – Présentation de la plateforme

**Document de référence** pour expliquer la plateforme, ses objectifs, ses fonctionnalités et sa roadmap.  
Utilisable en interne, pour des partenaires et pour des **présentations auprès de financeurs**.

**Dernière mise à jour :** janvier 2025  
**Projet :** RecyClique – La Clique Qui Recycle

---

## 1. Qu’est-ce que RecyClique ?

**RecyClique** (anciennement Recyclic) est une **plateforme open source de gestion pour ressourceries**, conçue pour les **associations de réemploi**. Elle couvre l’ensemble du flux : de la collecte des objets à la vente en magasin, en passant par la traçabilité réglementaire (EEE, éco-organismes).

### En une phrase

RecyClique digitalise le quotidien des ressourceries : **moins de papier et d’Excel, plus de conformité et de temps pour la mission sociale**, grâce à une interface simple (caisse, enregistrement vocal via app) et à des exports vers les partenaires réglementaires.

### Positionnement

- **Open source** : pas de licence payante, pas de dépendance à un éditeur.
- **Pensé pour le terrain** : bénévoles et salariés aux compétences numériques variables.
- **Conformité intégrée** : obligations Ecologic et déclarations éco-organismes (Ecologic, Ecomaison, etc.) prises en compte dès la conception.
- **Modulaire** : déploiement possible par étapes (caisse seule, puis dépôts, puis éco-organismes, etc.).
- **Choix d’hébergement** : **cloud budget** (Jarvos) pour les non-tech, ou **installation open source** sur son propre serveur / VPS.

---

## 2. Pourquoi cette plateforme ?

### Le problème

Les ressourceries françaises (150+ structures) sont confrontées à :

| Problème | Impact |
|----------|--------|
| **Saisie manuelle** (papier, Excel) pour dépôts et ventes | 2 à 3 h/jour perdues par structure |
| **Rapports réglementaires** (Ecologic, éco-organismes) difficiles à produire | Charge administrative et stress |
| **Outils inadaptés** : ERP type GDR trop chers (>200 €/mois), ERP génériques sans spécificité EEE | Frein à l’adoption et à la croissance |
| **Perte de données** (Excel corrompus, synchronisation manuelle) | Perte de traçabilité et de soutiens financiers |

Résultat : du **temps précieux détourné de la mission** (accueil, réemploi, insertion).

### La réponse RecyClique

- **Réduire drastiquement le temps administratif** (objectif : de 3 h à moins d’1 h/jour).
- **Garantir la conformité** : exports Ecologic et, à terme, déclarations éco-organismes **semi-automatisées** (pré-remplissage et exports ; pas d’API chez les éco-organismes à ce jour, saisie finale côté plateforme partenaire).
- **Rester simple** : interface « gros boutons », enregistrement vocal via app, PWA caisse qui fonctionne même hors ligne.
- **Choix de déploiement** : **option cloud budget** (Jarvos) pour les structures non techniques, ou **installation open source** sur son propre serveur / VPS pour garder la maîtrise des données.

---

## 3. À quoi ça sert ? (Valeur et objectifs)

### Pour les opérateurs de terrain (bénévoles, salariés)

- Enregistrer les **dépôts** rapidement (idéalement par **vocal** via application, avec proposition de catégorie EEE par l’IA).
- Tenir la **caisse** sur tablette/PC : catégories EEE, poids, prix, dons, recyclage, avec totaux en temps réel.
- Saisir même **hors ligne** : les données sont synchronisées dès que la connexion revient.

### Pour les responsables (présidents, trésoriers, coordinateurs)

- **Conformité réglementaire** sans être expert technique : exports Ecologic conformes, traçabilité complète.
- **Visibilité** sur les flux (dépôts, ventes, sessions de caisse) et sur l’historique.
- **Rapports** utilisables en AG et pour les financeurs (impact, volumes, conformité).

### Pour la structure dans son ensemble

- **Croissance possible** sans explosion de la charge administrative.
- **Sécurité juridique** : audit trail, rôles (admin, bénévole), traçabilité des modifications.
- **Ouverture** : intégration **Paheko** (comptabilité, adhérents) prévue dans la **prochaine refonte**.

---

## 4. Fonctionnalités actuelles

### État du déploiement

**Version 1.4** en production / test dans une **ressourcerie pilote**. Développement, débogage et **adaptation continue** selon les besoins réels du terrain.

### Cœur métier

| Fonctionnalité | Description |
|----------------|-------------|
| **Interface caisse (PWA)** | Ouverture/fermeture de session, ventes avec catégories EEE, presets (Don 0 €, Don -18, Recyclage, Déchèterie), totaux journaliers, mode hors ligne. |
| **Sessions de caisse** | Gestion du fond de caisse, variance à la clôture, saisie différée (cahiers papier saisis a posteriori avec la date réelle). |
| **Réception / dépôts** | Enregistrement des entrées (objets reçus), catégorisation, lien avec les flux pour les déclarations. |
| **Dépôts via app (IA)** | Enregistrement vocal via application, **classification automatique EEE**, validation ou correction par l’utilisateur. |
| **Utilisateurs et rôles** | Super Admin, Admin, Bénévole ; inscription, activation, historique des statuts. |
| **Audit et traçabilité** | Journal des actions (ouvertures/fermetures de caisse, changements de rôle, etc.). |

### Technique et déploiement

- **Stack** : Backend FastAPI (Python), frontend React/Vite/TypeScript (PWA), PostgreSQL, Redis, Docker Compose.
- **Rapports** : génération de rapports (ex. CSV/PDF) et envoi par email (ex. Brevo) à la clôture de caisse.
- **Multi-sites** : structure prête pour plusieurs sites (caisses, utilisateurs, catégories).
- **Déploiement** : **option cloud budget** (Jarvos) pour les structures non techniques ; ou **installation open source** sur son propre serveur / VPS.

---

## 5. Ce qui est prévu (roadmap et vision)

### Court terme (déjà en cours ou proche)

- **Paiements multiples** à l’encaissement (espèces + chèques, etc.).
- **Édition du poids** après validation (admin), avec recalcul des statistiques.
- **Date des tickets** : distinguer date réelle du ticket et date d’enregistrement (`sale_date` vs `created_at`).
- **Édition du prix** dans l’éditeur d’item (admin, avec log d’audit).

### Module éco-organismes (REP)

Un **module dédié** est prévu pour gérer les **déclarations trimestrielles** aux éco-organismes (REP – Responsabilité Élargie du Producteur) et le **suivi des soutiens financiers**. Partenaires visés : **Ecologic**, **Ecomaison** (DEA, Jouets, ABJ), etc.

**Objectifs du module :**

- Gérer **plusieurs éco-organismes** (Ecologic, Ecomaison, autres REP à venir).
- Tracker les **trois flux** : objets reçus, objets recyclés, objets vendus/réemployés.
- **Déclarations trimestrielles** : périodes T1–T4, fenêtres de déclaration, rappels.
- **Mapping des catégories** : correspondance entre catégories RecyClique et catégories de chaque éco-organisme.
- **Déclarations semi-automatisées** : calcul et pré-remplissage des données côté RecyClique ; pas d’API chez les éco-organismes à ce jour, la saisie finale reste sur les plateformes des partenaires.
- **Suivi financier** : soutiens validés, reçus, historique.

**État actuel :** phase **études** terminée (besoins, fiche Ecomaison, modèle de données, spécifications fonctionnelles, guide de mapping). Prochaines étapes : validation technique et métier, analyse du code existant, prototypage, puis développement.

**Documentation détaillée :** voir le dossier `docs/export_doc_ecosystem/eco-organismes/` (ou équivalent dans le dépôt).

### Partenariat Paheko

**Paheko** est un logiciel de gestion d’association (comptabilité, adhérents, etc.). L’**intégration de Paheko** comme moteur backend pour RecyClique est **prévue dans la prochaine refonte** :

- **Comptabilité** : flux compatibles avec la gestion associative.
- **Utilisateurs et adhérents** : gestion des participants, bénévoles, usagers.
- **Communication** : interne et externe.

### Vision long terme (1–2 ans et au-delà)

- **Poste de tri assisté par IA** : reconnaissance visuelle (caméra + pré-classification).
- **Recommandation de prix** : IA basée sur les données de marché.
- **Écosystème élargi** : autres filières REP (textile, mobilier, jouets), collectivités, déchèteries, réseaux nationaux (Emmaüs, Envie, etc.).
- **Plateforme territoriale** : interconnexion de ressourceries sur un territoire.
- **Analytics** : tableaux de bord, prédictions de flux, démonstration d’impact pour les financeurs.

---

## 6. Chiffres et impact (éléments pour financeurs)

### Objectifs métier

| Indicateur | Cible |
|------------|--------|
| **Réduction du temps administratif** | 70 % (de 3 h à &lt; 1 h/jour) |
| **Conformité réglementaire** | 100 % des exports Ecologic acceptés sans retraitement |
| **Adoption** | &gt; 80 % des dépôts saisis via RecyClique sous 2 semaines |
| **Vitesse de saisie** | Dépôt en &lt; 15 secondes (vs 2–3 min en manuel) |
| **Précision des données** | &lt; 5 % d’erreurs de classification (vs 15–20 % en manuel) |

### Valeur pour une structure

- **Gain de temps** : réaffectation des heures gagnées vers l’accueil, le tri, l’insertion.
- **Sécurité juridique** : conformité Ecologic et traçabilité des opérations.
- **Meilleure visibilité** : données fiables pour les AG, les rapports d’activité et les demandes de subventions.
- **Évolutivité** : capacité à augmenter les volumes sans surcharge administrative.
- **Soutiens financiers** : module éco-organismes visant à **maximiser et sécuriser** les soutiens REP (Ecologic, Ecomaison, etc.).

### Alignement avec les enjeux sectoriels

- **Loi AGEC** et renforcement des obligations REP : RecyClique aide à les respecter.
- **ESS et réemploi** : outil adapté aux associations, open source, réutilisable par d’autres structures.
- **Transition numérique** : passage du papier/Excel à une plateforme moderne sans dépendance à des solutions propriétaires coûteuses.

---

## 7. À qui s’adresse ce document ?

- **Équipe projet et partenaires techniques** : vue d’ensemble de la plateforme et de la roadmap.
- **Direction et responsables associatifs** : justification du projet, valeur, conformité, évolution.
- **Financeurs et partenaires institutionnels** : présentation synthétique, objectifs, impact, vision (sections 1–3, 5–6 en priorité).
- **Nouveaux arrivants** : compréhension rapide de RecyClique, de son rôle et de son écosystème.

---

## 8. Pour aller plus loin

- **Définition détaillée et technique** : `docs/export_doc_ecosystem/brief.md`, `architecture.md`, `goals-and-background-context.md`.
- **Module éco-organismes** : `docs/export_doc_ecosystem/eco-organismes/` (README, besoins, fiche eco-maison, modèle de données, spécifications, guide de mapping).
- **Export « écosystème »** : `docs/export_doc_ecosystem/README.md` pour la liste des documents disponibles.

---

*Document rédigé à partir de la documentation projet RecyClique (brief, PRD, architecture, module éco-organismes). À adapter selon le contexte de présentation (interne, partenaire, financeur).*
