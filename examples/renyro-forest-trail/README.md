# Renyro Forest Trail Workflow

A bounded `3dviz-pro-max` nature study that projects the same Renyro-shaped Document AI workflow used by the Execution Observatory into a calm forest trail.

The visual metaphor is intentionally different from the earlier village experiment: workflow stages become distinct ranger/nature stations, edges become dirt trails, and active execution travels as luminous wisps. The data model is unchanged and remains authoritative.

## Semantic mapping

- Upload → **Forest Gate**
- Read document → **Ranger Archive Hut**
- AI Extract → **Ancient Insight Tree**
- Confidence Gate → **Forked Trail**
- Human Review → **Review Camp**
- Approve / Reject → **Decision Lookout**
- Export JSON / CSV → **Output Lodge**
- Reject / Error Inbox → **Shadow Grove**

## Run locally

From the repository root:

```bash
cd examples
npm install
npm run dev
```

Then open:

`http://127.0.0.1:4180/renyro-forest-trail/index.html`

Use **Overview**, **Review branch**, execution-frame controls, and autoplay. Frame 4 is the most important acceptance frame because Human Review is in `WAITING` state.

## Acceptance questions

The study is useful only if a viewer can answer these faster than from a decorative 3D scene:

1. Where is execution now?
2. Where does the confidence branch split?
3. Is the workflow waiting for a human?
4. Which path is the successful output path versus the exception path?
5. Does the natural metaphor remain readable without turning the workflow into fantasy decoration?

A pretty forest alone is not a pass.
