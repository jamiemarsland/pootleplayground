interface ContextCache {
  content: string;
  timestamp: number;
  lastModified: number;
}

let cache: ContextCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getContext(): Promise<string> {
  const now = Date.now();

  if (cache && (now - cache.timestamp) < CACHE_DURATION) {
    return cache.content;
  }

  try {
    const response = await fetch('/pootle-context.md');

    if (!response.ok) {
      console.warn('Context file not found, using fallback');
      return getFallbackContext();
    }

    const content = await response.text();
    const lastModified = response.headers.get('last-modified');
    const lastModifiedTime = lastModified ? new Date(lastModified).getTime() : now;

    cache = {
      content,
      timestamp: now,
      lastModified: lastModifiedTime
    };

    return content;
  } catch (error) {
    console.error('Error loading context file:', error);
    return getFallbackContext();
  }
}

export function clearContextCache(): void {
  cache = null;
}

function getFallbackContext(): string {
  return `# Pootle Playground AI Context

You are generating WordPress Playground blueprints using Pootle's internal step format.

Available step types: installPlugin, installTheme, addPost, addPage, addMedia, setSiteOption,
defineWpConfigConst, login, importWxr, addClientRole, setHomepage, setPostsPage,
createNavigationMenu, setLandingPage

Each step must have: id (string), type (string), data (object)

Generate realistic content and use real WordPress.org plugin/theme slugs.
`;
}
