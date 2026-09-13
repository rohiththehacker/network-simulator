// Re-export core data structure types
export type { EdgeData, GraphNode, DeviceType, DeviceStatus, Edge } from '../ds/Graph';
export type { StackOperation } from '../ds/Stack';
export type { PathResult } from '../algorithms/dfs';

// ── Simulation ──────────────────────────────────────────────

export type Algorithm = 'DFS' | 'BFS' | 'Dijkstra';
export type PacketStatus = 'idle' | 'routing' | 'transmitting' | 'delivered' | 'failed';

export interface SimulationResult {
  packetId: string;
  source: string;
  destination: string;
  algorithm: Algorithm;
  path: string[];
  visitedOrder: string[];   // nodes visited during path search
  hops: number;
  totalLatency: number;     // ms
  stackOps: Array<{ type: 'PUSH' | 'POP'; node: string }>;
  status: 'DELIVERED' | 'FAILED';
  reason?: string;          // error reason when failed
  timestamp: number;
}

// ── Log entries ─────────────────────────────────────────────

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
}

// ── App state ────────────────────────────────────────────────

export interface NetworkState {
  nodes: import('../ds/Graph').GraphNode[];
  edges: import('../ds/Graph').Edge[];
}

export interface AppStats {
  totalDevices: number;
  totalConnections: number;
  packetsSent: number;
  packetsDelivered: number;
  packetsFailed: number;
  avgHops: number;
}
