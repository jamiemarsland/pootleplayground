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
import { GuidedTourForm } from './forms/GuidedTourForm';

interface ConfigPanelProps {
  selectedStep: Step | null;
  onUpdateStep: (stepId: string, data: any) => void;
  allSteps: Step[];
}

export function ConfigPanel({ selectedStep, onUpdateStep, allSteps }: ConfigPanelProps) {
  if (!selectedStep) {
    return (
      <div
        className="hidden lg:flex flex-1 items-center justify-center"
        style={{ background: 'var(--bg-app)' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Settings style={{ width: 22, height: 22, color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Select a step to configure
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0, maxWidth: 280 }}>
            Choose a step from the right panel to configure its settings.
          </p>
        </div>
      </div>
    );
  }

  const renderForm = () => {
    const commonProps = {
      data: selectedStep.data,
      onChange: (data: any) => onUpdateStep(selectedStep.id, data),
    };

    switch (selectedStep.type) {
      case 'addPost': return <PostForm {...commonProps} />;
      case 'addPage': return <PageForm {...commonProps} />;
      case 'addMedia': return <MediaForm {...commonProps} />;
      case 'installPlugin': return <PluginForm {...commonProps} />;
      case 'installTheme': return <ThemeForm {...commonProps} />;
      case 'setSiteOption': return <SiteOptionForm {...commonProps} />;
      case 'defineWpConfigConst': return <WpConfigForm {...commonProps} />;
      case 'login': return <LoginForm {...commonProps} />;
      case 'importWxr': return <ImportForm {...commonProps} />;
      case 'addClientRole': return <ClientRoleForm {...commonProps} />;
      case 'setHomepage': return <HomepageForm {...commonProps} allSteps={allSteps} />;
      case 'setPostsPage': return <PostsPageForm {...commonProps} allSteps={allSteps} />;
      case 'createNavigationMenu': return <NavigationMenuForm {...commonProps} allSteps={allSteps} />;
      case 'setLandingPage': return <LandingPageForm {...commonProps} />;
      case 'guidedTour': return <GuidedTourForm {...commonProps} />;
      default: return <div>Unsupported step type</div>;
    }
  };

  return (
    <div
      className="flex-1 overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
    >
      {renderForm()}
    </div>
  );
}
