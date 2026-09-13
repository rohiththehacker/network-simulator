/**
 * SimulationLog — Real-time event log panel.
 *
 * Displays chronological log entries with colour-coded levels:
 *   INFO    → blue
 *   SUCCESS → green
 *   WARNING → amber
 *   ERROR   → red
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Trash2 } from 'lucide-react';
import { LogEntry } from '../../types';
import { formatTime } from '../../utils/deviceUtils';

interface SimulationLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

const LEVEL_CLASSES: Record<LogEntry['level'], string> = {
  INFO:    'text-blue-400',
  SUCCESS: 'text-green-400',
  WARNING: 'text-amber-400',
  ERROR:   'text-red-400',
};

const LEVEL_BG: Record<LogEntry['level'], string> = {
  INFO:    'bg-blue-500/5',
  SUCCESS: 'bg-green-500/5',
  WARNING: 'bg-amber-500/5',
  ERROR:   'bg-red-500/8',
};

export default function SimulationLog({ logs, onClear }: SimulationLogProps) {
  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-accent-cyan" />
          <span className="text-sm font-semibold text-slate-200">Simulation Log</span>
          <span className="text-xs text-slate-500 font-mono">({logs.length})</span>
        </div>
        <button onClick={onClear} className="btn-icon p-1.5" title="Clear logs">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
        {logs.length === 0 && (
          <p className="text-slate-600 text-center py-6">Log is empty</p>
        )}

        <AnimatePresence initial={false}>
          {logs.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2 px-2 py-1.5 rounded ${LEVEL_BG[entry.level]}`}
            >
              <span className="text-slate-600 shrink-0 tabular-nums">
                [{formatTime(entry.timestamp)}]
              </span>
              <span className={`shrink-0 w-14 ${LEVEL_CLASSES[entry.level]}`}>
                {entry.level}
              </span>
              <span className="text-slate-300 break-all">{entry.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
