"""PDF extraction, cleaning, and chunking."""
from __future__ import annotations

import re
from typing import List, Tuple

from pypdf import PdfReader


def _clean(text: str) -> str:
    # Remove standalone page numbers
    text = re.sub(r"^\s*\d+\s*$", "", text, flags=re.MULTILINE)
    # Join hyphen-broken line breaks: "exam-\nple" -> "example"
    text = re.sub(r"-\n(\w)", r"\1", text)
    # Collapse single newlines inside paragraphs to spaces, keep blank lines
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)
    # Collapse repeated whitespace
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf(path: str, pages_per_chunk: int = 5) -> Tuple[int, List[str]]:
    """Return (total_pages, chunks). Each chunk = cleaned text of N pages."""
    reader = PdfReader(path)
    total = len(reader.pages)
    chunks: List[str] = []
    buf: List[str] = []
    for i, page in enumerate(reader.pages):
        try:
            buf.append(page.extract_text() or "")
        except Exception:
            buf.append("")
        if (i + 1) % pages_per_chunk == 0:
            cleaned = _clean("\n".join(buf))
            if cleaned:
                chunks.append(cleaned)
            buf = []
    if buf:
        cleaned = _clean("\n".join(buf))
        if cleaned:
            chunks.append(cleaned)
    return total, chunks
