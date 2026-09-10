# Renyro Forest Trail Workflow

A skill-driven `3dviz-pro-max` nature study that projects the same Renyro-shaped Document AI execution model into a calm forest trail. The forest is presentation only; workflow IDs, edges, statuses, durations and branch routes remain authoritative.

## Final refined direction

The first browser-observed pass proved the concept but still looked like a prototype: repeated cone trees, a broad flat ground plate, tube-like workflow paths, an under-developed hero tree, wide framing and debug-heavy labels. The final refinement keeps the semantic mapping but rebuilds the environment around the weaknesses actually visible in that render.

### What changed

- terrain is now a deformed ground mesh with gentle height variation and distant hill layers;
- workflow edges are flat ground-following dirt ribbons instead of pipe-like tubes;
- a creek and small timber bridge add a secondary natural layer without becoming workflow state;
- vegetation is diversified into instanced pine, broadleaf, shrub, grass and rock populations;
- **Ancient Insight Tree** is promoted to the hero object with branching limbs, roots, a layered crown, rune ring, orbiting motes and a restrained magical glow;
- Ranger Archive, Review Camp, Decision Lookout, Output Lodge and Shadow Grove receive more identity-defining detail;
- station labels use a softer forest treatment and can be toggled from the controls;
- lighting is warmer and more directional to reveal form and separate the trail from the background;
- overview and review-branch camera views were tightened for a more useful composition.

## Semantic mapping

- Upload → **Forest Gate**
- Read document → **Ranger Archive**
- AI Extract → **Ancient Insight Tree**
- Confidence Gate → **Forked Trail**
- Human Review → **Review Camp**
- Approve / Reject → **Decision Lookout**
- Export JSON / CSV → **Output Lodge**
- Reject / Error Inbox → **Shadow Grove**

Execution still travels as luminous wisps on active trails. `WAITING` pulses at Review Camp, active/error stations use their workflow status color, and the exception destination remains spatially separated from the success path.

## Run locally

From the repository root:

```bash
cd examples
npm install
npm run dev
```

Then open:

`http://127.0.0.1:4180/renyro-forest-trail/index.html`

If dependencies are already installed and Vite is still running, only `git pull` and a hard browser refresh are needed.

Use **Overview**, **Review branch**, execution-frame controls, autoplay and the new label toggle. Frame 4 is the key semantic inspection frame because Human Review is in `WAITING` state.

## Acceptance questions

The study is useful only if a viewer can answer these while the scene still feels like a coherent natural environment:

1. Where is execution now?
2. Where does the confidence branch split?
3. Is the workflow waiting for a human?
4. Which path leads to Output Lodge and which leads to Shadow Grove?
5. Does the Ancient Insight Tree read as the visual/semantic landmark rather than another generic prop?
6. Do terrain, vegetation and lighting add depth without hiding the workflow?

A pretty forest alone is not a pass. A technically valid graph with weak visual communication is not a pass either.
