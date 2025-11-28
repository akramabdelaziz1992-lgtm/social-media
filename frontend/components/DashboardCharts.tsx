'use client';

import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const subscriberGrowthData = [
  { day: 'الاثنين', growth: 4 },
  { day: 'الثلاثاء', growth: 3 },
  { day: 'الأربعاء', growth: 2 },
  { day: 'الخميس', growth: 2.7 },
  { day: 'الجمعة', growth: 2 },
  { day: 'السبت', growth: 2.8 },
  { day: 'الأحد', growth: 3 },
];

const pieData = [
  { name: 'Telegram', value: 8 },
  { name: 'WhatsApp', value: 7 },
  { name: 'Meta', value: 4 },
];

const COLORS = ['#06B6D4', '#10B981', '#8B5CF6'];

export function LineChartComponent() {
  return (
    <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 animate-fadeInUp animation-delay-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">نمو المشتركين (آخر 30 يومًا)</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={subscriberGrowthData}>
          <defs>
            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
          <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}
            labelStyle={{ color: '#FFF', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="growth" 
            stroke="#06B6D4" 
            strokeWidth={3} 
            dot={{ fill: '#06B6D4', r: 5 }}
            activeDot={{ r: 8, fill: '#22D3EE' }}
            fill="url(#colorGrowth)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChartComponent() {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 animate-fadeInUp animation-delay-400">
      <h3 className="text-xl font-bold text-white mb-6">مقارنة المشتركين</h3>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index]} 
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-6">
          <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">3</div>
          <div className="text-sm text-cyan-200 mt-1">المشتركين هذا الأسبوع</div>
        </div>
        <div className="mt-4 space-y-2 w-full">
          {pieData.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                <span className="text-white">{entry.name}</span>
              </div>
              <span className="text-cyan-200 font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
