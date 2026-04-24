// src/services/notificationService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('bomPiteuToken');

const getHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export const notificationService = {
  // Buscar notificações
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
        { headers: getHeaders() }
      );
      
      if (!response.ok) throw new Error('Erro ao buscar notificações');
      return await response.json();
    } catch (error) {
      console.error('Erro no service:', error);
      return { success: false, notifications: [], unreadCount: 0 };
    }
  },
  
  // Marcar como lida
  async markAsRead(notificationId) {
    const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return response.json();
  },
  
  // Marcar todas como lidas
  async markAllAsRead() {
    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return response.json();
  },
  
  // Apagar notificação
  async deleteNotification(notificationId) {
    const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  },
  
  // Apagar todas
  async deleteAllNotifications() {
    const response = await fetch(`${API_URL}/api/notifications`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  },
  
  // Contar não lidas
  async getUnreadCount() {
    const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: getHeaders()
    });
    const data = await response.json();
    return data.count || 0;
  }
};