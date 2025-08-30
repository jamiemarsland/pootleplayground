import React, { useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { StepsList } from './components/StepsList';
import { ConfigPanel } from './components/ConfigPanel';
import { Header } from './components/Header';
import { BlueprintGallery } from './components/BlueprintGallery';
import { Step, StepType } from './types/blueprint';
import { generateBlueprint } from './utils/blueprintGenerator';
import './App.css';

function App() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [blueprintTitle, setBlueprintTitle] = useState('My WordPress Site');
  const [landingPageType, setLandingPageType] = useState<'wp-admin' | 'front-page'>('wp-admin');
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for blueprint to load from localStorage on mount
  React.useEffect(() => {
    const blueprintToLoad = localStorage.getItem('loadBlueprint');
    if (blueprintToLoad) {
      try {
        const data = JSON.parse(blueprintToLoad);
        loadBlueprintFromData(data);
        localStorage.removeItem('loadBlueprint');
      } catch (error) {
        console.error('Error loading blueprint from localStorage:', error);
        localStorage.removeItem('loadBlueprint');
      }
    }
  }, []);

  const loadBlueprintFromData = (data: any) => {
    setBlueprintTitle(data.blueprintTitle || 'My WordPress Site');
    setLandingPageType(data.landingPageType || 'wp-admin');
    setSteps(data.steps || []);
    setSelectedStep(null);
    setShowGallery(false);
  };

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

  const handleSavePootleBlueprint = () => {
    const pootleBlueprint = {
      version: '1.0',
      blueprintTitle,
      landingPageType,
      steps: steps.map(step => ({
        id: step.id,
        type: step.type,
        data: step.data
      }))
    };
    
    const jsonString = JSON.stringify(pootleBlueprint, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprintTitle.toLowerCase().replace(/\s+/g, '-')}-pootle-blueprint.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerLoadPootleBlueprint = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLoadPootleBlueprint = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const pootleBlueprint = JSON.parse(content);
        
        // Validate basic structure
        if (!pootleBlueprint.blueprintTitle || !Array.isArray(pootleBlueprint.steps)) {
          alert('Invalid Pootle blueprint file format');
          return;
        }
        
        // Load the blueprint data
        setBlueprintTitle(pootleBlueprint.blueprintTitle);
        setLandingPageType(pootleBlueprint.landingPageType || 'wp-admin');
        setSteps(pootleBlueprint.steps || []);
        setSelectedStep(null);
        
        // Clear file input to allow reloading same file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        console.error('Error parsing blueprint file:', error);
        alert('Error loading blueprint file. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  const handleSelectBlueprint = (blueprintData: any) => {
    loadBlueprintFromData(blueprintData);
  };

  const blueprint = generateBlueprint(steps, blueprintTitle, landingPageType);

  if (showGallery) {
    return (
      <BlueprintGallery 
        onSelectBlueprint={handleSelectBlueprint}
        onBack={() => setShowGallery(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid relative">
      <Header 
        blueprint={blueprint}
        title={blueprintTitle}
        stepCount={steps.length}
        onExportBlueprint={handleSavePootleBlueprint}
        onImportBlueprint={triggerLoadPootleBlueprint}
        onShowGallery={() => setShowGallery(true)}
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
      
      {/* Hidden file input for loading blueprints */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoadPootleBlueprint}
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
      postStatus: 'publish'
    },
    addTemplate: {
      postTitle: '',
      postContent: '',
      postStatus: 'publish',
      postName: '',
      theme: '',
      templateType: 'wp_template'
    },
    addTemplatePart: {
      postTitle: '',
      postContent: '',
      postStatus: 'publish',
      postName: '',
      theme: '',
      area: ''
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