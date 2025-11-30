'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, User, Clock } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  from: string;
  body: string;
  timestamp: string;
  contactName: string;
  type: string;
}

export default function WhatsAppMessagesPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('wss://almasar-backend-glxc.onrender.com');
    
    ws.onopen = () => {
      console.log('✅ Connected to WebSocket');
      setLoading(false);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'new-message') {
        console.log('📨 New message received:', data.data);
        setMessages((prev) => [data.data, ...prev]);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setLoading(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString('ar-EG');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              رسائل واتساب - مباشر
            </h1>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">جاري الاتصال...</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                في انتظار الرسائل الجديدة...
              </p>
              <p className="text-gray-400 mt-2">
                ابعت رسالة على واتساب: 0555254915
              </p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-800">
                      {message.contactName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {message.from}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-4 h-4" />
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
                <p className="text-gray-700 text-lg mt-2">{message.body}</p>
                <div className="mt-2 text-xs text-gray-400">
                  نوع الرسالة: {message.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🟢 متصل بالخادم - الرسائل ستظهر فوراً</p>
        </div>
      </div>
    </div>
  );
}
