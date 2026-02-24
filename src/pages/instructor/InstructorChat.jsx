import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import ChatWindow from '../../components/shared/ChatWindow';
import { MessageSquare } from 'lucide-react';

export default function InstructorChat() {
  const { user } = useAuth();
  const { db } = useApp();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);

  // Build chat contacts from all students in instructor's courses
  const contacts = useMemo(() => {
    const myCourseIds = db.courses.filter(c => c.instructorId === user?.id).map(c => c.id);
    const result = [];
    db.students.forEach(student => {
      const sharedCourses = myCourseIds.filter(cid => student.enrolledCourses?.includes(cid));
      sharedCourses.forEach(courseId => {
        const course = db.courses.find(c => c.id === courseId);
        if (course) result.push({ studentId: student.id, studentName: student.name, courseId, courseTitle: course.title });
      });
    });
    return result;
  }, [user, db]);

  // Handle ?student=&course= from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentId = params.get('student');
    const courseId = params.get('course');
    if (studentId && courseId) {
      const contact = contacts.find(c => c.studentId === studentId && c.courseId === courseId);
      if (contact) setSelectedChat(contact);
    }
  }, [location.search, contacts]);

  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="main-content flex">
        {/* Contacts */}
        <div className="w-72 border-r flex-shrink-0" style={{ borderColor: 'rgba(172, 186, 196, 0.1)', background: 'rgba(20, 25, 40, 0.5)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'rgba(172, 186, 196, 0.1)' }}>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Student Messages</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--steel)' }}>{contacts.length} conversations</p>
          </div>

          <div className="overflow-y-auto p-3 space-y-1">
            {contacts.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--steel)' }} />
                <p className="text-sm" style={{ color: 'var(--steel)' }}>No students yet</p>
              </div>
            ) : contacts.map((c, i) => {
              const isActive = selectedChat?.studentId === c.studentId && selectedChat?.courseId === c.courseId;
              return (
                <button key={i} onClick={() => setSelectedChat(c)}
                  className="w-full text-left p-3 rounded-xl transition-all duration-200"
                  style={{ background: isActive ? 'rgba(212, 168, 67, 0.15)' : 'transparent', border: `1px solid ${isActive ? 'rgba(212, 168, 67, 0.3)' : 'transparent'}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6B7FD4, #8FA4E8)', fontFamily: 'Syne', color: 'white' }}>
                      {c.studentName?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-semibold truncate" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>{c.studentName}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--steel)' }}>{c.courseTitle}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1">
          {selectedChat ? (
            <ChatWindow
              otherId={selectedChat.studentId}
              otherName={selectedChat.studentName}
              courseId={selectedChat.courseId}
              courseTitle={selectedChat.courseTitle}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center opacity-40">
                <MessageSquare size={60} className="mx-auto mb-4" style={{ color: 'var(--steel)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--cream)' }}>Select a Student</h3>
                <p style={{ color: 'var(--steel)' }}>Choose a student to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}