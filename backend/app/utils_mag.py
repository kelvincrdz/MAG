from __future__ import annotations
from zipfile import ZipFile
from pathlib import Path
import io
from typing import List

AUDIO_EXTS = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".webm"]


def is_audio(name: str) -> bool:
    low = name.lower()
    return any(low.endswith(ext) for ext in AUDIO_EXTS)


def is_markdown(name: str) -> bool:
    return name.lower().endswith(".md")


def extract_markdown_title(content: str) -> str:
    for line in content.splitlines():
        l = line.strip()
        if l.startswith("# "):
            return l[2:].strip()
    return ""


def detect_references(content: str, available: List[str]) -> List[str]:
    refs = []
    low_content = content.lower()
    for fname in available:
        base = Path(fname).stem.lower()
        if fname.lower() in low_content or base in low_content:
            refs.append(fname)
    return refs
