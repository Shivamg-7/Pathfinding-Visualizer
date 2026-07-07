export const ASTAR_CODE = [
  'function astar(grid, startNode, finishNode) {',
  '  startNode.gScore = 0',
  '  startNode.fScore = manhattanDistance(startNode, finishNode)',
  '  openSet = [startNode]',
  '  while (openSet.length > 0) {',
  '    sortNodesByFScore(openSet)',
  '    currentNode = openSet.shift()',
  '    if (currentNode.isWall) continue',
  '    if (currentNode.isVisited) continue',
  '    currentNode.isVisited = true',
  '    if (currentNode === finishNode) break',
  '    for each neighbor of currentNode:',
  '      if tentative gScore improves neighbor:',
  '        neighbor.previousNode = currentNode',
  '        neighbor.gScore = tentativeGScore',
  '        neighbor.fScore = gScore + heuristic(neighbor, finishNode)',
  '        add neighbor to openSet if not present',
  '  }',
  '}',
]

const LINE = {
  INIT_GSCORE: 1,
  INIT_FSCORE: 2,
  INIT_OPENSET: 3,
  WHILE_CHECK: 4,
  SORT: 5,
  SHIFT: 6,
  WALL_CONTINUE: 7,
  VISITED_CONTINUE: 8,
  MARK_VISITED: 9,
  FINISH_BREAK: 10,
  NEIGHBOR_LOOP: 11,
  NEIGHBOR_CHECK: 12,
  SET_PREVIOUS: 13,
  UPDATE_GSCORE: 14,
  UPDATE_FSCORE: 15,
  ADD_TO_OPENSET: 16,
}

function manhattanDistance(nodeA, nodeB) {
  const rowDiff = Math.abs(nodeA.row - nodeB.row)
  const colDiff = Math.abs(nodeA.col - nodeB.col)
  return rowDiff + colDiff
}

function sortNodesByFScore(openSet) {
  openSet.sort((nodeA, nodeB) => nodeA.fScore - nodeB.fScore)
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = []
  const { col, row } = node

  if (row > 0) neighbors.push(grid[row - 1][col])
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col])
  if (col > 0) neighbors.push(grid[row][col - 1])
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1])

  return neighbors.filter((neighbor) => !neighbor.isVisited && !neighbor.isWall)
}

function getQueueState(openSet) {
  return openSet.map((node) => ({
    row: node.row,
    col: node.col,
    distance: node.gScore,
  }))
}

function getUpdatedDistances(grid) {
  const distances = []
  for (const row of grid) {
    for (const node of row) {
      if (!node.isWall) {
        distances.push({
          row: node.row,
          col: node.col,
          distance: node.gScore,
        })
      }
    }
  }
  return distances
}

function pushSnapshot(
  executionTimeline,
  activeLineNumber,
  currentNode,
  grid,
  openSet
) {
  executionTimeline.push({
    activeLineNumber,
    currentNode: currentNode
      ? { row: currentNode.row, col: currentNode.col }
      : null,
    updatedDistances: getUpdatedDistances(grid),
    queueState: getQueueState(openSet),
    shortestPath: [],
  })
}

function pushPathSnapshots(executionTimeline, finishNode) {
  if (executionTimeline.length === 0) return

  const lastSnapshot = executionTimeline[executionTimeline.length - 1]
  const pathNodes = getNodesInShortestPathOrder(finishNode)
  const progressivePath = []

  for (const node of pathNodes) {
    progressivePath.push({ row: node.row, col: node.col })
    executionTimeline.push({
      activeLineNumber: lastSnapshot.activeLineNumber,
      currentNode: lastSnapshot.currentNode,
      updatedDistances: lastSnapshot.updatedDistances,
      queueState: lastSnapshot.queueState,
      shortestPath: [...progressivePath],
    })
  }
}

export function astar(grid, startNode, finishNode) {
  const executionTimeline = []

  startNode.gScore = 0
  pushSnapshot(
    executionTimeline,
    LINE.INIT_GSCORE,
    startNode,
    grid,
    []
  )

  startNode.fScore = manhattanDistance(startNode, finishNode)
  const openSet = [startNode]
  pushSnapshot(
    executionTimeline,
    LINE.INIT_FSCORE,
    startNode,
    grid,
    openSet
  )

  pushSnapshot(
    executionTimeline,
    LINE.INIT_OPENSET,
    startNode,
    grid,
    openSet
  )

  while (openSet.length > 0) {
    pushSnapshot(
      executionTimeline,
      LINE.WHILE_CHECK,
      null,
      grid,
      openSet
    )

    sortNodesByFScore(openSet)
    pushSnapshot(
      executionTimeline,
      LINE.SORT,
      null,
      grid,
      openSet
    )

    const currentNode = openSet.shift()
    pushSnapshot(
      executionTimeline,
      LINE.SHIFT,
      currentNode,
      grid,
      openSet
    )

    if (currentNode.isWall) {
      pushSnapshot(
        executionTimeline,
        LINE.WALL_CONTINUE,
        currentNode,
        grid,
        openSet
      )
      continue
    }

    if (currentNode.isVisited) {
      pushSnapshot(
        executionTimeline,
        LINE.VISITED_CONTINUE,
        currentNode,
        grid,
        openSet
      )
      continue
    }

    currentNode.isVisited = true
    pushSnapshot(
      executionTimeline,
      LINE.MARK_VISITED,
      currentNode,
      grid,
      openSet
    )

    if (currentNode === finishNode) {
      pushSnapshot(
        executionTimeline,
        LINE.FINISH_BREAK,
        currentNode,
        grid,
        openSet
      )
      break
    }

    const unvisitedNeighbors = getUnvisitedNeighbors(currentNode, grid)
    for (const neighbor of unvisitedNeighbors) {
      pushSnapshot(
        executionTimeline,
        LINE.NEIGHBOR_LOOP,
        currentNode,
        grid,
        openSet
      )

      const tentativeGScore = currentNode.gScore + 1

      if (tentativeGScore < neighbor.gScore) {
        pushSnapshot(
          executionTimeline,
          LINE.NEIGHBOR_CHECK,
          neighbor,
          grid,
          openSet
        )

        neighbor.previousNode = currentNode
        pushSnapshot(
          executionTimeline,
          LINE.SET_PREVIOUS,
          neighbor,
          grid,
          openSet
        )

        neighbor.gScore = tentativeGScore
        pushSnapshot(
          executionTimeline,
          LINE.UPDATE_GSCORE,
          neighbor,
          grid,
          openSet
        )

        neighbor.fScore =
          tentativeGScore + manhattanDistance(neighbor, finishNode)
        pushSnapshot(
          executionTimeline,
          LINE.UPDATE_FSCORE,
          neighbor,
          grid,
          openSet
        )

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor)
          pushSnapshot(
            executionTimeline,
            LINE.ADD_TO_OPENSET,
            neighbor,
            grid,
            openSet
          )
        }
      }
    }
  }

  pushPathSnapshots(executionTimeline, finishNode)

  return executionTimeline
}

export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = []
  let currentNode = finishNode

  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode)
    currentNode = currentNode.previousNode
  }

  return nodesInShortestPathOrder
}
