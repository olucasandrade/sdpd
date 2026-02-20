import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Case, DiagramNode } from '../../types/case';
import { DatabaseNode } from '../diagram/DatabaseNode';
import { ServerNode } from '../diagram/ServerNode';
import { ClientNode } from '../diagram/ClientNode';

const nodeTypes = {
  database: DatabaseNode,
  server: ServerNode,
  client: ClientNode,
};

const edgeStyleMap = {
  normal: { stroke: '#22c55e', strokeWidth: 2 },
  broken: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '8 4' },
  slow: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '4 4' },
};

interface SystemDiagramProps {
  caseData: Case;
  onNodeClick: (node: DiagramNode) => void;
}

export function SystemDiagram({ caseData, onNodeClick }: SystemDiagramProps) {
  const handleInspect = useCallback(
    (diagramNode: DiagramNode) => {
      if (diagramNode.inspectable) onNodeClick(diagramNode);
    },
    [onNodeClick]
  );

  const nodes: Node[] = useMemo(
    () =>
      caseData.diagram.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: n.label,
          status: n.status,
          inspectable: n.inspectable,
          onInspect: () => handleInspect(n),
        },
      })),
    [caseData, handleInspect]
  );

  const edges: Edge[] = useMemo(
    () =>
      caseData.diagram.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: e.animated,
        style: edgeStyleMap[e.style ?? 'normal'],
        labelStyle: { fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#111827', fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number],
        className: e.animated ? 'edge-animated' : '',
      })),
    [caseData]
  );

  return (
    <div className="w-full h-full min-h-[300px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e2a3a" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
