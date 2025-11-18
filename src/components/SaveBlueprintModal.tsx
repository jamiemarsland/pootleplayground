import React, { useState, useRef } from 'react';
import { X, Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';
import { getUserId } from '../utils/userManager';
import { uploadScreenshot, validateImageFile } from '../utils/screenshotUpload';

interface SaveBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprintData: {
    blueprintTitle: string;
    landingPageType: 'wp-admin' | 'front-page';
    steps: any[];
  };
  onSuccess: () => void;
}

export function SaveBlueprintModal({ isOpen, onClose, blueprintData, onSuccess }: SaveBlueprintModalProps) {
  const [title, setTitle] = useState(blueprintData.blueprintTitle || '');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setShowConfirm(true);
      return;
    }

    handleSave();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setScreenshotFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview('');
    setScreenshotUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const userId = getUserId();
      let finalScreenshotUrl = screenshotUrl.trim() || null;

      if (screenshotFile) {
        setUploadingScreenshot(true);
        try {
          finalScreenshotUrl = await uploadScreenshot(screenshotFile);
        } catch (uploadError) {
          console.error('Screenshot upload error:', uploadError);
          setError('Failed to upload screenshot. Saving blueprint without image.');
          finalScreenshotUrl = null;
        } finally {
          setUploadingScreenshot(false);
        }
      }

      const { data: savedBlueprint, error: saveError } = await supabase
        .from('blueprints')
        .insert({
          title: title.trim(),
          description: description.trim(),
          screenshot_url: finalScreenshotUrl,
          blueprint_data: blueprintData,
          landing_page_type: blueprintData.landingPageType,
          step_count: blueprintData.steps.length,
          is_public: isPublic,
          user_id: userId,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error saving blueprint:', err);
      setError('Failed to save blueprint. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle(blueprintData.blueprintTitle || '');
    setDescription('');
    setScreenshotUrl('');
    setScreenshotFile(null);
    setScreenshotPreview('');
    setIsPublic(true);
    setError('');
    setShowConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="blueprint-component rounded-2xl border-2 border-blueprint-accent/30 max-w-lg w-full shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between p-6 border-b border-blueprint-grid/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 blueprint-accent rounded-xl flex items-center justify-center shadow-lg border border-blueprint-accent/50">
              <Save className="w-5 h-5 text-blueprint-paper" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blueprint-text">Save Blueprint</h2>
              <p className="text-sm text-blueprint-text/70">Save to your collection or share with the community</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg blueprint-button transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-blueprint-paper border border-blueprint-grid/50 rounded-lg focus:border-blueprint-accent focus:outline-none text-blueprint-text"
              placeholder="My Awesome Blueprint"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-blueprint-paper border border-blueprint-grid/50 rounded-lg focus:border-blueprint-accent focus:outline-none text-blueprint-text resize-none"
              placeholder="Describe what your blueprint does and what it includes..."
              rows={4}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Screenshot (optional)
            </label>

            {screenshotPreview || screenshotUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blueprint-grid/50 mb-3 group">
                <img
                  src={screenshotPreview || screenshotUrl}
                  alt="Screenshot preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveScreenshot}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={saving}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                disabled={saving}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-blueprint-grid/50 hover:border-blueprint-accent/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-blueprint-text/70 hover:text-blueprint-accent"
                disabled={saving}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload Screenshot</span>
              </button>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 border-t border-blueprint-grid/30"></div>
                <span className="text-xs text-blueprint-text/50">or</span>
                <div className="flex-1 border-t border-blueprint-grid/30"></div>
              </div>

              <input
                type="url"
                value={screenshotUrl}
                onChange={(e) => {
                  setScreenshotUrl(e.target.value);
                  if (e.target.value) {
                    setScreenshotFile(null);
                    setScreenshotPreview('');
                  }
                }}
                className="w-full px-4 py-2 bg-blueprint-paper border border-blueprint-grid/50 rounded-lg focus:border-blueprint-accent focus:outline-none text-blueprint-text text-sm"
                placeholder="Or paste image URL (Pexels, Unsplash, etc.)"
                disabled={saving || !!screenshotFile}
              />
            </div>

            <p className="text-xs text-blueprint-text/60 mt-2 flex items-start gap-1">
              <ImageIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Upload an image or paste a URL. Max 5MB. JPG, PNG, WebP, or GIF.</span>
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-blueprint-accent/5 rounded-lg border border-blueprint-accent/20">
            <div>
              <p className="font-medium text-blueprint-text text-sm">Share Publicly</p>
              <p className="text-xs text-blueprint-text/70">Make visible in the community gallery (otherwise only you can see it)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
                disabled={saving}
              />
              <div className="w-11 h-6 bg-blueprint-grid/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blueprint-accent"></div>
            </label>
          </div>

          <div className="flex items-center gap-2 text-sm text-blueprint-text/70 p-3 bg-blueprint-grid/10 rounded-lg">
            <Save className="w-4 h-4" />
            <span>{blueprintData.steps.length} steps • {blueprintData.landingPageType === 'wp-admin' ? 'WP Admin' : 'Front Page'} landing</span>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-6 border-t border-blueprint-grid/30">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 blueprint-button rounded-lg font-medium transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            disabled={saving || !title.trim()}
            className="flex-1 px-4 py-2 blueprint-accent rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadingScreenshot ? 'Uploading...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Blueprint</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Save Without Description?"
        message="A description helps others understand what your blueprint does. Are you sure you want to continue without one?"
        type="warning"
        confirmText="Save Anyway"
        cancelText="Go Back"
        onConfirm={() => {
          setShowConfirm(false);
          handleSave();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
