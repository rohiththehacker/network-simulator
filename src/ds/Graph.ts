/**
 * ============================================================
 * GRAPH DATA STRUCTURE — Adjacency List Implementation
 * ============================================================
 *
 * Used to model the computer network:
 *   - Each NODE represents a network device (PC, Router, Server…)
 *   - Each EDGE represents a physical/logical network connection
 *
 * We use an ADJACENCY LIST because:
 *   - Network graphs are typically sparse (not every device is
 *     connected to every other device)
 *   - O(V + E) space is much better than O(V²) for an adj. matrix
 *   - Neighbor lookup is O(degree), which is fast for sparse nets
 *
 * An edge stores:
 *   - bandwidth (Mbps) — capacity of the link
 *   - latency  (ms)   — delay on the link
 * ============================================================
 */

export interface EdgeData {
  bandwidth: number; // Mbps
  latency: number;   // ms  — used as edge weight for shortest path
  type: 'ethernet' | 'fiber' | 'wifi' | 'virtual';
}

export interface GraphNode {
  id: string;
  label: string;
  type: DeviceType;
  ip?: string;
  mac?: string;
  status: DeviceStatus;
  x: number;
  y: number;
}

export type DeviceType = 'computer' | 'laptop' | 'router' | 'switch' | 'server' | 'firewall' | 'cloud';
export type DeviceStatus = 'online' | 'offline' | 'transmitting' | 'error';

export interface Edge {
  id: string;
  source: string;
  target: string;
  data: EdgeData;
}

/**
 * Graph<N, E>
 *
 * Internally maintains two Maps:
 *   nodes       : id → GraphNode
 *   adjacency   : id → Map<neighbourId, EdgeData>
 *
 * All methods are O(1) or O(degree) unless noted.
 */
export class Graph {
  // ── storage ──────────────────────────────────────────────
  private nodes: Map<string, GraphNode> = new Map();
  // adjacency[u][v] = EdgeData for the edge u↔v
  private adjacency: Map<string, Map<string, EdgeData>> = new Map();
  // store all edge objects for fast lookup / deletion
  private edges: Map<string, Edge> = new Map();

  // ── node operations ──────────────────────────────────────

  /** Add a device node to the graph. O(1) */
  addNode(node: GraphNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node "${node.id}" already exists in the graph`);
    }
    this.nodes.set(node.id, { ...node });
    this.adjacency.set(node.id, new Map());
  }

  /** Remove a device and all its incident edges. O(degree) */
  removeNode(id: string): void {
    if (!this.nodes.has(id)) {
      throw new Error(`Node "${id}" not found`);
    }

    // Remove all edges involving this node
    const neighbours = this.adjacency.get(id)!;
    neighbours.forEach((_, neighbourId) => {
      this.adjacency.get(neighbourId)?.delete(id);
      // Remove from edge store
      const edgeId = this.buildEdgeId(id, neighbourId);
      const edgeIdAlt = this.buildEdgeId(neighbourId, id);
      this.edges.delete(edgeId);
      this.edges.delete(edgeIdAlt);
    });

    this.nodes.delete(id);
    this.adjacency.delete(id);
  }

  /** Update a node's properties. O(1) */
  updateNode(id: string, updates: Partial<GraphNode>): void {
    const node = this.nodes.get(id);
    if (!node) throw new Error(`Node "${id}" not found`);
    this.nodes.set(id, { ...node, ...updates, id }); // id is immutable
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  // ── edge operations ──────────────────────────────────────

  /** Add an undirected weighted edge between two nodes. O(1) */
  addEdge(edge: Edge): void {
    const { id, source, target, data } = edge;

    if (source === target) {
      throw new Error('Self-loops are not allowed');
    }
    if (!this.nodes.has(source)) {
      throw new Error(`Source node "${source}" not found`);
    }
    if (!this.nodes.has(target)) {
      throw new Error(`Target node "${target}" not found`);
    }
    if (this.adjacency.get(source)?.has(target)) {
      throw new Error(`Connection between "${source}" and "${target}" already exists`);
    }

    // Undirected: add both directions
    this.adjacency.get(source)!.set(target, data);
    this.adjacency.get(target)!.set(source, data);
    this.edges.set(id, { ...edge });
  }

  /** Remove an edge by its ID. O(1) */
  removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) throw new Error(`Edge "${edgeId}" not found`);

    this.adjacency.get(edge.source)?.delete(edge.target);
    this.adjacency.get(edge.target)?.delete(edge.source);
    this.edges.delete(edgeId);
  }

  getAllEdges(): Edge[] {
    return Array.from(this.edges.values());
  }

  // ── traversal helpers ────────────────────────────────────

  /**
   * Returns the neighbours of a node that are ONLINE.
   * Offline nodes are excluded so routing avoids failed devices.
   * O(degree)
   */
  getNeighbours(id: string, skipOffline = true): Array<{ id: string; data: EdgeData }> {
    const adj = this.adjacency.get(id);
    if (!adj) return [];

    const result: Array<{ id: string; data: EdgeData }> = [];
    adj.forEach((data, neighbourId) => {
      const neighbour = this.nodes.get(neighbourId);
      if (!neighbour) return;
      if (skipOffline && neighbour.status === 'offline') return;
      result.push({ id: neighbourId, data });
    });
    return result;
  }

  /** Edge data between two nodes (undefined if no edge). */
  getEdgeData(a: string, b: string): EdgeData | undefined {
    return this.adjacency.get(a)?.get(b);
  }

  /** True if both nodes exist AND are connected. */
  hasEdge(a: string, b: string): boolean {
    return this.adjacency.get(a)?.has(b) ?? false;
  }

  /** Number of nodes */
  nodeCount(): number {
    return this.nodes.size;
  }

  /** Number of edges */
  edgeCount(): number {
    return this.edges.size;
  }

  // ── serialisation ─────────────────────────────────────────

  toJSON() {
    return {
      nodes: this.getAllNodes(),
      edges: this.getAllEdges(),
    };
  }

  fromJSON(data: { nodes: GraphNode[]; edges: Edge[] }): void {
    this.nodes.clear();
    this.adjacency.clear();
    this.edges.clear();

    data.nodes.forEach(n => {
      this.nodes.set(n.id, n);
      this.adjacency.set(n.id, new Map());
    });
    data.edges.forEach(e => this.addEdge(e));
  }

  // ── private helpers ───────────────────────────────────────

  private buildEdgeId(a: string, b: string): string {
    return `${a}-${b}`;
  }
}
