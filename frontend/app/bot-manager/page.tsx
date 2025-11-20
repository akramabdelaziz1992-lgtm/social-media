"use client";

import React, { useState } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Zap, 
  Brain, 
  Clock, 
  Save,
  ChevronRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function BotManagerPage() {
  const [selectedTab, setSelectedTab] = useState('whatsapp');
  const [aiAgentEnabled, setAiAgentEnabled] = useState(true);
  const [intentDetection, setIntentDetection] = useState(true);
  const [allQueries, setAllQueries] = useState(false);
  const [fallbackOnly, setFallbackOnly] = useState(true);
  const [contextualMemory, setContextualMemory] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [aiReasoningLevel, setAiReasoningLevel] = useState('medium');

  const tabs = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
    { id: 'facebook', name: 'Facebook', icon: '👍', color: 'bg-blue-500' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', color: 'bg-sky-500' },
  ];

  const handleSave = () => {
    alert('تم حفظ الإعدادات بنجاح! ✅');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                مدير البوت الذكي
              </h1>
              <p className="text-gray-600">إعداد وتكوين البوت الذكي والردود الآلية</p>
            </div>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-white shadow-lg text-gray-900 scale-105'
                  : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Agent Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Agent Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-cyan-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Brain className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">وكيل الذكاء الاصطناعي</h2>
                    <p className="text-sm text-gray-600">أتمتة المحادثات الذكية</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiAgentEnabled(!aiAgentEnabled)}
                  className="flex items-center gap-2"
                >
                  {aiAgentEnabled ? (
                    <ToggleRight className="text-green-500" size={48} />
                  ) : (
                    <ToggleLeft className="text-gray-300" size={48} />
                  )}
                </button>
              </div>

              {aiAgentEnabled && (
                <div className="space-y-4 animate-fadeInUp">
                  {/* Intent Detection */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">تفعيل كشف النية</h3>
                      <p className="text-sm text-gray-600">اكتشاف نوايا المستخدم تلقائياً</p>
                    </div>
                    <button onClick={() => setIntentDetection(!intentDetection)}>
                      {intentDetection ? (
                        <ToggleRight className="text-green-500" size={40} />
                      ) : (
                        <ToggleLeft className="text-gray-300" size={40} />
                      )}
                    </button>
                  </div>

                  {/* AI Agent Mode */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">وضع الذكاء الاصطناعي</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                        <input
                          type="radio"
                          name="aiMode"
                          checked={allQueries}
                          onChange={() => {
                            setAllQueries(true);
                            setFallbackOnly(false);
                          }}
                          className="w-5 h-5 text-cyan-600"
                        />
                        <div>
                          <span className="font-medium text-gray-900">الذكاء الاصطناعي لجميع الاستفسارات</span>
                          <p className="text-sm text-gray-600">معالجة جميع المحادثات بالذكاء الاصطناعي</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                        <input
                          type="radio"
                          name="aiMode"
                          checked={fallbackOnly}
                          onChange={() => {
                            setAllQueries(false);
                            setFallbackOnly(true);
                          }}
                          className="w-5 h-5 text-cyan-600"
                        />
                        <div>
                          <span className="font-medium text-gray-900">كبديل فقط</span>
                          <p className="text-sm text-gray-600">استخدام الذكاء عند عدم وجود رد مناسب</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Contextual Memory */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">تفعيل الذاكرة السياقية</h3>
                      <p className="text-sm text-gray-600">تذكر سجل المحادثات</p>
                    </div>
                    <button onClick={() => setContextualMemory(!contextualMemory)}>
                      {contextualMemory ? (
                        <ToggleRight className="text-green-500" size={40} />
                      ) : (
                        <ToggleLeft className="text-gray-300" size={40} />
                      )}
                    </button>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">تفعيل مؤشر الكتابة</h3>
                      <p className="text-sm text-gray-600">إظهار حالة "يكتب..."</p>
                    </div>
                    <button onClick={() => setTypingIndicator(!typingIndicator)}>
                      {typingIndicator ? (
                        <ToggleRight className="text-green-500" size={40} />
                      ) : (
                        <ToggleLeft className="text-gray-300" size={40} />
                      )}
                    </button>
                  </div>

                  {/* AI Reasoning Level */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="text-yellow-500" size={20} />
                      <h3 className="font-semibold text-gray-900">مستوى التفكير للردود</h3>
                    </div>
                    <select
                      value={aiReasoningLevel}
                      onChange={(e) => setAiReasoningLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="low">منخفض - ردود سريعة</option>
                      <option value="medium">متوسط - متوازن</option>
                      <option value="high">عالي - فهم عميق</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bot Reply Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">ردود البوت</h2>
                    <p className="text-sm text-gray-600">قواعد الرد التلقائي</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition">
                  تغيير الإعدادات
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">قواعد نشطة</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">1,234</div>
                  <div className="text-sm text-gray-600">ردود اليوم</div>
                </div>
              </div>
            </div>

            {/* Broadcast Campaign */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Send className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">حملات البث</h2>
                    <p className="text-sm text-gray-600">حملات الرسائل الجماعية</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition">
                  إنشاء حملة
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">نشطة</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-gray-600">مجدولة</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600">45ألف</div>
                  <div className="text-sm text-gray-600">مرسلة</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Additional Settings */}
          <div className="space-y-6">
            {/* Chat Widget */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">💬</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">ويدجت المحادثة</h2>
                  <p className="text-xs text-gray-600">دمج الموقع</p>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition flex items-center justify-between">
                <span>تكوين</span>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Sequence */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">التسلسلات</h2>
                  <p className="text-xs text-gray-600">سير عمل آلي</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">نشطة</span>
                  <span className="font-bold text-indigo-600">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مكتملة</span>
                  <span className="font-bold text-green-600">1,523</span>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition flex items-center justify-between">
                <span>إدارة</span>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Input Flow */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-teal-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🔄</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">تدفق المدخلات</h2>
                  <p className="text-xs text-gray-600">معالجة مدخلات المستخدم</p>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition flex items-center justify-between">
                <span>تكوين</span>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* WhatsApp Flows */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📱</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">تدفقات واتساب</h2>
                  <p className="text-xs text-gray-600">نماذج تفاعلية</p>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition flex items-center justify-between">
                <span>إدارة</span>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Message Template */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-pink-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📝</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">قوالب الرسائل</h2>
                  <p className="text-xs text-gray-600">ردود سريعة</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">القوالب</span>
                  <span className="font-bold text-pink-600">24</span>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition flex items-center justify-between">
                <span>تحرير القوالب</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition flex items-center gap-3"
          >
            <Save size={24} />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
}
