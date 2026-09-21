/** FilterControl.tsx — dropdown for filter zones (static template). */
import { useMemo } from "react";
import { useAllRows } from "../lib/useViewData";
import { useDashboardStore } from "../lib/store";

interface Props {
  field: string;
  label?: string;
}

export default function FilterControl({ field, label }: Props) {
  const rows = useAllRows();
  const { controlFilters, setControlFilter } = useDashboardStore();

  const options = useMemo(() => {
    const seen = new Set<string>();
    for (const r of rows) {
      const v = r[field];
      if (v !== null && v !== undefined && v !== "") seen.add(String(v));
    }
    return [...seen].sort();
  }, [rows, field]);

  const active = controlFilters.find((f) => f.field === field);
  const value = active?.values?.[0];

  return (
    <label style={{ display: "block", fontSize: 12, width: "100%", height: "100%", overflow: "hidden" }}>
      <span style={{ display: "block", fontWeight: 600, marginBottom: 2 }}>{label ?? field}</span>
      <select
        style={{ width: "100%" }}
        value={value == null ? "" : String(value)}
        onChange={(e) => setControlFilter(field, e.target.value ? [e.target.value] : [])}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
