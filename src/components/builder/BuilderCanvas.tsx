import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuilderNode, type BuilderNodeData } from '../diagram/BuilderNode';

const nodeTypes = {
  builderNode: BuilderNode,
};

interface BuilderCanvasProps {
  nodes: Node<BuilderNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<BuilderNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
}

export function BuilderCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect }: BuilderCanvasProps) {
  return (
    <div className="w-full h-full min-h-[360px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        deleteKeyCode={['Backspace', 'Delete']}
        panOnDrag
        zoomOnScroll
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e2a3a" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
