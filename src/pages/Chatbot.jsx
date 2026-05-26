// src/pages/Chatbot.jsx
// POST /api/user/chat/{session_id}
// GET  /api/user/chat/{session_id}
// DELETE /api/user/chat/{session_id}
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Trash2, Bot, RefreshCw } from 'lucide-react';
import api from '../api/axios';

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}


// Renders AI markdown responses cleanly without raw ** symbols
function FormattedMessage({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else if (/^\d+\.\s/.test(line)) {
      const numMatch = line.match(/^(\d+)\.\s(.+)/);
      if (numMatch) {
        elements.push(
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <span style={{ minWidth: 20, height: 20, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              {numMatch[1]}
            </span>
            <span style={{ flex: 1 }}><InlineFormat text={numMatch[2]} /></span>
          </div>
        );
      }
    } else if (line.startsWith('- ') || line.startsWith('\u2022 ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>·</span>
          <span><InlineFormat text={line.slice(2)} /></span>
        </div>
      );
    } else {
      elements.push(<p key={i} style={{ marginBottom: 6, lineHeight: 1.6 }}><InlineFormat text={line} /></p>);
    }
    i++;
  }
  return <div style={{ fontSize: '0.875rem' }}>{elements}</div>;
}

function InlineFormat({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function Chatbot() {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('session_id');

  const [sessions, setSessions]   = useState([]);
  const [sessionId, setSessionId] = useState(preselected || '');
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [clearing, setClearing]   = useState(false);
  const [error, setError]         = useState('');
  const bottomRef = useRef(null);

  // Load open sessions
  useEffect(() => {
    api.get('/api/user/sessions?status=open').then(res => {
      const list = res.data.sessions || res.data;
      setSessions(Array.isArray(list) ? list : []);
      if (!preselected && list.length === 1) setSessionId(String(list[0].session_id));
    }).catch(() => {});
  }, []);

  // Load history when session changes
  useEffect(() => {
    if (!sessionId) { setMessages([]); return; }
    setLoading(true);
    setError('');
    api.get(`/api/user/chat/${sessionId}`)
      .then(res => {
        const msgs = res.data.messages || res.data;
        setMessages(Array.isArray(msgs) ? msgs : []);
      })
      .catch(e => {
        if (e.response?.status !== 404) setError('Failed to load chat history.');
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;

    // Optimistic user message
    const optimistic = { role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages(m => [...m, optimistic]);
    setInput('');
    setSending(true);
    setError('');

    try {
      const res = await api.post(`/api/user/chat/${sessionId}`, { message: text });
      const reply = res.data;
      // Replace optimistic + add AI reply
      const assistantMsg = {
        role: 'assistant',
        content: reply.assistant_reply || reply.response || reply.message || reply.content || '…',
        created_at: new Date().toISOString(),
      };
      setMessages(m => [...m, assistantMsg]);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to get AI response. Check that GROQ_API_KEY is set in .env');
      setMessages(m => m.filter(msg => msg !== optimistic));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearHistory = async () => {
    if (!window.confirm('Clear the entire chat history for this session?')) return;
    setClearing(true);
    try {
      await api.delete(`/api/user/chat/${sessionId}`);
      setMessages([]);
    } catch (e) {
      setError('Failed to clear history.');
    } finally {
      setClearing(false);
    }
  };

  const selectedSession = sessions.find(s => String(s.session_id) === String(sessionId));

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>AI Clinical Chatbot</h1>
            <p>Ask the AI about the patient's predictions and get evidence-based recommendations.</p>
          </div>
          {sessionId && messages.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearHistory}
              disabled={clearing}
              style={{ color: 'var(--danger)' }}
            >
              {clearing ? <span className="spinner" /> : <Trash2 size={14} />} Clear History
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ flexShrink: 0 }}>{error}</div>}

      {/* ── Session selector ─────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 12, flexShrink: 0, padding: '12px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Session:</label>
          <select
            className="form-select"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            style={{ flex: 1, maxWidth: 400 }}
          >
            <option value="">Select a session…</option>
            {sessions.map(s => (
              <option key={s.session_id} value={s.session_id}>
                #{s.session_id} — {s.patient_name}
              </option>
            ))}
          </select>
          {selectedSession && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Status: <span className={`badge badge-${selectedSession.status}`}>{selectedSession.status}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Chat area ──────────────────────────────────────────────── */}
      {!sessionId ? (
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-state">
            <Bot size={44} className="empty-state-icon" />
            <h3>Select a session to begin</h3>
            <p>The AI will have context of all predictions from that session.</p>
          </div>
        </div>
      ) : (
        <div className="chat-container" style={{ flex: 1 }}>
          {/* Messages */}
          <div className="chat-messages">
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>
                <Bot size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <div style={{ fontSize: '0.875rem' }}>
                  Start the conversation. The AI has context of all predictions in this session.
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: 6, opacity: 0.7 }}>
                  Try: "Summarise the patient's risk profile" or "What should I follow up on?"
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <div className={`chat-avatar ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                    {msg.role === 'assistant' ? <Bot size={14} /> : 'Me'}
                  </div>
                  <div>
                    <div className="chat-bubble">
                      {msg.role === 'assistant'
                        ? <FormattedMessage text={msg.content} />
                        : msg.content}
                    </div>
                    {msg.created_at && (
                      <div style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-muted)',
                        marginTop: 3,
                        textAlign: msg.role === 'user' ? 'right' : 'left',
                      }}>
                        {formatTime(msg.created_at)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="chat-message assistant">
                <div className="chat-avatar ai"><Bot size={14} /></div>
                <div className="chat-bubble" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span className="spinner" style={{ width: 12, height: 12 }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="chat-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedSession?.status === 'closed'
                ? 'Session is closed — you can still ask questions about past predictions'
                : 'Ask about the patient\'s results, risks, or next steps…'
              }
              disabled={sending}
            />
            <button
              className="btn btn-primary"
              onClick={send}
              disabled={!input.trim() || sending}
            >
              {sending ? <RefreshCw size={16} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
