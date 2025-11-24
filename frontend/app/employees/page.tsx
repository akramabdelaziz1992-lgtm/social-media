'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Users, Building2, Filter, Download } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: 'مدير' | 'موظف' | 'مشرف';
  status: 'نشط' | 'غير نشط' | 'إجازة';
  hireDate: string;
  totalAssignedChats: number;
  todayChats: number;
  responseTime: string; // Average response time
  avatar?: string;
  permissions: string[];
  password?: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
  activeChats: number;
  manager?: string;
  color: string;
}

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmad@almasar.com',
      phone: '+966501234567',
      department: 'مبيعات',
      role: 'مشرف',
      status: 'نشط',
      hireDate: '2023-01-15',
      totalAssignedChats: 245,
      todayChats: 12,
      responseTime: '2.5 دقيقة',
      permissions: ['view_chats', 'reply_messages', 'assign_chats', 'view_reports']
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@almasar.com',
      phone: '+966507654321',
      department: 'خدمة العملاء',
      role: 'موظف',
      status: 'نشط',
      hireDate: '2023-03-20',
      totalAssignedChats: 189,
      todayChats: 8,
      responseTime: '3.1 دقيقة',
      permissions: ['view_chats', 'reply_messages', 'view_reports']
    },
    {
      id: '3',
      name: 'محمود خالد',
      email: 'mahmoud@almasar.com',
      phone: '+966509876543',
      department: 'دعم فني',
      role: 'موظف',
      status: 'إجازة',
      hireDate: '2023-06-10',
      totalAssignedChats: 167,
      todayChats: 0,
      responseTime: '4.2 دقيقة',
      permissions: ['view_chats', 'reply_messages']
    },
    {
      id: '4',
      name: 'سارة أحمد',
      email: 'sara@almasar.com',
      phone: '+966502468135',
      department: 'مبيعات',
      role: 'مدير',
      status: 'نشط',
      hireDate: '2022-09-01',
      totalAssignedChats: 312,
      todayChats: 15,
      responseTime: '1.8 دقيقة',
      permissions: ['view_chats', 'reply_messages', 'assign_chats', 'view_reports', 'manage_employees', 'manage_department']
    }
  ]);

  const [departments, setDepartments] = useState<Department[]>([
    {
      id: '1',
      name: 'مبيعات',
      description: 'قسم المبيعات والتسويق',
      employeeCount: 8,
      activeChats: 23,
      manager: 'سارة أحمد',
      color: 'emerald'
    },
    {
      id: '2',
      name: 'خدمة العملاء',
      description: 'قسم خدمة ودعم العملاء',
      employeeCount: 12,
      activeChats: 45,
      manager: 'محمد حسن',
      color: 'blue'
    },
    {
      id: '3',
      name: 'دعم فني',
      description: 'قسم الدعم الفني والتقني',
      employeeCount: 6,
      activeChats: 18,
      manager: 'عمر سالم',
      color: 'purple'
    },
    {
      id: '4',
      name: 'إدارة',
      description: 'الإدارة العامة والموارد البشرية',
      employeeCount: 4,
      activeChats: 5,
      manager: 'خالد عبدالله',
      color: 'orange'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'موظف',
    status: 'نشط',
    hireDate: new Date().toISOString().split('T')[0],
    permissions: []
  });

  const [deptFormData, setDeptFormData] = useState<Partial<Department>>({
    name: '',
    description: '',
    manager: '',
    color: 'blue'
  });

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.includes(searchTerm) || 
                         emp.email.includes(searchTerm) || 
                         emp.phone.includes(searchTerm);
    const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  const handleAddEmployee = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.department) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone!,
      department: formData.department!,
      role: formData.role || 'موظف',
      status: formData.status || 'نشط',
      hireDate: formData.hireDate || new Date().toISOString().split('T')[0],
      totalAssignedChats: 0,
      todayChats: 0,
      responseTime: '0 دقيقة',
      permissions: formData.permissions || []
    };

    setEmployees([...employees, newEmployee]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateEmployee = () => {
    if (!selectedEmployee) return;

    const updatedEmployees = employees.map(emp =>
      emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp
    );

    setEmployees(updatedEmployees);
    setShowEditModal(false);
    setSelectedEmployee(null);
    resetForm();
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData(employee);
    setShowEditModal(true);
  };

  const handleAddDepartment = () => {
    if (!deptFormData.name || !deptFormData.description) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const newDept: Department = {
      id: Date.now().toString(),
      name: deptFormData.name!,
      description: deptFormData.description!,
      manager: deptFormData.manager,
      color: deptFormData.color || 'blue',
      employeeCount: 0,
      activeChats: 0
    };

    setDepartments([...departments, newDept]);
    setShowDepartmentModal(false);
    resetDeptForm();
  };

  const handleDeleteDepartment = (id: string) => {
    const dept = departments.find(d => d.id === id);
    if (dept && dept.employeeCount > 0) {
      alert('لا يمكن حذف قسم يحتوي على موظفين. يرجى نقل الموظفين أولاً.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      setDepartments(departments.filter(d => d.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: 'موظف',
      status: 'نشط',
      hireDate: new Date().toISOString().split('T')[0],
      permissions: []
    });
  };

  const resetDeptForm = () => {
    setDeptFormData({
      name: '',
      description: '',
      manager: '',
      color: 'blue'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'نشط': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'غير نشط': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'إجازة': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'مدير': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'مشرف': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'موظف': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getDepartmentColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      emerald: 'from-emerald-500 to-green-600',
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-pink-600',
      orange: 'from-orange-500 to-amber-600',
      red: 'from-red-500 to-rose-600',
      indigo: 'from-indigo-500 to-violet-600'
    };
    return colors[color] || colors.blue;
  };

  const togglePermission = (permission: string) => {
    const currentPermissions = formData.permissions || [];
    if (currentPermissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: currentPermissions.filter(p => p !== permission)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...currentPermissions, permission]
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-2">
          إدارة الموظفين والأقسام
        </h1>
        <p className="text-slate-400">إدارة فريق العمل والأقسام والصلاحيات</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-xl backdrop-blur-sm border border-slate-800">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'employees'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>الموظفين ({employees.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'departments'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span>الأقسام ({departments.length})</span>
        </button>
      </div>

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <>
          {/* Search and Filters */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث بالاسم، البريد، أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Department Filter */}
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">كل الأقسام</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">كل الأدوار</option>
                <option value="مدير">مدير</option>
                <option value="مشرف">مشرف</option>
                <option value="موظف">موظف</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">كل الحالات</option>
                <option value="نشط">نشط</option>
                <option value="غير نشط">غير نشط</option>
                <option value="إجازة">إجازة</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موظف</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all duration-300">
                <Download className="w-4 h-4" />
                <span>تصدير</span>
              </button>
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">الموظف</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">القسم</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">الدور</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">المحادثات</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">وقت الرد</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">تاريخ التعيين</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-slate-300">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{employee.name}</div>
                          <div className="text-sm text-slate-400">{employee.email}</div>
                          <div className="text-xs text-slate-500">{employee.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{employee.department}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(employee.role)}`}>
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">
                          <div className="font-medium">{employee.totalAssignedChats} إجمالي</div>
                          <div className="text-sm text-emerald-400">{employee.todayChats} اليوم</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{employee.responseTime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm">{employee.hireDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => setShowDepartmentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDepartmentColorClass(dept.color)} flex items-center justify-center`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{dept.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{dept.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">المدير:</span>
                    <span className="text-white font-medium">{dept.manager || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">عدد الموظفين:</span>
                    <span className="text-white font-medium">{dept.employeeCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">المحادثات النشطة:</span>
                    <span className="text-emerald-400 font-medium">{dept.activeChats}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Employee Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {showAddModal ? 'إضافة موظف جديد' : 'تعديل بيانات الموظف'}
              </h2>
              <button
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الاسم *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="أدخل اسم الموظف"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="example@almasar.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="+966XXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">القسم *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="">اختر القسم</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الدور</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="موظف">موظف</option>
                    <option value="مشرف">مشرف</option>
                    <option value="مدير">مدير</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="نشط">نشط</option>
                    <option value="غير نشط">غير نشط</option>
                    <option value="إجازة">إجازة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">تاريخ التعيين</label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {showAddModal && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
                    <input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="كلمة المرور"
                    />
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">الصلاحيات</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'view_chats', label: 'عرض المحادثات' },
                    { id: 'reply_messages', label: 'الرد على الرسائل' },
                    { id: 'assign_chats', label: 'تعيين المحادثات' },
                    { id: 'view_reports', label: 'عرض التقارير' },
                    { id: 'manage_employees', label: 'إدارة الموظفين' },
                    { id: 'manage_department', label: 'إدارة القسم' },
                  ].map(perm => (
                    <label key={perm.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.permissions?.includes(perm.id) || false}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900"
                      />
                      <span className="text-sm text-slate-300">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={showAddModal ? handleAddEmployee : handleUpdateEmployee}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 font-semibold"
                >
                  {showAddModal ? 'إضافة' : 'حفظ التغييرات'}
                </button>
                <button
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
            <div className="border-b border-slate-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">إضافة قسم جديد</h2>
              <button
                onClick={() => {
                  setShowDepartmentModal(false);
                  resetDeptForm();
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">اسم القسم *</label>
                <input
                  type="text"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="مثال: المبيعات"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">الوصف *</label>
                <textarea
                  value={deptFormData.description}
                  onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="وصف مختصر للقسم"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">المدير</label>
                <input
                  type="text"
                  value={deptFormData.manager}
                  onChange={(e) => setDeptFormData({ ...deptFormData, manager: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="اسم مدير القسم"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">اللون</label>
                <select
                  value={deptFormData.color}
                  onChange={(e) => setDeptFormData({ ...deptFormData, color: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="blue">أزرق</option>
                  <option value="emerald">أخضر</option>
                  <option value="purple">بنفسجي</option>
                  <option value="orange">برتقالي</option>
                  <option value="red">أحمر</option>
                  <option value="indigo">نيلي</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddDepartment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 font-semibold"
                >
                  إضافة القسم
                </button>
                <button
                  onClick={() => {
                    setShowDepartmentModal(false);
                    resetDeptForm();
                  }}
                  className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
