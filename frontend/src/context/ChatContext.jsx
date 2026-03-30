import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [inboundMessage, setInboundMessage] = useState(null);
  const stompClient = useRef(null);

  useEffect(() => {
    if (user?.token) {
      const client = new Client({
        // Use SockJS fallback since we configured .withSockJS() on backend
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${user.token}`,
        },
        reconnectDelay: 5000, // Reconnect automatically 
        onConnect: () => {
          client.subscribe(`/user/queue/messages`, (message) => {
            if (message.body) {
              setInboundMessage(JSON.parse(message.body));
            }
          });
        },
        onStompError: (frame) => {
          console.error('Chat Broker Error:', frame.headers['message']);
        },
      });

      client.activate();
      stompClient.current = client;

      return () => {
        if (client.connected) {
          client.deactivate();
        }
      };
    }
  }, [user]);

  const sendMessage = (receiverId, courseId, messageText, replyToId = null) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ receiverId, courseId, messageText, replyToId }),
      });
    }
  };

  return (
    <ChatContext.Provider value={{ sendMessage, inboundMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
