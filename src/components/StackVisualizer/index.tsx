/**
 * StackVisualizer — Shows the packet stack state during simulation.
 *
 * This is the KEY educational component. It makes the Stack data
 * structure visible in real-time:
 *
 *   - Each item in the stack is a node the packet has visited
 *   - New items animate in from the top (PUSH)
 *   - Items animate out upward (POP)
 *   - The TOP item is clearly labelled
 *   - Push/pop counts are tracked
 *
 * This panel makes it easy to explain to a professor exactly
 * what the Stack is doing during a packet transmission.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { SimulationResult } from '../../types';
import { formatTime } from '../../utils/deviceUtils';

interface StackVisualizerProps {
  result: SimulationResult | null;
  /** Which stack op index we're currently animating (for step-through) */
  currentOpIndex: number;
  isAnimating: boolean;
}

export default function StackVisualizer({
  result,
  currentOpIndex,
  isAnimating,
}: StackVisualizerProps) {
  // Compute the current stack state by replaying operations up to currentOpIndex
  const stackItems: string[] = [];
  let pushCount = 0;
  let popCount = 0;

  if (result) {
    const ops = result.stackOps.slice(0, currentOpIndex + 1);
    for (const op of ops) {
      if (op.type === 'PUSH') {
        stackItems.push(op.node);
        pushCount++;
      } else {
        stackItems.pop();
        popCount++;
      }
    }
  }

  // Reverse so TOP is at the top visually
  const displayItems = [...stackItems].reverse();

  const lastOp = result?.stackOps[currentOpIndex];

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-accent-purple" />
          <span className="text-sm font-semibold text-slate-200">Packet Stack</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span title="Total PUSH operations">
            <span className="text-green-400">↑</span> {pushCount}
          </span>
          <span title="Total POP operations">
            <span className="text-red-400">↓</span> {popCount}
          </span>
          <span title="Current stack size">
            sz={stackItems.length}
          </span>
        </div>
      </div>

      {/* Last operation display */}
      <div className="px-4 py-2 border-b border-border min-h-[36px] flex items-center">
        {lastOp ? (
          <motion.div
            key={`${currentOpIndex}-${lastOp.type}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs font-mono"
          >
            {lastOp.type === 'PUSH' ? (
              <>
                <ArrowDown size={12} className="text-green-400" />
                <span className="text-green-400">PUSH</span>
                <span className="text-slate-300">→ {lastOp.node}</span>
              </>
            ) : (
              <>
                <ArrowUp size={12} className="text-red-400" />
                <span className="text-red-400">POP</span>
                <span className="text-slate-300">← {lastOp.node}</span>
              </>
            )}
          </motion.div>
        ) : (
          <span className="text-xs text-slate-600 font-mono">No operations yet</span>
        )}
      </div>

      {/* Stack visualization */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
        {/* TOP label */}
        {displayItems.length > 0 && (
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">TOP</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {displayItems.map((nodeId, idx) => {
            const isTop = idx === 0;
            const isNew = lastOp?.type === 'PUSH' && lastOp.node === nodeId && isTop && isAnimating;

            return (
              <motion.div
                key={`${nodeId}-${stackItems.length - idx - 1}`}
                layout
                initial={isNew ? { y: -20, opacity: 0, scale: 0.9 } : false}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg border
                  font-mono text-xs transition-colors
                  ${isTop
                    ? 'bg-accent-blue/10 border-accent-blue/30 text-blue-300'
                    : 'bg-bg-secondary border-border text-slate-400'
                  }
                `}
              >
                <span className="truncate">{nodeId}</span>
                <div className="flex items-center gap-2">
                  {isTop && (
                    <span className="text-[9px] text-blue-400 uppercase tracking-wide">top</span>
                  )}
                  <span className="text-slate-600 text-[10px]">
                    [{stackItems.length - 1 - idx}]
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* BOTTOM label */}
        {displayItems.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">BOTTOM</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        {/* Empty state */}
        {displayItems.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
            <div className="w-12 h-12 rounded-lg bg-bg-secondary border border-border flex items-center justify-center">
              <Layers size={20} className="text-slate-600" />
            </div>
            <p className="text-xs text-slate-500">Stack is empty</p>
            <p className="text-[10px] text-slate-600 max-w-[160px]">
              Transmit a packet to see push/pop operations
            </p>
          </div>
        )}
      </div>

      {/* Footer: explanation */}
      <div className="px-4 py-3 border-t border-border bg-bg-secondary/50">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <span className="text-green-400 font-mono">PUSH</span> when packet arrives at a node.{' '}
          <span className="text-red-400 font-mono">POP</span> when packet is forwarded onward.
          TOP = current packet location.
        </p>
      </div>
    </div>
  );
}
