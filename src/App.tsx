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
import { VersionAnnouncementModal } from './components/VersionAnnouncementModal';
import { Step, StepType } from './types/blueprint';
import { generateBlueprint } from './utils/blueprintGenerator';
import { convertNativeBlueprintToPootleSteps } from './utils/nativeBlueprintConverter';
import './App.css';

type MobileView = 'steps' | 'add' | 'config';

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
  const [mobileView, setMobileView] = useState<MobileView>('steps');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
    setMobileView('config');
    setShowMobileSidebar(false);
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

  const handleSelectStep = (step: Step) => {
    setSelectedStep(step);
    setMobileView('config');
  };

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid relative flex flex-col">
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
        onToggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        showMobileSidebar={showMobileSidebar}
      />

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:flex-row flex-1">
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

        {/* Mobile Layout */}
        <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
          {mobileView === 'steps' && (
            <StepsList
              steps={steps}
              selectedStep={selectedStep}
              onSelectStep={handleSelectStep}
              onRemoveStep={removeStep}
            />
          )}

          {mobileView === 'add' && (
            <div className="flex-1 overflow-auto">
              <Sidebar
                onAddStep={addStep}
                blueprintTitle={blueprintTitle}
                onTitleChange={setBlueprintTitle}
              />
            </div>
          )}

          {mobileView === 'config' && (
            <div className="flex-1 overflow-auto">
              <ConfigPanel
                selectedStep={selectedStep}
                onUpdateStep={updateStep}
                allSteps={steps}
                onBack={() => setMobileView('steps')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 blueprint-paper border-t border-blueprint-accent/30 backdrop-blur-lg z-50">
        <div className="grid grid-cols-3 gap-1 p-2">
          <button
            onClick={() => setMobileView('steps')}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all ${
              mobileView === 'steps'
                ? 'blueprint-accent text-blueprint-paper'
                : 'text-blueprint-text/70 hover:text-blueprint-accent'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-medium">Steps</span>
          </button>

          <button
            onClick={() => setMobileView('add')}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all ${
              mobileView === 'add'
                ? 'blueprint-accent text-blueprint-paper'
                : 'text-blueprint-text/70 hover:text-blueprint-accent'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">Add</span>
          </button>

          <button
            onClick={() => setMobileView('config')}
            disabled={!selectedStep}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all ${
              mobileView === 'config'
                ? 'blueprint-accent text-blueprint-paper'
                : 'text-blueprint-text/70 hover:text-blueprint-accent disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">Config</span>
          </button>
        </div>
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
    </Routes>
  );
}

export default App;