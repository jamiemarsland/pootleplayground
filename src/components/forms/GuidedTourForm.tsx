import React, { useRef, useState } from 'react';
import {
  Plus, Trash2, GripVertical, Map, Zap, Ban, Code,
  ChevronDown, ChevronUp, Info, Copy, Sparkles,
} from 'lucide-react';
import { TourStep, TourMode, QUICK_INTRO_STEPS } from '../../utils/tourProviders';
import { TOUR_TEMPLATES, TourTemplate } from '../../utils/wpSelectors';
import { WpSelectorPicker } from './WpSelectorPicker';

interface GuidedTourFormProps {
  data: any;
  onChange: (data: any) => void;
}

const WP_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px', fontSize: 13,
  border: '1px solid var(--border-input)', borderRadius: 2,
  color: 'var(--text-primary)', background: 'var(--bg-surface)',
  outline: 'none', fontFamily: WP_FONT, boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--text-tertiary)', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 4, fontFamily: WP_FONT,
};

const MODE_OPTIONS: { value: TourMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'none',   label: 'No Tour',      icon: Ban,  desc: 'No guided tour will be added.' },
  { value: 'quick',  label: 'Quick Intro',  icon: Zap,  desc: 'Pre-built tour covering Dashboard, Pages, Appearance, and Plugins.' },
  { value: 'custom', label: 'Custom Tour',  icon: Map,  desc: 'Build your own step-by-step tour with custom selectors.' },
];

function makeId() {
  return `ts-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function newStep(order: number): TourStep {
  return { id: makeId(), title: '', description: '', selector: '', url: '', order };
}

export function GuidedTourForm({ data, onChange }: GuidedTourFormProps) {
  const tourMode: TourMode    = data?.tourMode  ?? 'none';
  const tourSteps: TourStep[] = data?.tourSteps ?? [];

  const [showJson, setShowJson]           = useState(false);
  const [expandedStep, setExpandedStep]   = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver]           = useState<number | null>(null);

  const update = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });

  /* ── step CRUD ──────────────────────────────────────── */
  const addStep = () => {
    const next = [...tourSteps, newStep(tourSteps.length + 1)];
    update({ tourSteps: next });
    setExpandedStep(next[next.length - 1].id);
  };

  const duplicateStep = (id: string) => {
    const i = tourSteps.findIndex(s => s.id === id);
    if (i === -1) return;
    const orig = tourSteps[i];
    const copy: TourStep = { ...orig, id: makeId(), title: orig.title ? `${orig.title} (copy)` : '' };
    const next = [
      ...tourSteps.slice(0, i + 1),
      copy,
      ...tourSteps.slice(i + 1),
    ].map((s, idx) => ({ ...s, order: idx + 1 }));
    update({ tourSteps: next });
    setExpandedStep(copy.id);
  };

  const removeStep = (id: string) => {
    update({ tourSteps: tourSteps.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })) });
    if (expandedStep === id) setExpandedStep(null);
  };

  const updateStep = (id: string, patch: Partial<TourStep>) =>
    update({ tourSteps: tourSteps.map(s => s.id === id ? { ...s, ...patch } : s) });

  /* ── templates ──────────────────────────────────────── */
  const applyTemplate = (template: TourTemplate) => {
    const base = tourSteps.length;
    const newSteps: TourStep[] = template.steps.map((s, i) => ({
      id: makeId(),
      order: base + i + 1,
      title: s.title,
      description: s.description,
      selector: s.selector,
      url: s.url ?? '',
      side: s.side,
      align: s.align,
    }));
    const next = [...tourSteps, ...newSteps];
    update({ tourSteps: next });
    setShowTemplates(false);
    if (newSteps.length) setExpandedStep(newSteps[0].id);
  };

  const importQuickIntro = () => {
    const steps: TourStep[] = QUICK_INTRO_STEPS.map((s, i) => ({
      ...s, id: makeId(), order: i + 1,
    }));
    update({ tourSteps: steps });
    setExpandedStep(steps[0].id);
  };

  /* ── drag-and-drop ──────────────────────────────────── */
  const handleDragStart = (_e: React.DragEvent, index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (_e: React.DragEvent, dropIndex: number) => {
    if (dragIndex.current === null || dragIndex.current === dropIndex) {
      setDragOver(null);
      return;
    }
    const reordered = [...tourSteps];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dropIndex, 0, moved);
    update({ tourSteps: reordered.map((s, i) => ({ ...s, order: i + 1 })) });
    dragIndex.current = null;
    setDragOver(null);
  };

  const previewSteps = tourMode === 'quick' ? QUICK_INTRO_STEPS : tourSteps;
  const previewJson  = JSON.stringify({ steps: previewSteps }, null, 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: WP_FONT, overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-light)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Guided Tour</h2>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
          Add an interactive walkthrough to your WordPress Playground.
        </p>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Mode selector */}
        <div>
          <label style={labelStyle}>Tour Type</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MODE_OPTIONS.map(({ value, label, icon: Icon, desc }) => {
              const active = tourMode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ tourMode: value })}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-input)'}`,
                    borderRadius: 4, background: active ? 'var(--accent-bg)' : 'var(--bg-surface)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: `2px solid ${active ? 'var(--accent)' : 'var(--border-input)'}`,
                    background: active ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Icon size={13} style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {label}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick intro preview */}
        {tourMode === 'quick' && (
          <div style={{
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            borderRadius: 4, padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Info size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                Includes {QUICK_INTRO_STEPS.length} steps
              </span>
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {QUICK_INTRO_STEPS.map(s => (
                <li key={s.id} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{s.title}</strong>
                  {' — '}{s.description.slice(0, 70)}{s.description.length > 70 ? '…' : ''}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Custom tour builder ── */}
        {tourMode === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Tour Steps ({tourSteps.length})
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowTemplates(t => !t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px',
                    border: `1px solid ${showTemplates ? 'var(--accent-border)' : 'var(--border-input)'}`,
                    borderRadius: 3,
                    background: showTemplates ? 'var(--accent-bg)' : 'transparent',
                    color: showTemplates ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: WP_FONT,
                    transition: 'all 0.12s',
                  }}
                >
                  <Sparkles size={12} />
                  Templates
                  <ChevronDown size={10} style={{ transform: showTemplates ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                </button>
                <button
                  type="button"
                  onClick={addStep}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    borderRadius: 3, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    fontFamily: WP_FONT,
                  }}
                >
                  <Plus size={12} />
                  Add Step
                </button>
              </div>
            </div>

            {/* Templates panel */}
            {showTemplates && (
              <div style={{
                border: '1px solid var(--accent-border)',
                borderRadius: 4, overflow: 'hidden',
                background: 'var(--accent-bg)',
              }}>
                <div style={{ padding: '9px 12px 5px', fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Click a template to append its steps
                </div>
                {TOUR_TEMPLATES.map(template => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 12, padding: '8px 12px', border: 'none',
                      borderTop: '1px solid var(--accent-border)',
                      background: 'transparent', cursor: 'pointer', textAlign: 'left',
                      fontFamily: WP_FONT, transition: 'background 0.1s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(34,113,177,0.09)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {template.description}
                      </div>
                    </div>
                    <Plus size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {tourSteps.length === 0 && (
              <div style={{
                padding: '28px 16px', textAlign: 'center',
                border: '2px dashed var(--border)', borderRadius: 4,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <Map size={26} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                    No steps yet.
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    Add a blank step, pick a template above, or import the Quick Intro.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={importQuickIntro}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                    border: '1px solid var(--accent-border)', borderRadius: 3,
                    background: 'var(--accent-bg)', color: 'var(--accent)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: WP_FONT,
                    transition: 'all 0.12s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
                >
                  <Zap size={13} />
                  Import Quick Intro Steps
                </button>
              </div>
            )}

            {/* Step list */}
            {tourSteps.map((step, index) => {
              const isOpen     = expandedStep === step.id;
              const isDragging = dragIndex.current === index;
              const isOver     = dragOver === index;

              return (
                <div
                  key={step.id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)}
                  onDragEnd={() => { dragIndex.current = null; setDragOver(null); }}
                  style={{
                    border: `1px solid ${isOver ? 'var(--accent)' : 'var(--border-input)'}`,
                    borderRadius: 4,
                    background: isDragging ? 'var(--bg-hover)' : 'var(--bg-surface)',
                    opacity: isDragging ? 0.5 : 1,
                    transition: 'all 0.1s',
                  }}
                >
                  {/* Step header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', userSelect: 'none' }}>
                    <GripVertical size={14} style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }} />
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-bg)',
                      border: '1px solid var(--accent-border)', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                    }}>
                      {index + 1}
                    </span>
                    <span
                      style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => setExpandedStep(isOpen ? null : step.id)}
                    >
                      {step.title || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Untitled step</span>}
                    </span>

                    {/* Duplicate */}
                    <button
                      type="button"
                      title="Duplicate step"
                      onClick={() => duplicateStep(step.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, border: 'none', background: 'transparent',
                        cursor: 'pointer', borderRadius: 2, color: 'var(--text-muted)', flexShrink: 0,
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <Copy size={12} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      title="Remove step"
                      onClick={() => removeStep(step.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, border: 'none', background: 'transparent',
                        cursor: 'pointer', borderRadius: 2, color: 'var(--text-muted)', flexShrink: 0,
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* Expand/collapse */}
                    <button
                      type="button"
                      onClick={() => setExpandedStep(isOpen ? null : step.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, border: 'none', background: 'transparent',
                        cursor: 'pointer', borderRadius: 2, color: 'var(--text-tertiary)', flexShrink: 0,
                      }}
                    >
                      {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>

                  {/* Step fields */}
                  {isOpen && (
                    <div style={{
                      padding: '12px 12px 12px 44px',
                      borderTop: '1px solid var(--border-light)',
                      display: 'flex', flexDirection: 'column', gap: 10,
                    }}>

                      <div>
                        <label style={labelStyle}>Title *</label>
                        <input
                          style={inputStyle}
                          value={step.title}
                          onChange={e => updateStep(step.id, { title: e.target.value })}
                          placeholder="e.g. Edit Your Homepage"
                          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 1px var(--accent)'; }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border-input)'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Description *</label>
                        <textarea
                          style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }}
                          value={step.description}
                          onChange={e => updateStep(step.id, { description: e.target.value })}
                          placeholder="Explain what to do or notice at this step."
                          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 1px var(--accent)'; }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border-input)'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>CSS Selector *</label>
                        <WpSelectorPicker
                          value={step.selector}
                          onChange={val => updateStep(step.id, { selector: val })}
                          onPick={result => updateStep(step.id, {
                            selector: result.selector,
                            ...(result.side && !step.side ? { side: result.side } : {}),
                            ...(result.url  && !step.url  ? { url:  result.url  } : {}),
                          })}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Page URL (optional)</label>
                        <input
                          style={inputStyle}
                          value={step.url ?? ''}
                          onChange={e => updateStep(step.id, { url: e.target.value })}
                          placeholder="e.g. /wp-admin/post.php?post=2&action=edit"
                          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 1px var(--accent)'; }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border-input)'; e.target.style.boxShadow = 'none'; }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                          The admin page this step appears on (for reference).
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Popover Side</label>
                          <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            value={step.side ?? ''}
                            onChange={e => updateStep(step.id, { side: (e.target.value as TourStep['side']) || undefined })}
                          >
                            <option value="">Auto-detect</option>
                            <option value="bottom">Bottom</option>
                            <option value="top">Top</option>
                            <option value="right">Right</option>
                            <option value="left">Left</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Alignment</label>
                          <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            value={step.align ?? 'center'}
                            onChange={e => updateStep(step.id, { align: e.target.value as TourStep['align'] })}
                          >
                            <option value="center">Center</option>
                            <option value="start">Start</option>
                            <option value="end">End</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* JSON Preview */}
        {tourMode !== 'none' && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setShowJson(j => !j)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', border: 'none',
                background: 'var(--bg-app)', cursor: 'pointer', fontFamily: WP_FONT,
              }}
            >
              <Code size={13} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flex: 1, textAlign: 'left' }}>
                Preview Tour JSON
              </span>
              {showJson
                ? <ChevronUp size={13} style={{ color: 'var(--text-tertiary)' }} />
                : <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} />}
            </button>
            {showJson && (
              <pre style={{
                margin: 0, padding: '12px 14px', fontSize: 11, lineHeight: 1.6,
                color: 'var(--text-secondary)', background: 'var(--bg-app)',
                borderTop: '1px solid var(--border)', overflowX: 'auto',
                maxHeight: 320, overflowY: 'auto', fontFamily: 'monospace',
              }}>
                {previewJson}
              </pre>
            )}
          </div>
        )}

        {/* Summary note */}
        {tourMode !== 'none' && (
          <div style={{
            background: 'var(--bg-app)', border: '1px solid var(--border-light)',
            borderRadius: 4, padding: '10px 12px',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.6 }}>
              One file is written to your Playground: <code>mu-plugins/pootle-tour.php</code>.
              All CSS and JS is embedded inline — no external dependencies.
              The tour auto-starts on first visit and includes a <strong>Restart Tour</strong> button
              in the admin bar. Use{' '}
              <kbd style={{ fontSize: 11, padding: '1px 4px', border: '1px solid var(--border)', borderRadius: 2 }}>→</kbd>{' '}
              <kbd style={{ fontSize: 11, padding: '1px 4px', border: '1px solid var(--border)', borderRadius: 2 }}>←</kbd>{' '}
              <kbd style={{ fontSize: 11, padding: '1px 4px', border: '1px solid var(--border)', borderRadius: 2 }}>Esc</kbd>{' '}
              to navigate.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
