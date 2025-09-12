// userLoginCollection.ts
// Service to manage user login collections

// Define the user login information interface
export interface UserLoginInfo {
  id: string;
  email: string;
  name: string;
  loginTime: string;
  lastActive: string;
  token: string;
  role: string;
  avatar?: string;
}

// Collection name
const COLLECTION_NAME = 'user_login_collections';

// Add user login information to the collection
export const addUserToLoginCollection = (userInfo: UserLoginInfo): void => {
  try {
    // Get existing collection from localStorage
    const existingCollection = getUserLoginCollection();
    
    // Remove any existing entries for the same user
    const filteredCollection = existingCollection.filter(user => user.id !== userInfo.id);
    
    // Add new user info to collection
    const updatedCollection = [...filteredCollection, userInfo];
    
    // Save updated collection to localStorage
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(updatedCollection));
    
    console.log('User added to login collection:', userInfo);
  } catch (error) {
    console.error('Error adding user to login collection:', error);
  }
};

// Get all user login information from the collection
export const getUserLoginCollection = (): UserLoginInfo[] => {
  try {
    const collection = localStorage.getItem(COLLECTION_NAME);
    return collection ? JSON.parse(collection) : [];
  } catch (error) {
    console.error('Error retrieving user login collection:', error);
    return [];
  }
};

// Get specific user login information by ID
export const getUserLoginInfoById = (userId: string): UserLoginInfo | undefined => {
  try {
    const collection = getUserLoginCollection();
    return collection.find(user => user.id === userId);
  } catch (error) {
    console.error('Error retrieving user login info by ID:', error);
    return undefined;
  }
};

// Update user's last active time
export const updateUserLastActive = (userId: string): void => {
  try {
    const collection = getUserLoginCollection();
    const updatedCollection = collection.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          lastActive: new Date().toISOString()
        };
      }
      return user;
    });
    
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(updatedCollection));
    console.log('Updated last active time for user:', userId);
  } catch (error) {
    console.error('Error updating user last active time:', error);
  }
};

// Remove user from collection
export const removeUserFromLoginCollection = (userId: string): void => {
  try {
    const collection = getUserLoginCollection();
    const updatedCollection = collection.filter(user => user.id !== userId);
    
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(updatedCollection));
    console.log('Removed user from login collection:', userId);
  } catch (error) {
    console.error('Error removing user from login collection:', error);
  }
};

// Clear all user login information
export const clearUserLoginCollection = (): void => {
  try {
    localStorage.removeItem(COLLECTION_NAME);
    console.log('Cleared user login collection');
  } catch (error) {
    console.error('Error clearing user login collection:', error);
  }
};

// Check if user exists in collection
export const isUserInLoginCollection = (userId: string): boolean => {
  try {
    const collection = getUserLoginCollection();
    return collection.some(user => user.id === userId);
  } catch (error) {
    console.error('Error checking user in login collection:', error);
    return false;
  }
};

// Clean up old entries (older than 7 days)
export const cleanupOldEntries = (): void => {
  try {
    const collection = getUserLoginCollection();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const updatedCollection = collection.filter(user => {
      const lastActive = new Date(user.lastActive);
      return lastActive >= sevenDaysAgo;
    });
    
    if (updatedCollection.length !== collection.length) {
      localStorage.setItem(COLLECTION_NAME, JSON.stringify(updatedCollection));
      console.log(`Cleaned up ${collection.length - updatedCollection.length} old entries from login collection`);
    }
  } catch (error) {
    console.error('Error cleaning up old entries:', error);
  }
};

// Get user by token
export const getUserByToken = (token: string): UserLoginInfo | undefined => {
  try {
    const collection = getUserLoginCollection();
    return collection.find(user => user.token === token);
  } catch (error) {
    console.error('Error retrieving user by token:', error);
    return undefined;
  }
};