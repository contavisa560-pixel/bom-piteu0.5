import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function getToken() {
    return localStorage.getItem('bomPiteuToken') || sessionStorage.getItem('bomPiteuToken') || '';
}
function authHeaders() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}
async function apiFetch(path, opts = {}) {
    const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...opts });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
}
function fmtTime(d) {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(d) {
    if (!d) return '';
    const now = new Date();
    const dt = new Date(d);
    if (dt.toDateString() === now.toDateString()) return 'Hoje';
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (dt.toDateString() === yesterday.toDateString()) return 'Ontem';
    return dt.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

const PALETTE = [
    ['#0f172a', '#e2e8f0'], ['#1e1b4b', '#a5b4fc'], ['#064e3b', '#6ee7b7'],
    ['#4c1d95', '#ddd6fe'], ['#7c2d12', '#fed7aa'], ['#134e4a', '#99f6e4'],
];
function avatarColor(str = '') {
    let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
    return PALETTE[h];
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = {
    send: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" />
        </svg>
    ),
    chat: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    check: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    doubleCheck: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 3 12 8 7 3" /><polyline points="21 7 12 16 7 11" />
        </svg>
    ),
    user: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    clock: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    search: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    close: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    resolve: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
        </svg>
    ),
};

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36, online = false }) {
    const [bg, fg] = avatarColor(name || '');
    return (
        <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
                width: size, height: size, borderRadius: '50%',
                background: bg, color: fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size * 0.33, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            }}>{initials(name)}</div>
            {online && (
                <div style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 9, height: 9, borderRadius: '50%',
                    background: '#22c55e', border: '2px solid #0d1117',
                    boxShadow: '0 0 6px rgba(34,197,94,.6)',
                }} />
            )}
        </div>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        active: { color: '#4ade80', bg: 'rgba(74,222,128,.1)', border: 'rgba(74,222,128,.25)', label: 'Activo' },
        pending: { color: '#fbbf24', bg: 'rgba(251,191,36,.1)', border: 'rgba(251,191,36,.25)', label: 'Pendente' },
        resolved: { color: '#94a3b8', bg: 'rgba(148,163,184,.08)', border: 'rgba(148,163,184,.18)', label: 'Resolvido' },
        closed: { color: '#64748b', bg: 'rgba(100,116,139,.08)', border: 'rgba(100,116,139,.18)', label: 'Fechado' },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 99, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: "'DM Mono', monospace",
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        }}>{s.label}</span>
    );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 22, height: 22, border: '2px solid rgba(139,92,246,.15)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin .65s linear infinite' }} />
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: 40 }}>
            <div style={{ color: 'rgba(255,255,255,.12)', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.35)' }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>{sub}</div>}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SupportChatAdmin({ toast, onChatRead }) {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const [draft, setDraft] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const token = getToken();

    // Load chats
    const loadChats = useCallback(async () => {
        try {
            const data = await apiFetch('/support/admin/chats');
            setChats(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Load messages for a chat
    const loadMessages = useCallback(async (chatId) => {
        setLoadingMsgs(true);
        try {
            const data = await apiFetch(`/support/admin/chats/${chatId}/messages`);
            setMessages(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoadingMsgs(false);
        }
    }, [toast]);

    // Socket setup
    useEffect(() => {
        if (!token) return;
        const sock = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
        setSocket(sock);

        sock.on('connect', () => { sock.emit('admin-join'); });

        sock.on('newMessage', (data) => {
            const isCurrentChat = selectedChat && (selectedChat._id === data.chatId);
            if (isCurrentChat) {
                // Se estamos a ver este chat, adiciona mensagem e já está marcado como lido
                setMessages(prev => [...prev, data.message || data]);
            } else {
                // Se não estamos a ver, incrementa contador de não lidas
                setChats(prev => prev.map(c =>
                    c._id === data.chatId
                        ? { ...c, updatedAt: new Date().toISOString(), lastMessage: data.message?.content, unreadCount: (c.unreadCount || 0) + 1 }
                        : c
                ));
                // Notificar o painel pai para atualizar o badge
                if (onChatRead) onChatRead();
            }
            if (selectedChat && (selectedChat._id === data.chatId || selectedChat._id === data.chatId?.toString())) {
                setMessages(prev => {
                    const exists = prev.some(m => m._id === data.message?._id);
                    if (exists) return prev;
                    return [...prev, data.message || data];
                });
            }
            setChats(prev => prev.map(c =>
                c._id === data.chatId
                    ? { ...c, updatedAt: new Date().toISOString(), lastMessage: data.message?.content || data.content }
                    : c
            ));
        });

        sock.on('admin-chats-list', (updated) => {
            setChats(Array.isArray(updated) ? updated : []);
        });

        return () => sock.disconnect();
    }, [token, selectedChat?._id]);

    useEffect(() => { loadChats(); }, [loadChats]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function handleSelectChat(chat) {
        setSelectedChat(chat);
        setLoadingMsgs(true);
        try {
            // 1. Carregar mensagens
            const data = await apiFetch(`/support/admin/chats/${chat._id}/messages`);
            setMessages(Array.isArray(data) ? data : data.data || []);

            // 2. Marcar mensagens como lidas no backend
            await apiFetch(`/support/admin/chats/${chat._id}/read-all`, { method: 'PATCH' });
            if (onChatRead) onChatRead();
            // 3. Actualizar a lista de chats para remover o badge de não lidas
            setChats(prev => prev.map(c =>
                c._id === chat._id ? { ...c, unreadCount: 0 } : c
            ));
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoadingMsgs(false);
            inputRef.current?.focus();
        }
    }

    async function handleSend(e) {
        e?.preventDefault();
        if (!draft.trim() || !selectedChat) return;
        setSending(true);
        const content = draft.trim();
        setDraft('');
        try {
            if (socket?.connected) {
                socket.emit('admin-message', { chatId: selectedChat._id, content });
            } else {
                await apiFetch(`/support/admin/chats/${selectedChat._id}/messages`, {
                    method: 'POST', body: JSON.stringify({ content }),
                });
                await loadMessages(selectedChat._id);
            }
        } catch (err) {
            toast('Erro ao enviar mensagem', 'error');
            setDraft(content);
        } finally {
            setSending(false);
        }
    }

    async function handleResolve(chatId) {
        try {
            await apiFetch(`/support/admin/chats/${chatId}/resolve`, { method: 'POST' });
            toast('Conversa marcada como resolvida', 'success');
            // Atualizar estado local
            setChats(prev => prev.map(c => c._id === chatId ? { ...c, status: 'resolved' } : c));
            if (selectedChat?._id === chatId) setSelectedChat(prev => ({ ...prev, status: 'resolved' }));
            // Opcional: recarregar a lista para garantir consistência
            await loadChats();
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    }

    // Filter & search
    const filteredChats = chats.filter(c => {
        const matchFilter = filter === 'all' || c.status === filter;
        const matchSearch = !search || (c.userId?.name || '').toLowerCase().includes(search.toLowerCase()) || (c.userId?.email || '').toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const statusCounts = {
        all: chats.length,
        active: chats.filter(c => c.status === 'active').length,
        pending: chats.filter(c => c.status === 'pending').length,
        resolved: chats.filter(c => c.status === 'resolved').length,
    };

    // Group messages by date
    function groupMessages(msgs) {
        const groups = [];
        let lastDate = null;
        for (const msg of msgs) {
            const d = fmtDate(msg.timestamp || msg.createdAt);
            if (d !== lastDate) { groups.push({ type: 'date', label: d }); lastDate = d; }
            groups.push({ type: 'msg', data: msg });
        }
        return groups;
    }

    return (
        <>
            <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .msg-in { animation: fadeIn .18s ease; }
        textarea::-webkit-scrollbar { width: 3px; }
        textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }
      `}</style>

            <div style={{ display: 'flex', height: 'calc(100vh - 112px)', gap: 0, background: '#070a0e', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)', fontFamily: "'DM Sans', sans-serif" }}>

                {/* ── Sidebar ── */}
                <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', background: '#0a0d12' }}>

                    {/* Header */}
                    <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Conversas</span>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 500 }}>{chats.length}</span>
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.25)' }}>{Icon.search}</span>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar utilizador..."
                                style={{ width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 9, padding: '8px 12px 8px 32px', color: '#f8fafc', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,.45)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.07)'}
                            />
                        </div>

                        {/* Filter tabs */}
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[['all', 'Todos'], ['active', 'Activos'], ['pending', 'Pendentes'], ['resolved', 'Resolvidos']].map(([id, label]) => (
                                <button key={id} onClick={() => setFilter(id)} style={{
                                    flex: 1, padding: '5px 0', borderRadius: 7, fontSize: 9, fontWeight: 700,
                                    letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
                                    background: filter === id ? 'rgba(139,92,246,.15)' : 'rgba(255,255,255,.04)',
                                    border: filter === id ? '1px solid rgba(139,92,246,.35)' : '1px solid rgba(255,255,255,.07)',
                                    color: filter === id ? '#a78bfa' : 'rgba(255,255,255,.3)', transition: 'all .15s',
                                }}>{label}{statusCounts[id] > 0 && <span style={{ marginLeft: 3, opacity: .7 }}>({statusCounts[id]})</span>}</button>
                            ))}
                        </div>
                    </div>

                    {/* Chat list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
                        {loading ? <Spinner /> : filteredChats.length === 0 ? (
                            <EmptyState icon={Icon.chat} title="Sem conversas" sub={search ? 'Nenhum resultado para a pesquisa' : 'Não há conversas nesta categoria'} />
                        ) : filteredChats.map(chat => {
                            const active = selectedChat?._id === chat._id;
                            const userName = chat.userId?.name || 'Utilizador';
                            return (
                                <div key={chat._id} onClick={() => handleSelectChat(chat)} style={{
                                    padding: '11px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                                    background: active ? 'rgba(139,92,246,.12)' : 'transparent',
                                    border: active ? '1px solid rgba(139,92,246,.25)' : '1px solid transparent',
                                    transition: 'all .12s',
                                }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Avatar name={userName} size={34} online={chat.status === 'active'} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{userName}</span>
                                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>{fmtDate(chat.updatedAt)}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                    {chat.lastMessage || 'Sem mensagens'}
                                                </span>
                                                {chat.unreadCount > 0 && (
                                                    <span style={{
                                                        background: '#ef4444',
                                                        borderRadius: 99,
                                                        padding: '2px 6px',
                                                        fontSize: 9,
                                                        fontWeight: 700,
                                                        color: 'white',
                                                        minWidth: 18,
                                                        textAlign: 'center',
                                                    }}>
                                                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                                    </span>
                                                )}
                                                <StatusBadge status={chat.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Chat Area ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#070a0e', minWidth: 0 }}>
                    {!selectedChat ? (
                        <EmptyState
                            icon={<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                            title="Selecciona uma conversa"
                            sub="Escolhe um chat na lista para ver as mensagens e responder ao utilizador."
                        />
                    ) : (
                        <>
                            {/* Chat header */}
                            <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'rgba(10,13,18,.6)', backdropFilter: 'blur(10px)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Avatar name={selectedChat.userId?.name || 'Utilizador'} size={38} online={selectedChat.status === 'active'} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{selectedChat.userId?.name || 'Utilizador'}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span>{selectedChat.userId?.email}</span>
                                            <span style={{ color: 'rgba(255,255,255,.15)' }}>·</span>
                                            <StatusBadge status={selectedChat.status} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    {selectedChat.status !== 'resolved' && (
                                        <button onClick={() => handleResolve(selectedChat._id)} style={{
                                            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                                            borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', color: '#4ade80',
                                            transition: 'all .15s',
                                        }}>
                                            {Icon.resolve} Marcar Resolvido
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {loadingMsgs ? <Spinner /> : messages.length === 0 ? (
                                    <EmptyState icon={Icon.chat} title="Sem mensagens" sub="O utilizador ainda não enviou nenhuma mensagem nesta conversa." />
                                ) : (
                                    groupMessages(messages).map((item, i) => {
                                        if (item.type === 'date') return (
                                            <div key={`date-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 14px' }}>
                                                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
                                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>{item.label}</span>
                                                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
                                            </div>
                                        );

                                        const msg = item.data;
                                        const isAdmin = msg.sender === 'support' || msg.sender === 'admin';
                                        const [bg, fg] = avatarColor(isAdmin ? 'Admin' : (selectedChat.userId?.name || ''));

                                        return (
                                            <div key={msg._id || i} className="msg-in" style={{
                                                display: 'flex', gap: 10, marginBottom: 12,
                                                flexDirection: isAdmin ? 'row-reverse' : 'row',
                                                alignItems: 'flex-end',
                                            }}>
                                                {/* Avatar */}
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isAdmin ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : bg, color: isAdmin ? '#ede9fe' : fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>
                                                    {isAdmin ? 'A' : initials(selectedChat.userId?.name)}
                                                </div>

                                                {/* Bubble */}
                                                <div style={{ maxWidth: '62%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                                                    <div style={{
                                                        padding: '10px 14px', borderRadius: isAdmin ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                                                        background: isAdmin
                                                            ? 'linear-gradient(135deg, rgba(124,58,237,.35), rgba(109,40,217,.3))'
                                                            : 'rgba(255,255,255,.06)',
                                                        border: isAdmin ? '1px solid rgba(139,92,246,.3)' : '1px solid rgba(255,255,255,.08)',
                                                        color: '#f1f5f9', fontSize: 13, lineHeight: 1.5,
                                                        wordBreak: 'break-word',
                                                    }}>
                                                        {msg.content}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.2)', fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
                                                        <span style={{ color: 'rgba(255,255,255,.2)' }}>{Icon.clock}</span>
                                                        {fmtTime(msg.timestamp || msg.createdAt)}
                                                        {isAdmin && (
                                                            <span style={{ color: msg.read ? '#4ade80' : 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center' }}>
                                                                {Icon.doubleCheck}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input bar */}
                            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.05)', flexShrink: 0, background: 'rgba(10,13,18,.6)', backdropFilter: 'blur(10px)' }}>
                                {selectedChat.status === 'resolved' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', color: 'rgba(255,255,255,.25)', fontSize: 12, fontWeight: 500 }}>
                                        <span style={{ color: 'rgba(255,255,255,.15)' }}>{Icon.resolve}</span>
                                        Esta conversa foi marcada como resolvida
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <textarea ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown}
                                                placeholder="Escreve uma resposta... (Enter para enviar, Shift+Enter para nova linha)"
                                                rows={1} disabled={sending}
                                                style={{
                                                    width: '100%', background: '#0d1117',
                                                    border: '1px solid rgba(255,255,255,.08)',
                                                    borderRadius: 12, padding: '11px 14px', color: '#f8fafc',
                                                    fontSize: 13, outline: 'none', resize: 'none',
                                                    fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
                                                    boxSizing: 'border-box', maxHeight: 120, transition: 'border-color .15s',
                                                }}
                                                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,.45)'}
                                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                                                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                                            />
                                        </div>
                                        <button onClick={handleSend} disabled={!draft.trim() || sending} style={{
                                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                            background: draft.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,.06)',
                                            border: draft.trim() ? '1px solid rgba(139,92,246,.4)' : '1px solid rgba(255,255,255,.08)',
                                            color: draft.trim() ? '#ede9fe' : 'rgba(255,255,255,.2)',
                                            cursor: !draft.trim() || sending ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all .15s', boxShadow: draft.trim() ? '0 4px 14px rgba(109,40,217,.4)' : 'none',
                                        }}>
                                            {sending
                                                ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.2)', borderTopColor: '#ede9fe', borderRadius: '50%', animation: 'spin .65s linear infinite' }} />
                                                : Icon.send}
                                        </button>
                                    </div>
                                )}
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.15)', marginTop: 7, textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>
                                    Enter para enviar · Shift+Enter para nova linha
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}