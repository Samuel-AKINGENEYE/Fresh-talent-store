'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Mail, Phone, Calendar, RefreshCw, MessageSquare } from 'lucide-react';

interface BulkInquiry {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  message: string;
  status?: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
  { value: 'quoted', label: 'Quote Sent', color: 'bg-purple-100 text-purple-700' },
  { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-700' },
];

export default function AdminCorporatePage() {
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const loadInquiries = async () => {
    setLoading(true);
    let query = supabase
      .from('bulk_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setInquiries(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from('bulk_inquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    }
  };

  const getStatusStyle = (status?: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color ?? 'bg-gray-100 text-gray-600';
  };

  const pendingCount = inquiries.filter(i => !i.status || i.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Corporate & Bulk Inquiries</h1>
          {pendingCount > 0 && (
            <span className="bg-yellow-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">
              {pendingCount} new
            </span>
          )}
        </div>
        <button onClick={loadInquiries} className="p-2 border rounded-lg hover:bg-gray-50" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STATUS_OPTIONS.map(opt => {
          const count = inquiries.filter(i => (i.status ?? 'pending') === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(statusFilter === opt.value ? 'all' : opt.value)}
              className={`bg-white rounded-lg shadow p-4 text-left transition hover:shadow-md ${statusFilter === opt.value ? 'ring-2 ring-blue-500' : ''}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-500">{opt.label}</p>
            </button>
          );
        })}
      </div>

      {/* Inquiries list */}
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No corporate inquiries yet</p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{inquiry.company_name}</p>
                    <p className="text-sm text-gray-500">{inquiry.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusStyle(inquiry.status ?? 'pending')}`}>
                    {inquiry.status ?? 'pending'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {expanded === inquiry.id && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">{inquiry.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:underline">{inquiry.phone}</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(inquiry.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </p>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded border">{inquiry.message || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700 mr-1">Update status:</span>
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateStatus(inquiry.id, opt.value)}
                        className={`text-xs px-3 py-1.5 rounded-full transition ${
                          (inquiry.status ?? 'pending') === opt.value
                            ? opt.color + ' font-semibold'
                            : 'border hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <a
                      href={`mailto:${inquiry.email}?subject=Re: Corporate Inquiry - ${inquiry.company_name}&body=Dear ${inquiry.company_name} team,%0A%0AThank you for your inquiry.`}
                      className="ml-auto text-xs px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      ✉ Reply by Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
