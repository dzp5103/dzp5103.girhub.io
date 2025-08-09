#!/usr/bin/env python3
import argparse, os, re
from pathlib import Path

# Placeholder for TTS; integrate your provider's SDK.

def extract_section(md_text: str, title: str) -> str:
    lines = md_text.splitlines()
    buf, capture = [], False
    for ln in lines:
        if ln.strip().startswith('#') and title.lower() in ln.lower():
            capture = True
            continue
        if capture and ln.strip().startswith('#'):
            break
        if capture:
            buf.append(ln)
    return "\n".join(buf).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--text-file', required=True)
    ap.add_argument('--section', default='Executive Summary')
    ap.add_argument('--out-file', required=True)
    args = ap.parse_args()

    text = Path(args.text_file).read_text(encoding='utf-8', errors='ignore')
    ss = extract_section(text, args.section) or text[:1500]

    if not os.environ.get('OPENAI_API_KEY'):
        print('OPENAI_API_KEY not set; writing text stub instead of audio.')
        Path(args.out_file + '.txt').write_text(ss, encoding='utf-8')
        return

    # TODO: integrate with OpenAI TTS API; for now, write stub
    Path(args.out_file + '.txt').write_text(ss, encoding='utf-8')
    print('Wrote TTS input stub (implement provider call as needed).')

if __name__=='__main__':
    main()