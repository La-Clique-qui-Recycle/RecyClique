#!/usr/bin/env python3
"""
Script pour découper les transcriptions en segments exploitables.
Workflow: meeting-transcription
Stage: prepare_segments
"""

import json
import os
from pathlib import Path
from datetime import timedelta

# Configuration
MEETING_ID = "2025-01-27-test-transcription"
SEGMENT_DURATION_MS = 5 * 60 * 1000  # 5 minutes en millisecondes
OVERLAP_MS = 30 * 1000  # 30 secondes en millisecondes

# Chemins
BASE_DIR = Path(__file__).parent.parent
TRANSCRIPTIONS_DIR = BASE_DIR / "transcriptions"
WORKING_DIR = BASE_DIR / "working"
SEGMENTS_DIR = WORKING_DIR / "segments"

# Créer les dossiers
SEGMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Lire la transcription consolidée
full_transcript_path = TRANSCRIPTIONS_DIR / "full-transcript.json"
print(f"Lecture de {full_transcript_path}...")

with open(full_transcript_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

meeting_id = data.get("meeting_id", MEETING_ID)
utterances = data.get("utterances", [])
speakers_map = data.get("speakers", {})

print(f"Nombre d'utterances: {len(utterances)}")

# Trier les utterances par timestamp (déjà triées normalement)
utterances_sorted = sorted(utterances, key=lambda u: u.get("start", 0))

# Calculer la durée totale
if utterances_sorted:
    total_duration_ms = max(u.get("end", 0) for u in utterances_sorted)
    print(f"Durée totale: {total_duration_ms / 1000:.1f} secondes ({total_duration_ms / 60000:.1f} minutes)")
else:
    print("Aucune utterance trouvée!")
    exit(1)

# Créer les segments
segments = []
segment_num = 1
current_start = 0

while current_start < total_duration_ms:
    segment_end = current_start + SEGMENT_DURATION_MS
    
    # Collecter les utterances dans cette fenêtre
    segment_utterances = []
    for utt in utterances_sorted:
        utt_start = utt.get("start", 0)
        utt_end = utt.get("end", 0)
        
        # Inclure si chevauche avec la fenêtre
        if utt_start < segment_end and utt_end > current_start:
            segment_utterances.append(utt)
    
    if segment_utterances:
        # Calculer les timestamps réels du segment
        seg_start = min(u.get("start", 0) for u in segment_utterances)
        seg_end = max(u.get("end", 0) for u in segment_utterances)
        seg_duration = seg_end - seg_start
        
        # Extraire le texte
        segment_text = "\n\n".join([
            f"**{u.get('speaker', '?')}** ({speakers_map.get(u.get('speaker', ''), 'Unknown')}): {u.get('text', '')}"
            for u in segment_utterances
        ])
        
        # Liste des speakers uniques
        segment_speakers = list(set(u.get("speaker", "?") for u in segment_utterances))
        
        # Créer le fichier segment
        segment_filename = f"segment-{segment_num:03d}.md"
        segment_path = SEGMENTS_DIR / segment_filename
        
        segment_content = f"""# Segment {segment_num}

**Timestamp :** {seg_start}ms - {seg_end}ms ({seg_start/1000:.1f}s - {seg_end/1000:.1f}s)
**Durée :** {seg_duration/1000:.1f} secondes ({seg_duration/60000:.1f} minutes)
**Speakers :** {', '.join(segment_speakers)}

## Texte

{segment_text}
"""
        
        with open(segment_path, 'w', encoding='utf-8') as f:
            f.write(segment_content)
        
        segments.append({
            "id": f"segment-{segment_num:03d}",
            "file": f"working/segments/{segment_filename}",
            "start": seg_start,
            "end": seg_end,
            "duration": seg_duration,
            "speakers": segment_speakers,
            "num_utterances": len(segment_utterances)
        })
        
        print(f"Créé: {segment_filename} ({seg_duration/1000:.1f}s, {len(segment_utterances)} utterances)")
        
        segment_num += 1
    
    # Avancer avec overlap
    current_start = segment_end - OVERLAP_MS

print(f"\nTotal segments créés: {len(segments)}")

# Créer l'index JSON
index_data = {
    "meeting_id": meeting_id,
    "total_segments": len(segments),
    "total_duration_seconds": total_duration_ms / 1000,
    "segments": []
}

for seg in segments:
    # Estimer les tokens (approximation: ~4 chars/token)
    segment_file = SEGMENTS_DIR / seg["file"].split("/")[-1]
    if segment_file.exists():
        size_chars = len(segment_file.read_text(encoding='utf-8'))
        tokens = size_chars // 4
    else:
        size_chars = 0
        tokens = 0
    
    # Calculer les overlaps
    overlap_prev = None
    overlap_next = None
    
    for i, s in enumerate(segments):
        if s["id"] == seg["id"]:
            if i > 0:
                prev_seg = segments[i-1]
                if prev_seg["end"] > seg["start"]:
                    overlap_prev = prev_seg["id"]
            if i < len(segments) - 1:
                next_seg = segments[i+1]
                if seg["end"] > next_seg["start"]:
                    overlap_next = next_seg["id"]
            break
    
    index_data["segments"].append({
        "id": seg["id"],
        "file": seg["file"],
        "start": seg["start"],
        "end": seg["end"],
        "duration": seg["duration"],
        "tokens": tokens,
        "size_chars": size_chars,
        "speakers": seg["speakers"],
        "num_utterances": seg["num_utterances"],
        "overlap_prev": overlap_prev,
        "overlap_next": overlap_next
    })

# Calculer métriques globales
total_tokens = sum(s["tokens"] for s in index_data["segments"])
all_speakers = set()
for seg in segments:
    all_speakers.update(seg["speakers"])

index_data["total_tokens"] = total_tokens
index_data["total_speakers"] = len(all_speakers)
index_data["speakers_list"] = list(all_speakers)

# Sauvegarder l'index
index_path = WORKING_DIR / "index.json"
with open(index_path, 'w', encoding='utf-8') as f:
    json.dump(index_data, f, indent=2, ensure_ascii=False)

print(f"\nIndex créé: {index_path}")
print(f"Métriques globales:")
print(f"  - Total segments: {index_data['total_segments']}")
print(f"  - Durée totale: {index_data['total_duration_seconds']/60:.1f} minutes")
print(f"  - Total tokens: {total_tokens:,}")
print(f"  - Speakers: {', '.join(sorted(all_speakers))}")

