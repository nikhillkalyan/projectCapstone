import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { useAuth } from './AuthContext';
import api from '../lib/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [inboundMessage, setInboundMessage] = useState(null);
  const stompClient = useRef(null);

  useEffect(() => {
    const canUseChat = Boolean(user?.token) && ['student', 'instructor'].includes(user?.role);
    if (!canUseChat) {
      stompClient.current?.deactivate();
      stompClient.current = null;
      return undefined;
    }

    let cancelled = false;
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        if (cancelled) {
          return;
        }

        client.subscribe('/user/queue/messages', (message) => {
          if (!message.body) {
            return;
          }

          try {
            setInboundMessage(JSON.parse(message.body));
          } catch {
            // Ignore malformed realtime payloads and keep chat usable.
          }
        });
      },
      onStompError: () => {
        // Realtime chat is optional because sending falls back to REST.
      },
      onWebSocketError: () => {
        // Keep silent here to avoid noisy console spam for optional realtime updates.
      },
    });

    client.debug = () => {};
    client.activate();
    stompClient.current = client;

    return () => {
      cancelled = true;
      client.deactivate();
      if (stompClient.current === client) {
        stompClient.current = null;
      }
    };
  }, [user]);

  const sendMessage = async (receiverId, courseId, messageText, replyToId = null) => {
    const response = await api.post('/messages', {
      receiverId,
      courseId,
      messageText,
      replyToId,
    });
    return response.data;
  };

  return (
    <ChatContext.Provider value={{ sendMessage, inboundMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
