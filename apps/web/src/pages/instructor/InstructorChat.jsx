import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import InstructorLayout from '../../components/layout/v2/InstructorLayout';
import ChatWindow from '../../components/shared/ChatWindow';
import { MessageSquare, MessageSquareOff, Search, ChevronLeft, Loader2 } from 'lucide-react';

export default function InstructorChat() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [search, setSearch] = useState('');
  const [chatContacts, setChatContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get('/messages/contacts');
        setChatContacts(res.data);
      } catch (err) {
        console.error('Failed to fetch chat contacts', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchContacts();
  }, [user]);

  const filtered = search
    ? chatContacts.filter(c =>
      c.userName.toLowerCase().includes(search.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(search.toLowerCase()))
    : chatContacts;

  const totalUnread = chatContacts.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <InstructorLayout disablePadding>
      {/* Split Pane Layout */}
      <div className="relative flex h-full w-full overflow-hidden bg-transparent">

        {/* Visual Separator Line (Hidden on mobile) */}
        <div className="hidden md:block absolute left-72 xl:left-80 top-0 bottom-0 w-px bg-border-subtle/50 z-10" />

        {/* Left Pane: Contacts Sidebar */}
        <div className={`
                    absolute md:relative z-20 md:z-auto
                    w-full md:w-72 xl:w-80 h-full flex flex-col glass-sm border-r border-glass-border
                    transition-transform duration-300
                    ${selectedChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
                `}>
          {/* Header */}
          <div className="p-6 border-b border-border-subtle/50 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="font-display text-xl font-bold capitalize text-text-primary">Messages</h1>
              {totalUnread > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-[10px] font-bold">
                  {totalUnread}
                </span>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-text-muted" />
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students or courses..."
                className="glass-input w-full rounded-lg py-2.5 pl-9 pr-4 text-xs text-text-primary outline-none placeholder:text-text-muted/70"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-center opacity-60 px-4">
                <Loader2 className="w-8 h-8 text-text-secondary mb-3 animate-spin" />
                <p className="text-sm text-text-secondary">Loading contacts...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center opacity-60 px-4">
                <MessageSquareOff className="w-8 h-8 text-text-secondary mb-3" />
                <p className="text-sm text-text-secondary">
                  {search ? 'No matches found' : 'No student conversations yet'}
                </p>
              </div>
            ) : (
              filtered.map((c, i) => {
                const isActive = selectedChat?.userId === c.userId && selectedChat?.courseId === c.courseId;
                const initials = c.userName.charAt(0).toUpperCase();

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedChat(c);
                      if (c.unreadCount > 0) {
                        setChatContacts(prev => prev.map(contact =>
                          (contact.userId === c.userId && contact.courseId === c.courseId)
                            ? { ...contact, unreadCount: 0 }
                            : contact
                        ));
                      }
                    }}
                    className={`flex w-full items-start gap-4 rounded-lg border px-3 py-3 text-left transition-all ${isActive
                      ? 'border-primary-400/20 bg-primary-500/10 shadow-glow'
                      : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-border-subtle/50'
                      }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 w-11 h-11">
                      {c.avatarUrl ? (
                         <img src={c.avatarUrl} alt={c.userName} className="h-11 w-11 rounded-lg object-cover shadow-sm" />
                      ) : (
                         <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-accent font-display font-bold text-white shadow-glow">
                           {initials}
                         </div>
                      )}
                      {c.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full border-2 border-bg-surface flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                          {c.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`truncate font-display text-sm font-bold ${c.unreadCount > 0 ? 'text-text-primary' : (isActive ? 'text-primary-300' : 'text-text-primary')}`}>
                          {c.userName}
                        </h3>
                      </div>
                      <p className={`truncate pr-2 text-xs ${c.unreadCount > 0 ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                        {c.courseTitle}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Main Chat Area */}
        <div className={`
                    absolute md:relative z-10 md:z-auto
                    w-full h-full flex flex-col bg-transparent
                    transition-transform duration-300
                    ${selectedChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                `}>
          {/* Mobile Back Button Header */}
          {selectedChat && (
            <div className="md:hidden flex items-center px-4 py-3 bg-bg-surface border-b border-border-subtle">
              <button
                onClick={() => setSelectedChat(null)}
                className="text-text-secondary hover:text-white p-2 mr-1 transition-colors"
                aria-label="Back to messages"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-accent font-display font-bold text-white shadow-glow">
                {selectedChat.avatarUrl ? (
                   <img src={selectedChat.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                   selectedChat.userName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 mr-2 flex-1">
                <div className="truncate font-display text-sm font-bold text-text-primary">
                  {selectedChat.userName}
                </div>
                <div className="text-[10px] text-text-secondary truncate mt-0.5">
                  {selectedChat.courseTitle}
                </div>
              </div>
            </div>
          )}

          {selectedChat ? (
            <ChatWindow
              otherId={selectedChat.userId}
              otherName={selectedChat.userName}
              otherAvatar={selectedChat.avatarUrl}
              courseId={selectedChat.courseId}
              courseTitle={selectedChat.courseTitle}
            />
          ) : (
            <div className="hidden md:flex h-full flex-col items-center justify-center text-center opacity-40">
              <MessageSquare className="w-16 h-16 text-text-secondary mb-4" />
              <h2 className="mb-2 font-display text-xl font-bold text-text-primary">Your Messages</h2>
              <p className="text-sm text-text-secondary max-w-xs">
                Select a conversation from the sidebar to start chatting with your students.
              </p>
            </div>
          )}
        </div>

      </div>
    </InstructorLayout>
  );
}
