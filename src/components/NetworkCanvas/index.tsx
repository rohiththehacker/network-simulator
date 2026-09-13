/**
 * NetworkCanvas — The main interactive network diagram.
 *
 * Built on React Flow. Displays:
 *   - Device nodes (custom DeviceNode component)
 *   - Connection edges with latency/bandwidth labels
 *   - Active path highlight during simulation
 *   - Animated packet dot travelling along edges
 *
 * Props:
 *   nodes        - all graph nodes
 *   edges        - all graph edges
 *   activePath   - array of node IDs on the current packet's route
 *   currentHop   - which node the packet is currently at
 *   onNodeClick  - callback when user clicks a node
 */

import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node as RFNode,
  Edge as RFEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { GraphNode, Edge, DeviceStatus } from '../../ds/Graph';
import { getDeviceTypeColor, formatLatency, formatBandwidth } from '../../utils/deviceUtils';
import DeviceNode from '../DeviceNode';

interface NetworkCanvasProps {
  nodes: GraphNode[];
  edges: Edge[];
  activePath: string[];
  currentHop: string | null;
  selectedNodeId: string | null;
  onNodeClick: (id: string) => void;
}

// Register custom node types with React Flow
const nodeTypes = { device: DeviceNode };

/**
 * Convert our Graph nodes to React Flow node format.
 */
function toRFNodes(
  nodes: GraphNode[],
  activePath: string[],
  currentHop: string | null,
  selectedNodeId: string | null,
  onNodeClick: (id: string) => void,
): RFNode[] {
  return nodes.map(n => ({
    id: n.id,
    type: 'device',
    position: { x: n.x, y: n.y },
    data: {
      ...n,
      isOnPath: activePath.includes(n.id),
      isCurrentHop: n.id === currentHop,
      isSelected: n.id === selectedNodeId,
      onClick: onNodeClick,
    },
    draggable: true,
  }));
}

/**
 * Convert our Graph edges to React Flow edge format.
 * Active edges (on packet's route) get a special animated style.
 */
function toRFEdges(edges: Edge[], activePath: string[]): RFEdge[] {
  // Build a set of active edge pairs
  const activePairs = new Set<string>();
  for (let i = 0; i < activePath.length - 1; i++) {
    activePairs.add(`${activePath[i]}-${activePath[i + 1]}`);
    activePairs.add(`${activePath[i + 1]}-${activePath[i]}`);
  }

  return edges.map(e => {
    const isActive = activePairs.has(`${e.source}-${e.target}`);
    const typeColors: Record<string, string> = {
      ethernet: '#334155',
      fiber:    '#1e3a5f',
      wifi:     '#2d1b69',
      virtual:  '#1a2e1a',
    };

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'default',
      animated: isActive,
      label: isActive ? `${e.data.latency}ms` : undefined,
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' },
      labelBgStyle: { fill: '#0f1629', fillOpacity: 0.8 },
      style: {
        stroke: isActive ? '#3b82f6' : typeColors[e.data.type] ?? '#334155',
        strokeWidth: isActive ? 2.5 : 1.5,
        strokeDasharray: isActive ? '8 4' : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isActive ? '#3b82f6' : '#334155',
        width: 16,
        height: 16,
      },
      data: e.data,
    };
  });
}

// ── Packet animation overlay ──────────────────────────────────

interface PacketDotProps {
  path: string[];
  currentHop: number; // index into path
  nodePositions: Map<string, { x: number; y: number }>;
}

function PacketDot({ path, currentHop, nodePositions }: PacketDotProps) {
  if (path.length === 0 || currentHop >= path.length) return null;

  const nodeId = path[currentHop];
  const pos = nodePositions.get(nodeId);
  if (!pos) return null;

  // The canvas origin offset: nodes render at their (x,y) + 45px centre offset (node width/2)
  const cx = pos.x + 45;
  const cy = pos.y + 50;

  return (
    <div
      className="packet-dot"
      style={{ left: cx, top: cy }}
      title={`Packet @ ${nodeId}`}
    />
  );
}

// ── Main component ────────────────────────────────────────────

export default function NetworkCanvas({
  nodes,
  edges,
  activePath,
  currentHop,
  selectedNodeId,
  onNodeClick,
}: NetworkCanvasProps) {
  const rfNodes = useMemo(
    () => toRFNodes(nodes, activePath, currentHop, selectedNodeId, onNodeClick),
    [nodes, activePath, currentHop, selectedNodeId, onNodeClick],
  );
  const rfEdges = useMemo(() => toRFEdges(edges, activePath), [edges, activePath]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(rfNodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(rfEdges);

  // Sync external changes to flow
  useEffect(() => { setFlowNodes(rfNodes); }, [rfNodes, setFlowNodes]);

  // Track node positions for the packet dot overlay
  const nodePositions = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    nodes.forEach(n => m.set(n.id, { x: n.x, y: n.y }));
    return m;
  }, [nodes]);

  // Find index of currentHop in activePath
  const currentHopIndex = currentHop ? activePath.indexOf(currentHop) : -1;

  const isEmpty = nodes.length === 0;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="text-slate-600 text-sm">No devices yet — add a device to start</div>
        </div>
      )}

      {/* Packet dot overlay (positioned absolutely over the RF canvas) */}
      {activePath.length > 0 && currentHopIndex >= 0 && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <PacketDot
            path={activePath}
            currentHop={currentHopIndex}
            nodePositions={nodePositions}
          />
        </div>
      )}

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="w-full h-full"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        <Controls
          showInteractive={false}
          className="[&>button]:!bg-bg-card [&>button]:!border-border"
        />
        <MiniMap
          nodeColor={n => {
            const node = nodes.find(g => g.id === n.id);
            return node ? getDeviceTypeColor(node.type) : '#334155';
          }}
          maskColor="rgba(10,14,26,0.7)"
          style={{ background: '#0f1629', border: '1px solid #1e2d45' }}
        />
      </ReactFlow>
    </div>
  );
}
