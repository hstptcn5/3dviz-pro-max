# Renyro Forest Trail Workflow

A calm, stylized forest projection of the existing Renyro-shaped Document AI fixture. The forest is presentation only: workflow IDs, edges, branch routes, statuses and durations remain owned by the fixture and projection model in `renyro-execution-observatory/`.

## Explore the trail

The Ancient Insight Tree is the central landmark. Rounded terrain, shaded woodland clusters and an open confidence fork separate the trail into a warm output path, a human-review route and a cooler exception spur. The creek and entrance bridge are scenery; they are not workflow edges.

| Workflow step | Forest landmark |
| --- | --- |
| Upload | Forest Gate |
| Read document | Ranger Archive Hut |
| AI Extract | Ancient Insight Tree |
| Confidence Gate | Forked Trail |
| Human Review | Review Camp |
| Approve / Reject | Decision Lookout |
| Export JSON / CSV | Output Lodge |
| Reject / Error Inbox | Shadow Grove |

The route stays:

- Upload → Read document → AI Extract → Confidence Gate.
- High confidence → Export JSON / CSV.
- Low confidence → Human Review → Approve / Reject.
- Approved → Export JSON / CSV; rejected → Reject / Error Inbox.

Grounded dirt paths, inset direction markers and the route key show the branches when motion is paused. Luminous wisps and station lanterns derive their active state from the existing projection. Screen labels show the software step, forest landmark and recorded status. Review Camp adds a blue signal and an explicit **WAITING · HUMAN REVIEW** badge during the hold.

The supplied seven-frame playback follows review and approval. It contains `RUNNING`, `WAITING`, `SUCCESS` and `SKIPPED`; it does **not** contain a failed or rejected run. The exception trail and `FAILED` styling exist without inventing additional execution evidence.

## Run locally

From the repository root:

```bash
cd examples
npm install
npm run dev
```

Open `http://127.0.0.1:4180/renyro-forest-trail/index.html`.

With dependencies installed and Vite already running, pull the branch and hard-refresh the page. There is no separate study build step for the dev server.

- **Overview** frames all eight stations and the full fork.
- **Review branch** brings the camp, decision lookout and destinations closer.
- **Pause motion** freezes both playback and ambient movement. Reduced-motion preferences start paused.
- **Controls & notes** retains the execution-frame selector, Next frame, Autoplay, Labels and Reset study controls.
- **Visit the Insight Tree** opens the hero view through the shared viewer contract.
- **Frame 4** shows the human-review hold. Select it with motion paused to inspect the state without autoplay advancing.

Labels can be hidden for an unobstructed scene. The status lanterns and waiting signal remain part of the 3D projection.

## Implementation boundaries

`scene.js` mounts the existing shared runtime. The study-specific `style.css` styles the page and projected labels. `examples/shared/studies/renyro-forest-trail.js` owns station geometry, annotations and visual state; `renyro-forest-environment.js` owns terrain, path geometry, clustered vegetation and the sun/sky treatment. Neither file changes the fixture or projection logic.

Acceptance depends on the actual render: the hero must read clearly, the confidence split must remain visible, and a viewer must distinguish waiting for a human from a running or completed step. See the conversation for this pass's visual observations. Historical trace and validation files describe earlier passes and are not updated by this code-focused refinement.
