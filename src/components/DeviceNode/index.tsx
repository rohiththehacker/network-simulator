/**
 * DeviceNode — Custom React Flow node component.
 *
 * Each node represents a network device on the canvas.
 * It renders:
 *   - Device type icon
 *   - Device name label
 *   - Status indicator dot
 *   - Highlight state when selected or packet is passing through
 *
 * React Flow passes data through the `data` prop.
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GraphNode } from '../../ds/Graph';
import { getDeviceIcon, getDeviceTypeColor, getStatusBgColor } from '../../utils/deviceUtils';

interface DeviceNodeData extends GraphNode {
  isOnPath: boolean;       // true while a packet is traversing through this node
  isCurrentHop: boolean;   // true for the packet's current position
  isSelected: boolean;     // true when user clicked this node
  onClick: (id: string) => void;
}

const DeviceNode = memo(function DeviceNode({ data }: NodeProps<DeviceNodeData>) {
  const Icon = getDeviceIcon(data.type);
  const color = getDeviceTypeColor(data.type);
  const isOffline = data.status === 'offline';

  // Border glow based on state
  let borderColor = '#1e2d45';
  let glowStyle = {};

  if (data.isCurrentHop) {
    borderColor = '#f59e0b';
    glowStyle = { boxShadow: '0 0 0 2px #f59e0b, 0 0 20px rgba(245,158,11,0.6)' };
  } else if (data.isOnPath) {
    borderColor = '#3b82f6';
    glowStyle = { boxShadow: '0 0 0 2px #3b82f6, 0 0 14px rgba(59,130,246,0.4)' };
  } else if (data.isSelected) {
    borderColor = '#8b5cf6';
    glowStyle = { boxShadow: '0 0 0 2px #8b5cf6, 0 0 14px rgba(139,92,246,0.3)' };
  }

  return (
    <div
      className="cursor-pointer group relative"
      onClick={() => data.onClick(data.id)}
    >
      {/* Handles (connection points) — React Flow requires these */}
      <Handle type="source" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* Node body */}
      <div
        className={`
          relative flex flex-col items-center gap-1.5 p-3 rounded-xl
          bg-bg-card border transition-all duration-300 select-none
          ${isOffline ? 'opacity-50 grayscale' : ''}
          ${data.isCurrentHop ? 'transmitting-glow' : ''}
        `}
        style={{
          borderColor,
          width: 90,
          ...glowStyle,
        }}
      >
        {/* Status dot */}
        <div
          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${getStatusBgColor(data.status)}`}
          title={data.status}
        />

        {/* Device icon */}
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon size={22} strokeWidth={1.5} />
        </div>

        {/* Label */}
        <span className="text-xs font-medium text-slate-200 text-center leading-tight max-w-[80px] truncate">
          {data.label}
        </span>

        {/* Type badge */}
        <span
          className="text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {data.type}
        </span>
      </div>

      {/* Tooltip on hover */}
      <div className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5
        bg-bg-elevated border border-border rounded-lg text-xs text-slate-300
        opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
        whitespace-nowrap z-50 shadow-card
      ">
        {data.ip && <div className="font-mono text-slate-400">{data.ip}</div>}
        <div className="capitalize text-slate-400">{data.status}</div>
      </div>
    </div>
  );
});

export default DeviceNode;
