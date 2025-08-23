import React from 'react';
import { Plus, FileText, Image, Puzzle, Settings, Menu } from 'lucide-react';
import { StepType, StepCategory } from '../types/blueprint';

interface SidebarProps {
  onAddStep: (type: StepType) => void;
  blueprintTitle: string;
  onTitleChange: (title: string) => void;
  landingPageType: 'wp-admin' | 'front-page';
  onLandingPageTypeChange: (landingPageType: 'wp-admin' | 'front-page') => void;
}

const STEP_CATEGORIES: StepCategory[] = [
  {
    name: 'Content',
    steps: ['addPage', 'addPost', 'addMedia'],
    color: 'blue'
  },
  {
    name: 'Structure',
    steps: ['setHomepage', 'setPostsPage', 'createNavigationMenu'],
    color: 'indigo'
  },
  {
    name: 'Extensions',
    steps: ['installPlugin', 'installTheme'],
    color: 'green'
  },
  {
    name: 'Configuration',
    steps: ['setSiteOption', 'defineWpConfigConst', 'login'],
    color: 'purple'
  },
  {
    name: 'Import/Export',
    steps: ['importWxr', 'addClientRole'],
    color: 'orange'
  }
];

const STEP_ICONS = {
  addPost: FileText,
  addPage: FileText,
  addMedia: Image,
  setHomepage: FileText,
  setPostsPage: FileText,
  installPlugin: Puzzle,
  installTheme: Puzzle,
  setSiteOption: Settings,
  defineWpConfigConst: Settings,
  login: Settings,
  importWxr: Settings,
  addClientRole: Settings,
  createNavigationMenu: Menu
};

const STEP_LABELS = {
  addPost: 'Add Post',
  addPage: 'Add Page',
  addMedia: 'Add Media',
  setHomepage: 'Set Home Page',
  setPostsPage: 'Set Posts Page',
  installPlugin: 'Install Plugin',
  installTheme: 'Install Theme',
  setSiteOption: 'Site Option',
  defineWpConfigConst: 'WP Config',
  login: 'Login',
  importWxr: 'Import WXR',
  addClientRole: 'Client Role',
  createNavigationMenu: 'Set Navigation Menu'
};

export function Sidebar({ 
  onAddStep, 
  blueprintTitle,
  onTitleChange,
  landingPageType,
  onLandingPageTypeChange
}: SidebarProps) {

  return (
    <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col min-h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Site Title
          </label>
          <input
            type="text"
            value={blueprintTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-900/70 text-white placeholder-gray-400"
            placeholder="My WordPress Site"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Landing Page
          </label>
          <select
            value={landingPageType}
            onChange={(e) => onLandingPageTypeChange(e.target.value as 'wp-admin' | 'front-page')}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-900/70 text-white"
          >
            <option value="wp-admin">WordPress Admin</option>
            <option value="front-page">Front Page</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Choose where visitors land when the playground loads
          </p>
        </div>
      </div>

      {/* Add Steps */}
      <div className="flex-1 bg-gray-900/50">
        <div className="p-4">
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {STEP_CATEGORIES.map(category => (
              <div key={category.name}>
                <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  {category.name}
                </h3>
                <div className="grid gap-2">
                  {category.steps.map(stepType => {
                    const Icon = STEP_ICONS[stepType];
                    return (
                      <button
                        key={stepType}
                        onClick={() => onAddStep(stepType)}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all duration-200 text-gray-300 border border-gray-600/50 
                        hover:bg-gray-700 hover:text-white hover:border-gray-500 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]`}
                      >
                        <Icon size={16} />
                        <span className="font-medium">{STEP_LABELS[stepType]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}