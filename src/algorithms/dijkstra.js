export const DIJKSTRA_CODE = [
  'function dijkstra(grid, startNode, finishNode) {',
  '  startNode.distance = 0',
  '  unvisitedNodes = getAllNodes(grid)',
  '  while (unvisitedNodes.length > 0) {',
  '    sortNodesByDistance(unvisitedNodes)',
  '    closestNode = unvisitedNodes.shift()',
  '    if (closestNode.distance === Infinity) break',
  '    if (closestNode.isWall) continue',
  '    closestNode.isVisited = true',
  '    if (closestNode === finishNode) break',
  '    for each neighbor of closestNode:',
  '      if neighbor is unvisited and not a wall:',
  '        neighbor.distance = closestNode.distance + 1',
  '        neighbor.previousNode = closestNode',
  '  }',
  '}',
]

const LINE = {
  INIT_DISTANCE: 1,
  INIT_QUEUE: 2,
  WHILE_CHECK: 3,
  SORT: 4,
  SHIFT: 5,
  INFINITY_BREAK: 6,
  WALL_CONTINUE: 7,
  MARK_VISITED: 8,
  FINISH_BREAK: 9,
  NEIGHBOR_LOOP: 10,
  NEIGHBOR_CHECK: 11,
  UPDATE_DISTANCE: 12,
  SET_PREVIOUS: 13,
}

function getAllNodes(grid) {
  const nodes = []
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node)
    }
  }
  return nodes
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance)
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

function getQueueState(unvisitedNodes) {
  return unvisitedNodes.map((node) => ({
    row: node.row,
    col: node.col,
    distance: node.distance,
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
          distance: node.distance,
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
  unvisitedNodes
) {
  executionTimeline.push({
    activeLineNumber,
    currentNode: currentNode
      ? { row: currentNode.row, col: currentNode.col }
      : null,
    updatedDistances: getUpdatedDistances(grid),
    queueState: getQueueState(unvisitedNodes),
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

export function dijkstra(grid, startNode, finishNode) {
  const executionTimeline = []

  startNode.distance = 0
  pushSnapshot(
    executionTimeline,
    LINE.INIT_DISTANCE,
    startNode,
    grid,
    getAllNodes(grid)
  )

  const unvisitedNodes = getAllNodes(grid)
  pushSnapshot(
    executionTimeline,
    LINE.INIT_QUEUE,
    startNode,
    grid,
    unvisitedNodes
  )

  while (unvisitedNodes.length > 0) {
    pushSnapshot(
      executionTimeline,
      LINE.WHILE_CHECK,
      null,
      grid,
      unvisitedNodes
    )

    sortNodesByDistance(unvisitedNodes)
    pushSnapshot(
      executionTimeline,
      LINE.SORT,
      null,
      grid,
      unvisitedNodes
    )

    const closestNode = unvisitedNodes.shift()
    pushSnapshot(
      executionTimeline,
      LINE.SHIFT,
      closestNode,
      grid,
      unvisitedNodes
    )

    if (closestNode.distance === Infinity) {
      pushSnapshot(
        executionTimeline,
        LINE.INFINITY_BREAK,
        closestNode,
        grid,
        unvisitedNodes
      )
      break
    }

    if (closestNode.isWall) {
      pushSnapshot(
        executionTimeline,
        LINE.WALL_CONTINUE,
        closestNode,
        grid,
        unvisitedNodes
      )
      continue
    }

    closestNode.isVisited = true
    pushSnapshot(
      executionTimeline,
      LINE.MARK_VISITED,
      closestNode,
      grid,
      unvisitedNodes
    )

    if (closestNode === finishNode) {
      pushSnapshot(
        executionTimeline,
        LINE.FINISH_BREAK,
        closestNode,
        grid,
        unvisitedNodes
      )
      break
    }

    const unvisitedNeighbors = getUnvisitedNeighbors(closestNode, grid)
    for (const neighbor of unvisitedNeighbors) {
      pushSnapshot(
        executionTimeline,
        LINE.NEIGHBOR_LOOP,
        closestNode,
        grid,
        unvisitedNodes
      )

      pushSnapshot(
        executionTimeline,
        LINE.NEIGHBOR_CHECK,
        neighbor,
        grid,
        unvisitedNodes
      )

      neighbor.distance = closestNode.distance + 1
      pushSnapshot(
        executionTimeline,
        LINE.UPDATE_DISTANCE,
        neighbor,
        grid,
        unvisitedNodes
      )

      neighbor.previousNode = closestNode
      pushSnapshot(
        executionTimeline,
        LINE.SET_PREVIOUS,
        neighbor,
        grid,
        unvisitedNodes
      )
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
