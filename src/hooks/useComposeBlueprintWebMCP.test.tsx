import { useState } from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useComposeBlueprintWebMCP } from './useComposeBlueprintWebMCP';
import type { Step } from '../types/blueprint';

type RegisteredCall = [
  {
    name: string;
    description: string;
    annotations?: Record<string, boolean>;
    execute: (args: any, options: { signal: AbortSignal }) => Promise<any>;
  },
  { signal: AbortSignal },
];

function TestHarness({ initialSteps = [] }: { initialSteps?: Step[] }) {
  const [title, setTitle] = useState('My WordPress Site');
  const [phpVersion, setPhpVersion] = useState('8.2');
  const [wpVersion, setWpVersion] = useState('latest');
  const [landingPageType, setLandingPageType] = useState<'wp-admin' | 'front-page' | 'custom'>('wp-admin');
  const [customLandingUrl, setCustomLandingUrl] = useState('');
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  useComposeBlueprintWebMCP({
    blueprintTitle: title,
    phpVersion,
    wpVersion,
    landingPageType,
    customLandingUrl,
    steps,
    onTitleChange: setTitle,
    onPhpVersionChange: setPhpVersion,
    onWpVersionChange: setWpVersion,
    onLandingPageTypeChange: setLandingPageType,
    onCustomLandingUrlChange: setCustomLandingUrl,
    onStepsChange: setSteps,
    onSelectStep: setSelectedStep,
  });

  return (
    <div>
      <span data-testid="title">{title}</span>
      <span data-testid="php">{phpVersion}</span>
      <span data-testid="wp">{wpVersion}</span>
      <span data-testid="landing">{landingPageType}</span>
      <span data-testid="step-count">{steps.length}</span>
      <span data-testid="selected-type">{selectedStep?.type ?? 'none'}</span>
    </div>
  );
}

describe('useComposeBlueprintWebMCP (Goal 1)', () => {
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
    delete (document as { modelContext?: unknown }).modelContext;
  });

  function getTool(name: string) {
    const calls = registerToolMock.mock.calls as RegisteredCall[];
    const match = calls.find(([tool]) => tool.name === name);
    if (!match) throw new Error(`Tool "${name}" was not registered`);
    return match;
  }

  it('registers all Goal 1 tools with compliant names, annotations, and abort signals', () => {
    render(<TestHarness />);

    expect(registerToolMock).toHaveBeenCalledTimes(3);

    const [summaryTool, summaryOpts] = getTool('get_blueprint_summary');
    expect(summaryTool.annotations).toEqual({ readOnlyHint: true, untrustedContentHint: true });
    expect(summaryOpts.signal).toBeInstanceOf(AbortSignal);

    const [configureTool] = getTool('configure_blueprint');
    expect(configureTool.annotations).toBeUndefined();

    const [addStepsTool] = getTool('add_blueprint_steps');
    expect(addStepsTool.annotations).toBeUndefined();
  });

  it('updates blueprint metadata and runtime versions synchronously via configure_blueprint', async () => {
    const { getByTestId } = render(<TestHarness />);
    const [configureTool] = getTool('configure_blueprint');
    const { signal } = new AbortController();

    const result = await configureTool.execute(
      {
        site_title: 'Sweet Crumb Bakery',
        php_version: '8.3',
        wp_version: '6.8',
        landing_page_type: 'front-page',
      },
      { signal },
    );

    expect(result.isError).toBeFalsy();
    expect(getByTestId('title').textContent).toBe('Sweet Crumb Bakery');
    expect(getByTestId('php').textContent).toBe('8.3');
    expect(getByTestId('wp').textContent).toBe('6.8');
    expect(getByTestId('landing').textContent).toBe('front-page');
  });

  it('batch-adds steps and resolves page titles across the same batch for homepage and navigation menu', async () => {
    const { getByTestId } = render(<TestHarness />);
    const [addStepsTool] = getTool('add_blueprint_steps');
    const { signal } = new AbortController();

    const result = await addStepsTool.execute(
      {
        steps: [
          { type: 'installTheme', config: { slug: 'ollie', activate: true } },
          { type: 'installPlugin', config: { url: 'https://wordpress.org/plugins/contact-form-7/' } },
          { type: 'addPage', config: { postTitle: 'Home' } },
          { type: 'addPage', config: { postTitle: 'Contact' } },
          { type: 'setHomepage', config: { option: 'existing', pageTitle: 'Home' } },
          {
            type: 'createNavigationMenu',
            config: {
              menuName: 'Main Menu',
              menuLocation: 'primary',
              menuItems: [
                { type: 'page', pageTitle: 'Home' },
                { type: 'page', pageTitle: 'Contact' },
              ],
            },
          },
        ],
      },
      { signal },
    );

    expect(result.isError).toBeFalsy();
    expect(result.content[0].text.length).toBeLessThanOrEqual(1500);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.added_count).toBe(6);
    expect(parsed.total_steps).toBe(6);
    expect(parsed.added_steps[1].summary).toBe('contact-form-7');
    expect(getByTestId('step-count').textContent).toBe('6');
    expect(getByTestId('selected-type').textContent).toBe('createNavigationMenu');
  });

  it('returns actionable isError responses on missing page reference or unsupported PHP version', async () => {
    render(<TestHarness />);
    const [addStepsTool] = getTool('add_blueprint_steps');
    const [configureTool] = getTool('configure_blueprint');
    const { signal } = new AbortController();

    const missingPage = await addStepsTool.execute(
      { steps: [{ type: 'setHomepage', config: { option: 'existing', pageTitle: 'Pricing' } }] },
      { signal },
    );
    expect(missingPage.isError).toBe(true);
    expect(missingPage.content[0].text).toContain('Pricing');
    expect(missingPage.content[0].text).toContain('option: "create"');

    const badPhp = await configureTool.execute({ php_version: '8.4' }, { signal });
    expect(badPhp.isError).toBe(true);
    expect(badPhp.content[0].text).toContain('Unsupported php_version');
  });

  it('paginates get_blueprint_summary within the 1,500 character budget', async () => {
    const manySteps: Step[] = Array.from({ length: 15 }, (_, i) => ({
      id: `addPage-${i + 1}`,
      type: 'addPage',
      data: { postTitle: `Page ${i + 1}` },
    }));
    render(<TestHarness initialSteps={manySteps} />);

    const [summaryTool] = getTool('get_blueprint_summary');
    const { signal } = new AbortController();

    const page2 = await summaryTool.execute({ page: 2, page_size: 10 }, { signal });
    expect(page2.isError).toBeFalsy();
    expect(page2.content[0].text.length).toBeLessThanOrEqual(1500);

    const parsed = JSON.parse(page2.content[0].text);
    expect(parsed.total_count).toBe(15);
    expect(parsed.total_pages).toBe(2);
    expect(parsed.page).toBe(2);
    expect(parsed.steps).toHaveLength(5);
    expect(parsed.steps[0].index).toBe(11);
  });
});
