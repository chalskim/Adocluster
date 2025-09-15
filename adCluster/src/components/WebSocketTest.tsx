import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

const WebSocketTest: React.FC = () => {
  const { ws, isConnected, connect, disconnect, sendMessage, sendPrivateMessage } = useWebSocket();
  const [clientId, setClientId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [targetClientId, setTargetClientId] = useState<string>('');
  const [privateMessage, setPrivateMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        setReceivedMessages(prev => [...prev, event.data]);
      };
    }
  }, [ws]);

  const handleConnect = () => {
    if (clientId.trim()) {
      // Connect with either string or numeric ID
      if (/^\d+$/.test(clientId)) {
        connect(parseInt(clientId, 10));
      } else {
        connect(clientId);
      }
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleSendPrivate = () => {
    if (targetClientId.trim() && privateMessage.trim()) {
      // Send private message with either string or numeric ID
      if (/^\d+$/.test(targetClientId)) {
        sendPrivateMessage(parseInt(targetClientId, 10), privateMessage);
      } else {
        sendPrivateMessage(targetClientId, privateMessage);
      }
      setPrivateMessage('');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">WebSocket Test</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
        <input
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter client ID (string or number)"
        />
        <button
          onClick={handleConnect}
          disabled={isConnected}
          className={`mt-2 px-4 py-2 rounded-md ${
            isConnected 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Connect
        </button>
        <button
          onClick={disconnect}
          disabled={!isConnected}
          className={`mt-2 ml-2 px-4 py-2 rounded-md ${
            !isConnected 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Disconnect
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Broadcast Message</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter message to broadcast"
        />
        <button
          onClick={handleSend}
          disabled={!isConnected}
          className={`mt-2 px-4 py-2 rounded-md ${
            !isConnected 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          Send Message
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Private Message</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={targetClientId}
            onChange={(e) => setTargetClientId(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Target client ID"
          />
          <input
            type="text"
            value={privateMessage}
            onChange={(e) => setPrivateMessage(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter private message"
          />
        </div>
        <button
          onClick={handleSendPrivate}
          disabled={!isConnected}
          className={`mt-2 px-4 py-2 rounded-md ${
            !isConnected 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          Send Private Message
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-800 mb-2">Connection Status</h2>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-800 mb-2">Received Messages</h2>
        <div className="border rounded-md p-4 h-64 overflow-y-auto bg-gray-50">
          {receivedMessages.length === 0 ? (
            <p className="text-gray-500">No messages received yet</p>
          ) : (
            <ul className="space-y-2">
              {receivedMessages.map((msg, index) => (
                <li key={index} className="p-2 bg-white rounded border">
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSocketTest;