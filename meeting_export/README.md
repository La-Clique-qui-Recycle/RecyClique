# Meeting Transcription & Compte-Rendu

Export autonome du module **transcription de réunions** (transcription AssemblyAI, segmentation, analyse, compte-rendu structuré), développé dans le cadre du projet Recyclic.

## Contenu

- **scripts/** — Scripts Python réutilisables (transcription, segments, résumés, threads, validation, rapport final).
- **docs/** — Documentation (guide principal, epic, architecture, flows, prompts, stories d’exemple, templates BMAD).
- **.bmad-core/** — Workflow et tâches BMAD pour exécution multi-agents (optionnel).

## Prérequis

- Python 3
- Clé API [AssemblyAI](https://www.assemblyai.com/app/api-keys)

## Configuration

1. Copier `env_example` en `.env` et renseigner `ASSEMBLYAI_API_KEY`.
2. Créer un dossier de réunion (ex. `meetings/2025-02-15-ma-reunion/audio/`) et y déposer les fichiers audio.

## Utilisation

- **Documentation complète** : [docs/meeting-transcription/README.md](docs/meeting-transcription/README.md)
- **Lancer les scripts** depuis la racine du repo :
  ```bash
  python scripts/meeting-transcription/aai_transcribe.py --meeting-id "YYYY-MM-DD-nom-reunion"
  python scripts/meeting-transcription/prepare_segments.py "YYYY-MM-DD-nom-reunion"
  # … voir docs pour la suite.
  ```

## Licence / Origine

Contenu exporté depuis le dépôt Recyclic — tout reste conservé à l’origine ; ce dossier est une copie pour réutilisation dans un autre dépôt.
