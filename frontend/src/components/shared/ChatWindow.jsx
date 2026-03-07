import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Send, Copy, CheckCircle2, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function ChatWindow({ otherId, otherName, courseId, courseTitle }) {
  const { user } = useAuth();
  const { sendMessage, getMessages } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);

  // Auto-resize textarea
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessages(getMessages(otherId, courseId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherId, courseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = sendMessage(otherId, courseId, input.trim());
    setMessages(prev => [...prev, msg]);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto-resize logic
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const initials = otherName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex flex-col h-full bg-bg-base relative overflow-hidden">

      {/* Header Sticky */}
      <div className="flex-none px-6 py-4 border-b border-border-subtle/50 bg-bg-surface/80 backdrop-blur-md z-10 hidden md:flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-black font-syne font-bold shadow-sm">
          {initials}
        </div>
        <div>
          <h2 className="font-syne font-bold text-text-primary text-base">{otherName}</h2>
          <p className="text-text-secondary text-xs">{courseTitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(78,205,196,0.6)] animate-pulse" />
          <span className="text-xs text-text-secondary font-medium">Online</span>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth custom-scrollbar">

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <Bot className="w-16 h-16 text-text-secondary mb-4" />
            <h3 className="font-syne text-lg text-text-primary font-bold mb-1">Start a Conversation</h3>
            <p className="text-sm text-text-secondary max-w-sm">
              Ask questions, discuss course material, or get help with assignments directly from your instructor.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            {messages.map((msg, idx) => {
              const isMine = msg.fromId === user?.id;
              const prevMsg = messages[idx - 1];
              const showDate = !prevMsg || formatDate(msg.timestamp) !== formatDate(prevMsg.timestamp);

              return (
                <div key={msg.id} className="flex flex-col w-full">
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-[0.65rem] uppercase tracking-wider font-bold text-text-secondary bg-bg-surface/50 px-3 py-1 rounded-full">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex w-full group ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-3 max-w-[85%] sm:max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

                      {/* Avatar (Only for Instructor) */}
                      {!isMine && (
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-black font-syne font-bold text-xs shadow-sm mb-1 hidden sm:flex">
                          {initials}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`relative px-5 py-3.5 group-hover:shadow-md transition-shadow ${isMine
                        ? 'bg-primary-500/10 border border-primary-500/20 text-text-primary rounded-2xl rounded-br-sm'
                        : 'bg-bg-surface border border-border-subtle text-text-primary rounded-2xl rounded-bl-sm'
                        }`}>

                        <div className="text-[0.9rem] leading-relaxed whitespace-pre-wrap font-dmsans">
                          {msg.message}
                        </div>

                        <div className={`flex items-center gap-2 mt-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[0.65rem] text-text-secondary/60 font-medium select-none">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>

                        {/* Hover Action Dock (Copy) - Only for Instructor messages */}
                        {!isMine && (
                          <div className="absolute -right-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 hidden sm:flex">
                            <button
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(msg.message, msg.id); }}
                              className="p-1.5 rounded-md hover:bg-bg-surface border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all bg-bg-base shadow-sm"
                              title="Copy message"
                            >
                              {copiedId === msg.id ? <CheckCircle2 className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Sticky Input Dock */}
      <div className="flex-none p-4 sm:p-6 bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent relative z-10 w-full pt-12 mt-auto">
        <div className="max-w-3xl mx-auto w-full relative">
          <div className="relative flex items-end gap-3 bg-bg-surface/60 backdrop-blur-xl border border-border-subtle rounded-3xl p-2 pl-4 focus-within:ring-1 focus-within:ring-primary-500/50 focus-within:border-primary-500/50 transition-all shadow-lg">

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              className="flex-1 max-h-32 bg-transparent text-text-primary text-[0.95rem] placeholder-text-secondary outline-none resize-none py-3 custom-scrollbar"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all bg-primary-500 text-white shadow-md hover:shadow-primary-500/25 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed mb-0.5 mr-0.5"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <div className="text-center mt-2.5">
            <p className="text-[0.65rem] text-text-secondary/50 font-medium select-none">
              Press Enter to send, Shift + Enter for new line.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}