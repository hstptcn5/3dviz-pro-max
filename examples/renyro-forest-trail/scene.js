import {mountScene} from '../shared/standalone-runtime.js';
import {createRenyroForestTrail} from '../shared/studies/renyro-forest-trail.js';

mountScene({
  kind:'study',
  createScene:createRenyroForestTrail,
  meta:{
    title:'Renyro Forest Trail Workflow',
    kicker:'3DVIZ PRO MAX · NATURE STUDY',
    description:'A peaceful forest operations trail where each Renyro workflow stage becomes a distinct natural station and execution travels between them as luminous wisps.',
    accent:'#8bd3a8',
    craft:'Built through the 3Dviz Pro Max skill workflow: nature-first visual direction, object reasoning, semantic construction, real-time state binding, then runtime inspection.',
  },
  views:createRenyroForestTrail.views,
});
