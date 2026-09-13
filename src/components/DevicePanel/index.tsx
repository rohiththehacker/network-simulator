/**
 * DevicePanel — Add, view, and edit network devices.
 *
 * When "Add Device" mode:
 *   - Shows a form to configure a new device
 *   - Validates name uniqueness
 *
 * When a node is selected:
 *   - Shows the device details
 *   - Allows toggling online/offline
 *   - Allows deleting the device
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Power, Edit3, X, Monitor } from 'lucide-react';
import { GraphNode, DeviceType } from '../../ds/Graph';
import {
  getDeviceIcon, getStatusColor, getStatusBgColor,
  getDeviceTypeColor, generateId, formatTime,
} from '../../utils/deviceUtils';

const DEVICE_TYPES: DeviceType[] = ['computer', 'laptop', 'router', 'switch', 'server', 'firewall', 'cloud'];

interface DevicePanelProps {
  nodes: GraphNode[];
  selectedId: string | null;
  onAdd: (node: GraphNode) => void;
  onUpdate: (id: string, updates: Partial<GraphNode>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onSelect: (id: string | null) => void;
}

interface NewDeviceForm {
  label: string;
  type: DeviceType;
  ip: string;
  mac: string;
}

const DEFAULT_FORM: NewDeviceForm = { label: '', type: 'computer', ip: '', mac: '' };

export default function DevicePanel({
  nodes,
  selectedId,
  onAdd,
  onUpdate,
  onRemove,
  onToggle,
  onSelect,
}: DevicePanelProps) {
  const [mode, setMode] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState<NewDeviceForm>(DEFAULT_FORM);
  const [formError, setFormError] = useState('');

  const selectedNode = nodes.find(n => n.id === selectedId);

  const handleAdd = () => {
    if (!form.label.trim()) { setFormError('Device name is required'); return; }
    if (nodes.find(n => n.label === form.label.trim())) {
      setFormError(`"${form.label}" already exists`);
      return;
    }
    onAdd({
      id: generateId('dev'),
      label: form.label.trim(),
      type: form.type,
      ip: form.ip || undefined,
      mac: form.mac || undefined,
      status: 'online',
      // Scatter new nodes around the centre
      x: 200 + Math.random() * 400,
      y: 150 + Math.random() * 300,
    });
    setForm(DEFAULT_FORM);
    setFormError('');
    setMode('list');
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-accent-blue" />
          <span className="text-sm font-semibold text-slate-200">Devices</span>
          <span className="text-xs text-slate-500 font-mono">({nodes.length})</span>
        </div>
        <button
          onClick={() => { setMode(mode === 'add' ? 'list' : 'add'); setFormError(''); setForm(DEFAULT_FORM); }}
          className={`btn-icon p-1.5 ${mode === 'add' ? 'text-red-400 border-red-500/30' : ''}`}
          title={mode === 'add' ? 'Cancel' : 'Add device'}
        >
          {mode === 'add' ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Add device form */}
        <AnimatePresence>
          {mode === 'add' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-400 font-medium">Add New Device</p>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide">Name *</label>
                  <input
                    className="input-field mt-1"
                    placeholder="e.g. PC-04"
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide">Type *</label>
                  <select
                    className="select-field mt-1"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as DeviceType }))}
                  >
                    {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Type picker buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {DEVICE_TYPES.map(t => {
                    const Icon = getDeviceIcon(t);
                    const color = getDeviceTypeColor(t);
                    return (
                      <button
                        key={t}
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`
                          flex flex-col items-center gap-1 py-2 rounded-lg border text-[9px] transition-all
                          ${form.type === t
                            ? 'border-current'
                            : 'border-border hover:border-border-bright bg-bg-secondary'
                          }
                        `}
                        style={form.type === t ? { borderColor: color, color, backgroundColor: `${color}14` } : {}}
                        title={t}
                      >
                        <Icon size={14} />
                        <span className="truncate w-full text-center capitalize">{t}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">IP Address</label>
                    <input
                      className="input-field mt-1"
                      placeholder="192.168.1.x"
                      value={form.ip}
                      onChange={e => setForm(f => ({ ...f, ip: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">MAC</label>
                    <input
                      className="input-field mt-1"
                      placeholder="AA:BB:CC:..."
                      value={form.mac}
                      onChange={e => setForm(f => ({ ...f, mac: e.target.value }))}
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-400">{formError}</p>
                )}

                <button onClick={handleAdd} className="btn-primary w-full">
                  Add Device
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected device detail */}
        <AnimatePresence>
          {selectedNode && mode === 'list' && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-b border-border space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getDeviceIcon(selectedNode.type);
                      return <Icon size={16} style={{ color: getDeviceTypeColor(selectedNode.type) }} />;
                    })()}
                    <span className="text-sm font-semibold text-slate-200">{selectedNode.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusBgColor(selectedNode.status)}`} />
                    <span className={`text-xs capitalize ${getStatusColor(selectedNode.status)}`}>
                      {selectedNode.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => onSelect(null)} className="btn-icon p-1">
                  <X size={12} />
                </button>
              </div>

              <div className="space-y-1 text-xs font-mono">
                {[
                  ['Type', selectedNode.type],
                  ['IP', selectedNode.ip ?? '—'],
                  ['MAC', selectedNode.mac ?? '—'],
                  ['Position', `(${Math.round(selectedNode.x)}, ${Math.round(selectedNode.y)})`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-300">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onToggle(selectedNode.id)}
                  className={`btn-icon flex-1 flex items-center justify-center gap-1.5 text-xs
                    ${selectedNode.status === 'offline' ? 'text-green-400' : 'text-amber-400'}
                  `}
                >
                  <Power size={12} />
                  {selectedNode.status === 'offline' ? 'Bring Online' : 'Take Offline'}
                </button>
                <button
                  onClick={() => { onRemove(selectedNode.id); onSelect(null); }}
                  className="btn-danger flex items-center gap-1.5 text-xs px-3"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device list */}
        <div className="p-2 space-y-1">
          {nodes.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-6">No devices — click + to add one</p>
          )}
          {nodes.map(node => {
            const Icon = getDeviceIcon(node.type);
            const color = getDeviceTypeColor(node.type);
            const isSelected = node.id === selectedId;

            return (
              <button
                key={node.id}
                onClick={() => onSelect(isSelected ? null : node.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left
                  transition-all duration-150
                  ${isSelected
                    ? 'bg-accent-blue/10 border-accent-blue/30'
                    : 'bg-bg-secondary border-border hover:border-border-bright'
                  }
                `}
              >
                <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}18`, color }}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-200 truncate">{node.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusBgColor(node.status)}`} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{node.ip ?? node.type}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
