import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import ChatWindow from '../../components/shared/ChatWindow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
// ❌ remove Icon
import ForumRounded from "@mui/icons-material/ForumRounded";
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, NAVY } from '../../theme';

const SIDEBAR_W = 248;

export default function StudentChat() {
  const { user } = useAuth();
  const { db } = useApp();
  const [selectedChat, setSelectedChat] = useState(null);

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
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, display: 'flex', height: '100vh', pt: { xs: '56px', md: 0 } }}>
        {/* Contacts */}
        <Box sx={{ width: { xs: selectedChat ? 0 : '100%', sm: 280 }, flexShrink: 0, borderRight: '1px solid rgba(139,155,180,0.1)', background: 'rgba(8,12,20,0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.3s ease' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(139,155,180,0.1)' }}>
            <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '1rem' }}>Messages</Typography>
            <Typography sx={{ color: STEEL, fontSize: '0.75rem', mt: 0.3 }}>{chatContacts.length} conversations</Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {chatContacts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, opacity: 0.5 }}>
                <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 36, color: STEEL, mb: 1.5 }} />
                <Typography sx={{ color: STEEL, fontSize: '0.82rem' }}>Enroll in courses to chat with instructors</Typography>
              </Box>
            ) : (
              <List sx={{ '& .MuiListItemButton-root': { borderRadius: 2.5, mb: 0.5, px: 1.5, py: 1.2 } }}>
                {chatContacts.map((c, i) => {
                  const isActive = selectedChat?.instructorId === c.instructorId && selectedChat?.courseId === c.courseId;
                  return (
                    <ListItemButton key={i} selected={isActive} onClick={() => setSelectedChat(c)}
                      sx={{ '&.Mui-selected': { background: 'rgba(108,127,216,0.18)', border: '1px solid rgba(108,127,216,0.25)' } }}>
                      <Avatar sx={{ width: 40, height: 40, borderRadius: 2, mr: 1.5, flexShrink: 0, background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>
                        {c.instructorName.charAt(0)}
                      </Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography sx={{ color: CREAM, fontFamily: '"Syne",sans-serif', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.instructorName}
                        </Typography>
                        <Typography sx={{ color: STEEL, fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.courseTitle}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>

        {/* Chat window */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedChat ? (
            <ChatWindow otherId={selectedChat.instructorId} otherName={selectedChat.instructorName} courseId={selectedChat.courseId} courseTitle={selectedChat.courseTitle} />
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 56, color: STEEL, mb: 2 }} />
              <Typography variant="h6" sx={{ color: CREAM, fontWeight: 700, mb: 1 }}>Select a Conversation</Typography>
              <Typography sx={{ color: STEEL, fontSize: '0.88rem' }}>Choose an instructor to start chatting</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}