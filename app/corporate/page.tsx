'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CorporatePage() {
  const [formData, setFormData] = useState({
    company_name: '', email: '', phone: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('bulk_inquiries').insert(formData);
    if (!error) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-green-600 mb-4">✓ Request Sent!</h1>
            <p>Our corporate team will contact you within 24 hours.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-4">Corporate & Bulk Orders</h1>
        <p className="text-center text-gray-600 mb-8">Special pricing for businesses and bulk purchases</p>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Company Name" required className="w-full px-4 py-2 border rounded-lg" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
            <input type="email" placeholder="Email Address" required className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="tel" placeholder="Phone Number" required className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <textarea placeholder="Tell us about your bulk order requirements..." rows={4} className="w-full px-4 py-2 border rounded-lg" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">Request Quote</button>
          </form>
        </div>
      </div>
    </div>
  );
}
