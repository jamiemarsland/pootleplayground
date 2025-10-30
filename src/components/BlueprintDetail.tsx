import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Rocket, User, Calendar, ThumbsUp, FileText } from 'lucide-react';
import { fetchBlueprintById } from '../utils/blueprintSharing';
import { BlueprintRecord } from '../lib/supabase';
import { generateBlueprint } from '../utils/blueprintGenerator';
import { AlertModal } from './AlertModal';

export function BlueprintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<BlueprintRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info' | 'success';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    if (id) {
      loadBlueprint(id);
    }
  }, [id]);

  const loadBlueprint = async (blueprintId: string) => {
    try {
      setLoading(true);
      const data = await fetchBlueprintById(blueprintId);
      setBlueprint(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blueprint');
      console.error('Error loading blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadIntoBuilder = () => {
    if (!blueprint) return;
    localStorage.setItem('loadBlueprint', JSON.stringify(blueprint.blueprint_data));
    navigate('/');
  };

  const handleLaunchInPlayground = () => {
    if (!blueprint) return;

    const nativeBlueprint = generateBlueprint(
      blueprint.blueprint_data.steps,
      blueprint.blueprint_data.blueprintTitle,
      blueprint.blueprint_data.landingPageType as 'wp-admin' | 'front-page',
      blueprint.blueprint_data.customLandingUrl
    );

    const blueprintJson = JSON.stringify(nativeBlueprint);
    const compressed = btoa(blueprintJson);
    const playgroundUrl = `https://playground.wordpress.net/#${compressed}`;

    window.open(playgroundUrl, '_blank');
  };

  const handleBackToGallery = () => {
    navigate('/gallery');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blueprint-paper blueprint-grid flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blueprint-accent/30 border-t-blueprint-accent rounded-full animate-spin mb-4"></div>
          <p className="text-blueprint-text/70">Loading blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen bg-blueprint-paper blueprint-grid flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 text-blueprint-accent/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blueprint-text mb-2">Blueprint Not Found</h2>
          <p className="text-blueprint-text/70 mb-6">
            {error || 'The blueprint you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={handleBackToGallery}
            className="blueprint-button px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid">
      <div className="blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToGallery}
              className="flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="blueprint-component border rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blueprint-text mb-2">
              {blueprint.title}
            </h1>
            <p className="text-blueprint-text/70 text-lg">
              {blueprint.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-blueprint-grid/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 blueprint-accent rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blueprint-paper" />
              </div>
              <div>
                <p className="text-sm text-blueprint-text/60">Steps</p>
                <p className="font-semibold text-blueprint-text">{blueprint.step_count}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 blueprint-accent rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-blueprint-paper" />
              </div>
              <div>
                <p className="text-sm text-blueprint-text/60">Votes</p>
                <p className="font-semibold text-blueprint-text">{blueprint.votes}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 blueprint-accent rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blueprint-paper" />
              </div>
              <div>
                <p className="text-sm text-blueprint-text/60">Created</p>
                <p className="font-semibold text-blueprint-text text-sm">
                  {formatDate(blueprint.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-blueprint-grid/30 pt-6">
            <h2 className="text-xl font-semibold text-blueprint-text mb-4">
              What would you like to do?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleLoadIntoBuilder}
                className="flex items-center justify-center gap-3 p-4 blueprint-button rounded-lg transition-all hover:scale-105 hover:shadow-lg"
              >
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Load into Builder</p>
                  <p className="text-sm text-blueprint-text/60">Edit and customize</p>
                </div>
              </button>

              <button
                onClick={handleLaunchInPlayground}
                className="flex items-center justify-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg transition-all hover:scale-105 hover:shadow-lg border border-green-500/30"
              >
                <Rocket className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Launch in Playground</p>
                  <p className="text-sm opacity-70">Try it now</p>
                </div>
              </button>
            </div>
          </div>

          {blueprint.blueprint_data.steps && blueprint.blueprint_data.steps.length > 0 && (
            <div className="border-t border-blueprint-grid/30 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-blueprint-text mb-4">
                Blueprint Steps ({blueprint.step_count})
              </h2>
              <div className="space-y-2">
                {blueprint.blueprint_data.steps.slice(0, 5).map((step: any, index: number) => (
                  <div
                    key={step.id || index}
                    className="flex items-center gap-3 p-3 bg-blueprint-grid/5 rounded-lg"
                  >
                    <div className="w-6 h-6 blueprint-accent rounded-full flex items-center justify-center text-xs font-bold text-blueprint-paper">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blueprint-text capitalize">
                        {step.type.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                  </div>
                ))}
                {blueprint.step_count > 5 && (
                  <p className="text-sm text-blueprint-text/60 text-center py-2">
                    + {blueprint.step_count - 5} more steps
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />
    </div>
  );
}
