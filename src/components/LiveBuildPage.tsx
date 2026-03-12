import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Zap, Play, Camera, Loader2, CheckCircle2,
  RotateCcw, Send, Download, Save, ChevronDown, AlertCircle,
  Layers, FileText, Puzzle, Palette
} from 'lucide-react';
import { supabase, BlueprintRecord } from '../lib/supabase';
import { SaveBlueprintModal } from './SaveBlueprintModal';
import { generateBlueprint } from '../utils/blueprintGenerator';
import { getUserId } from '../utils/userManager';
import {
  EXTRACTION_PHP_SCRIPT,
  PlaygroundState,
  convertPlaygroundStateToSteps,
  getSiteTitleFromState
} from '../utils/playgroundStateExtractor';
import { Step } from '../types/blueprint';

type PlaygroundStatus = 'idle' | 'loading' | 'ready' | 'capturing' | 'captured' | 'error';

interface CapturedData {
  steps: Step[];
  siteName: string;
  state: PlaygroundState;
}

export function LiveBuildPage() {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientRef = useRef<any>(null);

  const [status, setStatus] = useState<PlaygroundStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [startOption, setStartOption] = useState<'blank' | 'gallery'>('blank');
  const [myBlueprints, setMyBlueprints] = useState<BlueprintRecord[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [loadingBlueprints, setLoadingBlueprints] = useState(false);
  const [captured, setCaptured] = useState<CapturedData | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchMyBlueprints();
  }, []);

  const fetchMyBlueprints = async () => {
    setLoadingBlueprints(true);
    try {
      const userId = getUserId();
      const { data } = await supabase
        .from('blueprints')
        .select('id, title, step_count, landing_page_type, blueprint_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setMyBlueprints(data as BlueprintRecord[]);
    } catch {
    } finally {
      setLoadingBlueprints(false);
    }
  };

  const getInitialBlueprint = () => {
    if (startOption === 'blank') {
      return {
        landingPage: '/wp-admin/',
        preferredVersions: { php: '8.2', wp: 'latest' },
        phpExtensionBundles: ['kitchen-sink'],
        steps: [{ step: 'login', username: 'admin', password: 'password' }]
      };
    }

    if (startOption === 'gallery' && selectedBlueprintId) {
      const bp = myBlueprints.find(b => b.id === selectedBlueprintId);
      if (bp?.blueprint_data) {
        const native = generateBlueprint(
          bp.blueprint_data.steps || [],
          bp.blueprint_data.blueprintTitle || 'My Site',
          (bp.blueprint_data.landingPageType as 'wp-admin' | 'front-page' | 'custom') || 'wp-admin',
          ''
        );
        return {
          ...native,
          landingPage: '/wp-admin/'
        };
      }
    }

    return {
      landingPage: '/wp-admin/',
      preferredVersions: { php: '8.2', wp: 'latest' },
      phpExtensionBundles: ['kitchen-sink'],
      steps: [{ step: 'login', username: 'admin', password: 'password' }]
    };
  };

  const handleStart = async () => {
    if (!iframeRef.current) return;
    setStatus('loading');
    setError(null);
    setCaptured(null);

    try {
      const { startPlaygroundWeb } = await import(
        /* @vite-ignore */ 'https://playground.wordpress.net/client/index.js'
      ) as any;

      const blueprint = getInitialBlueprint();

      const client = await startPlaygroundWeb({
        iframe: iframeRef.current,
        remoteUrl: 'https://playground.wordpress.net/remote.html',
        blueprint
      });

      await client.isReady();
      clientRef.current = client;
      setStatus('ready');
    } catch (err: any) {
      console.error('Playground start error:', err);
      setError('Failed to start WordPress Playground. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const handleCapture = async () => {
    if (!clientRef.current) return;
    setStatus('capturing');
    setError(null);

    try {
      const result = await clientRef.current.run({ code: EXTRACTION_PHP_SCRIPT });
      const raw = result.text?.trim() || '';

      const jsonStart = raw.indexOf('{');
      const jsonStr = jsonStart >= 0 ? raw.slice(jsonStart) : raw;

      const state: PlaygroundState = JSON.parse(jsonStr);
      const steps = convertPlaygroundStateToSteps(state);
      const siteName = getSiteTitleFromState(state);

      setCaptured({ steps, siteName, state });
      setStatus('captured');
    } catch (err: any) {
      console.error('Capture error:', err);
      setError('Failed to read the Playground state. Please try again.');
      setStatus('ready');
    }
  };

  const handleSendToBuilder = () => {
    if (!captured) return;
    localStorage.setItem('loadBlueprint', JSON.stringify({
      blueprintTitle: captured.siteName,
      landingPageType: 'wp-admin',
      customLandingUrl: '',
      steps: captured.steps
    }));
    navigate('/');
  };

  const handleDownloadBlueprint = () => {
    if (!captured) return;
    const native = generateBlueprint(captured.steps, captured.siteName, 'wp-admin', '');
    const json = JSON.stringify(native, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${captured.siteName.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    clientRef.current = null;
    setCaptured(null);
    setStatus('idle');
    setError(null);
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  };

  const stepTypeCounts = captured ? {
    plugins: captured.steps.filter(s => s.type === 'installPlugin').length,
    themes: captured.steps.filter(s => s.type === 'installTheme').length,
    pages: captured.steps.filter(s => s.type === 'addPage').length,
    posts: captured.steps.filter(s => s.type === 'addPost').length,
  } : null;

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid flex flex-col">
      <header className="blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg">
        <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Builder</span>
            </button>
            <div className="w-px h-6 bg-blueprint-grid/50" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 blueprint-accent rounded-lg flex items-center justify-center shadow border border-blueprint-accent/50">
                <Zap className="w-4 h-4 text-blueprint-paper" />
              </div>
              <div>
                <h1 className="text-base font-bold text-blueprint-text">Live Build</h1>
                <p className="text-xs text-blueprint-text/60">Build in WordPress, save as a blueprint</p>
              </div>
            </div>
          </div>

          {status === 'ready' || status === 'capturing' || status === 'captured' ? (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                status === 'ready' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                status === 'capturing' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                'bg-blue-500/10 text-blue-600 border border-blue-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status === 'ready' ? 'bg-green-500 animate-pulse' :
                  status === 'capturing' ? 'bg-amber-500 animate-pulse' :
                  'bg-blue-500'
                }`} />
                {status === 'ready' ? 'Playground running' : status === 'capturing' ? 'Capturing...' : 'Blueprint captured'}
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 blueprint-button rounded-lg transition-colors text-xs"
                title="Reset Playground"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
        <div className="flex-1 relative bg-gray-900 overflow-hidden">
          {status === 'idle' || status === 'error' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md px-6">
                <div className="w-16 h-16 blueprint-accent rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-blueprint-accent/50">
                  <Play className="w-8 h-8 text-blueprint-paper" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blueprint-text mb-2">WordPress Playground</h2>
                  <p className="text-blueprint-text/60 text-sm leading-relaxed">
                    Configure your starting point on the right, then click Start to boot a live WordPress site.
                    Build freely — when you're done, capture it as a blueprint.
                  </p>
                </div>
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm text-left">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          ) : status === 'loading' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95">
              <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
                <div>
                  <p className="text-white font-medium">Booting WordPress...</p>
                  <p className="text-white/50 text-sm mt-1">This takes 10–20 seconds</p>
                </div>
              </div>
            </div>
          ) : null}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            style={{ display: status === 'idle' || status === 'error' ? 'none' : 'block' }}
            title="WordPress Playground"
            allow="cross-origin-isolated"
          />
        </div>

        <div className="w-80 xl:w-96 border-l border-blueprint-grid/30 blueprint-paper flex flex-col overflow-y-auto">
          {status === 'idle' || status === 'error' ? (
            <div className="p-5 space-y-5 flex-1">
              <div>
                <h3 className="text-sm font-semibold text-blueprint-text mb-1">Starting point</h3>
                <p className="text-xs text-blueprint-text/60 mb-3">Choose what WordPress boots with</p>

                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    startOption === 'blank'
                      ? 'border-blueprint-accent/60 bg-blueprint-accent/5'
                      : 'border-blueprint-grid/40 hover:border-blueprint-accent/30'
                  }`}>
                    <input
                      type="radio"
                      name="startOption"
                      value="blank"
                      checked={startOption === 'blank'}
                      onChange={() => setStartOption('blank')}
                      className="accent-current text-blueprint-accent"
                    />
                    <div>
                      <p className="text-sm font-medium text-blueprint-text">Blank WordPress</p>
                      <p className="text-xs text-blueprint-text/50">Fresh install, logged in as admin</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    startOption === 'gallery'
                      ? 'border-blueprint-accent/60 bg-blueprint-accent/5'
                      : 'border-blueprint-grid/40 hover:border-blueprint-accent/30'
                  }`}>
                    <input
                      type="radio"
                      name="startOption"
                      value="gallery"
                      checked={startOption === 'gallery'}
                      onChange={() => setStartOption('gallery')}
                      className="accent-current text-blueprint-accent"
                    />
                    <div>
                      <p className="text-sm font-medium text-blueprint-text">From saved blueprint</p>
                      <p className="text-xs text-blueprint-text/50">Refine one of your blueprints</p>
                    </div>
                  </label>
                </div>

                {startOption === 'gallery' && (
                  <div className="mt-3">
                    {loadingBlueprints ? (
                      <div className="flex items-center gap-2 text-xs text-blueprint-text/50 py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading your blueprints...
                      </div>
                    ) : myBlueprints.length === 0 ? (
                      <p className="text-xs text-blueprint-text/50 py-2">
                        No saved blueprints found. Save a blueprint in the Builder first.
                      </p>
                    ) : (
                      <div className="relative">
                        <select
                          value={selectedBlueprintId}
                          onChange={e => setSelectedBlueprintId(e.target.value)}
                          className="w-full px-3 py-2 bg-blueprint-paper border border-blueprint-grid/50 rounded-lg text-sm text-blueprint-text focus:border-blueprint-accent focus:outline-none appearance-none pr-8"
                        >
                          <option value="">Select a blueprint...</option>
                          {myBlueprints.map(bp => (
                            <option key={bp.id} value={bp.id}>
                              {bp.title} ({bp.step_count} steps)
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-blueprint-text/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 bg-blueprint-accent/5 border border-blueprint-accent/20 rounded-xl space-y-2">
                <p className="text-xs font-medium text-blueprint-accent">How it works</p>
                <ol className="space-y-1.5">
                  {['Start WordPress in the left panel', 'Build your site in the WP admin', 'Click Capture to snapshot your site', 'Save or send to the blueprint builder'].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-blueprint-text/70">
                      <span className="w-4 h-4 rounded-full bg-blueprint-accent/20 text-blueprint-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <button
                onClick={handleStart}
                disabled={startOption === 'gallery' && !selectedBlueprintId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 blueprint-accent font-medium rounded-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
              >
                <Play className="w-4 h-4" />
                Start WordPress
              </button>
            </div>
          ) : status === 'loading' ? (
            <div className="p-5 flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-blueprint-accent animate-spin mx-auto" />
                <p className="text-sm text-blueprint-text/60">Starting up...</p>
              </div>
            </div>
          ) : status === 'ready' || status === 'capturing' ? (
            <div className="p-5 space-y-5 flex-1">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-green-700">Playground is running</p>
                </div>
                <p className="text-xs text-green-700/70">
                  Build your site in the WordPress admin on the left. When you're ready, capture the blueprint below.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-blueprint-text mb-2">Capture your site</h3>
                <p className="text-xs text-blueprint-text/60 mb-3">
                  Reads your active theme, plugins, pages, posts, menus and site settings — then converts them into a reusable blueprint.
                </p>
                <button
                  onClick={handleCapture}
                  disabled={status === 'capturing'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 blueprint-accent font-medium rounded-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50 shadow-md text-sm"
                >
                  {status === 'capturing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Capture Blueprint
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          ) : status === 'captured' && captured ? (
            <div className="p-5 space-y-4 flex-1">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">Blueprint captured!</p>
                </div>
                <p className="text-xs text-blue-700/70">
                  Found {captured.steps.length} steps from <strong>{captured.siteName}</strong>
                </p>
              </div>

              {stepTypeCounts && (
                <div>
                  <h3 className="text-xs font-semibold text-blueprint-text/70 uppercase tracking-wider mb-2">What was captured</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Palette, label: 'Theme', count: stepTypeCounts.themes, color: 'text-emerald-600' },
                      { icon: Puzzle, label: 'Plugins', count: stepTypeCounts.plugins, color: 'text-blue-600' },
                      { icon: FileText, label: 'Pages', count: stepTypeCounts.pages, color: 'text-amber-600' },
                      { icon: Layers, label: 'Posts', count: stepTypeCounts.posts, color: 'text-rose-600' },
                    ].map(({ icon: Icon, label, count, color }) => (
                      <div key={label} className="flex items-center gap-2 p-2.5 blueprint-component rounded-lg border border-blueprint-grid/30">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <div>
                          <p className="text-xs font-semibold text-blueprint-text">{count}</p>
                          <p className="text-[10px] text-blueprint-text/50">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-blueprint-text/70 uppercase tracking-wider mb-2">What's next</h3>

                <button
                  onClick={handleSendToBuilder}
                  className="w-full flex items-center gap-3 px-4 py-3 blueprint-accent font-medium rounded-xl hover:brightness-110 transition-all text-sm shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-medium">Send to Builder</p>
                    <p className="text-xs opacity-70">Edit steps in the blueprint builder</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 blueprint-button rounded-xl transition-all text-sm border border-blueprint-grid/30 hover:border-blueprint-accent/40"
                >
                  <Save className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-medium text-blueprint-text">Save to Gallery</p>
                    <p className="text-xs text-blueprint-text/50">Save and optionally share publicly</p>
                  </div>
                </button>

                <button
                  onClick={handleDownloadBlueprint}
                  className="w-full flex items-center gap-3 px-4 py-3 blueprint-button rounded-xl transition-all text-sm border border-blueprint-grid/30 hover:border-blueprint-accent/40"
                >
                  <Download className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-medium text-blueprint-text">Download JSON</p>
                    <p className="text-xs text-blueprint-text/50">Get the raw blueprint file</p>
                  </div>
                </button>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Blueprint saved to your gallery!
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-blueprint-text/50 hover:text-blueprint-text transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Start over
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {captured && showSaveModal && (
        <SaveBlueprintModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          blueprintData={{
            blueprintTitle: captured.siteName,
            landingPageType: 'wp-admin',
            steps: captured.steps
          }}
          onSuccess={() => {
            setShowSaveModal(false);
            setSaveSuccess(true);
          }}
        />
      )}
    </div>
  );
}
