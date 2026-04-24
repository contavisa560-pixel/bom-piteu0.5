import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getUsageTimeline } from '../../services/api';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d1117", border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 10, padding: "12px 16px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.05em" }}>
        {label}
      </div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", fontFamily: "'DM Mono', monospace" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function UsageChart({ days = 7 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsageTimeline(days)
      .then(res => setData(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return (
    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 20, height: 20, border: "2px solid rgba(139,92,246,.15)",
        borderTopColor: "#8b5cf6", borderRadius: "50%",
        animation: "spin .65s linear infinite",
      }} />
    </div>
  );

  if (!data.length) return (
    <div style={{
      height: 240, display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,.2)", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    }}>
      Sem dados para o período seleccionado
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,.15)"
            tick={{ fill: "rgba(255,255,255,.3)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,.15)"
            tick={{ fill: "rgba(255,255,255,.3)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,.06)", strokeWidth: 1 }} />
          <Line
            type="monotone" dataKey="totalText" name="Texto"
            stroke="#8b5cf6" strokeWidth={2} dot={false}
            activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#0d1117", strokeWidth: 2 }}
          />
          <Line
            type="monotone" dataKey="totalImages" name="Imagens"
            stroke="#f59e0b" strokeWidth={2} dot={false}
            activeDot={{ r: 4, fill: "#f59e0b", stroke: "#0d1117", strokeWidth: 2 }}
          />
          <Line
            type="monotone" dataKey="activeUsersCount" name="Utilizadores"
            stroke="#22d3ee" strokeWidth={2} dot={false}
            activeDot={{ r: 4, fill: "#22d3ee", stroke: "#0d1117", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 14 }}>
        {[["#8b5cf6","Texto"], ["#f59e0b","Imagens"], ["#22d3ee","Utilizadores"]].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>
            <div style={{ width: 20, height: 2, borderRadius: 99, background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}