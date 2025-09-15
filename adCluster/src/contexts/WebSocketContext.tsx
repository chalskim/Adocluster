import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getApiBaseUrl } from '../services/api';

interface WebSocketContextType {
  ws: WebSocket | null;
  isConnected: boolean;
  connect: (clientId: string | number) => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  sendPrivateMessage: (targetClientId: string | number, message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = (clientId: string | number) => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      // Create WebSocket connection
      let wsUrl: string;
      if (typeof clientId === 'number' || /^\d+$/.test(clientId.toString())) {
        // Numeric ID - use the existing format
        wsUrl = `${getApiBaseUrl().replace('http', 'ws')}/ws/${clientId}`;
      } else {
        // String ID - use the new format that supports string IDs
        wsUrl = `${getApiBaseUrl().replace('http', 'ws')}/ws/${clientId}`;
      }
      
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = (message: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  };

  const sendPrivateMessage = (targetClientId: string | number, message: string) => {
    if (wsRef.current && isConnected) {
      const command = `/send_to ${targetClientId} ${message}`;
      wsRef.current.send(command);
    } else {
      console.warn('WebSocket is not connected. Cannot send private message.');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, isConnected, connect, disconnect, sendMessage, sendPrivateMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};