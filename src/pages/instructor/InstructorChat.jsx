import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import InstructorSidebar from '../../components/layout/InstructorSidebar';
import ChatWindow from '../../components/shared/ChatWindow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, NAVY } from '../../theme';

const SIDEBAR_W = 248;

export default function InstructorChat() {
  const { user } = useAuth();
  const { db } = useApp();
  const [selectedChat, setSelectedChat] = useState(null);
  const [search, setSearch] = useState('');

  const chatContacts = useMemo(() => {
    const myCourses = db.courses.filter(c => c.instructorId === user?.id);
    const contacts = [];
    myCourses.forEach(course => {
      const enrolledStudents = db.students.filter(s => s.enrolledCourses?.includes(course.id));
      enrolledStudents.forEach(student => {
        const exists = contacts.find(c => c.studentId === student.id && c.courseId === course.id);
        if (!exists) {
          const unread = db.messages.filter(m =>
            m.fromId === student.id && m.toId === user?.id && m.courseId === course.id && !m.read
          ).length;
          contacts.push({ studentId: student.id, studentName: student.name, courseId: course.id, courseTitle: course.title, unread });
        }
      });
    });
    return contacts;
  }, [user, db]);

  const filtered = search
    ? chatContacts.filter(c =>
        c.studentName.toLowerCase().includes(search.toLowerCase()) ||
        c.courseTitle.toLowerCase().includes(search.toLowerCase()))
    : chatContacts;

  const totalUnread = chatContacts.reduce((s, c) => s + c.unread, 0);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <InstructorSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, display: 'flex', height: '100vh', pt: { xs: '56px', md: 0 } }}>

        {/* Contact list */}
        <Box sx={{
          width: { xs: selectedChat ? 0 : '100%', sm: 300 }, flexShrink: 0,
          borderRight: '1px solid rgba(139,155,180,0.1)', background: 'rgba(8,12,20,0.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.3s ease',
        }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(139,155,180,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.8 }}>
              <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '1rem' }}>
                Messages
              </Typography>
              {totalUnread > 0 && (
                <Chip label={totalUnread} size="small"
                  sx={{ background: ACCENT, color: '#fff', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              )}
            </Box>
            <TextField fullWidth size="small" placeholder="Search students or courses..."
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: STEEL, fontSize: 17 }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: '0.82rem' } }} />
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 1,
            '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(139,155,180,0.15)', borderRadius: 2 } }}>
            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, opacity: 0.5 }}>
                <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 36, color: STEEL, mb: 1.5 }} />
                <Typography sx={{ color: STEEL, fontSize: '0.82rem' }}>
                  {search ? 'No matches found' : 'No student conversations yet'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ '& .MuiListItemButton-root': { borderRadius: 2.5, mb: 0.5, px: 1.5, py: 1.2 } }}>
                {filtered.map((c, i) => {
                  const isActive = selectedChat?.studentId === c.studentId && selectedChat?.courseId === c.courseId;
                  return (
                    <ListItemButton key={i} selected={isActive} onClick={() => setSelectedChat(c)}
                      sx={{ '&.Mui-selected': { background: 'rgba(108,127,216,0.18)', border: '1px solid rgba(108,127,216,0.25)' } }}>
                      <Badge badgeContent={c.unread} color="primary"
                        sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}>
                        <Avatar sx={{ width: 40, height: 40, borderRadius: 2, mr: 1.5, flexShrink: 0,
                          background: `linear-gradient(135deg, ${ACCENT2} 0%, ${TEAL} 100%)`, color: '#fff',
                          fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>
                          {c.studentName.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Box sx={{ overflow: 'hidden', ml: c.unread ? 1 : 0 }}>
                        <Typography sx={{ color: CREAM, fontFamily: '"Syne",sans-serif', fontWeight: c.unread ? 700 : 600,
                          fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.studentName}
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
            <ChatWindow
              otherId={selectedChat.studentId}
              otherName={selectedChat.studentName}
              courseId={selectedChat.courseId}
              courseTitle={selectedChat.courseTitle}
            />
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 56, color: STEEL, mb: 2 }} />
              <Typography variant="h6" sx={{ color: CREAM, fontWeight: 700, mb: 1 }}>Select a Conversation</Typography>
              <Typography sx={{ color: STEEL, fontSize: '0.88rem' }}>Choose a student to start chatting</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}