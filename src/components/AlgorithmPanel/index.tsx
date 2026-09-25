/**
 * AlgorithmPanel — Educational comparison of DFS (Stack LIFO) and BFS (Queue FIFO).
 *
 * Shows:
 *   - Description of each algorithm & underlying Data Structure
 *   - How DFS differs from BFS
 *   - The path found on current simulation
 *   - Step-by-step visited order
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GitBranch, ListFilter } from 'lucide-react';
import { Graph } from '../../ds/Graph';
import { dfs } from '../../algorithms/dfs';
import { bfs } from '../../algorithms/bfs';
import { Algorithm } from '../../types';
import { formatLatency } from '../../utils/deviceUtils';

interface AlgorithmPanelProps {
  graph: Graph;
  srcId: string;
  dstId: string;
}

const ALGO_INFO = {
  DFS: {
    name: 'Depth-First Search',
    icon: GitBranch,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Explores as far as possible along each branch before backtracking. Uses a STACK internally (LIFO - Last In, First Out). Finds a valid path (not necessarily shortest).',
    complexity: { time: 'O(V + E)', space: 'O(V)', memory: 'Low (stack depth)', path: 'First path found' },
    structure: 'Stack (LIFO)',
  },
  BFS: {
    name: 'Breadth-First Search',
    icon: ListFilter,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Explores all neighbours at the current depth before going deeper. Uses a QUEUE internally (FIFO - First In, First Out). Guarantees the shortest path by hop count.',
    complexity: { time: 'O(V + E)', space: 'O(V)', memory: 'Frontier nodes', path: 'Fewest hops guaranteed' },
    structure: 'Queue (FIFO)',
  },
} as const;

export default function AlgorithmPanel({ graph, srcId, dstId }: AlgorithmPanelProps) {
  const [expanded, setExpanded] = useState<Algorithm | null>(null);

  const hasRoute = Boolean(srcId && dstId);

  // Run DFS and BFS algorithms for comparison
  const results = hasRoute ? {
    DFS: dfs(graph, srcId, dstId),
    BFS: bfs(graph, srcId, dstId),
  } : null;

  const algorithms = Object.keys(ALGO_INFO) as Algorithm[];

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <BookOpen size={16} className="text-accent-cyan" />
        <span className="text-sm font-semibold text-slate-200">Algorithm Comparison</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Route requirement notice */}
        {!hasRoute && (
          <div className="p-3 bg-bg-secondary rounded-lg border border-border text-xs text-slate-500 text-center">
            Select source & destination in the Packet panel to compare algorithm results on the current network
          </div>
        )}

        {algorithms.map(algo => {
          const info = ALGO_INFO[algo];
          const Icon = info.icon;
          const result = results?.[algo];
          const isExpanded = expanded === algo;

          return (
            <div key={algo} className={`rounded-xl border ${info.border} overflow-hidden`}>
              {/* Algorithm header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : algo)}
                className={`w-full flex items-center gap-3 p-3 text-left ${info.bg} hover:opacity-90 transition-opacity`}
              >
                <div className="p-1.5 rounded-lg bg-black/20">
                  <Icon size={15} className={info.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${info.color}`}>{algo}</div>
                  <div className="text-[10px] text-slate-400 truncate">{info.name}</div>
                </div>
                {/* Quick result badge */}
                {result && (
                  <div className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    result.found
                      ? `${info.bg} ${info.color}`
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {result.found ? `${result.hops} hop(s)` : 'No route'}
                  </div>
                )}
                <span className={`text-xs ${info.color} ml-1`}>{isExpanded ? '−' : '+'}</span>
              </button>

              {/* Expanded details */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-3 border-t border-border/50">
                      {/* Description */}
                      <p className="text-xs text-slate-400 leading-relaxed">{info.description}</p>

                      {/* Data structure used */}
                      <div className="flex items-center gap-2 p-2 bg-bg-secondary rounded-lg border border-border">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">Data Structure</span>
                        <span className={`ml-auto text-xs font-mono font-semibold ${info.color}`}>
                          {info.structure}
                        </span>
                      </div>

                      {/* Complexity */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        {Object.entries(info.complexity).map(([k, v]) => (
                          <div key={k} className="flex justify-between p-1.5 bg-bg-secondary rounded border border-border">
                            <span className="text-slate-500 uppercase tracking-wide">{k}</span>
                            <span className="font-mono text-slate-300">{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Result for current src→dst */}
                      {result && (
                        <div className="space-y-2">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                            Result: {srcId} → {dstId}
                          </div>

                          {result.found ? (
                            <>
                              {/* Path */}
                              <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                                {result.path.map((nodeId, idx) => (
                                  <span key={nodeId} className="flex items-center gap-1">
                                    <span className={`px-1.5 py-0.5 rounded ${info.bg} ${info.color}`}>
                                      {nodeId}
                                    </span>
                                    {idx < result.path.length - 1 && (
                                      <span className="text-slate-600">→</span>
                                    )}
                                  </span>
                                ))}
                              </div>

                              <div className="flex gap-3 text-[10px] font-mono">
                                <span className="text-slate-500">Hops: <span className={info.color}>{result.hops}</span></span>
                                <span className="text-slate-500">Latency: <span className={info.color}>{formatLatency(result.totalLatency)}</span></span>
                              </div>

                              {/* Visited order */}
                              <div>
                                <div className="text-[10px] text-slate-500 mb-1">Nodes visited (in order):</div>
                                <div className="flex flex-wrap gap-1">
                                  {result.visited.map((nodeId, idx) => (
                                    <span
                                      key={`${nodeId}-${idx}`}
                                      className="text-[9px] font-mono px-1 py-0.5 rounded bg-bg-secondary border border-border text-slate-400"
                                    >
                                      {nodeId}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-red-400">
                              No route found from {srcId} to {dstId}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Comparison summary when both DFS and BFS results are available */}
        {results && results.DFS.found && results.BFS.found && (
          <div className="p-3 bg-bg-secondary rounded-xl border border-border space-y-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">DFS vs BFS Summary</div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">BFS (Queue / FIFO)</span>
                <span className="text-blue-400">{results.BFS.hops} hop(s) [Shortest]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DFS (Stack / LIFO)</span>
                <span className="text-purple-400">{results.DFS.hops} hop(s) [Exploration]</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
