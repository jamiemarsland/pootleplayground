import { flushSync } from 'react-dom';
import { useWebMCP } from 'use-webmcp-tool';
import type { Step, StepType } from '../types/blueprint';

const PHP_VERSIONS = ['7.4', '8.0', '8.1', '8.2', '8.3'] as const;
const WP_VERSIONS = ['latest', '7.0', '6.9', '6.8', '6.7', '6.6', '6.5', '6.4', '6.3', '6.2'] as const;
const LANDING_PAGE_TYPES = ['wp-admin', 'front-page', 'custom'] as const;
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

const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    page: {
      type: 'integer',
      minimum: 1,
      description: 'Page number for paginated step results, starting at 1.',
    },
    page_size: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
      description: 'Maximum steps to return per page (1 to 12, defaults to 12).',
    },
  },
} as const;

const SUMMARY_ANNOTATIONS = {
  readOnlyHint: true,
  untrustedContentHint: true,
} as const;

const CONFIGURE_SCHEMA = {
  type: 'object',
  properties: {
    site_title: {
      type: 'string',
      description: 'WordPress site title displayed in the builder and applied as blogname.',
    },
    php_version: {
      type: 'string',
      enum: [...PHP_VERSIONS],
      description: 'Target PHP runtime version for the WordPress Playground.',
    },
    wp_version: {
      type: 'string',
      enum: [...WP_VERSIONS],
      description: 'Target WordPress core version.',
    },
    landing_page_type: {
      type: 'string',
      enum: [...LANDING_PAGE_TYPES],
      description: 'Initial view opened when the Playground launches.',
    },
    custom_landing_url: {
      type: 'string',
      description: 'Relative WordPress path (e.g. /about) used when landing_page_type is custom.',
    },
  },
} as const;

const ADD_STEPS_SCHEMA = {
  type: 'object',
  properties: {
    steps: {
      type: 'array',
      minItems: 1,
      description: 'Ordered list of WordPress setup steps to append to the blueprint.',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: STEP_TYPES,
            description: 'Kind of WordPress setup step to append.',
          },
          config: {
            type: 'object',
            description:
              'Step fields matching the type (e.g. postTitle, slug or url, pageTitle, menuName, menuItems, tourMode).',
          },
        },
        required: ['type', 'config'],
      },
    },
  },
  required: ['steps'],
} as const;

export interface ComposeBlueprintWebMCPParams {
  blueprintTitle: string;
  phpVersion: string;
  wpVersion: string;
  landingPageType: 'wp-admin' | 'front-page' | 'custom';
  customLandingUrl: string;
  steps: Step[];
  onTitleChange: (title: string) => void;
  onPhpVersionChange: (version: string) => void;
  onWpVersionChange: (version: string) => void;
  onLandingPageTypeChange: (type: 'wp-admin' | 'front-page' | 'custom') => void;
  onCustomLandingUrlChange: (url: string) => void;
  onStepsChange: (steps: Step[]) => void;
  onSelectStep: (step: Step | null) => void;
}

interface SummaryArgs {
  page?: number;
  page_size?: number;
}

interface ConfigureArgs {
  site_title?: string;
  php_version?: string;
  wp_version?: string;
  landing_page_type?: 'wp-admin' | 'front-page' | 'custom';
  custom_landing_url?: string;
}

interface AddStepInput {
  type: StepType;
  config: Record<string, unknown>;
}

interface AddStepsArgs {
  steps: AddStepInput[];
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function summarizeStep(step: Step): string {
  const data = step.data ?? {};
  switch (step.type) {
    case 'addPage':
    case 'addPost':
      return truncate(String(data.postTitle || 'Untitled'), 48);
    case 'addMedia':
      return truncate(String(data.title || data.downloadUrl || 'Media item'), 48);
    case 'installPlugin': {
      const zip = data.pluginZipFile ?? {};
      const target = zip['wordpress.org/plugins'] || zip.url || 'Unconfigured plugin';
      return truncate(String(target), 48);
    }
    case 'installTheme': {
      const zip = data.themeZipFile ?? {};
      const target = zip['wordpress.org/themes'] || zip.url || 'Unconfigured theme';
      return truncate(String(target), 48);
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
      return truncate(
        data.landingPageType === 'custom'
          ? String(data.customUrl || 'custom')
          : String(data.landingPageType || 'wp-admin'),
        48,
      );
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

function findPageStepByTitleOrId(allSteps: Step[], pageTitle?: string, stepId?: string): Step | undefined {
  if (stepId) {
    return allSteps.find((s) => s.type === 'addPage' && s.id === stepId);
  }
  if (!pageTitle) return undefined;
  const normalized = pageTitle.trim().toLowerCase();
  return allSteps.find(
    (s) => s.type === 'addPage' && String(s.data?.postTitle || '').trim().toLowerCase() === normalized,
  );
}

function normalizeStepConfig(
  input: AddStepInput,
  existingSteps: Step[],
  sequence: number,
): Step {
  if (!STEP_TYPES.includes(input.type)) {
    throw new Error(
      `Unsupported step type "${String(input.type)}". Choose one of: ${STEP_TYPES.join(', ')}.`,
    );
  }

  const cfg = input.config && typeof input.config === 'object' ? input.config : {};
  const id = `${input.type}-${Date.now()}-${sequence}`;

  switch (input.type) {
    case 'addPage': {
      const postTitle = String(cfg.postTitle ?? cfg.title ?? '').trim();
      if (!postTitle) {
        throw new Error('addPage requires a non-empty postTitle. Ask the user for the page title.');
      }
      return {
        id,
        type: 'addPage',
        data: {
          postTitle,
          postContent: String(cfg.postContent ?? cfg.content ?? ''),
          postStatus: String(cfg.postStatus ?? 'publish'),
          postName: String(cfg.postName ?? cfg.slug ?? ''),
          postParent: cfg.postParent ?? '',
          template: String(cfg.template ?? ''),
          menuOrder: cfg.menuOrder ?? '',
        },
      };
    }

    case 'addPost': {
      const postTitle = String(cfg.postTitle ?? cfg.title ?? '').trim();
      if (!postTitle) {
        throw new Error('addPost requires a non-empty postTitle. Ask the user for the post title.');
      }
      return {
        id,
        type: 'addPost',
        data: {
          postTitle,
          postContent: String(cfg.postContent ?? cfg.content ?? ''),
          postType: String(cfg.postType ?? 'post'),
          postStatus: String(cfg.postStatus ?? 'publish'),
          postDate: String(cfg.postDate ?? 'now'),
          featuredImageUrl: String(cfg.featuredImageUrl ?? ''),
          ...(cfg.postAuthor !== undefined ? { postAuthor: cfg.postAuthor } : {}),
        },
      };
    }

    case 'addMedia': {
      const downloadUrl = String(cfg.downloadUrl ?? cfg.url ?? '').trim();
      if (!downloadUrl || !isValidHttpUrl(downloadUrl)) {
        throw new Error(
          'addMedia requires a valid http(s) downloadUrl. Ask the user for the media file URL.',
        );
      }
      return {
        id,
        type: 'addMedia',
        data: {
          downloadUrl,
          title: String(cfg.title ?? ''),
          altText: String(cfg.altText ?? ''),
          caption: String(cfg.caption ?? ''),
          description: String(cfg.description ?? ''),
        },
      };
    }

    case 'installPlugin': {
      const rawSlug = String(cfg.slug ?? cfg.pluginSlug ?? '').trim();
      const rawUrl = String(cfg.url ?? '').trim();
      const wpOrgMatch = rawUrl.match(/^https?:\/\/wordpress\.org\/plugins\/([^/]+)\/?$/);

      if (!rawSlug && !rawUrl) {
        throw new Error(
          'installPlugin requires either a WordPress.org slug or a direct https:// ZIP url. Ask the user which plugin to install.',
        );
      }
      if (rawUrl && !wpOrgMatch && !isValidHttpUrl(rawUrl)) {
        throw new Error(`installPlugin received an invalid url "${rawUrl}". Provide an https:// ZIP URL or a WordPress.org slug.`);
      }

      const resolvedSlug = rawSlug || wpOrgMatch?.[1] || '';
      const activate = cfg.activate !== false;
      return {
        id,
        type: 'installPlugin',
        data: {
          pluginZipFile: resolvedSlug
            ? { resource: 'wordpress.org/plugins', 'wordpress.org/plugins': resolvedSlug }
            : { resource: 'url', url: rawUrl },
          options: activate ? { activate: true } : {},
        },
      };
    }

    case 'installTheme': {
      const rawSlug = String(cfg.slug ?? cfg.themeSlug ?? '').trim();
      const rawUrl = String(cfg.url ?? '').trim();
      const wpOrgMatch = rawUrl.match(/^https?:\/\/wordpress\.org\/themes\/([^/]+)\/?$/);

      if (!rawSlug && !rawUrl) {
        throw new Error(
          'installTheme requires either a WordPress.org slug or a direct https:// ZIP url. Ask the user which theme to install.',
        );
      }
      if (rawUrl && !wpOrgMatch && !isValidHttpUrl(rawUrl)) {
        throw new Error(`installTheme received an invalid url "${rawUrl}". Provide an https:// ZIP URL or a WordPress.org slug.`);
      }

      const resolvedSlug = rawSlug || wpOrgMatch?.[1] || '';
      const activate = cfg.activate !== false;
      return {
        id,
        type: 'installTheme',
        data: {
          themeZipFile: resolvedSlug
            ? { resource: 'wordpress.org/themes', 'wordpress.org/themes': resolvedSlug }
            : { resource: 'url', url: rawUrl },
          options: activate ? { activate: true } : {},
        },
      };
    }

    case 'setHomepage':
    case 'setPostsPage': {
      const option = cfg.option === 'existing' ? 'existing' : 'create';
      if (option === 'existing') {
        const pageTitle = cfg.pageTitle ? String(cfg.pageTitle) : undefined;
        const stepId = cfg.stepId ? String(cfg.stepId) : undefined;
        const matched = findPageStepByTitleOrId(existingSteps, pageTitle, stepId);
        if (!matched) {
          const available = existingSteps
            .filter((s) => s.type === 'addPage' && s.data?.postTitle)
            .map((s) => String(s.data.postTitle));
          const hint = available.length > 0
            ? `Available pages: ${available.join(', ')}.`
            : 'No addPage steps exist yet.';
          throw new Error(
            `No addPage step matching "${pageTitle || stepId || ''}" was found. ${hint} Add the page first or pass option: "create".`,
          );
        }
        return {
          id,
          type: input.type,
          data: { option: 'existing', stepId: matched.id },
        };
      }
      const fallbackTitle = input.type === 'setHomepage' ? 'Home' : 'Blog';
      return {
        id,
        type: input.type,
        data: {
          option: 'create',
          title: String(cfg.title ?? cfg.pageTitle ?? fallbackTitle),
          content: String(cfg.content ?? ''),
        },
      };
    }

    case 'createNavigationMenu': {
      const rawItems = Array.isArray(cfg.menuItems) ? cfg.menuItems : [];
      const menuItems = rawItems.map((rawItem: unknown, idx: number) => {
        const item = (rawItem && typeof rawItem === 'object' ? rawItem : {}) as Record<string, unknown>;
        if (item.type === 'custom') {
          const itemUrl = String(item.url ?? '').trim();
          const itemTitle = String(item.title ?? '').trim();
          if (!itemTitle || !itemUrl) {
            throw new Error(`Custom menu item at index ${idx} requires both title and url.`);
          }
          return {
            id: `menu-item-${Date.now()}-${sequence}-${idx}`,
            type: 'custom',
            title: itemTitle,
            url: itemUrl,
          };
        }
        const pageTitle = item.pageTitle ? String(item.pageTitle) : item.title ? String(item.title) : undefined;
        const pageStepId = item.pageStepId ? String(item.pageStepId) : undefined;
        const matched = findPageStepByTitleOrId(existingSteps, pageTitle, pageStepId);
        if (!matched) {
          const available = existingSteps
            .filter((s) => s.type === 'addPage' && s.data?.postTitle)
            .map((s) => String(s.data.postTitle));
          throw new Error(
            `Menu item "${pageTitle || pageStepId || idx}" does not match any addPage step. Available pages: ${available.join(', ') || 'none'}.`,
          );
        }
        return {
          id: `menu-item-${Date.now()}-${sequence}-${idx}`,
          type: 'page',
          pageStepId: matched.id,
          title: String(matched.data.postTitle),
        };
      });

      return {
        id,
        type: 'createNavigationMenu',
        data: {
          menuName: String(cfg.menuName ?? 'Main Menu'),
          menuLocation: String(cfg.menuLocation ?? 'primary'),
          menuItems,
        },
      };
    }

    case 'setLandingPage': {
      const landingType = String(cfg.landingPageType ?? 'wp-admin');
      if (!LANDING_PAGE_TYPES.includes(landingType as (typeof LANDING_PAGE_TYPES)[number])) {
        throw new Error(`Invalid landingPageType "${landingType}". Choose one of: ${LANDING_PAGE_TYPES.join(', ')}.`);
      }
      const customUrl = String(cfg.customUrl ?? '').trim();
      if (landingType === 'custom' && !customUrl) {
        throw new Error('setLandingPage requires customUrl when landingPageType is "custom".');
      }
      return {
        id,
        type: 'setLandingPage',
        data: { landingPageType: landingType, ...(customUrl ? { customUrl } : {}) },
      };
    }

    case 'guidedTour': {
      const tourMode = String(cfg.tourMode ?? 'quick');
      if (!['none', 'quick', 'quickstart', 'custom'].includes(tourMode)) {
        throw new Error(`Invalid tourMode "${tourMode}". Choose one of: none, quick, quickstart, custom.`);
      }
      return {
        id,
        type: 'guidedTour',
        data: {
          tourMode,
          tourSteps: Array.isArray(cfg.tourSteps) ? cfg.tourSteps : [],
        },
      };
    }

    case 'setSiteOption': {
      const option = String(cfg.option ?? '').trim();
      if (!option) {
        throw new Error('setSiteOption requires a non-empty option name (e.g. "blogdescription").');
      }
      return {
        id,
        type: 'setSiteOption',
        data: { option, value: cfg.value ?? '' },
      };
    }

    case 'defineWpConfigConst': {
      const consts = cfg.consts && typeof cfg.consts === 'object' ? cfg.consts : {};
      if (Object.keys(consts).length === 0) {
        throw new Error('defineWpConfigConst requires at least one constant in consts (e.g. { WP_DEBUG: true }).');
      }
      return {
        id,
        type: 'defineWpConfigConst',
        data: { consts },
      };
    }

    case 'login':
      return {
        id,
        type: 'login',
        data: {
          username: String(cfg.username ?? 'admin'),
          password: String(cfg.password ?? 'password'),
        },
      };

    case 'importWxr': {
      const url = String(cfg.url ?? '').trim();
      if (!url || !isValidHttpUrl(url)) {
        throw new Error('importWxr requires a valid http(s) url pointing to a .xml WXR export file.');
      }
      return {
        id,
        type: 'importWxr',
        data: { file: { resource: 'url', url } },
      };
    }

    case 'addClientRole': {
      const name = String(cfg.name ?? '').trim();
      const capabilities = Array.isArray(cfg.capabilities) ? cfg.capabilities.map(String) : [];
      if (!name || capabilities.length === 0) {
        throw new Error('addClientRole requires a role name and at least one capability.');
      }
      return {
        id,
        type: 'addClientRole',
        data: { name, capabilities },
      };
    }
  }
}

function fitBudget(payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload);
  if (serialized.length <= MAX_OUTPUT_CHARS) return serialized;
  return `${serialized.slice(0, MAX_OUTPUT_CHARS - 20)}... [truncated]`;
}

export function useComposeBlueprintWebMCP({
  blueprintTitle,
  phpVersion,
  wpVersion,
  landingPageType,
  customLandingUrl,
  steps,
  onTitleChange,
  onPhpVersionChange,
  onWpVersionChange,
  onLandingPageTypeChange,
  onCustomLandingUrlChange,
  onStepsChange,
  onSelectStep,
}: ComposeBlueprintWebMCPParams): void {
  useWebMCP<SummaryArgs, Record<string, unknown>>({
    name: 'get_blueprint_summary',
    description:
      'Reads the current blueprint settings, runtime versions, and a paginated summary of configured steps. Use before adding structural steps that reference existing pages or when checking what is currently in the builder.',
    inputSchema: SUMMARY_SCHEMA,
    annotations: SUMMARY_ANNOTATIONS,
    execute: ({ page = 1, page_size = 12 } = {}, { signal }) => {
      if (signal.aborted) {
        throw new Error('Summary request was cancelled.');
      }
      const safePageSize = Math.min(12, Math.max(1, Math.floor(page_size)));
      const totalCount = steps.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
      const safePage = Math.min(totalPages, Math.max(1, Math.floor(page)));
      const start = (safePage - 1) * safePageSize;

      return {
        title: truncate(blueprintTitle, 80),
        php_version: phpVersion,
        wp_version: wpVersion,
        landing_page_type: landingPageType,
        ...(landingPageType === 'custom' && customLandingUrl
          ? { custom_landing_url: truncate(customLandingUrl, 120) }
          : {}),
        page: safePage,
        page_size: safePageSize,
        total_count: totalCount,
        total_pages: totalPages,
        steps: steps.slice(start, start + safePageSize).map((step, offset) => ({
          index: start + offset + 1,
          id: step.id,
          type: step.type,
          summary: summarizeStep(step),
        })),
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<ConfigureArgs, Record<string, unknown>>({
    name: 'configure_blueprint',
    description:
      'Updates the blueprint site title, PHP version, WordPress version, or default landing view. Use when setting site metadata or runtime environment versions.',
    inputSchema: CONFIGURE_SCHEMA,
    execute: (args, { signal }) => {
      if (signal.aborted) {
        throw new Error('Blueprint configuration was cancelled.');
      }
      const { site_title, php_version, wp_version, landing_page_type, custom_landing_url } = args ?? {};

      if (
        site_title === undefined &&
        php_version === undefined &&
        wp_version === undefined &&
        landing_page_type === undefined &&
        custom_landing_url === undefined
      ) {
        throw new Error(
          'Provide at least one setting to update (site_title, php_version, wp_version, landing_page_type, or custom_landing_url).',
        );
      }

      if (php_version !== undefined && !PHP_VERSIONS.includes(php_version as (typeof PHP_VERSIONS)[number])) {
        throw new Error(`Unsupported php_version "${php_version}". Choose one of: ${PHP_VERSIONS.join(', ')}.`);
      }

      if (wp_version !== undefined && !WP_VERSIONS.includes(wp_version as (typeof WP_VERSIONS)[number])) {
        throw new Error(`Unsupported wp_version "${wp_version}". Choose one of: ${WP_VERSIONS.join(', ')}.`);
      }

      if (
        landing_page_type !== undefined &&
        !LANDING_PAGE_TYPES.includes(landing_page_type as (typeof LANDING_PAGE_TYPES)[number])
      ) {
        throw new Error(
          `Unsupported landing_page_type "${landing_page_type}". Choose one of: ${LANDING_PAGE_TYPES.join(', ')}.`,
        );
      }

      const nextLandingType = landing_page_type ?? landingPageType;
      const nextCustomUrl = custom_landing_url !== undefined ? custom_landing_url.trim() : customLandingUrl;
      if (nextLandingType === 'custom' && !nextCustomUrl) {
        throw new Error(
          'custom_landing_url is required when landing_page_type is "custom" (for example "/wp-admin/edit.php" or "/about").',
        );
      }

      const nextTitle = site_title !== undefined ? site_title.trim() || 'My WordPress Site' : blueprintTitle;
      const nextPhp = php_version ?? phpVersion;
      const nextWp = wp_version ?? wpVersion;

      flushSync(() => {
        if (site_title !== undefined) onTitleChange(nextTitle);
        if (php_version !== undefined) onPhpVersionChange(nextPhp);
        if (wp_version !== undefined) onWpVersionChange(nextWp);
        if (landing_page_type !== undefined) onLandingPageTypeChange(nextLandingType);
        if (custom_landing_url !== undefined) onCustomLandingUrlChange(nextCustomUrl);
      });

      return {
        title: truncate(nextTitle, 80),
        php_version: nextPhp,
        wp_version: nextWp,
        landing_page_type: nextLandingType,
        ...(nextLandingType === 'custom' ? { custom_landing_url: truncate(nextCustomUrl, 120) } : {}),
      };
    },
    formatOutput: fitBudget,
  });

  useWebMCP<AddStepsArgs, Record<string, unknown>>({
    name: 'add_blueprint_steps',
    description:
      'Appends one or more configured setup steps to the blueprint in order and selects the last added step. Use when building a site with pages, posts, media, plugins, themes, menus, homepage settings, or a guided tour.',
    inputSchema: ADD_STEPS_SCHEMA,
    execute: ({ steps: incomingSteps }, { signal }) => {
      if (signal.aborted) {
        throw new Error('Adding blueprint steps was cancelled.');
      }
      if (!Array.isArray(incomingSteps) || incomingSteps.length === 0) {
        throw new Error('Provide at least one step in the steps array.');
      }

      const workingSteps = [...steps];
      const addedSteps: Step[] = [];

      for (let i = 0; i < incomingSteps.length; i += 1) {
        const created = normalizeStepConfig(incomingSteps[i], workingSteps, i);
        workingSteps.push(created);
        addedSteps.push(created);
      }

      const lastAdded = addedSteps[addedSteps.length - 1];
      flushSync(() => {
        onStepsChange(workingSteps);
        onSelectStep(lastAdded);
      });

      const startIndex = steps.length;
      return {
        added_count: addedSteps.length,
        total_steps: workingSteps.length,
        selected_step_index: workingSteps.length,
        added_steps: addedSteps.slice(0, 10).map((step, offset) => ({
          index: startIndex + offset + 1,
          id: step.id,
          type: step.type,
          summary: summarizeStep(step),
        })),
        ...(addedSteps.length > 10 ? { truncated_added_list: true } : {}),
      };
    },
    formatOutput: fitBudget,
  });
}
