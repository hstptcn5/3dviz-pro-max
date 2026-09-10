import {mountScene} from '../shared/standalone-runtime.js';
import {createRenyroForestTrail} from '../shared/studies/renyro-forest-trail.js';

mountScene({
  kind:'study',
  createScene:createRenyroForestTrail,
  meta:{
    title:'Renyro Forest Trail Workflow',
    kicker:'3DVIZ PRO MAX · REFINED NATURE STUDY',
    description:'A layered forest operations trail where Renyro execution moves through ranger stations, an Ancient Insight Tree, a readable confidence fork, and distinct success / exception destinations.',
    accent:'#8bd3a8',
    craft:'Final refinement follows the 3Dviz Pro Max loop: inspect the real browser output, identify weak silhouette/repetition/depth/path cues, then rebuild terrain, trails, vegetation, hero detail, lighting and presentation without changing the authoritative workflow state.',
  },
  views:createRenyroForestTrail.views,
});
