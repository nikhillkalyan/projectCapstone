import { useEffect, useRef, useState } from 'react';

export function useLiveTestSocket(courseId, token) {
  const [notification, setNotification] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!courseId || !token) {
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
            client.subscribe(`/topic/course/${courseId}/live-test`, (message) => {
              try {
                setNotification(JSON.parse(message.body));
              } catch (error) {
                console.warn('Failed to parse live test notification:', error);
              }
            });
          },
        });

        client.activate();
        clientRef.current = client;
      } catch (error) {
        console.warn('Live test socket unavailable:', error);
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [courseId, token]);

  return {
    notification,
    dismiss: () => setNotification(null),
  };
}
