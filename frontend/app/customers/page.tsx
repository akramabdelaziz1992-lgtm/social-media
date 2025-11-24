'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Search, Plus, Mail, Phone, Building2, Calendar,
  Edit, Trash2, Filter, Download, Tag, Star, MessageSquare,
  ChevronDown, X, User, MapPin
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  source: string; // واتساب، فيسبوك، etc
  tags: string[];
  priority: 'عالية' | 'متوسطة' | 'عادية';
  assignedAgent?: string;
  department?: string;
  totalConversations: number;
  lastContact: string;
  status: 'نشط' | 'محتمل' | 'عميل' | 'غير نشط';
  notes?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    source: 'واتساب',
    tags: [] as string[],
    priority: 'عادية' as 'عالية' | 'متوسطة' | 'عادية',
    assignedAgent: '',
    department: '',
    status: 'محتمل' as 'نشط' | 'محتمل' | 'عميل' | 'غير نشط',
    notes: ''
  });

  // Mock data - في الواقع سيتم جلبها من API
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'أحمد محمد',
        phone: '+201234567890',
        email: 'ahmed@example.com',
        company: 'شركة التقنية',
        source: 'واتساب',
        tags: ['عميل محتمل', 'مهتم بالمنتجات'],
        priority: 'عالية',
        assignedAgent: 'محمد سعيد',
        department: 'المبيعات',
        totalConversations: 5,
        lastContact: '2024-01-20',
        status: 'محتمل',
        notes: 'عميل محتمل مهتم بخدماتنا',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'فاطمة علي',
        phone: '+201098765432',
        email: 'fatma@company.com',
        company: 'مؤسسة الإبداع',
        source: 'فيسبوك',
        tags: ['عميل حالي', 'VIP'],
        priority: 'عالية',
        assignedAgent: 'سارة أحمد',
        department: 'خدمة العملاء',
        totalConversations: 12,
        lastContact: '2024-01-22',
        status: 'عميل',
        createdAt: '2023-12-01'
      },
      {
        id: '3',
        name: 'محمود خالد',
        phone: '+201555555555',
        source: 'إنستجرام',
        tags: ['استفسار'],
        priority: 'عادية',
        totalConversations: 2,
        lastContact: '2024-01-18',
        status: 'نشط',
        createdAt: '2024-01-18'
      }
    ];
    setCustomers(mockCustomers);
  }, []);

  const handleAddCustomer = () => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...formData,
      totalConversations: 0,
      lastContact: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setCustomers([newCustomer, ...customers]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateCustomer = () => {
    if (!selectedCustomer) return;
    
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, ...formData } 
        : c
    ));
    
    setSelectedCustomer(null);
    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      company: '',
      source: 'واتساب',
      tags: [],
      priority: 'عادية',
      assignedAgent: '',
      department: '',
      status: 'محتمل',
      notes: ''
    });
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      company: customer.company || '',
      source: customer.source,
      tags: customer.tags,
      priority: customer.priority,
      assignedAgent: customer.assignedAgent || '',
      department: customer.department || '',
      status: customer.status,
      notes: customer.notes || ''
    });
    setShowAddModal(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery) ||
                         (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSource = filterSource === 'all' || customer.source === filterSource;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالية': return 'text-red-400 bg-red-500/20';
      case 'متوسطة': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-cyan-400 bg-cyan-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'عميل': return 'text-green-400 bg-green-500/20';
      case 'محتمل': return 'text-blue-400 bg-blue-500/20';
      case 'نشط': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                إدارة العملاء
              </h1>
              <p className="text-cyan-300/70">إجمالي العملاء: {customers.length}</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setSelectedCustomer(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <Plus size={20} />
            <span>إضافة عميل جديد</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400" size={20} />
            <input
              type="text"
              placeholder="بحث بالاسم، الهاتف، أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">كل المصادر</option>
            <option value="واتساب">واتساب</option>
            <option value="فيسبوك">فيسبوك</option>
            <option value="إنستجرام">إنستجرام</option>
            <option value="تيليجرام">تيليجرام</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">كل الحالات</option>
            <option value="عميل">عميل</option>
            <option value="محتمل">محتمل</option>
            <option value="نشط">نشط</option>
            <option value="غير نشط">غير نشط</option>
          </select>
          
          <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
            <Download size={20} />
          </button>
        </div>

        {/* Customers Table */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">الاسم</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">الهاتف</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">المصدر</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">الأولوية</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">الوكيل</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">المحادثات</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">آخر اتصال</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-cyan-200">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{customer.name}</div>
                        {customer.company && (
                          <div className="text-xs text-cyan-300/70">{customer.company}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-cyan-400" />
                        <span className="text-sm text-white">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full">
                        {customer.source}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(customer.priority)}`}>
                        {customer.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">{customer.assignedAgent || 'غير مسند'}</div>
                      {customer.department && (
                        <div className="text-xs text-cyan-300/70">{customer.department}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} className="text-cyan-400" />
                        <span className="text-sm text-white">{customer.totalConversations}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-white">{customer.lastContact}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {selectedCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCustomer(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="text-cyan-300" size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">الاسم *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">رقم الهاتف *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">الشركة</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">المصدر</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="واتساب">واتساب</option>
                      <option value="فيسبوك">فيسبوك</option>
                      <option value="إنستجرام">إنستجرام</option>
                      <option value="تيليجرام">تيليجرام</option>
                      <option value="مكالمة هاتفية">مكالمة هاتفية</option>
                      <option value="زيارة مباشرة">زيارة مباشرة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="محتمل">محتمل</option>
                      <option value="نشط">نشط</option>
                      <option value="عميل">عميل</option>
                      <option value="غير نشط">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">الأولوية</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="عادية">عادية</option>
                      <option value="متوسطة">متوسطة</option>
                      <option value="عالية">عالية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">القسم</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">اختر القسم</option>
                      <option value="المبيعات">المبيعات</option>
                      <option value="خدمة العملاء">خدمة العملاء</option>
                      <option value="الدعم الفني">الدعم الفني</option>
                      <option value="المحاسبة">المحاسبة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-200 mb-2">الوكيل المسؤول</label>
                  <select
                    value={formData.assignedAgent}
                    onChange={(e) => setFormData({...formData, assignedAgent: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">غير مسند</option>
                    <option value="أحمد محمد">أحمد محمد - مبيعات</option>
                    <option value="فاطمة علي">فاطمة علي - خدمة عملاء</option>
                    <option value="محمود سعيد">محمود سعيد - دعم فني</option>
                    <option value="سارة أحمد">سارة أحمد - مبيعات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-200 mb-2">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCustomer(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={selectedCustomer ? handleUpdateCustomer : handleAddCustomer}
                  disabled={!formData.name || !formData.phone}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {selectedCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
