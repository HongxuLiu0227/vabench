/** TextBlock.tsx — text zone renderer (static template). */
interface Props {
  text: string;
}

export default function TextBlock({ text }: Props) {
  return (
    <div style={{ fontSize: 13, overflow: "hidden", width: "100%", height: "100%", whiteSpace: "pre-wrap" }}>
      {text}
    </div>
  );
}
