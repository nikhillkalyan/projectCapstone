import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BookOpen, CheckCheck, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  LIVE_TEST_STARTED: {
    icon: Zap,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  LIVE_TEST_CLOSED: {
    icon: Zap,
    color: 'text-text-muted',
    bg: 'bg-bg-elevated border-border-subtle',
  },
  COURSE_UPDATE: {
    icon: BookOpen,
    color: 'text-primary-400',
    bg: 'bg-primary-500/10 border-primary-500/20',
  },
};

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationDropdown({
  open,
  onClose,
  notifications,
  unreadCount,
  markAllRead,
  markOneRead,
}) {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleMouseDown);
    }

    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose, open]);

  const handleClick = (notification) => {
    markOneRead(notification.id);
    if (notification.courseId) {
      navigate(`/student/university/course/${notification.courseId}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full mt-2 w-80 z-50 glass-lg rounded-2xl border border-glass-border shadow-strong overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle/50">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-text-secondary" />
              <span className="text-sm font-bold text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell size={32} className="text-text-muted opacity-20 mb-3" />
                <p className="text-sm font-bold text-text-secondary">All caught up!</p>
                <p className="text-xs text-text-muted mt-1">No notifications yet.</p>
              </div>
            ) : (
              <div className="py-1.5">
                {notifications.map((notification) => {
                  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.COURSE_UPDATE;
                  const Icon = config.icon;

                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleClick(notification)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04] ${
                        !notification.isRead ? 'bg-primary-500/[0.03]' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${config.bg}`}>
                        <Icon size={14} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-bold leading-snug ${
                            notification.isRead ? 'text-text-secondary' : 'text-text-primary'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-text-muted/60 mt-1">
                          {notification.createdAt ? timeAgo(notification.createdAt) : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
