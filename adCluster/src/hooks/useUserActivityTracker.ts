// useUserActivityTracker.ts
// Custom hook to track user activity using the login collection

import { useEffect } from 'react';
import { fetchCurrentUser } from '../services/api';
import { 
  getUserLoginCollection, 
  updateUserLastActive, 
  isUserInLoginCollection,
  addUserToLoginCollection,
  cleanupOldEntries
} from '../services/userLoginCollection';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Update user's last active time
const updateLastActive = (userId: string) => {
  updateUserLastActive(userId);
};

// Initialize user in collection if not already present
const initializeUserInCollection = async (token: string) => {
  try {
    const userData = await fetchCurrentUser();
    if (userData && !isUserInLoginCollection(userData.uid)) {
      const userLoginInfo = {
        id: userData.uid,
        email: userData.uemail,
        name: userData.uname,
        loginTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        token: token,
        role: userData.urole,
        avatar: userData.uavatar || undefined
      };
      
      addUserToLoginCollection(userLoginInfo);
      console.log('Initialized user in login collection:', userLoginInfo);
    }
  } catch (error) {
    console.error('Error initializing user in collection:', error);
  }
};

// Custom hook to track user activity
const useUserActivityTracker = () => {
  useEffect(() => {
    // Clean up old entries when the app starts
    cleanupOldEntries();
    
    const token = getAuthToken();
    
    // If user is logged in, track their activity
    if (token) {
      // Initialize user in collection if needed
      initializeUserInCollection(token);
      
      // Set up interval to update last active time
      const interval = setInterval(() => {
        // Get current user from collection
        const collection = getUserLoginCollection();
        const currentUser = collection.find(user => user.token === token);
        
        if (currentUser) {
          updateLastActive(currentUser.id);
        }
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, []);
};

export default useUserActivityTracker;