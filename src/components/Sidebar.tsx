import React, { useState } from 'react';
import { FileText, Image, Puzzle, Settings, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { StepType, StepCategory } from '../types/blueprint';

interface SidebarProps {
  onAddStep: (type: StepType) => void;
  blueprintTitle: string;
  onTitleChange: (title: string) => void;
  phpVersion: string;
  onPhpVersionChange: (v: string) => void;
  wpVersion: string;
  onWpVersionChange: (v: string) => void;
}

const PHP_VERSIONS = ['7.4', '8.0', '8.1', '8.2', '8.3'];

const WP_VERSIONS: { value: string; label: string; group?: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: '6.7', label: '6.7', group: 'WordPress 6' },
  { value: '6.6', label: '6.6', group: 'WordPress 6' },
  { value: '6.5', label: '6.5', group: 'WordPress 6' },
  { value: '6.4', label: '6.4', group: 'WordPress 6' },
  { value: '6.3', label: '6.3', group: 'WordPress 6' },
  { value: '6.2', label: '6.2', group: 'WordPress 6' },
  { value: '6.1', label: '6.1', group: 'WordPress 6' },
  { value: '6.0', label: '6.0', group: 'WordPress 6' },
  { value: '5.9', label: 'WordPress 5 (5.9)', group: 'Older' },
  { value: '4.9', label: 'WordPress 4 (4.9)', group: 'Older' },
  { value: '3.9', label: 'WordPress 3 (3.9)', group: 'Older' },
  { value: '2.9', label: 'WordPress 2 (2.9)', group: 'Older' },
  { value: '1.5', label: 'WordPress 1 (1.5)', group: 'Older' },
];

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

export function Sidebar({ onAddStep, blueprintTitle, onTitleChange, phpVersion, onPhpVersionChange, wpVersion, onWpVersionChange }: SidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
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

        {/* Advanced section */}
        <div style={{ borderTop: '1px solid #f0f0f1', marginTop: 4 }}>
          <button
            onClick={() => setAdvancedOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px 4px', border: 'none', background: 'transparent',
              cursor: 'pointer', fontFamily: WP_FONT,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#787c82', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Advanced
            </span>
            {advancedOpen
              ? <ChevronDown size={13} style={{ color: '#787c82' }} />
              : <ChevronRight size={13} style={{ color: '#787c82' }} />}
          </button>

          {advancedOpen && (
            <div style={{ padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* WordPress version */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#787c82', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  WordPress Version
                </label>
                <select
                  value={wpVersion}
                  onChange={e => onWpVersionChange(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 8px', fontSize: 12,
                    border: '1px solid #8c8f94', borderRadius: 2,
                    color: '#1e1e1e', background: '#fff', outline: 'none',
                    fontFamily: WP_FONT, cursor: 'pointer',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#2271b1'; e.target.style.boxShadow = '0 0 0 1px #2271b1'; }}
                  onBlur={e => { e.target.style.borderColor = '#8c8f94'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="latest">Latest</option>
                  <optgroup label="WordPress 6">
                    {WP_VERSIONS.filter(v => v.group === 'WordPress 6').map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Older Releases">
                    {WP_VERSIONS.filter(v => v.group === 'Older').map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* PHP version */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#787c82', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  PHP Version
                </label>
                <select
                  value={phpVersion}
                  onChange={e => onPhpVersionChange(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 8px', fontSize: 12,
                    border: '1px solid #8c8f94', borderRadius: 2,
                    color: '#1e1e1e', background: '#fff', outline: 'none',
                    fontFamily: WP_FONT, cursor: 'pointer',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#2271b1'; e.target.style.boxShadow = '0 0 0 1px #2271b1'; }}
                  onBlur={e => { e.target.style.borderColor = '#8c8f94'; e.target.style.boxShadow = 'none'; }}
                >
                  {PHP_VERSIONS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
