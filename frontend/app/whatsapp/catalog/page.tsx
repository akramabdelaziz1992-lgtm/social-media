"use client";

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  User, 
  Phone, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Order {
  id: string;
  orderUniqueId: string;
  catalog: string;
  phoneNumber: string;
  buyer: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

export default function WhatsAppCatalogPage() {
  const [selectedTab, setSelectedTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalog, setSelectedCatalog] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data
  const catalogOrders: Order[] = [
    {
      id: '1',
      orderUniqueId: 'ORD-2024-001',
      catalog: 'Electronics',
      phoneNumber: '+201234567890',
      buyer: 'أحمد محمد',
      amount: 1500,
      currency: 'EGP',
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '2',
      orderUniqueId: 'ORD-2024-002',
      catalog: 'Fashion',
      phoneNumber: '+201098765432',
      buyer: 'فاطمة علي',
      amount: 850,
      currency: 'EGP',
      status: 'pending',
      date: '2024-01-16'
    },
    {
      id: '3',
      orderUniqueId: 'ORD-2024-003',
      catalog: 'Home & Living',
      phoneNumber: '+201555444333',
      buyer: 'محمود سعيد',
      amount: 2100,
      currency: 'EGP',
      status: 'completed',
      date: '2024-01-17'
    },
  ];

  const manualPaymentOrders: Order[] = [
    {
      id: '4',
      orderUniqueId: 'MAN-2024-001',
      catalog: 'Electronics',
      phoneNumber: '+201444555666',
      buyer: 'سارة أحمد',
      amount: 3200,
      currency: 'EGP',
      status: 'pending',
      date: '2024-01-18'
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      completed: 'bg-green-100 text-green-700 border-green-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300',
    };
    const labels = {
      pending: 'قيد الانتظار',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                WhatsApp eCommerce Catalog
              </h1>
              <p className="text-gray-600">Manage your product catalog and orders</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Total Orders</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">124</div>
            <div className="text-sm text-green-600 mt-1">+12% this month</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Revenue</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">185K</div>
            <div className="text-sm text-blue-600 mt-1">+8% this month</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">⏳</span>
              </div>
              <span className="text-gray-600 text-sm">Pending</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">18</div>
            <div className="text-sm text-yellow-600 mt-1">Awaiting payment</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-cyan-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">Customers</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">856</div>
            <div className="text-sm text-cyan-600 mt-1">+24 new this week</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab('catalog')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              selectedTab === 'catalog'
                ? 'bg-white shadow-lg text-gray-900'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            Catalog Orders
          </button>
          <button
            onClick={() => setSelectedTab('manual')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              selectedTab === 'manual'
                ? 'bg-white shadow-lg text-gray-900'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            Manual Payment Orders
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catalog</label>
              <select
                value={selectedCatalog}
                onChange={(e) => setSelectedCatalog(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Catalogs</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Living</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2">
                <Plus size={20} />
                <span>Add Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-100">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Order ID</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Order Unique ID</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Catalog</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Phone Number</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Buyer</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(selectedTab === 'catalog' ? catalogOrders : manualPaymentOrders).map((order) => (
                  <tr key={order.id} className="hover:bg-purple-50/50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-purple-600">{order.orderUniqueId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.catalog}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{order.phoneNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.buyer}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {order.amount.toLocaleString()} {order.currency}
                    </td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold">1-10</span> of <span className="font-bold">124</span> orders
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition">
                1
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                2
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                3
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
