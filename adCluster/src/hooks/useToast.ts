import { useState, useCallback } from 'react';
import { ToastMessage } from '../components/Toast';

export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    type: ToastMessage['type'],
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newMessage: ToastMessage = {
      id,
      type,
      title,
      message,
      duration: duration || 5000
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showToast('success', title, message, duration);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showToast('error', title, message, duration);
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    showToast('warning', title, message, duration);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    showToast('info', title, message, duration);
  }, [showToast]);

  const clearAll = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll
  };
};

export default useToast;