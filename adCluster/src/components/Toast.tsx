import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 애니메이션을 위해 약간의 지연 후 표시
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // 자동 닫기
    const duration = message.duration || 5000;
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [message.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(message.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform";
    
    switch (message.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-500 text-gray-800`;
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return 'fas fa-check-circle text-green-500';
      case 'error':
        return 'fas fa-exclamation-circle text-red-500';
      case 'warning':
        return 'fas fa-exclamation-triangle text-yellow-500';
      case 'info':
        return 'fas fa-info-circle text-blue-500';
      default:
        return 'fas fa-bell text-gray-500';
    }
  };

  const animationClasses = isLeaving 
    ? 'opacity-0 translate-x-full' 
    : isVisible 
      ? 'opacity-100 translate-x-0' 
      : 'opacity-0 translate-x-full';

  return (
    <div className={`${getToastStyles()} ${animationClasses} mb-3 max-w-md`}>
      <div className="flex-shrink-0 mr-3">
        <i className={getIcon()}></i>
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{message.title}</div>
        {message.message && (
          <div className="text-sm mt-1 opacity-90">{message.message}</div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onClose }) => {
  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  );
};

export default Toast;