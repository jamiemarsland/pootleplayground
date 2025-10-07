import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';
import { getUserId } from '../utils/userManager';

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
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleSave = async () => {

    setSaving(true);
    setError('');

    try {
      const userId = getUserId();

      const { data: savedBlueprint, error: saveError } = await supabase
        .from('blueprints')
        .insert({
          title: title.trim(),
          description: description.trim(),
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
    setIsPublic(true);
    setError('');
    setShowConfirm(false);
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
                <span>Saving...</span>
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
