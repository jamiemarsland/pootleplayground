import React, { useRef, useState } from 'react';
import { FileText, Image, Puzzle, Settings, X, Menu, GripVertical, Map } from 'lucide-react';
import { Step } from '../types/blueprint';

interface StepsListProps {
  steps: Step[];
  selectedStep: Step | null;
  onSelectStep: (step: Step) => void;
  onRemoveStep: (stepId: string) => void;
  onReorderSteps: (steps: Step[]) => void;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  addPost: FileText, addPage: FileText, addMedia: Image,
  setLandingPage: Settings, setHomepage: FileText, setPostsPage: FileText,
  installPlugin: Puzzle, installTheme: Puzzle,
  setSiteOption: Settings, defineWpConfigConst: Settings, login: Settings,
  importWxr: Settings, addClientRole: Settings, createNavigationMenu: Menu,
  guidedTour: Map,
};

const STEP_LABELS: Record<string, string> = {
  addPost: 'Add Post', addPage: 'Add Page', addMedia: 'Add Media',
  setLandingPage: 'Set Landing Page', setHomepage: 'Set Homepage',
  setPostsPage: 'Set Posts Page', installPlugin: 'Install Plugin',
  installTheme: 'Install Theme', setSiteOption: 'Site Option',
  defineWpConfigConst: 'WP Config', login: 'Login', importWxr: 'Import WXR',
  addClientRole: 'Client Role', createNavigationMenu: 'Set Navigation Menu',
  guidedTour: 'Guided Tour',
};

const STEP_ACCENT: Record<string, string> = {
  addPost: '#2271b1', addPage: '#2271b1', addMedia: '#2271b1',
  installPlugin: '#00a32a', installTheme: '#00a32a',
  setHomepage: '#787c82', setPostsPage: '#787c82', createNavigationMenu: '#787c82',
  setLandingPage: '#dba617', setSiteOption: '#dba617',
  defineWpConfigConst: '#d63638', login: '#d63638',
  importWxr: '#50575e', addClientRole: '#50575e',
  guidedTour: '#c17d11',
};

const WP_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

export function StepsList({ steps, selectedStep, onSelectStep, onRemoveStep, onReorderSteps }: StepsListProps) {
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === dropIndex) {
      setDragOverIndex(null);
      dragIndex.current = null;
      return;
    }
    const reordered = [...steps];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dropIndex, 0, moved);
    onReorderSteps(reordered);
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  return (
    <div
      style={{
        width: 280, minWidth: 280,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        minHeight: 'calc(100vh - 56px)',
        fontFamily: WP_FONT,
      }}
      className="lg:flex flex-col hidden"
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Blueprint Steps</span>
          {steps.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 20, height: 20, background: 'var(--accent)', color: '#fff',
              borderRadius: '50%', fontSize: 11, fontWeight: 700,
            }}>
              {steps.length}
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
          Drag to reorder your setup sequence
        </p>
      </div>

      {/* Steps */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {steps.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, background: 'var(--bg-subtle)',
              border: '1px solid var(--border)', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Settings style={{ width: 20, height: 20, color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>No steps yet</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>Add steps from the left panel</p>
          </div>
        ) : (
          <div>
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[step.type] || Settings;
              const isSelected = selectedStep?.id === step.id;
              const accent = STEP_ACCENT[step.type] || 'var(--text-secondary)';
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={step.id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectStep(step)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 14px 9px 0',
                    borderLeft: `3px solid ${isSelected ? accent : 'transparent'}`,
                    background: isDragOver
                      ? 'var(--accent-bg)'
                      : isSelected ? 'var(--accent-bg)' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.1s',
                    borderBottom: isDragOver
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border-light)',
                    opacity: dragIndex.current === index ? 0.4 : 1,
                  }}
                  onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseOut={e => { if (!isSelected && dragOverIndex !== index) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Drag handle */}
                  <div
                    style={{
                      paddingLeft: 6, cursor: 'grab',
                      color: 'var(--border-muted)', display: 'flex', alignItems: 'center',
                      flexShrink: 0,
                    }}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <GripVertical size={13} />
                  </div>

                  {/* Step number */}
                  <div style={{
                    width: 18, minWidth: 18, textAlign: 'center',
                    fontSize: 11, fontWeight: 600,
                    color: isSelected ? accent : 'var(--text-muted)',
                  }}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <Icon size={14} style={{ color: isSelected ? accent : 'var(--text-secondary)', flexShrink: 0 }} />

                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {STEP_LABELS[step.type]}
                    </div>
                    {(step.data?.postTitle || step.data?.option) && (
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {step.data.postTitle || step.data.option}
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={e => { e.stopPropagation(); onRemoveStep(step.id); }}
                    style={{
                      width: 24, height: 24, border: 'none', background: 'transparent',
                      borderRadius: 2, cursor: 'pointer', color: 'var(--border-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'color 0.1s', flexShrink: 0, padding: 0,
                    }}
                    onMouseOver={e => (e.currentTarget.style.color = 'var(--error)')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--border-muted)')}
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
