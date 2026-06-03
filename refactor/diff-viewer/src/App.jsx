import React, { useState } from "react";
import { DiffEditor } from "@monaco-editor/react";

function parseJSONLFile(file, onEntry, onDone, onError) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split(/\r?\n/);
    let count = 0;
    for (const line of lines) {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          onEntry(obj, count);
        } catch (err) {
          onError && onError(err, count, line);
        }
      }
      count++;
    }
    onDone && onDone();
  };
  reader.onerror = onError;
  reader.readAsText(file);
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setEntries([]);
    setSelectedIdx(null);
    setError(null);
    const temp = [];
    parseJSONLFile(
      file,
      (obj, idx) => temp.push(obj),
      () => {
        setEntries(temp);
        setLoading(false);
      },
      (err, idx, line) => {
        setError(`Error parsing line ${idx + 1}: ${err.message}`);
        setLoading(false);
      }
    );
  };

  const selected = selectedIdx !== null ? entries[selectedIdx] : null;

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1>JSONL Component Diff Viewer</h1>
      <input type="file" accept=".jsonl" onChange={handleFileChange} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: 24, gap: 24 }}>
          <div
            style={{
              minWidth: 250,
              maxHeight: 300,
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: 4,
            }}
          >
            <h3 style={{ margin: 0, padding: 8, background: "#f5f5f5" }}>
              Entries
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {entries.map((entry, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: idx === selectedIdx ? "#e6f7ff" : "transparent",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  onClick={() => setSelectedIdx(idx)}
                  title={entry.meta_data?.component_name || `Entry ${idx + 1}`}
                >
                  {entry.meta_data?.component_name || `Entry ${idx + 1}`}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selected ? (
              <>
                <h3 style={{ marginTop: 0 }}>
                  {selected.meta_data?.component_name ||
                    `Entry ${selectedIdx + 1}`}
                </h3>
                <DiffEditor
                  height="600px"
                  language="javascript"
                  original={selected.component || ""}
                  modified={selected.refactored_code || ""}
                  options={{
                    readOnly: true,
                    renderSideBySide: true,
                    minimap: { enabled: false },
                  }}
                />
              </>
            ) : (
              <p>Select an entry to view the diff.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
