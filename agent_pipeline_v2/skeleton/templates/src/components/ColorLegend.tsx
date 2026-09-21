/** ColorLegend.tsx — legend for color zones (static template). */
interface Props {
  field: string;
  label?: string;
}

/** Minimal categorical legend placeholder; stage ④ views own their scales,
 *  this renders the zone slot so the layout matches the workbook. */
export default function ColorLegend({ field, label }: Props) {
  return (
    <div style={{ fontSize: 12, overflow: "hidden", width: "100%", height: "100%" }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label ?? field}</div>
    </div>
  );
}
