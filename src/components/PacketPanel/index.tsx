/**
 * PacketPanel — Packet transmission controls and result display.
 *
 * Allows the user to:
 *   1. Choose source and destination devices
 *   2. Choose routing algorithm (DFS / BFS / Dijkstra)
 *   3. Transmit the packet
 *   4. See the computed path and hop-by-hop status
 *   5. Step through the simulation manually
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ChevronRight, ChevronLeft, RotateCcw,
  CheckCircle2, XCircle, Loader2, Activity,
} from 'lucide-react';
import { GraphNode } from '../../ds/Graph';
import { Algorithm, SimulationResult } from '../../types';
import { formatLatency, formatTime, getDeviceIcon } from '../../utils/deviceUtils';

interface PacketPanelProps {
  nodes: GraphNode[];
  onSimulate: (src: string, dst: string, algorithm: Algorithm) => SimulationResult;
  onStepChange: (result: SimulationResult | null, opIdx: number) => void;
}

const ALGORITHMS: Algorithm[] = ['DFS', 'BFS', 'Dijkstra'];

const ALGO_DESCRIPTIONS: Record<Algorithm, string> = {
  DFS: 'Depth-First Search — explores deeply, finds A path (not necessarily shortest)',
  BFS: 'Breadth-First Search — explores level-by-level, guaranteed shortest hops',
  Dijkstra: 'Dijkstra\'s Algorithm — finds the lowest-latency path using edge weights',
};

export default function PacketPanel({ nodes, onSimulate, onStepChange }: PacketPanelProps) {
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('BFS');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [opIndex, setOpIndex] = useState(-1);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [error, setError] = useState('');

  const onlineNodes = nodes.filter(n => n.status !== 'offline');

  const transmit = useCallback(async () => {
    if (!src || !dst) { setError('Please select source and destination'); return; }
    if (src === dst) { setError('Source and destination must be different'); return; }

    setError('');
    setIsTransmitting(true);
    setResult(null);
    setOpIndex(-1);
    onStepChange(null, -1);

    // Small delay for visual effect
    await new Promise(r => setTimeout(r, 300));

    const res = onSimulate(src, dst, algorithm);
    setResult(res);

    if (res.status === 'FAILED') {
      setError(res.reason ?? 'Transmission failed');
      setIsTransmitting(false);
      onStepChange(res, -1);
      return;
    }

    // Auto-play through stack operations
    let idx = -1;
    for (let i = 0; i < res.stackOps.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      idx = i;
      setOpIndex(idx);
      onStepChange(res, idx);
    }

    setIsTransmitting(false);
  }, [src, dst, algorithm, onSimulate, onStepChange]);

  const stepForward = useCallback(() => {
    if (!result) return;
    const next = Math.min(opIndex + 1, result.stackOps.length - 1);
    setOpIndex(next);
    onStepChange(result, next);
  }, [result, opIndex, onStepChange]);

  const stepBack = useCallback(() => {
    if (!result) return;
    const prev = Math.max(opIndex - 1, -1);
    setOpIndex(prev);
    onStepChange(result, prev);
  }, [result, opIndex, onStepChange]);

  const reset = useCallback(() => {
    setResult(null);
    setOpIndex(-1);
    setError('');
    setIsTransmitting(false);
    onStepChange(null, -1);
  }, [onStepChange]);

  // Compute the "current" node during stepped playback
  const currentNodeId = result && opIndex >= 0 ? result.stackOps[opIndex]?.node : null;

  // Figure out what hop in the path we're at
  const currentPathStep = result && currentNodeId
    ? result.path.indexOf(currentNodeId)
    : -1;

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Activity size={16} className="text-accent-cyan" />
        <span className="text-sm font-semibold text-slate-200">Packet Transmission</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Source / Destination */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Source</label>
            <select
              className="select-field"
              value={src}
              onChange={e => setSrc(e.target.value)}
            >
              <option value="">Select...</option>
              {onlineNodes.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Destination</label>
            <select
              className="select-field"
              value={dst}
              onChange={e => setDst(e.target.value)}
            >
              <option value="">Select...</option>
              {onlineNodes.filter(n => n.id !== src).map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Algorithm */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Routing Algorithm</label>
          <div className="grid grid-cols-3 gap-1.5">
            {ALGORITHMS.map(a => (
              <button
                key={a}
                onClick={() => setAlgorithm(a)}
                className={`
                  py-2 rounded-lg text-xs font-mono font-medium border transition-all
                  ${algorithm === a
                    ? 'bg-accent-blue/20 border-accent-blue/50 text-blue-300'
                    : 'bg-bg-secondary border-border text-slate-400 hover:border-border-bright'
                  }
                `}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">{ALGO_DESCRIPTIONS[algorithm]}</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transmit button */}
        <button
          onClick={transmit}
          disabled={isTransmitting || !src || !dst}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isTransmitting ? (
            <><Loader2 size={14} className="animate-spin" /> Transmitting...</>
          ) : (
            <><Send size={14} /> Transmit Packet</>
          )}
        </button>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Status banner */}
              <div className={`
                flex items-center gap-2 p-3 rounded-lg border text-sm font-medium
                ${result.status === 'DELIVERED'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
                }
              `}>
                {result.status === 'DELIVERED'
                  ? <CheckCircle2 size={16} />
                  : <XCircle size={16} />
                }
                {result.status === 'DELIVERED'
                  ? `${result.packetId} Delivered — ${result.hops} hop(s), ${formatLatency(result.totalLatency)}`
                  : `${result.packetId} Failed`
                }
              </div>

              {/* Path display */}
              {result.path.length > 0 && (
                <div className="bg-bg-secondary rounded-lg p-3 border border-border">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wide mb-2">
                    Packet Path ({result.algorithm})
                  </div>
                  <div className="space-y-1">
                    {result.path.map((nodeId, idx) => {
                      const isCurrentStep = idx === currentPathStep;
                      const isPast = currentPathStep >= 0 && idx < currentPathStep;
                      return (
                        <div key={nodeId} className="flex items-center gap-2">
                          {idx > 0 && (
                            <div className="ml-3 w-px h-3 bg-border self-start" />
                          )}
                          <div className="flex items-center gap-2">
                            <div className={`
                              w-2 h-2 rounded-full shrink-0
                              ${isCurrentStep ? 'bg-amber-400 animate-pulse' :
                                isPast ? 'bg-green-500' : 'bg-border-bright'}
                            `} />
                            <span className={`
                              text-xs font-mono
                              ${isCurrentStep ? 'text-amber-300 font-semibold' :
                                isPast ? 'text-green-400' : 'text-slate-400'}
                            `}>
                              {nodeId}
                            </span>
                            {idx === 0 && <span className="text-[9px] text-blue-400">[src]</span>}
                            {idx === result.path.length - 1 && <span className="text-[9px] text-green-400">[dst]</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step controls */}
              {result.status === 'DELIVERED' && (
                <div className="flex items-center gap-2">
                  <button onClick={stepBack} disabled={opIndex <= -1} className="btn-icon flex-1 flex items-center justify-center gap-1 text-xs">
                    <ChevronLeft size={14} /> Back
                  </button>
                  <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                    {opIndex + 1}/{result.stackOps.length}
                  </span>
                  <button onClick={stepForward} disabled={opIndex >= result.stackOps.length - 1} className="btn-icon flex-1 flex items-center justify-center gap-1 text-xs">
                    Next <ChevronRight size={14} />
                  </button>
                  <button onClick={reset} className="btn-icon p-2" title="Reset">
                    <RotateCcw size={14} />
                  </button>
                </div>
              )}

              {/* Stats row */}
              {result.status === 'DELIVERED' && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Hops', value: result.hops },
                    { label: 'Latency', value: formatLatency(result.totalLatency) },
                    { label: 'Ops', value: result.stackOps.length },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-bg-secondary rounded-lg p-2 border border-border">
                      <div className="text-sm font-mono font-semibold text-slate-200">{value}</div>
                      <div className="text-[10px] text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
