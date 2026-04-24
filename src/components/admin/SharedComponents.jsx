export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: "rgba(255,255,255,.25)",
      padding: "0 0 10px",
    }}>{children}</div>
  );
}

export function Spinner({ size = 20 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div style={{
        width: size, height: size,
        border: `2px solid rgba(139,92,246,.15)`,
        borderTopColor: "#8b5cf6", borderRadius: "50%",
        animation: "spin .65s linear infinite",
      }} />
    </div>
  );
}

export function ActionBtn({ children, onClick, disabled, variant = "default", style = {} }) {
  const variants = {
    default: { bg: "rgba(139,92,246,.12)", color: "#a78bfa", border: "rgba(139,92,246,.3)" },
    danger:  { bg: "rgba(239,68,68,.1)",   color: "#f87171", border: "rgba(239,68,68,.3)" },
    success: { bg: "rgba(34,197,94,.1)",   color: "#4ade80", border: "rgba(34,197,94,.3)" },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "7px 14px", borderRadius: 8, border: `1px solid ${v.border}`,
      background: v.bg, color: v.color, cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 12, fontWeight: 600, letterSpacing: "0.03em",
      opacity: disabled ? 0.5 : 1, transition: "all .15s",
      fontFamily: "'DM Sans', sans-serif", ...style,
    }}>{children}</button>
  );
}