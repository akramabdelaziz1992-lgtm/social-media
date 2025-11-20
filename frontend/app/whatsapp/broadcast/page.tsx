"use client";

import React, { useState } from 'react';
import { Send, Users, Clock, CheckCircle, XCircle, Eye, Edit, Trash2, Plus, Image, FileText } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  recipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  scheduledDate?: string;
  createdDate: string;
}

export default function WhatsAppBroadcastPage() {
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'عرض الجمعة البيضاء',
      status: 'completed',
      recipients: 5234,
      sent: 5234,
      delivered: 5180,
      read: 4523,
      failed: 54,
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'تحديث المنتجات الجديدة',
      status: 'scheduled',
      recipients: 3456,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      scheduledDate: '2024-01-25 10:00',
      createdDate: '2024-01-20'
    },
    {
      id: '3',
      name: 'تذكير بالطلبات المعلقة',
      status: 'sending',
      recipients: 1234,
      sent: 856,
      delivered: 820,
      read: 345,
      failed: 12,
      createdDate: '2024-01-22'
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700 border-gray-300',
      scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
      sending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      completed: 'bg-green-100 text-green-700 border-green-300',
      failed: 'bg-red-100 text-red-700 border-red-300',
    };
    const labels = {
      draft: 'مسودة',
      scheduled: 'مجدول',
      sending: 'جاري الإرسال',
      completed: 'مكتمل',
      failed: 'فشل',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Send className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Broadcasting
                </h1>
                <p className="text-gray-600">Send bulk messages to your subscribers</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewCampaign(!showNewCampaign)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition flex items-center gap-2"
            >
              <Plus size={20} />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Send className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Total Sent</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">45.2K</div>
            <div className="text-sm text-green-600 mt-1">+12.5% this month</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Delivered</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">44.1K</div>
            <div className="text-sm text-blue-600 mt-1">97.6% delivery rate</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-cyan-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Eye className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Read Rate</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">85.3%</div>
            <div className="text-sm text-cyan-600 mt-1">37.6K read</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Scheduled</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">3</div>
            <div className="text-sm text-yellow-600 mt-1">Campaigns pending</div>
          </div>
        </div>

        {/* New Campaign Form */}
        {showNewCampaign && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 mb-6 animate-fadeInUp">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Campaign</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g., Flash Sale Alert"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Audience</label>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Subscribers (4,523)</option>
                  <option value="active">Active Only (4,012)</option>
                  <option value="vip">VIP Customers (345)</option>
                  <option value="new">New Subscribers (156)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <div className="text-sm text-gray-600 mt-1">{message.length} / 1000 characters</div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                  <Image size={16} />
                  <span>Add Image</span>
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                  <FileText size={16} />
                  <span>Add File</span>
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition">
                  Send Now
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition">
                  Schedule
                </button>
                <button
                  onClick={() => setShowNewCampaign(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:scale-[1.02] transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                    {campaign.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">Created: {campaign.createdDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(campaign.status)}
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {campaign.scheduledDate && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                  <Clock className="text-blue-600" size={16} />
                  <span className="text-sm text-blue-700">Scheduled for: {campaign.scheduledDate}</span>
                </div>
              )}

              <div className="grid grid-cols-5 gap-4">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center">
                  <div className="text-2xl font-bold text-gray-900">{campaign.recipients.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-1">Recipients</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.sent.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-1">Sent</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600">{campaign.delivered.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-1">Delivered</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-cyan-600">{campaign.read.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-1">Read</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-red-600">{campaign.failed}</div>
                  <div className="text-xs text-gray-600 mt-1">Failed</div>
                </div>
              </div>

              {campaign.status === 'sending' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((campaign.sent / campaign.recipients) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${(campaign.sent / campaign.recipients) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
