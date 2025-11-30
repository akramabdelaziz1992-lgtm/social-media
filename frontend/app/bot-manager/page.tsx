'use client';

import { useState, useEffect } from 'react';
import { botQuestionsTree, BotQuestion, BotOption } from '@/lib/botQuestionsTree';
import { 
  Edit2, 
  Save, 
  Download, 
  Eye, 
  X, 
  Plus, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Home,
  MessageSquare,
  Settings,
  FileJson
} from 'lucide-react';

export default function BotManagerPage() {
  const [questions, setQuestions] = useState<{ [key: string]: BotQuestion }>(botQuestionsTree);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('welcome');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BotQuestion | null>(null);
  const [previewQuestionId, setPreviewQuestionId] = useState<string>('welcome');
  const [previewHistory, setPreviewHistory] = useState<string[]>(['welcome']);

  // تحميل البيانات من localStorage عند بدء التشغيل
  useEffect(() => {
    const savedData = localStorage.getItem('botQuestionsTree');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setQuestions(parsed);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // حفظ البيانات في localStorage
  const handleSave = () => {
    localStorage.setItem('botQuestionsTree', JSON.stringify(questions));
    alert('✅ تم حفظ التغييرات بنجاح!');
  };

  // تصدير البيانات كملف JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bot-questions-tree-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // فتح نافذة التعديل
  const handleEdit = (question: BotQuestion) => {
    setEditingQuestion({ ...question });
    setIsEditModalOpen(true);
  };

  // حفظ التعديلات
  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    
    setQuestions(prev => ({
      ...prev,
      [editingQuestion.id]: editingQuestion
    }));
    
    setIsEditModalOpen(false);
    setEditingQuestion(null);
  };

  // إضافة خيار جديد
  const handleAddOption = () => {
    if (!editingQuestion) return;
    
    const newOption: BotOption = {
      id: String(editingQuestion.options.length + 1),
      label: 'خيار جديد',
      emoji: '🔹',
    };
    
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, newOption]
    });
  };

  // حذف خيار
  const handleDeleteOption = (optionId: string) => {
    if (!editingQuestion) return;
    
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options.filter(opt => opt.id !== optionId)
    });
  };

  // تحديث خيار
  const handleUpdateOption = (index: number, field: keyof BotOption, value: any) => {
    if (!editingQuestion) return;
    
    const newOptions = [...editingQuestion.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    setEditingQuestion({
      ...editingQuestion,
      options: newOptions
    });
  };

  // فتح نافذة المعاينة
  const handlePreview = () => {
    setPreviewQuestionId('welcome');
    setPreviewHistory(['welcome']);
    setIsPreviewModalOpen(true);
  };

  // التنقل في المعاينة
  const handlePreviewOption = (optionId: string) => {
    const currentQuestion = questions[previewQuestionId];
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    
    if (selectedOption?.nextQuestionId) {
      setPreviewQuestionId(selectedOption.nextQuestionId);
      setPreviewHistory([...previewHistory, selectedOption.nextQuestionId]);
    }
  };

  // الرجوع في المعاينة
  const handlePreviewBack = () => {
    if (previewHistory.length > 1) {
      const newHistory = [...previewHistory];
      newHistory.pop();
      setPreviewHistory(newHistory);
      setPreviewQuestionId(newHistory[newHistory.length - 1]);
    }
  };

  // إعادة تعيين المعاينة
  const handlePreviewReset = () => {
    setPreviewQuestionId('welcome');
    setPreviewHistory(['welcome']);
  };

  const selectedQuestion = questions[selectedQuestionId];
  const previewQuestion = questions[previewQuestionId];

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900">
      <div className="p-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">إدارة البوت</h1>
                <p className="text-cyan-100 mt-1">تحرير شجرة الأسئلة والإجابات</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
              >
                <Eye className="w-5 h-5" />
                معاينة
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
              >
                <Download className="w-5 h-5" />
                تصدير JSON
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
              >
                <Save className="w-5 h-5" />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Questions List - Left Side */}
          <div className="col-span-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">قائمة الأسئلة</h2>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {Object.values(questions).map((question) => (
                  <button
                    key={question.id}
                    onClick={() => setSelectedQuestionId(question.id)}
                    className={`w-full text-right p-4 rounded-lg transition-all ${
                      selectedQuestionId === question.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                        : 'bg-white/5 text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{question.emoji || '💬'}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{question.id}</div>
                        <div className="text-xs opacity-80 line-clamp-2 mt-1">
                          {question.text.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Details - Right Side */}
          <div className="col-span-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              {selectedQuestion ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{selectedQuestion.emoji || '💬'}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedQuestion.id}</h2>
                        <p className="text-cyan-300 text-sm mt-1">
                          {selectedQuestion.options.length} خيار
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleEdit(selectedQuestion)}
                      className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
                    >
                      <Edit2 className="w-5 h-5" />
                      تعديل
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Question Text */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-cyan-400 font-semibold mb-2">نص السؤال:</h3>
                      <p className="text-white whitespace-pre-wrap">{selectedQuestion.text}</p>
                    </div>

                    {/* Question Properties */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h3 className="text-cyan-400 font-semibold mb-2">يتطلب إدخال:</h3>
                        <p className="text-white">{selectedQuestion.requiresInput ? 'نعم' : 'لا'}</p>
                      </div>
                      
                      {selectedQuestion.inputType && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-cyan-400 font-semibold mb-2">نوع الإدخال:</h3>
                          <p className="text-white">{selectedQuestion.inputType}</p>
                        </div>
                      )}
                      
                      {selectedQuestion.nextStep && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-cyan-400 font-semibold mb-2">الخطوة التالية:</h3>
                          <p className="text-white">{selectedQuestion.nextStep}</p>
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div>
                      <h3 className="text-cyan-400 font-semibold mb-3">الخيارات المتاحة:</h3>
                      <div className="space-y-2">
                        {selectedQuestion.options.map((option) => (
                          <div
                            key={option.id}
                            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{option.emoji}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-cyan-300 font-mono text-sm">#{option.id}</span>
                                  <span className="text-white font-semibold">{option.label}</span>
                                </div>
                                {option.nextQuestionId && (
                                  <div className="text-xs text-cyan-400 mt-1">
                                    ← ينتقل إلى: {option.nextQuestionId}
                                  </div>
                                )}
                                {option.responseText && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    رد: {option.responseText}
                                  </div>
                                )}
                                {option.department && (
                                  <div className="text-xs text-yellow-400 mt-1">
                                    قسم: {option.department}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  اختر سؤالاً من القائمة
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">تعديل السؤال</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Question ID */}
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">معرف السؤال (ID):</label>
                <input
                  type="text"
                  value={editingQuestion.id}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, id: e.target.value })}
                  className="w-full bg-white/10 text-white border border-cyan-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                  disabled
                />
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">نص السؤال:</label>
                <textarea
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  rows={4}
                  className="w-full bg-white/10 text-white border border-cyan-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">الإيموجي:</label>
                <input
                  type="text"
                  value={editingQuestion.emoji || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, emoji: e.target.value })}
                  className="w-full bg-white/10 text-white border border-cyan-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                  placeholder="💬"
                />
              </div>

              {/* Requires Input */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingQuestion.requiresInput || false}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, requiresInput: e.target.checked })}
                  className="w-5 h-5"
                />
                <label className="text-white">يتطلب إدخال من المستخدم</label>
              </div>

              {/* Input Type */}
              {editingQuestion.requiresInput && (
                <div>
                  <label className="block text-cyan-400 font-semibold mb-2">نوع الإدخال:</label>
                  <select
                    value={editingQuestion.inputType || 'text'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, inputType: e.target.value as any })}
                    className="w-full bg-white/10 text-white border border-cyan-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="text">نص</option>
                    <option value="number">رقم</option>
                    <option value="date">تاريخ</option>
                    <option value="phone">هاتف</option>
                  </select>
                </div>
              )}

              {/* Next Step */}
              <div>
                <label className="block text-cyan-400 font-semibold mb-2">الخطوة التالية (اختياري):</label>
                <input
                  type="text"
                  value={editingQuestion.nextStep || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, nextStep: e.target.value })}
                  className="w-full bg-white/10 text-white border border-cyan-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                  placeholder="next_question_id"
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-cyan-400 font-semibold">الخيارات:</label>
                  <button
                    onClick={handleAddOption}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة خيار
                  </button>
                </div>

                <div className="space-y-4">
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">خيار #{index + 1}</span>
                        <button
                          onClick={() => handleDeleteOption(option.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-cyan-300 text-sm mb-1">معرف الخيار:</label>
                          <input
                            type="text"
                            value={option.id}
                            onChange={(e) => handleUpdateOption(index, 'id', e.target.value)}
                            className="w-full bg-white/10 text-white border border-cyan-500/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-cyan-300 text-sm mb-1">الإيموجي:</label>
                          <input
                            type="text"
                            value={option.emoji || ''}
                            onChange={(e) => handleUpdateOption(index, 'emoji', e.target.value)}
                            className="w-full bg-white/10 text-white border border-cyan-500/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-cyan-300 text-sm mb-1">نص الخيار:</label>
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                          className="w-full bg-white/10 text-white border border-cyan-500/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-cyan-300 text-sm mb-1">السؤال التالي (ID):</label>
                        <input
                          type="text"
                          value={option.nextQuestionId || ''}
                          onChange={(e) => handleUpdateOption(index, 'nextQuestionId', e.target.value)}
                          className="w-full bg-white/10 text-white border border-cyan-500/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
                          placeholder="question_id"
                        />
                      </div>

                      <div>
                        <label className="block text-cyan-300 text-sm mb-1">نص الرد (اختياري):</label>
                        <input
                          type="text"
                          value={option.responseText || ''}
                          onChange={(e) => handleUpdateOption(index, 'responseText', e.target.value)}
                          className="w-full bg-white/10 text-white border border-cyan-500/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-cyan-300 text-sm mb-1">القسم (اختياري):</label>
                        <input
                          type="text"
                          value={option.department || ''}
                          onChange={(e) => handleUpdateOption(index, 'department', e.target.value)}
                          className="w-full bg-white/10 text-white border border-cyan-500/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.collectData || false}
                          onChange={(e) => handleUpdateOption(index, 'collectData', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-white text-sm">جمع بيانات</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg transition-all shadow-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && previewQuestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">معاينة البوت</h2>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviewBack}
                    disabled={previewHistory.length <= 1}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg transition-all text-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                    رجوع
                  </button>
                  <button
                    onClick={handlePreviewReset}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-all text-sm"
                  >
                    <Home className="w-4 h-4" />
                    إعادة تعيين
                  </button>
                </div>
                
                <div className="text-cyan-100 text-sm">
                  خطوة {previewHistory.length} - {previewQuestionId}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Bot Message */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg p-6 mb-6 border border-cyan-500/30">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{previewQuestion.emoji || '💬'}</span>
                  <div className="flex-1">
                    <p className="text-white whitespace-pre-wrap leading-relaxed">
                      {previewQuestion.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Options */}
              {previewQuestion.options.length > 0 && (
                <div className="space-y-2">
                  {previewQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handlePreviewOption(option.id)}
                      className="w-full bg-white/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 text-right p-4 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-500"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-white font-semibold">{option.label}</span>
                        {option.nextQuestionId && (
                          <ChevronLeft className="w-5 h-5 text-cyan-400 mr-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Input Field */}
              {previewQuestion.requiresInput && (
                <div className="mt-4">
                  <input
                    type={previewQuestion.inputType || 'text'}
                    placeholder="اكتب إجابتك هنا..."
                    className="w-full bg-white/10 text-white border border-cyan-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Preview Info */}
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>هذه معاينة فقط - لن يتم حفظ أي بيانات</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
