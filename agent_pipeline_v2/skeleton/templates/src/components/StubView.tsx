/** StubView.tsx — placeholder view component (stage ④ replaces these). */
import type { ViewProps } from "../lib/types";

interface StubProps extends ViewProps {
  title?: string;
  mark?: string;
}

/** A placeholder that proves layout, data flow, and interaction wiring work. */
export default function StubView({ title, mark, data, selection, onSelect }: StubProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: "1px dashed #999",
        boxSizing: "border-box",
        padding: 8,
        overflow: "hidden",
        background: selection.values.length ? "#fff8e6" : "#fff",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(["__stub__"]);
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13 }}>{title ?? "view"}</div>
      <div style={{ fontSize: 12, color: "#666" }}>mark: {mark ?? "?"}</div>
      <div style={{ fontSize: 12, color: "#666" }}>rows: {data.length}</div>
      {data.slice(0, 3).map((r, i) => (
        <div key={i} style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
          {JSON.stringify(r).slice(0, 80)}
        </div>
      ))}
    </div>
  );
}
