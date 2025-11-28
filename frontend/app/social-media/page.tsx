'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Share2, Image as ImageIcon, Video, Calendar, TrendingUp, 
  Users, Heart, MessageCircle, Send, Clock, CheckCircle,
  Facebook, Instagram, Twitter, Linkedin, Youtube,
  Sparkles, BarChart3, Target, Zap
} from 'lucide-react';

export default function SocialMediaPage() {
  const router = useRouter();
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [scheduleTime, setScheduleTime] = useState('');
  const [media, setMedia] = useState<File[]>([]);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700', connected: true },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-600 to-purple-600', connected: true },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'from-sky-500 to-blue-500', connected: false },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-800', connected: false },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-600 to-red-700', connected: true },
  ];

  const recentPosts = [
    { id: 1, content: 'عرض خاص لفترة محدودة! خصم 50%', platforms: ['facebook', 'instagram'], likes: 234, comments: 45, shares: 12, status: 'published' },
    { id: 2, content: 'منتج جديد قريباً...', platforms: ['instagram'], likes: 567, comments: 89, shares: 34, status: 'scheduled' },
    { id: 3, content: 'شكراً لثقتكم المستمرة 🙏', platforms: ['facebook', 'twitter'], likes: 890, comments: 123, shares: 67, status: 'published' },
  ];

  const stats = [
    { label: 'إجمالي المنشورات', value: '245', change: '+12%', icon: Share2, color: 'from-cyan-500 to-blue-500' },
    { label: 'المتابعون', value: '12.5K', change: '+8%', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'التفاعلات', value: '45.2K', change: '+23%', icon: Heart, color: 'from-red-500 to-pink-500' },
    { label: 'معدل التفاعل', value: '8.7%', change: '+3%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = () => {
    if (!postContent.trim()) {
      alert('الرجاء كتابة محتوى المنشور');
      return;
    }
    if (selectedPlatforms.length === 0) {
      alert('الرجاء اختيار منصة واحدة على الأقل');
      return;
    }
    
    const action = scheduleTime ? 'تم جدولة' : 'تم نشر';
    alert(`${action} المنشور بنجاح على ${selectedPlatforms.length} منصة! ✓`);
    setPostContent('');
    setScheduleTime('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-y-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Header */}
      <header className="relative bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-sm border-b border-white/10 px-6 py-4 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                📱 النشر الاجتماعي
              </h1>
              <p className="text-sm text-cyan-200">إدارة ونشر المحتوى على جميع المنصات</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg text-sm font-medium transition-all shadow-lg text-white"
            >
              لوحة التحكم
            </button>
            <button 
              onClick={() => router.push('/inbox')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
            >
              صندوق الوارد
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-cyan-200">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Post Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">إنشاء منشور جديد</h2>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-cyan-200 mb-3">اختر المنصات</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    const isConnected = platform.connected;
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => isConnected && togglePlatform(platform.id)}
                        disabled={!isConnected}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `bg-gradient-to-br ${platform.color} border-transparent text-white shadow-lg scale-105`
                            : isConnected
                            ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                            : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                        <div className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                          {platform.name}
                        </div>
                        {!isConnected && (
                          <div className="text-xs text-red-500 mt-1">غير متصل</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">محتوى المنشور</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="اكتب محتوى منشورك هنا... 📝"
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-slate-500">{postContent.length} حرف</span>
                  <span className="text-xs text-slate-400">استخدم الهاشتاجات والإيموجي</span>
                </div>
              </div>

              {/* Media Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">إضافة وسائط</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => alert('اختيار صورة')}
                    className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 transition-all group"
                  >
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-blue-600">صورة</div>
                  </button>
                  <button 
                    onClick={() => alert('اختيار فيديو')}
                    className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 transition-all group"
                  >
                    <Video className="w-8 h-8 mx-auto mb-2 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-indigo-600">فيديو</div>
                  </button>
                  <button 
                    onClick={() => alert('جدولة المنشور')}
                    className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-xl hover:border-amber-500 transition-all group"
                  >
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-amber-600 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-amber-600">جدولة</div>
                  </button>
                </div>
              </div>

              {/* Schedule Time */}
              {scheduleTime && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">وقت النشر</label>
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {scheduleTime ? 'جدولة المنشور' : 'نشر الآن'}
                </button>
                <button
                  onClick={() => setScheduleTime(scheduleTime ? '' : new Date().toISOString().slice(0, 16))}
                  className="px-6 py-4 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  {scheduleTime ? 'إلغاء الجدولة' : 'جدولة'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Posts & Analytics */}
          <div className="space-y-6">
            {/* Recent Posts */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">المنشورات الأخيرة</h3>
              </div>

              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-300 transition-all">
                    <p className="text-sm text-slate-700 mb-3 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {post.platforms.map((platformId) => {
                        const platform = platforms.find(p => p.id === platformId);
                        if (!platform) return null;
                        const Icon = platform.icon;
                        return (
                          <div key={platformId} className={`w-6 h-6 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        );
                      })}
                      <span className={`mr-auto text-xs px-2 py-1 rounded-full ${
                        post.status === 'published' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {post.status === 'published' ? 'منشور' : 'مجدول'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {post.shares}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6" />
                <h3 className="text-lg font-bold">نصائح سريعة</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>انشر في أوقات الذروة لزيادة التفاعل</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>استخدم الصور والفيديو لجذب الانتباه</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>تفاعل مع تعليقات المتابعين</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
