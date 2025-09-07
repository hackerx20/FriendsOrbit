import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [feedUpdates, setFeedUpdates] = useState([]);

  const { data: authUser } = useQuery({ queryKey: ['authUser'] });

  useEffect(() => {
    if (authUser) {
      const newSocket = io('/', {
        auth: {
          token: document.cookie
            .split('; ')
            .find(row => row.startsWith('jwt='))
            ?.split('=')[1]
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
        newSocket.emit('user_online');
      });

      newSocket.on('user_status_change', ({ userId, status }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === 'online') {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      newSocket.on('user_typing', ({ userId, username }) => {
        setTypingUsers(prev => new Map(prev.set(userId, username)));
      });

      newSocket.on('user_stopped_typing', ({ userId }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      });
      
      // Handle real-time feed updates
      newSocket.on('feed_update', (update) => {
        setFeedUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
      });
      
      // Handle user online/offline status
      newSocket.on('user_online', ({ userId, username }) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setSocket(null);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [authUser]);

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    feedUpdates,
    isUserOnline: (userId) => onlineUsers.has(userId),
    isUserTyping: (userId) => typingUsers.has(userId),
    clearFeedUpdates: () => setFeedUpdates([])
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};