import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function ChatWindow({ otherId, otherName, courseId, courseTitle }) {
  const { user } = useAuth();
  const { sendMessage, getMessages } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(getMessages(otherId, courseId));
  }, [otherId, courseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = sendMessage(otherId, courseId, input.trim());
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(172, 186, 196, 0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #6B7FD4, #4ECDC4)', fontFamily: 'Syne' }}>
          {otherName?.charAt(0)}
        </div>
        <div>
          <div className="font-semibold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{otherName}</div>
          <div className="text-xs" style={{ color: 'var(--steel)' }}>{courseTitle}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <MessageSquare size={40} style={{ color: 'var(--steel)' }} />
            <p className="mt-3 text-sm" style={{ color: 'var(--steel)' }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.fromId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
                {!isMine && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 self-end"
                    style={{ background: 'linear-gradient(135deg, #D4A843, #E1D9BC)', color: 'var(--navy)', fontFamily: 'Syne' }}>
                    {msg.fromName?.charAt(0)}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md px-4 py-3 ${isMine ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--cream)' }}>{msg.message}</p>
                  <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--cream)' }}>{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(172, 186, 196, 0.15)' }}>
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="input-field resize-none text-sm"
            style={{ paddingTop: '10px', paddingBottom: '10px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="btn-primary p-3 rounded-xl flex-shrink-0 disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}