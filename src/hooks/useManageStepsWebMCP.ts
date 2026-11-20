import { flushSync } from 'react-dom';
import { useWebMCP } from 'use-webmcp-tool';
import type { Step, StepType } from '../types/blueprint';

const STEP_TYPES: StepType[] = [
  'addPage',
  'addPost',
  'addMedia',
  'installPlugin',
  'installTheme',
  'setHomepage',
  'setPostsPage',
  'createNavigationMenu',
  'setLandingPage',
  'guidedTour',
  'setSiteOption',
  'defineWpConfigConst',
  'login',
  'importWxr',
  'addClientRole',
];

const MAX_OUTPUT_CHARS = 1500;

const READ_UNTRUSTED_ANNOTATIONS = {
  readOnlyHint: true,
  untrustedContentHint: true,
} as const;

const CONSEQUENTIAL_ANNOTATIONS = {
  consequentialHint: true,
} as const;

const LIST_STEPS_SCHEMA = {
  type: 'object',
  properties: {
    types: {
      type: 'array',
      items: { type: 'string', enum: STEP_TYPES },
      description: 'Optional step types to filter by. Defaults to all step types.',
    },
    query: {
      type: 'string',
      description: 'Optional keyword to match against step titles, plugin/theme slugs, or menu names.',
    },
    page: {
      type: 'integer',
      minimum: 1,
      description: 'Page number for paginated results, starting at 1.',
    },
    page_size: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
      description: 'Maximum steps per page (1 to 12, defaults to 12).',
    },
  },
} as const;

const GET_STEP_SCHEMA = {
  type: 'object',
  properties: {
    step_id: {
      type: 'string',
      description: 'Exact step identifier returned by list_blueprint_steps.',
    },
    step_index: {
      type: 'integer',
      minimum: 1,
      description: '1-based position of the step in the blueprint sequence.',
    },
    title: {
      type: 'string',
      description: 'Page title, post title, menu name, or plugin/theme slug to locate.',
    },
  },
} as const;

const UPDATE_STEP_SCHEMA = {
  type: 'object',
  properties: {
    step_id: {
      type: 'string',
      description: 'Exact step identifier to update.',
    },
    step_index: {
      type: 'integer',
      minimum: 1,
      description: '1-based position of the step to update.',
    },
    title: {
      type: 'string',
      description: 'Title, menu name, or slug identifying the target step.',
    },
    updates: {
      type: 'object',
      description:
        'Fields to merge into the step configuration (e.g. postTitle, postContent, slug, activate, tourMode).',
    },
  },
  required: ['updates'],
} as const;

const REORDER_STEPS_SCHEMA = {
  type: 'object',
  properties: {
    step_id: {
      type: 'string',
      description: 'Exact step identifier to move.',
    },
    from_index: {
      type: 'integer',
      minimum: 1,
      description: 'Current 1-based position of the step to move.',
    },
    title: {
      type: 'string',
      description: 'Title, menu name, or plugin/theme slug of the step to move.',
    },
    to_index: {
      type: 'integer',
      minimum: 1,
      description: 'Target 1-based position in the blueprint sequence.',
    },
  },
  required: ['to_index'],
} as const;

const REMOVE_STEPS_SCHEMA = {
  type: 'object',
  properties: {
    step_ids: {
      type: 'array',
      items: { type: 'string' },
      description: 'Step identifiers to remove.',
    },
    step_indices: {
      type: 'array',
      items: { type: 'integer', minimum: 1 },
      description: '1-based positions of steps to remove.',
    },
    reset_all: {
      type: 'boolean',
      description: 'Set true to clear all steps and reset the blueprint to defaults.',
    },
    force: {
      type: 'boolean',
      description: 'Set true to proceed even when downstream steps reference a page being removed.',
    },
  },
} as const;

export interface ManageStepsWebMCPParams {
  steps: Step[];
  selectedStep: Step | null;
  onStepsChange: (steps: Step[]) => void;
  onSelectStep: (step: Step | null) => void;
  onReset: () => void;
}

interface ListStepsArgs {
  types?: StepType[];
  query?: string;
  page?: number;
  page_size?: number;
}

interface StepLookupArgs {
  step_id?: string;
  step_index?: number;
  title?: string;
}

interface UpdateStepArgs extends StepLookupArgs {
  updates: Record<string, unknown>;
}

interface ReorderStepArgs {
  step_id?: string;
  from_index?: number;
  title?: string;
  to_index: number;
}

interface RemoveStepsArgs {
  step_ids?: string[];
  step_indices?: number[];
  reset_all?: boolean;
  force?: boolean;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function fitBudget(payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload);
  if (serialized.length <= MAX_OUTPUT_CHARS) return serialized;
  return `${serialized.slice(0, MAX_OUTPUT_CHARS - 20)}... [truncated]`;
}

function summarizeStep(step: Step): string {
  const data = step.data ?? {};
  switch (step.type) {
    case 'addPage':
    case 'addPost':
      return truncate(String(data.postTitle || 'Untitled'), 48);
    case 'addMedia':
      return truncate(String(data.title || data.downloadUrl || 'Media item'), 48);
    case 'installPlugin': {
      const zip = data.pluginZipFile ?? {};
      return truncate(String(zip['wordpress.org/plugins'] || zip.url || 'Unconfigured plugin'), 48);
    }
    case 'installTheme': {
      const zip = data.themeZipFile ?? {};
      return truncate(String(zip['wordpress.org/themes'] || zip.url || 'Unconfigured theme'), 48);
    }
    case 'setHomepage':
    case 'setPostsPage':
      return data.option === 'existing'
        ? truncate(`Existing page (${data.stepId || 'unset'})`, 48)
        : truncate(`Create "${data.title || (step.type === 'setHomepage' ? 'Home' : 'Blog')}"`, 48);
    case 'createNavigationMenu': {
      const count = Array.isArray(data.menuItems) ? data.menuItems.length : 0;
      return truncate(`${data.menuName || 'Main Menu'} (${count} items)`, 48);
    }
    case 'setLandingPage':
      return truncate(String(data.customUrl || data.landingPageType || 'wp-admin'), 48);
    case 'guidedTour':
      return truncate(String(data.tourMode || 'none'), 48);
    case 'setSiteOption':
      return truncate(String(data.option || 'Unset option'), 48);
    case 'defineWpConfigConst':
      return `${Object.keys(data.consts || {}).length} constants`;
    case 'login':
      return truncate(String(data.username || 'admin'), 48);
    case 'importWxr':
      return truncate(String(data.file?.url || 'WXR file'), 48);
    case 'addClientRole':
      return truncate(String(data.name || 'Custom role'), 48);
    default:
      return step.type;
  }
}

function getReferencedStepIds(step: Step): string[] {
  const data = step.data ?? {};
  if ((step.type === 'setHomepage' || step.type === 'setPostsPage') && data.option === 'existing' && data.stepId) {
    return [String(data.stepId)];
  }
  if (step.type === 'createNavigationMenu' && Array.isArray(data.menuItems)) {
    return data.menuItems
      .filter((item: { type?: string; pageStepId?: string }) => item.type === 'page' && item.pageStepId)
      .map((item: { pageStepId: string }) => String(item.pageStepId));
  }
  return [];
}

function findDependentSteps(targetStepId: string, allSteps: Step[]): Step[] {
  return allSteps.filter((candidate) => getReferencedStepIds(candidate).includes(targetStepId));
}

function resolveStepIndex(steps: Step[], lookup: { step_id?: string; step_index?: number; title?: string }): number {
  if (lookup.step_id) {
    const idx = steps.findIndex((s) => s.id === lookup.step_id);
    if (idx === -1) {
      throw new Error(`No step found with id "${lookup.step_id}". Call list_blueprint_steps to inspect valid IDs.`);
    }
    return idx;
  }

  if (lookup.step_index !== undefined) {
    const idx = Math.floor(lookup.step_index) - 1;
    if (idx < 0 || idx >= steps.length) {
      throw new Error(
        `step_index ${lookup.step_index} is out of range. Choose a 1-based position between 1 and ${steps.length}.`,
      );
    }
    return idx;
  }

  if (lookup.title) {
    const q = lookup.title.trim().toLowerCase();
    const matches = steps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => summarizeStep(step).toLowerCase().includes(q));
    if (matches.length === 0) {
      throw new Error(`No step matched "${lookup.title}". Call list_blueprint_steps to see available steps.`);
    }
    if (matches.length > 1) {
      const choices = matches.map((m) => `#${m.index + 1} (${m.step.id}: ${summarizeStep(m.step)})`).join(', ');
      throw new Error(`Multiple steps matched "${lookup.title}": ${choices}. Specify step_id or step_index.`);
    }
    return matches[0].index;
  }

  throw new Error('Specify step_id, step_index (1-based), or title to identify the target step.');
}

function mergeStepUpdates(step: Step, updates: Record<string, unknown>): Step {
  const nextData = { ...(step.data ?? {}) };

  if (step.type === 'installPlugin') {
    const { slug, url, activate, ...rest } = updates;
    Object.assign(nextData, rest);
    if (typeof slug === 'string' && slug.trim()) {
      nextData.pluginZipFile = {
        resource: 'wordpress.org/plugins',
        'wordpress.org/plugins': slug.trim(),
      };
    } else if (typeof url === 'string' && url.trim()) {
      nextData.pluginZipFile = { resource: 'url', url: url.trim() };
    }
    if (typeof activate === 'boolean') {
      nextData.options = activate ? { ...(nextData.options ?? {}), activate: true } : {};
    }
    return { ...step, data: nextData };
  }

  if (step.type === 'installTheme') {
    const { slug, url, activate, ...rest } = updates;
    Object.assign(nextData, rest);
    if (typeof slug === 'string' && slug.trim()) {
      nextData.themeZipFile = {
        resource: 'wordpress.org/themes',
        'wordpress.org/themes': slug.trim(),
      };
    } else if (typeof url === 'string' && url.trim()) {
      nextData.themeZipFile = { resource: 'url', url: url.trim() };
    }
    if (typeof activate === 'boolean') {
      nextData.options = activate ? { ...(nextData.options ?? {}), activate: true } : {};
    }
    return { ...step, data: nextData };
  }

  Object.assign(nextData, updates);
  return { ...step, data: nextData };
}

function collectOrderWarnings(orderedSteps: Step[]): string[] {
  const indexById = new Map<string, number>();
  orderedSteps.forEach((step, idx) => indexById.set(step.id, idx));

  const warnings: string[] = [];
  orderedSteps.forEach((step, idx) => {
    for (const depId of getReferencedStepIds(step)) {
      const depIdx = indexById.get(depId);
      if (depIdx !== undefined && depIdx > idx) {
        const depStep = orderedSteps[depIdx];
        warnings.push(
          `Step #${idx + 1} (${step.type}) now runs before referenced page "${summarizeStep(depStep)}" at #${depIdx + 1}.`,
        );
      }
    }
  });
  return warnings;
}

export function useManageStepsWebMCP({
  steps,
  selectedStep,
  onStepsChange,
  onSelectStep,
  onReset,
}: ManageStepsWebMCPParams): void {
  const hasSteps = steps.length > 0;

  useWebMCP<ListStepsArgs, Record<string, unknown>>({
    name: 'list_blueprint_steps',
    description:
      "Lists configured blueprint steps in execution order with step IDs, types, summaries, and dependency references. Use when inspecting the sequence or resolving references like 'the second page' before editing, reordering, or removing steps.",
    inputSchema: LIST_STEPS_SCHEMA,
    annotations: READ_UNTRUSTED_ANNOTATIONS,
    execute: ({ types, query, page = 1, page_size = 12 } = {}, { signal }) => {
      if (signal.aborted) {
        throw new Error('Listing steps was cancelled.');
      }
      const typeFilter = Array.isArray(types) && types.length > 0 ? new Set(types) : null;
      const keyword = query?.trim().toLowerCase() ?? '';

      const filtered = steps
        .map((step, index) => ({ step, index }))
        .filter(({ step }) => {
          if (typeFilter && !typeFilter.has(step.type)) return false;
          if (keyword && !summarizeStep(step).toLowerCase().includes(keyword) && !step.type.toLowerCase().includes(keyword)) {
            return false;
          }
          return true;
        });

      const safePageSize = Math.min(12, Math.max(1, Math.floor(page_size)));
      const totalCount = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
      const safePage = Math.min(totalPages, Math.max(1, Math.floor(page)));
      const start = (safePage - 1) * safePageSize;

      return {
        page: safePage,
        page_size: safePageSize,
        total_count: totalCount,
        total_pages: totalPages,
        selected_step_id: selectedStep?.id ?? null,
        steps: filtered.slice(start, start + safePageSize).map(({ step, index }) => ({
          index: index + 1,
          id: step.id,
          type: step.type,
          summary: summarizeStep(step),
          dependents: findDependentSteps(step.id, steps).map((d) => d.id),
        })),
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<StepLookupArgs, Record<string, unknown>>({
    name: 'get_blueprint_step',
    description:
      'Reads full configuration details and downstream dependencies for a single blueprint step. Use when checking exact step fields or checking whether other steps depend on a page before modifying it.',
    enabled: hasSteps,
    inputSchema: GET_STEP_SCHEMA,
    annotations: READ_UNTRUSTED_ANNOTATIONS,
    execute: (args, { signal }) => {
      if (signal.aborted) {
        throw new Error('Reading step details was cancelled.');
      }
      const idx = resolveStepIndex(steps, args ?? {});
      const step = steps[idx];
      return {
        index: idx + 1,
        id: step.id,
        type: step.type,
        summary: summarizeStep(step),
        data: step.data,
        dependents: findDependentSteps(step.id, steps).map((d) => ({
          id: d.id,
          type: d.type,
          summary: summarizeStep(d),
        })),
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<UpdateStepArgs, Record<string, unknown>>({
    name: 'update_blueprint_step',
    description:
      "Updates configuration fields on an existing blueprint step and selects it in the editor panel. Use when refining a step's title, content, plugin/theme source, menu items, or tour settings.",
    enabled: hasSteps,
    inputSchema: UPDATE_STEP_SCHEMA,
    execute: (args, { signal }) => {
      if (signal.aborted) {
        throw new Error('Updating step was cancelled.');
      }
      const { updates, ...lookup } = args ?? {};
      if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
        throw new Error('Provide a non-empty updates object with the fields to modify.');
      }

      const idx = resolveStepIndex(steps, lookup);
      const updatedStep = mergeStepUpdates(steps[idx], updates);
      const nextSteps = steps.map((s, i) => (i === idx ? updatedStep : s));

      flushSync(() => {
        onStepsChange(nextSteps);
        onSelectStep(updatedStep);
      });

      return {
        status: 'updated',
        step_id: updatedStep.id,
        index: idx + 1,
        type: updatedStep.type,
        summary: summarizeStep(updatedStep),
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<ReorderStepArgs, Record<string, unknown>>({
    name: 'reorder_blueprint_steps',
    description:
      'Moves an existing blueprint step to a new 1-based position in the execution sequence. Use when fixing setup order so pages or plugins run before dependent steps.',
    enabled: hasSteps,
    inputSchema: REORDER_STEPS_SCHEMA,
    execute: ({ step_id, from_index, title, to_index }, { signal }) => {
      if (signal.aborted) {
        throw new Error('Reordering steps was cancelled.');
      }
      const fromIdx = resolveStepIndex(steps, { step_id, step_index: from_index, title });
      const targetIdx = Math.floor(to_index) - 1;
      if (Number.isNaN(targetIdx) || targetIdx < 0 || targetIdx >= steps.length) {
        throw new Error(
          `to_index ${to_index} is out of range. Choose a 1-based position between 1 and ${steps.length}.`,
        );
      }

      const reordered = [...steps];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(targetIdx, 0, moved);

      flushSync(() => {
        onStepsChange(reordered);
        onSelectStep(moved);
      });

      return {
        status: 'reordered',
        step_id: moved.id,
        type: moved.type,
        summary: summarizeStep(moved),
        from_index: fromIdx + 1,
        to_index: targetIdx + 1,
        warnings: collectOrderWarnings(reordered),
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<RemoveStepsArgs, Record<string, unknown>>({
    name: 'remove_blueprint_steps',
    description:
      'Removes one or more steps from the blueprint, or resets the entire blueprint when reset_all is true. Use when pruning unwanted steps or clearing the draft after user confirmation.',
    enabled: hasSteps,
    inputSchema: REMOVE_STEPS_SCHEMA,
    annotations: CONSEQUENTIAL_ANNOTATIONS,
    execute: ({ step_ids, step_indices, reset_all = false, force = false } = {}, { signal }) => {
      if (signal.aborted) {
        throw new Error('Removing steps was cancelled.');
      }

      if (reset_all) {
        const clearedCount = steps.length;
        flushSync(() => {
          onReset();
        });
        return {
          status: 'reset',
          removed_count: clearedCount,
          remaining_count: 0,
        };
      }

      const targetIds = new Set<string>();
      for (const id of step_ids ?? []) {
        if (!steps.some((s) => s.id === id)) {
          throw new Error(`No step found with id "${id}". Call list_blueprint_steps to check valid IDs.`);
        }
        targetIds.add(id);
      }
      for (const pos of step_indices ?? []) {
        const idx = Math.floor(pos) - 1;
        if (idx < 0 || idx >= steps.length) {
          throw new Error(
            `step_index ${pos} is out of range. Choose a 1-based position between 1 and ${steps.length}.`,
          );
        }
        targetIds.add(steps[idx].id);
      }

      if (targetIds.size === 0) {
        throw new Error('Specify step_ids, step_indices, or reset_all: true.');
      }

      if (!force) {
        const remainingSteps = steps.filter((s) => !targetIds.has(s.id));
        for (const id of targetIds) {
          const targetStep = steps.find((s) => s.id === id)!;
          const remainingDependents = findDependentSteps(id, remainingSteps);
          if (remainingDependents.length > 0) {
            const depList = remainingDependents.map((d) => `${d.id} (${d.type})`).join(', ');
            throw new Error(
              `Cannot remove step "${summarizeStep(targetStep)}" (${id}) because it is referenced by: ${depList}. Confirm with the user and retry with force: true, or include dependent steps in step_ids.`,
            );
          }
        }
      }

      const nextSteps = steps.filter((s) => !targetIds.has(s.id));
      const nextSelected =
        selectedStep && targetIds.has(selectedStep.id)
          ? nextSteps.length > 0
            ? nextSteps[nextSteps.length - 1]
            : null
          : selectedStep;

      flushSync(() => {
        onStepsChange(nextSteps);
        onSelectStep(nextSelected);
      });

      return {
        status: 'removed',
        removed_ids: Array.from(targetIds),
        removed_count: targetIds.size,
        remaining_count: nextSteps.length,
      };
    },
    formatOutput: fitBudget,
  });
}
