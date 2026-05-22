'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [testPhone, setTestPhone] = useState('');
  const [sending, setSending] = useState(false);

  const sendTestSMS = async () => {
    if (!testPhone) {
      alert('Please enter a phone number');
      return;
    }
    
    setSending(true);
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          type: 'custom',
          data: { message: 'Test SMS from Fresh Talent Store. Your SMS notifications are working!' }
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        alert(result.mock 
          ? 'Test SMS logged to console (mock mode). Configure Africa\'s Talking for real SMS.'
          : 'Test SMS sent successfully!');
      } else {
        alert('Failed to send test SMS');
      }
    } catch (error) {
      alert('Error sending test SMS');
    }
    setSending(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">SMS Notifications</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-gray-500">Send SMS updates to customers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">Test SMS Configuration</p>
            <div className="flex gap-3">
              <input
                type="tel"
                placeholder="Phone number (e.g., 0788123456)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendTestSMS}
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Test SMS'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: Currently in mock mode. Configure Africa's Talking API keys for real SMS.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">SMS Events</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>📱 Order Confirmation - When customer places order</li>
              <li>📱 Order Processing - When admin starts processing</li>
              <li>📱 Order Shipped - When order is dispatched</li>
              <li>📱 Order Delivered - When order is delivered</li>
              <li>📱 COD Verification - OTP for cash on delivery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
