'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClickAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  status: 'active' | 'inactive';
  clicks: number;
  impressions: number;
  ctr: number;
  createdAt: string;
}

export default function WhatsAppClickAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<ClickAd[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    buttonUrl: '',
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAds: ClickAd[] = [
        {
          id: '1',
          title: 'عرض خاص على المنتجات',
          description: 'خصم 20% على جميع المنتجات الجديدة',
          imageUrl: 'https://via.placeholder.com/300x200',
          buttonText: 'تسوق الآن',
          buttonUrl: 'https://example.com/shop',
          status: 'active',
          clicks: 245,
          impressions: 1200,
          ctr: 20.4,
          createdAt: '2024-01-10',
        },
        {
          id: '2',
          title: 'خدمة التوصيل المجاني',
          description: 'توصيل مجاني للطلبات فوق 200 ريال',
          imageUrl: 'https://via.placeholder.com/300x200',
          buttonText: 'اطلب الآن',
          buttonUrl: 'https://example.com/order',
          status: 'active',
          clicks: 189,
          impressions: 950,
          ctr: 19.9,
          createdAt: '2024-01-12',
        },
      ];
      setAds(mockAds);
    } catch (error) {
      console.error('Failed to load ads:', error);
    }
  };

  const handleAddAd = async () => {
    if (!newAd.title || !newAd.description || !newAd.buttonText || !newAd.buttonUrl) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const ad: ClickAd = {
        id: Date.now().toString(),
        ...newAd,
        status: 'active',
        clicks: 0,
        impressions: 0,
        ctr: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAds(prev => [...prev, ad]);
      setNewAd({ title: '', description: '', imageUrl: '', buttonText: '', buttonUrl: '' });
      setShowAddForm(false);
      alert('تم إضافة الإعلان بنجاح!');
    } catch (error) {
      alert('فشل في إضافة الإعلان');
    }
  };

  const toggleAdStatus = (id: string) => {
    setAds(prev => prev.map(ad =>
      ad.id === id
        ? { ...ad, status: ad.status === 'active' ? 'inactive' : 'active' }
        : ad
    ));
  };

  const deleteAd = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      setAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📢</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">إعلانات النقر</h1>
                  <p className="text-gray-600">إنشاء وإدارة إعلانات النقر للتواصل مع العملاء</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {showAddForm ? 'إلغاء' : 'إضافة إعلان'}
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  العودة
                </button>
              </div>
            </div>
          </div>

          {/* Add Ad Form */}
          {showAddForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">إضافة إعلان جديد</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الإعلان
                  </label>
                  <input
                    type="text"
                    value={newAd.title}
                    onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="عنوان جذاب للإعلان"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف الإعلان
                  </label>
                  <textarea
                    value={newAd.description}
                    onChange={(e) => setNewAd(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="وصف تفصيلي للإعلان"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط الصورة (اختياري)
                  </label>
                  <input
                    type="url"
                    value={newAd.imageUrl}
                    onChange={(e) => setNewAd(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نص الزر
                  </label>
                  <input
                    type="text"
                    value={newAd.buttonText}
                    onChange={(e) => setNewAd(prev => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="مثال: تسوق الآن"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط الزر
                  </label>
                  <input
                    type="url"
                    value={newAd.buttonUrl}
                    onChange={(e) => setNewAd(prev => ({ ...prev, buttonUrl: e.target.value }))}
                    placeholder="https://example.com/action"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddAd}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  إضافة الإعلان
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Ads List */}
          <div className="divide-y divide-gray-200">
            {ads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                لا توجد إعلانات مضافة
              </div>
            ) : (
              ads.map((ad) => (
                <div key={ad.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start gap-6">
                    {ad.imageUrl && (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ad.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.status === 'active' ? 'نشط' : 'معطل'}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{ad.description}</p>

                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm text-gray-500">الزر: {ad.buttonText}</span>
                        <span className="text-sm text-gray-500">الرابط: {ad.buttonUrl}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-semibold text-gray-900">{ad.clicks}</div>
                          <div className="text-gray-500">نقرات</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{ad.impressions}</div>
                          <div className="text-gray-500">عروض</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{ad.ctr}%</div>
                          <div className="text-gray-500">معدل النقر</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{ad.createdAt}</div>
                          <div className="text-gray-500">تاريخ الإنشاء</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleAdStatus(ad.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          ad.status === 'active'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {ad.status === 'active' ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                        تعديل
                      </button>
                      <button
                        onClick={() => deleteAd(ad.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-semibold mb-2">نصائح للإعلانات الفعالة:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>استخدم عناوين جذابة وواضحة</li>
                <li>أضف صور عالية الجودة لجذب الانتباه</li>
                <li>اجعل نص الزر واضح ومحفز للعمل</li>
                <li>تأكد من عمل الروابط بشكل صحيح</li>
                <li>راقب معدل النقر وعدل الإعلانات حسب الأداء</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
