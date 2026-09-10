export const workflow = {
  id: 'renyro-document-ai-study',
  name: 'Document AI review flow',
  nodes_json: [
    { id: 'upload', name: 'Upload', type: 'documentReader' },
    { id: 'read', name: 'Read document', type: 'documentReader' },
    { id: 'extract', name: 'AI Extract', type: 'deepseekAI' },
    { id: 'confidence', name: 'Confidence Gate', type: 'conditionIf' },
    { id: 'review', name: 'Human Review', type: 'humanApproval' },
    { id: 'decision', name: 'Approve / Reject', type: 'conditionIf' },
    { id: 'export', name: 'Export JSON / CSV', type: 'tableFile' },
    { id: 'exception', name: 'Reject / Error Inbox', type: 'errorInbox' },
  ],
  edges_json: [
    { id: 'e1', source: 'upload', target: 'read' },
    { id: 'e2', source: 'read', target: 'extract' },
    { id: 'e3', source: 'extract', target: 'confidence' },
    { id: 'e4', source: 'confidence', target: 'review', route: 'low-confidence' },
    { id: 'e5', source: 'confidence', target: 'export', route: 'high-confidence' },
    { id: 'e6', source: 'review', target: 'decision' },
    { id: 'e7', source: 'decision', target: 'export', route: 'approved' },
    { id: 'e8', source: 'decision', target: 'exception', route: 'rejected' },
  ],
};

const logs = (...entries) => entries.map(([node_id, status, duration_ms = 0, error = '']) => ({ node_id, status, duration_ms, error }));

export const executionFrames = [
  { id: 'exec-study-001', status: 'RUNNING', node_logs: logs(['upload', 'RUNNING', 120]) },
  { id: 'exec-study-001', status: 'RUNNING', node_logs: logs(['upload', 'SUCCESS', 280], ['read', 'RUNNING', 340]) },
  { id: 'exec-study-001', status: 'RUNNING', node_logs: logs(['upload', 'SUCCESS', 280], ['read', 'SUCCESS', 520], ['extract', 'RUNNING', 1380]) },
  { id: 'exec-study-001', status: 'WAITING', node_logs: logs(['upload', 'SUCCESS', 280], ['read', 'SUCCESS', 520], ['extract', 'SUCCESS', 1820], ['confidence', 'SUCCESS', 76], ['review', 'WAITING', 0]) },
  { id: 'exec-study-001', status: 'RUNNING', node_logs: logs(['upload', 'SUCCESS', 280], ['read', 'SUCCESS', 520], ['extract', 'SUCCESS', 1820], ['confidence', 'SUCCESS', 76], ['review', 'SUCCESS', 12640], ['decision', 'RUNNING', 64]) },
  { id: 'exec-study-001', status: 'RUNNING', node_logs: logs(['upload', 'SUCCESS', 280], ['read', 'SUCCESS', 520], ['extract', 'SUCCESS', 1820], ['confidence', 'SUCCESS', 76], ['review', 'SUCCESS', 12640], ['decision', 'SUCCESS', 118], ['exception', 'SKIPPED', 0], ['export', 'RUNNING', 40]) },
  { id: 'exec-study-001', status: 'SUCCESS', node_logs: logs(['upload', 'SUCCESS', 280], ['read', 'SUCCESS', 520], ['extract', 'SUCCESS', 1820], ['confidence', 'SUCCESS', 76], ['review', 'SUCCESS', 12640], ['decision', 'SUCCESS', 118], ['exception', 'SKIPPED', 0], ['export', 'SUCCESS', 220]) },
];
