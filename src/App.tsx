import React, { useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { StepsList } from './components/StepsList';
import { ConfigPanel } from './components/ConfigPanel';
import { Header } from './components/Header';
import { Step, StepType } from './types/blueprint';
import { generateBlueprint } from './utils/blueprintGenerator';
import { convertNativeBlueprintToPootleSteps } from './utils/nativeBlueprintConverter';
import './App.css';

function App() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [blueprintTitle, setBlueprintTitle] = useState('My WordPress Site');
  const [landingPageType, setLandingPageType] = useState<'wp-admin' | 'front-page'>('wp-admin');
  const fileInputRef = useRef<HTMLInputElement>(null);


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


  const handleExportBlueprint = () => {
    const nativeBlueprint = generateBlueprint(steps, blueprintTitle, landingPageType);
    const jsonString = JSON.stringify(nativeBlueprint, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprintTitle.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerLoadBlueprint = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLoadBlueprint = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const nativeBlueprint = JSON.parse(content);
        
        // Validate basic WordPress Playground blueprint structure
        if (!nativeBlueprint.steps || !Array.isArray(nativeBlueprint.steps)) {
          alert('Invalid WordPress Playground blueprint file format');
          return;
        }

        const convertedSteps = convertNativeBlueprintToPootleSteps(nativeBlueprint);
        const landingPageType = nativeBlueprint.landingPage === '/wp-admin/' ? 'wp-admin' : 'front-page';

        let extractedTitle = 'Imported WordPress Site';
        const titleStep = convertedSteps.find(step =>
          step.type === 'setSiteOption' && step.data.option === 'blogname'
        );
        if (titleStep) {
          extractedTitle = titleStep.data.value;
        }

        setBlueprintTitle(extractedTitle);
        setLandingPageType(landingPageType);
        setSteps(convertedSteps);
        setSelectedStep(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        console.error('Error parsing blueprint file:', error);
        alert('Error loading WordPress Playground blueprint file. Please check the file format.');
      }
    };

    reader.readAsText(file);
  };

  const blueprint = generateBlueprint(steps, blueprintTitle, landingPageType);


  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid relative">
      <Header
        blueprint={blueprint}
        title={blueprintTitle}
        stepCount={steps.length}
        onExportBlueprint={handleExportBlueprint}
        onImportBlueprint={triggerLoadBlueprint}
      />
      
      <div className="flex flex-col lg:flex-row relative z-10">
        <Sidebar 
          onAddStep={addStep}
          blueprintTitle={blueprintTitle}
          onTitleChange={setBlueprintTitle}
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
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoadBlueprint}
        style={{ display: 'none' }}
      />
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
      postStatus: 'publish',
      postName: '',
      postParent: '',
      template: '',
      menuOrder: ''
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
    },
    setLandingPage: {
      landingPageType: 'wp-admin'
    }
  };
  
  return defaults[type] || {};
}

export default App;