import { useState, useEffect } from 'react';
import { getAdminNotifications, markNotificationAsRead, deleteNotification } from '../../services/api';
import { Card, SectionLabel, Spinner, ActionBtn } from './SharedComponents';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s atrás`;
  if (s < 3600) return `${Math.floor(s / 60)}m atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)}h atrás`;
  return `${Math.floor(s / 86400)}d atrás`;
}

export default function AdminNotifications({ toast, onNotificationChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminNotifications();
      setNotifications(res.data);
      // Notificar o painel pai para actualizar o contador
      if (onNotificationChange) onNotificationChange();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      toast('Notificação marcada como lida', 'success');
      // Actualizar contador
      if (onNotificationChange) onNotificationChange();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast('Notificação removida', 'success');
      // Actualizar contador
      if (onNotificationChange) onNotificationChange();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionLabel>Notificações do Sistema</SectionLabel>
        {notifications.length > 0 && (
          <button onClick={load} style={{
            padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(139,92,246,.3)",
            background: "rgba(139,92,246,.12)", color: "#a78bfa", cursor: "pointer",
            fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          }}>Actualizar</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.3)' }}>
            Nenhuma notificação no momento.
          </div>
        </Card>
      ) : (
        notifications.map(notif => (
          <Card key={notif._id} style={{ padding: '18px 24px', opacity: notif.read ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{notif.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{notif.message}</p>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 8 }}>
                  {timeAgo(notif.createdAt)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!notif.read && (
                  <button onClick={() => handleMarkRead(notif._id)} style={{
                    padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(34,197,94,.3)",
                    background: "rgba(34,197,94,.1)", color: "#4ade80", cursor: "pointer",
                    fontSize: 11, fontWeight: 600,
                  }}>Marcar lida</button>
                )}
                <button onClick={() => handleDelete(notif._id)} style={{
                  padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(239,68,68,.3)",
                  background: "rgba(239,68,68,.1)", color: "#f87171", cursor: "pointer",
                  fontSize: 11, fontWeight: 600,
                }}>Apagar</button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}