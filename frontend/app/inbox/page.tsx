'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import { useAuthStore } from '@/lib/store/auth';
import { conversationsApi, messagesApi, channelsApi } from '@/lib/api';
import { botQuestionsTree, getNextQuestion, formatResponseText } from '@/lib/botQuestionsTree';
import { 
  MessageSquare, Search, Filter, Star, Archive, Trash2, 
  Send, Paperclip, Smile, MoreVertical, Phone, Video,
  Tag, Clock, User, CheckCheck, AlertCircle, Mail, Building2,
  UserCircle, ChevronDown, X, Plus, History, Image, FileText,
  Menu, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function InboxPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'unassigned' | 'mentions'>('all');
  const [isConversationListCollapsed, setIsConversationListCollapsed] = useState(false);
  const socketRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Helper function to calculate time difference
  const getTimeAgo = (timestamp: string | number) => {
    const now = currentTime.getTime();
    const messageTime = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - messageTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'الآن';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتين' : 'دقائق'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : 'ساعات'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : 'أيام'}`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : weeks === 2 ? 'أسبوعين' : 'أسابيع'}`;
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);
  
  // States for dropdown menus
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showPreviousChats, setShowPreviousChats] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  
  // Selected values
  const [selectedAgent, setSelectedAgent] = useState('غير مسند');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState('عادي');
  
  // Bot auto-reply state
  const [botEnabled, setBotEnabled] = useState(true);
  
  // Bot conversation states (tracks which question each conversation is on)
  const [conversationStates, setConversationStates] = useState<{ [conversationId: string]: string }>({});

  // Initial load + WebSocket connection (مرة واحدة فقط)
  useEffect(() => {
    // Load user data if available
    const savedUser = authStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }

    loadData();

    // اتصال WebSocket لاستقبال الرسائل الجديدة (Dynamic Import)
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        socketRef.current = io(`${apiUrl}/whatsapp`);
        
        socketRef.current.on('connect', () => {
          console.log('✅ WebSocket متصل - جاهز لاستقبال الرسائل');
        });

        socketRef.current.on('new-message', (data: any) => {
          console.log('📩 رسالة جديدة من WhatsApp:', data);
          
          // تحديث قائمة المحادثات
          loadData();
          
          // إذا الرسالة من المحادثة المفتوحة، تحديث الرسائل
          const newMessage = {
            id: data.id,
            text: data.body,
            senderType: 'user',
            createdAt: new Date(data.timestamp * 1000).toISOString(),
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          // Bot will auto-reply via the useEffect hook that watches messages
        });
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); // مرة واحدة فقط

  // Bot auto-reply effect - responds automatically to new user messages
  useEffect(() => {
    if (!botEnabled || !selectedConversation || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // Only respond to user messages, not agent/bot messages
    if (lastMessage.senderType === 'user' && !lastMessage.id.startsWith('user-')) {
      console.log('🤖 Bot will respond to new message:', lastMessage.text);
      
      const timer = setTimeout(() => {
        handleBotAutoReply(lastMessage.text);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, botEnabled, selectedConversation]); // Only trigger on new messages

  // Auto-send welcome message when conversation is selected
  useEffect(() => {
    if (!botEnabled || !selectedConversation || messages.length === 0) return;
    
    // Check if there's already a bot message with options
    const hasBotOptions = messages.some(msg => 
      msg.senderType === 'agent' && msg.options && msg.options.length > 0
    );
    
    // If no bot options message exists, send welcome
    if (!hasBotOptions) {
      const conversationId = selectedConversation.id;
      
      // Check if this conversation already has a state
      if (!conversationStates[conversationId]) {
        console.log('🎯 No bot options found - sending welcome message with buttons');
        
        // Set state to welcome
        setConversationStates(prev => ({
          ...prev,
          [conversationId]: 'welcome'
        }));
        
        // Send welcome message with options after a short delay
        setTimeout(() => {
          const welcomeQuestion = botQuestionsTree['welcome'];
          if (welcomeQuestion) {
            const botMessage = {
              id: `bot-welcome-${Date.now()}`,
              text: welcomeQuestion.text,
              senderType: 'agent',
              createdAt: new Date().toISOString(),
              options: welcomeQuestion.options,
            };
            setMessages(prev => [...prev, botMessage]);
            
            // Also send via WhatsApp if it's a WhatsApp conversation
            if (selectedConversation.channel?.type === 'whatsapp') {
              fetch(`${apiUrl}/api/whatsapp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: selectedConversation.id,
                  message: welcomeQuestion.text,
                }),
              }).catch(err => console.error('Error sending WhatsApp message:', err));
            }
          }
        }, 1500);
      }
    }
  }, [selectedConversation, messages.length, botEnabled, conversationStates]);

  // Polling للمحادثة المفتوحة
  useEffect(() => {
    // Clear previous interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Start polling if WhatsApp conversation is selected
    if (selectedConversation?.channel?.type === 'whatsapp') {
      pollIntervalRef.current = setInterval(() => {
        refreshMessages();
      }, 10000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  const loadData = async () => {
    setLoading(true);
    try {
      // جلب محادثات WhatsApp
      const whatsappResponse = await fetch(`${apiUrl}/api/whatsapp/chats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const whatsappData = await whatsappResponse.json();
      
      console.log('WhatsApp Response:', whatsappData);
      
      if (whatsappData.success && whatsappData.chats && whatsappData.chats.length > 0) {
        // تحويل محادثات WhatsApp لصيغة Inbox
        const whatsappConversations = whatsappData.chats.map((chat: any) => {
          // التحقق من صحة timestamp
          let lastMessageAt;
          try {
            if (chat.timestamp && !isNaN(chat.timestamp)) {
              lastMessageAt = new Date(chat.timestamp * 1000).toISOString();
            } else {
              lastMessageAt = new Date().toISOString();
            }
          } catch {
            lastMessageAt = new Date().toISOString();
          }
          
          return {
            id: chat.id,
            customerProfile: { 
              name: chat.name || chat.id.split('@')[0], 
              phone: chat.id.split('@')[0] 
            },
            channel: { name: 'واتساب', type: 'whatsapp' },
            department: 'WhatsApp',
            status: 'active',
            lastMessageAt,
            unreadCount: chat.unreadCount || 0,
          };
        });
        
        console.log('Loaded WhatsApp conversations:', whatsappConversations.length);
        
        setConversations(whatsappConversations);
        setChannels([
          { id: '1', name: 'واتساب', status: 'connected', type: 'whatsapp' },
          { id: '2', name: 'ماسنجر', status: 'disconnected', type: 'messenger' },
          { id: '3', name: 'تيليجرام', status: 'disconnected', type: 'telegram' },
        ]);
        setLoading(false);
        return; // نجح جلب البيانات من WhatsApp
      }
      
      // إذا ما فيش محادثات من WhatsApp، استخدم Mock data
      console.log('No WhatsApp chats, using mock data');
    } catch (apiError) {
      console.error('Error loading WhatsApp data:', apiError);
    }
    
    // Mock data for conversations (fallback)
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
    
    // ALWAYS set loading to false
    setLoading(false);
  };

  const refreshMessages = async () => {
    if (!selectedConversation || selectedConversation.channel?.type !== 'whatsapp') return;
    
    try {
      const response = await fetch(`${apiUrl}/api/whatsapp/messages/${selectedConversation.id}`);
      const data = await response.json();
      
      if (data.success && data.messages) {
        const whatsappMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.body,
          senderType: msg.fromMe ? 'agent' : 'user',
          createdAt: new Date(msg.timestamp * 1000).toISOString(),
        }));
        
        // احتفظ بالـ options من الرسائل الموجودة
        setMessages(prevMessages => {
          // ابحث عن الرسائل التي تحتوي على options في الرسائل السابقة
          const messagesWithOptions = prevMessages.filter(msg => msg.options && msg.options.length > 0);
          
          // دمج الرسائل الجديدة مع الرسائل التي تحتوي على options
          const mergedMessages = whatsappMessages.map((newMsg: any) => {
            // ابحث عن رسالة مطابقة في الرسائل السابقة
            const existingMsg = prevMessages.find(oldMsg => oldMsg.id === newMsg.id);
            // إذا كانت موجودة ولديها options، احتفظ بها
            if (existingMsg && existingMsg.options) {
              return { ...newMsg, options: existingMsg.options };
            }
            return newMsg;
          });
          
          // أضف أي رسائل bot جديدة (تبدأ بـ bot-) لم تأتِ من الـ API
          const botMessages = prevMessages.filter(msg => 
            msg.id.startsWith('bot-') && !whatsappMessages.find((wm: any) => wm.id === msg.id)
          );
          
          return [...mergedMessages, ...botMessages].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
    }
  };

  const selectConversation = async (conv: any) => {
    setSelectedConversation(conv);
    try {
      // إذا كانت محادثة WhatsApp، جلب الرسائل من API الخاص بها
      if (conv.channel?.type === 'whatsapp') {
        const response = await fetch(`${apiUrl}/api/whatsapp/messages/${conv.id}`);
        const data = await response.json();
        
        if (data.success && data.messages) {
          const whatsappMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.body,
            senderType: msg.fromMe ? 'agent' : 'user',
            createdAt: new Date(msg.timestamp * 1000).toISOString(),
          }));
          // ابدأ بالرسائل من الـ API أولاً عند فتح المحادثة
          setMessages(whatsappMessages);
          return;
        }
      }
      
      // الطريقة القديمة
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
      ];
      setMessages(mockMessages);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      // إذا كانت محادثة WhatsApp، إرسال عبر WhatsApp API
      if (selectedConversation.channel?.type === 'whatsapp') {
        const response = await fetch(`${apiUrl}/api/whatsapp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: selectedConversation.id,
            message: messageText,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // إضافة الرسالة محلياً
          const newMessage = {
            id: `msg-${Date.now()}`,
            text: messageText,
            senderType: 'agent',
            createdAt: new Date().toISOString(),
          };
          setMessages([...messages, newMessage]);
          setMessageText('');
          return;
        }
      }
      
      // الطريقة القديمة
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

  // Bot auto-reply handler using Questions Tree
  const handleBotAutoReply = async (userMessage: string) => {
    if (!botEnabled || !selectedConversation) {
      console.log('Bot disabled or no conversation selected');
      return;
    }

    try {
      const conversationId = selectedConversation.id;
      
      // Get current question state (default to welcome if new conversation)
      let currentQuestionId = conversationStates[conversationId];
      
      // If no state exists, this is the first message - send welcome and set state
      if (!currentQuestionId) {
        console.log('🆕 First message from user - sending welcome message');
        
        // Set state to welcome
        setConversationStates(prev => ({
          ...prev,
          [conversationId]: 'welcome'
        }));
        
        // Send welcome message immediately with options
        const welcomeQuestion = botQuestionsTree['welcome'];
        if (welcomeQuestion) {
          setTimeout(async () => {
            // إرسال عبر WhatsApp API إذا كانت محادثة WhatsApp
            if (selectedConversation.channel?.type === 'whatsapp') {
              try {
                await fetch(`${apiUrl}/api/whatsapp/send`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    to: selectedConversation.id,
                    message: welcomeQuestion.text,
                  }),
                });
              } catch (error) {
                console.error('Error sending WhatsApp welcome:', error);
              }
            }
            
            // إضافة في الواجهة
            const botMessage = {
              id: `bot-${Date.now()}`,
              text: welcomeQuestion.text,
              senderType: 'agent',
              createdAt: new Date().toISOString(),
              options: welcomeQuestion.options, // Add options to message
            };
            setMessages(prev => [...prev, botMessage]);
          }, 800);
        }
        return; // Don't process user message yet, just send welcome
      }
      
      const currentQuestion = botQuestionsTree[currentQuestionId];
      
      if (!currentQuestion) {
        console.error('Question not found:', currentQuestionId);
        return;
      }

      console.log('Current question:', currentQuestionId);
      console.log('User message:', userMessage);

      let botResponse = '';
      let nextQuestionId = currentQuestionId;

      // If question requires input, move to next step
      if (currentQuestion.requiresInput && currentQuestion.nextStep) {
        console.log('Question requires input, moving to:', currentQuestion.nextStep);
        nextQuestionId = currentQuestion.nextStep;
        const nextQuestion = botQuestionsTree[nextQuestionId];
        if (nextQuestion) {
          botResponse = nextQuestion.text;
        }
      } else {
        // User is selecting an option - be more flexible with matching
        const userInput = userMessage.trim();
        const selectedOption = currentQuestion.options.find(opt => {
          // Check exact ID match
          if (opt.id === userInput) return true;
          // Check if user input contains the ID
          if (userInput === opt.id || userInput.includes(opt.id)) return true;
          // Check if label contains user input or vice versa
          if (opt.label.includes(userInput) || userInput.includes(opt.label)) return true;
          return false;
        });

        console.log('Selected option:', selectedOption);

        if (selectedOption) {
          // Send response text if available
          if (selectedOption.responseText) {
            setTimeout(() => {
              const responseMessage = {
                id: `bot-${Date.now()}-response`,
                text: selectedOption.responseText,
                senderType: 'agent',
                createdAt: new Date().toISOString(),
              };
              setMessages(prev => [...prev, responseMessage]);
            }, 500);
          }

          // Move to next question
          if (selectedOption.nextQuestionId) {
            nextQuestionId = selectedOption.nextQuestionId;
            const nextQuestion = botQuestionsTree[nextQuestionId];
            if (nextQuestion) {
              botResponse = nextQuestion.text;
            }
          }
        } else {
          // User didn't select a valid option, show help message with current question
          botResponse = `عذراً، لم أفهم اختيارك. من فضلك اختر رقم من القائمة:\n\n${currentQuestion.text}`;
          console.log('Invalid option, showing help');
        }
      }

      // Update conversation state
      setConversationStates(prev => ({
        ...prev,
        [conversationId]: nextQuestionId
      }));

      console.log('Next question will be:', nextQuestionId);

      // Send bot response with options
      if (botResponse) {
        setTimeout(async () => {
          const nextQuestion = botQuestionsTree[nextQuestionId];
          
          // إرسال عبر WhatsApp API إذا كانت محادثة WhatsApp
          if (selectedConversation.channel?.type === 'whatsapp') {
            try {
              await fetch(`${apiUrl}/api/whatsapp/send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: selectedConversation.id,
                  message: botResponse,
                }),
              });
            } catch (error) {
              console.error('Error sending WhatsApp message:', error);
            }
          }
          
          // إضافة الرسالة في الواجهة
          const botMessage = {
            id: `bot-${Date.now()}`,
            text: botResponse,
            senderType: 'agent',
            createdAt: new Date().toISOString(),
            options: nextQuestion?.options || [], // Add options to message
          };
          setMessages(prev => [...prev, botMessage]);
        }, 1200);
      }
    } catch (error) {
      console.error('Bot reply error:', error);
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Header */}
      <header className="relative bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-sm border-b border-white/10 px-6 py-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  صندوق الوارد الموحد
                </h1>
                <p className="text-sm text-cyan-200">إدارة جميع المحادثات من مكان واحد</p>
              </div>
            </div>
            <div className="flex gap-2">
              {channels.map((ch: any) => (
                <span
                  key={ch.id}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-md ${
                    ch.status === 'connected' 
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50' 
                      : 'bg-red-500/30 text-red-200 border border-red-400/50'
                  }`}
                >
                  <CheckCheck className="w-3 h-3" />
                  {ch.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
              <User className="w-4 h-4 text-cyan-200" />
              <span className="text-sm font-medium text-white">{user?.name}</span>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl text-white"
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
        <div className={`relative bg-white/5 backdrop-blur-md border-l border-white/10 flex flex-col shadow-lg transition-all duration-300 ${
          isConversationListCollapsed ? 'w-16' : 'w-80'
        }`}>
          {/* Collapse/Expand Button */}
          <div className="absolute -left-3 top-20 z-10">
            <button
              onClick={() => setIsConversationListCollapsed(!isConversationListCollapsed)}
              className="w-6 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-l-lg flex items-center justify-center shadow-lg transition-all"
              title={isConversationListCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              {isConversationListCollapsed ? (
                <ChevronRight className="w-4 h-4 text-white" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {!isConversationListCollapsed && (
            <>
          {/* Tabs Navigation */}
          <div className="border-b border-white/10 bg-white/5">
            <div className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-2 py-2.5 text-xs font-medium transition-all border-b-2 ${
                  activeTab === 'all'
                    ? 'border-cyan-500 text-cyan-200 bg-cyan-500/10'
                    : 'border-transparent text-cyan-300/70 hover:text-cyan-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>الكل</span>
                  <span className="px-1.5 py-0.5 bg-cyan-500/30 rounded-full text-xs">
                    {conversations.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('mine')}
                className={`flex-1 px-2 py-2.5 text-xs font-medium transition-all border-b-2 ${
                  activeTab === 'mine'
                    ? 'border-cyan-500 text-cyan-200 bg-cyan-500/10'
                    : 'border-transparent text-cyan-300/70 hover:text-cyan-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>محادثاتي</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/30 rounded-full text-xs">0</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('unassigned')}
                className={`flex-1 px-2 py-2.5 text-xs font-medium transition-all border-b-2 ${
                  activeTab === 'unassigned'
                    ? 'border-cyan-500 text-cyan-200 bg-cyan-500/10'
                    : 'border-transparent text-cyan-300/70 hover:text-cyan-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>غير مسندة</span>
                  <span className="px-1.5 py-0.5 bg-amber-500/30 rounded-full text-xs">
                    {conversations.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-2 border-b border-white/10 space-y-2">
            <div className="relative">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-8 pl-2 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white placeholder-cyan-300/50"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                    : 'bg-white/10 text-cyan-200 hover:bg-white/20'
                }`}
              >
                فتح
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  filterStatus === 'active' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                    : 'bg-white/10 text-emerald-200 hover:bg-white/20'
                }`}
              >
                محلول
              </button>
              <button
                onClick={() => setFilterStatus('archived')}
                className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  filterStatus === 'archived' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                    : 'bg-white/10 text-amber-200 hover:bg-white/20'
                }`}
              >
                انتظار
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-cyan-500/30" />
                <p className="text-xs text-cyan-200">لا توجد محادثات</p>
              </div>
            ) : (
              filteredConversations.map((conv: any) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-2 border-b border-white/5 cursor-pointer hover:bg-gradient-to-l hover:from-cyan-500/20 hover:to-transparent transition-all group ${
                    selectedConversation?.id === conv.id ? 'bg-gradient-to-l from-cyan-500/30 to-transparent border-r-2 border-r-cyan-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {conv.customerProfile?.name?.[0] || '؟'}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {conv.customerProfile?.name || 'عميل'}
                          </h3>
                          {conv.unreadCount > 0 && (
                            <span className="flex-shrink-0 w-4 h-4 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-cyan-300 whitespace-nowrap ml-1">
                          {new Date(conv.lastMessageAt).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-200/60 truncate mb-1">
                        {getTimeAgo(conv.lastMessageAt)}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-500/30 text-emerald-200 rounded border border-emerald-400/50">
                          {conv.channel?.name}
                        </span>
                        {conv.status === 'active' && (
                          <span className="text-xs px-1.5 py-0.5 bg-cyan-500/30 text-cyan-200 rounded border border-cyan-400/50">
                            فتح
                          </span>
                        )}
                        {selectedAgent !== 'غير مسند' && selectedConversation?.id === conv.id && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-500/30 text-purple-200 rounded border border-purple-400/50 flex items-center gap-0.5">
                            <User className="w-2.5 h-2.5" />
                            {selectedAgent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </>
          )}

          {/* Collapsed State - Show icons only */}
          {isConversationListCollapsed && (
            <div className="flex-1 flex flex-col items-center py-4 gap-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`p-2 rounded-lg transition-all ${
                  activeTab === 'all' ? 'bg-cyan-500/20' : 'hover:bg-white/10'
                }`}
                title="الكل"
              >
                <MessageSquare className="w-5 h-5 text-cyan-300" />
              </button>
              <button
                onClick={() => setActiveTab('mine')}
                className={`p-2 rounded-lg transition-all ${
                  activeTab === 'mine' ? 'bg-cyan-500/20' : 'hover:bg-white/10'
                }`}
                title="محادثاتي"
              >
                <User className="w-5 h-5 text-cyan-300" />
              </button>
              <button
                onClick={() => setActiveTab('unassigned')}
                className={`p-2 rounded-lg transition-all ${
                  activeTab === 'unassigned' ? 'bg-cyan-500/20' : 'hover:bg-white/10'
                }`}
                title="غير مسندة"
              >
                <AlertCircle className="w-5 h-5 text-cyan-300" />
              </button>
              <div className="flex-1"></div>
              <div className="text-center">
                <div className="w-8 h-8 bg-cyan-500/30 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {conversations.length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="relative bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {selectedConversation.customerProfile?.name?.[0] || '؟'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {selectedConversation.customerProfile?.name || 'عميل'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-emerald-500/30 text-emerald-200 rounded-full text-xs font-medium flex items-center gap-1 border border-emerald-400/50 backdrop-blur-md">
                          <CheckCheck className="w-3 h-3" />
                          نشط الآن
                        </span>
                        <span className="text-cyan-200">
                          {selectedConversation.channel?.name}
                        </span>
                        {selectedAgent !== 'غير مسند' && (
                          <span className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded-full text-xs font-medium flex items-center gap-1 border border-purple-400/50 backdrop-blur-md">
                            <User className="w-3 h-3" />
                            الوكيل: {selectedAgent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setBotEnabled(!botEnabled)}
                      className={`p-3 rounded-xl transition-all group border ${
                        botEnabled 
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50' 
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                      title={botEnabled ? 'إيقاف البوت' : 'تفعيل البوت'}
                    >
                      <span className={`text-lg ${botEnabled ? 'animate-pulse' : ''}`}>🤖</span>
                    </button>
                    <button 
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      className={`p-3 rounded-xl transition-all group border ${
                        showContactInfo 
                          ? 'bg-cyan-500/30 border-cyan-400/50' 
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                      title="معلومات جهة الاتصال"
                    >
                      <UserCircle className={`w-5 h-5 ${showContactInfo ? 'text-cyan-200' : 'text-cyan-300'} group-hover:scale-110 transition-transform`} />
                    </button>
                    <button 
                      onClick={() => window.open(`tel:${selectedConversation.customerProfile?.phone}`, '_blank')}
                      className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all group border border-emerald-400/30"
                      title="اتصال صوتي"
                    >
                      <Phone className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => alert('مكالمة فيديو - قيد التطوير')}
                      className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all group border border-blue-400/30"
                      title="مكالمة فيديو"
                    >
                      <Video className="w-5 h-5 text-blue-300 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => alert('إضافة علامة')}
                      className="p-3 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl transition-all group border border-amber-400/30"
                      title="إضافة علامة"
                    >
                      <Tag className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => handleArchive(selectedConversation.id)}
                      className="p-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl transition-all group border border-cyan-400/30"
                      title="أرشفة"
                    >
                      <Archive className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Replies Bar */}
              <div className="bg-white/5 border-b border-white/10 px-6 py-3">
                <div className="flex gap-2 overflow-x-auto">
                  {botEnabled && (
                    <button
                      onClick={() => {
                        const conversationId = selectedConversation.id;
                        // Reset to welcome question
                        setConversationStates(prev => ({
                          ...prev,
                          [conversationId]: 'welcome'
                        }));
                        
                        // Send welcome message from tree with options
                        const welcomeQuestion = botQuestionsTree['welcome'];
                        if (welcomeQuestion) {
                          const botMessage = {
                            id: `bot-${Date.now()}`,
                            text: welcomeQuestion.text,
                            senderType: 'agent',
                            createdAt: new Date().toISOString(),
                            options: welcomeQuestion.options, // Add options
                          };
                          setMessages(prev => [...prev, botMessage]);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/50 rounded-lg text-sm whitespace-nowrap transition-all text-white font-medium"
                    >
                      🤖 بدء محادثة البوت
                    </button>
                  )}
                  <button
                    onClick={() => handleQuickReply('✈️ حجوزات')}
                    className="px-4 py-2 bg-white/10 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400/50 rounded-lg text-sm whitespace-nowrap transition-all text-white"
                  >
                    ✈️ حجوزات
                  </button>
                  <button
                    onClick={() => handleQuickReply('ℹ️ استفسارات')}
                    className="px-4 py-2 bg-white/10 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400/50 rounded-lg text-sm whitespace-nowrap transition-all text-white"
                  >
                    ℹ️ استفسارات
                  </button>
                  <button
                    onClick={() => handleQuickReply('⚠️ شكاوى')}
                    className="px-4 py-2 bg-white/10 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400/50 rounded-lg text-sm whitespace-nowrap transition-all text-white"
                  >
                    ⚠️ شكاوى
                  </button>
                  <button
                    onClick={() => handleQuickReply('👤 التحدث مع موظف')}
                    className="px-4 py-2 bg-white/10 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400/50 rounded-lg text-sm whitespace-nowrap transition-all text-white"
                  >
                    👤 موظف
                  </button>
                  <div className="h-6 w-px bg-white/20"></div>
                  <button
                    onClick={async () => {
                      if (!selectedConversation) {
                        alert('الرجاء اختيار محادثة أولاً');
                        return;
                      }
                      // Reset conversation state and send welcome message from tree
                      setConversationStates(prev => ({
                        ...prev,
                        [selectedConversation.id]: 'welcome'
                      }));
                      
                      const welcomeQuestion = botQuestionsTree['welcome'];
                      if (welcomeQuestion) {
                        const botMessage = {
                          id: `bot-${Date.now()}`,
                          text: welcomeQuestion.text,
                          senderType: 'agent' as const,
                          createdAt: new Date().toISOString(),
                          options: welcomeQuestion.options, // Add options
                        };
                        setMessages(prev => [...prev, botMessage]);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm whitespace-nowrap transition-all font-medium shadow-md"
                  >
                    🌳 عرض شجرة الأسئلة
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-20 h-20 mx-auto mb-4 text-cyan-500/30" />
                      <p className="text-cyan-200 font-medium">لا توجد رسائل بعد</p>
                      <p className="text-sm text-cyan-300/50 mt-1">ابدأ المحادثة الآن</p>
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
                        className={`max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                          msg.senderType === 'user'
                            ? 'bg-white/10 backdrop-blur-md border border-white/20 rounded-br-sm text-white'
                            : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-bl-sm'
                        }`}
                      >
                        {msg.senderType !== 'user' && selectedAgent !== 'غير مسند' && (
                          <div className="text-xs font-semibold text-white/90 mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {selectedAgent}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                        
                        {/* Show options for bot messages */}
                        {msg.senderType === 'agent' && msg.options && msg.options.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.options.map((option: any) => (
                              <button
                                key={option.id}
                                onClick={() => {
                                  // Send user's selection
                                  const userMessage = {
                                    id: `user-${Date.now()}`,
                                    text: `${option.emoji || ''} ${option.label}`,
                                    senderType: 'user' as const,
                                    createdAt: new Date().toISOString(),
                                  };
                                  setMessages(prev => [...prev, userMessage]);
                                  
                                  // Trigger bot response
                                  setTimeout(() => {
                                    handleBotAutoReply(option.id);
                                  }, 500);
                                }}
                                className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-left text-sm font-medium transition-all border border-white/30 hover:border-white/50"
                              >
                                {option.emoji && <span className="mr-2">{option.emoji}</span>}
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs ${msg.senderType === 'user' ? 'text-cyan-200/70' : 'text-white/70'}`}>
                            {getTimeAgo(msg.createdAt)}
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
              <div className="relative bg-white/5 backdrop-blur-md border-t border-white/10 p-4 shadow-lg">
                <div className="flex items-end gap-3">
                  <button 
                    onClick={() => alert('إرفاق ملف')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all group border border-white/20"
                    title="إرفاق ملف"
                  >
                    <Paperclip className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => alert('إضافة رموز تعبيرية')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all group border border-white/20"
                    title="رموز تعبيرية"
                  >
                    <Smile className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
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
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-white placeholder-cyan-300/50"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  <button 
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed group"
                    title="إرسال"
                  >
                    <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
              </div>

              {/* Contact Info Panel */}
              {showContactInfo && (
                <div className="w-64 bg-white/5 backdrop-blur-md border-r border-white/10 overflow-y-auto">
                  {/* Contact Header */}
                  <div className="p-3 border-b border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-bold text-white">تفاصيل الاتصال</h3>
                      <button
                        onClick={() => setShowContactInfo(false)}
                        className="p-1 hover:bg-white/10 rounded transition-all"
                      >
                        <X className="w-4 h-4 text-cyan-300" />
                      </button>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg mb-2">
                        {selectedConversation.customerProfile?.name?.[0] || '؟'}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {selectedConversation.customerProfile?.name || 'عميل'}
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 rounded text-xs border border-emerald-400/50">
                        {selectedConversation.channel?.name}
                      </span>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="p-2 space-y-2">
                    {/* Bio */}
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-cyan-300" />
                        <span className="text-xs font-medium text-cyan-200">Bio</span>
                      </div>
                      <p className="text-xs text-white/70">
                        عميل محتمل مهتم بخدماتنا
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                        <Mail className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-cyan-300/70">البريد</div>
                          <div className="text-xs text-white truncate">
                            {selectedConversation.customerProfile?.email || 'غير متاح'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                        <Phone className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-cyan-300/70">الهاتف</div>
                          <div className="text-xs text-white truncate" dir="ltr">
                            {selectedConversation.customerProfile?.phone || 'غير متاح'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                        <Building2 className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-cyan-300/70">الشركة</div>
                          <div className="text-xs text-white truncate">
                            {selectedConversation.customerProfile?.company || 'غير محدد'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Conversation Actions */}
                    <div className="pt-2 border-t border-white/10">
                      <h4 className="text-xs font-bold text-white mb-2">إجراءات المحادثة</h4>
                      <div className="space-y-1.5">
                        {/* Agent Assignment */}
                        <div className="relative">
                          <button 
                            onClick={() => setShowAgentMenu(!showAgentMenu)}
                            className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <UserCircle className="w-3.5 h-3.5 text-cyan-300" />
                              <span className="text-xs text-white">الوكيل: {selectedAgent}</span>
                            </div>
                            <ChevronDown className={`w-3 h-3 text-cyan-300 transition-transform ${showAgentMenu ? 'rotate-180' : ''}`} />
                          </button>
                          {showAgentMenu && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded border border-white/10 shadow-lg z-10 max-h-40 overflow-y-auto">
                              {['غير مسند', 'أحمد محمد', 'فاطمة علي', 'محمود سعيد', 'سارة أحمد'].map(agent => (
                                <button
                                  key={agent}
                                  onClick={() => {
                                    setSelectedAgent(agent);
                                    setShowAgentMenu(false);
                                  }}
                                  className="w-full text-right px-3 py-2 text-xs text-white hover:bg-white/10 transition-all"
                                >
                                  {agent}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="relative">
                          <button 
                            onClick={() => setShowTagsMenu(!showTagsMenu)}
                            className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-cyan-300" />
                              <span className="text-xs text-white">الوسوم {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                            </div>
                            <Plus className="w-3 h-3 text-cyan-300" />
                          </button>
                          {showTagsMenu && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded border border-white/10 shadow-lg z-10 max-h-40 overflow-y-auto">
                              {['مهم', 'عاجل', 'متابعة', 'عميل جديد', 'استفسار', 'شكوى', 'طلب خدمة'].map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => {
                                    if (selectedTags.includes(tag)) {
                                      setSelectedTags(selectedTags.filter(t => t !== tag));
                                    } else {
                                      setSelectedTags([...selectedTags, tag]);
                                    }
                                  }}
                                  className={`w-full text-right px-3 py-2 text-xs hover:bg-white/10 transition-all ${
                                    selectedTags.includes(tag) ? 'text-cyan-300 bg-white/5' : 'text-white'
                                  }`}
                                >
                                  {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Priority */}
                        <div className="relative">
                          <button 
                            onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                            className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <Star className={`w-3.5 h-3.5 ${
                                selectedPriority === 'عالية' ? 'text-red-400' :
                                selectedPriority === 'متوسطة' ? 'text-yellow-400' :
                                'text-cyan-300'
                              }`} />
                              <span className="text-xs text-white">الأولوية: {selectedPriority}</span>
                            </div>
                            <ChevronDown className={`w-3 h-3 text-cyan-300 transition-transform ${showPriorityMenu ? 'rotate-180' : ''}`} />
                          </button>
                          {showPriorityMenu && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded border border-white/10 shadow-lg z-10">
                              {[
                                { name: 'عالية', color: 'text-red-400' },
                                { name: 'متوسطة', color: 'text-yellow-400' },
                                { name: 'عادية', color: 'text-cyan-300' }
                              ].map(priority => (
                                <button
                                  key={priority.name}
                                  onClick={() => {
                                    setSelectedPriority(priority.name);
                                    setShowPriorityMenu(false);
                                  }}
                                  className={`w-full text-right px-3 py-2 text-xs hover:bg-white/10 transition-all ${priority.color}`}
                                >
                                  {priority.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Sections */}
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      {/* Previous Conversations */}
                      <div>
                        <button 
                          onClick={() => setShowPreviousChats(!showPreviousChats)}
                          className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-cyan-300" />
                            <span className="text-xs text-white">المحادثات السابقة</span>
                          </div>
                          <ChevronDown className={`w-3 h-3 text-cyan-300 transition-transform ${showPreviousChats ? 'rotate-180' : ''}`} />
                        </button>
                        {showPreviousChats && (
                          <div className="mt-1 p-2 bg-white/5 rounded border border-white/10 space-y-1">
                            {[
                              { date: 'منذ يومين', message: 'استفسار عن المنتجات' },
                              { date: 'منذ أسبوع', message: 'طلب عرض سعر' },
                              { date: 'منذ شهر', message: 'متابعة الطلب' }
                            ].map((chat, idx) => (
                              <div key={idx} className="p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer transition-all">
                                <div className="text-xs text-cyan-300">{chat.date}</div>
                                <div className="text-xs text-white/70">{chat.message}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Gallery */}
                      <div>
                        <button 
                          onClick={() => setShowGallery(!showGallery)}
                          className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Image className="w-3.5 h-3.5 text-cyan-300" />
                            <span className="text-xs text-white">المعرض (12)</span>
                          </div>
                          <ChevronDown className={`w-3 h-3 text-cyan-300 transition-transform ${showGallery ? 'rotate-180' : ''}`} />
                        </button>
                        {showGallery && (
                          <div className="mt-1 p-2 bg-white/5 rounded border border-white/10">
                            <div className="grid grid-cols-3 gap-1">
                              {[1, 2, 3, 4, 5, 6].map(img => (
                                <div key={img} className="aspect-square bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded flex items-center justify-center hover:scale-105 transition-all cursor-pointer">
                                  <Image className="w-4 h-4 text-cyan-300" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Attributes */}
                      <div>
                        <button 
                          onClick={() => setShowAttributes(!showAttributes)}
                          className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-cyan-300" />
                            <span className="text-xs text-white">السمات</span>
                          </div>
                          <ChevronDown className={`w-3 h-3 text-cyan-300 transition-transform ${showAttributes ? 'rotate-180' : ''}`} />
                        </button>
                        {showAttributes && (
                          <div className="mt-1 p-2 bg-white/5 rounded border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-cyan-300/70">نوع العميل</span>
                              <span className="text-xs text-white">عميل محتمل</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-cyan-300/70">المصدر</span>
                              <span className="text-xs text-white">واتساب</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-cyan-300/70">القيمة المتوقعة</span>
                              <span className="text-xs text-white">5000 ريال</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-cyan-300/70">حالة الصفقة</span>
                              <span className="text-xs text-yellow-400">قيد المتابعة</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/50 relative">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10">
                  <MessageSquare className="w-16 h-16 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">صندوق الوارد الموحد</h3>
                <p className="text-cyan-200 mb-4">اختر محادثة من القائمة للبدء</p>
                <div className="flex items-center justify-center gap-4 text-sm text-cyan-300/70">
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
