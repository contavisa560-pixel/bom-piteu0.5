import { useState, useEffect, useCallback } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;
function getToken() {
  return localStorage.getItem("bomPiteuToken") || sessionStorage.getItem("bomPiteuToken") || "";
}
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    ...opts,
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}
const PALETTE = [
  ["#0f172a","#e2e8f0"],["#1e1b4b","#a5b4fc"],["#064e3b","#6ee7b7"],
  ["#4c1d95","#ddd6fe"],["#7c2d12","#fed7aa"],["#134e4a","#99f6e4"],
];
function avatarColor(str = "") {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES = {
  superadmin: {
    label: "Super Admin",
    color: "#f87171",
    bg: "rgba(248,113,113,.12)",
    border: "rgba(248,113,113,.3)",
    desc: "Acesso total — configurações, logs, equipa, tudo",
    level: 4,
  },
  admin: {
    label: "Admin",
    color: "#a78bfa",
    bg: "rgba(167,139,250,.12)",
    border: "rgba(167,139,250,.3)",
    desc: "Gestão de utilizadores, subscrições, estatísticas e notificações",
    level: 3,
  },
  moderator: {
    label: "Moderador",
    color: "#38bdf8",
    bg: "rgba(56,189,248,.1)",
    border: "rgba(56,189,248,.25)",
    desc: "Apenas suporte ao cliente e visualização básica",
    level: 2,
  },
  user: {
    label: "Utilizador",
    color: "#94a3b8",
    bg: "rgba(148,163,184,.08)",
    border: "rgba(148,163,184,.2)",
    desc: "Sem acesso ao painel admin",
    level: 1,
  },
};

const PERMISSION_MATRIX = [
  { label: "Dashboard & Métricas",     moderator: false, admin: true,  superadmin: true },
  { label: "Gestão de Utilizadores",   moderator: false, admin: true,  superadmin: true },
  { label: "Subscrições & Premium",    moderator: false, admin: true,  superadmin: true },
  { label: "Estatísticas Avançadas",   moderator: false, admin: true,  superadmin: true },
  { label: "Notificações em Massa",    moderator: false, admin: true,  superadmin: true },
  { label: "Suporte ao Cliente",       moderator: true,  admin: true,  superadmin: true },
  { label: "Logs & Auditoria",         moderator: false, admin: false, superadmin: true },
  { label: "Configurações do Sistema", moderator: false, admin: false, superadmin: true },
  { label: "Gestão de Equipa",         moderator: false, admin: false, superadmin: true },
  { label: "Promover a Superadmin",    moderator: false, admin: false, superadmin: true },
];

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{ width: 20, height: 20, border: "2px solid rgba(139,92,246,.15)", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin .65s linear infinite" }} />
    </div>
  );
}

function RoleBadge({ role }) {
  const r = ROLES[role] || ROLES.user;
  return (
    <span style={{
      fontSize: 10, padding: "3px 9px", borderRadius: 99, fontWeight: 700,
      letterSpacing: "0.05em", textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
      background: r.bg, color: r.color, border: `1px solid ${r.border}`,
    }}>{r.label}</span>
  );
}

// ── Role Change Modal ─────────────────────────────────────────────────────────
function RoleModal({ member, currentUserRole, onClose, onSave }) {
  const [selectedRole, setSelectedRole] = useState(member.role);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const availableRoles = Object.entries(ROLES).filter(([key]) => {
    if (key === "user") return true;
    if (key === "superadmin" && currentUserRole !== "superadmin") return false;
    return true;
  });

  async function handleSave() {
    if (selectedRole === member.role) { onClose(); return; }
    if (selectedRole === "user") { setConfirming(true); return; }
    await doSave();
  }

  async function doSave() {
    setSaving(true);
    try {
      await onSave(member._id, selectedRole);
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  const [bg, fg] = avatarColor(member.name);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, background: "#0d1117",
        border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, overflow: "hidden",
        animation: "modalIn .2s cubic-bezier(.34,1.56,.64,1)",
      }}>

        {/* Header */}
        <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
              {initials(member.name)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{member.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{member.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Confirmation state */}
        {confirming ? (
          <div style={{ padding: "24px 26px" }}>
            <div style={{ padding: "16px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>⚠ Remover da equipa?</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>
                {member.name} vai perder todo o acesso ao painel admin e voltar a ser utilizador normal. Esta acção pode ser revertida mais tarde.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)" }}>
                Cancelar
              </button>
              <button onClick={doSave} disabled={saving} style={{ flex: 1, padding: "10px 0", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171" }}>
                {saving ? "A remover..." : "Confirmar Remoção"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "22px 26px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
              Seleccionar Novo Role
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {availableRoles.map(([key, cfg]) => (
                <div key={key} onClick={() => setSelectedRole(key)} style={{
                  padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                  background: selectedRole === key ? `${cfg.bg}` : "rgba(255,255,255,.03)",
                  border: selectedRole === key ? `1px solid ${cfg.border}` : "1px solid rgba(255,255,255,.06)",
                  transition: "all .15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <RoleBadge role={key} />
                    {selectedRole === key && (
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 4 }}>{cfg.desc}</div>
                </div>
              ))}
            </div>

            <button onClick={handleSave} disabled={saving} style={{
              width: "100%", padding: "11px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              background: selectedRole !== member.role ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,.05)",
              border: "1px solid rgba(139,92,246,.4)", color: selectedRole !== member.role ? "#ede9fe" : "rgba(255,255,255,.2)",
              transition: "all .15s",
            }}>
              {saving ? "A guardar..." : selectedRole === member.role ? "Sem alterações" : "Guardar Alterações"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TeamManagement({ toast, currentUser }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showMatrix, setShowMatrix] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/team");
      setTeam(res.data || []);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleRoleChange(memberId, newRole) {
    if (newRole === "user") {
      await apiFetch(`/admin/team/${memberId}`, { method: "DELETE" });
      toast("Membro removido da equipa", "success");
    } else {
      await apiFetch(`/admin/team/${memberId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      toast("Role actualizado com sucesso", "success");
    }
    await load();
  }

  const isSuperAdmin = currentUser?.role === "superadmin";

  const grouped = {
    superadmin: team.filter(m => m.role === "superadmin"),
    admin:      team.filter(m => m.role === "admin"),
    moderator:  team.filter(m => m.role === "moderator"),
  };

  return (
    <>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { label: "Super Admins", count: grouped.superadmin.length, role: "superadmin" },
            { label: "Admins",       count: grouped.admin.length,      role: "admin" },
            { label: "Moderadores",  count: grouped.moderator.length,  role: "moderator" },
          ].map(({ label, count, role }) => {
            const r = ROLES[role];
            return (
              <div key={role} style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "18px 22px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${r.color}50, transparent)` }} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc", fontFamily: "'DM Mono', monospace" }}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            {team.length} membros na equipa
          </div>
          <button onClick={() => setShowMatrix(v => !v)} style={{
            padding: "7px 16px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: showMatrix ? "rgba(139,92,246,.15)" : "rgba(255,255,255,.04)",
            border: showMatrix ? "1px solid rgba(139,92,246,.35)" : "1px solid rgba(255,255,255,.08)",
            color: showMatrix ? "#a78bfa" : "rgba(255,255,255,.4)",
            transition: "all .15s",
          }}>
            {showMatrix ? "← Equipa" : "Ver Permissões →"}
          </button>
        </div>

        {showMatrix ? (
          /* Permission Matrix */
          <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Matriz de Permissões</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 3 }}>O que cada role pode fazer no painel</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Funcionalidade</th>
                    {["moderator","admin","superadmin"].map(r => (
                      <th key={r} style={{ padding: "12px 20px", textAlign: "center", width: 120 }}>
                        <RoleBadge role={r} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_MATRIX.map((row, i) => (
                    <tr key={row.label} style={{ borderBottom: i < PERMISSION_MATRIX.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "13px 20px", fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>{row.label}</td>
                      {["moderator","admin","superadmin"].map(r => (
                        <td key={r} style={{ padding: "13px 20px", textAlign: "center" }}>
                          {row[r] ? (
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          ) : (
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Team list grouped by role */
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {Object.entries(grouped).map(([role, members]) => {
              if (members.length === 0) return null;
              const r = ROLES[role];
              return (
                <div key={role}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: r.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{r.label}S</div>
                    <div style={{ flex: 1, height: 1, background: `${r.color}20` }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)", fontFamily: "'DM Mono', monospace" }}>{members.length}</span>
                  </div>

                  <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden" }}>
                    {members.map((member, i) => {
                      const [bg, fg] = avatarColor(member.name);
                      const isMe = member._id === currentUser?._id || member.email === currentUser?.email;
                      return (
                        <div key={member._id} style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "15px 20px",
                          borderBottom: i < members.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                          transition: "background .12s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          {/* Avatar */}
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                              {initials(member.name)}
                            </div>
                            {isMe && (
                              <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: "#22c55e", border: "2px solid #0d1117", boxShadow: "0 0 6px rgba(34,197,94,.5)" }} />
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{member.name}</span>
                              {isMe && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: "rgba(34,197,94,.1)", color: "#4ade80", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Tu</span>}
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{member.email}</div>
                          </div>

                          {/* Meta */}
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ marginBottom: 4 }}>
                              <RoleBadge role={member.role} />
                            </div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,.2)", fontFamily: "'DM Mono', monospace" }}>
                              desde {fmtDate(member.createdAt)}
                            </div>
                          </div>

                          {/* Action — só superadmin pode alterar roles, e não pode alterar o próprio */}
                          {isSuperAdmin && !isMe && (
                            <button onClick={() => setEditing(member)} style={{
                              padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                              cursor: "pointer", transition: "all .15s", flexShrink: 0,
                              background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.25)", color: "#a78bfa",
                            }}>
                              Editar Role
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {team.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,.2)", fontSize: 13 }}>
                Nenhum membro na equipa ainda
              </div>
            )}
            {loading && <Spinner />}
          </div>
        )}

        {/* Info box */}
        <div style={{ padding: "14px 18px", background: "rgba(139,92,246,.06)", border: "1px solid rgba(139,92,246,.15)", borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>Como adicionar membros à equipa</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.6 }}>
            Vai a <strong style={{ color: "rgba(255,255,255,.6)" }}>Utilizadores</strong> → encontra a pessoa → clica em <strong style={{ color: "rgba(255,255,255,.6)" }}>Admin</strong>. Para definir como Moderador ou Super Admin, usa esta página para ajustar o role depois.
          </div>
        </div>
      </div>

      {editing && (
        <RoleModal
          member={editing}
          currentUserRole={currentUser?.role}
          onClose={() => setEditing(null)}
          onSave={handleRoleChange}
        />
      )}
    </>
  );
}