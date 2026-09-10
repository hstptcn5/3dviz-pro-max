const normalizeStatus = value => String(value || '').toUpperCase();

export function projectRenyroState(workflow, execution) {
  const logs = execution?.node_logs || execution?.logs_json || [];
  const byNode = new Map(logs.map(log => [String(log.node_id), log]));
  return {
    id: workflow.id,
    name: workflow.name,
    executionId: execution?.id || '',
    executionStatus: normalizeStatus(execution?.status),
    nodes: (workflow.nodes_json || []).map(node => {
      const log = byNode.get(String(node.id));
      return {
        ...node,
        status: normalizeStatus(log?.status),
        durationMs: Number(log?.duration_ms || 0),
        error: log?.error || '',
      };
    }),
    edges: (workflow.edges_json || []).map(edge => ({ ...edge })),
  };
}

export function activeNode(model) {
  return model.nodes.find(node => ['FAILED', 'WAITING', 'RUNNING'].includes(node.status)) || null;
}

export function activeEdgeIds(model) {
  const completed = new Set(model.nodes.filter(node => node.status === 'SUCCESS').map(node => node.id));
  const active = new Set(model.nodes.filter(node => ['RUNNING', 'WAITING'].includes(node.status)).map(node => node.id));
  return new Set(model.edges.filter(edge => completed.has(edge.source) && (completed.has(edge.target) || active.has(edge.target))).map(edge => edge.id));
}
