'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  color?: string;
}

export default function StatCard({ label, value, subLabel, color = 'bg-blue-500' }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 text-white`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
      {subLabel && <div className="text-xs opacity-75 mt-1">{subLabel}</div>}
    </div>
  );
}
