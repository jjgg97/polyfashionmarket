'use client';

import { useAppStore } from '@/stores/useAppStore';
import { Toast } from '@/types';
import { getTxUrl } from '@/lib/solana/transactions';

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useAppStore((s) => s.removeToast);

  const icons: Record<Toast['type'], string> = {
    success: '✅',
    error: '❌',
    loading: '⏳',
    info: 'ℹ️',
  };

  const borders: Record<Toast['type'], string> = {
    success: 'border-green-500/40',
    error: 'border-red-500/40',
    loading: 'border-blue-500/40',
    info: 'border-white/20',
  };

  return (
    <div
      className={`glass border ${borders[toast.type]} p-4 min-w-[300px] max-w-sm
                  animate-fadeIn shadow-2xl`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-base mt-0.5">{icons[toast.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-white">
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                {toast.message}
              </p>
            )}
            {toast.txSignature && (
              <a
                href={getTxUrl(toast.txSignature)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-400 hover:text-blue-300 mt-1 block truncate"
              >
                View on Solscan →
              </a>
            )}
          </div>
        </div>

        {toast.type !== 'loading' && (
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-600 hover:text-white text-xs mt-0.5 flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
