import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

const TEAM_ROLES = ["moderator", "admin", "superadmin"];

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(null); // null = loading, false = sem acesso, objeto = user

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem("bomPiteuToken");
      if (!token) { setAccess(false); setLoading(false); return; }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        if (response.ok && TEAM_ROLES.includes(data.user?.role)) {
          localStorage.setItem("bomPiteuUser", JSON.stringify(data.user));
          setAccess(data.user);
        } else {
          setAccess(false);
        }
      } catch (err) {
        console.error("Erro ao verificar acesso:", err);
        setAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#070a0e",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 28, height: 28, border: "2px solid rgba(139,92,246,.2)",
            borderTopColor: "#8b5cf6", borderRadius: "50%",
            animation: "spin .7s linear infinite", margin: "0 auto 16px",
          }} />
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>A verificar acesso...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!access) return <Navigate to="/" />;

  return children;
}