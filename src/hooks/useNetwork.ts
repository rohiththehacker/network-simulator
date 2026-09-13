/**
 * useNetwork — React hook that wraps the NetworkStore.
 *
 * Because the store is a plain class (not Zustand/Redux),
 * we manage re-renders manually with a counter.
 * Every mutation calls `refresh()`, which bumps the counter
 * and triggers a re-render in any component using this hook.
 */

import { useState, useCallback, useEffect } from 'react';
import { store } from '../store/NetworkStore';
import { GraphNode, Edge } from '../ds/Graph';
import { Algorithm, SimulationResult } from '../types';

export function useNetwork() {
  // A simple counter — incrementing it causes React to re-render
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  // Restore persisted state on first mount
  useEffect(() => {
    const restored = store.restore();
    if (!restored) {
      // Fresh start — demo is already loaded in constructor
    }
    refresh();
  }, [refresh]);

  // ── Node actions ────────────────────────────────────────────

  const addDevice = useCallback((node: GraphNode) => {
    store.addDevice(node);
    refresh();
  }, [refresh]);

  const updateDevice = useCallback((id: string, updates: Partial<GraphNode>) => {
    store.updateDevice(id, updates);
    refresh();
  }, [refresh]);

  const removeDevice = useCallback((id: string) => {
    store.removeDevice(id);
    refresh();
  }, [refresh]);

  const toggleDevice = useCallback((id: string) => {
    store.toggleDevice(id);
    refresh();
  }, [refresh]);

  // ── Edge actions ────────────────────────────────────────────

  const addConnection = useCallback((edge: Edge) => {
    store.addConnection(edge);
    refresh();
  }, [refresh]);

  const removeConnection = useCallback((edgeId: string) => {
    store.removeConnection(edgeId);
    refresh();
  }, [refresh]);

  // ── Simulation ───────────────────────────────────────────────

  const simulate = useCallback(
    (srcId: string, dstId: string, algorithm: Algorithm): SimulationResult => {
      const result = store.simulate(srcId, dstId, algorithm);
      refresh();
      return result;
    },
    [refresh],
  );

  // ── Persistence ──────────────────────────────────────────────

  const loadDemo = useCallback(() => {
    store.loadDemo();
    refresh();
  }, [refresh]);

  const resetNetwork = useCallback(() => {
    store.reset();
    refresh();
  }, [refresh]);

  const clearLogs = useCallback(() => {
    store.clearLogs();
    refresh();
  }, [refresh]);

  // ── Derived state ────────────────────────────────────────────

  const nodes = store.graph.getAllNodes();
  const edges = store.graph.getAllEdges();
  const logs  = store.logs;
  const packets = store.packets;
  const stats = store.getStats();

  return {
    // State
    nodes,
    edges,
    logs,
    packets,
    stats,
    graph: store.graph,

    // Actions
    addDevice,
    updateDevice,
    removeDevice,
    toggleDevice,
    addConnection,
    removeConnection,
    simulate,
    loadDemo,
    resetNetwork,
    clearLogs,
  };
}
