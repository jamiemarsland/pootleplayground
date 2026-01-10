import React, { useState, useEffect, useRef } from 'react';
import { Play, FileText, Zap, Download, Upload, Grid3x3, Save, RotateCcw, Sparkles } from 'lucide-react';
import { Blueprint } from '../types/blueprint';
import { unicodeSafeBase64Encode, safeJsonStringify } from '../utils/blueprintGenerator';

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
  onToggleMobileSidebar?: () => void;
  showMobileSidebar?: boolean;
}

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
  onToggleMobileSidebar,
  showMobileSidebar
}: HeaderProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [showLaunchMenu, setShowLaunchMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLaunchMenu(false);
      }
    };

    if (showLaunchMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLaunchMenu]);

  const createPlaygroundUrl = (isStudio: boolean = false) => {
    try {
      console.log('Creating URL for:', isStudio ? 'WordPress Studio' : 'WordPress Playground');
      console.log('Original blueprint steps:', blueprint.steps);

      const validSteps = blueprint.steps.filter(step => {
        console.log('Validating step:', step);
        switch (step.step) {
          case 'installPlugin':
            const pluginValid = step.pluginData && (step.pluginData.url || step.pluginData.slug);
            console.log('Plugin step valid:', pluginValid, step);
            return pluginValid;
          case 'installTheme':
            const themeValid = step.themeData && (step.themeData.url || step.themeData.slug);
            console.log('Theme step valid:', themeValid, step);
            return themeValid;
          case 'wp-cli':
            const cliValid = step.command && step.command.trim();
            console.log('WP-CLI step valid:', cliValid, step);
            return cliValid;
          case 'addMedia':
            const mediaValid = step.command && step.command.includes('wp media import');
            console.log('Media step valid:', mediaValid, step);
            return mediaValid;
          case 'setSiteOptions':
            const optionsValid = step.options && Object.keys(step.options).length > 0;
            console.log('Site options step valid:', optionsValid, step);
            return optionsValid;
          case 'defineWpConfigConst':
            const constsValid = step.consts && Object.keys(step.consts).length > 0;
            console.log('WP Config step valid:', constsValid, step);
            return constsValid;
          case 'importWxr':
            const wxrValid = step.file && step.file.url;
            console.log('WXR step valid:', wxrValid, step);
            return wxrValid;
          case 'login':
            const loginValid = step.username;
            console.log('Login step valid:', loginValid, step);
            return loginValid;
          case 'addClientRole':
            const roleValid = step.name && step.capabilities && step.capabilities.length > 0;
            console.log('Client role step valid:', roleValid, step);
            return roleValid;
          default:
            console.log('Default step valid:', true, step);
            return true;
        }
      });

      console.log('Valid steps after filtering:', validSteps);

      const playgroundBlueprint = {
        landingPage: blueprint.landingPage,
        preferredVersions: {
          php: "8.2",
          wp: "latest"
        },
        phpExtensionBundles: ["kitchen-sink"],
        steps: validSteps
      };

      console.log('Final playground blueprint:', playgroundBlueprint);

      const blueprintJson = safeJsonStringify(playgroundBlueprint);
      console.log('Blueprint JSON length:', blueprintJson.length);

      // Verify JSON is valid before encoding
      try {
        JSON.parse(blueprintJson);
      } catch (e) {
        throw new Error('Invalid JSON generated: ' + e.message);
      }

      const encodedBlueprint = unicodeSafeBase64Encode(blueprintJson);
      console.log('Encoded blueprint length:', encodedBlueprint.length);

      const baseUrl = isStudio ? 'https://playground.wordpress.net/studio/' : 'https://playground.wordpress.net/';
      return `${baseUrl}#${encodedBlueprint}`;
    } catch (error) {
      console.error('Error creating playground URL:', error);
      alert('Error creating playground URL: ' + error.message);
      const baseUrl = isStudio ? 'https://playground.wordpress.net/studio/' : 'https://playground.wordpress.net/';
      return baseUrl;
    }
  };

  const handleLaunch = (isStudio: boolean = false) => {
    setIsLaunching(true);
    setShowLaunchMenu(false);
    const url = createPlaygroundUrl(isStudio);
    window.open(url, '_blank');
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

  return (
    <header className="blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg">
      <div className="px-3 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 blueprint-accent rounded-xl flex items-center justify-center shadow-lg border border-blueprint-accent/50 flex-shrink-0">
                <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-blueprint-paper" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm lg:text-xl font-bold text-blueprint-text truncate">Pootle Playground</h1>
                <p className="text-xs text-blueprint-text/70 hidden sm:block">Blueprint Generator v1.6</p>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-4 ml-8">
              <div className="flex items-center gap-2 px-3 py-1 blueprint-component rounded-full border">
                <FileText className="w-4 h-4 text-blueprint-accent" />
                <span className="text-sm font-medium text-blueprint-accent">{stepCount} steps</span>
              </div>
              <div className="text-sm text-blueprint-text/70">
                Building: <span className="font-medium text-blueprint-text">{title}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Desktop Buttons */}
            <button
              onClick={onReset}
              disabled={stepCount === 0}
              className="hidden lg:flex items-center gap-2 px-3 lg:px-4 py-2 blueprint-button rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500/10 hover:text-red-600"
              title="Reset blueprint (clear all steps)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="font-medium hidden xl:inline">Reset</span>
            </button>

            <button
              onClick={onSaveBlueprint}
              disabled={stepCount === 0}
              className="hidden lg:flex items-center gap-2 px-3 lg:px-4 py-2 blueprint-button rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save to Community Gallery"
            >
              <Save className="w-4 h-4" />
              <span className="font-medium hidden xl:inline">Save</span>
            </button>

            <button
              onClick={onShowGallery}
              className="hidden lg:flex items-center gap-2 px-3 lg:px-4 py-2 blueprint-button rounded-lg transition-colors text-sm"
              title="Browse blueprint gallery"
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="font-medium hidden xl:inline">Gallery</span>
            </button>

            <button
              onClick={onImportBlueprint}
              className="hidden lg:flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm"
              title="Import WordPress Playground blueprint"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onExportBlueprint}
              className="hidden lg:flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm"
              title="Export as WordPress Playground blueprint"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAiSidebar}
              className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
              title="Generate blueprint with AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Mobile Buttons - Only essential ones */}
            <button
              onClick={onShowGallery}
              className="lg:hidden flex items-center gap-2 px-2 py-2 blueprint-button rounded-lg transition-colors text-sm"
              title="Gallery"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => handleLaunch(false)}
                disabled={stepCount === 0 || isLaunching}
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 blueprint-accent font-medium rounded-lg hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm"
              >
                {isLaunching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blueprint-paper/30 border-t-blueprint-paper rounded-full animate-spin" />
                    <span className="hidden sm:inline">Launching...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Launch</span>
                  </>
                )}
              </button>

              {!isLaunching && stepCount > 0 && (
                <button
                  onClick={() => setShowLaunchMenu(!showLaunchMenu)}
                  disabled={stepCount === 0}
                  className="absolute -bottom-8 left-0 right-0 text-xs text-blueprint-accent hover:underline disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Launch in Studio
                </button>
              )}

              {showLaunchMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-blueprint-accent/30 rounded-lg shadow-lg overflow-hidden z-50 min-w-[200px]">
                  <button
                    onClick={() => handleLaunch(false)}
                    className="w-full text-left px-4 py-3 hover:bg-blueprint-accent/10 transition-colors border-b border-blueprint-accent/10"
                  >
                    <div className="font-medium text-sm">WordPress Playground</div>
                    <div className="text-xs text-blueprint-text/60 mt-0.5">Standard environment</div>
                  </button>
                  <button
                    onClick={() => handleLaunch(true)}
                    className="w-full text-left px-4 py-3 hover:bg-blueprint-accent/10 transition-colors"
                  >
                    <div className="font-medium text-sm">WordPress Studio</div>
                    <div className="text-xs text-blueprint-text/60 mt-0.5">Enhanced features</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}