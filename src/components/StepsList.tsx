import React from 'react';
import { FileText, Image, Puzzle, Settings, X, Menu } from 'lucide-react';
import { Step, StepType } from '../types/blueprint';

interface StepsListProps {
  steps: Step[];
  selectedStep: Step | null;
  onSelectStep: (step: Step) => void;
  onRemoveStep: (stepId: string) => void;
}

const STEP_ICONS = {
  addPost: FileText,
  addPage: FileText,
  addMedia: Image,
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
  setLandingPage: 'Set Landing Page',
  setHomepage: 'Set Homepage',
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

export function StepsList({ steps, selectedStep, onSelectStep, onRemoveStep }: StepsListProps) {
  const getStepColor = (type: StepType) => {
    const colorMap = {
      addPost: 'blue',
      addPage: 'blue', 
      addMedia: 'blue',
      setLandingPage: 'purple',
      setHomepage: 'blue',
      setPostsPage: 'blue',
      installPlugin: 'green',
      installTheme: 'green',
      setSiteOption: 'purple',
      defineWpConfigConst: 'purple',
      login: 'purple',
      importWxr: 'orange',
      addClientRole: 'orange',
      createNavigationMenu: 'purple'
    };
    return colorMap[type] || 'gray';
  };

  return (
    <div className="w-80 blueprint-paper border-l border-blueprint-accent/30 flex flex-col min-h-[calc(100vh-73px)] backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-blueprint-accent/30 blueprint-component/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-blueprint-text flex items-center gap-2">
            Blueprint Steps
            {steps.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-blueprint-paper blueprint-accent rounded-full">
                {steps.length}
              </span>
            )}
          </h2>
        </div>
        <p className="text-xs text-blueprint-text/60">
          Your WordPress setup sequence
        </p>
      </div>
      
      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4">
        {steps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 blueprint-component rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border">
              <Settings className="w-8 h-8 text-blueprint-accent" />
            </div>
            <h3 className="text-lg font-semibold text-blueprint-text mb-2">No Steps Yet</h3>
            <p className="text-sm text-blueprint-text/70 mb-4">Add steps from the left sidebar to build your blueprint</p>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[step.type];
              const color = getStepColor(step.type);
              const isSelected = selectedStep?.id === step.id;
              
              return (
                <div
                  key={step.id}
                  className={`relative group border-l-4 border rounded-lg p-4 cursor-pointer blueprint-transition shadow-sm ${
                    isSelected 
                      ? 'border-l-blueprint-accent border-blueprint-accent/50 blueprint-component shadow-lg scale-[1.02]' 
                      : 'border-l-blueprint-grid border-blueprint-grid/50 hover:border-l-blueprint-accent/70 hover:border-blueprint-accent/30 hover:shadow-md hover:scale-[1.01] blueprint-component/50'
                  }`}
                  onClick={() => onSelectStep(step)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full blueprint-component border border-blueprint-accent/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blueprint-accent">
                        {index + 1}
                      </span>
                    </div>
                    <Icon size={18} className="text-blueprint-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-blueprint-text">
                        {STEP_LABELS[step.type]}
                      </div>
                      {(step.data.postTitle || step.data.option) && (
                        <div className="text-xs text-blueprint-text/60 truncate mt-1">
                          {step.data.postTitle || step.data.option}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStep(step.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-blueprint-text/50 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-900/30 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}