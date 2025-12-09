# Fils Discord - Chantiers RecycClique

Suite à la réunion du 5 décembre 2025, voici les fils à créer dans le forum "Recyclic" sur Discord.

---

## Thread 1: Politique Tarifaire - Prix Minimum vs Indicatif

**Titre du fil:** `[CHANTIER] Politique Tarifaire - Prix Minimum vs Indicatif`

**Message d'introduction:**

Salut à tous,

Suite à la réunion du 5 décembre, on ouvre ce chantier pour **clarifier définitivement notre politique tarifaire**.

**Le problème :**
On a tous des discours différents : certains disent "prix minimum obligatoire", d'autres "prix indicatif". Ça crée de la confusion pour les clients ET entre nous. Exemple vécu : le radiateur avec pied cassé à 3€ - était-ce acceptable ou pas ?

**Décision technique prise :**
Le système permettra de mettre les prix à 0€ par défaut, avec prix global négocié en fin de transaction. Mais ça ne résout pas la question de FOND : quelle est notre politique officielle ?

**Ce qu'on sait déjà :**
Christophe a fait une recherche sur les pratiques en France → 3 modèles différents identifiés dans les ressourceries.

**Objectif du chantier :**
1. Étudier les 3 modèles existants
2. Débattre et choisir celui qui nous correspond
3. Formaliser notre politique dans un document officiel
4. Former tout le monde au discours unifié

**Questions à traiter :**
- Prix minimum strict OU prix indicatif avec liberté ?
- Comment gérer les cas sociaux (personnes en difficulté) ?
- Comment gérer les objets abîmés ?
- Compatibilité avec les promotions ponctuelles ?

**Qui est concerné :** Toute l'équipe caisse/réception + bureau

**Timeline :** À définir ensemble, mais c'est prioritaire pour éviter les malentendus

Qui veut bosser sur ce chantier ? On a besoin d'au moins 2-3 personnes pour dégrossir.

---

## Thread 2: Déclarations Éco-Organismes et Mapping Catégories

**Titre du fil:** `[CHANTIER] Déclarations Éco-Organismes - Conformité et Mapping`

**Message d'introduction:**

Hey l'équipe,

On ouvre ce chantier suite à la réunion du 5 décembre pour **maîtriser les déclarations aux éco-organismes**.

**Le contexte :**
C'est un sujet technique LOURD. Les connaissances sont fragmentées dans l'équipe. Christophe a besoin d'aide pour ne pas faire de conneries dans le développement.

**Ce qu'on a clarifié en réunion :**
- On ne calque PAS sur les éco-organismes, on calque sur les **filières normées** (définies au niveau national)
- Les filières restent identiques même si on change d'éco-organisme
- On sépare notre gestion interne des catégories et les déclarations officielles (via mapping automatique)

**Catégories normées identifiées :**

**EEE (4 sous-catégories) :**
1. PAM (Petits Appareils Mélange)
2. Écrans
3. Gros hors froid
4. Gros froid

**Jardin thermique :**
1. Tondeuse autoportée
2. [Autres à définir - voir doc fonds réemploi]

**Sport et loisirs :**
1. Cycles (vélos - pour subvention bourse vélo)
2. Autre ASL (trottinettes, ballons, raquettes...)

**Objectif du chantier :**
1. Compiler tous les documents sources (éco-organismes, normes, lois)
2. Lister toutes les filières normées qui nous concernent
3. Définir le mapping entre nos catégories internes et les filières
4. Identifier les besoins de granularité dynamique (ex: vélos cette année, fours micro-ondes l'an prochain)
5. Préparer les premières déclarations tests

**Documents utiles :**
- Document "éco-organismes fonds réemploi" (Infomaniac)
- Échanges Discord avec le réseau national ressourceries
- Clarifications Corinne

**Qui est concerné :** Besoin d'un binôme minimum (Christophe + 1 personne qui connaît bien le terrain)

**Timeline :** Plusieurs semaines, c'est complexe

Qui se sent de bosser là-dessus ? Idéalement quelqu'un qui gère déjà les bennes et connaît les éco-organismes.

---

## Thread 3: Intégration Paeko - Backend Comptable

**Titre du fil:** `[CHANTIER] Intégration Paeko - Backend Comptable (démarrage dans 2-3 mois)`

**Message d'introduction:**

Coucou,

On crée ce fil en anticipation pour l'**intégration Paeko**, même si on ne démarre vraiment que dans 2-3 mois.

**La décision prise en réunion :**
On REPORTE la discussion approfondie. Pourquoi ? Parce qu'il faut d'abord établir une **routine comptable manuelle** pendant 2-3 mois pour bien comprendre tous les flux.

**Ce qu'on sait déjà :**
- Paeko deviendra le moteur comptable de Recyclic
- Hébergé sur Jarvos (logiciel libre) - indépendance garantie
- Recyclic sera comme une "télécommande Paeko"
- Paeko permet de créer des templates pour opérations répétitives

**Points déjà décidés :**
- Comptabilisation des chèques : à l'encaissement (rapprochement bancaire), pas à l'émission

**Ce qu'il faut préparer (d'ici 2-3 mois) :**
- Document listant toutes les correspondances Recyclic ↔ Paeko
- Routines comptables stabilisées
- Plan comptable bien maîtrisé

**Objectif du chantier (quand on démarrera) :**
1. Connexion automatique Recyclic → Paeko
2. Push automatique des opérations
3. Templates pour opérations répétitives (chèques fin de mois, etc.)

**Qui est concerné :** Comptabilité (Germaine, Corinne) + Christophe

**Timeline :** Démarrage dans 2-3 mois, après routine établie

Pour l'instant, on utilise ce fil pour noter toutes les correspondances qu'on identifie au fur et à mesure, et poser les questions qui émergent.

---

## Thread 4: Module Saisie Vocale - Caisse et Réception

**Titre du fil:** `[PROJET] Module Saisie Vocale - STT pour Caisse/Réception`

**Message d'introduction:**

Hello,

On ouvre ce fil pour le développement du **module de saisie vocale (STT - Speech-to-Text)**.

**Le besoin :**
Accélérer les saisies à la caisse et à la réception. Au lieu de taper, on parle.

**Cas d'usage principal (caisse) :**
1. J'appuie sur un bouton
2. Je dis "3 kg de livres"
3. Ça s'affiche automatiquement
4. Je valide ou corrige si erreur
5. Total calculé en fin

**Avantages :**
- Gain de temps considérable (surtout avec affluence)
- Mains libres pour peser/manipuler
- Plus fluide

**Fonction bonus : mapping automatique**
- Je dis "3 casseroles"
- Le système comprend → catégorie "vaisselle"
- Pas besoin de dire "V-A-I-S-S-E-L-L-E"

**Base technique :**
WhisperWrite ou autre API text-to-speech

**Contraintes matérielles :**
- Besoin micro par poste (ou casque Bluetooth)
- Question du confort (casque toute la journée ?)
- Équipement dédié

**Idée complémentaire :** Utiliser le micro aussi pour communication inter-postes (type interphone supermarché : "Olivier est attendu à la caisse...")

**Objectif du chantier :**
1. Étudier faisabilité technique
2. Évaluer équipement nécessaire et budget
3. Tester prototype
4. Déploiement si concluant

**Qui est concerné :** Christophe (dev) + testeurs caisse/réception

**Timeline :** Moyen terme (1-3 mois)

Vos retours et idées sont les bienvenus !

---

## Thread 5: Chatbot Aide Catégorisation - IA

**Titre du fil:** `[PROJET] Chatbot Aide Catégorisation - Base de Connaissances`

**Message d'introduction:**

Salut à tous,

Suite à la réunion, on ouvre ce fil pour le projet **chatbot d'aide à la catégorisation**.

**Le concept :**
Une catégorie spéciale "?" dans l'interface. Quand on clique dessus, ça ouvre un chatbot.

**Cas d'usage :**
- "J'ai un tube cathodique, ça va où ?"
  → Chatbot : "Écrans, benne écologique. Si trop gros, à côté de la benne."

- "Tondeuse autoportée, je sais pas où ça rentre ?"
  → Chatbot : "Articles bricolage jardin thermique, sous-catégorie tondeuse autoportée"

- "Pistolet d'arrosage ?"
  → Chatbot analyse et propose la bonne catégorie

**Comment ça marche :**
1. Base de connaissances alimentée avec :
   - Documents éco-organismes
   - Normes et catégories officielles
   - Lois et règlements
   - Documentation compta
2. Interrogation texte OU vocale
3. Recherche dans la base
4. Réponse avec références

**Outil externe :**
Perplexity Pro peut aussi être utilisé pour recherches légales/comptables complexes

**Vision long terme :**
- Base de connaissances partagée entre ressourceries (réseau national)
- Enregistrement des résultats pour enrichir la base
- Fallback sur recherche internet si pas de réponse

**Objectif du chantier :**
1. Alimenter la base de connaissances
2. Développer l'interface chatbot
3. Tester et ajuster
4. Déploiement progressif

**Qui est concerné :** Christophe (dev) + toute l'équipe pour alimenter la base

**Timeline :** Long terme (3-6 mois minimum)

Pour l'instant, on peut commencer à compiler les questions récurrentes qu'on se pose et leurs réponses. Postez-les ici !

---

## Thread 6: Comptes Utilisateurs et Code PIN - Activation

**Titre du fil:** `[PROJET] Activation Code PIN et Gestion Droits Utilisateurs`

**Message d'introduction:**

Hey,

On ouvre ce fil pour préparer l'**activation du système code PIN et gestion des droits**.

**Le système (déjà développé, juste à activer) :**

**Double authentification :**
- Identifiant + mot de passe : connexion web depuis n'importe où
- Code PIN (4 chiffres) : passage rapide entre utilisateurs sur même poste

**5 niveaux d'habilitation :**
1. Utilisateur basique
2. Adhérent (+ espace perso)
3. Habilité caisse (mais pas réception)
4. Habilité réception (mais pas caisse)
5. Admin (accès complet)

**Déconnexion auto :** Après 5 min d'inactivité (timing configurable selon poste)

**Fonctionnalités liées :**
- Traçabilité complète (qui a fait quoi, quand)
- Logs et audit
- Système d'alertes/messages ciblés entre postes
- RGPD (opt-in pour communications)
- Adhésion volontaire (pas automatique)

**Quand activer :**
Pas d'urgence maintenant. MAIS anticipation de l'arrivée de bénévoles (SNU notamment) → besoin de limiter les droits par sécurité.

**Objectif du chantier :**
1. Définir qui a quel niveau d'habilitation
2. Créer les comptes utilisateurs
3. Choisir les codes PIN
4. Former tout le monde au système
5. Activer progressivement

**Qui est concerné :** Toute l'équipe

**Timeline :** À activer quand on en a besoin (arrivée bénévoles)

En attendant, utilisez ce fil pour toute question sur les droits et habilitations.

---

## Notes pour la création des fils

**Instructions Discord :**

1. Aller dans le forum "Recyclic"
2. Créer 6 nouveaux fils avec les titres ci-dessus
3. Poster le message d'introduction correspondant dans chaque fil
4. Épingler les messages d'introduction
5. Ajouter les tags appropriés :
   - `CHANTIER` pour les 3 premiers (prioritaires, plusieurs semaines)
   - `PROJET` pour les 3 derniers (moyen/long terme)

**Ordre de priorité suggéré :**
1. Politique Tarifaire (urgent - confusion actuelle)
2. Déclarations Éco-Organismes (urgent - besoin conformité)
3. Module Saisie Vocale (amélioration opérationnelle)
4. Chatbot Catégorisation (confort, pas bloquant)
5. Code PIN (activation quand besoin)
6. Intégration Paeko (démarrage dans 2-3 mois)

**Participants à mentionner :**
- @Christophe sur tous les fils techniques
- @Germaine @Corinne sur Politique Tarifaire et Paeko
- @Olive sur Éco-Organismes
- Toute l'équipe sur Code PIN

---

*Créé le 6 décembre 2025 suite à la réunion RecycClique du 5 décembre*
