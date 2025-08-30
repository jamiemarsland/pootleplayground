import React from 'react';
import { Plus, FileText, Image, Puzzle, Settings, Menu } from 'lucide-react';
import { StepType, StepCategory } from '../types/blueprint';

interface SidebarProps {
  onAddStep: (type: StepType) => void;
  blueprintTitle: string;
  onTitleChange: (title: string) => void;
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
    name: 'Templates',
    steps: ['addTemplate', 'addTemplatePart'],
    color: 'orange'
  },
  {
    name: 'Launch View',
    steps: ['setLandingPage'],
    color: 'purple'
  }
];

const STEP_ICONS = {
  addPost: FileText,
  addPage: FileText,
  addMedia: Image,
  addTemplate: FileText,
  addTemplatePart: FileText,
  setLandingPage: Settings,
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
  addTemplate: 'Add Template',
  addTemplatePart: 'Add Template Part',
  setLandingPage: 'Set Landing Page',
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
  onTitleChange
}: SidebarProps) {

  return (
    <div className="w-full lg:w-80 blueprint-paper border-r lg:border-r border-b lg:border-b-0 border-blueprint-accent/30 flex flex-col min-h-auto lg:min-h-[calc(100vh-73px)] backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-blueprint-accent/30">
        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Site Title
          </label>
          <input
            type="text"
            value={blueprintTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="My WordPress Site"
          />
        </div>

      </div>

      {/* Add Steps */}
      <div className="flex-1 blueprint-component/30 overflow-hidden lg:overflow-auto">
        <div className="p-4 pb-6 lg:pb-4">
          <div className="space-y-4">
            {STEP_CATEGORIES.map(category => (
              <div key={category.name}>
                <h3 className="text-xs font-medium text-blueprint-text/70 mb-2 uppercase tracking-wider">
                  {category.name}
                </h3>
                <div className="grid gap-2">
                  {category.steps.map(stepType => {
                    const Icon = STEP_ICONS[stepType];
                    return (
                      <button
                        key={stepType}
                        onClick={() => onAddStep(stepType)}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg blueprint-button blueprint-transition transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Icon size={16} />
                        <span className="font-medium text-blueprint-text">{STEP_LABELS[stepType]}</span>
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