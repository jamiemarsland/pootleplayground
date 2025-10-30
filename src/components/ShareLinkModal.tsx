import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, Loader2, ExternalLink } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  shortCode: string;
  isGenerating?: boolean;
}

export function ShareLinkModal({ isOpen, onClose, shortUrl, shortCode, isGenerating = false }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const displayUrl = `pootleplayground/${shortCode}`;

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleOpenLink = () => {
    window.open(shortUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="blueprint-component rounded-2xl border-2 border-blueprint-accent/30 max-w-lg w-full shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between p-6 border-b border-blueprint-grid/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 blueprint-accent rounded-xl flex items-center justify-center shadow-lg border border-blueprint-accent/50">
              <Share2 className="w-5 h-5 text-blueprint-paper" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blueprint-text">Share Your Blueprint</h2>
              <p className="text-sm text-blueprint-text/70">Share this link with anyone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg blueprint-button transition-colors"
            disabled={isGenerating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blueprint-accent animate-spin mb-4" />
              <p className="text-blueprint-text/70">Generating your share link...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-blueprint-text mb-2">
                  Your Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-blueprint-paper border border-blueprint-grid/50 rounded-lg text-blueprint-text font-mono text-sm overflow-x-auto whitespace-nowrap">
                    {displayUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'blueprint-accent hover:brightness-110'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-blueprint-text/60 p-3 bg-blueprint-grid/10 rounded-lg">
                <Share2 className="w-4 h-4" />
                <span>Anyone with this link can launch your blueprint in WordPress Playground</span>
              </div>

              <div className="pt-4 border-t border-blueprint-grid/30">
                <button
                  onClick={handleOpenLink}
                  className="w-full px-4 py-3 blueprint-button rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Test Link</span>
                </button>
              </div>
            </>
          )}
        </div>

        {!isGenerating && (
          <div className="flex items-center gap-3 p-6 border-t border-blueprint-grid/30">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 blueprint-accent rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
