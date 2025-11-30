'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, Phone, Video, Search, User, Clock, CheckCheck } from 'lucide-react';
import io from 'socket.io-client';

interface WhatsAppMessage {
  id: string;
  from: string;
  body: string;
  timestamp: string;
  contactName: string;
  type: string;
  createdAt: Date;
}

interface Conversation {
  phoneNumber: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export default function WhatsAppConversationsPage() {
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const apiUrl = 'https://almasar-backend-glxc.onrender.com';

  // Load initial messages and setup WebSocket
  useEffect(() => {
    // Fetch recent messages
    fetch(`${apiUrl}/api/whatsapp-business/recent-messages`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.messages) {
          setMessages(data.messages);
          updateConversations(data.messages);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading messages:', err);
        setLoading(false);
      });

    // Connect to WebSocket
    const socket = io(`${apiUrl}/whatsapp`);
    
    socket.on('connect', () => {
      console.log('✅ Connected to WhatsApp WebSocket');
    });

    socket.on('new-message', (message: WhatsAppMessage) => {
      console.log('📨 New message:', message);
      setMessages(prev => [message, ...prev]);
      updateConversationsWithMessage(message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateConversations = (msgs: WhatsAppMessage[]) => {
    const convMap = new Map<string, Conversation>();
    
    msgs.forEach(msg => {
      const existing = convMap.get(msg.from);
      if (!existing || new Date(msg.createdAt) > new Date(existing.timestamp)) {
        convMap.set(msg.from, {
          phoneNumber: msg.from,
          contactName: msg.contactName,
          lastMessage: msg.body,
          timestamp: msg.timestamp,
          unread: 0,
        });
      }
    });
    
    setConversations(convMap);
  };

  const updateConversationsWithMessage = (msg: WhatsAppMessage) => {
    setConversations(prev => {
      const newMap = new Map(prev);
      newMap.set(msg.from, {
        phoneNumber: msg.from,
        contactName: msg.contactName,
        lastMessage: msg.body,
        timestamp: msg.timestamp,
        unread: (newMap.get(msg.from)?.unread || 0) + 1,
      });
      return newMap;
    });
  };

  const getMessagesForPhone = (phone: string) => {
    return messages.filter(m => m.from === phone);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return formatTime(timestamp);
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-EG');
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedPhone) return;

    try {
      const response = await fetch(`${apiUrl}/api/whatsapp-business/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedPhone,
          message: messageInput,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Message sent:', data);
        setMessageInput('');
        
        // Add sent message to UI
        const sentMsg: WhatsAppMessage = {
          id: data.messageId || Date.now().toString(),
          from: selectedPhone,
          body: messageInput,
          timestamp: Math.floor(Date.now() / 1000).toString(),
          contactName: conversations.get(selectedPhone)?.contactName || selectedPhone,
          type: 'text',
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, sentMsg]);
      } else {
        alert('فشل إرسال الرسالة: ' + (data.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('فشل إرسال الرسالة');
    }
  };

  return (
    <div className="flex h-screen bg-[#0b1426]" dir="rtl">
      {/* Conversations List */}
      <div className="w-96 bg-[#151f36] border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#1a2744] border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-green-500" />
              واتساب
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="w-full bg-[#0b1426] text-white px-10 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4">جاري التحميل...</p>
            </div>
          )}
          
          {!loading && conversations.size === 0 && (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p>لا توجد محادثات</p>
              <p className="text-sm mt-2">ابعت رسالة على: 0555254915</p>
            </div>
          )}

          {Array.from(conversations.values()).map((conv) => (
            <div
              key={conv.phoneNumber}
              onClick={() => setSelectedPhone(conv.phoneNumber)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-[#1a2744] transition ${
                selectedPhone === conv.phoneNumber ? 'bg-[#1a2744]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {conv.contactName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold truncate">{conv.contactName}</h3>
                    <span className="text-xs text-gray-400">{formatDate(conv.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[24px] text-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedPhone ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#1a2744] border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {conversations.get(selectedPhone)?.contactName[0]}
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">
                      {conversations.get(selectedPhone)?.contactName}
                    </h2>
                    <p className="text-sm text-gray-400">{selectedPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#0b1426]">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#0b1426]">
                    <Video className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0b1426]">
              {getMessagesForPhone(selectedPhone).reverse().map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
                    {msg.contactName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#1f2f4d] rounded-lg p-3 max-w-xl">
                      <p className="text-white">{msg.body}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-[#1a2744] border-t border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 bg-[#0b1426] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition disabled:opacity-50"
                  disabled={!messageInput.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0b1426]">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-24 h-24 mx-auto mb-4 text-gray-600" />
              <p className="text-xl">اختر محادثة لبدء المراسلة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
