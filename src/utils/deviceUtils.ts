import {
  Monitor, Laptop, Router, Server, Shield, Cloud, GitBranch,
} from 'lucide-react';
import { DeviceType, DeviceStatus } from '../ds/Graph';

/**
 * Returns the Lucide icon component for a given device type.
 * Used by DeviceNode on the canvas and in dialogs.
 */
export function getDeviceIcon(type: DeviceType) {
  switch (type) {
    case 'computer': return Monitor;
    case 'laptop':   return Laptop;
    case 'router':   return Router;
    case 'switch':   return GitBranch;
    case 'server':   return Server;
    case 'firewall': return Shield;
    case 'cloud':    return Cloud;
    default:         return Monitor;
  }
}

/** Tailwind colour classes for status indicators. */
export function getStatusColor(status: DeviceStatus): string {
  switch (status) {
    case 'online':       return 'text-green-400';
    case 'offline':      return 'text-red-400';
    case 'transmitting': return 'text-amber-400';
    case 'error':        return 'text-red-500';
    default:             return 'text-slate-400';
  }
}

export function getStatusBgColor(status: DeviceStatus): string {
  switch (status) {
    case 'online':       return 'bg-green-500';
    case 'offline':      return 'bg-red-500';
    case 'transmitting': return 'bg-amber-500';
    case 'error':        return 'bg-red-600';
    default:             return 'bg-slate-500';
  }
}

export function getDeviceTypeColor(type: DeviceType): string {
  switch (type) {
    case 'computer': return '#3b82f6';  // blue
    case 'laptop':   return '#8b5cf6';  // purple
    case 'router':   return '#06b6d4';  // cyan
    case 'switch':   return '#10b981';  // green
    case 'server':   return '#f59e0b';  // amber
    case 'firewall': return '#ef4444';  // red
    case 'cloud':    return '#64748b';  // slate
    default:         return '#3b82f6';
  }
}

/** Generate a unique ID for a new node/edge. */
export function generateId(prefix = 'n'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Format a ms latency value */
export function formatLatency(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

/** Format bandwidth */
export function formatBandwidth(mbps: number): string {
  return mbps >= 1000 ? `${mbps / 1000}Gbps` : `${mbps}Mbps`;
}

/** Format a timestamp as HH:MM:SS */
export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-GB', { hour12: false });
}
