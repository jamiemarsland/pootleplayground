import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { StepsList } from './components/StepsList';
import { ConfigPanel } from './components/ConfigPanel';
import { Header } from './components/Header';
import { BlueprintGallery } from './components/BlueprintGallery';
import { SaveBlueprintModal } from './components/SaveBlueprintModal';
import { AlertModal } from './components/AlertModal';
import { AiPromptSidebar } from './components/AiPromptSidebar';
import { AiGeneratorPage } from './components/AiGeneratorPage';
import { VersionAnnouncementModal } from './components/VersionAnnouncementModal';
import { Step, StepType } from './types/blueprint';
import { generateBlueprint } from './utils/blueprintGenerator';
import { convertNativeBlueprintToPootleSteps } from './utils/nativeBlueprintConverter';
import './App.css';

function Builder() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAiSidebar, setShowAiSidebar] = useState(false);
  const [blueprintTitle, setBlueprintTitle] = useState('My WordPress Site');
  const [landingPageType, setLandingPageType] = useState<'wp-admin' | 'front-page' | 'custom'>('wp-admin');
  const [customLandingUrl, setCustomLandingUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info' | 'success';
  }>({ isOpen: false, title: '', message: '', type: 'info' });
  const [showVersionAnnouncement, setShowVersionAnnouncement] = useState(false);

  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem('hasSeenV16Announcement');
    if (!hasSeenAnnouncement) {
      setShowVersionAnnouncement(true);
    }

    const savedBlueprint = localStorage.getItem('loadBlueprint');
    if (savedBlueprint) {
      try {
        const blueprintData = JSON.parse(savedBlueprint);
        setBlueprintTitle(blueprintData.blueprintTitle || 'My WordPress Site');
        setLandingPageType(blueprintData.landingPageType || 'wp-admin');
        setCustomLandingUrl(blueprintData.customLandingUrl || '');
        setSteps(blueprintData.steps || []);
        setSelectedStep(null);
        localStorage.removeItem('loadBlueprint');
      } catch (error) {
        console.error('Error loading blueprint from localStorage:', error);
        localStorage.removeItem('loadBlueprint');
      }
    }
  }, []);

  const handleCloseVersionAnnouncement = () => {
    localStorage.setItem('hasSeenV16Announcement', 'true');
    setShowVersionAnnouncement(false);
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


  const handleExportBlueprint = () => {
    const nativeBlueprint = generateBlueprint(steps, blueprintTitle, landingPageType, customLandingUrl);
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
          setAlertState({
            isOpen: true,
            title: 'Invalid Blueprint',
            message: 'The selected file is not a valid WordPress Playground blueprint format.',
            type: 'danger'
          });
          return;
        }

        const convertedSteps = convertNativeBlueprintToPootleSteps(nativeBlueprint);
        let landingPageType: 'wp-admin' | 'front-page' | 'custom' = 'wp-admin';
        let customUrl = '';

        if (nativeBlueprint.landingPage === '/wp-admin/') {
          landingPageType = 'wp-admin';
        } else if (nativeBlueprint.landingPage === '/') {
          landingPageType = 'front-page';
        } else {
          landingPageType = 'custom';
          customUrl = nativeBlueprint.landingPage;
        }

        let extractedTitle = 'Imported WordPress Site';
        const titleStep = convertedSteps.find(step =>
          step.type === 'setSiteOption' && step.data.option === 'blogname'
        );
        if (titleStep) {
          extractedTitle = titleStep.data.value;
        }

        setBlueprintTitle(extractedTitle);
        setLandingPageType(landingPageType);
        setCustomLandingUrl(customUrl);
        setSteps(convertedSteps);
        setSelectedStep(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        console.error('Error parsing blueprint file:', error);
        setAlertState({
          isOpen: true,
          title: 'Error Loading Blueprint',
          message: 'Failed to load the blueprint file. Please check the file format and try again.',
          type: 'danger'
        });
      }
    };

    reader.readAsText(file);
  };

  const handleSaveSuccess = () => {
    setAlertState({
      isOpen: true,
      title: 'Blueprint Saved!',
      message: 'Your blueprint has been saved successfully. You can now find it in the Gallery under "My Blueprints".',
      type: 'success'
    });
  };

  const handleReset = () => {
    setSteps([]);
    setSelectedStep(null);
    setBlueprintTitle('My WordPress Site');
    setLandingPageType('wp-admin');
    setCustomLandingUrl('');
  };

  const handleAiGenerateBlueprint = (blueprintData: any) => {
    if (blueprintData.blueprintTitle) {
      setBlueprintTitle(blueprintData.blueprintTitle);
    }
    if (blueprintData.landingPageType) {
      setLandingPageType(blueprintData.landingPageType);
    }
    if (blueprintData.customLandingUrl) {
      setCustomLandingUrl(blueprintData.customLandingUrl);
    }
    if (blueprintData.steps && Array.isArray(blueprintData.steps)) {
      setSteps(blueprintData.steps);
      setSelectedStep(null);
    }

    setAlertState({
      isOpen: true,
      title: 'Blueprint Generated!',
      message: blueprintData.explanation || 'Your AI-generated blueprint is ready. Review and customize as needed.',
      type: 'success'
    });
  };

  const blueprint = generateBlueprint(steps, blueprintTitle, landingPageType, customLandingUrl);

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid relative">
      <Header
        blueprint={blueprint}
        title={blueprintTitle}
        stepCount={steps.length}
        onExportBlueprint={handleExportBlueprint}
        onImportBlueprint={triggerLoadBlueprint}
        onShowGallery={() => navigate('/gallery')}
        onSaveBlueprint={() => setShowSaveModal(true)}
        onReset={handleReset}
        onOpenAiSidebar={() => setShowAiSidebar(true)}
        onShowAiGenerator={() => navigate('/ai-generator')}
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

      <SaveBlueprintModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        blueprintData={{
          blueprintTitle,
          landingPageType,
          customLandingUrl,
          steps
        }}
        onSuccess={handleSaveSuccess}
      />

      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />

      <AiPromptSidebar
        isOpen={showAiSidebar}
        onClose={() => setShowAiSidebar(false)}
        onGenerateBlueprint={handleAiGenerateBlueprint}
      />

      {showVersionAnnouncement && (
        <VersionAnnouncementModal onClose={handleCloseVersionAnnouncement} />
      )}
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

function GalleryPage() {
  const navigate = useNavigate();

  const handleSelectBlueprint = (blueprintData: any) => {
    localStorage.setItem('loadBlueprint', JSON.stringify(blueprintData));
    navigate('/');
  };

  return (
    <BlueprintGallery
      onSelectBlueprint={handleSelectBlueprint}
      onBack={() => navigate('/')}
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Builder />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/ai-generator" element={<AiGeneratorPage />} />
    </Routes>
  );
}

export default App;