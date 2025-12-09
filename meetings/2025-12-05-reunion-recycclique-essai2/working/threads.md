# Threads Récurrents - Réunion RecycClique du 5 décembre 2025

Ce document consolide les discussions récurrentes tout au long de la réunion, organisées par thématiques.

---

## Thread 1: Politique Tarifaire (Prix Minimum vs Indicatif)

**Segments concernés:** 001, 002, 003, 004
**Statut:** Non résolu - Chantier à ouvrir

### Résumé du débat

Conflit persistant entre deux approches:
- **Prix minimum** (position B): Prix affiché = minimum obligatoire
- **Prix indicatif** (position A/D): Prix affiché = suggestion, liberté client/caissier

### Évolution chronologique

**Segment 001 (0:00-5:24):**
- Débat initial non résolu
- B: perte de temps avec saisie prix individuels
- Proposition: prix minimum par défaut + don à 0€ possible

**Segment 002 (4:30-9:37):**
- Désaccord persistant malgré discussions précédentes
- Observation terrain: clients ne descendent jamais sous le prix (donc minimum de fait)
- Différences de discours entre personnes → confusion
- Proposition simplifiée: tout à 0€ par défaut + prix global en fin
- **Décision**: La tarification sera traitée comme un chantier à part entière

**Segment 003 (9:00-14:08):**
- Cas concret: radiateur 3€ avec pied cassé
- D: "3€ ce n'est même pas le prix d'une baguette"
- B: donné car client en difficulté + objet abîmé
- Distinction proposée: politique officielle vs pratique ponctuelle
- Compatibilité nécessaire avec promotions ponctuelles

**Segment 004 (13:30-18:35):**
- **Consensus atteint**: Prix à 0 par défaut
- Prix global saisi en fin de transaction
- Exception: articles à prix fixe (ex: collier 15€) peuvent être saisis individuellement
- **Décision**: Mode prix à 0 par défaut sera implémenté comme option paramétrable

### Impact opérationnel

- Confusion actuelle pour les clients (discours différents selon caissiers)
- Besoin de clarifier pour communication externe (affichage, site internet)
- Système prix global questionné par rapport à gestion comptable des dons
- Recherche précédente partagée: 3 fonctionnements différents identifiés en France

### Actions identifiées

- Clarifier et formaliser la politique tarifaire (chantier à ouvrir)
- Implémenter option paramétrable prix par défaut = 0
- Système de notes sur ventes pour justifier prix atypiques

---

## Thread 2: Catégories et Granularité

**Segments concernés:** 001, 004, 005, 006, 007, 008, 009, 010, 011
**Statut:** En cours de définition

### Problématique centrale

Quel niveau de détail (granularité) retenir pour les catégories ?
- Trade-off: détail statistique vs simplicité d'usage
- Contrainte: minimum requis par éco-organismes (filières normées)
- Besoin: flexibilité selon évolution besoins

### Exemples de granularité discutés

**Vaisselle (segment 004, 005):**
- Vaisselle → métal, grès, ustensiles, couverts...
- Jusqu'où aller ? "200g d'assiettes" vs "vaisselle"
- **Consensus**: Ne pas sur-détailler, garder "vaisselle"

**Sport et loisirs (segment 008):**
- Besoin spécifique: distinguer vélos (subvention écologique bourse vélo)
- 2 sous-catégories: "cycles" + "autre ASL" (trottinettes, ballons...)
- **Décision**: Créer sous-catégorie vélos séparée

**EEE - Équipements Électriques et Électroniques (segments 007, 009, 010, 011):**
- Renommage: "Électroménager" → "EEE"
- 4 sous-catégories normées:
  1. PAM (Petits Appareils Mélange)
  2. Écrans
  3. Gros hors froid
  4. Gros froid
- **Urgence opérationnelle**: Bennes pleines, besoin immédiat (segment 007)

**Jardin thermique (segment 007, 011):**
- Articles bricolage jardin thermique (tondeuses thermiques, outillage motorisé)
- Sous-catégories:
  1. Tondeuse autoportée (conducteur marchant)
  2. Autres catégories thermiques
- Source: document éco-organismes fonds réemploi
- **Important**: Thermique seulement, pas électrique

### Principe de granularité dynamique (segment 008)

- Écologique: bourse vélos cette année
- Année prochaine: peut-être fours micro-ondes
- Autre éco-organisme: autre spécificité
- **Principe clé**: Pouvoir ajouter/retirer granularité selon besoins éco-organismes évolutifs

### Double dénomination (segment 001)

- Dénomination rapide pour affichage (ex: "bricot")
- Dénomination complète officielle pour compta matière
- Affichage rapide sur boutons, complète en survol souris

### Stratégie de migration (segment 009)

- Créer nouvelles catégories sans supprimer anciennes immédiatement
- C fera opération de mapping pour replacer anciennes données
- Éviter perte données historiques

### Ergonomie gestion catégories (segment 011)

- Besoin boutons monter/descendre pour classer
- Abandon classement alphabétique automatique
- Classement manuel contrôlé
- Boutons édition trop loin (besoin UX améliorée)
- Hack actuel: préfixe "A-" pour avoir catégories en haut (segment 008)

---

## Thread 3: Éco-organismes et Déclarations

**Segments concernés:** 001, 004, 005, 006, 007, 008, 010
**Statut:** Chantier à ouvrir - Besoin binôme

### Complexité du sujet

- Aspect technique lourd
- Connaissance métier fragmentée dans l'équipe
- Besoin de binôme pour dégrossir (segment 004)
- C manque de connaissance métier spécifique
- **Action**: Ouvrir chantier sur forum

### Architecture module (segment 006)

**Principe de séparation:**
- Gestion matière interne SÉPARÉE de déclarations éco-organismes
- Flexibilité: changement d'éco-organisme → pas impacter tout le système
- Reclassement automatique entre catégories internes et externes

**Fonctionnement:**
- Module dédié avec chaque éco-organisme identifié
- Métadonnées: date déclaration, grandes catégories
- **Mapping automatique**: relier catégories internes → catégories éco-organismes
- Paramétrage en amont, pas en saisie

### Vocabulaire correct (segment 007)

- **Erreur**: Calquer sur éco-organismes
- **Correct**: Calquer sur **filières** (normées nationalement)
- Filières identiques même si changement d'éco-organisme
- Dénominations définies au niveau gouvernemental

### Filières normées identifiées

**EEE (4 catégories):**
1. Petits appareils mélange
2. Écrans
3. Gros hors froid
4. Gros froid

**Jardin thermique (3+ catégories):**
1. Tondeuse autoportée
2. Autres (à détailler)

**Sport et loisirs:**
- Cycles (vélos) - subvention bourse vélo
- Autre ASL

### Granularité minimale requise (segment 006)

- **Consensus**: Garder seulement le détail minimum requis par éco-organismes
- Ne pas sur-compliquer avec détails inutiles
- Catégories racines principales conservées

### Questions Discord réseau (segment 006)

- Code 500 et questions réseau national ressourceries
- Notation des dons par rapport éco-organismes
- Clarification en cours avec Corinne

### Cas particuliers catégories (segment 010)

- **Tubes cathodiques**: écrans (benne spéciale écologique), si trop gros → à côté
- **Cosmétiques/parfums**: pas d'éco-organisme → poubelle (produits dangereux)
- **Pistolet d'arrosage**: jardin thermique ou outillage ? → chatbot répond

---

## Thread 4: Comptes Utilisateurs et Droits d'Accès

**Segments concernés:** 001, 002, 009, 010, 012
**Statut:** Système existant à activer

### Système code PIN (segment 002)

**Fonctionnement:**
- Code PIN unique (4 chiffres) par utilisateur
- Tape le code → identification automatique (pas besoin nom)
- Si code déjà pris → message d'erreur

**Double système:**
- **Identifiant + mot de passe**: connexion web depuis n'importe où
- **Code PIN**: passage rapide utilisateur à utilisateur sur même poste

**Déconnexion automatique:**
- Après 5 minutes d'inactivité
- Timing différenciable selon poste (caisse vs administration)
- Réflexe caissier classique

### Niveaux d'habilitation (segment 010)

Système déjà implémenté dans administrations Recyclic:
1. **Utilisateur basique**
2. **Adhérent** (espace supplémentaire)
3. **Habilité caisse** (mais pas réception)
4. **Habilité réception** (mais pas caisse)
5. **Admin** (accès complet: Recyclic, compta, admin)

### Distinction terminologique (segment 010)

- **Participants**: Clients enregistrés (liste besoins, tickets, promotions)
- **Utilisateurs**: Terme technique (applis)
- **Adhérents**: Statut spécial avec accès espace membre
- Choix opt-in/opt-out pour promotions/newsletters
- Gestion compte possible → passage adhérent → éventuellement admin

### RGPD et adhésion (segment 009)

**Enregistrement utilisateurs:**
- Besoin pour envoi tickets dématérialisés
- Case RGPD obligatoire: "Recevoir nos informations" (décoché par défaut)
- "Promis on ne spamme pas"

**Adhésion volontaire:**
- Adhésion ≠ enregistrement automatique
- Case "Voulez-vous être adhérent ?"
- Si coché → envoi automatique statuts, charte, règlement intérieur
- **Important**: Lecture statuts obligatoire lors adhésion

### Anticipation bénévoles (segment 002)

- Arrivée prévue de bénévoles nombreux
- Exemple: SNU avec accès réception mais pas admin/compta
- Besoin limiter droits par sécurité
- Tant qu'on est "entre nous" ça va, mais pas à terme

### Traçabilité (segment 003)

- **Actuellement**: Tout au nom compte global "La Clique"
- **À terme**: Noms individuels avec code PIN
- Logs et audit: connexions, déconnexions, opérations
- Permet litiges et responsabilité

### Système alerte/chat interne (segments 011, 012)

- Importance comptes persos pour ciblage messages
- Messages envoyés à personne spécifique (pas broadcast global)
- Identification poste = prérequis communication interne

### Modularité (segment 002)

- Système code PIN activable quand besoin apparaît
- Activation/désactivation selon besoins ressourcerie

---

## Thread 5: Paeko et Intégrations

**Segments concernés:** 001, 007, 008, 009, 010
**Statut:** Routine à établir avant automatisation

### Paeko comme backend (segment 008)

- Paeko deviendra moteur compta de Recyclic
- Compta matière comptée directement dans Paeko
- Système de caisse Recyclic = "télécommande Paeko"
- Connexion automatique future

### Hébergement Jarvos (segment 009)

- Toutes les données sur serveur Jarvos (logiciel libre)
- Paeko également hébergé sur Jarvos
- Pas de dépendance fournisseur propriétaire

### Templates et automatisation (segment 008)

**Opérations répétitives:**
- Paeko permet enregistrer plans opérations délicates
- Ex: chèques fin mois → template débits/crédits pré-remplis
- Après 2 mois: juste rentrer montants, reste auto

**Passage par étape manuelle d'abord:**
- Obligatoire pour comprendre les flux
- Automatisation viendra après routine établie (2-3 mois)
- Expérience empirique nécessaire avant optimisation
- Réflexes comptables à acquérir
- Plus dur: trouver bons numéros plan comptable

### Point Paeko différé (segments 007, 009)

- Sera abordé quand routine stabilisée (comptes ouverts, tout en place)
- Réunion interrompue par Corinne (saturation cognitive - segment 009)
- Prévision: suite semaine prochaine
- Besoin de digérer avant de continuer

### Correspondances Paeko (segment 007)

- Besoin mapper clairement toutes correspondances Recyclic ↔ Paeko
- Pour connexion automatique future
- **Action**: Fournir document correspondances

### Comptabilité chèques (segment 007)

**Débat:**
- Question: comptabiliser au jour émission ou jour encaissement ?
- D: comptabilise à l'émission (+ simple)
- Problème décalages fin mois/exercice
- Solution: compte "chèques à encaisser" (intermédiaire)

**Consensus final:**
- Comptabiliser à l'encaissement (rapprochement bancaire)
- **Décision**: Méthode encaissement retenue

### Elo Asso (segment 010)

**Modules et intégration:**
- Utilisé actuellement pour gestion adhésions (même adhésions boutique)
- Modules: adhésion + crowdfunding
- API Elo Asso probablement disponible

**Vision intégration:**
- Gérer membres par Recyclic → envoi auto vers Elo Asso
- Même principe que connexion future avec Paeko
- Alternative: adhésions directement dans Recyclic, Elo Asso juste vitrine/crowdfunding

**Avantages Elo Asso:**
- Lien web public (inscription depuis n'importe où)
- Visibilité réseaux sociaux
- Module paiement adhésion
- Numérotation membres automatique
- Système rappel cotisations impayées

**Avantages gestion Paeko:**
- Opérations comptables facilitées (frais, etc.)
- Attribution automatique numéro membre
- Frais kilométriques poussés auto selon membre
- Gestion déjà prête (vs développement custom)

**Questions:**
- API Elo Asso existe-t-elle et est-elle documentée ?
- Faut-il centraliser gestion membres dans Paeko ou garder Elo Asso ?
- **Risque**: Dédoublement données membres (Elo Asso + Paeko + Recyclic)

---

## Thread 6: Saisie Vocale et Automation

**Segments concernés:** 001, 003, 004, 008
**Statut:** Faisable - À prioriser

### Module STT (Speech-to-Text) - Segment 001

**Besoin:**
- Module de transcription vocale
- Basé sur WhisperWrite ou API text-to-speech
- Utilisable sur tous champs texte avec bouton ou raccourci clavier

### Module saisie vocale caisse détaillé (segment 003)

**Fonctionnement proposé:**
1. Bouton à appuyer → parler → transcription automatique
2. Ex: "3 kg de livres" → s'affiche automatiquement
3. Ligne par ligne: pesée + annonce vocale
4. Possibilité de correction manuelle si erreur
5. Validation → total calculé (ex: 17,50€)

**Avantages:**
- Gain de temps considérable
- Libère les mains pour peser/manipuler
- Plus fluide avec affluence

**Contraintes techniques:**
- Nécessite micro à proximité (ou casque Bluetooth)
- Casque toute la journée ? Pas forcément confortable
- Besoin équipement dédié par poste

**Consensus (segment 003):**
- D: "Le plus simple dans un premier temps, c'est vraiment un micro, un bouton"
- Rentrer catégorie + poids OK
- Donner montant total en fin = plus fluide

### Mapping automatique avec vocal (segment 004)

**Système intelligent:**
- Saisie vocale: "3 casseroles"
- Transcription: "3 casseroles"
- Mapping automatique: → catégorie "vaisselle"
- Pas besoin de dire "3, V-A-I-S-S-E-L-L-E..."
- Similaire au module d'import déjà développé

### Communication inter-postes (segment 003)

**Système type interphone:**
- Proposition: utiliser micro pour communication inter-postes
- Ex: "Le petit Olivier est attendu à la caisse, sa maman se fait du souci"
- Type supermarché/grande surface
- Multi-usage: saisie vocale + talkie-walkie/annonces
- Réaction: "Pourquoi pas, on est ouvert à tout" (C)

### Bot Recyclic sur Discord (segment 008)

**Vision future automation:**
- Bot dans serveur Discord de l'asso
- Commandes vocales: "chèque 50€ émis à Intel"
- Bot répond: "OK, j'enregistre chèque n° X sur Paeko"
- Même principe pour factures (pièce jointe) → analyse auto + validation
- Simplification extrême des saisies

**Timing:**
- Pas prioritaire maintenant
- Attendre routine établie avant automatisation poussée
- Vision long terme

### Actions identifiées

- Étudier faisabilité module saisie vocale caisse
- Évaluer équipement nécessaire (micro, casque, bouton)
- Réfléchir système communication interne (interphone/annonces)

---

## Thread 7: Chatbot et Base de Connaissances

**Segments concernés:** 001, 010
**Statut:** Backlog

### Chatbot aide catégorisation (segment 001)

**Fonctionnement:**
- Catégorie "?" ouvrant champ de recherche (clavier/vocal)
- Ex: "j'ai un fer à repasser, ça va dans quelle catégorie ?"
- Interrogation base de connaissances locale/globale
- Fallback sur recherche internet (type Perplexity)

### Base de connaissances universelle (segment 001)

**Documents sources:**
- Éco-organismes, normes, catégories, lois, compta
- Bibliothèque partageable entre ressourceries
- Possibilité enregistrer résultats chatbot (local/global)

### Chatbot catégorie "?" en réception (segments 010, 011)

**Concept:**
- Module réception: catégorie spéciale "point d'interrogation"
- Ouvre chatbot
- Ex: "tondeuse autoportée, je sais pas où ça rentre"
- Interroge base de connaissances → renvoie bonne catégorie
- Se déclenche au choix catégorie "?"

**Cas d'usage évoqués:**
- "Tube cathodique, je le mets dans quoi ?" → écrans (benne écologique)
- "Pistolet d'arrosage" → jardin thermique ou outillage ? → chatbot répond

### Perplexity Pro (segments 006, 007)

**Outil recherche approfondie:**
- Sources légales, comptables
- Recherche sur toutes sources + croisement
- Réponses fixes ou hypothèses multiples
- **Proposition**: Envoyer questions complexes législatives/comptables
- **Décision (segment 007)**: Utiliser Perplexity Pro pour recherches légales complexes

### Élicitation de groupe avec IA (segment 001)

**Vision future:**
- Agent IA posant questions en réunion
- Enregistrement et synthèse automatique
- Création/mise à jour "documents de vérité"
- Élaboration chartes, grilles tarifaires, etc.

---

## Thread 8: Bugs et Incidents Techniques

**Segments concernés:** 003, 005, 012
**Statut:** En cours de résolution

### Bug tickets de caisse non vierges (segment 005)

**Symptôme:**
- Items du ticket précédent qui traînent dans nouveau ticket
- Rapporté par B et D (2-3 fois)
- B: "Quand tu ouvres un ticket de caisse et merde, il n'est pas vierge"

**Diagnostic:**
- Potentiellement lié à écran tactile

**Action corrective:**
- **Décision**: Débrancher l'USB de l'écran tactile
- Test pour voir si ça résout le problème
- **Action dev**: Investiguer et corriger bug

**Risque:**
- Si débrancher écran ne résout pas → investigation plus approfondie nécessaire

### Bug affichage cumuls (segment 005)

**Symptôme:**
- Cumul "toujours" pour entrées vs cumul "jour" pour sorties
- Incohérence affichage récap écran

**Résolution:**
- Déjà corrigé dans nouvelle version en cours
- Harmonisation progressive
- Valeurs indicatives pour l'instant

### Incidents techniques mineurs (segments 011, 012)

**Document PDF à l'envers:**
- Document ouvert avec rotation incorrecte
- Recherche fonction rotation dans viewer
- Solution: télécharger en local → ouvrir avec logiciel capable pivoter
- Double-clic (pas juste aperçu) pour édition

**Disque dur plein:**
- Pratiquement plein → ralentissements
- Nettoyage effectué
- Besoin nettoyer régulièrement
- **Risque**: Saturation peut bloquer fonctionnement

---

## Thread 9: Fonctionnalités Backlog

**Segments concernés:** 001, 003, 006, 007
**Statut:** À prioriser

### Gestion sorties de stock (segment 001)

- Ajout fonctionnalité écran réception
- Bouton pour indiquer sortie au lieu entrée
- Deux choix: recyclage (éco-organismes) ou autre
- Comptabilisation dans "poids sorti" global

### Notes sur ventes/réceptions (segment 003)

- Possibilité ajouter note au moment paiement
- Utile pour contexte particulier (objet abîmé, client difficulté)
- Permet justifier prix atypique
- **Décision**: Sera ajouté dans nouvelle version

### Facturier D3E (segment 006)

- Facturier spécifique appareils électroniques
- Traçabilité: prix vente, date
- Use case: retour client si problème → remboursement ou avoir
- Question: imprimer ou dématérialiser ?

### Imprimante tickets de caisse (segment 006)

**Proposition:**
- Acheter d'occasion imprimante tickets
- Pas grosse imprimante, petit format
- Imprimer factures, reçus (simple ou double exemplaire)
- Pour clients ou compte interne

**Alternative:**
- Modèle moderne: email/téléphone → reçu numérique
- Lien avec gestion comptes utilisateurs

### Caisse différée (segment 005)

**Fonctionnalité:**
- Rentrer caisses antérieures jour par jour
- Use case: panne électricité/internet → noter papier → saisir plus tard
- Créer caisse avec date antérieure (jour D)
- Disponible aussi pour entrées/réceptions

**Import Excel:**
- Module d'import direct fichiers Excel déjà développé

### Matching automatique besoins (segment 006)

**Concept:**
- Personne a besoin "petit frigo" (liste besoins)
- Quand "petit frigo" rentré → notification automatique
- Nécessite granularité suffisante (distinguer petit/gros)

### Module saisie auto factures (segment 007)

- Idée saisie auto pour éviter saisie manuelle
- Scan + validation
- Priorité à définir

---

## Thread 10: Communication et Affichage

**Segments concernés:** 004
**Statut:** Besoin identifié

### Constat (segment 004)

**Bon travail actuel:**
- Réseaux sociaux: excellent
- Façade: excellent

**Manque identifié:**
- Communication interne et fonctionnement interne
- Besoin futur communiquer efficacement
- Supports: affichage, site internet

### Prérequis

- Clarté sur points clés (tarification, catégories, etc.)
- Cohérence discours interne/externe
- Chantier communication globale à ouvrir à terme

---

## Synthèse des Décisions Majeures

1. **Tarification**: Prix à 0 par défaut, montant global en fin (option paramétrable)
2. **Catégories EEE**: Renommer "Électroménager" → "EEE" avec 4 sous-catégories normées
3. **Jardin thermique**: Créer catégorie avec sous-catégories
4. **Vélos**: Sous-catégorie séparée pour subvention écologique
5. **Éco-organismes**: Séparation gestion interne vs déclarations (mapping automatique)
6. **Paeko**: Attendre routine établie avant automatisation
7. **Code PIN**: Système existant, activation modulaire
8. **Adhésion**: Volontaire, pas automatique
9. **Perplexity**: Utilisé pour recherches légales/comptables
10. **Chèques**: Comptabiliser à l'encaissement

## Chantiers à Ouvrir

1. **Politique tarifaire**: Clarification définitive prix minimum vs indicatif
2. **Éco-organismes**: Déclarations et mapping (besoin binôme)
3. **Paeko**: Intégration et flux comptables (routine d'abord)
4. **Communication globale**: Affichage, site, cohérence discours

## Backlog Priorisé

1. Module saisie vocale caisse (gain temps important)
2. Ergonomie gestion catégories (boutons tri)
3. Chatbot aide catégorisation
4. Imprimante tickets (ou dématérialisation)
5. Bot Discord (long terme)
