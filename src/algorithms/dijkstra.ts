/**
 * ============================================================
 * DIJKSTRA'S ALGORITHM — Shortest Path by Latency Weight
 * ============================================================
 *
 * Dijkstra finds the path with the LOWEST TOTAL COST (weight),
 * where cost = sum of edge latencies along the path.
 *
 * In network terms:
 *   - Each connection has a latency value (ms)
 *   - We want the path whose total latency is minimum
 *   - This gives us the "fastest" route, not just fewest hops
 *
 * Algorithm steps:
 *   1. Assign distance[source] = 0, distance[all others] = ∞
 *   2. Put source in a priority queue (min-heap by distance)
 *   3. While the queue is not empty:
 *      a. Extract node with MINIMUM distance
 *      b. For each neighbour, compute tentative distance
 *      c. If tentative < known distance → update & re-queue
 *   4. When destination is extracted, we have the shortest path
 *
 * Implementation note:
 *   We simulate a min-heap with a sorted array for readability.
 *   In production you'd use a proper binary heap for O((V+E)logV).
 *
 * Time Complexity:  O(V² log V) with sorted array (good enough for small nets)
 * Space Complexity: O(V)
 *
 * PROS:  Finds the truly optimal (lowest latency) path
 * CONS:  Slower than BFS/DFS for large unweighted graphs
 * ============================================================
 */

import { Graph } from '../ds/Graph';
import { PathResult } from './dfs';

interface PriorityItem {
  nodeId: string;
  cost: number; // cumulative latency so far
}

/**
 * Find the lowest-latency path from `start` to `end`.
 */
export function dijkstra(graph: Graph, start: string, end: string): PathResult {
  if (start === end) {
    return { path: [start], visited: [start], found: true, hops: 0, totalLatency: 0 };
  }

  // dist[nodeId] = lowest known cumulative latency to reach nodeId
  const dist = new Map<string, number>();
  // prev[nodeId] = predecessor on the optimal path
  const prev = new Map<string, string | null>();
  const visitedOrder: string[] = [];

  // Initialise: all distances = Infinity
  for (const node of graph.getAllNodes()) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
  }
  dist.set(start, 0);

  // Priority queue (min-heap simulated as sorted array)
  const pq: PriorityItem[] = [{ nodeId: start, cost: 0 }];
  const settled = new Set<string>();

  while (pq.length > 0) {
    // Sort ascending by cost and extract the minimum
    pq.sort((a, b) => a.cost - b.cost);
    const { nodeId: current, cost: currentCost } = pq.shift()!;

    if (settled.has(current)) continue;
    settled.add(current);
    visitedOrder.push(current);

    if (current === end) break; // We've found the shortest path to end

    const neighbours = graph.getNeighbours(current);
    for (const { id: neighbourId, data } of neighbours) {
      if (settled.has(neighbourId)) continue;

      const tentative = currentCost + data.latency;
      if (tentative < (dist.get(neighbourId) ?? Infinity)) {
        dist.set(neighbourId, tentative);
        prev.set(neighbourId, current);
        pq.push({ nodeId: neighbourId, cost: tentative });
      }
    }
  }

  // Reconstruct path by walking backwards through `prev`
  if (!settled.has(end) && dist.get(end) === Infinity) {
    return { path: [], visited: visitedOrder, found: false, hops: 0, totalLatency: 0 };
  }

  const path: string[] = [];
  let cursor: string | null | undefined = end;
  while (cursor != null) {
    path.unshift(cursor);
    cursor = prev.get(cursor);
  }

  // Verify path starts at source
  if (path[0] !== start) {
    return { path: [], visited: visitedOrder, found: false, hops: 0, totalLatency: 0 };
  }

  return {
    path,
    visited: visitedOrder,
    found: true,
    hops: path.length - 1,
    totalLatency: dist.get(end) ?? 0,
  };
}
