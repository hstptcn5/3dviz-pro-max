# Object craft: form, material and motion

Use this reference when object quality matters: a close-up creature, an architectural scene, a scientific cutaway, a product, or an interactive assembly. Detail should reveal the object's identity and construction. Adding more objects does not repair weak modeling of the important ones. These are artistic prompts, not mandatory density scores or a prescribed style.

## Design the object before scattering it

Choose the object's role and nearest useful viewing distance. Define a recognizable silhouette, its major connected masses, and the parts that deserve attention. A hero object should reward inspection; distant supporting objects can be simpler. A deliberately minimal mathematical form can be complete without surface decoration.

Think at three scales:

- **Silhouette:** proportion, posture, profile, major openings and asymmetry. A mill, inn and observatory should remain distinguishable without relying on color. Distinct creature species need different skeletons and body proportions, not recolored copies.
- **Construction:** overlapping roof courses, window recesses, door jambs, frame joints, wing membranes, hooves, antlers, bone landmarks, teeth and bearings. Parts should connect in a readable way and have plausible thickness for the chosen visual language.
- **Surface:** grain direction, seam placement, edge treatment, finish variation, worn contact areas or soft fur masses. Spend this detail where it survives the actual camera scale. Avoid uniform noise, random scratches or gratuitous subdivision.

Model silhouette-changing details as geometry. Shading detail can support smaller features; it cannot repair a missing outline, joint, cavity or opening.

## Give materials distinct behavior

Choose a small material family for the object and a reason for each assignment. Specify base appearance, roughness, metallic response where appropriate, transparency/transmission if useful, and the scale/direction of surface features. Inspect those choices under the actual lighting, including close views. Do not make every surface the same glossy plastic with a different color.

| Object family | Useful artistic decisions | Common weak result to repair |
| --- | --- | --- |
| Timber and masonry | Beam ends, board grain along members, recessed mortar, varied stone sizes, restrained edge wear | Flat cream box with brown strips; random stone texture without structural joints |
| Roof and glasshouse | Overlapping tiles, ridge/eaves, visible frame depth, separated glass panes, interior silhouettes | Paper-thin roof; opaque filler box hiding everything behind nominally transparent glass |
| Mythical animals | Species-specific body masses, muzzle/eyes, ear roots, paws/claws, layered feathers or fur tufts, segmented tails | Floating spheres with identical cone ears; wings that rotate without a shoulder |
| Mechanical assembly | Distinguishable housing, shafts, teeth, bearings, fasteners and contact surfaces | Teeth that look convincing but intersect or move with the wrong ratio |
| Scientific anatomy | Sourced landmarks and attachments, meaningful layers, section thickness and restrained material separation | Decorative grooves mistaken for anatomy; invented tissue or impossible attachment |
| Mathematical/logic object | Crisp boundaries, consistent axes, purposeful transparency, readable labels and state-dependent emphasis | Decorative effects obscure the invariant or imply unsupported physical properties |

For Three.js, its [standard material documentation](https://threejs.org/docs/pages/MeshStandardMaterial.html) describes the metallic/roughness workflow and distinguishes normal-map shading from displacement geometry. The [physical material documentation](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) describes transmission, clearcoat, sheen and their additional rendering cost. Choose effects for the required appearance; using a PBR material alone does not establish physical accuracy. Documentation read 2026-09-07; verify APIs against the project's installed version before implementation.

## Make articulation belong to the object

Place local pivots at meaningful attachments. Parent parts so a moving limb carries its foot, a shoulder carries its wing, and a shaft carries its wheel. Separate authoritative state from visual interpolation. Derive coupled mechanical parts from their shared state or constraint, not independent oscillations that merely look active.

For invented creatures, vary gait, cadence, stride and secondary motion by morphology. Let a heavy deer and a hovering owl feel different. Check foot contact, route height, turns and collisions with buildings. A decorative route can be authored rather than simulated, but should not visibly pass through a wall. Wings need visible root articulation, tails can have delayed motion, and eyes/heads can guide attention without all creatures bobbing identically.

For established science, research the allowed motion and attachments before animating. A stylized knee is not a generic door hinge; a flow arrow is not evidence of a fluid simulation. Keep illustrative choices explicit and preserve the sourced structural relationships.

## Review at the scales the viewer can use

Inspect a composed overview and a close view of each important object family, plus a frame during motion. Ask what the viewer can identify, how materials separate, whether joints remain attached, and whether the next useful interaction is visible. Exercise Play, Step, Reset or equivalent actions when the scene teaches a change; a technically working slider can still leave the experience looking inert.

[templates/checklists/inspection-per-frame.md](../templates/checklists/inspection-per-frame.md) lists the captures a scene owes and the per-frame checks to run on each one; work through it once the frames exist.

`knowledge.hero-detail-ladder-defaults` and the kit proofs provide examples tuned for their stated
objects and views. Their architectural feature counts and distances are not universal quality gates.
Inspect what makes the current subject convincing: an anatomical attachment, a readable vector or a
satin silhouette may matter more than bevels and wear. Choose kit, adapted kit, custom geometry or
sourced geometry by fit; do not route every failed close-up back to a kit.

Iterate on the weakest important object before adding incidental props. Simplify details that shimmer, obscure meaning or exceed the delivery medium. Keep room for stylized, painterly, low-poly, sculptural and experimental choices: craftsmanship means deliberate execution, not mandatory realism.
