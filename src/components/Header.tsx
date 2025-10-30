import React, { useState } from 'react';
import { Play, FileText, Zap, Download, Upload, Grid3x3, Save, RotateCcw, Sparkles, Share2 } from 'lucide-react';
import { Blueprint } from '../types/blueprint';
import { ShareLinkModal } from './ShareLinkModal';
import { createShortLink } from '../utils/urlShortener';

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
  onOpenAiSidebar
}: HeaderProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; shortUrl: string; shortCode: string; isGenerating: boolean }>({ isOpen: false, shortUrl: '', shortCode: '', isGenerating: false });

  const unicodeSafeBase64Encode = (str: string): string => {
    // Convert string to UTF-8 bytes
    const utf8Bytes = new TextEncoder().encode(str);
    // Convert bytes to binary string
    const binaryString = Array.from(utf8Bytes)
      .map(byte => String.fromCharCode(byte))
      .join('');
    // Now safely use btoa
    return btoa(binaryString);
  };

  const createPlaygroundUrl = () => {
    try {
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
      
      const blueprintJson = JSON.stringify(playgroundBlueprint);
      console.log('Blueprint JSON:', blueprintJson);
      const encodedBlueprint = unicodeSafeBase64Encode(blueprintJson);
      console.log('Encoded blueprint length:', encodedBlueprint.length);
      
      return `https://playground.wordpress.net/#${encodedBlueprint}`;
    } catch (error) {
      console.error('Error creating playground URL:', error);
      alert('Error creating playground URL: ' + error.message);
      return 'https://playground.wordpress.net/';
    }
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    const url = createPlaygroundUrl();
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

  const handleShare = async () => {
    setShareModal({ isOpen: true, shortUrl: '', shortCode: '', isGenerating: true });

    try {
      const validSteps = blueprint.steps.filter(step => step.step);
      const playgroundBlueprint = {
        landingPage: blueprint.landingPage,
        preferredVersions: {
          php: "8.2",
          wp: "latest"
        },
        phpExtensionBundles: ["kitchen-sink"],
        steps: validSteps
      };

      const blueprintJson = JSON.stringify(playgroundBlueprint);
      const compressed = btoa(blueprintJson);
      const fullUrl = `https://playground.wordpress.net/#${compressed}`;

      const result = await createShortLink(fullUrl, undefined, { blueprintTitle: title, steps: validSteps });

      if (result.success && result.shortUrl && result.shortCode) {
        setShareModal({
          isOpen: true,
          shortUrl: result.shortUrl,
          shortCode: result.shortCode,
          isGenerating: false,
        });
      } else {
        setShareModal({ isOpen: false, shortUrl: '', shortCode: '', isGenerating: false });
        alert(result.error || 'Failed to create share link');
      }
    } catch (error) {
      console.error('Error sharing blueprint:', error);
      setShareModal({ isOpen: false, shortUrl: '', shortCode: '', isGenerating: false });
      alert('Failed to create share link');
    }
  };

  return (
    <header className="blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-10 h-10 blueprint-accent rounded-xl flex items-center justify-center shadow-lg border border-blueprint-accent/50">
                <Zap className="w-5 h-5 text-blueprint-paper" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-blueprint-text">Pootle Playground</h1>
                <p className="text-xs lg:text-sm text-blueprint-text/70">Blueprint Generator v1.5</p>
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
          
          <div className="flex items-center gap-3">
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
              onClick={handleShare}
              disabled={stepCount === 0}
              className="hidden lg:flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Share your blueprint"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAiSidebar}
              className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
              title="Generate blueprint with AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={onReset}
              disabled={stepCount === 0}
              className="lg:hidden flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500/10 hover:text-red-600"
              title="Reset blueprint"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onSaveBlueprint}
              disabled={stepCount === 0}
              className="lg:hidden flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save to Community"
            >
              <Save className="w-4 h-4" />
            </button>

            <button
              onClick={onShowGallery}
              className="lg:hidden flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm"
              title="Browse gallery"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>

            <button
              onClick={onImportBlueprint}
              className="lg:hidden flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm"
              title="Import blueprint"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onExportBlueprint}
              disabled={stepCount === 0}
              className="lg:hidden flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export blueprint"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              disabled={stepCount === 0}
              className="lg:hidden flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAiSidebar}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg transition-all text-sm"
              title="AI Generate"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={handleLaunch}
              disabled={stepCount === 0 || isLaunching}
              className="flex items-center gap-2 px-4 lg:px-6 py-2 blueprint-accent font-medium rounded-lg hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm lg:text-base"
            >
              {isLaunching ? (
                <>
                  <div className="w-4 h-4 border-2 border-blueprint-paper/30 border-t-blueprint-paper rounded-full animate-spin" />
                  <span>Launching...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Launch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ShareLinkModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, shortUrl: '', shortCode: '', isGenerating: false })}
        shortUrl={shareModal.shortUrl}
        shortCode={shareModal.shortCode}
        isGenerating={shareModal.isGenerating}
      />
    </header>
  );
}