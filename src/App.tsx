import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { StepsList } from './components/StepsList';
import { ConfigPanel } from './components/ConfigPanel';
import { Header } from './components/Header';
import { Step, StepType } from './types/blueprint';
import { generateBlueprint } from './utils/blueprintGenerator';
import './App.css';

function App() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [blueprintTitle, setBlueprintTitle] = useState('My WordPress Site');
  const [landingPageType, setLandingPageType] = useState<'wp-admin' | 'front-page'>('wp-admin');

  const addStep = (type: StepType) => {
    const newStep: Step = {
      id: `${type}-${Date.now()}`,
      type,
      data: getDefaultStepData(type),
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep);
  };

  const updateStep = (stepId: string, data: any) => {
    console.log('Updating step:', stepId, 'with data:', data);
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, data } : step
    ));
    // Update selected step if it's the one being updated
    if (selectedStep?.id === stepId) {
      setSelectedStep({ ...selectedStep, data });
    }
  };

  const removeStep = (stepId: string) => {
    const newSteps = steps.filter(step => step.id !== stepId);
    setSteps(newSteps);
    if (selectedStep?.id === stepId) {
      setSelectedStep(newSteps.length > 0 ? newSteps[newSteps.length - 1] : null);
    }
  };

  const blueprint = generateBlueprint(steps, blueprintTitle, landingPageType);

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid relative">
      <Header 
        blueprint={blueprint}
        title={blueprintTitle}
        stepCount={steps.length}
      />
      
      <div className="flex relative z-10">
        <Sidebar 
          onAddStep={addStep}
          blueprintTitle={blueprintTitle}
          onTitleChange={setBlueprintTitle}
          landingPageType={landingPageType}
          onLandingPageTypeChange={setLandingPageType}
        />
        
        <ConfigPanel 
          selectedStep={selectedStep}
          onUpdateStep={updateStep}
          allSteps={steps}
        />
        
        <StepsList
          steps={steps}
          selectedStep={selectedStep}
          onSelectStep={setSelectedStep}
          onRemoveStep={removeStep}
        />
      </div>
    </div>
  );
}

function getDefaultStepData(type: StepType): any {
  const defaults = {
    installPlugin: { 
      pluginZipFile: { resource: 'url', url: '' },
      options: { activate: true }
    },
    installTheme: { 
      themeZipFile: { resource: 'url', url: '' },
      options: { activate: true }
    },
    addPost: {
      postTitle: '',
      postContent: '',
      postType: 'post',
      postStatus: 'publish',
      postDate: 'now',
      featuredImageUrl: ''
    },
    addPage: {
      postTitle: '',
      postContent: '',
      postStatus: 'publish'
    },
    addMedia: {
      downloadUrl: ''
    },
    setSiteOption: {
      option: '',
      value: ''
    },
    defineWpConfigConst: {
      consts: {}
    },
    login: {
      username: 'admin',
      password: 'password'
    },
    importWxr: {
      file: { resource: 'url', url: '' }
    },
    addClientRole: {
      name: '',
      capabilities: []
    },
    setHomepage: {
      option: 'create',
      title: 'Home',
      content: ''
    },
    setPostsPage: {
      option: 'create',
      title: 'Blog',
      content: ''
    },
    createNavigationMenu: {
      menuName: 'Main Menu',
      menuLocation: 'primary',
      menuItems: []
    }
  };
  
  return defaults[type] || {};
}

export default App;