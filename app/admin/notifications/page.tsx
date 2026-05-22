'use client';

import { useState } from 'react';
import { sendNotification, sendFlashSaleNotification } from '@/lib/services/push-notification';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendTest = async () => {
    if (!title || !body) {
      alert('Please fill in title and body');
      return;
    }
    
    setSending(true);
    sendNotification({
      title,
      body,
      url: url || '/',
    });
    alert('Test notification sent!');
    setSending(false);
  };

  const handleSendFlashSale = () => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 12);
    sendFlashSaleNotification('Weekend Flash Sale', 30, endTime);
    alert('Flash sale notification sent!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Push Notifications</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Send Custom Notification */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Send Custom Notification</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g., Special Offer!"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                rows={3}
                placeholder="Your notification message..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Link URL (optional)</label>
              <input
                type="text"
                placeholder="/products or https://..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleSendTest}
              disabled={sending}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send Test Notification
            </button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <button
              onClick={handleSendFlashSale}
              className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium">⚡ Flash Sale Alert</div>
              <div className="text-sm text-gray-500">Notify users about active flash sales</div>
            </button>
            
            <button
              onClick={() => {
                sendNotification({
                  title: '🎉 New Arrivals!',
                  body: 'Check out our latest collection of electronics',
                  url: '/products',
                });
                alert('New arrivals notification sent!');
              }}
              className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium">🆕 New Arrivals</div>
              <div className="text-sm text-gray-500">Notify about new products</div>
            </button>
            
            <button
              onClick={() => {
                sendNotification({
                  title: '💝 Special Discount',
                  body: 'Use code SAVE20 for 20% off your next purchase!',
                  url: '/products',
                });
                alert('Discount notification sent!');
              }}
              className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium">💝 Promo Code Alert</div>
              <div className="text-sm text-gray-500">Notify about special discounts</div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <h3 className="font-medium text-blue-800 mb-2">📱 Push Notification Guide</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Users must grant permission to receive notifications</li>
          <li>• Notifications work even when the browser is closed</li>
          <li>• Clicking a notification opens the specified URL</li>
          <li>• Test on different browsers for compatibility</li>
        </ul>
      </div>
    </div>
  );
}
