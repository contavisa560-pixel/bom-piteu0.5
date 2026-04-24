import { useEffect, useState } from 'react';
import { getHealthSummary } from '../../services/api';

const METRICS = [
  { key: "totalProfiles",      label: "Perfis",          color: "#8b5cf6", icon: "◈" },
  { key: "totalSaude",         label: "Registos Saúde",  color: "#22d3ee", icon: "♥" },
  { key: "activeAlerts",       label: "Alertas Activos", color: "#f87171", icon: "⚠" },
  { key: "usersWithAlerts",    label: "Utilizadores c/ Alertas", color: "#f59e0b", icon: "◉" },
];

export default function HealthSummary() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getHealthSummary().then(res => setData(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "'DM Sans', sans-serif" }}>
      {!data ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
          <div style={{
            width: 18, height: 18, border: "2px solid rgba(139,92,246,.15)",
            borderTopColor: "#8b5cf6", borderRadius: "50%",
            animation: "spin .65s linear infinite",
          }} />
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {METRICS.map(({ key, label, color, icon }) => (
              <div key={key} style={{
                padding: "14px 16px",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 10,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${color}50, transparent)`,
                }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: 22, fontWeight: 700, color: "#f1f5f9",
                      fontFamily: "'DM Mono', monospace", lineHeight: 1,
                    }}>
                      {data[key] ?? 0}
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: `${color}60` }}>{icon}</span>
                </div>
              </div>
            ))}
          </div>

          {data.avgVegetablesPerUser !== undefined && (
            <div style={{
              marginTop: 12, padding: "12px 16px",
              background: "rgba(34,197,94,.06)",
              border: "1px solid rgba(34,197,94,.15)",
              borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>
                Média de Vegetais / Utilizador
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Mono', monospace" }}>
                {Number(data.avgVegetablesPerUser).toFixed(1)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}