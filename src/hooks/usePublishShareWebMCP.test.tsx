import { useState } from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  usePublishShareWebMCP,
  type SaveDialogPrefill,
  type ShareDialogPrefill,
} from './usePublishShareWebMCP';
import type { Blueprint } from '../types/blueprint';

type RegisteredCall = [
  {
    name: string;
    description: string;
    annotations?: Record<string, boolean>;
    execute: (args: any, options: { signal: AbortSignal }) => Promise<any>;
  },
  { signal: AbortSignal },
];

const SAMPLE_BLUEPRINT: Blueprint = {
  landingPage: '/',
  preferredVersions: { php: '8.3', wp: '6.8' },
  features: { networking: true },
  steps: Array.from({ length: 12 }, (_, i) => ({
    step: 'wp-cli',
    command: `wp post create --post_type=page --post_title="Sample Page ${i + 1}" --post_content="${'Lorem ipsum '.repeat(12)}"`,
  })),
};

function TestHarness({
  stepCount = 3,
  onExport = vi.fn(),
}: {
  stepCount?: number;
  onExport?: () => void;
}) {
  const [savePrefill, setSavePrefill] = useState<SaveDialogPrefill | null>(null);
  const [sharePrefill, setSharePrefill] = useState<ShareDialogPrefill | null>(null);

  usePublishShareWebMCP({
    blueprint: SAMPLE_BLUEPRINT,
    blueprintTitle: 'Sweet Crumb Bakery',
    stepCount,
    playgroundUrl: stepCount > 0 ? 'https://playground.wordpress.net/#encoded' : undefined,
    onExportBlueprint: onExport,
    onOpenSaveModal: setSavePrefill,
    onOpenShareModal: setSharePrefill,
  });

  return (
    <div>
      <span data-testid="save-modal">{savePrefill ? `${savePrefill.title}|${String(savePrefill.isPublic)}` : 'closed'}</span>
      <span data-testid="share-modal">{sharePrefill ? `${sharePrefill.title}|${sharePrefill.description}` : 'closed'}</span>
    </div>
  );
}

describe('usePublishShareWebMCP (Goal 3)', () => {
  let registerToolMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    registerToolMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      writable: true,
      value: { registerTool: registerToolMock },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    delete (document as { modelContext?: unknown }).modelContext;
  });

  function getTool(name: string) {
    const calls = registerToolMock.mock.calls as RegisteredCall[];
    const match = calls.find(([tool]) => tool.name === name);
    if (!match) throw new Error(`Tool "${name}" was not registered`);
    return match;
  }

  it('state-gates action tools when empty and registers compliant annotations when steps exist', () => {
    render(<TestHarness stepCount={0} />);
    expect(registerToolMock).toHaveBeenCalledTimes(1);
    expect(getTool('preview_blueprint_json')[0].annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    });

    cleanup();
    registerToolMock.mockClear();

    render(<TestHarness stepCount={3} />);
    expect(registerToolMock).toHaveBeenCalledTimes(5);
    expect(getTool('export_blueprint_json')[0].annotations).toBeUndefined();
    expect(getTool('launch_playground')[0].annotations).toEqual({ consequentialHint: true });
    expect(getTool('initiate_save_blueprint')[0].annotations).toBeUndefined();
    expect(getTool('initiate_share_playground')[0].annotations).toBeUndefined();
  });

  it('paginates large blueprint JSON with continuation signal under 1,500 chars', async () => {
    render(<TestHarness stepCount={12} />);
    const [previewTool] = getTool('preview_blueprint_json');
    const { signal } = new AbortController();

    const first = await previewTool.execute({ offset: 0, limit: 800 }, { signal });
    expect(first.isError).toBeFalsy();
    expect(first.content[0].text.length).toBeLessThanOrEqual(1500);

    const parsed = JSON.parse(first.content[0].text);
    expect(parsed.truncated).toBe(true);
    expect(parsed.next_offset).toBe(800);
    expect(parsed.total_chars).toBeGreaterThan(800);
  });

  it('opens pre-filled Save and Share modals as human-in-the-loop hand-offs', async () => {
    const { getByTestId } = render(<TestHarness stepCount={3} />);
    const { signal } = new AbortController();

    const [saveTool] = getTool('initiate_save_blueprint');
    const saveRes = await saveTool.execute(
      { title: 'Bakery Demo', description: 'Private starter', is_public: false },
      { signal },
    );
    expect(saveRes.isError).toBeFalsy();
    expect(JSON.parse(saveRes.content[0].text).status).toBe('requires_user_action');
    expect(getByTestId('save-modal').textContent).toBe('Bakery Demo|false');

    const [shareTool] = getTool('initiate_share_playground');
    const shareRes = await shareTool.execute(
      { title: 'Client Review', description: 'Review link' },
      { signal },
    );
    expect(shareRes.isError).toBeFalsy();
    expect(JSON.parse(shareRes.content[0].text).status).toBe('requires_user_action');
    expect(getByTestId('share-modal').textContent).toBe('Client Review|Review link');
  });

  it('exports JSON and handles launch_playground success and popup-blocked errors', async () => {
    const onExport = vi.fn();
    render(<TestHarness stepCount={3} onExport={onExport} />);
    const { signal } = new AbortController();

    const [exportTool] = getTool('export_blueprint_json');
    const exportRes = await exportTool.execute({}, { signal });
    expect(exportRes.isError).toBeFalsy();
    expect(onExport).toHaveBeenCalledTimes(1);

    const [launchTool] = getTool('launch_playground');
    vi.spyOn(window, 'open').mockReturnValueOnce(null);
    const blocked = await launchTool.execute({}, { signal });
    expect(blocked.isError).toBe(true);
    expect(blocked.content[0].text).toContain('initiate_share_playground');

    vi.spyOn(window, 'open').mockReturnValueOnce({} as Window);
    const ok = await launchTool.execute({}, { signal });
    expect(ok.isError).toBeFalsy();
    expect(JSON.parse(ok.content[0].text).status).toBe('launched');
  });
});
