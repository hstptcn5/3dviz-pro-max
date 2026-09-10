import {mountScene} from '../shared/standalone-runtime.js';
import {createRenyroExecutionObservatory} from '../shared/studies/renyro-execution-observatory.js';

mountScene({
  kind: 'study',
  createScene: createRenyroExecutionObservatory,
  meta: {
    title: 'Renyro Execution Observatory',
    kicker: '3DVIZ PRO MAX · SKILL-DRIVEN PILOT',
    description: 'A spatial operations deck for reading branching workflow execution, human-review holds, and exception routing without turning the workflow into a fantasy metaphor.',
    accent: '#70d7c3',
    craft: 'Built as a dogfood study of the 3Dviz Pro Max workflow: subject reasoning first, authoritative state preserved, then a custom low-poly real-time construction route.',
  },
  views: createRenyroExecutionObservatory.views,
});
