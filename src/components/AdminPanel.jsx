  import { useState, useEffect, useCallback } from "react";
  import { CSVLink } from "react-csv";
  import UsageChart from "./admin/UsageChart";
  import TopUsersTable from "./admin/TopUsersTable";
  import HealthSummary from "./admin/HealthSummary";
  import BulkNotification from "./admin/BulkNotification";
  import UserDetailModal from "./admin/UserDetailModal";
  import Subscriptions from "./admin/Subscriptions";
  import AdvancedStats from "./admin/AdvancedStats";
  import AdminNotifications from "./admin/AdminNotifications";
  import SupportChatAdmin from "./admin/SupportChatAdmin";
  import SystemSettings from "./admin/SystemSettings";
  import TeamManagement from "./admin/TeamManagement";
  import ImageCacheStats from "./admin/ImageCacheStats";
  import InternationalRecipesAdmin from "./admin/InternationalRecipesAdmin";
  import SpecialRecipesAdmin from "./admin/SpecialRecipesAdmin";
  import { ChefHat } from "lucide-react";

  const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

  function getToken() {
    return localStorage.getItem("bomPiteuToken") || sessionStorage.getItem("bomPiteuToken") || "";
  }
  function authHeaders() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
  }
  async function apiFetch(path, opts = {}) {
    const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...opts });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  }

  function initials(name = "") {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
  }
  function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  }
  function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  }

  const PALETTE = [
    ["#0f172a","#e2e8f0"], ["#1e1b4b","#a5b4fc"], ["#064e3b","#6ee7b7"],
    ["#4c1d95","#ddd6fe"], ["#7c2d12","#fed7aa"], ["#134e4a","#99f6e4"],
  ];
  function avatarColor(str = "") {
    let h = 0;
    for (const c of str) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
    return PALETTE[h];
  }

  // ── Atoms ────────────────────────────────────────────────────────────────────

  function Avatar({ name, size = 34 }) {
    const [bg, fg] = avatarColor(name);
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: bg, color: fg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.33, fontWeight: 600, flexShrink: 0,
        letterSpacing: "0.02em", fontFamily: "'DM Mono', monospace",
      }}>
        {initials(name)}
      </div>
    );
  }

  function StatusDot({ active }) {
    return (
      <span style={{
        display: "inline-block", width: 7, height: 7, borderRadius: "50%",
        background: active ? "#22c55e" : "#ef4444",
        boxShadow: active ? "0 0 0 2px rgba(34,197,94,.25)" : "none",
        flexShrink: 0,
      }} />
    );
  }

  function Badge({ type }) {
    const map = {
      admin:   { bg: "rgba(139,92,246,.15)", color: "#a78bfa", border: "rgba(139,92,246,.3)", label: "Admin" },
      premium: { bg: "rgba(245,158,11,.12)", color: "#fbbf24", border: "rgba(245,158,11,.3)", label: "Premium" },
      free:    { bg: "rgba(148,163,184,.08)", color: "#94a3b8", border: "rgba(148,163,184,.2)", label: "Free" },
      banned:  { bg: "rgba(239,68,68,.12)",  color: "#f87171", border: "rgba(239,68,68,.3)",  label: "Banido" },
    };
    const s = map[type] || map.free;
    return (
      <span style={{
        fontSize: 10, padding: "3px 9px", borderRadius: 99,
        background: s.bg, color: s.color, fontWeight: 600,
        border: `1px solid ${s.border}`, letterSpacing: "0.04em",
        textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
      }}>{s.label}</span>
    );
  }

  function Spinner({ size = 20 }) {
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

  function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
    const isErr = type === "error";
    return (
      <div style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9999,
        background: "#0f1117", border: `1px solid ${isErr ? "rgba(239,68,68,.4)" : "rgba(34,197,94,.4)"}`,
        color: isErr ? "#f87171" : "#4ade80", borderRadius: 12,
        padding: "14px 20px", fontSize: 13, fontWeight: 500,
        boxShadow: `0 0 40px ${isErr ? "rgba(239,68,68,.1)" : "rgba(34,197,94,.1)"}`,
        animation: "slideUp .2s ease", display: "flex", alignItems: "center", gap: 10,
        maxWidth: 360,
      }}>
        <span style={{ fontSize: 16 }}>{isErr ? "⚠" : "✓"}</span>
        {msg}
      </div>
    );
  }

  function Card({ children, style = {} }) {
    return (
      <div style={{
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 14, ...style,
      }}>
        {children}
      </div>
    );
  }

  function SectionLabel({ children }) {
    return (
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "rgba(255,255,255,.25)",
        padding: "0 0 10px",
      }}>{children}</div>
    );
  }

  function MetricCard({ label, value, sub, subColor = "#4ade80", accent = "#8b5cf6" }) {
    return (
      <Card style={{ padding: "20px 22px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${accent}60, transparent)`,
        }} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 10, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#f8fafc", lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{value ?? "—"}</div>
        {sub && <div style={{ fontSize: 11, color: subColor, marginTop: 8, fontWeight: 500 }}>{sub}</div>}
      </Card>
    );
  }

  function ActionBtn({ children, onClick, disabled, variant = "default", style = {} }) {
    const variants = {
      default: { bg: "rgba(139,92,246,.12)", color: "#a78bfa", border: "rgba(139,92,246,.3)" },
      danger:  { bg: "rgba(239,68,68,.1)",   color: "#f87171", border: "rgba(239,68,68,.3)" },
      success: { bg: "rgba(34,197,94,.1)",   color: "#4ade80", border: "rgba(34,197,94,.3)" },
      ghost:   { bg: "transparent",          color: "#94a3b8", border: "rgba(255,255,255,.1)" },
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

  // ── Dashboard View ─────────────────────────────────────────────────────────

  function Dashboard({ toast }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      apiFetch("/admin/metrics")
        .then(r => setData(r.data))
        .catch(e => toast(e.message, "error"))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;
    if (!data) return null;

    const { users, dailyUsage, estimatedCostUSD } = data;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* KPI Row 1 */}
        <div>
          <SectionLabel>Visão Geral</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            <MetricCard label="Total de Utilizadores" value={users.total}
              sub={`+${users.newThisWeek ?? 0} esta semana`} accent="#8b5cf6" />
            <MetricCard label="Contas Premium" value={users.premium}
              sub={users.total > 0 ? `${((users.premium / users.total) * 100).toFixed(1)}% do total` : "—"}
              subColor="#fbbf24" accent="#f59e0b" />
            <MetricCard label="Pedidos Hoje" value={dailyUsage.totalText + dailyUsage.totalImages}
              sub={`Texto ${dailyUsage.totalText} · Imagens ${dailyUsage.totalImages}`}
              accent="#22d3ee" subColor="#67e8f9" />
            <MetricCard label="Custo Estimado" value={`$${estimatedCostUSD}`}
              sub="OpenAI — hoje" subColor="#fbbf24" accent="#f59e0b" />
          </div>
        </div>

        {/* KPI Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          <MetricCard label="Activos Hoje" value={users.activeToday}
            sub={users.total > 0 ? `${Math.round((users.activeToday / users.total) * 100)}% do total` : "—"}
            accent="#10b981" subColor="#34d399" />
          <MetricCard label="Administradores" value={users.admins ?? 1}
            sub="Com acesso ao painel" subColor="#a78bfa" accent="#8b5cf6" />
          <MetricCard label="Contas Banidas" value={users.banned ?? 0}
            sub={users.banned ? "Requer atenção" : "Nenhum banimento"}
            subColor={users.banned ? "#f87171" : "rgba(255,255,255,.2)"} accent="#ef4444" />
        </div>

        {/* Usage Bars */}
        <Card style={{ padding: "22px 24px" }}>
          <SectionLabel>Utilização de IA — Hoje</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { label: "Chat & Texto", val: dailyUsage.totalText, max: Math.max(users.total * 7, 1), color: "#8b5cf6" },
              { label: "Geração de Imagem", val: dailyUsage.totalImages, max: Math.max(users.total * 2, 1), color: "#f59e0b" },
              { label: "Análise de Imagem", val: dailyUsage.totalAnalysis || 0, max: Math.max(users.total * 3, 1), color: "#22d3ee" },
            ].map(({ label, val, max, color }) => {
              const pct = Math.min(100, Math.round((val / max) * 100));
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontFamily: "'DM Mono', monospace" }}>
                      {val} <span style={{ color: "rgba(255,255,255,.25)" }}>/ {pct}%</span>
                    </span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,.05)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`, borderRadius: 99,
                      background: `linear-gradient(90deg, ${color}90, ${color})`,
                      transition: "width .8s cubic-bezier(.4,0,.2,1)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Charts */}
        <div>
          <SectionLabel>Actividade nos Últimos 7 Dias</SectionLabel>
          <Card style={{ padding: "22px 24px" }}>
            <UsageChart days={7} />
          </Card>
        </div>

        {/* Bottom Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <SectionLabel>Top Utilizadores</SectionLabel>
            <Card><TopUsersTable limit={5} /></Card>
          </div>
          <div>
            <SectionLabel>Resumo de Saúde</SectionLabel>
            <Card><HealthSummary /></Card>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <SectionLabel>Notificações em Massa</SectionLabel>
          <BulkNotification toast={toast} />
        </div>
      </div>
    );
  }

  // ── Users View ─────────────────────────────────────────────────────────────

  function Users({ toast }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [selected, setSelected] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [acting, setActing] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const load = useCallback(async (p = 1, s = search) => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ page: p, limit: 15, ...(s && { search: s }) });
        const r = await apiFetch(`/admin/users?${q}`);
        setUsers(r.data);
        setPagination(r.pagination);
        setPage(p);
      } catch (e) {
        toast(e.message, "error");
      } finally {
        setLoading(false);
      }
    }, [search]);

    useEffect(() => { load(1); }, []);

    function handleSearch(e) {
      setSearch(e.target.value);
      clearTimeout(window._st);
      window._st = setTimeout(() => load(1, e.target.value), 400);
    }

    async function banUser(id, isBanned) {
      setActing(true);
      try {
        const route = isBanned ? `/admin/users/${id}/unban` : `/admin/users/${id}/ban`;
        await apiFetch(route, { method: "POST", body: JSON.stringify({ reason: "Violação dos termos" }) });
        toast(isBanned ? "Utilizador desbanido" : "Utilizador banido", "success");
        load(page);
        setSelected(null);
      } catch (e) {
        toast(e.message, "error");
      } finally {
        setActing(false);
      }
    }

    async function makeAdmin(id) {
      setActing(true);
      try {
        await apiFetch(`/admin/users/${id}/make-admin`, { method: "POST" });
        toast("Utilizador promovido a admin!", "success");
        load(page);
        setSelected(null);
      } catch (e) {
        toast(e.message, "error");
      } finally {
        setActing(false);
      }
    }

    async function handleBulkBan() {
      if (!selectedUsers.length) return;
      if (!confirm(`Banir ${selectedUsers.length} utilizadores?`)) return;
      setActing(true);
      try {
        const res = await apiFetch("/admin/bulk-ban", {
          method: "POST",
          body: JSON.stringify({ userIds: selectedUsers, reason: "Acção em massa" }),
        });
        toast(res.message, "success");
        load(page);
        setSelectedUsers([]);
      } catch (err) {
        toast(err.message, "error");
      } finally {
        setActing(false);
      }
    }

    function badgeType(u) {
      if (u.role === "admin") return "admin";
      if (u.isBanned) return "banned";
      if (u.isPremium) return "premium";
      return "free";
    }

    const cols = "40px 1fr 1.2fr 90px 70px 100px 140px";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: "rgba(255,255,255,.25)", fontSize: 14, pointerEvents: "none",
            }}>⌕</span>
            <input value={search} onChange={handleSearch}
              placeholder="Pesquisar por nome ou email..."
              style={{
                width: "100%", background: "#0d1117",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 10, padding: "10px 14px 10px 36px",
                color: "#f8fafc", fontSize: 13, outline: "none",
                transition: "border-color .15s", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(139,92,246,.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.08)"}
            />
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.25)", whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace" }}>
            {pagination.total ?? 0} utilizadores
          </span>
          <CSVLink data={users} filename="utilizadores.csv" style={{
            padding: "9px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(255,255,255,.04)", color: "#94a3b8",
            fontSize: 12, fontWeight: 600, textDecoration: "none", letterSpacing: "0.03em",
            transition: "all .15s",
          }}>
            ↓ CSV
          </CSVLink>
          {selectedUsers.length > 0 && (
            <ActionBtn onClick={handleBulkBan} disabled={acting} variant="danger">
              Banir {selectedUsers.length} Seleccionados
            </ActionBtn>
          )}
        </div>

        {/* Table */}
        <Card>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: cols,
            padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.05)",
            fontSize: 10, color: "rgba(255,255,255,.25)", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
          }}>
            <input type="checkbox"
              onChange={e => setSelectedUsers(e.target.checked ? users.map(u => u._id) : [])}
              checked={selectedUsers.length === users.length && users.length > 0}
              style={{ accentColor: "#8b5cf6", cursor: "pointer" }}
            />
            <span>Utilizador</span>
            <span>Email</span>
            <span>Estado</span>
            <span>Pedidos</span>
            <span>Registo</span>
            <span>Ações</span>
          </div>

          {loading ? <Spinner /> : users.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 13 }}>
              Nenhum utilizador encontrado
            </div>
          ) : users.map((u, i) => (
            <div key={u._id} style={{
              display: "grid", gridTemplateColumns: cols,
              padding: "13px 20px",
              borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
              alignItems: "center",
              background: selectedUsers.includes(u._id) ? "rgba(139,92,246,.06)" : "transparent",
              transition: "background .12s",
            }}
              onMouseEnter={e => { if (!selectedUsers.includes(u._id)) e.currentTarget.style.background = "rgba(255,255,255,.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = selectedUsers.includes(u._id) ? "rgba(139,92,246,.06)" : "transparent"; }}
            >
              <input type="checkbox"
                checked={selectedUsers.includes(u._id)}
                onChange={() => setSelectedUsers(prev =>
                  prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]
                )}
                style={{ accentColor: "#8b5cf6", cursor: "pointer" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <Avatar name={u.name} size={30} />
                <span style={{
                  fontSize: 13, color: "#f1f5f9", fontWeight: 600,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{u.name}</span>
              </div>
              <span style={{
                fontSize: 12, color: "rgba(255,255,255,.4)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{u.email}</span>
              <Badge type={badgeType(u)} />
              <span style={{
                fontSize: 12, color: "rgba(255,255,255,.5)",
                fontFamily: "'DM Mono', monospace",
              }}>{u.usage?.dailyTextRequests ?? 0}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>{fmtDate(u.createdAt)}</span>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => { setSelected(u); setShowDetailModal(true); }} style={{
                  background: "none", border: "none", color: "#60a5fa",
                  cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "2px 0",
                }}>Ver</button>
                {u.role !== "admin" && <>
                  <span style={{ color: "rgba(255,255,255,.1)" }}>·</span>
                  <button onClick={() => makeAdmin(u._id)} disabled={acting} style={{
                    background: "none", border: "none", color: "#a78bfa",
                    cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "2px 0",
                  }}>Admin</button>
                  <span style={{ color: "rgba(255,255,255,.1)" }}>·</span>
                  <button onClick={() => banUser(u._id, u.isBanned)} disabled={acting} style={{
                    background: "none", border: "none",
                    color: u.isBanned ? "#4ade80" : "#f87171",
                    cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "2px 0",
                  }}>{u.isBanned ? "Desbanir" : "Banir"}</button>
                </>}
              </div>
            </div>
          ))}
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => load(p)} style={{
                width: 34, height: 34, borderRadius: 8,
                border: page === p ? "1px solid rgba(139,92,246,.5)" : "1px solid rgba(255,255,255,.08)",
                background: page === p ? "rgba(139,92,246,.15)" : "transparent",
                color: page === p ? "#a78bfa" : "rgba(255,255,255,.35)",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                fontFamily: "'DM Mono', monospace", transition: "all .15s",
              }}>{p}</button>
            ))}
          </div>
        )}

        {selected && showDetailModal && (
          <UserDetailModal userId={selected._id} onClose={() => { setSelected(null); setShowDetailModal(false); }} />
        )}
      </div>
    );
  }

  // ── Logs View ─────────────────────────────────────────────────────────────

  function Logs({ toast }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    async function load(p = 1) {
      setLoading(true);
      try {
        const r = await apiFetch(`/admin/logs?page=${p}&limit=30`);
        setLogs(r.data);
        setPagination(r.pagination);
        setPage(p);
      } catch (e) {
        toast(e.message, "error");
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => { load(); }, []);

    function dotColor(log) {
      if (log.error) return "#ef4444";
      if (log.tokensUsed > 0) return "#22c55e";
      return "#f59e0b";
    }
    function dotLabel(log) {
      if (log.error) return "Erro";
      if (log.tokensUsed > 0) return "Sucesso";
      return "Aviso";
    }

    const cols = "2fr 1.5fr 1.5fr 80px 90px";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, fontSize: 11, fontWeight: 600 }}>
            {[["#22c55e", "Sucesso"], ["#f59e0b", "Aviso"], ["#ef4444", "Erro"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.4)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}80` }} />
                {l}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.25)", fontFamily: "'DM Mono', monospace" }}>
              {pagination.total ?? 0} registos
            </span>
            <CSVLink data={logs} filename="logs.csv" style={{
              padding: "8px 14px", borderRadius: 9,
              border: "1px solid rgba(255,255,255,.1)",
              background: "rgba(255,255,255,.04)", color: "#94a3b8",
              fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>↓ CSV</CSVLink>
          </div>
        </div>

        <Card>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: cols,
            padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.05)",
            fontSize: 10, color: "rgba(255,255,255,.25)", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
          }}>
            <span>Utilizador</span><span>Ação</span><span>Rota</span><span>Tokens</span><span>Tempo</span>
          </div>

          {loading ? <Spinner /> : logs.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 13 }}>
              Sem registos
            </div>
          ) : logs.map((log, i) => (
            <div key={log._id} style={{
              display: "grid", gridTemplateColumns: cols,
              padding: "12px 20px",
              borderBottom: i < logs.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
              alignItems: "center",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: dotColor(log),
                  boxShadow: `0 0 6px ${dotColor(log)}80`,
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.userId?.name || <span style={{ color: "rgba(255,255,255,.2)" }}>—</span>}
                  </div>
                  {log.error && (
                    <div style={{
                      fontSize: 10, color: "#f87171", marginTop: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{log.error}</div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.action}</span>
              <span style={{
                fontSize: 11, color: "rgba(255,255,255,.3)",
                fontFamily: "'DM Mono', monospace",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{log.route}</span>
              <span style={{
                fontSize: 12, fontFamily: "'DM Mono', monospace",
                color: log.tokensUsed > 0 ? "#4ade80" : "rgba(255,255,255,.2)",
              }}>{log.tokensUsed}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)", fontFamily: "'DM Mono', monospace" }}>
                {timeAgo(log.createdAt)} atrás
              </span>
            </div>
          ))}
        </Card>

        {pagination.pages > 1 && (
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => load(p)} style={{
                width: 34, height: 34, borderRadius: 8,
                border: page === p ? "1px solid rgba(139,92,246,.5)" : "1px solid rgba(255,255,255,.08)",
                background: page === p ? "rgba(139,92,246,.15)" : "transparent",
                color: page === p ? "#a78bfa" : "rgba(255,255,255,.35)",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                fontFamily: "'DM Mono', monospace",
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Nav ───────────────────────────────────────────────────────────────────

  // ── SVG Nav Icons ─────────────────────────────────────────────────────────────
  const NavIcon = {
    dashboard: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>),
    users:     (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    subs:      (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>),
    stats:     (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
    notif:     (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>),
    support:   (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
    logs:      (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
    settings:  (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 16.25l-1.41 1.41M19.07 19.07l-1.41-1.41M5.34 7.75L3.93 6.34M21 12h-2M5 12H3M12 21v-2M12 5V3"/></svg>),
    team:      (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>),
      cache:     (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>),recipes: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v4l3 3"/></svg>),
      special: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><circle cx="12" cy="12" r="3"/></svg>),
  };

  // Quais roles podem ver cada aba
  const NAV_PERMISSIONS = {
    dashboard:          ["admin", "superadmin"],
    users:              ["admin", "superadmin"],
    subscriptions:      ["admin", "superadmin"],
    advancedStats:      ["admin", "superadmin"],
    adminNotifications: ["admin", "superadmin"],
    supportChat:        ["moderator", "admin", "superadmin"],
    logs:               ["superadmin"],
    systemSettings:     ["superadmin"],
    team:               ["superadmin"],
    imageCache:         ["admin", "superadmin"],
    internationalRecipes: ["admin", "superadmin"],
    specialRecipes: ["admin", "superadmin"],
  };

  const NAV = [
    { id: "dashboard",          label: "Dashboard",        icon: NavIcon.dashboard, color: "#8b5cf6" },
    { id: "users",              label: "Utilizadores",     icon: NavIcon.users,     color: "#38bdf8" },
    { id: "subscriptions",      label: "Subscrições",      icon: NavIcon.subs,      color: "#4ade80" },
    { id: "advancedStats",      label: "Estatísticas",     icon: NavIcon.stats,     color: "#22d3ee" },
    { id: "adminNotifications", label: "Notificações",     icon: NavIcon.notif,     color: "#f97316" },
    { id: "supportChat",        label: "Suporte",          icon: NavIcon.support,   color: "#10b981" },
    { id: "logs",               label: "Logs & Auditoria", icon: NavIcon.logs,      color: "#fb923c" },
    { id: "systemSettings",     label: "Configurações",    icon: NavIcon.settings,  color: "#a855f7" },
    { id: "team",               label: "Equipa",           icon: NavIcon.team,      color: "#f87171" },
    { id: "imageCache",         label: "Cache Imagens",    icon: NavIcon.cache,     color: "#06b6d4" },
    { id: "internationalRecipes", label: "Viagem Gastronómica", icon: NavIcon.recipes, color: "#f97316" },
    { id: "specialRecipes", label: "Petiscos, Doces & Drinks", icon: NavIcon.special, color: "#f97316" },
  ];

  // ── Root ──────────────────────────────────────────────────────────────────

  export default function AdminPanel() {
    const [view, setView] = useState("dashboard");
    const [toast, setToast] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [supportUnreadCount, setSupportUnreadCount] = useState(0);
    const [adminUser, setAdminUser] = useState(() =>
      JSON.parse(localStorage.getItem("bomPiteuUser") || "{}")
    );

    const userRole = adminUser?.role || "user";
    const isSuperAdmin = userRole === "superadmin";

    function showToast(msg, type = "success") {
      setToast({ msg, type, key: Date.now() });
    }

    // Fetch fresh user data
    useEffect(() => {
      apiFetch("/auth/me").then(res => {
        if (res.user) {
          setAdminUser(res.user);
          localStorage.setItem("bomPiteuUser", JSON.stringify(res.user));
          // Redirect moderators to supportChat by default
          if (res.user.role === "moderator") setView("supportChat");
        }
      }).catch(() => {});
    }, []);

    // Unread counts
    useEffect(() => {
      async function fetchCounts() {
        try {
          const res = await apiFetch("/admin/notifications");
          setUnreadCount((res.data || []).filter(n => !n.read).length);
        } catch {}
        try {
          const res = await apiFetch("/support/admin/unread-count");
          setSupportUnreadCount(res.total || 0);
        } catch {}
      }
      fetchCounts();
      const interval = setInterval(fetchCounts, 30000);
      return () => clearInterval(interval);
    }, []);

    // Filter NAV based on user role
    const visibleNav = NAV.filter(item => {
      const allowed = NAV_PERMISSIONS[item.id];
      if (!allowed) return true;
      return allowed.includes(userRole);
    });

    const views = {
      dashboard:          <Dashboard toast={showToast} />,
      users:              <Users toast={showToast} />,
      subscriptions:      <Subscriptions toast={showToast} />,
      advancedStats:      <AdvancedStats toast={showToast} />,
      adminNotifications: <AdminNotifications toast={showToast} />,
      supportChat:        <SupportChatAdmin toast={showToast} />,
      logs:               <Logs toast={showToast} />,
      systemSettings:     <SystemSettings toast={showToast} />,
      team:               <TeamManagement toast={showToast} currentUser={adminUser} />,
      imageCache:         <ImageCacheStats toast={showToast} />,
      internationalRecipes: <InternationalRecipesAdmin toast={showToast} />,
      specialRecipes: <SpecialRecipesAdmin toast={showToast} />,
    };
    const titles = {
      dashboard:          "Dashboard",
      users:              "Gestão de Utilizadores",
      subscriptions:      "Subscrições & Premium",
      advancedStats:      "Estatísticas Avançadas",
      adminNotifications: "Notificações do Sistema",
      supportChat:        "Atendimento ao Cliente",
      logs:               "Logs & Auditoria",
      systemSettings:     "Configurações do Sistema",
      team:               "Gestão de Equipa",
      imageCache:         "Cache de Imagens",
      internationalRecipes: "Gestão — Viagem Gastronómica",
      specialRecipes: "Gestão — Petiscos, Doces & Cocktails",
    };

    // Role display config
    const roleConfig = {
      superadmin: { label: "Super Admin", color: "#f87171" },
      admin:      { label: "Administrador", color: "#8b5cf6" },
      moderator:  { label: "Moderador", color: "#38bdf8" },
    };
    const currentRoleConfig = roleConfig[userRole] || roleConfig.admin;

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #070a0e; }
          input::placeholder { color: rgba(255,255,255,.2); }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 99px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
          @keyframes modalIn { from { opacity:0; transform:scale(.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        `}</style>

        <div style={{
          display: "flex", height: "100vh", background: "#070a0e",
          fontFamily: "'DM Sans', sans-serif", color: "#f8fafc",
          overflow: "hidden",
          minWidth: 0,
        }}>

          <aside style={{
  width: 220, minWidth: 220, maxWidth: 220,
  background: "#0a0d12",
  borderRight: "1px solid rgba(255,255,255,.05)",
  display: "flex", flexDirection: "column",
  overflowY: "auto",   // scroll se o conteúdo ultrapassar
  overflowX: "hidden",
  flexShrink: 0,       // não encolhe quando o ecrã é pequeno
}}>

            {/* Logo */}
            <div style={{
              padding: "22px 18px 18px",
              borderBottom: "1px solid rgba(255,255,255,.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: "#ede9fe",
                  boxShadow: "0 0 0 1px rgba(139,92,246,.3), 0 4px 16px rgba(109,40,217,.4)",
                }}> <ChefHat size={18} color="#ede9fe" /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                    Bom Piteu
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Admin Panel
                  </div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ 
  padding: "16px 10px", 
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
}}>
              <div style={{
                fontSize: 9, color: "rgba(255,255,255,.18)", letterSpacing: "0.14em",
                textTransform: "uppercase", padding: "0 10px 10px", fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
              }}>Navegação</div>

              {visibleNav.map(item => {
                const active = view === item.id;
                const showNotifBadge = item.id === "adminNotifications" && unreadCount > 0;
                const showSupportBadge = item.id === "supportChat" && supportUnreadCount > 0;
                return (
                  <button key={item.id} onClick={() => setView(item.id)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "9px 12px", borderRadius: 9, marginBottom: 2,
                    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500,
                    color: active ? item.color : "rgba(255,255,255,.4)",
                    background: active ? `${item.color}12` : "transparent",
                    border: active ? `1px solid ${item.color}25` : "1px solid transparent",
                    transition: "all .15s", textAlign: "left",
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.4)"; } }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      background: active ? `${item.color}20` : "rgba(255,255,255,.05)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: active ? item.color : "rgba(255,255,255,.25)",
                      transition: "all .15s",
                    }}>{item.icon}</div>
                    {item.label}
                    {showNotifBadge && (
                      <span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 99, background: "#f87171", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                    {showSupportBadge && (
                      <span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 99, background: "#10b981", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                        {supportUnreadCount > 99 ? "99+" : supportUnreadCount}
                      </span>
                    )}
                    {active && !showNotifBadge && !showSupportBadge && (
                      <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User card */}
            <div style={{ padding: "12px 10px 16px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10,
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.05)",
              }}>
                <Avatar name={adminUser.name || "Admin"} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {adminUser.name || "Administrador"}
                  </div>
                  <div style={{ fontSize: 10, color: currentRoleConfig.color, fontWeight: 600, letterSpacing: "0.04em" }}>
                    {currentRoleConfig.label}
                  </div>
                </div>
                <StatusDot active={true} />
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Topbar */}
            <header style={{
              height: 56, flexShrink: 0,
              borderBottom: "1px solid rgba(255,255,255,.05)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 28px",
              background: "rgba(10,13,18,.8)",
              backdropFilter: "blur(10px)",
            }}>
              <div>
                <h1 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                  {titles[view]}
                </h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 600,
                  padding: "5px 12px", borderRadius: 99,
                  background: "rgba(34,197,94,.08)",
                  border: "1px solid rgba(34,197,94,.2)",
                  color: "#4ade80",
                }}>
                  <StatusDot active={true} />
                  Sistema Online
                </div>
                <div style={{
                  fontSize: 11, color: "rgba(255,255,255,.2)",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
            </header>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
              {views[view]}
            </div>
          </main>
        </div>

        {toast && (
          <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        )}
      </>
    );
  }