/**
 * ============================================================
 * BREADTH-FIRST SEARCH (BFS) — Shortest Path (by hop count)
 * ============================================================
 *
 * BFS explores a graph LEVEL BY LEVEL — it visits all nodes
 * one hop away before moving to nodes two hops away, and so on.
 *
 * In network terms:
 *   - Start at the source device
 *   - Visit ALL directly-connected neighbours first
 *   - Then visit THEIR neighbours, and so on
 *   - Stop when we reach the destination
 *
 * Because BFS expands level by level, the FIRST time we reach
 * the destination is guaranteed to be via the FEWEST HOPS.
 *
 * Implementation:
 *   - Uses a QUEUE internally (FIFO — first in, first out)
 *   - This is the key difference from DFS (which uses a Stack)!
 *
 * Time Complexity:  O(V + E)
 * Space Complexity: O(V)
 *
 * PROS:  Guarantees minimum hops (shortest path by hop count)
 * CONS:  Uses more memory than DFS (stores all frontier nodes)
 * ============================================================
 */

import { Graph } from '../ds/Graph';
import { PathResult } from './dfs';

/**
 * Find the shortest path (by hop count) from `start` to `end` using BFS.
 */
export function bfs(graph: Graph, start: string, end: string): PathResult {
  if (start === end) {
    return { path: [start], visited: [start], found: true, hops: 0, totalLatency: 0 };
  }

  // Queue stores [currentNodeId, pathSoFar]
  // We use a plain array with shift() for simplicity (O(n) shift, fine for small nets)
  const queue: Array<[string, string[]]> = [[start, [start]]];
  const visited = new Set<string>([start]);
  const visitedOrder: string[] = [start];

  while (queue.length > 0) {
    // DEQUEUE from the front — FIFO order → breadth-first behaviour
    const [current, path] = queue.shift()!;

    if (current === end) {
      const latency = computeLatency(graph, path);
      return {
        path,
        visited: visitedOrder,
        found: true,
        hops: path.length - 1,
        totalLatency: latency,
      };
    }

    // Enqueue all unvisited online neighbours
    const neighbours = graph.getNeighbours(current);
    for (const { id } of neighbours) {
      if (!visited.has(id)) {
        visited.add(id);
        visitedOrder.push(id);
        queue.push([id, [...path, id]]);
      }
    }
  }

  return { path: [], visited: visitedOrder, found: false, hops: 0, totalLatency: 0 };
}

function computeLatency(graph: Graph, path: string[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = graph.getEdgeData(path[i], path[i + 1]);
    if (edge) total += edge.latency;
  }
  return total;
}
