/**
 * NetworkStore — Central state for the network simulation.
 *
 * Wraps the Graph and Stack data structures and exposes
 * React-friendly operations. This is the single source of
 * truth for devices, connections, packets, and logs.
 */

import { Graph, GraphNode, Edge } from '../ds/Graph';
import { Stack } from '../ds/Stack';
import { dfs } from '../algorithms/dfs';
import { bfs } from '../algorithms/bfs';
import { dijkstra } from '../algorithms/dijkstra';
import {
  Algorithm,
  SimulationResult,
  LogEntry,
  LogLevel,
  AppStats,
  PacketStatus,
} from '../types';

// ── Demo network topology ────────────────────────────────────
// Pre-built network so the app starts with something meaningful
export const DEMO_NETWORK = {
  nodes: [
    { id: 'pc1',      label: 'PC-01',      type: 'computer' as const, ip: '192.168.1.10', mac: 'AA:BB:CC:01:01:01', status: 'online' as const, x: 120, y: 80  },
    { id: 'pc2',      label: 'PC-02',      type: 'computer' as const, ip: '192.168.1.11', mac: 'AA:BB:CC:01:01:02', status: 'online' as const, x: 120, y: 300 },
    { id: 'pc3',      label: 'PC-03',      type: 'laptop'   as const, ip: '192.168.1.12', mac: 'AA:BB:CC:01:01:03', status: 'online' as const, x: 120, y: 520 },
    { id: 'router_a', label: 'Router-A',   type: 'router'   as const, ip: '192.168.1.1',  mac: 'AA:BB:CC:02:01:01', status: 'online' as const, x: 380, y: 80  },
    { id: 'router_b', label: 'Router-B',   type: 'router'   as const, ip: '192.168.1.2',  mac: 'AA:BB:CC:02:01:02', status: 'online' as const, x: 380, y: 300 },
    { id: 'switch1',  label: 'Switch-01',  type: 'switch'   as const, ip: '192.168.1.50', mac: 'AA:BB:CC:03:01:01', status: 'online' as const, x: 380, y: 520 },
    { id: 'fw1',      label: 'Firewall',   type: 'firewall' as const, ip: '192.168.1.254',mac: 'AA:BB:CC:04:01:01', status: 'online' as const, x: 620, y: 190 },
    { id: 'server1',  label: 'Server-01',  type: 'server'   as const, ip: '192.168.2.10', mac: 'AA:BB:CC:05:01:01', status: 'online' as const, x: 850, y: 190 },
    { id: 'cloud1',   label: 'Cloud',      type: 'cloud'    as const, ip: '203.0.113.1',  mac: 'AA:BB:CC:06:01:01', status: 'online' as const, x: 850, y: 400 },
  ],
  edges: [
    { id: 'e1', source: 'pc1',      target: 'router_a', data: { bandwidth: 100, latency: 5,  type: 'ethernet' as const } },
    { id: 'e2', source: 'pc2',      target: 'router_b', data: { bandwidth: 100, latency: 4,  type: 'ethernet' as const } },
    { id: 'e3', source: 'pc3',      target: 'switch1',  data: { bandwidth: 100, latency: 3,  type: 'wifi'     as const } },
    { id: 'e4', source: 'router_a', target: 'router_b', data: { bandwidth: 1000, latency: 2, type: 'fiber'    as const } },
    { id: 'e5', source: 'router_b', target: 'switch1',  data: { bandwidth: 1000, latency: 2, type: 'fiber'    as const } },
    { id: 'e6', source: 'router_a', target: 'fw1',      data: { bandwidth: 1000, latency: 8, type: 'fiber'    as const } },
    { id: 'e7', source: 'router_b', target: 'fw1',      data: { bandwidth: 1000, latency: 8, type: 'fiber'    as const } },
    { id: 'e8', source: 'switch1',  target: 'fw1',      data: { bandwidth: 100,  latency: 6, type: 'ethernet' as const } },
    { id: 'e9', source: 'fw1',      target: 'server1',  data: { bandwidth: 1000, latency: 3, type: 'fiber'    as const } },
    { id: 'e10',source: 'server1',  target: 'cloud1',   data: { bandwidth: 1000, latency: 20,type: 'virtual'  as const } },
  ],
};

// ── Store class ──────────────────────────────────────────────

export class NetworkStore {
  graph: Graph = new Graph();
  packetStack: Stack<string> = new Stack<string>(); // holds node IDs
  packets: SimulationResult[] = [];
  logs: LogEntry[] = [];
  private _packetCounter = 1;

  constructor() {
    this.loadDemo();
  }

  // ── Demo network ───────────────────────────────────────────

  loadDemo(): void {
    this.graph = new Graph();
    DEMO_NETWORK.nodes.forEach(n => this.graph.addNode(n));
    DEMO_NETWORK.edges.forEach(e => this.graph.addEdge(e));
    this.log('INFO', 'Demo network loaded — 9 devices, 10 connections');
  }

  reset(): void {
    this.graph = new Graph();
    this.packetStack.clear();
    this.packets = [];
    this.logs = [];
    this._packetCounter = 1;
    this.log('INFO', 'Network reset — canvas cleared');
  }

  // ── Device CRUD ────────────────────────────────────────────

  addDevice(node: GraphNode): void {
    this.graph.addNode(node);
    this.log('SUCCESS', `Device "${node.label}" (${node.type}) added to network`);
    this.persist();
  }

  updateDevice(id: string, updates: Partial<GraphNode>): void {
    this.graph.updateNode(id, updates);
    const node = this.graph.getNode(id);
    this.log('INFO', `Device "${node?.label}" updated`);
    this.persist();
  }

  removeDevice(id: string): void {
    const node = this.graph.getNode(id);
    this.graph.removeNode(id);
    this.log('WARNING', `Device "${node?.label}" removed — all its connections deleted`);
    this.persist();
  }

  toggleDevice(id: string): void {
    const node = this.graph.getNode(id);
    if (!node) return;
    const newStatus = node.status === 'online' ? 'offline' : 'online';
    this.graph.updateNode(id, { status: newStatus });
    this.log(
      newStatus === 'offline' ? 'WARNING' : 'SUCCESS',
      `Device "${node.label}" is now ${newStatus.toUpperCase()}`
    );
    this.persist();
  }

  // ── Connection CRUD ────────────────────────────────────────

  addConnection(edge: Edge): void {
    this.graph.addEdge(edge);
    const src = this.graph.getNode(edge.source)?.label;
    const tgt = this.graph.getNode(edge.target)?.label;
    this.log('SUCCESS', `Connection: ${src} ↔ ${tgt} (${edge.data.latency}ms, ${edge.data.bandwidth}Mbps)`);
    this.persist();
  }

  removeConnection(edgeId: string): void {
    const edge = this.graph.getAllEdges().find(e => e.id === edgeId);
    const src = this.graph.getNode(edge?.source ?? '')?.label;
    const tgt = this.graph.getNode(edge?.target ?? '')?.label;
    this.graph.removeEdge(edgeId);
    this.log('WARNING', `Connection ${src} ↔ ${tgt} removed`);
    this.persist();
  }

  // ── Packet Simulation ──────────────────────────────────────

  simulate(sourceId: string, destId: string, algorithm: Algorithm): SimulationResult {
    const src = this.graph.getNode(sourceId);
    const dst = this.graph.getNode(destId);
    const packetId = `PKT-${String(this._packetCounter++).padStart(4, '0')}`;

    this.log('INFO', `Packet ${packetId}: ${src?.label} → ${dst?.label} via ${algorithm}`);

    // Validate devices
    if (!src || !dst) {
      return this._fail(packetId, sourceId, destId, algorithm, 'Source or destination device not found');
    }
    if (src.status === 'offline') {
      return this._fail(packetId, sourceId, destId, algorithm, `Source device "${src.label}" is OFFLINE`);
    }
    if (dst.status === 'offline') {
      return this._fail(packetId, sourceId, destId, algorithm, `Destination device "${dst.label}" is OFFLINE`);
    }
    if (sourceId === destId) {
      return this._fail(packetId, sourceId, destId, algorithm, 'Source and destination cannot be the same');
    }

    // Run the selected algorithm
    let result;
    if (algorithm === 'DFS')      result = dfs(this.graph, sourceId, destId);
    else if (algorithm === 'BFS') result = bfs(this.graph, sourceId, destId);
    else                          result = dijkstra(this.graph, sourceId, destId);

    if (!result.found || result.path.length === 0) {
      const offlineNodes = this.graph.getAllNodes()
        .filter(n => n.status === 'offline')
        .map(n => n.label)
        .join(', ');
      const hint = offlineNodes ? ` (offline: ${offlineNodes})` : '';
      return this._fail(packetId, sourceId, destId, algorithm, `No route available from "${src.label}" to "${dst.label}"${hint}`);
    }

    // Build stack operations — PUSH phase (packet travelling forward)
    const stackOps: SimulationResult['stackOps'] = [];
    this.packetStack.clear();

    result.path.forEach(nodeId => {
      this.packetStack.push(nodeId);
      stackOps.push({ type: 'PUSH', node: nodeId });
      const label = this.graph.getNode(nodeId)?.label ?? nodeId;
      this.log('INFO', `PUSH → ${label}`);
    });

    // POP phase (packet received at destination, unwind stack)
    while (!this.packetStack.isEmpty()) {
      const nodeId = this.packetStack.pop()!;
      stackOps.push({ type: 'POP', node: nodeId });
      const label = this.graph.getNode(nodeId)?.label ?? nodeId;
      this.log('INFO', `POP  ← ${label}`);
    }

    const sim: SimulationResult = {
      packetId,
      source: sourceId,
      destination: destId,
      algorithm,
      path: result.path,
      visitedOrder: result.visited,
      hops: result.hops,
      totalLatency: result.totalLatency,
      stackOps,
      status: 'DELIVERED',
      timestamp: Date.now(),
    };

    this.packets.push(sim);
    this.log('SUCCESS', `${packetId} DELIVERED — ${result.hops} hop(s), ${result.totalLatency}ms`);
    this.persist();
    return sim;
  }

  private _fail(
    packetId: string,
    source: string,
    destination: string,
    algorithm: Algorithm,
    reason: string,
  ): SimulationResult {
    const sim: SimulationResult = {
      packetId,
      source,
      destination,
      algorithm,
      path: [],
      visitedOrder: [],
      hops: 0,
      totalLatency: 0,
      stackOps: [],
      status: 'FAILED',
      reason,
      timestamp: Date.now(),
    };
    this.packets.push(sim);
    this.log('ERROR', `${packetId} FAILED — ${reason}`);
    this.persist();
    return sim;
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): AppStats {
    const delivered = this.packets.filter(p => p.status === 'DELIVERED');
    const failed = this.packets.filter(p => p.status === 'FAILED');
    const avgHops = delivered.length
      ? delivered.reduce((s, p) => s + p.hops, 0) / delivered.length
      : 0;

    return {
      totalDevices: this.graph.nodeCount(),
      totalConnections: this.graph.edgeCount(),
      packetsSent: this.packets.length,
      packetsDelivered: delivered.length,
      packetsFailed: failed.length,
      avgHops: Math.round(avgHops * 10) / 10,
    };
  }

  // ── Logging ────────────────────────────────────────────────

  log(level: LogLevel, message: string): void {
    this.logs.unshift({
      id: `log-${Date.now()}-${Math.random()}`,
      level,
      message,
      timestamp: Date.now(),
    });
    // Keep last 200 log entries
    if (this.logs.length > 200) this.logs = this.logs.slice(0, 200);
  }

  clearLogs(): void {
    this.logs = [];
  }

  // ── Persistence ────────────────────────────────────────────

  persist(): void {
    try {
      const data = {
        network: this.graph.toJSON(),
        packets: this.packets,
        packetCounter: this._packetCounter,
      };
      localStorage.setItem('network-sim-state', JSON.stringify(data));
    } catch {
      // Storage errors are non-fatal
    }
  }

  restore(): boolean {
    try {
      const raw = localStorage.getItem('network-sim-state');
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.graph = new Graph();
      this.graph.fromJSON(data.network);
      this.packets = data.packets ?? [];
      this._packetCounter = data.packetCounter ?? 1;
      this.log('INFO', 'Previous network state restored from local storage');
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton store instance
export const store = new NetworkStore();
