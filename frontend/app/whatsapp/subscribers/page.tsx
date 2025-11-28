"use client";

import React, { useState } from 'react';
import { Users, UserPlus, Search, Filter, Download, Upload, Mail, Phone, Tag, TrendingUp, TrendingDown } from 'lucide-react';

interface Subscriber {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  tags: string[];
  lastMessage: string;
  joinedDate: string;
}

export default function WhatsAppSubscribersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);

  const subscribers: Subscriber[] = [
    {
      id: '1',
      name: 'أحمد محمد',
      phone: '+201234567890',
      status: 'active',
      tags: ['VIP', 'Customer'],
      lastMessage: '2024-01-20',
      joinedDate: '2023-12-01'
    },
    {
      id: '2',
      name: 'فاطمة علي',
      phone: '+201098765432',
      status: 'active',
      tags: ['Lead', 'Interested'],
      lastMessage: '2024-01-19',
      joinedDate: '2024-01-10'
    },
    {
      id: '3',
      name: 'محمود سعيد',
      phone: '+201555444333',
      status: 'inactive',
      tags: ['Customer'],
      lastMessage: '2023-12-15',
      joinedDate: '2023-11-20'
    },
    {
      id: '4',
      name: 'سارة أحمد',
      phone: '+201444555666',
      status: 'active',
      tags: ['VIP', 'Premium'],
      lastMessage: '2024-01-21',
      joinedDate: '2023-10-05'
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-300',
      inactive: 'bg-gray-100 text-gray-700 border-gray-300',
      blocked: 'bg-red-100 text-red-700 border-red-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const toggleSubscriber = (id: string) => {
    setSelectedSubscribers(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Subscriber Manager
              </h1>
              <p className="text-gray-600">Manage and segment your WhatsApp subscribers</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Total Subscribers</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">4,523</div>
            <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp size={14} />
              +245 this month
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <span className="text-gray-600 text-sm">Active</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">4,012</div>
            <div className="text-sm text-blue-600 mt-1">88.7% active rate</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <UserPlus className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">New Today</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">23</div>
            <div className="text-sm text-yellow-600 mt-1">+15% vs yesterday</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Unsubscribed</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">12</div>
            <div className="text-sm text-red-600 mt-1">This month</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search subscribers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2">
              <Download size={20} />
              <span>Export</span>
            </button>

            <button className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2">
              <Upload size={20} />
              <span>Import</span>
            </button>
          </div>

          {selectedSubscribers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedSubscribers.length} subscriber(s) selected
              </span>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm rounded-lg hover:shadow-lg transition flex items-center gap-2">
                  <Mail size={16} />
                  Send Message
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-lg hover:shadow-lg transition flex items-center gap-2">
                  <Tag size={16} />
                  Add Tag
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-lg hover:shadow-lg transition">
                  Block
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subscribers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border transition-all hover:scale-105 cursor-pointer ${
                selectedSubscribers.includes(subscriber.id)
                  ? 'border-purple-500 ring-2 ring-purple-200'
                  : 'border-gray-100'
              }`}
              onClick={() => toggleSubscriber(subscriber.id)}
            >
              {/* Avatar and Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {subscriber.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{subscriber.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone size={14} />
                    {subscriber.phone}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedSubscribers.includes(subscriber.id)}
                  onChange={() => toggleSubscriber(subscriber.id)}
                  className="w-5 h-5 text-cyan-600 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Status and Tags */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(subscriber.status)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {subscriber.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-xs rounded-lg border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-xs text-gray-600 mb-1">Last Message</div>
                  <div className="text-sm font-bold text-gray-900">{subscriber.lastMessage}</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-xs text-gray-600 mb-1">Joined</div>
                  <div className="text-sm font-bold text-gray-900">{subscriber.joinedDate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
