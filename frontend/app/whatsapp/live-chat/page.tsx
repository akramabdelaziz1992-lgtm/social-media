"use client";

import React, { useState } from 'react';
import { MessageSquare, Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, Star, Archive, Trash2, User, Clock } from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: 'online' | 'offline';
  avatar?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'customer';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export default function WhatsAppLiveChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'أحمد محمد',
      phone: '+201234567890',
      lastMessage: 'شكراً على الرد السريع!',
      timestamp: '10:30 AM',
      unread: 2,
      status: 'online'
    },
    {
      id: '2',
      name: 'فاطمة علي',
      phone: '+201098765432',
      lastMessage: 'هل المنتج متوفر؟',
      timestamp: '9:15 AM',
      unread: 1,
      status: 'online'
    },
    {
      id: '3',
      name: 'محمود سعيد',
      phone: '+201555444333',
      lastMessage: 'تمام، شكراً جزيلاً',
      timestamp: 'Yesterday',
      unread: 0,
      status: 'offline'
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      text: 'مرحباً، أريد الاستفسار عن المنتجات',
      sender: 'customer',
      timestamp: '10:25 AM',
      status: 'read'
    },
    {
      id: '2',
      text: 'أهلاً وسهلاً! بالطبع، كيف يمكنني مساعدتك؟',
      sender: 'user',
      timestamp: '10:26 AM',
      status: 'read'
    },
    {
      id: '3',
      text: 'ما هي أسعار المنتجات الجديدة؟',
      sender: 'customer',
      timestamp: '10:28 AM',
      status: 'read'
    },
    {
      id: '4',
      text: 'الأسعار تبدأ من 500 جنيه، وعندنا عروض حالياً!',
      sender: 'user',
      timestamp: '10:29 AM',
      status: 'delivered'
    },
    {
      id: '5',
      text: 'شكراً على الرد السريع!',
      sender: 'customer',
      timestamp: '10:30 AM',
      status: 'read'
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Logic to send message
      console.log('Sending:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Live Chat
              </h1>
              <p className="text-gray-600">Real-time customer conversations</p>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                    selectedConversation === conv.id
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        {conv.name.charAt(0)}
                      </div>
                      {conv.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{conv.name}</h3>
                        <span className="text-xs text-gray-500">{conv.timestamp}</span>
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
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conversations.find(c => c.id === selectedConversation)?.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {conversations.find(c => c.id === selectedConversation)?.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        {conversations.find(c => c.id === selectedConversation)?.status === 'online' ? (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Online
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            Offline
                          </>
                        )}
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
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                      <Star size={20} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                      <Archive size={20} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                            : 'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          {msg.sender === 'user' ? <User size={16} /> : conversations.find(c => c.id === selectedConversation)?.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`px-4 py-3 rounded-2xl ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <Clock size={12} />
                            <span>{msg.timestamp}</span>
                            {msg.sender === 'user' && (
                              <span className="text-green-600">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition">
                      <Paperclip size={20} />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition">
                      <Smile size={20} />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2"
                    >
                      <Send size={20} />
                      <span>Send</span>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
