import { useState, useEffect } from 'react'
import Node from './Node'
import CodeViewer from './CodeViewer'
import StateViewer from './StateViewer'
import { dijkstra, DIJKSTRA_CODE } from './algorithms/dijkstra'
import { astar, ASTAR_CODE } from './algorithms/astar'
import './App.css'

const ROWS = 20
const COLS = 50

const ALGORITHM_CODE = {
  dijkstra: DIJKSTRA_CODE,
  astar: ASTAR_CODE,
}

const MARK_VISITED_LINES = {
  dijkstra: 8,
  astar: 9,
}

const createGrid = (rows, cols) =>
  Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      isStart: row === 10 && col === 10,
      isFinish: row === 10 && col === 40,
      isWall: false,
    }))
  )

const getNodeClassName = (node) =>
  [
    'node',
    node.isStart && 'node-start',
    node.isFinish && 'node-finish',
    node.isWall && 'node-wall',
  ]
    .filter(Boolean)
    .join(' ')

function App() {
  const [grid, setGrid] = useState(() => createGrid(ROWS, COLS))
  const [mouseIsPressed, setMouseIsPressed] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra')
  const [timeline, setTimeline] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isDebugging, setIsDebugging] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(50)

  const toggleWall = (row, col) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.map((node) => ({ ...node })))
      newGrid[row][col].isWall = !newGrid[row][col].isWall
      return newGrid
    })
  }

  const handleMouseDown = (row, col) => {
    setMouseIsPressed(true)
    toggleWall(row, col)
  }

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return
    toggleWall(row, col)
  }

  const handleMouseUp = () => {
    setMouseIsPressed(false)
  }

  const resetNodeAlgorithmState = (node) => {
    node.distance = Infinity
    node.gScore = Infinity
    node.fScore = Infinity
    node.previousNode = null
    node.isVisited = false
  }

  const resetGridVisuals = () => {
    for (const row of grid) {
      for (const node of row) {
        resetNodeAlgorithmState(node)

        const element = document.getElementById(`node-${node.row}-${node.col}`)
        if (element) {
          element.className = getNodeClassName(node)
        }
      }
    }
  }

  const visualize = () => {
    resetGridVisuals()

    let startNode
    let finishNode
    for (const row of grid) {
      for (const node of row) {
        if (node.isStart) startNode = node
        if (node.isFinish) finishNode = node
      }
    }

    const executionTimeline =
      selectedAlgorithm === 'astar'
        ? astar(grid, startNode, finishNode)
        : dijkstra(grid, startNode, finishNode)
    setTimeline(executionTimeline)
    setCurrentStep(0)
    setIsPlaying(false)
    setIsDebugging(true)
  }

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleNextStep = () => {
    if (currentStep < timeline.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  useEffect(() => {
    if (!isPlaying || timeline.length === 0) return

    if (currentStep >= timeline.length - 1) {
      setIsPlaying(false)
      return
    }

    const timeoutId = setTimeout(() => {
      handleNextStep()
    }, playbackSpeed)

    return () => clearTimeout(timeoutId)
  }, [isPlaying, currentStep, timeline, playbackSpeed])

  useEffect(() => {
    if (!isDebugging || timeline.length === 0) return

    const snapshot = timeline[currentStep]
    if (!snapshot) return

    for (const row of grid) {
      for (const node of row) {
        const element = document.getElementById(`node-${node.row}-${node.col}`)
        if (element) {
          element.classList.remove(
            'node-visited',
            'node-current',
            'node-shortest-path'
          )
        }
      }
    }

    for (let i = 0; i <= currentStep; i++) {
      const step = timeline[i]
      if (
        step.activeLineNumber === MARK_VISITED_LINES[selectedAlgorithm] &&
        step.currentNode
      ) {
        const element = document.getElementById(
          `node-${step.currentNode.row}-${step.currentNode.col}`
        )
        if (element) {
          element.classList.add('node-visited')
        }
      }
    }

    if (snapshot.shortestPath?.length > 0) {
      for (const pathNode of snapshot.shortestPath) {
        const element = document.getElementById(
          `node-${pathNode.row}-${pathNode.col}`
        )
        if (element) {
          element.classList.add('node-shortest-path')
        }
      }
    }

    if (snapshot.currentNode) {
      const element = document.getElementById(
        `node-${snapshot.currentNode.row}-${snapshot.currentNode.col}`
      )
      if (element) {
        element.classList.add('node-current')
      }
    }
  }, [currentStep, timeline, isDebugging, grid, selectedAlgorithm])

  const clearPath = () => {
    setTimeline([])
    setCurrentStep(0)
    setIsPlaying(false)
    setIsDebugging(false)
    resetGridVisuals()
  }

  const clearBoard = () => {
    setTimeline([])
    setCurrentStep(0)
    setIsPlaying(false)
    setIsDebugging(false)

    const newGrid = createGrid(ROWS, COLS)
    setGrid(newGrid)

    for (const row of newGrid) {
      for (const node of row) {
        const element = document.getElementById(`node-${node.row}-${node.col}`)
        if (element) {
          element.className = getNodeClassName(node)
        }
      }
    }
  }

  const snapshot = timeline[currentStep]

  return (
    <div className="app-container">
      <div className="left-panel">
        <div className="controls">
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
          >
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="astar">A* Search</option>
          </select>
          <button onClick={visualize}>Visualize!</button>
          <button onClick={clearPath}>Clear Path</button>
          <button onClick={clearBoard}>Clear Board</button>
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={!isDebugging}
          >
            Prev Step
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            disabled={!isDebugging}
          >
            Next Step
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!isDebugging}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <label className="playback-speed-control">
            <div className="speed-control-group">
              <span className="playback-speed-label">Speed</span>
              <input
                type="range"
                min={10}
                max={500}
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                disabled={!isDebugging}
              />
            </div>
            <span className="playback-speed-value">{playbackSpeed}ms</span>
          </label>
        </div>
        <div className="grid-wrapper">
          <div className="grid" onMouseUp={handleMouseUp}>
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((node) => (
                  <Node
                    key={node.col}
                    {...node}
                    handleMouseDown={handleMouseDown}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseUp={handleMouseUp}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="right-panel">
        <CodeViewer
          activeLineNumber={snapshot?.activeLineNumber}
          codeArray={ALGORITHM_CODE[selectedAlgorithm]}
        />
        <StateViewer snapshot={snapshot} />
      </div>
    </div>
  )
}

export default App
