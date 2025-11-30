'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  // Always use Render backend where messages are stored
  const apiUrl = 'https://almasar-backend-glxc.onrender.com';
  const socketRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousMessageCountRef = useRef<number>(0);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'unassigned' | 'mentions'>('all');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [quickReplies] = useState([
    { id: '1', text: 'شكراً لتواصلك معنا! سنرد عليك قريباً' },
    { id: '2', text: 'مرحباً بك في المسار الساخن للسفر والسياحة' },
    { id: '3', text: 'نعتذر عن التأخير، سيتم الرد في أقرب وقت' },
    { id: '4', text: 'تم استلام طلبك وسيتم المتابعة' },
    { id: '5', text: 'لأي استفسار إضافي نحن في الخدمة' }
  ]);
  const isInitialLoad = useRef(true);

  // Initialize notification sound
  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audioRef.current.volume = 0.7;
  }, []);

  const loadConversations = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      console.log('🔄 جاري تحميل الرسائل من:', `${apiUrl}/api/whatsapp-business/recent-messages`);
      const response = await fetch(`${apiUrl}/api/whatsapp-business/recent-messages`);
      
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
        const timestamp = msg.timestamp || msg.createdAt || new Date().toISOString();
        const messageType = msg.type || 'received';
        
        if (!conversationsMap.has(phoneNumber)) {
          conversationsMap.set(phoneNumber, {
            id: phoneNumber,
            contactName: contactName,
            contactPhone: phoneNumber,
            lastMessage: messageText,
            lastMessageTime: timestamp,
            unreadCount: 0,
            messages: []
          });
        }
        
        const conversation = conversationsMap.get(phoneNumber)!;
        conversation.messages.push({
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          text: messageText,
          senderType: messageType === 'sent' ? 'agent' : 'user',
          createdAt: timestamp,
          status: 'delivered'
        });
        
        const msgTime = new Date(timestamp).getTime();
        const lastTime = new Date(conversation.lastMessageTime).getTime();
        if (msgTime > lastTime) {
          conversation.lastMessage = messageText;
          conversation.lastMessageTime = timestamp;
        }
      });
      
      const conversationsArray = Array.from(conversationsMap.values()).sort((a, b) => {
        const timeA = new Date(a.lastMessageTime).getTime();
        const timeB = new Date(b.lastMessageTime).getTime();
        return timeB - timeA;
      });
      
      console.log('📱 المحادثات:', conversationsArray.length);
      
      // Play notification sound if new messages arrived
      const currentMessageCount = messages.length;
      if (previousMessageCountRef.current > 0 && currentMessageCount > previousMessageCountRef.current) {
        playNotificationSound();
      }
      previousMessageCountRef.current = currentMessageCount;
      
      // Only update if conversations changed
      setConversations(prev => {
        const hasChanged = JSON.stringify(prev) !== JSON.stringify(conversationsArray);
        return hasChanged ? conversationsArray : prev;
      });
      
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
    }
    if (showLoading) {
      setLoading(false);
    }
  }, [apiUrl]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations(true);
    
    // Refresh conversations every 5 seconds (without loading indicator)
    const interval = setInterval(() => {
      loadConversations(false);
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [loadConversations]);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.warn('⚠️ Could not play notification sound:', err);
        });
      }
    } catch (error) {
      console.warn('⚠️ Notification sound error:', error);
    }
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
      const response = await fetch(`${apiUrl}/api/whatsapp-business/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedConversation.contactPhone || selectedConversation.id,
          message: messageToSend,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      
      const sentMessage = {
        ...newMessage,
        id: result.messageId || tempId,
        status: 'sent' as const
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? sentMessage : msg
      ));
      
      // Update conversation last message AND add message to conversation
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { 
              ...c, 
              lastMessage: messageToSend, 
              lastMessageTime: new Date().toISOString(),
              messages: [...(c.messages || []), sentMessage]
            }
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

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      alert('من فضلك أدخل الاسم ورقم الهاتف');
      return;
    }
    
    try {
      await fetch(`${apiUrl}/api/whatsapp-business/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: newContact.phone,
          message: `مرحباً ${newContact.name}! تم إضافتك كعميل في المسار الساخن للسفر والسياحة 🌍✨`
        }),
      });
      
      alert('تم إضافة العميل وإرسال رسالة ترحيب!');
      setShowAddContact(false);
      setNewContact({ name: '', phone: '' });
      loadConversations(false);
    } catch (error) {
      alert('حدث خطأ في إضافة العميل');
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim() || selectedContacts.length === 0) {
      alert('من فضلك اختر عملاء واكتب رسالة');
      return;
    }
    
    try {
      for (const contactId of selectedContacts) {
        await fetch(`${apiUrl}/api/whatsapp-business/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contactId,
            message: broadcastMessage
          }),
        });
      }
      
      alert(`تم إرسال الرسالة لـ ${selectedContacts.length} عميل!`);
      setShowBroadcast(false);
      setBroadcastMessage('');
      setSelectedContacts([]);
    } catch (error) {
      alert('حدث خطأ في الإرسال الجماعي');
    }
  };

  const insertQuickReply = (text: string) => {
    setMessageText(text);
    setShowQuickReplies(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 16 * 1024 * 1024) {
      alert('حجم الملف كبير جداً (الحد الأقصى 16 ميجا)');
      return;
    }
    
    alert('جاري تحضير ميزة إرفاق الملفات...');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white" dir="rtl">
      {/* Sidebar - Conversations List */}
      <div className="w-[380px] bg-gray-800/50 backdrop-blur-lg border-l border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-600 to-emerald-600 border-b border-teal-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              صندوق الوارد الموحد
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAddContact(true)}
                className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 text-sm font-medium"
                title="إضافة عميل جديد"
              >
                <User className="w-4 h-4" />
                عميل جديد
              </button>
              <button 
                onClick={() => setShowBroadcast(true)}
                className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 text-sm font-medium"
                title="رسالة جماعية"
              >
                <Bell className="w-4 h-4" />
                جماعي
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="ابحث عن محادثة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/50 pr-10 pl-4 py-2.5 rounded-xl border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800/40 backdrop-blur-sm border-b border-slate-700/50 text-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 font-medium transition-all ${
              activeTab === 'all' 
                ? 'text-teal-400 border-b-2 border-teal-400 bg-teal-500/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            الكل ({filteredConversations.length})
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-3 font-medium transition-all ${
              activeTab === 'mine' 
                ? 'text-teal-400 border-b-2 border-teal-400 bg-teal-500/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            محادثاتي
          </button>
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`flex-1 py-3 font-medium transition-all ${
              activeTab === 'unassigned' 
                ? 'text-teal-400 border-b-2 border-teal-400 bg-teal-500/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
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
                className={`w-full p-4 border-b border-gray-700/50 hover:bg-white/5 transition-all text-right ${
                  selectedConversation?.id === conv.id ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                    {conv.contactName.charAt(0).toUpperCase()}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
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
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full px-2 py-0.5 ml-2 font-medium shadow-lg">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <MessageSquare className="w-3 h-3" />
                        واتساب
                      </span>
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
            <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {selectedConversation.contactName.charAt(0).toUpperCase()}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{selectedConversation.contactName}</h2>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedConversation.contactPhone}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => alert('جاري الاتصال...')}
                    className="p-2.5 hover:bg-green-600/20 text-green-400 hover:text-green-300 rounded-xl transition-all hover:shadow-lg"
                    title="اتصال صوتي"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => alert('جاري بدء مكالمة الفيديو...')}
                    className="p-2.5 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 rounded-xl transition-all hover:shadow-lg"
                    title="مكالمة فيديو"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('هل تريد أرشفة هذه المحادثة؟')) {
                        alert('تم الأرشفة بنجاح');
                      }
                    }}
                    className="p-2.5 hover:bg-yellow-600/20 text-yellow-400 hover:text-yellow-300 rounded-xl transition-all hover:shadow-lg"
                    title="أرشفة"
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className="p-2.5 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 rounded-xl transition-all hover:shadow-lg"
                    title="معلومات جهة الاتصال"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => alert('المزيد من الخيارات')}
                    className="p-2.5 hover:bg-gray-600/20 text-gray-400 hover:text-gray-300 rounded-xl transition-all hover:shadow-lg"
                    title="المزيد"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area with Background */}
            <div 
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundColor: 'rgba(15, 23, 42, 0.95)'
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[75%] ${msg.senderType === 'user' ? '' : 'order-2'}`}>
                    <div
                      className={`rounded-2xl px-5 py-3 shadow-lg ${
                        msg.senderType === 'user'
                          ? 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1.5 text-xs ${
                      msg.senderType === 'user' ? 'text-gray-400' : 'text-gray-400 justify-end'
                    }`}>
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.senderType === 'agent' && msg.status === 'sent' && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-lg border-t border-slate-700/50 p-4 shadow-2xl">
              {/* Quick Replies */}
              {showQuickReplies && (
                <div className="mb-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">الردود الجاهزة</span>
                    <button onClick={() => setShowQuickReplies(false)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => insertQuickReply(reply.text)}
                        className="w-full text-right p-2 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
                <button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="p-2.5 hover:bg-teal-600/20 text-teal-400 hover:text-teal-300 rounded-xl transition-all hover:shadow-lg"
                  title="إرفاق ملف"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className="p-2.5 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 rounded-xl transition-all hover:shadow-lg"
                  title="ردود جاهزة"
                >
                  <Star className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 hover:bg-yellow-600/20 text-yellow-400 hover:text-yellow-300 rounded-xl transition-all hover:shadow-lg relative"
                  title="إيموجي"
                >
                  <Smile className="w-5 h-5" />
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-50">
                      <div className="grid grid-cols-5 gap-2 text-2xl">
                        {['😊', '😂', '❤️', '👍', '🔥', '🎉', '✨', '🌟', '💪', '🙏', '👏', '✅', '❌', '⚠️', '📱'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessageText(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="hover:bg-slate-700 p-2 rounded-lg transition-all"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
                
                <input
                  type="text"
                  placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1 bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 px-5 py-3.5 rounded-2xl border border-white/10 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed p-3.5 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-300">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                مرحباً بك في صندوق الوارد
              </h3>
              <p className="text-gray-400">اختر محادثة من القائمة لبدء المراسلة</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Info Sidebar - Right Side */}
      {selectedConversation && showContactInfo && (
        <div className="w-[350px] bg-gray-800/50 backdrop-blur-lg border-r border-gray-700/50 overflow-y-auto">
          <div className="p-6">
            {/* Close Button */}
            <button
              onClick={() => setShowContactInfo(false)}
              className="float-left text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Contact Profile */}
            <div className="text-center mb-6 mt-2">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl mb-4">
                {selectedConversation.contactName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold mb-1">{selectedConversation.contactName}</h2>
              <p className="text-sm text-gray-400">{selectedConversation.contactPhone}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button 
                onClick={() => alert('جاري الاتصال...')}
                className="flex flex-col items-center gap-2 p-4 bg-green-600/20 hover:bg-green-600/30 rounded-xl transition-all"
              >
                <Phone className="w-6 h-6 text-green-400" />
                <span className="text-xs text-gray-300">اتصال</span>
              </button>
              <button 
                onClick={() => alert('جاري بدء مكالمة الفيديو...')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl transition-all"
              >
                <Video className="w-6 h-6 text-blue-400" />
                <span className="text-xs text-gray-300">فيديو</span>
              </button>
              <button 
                onClick={() => alert('البحث في المحادثة')}
                className="flex flex-col items-center gap-2 p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl transition-all"
              >
                <Search className="w-6 h-6 text-purple-400" />
                <span className="text-xs text-gray-300">بحث</span>
              </button>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  معلومات جهة الاتصال
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">الاسم</span>
                    <span className="text-white font-medium">{selectedConversation.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الهاتف</span>
                    <span className="text-white font-medium">{selectedConversation.contactPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">المنصة</span>
                    <span className="text-green-400 font-medium flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      واتساب
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  الوسوم
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">عميل جديد</span>
                  <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">نشط</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  آخر نشاط
                </h3>
                <p className="text-sm text-gray-300">{getTimeAgo(selectedConversation.lastMessageTime)}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">ملاحظات</h3>
                <textarea
                  placeholder="أضف ملاحظات عن هذا العميل..."
                  className="w-full bg-white/5 text-white text-sm p-3 rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddContact(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">إضافة عميل جديد</h3>
              <button onClick={() => setShowAddContact(false)} className="text-gray-400 hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الاسم</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="أدخل الاسم"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">رقم الهاتف</label>
                <input
                  type="text"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-left"
                  placeholder="966xxxxxxxxx"
                  dir="ltr"
                />
                <p className="text-xs text-gray-400 mt-1">بدون + أو 00، مثال: 966555123456</p>
              </div>
              
              <button
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.phone}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none font-medium"
              >
                إضافة وإرسال رسالة ترحيبية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowBroadcast(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">إرسال رسالة جماعية</h3>
              <button onClick={() => setShowBroadcast(false)} className="text-gray-400 hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  اختر المستلمين ({selectedContacts.length} محدد)
                </label>
                <div className="bg-slate-700/30 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {conversations.map((conv) => (
                    <label key={conv.id} className="flex items-center gap-3 p-2 hover:bg-slate-700/40 rounded-lg cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(conv.contactPhone)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContacts([...selectedContacts, conv.contactPhone]);
                          } else {
                            setSelectedContacts(selectedContacts.filter(p => p !== conv.contactPhone));
                          }
                        }}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{conv.contactName}</div>
                        <div className="text-xs text-gray-400">{conv.contactPhone}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">نص الرسالة</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-h-32"
                  placeholder="اكتب الرسالة التي تريد إرسالها لجميع المستلمين المحددين..."
                />
              </div>
              
              <button
                onClick={handleBroadcast}
                disabled={selectedContacts.length === 0 || !broadcastMessage.trim()}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none font-medium"
              >
                إرسال لـ {selectedContacts.length} {selectedContacts.length === 1 ? 'شخص' : 'أشخاص'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
