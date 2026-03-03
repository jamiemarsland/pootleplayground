#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

interface BlueprintData {
  blueprintTitle: string;
  landingPageType: 'wp-admin' | 'front-page';
  steps: any[];
}

interface BlueprintRecord {
  id: string;
  title: string;
  description: string;
  blueprint_data: BlueprintData;
  step_count: number;
  votes: number;
  is_public: boolean;
  created_at: string;
  screenshot_url?: string;
}

interface GenerateResponse {
  blueprint: BlueprintData;
  explanation: string;
}

class BlueprintMCPServer {
  private server: Server;
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    this.server = new Server(
      {
        name: 'blueprint-generator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate-wordpress-site':
            return await this.generateWordPressSite(args);
          case 'list-blueprints':
            return await this.listBlueprints(args);
          case 'get-blueprint':
            return await this.getBlueprint(args);
          case 'search-blueprints':
            return await this.searchBlueprints(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message || 'An unexpected error occurred'}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'generate-wordpress-site',
        description:
          'Generate a custom WordPress site blueprint using AI based on a natural language description. Returns a WordPress Playground URL where the site can be instantly accessed, along with details about what was created.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description:
                'Natural language description of the WordPress site to generate (e.g., "Create a photography portfolio with a gallery page and contact form")',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'list-blueprints',
        description:
          'List community blueprints from the gallery. Returns publicly shared WordPress site blueprints with their titles, descriptions, vote counts, and step counts.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of blueprints to return (default: 20)',
              default: 20,
            },
            sort_by: {
              type: 'string',
              enum: ['votes', 'date'],
              description: 'Sort by votes (most popular) or date (most recent)',
              default: 'votes',
            },
          },
        },
      },
      {
        name: 'get-blueprint',
        description:
          'Get detailed information about a specific blueprint by ID. Returns the complete blueprint data including title, description, steps, and a WordPress Playground URL.',
        inputSchema: {
          type: 'object',
          properties: {
            blueprint_id: {
              type: 'string',
              description: 'The unique ID of the blueprint to retrieve',
            },
          },
          required: ['blueprint_id'],
        },
      },
      {
        name: 'search-blueprints',
        description:
          'Search for blueprints by keyword in titles and descriptions. Returns matching blueprints with relevance information.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to match against blueprint titles and descriptions',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 20)',
              default: 20,
            },
          },
          required: ['query'],
        },
      },
    ];
  }

  private async generateWordPressSite(args: any) {
    const { prompt } = args;

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt. Please provide a text description of the site to generate.');
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const apiUrl = `${supabaseUrl}/functions/v1/generate-blueprint`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate blueprint: ${errorText}`);
    }

    const data = await response.json() as GenerateResponse;
    const { blueprint, explanation } = data;

    const playgroundUrl = this.generatePlaygroundUrl(blueprint);

    const plugins = blueprint.steps
      .filter((step: any) => step.type === 'installPlugin')
      .map((step: any) => {
        const pluginData = step.data.pluginZipFile;
        if (pluginData?.resource === 'wordpress.org/plugins') {
          return pluginData['wordpress.org/plugins'];
        }
        return 'custom plugin';
      });

    const themes = blueprint.steps
      .filter((step: any) => step.type === 'installTheme')
      .map((step: any) => {
        const themeData = step.data.themeZipFile;
        if (themeData?.resource === 'wordpress.org/themes') {
          return themeData['wordpress.org/themes'];
        }
        return 'custom theme';
      });

    const pages = blueprint.steps.filter((step: any) => step.type === 'addPage').length;
    const posts = blueprint.steps.filter((step: any) => step.type === 'addPost').length;

    let result = `# WordPress Site Generated Successfully! 🚀\n\n`;
    result += `**Site Title:** ${blueprint.blueprintTitle}\n`;
    result += `**Landing Page:** ${blueprint.landingPageType === 'wp-admin' ? 'WordPress Admin' : 'Front Page'}\n`;
    result += `**Total Steps:** ${blueprint.steps.length}\n\n`;

    result += `## 🌐 WordPress Playground URL\n`;
    result += `${playgroundUrl}\n\n`;

    result += `## 📝 What Was Created\n\n`;
    result += explanation + '\n\n';

    result += `## 📊 Site Features\n\n`;
    if (pages > 0) result += `- **${pages}** page(s)\n`;
    if (posts > 0) result += `- **${posts}** post(s)\n`;
    if (plugins.length > 0) result += `- **Plugins:** ${plugins.join(', ')}\n`;
    if (themes.length > 0) result += `- **Themes:** ${themes.join(', ')}\n`;

    const hasMenu = blueprint.steps.some((step: any) => step.type === 'createNavigationMenu');
    if (hasMenu) result += `- Navigation menu configured\n`;

    const hasHomepage = blueprint.steps.some((step: any) => step.type === 'setHomepage');
    if (hasHomepage) result += `- Custom homepage set\n`;

    result += `\n## 🎯 Next Steps\n\n`;
    result += `1. Click the Playground URL above to view your site\n`;
    result += `2. The site will load in WordPress Playground (may take a moment)\n`;
    result += `3. Explore the site and customize it further\n`;
    result += `4. Use the WordPress admin to make additional changes\n`;

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private async listBlueprints(args: any) {
    const limit = args?.limit || 20;
    const sortBy = args?.sort_by || 'votes';

    let query = this.supabase
      .from('blueprints')
      .select('*')
      .eq('is_public', true)
      .limit(limit);

    if (sortBy === 'votes') {
      query = query.order('votes', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch blueprints: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No community blueprints found. Be the first to create and share one!',
          },
        ],
      };
    }

    let result = `# Community Blueprints (${data.length} found)\n\n`;
    result += `Showing the ${sortBy === 'votes' ? 'most popular' : 'most recent'} blueprints from the community.\n\n`;

    data.forEach((blueprint: BlueprintRecord, index: number) => {
      result += `## ${index + 1}. ${blueprint.title}\n`;
      result += `**ID:** \`${blueprint.id}\`\n`;
      result += `**Description:** ${blueprint.description || 'No description provided'}\n`;
      result += `**Steps:** ${blueprint.step_count} | **Votes:** ${blueprint.votes} ⭐\n`;
      result += `**Created:** ${new Date(blueprint.created_at).toLocaleDateString()}\n`;
      result += `**Type:** ${blueprint.blueprint_data.landingPageType === 'wp-admin' ? 'Admin Dashboard' : 'Front Page'}\n\n`;
    });

    result += `\n---\n\n`;
    result += `💡 **Tip:** Use \`get-blueprint\` with a blueprint ID to view full details and get a Playground URL.\n`;

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private async getBlueprint(args: any) {
    const { blueprint_id } = args;

    if (!blueprint_id) {
      throw new Error('blueprint_id is required');
    }

    const { data, error } = await this.supabase
      .from('blueprints')
      .select('*')
      .eq('id', blueprint_id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch blueprint: ${error.message}`);
    }

    if (!data) {
      return {
        content: [
          {
            type: 'text',
            text: `Blueprint with ID "${blueprint_id}" not found.`,
          },
        ],
      };
    }

    const blueprint: BlueprintRecord = data;
    const playgroundUrl = this.generatePlaygroundUrl(blueprint.blueprint_data);

    let result = `# ${blueprint.title}\n\n`;
    result += `${blueprint.description || 'No description provided'}\n\n`;

    result += `## 🌐 WordPress Playground URL\n`;
    result += `${playgroundUrl}\n\n`;

    result += `## 📊 Blueprint Details\n\n`;
    result += `- **ID:** \`${blueprint.id}\`\n`;
    result += `- **Total Steps:** ${blueprint.step_count}\n`;
    result += `- **Votes:** ${blueprint.votes} ⭐\n`;
    result += `- **Landing Page:** ${blueprint.blueprint_data.landingPageType === 'wp-admin' ? 'WordPress Admin' : 'Front Page'}\n`;
    result += `- **Created:** ${new Date(blueprint.created_at).toLocaleDateString()}\n\n`;

    const stepTypes: { [key: string]: number } = {};
    blueprint.blueprint_data.steps.forEach((step: any) => {
      stepTypes[step.type] = (stepTypes[step.type] || 0) + 1;
    });

    result += `## 🔧 What's Included\n\n`;
    Object.entries(stepTypes).forEach(([type, count]) => {
      const readableType = type
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase()
        .replace(/^./, (str) => str.toUpperCase());
      result += `- **${readableType}:** ${count}\n`;
    });

    const plugins = blueprint.blueprint_data.steps
      .filter((step: any) => step.type === 'installPlugin')
      .map((step: any) => {
        const pluginData = step.data.pluginZipFile;
        if (pluginData?.resource === 'wordpress.org/plugins') {
          return pluginData['wordpress.org/plugins'];
        }
        return 'custom plugin';
      });

    const themes = blueprint.blueprint_data.steps
      .filter((step: any) => step.type === 'installTheme')
      .map((step: any) => {
        const themeData = step.data.themeZipFile;
        if (themeData?.resource === 'wordpress.org/themes') {
          return themeData['wordpress.org/themes'];
        }
        return 'custom theme';
      });

    if (plugins.length > 0) {
      result += `\n### 🔌 Plugins\n`;
      plugins.forEach((plugin: string) => {
        result += `- ${plugin}\n`;
      });
    }

    if (themes.length > 0) {
      result += `\n### 🎨 Themes\n`;
      themes.forEach((theme: string) => {
        result += `- ${theme}\n`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private async searchBlueprints(args: any) {
    const { query, limit = 20 } = args;

    if (!query || typeof query !== 'string') {
      throw new Error('query parameter is required and must be a string');
    }

    const { data, error } = await this.supabase
      .from('blueprints')
      .select('*')
      .eq('is_public', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('votes', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search blueprints: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No blueprints found matching "${query}". Try a different search term or browse all blueprints with \`list-blueprints\`.`,
          },
        ],
      };
    }

    let result = `# Search Results for "${query}"\n\n`;
    result += `Found ${data.length} matching blueprint(s):\n\n`;

    data.forEach((blueprint: BlueprintRecord, index: number) => {
      result += `## ${index + 1}. ${blueprint.title}\n`;
      result += `**ID:** \`${blueprint.id}\`\n`;
      result += `**Description:** ${blueprint.description || 'No description provided'}\n`;
      result += `**Steps:** ${blueprint.step_count} | **Votes:** ${blueprint.votes} ⭐\n`;
      result += `**Created:** ${new Date(blueprint.created_at).toLocaleDateString()}\n\n`;
    });

    result += `\n---\n\n`;
    result += `💡 **Tip:** Use \`get-blueprint\` with a blueprint ID to view full details and get a Playground URL.\n`;

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private generatePlaygroundUrl(blueprintData: BlueprintData): string {
    const nativeBlueprint = this.convertToNativeBlueprint(blueprintData);
    const blueprintJson = JSON.stringify(nativeBlueprint);
    const compressed = Buffer.from(blueprintJson).toString('base64');
    return `https://playground.wordpress.net/#${compressed}`;
  }

  private convertToNativeBlueprint(blueprintData: BlueprintData): any {
    const { blueprintTitle, landingPageType, steps } = blueprintData;

    const nativeSteps: any[] = [];

    const stepIdMap: { [key: string]: number } = {};

    steps.forEach((step: any, index: number) => {
      stepIdMap[step.id] = index;

      switch (step.type) {
        case 'installPlugin':
          nativeSteps.push({
            step: 'installPlugin',
            pluginZipFile: step.data.pluginZipFile,
            options: step.data.options || {},
          });
          break;

        case 'installTheme':
          nativeSteps.push({
            step: 'installTheme',
            themeZipFile: step.data.themeZipFile,
            options: step.data.options || {},
          });
          break;

        case 'addPage':
          nativeSteps.push({
            step: 'runPHP',
            code: `<?php
              require_once 'wordpress/wp-load.php';
              $post_id = wp_insert_post([
                'post_title' => ${JSON.stringify(step.data.postTitle)},
                'post_content' => ${JSON.stringify(step.data.postContent)},
                'post_status' => ${JSON.stringify(step.data.postStatus || 'publish')},
                'post_type' => 'page'
              ]);
              file_put_contents('/tmp/step_${step.id}', $post_id);
            ?>`,
          });
          break;

        case 'addPost':
          nativeSteps.push({
            step: 'runPHP',
            code: `<?php
              require_once 'wordpress/wp-load.php';
              $post_id = wp_insert_post([
                'post_title' => ${JSON.stringify(step.data.postTitle)},
                'post_content' => ${JSON.stringify(step.data.postContent)},
                'post_status' => ${JSON.stringify(step.data.postStatus || 'publish')},
                'post_type' => 'post'
              ]);
              file_put_contents('/tmp/step_${step.id}', $post_id);
            ?>`,
          });
          break;

        case 'addMedia':
          nativeSteps.push({
            step: 'runPHP',
            code: `<?php
              require_once 'wordpress/wp-load.php';
              require_once 'wordpress/wp-admin/includes/file.php';
              require_once 'wordpress/wp-admin/includes/media.php';
              require_once 'wordpress/wp-admin/includes/image.php';

              $url = ${JSON.stringify(step.data.downloadUrl)};
              $tmp = download_url($url);
              if (is_wp_error($tmp)) {
                error_log('Download failed: ' . $tmp->get_error_message());
                exit(1);
              }

              $file_array = [
                'name' => basename($url),
                'tmp_name' => $tmp
              ];

              $id = media_handle_sideload($file_array, 0, ${JSON.stringify(step.data.title || '')});
              if (is_wp_error($id)) {
                @unlink($tmp);
                error_log('Sideload failed: ' . $id->get_error_message());
                exit(1);
              }

              if (!empty(${JSON.stringify(step.data.altText || '')})) {
                update_post_meta($id, '_wp_attachment_image_alt', ${JSON.stringify(step.data.altText || '')});
              }

              file_put_contents('/tmp/step_${step.id}', $id);
            ?>`,
          });
          break;

        case 'setHomepage':
          if (step.data.option === 'existing' && step.data.stepId) {
            nativeSteps.push({
              step: 'runPHP',
              code: `<?php
                require_once 'wordpress/wp-load.php';
                $page_id = (int)file_get_contents('/tmp/step_${step.data.stepId}');
                update_option('page_on_front', $page_id);
                update_option('show_on_front', 'page');
              ?>`,
            });
          } else if (step.data.option === 'posts') {
            nativeSteps.push({
              step: 'runPHP',
              code: `<?php
                require_once 'wordpress/wp-load.php';
                update_option('show_on_front', 'posts');
              ?>`,
            });
          }
          break;

        case 'createNavigationMenu':
          nativeSteps.push({
            step: 'runPHP',
            code: `<?php
              require_once 'wordpress/wp-load.php';

              $menu_name = ${JSON.stringify(step.data.menuName)};
              $menu_id = wp_create_nav_menu($menu_name);

              if (is_wp_error($menu_id)) {
                error_log('Menu creation failed');
                exit(1);
              }

              $locations = get_theme_mod('nav_menu_locations') ?: [];
              $locations[${JSON.stringify(step.data.menuLocation || 'primary')}] = $menu_id;
              set_theme_mod('nav_menu_locations', $locations);

              ${step.data.menuItems
                .map(
                  (item: any) => `
              $page_id_${item.id} = ${
                item.type === 'page' && item.pageStepId
                  ? `(int)file_get_contents('/tmp/step_${item.pageStepId}')`
                  : '0'
              };
              wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title' => ${JSON.stringify(item.title)},
                'menu-item-object-id' => $page_id_${item.id},
                'menu-item-object' => ${JSON.stringify(item.type === 'page' ? 'page' : 'custom')},
                'menu-item-type' => ${JSON.stringify(item.type === 'page' ? 'post_type' : 'custom')},
                'menu-item-status' => 'publish',
                ${item.type === 'custom' && item.url ? `'menu-item-url' => ${JSON.stringify(item.url)},` : ''}
              ]);
              `
                )
                .join('\n')}
            ?>`,
          });
          break;

        case 'setSiteOption':
          nativeSteps.push({
            step: 'runPHP',
            code: `<?php
              require_once 'wordpress/wp-load.php';
              update_option(${JSON.stringify(step.data.option)}, ${JSON.stringify(step.data.value)});
            ?>`,
          });
          break;

        case 'addClientRole':
          nativeSteps.push({
            step: 'runPHP',
            code: `<?php
              require_once 'wordpress/wp-load.php';
              $role_slug = sanitize_key(${JSON.stringify(step.data.name)});
              add_role($role_slug, ${JSON.stringify(step.data.name)}, ${JSON.stringify(
              step.data.capabilities.reduce((acc: any, cap: string) => {
                acc[cap] = true;
                return acc;
              }, {})
            )});
            ?>`,
          });
          break;

        case 'defineWpConfig':
          nativeSteps.push({
            step: 'defineWpConfigConsts',
            consts: step.data.consts || {},
          });
          break;

        case 'login':
          nativeSteps.push({
            step: 'login',
            username: step.data.username || 'admin',
            password: step.data.password || 'password',
          });
          break;
      }
    });

    if (landingPageType === 'front-page') {
      nativeSteps.push({
        step: 'runPHP',
        code: `<?php
          require_once 'wordpress/wp-load.php';
          if (get_option('show_on_front') !== 'posts') {
            update_option('permalink_structure', '/%postname%/');
            flush_rewrite_rules();
          }
        ?>`,
      });
    }

    return {
      preferredVersions: {
        php: '8.0',
        wp: 'latest',
      },
      landingPage: landingPageType === 'wp-admin' ? '/wp-admin/' : '/',
      steps: nativeSteps,
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Blueprint MCP server running on stdio');
  }
}

const server = new BlueprintMCPServer();
server.run().catch(console.error);
