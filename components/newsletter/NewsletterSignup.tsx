'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    // Subscribe to newsletter
    const { error: supabaseError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, name: name || null });
    
    if (supabaseError) {
      if (supabaseError.code === '23505') {
        setError('This email is already subscribed');
      } else {
        setError('Failed to subscribe. Please try again.');
      }
    } else {
      setSuccess(true);
      setEmail('');
      setName('');
      
      // Also call Mailchimp API if configured
      try {
        await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });
      } catch (err) {
        console.log('Mailchimp sync failed (mock mode)');
      }
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-800">Thanks for Subscribing!</h3>
        <p className="text-green-600 mt-1">Check your email for confirmation.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-4">
        <Mail className="h-10 w-10 text-blue-600 mx-auto mb-2" />
        <h3 className="text-xl font-semibold">Subscribe to Our Newsletter</h3>
        <p className="text-gray-600 text-sm mt-1">
          Get the latest deals, new arrivals, and exclusive offers
        </p>
      </div>
      
      <form onSubmit={handleSubscribe} className="space-y-3">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email address *"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
