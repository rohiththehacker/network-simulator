/**
 * ============================================================
 * STACK DATA STRUCTURE — Generic Implementation
 * ============================================================
 *
 * HOW IT'S USED IN THIS NETWORK SIMULATOR:
 *
 *   When a packet is transmitted from Source → Destination,
 *   every hop (intermediate node) is PUSHED onto the stack
 *   in the order the packet visits them.
 *
 *   This lets us:
 *     1. Visualise the route as a growing stack
 *     2. "Backtrack" by popping nodes off the stack
 *     3. Know the exact path the packet took
 *
 *   Why a Stack?
 *     - LIFO (Last In, First Out) naturally models DFS traversal
 *     - If a link fails mid-route, we can POP back to the last
 *       good node and try another path (backtracking)
 *     - The TOP of the stack is always where the packet IS right now
 *
 * Example for route PC-01 → Router-A → Server:
 *
 *   PUSH PC-01    →  [PC-01]
 *   PUSH Router-A →  [PC-01, Router-A]
 *   PUSH Server   →  [PC-01, Router-A, Server]  ← packet arrives
 *   (POP phase: delivered, unwind stack)
 *   POP Server    →  [PC-01, Router-A]
 *   POP Router-A  →  [PC-01]
 *   POP PC-01     →  []
 * ============================================================
 */

export interface StackOperation<T> {
  type: 'PUSH' | 'POP' | 'PEEK';
  value: T;
  timestamp: number;
}

export class Stack<T> {
  // Internal storage — a simple array acting as a stack
  // Index 0 is the BOTTOM, last index is the TOP
  private items: T[] = [];
  private history: StackOperation<T>[] = [];

  private pushCount = 0;
  private popCount = 0;

  /** PUSH — add item to the top of the stack. O(1) amortised */
  push(item: T): void {
    this.items.push(item);
    this.pushCount++;
    this.history.push({ type: 'PUSH', value: item, timestamp: Date.now() });
  }

  /**
   * POP — remove and return the top item. O(1)
   * Returns undefined if stack is empty (never throws, safe for UI).
   */
  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items.pop()!;
    this.popCount++;
    this.history.push({ type: 'POP', value: item, timestamp: Date.now() });
    return item;
  }

  /**
   * PEEK — look at the top item WITHOUT removing it. O(1)
   * Returns undefined if stack is empty.
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /** True when the stack has no items. */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Number of items currently on the stack. */
  size(): number {
    return this.items.length;
  }

  /** All items from bottom to top (for visualization). */
  toArray(): T[] {
    return [...this.items];
  }

  /** Full push/pop history for the event log. */
  getHistory(): StackOperation<T>[] {
    return [...this.history];
  }

  getPushCount(): number {
    return this.pushCount;
  }

  getPopCount(): number {
    return this.popCount;
  }

  /** Clear the stack and reset counters. */
  clear(): void {
    this.items = [];
    this.history = [];
    this.pushCount = 0;
    this.popCount = 0;
  }
}
