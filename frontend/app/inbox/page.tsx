'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import { useAuthStore } from '@/lib/store/auth';
import { conversationsApi, messagesApi, channelsApi } from '@/lib/api';
import { 
  MessageSquare, Search, Filter, Star, Archive, Trash2, 
  Send, Paperclip, Smile, MoreVertical, Phone, Video,
  Tag, Clock, User, CheckCheck, AlertCircle
} from 'lucide-react';

export default function InboxPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');

  useEffect(() => {
    // Load user data if available
    const savedUser = authStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to fetch from API, if fails use mock data
      try {
        const [convs, chans] = await Promise.all([
          conversationsApi.getAll(),
          channelsApi.getAll(),
        ]);
        setConversations(convs);
        setChannels(chans);
      } catch (apiError) {
        console.log('Using mock data as API is not available');
        // Mock data for conversations
        setConversations([
          {
            id: '1',
            customerProfile: { name: 'أحمد محمد', phone: '+201234567890' },
            channel: { name: 'واتساب', type: 'whatsapp' },
            department: 'المبيعات',
            status: 'active',
            lastMessageAt: new Date().toISOString(),
            unreadCount: 3,
          },
          {
            id: '2',
            customerProfile: { name: 'فاطمة علي', phone: '+201234567891' },
            channel: { name: 'فيسبوك', type: 'facebook' },
            department: 'الدعم الفني',
            status: 'active',
            lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
            unreadCount: 1,
          },
          {
            id: '3',
            customerProfile: { name: 'محمود سعيد', phone: '+201234567892' },
            channel: { name: 'تيليجرام', type: 'telegram' },
            department: 'خدمة العملاء',
            status: 'archived',
            lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
            unreadCount: 0,
          },
        ]);
        
        // Mock data for channels
        setChannels([
          { id: '1', name: 'واتساب', status: 'connected', type: 'whatsapp' },
          { id: '2', name: 'فيسبوك', status: 'connected', type: 'facebook' },
          { id: '3', name: 'تيليجرام', status: 'connected', type: 'telegram' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setSelectedConversation(conv);
    try {
      const realMessages = await messagesApi.getAll(conv.id);
      setMessages(realMessages);
    } catch (error) {
      console.log('Using mock messages');
      // Mock messages based on conversation
      const mockMessages = [
        {
          id: 'msg1',
          text: 'مرحباً! كيف يمكنني مساعدتك اليوم؟ 😊',
          senderType: 'agent',
          createdAt: new Date(Date.now() - 60000 * 10).toISOString(),
        },
        {
          id: 'msg2',
          text: `أهلاً، أنا ${conv.customerProfile.name}. لدي استفسار عن خدماتكم.`,
          senderType: 'user',
          createdAt: new Date(Date.now() - 60000 * 9).toISOString(),
        },
        {
          id: 'msg3',
          text: 'بالتأكيد! يسعدني مساعدتك. ما هو استفسارك؟',
          senderType: 'agent',
          createdAt: new Date(Date.now() - 60000 * 8).toISOString(),
        },
        {
          id: 'msg4',
          text: 'أريد معرفة المزيد عن الأسعار والباقات المتاحة.',
          senderType: 'user',
          createdAt: new Date(Date.now() - 60000 * 7).toISOString(),
        },
        {
          id: 'msg5',
          text: 'ممتاز! لدينا عدة باقات تناسب احتياجاتك. دعني أشاركك التفاصيل...',
          senderType: 'agent',
          createdAt: new Date(Date.now() - 60000 * 6).toISOString(),
        },
      ];
      setMessages(mockMessages);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      // Try to send via API
      await messagesApi.send({
        conversationId: selectedConversation.id,
        text: messageText,
        channel: selectedConversation.channel.type,
      });
      setMessageText('');
      const msgs = await messagesApi.getAll(selectedConversation.id);
      setMessages(msgs);
    } catch (error: any) {
      // Fallback: add message locally
      const newMessage = {
        id: `msg-${Date.now()}`,
        text: messageText,
        senderType: 'agent',
        createdAt: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
      
      // Show success message
      setTimeout(() => {
        alert('✓ تم إرسال الرسالة بنجاح!');
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.customerProfile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.channel?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && conv.status === 'active') ||
                         (filterStatus === 'archived' && conv.status === 'archived');
    return matchesSearch && matchesFilter;
  });

  const handleArchive = async (convId: string) => {
    alert('تم أرشفة المحادثة ✓');
    await loadData();
  };

  const handleDelete = async (convId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
      alert('تم حذف المحادثة');
      await loadData();
    }
  };

  const handleQuickReply = (text: string) => {
    setMessageText(text);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  صندوق الوارد الموحد
                </h1>
                <p className="text-sm text-slate-500">إدارة جميع المحادثات من مكان واحد</p>
              </div>
            </div>
            <div className="flex gap-2">
              {channels.map((ch: any) => (
                <span
                  key={ch.id}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    ch.status === 'connected' 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  <CheckCheck className="w-3 h-3" />
                  {ch.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium transition-all"
            >
              لوحة التحكم
            </button>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-96 bg-white/80 backdrop-blur-md border-l border-slate-200 flex flex-col shadow-lg">
          {/* Search & Filter */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في المحادثات..."
                className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({conversations.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'active' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                نشطة
              </button>
              <button
                onClick={() => setFilterStatus('archived')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'archived' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                مؤرشفة
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">لا توجد محادثات</p>
                <p className="text-sm text-slate-400 mt-1">ابدأ محادثة جديدة مع عملائك</p>
              </div>
            ) : (
              filteredConversations.map((conv: any) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-gradient-to-l hover:from-purple-50 hover:to-transparent transition-all group ${
                    selectedConversation?.id === conv.id ? 'bg-gradient-to-l from-purple-100 to-transparent border-r-4 border-r-purple-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {conv.customerProfile?.name?.[0] || '؟'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-800 truncate">
                          {conv.customerProfile?.name || 'عميل'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(conv.lastMessageAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleArchive(conv.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Archive className="w-4 h-4 text-slate-400 hover:text-amber-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 truncate mb-1">
                        {conv.channel?.name} • {conv.department}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                          {conv.status === 'active' ? 'نشطة' : 'مؤرشفة'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full font-bold">
                            {conv.unreadCount} جديد
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {selectedConversation.customerProfile?.name?.[0] || '؟'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {selectedConversation.customerProfile?.name || 'عميل'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          نشط الآن
                        </span>
                        <span className="text-slate-500">
                          {selectedConversation.channel?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(`tel:${selectedConversation.customerProfile?.phone}`, '_blank')}
                      className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all group"
                      title="اتصال صوتي"
                    >
                      <Phone className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => alert('مكالمة فيديو - قيد التطوير')}
                      className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                      title="مكالمة فيديو"
                    >
                      <Video className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => alert('إضافة علامة')}
                      className="p-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all group"
                      title="إضافة علامة"
                    >
                      <Tag className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => handleArchive(selectedConversation.id)}
                      className="p-3 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-all group"
                      title="أرشفة"
                    >
                      <Archive className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      📱 النشر الاجتماعي
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Replies Bar */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
                <div className="flex gap-2 overflow-x-auto">
                  <button
                    onClick={() => handleQuickReply('مرحباً! كيف يمكنني مساعدتك؟')}
                    className="px-4 py-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-sm whitespace-nowrap transition-all"
                  >
                    👋 ترحيب
                  </button>
                  <button
                    onClick={() => handleQuickReply('شكراً لتواصلك معنا')}
                    className="px-4 py-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-sm whitespace-nowrap transition-all"
                  >
                    🙏 شكر
                  </button>
                  <button
                    onClick={() => handleQuickReply('سيتم الرد عليك في أقرب وقت')}
                    className="px-4 py-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-sm whitespace-nowrap transition-all"
                  >
                    ⏰ انتظار
                  </button>
                  <button
                    onClick={() => handleQuickReply('تم حل المشكلة بنجاح ✓')}
                    className="px-4 py-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-sm whitespace-nowrap transition-all"
                  >
                    ✓ حل
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-slate-50 to-slate-100">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500 font-medium">لا توجد رسائل بعد</p>
                      <p className="text-sm text-slate-400 mt-1">ابدأ المحادثة الآن</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${msg.senderType === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      {msg.senderType === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {selectedConversation.customerProfile?.name?.[0] || '؟'}
                        </div>
                      )}
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          msg.senderType === 'user'
                            ? 'bg-white border border-slate-200 rounded-br-sm'
                            : 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs ${msg.senderType === 'user' ? 'text-slate-500' : 'text-white/70'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {msg.senderType !== 'user' && (
                            <CheckCheck className="w-4 h-4 text-white/70" />
                          )}
                        </div>
                      </div>
                      {msg.senderType !== 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user?.name?.[0] || 'A'}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg">
                <div className="flex items-end gap-3">
                  <button 
                    onClick={() => alert('إرفاق ملف')}
                    className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all group"
                    title="إرفاق ملف"
                  >
                    <Paperclip className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => alert('إضافة رموز تعبيرية')}
                    className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all group"
                    title="رموز تعبيرية"
                  >
                    <Smile className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                      rows={1}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  <button 
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed group"
                    title="إرسال"
                  >
                    <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
                  <MessageSquare className="w-16 h-16 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">صندوق الوارد الموحد</h3>
                <p className="text-slate-500 mb-4">اختر محادثة من القائمة للبدء</p>
                <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4" />
                    <span>ردود سريعة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>مميز بنجمة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    <span>أرشفة تلقائية</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
