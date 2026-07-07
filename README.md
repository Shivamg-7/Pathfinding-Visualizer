# 🗺️ Interactive Pathfinding Visualizer & Debugger

A highly interactive educational tool built to visualize complex graph algorithms. Unlike standard visualizers that simply use delayed animations, this application features a **custom state-machine architecture** that compiles an execution timeline, allowing users to step through algorithm code line-by-line just like an IDE debugger.

## ✨ Features

* **IDE-Style Debugger:** Step forward and backward through the algorithm's execution timeline.
* **Dual Algorithms:** Compare **Dijkstra's Algorithm** (uninformed search) and **A* Search** (heuristic-based search).
* **Live State Tracking:** Watch the unvisited queue, current node coordinates, and distance arrays update in real-time as the algorithm executes.
* **Auto-Play Controls:** Built-in playback loop with a custom adjustable speed slider (10ms to 500ms).
* **Responsive Split-Screen UI:** A clean, VS Code-inspired dark mode interface built with CSS Flexbox and Grid.

## 🏗️ Architecture Note

To bypass the performance bottlenecks of triggering thousands of rapid React re-renders during graph traversal, the algorithms are decoupled from the UI. 
1. The algorithm runs instantly in the background, generating an array of state snapshots (the `executionTimeline`).
2. The UI acts purely as a deterministic state machine, scrubbing back and forth through this timeline array to render the DOM efficiently.

## 🛠️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** Vanilla CSS (Flexbox, Grid, Custom Keyframes & Crossfades)
* **Logic:** Vanilla JavaScript Graph Traversal (Manhattan Distance Heuristic)
