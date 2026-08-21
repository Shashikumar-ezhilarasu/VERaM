import React from 'react';

interface ConnectionStatusDotProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  onReconnect?: () => void;
}

export function ConnectionStatusDot({ status, onReconnect }: ConnectionStatusDotProps) {
  const colors = {
    disconnected: 'bg-gray-400',
    connecting: 'bg-yellow-400',
    connected: 'bg-green-500',
    error: 'bg-red-500',
  };

  const labels = {
    disconnected: 'Offline',
    connecting: 'Connecting...',
    connected: 'Live',
    error: 'Connection Error',
  };

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-ink-muted">
      <div className={`w-3 h-3 rounded-full ${colors[status]} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
      <span>{labels[status]}</span>
      {status === 'error' && onReconnect && (
        <button onClick={onReconnect} className="underline text-accent-pink ml-2">
          Retry
        </button>
      )}
    </div>
  );
}
