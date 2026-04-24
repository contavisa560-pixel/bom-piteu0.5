import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { getAdvancedStats } from '../../services/api';
import { Card, SectionLabel, Spinner, ActionBtn } from './SharedComponents';

const COLORS = ['#8b5cf6', '#f59e0b', '#22d3ee', '#4ade80', '#f87171'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d1117", border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 10, padding: "12px 16px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 8, fontWeight: 600 }}>
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

export default function AdvancedStats({ toast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdvancedStats()
      .then(res => setData(res.data))
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Crescimento de utilizadores */}
      <Card style={{ padding: '22px 24px' }}>
        <SectionLabel>Crescimento de Utilizadores (últimos 30 dias)</SectionLabel>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.userGrowth}>
            <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,.2)" tick={{ fill: "rgba(255,255,255,.3)", fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,.2)" tick={{ fill: "rgba(255,255,255,.3)", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="newUsers" stroke="#8b5cf6" name="Novos utilizadores" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="totalUsers" stroke="#f59e0b" name="Total acumulado" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribuição por plano */}
      <Card style={{ padding: '22px 24px' }}>
        <SectionLabel>Distribuição por Plano</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div>
            <h4 style={{ fontSize: 13, marginBottom: 12, color: '#e2e8f0' }}>Detalhe</h4>
            {data.planDistribution.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: COLORS[i] }}>{item.name}</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>{item.value} utilizadores</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Uso por tipo de feature */}
      <Card style={{ padding: '22px 24px' }}>
        <SectionLabel>Uso por Tipo de Funcionalidade (últimos 7 dias)</SectionLabel>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.usageByFeature}>
            <CartesianGrid stroke="rgba(255,255,255,.05)" />
            <XAxis dataKey="feature" stroke="rgba(255,255,255,.2)" tick={{ fill: "rgba(255,255,255,.3)", fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,.2)" tick={{ fill: "rgba(255,255,255,.3)", fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}