/**
 * StackVisualizer / DataStructureVisualizer —
 * Visualizes Stack (LIFO) for DFS and Queue (FIFO) for BFS.
 *
 * Makes data structure mechanics explicit and interactive for education.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, ListFilter } from 'lucide-react';
import { SimulationResult } from '../../types';

interface StackVisualizerProps {
  result: SimulationResult | null;
  /** Which operation index we're currently animating (for step-through) */
  currentOpIndex: number;
  isAnimating: boolean;
}

export default function StackVisualizer({
  result,
  currentOpIndex,
  isAnimating,
}: StackVisualizerProps) {
  const isBFS = result?.algorithm === 'BFS';

  // Compute current state by replaying operations up to currentOpIndex
  const items: string[] = [];
  let inCount = 0;   // PUSH or ENQUEUE
  let outCount = 0;  // POP or DEQUEUE

  if (result) {
    const ops = result.stackOps.slice(0, currentOpIndex + 1);
    for (const op of ops) {
      if (op.type === 'PUSH') {
        items.push(op.node);
        inCount++;
      } else if (op.type === 'POP') {
        items.pop();
        outCount++;
      } else if (op.type === 'ENQUEUE') {
        items.push(op.node);
        inCount++;
      } else if (op.type === 'DEQUEUE') {
        items.shift();
        outCount++;
      }
    }
  }

  // For Stack (DFS): TOP is at the end of the array, so we reverse it to display TOP at upper position.
  // For Queue (BFS): FRONT is index 0 (first in), REAR is index length-1 (last in).
  const displayItems = isBFS ? [...items] : [...items].reverse();

  const lastOp = result?.stackOps[currentOpIndex];

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isBFS ? (
            <ListFilter size={16} className="text-accent-blue" />
          ) : (
            <Layers size={16} className="text-accent-purple" />
          )}
          <span className="text-sm font-semibold text-slate-200">
            {isBFS ? 'BFS Queue (FIFO)' : 'DFS Stack (LIFO)'}
          </span>
        </div>

        {/* Counter badges */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span title={isBFS ? 'Total ENQUEUE operations' : 'Total PUSH operations'}>
            <span className="text-green-400">{isBFS ? '→' : '↑'}</span> {inCount}
          </span>
          <span title={isBFS ? 'Total DEQUEUE operations' : 'Total POP operations'}>
            <span className="text-red-400">{isBFS ? '←' : '↓'}</span> {outCount}
          </span>
          <span title="Current size">
            sz={items.length}
          </span>
        </div>
      </div>

      {/* Last operation banner */}
      <div className="px-4 py-2 border-b border-border min-h-[36px] flex items-center bg-bg-secondary/40">
        {lastOp ? (
          <motion.div
            key={`${currentOpIndex}-${lastOp.type}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs font-mono"
          >
            {lastOp.type === 'PUSH' && (
              <>
                <ArrowDown size={12} className="text-green-400" />
                <span className="text-green-400 font-semibold">PUSH (LIFO)</span>
                <span className="text-slate-300">→ {lastOp.node}</span>
              </>
            )}
            {lastOp.type === 'POP' && (
              <>
                <ArrowUp size={12} className="text-red-400" />
                <span className="text-red-400 font-semibold">POP (LIFO)</span>
                <span className="text-slate-300">← {lastOp.node}</span>
              </>
            )}
            {lastOp.type === 'ENQUEUE' && (
              <>
                <ArrowRight size={12} className="text-green-400" />
                <span className="text-green-400 font-semibold">ENQUEUE (FIFO)</span>
                <span className="text-slate-300">→ {lastOp.node}</span>
              </>
            )}
            {lastOp.type === 'DEQUEUE' && (
              <>
                <ArrowLeft size={12} className="text-red-400" />
                <span className="text-red-400 font-semibold">DEQUEUE (FIFO)</span>
                <span className="text-slate-300">← {lastOp.node}</span>
              </>
            )}
          </motion.div>
        ) : (
          <span className="text-xs text-slate-600 font-mono">
            {isBFS ? 'Queue is idle — waiting for simulation' : 'Stack is idle — waiting for simulation'}
          </span>
        )}
      </div>

      {/* Main visualization area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
        {/* Top boundary label */}
        {displayItems.length > 0 && (
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
              {isBFS ? 'FRONT (First In)' : 'TOP (Last In)'}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {displayItems.map((nodeId, idx) => {
            const isHighlight = isBFS ? idx === 0 : idx === 0;
            const isNew = isAnimating && (
              (lastOp?.type === 'PUSH' && lastOp.node === nodeId && idx === 0) ||
              (lastOp?.type === 'ENQUEUE' && lastOp.node === nodeId && idx === displayItems.length - 1)
            );

            return (
              <motion.div
                key={`${nodeId}-${idx}`}
                layout
                initial={isNew ? { y: isBFS ? 20 : -20, opacity: 0, scale: 0.9 } : false}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: isBFS ? -20 : -20, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg border
                  font-mono text-xs transition-colors
                  ${isHighlight
                    ? isBFS
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                      : 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                    : 'bg-bg-secondary border-border text-slate-400'
                  }
                `}
              >
                <span className="truncate font-medium">{nodeId}</span>
                <div className="flex items-center gap-2">
                  {isHighlight && (
                    <span className={`text-[9px] uppercase tracking-wide font-bold ${isBFS ? 'text-blue-400' : 'text-purple-400'}`}>
                      {isBFS ? 'Front' : 'Top'}
                    </span>
                  )}
                  <span className="text-slate-600 text-[10px]">
                    [{idx}]
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Bottom boundary label */}
        {displayItems.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
              {isBFS ? 'REAR (Last In)' : 'BOTTOM'}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        {/* Empty state */}
        {displayItems.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
            <div className="w-12 h-12 rounded-lg bg-bg-secondary border border-border flex items-center justify-center">
              {isBFS ? (
                <ListFilter size={20} className="text-slate-600" />
              ) : (
                <Layers size={20} className="text-slate-600" />
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {isBFS ? 'Queue is empty' : 'Stack is empty'}
            </p>
            <p className="text-[10px] text-slate-500 max-w-[170px]">
              {isBFS
                ? 'Run BFS simulation to see FIFO (First In, First Out) queue operations'
                : 'Run DFS simulation to see LIFO (Last In, First Out) stack operations'
              }
            </p>
          </div>
        )}
      </div>

      {/* Educational Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-bg-secondary/60 text-[10px] text-slate-400 leading-relaxed">
        {isBFS ? (
          <div>
            <span className="text-blue-400 font-semibold font-mono">BFS Queue (FIFO):</span>{' '}
            <span className="text-green-400 font-mono">ENQUEUE</span> adds to rear.{' '}
            <span className="text-red-400 font-mono">DEQUEUE</span> removes from front (First-In, First-Out).
          </div>
        ) : (
          <div>
            <span className="text-purple-400 font-semibold font-mono">DFS Stack (LIFO):</span>{' '}
            <span className="text-green-400 font-mono">PUSH</span> adds to top.{' '}
            <span className="text-red-400 font-mono">POP</span> removes from top (Last-In, First-Out).
          </div>
        )}
      </div>
    </div>
  );
}
