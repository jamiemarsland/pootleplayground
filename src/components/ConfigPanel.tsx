import React from 'react';
import { Settings } from 'lucide-react';
import { Step } from '../types/blueprint';
import { PostForm } from './forms/PostForm';
import { PageForm } from './forms/PageForm';
import { MediaForm } from './forms/MediaForm';
import { PluginForm } from './forms/PluginForm';
import { ThemeForm } from './forms/ThemeForm';
import { SiteOptionForm } from './forms/SiteOptionForm';
import { WpConfigForm } from './forms/WpConfigForm';
import { LoginForm } from './forms/LoginForm';
import { ImportForm } from './forms/ImportForm';
import { ClientRoleForm } from './forms/ClientRoleForm';
import { HomepageForm } from './forms/HomepageForm';
import { PostsPageForm } from './forms/PostsPageForm';
import { NavigationMenuForm } from './forms/NavigationMenuForm';
import { LandingPageForm } from './forms/LandingPageForm';

interface ConfigPanelProps {
  selectedStep: Step | null;
  onUpdateStep: (stepId: string, data: any) => void;
  allSteps: Step[];
  onBack?: () => void;
}

export function ConfigPanel({ selectedStep, onUpdateStep, allSteps, onBack }: ConfigPanelProps) {
  if (!selectedStep) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 blueprint-component rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border">
            <Settings className="w-8 h-8 text-blueprint-accent" />
          </div>
          <h3 className="text-xl font-semibold text-blueprint-text mb-3">
            Select a Step to Configure
          </h3>
          <p className="text-blueprint-text/70 max-w-sm">
            Choose a step from the steps list to configure its settings and content.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 blueprint-button rounded-lg text-sm"
            >
              Back to Steps
            </button>
          )}
        </div>
      </div>
    );
  }

  const renderForm = () => {
    const commonProps = {
      data: selectedStep.data,
      onChange: (data: any) => onUpdateStep(selectedStep.id, data)
    };

    switch (selectedStep.type) {
      case 'addPost':
        return <PostForm {...commonProps} />;
      case 'addPage':
        return <PageForm {...commonProps} />;
      case 'addMedia':
        return <MediaForm {...commonProps} />;
      case 'installPlugin':
        return <PluginForm {...commonProps} />;
      case 'installTheme':
        return <ThemeForm {...commonProps} />;
      case 'setSiteOption':
        return <SiteOptionForm {...commonProps} />;
      case 'defineWpConfigConst':
        return <WpConfigForm {...commonProps} />;
      case 'login':
        return <LoginForm {...commonProps} />;
      case 'importWxr':
        return <ImportForm {...commonProps} />;
      case 'addClientRole':
        return <ClientRoleForm {...commonProps} />;
      case 'setHomepage':
        return <HomepageForm {...commonProps} allSteps={allSteps} />;
      case 'setPostsPage':
        return <PostsPageForm {...commonProps} allSteps={allSteps} />;
      case 'createNavigationMenu':
        return <NavigationMenuForm {...commonProps} allSteps={allSteps} />;
      case 'setLandingPage':
        return <LandingPageForm {...commonProps} />;
      default:
        return <div>Unsupported step type</div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col blueprint-component lg:rounded-tl-2xl lg:rounded-tr-none shadow-xl border lg:m-4 overflow-hidden backdrop-blur-sm">
      {onBack && (
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-blueprint-accent/30">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Steps</span>
          </button>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {renderForm()}
      </div>
    </div>
  );
}