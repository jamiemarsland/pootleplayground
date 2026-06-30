import React, { useState } from 'react';
import { Play, FileText, Zap, Download, Upload, Grid3x3, Save, RotateCcw, Sparkles, Share2, Link2, Loader2, Moon, Sun } from 'lucide-react';
import { Blueprint } from '../types/blueprint';

interface HeaderProps {
  blueprint: Blueprint;
  title: string;
  stepCount: number;
  onExportBlueprint: () => void;
  onImportBlueprint: () => void;
  onShowGallery: () => void;
  onSaveBlueprint: () => void;
  onReset: () => void;
  onOpenAiSidebar: () => void;
  onShowAiGenerator?: () => void;
  onSharePlayground?: () => void;
  onShowSharedPlaygrounds?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const WP_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

export function Header({
  blueprint,
  title,
  stepCount,
  onExportBlueprint,
  onImportBlueprint,
  onShowGallery,
  onSaveBlueprint,
  onReset,
  onOpenAiSidebar,
  onShowAiGenerator,
  onSharePlayground,
  onShowSharedPlaygrounds,
  isDark,
  onToggleTheme,
}: HeaderProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  const unicodeSafeBase64Encode = (str: string): string => {
    const utf8Bytes = new TextEncoder().encode(str);
    const binaryString = Array.from(utf8Bytes).map(byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  };

  const createPlaygroundUrl = () => {
    try {
      const validSteps = blueprint.steps.filter(step => {
        switch (step.step) {
          case 'installPlugin':
            return step.pluginData && (step.pluginData.url || step.pluginData.slug);
          case 'installTheme':
            return step.themeData && (step.themeData.url || step.themeData.slug);
          case 'wp-cli':
            return step.command && step.command.trim();
          case 'addMedia':
            return step.command && step.command.includes('wp media import');
          case 'setSiteOptions':
            return step.options && Object.keys(step.options).length > 0;
          case 'defineWpConfigConst':
            return step.consts && Object.keys(step.consts).length > 0;
          case 'importWxr':
            return step.file && step.file.url;
          case 'login':
            return step.username;
          case 'addClientRole':
            return step.name && step.capabilities && step.capabilities.length > 0;
          default:
            return true;
        }
      });

      const playgroundBlueprint = {
        landingPage: blueprint.landingPage,
        preferredVersions: blueprint.preferredVersions,
        phpExtensionBundles: ['kitchen-sink'],
        steps: validSteps,
      };

      return `https://playground.wordpress.net/#${unicodeSafeBase64Encode(JSON.stringify(playgroundBlueprint))}`;
    } catch (error) {
      console.error('Error creating playground URL:', error);
      alert('Error creating playground URL: ' + (error as Error).message);
      return 'https://playground.wordpress.net/';
    }
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    window.open(createPlaygroundUrl(), '_blank');
    setTimeout(() => setIsLaunching(false), 2000);
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(blueprint, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const iconBtn = (active = true): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, border: 'none', background: 'transparent',
    borderRadius: 2, cursor: active ? 'pointer' : 'not-allowed',
    color: active ? 'var(--text-secondary)' : 'var(--text-muted)',
    transition: 'background 0.12s', flexShrink: 0, padding: 0,
  });

  const divider = (
    <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
  );

  return (
    <header style={{
      background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50, fontFamily: WP_FONT,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 56, gap: 8,
      }}>

        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Pootle Playground
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.2 }}>
              Blueprint Generator v1.6
            </div>
          </div>

        </div>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {divider}

          <button onClick={onReset} disabled={stepCount === 0} title="Reset blueprint" style={iconBtn(stepCount > 0)}
            onMouseOver={e => { if (stepCount > 0) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            <RotateCcw style={{ width: 15, height: 15 }} />
          </button>

          <button onClick={onShowGallery} title="Browse gallery" style={iconBtn()}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            <Grid3x3 style={{ width: 15, height: 15 }} />
          </button>

          <button onClick={onImportBlueprint} title="Import blueprint JSON" style={iconBtn()}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            <Download style={{ width: 15, height: 15 }} />
          </button>

          <button onClick={handleDownload} disabled={stepCount === 0} title="Export blueprint JSON" style={iconBtn(stepCount > 0)}
            onMouseOver={e => { if (stepCount > 0) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            <Upload style={{ width: 15, height: 15 }} />
          </button>

          <button
            onClick={onShowAiGenerator || onOpenAiSidebar} title="Generate with AI"
            style={{ ...iconBtn(), color: 'var(--accent)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-bg)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            <Sparkles style={{ width: 15, height: 15 }} />
          </button>

          {onShowSharedPlaygrounds && (
            <button onClick={onShowSharedPlaygrounds} title="My shared links" style={iconBtn()}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
              <Link2 style={{ width: 15, height: 15 }} />
            </button>
          )}

          {onSharePlayground && (
            <button onClick={onSharePlayground} title="Share this Playground" style={iconBtn()}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
              <Share2 style={{ width: 15, height: 15 }} />
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={iconBtn()}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            {isDark
              ? <Sun style={{ width: 15, height: 15 }} />
              : <Moon style={{ width: 15, height: 15 }} />}
          </button>

          {divider}

          {/* Save draft */}
          <button
            onClick={onSaveBlueprint} disabled={stepCount === 0}
            style={{
              padding: '6px 14px', fontSize: 13, fontWeight: 500,
              background: 'var(--bg-surface)',
              color: stepCount === 0 ? 'var(--text-muted)' : 'var(--accent)',
              border: `1px solid ${stepCount === 0 ? 'var(--border)' : 'var(--accent)'}`,
              borderRadius: 999, cursor: stepCount === 0 ? 'not-allowed' : 'pointer',
              fontFamily: WP_FONT, display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.12s', whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseOver={e => { if (stepCount > 0) e.currentTarget.style.background = 'var(--accent-bg)'; }}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--bg-surface)')}>
            <Save style={{ width: 12, height: 12 }} />
            Save
          </button>

          {/* Launch */}
          <button
            onClick={handleLaunch} disabled={isLaunching}
            style={{
              padding: '6px 16px', fontSize: 13, fontWeight: 500,
              background: isLaunching ? 'var(--text-muted)' : 'var(--accent)',
              color: '#fff', border: '1px solid transparent',
              borderRadius: 999,
              cursor: isLaunching ? 'not-allowed' : 'pointer',
              fontFamily: WP_FONT, display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 0.12s', whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseOver={e => { if (!isLaunching) e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseOut={e => { if (!isLaunching) e.currentTarget.style.background = 'var(--accent)'; }}>
            {isLaunching
              ? <><Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> Launching…</>
              : <><Play style={{ width: 13, height: 13 }} /> Launch</>}
          </button>
        </div>
      </div>
    </header>
  );
}
