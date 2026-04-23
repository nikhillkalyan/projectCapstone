import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../lib/api';

export function useNotifications(userId, token) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications/my');
      const data = response.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((notification) => !notification.isRead).length);
    } catch {
      // Bell can keep showing the last known state if polling fails.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId || !token) {
      return undefined;
    }

    let cancelled = false;

    const connect = async () => {
      try {
        const SockJS = (await import('sockjs-client')).default;
        const { Client } = await import('@stomp/stompjs');

        const client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnectDelay: 5000,
          onConnect: () => {
            if (cancelled) {
              return;
            }

            client.subscribe(`/topic/notifications/${userId}`, (message) => {
              try {
                const notification = JSON.parse(message.body);
                setNotifications((current) => [notification, ...current]);
                setUnreadCount((current) => current + 1);
              } catch {
                // Ignore malformed payloads.
              }
            });
          },
        });

        client.activate();
        clientRef.current = client;
      } catch {
        // Realtime notifications are optional; polling still works.
      }
    };

    connect();

    return () => {
      cancelled = true;
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [token, userId]);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((current) => current.map((notification) => ({
        ...notification,
        isRead: true,
      })));
      setUnreadCount(0);
    } catch {
      // Keep local state unchanged on failure.
    }
  }, []);

  const markOneRead = useCallback(async (notificationId) => {
    try {
      const target = notifications.find((notification) => notification.id === notificationId);
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )));
      if (target && !target.isRead) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch {
      // Keep local state unchanged on failure.
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    markOneRead,
    refetch: fetchNotifications,
  };
}
