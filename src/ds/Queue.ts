/**
 * ============================================================
 * QUEUE DATA STRUCTURE — Generic Implementation (FIFO)
 * ============================================================
 *
 * HOW IT'S USED IN THIS NETWORK SIMULATOR:
 *
 *   When running Breadth-First Search (BFS) or simulating
 *   a FIFO packet queue:
 *     - Nodes are ENQUEUED at the REAR of the queue in arrival order
 *     - Nodes are DEQUEUED from the FRONT of the queue (First In, First Out)
 *
 *   Why a Queue?
 *     - FIFO (First In, First Out) naturally models BFS level-by-level traversal
 *     - Guarantees nodes closest to the source are processed first
 * ============================================================
 */

export interface QueueOperation<T> {
  type: 'ENQUEUE' | 'DEQUEUE' | 'FRONT';
  value: T;
  timestamp: number;
}

export class Queue<T> {
  private items: T[] = [];
  private history: QueueOperation<T>[] = [];

  private enqueueCount = 0;
  private dequeueCount = 0;

  /** ENQUEUE — add item to the rear of the queue. */
  enqueue(item: T): void {
    this.items.push(item);
    this.enqueueCount++;
    this.history.push({ type: 'ENQUEUE', value: item, timestamp: Date.now() });
  }

  /**
   * DEQUEUE — remove and return the item from the front of the queue.
   * Returns undefined if queue is empty.
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items.shift()!;
    this.dequeueCount++;
    this.history.push({ type: 'DEQUEUE', value: item, timestamp: Date.now() });
    return item;
  }

  /** FRONT — look at the front item without removing it. */
  front(): T | undefined {
    return this.items[0];
  }

  /** True when the queue has no items. */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Number of items currently in the queue. */
  size(): number {
    return this.items.length;
  }

  /** All items from front to rear (for visualization). */
  toArray(): T[] {
    return [...this.items];
  }

  /** Full operation history for event logs. */
  getHistory(): QueueOperation<T>[] {
    return [...this.history];
  }

  getEnqueueCount(): number {
    return this.enqueueCount;
  }

  getDequeueCount(): number {
    return this.dequeueCount;
  }

  /** Clear the queue and reset counters. */
  clear(): void {
    this.items = [];
    this.history = [];
    this.enqueueCount = 0;
    this.dequeueCount = 0;
  }
}
