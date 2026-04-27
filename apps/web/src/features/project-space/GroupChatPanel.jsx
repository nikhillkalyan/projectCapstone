import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, MessageSquareText, RefreshCw, Send, Users } from 'lucide-react';
import { fetchGroupMessages, sendGroupMessage } from './api';
import { fmtTime } from './shared';

function sameMinute(a, b) {
  if (!a || !b) return false;
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 60_000;
}

function ChatMessageList({ messages, loading }) {
  const listRef = useRef(null);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex min-h-[260px] items-center justify-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading group chat...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <MessageSquareText className="h-5 w-5 text-sky-300" />
        </div>
        <p className="text-sm font-bold text-text-primary">No messages yet</p>
        <p className="mt-1 max-w-sm text-xs text-text-secondary">Start the project room with a quick update, question, or task handoff.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="max-h-[420px] min-h-[260px] overflow-y-auto pr-1">
      <div className="space-y-3">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const grouped = previous?.senderUserId === message.senderUserId && sameMinute(previous.sentAt, message.sentAt);
          const mine = Boolean(message.isMine);

          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[86%] gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                {!grouped ? (
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${mine ? 'border-sky-300/25 bg-sky-500/15 text-sky-200' : 'border-white/10 bg-white/7 text-slate-200'}`}>
                    {message.senderName?.charAt(0) || '?'}
                  </div>
                ) : (
                  <div className="h-8 w-8 shrink-0" />
                )}
                <div className={`space-y-1 ${mine ? 'items-end text-right' : ''}`}>
                  {!grouped && (
                    <div className={`flex flex-wrap items-center gap-2 text-[10px] ${mine ? 'justify-end' : ''}`}>
                      <span className="font-bold uppercase tracking-[0.16em] text-text-muted">{mine ? 'You' : message.senderName}</span>
                      <span className="text-text-muted">{fmtTime(message.sentAt)}</span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${mine ? 'rounded-tr-md border border-sky-300/20 bg-sky-500/15 text-sky-50' : 'rounded-tl-md border border-white/10 bg-white/7 text-text-primary'}`}>
                    {message.messageText}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatComposer({ value, sending, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-white/10 pt-3">
      <textarea
        rows={2}
        value={value}
        onChange={event => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit(event);
          }
        }}
        placeholder="Message your group"
        className="min-h-[48px] flex-1 resize-none rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-sky-400/40"
        maxLength={4000}
      />
      <button
        type="submit"
        disabled={sending || !value.trim()}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-300 transition-all hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-45"
        title="Send message"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </button>
    </form>
  );
}

export default function GroupChatPanel({ courseId, group, compact = false, readOnly = false, onRead }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const preview = useMemo(() => group?.lastMessage?.messageText || 'No messages yet', [group?.lastMessage?.messageText]);

  const loadMessages = useCallback(async ({ silent = false } = {}) => {
    if (!group?.id) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await fetchGroupMessages(courseId, group.id);
      setMessages(data);
      if (group.unreadMessageCount > 0) {
        onRead?.({ silent: true });
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load group chat');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId, group?.id, onRead]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const timer = window.setInterval(() => loadMessages({ silent: true }), 6000);
    return () => window.clearInterval(timer);
  }, [loadMessages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const messageText = draft.trim();
    if (!messageText) return;

    setSending(true);
    setError('');
    try {
      const sent = await sendGroupMessage(courseId, group.id, { messageText });
      setMessages(current => [...current, sent]);
      setDraft('');
      onRead?.({ silent: true });
      window.setTimeout(() => loadMessages({ silent: true }), 500);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(150deg,rgba(15,23,42,0.96),rgba(4,12,24,0.94))] shadow-[0_18px_60px_rgba(2,6,23,0.22)] ${compact ? 'p-4' : 'p-5'}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-sky-300" />
            <h4 className="text-sm font-bold text-text-primary">Group Chat</h4>
            {group?.unreadMessageCount > 0 && (
              <span className="rounded-full border border-sky-400/20 bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-200">
                {group.unreadMessageCount} unread
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <Users className="h-3.5 w-3.5" />
            <span className="truncate">{group?.name} · {preview}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => loadMessages({ silent: true })}
          disabled={refreshing}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 disabled:opacity-50"
          title="Refresh chat"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-3">
        <ChatMessageList messages={messages} loading={loading} />
        {readOnly ? (
          <div className="border-t border-white/10 pt-3 text-xs font-semibold text-text-muted">
            Instructor view is read-only for group collaboration rooms.
          </div>
        ) : (
          <ChatComposer value={draft} sending={sending} onChange={setDraft} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}
