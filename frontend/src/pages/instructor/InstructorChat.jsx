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
      <div className="flex h-full w-full bg-bg-base overflow-hidden relative">

        {/* Visual Separator Line (Hidden on mobile) */}
        <div className="hidden md:block absolute left-72 xl:left-80 top-0 bottom-0 w-px bg-border-subtle/50 z-10" />

        {/* Left Pane: Contacts Sidebar */}
        <div className={`
                    absolute md:relative z-20 md:z-auto
                    w-full md:w-72 xl:w-80 h-full flex flex-col bg-bg-surface/50 border-r border-transparent
                    transition-transform duration-300
                    ${selectedChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
                `}>
          {/* Header */}
          <div className="p-6 border-b border-border-subtle/50 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-xl font-syne font-bold text-text-primary capitalize">Messages</h1>
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
                className="w-full bg-bg-elevated border border-border-subtle text-text-primary text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 transition-colors placeholder:text-text-muted/70"
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
                    className={`w-full text-left flex items-start gap-4 px-3 py-3 rounded-2xl transition-all border ${isActive
                      ? 'bg-primary-500/10 border-primary-500/20 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-border-subtle/50'
                      }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 w-11 h-11">
                      {c.avatarUrl ? (
                         <img src={c.avatarUrl} alt={c.userName} className="w-11 h-11 rounded-[1.2rem] object-cover shadow-sm" />
                      ) : (
                         <div className="w-11 h-11 rounded-[1.2rem] bg-gradient-to-tr from-accent2-main to-teal-400 flex items-center justify-center text-white font-syne font-bold shadow-sm">
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
                        <h3 className={`font-syne text-sm font-bold truncate ${c.unreadCount > 0 ? 'text-text-primary' : (isActive ? 'text-primary-400' : 'text-text-primary')}`}>
                          {c.userName}
                        </h3>
                      </div>
                      <p className={`text-xs truncate pr-2 font-dmsans ${c.unreadCount > 0 ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
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
                    w-full h-full flex flex-col bg-bg-base
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent2-main to-teal-400 flex items-center justify-center text-white font-syne font-bold shadow-sm mr-3 shrink-0 overflow-hidden">
                {selectedChat.avatarUrl ? (
                   <img src={selectedChat.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                   selectedChat.userName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 mr-2 flex-1">
                <div className="font-syne font-bold text-sm truncate text-text-primary">
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
              <h2 className="font-syne text-xl text-text-primary font-bold mb-2">Your Messages</h2>
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