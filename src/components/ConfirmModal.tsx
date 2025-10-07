import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconConfig = {
    warning: { Icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    danger: { Icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    info: { Icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    success: { Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  };

  const { Icon, color, bg } = iconConfig[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="blueprint-component rounded-2xl border-2 border-blueprint-accent/30 max-w-md w-full shadow-2xl backdrop-blur-sm">
        <div className="flex items-start gap-4 p-6">
          <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-blueprint-text mb-2">{title}</h2>
            <p className="text-sm text-blueprint-text/70 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 blueprint-button rounded-lg font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 ${
              type === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'blueprint-accent text-blueprint-paper'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
