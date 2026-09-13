/**
 * ConnectionPanel — Add and remove network connections (edges).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Trash2, Plus, X } from 'lucide-react';
import { GraphNode, Edge, EdgeData } from '../../ds/Graph';
import { generateId, formatBandwidth, formatLatency } from '../../utils/deviceUtils';

interface ConnectionPanelProps {
  nodes: GraphNode[];
  edges: Edge[];
  onAdd: (edge: Edge) => void;
  onRemove: (edgeId: string) => void;
}

type ConnType = EdgeData['type'];
const CONN_TYPES: ConnType[] = ['ethernet', 'fiber', 'wifi', 'virtual'];

const CONN_DEFAULTS: Record<ConnType, { bandwidth: number; latency: number }> = {
  ethernet: { bandwidth: 100,  latency: 5  },
  fiber:    { bandwidth: 1000, latency: 2  },
  wifi:     { bandwidth: 54,   latency: 10 },
  virtual:  { bandwidth: 500,  latency: 15 },
};

const CONN_COLORS: Record<ConnType, string> = {
  ethernet: '#3b82f6',
  fiber:    '#06b6d4',
  wifi:     '#8b5cf6',
  virtual:  '#10b981',
};

export default function ConnectionPanel({ nodes, edges, onAdd, onRemove }: ConnectionPanelProps) {
  const [mode, setMode] = useState<'list' | 'add'>('list');
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');
  const [type, setType] = useState<ConnType>('ethernet');
  const [bandwidth, setBandwidth] = useState(100);
  const [latency, setLatency] = useState(5);
  const [formError, setFormError] = useState('');

  const onlineNodes = nodes.filter(n => n.status !== 'offline');

  const handleTypeChange = (t: ConnType) => {
    setType(t);
    setBandwidth(CONN_DEFAULTS[t].bandwidth);
    setLatency(CONN_DEFAULTS[t].latency);
  };

  const handleAdd = () => {
    if (!src || !dst) { setFormError('Select both devices'); return; }
    if (src === dst) { setFormError('Cannot connect a device to itself'); return; }

    // Check for duplicate
    const dupe = edges.find(
      e => (e.source === src && e.target === dst) || (e.source === dst && e.target === src),
    );
    if (dupe) { setFormError('Connection already exists'); return; }

    onAdd({
      id: generateId('edge'),
      source: src,
      target: dst,
      data: { bandwidth, latency, type },
    });

    setSrc(''); setDst(''); setType('ethernet'); setBandwidth(100); setLatency(5);
    setFormError('');
    setMode('list');
  };

  // Get display label for a node
  const nodeLabel = (id: string) => nodes.find(n => n.id === id)?.label ?? id;

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link size={16} className="text-accent-green" />
          <span className="text-sm font-semibold text-slate-200">Connections</span>
          <span className="text-xs text-slate-500 font-mono">({edges.length})</span>
        </div>
        <button
          onClick={() => { setMode(mode === 'add' ? 'list' : 'add'); setFormError(''); }}
          className={`btn-icon p-1.5 ${mode === 'add' ? 'text-red-400 border-red-500/30' : ''}`}
        >
          {mode === 'add' ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Add form */}
        <AnimatePresence>
          {mode === 'add' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-400 font-medium">New Connection</p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">From</label>
                    <select className="select-field mt-1" value={src} onChange={e => setSrc(e.target.value)}>
                      <option value="">Device...</option>
                      {onlineNodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">To</label>
                    <select className="select-field mt-1" value={dst} onChange={e => setDst(e.target.value)}>
                      <option value="">Device...</option>
                      {onlineNodes.filter(n => n.id !== src).map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Connection type */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide">Type</label>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {CONN_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={`
                          py-1.5 rounded-lg text-[10px] font-mono border transition-all capitalize
                          ${type === t
                            ? 'text-white border-current'
                            : 'border-border bg-bg-secondary text-slate-400'
                          }
                        `}
                        style={type === t ? { color: CONN_COLORS[t], borderColor: CONN_COLORS[t], backgroundColor: `${CONN_COLORS[t]}18` } : {}}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">Bandwidth (Mbps)</label>
                    <input
                      type="number"
                      className="input-field mt-1"
                      value={bandwidth}
                      min={1}
                      onChange={e => setBandwidth(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">Latency (ms)</label>
                    <input
                      type="number"
                      className="input-field mt-1"
                      value={latency}
                      min={1}
                      onChange={e => setLatency(Number(e.target.value))}
                    />
                  </div>
                </div>

                {formError && <p className="text-xs text-red-400">{formError}</p>}

                <button onClick={handleAdd} className="btn-primary w-full">
                  Add Connection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edge list */}
        <div className="p-2 space-y-1">
          {edges.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-6">No connections yet</p>
          )}
          {edges.map(edge => (
            <div
              key={edge.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-bg-secondary group"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: CONN_COLORS[edge.data.type] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-300 font-mono truncate">
                  {nodeLabel(edge.source)} ↔ {nodeLabel(edge.target)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {edge.data.type} · {formatLatency(edge.data.latency)} · {formatBandwidth(edge.data.bandwidth)}
                </div>
              </div>
              <button
                onClick={() => onRemove(edge.id)}
                className="opacity-0 group-hover:opacity-100 btn-icon p-1 text-red-400 border-red-500/20"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
