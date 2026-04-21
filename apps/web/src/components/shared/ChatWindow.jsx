import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Send, Copy, CheckCircle2, Bot, Loader2, Reply, Pencil, Trash2, X, CornerDownRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import api from '../../lib/api';

export default function ChatWindow({ otherId, otherName, otherAvatar, courseId, courseTitle, isRemoved }) {
  const { user } = useAuth();
  const { sendMessage, inboundMessage } = useChat();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  
  // Advanced Messaging State
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/${courseId}/${otherId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setLoading(false);
      }
    };
    if (otherId && courseId) fetchHistory();
  }, [otherId, courseId]);

  useEffect(() => {
    if (inboundMessage) {
      if (inboundMessage.courseId === courseId && 
         (inboundMessage.senderId === otherId || inboundMessage.senderId === user?.id)) {
        setMessages(prev => {
          const existingIdx = prev.findIndex(m => m.id === inboundMessage.id);
          if (existingIdx !== -1) {
            const up = [...prev];
            up[existingIdx] = inboundMessage;
            return up;
          }
          return [...prev, inboundMessage];
        });
      }
    }
  }, [inboundMessage, courseId, otherId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (editingMessage) {
      try {
        await api.put(`/messages/${editingMessage.id}`, { messageText: input.trim() });
        setEditingMessage(null);
      } catch (err) {
        console.error('Failed to edit message', err);
      }
    } else {
      sendMessage(otherId, courseId, input.trim(), replyingTo?.id || null);
      setReplyingTo(null);
    }
    
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/messages/${msgId}`);
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const initiateEdit = (msg) => {
    setEditingMessage(msg);
    setReplyingTo(null);
    setInput(msg.messageText);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const initiateReply = (msg) => {
    setReplyingTo(msg);
    setEditingMessage(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const cancelAction = () => {
    setReplyingTo(null);
    setEditingMessage(null);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
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
    <div className="relative flex h-full flex-col overflow-hidden bg-transparent">
      <div className="glass-sm z-10 hidden flex-none items-center gap-4 border-b border-border-subtle/50 px-6 py-4 md:flex">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gradient-accent font-display font-bold text-white shadow-glow">
          {otherAvatar ? <img src={otherAvatar} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-text-primary">{otherName}</h2>
          <p className="text-text-secondary text-xs">{courseTitle}</p>
        </div>
      </div>

      {isRemoved && (
          <div className="z-10 flex shrink-0 items-center justify-center border-b border-error-400/20 bg-error-500/10 px-6 py-3 text-center backdrop-blur-md">
            <p className="text-xs font-medium uppercase tracking-wide text-error-400">
               This instructor has been removed from the platform. Chat is read-only.
            </p>
          </div>
      )}

      {/* Scrollable Messages Area */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-6 scroll-smooth sm:px-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <Loader2 className="w-10 h-10 animate-spin text-text-secondary mb-4" />
            <p className="text-sm text-text-secondary">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <Bot className="w-16 h-16 text-text-secondary mb-4" />
            <h3 className="font-syne text-lg text-text-primary font-bold mb-1">Start a Conversation</h3>
            <p className="text-sm text-text-secondary max-w-sm">
              Send the first message to interact in this course.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === user?.id;
              const prevMsg = messages[idx - 1];
              const showDate = !prevMsg || formatDate(msg.sentAt) !== formatDate(prevMsg.sentAt);

              return (
                <div key={msg.id} className="flex flex-col w-full">
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-[0.65rem] uppercase tracking-wider font-bold text-text-secondary bg-bg-surface/50 px-3 py-1 rounded-full">
                        {formatDate(msg.sentAt)}
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
                      {/* Avatar */}
                      {!isMine && (
                        <div className="mb-1 hidden h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-accent font-display text-xs font-bold text-white shadow-glow sm:flex">
                          {msg.senderAvatar ? <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" /> : msg.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`group relative break-all px-5 py-3.5 ${isMine
                        ? 'rounded-lg rounded-br-sm border border-primary-400/20 bg-primary-500/12 text-text-primary shadow-glow'
                        : 'glass-sm rounded-lg rounded-bl-sm text-text-primary'
                        } ${msg.isDeleted ? 'opacity-70 bg-transparent border-transparent italic' : 'group-hover:shadow-md transition-shadow'}`}>
                        
                        {/* Render Reply Snippet inside Bubble */}
                        {msg.replyToId && !msg.isDeleted && (
                          <div className={`relative mb-2 w-fit rounded-r-md border-l-2 py-2 pl-3 pr-4 text-xs ${isMine ? 'border-primary-400/50 bg-bg-surface/50 text-text-secondary' : 'border-border-subtle bg-bg-base/50 text-text-secondary'}`}>
                            <div className="flex items-center gap-1.5 font-bold mb-0.5 max-w-full">
                               <CornerDownRight size={12}/>
                               {msg.replyToSenderName}
                            </div>
                            <div className="line-clamp-2 truncate max-w-[200px]">{msg.replyToMessageText}</div>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap text-[0.9rem] leading-relaxed">
                          {msg.isDeleted ? '*This message was deleted.*' : msg.messageText}
                        </div>
                        
                        <div className={`flex items-center gap-2 mt-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          {msg.isEdited && !msg.isDeleted && <span className="text-[0.60rem] text-text-secondary/50 font-medium">(edited)</span>}
                          <span className="text-[0.65rem] text-text-secondary/60 font-medium select-none">
                            {formatTime(msg.sentAt)}
                          </span>
                        </div>
                        
                        {/* Context Menu / Message Actions */}
                        {!msg.isDeleted && (
                          <div className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 hidden sm:flex z-10 ${isMine ? '-left-12' : '-right-12'}`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); initiateReply(msg); }}
                              className="rounded-md border border-transparent bg-bg-base p-1.5 text-text-secondary shadow-sm transition-all hover:border-border-subtle hover:bg-bg-surface hover:text-text-primary"
                              title="Reply"
                            >
                              <Reply className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(msg.messageText, msg.id); }}
                              className="rounded-md border border-transparent bg-bg-base p-1.5 text-text-secondary shadow-sm transition-all hover:border-border-subtle hover:bg-bg-surface hover:text-text-primary"
                              title="Copy text"
                            >
                              {copiedId === msg.id ? <CheckCircle2 className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {isMine && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); initiateEdit(msg); }}
                                    className="rounded-md border border-transparent bg-bg-base p-1.5 text-text-secondary shadow-sm transition-all hover:border-border-subtle hover:bg-bg-surface hover:text-text-primary"
                                    title="Edit label"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                                    className="rounded-md border border-transparent bg-bg-base p-1.5 text-text-secondary shadow-sm transition-all hover:border-error-400/30 hover:bg-error-500/10 hover:text-error-400"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                            )}
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
      <div className="relative z-10 mt-auto w-full flex-none bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent p-4 pt-12 sm:p-6">
        <div className="max-w-3xl mx-auto w-full relative">
          
          {/* Action State Banner (Edit / Reply Preview) */}
          {(replyingTo || editingMessage) && (
             <div className="glass-sm animate-in fade-in slide-in-from-bottom-2 absolute -top-12 left-0 right-0 z-20 flex items-center rounded-lg p-3 shadow-glass duration-300">
                <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                   {replyingTo ? (
                     <Reply className="text-secondary-400 w-4 h-4 shrink-0" />
                   ) : (
                     <Pencil className="h-4 w-4 shrink-0 text-accent-400" />
                   )}
                   <div className="border-l-2 border-border-subtle pl-3 min-w-0">
                      <p className="text-xs font-bold text-text-primary font-syne truncate">
                        {replyingTo ? `Replying to ${replyingTo.senderName}` : 'Editing message'}
                      </p>
                      <p className="text-xs text-text-secondary font-dmsans truncate pr-4">
                        {replyingTo ? replyingTo.messageText : editingMessage.messageText}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={cancelAction} 
                  className="p-1.5 hover:bg-bg-base rounded-lg text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-subtle shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
             </div>
          )}

          <div className="glass-input relative flex items-end gap-3 rounded-lg p-2 pl-4 transition-all focus-within:border-primary-400/50 focus-within:ring-1 focus-within:ring-primary-500/50">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={isRemoved}
              placeholder={isRemoved ? "Chat is read-only" : (editingMessage ? "Edit message..." : "Message...")}
              rows={1}
              className="custom-scrollbar max-h-32 flex-1 resize-none bg-transparent py-3 text-[0.95rem] text-text-primary outline-none placeholder:text-text-secondary disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isRemoved || !input.trim() || (editingMessage && input.trim() === editingMessage.messageText)}
              className="mb-0.5 mr-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-white shadow-glow transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
            >
              {editingMessage ? <CheckCircle2 className="w-5 h-5 ml-0.5" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </div>
          <div className="text-center mt-2.5">
            <p className="text-[0.65rem] text-text-secondary/50 font-medium select-none">
              Press Enter to {editingMessage ? 'save edit' : 'send'}, Shift + Enter for new line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
