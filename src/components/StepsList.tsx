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
  addPost: FileText, addPage: FileText, addMedia: Image,
  setLandingPage: Settings, setHomepage: FileText, setPostsPage: FileText,
  installPlugin: Puzzle, installTheme: Puzzle,
  setSiteOption: Settings, defineWpConfigConst: Settings, login: Settings,
  importWxr: Settings, addClientRole: Settings, createNavigationMenu: Menu,
};

const STEP_LABELS = {
  addPost: 'Add Post', addPage: 'Add Page', addMedia: 'Add Media',
  setLandingPage: 'Set Landing Page', setHomepage: 'Set Homepage',
  setPostsPage: 'Set Posts Page', installPlugin: 'Install Plugin',
  installTheme: 'Install Theme', setSiteOption: 'Site Option',
  defineWpConfigConst: 'WP Config', login: 'Login', importWxr: 'Import WXR',
  addClientRole: 'Client Role', createNavigationMenu: 'Set Navigation Menu',
};

const STEP_ACCENT: Record<string, string> = {
  addPost: '#2271b1', addPage: '#2271b1', addMedia: '#2271b1',
  installPlugin: '#00a32a', installTheme: '#00a32a',
  setHomepage: '#787c82', setPostsPage: '#787c82', createNavigationMenu: '#787c82',
  setLandingPage: '#dba617', setSiteOption: '#dba617',
  defineWpConfigConst: '#d63638', login: '#d63638',
  importWxr: '#50575e', addClientRole: '#50575e',
};

const WP_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

export function StepsList({ steps, selectedStep, onSelectStep, onRemoveStep }: StepsListProps) {
  return (
    <div
      style={{
        width: 280, minWidth: 280,
        background: '#ffffff',
        borderLeft: '1px solid #dcdcde',
        display: 'flex', flexDirection: 'column',
        minHeight: 'calc(100vh - 56px)',
        fontFamily: WP_FONT,
      }}
      className="lg:flex flex-col hidden"
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #dcdcde' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e1e1e' }}>Blueprint Steps</span>
          {steps.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 20, height: 20, background: '#2271b1', color: '#fff',
              borderRadius: '50%', fontSize: 11, fontWeight: 700,
            }}>
              {steps.length}
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: '#787c82', margin: '3px 0 0' }}>
          Your WordPress setup sequence
        </p>
      </div>

      {/* Steps */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {steps.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, background: '#f6f7f7',
              border: '1px solid #dcdcde', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Settings style={{ width: 20, height: 20, color: '#a7aaad' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1e1e1e', margin: '0 0 4px' }}>No steps yet</p>
            <p style={{ fontSize: 12, color: '#787c82', margin: 0 }}>Add steps from the left panel</p>
          </div>
        ) : (
          <div>
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[step.type] || Settings;
              const isSelected = selectedStep?.id === step.id;
              const accent = STEP_ACCENT[step.type] || '#50575e';

              return (
                <div
                  key={step.id}
                  onClick={() => onSelectStep(step)}
                  className="group"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 14px 9px 0',
                    borderLeft: `3px solid ${isSelected ? accent : 'transparent'}`,
                    background: isSelected ? '#f0f6fc' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.1s',
                    borderBottom: '1px solid #f0f0f1',
                  }}
                  onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = '#f9f9f9'; }}
                  onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Step number */}
                  <div style={{
                    width: 24, minWidth: 24, textAlign: 'center',
                    fontSize: 11, fontWeight: 600,
                    color: isSelected ? accent : '#a7aaad',
                    paddingLeft: 8,
                  }}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <Icon size={14} style={{ color: isSelected ? accent : '#50575e', flexShrink: 0 }} />

                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: '#1e1e1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {STEP_LABELS[step.type]}
                    </div>
                    {(step.data?.postTitle || step.data?.option) && (
                      <div style={{ fontSize: 11, color: '#787c82', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {step.data.postTitle || step.data.option}
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={e => { e.stopPropagation(); onRemoveStep(step.id); }}
                    style={{
                      width: 24, height: 24, border: 'none', background: 'transparent',
                      borderRadius: 2, cursor: 'pointer', color: '#a7aaad',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.1s, color 0.1s',
                      flexShrink: 0, padding: 0,
                    }}
                    className="group-hover:opacity-100"
                    onMouseOver={e => (e.currentTarget.style.color = '#d63638')}
                    onMouseOut={e => (e.currentTarget.style.color = '#a7aaad')}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
