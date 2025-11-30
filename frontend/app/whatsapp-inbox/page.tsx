'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Phone, Video, MoreVertical, Send, Paperclip, 
  Smile, Check, CheckCheck, Archive, Tag, User, Clock,
  Bell, Star, AlertCircle, Menu, X, MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  senderType: 'user' | 'agent';
  createdAt: string;
  status?: string;
}

interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function WhatsAppInboxPage() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://almasar-backend-glxc.onrender.com';
  const socketRef = useRef<any>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'unassigned' | 'mentions'>('all');

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    
    // Refresh conversations every 5 seconds
    const interval = setInterval(() => {
      loadConversations();
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);



  const loadConversations = async () => {
    setLoading(true);
    try {
      console.log('🔄 جاري تحميل الرسائل من:', `${apiUrl}/api/api/whatsapp-business/recent-messages`);
      const response = await fetch(`${apiUrl}/api/api/whatsapp-business/recent-messages`);
      
      if (!response.ok) {
        console.warn('⚠️ Backend غير متاح');
        setLoading(false);
        return;
      }
      
      const messagesData = await response.json();
      console.log('✅ الرد من API:', messagesData);
      
      // Backend returns { success: true, messages: [...] }
      const messages = messagesData.messages || [];
      console.log('✅ عدد الرسائل:', messages.length);
      
      const conversationsMap = new Map<string, Conversation>();
      
      messages.forEach((msg: any) => {
        const phoneNumber = msg.from;
        const contactName = msg.contactName || msg.profile?.name || phoneNumber;
        const messageText = msg.body || msg.text?.body || msg.text || '';
        
        if (!conversationsMap.has(phoneNumber)) {
          conversationsMap.set(phoneNumber, {
            id: phoneNumber,
            contactName: contactName,
            contactPhone: phoneNumber,
            lastMessage: messageText,
            lastMessageTime: msg.timestamp,
            unreadCount: 0,
            messages: []
          });
        }
        
        const conversation = conversationsMap.get(phoneNumber)!;
        conversation.messages.push({
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          text: messageText,
          senderType: msg.type === 'sent' ? 'agent' : 'user',
          createdAt: msg.timestamp,
          status: 'delivered'
        });
        
        const msgTime = new Date(msg.timestamp).getTime();
        const lastTime = new Date(conversation.lastMessageTime).getTime();
        if (msgTime > lastTime) {
          conversation.lastMessage = messageText;
          conversation.lastMessageTime = msg.timestamp;
        }
      });
      
      const conversationsArray = Array.from(conversationsMap.values()).sort((a, b) => {
        const timeA = new Date(a.lastMessageTime).getTime();
        const timeB = new Date(b.lastMessageTime).getTime();
        return timeB - timeA;
      });
      
      console.log('📱 المحادثات:', conversationsArray.length);
      setConversations(conversationsArray);
      
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
    }
    setLoading(false);
  };

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMessages(conv.messages || []);
    
    // Mark as read
    setConversations(prev => prev.map(c => 
      c.id === conv.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const messageToSend = messageText.trim();
    const tempId = `msg-${Date.now()}`;
    
    const newMessage: Message = {
      id: tempId,
      text: messageToSend,
      senderType: 'agent',
      createdAt: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    try {
      const response = await fetch(`${apiUrl}/api/api/whatsapp-business/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedConversation.contactPhone || selectedConversation.id,
          message: messageToSend,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, id: result.messageId || tempId, status: 'sent' }
          : msg
      ));
      
      // Update conversation last message
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, lastMessage: messageToSend, lastMessageTime: new Date().toISOString() }
          : c
      ));
      
    } catch (error) {
      console.error('❌ خطأ في الإرسال:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const messageTime = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - messageTime) / 1000);
    
    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} د`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} س`;
    return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contactPhone.includes(searchQuery) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0f1e] text-white" dir="rtl">
      {/* Sidebar - Conversations List */}
      <div className="w-[400px] bg-[#111827] border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#1a2332] border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">صندوق الوارد الموحد</h1>
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0f1e] text-white pr-10 pl-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#1a2332] border-b border-gray-700 text-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 ${activeTab === 'all' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            الكل ({filteredConversations.length})
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-3 ${activeTab === 'mine' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            محادثاتي
          </button>
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`flex-1 py-3 ${activeTab === 'unassigned' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            غير مسندة
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد محادثات</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 border-b border-gray-700 hover:bg-[#1a2332] transition-colors text-right ${
                  selectedConversation?.id === conv.id ? 'bg-[#1a2332]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {conv.contactName.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white truncate">{conv.contactName}</h3>
                      <span className="text-xs text-gray-400">{getTimeAgo(conv.lastMessageTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">واتساب</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#1a2332] border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {selectedConversation.contactName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedConversation.contactName}</h2>
                    <p className="text-sm text-gray-400">{selectedConversation.contactPhone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <Archive className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0a0f1e]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'agent' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[70%] ${msg.senderType === 'agent' ? '' : 'order-2'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.senderType === 'agent'
                          ? 'bg-gray-700 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${msg.senderType === 'user' ? 'justify-end' : ''}`}>
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.senderType === 'agent' && msg.status === 'sent' && (
                        <CheckCheck className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-[#1a2332] border-t border-gray-700 p-4">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <Smile className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 bg-[#0a0f1e] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-3 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">مرحباً بك في صندوق الوارد</h3>
              <p>اختر محادثة من القائمة لبدء المراسلة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
