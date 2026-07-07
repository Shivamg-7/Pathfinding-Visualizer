function CodeViewer({ activeLineNumber, codeArray = [] }) {
  return (
    <div className="code-viewer">
      <div className="code-viewer-tab-bar">
        <span className="code-viewer-tab code-viewer-tab-active">
          algorithm.js
        </span>
      </div>
      <div className="code-viewer-body">
        <pre className="code-viewer-pre">
          {codeArray.map((line, index) => (
            <div
              key={index}
              className={
                index === activeLineNumber
                  ? 'code-line code-line-active'
                  : 'code-line'
              }
            >
              <span className="code-line-gutter">
                <span className="code-line-number">{index + 1}</span>
              </span>
              <span className="code-line-text">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}

export default CodeViewer
