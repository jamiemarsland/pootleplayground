import { flushSync } from 'react-dom';
import { useWebMCP } from 'use-webmcp-tool';
import type { Blueprint } from '../types/blueprint';

const MAX_OUTPUT_CHARS = 1500;

const PREVIEW_ANNOTATIONS = {
  readOnlyHint: true,
  untrustedContentHint: true,
} as const;

const LAUNCH_ANNOTATIONS = {
  consequentialHint: true,
} as const;

const PREVIEW_SCHEMA = {
  type: 'object',
  properties: {
    offset: {
      type: 'integer',
      minimum: 0,
      description: 'Character offset in the formatted blueprint JSON to start reading from (defaults to 0).',
    },
    limit: {
      type: 'integer',
      minimum: 100,
      maximum: 1200,
      description: 'Maximum JSON characters to return in this slice (defaults to 1000).',
    },
  },
} as const;

const EMPTY_SCHEMA = {
  type: 'object',
  properties: {},
} as const;

const INITIATE_SAVE_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'Optional title to pre-fill in the Save Blueprint dialog (defaults to current site title).',
    },
    description: {
      type: 'string',
      description: 'Optional summary describing what the blueprint includes.',
    },
    is_public: {
      type: 'boolean',
      description: 'Whether to pre-toggle Share Publicly in the gallery dialog (user confirms before saving).',
    },
  },
} as const;

const INITIATE_SHARE_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'Optional title to pre-fill for the shared Playground link.',
    },
    description: {
      type: 'string',
      description: 'Optional description to pre-fill for the shared Playground link.',
    },
  },
} as const;

export interface SaveDialogPrefill {
  title?: string;
  description?: string;
  isPublic?: boolean;
}

export interface ShareDialogPrefill {
  title?: string;
  description?: string;
}

export interface PublishShareWebMCPParams {
  blueprint: Blueprint;
  blueprintTitle: string;
  stepCount: number;
  playgroundUrl?: string;
  onExportBlueprint: () => void;
  onOpenSaveModal: (prefill: SaveDialogPrefill) => void;
  onOpenShareModal: (prefill: ShareDialogPrefill) => void;
}

interface PreviewArgs {
  offset?: number;
  limit?: number;
}

interface InitiateSaveArgs {
  title?: string;
  description?: string;
  is_public?: boolean;
}

interface InitiateShareArgs {
  title?: string;
  description?: string;
}

function fitBudget(payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload);
  if (serialized.length <= MAX_OUTPUT_CHARS) return serialized;
  return `${serialized.slice(0, MAX_OUTPUT_CHARS - 20)}... [truncated]`;
}

export function usePublishShareWebMCP({
  blueprint,
  blueprintTitle,
  stepCount,
  playgroundUrl,
  onExportBlueprint,
  onOpenSaveModal,
  onOpenShareModal,
}: PublishShareWebMCPParams): void {
  const hasSteps = stepCount > 0;

  useWebMCP<PreviewArgs, Record<string, unknown>>({
    name: 'preview_blueprint_json',
    description:
      'Returns a paginated slice of the generated WordPress Playground blueprint JSON along with total step count and byte length. Use when inspecting or validating the generated JSON before exporting, launching, or sharing.',
    inputSchema: PREVIEW_SCHEMA,
    annotations: PREVIEW_ANNOTATIONS,
    execute: ({ offset = 0, limit = 1000 } = {}, { signal }) => {
      if (signal.aborted) {
        throw new Error('Blueprint preview was cancelled.');
      }
      const formatted = JSON.stringify(blueprint, null, 2);
      const safeLimit = Math.min(1000, Math.max(100, Math.floor(limit)));
      const safeOffset = Math.min(formatted.length, Math.max(0, Math.floor(offset)));
      const slice = formatted.slice(safeOffset, safeOffset + safeLimit);
      const nextOffset = safeOffset + slice.length < formatted.length ? safeOffset + slice.length : null;

      return {
        total_chars: formatted.length,
        offset: safeOffset,
        limit: safeLimit,
        next_offset: nextOffset,
        truncated: nextOffset !== null,
        step_count: stepCount,
        landing_page: blueprint.landingPage,
        json_slice: slice,
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<Record<string, never>, Record<string, unknown>>({
    name: 'export_blueprint_json',
    description:
      'Triggers a browser download of the current blueprint as a formatted JSON file. Use when the user asks to download or export their blueprint.json locally.',
    enabled: hasSteps,
    inputSchema: EMPTY_SCHEMA,
    execute: (_args, { signal }) => {
      if (signal.aborted) {
        throw new Error('Blueprint export was cancelled.');
      }
      if (!hasSteps) {
        throw new Error('Add at least one step to the blueprint before exporting blueprint.json.');
      }
      onExportBlueprint();
      const filename = `${blueprintTitle.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`;
      const byteLength = new TextEncoder().encode(JSON.stringify(blueprint, null, 2)).length;
      return {
        status: 'downloaded',
        filename,
        bytes: byteLength,
        step_count: stepCount,
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<Record<string, never>, Record<string, unknown>>({
    name: 'launch_playground',
    description:
      'Opens the generated blueprint in WordPress Playground in a new browser tab. Use when the user asks to launch, test, or run their configured blueprint live.',
    enabled: hasSteps,
    inputSchema: EMPTY_SCHEMA,
    annotations: LAUNCH_ANNOTATIONS,
    execute: (_args, { signal }) => {
      if (signal.aborted) {
        throw new Error('Launching WordPress Playground was cancelled.');
      }
      if (!hasSteps || !playgroundUrl) {
        throw new Error('Add at least one step to the blueprint before launching WordPress Playground.');
      }
      const opened = window.open(playgroundUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        throw new Error(
          'Browser blocked opening a new tab for WordPress Playground. Ask the user to allow popups, click Launch in the header, or use initiate_share_playground.',
        );
      }
      return {
        status: 'launched',
        step_count: stepCount,
        landing_page: blueprint.landingPage,
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<InitiateSaveArgs, Record<string, unknown>>({
    name: 'initiate_save_blueprint',
    description:
      'Opens the Save Blueprint dialog pre-filled with optional title, description, and visibility so the user can review and confirm saving to the gallery. Use when the user wants to save or publish their blueprint.',
    enabled: hasSteps,
    inputSchema: INITIATE_SAVE_SCHEMA,
    execute: ({ title, description, is_public } = {}, { signal }) => {
      if (signal.aborted) {
        throw new Error('Opening Save Blueprint dialog was cancelled.');
      }
      if (!hasSteps) {
        throw new Error('Add at least one step to the blueprint before saving to the gallery.');
      }

      const prefill: SaveDialogPrefill = {
        title: title?.trim() || blueprintTitle,
        description: description?.trim() ?? '',
        isPublic: is_public ?? true,
      };

      flushSync(() => {
        onOpenSaveModal(prefill);
      });

      return {
        status: 'requires_user_action',
        modal: 'save_blueprint',
        prefilled: {
          title: prefill.title,
          description: prefill.description,
          is_public: prefill.isPublic,
        },
        message: 'Save Blueprint dialog is open. Ask the user to review visibility and click Save Blueprint.',
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<InitiateShareArgs, Record<string, unknown>>({
    name: 'initiate_share_playground',
    description:
      'Opens the Share Playground dialog pre-filled with the current blueprint URL and optional title or description so the user can review and create a short link. Use when the user wants a shareable Playground link.',
    enabled: hasSteps,
    inputSchema: INITIATE_SHARE_SCHEMA,
    execute: ({ title, description } = {}, { signal }) => {
      if (signal.aborted) {
        throw new Error('Opening Share Playground dialog was cancelled.');
      }
      if (!hasSteps) {
        throw new Error('Add at least one step to the blueprint before creating a shared Playground link.');
      }

      const prefill: ShareDialogPrefill = {
        title: title?.trim() || blueprintTitle,
        description: description?.trim() ?? '',
      };

      flushSync(() => {
        onOpenShareModal(prefill);
      });

      return {
        status: 'requires_user_action',
        modal: 'share_playground',
        prefilled: {
          title: prefill.title,
          description: prefill.description,
        },
        message: 'Share Playground dialog is open with the current blueprint URL. Ask the user to click Create short link.',
      };
    },
    formatOutput: fitBudget,
  });
}
