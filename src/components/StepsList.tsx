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
    <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-l border-gray-700/50 flex flex-col min-h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            Blueprint Steps
            {steps.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                {steps.length}
              </span>
            )}
          </h2>
        </div>
        <p className="text-xs text-gray-400">
          Your WordPress setup sequence
        </p>
      </div>
      
      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4">
        {steps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-700">
              <Settings className="w-8 h-8 text-pootle-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">No Steps Yet</h3>
            <p className="text-sm text-gray-400 mb-4">Add steps from the left sidebar to build your blueprint</p>
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
                  className={`relative group border-l-4 border rounded-lg p-4 cursor-pointer transition-all duration-200 shadow-sm ${
                    isSelected 
                      ? `border-l-${color}-500 border-${color}-600/50 bg-${color}-900/40 shadow-lg scale-[1.02]` 
                      : 'border-l-gray-600 border-gray-600/50 hover:border-l-gray-400 hover:border-gray-500/50 hover:shadow-md hover:scale-[1.01] bg-gray-800/70'
                  }`}
                  onClick={() => onSelectStep(step)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-${color}-900/50 flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-bold text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                    <Icon size={18} className={`text-${color}-400 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-100">
                        {STEP_LABELS[step.type]}
                      </div>
                      {(step.data.postTitle || step.data.option) && (
                        <div className="text-xs text-gray-400 truncate mt-1">
                          {step.data.postTitle || step.data.option}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStep(step.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-900/30 flex-shrink-0"
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