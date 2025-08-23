import React, { useState } from 'react';
import { Download, ExternalLink, Play, FileText, Zap } from 'lucide-react';
import { Blueprint } from '../types/blueprint';

interface HeaderProps {
  blueprint: Blueprint;
  title: string;
  stepCount: number;
}

export function Header({ blueprint, title, stepCount }: HeaderProps) {
  const [isLaunching, setIsLaunching] = useState(false);

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

  return (
    <header className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pootle-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Pootle Playground</h1>
                <p className="text-sm text-gray-400">Blueprint Generator</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 ml-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 rounded-full">
                <FileText className="w-4 h-4 text-pootle-blue-500" />
                <span className="text-sm font-medium text-pootle-blue-400">{stepCount} steps</span>
              </div>
              <div className="text-sm text-gray-400">
                Building: <span className="font-medium text-gray-200">{title}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={stepCount === 0}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">Download</span>
            </button>
            
            <button
              onClick={handleLaunch}
              disabled={stepCount === 0 || isLaunching}
              className="flex items-center gap-2 px-6 py-2 bg-pootle-blue-500 text-white font-medium rounded-lg hover:bg-pootle-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              {isLaunching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Launching...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Launch Playground</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}