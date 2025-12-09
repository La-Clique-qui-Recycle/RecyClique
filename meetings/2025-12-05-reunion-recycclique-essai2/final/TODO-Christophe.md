# TODO Christophe - RecycClique & Paeko

**Mise à jour :** 6 décembre 2025
**Source :** Réunion RecycClique du 5 décembre 2025

---

## Vue d'ensemble

**Légende priorités :**
- 🔴 **URGENT** : À faire cette semaine
- 🟠 **COURT TERME** : 2-4 semaines
- 🟡 **MOYEN TERME** : 1-3 mois
- 🟢 **LONG TERME** : 3-6 mois+
- 🔵 **BACKLOG** : Quand besoin/budget

**Statut :**
- [ ] À faire
- [⏳] En cours
- [✓] Fait

---

## 🔴 URGENT - Cette semaine

### Bugs et corrections immédiates

- [ ] **Investiguer bug tickets non vierges**
  - Items du ticket précédent qui traînent dans nouveau ticket
  - Signalé par Germaine et Olive (2-3 fois)
  - Action immédiate : L'équipe a débranché l'écran tactile USB
  - **Mon action :** Tester si ça résout + corriger définitivement le bug
  - **Deadline :** Fin de semaine

- [ ] **Finaliser harmonisation affichages cumuls**
  - Bug : Cumul "toujours" pour entrées vs cumul "jour" pour sorties
  - **Statut :** Déjà en cours dans nouvelle version
  - **Mon action :** Vérifier que c'est bien corrigé et déployer

### Support opérationnel urgent

- [ ] **Faire le mapping des anciennes données catégories**
  - Olive a renommé "Électroménager" → "EEE" et créé 4 sous-catégories
  - Anciennes données (four, frigidaire, etc.) pas ventilées automatiquement
  - **Mon action :** Opération technique de mapping pour replacer anciennes données
  - **Important :** Ne PAS perdre de données historiques
  - **Deadline :** Cette semaine (Olive bloqué)

---

## 🟠 COURT TERME - 2-4 semaines

### Développement fonctionnalités

- [ ] **Implémenter option "prix par défaut = 0€"**
  - Paramétrable dans settings (activable/désactivable)
  - Prix global saisi en fin de transaction
  - Exception : possibilité saisir prix individuel pour objets spécifiques (bijoux...)
  - **Référence :** Décision majeure #1 de la réunion
  - **Impact :** Fluidité caisse avec affluence

- [ ] **Finaliser système de notes sur ventes/réceptions**
  - Possibilité ajouter note au moment du paiement
  - Utile pour contexte particulier (objet abîmé, client difficulté)
  - Permet justifier prix atypique
  - **Statut :** Déjà mentionné comme "nouvelle version"
  - **Mon action :** Vérifier que c'est bien inclus

- [ ] **Ajouter gestion sorties de stock sur écran réception**
  - **État actuel :** Destinations par défaut = Magasin, Recyclage, Déchetterie (poids → compta matière ENTRANTE)
  - **À ajouter :** Case à cocher ou bouton "Sortie" à côté de la destination
  - **Comportement quand activé :**
    - "Magasin" disparaît de la liste déroulante
    - Ne reste que "Recyclage" et "Déchetterie"
    - Le poids est ajouté à la compta matière SORTANTE (même principe que caisse = poids global sorti)
  - **Use case :** Sortie vers recyclage éco-organismes, sortie vers déchetterie
  - **Référence :** Segment 001 - Gestion des sorties de stock
  - **Impact :** Permet de comptabiliser ce qui part au recyclage (déjà rentré puis ressorti)

- [ ] **Développer module éco-organismes avec mapping automatique**
  - Séparation gestion interne vs déclarations
  - Mapping catégories internes → catégories éco-organismes
  - Paramétrage en amont, pas en saisie
  - **Prérequis :** Besoin binôme de l'équipe (voir chantier Discord)
  - **Référence :** Décision majeure #9

- [ ] **Prévoir système déconnexion automatique configurable**
  - Après 5 minutes d'inactivité
  - Timing différenciable selon poste (caisse vs administration)
  - **Référence :** Discussion code PIN

### Chantiers collaboratifs à ouvrir

- [ ] **Ouvrir chantier "Politique Tarifaire" sur forum**
  - Créer fil Discord : [CHANTIER] Politique Tarifaire
  - Poster message d'introduction (voir discord-threads.md)
  - Identifier binôme (2-3 personnes)
  - **Objectif :** Clarifier définitivement prix minimum vs indicatif

- [ ] **Ouvrir chantier "Éco-organismes" sur forum**
  - Créer fil Discord : [CHANTIER] Déclarations Éco-Organismes
  - Poster message d'introduction
  - Identifier binôme (idéalement Olive ou quelqu'un qui gère les bennes)
  - **Mon besoin :** Aide pour comprendre besoins métier (connaissance fragmentée)

---

## 🟡 MOYEN TERME - 1-3 mois

### Études de faisabilité

- [ ] **Étudier faisabilité module saisie vocale caisse**
  - Base technique : WhisperWrite ou API text-to-speech
  - Fonctionnement : bouton → parler → transcription auto
  - Exemple : "3 kg de livres" → s'affiche automatiquement
  - **Bonus :** Mapping automatique ("3 casseroles" → catégorie "vaisselle")
  - **Contraintes :** Besoin micro/casque par poste
  - **Action :** Étudier faisabilité + évaluer équipement nécessaire
  - **Créer fil Discord :** [PROJET] Module Saisie Vocale

- [ ] **Refonte UX page gestion catégories**
  - Besoin boutons monter/descendre pour classer (abandon tri alphabétique auto)
  - Boutons édition trop loin
  - Rendre page "beaucoup plus ergonomique" (citation réunion)
  - **Backlog :** Pas urgent, confort d'usage

### Paeko - Préparation

- [ ] **Créer fil Discord : [CHANTIER] Intégration Paeko**
  - Poster message d'introduction
  - **Important :** Démarrage dans 2-3 mois seulement
  - **Prérequis :** Routine comptable manuelle établie d'abord

- [ ] **Collecter correspondances Recyclic ↔ Paeko**
  - Demander à l'équipe document listant toutes les correspondances
  - Nécessaire pour connexion automatique future
  - **Qui :** Germaine, Corinne, toute l'équipe compta

- [ ] **Planifier réunion Paeko approfondie**
  - Attendre routine stabilisée (2-3 mois)
  - Vérifier avec Corinne (saturation cognitive mentionnée en réunion)
  - **Objectif réunion :** Définir architecture connexion automatique

### Projets annexes

- [ ] **Réfléchir système communication interne**
  - Idée : Utiliser micro saisie vocale pour communication inter-postes
  - Type interphone : "Olivier attendu à la caisse..."
  - **Statut :** Idée évoquée, pas prioritaire

---

## 🟢 LONG TERME - 3-6 mois+

### Fonctionnalités avancées

- [ ] **Implémenter chatbot catégorie "?" en réception**
  - Catégorie spéciale "point d'interrogation" ouvrant chatbot
  - Exemple : "tondeuse autoportée, je sais pas où ça rentre"
  - Interroge base de connaissances → renvoie bonne catégorie
  - **Prérequis :** Alimenter base de connaissances (toute l'équipe)
  - **Créer fil Discord :** [PROJET] Chatbot Aide Catégorisation

- [ ] **Base de connaissances universelle**
  - Documents sources : éco-organismes, normes, catégories, lois, compta
  - Bibliothèque partageable entre ressourceries
  - Possibilité enregistrer résultats chatbot (local/global)
  - **Vision :** Réseau national ressourceries

- [ ] **Bot Recyclic sur Discord (vision long terme)**
  - Bot dans serveur Discord de l'asso
  - Commandes vocales : "chèque 50€ émis à Intel"
  - Bot répond : "OK, j'enregistre chèque n° X sur Paeko"
  - Même principe pour factures (pièce jointe) → analyse auto + validation
  - **Important :** Attendre routine établie avant automatisation
  - **Timeline :** Après 2-3 mois minimum

### Code PIN et habilitations

- [ ] **Implémenter options activation/désactivation modules**
  - Settings pour activer/désactiver fonctionnalités selon besoins
  - Exemple : module code PIN, module paiement global caisse, etc.
  - Permet adaptation selon besoins de chaque ressourcerie
  - **Créer fil Discord :** [PROJET] Activation Code PIN

- [ ] **Préparer activation système code PIN**
  - Système déjà développé, juste à activer
  - Code PIN 4 chiffres par utilisateur
  - 5 niveaux habilitation (basique, adhérent, caisse, réception, admin)
  - **Quand activer :** À l'arrivée de bénévoles/SNU (besoin limiter droits)
  - **Actions :** Former équipe, créer comptes, définir habilitations

---

## 🔵 BACKLOG - Quand besoin/budget

### Matériel

- [ ] **Étudier imprimante tickets d'occasion**
  - Pas grosse imprimante, petit format
  - Imprimer factures, reçus (simple ou double exemplaire)
  - Alternative : Dématérialisation (email/téléphone → reçu numérique)
  - **Quand :** Si budget disponible

### Recherche & Veille

- [ ] **Vérifier existence/documentation API Elo Asso**
  - Vision : Gérer membres par Recyclic → envoi auto vers Elo Asso
  - Même principe que connexion future avec Paeko
  - Alternative : Adhésions directement dans Recyclic
  - **Question ouverte :** Faut-il centraliser gestion membres dans Paeko ou garder Elo Asso ?

- [ ] **Analyser regroupements catégories racines possibles**
  - Liste actuelle : électroménager, cuisine, loisirs, textile, décoration, livres, ameublement, animalerie, bijoux, cintres, jeux, luminaires, outillage, puériculture
  - Question : Regroupements pertinents ? (ex: luminaires + électroménager ?)
  - **Attention :** Tondeuses thermiques ≠ électrique

- [ ] **Module saisie auto factures**
  - Scan + validation automatique
  - Éviter saisie manuelle
  - **Statut :** Idée évoquée, priorité à définir

---

## 📋 Chantiers collaboratifs (je suis facilitateur)

### Chantier 1 : Politique Tarifaire

**Mon rôle :** Facilitateur + dev de la solution technique
**Responsables métier :** Toute l'équipe caisse/réception + bureau

**Déjà fait :**
- ✓ Recherche sur 3 modèles pratiques tarifaires France

**À faire :**
- [ ] Créer fil Discord
- [ ] Faciliter débat équipe
- [ ] Compiler décision dans document officiel
- [ ] Implémenter solution technique selon décision

**Questions à traiter :**
- Prix minimum strict OU prix indicatif avec liberté ?
- Comment gérer cas sociaux (personnes en difficulté) ?
- Comment gérer objets abîmés ?
- Compatibilité promotions ponctuelles ?

### Chantier 2 : Déclarations Éco-organismes

**Mon rôle :** Dev + besoin binôme métier
**Responsables métier :** Besoin 1 personne qui connaît terrain (idéalement Olive)

**Problème :**
- Connaissance fragmentée dans l'équipe
- Sujet technique lourd
- Besoin aide pour ne pas faire de conneries

**À faire :**
- [ ] Créer fil Discord
- [ ] Identifier binôme
- [ ] Compiler documents sources (éco-organismes, normes, lois)
- [ ] Lister toutes filières normées qui nous concernent
- [ ] Définir mapping catégories internes → filières
- [ ] Développer module avec mapping automatique
- [ ] Tester premières déclarations

**Documents utiles :**
- Document "éco-organismes fonds réemploi" (Infomaniac)
- Échanges Discord réseau national
- Clarifications Corinne

### Chantier 3 : Intégration Paeko

**Mon rôle :** Dev connexion automatique
**Responsables métier :** Germaine, Corinne (compta)

**Démarrage :** Dans 2-3 mois (routine manuelle d'abord)

**À préparer maintenant :**
- [ ] Créer fil Discord (pour noter correspondances au fur et à mesure)
- [ ] Collecter document correspondances Recyclic ↔ Paeko
- [ ] Attendre que routine soit stabilisée

**À faire plus tard (2-3 mois) :**
- [ ] Planifier réunion Paeko approfondie
- [ ] Développer connexion automatique Recyclic → Paeko
- [ ] Implémenter push automatique opérations
- [ ] Créer templates opérations répétitives

---

## 📊 Récapitulatif par thématique

### RecycClique - Développement

**Bugs urgents :**
- [ ] 🔴 Bug tickets non vierges
- [ ] 🔴 Harmonisation affichages cumuls

**Fonctionnalités court terme :**
- [ ] 🟠 Option prix par défaut = 0€
- [ ] 🟠 Notes sur ventes/réceptions
- [ ] 🟠 Gestion sorties de stock (écran réception)
- [ ] 🟠 Module éco-organismes + mapping
- [ ] 🟠 Déconnexion auto configurable

**Fonctionnalités moyen terme :**
- [ ] 🟡 Module saisie vocale (étude faisabilité)
- [ ] 🟡 Refonte UX gestion catégories
- [ ] 🟡 Communication interne inter-postes

**Fonctionnalités long terme :**
- [ ] 🟢 Chatbot catégorie "?"
- [ ] 🟢 Base connaissances universelle
- [ ] 🟢 Bot Discord
- [ ] 🟢 Options activation/désactivation modules
- [ ] 🟢 Système code PIN (activation)

### RecycClique - Support opérationnel

**Cette semaine :**
- [ ] 🔴 Mapping anciennes données catégories (urgent - Olive bloqué)

**Court terme :**
- [ ] 🟠 Ouvrir chantiers Discord (Tarification + Éco-organismes)
- [ ] 🟠 Identifier binômes pour chantiers

### Paeko - Intégration

**Moyen terme (2-3 mois) :**
- [ ] 🟡 Créer fil Discord Paeko
- [ ] 🟡 Collecter correspondances Recyclic ↔ Paeko
- [ ] 🟡 Planifier réunion Paeko (quand routine OK)

**Long terme (après routine établie) :**
- [ ] 🟢 Développer connexion automatique
- [ ] 🟢 Templates opérations répétitives
- [ ] 🟢 Push automatique

### Veille & Recherche

**Backlog :**
- [ ] 🔵 API Elo Asso
- [ ] 🔵 Imprimante tickets
- [ ] 🔵 Module saisie auto factures
- [ ] 🔵 Regroupements catégories racines

---

## 🎯 Priorités de la semaine prochaine

**Top 3 urgent :**

1. **Mapping anciennes données catégories** (Olive bloqué)
   - Opération technique de migration
   - Ne pas perdre données historiques
   - **Estimation :** 2-3 heures

2. **Corriger bug tickets non vierges** (après test débranch ement écran)
   - Tester si débranch ement résout
   - Sinon, investigation approfondie
   - **Estimation :** Variable (1h si débranch ement OK, 3-5h si investigation)

3. **Ouvrir chantiers Discord** (Tarification + Éco-organismes)
   - Créer fils
   - Poster messages d'introduction
   - Identifier binômes
   - **Estimation :** 1 heure

**Total estimation semaine :** 4-9 heures (selon complexité bug)

---

## 📝 Notes importantes

### Décisions métier à ne pas oublier

1. **Tarification :** Prix à 0 par défaut + prix global négocié (technique OK, politique à clarifier)
2. **Catégories :** Filières normées (pas éco-organismes), granularité dynamique
3. **Paeko :** Routine manuelle 2-3 mois AVANT automatisation
4. **Code PIN :** Déjà développé, activation quand besoin (bénévoles/SNU)
5. **Chèques :** Comptabiliser à l'encaissement (rapprochement bancaire)
6. **Adhésion :** Volontaire, pas automatique (RGPD opt-in)

### Points d'attention

- **Saturation cognitive Corinne :** Ne pas surcharger sur Paeko, attendre routine
- **Urgence Olive :** Bennes pleines, besoin catégories maintenant
- **Formation équipe :** Prévoir formation quand activation code PIN
- **Communication :** Clarifier politique tarifaire pour discours unifié équipe

### Dépendances externes

- **Binôme éco-organismes :** Besoin 1 personne terrain (Olive ?)
- **Binôme tarification :** Besoin 2-3 personnes caisse/bureau
- **Correspondances Paeko :** Besoin document de Germaine/Corinne
- **Routine comptable :** 2-3 mois avant intégration Paeko

---

## 📞 Contacts & ressources

**Équipe :**
- Germaine/Christel : Caisse/réception + compta
- Olive : Réception + bennes
- Caro : Contributeur
- Corinne : Compta (attention saturation cognitive)
- Gaby : Distanciel

**Outils :**
- Perplexity Pro : Recherches légales/comptables complexes
- WhisperWrite : Base module STT
- Jarvos : Hébergement Paeko (logiciel libre)

**Documents :**
- Document "éco-organismes fonds réemploi" (Infomaniac)
- Recherche 3 modèles tarifaires France
- Dénominations normées nationales (gouvernement)

---

**Dernière mise à jour :** 6 décembre 2025
**Prochaine révision :** Après réunion Paeko (dans 2-3 mois)

---

*Ce pense-bête est généré à partir du compte-rendu de la réunion RecycClique du 5 décembre 2025. Pour plus de détails, consulter les documents dans `meetings/2025-12-05-reunion-recycclique-essai2/final/`*
