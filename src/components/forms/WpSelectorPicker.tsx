import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { WP_SELECTOR_LIBRARY } from '../../utils/wpSelectors';
import type { TourStep } from '../../utils/tourProviders';

export interface PickResult {
  selector: string;
  side?: TourStep['side'];
  url?: string;
}

interface WpSelectorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onPick: (result: PickResult) => void;
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export function WpSelectorPicker({ value, onChange, onPick }: WpSelectorPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => searchRef.current?.focus(), 40);

    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const q = query.toLowerCase().trim();
  const filtered = q
    ? WP_SELECTOR_LIBRARY.filter(e =>
        e.label.toLowerCase().includes(q) ||
        e.selector.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      )
    : WP_SELECTOR_LIBRARY;

  const groups = filtered.reduce<Record<string, typeof WP_SELECTOR_LIBRARY>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  }, {});

  const knownEntry = value ? WP_SELECTOR_LIBRARY.find(e => e.selector === value.trim()) : undefined;
  const looksValid = value ? /^[#.\[a-zA-Z*_]/.test(value.trim()) : false;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Input + Browse button */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          style={{
            flex: 1, padding: '6px 10px', fontSize: 12,
            border: '1px solid var(--border-input)', borderRadius: 2,
            color: 'var(--text-primary)', background: 'var(--bg-surface)',
            outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
            transition: 'border-color 0.12s, box-shadow 0.12s',
          }}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. #menu-pages"
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          title="Browse common WordPress elements"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 9px',
            border: `1px solid ${open ? 'var(--accent)' : 'var(--border-input)'}`,
            borderRadius: 2,
            background: open ? 'var(--accent-bg)' : 'var(--bg-surface)',
            color: open ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 11, fontWeight: 600,
            fontFamily: FONT, whiteSpace: 'nowrap',
            transition: 'all 0.12s',
          }}
        >
          Browse
          <ChevronDown
            size={11}
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          />
        </button>
      </div>

      {/* Inline validation hint */}
      {value && (
        <div style={{ marginTop: 4, fontSize: 11, fontFamily: FONT }}>
          {knownEntry ? (
            <span style={{ color: '#00a32a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00a32a', display: 'inline-block', flexShrink: 0 }} />
              {knownEntry.label}
            </span>
          ) : looksValid ? (
            <span style={{ color: 'var(--text-muted)' }}>Custom selector</span>
          ) : (
            <span style={{ color: '#d63638' }}>
              Check selector syntax — should start with #, ., or a tag name
            </span>
          )}
        </div>
      )}

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          zIndex: 9998,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-input)',
          borderRadius: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          maxHeight: 256,
          overflowY: 'auto',
        }}>
          {/* Sticky search */}
          <div style={{
            padding: '7px 8px',
            borderBottom: '1px solid var(--border-light)',
            position: 'sticky', top: 0,
            background: 'var(--bg-surface)',
            zIndex: 1,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 8px',
              background: 'var(--bg-app)',
              borderRadius: 3,
              border: '1px solid var(--border-light)',
            }}>
              <Search size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: 12,
                  color: 'var(--text-primary)', fontFamily: FONT,
                }}
                placeholder="Search elements..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex' }}
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {Object.keys(groups).length === 0 ? (
            <div style={{ padding: '14px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: FONT }}>
              No matches for "{query}"
            </div>
          ) : (
            Object.entries(groups).map(([category, entries]) => (
              <div key={category}>
                <div style={{
                  padding: '7px 10px 2px',
                  fontSize: 10, fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  fontFamily: FONT,
                }}>
                  {category}
                </div>
                {entries.map(entry => (
                  <button
                    key={entry.selector}
                    type="button"
                    onClick={() => {
                      onPick({ selector: entry.selector, side: entry.side, url: entry.url });
                      setOpen(false);
                      setQuery('');
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 10,
                      padding: '5px 10px', border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      textAlign: 'left', fontFamily: FONT,
                      transition: 'background 0.1s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--accent-bg)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, flexShrink: 0 }}>
                      {entry.label}
                    </span>
                    <span style={{
                      fontSize: 11, color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      maxWidth: '54%',
                    }}>
                      {entry.selector}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
