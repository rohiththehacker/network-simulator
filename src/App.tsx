/**
 * App.tsx — Root application component.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  HEADER                                                      │
 * ├──────────┬───────────────────────────────┬───────────────────┤
 * │ LEFT     │    NETWORK CANVAS             │  RIGHT            │
 * │ Devices  │                               │  Packet Panel     │
 * │ Conns    │                               │  Stack Viz        │
 * │ Algo     │                               │  Log              │
 * ├──────────┴───────────────────────────────┴───────────────────┤
 * │  BOTTOM: Stats / History (togglable)                        │
 * └──────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, BarChart2, RefreshCw, Database,
  Wifi, ChevronDown, ChevronUp,
} from 'lucide-react';

import NetworkCanvas from './components/NetworkCanvas';
import DevicePanel from './components/DevicePanel';
import ConnectionPanel from './components/ConnectionPanel';
import PacketPanel from './components/PacketPanel';
import StackVisualizer from './components/StackVisualizer';
import SimulationLog from './components/SimulationLog';
import NetworkStats from './components/NetworkStats';
import AlgorithmPanel from './components/AlgorithmPanel';

import { useNetwork } from './hooks/useNetwork';
import { SimulationResult } from './types';

type LeftTab = 'devices' | 'connections' | 'algorithms';

export default function App() {
  const {
    nodes, edges, logs, packets, stats, graph,
    addDevice, updateDevice, removeDevice, toggleDevice,
    addConnection, removeConnection,
    simulate, loadDemo, resetNetwork, clearLogs,
  } = useNetwork();

  // UI state
  const [leftTab, setLeftTab] = useState<LeftTab>('devices');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Simulation state (for canvas highlight + stack viz)
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [opIndex, setOpIndex] = useState(-1);

  // Derive active path and current hop from the step index
  const activePath = simResult?.path ?? [];
  const currentHop = (() => {
    if (!simResult || opIndex < 0) return null;
    const isBFS = simResult.algorithm === 'BFS';
    if (isBFS) {
      const queue: string[] = [];
      for (let i = 0; i <= opIndex; i++) {
        const op = simResult.stackOps[i];
        if (op.type === 'ENQUEUE' || op.type === 'PUSH') queue.push(op.node);
        else if (op.type === 'DEQUEUE' || op.type === 'POP') queue.shift();
      }
      return queue[0] ?? null;
    } else {
      const stack: string[] = [];
      for (let i = 0; i <= opIndex; i++) {
        const op = simResult.stackOps[i];
        if (op.type === 'PUSH' || op.type === 'ENQUEUE') stack.push(op.node);
        else if (op.type === 'POP' || op.type === 'DEQUEUE') stack.pop();
      }
      return stack[stack.length - 1] ?? null;
    }
  })();

  // Derive src/dst for algorithm panel from most recent sim or first/last node
  const algSrc = simResult?.source ?? (nodes[0]?.id ?? '');
  const algDst = simResult?.destination ?? (nodes[nodes.length - 1]?.id ?? '');

  const handleStepChange = useCallback((result: SimulationResult | null, idx: number) => {
    setSimResult(result);
    setOpIndex(idx);
  }, []);

  const LEFT_TABS: { id: LeftTab; label: string }[] = [
    { id: 'devices',     label: 'Devices' },
    { id: 'connections', label: 'Connections' },
    { id: 'algorithms',  label: 'Algorithms' },
  ];

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-secondary shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
            <Network size={20} className="text-accent-blue" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight">
              Computer Network Simulator
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              Graph · Stack (LIFO) · Queue (FIFO) · DFS · BFS
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Wifi size={13} className="text-green-400" />
            <span className="font-mono">
              {nodes.filter(n => n.status === 'online').length}/{nodes.length} online
            </span>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Action buttons */}
          <button onClick={loadDemo} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
            <Database size={12} /> Demo
          </button>
          <button onClick={resetNetwork} className="btn-danger flex items-center gap-1.5 text-xs py-1.5">
            <RefreshCw size={12} /> Reset
          </button>
          <button
            onClick={() => setShowStats(s => !s)}
            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5"
          >
            <BarChart2 size={12} /> Stats
            {showStats ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT SIDEBAR ──────────────────────────────────────── */}
        <div className="w-64 shrink-0 border-r border-border flex flex-col bg-bg-secondary">
          {/* Tab switcher */}
          <div className="flex border-b border-border">
            {LEFT_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setLeftTab(t.id)}
                className={`
                  flex-1 py-2.5 text-[11px] font-medium transition-colors
                  ${leftTab === t.id
                    ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5'
                    : 'text-slate-500 hover:text-slate-300'
                  }
                `}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {leftTab === 'devices' && (
              <DevicePanel
                nodes={nodes}
                selectedId={selectedNodeId}
                onAdd={addDevice}
                onUpdate={updateDevice}
                onRemove={removeDevice}
                onToggle={toggleDevice}
                onSelect={setSelectedNodeId}
              />
            )}
            {leftTab === 'connections' && (
              <ConnectionPanel
                nodes={nodes}
                edges={edges}
                onAdd={addConnection}
                onRemove={removeConnection}
              />
            )}
            {leftTab === 'algorithms' && (
              <AlgorithmPanel
                graph={graph}
                srcId={algSrc}
                dstId={algDst}
              />
            )}
          </div>
        </div>

        {/* CENTRE — Network Canvas ─────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden p-3 gap-3">
          <div className="flex-1 min-h-0">
            <NetworkCanvas
              nodes={nodes}
              edges={edges}
              activePath={activePath}
              currentHop={currentHop}
              selectedNodeId={selectedNodeId}
              onNodeClick={id => setSelectedNodeId(prev => prev === id ? null : id)}
            />
          </div>

          {/* Bottom stats drawer */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 320, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="shrink-0 overflow-y-auto"
              >
                <NetworkStats stats={stats} packets={packets} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SIDEBAR ─────────────────────────────────────── */}
        <div className="w-72 shrink-0 border-l border-border flex flex-col gap-0 bg-bg-secondary overflow-hidden">
          {/* Packet Panel — takes upper half */}
          <div className="flex-[5] min-h-0 border-b border-border overflow-hidden">
            <PacketPanel
              nodes={nodes}
              onSimulate={simulate}
              onStepChange={handleStepChange}
            />
          </div>

          {/* Stack Visualizer — middle */}
          <div className="flex-[4] min-h-0 border-b border-border overflow-hidden">
            <StackVisualizer
              result={simResult}
              currentOpIndex={opIndex}
              isAnimating={false}
            />
          </div>

          {/* Simulation Log — bottom */}
          <div className="flex-[3] min-h-0 overflow-hidden">
            <SimulationLog logs={logs} onClear={clearLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}
