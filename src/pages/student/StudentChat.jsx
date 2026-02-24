import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import ChatWindow from '../../components/shared/ChatWindow';
import { MessageSquare } from 'lucide-react';

export default function StudentChat() {
  const { user } = useAuth();
  const { db } = useApp();
  const [selectedChat, setSelectedChat] = useState(null);

  // Get unique instructors for enrolled courses
  const chatContacts = useMemo(() => {
    const enrolled = user?.enrolledCourses || [];
    const contacts = [];
    enrolled.forEach(courseId => {
      const course = db.courses.find(c => c.id === courseId);
      if (course) {
        const instructor = db.instructors.find(i => i.id === course.instructorId);
        if (instructor) {
          const exists = contacts.find(c => c.instructorId === instructor.id && c.courseId === courseId);
          if (!exists) contacts.push({ instructorId: instructor.id, instructorName: instructor.name, courseId, courseTitle: course.title });
        }
      }
    });
    return contacts;
  }, [user, db]);

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="main-content flex">
        {/* Contacts list */}
        <div className="w-72 border-r flex-shrink-0" style={{ borderColor: 'rgba(172, 186, 196, 0.1)', background: 'rgba(20, 25, 40, 0.5)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'rgba(172, 186, 196, 0.1)' }}>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Messages</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--steel)' }}>{chatContacts.length} conversations</p>
          </div>

          <div className="overflow-y-auto p-3 space-y-1">
            {chatContacts.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--steel)' }} />
                <p className="text-sm" style={{ color: 'var(--steel)' }}>Enroll in courses to chat with instructors</p>
              </div>
            ) : (
              chatContacts.map((c, i) => {
                const isActive = selectedChat?.instructorId === c.instructorId && selectedChat?.courseId === c.courseId;
                return (
                  <button key={i} onClick={() => setSelectedChat(c)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${isActive ? '' : ''}`}
                    style={{ background: isActive ? 'rgba(107, 127, 212, 0.2)' : 'transparent', border: `1px solid ${isActive ? 'rgba(107, 127, 212, 0.3)' : 'transparent'}` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #D4A843, #E1D9BC)', color: 'var(--navy)', fontFamily: 'Syne' }}>
                        {c.instructorName.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-sm font-semibold truncate" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{c.instructorName}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--steel)' }}>{c.courseTitle}</div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1">
          {selectedChat ? (
            <ChatWindow
              otherId={selectedChat.instructorId}
              otherName={selectedChat.instructorName}
              courseId={selectedChat.courseId}
              courseTitle={selectedChat.courseTitle}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center opacity-40">
                <MessageSquare size={60} className="mx-auto mb-4" style={{ color: 'var(--steel)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Select a Conversation</h3>
                <p style={{ color: 'var(--steel)' }}>Choose an instructor to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}