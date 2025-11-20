"use client";

import React, { useState } from 'react';
import { Webhook, Plus, Settings, Activity, CheckCircle, XCircle, Edit, Trash2, Copy, RefreshCw } from 'lucide-react';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: string;
  totalCalls: number;
  successRate: number;
}

export default function WhatsAppWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'New Message Handler',
      url: 'https://api.example.com/webhooks/messages',
      events: ['message.received', 'message.sent'],
      status: 'active',
      lastTriggered: '2 minutes ago',
      totalCalls: 1523,
      successRate: 98.5
    },
    {
      id: '2',
      name: 'Order Notification',
      url: 'https://api.example.com/webhooks/orders',
      events: ['order.created', 'order.updated'],
      status: 'active',
      lastTriggered: '15 minutes ago',
      totalCalls: 456,
      successRate: 99.2
    },
    {
      id: '3',
      name: 'Customer Status',
      url: 'https://api.example.com/webhooks/status',
      events: ['customer.subscribed', 'customer.unsubscribed'],
      status: 'error',
      lastTriggered: '1 hour ago',
      totalCalls: 234,
      successRate: 85.3
    },
  ]);

  const availableEvents = [
    'message.received',
    'message.sent',
    'message.delivered',
    'message.read',
    'customer.subscribed',
    'customer.unsubscribed',
    'order.created',
    'order.updated',
    'order.completed',
    'bot.replied',
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-300',
      inactive: 'bg-gray-100 text-gray-700 border-gray-300',
      error: 'bg-red-100 text-red-700 border-red-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Webhook className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Webhook Workflow
                </h1>
                <p className="text-gray-600">Configure and manage webhook integrations</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition flex items-center gap-2">
              <Plus size={20} />
              <span>Add Webhook</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Webhook className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Active Webhooks</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">3</div>
            <div className="text-sm text-indigo-600 mt-1">2 configured</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Total Calls</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">2.2K</div>
            <div className="text-sm text-green-600 mt-1">Today</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Success Rate</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">97.8%</div>
            <div className="text-sm text-blue-600 mt-1">Last 24 hours</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <XCircle className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Failed Calls</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">48</div>
            <div className="text-sm text-red-600 mt-1">Needs attention</div>
          </div>
        </div>

        {/* Available Events Reference */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📌</span>
            Available Events
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableEvents.map((event, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm rounded-lg border border-indigo-200 font-mono"
              >
                {event}
              </span>
            ))}
          </div>
        </div>

        {/* Webhooks List */}
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:scale-[1.01] transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    webhook.status === 'active' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                    webhook.status === 'error' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                    'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    <Webhook className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{webhook.name}</h3>
                      {getStatusBadge(webhook.status)}
                    </div>
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl font-mono text-sm text-gray-700 flex items-center justify-between">
                      <span className="truncate flex-1">{webhook.url}</span>
                      <button className="ml-3 p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition">
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {webhook.events.map((event, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-xs rounded-lg border border-blue-200"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                        <div className="text-xs text-gray-600 mb-1">Last Triggered</div>
                        <div className="text-sm font-bold text-gray-900">{webhook.lastTriggered}</div>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                        <div className="text-xs text-gray-600 mb-1">Total Calls</div>
                        <div className="text-sm font-bold text-gray-900">{webhook.totalCalls.toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <div className="text-xs text-gray-600 mb-1">Success Rate</div>
                        <div className="text-sm font-bold text-gray-900">{webhook.successRate}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <RefreshCw size={18} />
                  </button>
                  <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    <Settings size={18} />
                  </button>
                  <button className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                    <Edit size={18} />
                  </button>
                  <button className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {webhook.status === 'error' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle size={16} />
                    <span className="text-sm font-medium">Last error: Connection timeout after 30s</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Setup Guide */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Webhook Setup Guide
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p><strong>Create endpoint:</strong> Set up an HTTPS endpoint in your application to receive webhook events</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p><strong>Add webhook:</strong> Click "Add Webhook" and enter your endpoint URL and select events</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p><strong>Test connection:</strong> Send a test event to verify your endpoint is working correctly</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              <p><strong>Monitor:</strong> Check webhook logs and success rates regularly to ensure proper operation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
