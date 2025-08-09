#!/usr/bin/env python3
"""
End-to-end pipeline to:
- Download the PDF (if URL provided) or read local file
- Extract text (PyPDF2/pypdf), fallback OCR (pytesseract) for scanned pages
- Build structured markdown with headings where available
- Produce chunked summaries and fill templates (downstream LLM step)
- Save outputs under ./data and ./deliverables

Usage:
  python scripts/pdf_pipeline.py --source-url https://.../JRC142598_01.pdf
  python scripts/pdf_pipeline.py --local-path JRC142598_01.pdf
"""

import argparse
import io
import os
import sys
import json
import subprocess
import tempfile
from pathlib import Path

import requests

from pypdf import PdfReader


def download_pdf(url: str, out_path: Path) -> Path:
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    out_path.write_bytes(r.content)
    return out_path


def extract_text_pypdf(pdf_path: Path) -> str:
    text_parts = []
    with open(pdf_path, "rb") as f:
        reader = PdfReader(f)
        for i, page in enumerate(reader.pages):
            try:
                txt = page.extract_text() or ""
            except Exception:
                txt = ""
            text_parts.append(f"\n\n--- PAGE {i+1} ---\n{txt}")
    return "".join(text_parts)


def needs_ocr(text: str, threshold_chars_per_page: int = 500) -> bool:
    pages = [p for p in text.split("--- PAGE ") if p.strip()]
    if not pages:
        return True
    emptyish = sum(1 for p in pages if len(p.strip()) < threshold_chars_per_page)
    return emptyish > max(2, len(pages) // 3)


def ocr_pdf(pdf_path: Path) -> str:
    """
    OCR via pdftoppm + tesseract. Requires poppler-utils and tesseract-ocr.
    """
    tmpdir = Path(tempfile.mkdtemp())
    img_prefix = tmpdir / "page"
    subprocess.run(["pdftoppm", "-png", str(pdf_path), str(img_prefix)], check=True)
    chunks = []
    for img_file in sorted(tmpdir.glob("*.png")):
        out_txt = img_file.with_suffix(".txt")
        subprocess.run(["tesseract", str(img_file), str(out_txt.with_suffix("")), "-l", "eng"], check=True)
        if out_txt.exists():
            chunks.append(f"\n\n--- OCR {img_file.name} ---\n{out_txt.read_text(encoding='utf-8', errors='ignore')}")
    return "".join(chunks)


def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build_structured_md(raw_text: str) -> str:
    lines = raw_text.splitlines()
    out = ["# Structured Extraction\n"]
    out.extend(lines)
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source-url", type=str, default="")
    ap.add_argument("--local-path", type=str, default="")
    args = ap.parse_args()

    if not args.source_url and not args.local_path:
        print("Provide --source-url or --local-path", file=sys.stderr)
        sys.exit(1)

    base = Path(".")
    data_dir = base / "data"
    deliv_dir = base / "deliverables"

    pdf_path = Path(args.local_path) if args.local_path else data_dir / "source.pdf"
    if args.source_url:
        print(f"Downloading {args.source_url} ...")
        download_pdf(args.source_url, pdf_path)
    else:
        if not pdf_path.exists():
            print(f"Local PDF not found: {pdf_path}", file=sys.stderr)
            sys.exit(1)

    print("Extracting text (parser) ...")
    raw_text = extract_text_pypdf(pdf_path)

    if needs_ocr(raw_text) or os.environ.get("FORCE_OCR", "false").lower() == "true":
        print("Low text density detected or FORCE_OCR=true; running OCR ...")
        try:
            ocr_text = ocr_pdf(pdf_path)
            raw_text = raw_text + "\n\n" + ocr_text
        except Exception as e:
            print(f"OCR failed: {e}", file=sys.stderr)

    write(data_dir / "raw_text.txt", raw_text)
    structured_md = build_structured_md(raw_text)
    write(data_dir / "structured.md", structured_md)

    # Ensure deliverables scaffolds exist if missing
    if not (deliv_dir / "full_rundown.md").exists():
        write(deliv_dir / "full_rundown.md", "# Full Run-down (placeholder)\n\nPopulate via LLM step.")

    print("Extraction complete. Artifacts:")
    print(f" - {data_dir/'raw_text.txt'}")
    print(f" - {data_dir/'structured.md'}")


if __name__ == "__main__":
    main()