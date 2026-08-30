import { ImageResponse } from "next/og";

export const alt = "Form / Function — Personal Workout Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#101712", color: "#f5f7f3", padding: "72px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: 28, fontWeight: 700 }}><div style={{ display: "flex", width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center", background: "#c9ef4b", color: "#101712" }}>F/</div>Form / Function</div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "940px" }}><div style={{ color: "#c9ef4b", fontSize: 24, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "26px" }}>Train with intent</div><div style={{ fontSize: 76, lineHeight: 1.03, letterSpacing: "-0.045em", fontWeight: 700 }}>Your workout, form guide, and next target.</div></div>
      <div style={{ display: "flex", gap: "34px", color: "#a9b4ab", fontSize: 24 }}><span>112 exercises</span><span>Weekly plan</span><span>Machine alternatives</span><span>Local tracking</span></div>
    </div>,
    size,
  );
}
