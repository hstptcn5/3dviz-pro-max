import {workflow, executionFrames} from './fixture.js';
import {activeEdgeIds, activeNode, projectRenyroState} from './model.js';

const waiting = projectRenyroState(workflow, executionFrames[3]);
if (waiting.nodes.length !== 8) throw new Error(`expected 8 nodes, got ${waiting.nodes.length}`);
if (waiting.edges.length !== 8) throw new Error(`expected 8 edges, got ${waiting.edges.length}`);
if (activeNode(waiting)?.id !== 'review') throw new Error('Human Review should be the active WAITING station in frame 4');
if (waiting.nodes.find(node => node.id === 'confidence')?.status !== 'SUCCESS') throw new Error('Confidence Gate status lost');
if (!activeEdgeIds(waiting).has('e4')) throw new Error('Low-confidence route should be active while Human Review waits');

const complete = projectRenyroState(workflow, executionFrames.at(-1));
if (complete.nodes.find(node => node.id === 'export')?.status !== 'SUCCESS') throw new Error('Export completion status lost');
if (complete.nodes.find(node => node.id === 'exception')?.status !== 'SKIPPED') throw new Error('Exception route should remain SKIPPED');
console.log('renyro execution observatory smoke: PASS');
