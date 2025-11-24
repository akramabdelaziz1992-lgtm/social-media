"use client";

import React, { useState, useEffect } from 'react';
import { 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Phone, 
  Play, 
  Pause,
  Download,
  Clock,
  Calendar,
  RefreshCw
} from 'lucide-react';

export interface CallHistoryItem {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  contactName?: string;
  phoneNumber: string;
  duration: string;
  timestamp: string;
  recordingUrl?: string;
  status: 'completed' | 'missed' | 'failed';
}

interface CallHistoryProps {
  onCall: (phone: string) => void;
  disabled?: boolean;
  autoRefresh?: boolean;
}

export default function CallHistory({ onCall, disabled = false, autoRefresh = true }: CallHistoryProps) {
  const [calls, setCalls] = useState<CallHistoryItem[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Fetch calls and recordings from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch calls from database
      const callsResponse = await fetch('http://localhost:4000/api/calls');
      const callsData = await callsResponse.json();

      // Fetch recordings from Twilio
      const recordingsResponse = await fetch('http://localhost:4000/api/calls/recordings?limit=50');
      const recordingsData = await recordingsResponse.json();
      
      setRecordings(recordingsData);

      // Map calls with recordings
      const mappedCalls: CallHistoryItem[] = callsData.map((call: any) => {
        const recording = recordingsData.find((r: any) => r.callSid === call.twilioCallSid);
        
        return {
          id: call.id,
          type: call.direction === 'inbound' ? 'incoming' : 'outgoing',
          contactName: call.agentName || undefined,
          phoneNumber: call.direction === 'inbound' ? call.fromNumber : call.toNumber,
          duration: call.durationSeconds ? formatDuration(call.durationSeconds) : '0:00',
          timestamp: call.createdAt,
          recordingUrl: recording?.url,
          status: call.status === 'completed' ? 'completed' : 
                  call.status === 'no-answer' ? 'missed' : 'failed',
        };
      });

      setCalls(mappedCalls);
      console.log(`📞 Loaded ${mappedCalls.length} calls with ${recordingsData.length} recordings`);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming size={20} className="text-green-600" />;
      case 'outgoing':
        return <PhoneOutgoing size={20} className="text-blue-600" />;
      case 'missed':
        return <PhoneMissed size={20} className="text-red-600" />;
      default:
        return <Phone size={20} />;
    }
  };

  const getCallTypeText = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'واردة';
      case 'outgoing':
        return 'صادرة';
      case 'missed':
        return 'فائتة';
      default:
        return '';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `اليوم ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `أمس ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ar-EG', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handlePlayRecording = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // Here you would actually play the audio file
      // const audio = new Audio(recordingUrl);
      // audio.play();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          سجل المكالمات
        </h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
          title="تحديث"
        >
          <RefreshCw size={18} className={`text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Phone size={48} className="mb-4 opacity-50" />
            <p>لا توجد مكالمات</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {calls.map((call) => (
              <div
                key={call.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Call Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getCallIcon(call.type)}
                  </div>

                  {/* Call Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {call.contactName}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        ${call.type === 'incoming' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          call.type === 'outgoing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {getCallTypeText(call.type)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-1" dir="ltr">
                      {call.phoneNumber}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatTimestamp(call.timestamp)}</span>
                      </div>
                      {call.duration && call.status === 'completed' && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{call.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Recording Controls */}
                    {call.recordingUrl && call.status === 'completed' && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handlePlayRecording(call.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 
                                   dark:bg-blue-900 dark:text-blue-200 rounded-md text-xs font-medium
                                   hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {playingId === call.id ? (
                            <>
                              <Pause size={14} />
                              <span>إيقاف</span>
                            </>
                          ) : (
                            <>
                              <Play size={14} />
                              <span>تشغيل التسجيل</span>
                            </>
                          )}
                        </button>
                        <a
                          href={call.recordingUrl}
                          download
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700
                                   dark:bg-gray-700 dark:text-gray-300 rounded-md text-xs font-medium
                                   hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Download size={14} />
                          <span>تحميل</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Call Button */}
                  <button
                    onClick={() => onCall(call.phoneNumber)}
                    disabled={disabled}
                    className="flex-shrink-0 p-2 text-green-600 hover:bg-green-50 
                             dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="إعادة الاتصال"
                  >
                    <Phone size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {calls.filter(c => c.type === 'incoming').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">واردة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {calls.filter(c => c.type === 'outgoing').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">صادرة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {calls.filter(c => c.type === 'missed').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">فائتة</div>
          </div>
        </div>
      </div>
    </div>
  );
}
