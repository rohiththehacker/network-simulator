# Network Simulator & Routing Algorithm Visualizer

## Overview

The **Network Simulator & Routing Algorithm Visualizer** is a modern, interactive web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **ReactFlow**. It provides an intuitive environment for designing network topologies (routers, switches, hosts, servers) and visualizing classic Graph Data Structures and Pathfinding Algorithms (**BFS with Queue FIFO** and **DFS with Stack LIFO**) in real time.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18 + TypeScript + Vite | Interactive visual interface & application logic |
| **Canvas / Graph UI**| ReactFlow + Framer Motion | Drag-and-drop network topology canvas & animated packet flows |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive modern dark-mode aesthetic & icon set |
| **Data Structures** | Custom TypeScript Classes | In-memory Graph (`Adjacency List`), Stack (`LIFO`), and Queue (`FIFO`) |
| **Production Server**| Node.js + Express (`server.js`)| Multi-route SPA static file serving for Railway cloud deployment |

---

## 🧮 Data Structures (`src/ds/`)

### 1. `Graph.ts` (Graph Adjacency List)
- **Concept**: Represents the network nodes (Devices) and edges (Network Links/Connections).
- **Structure**:
  - `nodes`: Map of Node IDs to `Device` objects (Routers, Switches, Hosts, Servers).
  - `adjacencyList`: Map of Node IDs to lists of connected neighbor edges with weights (latency/bandwidth).
- **Key Methods**:
  - `addNode(device)` / `removeNode(id)`: Dynamically modify topology.
  - `addEdge(source, target, weight)`: Connect nodes with weighted links.
  - `getNeighbors(id)`: Retrieve outgoing connections for algorithm traversal.

### 2. `Stack.ts` (LIFO Stack Data Structure)
- **Concept**: Implements a Last-In, First-Out (LIFO) stack.
- **Usage**:
  - Used internally by **DFS (Depth-First Search)** for backtracking traversal.
  - Used in **Packet Routing Tracing** to track nested hop history.
  - Powers the **Stack / Queue Visualizer** component for real-time visual inspection of call stack state (`PUSH` & `POP`) during DFS execution.

### 3. `Queue.ts` (FIFO Queue Data Structure)
- **Concept**: Implements a First-In, First-Out (FIFO) queue.
- **Usage**:
  - Used internally by **BFS (Breadth-First Search)** for level-by-level traversal.
  - Powers the **Stack / Queue Visualizer** component for real-time visual inspection of queue state (`ENQUEUE` & `DEQUEUE`) during BFS execution.

---

## 🚀 Graph Pathfinding Algorithms (`src/algorithms/`)

The application visualizes step-by-step pathfinding through step states, animating inspected nodes, active paths, and packet movement.

```
       [ Source Node ]
             │
      ┌──────┴──────┐
      ▼             ▼
  BFS (Queue)   DFS (Stack)
   FIFO Mode     LIFO Mode
```

### 1. Breadth-First Search (`src/algorithms/bfs.ts`)
- **Type**: Level-order traversal using a **Queue (FIFO: First In, First Out)**.
- **Best For**: Finding shortest paths by minimum hop count.
- **Step-by-step**:
  1. Enqueues the source node into the Queue.
  2. Visits adjacent unvisited neighbors level-by-level (FIFO order).
  3. Records visited order and path to reconstruct the route once destination is reached.
  4. Visualizer displays `ENQUEUE` (to rear) and `DEQUEUE` (from front).

### 2. Depth-First Search (`src/algorithms/dfs.ts`)
- **Type**: Backtracking exploration using an explicit **Stack (LIFO: Last In, First Out)**.
- **Best For**: Graph connectivity checks, cycle detection, and deep path exploration.
- **Step-by-step**:
  1. Pushes the source node onto the Stack.
  2. Explores deeply along each branch before backtracking (LIFO order).
  3. Displays live `Stack` contents (`PUSH` to top & `POP` from top) in the visualizer UI.

---

## 🎨 User Interface Components (`src/components/`)

| Component | Directory | Description |
| :--- | :--- | :--- |
| **NetworkCanvas** | `src/components/NetworkCanvas` | Interactive ReactFlow canvas for dragging nodes, connecting links, and selecting source/target nodes. |
| **DevicePanel** | `src/components/DevicePanel` | Palette for adding Routers, Switches, Hosts, and Servers to the canvas. |
| **ConnectionPanel** | `src/components/ConnectionPanel` | Configuration tool for adjusting link parameters (bandwidth, latency, weight). |
| **AlgorithmPanel** | `src/components/AlgorithmPanel` | Controls for choosing algorithms (BFS vs DFS), comparing execution paths, and stepping through execution. |
| **PacketPanel** | `src/components/PacketPanel` | Controls for sending simulated data packets along calculated routes. |
| **StackVisualizer** | `src/components/StackVisualizer` | Live visual indicator showing items in LIFO Stack (DFS) or FIFO Queue (BFS) during packet simulation. |
| **NetworkStats** | `src/components/NetworkStats` | Live statistics dashboard showing total nodes, edge density, packet delivery rates, and average latency. |

---

## 🛠️ Local Setup & Commands

To run and test the project locally on your machine:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle
npm run build

# 4. Test production Express server locally
npm start
```
