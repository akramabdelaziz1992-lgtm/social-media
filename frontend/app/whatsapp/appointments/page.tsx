'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

export default function WhatsAppAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    customerPhone: '',
    service: '',
    date: '',
    time: '',
    notes: '',
  });
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          customerName: 'أحمد محمد',
          customerPhone: '+966501234567',
          service: 'فحص أسنان',
          date: '2024-01-20',
          time: '10:00',
          status: 'confirmed',
          notes: 'فحص دوري',
        },
        {
          id: '2',
          customerName: 'فاطمة علي',
          customerPhone: '+966507654321',
          service: 'تنظيف أسنان',
          date: '2024-01-22',
          time: '14:30',
          status: 'pending',
          notes: 'تنظيف شامل',
        },
        {
          id: '3',
          customerName: 'محمد حسن',
          customerPhone: '+966509876543',
          service: 'حشو أسنان',
          date: '2024-01-18',
          time: '11:00',
          status: 'completed',
          notes: 'حشو ضرس علوي',
        },
      ];
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const handleAddAppointment = async () => {
    if (!newAppointment.customerName || !newAppointment.service || !newAppointment.date || !newAppointment.time) {
      alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const appointment: Appointment = {
        id: Date.now().toString(),
        ...newAppointment,
        status: 'pending',
      };
      setAppointments(prev => [...prev, appointment]);
      setNewAppointment({ customerName: '', customerPhone: '', service: '', date: '', time: '', notes: '' });
      setShowAddForm(false);
      alert('تم إضافة الموعد بنجاح!');
    } catch (error) {
      alert('فشل في إضافة الموعد');
    }
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    ));
  };

  const deleteAppointment = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    }
  };

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'pending', label: 'في الانتظار' },
    { value: 'confirmed', label: 'مؤكد' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
  ];

  const filteredAppointments = selectedStatus === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
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
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">جدولة المواعيد</h1>
                  <p className="text-gray-600">إدارة مواعيد العملاء وحجوزاتهم عبر واتس آب</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {showAddForm ? 'إلغاء' : 'إضافة موعد'}
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  العودة
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    selectedStatus === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Appointment Form */}
          {showAddForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">إضافة موعد جديد</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العميل *
                  </label>
                  <input
                    type="text"
                    value={newAppointment.customerName}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="اسم العميل الكامل"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={newAppointment.customerPhone}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+966501234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الخدمة *
                  </label>
                  <input
                    type="text"
                    value={newAppointment.service}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, service: e.target.value }))}
                    placeholder="نوع الخدمة"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التاريخ *
                    </label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوقت *
                    </label>
                    <input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="أي ملاحظات إضافية"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddAppointment}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  إضافة الموعد
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

          {/* Appointments List */}
          <div className="divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                لا توجد مواعيد
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-purple-700">
                          {appointment.customerName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.customerName}</h3>
                        <p className="text-gray-600">{appointment.customerPhone}</p>
                        <p className="text-sm text-gray-500">{appointment.service}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{appointment.date}</div>
                        <div className="text-sm text-gray-500">{appointment.time}</div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>

                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            تأكيد
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            إكمال
                          </button>
                        )}
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {appointments.filter(a => a.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">في الانتظار</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </div>
                <div className="text-sm text-gray-600">مؤكد</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {appointments.filter(a => a.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">مكتمل</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {appointments.filter(a => a.status === 'cancelled').length}
                </div>
                <div className="text-sm text-gray-600">ملغي</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
