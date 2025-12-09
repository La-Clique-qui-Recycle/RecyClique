# Compte-Rendu de Réunion

**Projet :** RecycClique
**Date :** Jeudi 5 décembre 2025
**Durée :** 1 heure
**Lieu :** Ressourcerie La Clique Qui Recycle

**Participants présents :**
- Christophe (développeur)
- Christel/Germaine (caisse/réception)
- Olivier/Olive (réception)
- Caro (contributeur)
- Gaby (en distanciel)

---

## Ordre du jour

1. Bugs et besoins remontés du terrain
2. Point d'avancement Paeko (comptabilité)
3. Catégories et déclarations aux éco-organismes
4. Comptes utilisateurs et code PIN

---

## 1. Bugs et besoins remontés du terrain

### Discussion

L'équipe a fait remonter plusieurs besoins opérationnels pour fluidifier le travail quotidien à la caisse et à la réception.

**Problème principal identifié :** la saisie du prix pour chaque objet fait perdre du temps à la caisse, surtout quand il y a de l'affluence. Par exemple, hier après-midi avec 4 personnes en même temps, c'était compliqué.

Un débat s'est installé sur la tarification : certains considèrent que les prix affichés sont des minimums obligatoires, d'autres les voient comme indicatifs. Cette différence de discours crée de la confusion pour les clients et entre nous. Un exemple concret : le radiateur avec un pied cassé vendu 3€ - était-ce acceptable de descendre sous le prix affiché ?

**Besoins exprimés :**
- Pouvoir enregistrer des sorties de stock (ce qui part au recyclage via les éco-organismes)
- Avoir un module de saisie vocale pour aller plus vite à la caisse
- Double dénomination des catégories : un nom court pour l'affichage et un nom complet officiel pour la comptabilité

**Bug signalé :** Il arrive que des articles du ticket précédent restent affichés quand on ouvre un nouveau ticket de caisse. Cela s'est produit 2-3 fois.

### Décisions

Après discussion, nous avons trouvé un consensus sur la tarification :
- **Par défaut, tous les prix seront à 0€** sur les articles
- Le prix global sera négocié et saisi uniquement en fin de transaction
- Cette fonctionnalité sera paramétrable (on pourra l'activer ou la désactiver)
- Exception : pour des objets particuliers (bijoux, etc.), on pourra toujours saisir un prix individuel

Pour le bug des tickets, nous allons débrancher l'écran tactile (connexion USB) pour voir si cela résout le problème.

### Actions

- **Christophe :** Implémenter l'option "prix par défaut à 0€" dans les paramètres
- **Christophe :** Étudier la faisabilité du module de saisie vocale
- **Équipe :** Débrancher l'écran tactile et surveiller si le bug persiste
- **Christophe :** Corriger définitivement le bug des tickets non vierges

---

## 2. Point Paeko (comptabilité associative)

### Discussion

Nous avons rapidement abordé l'intégration de Paeko, qui deviendra le moteur comptable de RecycClique. Paeko est hébergé sur Jarvos (serveur logiciel libre), ce qui nous garantit l'indépendance.

Il a été convenu qu'il est trop tôt pour une intégration poussée. Nous devons d'abord établir une routine comptable manuelle pendant 2-3 mois pour bien comprendre tous les flux avant d'automatiser.

**Point important discuté :** la comptabilisation des chèques. Après débat, nous retiendrons la méthode de comptabilisation à l'encaissement (au moment du rapprochement bancaire) plutôt qu'à l'émission.

Corinne a manifesté une certaine saturation cognitive face à la complexité du sujet. Nous avons donc décidé de reporter la discussion approfondie.

### Décisions

- **Reporter la réunion Paeko** après que la routine comptable soit bien établie (dans 2-3 mois)
- **Comptabiliser les chèques à l'encaissement** (rapprochement bancaire)

### Actions

- **Équipe :** Fournir à Christophe un document listant toutes les correspondances entre Recyclic et Paeko
- **Tous :** Établir une routine comptable manuelle avant d'automatiser
- **Christophe :** Planifier la prochaine réunion Paeko quand la routine sera stabilisée

---

## 3. Catégories et déclarations aux éco-organismes

### Discussion

C'était le gros morceau de la réunion. Nous sommes face à un besoin urgent : Olive est bloqué car les bennes sont pleines et il ne peut pas ranger les objets sans les bonnes catégories.

**Restructuration des catégories :**

Nous avons décidé de renommer la catégorie "Électroménager" en "EEE" (Équipements Électriques et Électroniques), conformément à la nomenclature nationale. L'opération a été faite en direct pendant la réunion.

Nous créons 4 sous-catégories normées :
1. PAM (Petits Appareils Mélange)
2. Écrans
3. Gros hors froid
4. Gros froid

**Nouvelle catégorie :** "Articles bricolage jardin thermique" avec notamment "Tondeuse autoportée" (uniquement thermique, pas électrique).

**Cas particulier des vélos :** Écologique a besoin de distinguer les vélos pour financer la bourse vélo. Nous créons donc une sous-catégorie "Cycles" séparée dans Sport et loisirs (avec "Autre ASL" pour trottinettes, ballons, raquettes...).

**Principe important identifié :** La granularité (niveau de détail) doit être dynamique. Par exemple, cette année Écologique finance les vélos, l'année prochaine ce sera peut-être les fours micro-ondes. Il faut pouvoir ajouter/retirer des sous-catégories selon les besoins évolutifs des éco-organismes.

**Clarification vocabulaire :** On ne "calque pas sur les éco-organismes" mais sur les **filières normées** (définies au niveau national). Les filières restent identiques même si on change d'éco-organisme.

**Architecture :** Séparation claire entre notre gestion interne des catégories et les déclarations aux éco-organismes. Un système de "mapping automatique" reliera nos catégories internes aux catégories officielles des déclarations.

### Décisions

- **Renommer "Électroménager" en "EEE"** avec 4 sous-catégories normées
- **Créer la catégorie "Articles bricolage jardin thermique"**
- **Créer une sous-catégorie "Cycles"** (vélos) séparée pour la subvention
- **Adopter le principe de granularité dynamique** (ajustable selon besoins)
- **Séparer gestion interne et déclarations éco-organismes** (mapping automatique)
- **Conserver uniquement la granularité minimale** requise par les filières normées

### Actions

- **Olive :** Terminer la création des catégories EEE et jardin thermique (urgent - bennes pleines)
- **Christophe :** Faire le mapping technique des anciennes données vers les nouvelles catégories
- **Christophe :** Ouvrir un chantier "éco-organismes" sur le forum avec besoin d'un binôme
- **Équipe :** Identifier qui travaillera en binôme sur les déclarations éco-organismes

---

## 4. Comptes utilisateurs et code PIN

### Discussion

Nous avons clarifié le système d'identification des utilisateurs, qui existe déjà dans Recyclic mais n'est pas encore activé.

**Double système d'authentification :**
- **Identifiant + mot de passe :** pour se connecter au site depuis n'importe où (domicile, autre poste)
- **Code PIN (4 chiffres) :** pour passer rapidement d'un utilisateur à l'autre sur le même poste (caisse/réception)

**Déconnexion automatique :** Après 5 minutes d'inactivité, la session se verrouille automatiquement. Le timing pourra être différencié selon les postes (plus court à la caisse qu'en administration).

**Niveaux d'habilitation :** Le système gère déjà 5 niveaux :
1. Utilisateur basique
2. Adhérent (avec espace personnel)
3. Habilité caisse (mais pas réception)
4. Habilité réception (mais pas caisse)
5. Admin (accès complet)

**RGPD et adhésions :** Quand on enregistre un participant, il y aura une case RGPD (décochée par défaut) pour recevoir nos informations. L'adhésion restera un choix volontaire (pas automatique). Si quelqu'un coche "adhérent", il recevra automatiquement les statuts, la charte et le règlement intérieur.

**Communication interne :** Pour le système d'alertes entre postes (déjà évoqué hier), il faudra que chaque poste soit identifié via les comptes personnels pour envoyer des messages ciblés.

**Anticipation :** Avec l'arrivée prévue de bénévoles (SNU notamment), il sera important d'activer le système de droits pour limiter les accès selon les habilitations.

### Décisions

- **Le système code PIN restera modulaire** et activable selon les besoins
- **L'adhésion sera volontaire**, pas automatique
- **Les comptes utilisateurs respecteront le RGPD** (opt-in pour communications)

### Actions

- **Christophe :** Prévoir un système de déconnexion automatique avec timing configurable
- **Christophe :** Implémenter les options d'activation/désactivation des modules dans les paramètres
- **Équipe :** Activer le système code PIN quand le besoin se fera sentir (arrivée bénévoles)

---

## Sujets complémentaires évoqués

Au fil de la réunion, plusieurs idées et outils ont été mentionnés :

**Chatbot d'aide à la catégorisation :** Une catégorie "?" qui ouvrirait un chatbot pour aider à classer les objets. Par exemple : "j'ai un tube cathodique, ça va où ?" → le chatbot interroge une base de connaissances et répond "écrans, benne écologique".

**Perplexity Pro :** Christophe propose d'utiliser cet outil pour les recherches légales et comptables complexes. Cela nous évitera de passer des heures à chercher dans les textes.

**Bot Discord (vision long terme) :** Idée évoquée d'un bot Recyclic dans notre serveur Discord. On pourrait lui dire vocalement "chèque de 50€ émis à Intel" et il enregistrerait automatiquement dans Paeko. C'est une vision pour plus tard, après que la routine manuelle soit établie.

**Elo Asso :** Question posée sur l'utilité de cet outil pour la gestion des adhérents. À explorer : existe-t-il une API pour intégrer avec Recyclic ?

---

## Chantiers à ouvrir

Trois gros chantiers ont été identifiés pour les prochains mois :

1. **Politique tarifaire :** Clarifier définitivement si nous sommes sur des prix minimums ou indicatifs. Une recherche a déjà été partagée sur les 3 modèles utilisés dans les ressourceries en France. Il faut trancher et formaliser.

2. **Déclarations éco-organismes :** Sujet technique lourd, connaissance fragmentée dans l'équipe. Besoin d'un binôme pour dégrossir et d'un forum dédié.

3. **Intégration Paeko :** Après établissement de la routine comptable (2-3 mois), travailler sur la connexion automatique Recyclic ↔ Paeko.

---

## Synthèse et prochaines étapes

### Cette semaine (urgent)

- Terminer la création des catégories EEE, jardin thermique et cycles (Olive bloqué)
- Débrancher l'écran tactile pour tester la résolution du bug
- Faire le mapping des anciennes données vers les nouvelles catégories

### Ce mois-ci

- Ouvrir le chantier "tarification" sur le forum
- Ouvrir le chantier "éco-organismes" sur le forum avec binôme
- Implémenter l'option "prix par défaut à 0€"

### Dans 2-3 mois

- Planifier la réunion Paeko (après routine établie)
- Étudier la faisabilité du module saisie vocale
- Activer le système code PIN si nécessaire (arrivée bénévoles)

---

## Conclusion

Cette réunion productive a permis de débloquer plusieurs situations opérationnelles urgentes (catégories manquantes, prix à la caisse) et de poser les bases d'une organisation plus claire pour l'avenir (Paeko, éco-organismes, comptes utilisateurs).

Le consensus trouvé sur le système de prix (0€ par défaut + prix global négocié) devrait grandement faciliter le travail à la caisse, surtout en cas d'affluence.

La restructuration des catégories conformément aux filières normées nationales nous met en conformité avec les exigences des éco-organismes tout en gardant la flexibilité nécessaire pour nous adapter aux évolutions futures.

L'approche pragmatique adoptée pour Paeko (routine manuelle d'abord, automatisation ensuite) est sage et évitera les écueils d'une automatisation prématurée.

Prochaine réunion à planifier : dans 2-3 mois pour le point Paeko approfondi.

---

**Compte-rendu rédigé par :** Christophe
**Date de diffusion :** 6 décembre 2025
**Destinataires :** Tous les participants

*Pour toute question ou précision, n'hésitez pas à me contacter.*
