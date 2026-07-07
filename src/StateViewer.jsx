function StateViewer({ snapshot }) {
  if (!snapshot) {
    return (
      <div className="state-viewer">
        <div className="debugger-panel-header">State</div>
        <div className="state-viewer-placeholder">
          Run visualizer to see state
        </div>
      </div>
    )
  }

  const { currentNode, queueState = [] } = snapshot
  const nextThreeNodes = queueState.slice(0, 3)

  return (
    <div className="state-viewer">
      <div className="debugger-panel-header">State</div>
      <div className="state-viewer-body">
        <div className="state-grid">
          <section className="state-card">
            <span className="state-label">Current Node</span>
            <span className="state-value state-value-mono">
              {currentNode
                ? `[${currentNode.row}, ${currentNode.col}]`
                : 'null'}
            </span>
          </section>

          <section className="state-card">
            <span className="state-label">Queue Length</span>
            <span className="state-value state-value-mono">
              {queueState.length}
            </span>
          </section>

          <section className="state-card state-card-wide">
            <span className="state-label">Next 3 in Queue</span>
            {nextThreeNodes.length === 0 ? (
              <span className="state-empty">(empty)</span>
            ) : (
              <ul className="queue-preview-list">
                {nextThreeNodes.map((node, index) => (
                  <li key={`${node.row}-${node.col}-${index}`}>
                    <span className="queue-node-coords">
                      [{node.row}, {node.col}]
                    </span>
                    <span className="queue-node-distance">
                      dist:{' '}
                      {node.distance === Infinity ? '∞' : node.distance}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default StateViewer
