/**
 * NetworkStats — Dashboard statistics cards and packet history.
 */

import { motion } from 'framer-motion';
import { Network, Zap, CheckCircle2, XCircle, TrendingUp, Cpu } from 'lucide-react';
import { AppStats, SimulationResult } from '../../types';
import { formatLatency, formatTime, getDeviceIcon } from '../../utils/deviceUtils';

interface NetworkStatsProps {
  stats: AppStats;
  packets: SimulationResult[];
}

export default function NetworkStats({ stats, packets }: NetworkStatsProps) {
  const CARDS = [
    { label: 'Devices',     value: stats.totalDevices,     icon: Cpu,          color: 'text-blue-400',   bg: 'bg-blue-500/10' },
    { label: 'Connections', value: stats.totalConnections, icon: Network,      color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
    { label: 'Packets Sent',value: stats.packetsSent,      icon: Zap,          color: 'text-amber-400',  bg: 'bg-amber-500/10' },
    { label: 'Delivered',   value: stats.packetsDelivered, icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10' },
    { label: 'Failed',      value: stats.packetsFailed,    icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10' },
    { label: 'Avg Hops',    value: stats.avgHops,          icon: TrendingUp,   color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const recentPackets = [...packets].reverse().slice(0, 20);

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {CARDS.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Packet history table */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-slate-200">Packet History</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Packet ID', 'Source', 'Destination', 'Algorithm', 'Status', 'Hops', 'Latency', 'Time'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPackets.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-600">
                    No packets yet — transmit one to see history
                  </td>
                </tr>
              )}
              {recentPackets.map(p => (
                <tr key={p.packetId} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                  <td className="px-3 py-2 font-mono text-slate-300">{p.packetId}</td>
                  <td className="px-3 py-2 text-slate-400">{p.source}</td>
                  <td className="px-3 py-2 text-slate-400">{p.destination}</td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border font-mono text-slate-400">
                      {p.algorithm}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      p.status === 'DELIVERED'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-400">{p.hops}</td>
                  <td className="px-3 py-2 font-mono text-slate-400">
                    {p.totalLatency > 0 ? formatLatency(p.totalLatency) : '—'}
                  </td>
                  <td className="px-3 py-2 text-slate-600 font-mono">{formatTime(p.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
