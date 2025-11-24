"use client";

import React from 'react';
import { Phone, Delete } from 'lucide-react';

interface DialpadProps {
  value: string;
  onChange: (value: string) => void;
  onCall: () => void;
  disabled?: boolean;
}

export default function Dialpad({ value, onChange, onCall, disabled = false }: DialpadProps) {
  const buttons = [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' },
    { digit: '0', letters: '+' },
    { digit: '#', letters: '' },
  ];

  const handleDigitClick = (digit: string) => {
    if (!disabled) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    if (!disabled && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleCall = () => {
    if (!disabled && value.trim()) {
      onCall();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 min-h-[60px] flex items-center justify-between">
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="أدخل الرقم"
          disabled={disabled}
          className="flex-1 bg-transparent text-2xl text-right font-mono outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          dir="ltr"
        />
        {value && (
          <button
            onClick={handleBackspace}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <Delete size={20} />
          </button>
        )}
      </div>

      {/* Dialpad Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {buttons.map(({ digit, letters }) => (
          <button
            key={digit}
            onClick={() => handleDigitClick(digit)}
            disabled={disabled}
            className="aspect-square bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
                     rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 
                     flex flex-col items-center justify-center gap-1 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     active:scale-95"
          >
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {digit}
            </span>
            {letters && (
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                {letters}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Call Button */}
      <button
        onClick={handleCall}
        disabled={disabled || !value.trim()}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                 text-white font-semibold py-4 px-6 rounded-xl 
                 flex items-center justify-center gap-2 transition-all
                 disabled:cursor-not-allowed shadow-lg
                 active:scale-95"
      >
        <Phone size={24} />
        <span className="text-lg">اتصال</span>
      </button>
    </div>
  );
}
