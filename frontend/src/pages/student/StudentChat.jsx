import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentLayout from '../../components/layout/v2/StudentLayout';
import ChatWindow from '../../components/shared/ChatWindow';
import { MessageSquare, MessageSquareOff } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function StudentChat() {
  const { user } = useAuth();
  const { db } = useApp();
  const [selectedChat, setSelectedChat] = useState(null);

  // Build unique contact list based on enrolled courses
  const chatContacts = useMemo(() => {
    const enrolled = user?.enrolledCourses || [];
    const contacts = [];
    enrolled.forEach(courseId => {
      const course = db.courses.find(c => c.id === courseId);
      if (course) {
        const instructor = db.instructors.find(i => i.id === course.instructorId);
        if (instructor) {
          const exists = contacts.find(c => c.instructorId === instructor.id && c.courseId === courseId);
          if (!exists) {
            contacts.push({
              instructorId: instructor.id,
              instructorName: instructor.name,
              courseId,
              courseTitle: course.title
            });
          }
        }
      }
    });
    return contacts;
  }, [user, db]);

  return (
    <StudentLayout disablePadding>
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
            <h1 className="text-xl font-syne font-bold text-text-primary capitalize mb-1">Messages</h1>
            <p className="text-xs text-text-secondary">{chatContacts.length} conversation{chatContacts.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {chatContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center opacity-60 px-4">
                <MessageSquareOff className="w-8 h-8 text-text-secondary mb-3" />
                <p className="text-sm text-text-secondary">Enroll in courses to start chatting with instructors.</p>
              </div>
            ) : (
              chatContacts.map((c, i) => {
                const isActive = selectedChat?.instructorId === c.instructorId && selectedChat?.courseId === c.courseId;
                const initials = c.instructorName.charAt(0).toUpperCase();

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedChat(c)}
                    className={`w-full text-left flex items-center justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all border ${isActive
                      ? 'bg-primary-500/10 border-primary-500/20 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-border-subtle/50'
                      }`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 shrink-0 rounded-[1.2rem] bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-black font-syne font-bold shadow-sm">
                      {initials}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`font-syne text-sm font-bold truncate ${isActive ? 'text-primary-400' : 'text-text-primary'}`}>
                          {c.instructorName}
                        </h3>
                      </div>
                      <p className="text-xs text-text-secondary truncate pr-2 font-dmsans">
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
                className="text-text-secondary hover:text-white p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <span className="font-syne font-bold text-sm ml-2 truncate">{selectedChat.instructorName}</span>
            </div>
          )}

          {selectedChat ? (
            <ChatWindow
              otherId={selectedChat.instructorId}
              otherName={selectedChat.instructorName}
              courseId={selectedChat.courseId}
              courseTitle={selectedChat.courseTitle}
            />
          ) : (
            <div className="hidden md:flex h-full flex-col items-center justify-center text-center opacity-40">
              <MessageSquare className="w-16 h-16 text-text-secondary mb-4" />
              <h2 className="font-syne text-xl text-text-primary font-bold mb-2">Your Messages</h2>
              <p className="text-sm text-text-secondary max-w-xs">
                Select a conversation from the sidebar to start chatting with your instructor.
              </p>
            </div>
          )}
        </div>

      </div>
    </StudentLayout>
  );
}