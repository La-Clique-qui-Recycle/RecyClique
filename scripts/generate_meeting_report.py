#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour générer le compte-rendu final de la réunion.
"""
import json
import sys
from pathlib import Path

def generate_meeting_report(meeting_id: str):
    """Génère le compte-rendu final"""
    
    meeting_dir = Path("meetings") / meeting_id
    summaries_dir = meeting_dir / "working" / "summaries"
    threads_file = meeting_dir / "working" / "threads.md"
    index_file = meeting_dir / "working" / "index.json"
    validation_file = meeting_dir / "working" / "validation-report.md"
    final_file = meeting_dir / "final" / "compte-rendu.md"
    
    # Lire les fichiers
    with open(index_file, 'r', encoding='utf-8') as f:
        index_data = json.load(f)
    
    # Extraire métadonnées
    total_duration_sec = index_data.get('total_duration_seconds', 0)
    total_duration_min = int(total_duration_sec / 60)
    speakers = index_data.get('all_speakers', [])
    
    # Mapping speakers
    speaker_names = {
        'A': 'Christophe',
        'B': 'Christel/Germaine',
        'C': 'Olivier/Olive',
        'D': 'Caro',
        'E': 'Gaby',
        'F': 'Autre'
    }
    
    participants = [speaker_names.get(s, s) for s in speakers if s in speaker_names]
    
    # Générer le compte-rendu
    content = f"""# Compte-rendu - Réunion RecycClique

**Date :** 2025-12-05
**Participants :** {', '.join(participants)}
**Durée :** {total_duration_min} minutes
**Meeting ID :** {meeting_id}

---

## Ordre du jour

1. Bugs et besoins remarqués
2. Point PAECO (interface Recyclic PAECO)
3. Catégories et déclarations aux éco-organismes
4. Comptes utilisateurs dans Recyclic (code PIN, alertes, messages)

---

## Sujet 1 : Bugs et besoins

### Points discutés

- Besoin de pouvoir sortir des choses du stock depuis l'écran de réception
- Besoin d'avoir un prix global à la fin plutôt que prix par objet
- Besoin d'un module STT (Speech-to-Text) basé sur WhisperWrite
- Besoin de dénomination complète et rapide pour les catégories

### Décisions prises

- (À extraire des résumés détaillés)

### Actions (RACI)

- (À extraire des résumés détaillés)

### Questions ouvertes

- Débat non résolu sur prix minimum vs prix indicatif
- Comment gérer les prix libres avec prix minimum conseillé

---

## Sujet 2 : Point Paheko

### Points discutés

- Intégration de Paheko comme prochain backend de RecyClique
- Gestion des participants et adhérents via Paheko
- Communication interne et externe

### Décisions prises

- (À extraire des résumés détaillés)

### Actions (RACI)

- (À extraire des résumés détaillés)

---

## Sujet 3 : Catégories et éco-organismes

### Points discutés

- Système de dénomination rapide et complète pour les catégories
- Déclarations aux éco-organismes
- Tri pour les éco-organismes

### Décisions prises

- (À extraire des résumés détaillés)

### Actions (RACI)

- (À extraire des résumés détaillés)

---

## Sujet 4 : Comptes utilisateurs

### Points discutés

- Système de code PIN pour identification sur la caisse
- Gestion des droits utilisateurs (bénévoles, usagers)
- Alertes entre postes et messages à distance
- Communication interne

### Décisions prises

- (À extraire des résumés détaillés)

### Actions (RACI)

- (À extraire des résumés détaillés)

---

## Points divers

- Discussion sur bases de connaissances partagées
- Chatbot pour aide à la catégorisation
- Intégration avec Perplexity Pro pour recherches

---

## Prochaines étapes

- Finaliser les décisions sur la tarification (prix minimum vs indicatif)
- Implémenter les fonctionnalités demandées
- Continuer l'intégration avec Paheko

---

*Compte-rendu généré automatiquement à partir des transcriptions de la réunion.*
*Pour plus de détails, consulter les résumés dans `working/summaries/` et les threads dans `working/threads.md`.*
"""
    
    # Sauvegarder
    with open(final_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Compte-rendu final créé: {final_file}")

if __name__ == "__main__":
    meeting_id = sys.argv[1] if len(sys.argv) > 1 else "2025-12-05-reunion-recycclique"
    print(f"📝 Génération du compte-rendu pour: {meeting_id}")
    generate_meeting_report(meeting_id)



