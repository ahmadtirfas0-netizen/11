import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  type: 'mail' | 'referral' | 'comment' | 'system';
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export const useNotifications = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !token) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
    });

    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.success(notification.title, {
        duration: 5000,
        position: 'top-left',
        style: {
          background: '#10B981',
          color: 'white',
          fontFamily: 'Noto Sans Arabic, Inter, sans-serif',
          direction: 'rtl'
        }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, token]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    socket
  };
};