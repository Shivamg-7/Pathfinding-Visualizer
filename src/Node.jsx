import './Node.css'

function Node({
  row,
  col,
  isStart,
  isFinish,
  isWall,
  handleMouseDown,
  handleMouseEnter,
  handleMouseUp,
}) {
  const className = [
    'node',
    isStart && 'node-start',
    isFinish && 'node-finish',
    isWall && 'node-wall',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      id={`node-${row}-${col}`}
      className={className}
      onMouseDown={() => handleMouseDown(row, col)}
      onMouseEnter={() => handleMouseEnter(row, col)}
      onMouseUp={handleMouseUp}
    />
  )
}

export default Node
