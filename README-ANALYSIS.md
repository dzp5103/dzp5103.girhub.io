# Automated PDF Analysis, Visuals, and Audio

This repository includes an automated pipeline to analyze `JRC142598_01.pdf`, generate summaries, visuals in multiple styles, and optional audio narration.

## Quick start
1. (Optional) Add secret `OPENAI_API_KEY` to enable image + audio generation.
2. (Optional) Add repository variable `MODEL_ID` (e.g., `gpt-4o` or `gpt-5` if available).
3. Run the workflow: Actions → `PDF Analysis, Visuals, and Audio` → `Run workflow`.

## Outputs
- `data/raw_text.txt` — raw text extracted (OCR fallback when needed)
- `data/structured.md` — lightly structured text
- `deliverables/full_rundown.md` — synthesized run-down
- `deliverables/roadmap.md` — progressive roadmap
- `deliverables/presentation.marp.md` → `assets/visuals/presentation.(pdf|html)`
- `assets/visuals/*` — diagrams, images (multi-style)
- `assets/audio/*` — narration MP3 (if enabled)

## Local development
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt  # if you create one; otherwise see workflow for deps
python scripts/pdf_pipeline.py --local-path JRC142598_01.pdf
python scripts/llm_summarize.py --raw-text data/raw_text.txt --out-rundown deliverables/full_rundown.md --out-key deliverables/key_findings.md --out-risks deliverables/risks_limitations.md
node -v && npm i -g @marp-team/marp-cli @mermaid-js/mermaid-cli
python scripts/generate_mermaid_sources.py && for f in assets/visuals/*.mmd; do mmdc -i "$f" -o "assets/visuals/$(basename "$f" .mmd).png"; done
```

## Notes
- If the PDF path or name differs, update the workflow/script arguments.
- The LLM and TTS scripts are placeholders—extend them with your preferred SDKs for full automation.