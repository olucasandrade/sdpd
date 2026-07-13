import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import { useTranslation } from '../i18n';
import { useBuilderChallenge } from '../hooks/useBuilderChallenges';
import { useBuilderProgress } from '../hooks/useBuilderProgress';
import { gradeDesign } from '../engine/builderGrader';
import { BuilderCanvas } from '../components/builder/BuilderCanvas';
import { BuilderPalette } from '../components/builder/BuilderPalette';
import { BuilderReportCard } from '../components/builder/BuilderReportCard';
import { Button } from '../components/common/Button';
import type { BuilderNodeData } from '../components/diagram/BuilderNode';
import type { ComponentKind, GradingResult, PlacedComponent, PlacedConnection } from '../types/builder';

type BuilderFlowNode = Node<BuilderNodeData>;

function toNodes(components: PlacedComponent[], onDelete: (id: string) => void): BuilderFlowNode[] {
  return components.map((c) => ({
    id: c.instanceId,
    type: 'builderNode',
    position: c.position,
    data: { kind: c.kind, onDelete },
  }));
}

function toEdges(connections: PlacedConnection[]): Edge[] {
  return connections.map((c) => ({ id: c.id, source: c.from, target: c.to }));
}

function nextPosition(count: number): { x: number; y: number } {
  const col = count % 4;
  const row = Math.floor(count / 4);
  return { x: 40 + col * 180, y: 40 + row * 130 };
}

export function BuilderPage() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { challenge, loading } = useBuilderChallenge(challengeId);
  const { getChallengeState, saveDesign, submitDesign, resetDesign } = useBuilderProgress();

  const [nodes, setNodes] = useState<BuilderFlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [report, setReport] = useState<GradingResult | null>(null);
  const initializedFor = useRef<string | null>(null);

  const handleDeleteNode = useCallback((instanceId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== instanceId));
    setEdges((eds) => eds.filter((e) => e.source !== instanceId && e.target !== instanceId));
  }, []);

  // Load saved design once per challenge.
  useEffect(() => {
    if (!challenge) return;
    if (initializedFor.current === challenge.id) return;
    initializedFor.current = challenge.id;
    const saved = getChallengeState(challenge.id);
    setNodes(toNodes(saved.components, handleDeleteNode));
    setEdges(toEdges(saved.connections));
    setReport(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge]);

  const onNodesChange: OnNodesChange<BuilderFlowNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, id: `e-${crypto.randomUUID()}` }, eds)),
    [],
  );

  const addComponent = useCallback(
    (kind: ComponentKind) => {
      setNodes((nds) => [
        ...nds,
        { id: crypto.randomUUID(), type: 'builderNode', position: nextPosition(nds.length), data: { kind, onDelete: handleDeleteNode } },
      ]);
    },
    [handleDeleteNode],
  );

  const placedComponents = useMemo<PlacedComponent[]>(
    () => nodes.map((n) => ({ instanceId: n.id, kind: n.data.kind, position: n.position })),
    [nodes],
  );
  const placedConnections = useMemo<PlacedConnection[]>(
    () => edges.map((e) => ({ id: e.id, from: e.source, to: e.target })),
    [edges],
  );

  // Debounced autosave of the in-progress design (not an "attempt").
  useEffect(() => {
    if (!challenge) return;
    if (initializedFor.current !== challenge.id) return;
    const handle = setTimeout(() => {
      saveDesign(challenge.id, placedComponents, placedConnections);
    }, 400);
    return () => clearTimeout(handle);
  }, [challenge, placedComponents, placedConnections, saveDesign]);

  const handleSubmit = () => {
    if (!challenge) return;
    const result = gradeDesign(challenge, placedComponents, placedConnections);
    setReport(result);
    submitDesign(challenge.id, placedComponents, placedConnections, result.passed);
  };

  const handleClear = () => {
    if (!challenge) return;
    setNodes([]);
    setEdges([]);
    setReport(null);
    resetDesign(challenge.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white/45 text-sm font-mono">
        {t('builder.loading')}
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/70">
        <p>{t('builder.notFound')}</p>
        <Link to="/builder">
          <Button variant="secondary">{t('builder.backToBoard')}</Button>
        </Link>
      </div>
    );
  }

  const state = getChallengeState(challenge.id);

  return (
    <div className="h-full flex flex-col lg:flex-row">
      <div className="flex-1 min-h-[360px] flex flex-col">
        <div className="p-3 border-b border-noir-700/40 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest">
              {t('builder.designLabel')} {String(challenge.number).padStart(2, '0')}
            </p>
            <h1 className="font-display text-lg text-white/90">{challenge.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleClear} className="text-xs">
              {t('builder.clear')}
            </Button>
            <Button onClick={handleSubmit} className="text-xs">
              {t('builder.submit')}
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <BuilderCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
          />
        </div>
      </div>

      <div className="lg:w-[420px] border-l border-navy-700 overflow-y-auto p-4 space-y-4 bg-navy-900/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-noir-800/60 border border-noir-600/40 rounded-xl p-5 backdrop-blur-sm"
        >
          <p className="text-xs font-mono text-amber-500/60 uppercase tracking-widest mb-1">{t('builder.subtitleLabel')}</p>
          <p className="text-sm text-white/70 mb-4">{challenge.subtitle}</p>

          <p className="text-xs font-mono text-amber-500/60 uppercase tracking-widest mb-1.5">{t('builder.objectiveLabel')}</p>
          <p className="text-sm text-white/70 leading-relaxed mb-4">{challenge.objective}</p>

          <p className="text-xs font-mono text-amber-500/60 uppercase tracking-widest mb-2">{t('builder.constraintsLabel')}</p>
          <ul className="space-y-1.5">
            {challenge.constraints.map((c, i) => (
              <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                <span className="text-amber-500/50 font-mono text-xs mt-0.5">&gt;</span>
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-3 border-t border-noir-700/40 flex items-center justify-between text-xs font-mono text-white/45">
            <span>
              {state.attempts} {state.attempts === 1 ? t('builder.attempt') : t('builder.attempts')}
            </span>
            {state.completed && <span className="text-status-healthy">{t('builder.designApproved')}</span>}
          </div>
        </motion.div>

        <BuilderPalette availableComponents={challenge.availableComponents} onAdd={addComponent} />

        {report && <BuilderReportCard result={report} />}

        {report?.passed && (
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/builder')}>
              {t('builder.backToBoard')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
