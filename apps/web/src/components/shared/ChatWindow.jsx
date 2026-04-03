import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Send, Copy, CheckCircle2, Bot, Loader2, Reply, Pencil, Trash2, X, CornerDownRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import api from '../../lib/api';

export default function ChatWindow({ otherId, otherName, otherAvatar, courseId, courseTitle }) {
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
    <div className="flex flex-col h-full bg-bg-base relative overflow-hidden">
      {/* Header Sticky */}
      <div className="flex-none px-6 py-4 border-b border-border-subtle/50 bg-bg-surface/80 backdrop-blur-md z-10 hidden md:flex items-center gap-4">
        <div className="w-10 h-10 rounded-[1.2rem] bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-black font-syne font-bold shadow-sm overflow-hidden">
          {otherAvatar ? <img src={otherAvatar} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div>
          <h2 className="font-syne font-bold text-text-primary text-base">{otherName}</h2>
          <p className="text-text-secondary text-xs">{courseTitle}</p>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth custom-scrollbar">
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
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-black font-syne font-bold text-xs shadow-sm mb-1 hidden sm:flex overflow-hidden">
                          {msg.senderAvatar ? <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" /> : msg.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`relative px-5 py-3.5 group break-all ${isMine
                        ? 'bg-primary-500/10 border border-primary-500/20 text-text-primary rounded-2xl rounded-br-sm'
                        : 'bg-bg-surface border border-border-subtle text-text-primary rounded-2xl rounded-bl-sm'
                        } ${msg.isDeleted ? 'opacity-70 bg-transparent border-transparent italic' : 'group-hover:shadow-md transition-shadow'}`}>
                        
                        {/* Render Reply Snippet inside Bubble */}
                        {msg.replyToId && !msg.isDeleted && (
                          <div className={`mb-2 pr-4 pl-3 py-2 border-l-2 rounded-r-md text-xs relative ${isMine ? 'bg-bg-surface/50 border-primary-500/50 text-text-secondary w-fit' : 'bg-bg-base/50 border-border-subtle text-text-secondary w-fit'}`}>
                            <div className="flex items-center gap-1.5 font-bold mb-0.5 max-w-full">
                               <CornerDownRight size={12}/>
                               {msg.replyToSenderName}
                            </div>
                            <div className="line-clamp-2 truncate max-w-[200px]">{msg.replyToMessageText}</div>
                          </div>
                        )}

                        <div className="text-[0.9rem] leading-relaxed whitespace-pre-wrap font-dmsans">
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
                              className="p-1.5 rounded-md hover:bg-bg-surface border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all bg-bg-base shadow-sm"
                              title="Reply"
                            >
                              <Reply className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(msg.messageText, msg.id); }}
                              className="p-1.5 rounded-md hover:bg-bg-surface border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all bg-bg-base shadow-sm"
                              title="Copy text"
                            >
                              {copiedId === msg.id ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {isMine && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); initiateEdit(msg); }}
                                    className="p-1.5 rounded-md hover:bg-bg-surface border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all bg-bg-base shadow-sm"
                                    title="Edit label"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                                    className="p-1.5 rounded-md hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-text-secondary hover:text-red-400 transition-all bg-bg-base shadow-sm"
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
      <div className="flex-none p-4 sm:p-6 bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent relative z-10 w-full pt-12 mt-auto">
        <div className="max-w-3xl mx-auto w-full relative">
          
          {/* Action State Banner (Edit / Reply Preview) */}
          {(replyingTo || editingMessage) && (
             <div className="absolute -top-12 left-0 right-0 bg-bg-surface/80 backdrop-blur-md border border-border-subtle p-3 rounded-xl flex items-center shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 z-20">
                <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                   {replyingTo ? (
                     <Reply className="text-secondary-400 w-4 h-4 shrink-0" />
                   ) : (
                     <Pencil className="text-accent2-main w-4 h-4 shrink-0" />
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

          <div className="relative flex items-end gap-3 bg-bg-surface/60 backdrop-blur-xl border border-border-subtle rounded-3xl p-2 pl-4 focus-within:ring-1 focus-within:ring-primary-500/50 focus-within:border-primary-500/50 transition-all shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={editingMessage ? "Edit message..." : "Message..."}
              rows={1}
              className="flex-1 max-h-32 bg-transparent text-text-primary text-[0.95rem] placeholder-text-secondary outline-none resize-none py-3 custom-scrollbar"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || (editingMessage && input.trim() === editingMessage.messageText)}
              className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all bg-primary-500 text-white shadow-md hover:shadow-primary-500/25 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed mb-0.5 mr-0.5"
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