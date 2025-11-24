"use client";

import React, { useState } from 'react';
import { Phone, Search, UserPlus, Star } from 'lucide-react';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  company?: string;
  isFavorite?: boolean;
}

interface ContactsListProps {
  contacts: Contact[];
  onCall: (phone: string) => void;
  disabled?: boolean;
}

export default function ContactsList({ contacts, onCall, disabled = false }: ContactsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFavorite = !showFavoritesOnly || contact.isFavorite;
    
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          جهات الاتصال
        </h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث في جهات الاتصال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                     ${showFavoritesOnly 
                       ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                       : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            <Star size={16} className={showFavoritesOnly ? 'fill-current' : ''} />
            المفضلة
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                     bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200
                     hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <UserPlus size={16} />
            إضافة جديد
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search size={48} className="mb-4 opacity-50" />
            <p>لا توجد جهات اتصال</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {contact.name}
                      </h3>
                      {contact.isFavorite && (
                        <Star size={14} className="text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono" dir="ltr">
                      {contact.phone}
                    </p>
                    {contact.company && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {contact.company}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onCall(contact.phone)}
                    disabled={disabled}
                    className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full
                             disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors
                             shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Phone size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {filteredContacts.length} من أصل {contacts.length} جهة اتصال
        </div>
      </div>
    </div>
  );
}
