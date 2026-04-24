import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

// URL base para HTTP (com /api) e para Socket (sem /api)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '') || 'http://localhost:5000';

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('bomPiteuToken');
  const user = JSON.parse(localStorage.getItem('bomPiteuUser') || 'null');

  const isConnected = useRef(false);

  useEffect(() => {
    if (!user || !token || isConnected.current) return;

    // ✅ Liga ao servidor raiz, não ao /api
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket conectado');
      isConnected.current = true;
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Erro no socket:', err);
      setError('Falha na conexão em tempo real');
    });

    newSocket.on('newMessage', (message) => {
      setCurrentChat(prev => {
        if (!prev) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
    });

    newSocket.on('error', (msg) => setError(msg));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      isConnected.current = false;
    };
  }, [user?.id, token]);

  const startChat = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Sem /api duplicado — API_URL já inclui /api
      const response = await fetch(`${API_URL}/api/support/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      setCurrentChat({
        chatId: data.chatId,
        messages: data.messages || [],
        status: data.status
      });

      if (socket) socket.emit('joinChat', data.chatId);
      return data;
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!currentChat || !content.trim()) return;

    const tempMessage = {
      id: Date.now(),
      sender: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setCurrentChat(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage]
    }));

    if (socket) {
      socket.emit('sendMessage', { chatId: currentChat.chatId, content });
    } else {
      try {
        // ✅ Sem /api duplicado
        const response = await fetch(`${API_URL}/support/chats/${currentChat.chatId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Erro ${response.status}: ${text.substring(0, 100)}`);
        }
      } catch (err) {
        setError('Erro ao enviar mensagem');
        console.error(err);
      }
    }
  };

  const leaveChat = () => {
    if (socket && currentChat) {
      socket.emit('leaveChat', currentChat.chatId);
    }
    setCurrentChat(null);
  };

  return (
    <ChatContext.Provider value={{ currentChat, loading, error, startChat, sendMessage, leaveChat }}>
      {children}
    </ChatContext.Provider>
  );
};