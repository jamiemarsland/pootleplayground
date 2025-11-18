import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface VersionAnnouncementModalProps {
  onClose: () => void;
}

export function VersionAnnouncementModal({ onClose }: VersionAnnouncementModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="blueprint-paper rounded-2xl shadow-2xl max-w-md w-full border-2 border-blueprint-accent/30 animate-in fade-in duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 blueprint-accent rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-blueprint-paper" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blueprint-text">New in Version 1.6</h2>
                <p className="text-sm text-blueprint-text/60">Exciting new features!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blueprint-text/60 hover:text-blueprint-text transition-colors p-1 hover:bg-blueprint-component rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="blueprint-component rounded-xl p-4 border border-blueprint-accent/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blueprint-text mb-1">Experimental AI Blueprint Generation</h3>
                  <p className="text-sm text-blueprint-text/70">
                    Describe your WordPress site in plain English and let AI generate a complete blueprint for you.
                    Click the AI button in the header to get started!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-blueprint-text/50 text-center italic">
              This feature is experimental and may not always produce perfect results.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-3 blueprint-accent text-blueprint-paper rounded-xl font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
