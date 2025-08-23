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

interface ConfigPanelProps {
  selectedStep: Step | null;
  onUpdateStep: (stepId: string, data: any) => void;
  allSteps: Step[];
}

export function ConfigPanel({ selectedStep, onUpdateStep, allSteps }: ConfigPanelProps) {
  if (!selectedStep) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-700">
            <Settings className="w-8 h-8 text-pootle-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-100 mb-3">
            Select a Step to Configure
          </h3>
          <p className="text-gray-400 max-w-sm">
            Choose a step from the sidebar to configure its settings and content.
          </p>
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
      default:
        return <div>Unsupported step type</div>;
    }
  };

  return (
    <div className="flex-1 bg-gray-800/80 backdrop-blur-sm rounded-tl-2xl shadow-xl border border-gray-700/50 m-4 overflow-hidden">
      {renderForm()}
    </div>
  );
}