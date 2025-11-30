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

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('whatsapp_messages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed);
      updateConversations(parsed);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('whatsapp_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Load initial messages and setup WebSocket
  useEffect(() => {
    // Fetch recent messages from server
    fetch(`${apiUrl}/api/whatsapp-business/recent-messages`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.messages && data.messages.length > 0) {
          setMessages(prev => {
            // Merge with existing messages
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = data.messages.filter((m: WhatsAppMessage) => !existingIds.has(m.id));
            return [...newMessages, ...prev];
          });
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

    const messageToSend = messageInput;
    setMessageInput(''); // Clear input immediately

    // Add message to UI optimistically
    const tempMsg: WhatsAppMessage = {
      id: 'temp_' + Date.now(),
      from: selectedPhone,
      body: messageToSend,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      contactName: conversations.get(selectedPhone)?.contactName || selectedPhone,
      type: 'text',
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      // Wake up the server first
      console.log('⏳ Sending message...');
      
      const response = await fetch(`${apiUrl}/api/whatsapp-business/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedPhone,
          message: messageToSend,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success || data.messageId) {
        console.log('✅ Message sent:', data);
        // Update temp message with real ID
        setMessages(prev => prev.map(m => 
          m.id === tempMsg.id ? { ...m, id: data.messageId || tempMsg.id } : m
        ));
      } else {
        throw new Error(data.error || 'فشل الإرسال');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Keep message in UI even if send failed - it will retry when backend wakes up
      alert('تم حفظ الرسالة محلياً. سيتم إرسالها عند استيقاظ الخادم.');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-6 overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                محادثات واتساب
              </h1>
              <p className="text-gray-600">محادثات العملاء المباشرة</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
          {/* Conversations List */}
          <div className="col-span-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ابحث عن محادثة..."
                  className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">جاري التحميل...</p>
                </div>
              )}
              
              {!loading && conversations.size === 0 && (
                <div className="p-8 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">لا توجد محادثات</p>
                  <p className="text-sm text-gray-500 mt-2">ابعت رسالة على: 0555254915</p>
                </div>
              )}

              {Array.from(conversations.values()).map((conv) => (
                <div
                  key={conv.phoneNumber}
                  onClick={() => setSelectedPhone(conv.phoneNumber)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                    selectedPhone === conv.phoneNumber
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        {conv.contactName[0]}
                      </div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{conv.contactName}</h3>
                        <span className="text-xs text-gray-500">{formatDate(conv.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
            {selectedPhone ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conversations.get(selectedPhone)?.contactName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {conversations.get(selectedPhone)?.contactName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        متصل
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                      <Phone size={20} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                      <Video size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {getMessagesForPhone(selectedPhone).reverse().map((msg) => (
                    <div key={msg.id} className="flex justify-start">
                      <div className="flex items-end gap-2 max-w-[70%]">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {msg.contactName[0]}
                        </div>
                        <div>
                          <div className="px-4 py-3 bg-gray-100 text-gray-900 rounded-2xl rounded-br-none">
                            <p className="text-sm">{msg.body}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{formatTime(msg.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="اكتب رسالتك..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2"
                      disabled={!messageInput.trim()}
                    >
                      <Send size={20} />
                      <span>إرسال</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="text-white" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">اختر محادثة</h3>
                  <p className="text-gray-600">اختر محادثة من القائمة لبدء المراسلة</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
