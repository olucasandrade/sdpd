import type { ChaosFix, ChaosFault, ChaosPreset } from '../../types/chaos';
import type { DiagramEdge, DiagramNode } from '../../types/case';

function node(
  id: string,
  type: DiagramNode['type'],
  label: string,
  x: number,
  y: number,
  inspectable = false,
): DiagramNode {
  return {
    id,
    type,
    label,
    status: 'healthy',
    position: { x, y },
    inspectable,
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  label?: string,
  style: DiagramEdge['style'] = 'normal',
  animated = false,
): DiagramEdge {
  return { id, source, target, label, style, animated };
}

const faultLibrary: Omit<ChaosFault, 'targets'>[] = [
  {
    id: 'latency-spike',
    nameKey: 'chaos.fault.latencySpike.name',
    descriptionKey: 'chaos.fault.latencySpike.desc',
    severity: 'medium',
    effects: { latency: 220, errorRate: 1.0, throughput: -150, availability: -0.3 },
    logTemplates: [
      'WARN: p95 latency breached on critical path',
      'WARN: upstream calls exceeding latency budget',
      'WARN: request queues building under high tail latency',
    ],
  },
  {
    id: 'packet-loss',
    nameKey: 'chaos.fault.packetLoss.name',
    descriptionKey: 'chaos.fault.packetLoss.desc',
    severity: 'high',
    effects: { errorRate: 2.5, availability: -0.8, latency: 80, throughput: -200 },
    logTemplates: [
      'ERROR: elevated packet loss detected on edge links',
      'WARN: retransmits spiking across service mesh',
      'ERROR: client timeouts increased due to packet loss',
    ],
  },
  {
    id: 'node-crash',
    nameKey: 'chaos.fault.nodeCrash.name',
    descriptionKey: 'chaos.fault.nodeCrash.desc',
    severity: 'high',
    effects: { availability: -4.0, errorRate: 3.0, latency: 100, throughput: -400 },
    logTemplates: [
      'ERROR: node heartbeat lost, instance unresponsive',
      'WARN: failover delayed, dependency unavailable',
      'ERROR: crash loop detected on service node',
    ],
  },
  {
    id: 'db-primary-fail',
    nameKey: 'chaos.fault.dbPrimaryFail.name',
    descriptionKey: 'chaos.fault.dbPrimaryFail.desc',
    severity: 'high',
    effects: { availability: -6.0, errorRate: 5.0, latency: 200, throughput: -500 },
    logTemplates: [
      'ERROR: database primary not reachable',
      'WARN: writes stalled waiting for leader election',
      'ERROR: primary failure causing write backlog',
    ],
  },
  {
    id: 'replica-lag',
    nameKey: 'chaos.fault.replicaLag.name',
    descriptionKey: 'chaos.fault.replicaLag.desc',
    severity: 'medium',
    effects: { errorRate: 1.5, latency: 90, throughput: -100, availability: -0.5 },
    logTemplates: [
      'WARN: replica lag above threshold',
      'WARN: stale reads detected from secondary',
      'INFO: replication queue growing steadily',
    ],
  },
  {
    id: 'cache-miss-storm',
    nameKey: 'chaos.fault.cacheMissStorm.name',
    descriptionKey: 'chaos.fault.cacheMissStorm.desc',
    severity: 'medium',
    effects: { latency: 160, errorRate: 0.8, throughput: -120, availability: -0.2 },
    logTemplates: [
      'WARN: cache hit rate collapsed',
      'INFO: origin load rising due to cache misses',
      'WARN: cache stampede detected on hot keys',
    ],
  },
  {
    id: 'queue-backlog',
    nameKey: 'chaos.fault.queueBacklog.name',
    descriptionKey: 'chaos.fault.queueBacklog.desc',
    severity: 'medium',
    effects: { latency: 300, errorRate: 1.2, throughput: -250, availability: -0.4 },
    logTemplates: [
      'WARN: queue depth growing beyond SLA',
      'WARN: consumer lag increasing on topic',
      'INFO: backlog accumulating in task queue',
    ],
  },
];

const fixLibrary: ChaosFix[] = [
  {
    id: 'add-retries',
    nameKey: 'chaos.fix.addRetries.name',
    descriptionKey: 'chaos.fix.addRetries.desc',
    counters: ['packet-loss', 'latency-spike'],
    effects: { errorRate: -1.0, availability: 0.4, latency: 30, throughput: -50 },
    logTemplates: [
      'INFO: retry policy enabled for transient failures',
      'INFO: exponential backoff applied to upstream calls',
    ],
  },
  {
    id: 'enable-circuit-breaker',
    nameKey: 'chaos.fix.circuitBreaker.name',
    descriptionKey: 'chaos.fix.circuitBreaker.desc',
    counters: ['db-primary-fail', 'node-crash'],
    effects: { errorRate: -1.5, availability: 0.6, latency: -20 },
    logTemplates: [
      'INFO: circuit breaker opened to protect callers',
      'INFO: fallback mode engaged for degraded dependency',
    ],
  },
  {
    id: 'add-replica-failover',
    nameKey: 'chaos.fix.replicaFailover.name',
    descriptionKey: 'chaos.fix.replicaFailover.desc',
    counters: ['db-primary-fail', 'replica-lag'],
    effects: { availability: 3.0, errorRate: -2.0, latency: -60, throughput: 150 },
    logTemplates: [
      'INFO: replica promoted to primary',
      'INFO: read traffic shifted to healthy replica',
    ],
  },
  {
    id: 'scale-out',
    nameKey: 'chaos.fix.scaleOut.name',
    descriptionKey: 'chaos.fix.scaleOut.desc',
    counters: ['queue-backlog', 'cache-miss-storm'],
    effects: { latency: -120, throughput: 300, errorRate: -0.5 },
    logTemplates: [
      'INFO: scaled out service pool',
      'INFO: autoscaler added new workers',
    ],
  },
  {
    id: 'cache-warmup',
    nameKey: 'chaos.fix.cacheWarmup.name',
    descriptionKey: 'chaos.fix.cacheWarmup.desc',
    counters: ['cache-miss-storm'],
    effects: { latency: -100, errorRate: -0.3, throughput: 80 },
    logTemplates: [
      'INFO: cache warmup completed on hot keys',
      'INFO: prefetching enabled for high-traffic routes',
    ],
  },
  {
    id: 'queue-autoscale',
    nameKey: 'chaos.fix.queueAutoscale.name',
    descriptionKey: 'chaos.fix.queueAutoscale.desc',
    counters: ['queue-backlog'],
    effects: { latency: -180, throughput: 200, errorRate: -0.4 },
    logTemplates: [
      'INFO: worker pool autoscaled for backlog drain',
      'INFO: consumer concurrency increased',
    ],
  },
];

function bindFaults(targets: Record<string, ChaosFault['targets']>): ChaosFault[] {
  return faultLibrary.map((fault) => ({
    ...fault,
    targets: targets[fault.id] ?? {},
  }));
}

export const chaosPresets: ChaosPreset[] = [
  {
    id: 'api-db-cache',
    nameKey: 'chaos.preset.apiDbCache.name',
    descriptionKey: 'chaos.preset.apiDbCache.desc',
    nodes: [
      node('client', 'client', 'Clients', 40, 160),
      node('gateway', 'server', 'API Gateway', 200, 160),
      node('api', 'server', 'App Service', 380, 160),
      node('cache', 'database', 'Cache', 520, 70),
      node('db-primary', 'database', 'DB Primary', 560, 210),
      node('db-replica', 'database', 'DB Replica', 720, 210),
    ],
    edges: [
      edge('e1', 'client', 'gateway', 'HTTPS'),
      edge('e2', 'gateway', 'api', 'gRPC'),
      edge('e3', 'api', 'cache', 'Reads'),
      edge('e4', 'api', 'db-primary', 'Writes'),
      edge('e5', 'db-primary', 'db-replica', 'Replication', 'normal', true),
    ],
    baseMetrics: { availability: 99.5, latency: 120, errorRate: 0.4, throughput: 1200 },
    faults: bindFaults({
      'latency-spike': { edges: ['e1', 'e2'] },
      'packet-loss': { edges: ['e1', 'e2'] },
      'node-crash': { nodes: ['api'] },
      'db-primary-fail': { nodes: ['db-primary'] },
      'replica-lag': { nodes: ['db-replica'] },
      'cache-miss-storm': { nodes: ['cache'] },
      'queue-backlog': {},
    }),
    fixes: fixLibrary,
    objective: { minAvailability: 99, maxLatency: 300, minActiveFaults: 2 },
  },
  {
    id: 'event-driven-orders',
    nameKey: 'chaos.preset.eventOrders.name',
    descriptionKey: 'chaos.preset.eventOrders.desc',
    nodes: [
      node('client', 'client', 'Checkout UI', 40, 170),
      node('checkout', 'server', 'Checkout Service', 220, 170),
      node('order', 'server', 'Order Service', 400, 170),
      node('queue', 'server', 'Order Queue', 540, 170),
      node('worker', 'server', 'Worker Pool', 700, 170),
      node('orders-db', 'database', 'Orders DB', 860, 170),
      node('notify', 'server', 'Notification', 520, 40),
    ],
    edges: [
      edge('e1', 'client', 'checkout', 'HTTPS'),
      edge('e2', 'checkout', 'order', 'RPC'),
      edge('e3', 'order', 'queue', 'Enqueue'),
      edge('e4', 'queue', 'worker', 'Consume'),
      edge('e5', 'worker', 'orders-db', 'Write'),
      edge('e6', 'order', 'notify', 'Events', 'normal', true),
    ],
    baseMetrics: { availability: 99.2, latency: 180, errorRate: 0.7, throughput: 800 },
    faults: bindFaults({
      'latency-spike': { edges: ['e1', 'e2'] },
      'packet-loss': { edges: ['e3', 'e4'] },
      'node-crash': { nodes: ['worker'] },
      'db-primary-fail': { nodes: ['orders-db'] },
      'replica-lag': {},
      'cache-miss-storm': {},
      'queue-backlog': { nodes: ['queue'] },
    }),
    fixes: fixLibrary,
    objective: { minAvailability: 98.5, maxLatency: 350, minActiveFaults: 2 },
  },
  {
    id: 'realtime-analytics',
    nameKey: 'chaos.preset.realtimeAnalytics.name',
    descriptionKey: 'chaos.preset.realtimeAnalytics.desc',
    nodes: [
      node('producers', 'client', 'Producers', 40, 190),
      node('ingest', 'server', 'Ingest API', 220, 190),
      node('stream', 'server', 'Stream Processor', 420, 190),
      node('tsdb', 'database', 'Time-series DB', 620, 190),
      node('dashboard', 'client', 'Dashboard', 840, 190),
    ],
    edges: [
      edge('e1', 'producers', 'ingest', 'POST'),
      edge('e2', 'ingest', 'stream', 'Events'),
      edge('e3', 'stream', 'tsdb', 'Write'),
      edge('e4', 'tsdb', 'dashboard', 'Query', 'normal', true),
    ],
    baseMetrics: { availability: 99.0, latency: 240, errorRate: 1.2, throughput: 1500 },
    faults: bindFaults({
      'latency-spike': { edges: ['e2', 'e3'] },
      'packet-loss': { edges: ['e1', 'e2'] },
      'node-crash': { nodes: ['stream'] },
      'db-primary-fail': { nodes: ['tsdb'] },
      'replica-lag': {},
      'cache-miss-storm': {},
      'queue-backlog': { nodes: ['stream'] },
    }),
    fixes: fixLibrary,
    objective: { minAvailability: 98, maxLatency: 400, minActiveFaults: 2 },
  },
];
