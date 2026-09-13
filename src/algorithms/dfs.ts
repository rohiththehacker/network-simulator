/**
 * ============================================================
 * DEPTH-FIRST SEARCH (DFS) — Path Finding
 * ============================================================
 *
 * DFS explores a graph by going as DEEP as possible along each
 * branch before backtracking.
 *
 * In network terms:
 *   - Start at the source device
 *   - Follow one connection as far as it goes
 *   - If we hit a dead end (or already-visited node), backtrack
 *   - Continue until we find the destination
 *
 * Implementation:
 *   - Uses a STACK internally (explicit, not call-stack recursion)
 *   - This mirrors the Stack data structure we visualise!
 *
 * Time Complexity:  O(V + E)  — visits each node and edge once
 * Space Complexity: O(V)      — for the visited set + stack
 *
 * PROS:  Low memory for deep networks, finds A path (not shortest)
 * CONS:  May NOT find the shortest path
 * ============================================================
 */

import { Graph } from '../ds/Graph';

export interface PathResult {
  path: string[];         // ordered list of node IDs
  visited: string[];      // all visited nodes in order (for viz)
  found: boolean;
  hops: number;
  totalLatency: number;   // sum of edge latencies along the path
}

/**
 * Find a path from `start` to `end` using DFS.
 * Returns the FIRST path found (not necessarily shortest).
 */
export function dfs(graph: Graph, start: string, end: string): PathResult {
  if (start === end) {
    return { path: [start], visited: [start], found: true, hops: 0, totalLatency: 0 };
  }

  // Explicit stack stores [currentNodeId, pathSoFar]
  const stack: Array<[string, string[]]> = [[start, [start]]];
  const visited = new Set<string>();
  const visitedOrder: string[] = [];

  while (stack.length > 0) {
    // POP from the top — LIFO order → depth-first behaviour
    const [current, path] = stack.pop()!;

    if (visited.has(current)) continue;
    visited.add(current);
    visitedOrder.push(current);

    // Found the destination!
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

    // Push all unvisited online neighbours onto the stack
    const neighbours = graph.getNeighbours(current);
    for (const { id } of neighbours) {
      if (!visited.has(id)) {
        stack.push([id, [...path, id]]);
      }
    }
  }

  // No path found
  return { path: [], visited: visitedOrder, found: false, hops: 0, totalLatency: 0 };
}

/** Sum the latencies of consecutive edges along a path. */
function computeLatency(graph: Graph, path: string[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = graph.getEdgeData(path[i], path[i + 1]);
    if (edge) total += edge.latency;
  }
  return total;
}
