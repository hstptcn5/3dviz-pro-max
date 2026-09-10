# Renyro Execution Observatory

A bounded dogfood study for **3Dviz Pro Max**. It uses a Renyro-shaped Document AI workflow fixture, but it lives entirely in this repository and does not modify Renyro.

The first manual experiment forced the workflow into a fantasy village. This redo follows the skill's object-reasoning rule instead: preserve recognizable workflow structure and choose a construction metaphor that supports the subject. The result is an **execution operations deck** with functional stations, branch lanes, a human-review hold bay, an export lane, and an isolated exception lane.

## Run

From `examples/`:

```powershell
npm install
npm run dev -- --open /renyro-execution-observatory/index.html
```

Or build all examples with:

```powershell
npm run build
```

The example is auto-discovered by the existing Vite configuration because it contains its own `index.html`.

## What to inspect

Use the execution-frame control or autoplay. Frame 4 should make **Human Review Bay** the obvious blue waiting point. The successful route should then progress through Decision Console to Export Terminal while Exception Bay remains skipped. The Review branch view should make the low-confidence path spatially obvious.

## Acceptance gate

This pilot only passes the visual part of the skill workflow after a real browser render is inspected. Check that:

- the subject reads as an operations/workflow visualization rather than a decorative environment;
- main path, low-confidence review branch, export route, and exception route are spatially distinguishable;
- RUNNING, WAITING, SUCCESS, and SKIPPED states are readable without relying only on text;
- the Human Review hold is easier to spot than in the earlier village experiment;
- orbiting does not destroy the scene's explanatory structure;
- motion remains restrained and tied to execution state.

Do not treat source-level or smoke-test validation as visual PASS.
