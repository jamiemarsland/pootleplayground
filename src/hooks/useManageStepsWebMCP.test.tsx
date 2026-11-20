import { useState } from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useManageStepsWebMCP } from './useManageStepsWebMCP';
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

const SAMPLE_STEPS: Step[] = [
  { id: 'addPage-1', type: 'addPage', data: { postTitle: 'Home', postContent: '' } },
  { id: 'addPage-2', type: 'addPage', data: { postTitle: 'About', postContent: '' } },
  { id: 'setHomepage-3', type: 'setHomepage', data: { option: 'existing', stepId: 'addPage-1' } },
  {
    id: 'installPlugin-4',
    type: 'installPlugin',
    data: { pluginZipFile: { resource: 'wordpress.org/plugins', 'wordpress.org/plugins': 'woocommerce' }, options: { activate: true } },
  },
];

function TestHarness({ initialSteps = SAMPLE_STEPS }: { initialSteps?: Step[] }) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [selectedStep, setSelectedStep] = useState<Step | null>(initialSteps[0] ?? null);

  const handleReset = () => {
    setSteps([]);
    setSelectedStep(null);
  };

  useManageStepsWebMCP({
    steps,
    selectedStep,
    onStepsChange: setSteps,
    onSelectStep: setSelectedStep,
    onReset: handleReset,
  });

  return (
    <div>
      <span data-testid="step-order">{steps.map((s) => s.id).join(',')}</span>
      <span data-testid="selected-id">{selectedStep?.id ?? 'none'}</span>
      <span data-testid="second-title">{steps[1]?.data?.postTitle ?? ''}</span>
    </div>
  );
}

describe('useManageStepsWebMCP (Goal 2)', () => {
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

  it('registers state-gated tools with compliant annotations', () => {
    render(<TestHarness initialSteps={[]} />);
    expect(registerToolMock).toHaveBeenCalledTimes(1);
    expect(getTool('list_blueprint_steps')[0].annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    });

    cleanup();
    registerToolMock.mockClear();

    render(<TestHarness initialSteps={SAMPLE_STEPS} />);
    expect(registerToolMock).toHaveBeenCalledTimes(5);
    expect(getTool('get_blueprint_step')[0].annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    });
    expect(getTool('update_blueprint_step')[0].annotations).toBeUndefined();
    expect(getTool('reorder_blueprint_steps')[0].annotations).toBeUndefined();
    expect(getTool('remove_blueprint_steps')[0].annotations).toEqual({ consequentialHint: true });
  });

  it('lists steps with dependents, updates by title, and reorders with dependency warnings', async () => {
    const { getByTestId } = render(<TestHarness />);
    const { signal } = new AbortController();

    const [listTool] = getTool('list_blueprint_steps');
    const listed = await listTool.execute({}, { signal });
    const listData = JSON.parse(listed.content[0].text);
    expect(listData.steps[0].dependents).toEqual(['setHomepage-3']);

    const [updateTool] = getTool('update_blueprint_step');
    const updated = await updateTool.execute(
      { title: 'About', updates: { postTitle: 'Our Story' } },
      { signal },
    );
    expect(updated.isError).toBeFalsy();
    expect(getByTestId('second-title').textContent).toBe('Our Story');
    expect(getByTestId('selected-id').textContent).toBe('addPage-2');

    const [reorderTool] = getTool('reorder_blueprint_steps');
    const moved = await reorderTool.execute({ step_id: 'setHomepage-3', to_index: 1 }, { signal });
    expect(moved.isError).toBeFalsy();
    const moveData = JSON.parse(moved.content[0].text);
    expect(moveData.warnings.length).toBeGreaterThan(0);
    expect(getByTestId('step-order').textContent).toBe('setHomepage-3,addPage-1,addPage-2,installPlugin-4');
  });

  it('guards deleting referenced pages unless force is true and supports reset_all', async () => {
    const { getByTestId } = render(<TestHarness />);
    const { signal } = new AbortController();
    const [removeTool] = getTool('remove_blueprint_steps');

    const blocked = await removeTool.execute({ step_ids: ['addPage-1'] }, { signal });
    expect(blocked.isError).toBe(true);
    expect(blocked.content[0].text).toContain('setHomepage-3');

    const forced = await removeTool.execute({ step_ids: ['addPage-1'], force: true }, { signal });
    expect(forced.isError).toBeFalsy();
    expect(getByTestId('step-order').textContent).toBe('addPage-2,setHomepage-3,installPlugin-4');

    const reset = await removeTool.execute({ reset_all: true }, { signal });
    expect(reset.isError).toBeFalsy();
    expect(getByTestId('step-order').textContent).toBe('');
    expect(getByTestId('selected-id').textContent).toBe('none');
  });
});
