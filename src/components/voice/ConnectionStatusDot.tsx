import React from 'react';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';
import { RefreshCw, WifiOff, Loader2 } from 'lucide-react';

export function ConnectionStatusDot({ status, onReconnect }: { status: string, onReconnect?: () => void }) {
  const { isOnline, isBackendWaking } = useVoiceSessionStore();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 bg-hhgoa-pink text-white px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest border-2 border-hhgoa-green shadow-sm animate-pulse">
        <WifiOff size={14} />
        Offline
      </div>
    );
  }

  if (status === 'reconnecting') {
    return (
      <div className="flex items-center gap-2 bg-hhgoa-yellow text-hhgoa-green px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest border-2 border-hhgoa-green shadow-sm">
        <RefreshCw size={14} className="animate-spin" />
        Reconnecting...
      </div>
    );
  }

  if (isBackendWaking) {
    return (
      <div className="flex items-center gap-2 bg-hhgoa-cream text-hhgoa-green px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest border-2 border-hhgoa-green shadow-sm">
        <Loader2 size={14} className="animate-spin" />
        Waking Backend
      </div>
    );
  }

  let dotColor = 'bg-gray-400';
  let text = 'Disconnected';
  let textColor = 'text-hhgoa-green';
  let bgColor = 'bg-hhgoa-cream';
  
  if (status === 'connected') {
    dotColor = 'bg-hhgoa-green shadow-[0_0_8px_rgba(47,82,51,0.8)] animate-pulse';
    text = 'Live';
    textColor = 'text-hhgoa-green';
    bgColor = 'bg-hhgoa-cream';
  } else if (status === 'connecting') {
    dotColor = 'bg-hhgoa-yellow animate-ping';
    text = 'Connecting';
    textColor = 'text-hhgoa-green';
    bgColor = 'bg-hhgoa-cream';
  } else if (status === 'error') {
    dotColor = 'bg-hhgoa-pink';
    text = 'Error';
    textColor = 'text-hhgoa-white';
    bgColor = 'bg-hhgoa-pink';
  }

  return (
    <div 
      className={`flex items-center gap-3 ${bgColor} ${textColor} px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest border-2 border-hhgoa-green shadow-sm transition-colors cursor-pointer hover:bg-hhgoa-yellow`}
      onClick={status !== 'connected' ? onReconnect : undefined}
    >
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      {text}
    </div>
  );
}