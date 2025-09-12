// UserLoginCollectionViewer.tsx
// Component to view user login collection (for debugging purposes)

import React, { useState, useEffect } from 'react';
import { getUserLoginCollection } from '../services/userLoginCollection';

interface UserLoginInfo {
  id: string;
  email: string;
  name: string;
  loginTime: string;
  lastActive: string;
  token: string;
  role: string;
  avatar?: string;
}

const UserLoginCollectionViewer: React.FC = () => {
  const [users, setUsers] = useState<UserLoginInfo[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      const collection = getUserLoginCollection();
      setUsers(collection);
    }
  }, [visible]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (!visible) {
    return (
      <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 1000 }}>
        <button 
          onClick={() => setVisible(true)}
          style={{ 
            padding: '5px 10px', 
            backgroundColor: '#f0f0f0', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          Show Login Collection
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      zIndex: 1000,
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '10px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>User Login Collection</h3>
        <button 
          onClick={() => setVisible(false)}
          style={{ 
            padding: '2px 6px', 
            backgroundColor: '#f0f0f0', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          Hide
        </button>
      </div>
      
      {users.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#666' }}>No users in collection</p>
      ) : (
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Login Time</th>
              <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>{user.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>{user.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>{formatDateTime(user.loginTime)}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>{formatDateTime(user.lastActive)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
        Total users: {users.length}
      </div>
    </div>
  );
};

export default UserLoginCollectionViewer;