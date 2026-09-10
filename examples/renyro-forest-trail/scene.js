import {mountScene} from '../shared/standalone-runtime.js';
import {createRenyroForestTrail} from '../shared/studies/renyro-forest-trail.js';

mountScene({
  kind:'study',
  createScene:createRenyroForestTrail,
  meta:{
    title:'Renyro Forest Trail Workflow',
    kicker:'3DVIZ PRO MAX · FOREST OPERATIONS',
    description:'A document’s quiet journey through insight, human judgment and output.',
    accent:'#c4d4a4',
    craft:'A procedural forest study following the repository’s object, lighting and visual-review guidance. The existing Renyro fixture remains the source of workflow state.',
  },
  views:createRenyroForestTrail.views,
});
