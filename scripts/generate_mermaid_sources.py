#!/usr/bin/env python3
from pathlib import Path

mermaids = {
  'concept_map_minimal.mmd': '''mindmap
  root((Report Themes))
    Methods
      Data
      Assumptions
    Findings
      Evidence
      Limitations
    Implications
      Policy
      Strategy
      Engineering
''',
  'method_flow_flat.mmd': '''flowchart LR
  A[Problem] --> B[Data Sources]
  B --> C[Preprocessing / Assumptions]
  C --> D[Methods / Models]
  D --> E[Validation]
  E --> F[Findings]
  F --> G[Recommendations]
''',
  'timeline_editorial.mmd': '''gantt
  title Roadmap
  dateFormat  YYYY-MM-DD
  section Intake
  Access & Validation     :a1, 2025-08-09, 1d
  section Analysis
  Parse & Summarize       :a2, 1d
  Visuals & Presentation  :a3, 1d
  Review & Publish        :a4, 1d
''',
  'risk_heatmap_grid.mmd': '''quadrantChart
  title Risk Heatmap (illustrative)
  x-axis Low Impact --> High Impact
  y-axis Low Likelihood --> High Likelihood
  quadrant-1 Monitor
  quadrant-2 Mitigate
  quadrant-3 Accept
  quadrant-4 Avoid
  "OCR errors" : [0.6, 0.4]
  "Ambiguous figures" : [0.5, 0.5]
  "Data gaps" : [0.7, 0.6]
'''
}

out_dir = Path('assets/visuals')
out_dir.mkdir(parents=True, exist_ok=True)
for name, content in mermaids.items():
    (out_dir / name).write_text(content, encoding='utf-8')
print(f"Wrote {len(mermaids)} Mermaid sources to {out_dir}")