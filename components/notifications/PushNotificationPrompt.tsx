'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { requestNotificationPermission, isNotificationSupported, sendWelcomeNotification } from '@/lib/services/push-notification';

export default function PushNotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const supported_flag = isNotificationSupported();
    setSupported(supported_flag);
    
    if (supported_flag && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // Show prompt after 5 seconds
      const timer = setTimeout(() => {
        const hasBeenAsked = localStorage.getItem('pushNotificationAsked');
        if (!hasBeenAsked) {
          setShowPrompt(true);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    setPermission(Notification.permission);
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    setShowPrompt(false);
    localStorage.setItem('pushNotificationAsked', 'true');
    
    if (granted) {
      // Send welcome notification as test
      sendWelcomeNotification('Customer');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pushNotificationAsked', 'true');
  };

  if (!supported || permission === 'granted' || permission === 'denied') {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl border p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Stay Updated!</h4>
            <p className="text-xs text-gray-600 mt-1">
              Get notifications about flash sales, order updates, and exclusive deals.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleEnable}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
              >
                Enable Notifications
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1 border text-xs rounded-lg hover:bg-gray-50"
              >
                Maybe Later
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
