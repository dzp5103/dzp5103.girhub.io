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
  'concept_map_editorial_lineart.mmd': '''mindmap
  root((JRC142598_01))
    Context
      Background
      Problem
    Methods
      Data Sources
      Models
      Assumptions
    Findings
      Key Results
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
  'timeline_subway_map.mmd': '''flowchart LR
  classDef lineA stroke:#1f77b4,stroke-width:4px,fill:none,color:#1f77b4
  classDef lineB stroke:#2ca02c,stroke-width:4px,fill:none,color:#2ca02c
  classDef station fill:#fff,stroke:#222,stroke-width:1px,color:#222

  A0((Intake)):::station --> A1((Parse)):::station --> A2((Visuals)):::station --> A3((Review)):::station
  B0((Data)):::station --> B1((OCR)):::station --> B2((Synthesis)):::station --> B3((Publish)):::station

  A0 --- A1 --- A2 --- A3
  B0 --- B1 --- B2 --- B3

  class A0,A1,A2,A3 lineA
  class B0,B1,B2,B3 lineB
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