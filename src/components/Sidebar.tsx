import React from 'react';
import { FileText, Image, Puzzle, Settings, Menu } from 'lucide-react';
import { StepType, StepCategory } from '../types/blueprint';

interface SidebarProps {
  onAddStep: (type: StepType) => void;
  blueprintTitle: string;
  onTitleChange: (title: string) => void;
}

const STEP_CATEGORIES: StepCategory[] = [
  { name: 'Content', steps: ['addPage', 'addPost', 'addMedia'], color: 'blue' },
  { name: 'Structure', steps: ['setHomepage', 'setPostsPage', 'createNavigationMenu'], color: 'indigo' },
  { name: 'Extensions', steps: ['installPlugin', 'installTheme'], color: 'green' },
  { name: 'Launch View', steps: ['setLandingPage'], color: 'purple' },
];

const STEP_ICONS = {
  addPost: FileText, addPage: FileText, addMedia: Image,
  setLandingPage: Settings, setHomepage: FileText, setPostsPage: FileText,
  installPlugin: Puzzle, installTheme: Puzzle,
  setSiteOption: Settings, defineWpConfigConst: Settings, login: Settings,
  importWxr: Settings, addClientRole: Settings, createNavigationMenu: Menu,
};

const STEP_LABELS = {
  addPost: 'Add Post', addPage: 'Add Page', addMedia: 'Add Media',
  setLandingPage: 'Set Landing Page', setHomepage: 'Set Home Page',
  setPostsPage: 'Set Posts Page', installPlugin: 'Install Plugin',
  installTheme: 'Install Theme', setSiteOption: 'Site Option',
  defineWpConfigConst: 'WP Config', login: 'Login', importWxr: 'Import WXR',
  addClientRole: 'Client Role', createNavigationMenu: 'Set Navigation Menu',
};

const WP_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

export function Sidebar({ onAddStep, blueprintTitle, onTitleChange }: SidebarProps) {
  return (
    <div
      style={{
        width: 280, minWidth: 280,
        background: '#ffffff',
        borderRight: '1px solid #dcdcde',
        display: 'flex', flexDirection: 'column',
        minHeight: 'calc(100vh - 56px)',
        fontFamily: WP_FONT,
      }}
      className="lg:flex flex-col hidden"
    >
      {/* Site title */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f0f0f1' }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#787c82', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Site Title
        </label>
        <input
          type="text"
          value={blueprintTitle}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="My WordPress Site"
          style={{
            width: '100%', padding: '7px 10px', fontSize: 13,
            border: '1px solid #8c8f94', borderRadius: 2,
            color: '#1e1e1e', background: '#fff', outline: 'none',
            boxSizing: 'border-box', fontFamily: WP_FONT,
          }}
          onFocus={e => { e.target.style.borderColor = '#2271b1'; e.target.style.boxShadow = '0 0 0 1px #2271b1'; }}
          onBlur={e => { e.target.style.borderColor = '#8c8f94'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Step categories */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {STEP_CATEGORIES.map(category => (
          <div key={category.name} style={{ marginBottom: 4 }}>
            <div style={{
              padding: '10px 16px 4px',
              fontSize: 11, fontWeight: 600, color: '#787c82',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {category.name}
            </div>
            {category.steps.map(stepType => {
              const Icon = STEP_ICONS[stepType];
              return (
                <button
                  key={stepType}
                  onClick={() => onAddStep(stepType)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 16px', border: 'none', background: 'transparent',
                    cursor: 'pointer', textAlign: 'left', fontSize: 13,
                    color: '#1e1e1e', fontFamily: WP_FONT,
                    transition: 'background 0.1s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#f0f0f1')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={15} style={{ color: '#50575e', flexShrink: 0 }} />
                  <span>{STEP_LABELS[stepType]}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
