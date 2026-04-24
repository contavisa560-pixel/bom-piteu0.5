import { useEffect, useState } from 'react';
import { getTopUsers } from '../../services/api';

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
}
const PALETTE = [
  ["#0f172a","#e2e8f0"],["#1e1b4b","#a5b4fc"],["#064e3b","#6ee7b7"],
  ["#4c1d95","#ddd6fe"],["#7c2d12","#fed7aa"],["#134e4a","#99f6e4"],
];
function avatarColor(str = "") {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

function UserRow({ user, value, rank, color }) {
  const [bg, fg] = avatarColor(user.name);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
      borderBottom: "1px solid rgba(255,255,255,.04)",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <span style={{
        width: 18, fontSize: 10, color: "rgba(255,255,255,.2)",
        fontFamily: "'DM Mono', monospace", fontWeight: 600, flexShrink: 0,
      }}>#{rank}</span>
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: bg, color: fg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700, flexShrink: 0,
        fontFamily: "'DM Mono', monospace",
      }}>{initials(user.name)}</div>
      <span style={{
        flex: 1, fontSize: 12, color: "#e2e8f0", fontWeight: 500,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{user.name}</span>
      <span style={{
        fontSize: 12, fontFamily: "'DM Mono', monospace",
        fontWeight: 700, color,
      }}>{value}</span>
    </div>
  );
}

const SEGMENTS = [
  { key: "topText",   label: "Texto",   valueKey: "usage.dailyTextRequests",    color: "#a78bfa" },
  { key: "topImages", label: "Imagens", valueKey: "usage.dailyImageGenerations", color: "#fbbf24" },
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export default function TopUsersTable({ limit = 5 }) {
  const [data, setData] = useState(null);
  const [segment, setSegment] = useState("topText");

  useEffect(() => {
    getTopUsers(limit).then(res => setData(res.data)).catch(console.error);
  }, [limit]);

  const current = SEGMENTS.find(s => s.key === segment);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Tab switcher */}
      <div style={{
        display: "flex", borderBottom: "1px solid rgba(255,255,255,.06)",
        padding: "0 20px",
      }}>
        {SEGMENTS.map(s => (
          <button key={s.key} onClick={() => setSegment(s.key)} style={{
            padding: "14px 14px 12px", fontSize: 12, fontWeight: 600,
            color: segment === s.key ? s.color : "rgba(255,255,255,.3)",
            borderBottom: segment === s.key ? `2px solid ${s.color}` : "2px solid transparent",
            background: "none", border: "none",
            borderBottom: segment === s.key ? `2px solid ${s.color}` : "2px solid transparent",
            cursor: "pointer", transition: "all .15s",
            letterSpacing: "0.03em",
          }}>{s.label}</button>
        ))}
      </div>

      {/* List */}
      {!data ? (
        <div style={{ padding: "30px", textAlign: "center" }}>
          <div style={{
            width: 18, height: 18, border: "2px solid rgba(139,92,246,.15)",
            borderTopColor: "#8b5cf6", borderRadius: "50%",
            animation: "spin .65s linear infinite", margin: "0 auto",
          }} />
        </div>
      ) : (data[segment] || []).length === 0 ? (
        <div style={{ padding: "30px", textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 12 }}>
          Sem dados
        </div>
      ) : (
        (data[segment] || []).map((u, i) => (
          <UserRow
            key={u._id} user={u} rank={i + 1}
            value={getNestedValue(u, current.valueKey) ?? 0}
            color={current.color}
          />
        ))
      )}
    </div>
  );
}