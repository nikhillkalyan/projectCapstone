import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Fade from '@mui/material/Fade';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, NAVY, NAVY2, NAVY3 } from '../../theme';

export default function ChatWindow({ otherId, otherName, courseId, courseTitle }) {
  const { user } = useAuth();
  const { sendMessage, getMessages } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

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
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const initials = otherName?.charAt(0)?.toUpperCase() || '?';
  const isInstructor = user?.role === 'student';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(13,17,23,0.4)' }}>
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.2, borderBottom: '1px solid rgba(139,155,180,0.1)',
        display: 'flex', alignItems: 'center', gap: 2,
        background: 'rgba(8,12,20,0.6)', backdropFilter: 'blur(12px)',
      }}>
        <Avatar sx={{
          width: 42, height: 42, borderRadius: 2.5, fontFamily: '"Syne",sans-serif', fontWeight: 700,
          background: isInstructor
            ? `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`
            : `linear-gradient(135deg, ${ACCENT} 0%, ${TEAL} 100%)`,
          color: isInstructor ? NAVY : '#fff',
          fontSize: '1rem',
        }}>
          {initials}
        </Avatar>
        <Box>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, color: CREAM, fontSize: '0.95rem' }}>
            {otherName}
          </Typography>
          <Typography sx={{ color: STEEL, fontSize: '0.75rem' }}>{courseTitle}</Typography>
        </Box>
        <Box sx={{ ml: 'auto', width: 8, height: 8, borderRadius: '50%', background: TEAL, boxShadow: `0 0 8px ${TEAL}` }} />
      </Box>

      {/* Messages */}
      <Box sx={{
        flex: 1, overflowY: 'auto', px: 3, py: 2.5,
        display: 'flex', flexDirection: 'column', gap: 1.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(139,155,180,0.15)', borderRadius: 2 },
      }}>
        {messages.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 44, color: STEEL, mb: 1.5 }} />
            <Typography sx={{ color: STEEL, fontSize: '0.88rem' }}>No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.fromId === user?.id;
            const prevMsg = messages[idx - 1];
            const showDate = !prevMsg || formatDate(msg.timestamp) !== formatDate(prevMsg.timestamp);

            return (
              <Fade in key={msg.id} timeout={300}>
                <Box>
                  {showDate && (
                    <Box sx={{ textAlign: 'center', my: 1.5 }}>
                      <Typography sx={{ color: STEEL, fontSize: '0.72rem', background: 'rgba(30,37,53,0.6)', px: 2, py: 0.5, borderRadius: 10, display: 'inline-block' }}>
                        {formatDate(msg.timestamp)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 1 }}>
                    {!isMine && (
                      <Avatar sx={{
                        width: 28, height: 28, borderRadius: 1.5, fontSize: '0.72rem', fontWeight: 700,
                        background: `linear-gradient(135deg, ${GOLD} 0%, ${SAND} 100%)`, color: NAVY, flexShrink: 0,
                      }}>
                        {initials}
                      </Avatar>
                    )}
                    <Box sx={{
                      maxWidth: { xs: '85%', sm: '65%' },
                      px: 2, py: 1.2, borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine
                        ? `linear-gradient(135deg, ${ACCENT} 0%, #5A6BC4 100%)`
                        : 'rgba(30,37,53,0.85)',
                      border: isMine ? 'none' : '1px solid rgba(139,155,180,0.13)',
                      boxShadow: isMine ? `0 4px 16px rgba(108,127,216,0.25)` : 'none',
                    }}>
                      <Typography sx={{ color: CREAM, fontSize: '0.88rem', lineHeight: 1.55 }}>
                        {msg.message}
                      </Typography>
                      <Typography sx={{ color: 'rgba(240,238,216,0.5)', fontSize: '0.67rem', mt: 0.5, textAlign: 'right' }}>
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            );
          })
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box sx={{
        px: 2.5, py: 2, borderTop: '1px solid rgba(139,155,180,0.1)',
        background: 'rgba(8,12,20,0.5)', backdropFilter: 'blur(12px)',
      }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth multiline maxRows={4}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send)"
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3, background: 'rgba(22,27,39,0.7)',
                '& textarea': { color: CREAM, fontSize: '0.88rem', lineHeight: 1.5 },
              },
            }}
          />
          <IconButton onClick={handleSend} disabled={!input.trim()}
            sx={{
              width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
              background: input.trim() ? `linear-gradient(135deg, ${ACCENT} 0%, #5A6BC4 100%)` : 'rgba(30,37,53,0.6)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'scale(1.08)', boxShadow: `0 4px 16px rgba(108,127,216,0.4)` },
              '&:disabled': { opacity: 0.4 },
            }}>
            <SendRoundedIcon sx={{ color: '#fff', fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}