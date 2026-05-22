'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Users, Send, Trash2, Eye } from 'lucide-react';

interface Subscriber {
  id: number;
  email: string;
  name: string;
  subscribed_at: string;
  is_active: boolean;
}

interface Campaign {
  id: number;
  subject: string;
  content: string;
  status: string;
  sent_at: string;
  recipient_count: number;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaignData, setCampaignData] = useState({
    subject: '',
    content: '',
  });

  useEffect(() => {
    loadSubscribers();
    loadCampaigns();
  }, []);

  const loadSubscribers = async () => {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false });
    
    setSubscribers(data || []);
    setLoading(false);
  };

  const loadCampaigns = async () => {
    const { data } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    setCampaigns(data || []);
  };

  const deleteSubscriber = async (id: number, email: string) => {
    if (confirm(`Remove ${email} from newsletter?`)) {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        alert('Error removing subscriber: ' + error.message);
      } else {
        loadSubscribers();
      }
    }
  };

  const sendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignData.subject || !campaignData.content) {
      alert('Please fill in all fields');
      return;
    }
    
    setSending(true);
    
    // Save campaign
    const { data: campaign, error: saveError } = await supabase
      .from('email_campaigns')
      .insert({
        subject: campaignData.subject,
        content: campaignData.content,
        status: 'sending',
        recipient_count: subscribers.length,
      })
      .select();
    
    if (saveError) {
      alert('Error saving campaign: ' + saveError.message);
      setSending(false);
      return;
    }
    
    // Send to each subscriber (mock)
    console.log(`📧 Sending newsletter to ${subscribers.length} subscribers`);
    console.log(`Subject: ${campaignData.subject}`);
    console.log('======================================');
    
    for (const subscriber of subscribers) {
      console.log(`Sending to: ${subscriber.email} (${subscriber.name || 'No name'})`);
      // In production, this would use Mailchimp or other email service
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log('======================================');
    console.log('Campaign sent successfully!');
    
    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
      .eq('id', campaign[0].id);
    
    alert(`Newsletter sent to ${subscribers.length} subscribers!`);
    setCampaignData({ subject: '', content: '' });
    setShowCampaignForm(false);
    setSending(false);
    loadCampaigns();
  };

  const exportSubscribers = () => {
    const csv = [
      ['Email', 'Name', 'Subscribed Date'],
      ...subscribers.map(s => [s.email, s.name || '', new Date(s.subscribed_at).toLocaleDateString()])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <div className="flex gap-3">
          <button
            onClick={exportSubscribers}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowCampaignForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Subscribers</p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Campaigns Sent</p>
              <p className="text-2xl font-bold">{campaigns.length}</p>
            </div>
            <Mail className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Subscriber Growth</p>
              <p className="text-2xl font-bold">+{subscribers.filter(s => new Date(s.subscribed_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</p>
            </div>
            <Mail className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCampaignForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Newsletter Campaign</h2>
          <form onSubmit={sendCampaign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject Line *</label>
              <input
                type="text"
                required
                placeholder="e.g., Summer Sale is Here!"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={campaignData.subject}
                onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Content *</label>
              <textarea
                required
                rows={10}
                placeholder="Write your newsletter content here..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                value={campaignData.content}
                onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">HTML supported for rich formatting</p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? `Sending to ${subscribers.length} subscribers...` : `Send to ${subscribers.length} Subscribers`}
              </button>
              <button
                type="button"
                onClick={() => setShowCampaignForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Subscribers ({subscribers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{sub.email}</td>
                  <td className="px-6 py-4">{sub.name || '-'}</td>
                  <td className="px-6 py-4 text-sm">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteSubscriber(sub.id, sub.email)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No subscribers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Campaigns */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Past Campaigns</h2>
          </div>
          <div className="divide-y">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{campaign.subject}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Sent to {campaign.recipient_count} subscribers on {campaign.sent_at ? new Date(campaign.sent_at).toLocaleString() : 'Not sent'}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
