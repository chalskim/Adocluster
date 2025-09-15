import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { fetchCurrentUser } from '../services/api';

export const useWebSocketConnection = () => {
  const { connect, disconnect, isConnected } = useWebSocket();
  const [userId, setUserId] = useState<string | number | null>(null);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        // Fetch current user to get their ID
        const user = await fetchCurrentUser();
        if (user && user.uid) {
          // Use the user's UID as the client ID (can be string or number)
          setUserId(user.uid);
          connect(user.uid);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    // Only connect if we're not already connected
    if (!isConnected) {
      initializeConnection();
    }

    // Cleanup function to disconnect when component unmounts
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [connect, disconnect, isConnected]);

  return { isConnected, userId };
};