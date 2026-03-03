# Blueprint Generator MCP Server

A Model Context Protocol (MCP) server that enables Claude to generate and manage WordPress site blueprints. This integration allows you to have natural conversations with Claude to create custom WordPress sites, browse community blueprints, and get instant WordPress Playground URLs.

## Features

- **AI-Powered Site Generation**: Describe a WordPress site in natural language and get a fully configured blueprint
- **Community Gallery Access**: Browse, search, and load blueprints shared by the community
- **Instant WordPress Playground URLs**: Every blueprint comes with a ready-to-use Playground link
- **Detailed Blueprint Information**: Get comprehensive details about what each blueprint creates

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Claude Desktop app
- Access to the Blueprint Generator Supabase project

## Installation

### 1. Install Dependencies

Navigate to the `mcp-server` directory and install the required packages:

```bash
cd mcp-server
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these credentials in your Supabase project dashboard under **Project Settings > API**.

### 3. Build the Server

Compile the TypeScript code:

```bash
npm run build
```

### 4. Configure Claude Desktop

Add the MCP server to your Claude Desktop configuration file:

#### macOS

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "blueprint-generator": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "VITE_SUPABASE_URL": "https://your-project.supabase.co",
        "VITE_SUPABASE_ANON_KEY": "your-anon-key-here"
      }
    }
  }
}
```

#### Windows

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "blueprint-generator": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\mcp-server\\dist\\index.js"],
      "env": {
        "VITE_SUPABASE_URL": "https://your-project.supabase.co",
        "VITE_SUPABASE_ANON_KEY": "your-anon-key-here"
      }
    }
  }
}
```

#### Linux

Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "blueprint-generator": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "VITE_SUPABASE_URL": "https://your-project.supabase.co",
        "VITE_SUPABASE_ANON_KEY": "your-anon-key-here"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/mcp-server` with the actual absolute path to your `mcp-server` directory.

### 5. Restart Claude Desktop

After saving the configuration file, restart Claude Desktop completely (quit and reopen) for the changes to take effect.

## Available Tools

The MCP server provides four tools that Claude can use:

### 1. generate-wordpress-site

Generate a custom WordPress site blueprint using AI based on a natural language description.

**Example prompts:**
- "Generate a photography portfolio website with a gallery and about page"
- "Create a restaurant site with menu pages and contact information"
- "Build a blog site with multiple posts and categories"

**Returns:**
- WordPress Playground URL
- Site title and configuration
- Detailed explanation of what was created
- Feature summary (pages, posts, plugins, themes)
- Next steps to explore the site

### 2. list-blueprints

List community blueprints from the gallery with sorting options.

**Parameters:**
- `limit`: Number of blueprints to return (default: 20)
- `sort_by`: Sort by "votes" (most popular) or "date" (most recent)

**Example prompts:**
- "Show me the top community blueprints"
- "List the 10 most recent blueprints"
- "What are the most popular blueprints?"

**Returns:**
- List of blueprints with titles, descriptions, IDs
- Vote counts and step counts
- Creation dates

### 3. get-blueprint

Get detailed information about a specific blueprint by ID.

**Parameters:**
- `blueprint_id`: The unique ID of the blueprint

**Example prompts:**
- "Get details for blueprint abc-123"
- "Show me the blueprint with ID xyz-789"
- "Load blueprint abc-123"

**Returns:**
- Complete blueprint information
- WordPress Playground URL
- Detailed breakdown of included features
- List of plugins and themes
- Step count and type breakdown

### 4. search-blueprints

Search for blueprints by keyword in titles and descriptions.

**Parameters:**
- `query`: Search term
- `limit`: Number of results (default: 20)

**Example prompts:**
- "Search for e-commerce blueprints"
- "Find blueprints about restaurants"
- "Search for blog templates"

**Returns:**
- Matching blueprints with relevance
- Same information format as list-blueprints

## Usage Examples

Once installed and configured, you can have conversations with Claude like:

### Example 1: Generate a New Site

**You:** "I need a WordPress site for a yoga studio with class schedules and instructor bios"

**Claude:** Will use the `generate-wordpress-site` tool to create a custom blueprint with:
- Pages for schedule, instructors, about
- Navigation menu
- WordPress Playground URL ready to use
- Detailed explanation of what was built

### Example 2: Browse Community Blueprints

**You:** "Show me the most popular community blueprints"

**Claude:** Will use `list-blueprints` to display:
- Top rated blueprints from the community
- Brief descriptions and stats
- Blueprint IDs for loading specific ones

### Example 3: Load a Specific Blueprint

**You:** "Load blueprint abc-123-def-456 and tell me what it includes"

**Claude:** Will use `get-blueprint` to fetch:
- Complete blueprint details
- WordPress Playground URL
- Breakdown of pages, posts, plugins, themes
- Step-by-step feature list

### Example 4: Search for Specific Content

**You:** "Find blueprints related to online stores"

**Claude:** Will use `search-blueprints` to find:
- All blueprints matching "online stores"
- E-commerce related templates
- WooCommerce integrations

## Development

### Run in Development Mode

```bash
npm run dev
```

### Watch Mode (Auto-rebuild on changes)

```bash
npm run watch
```

### Project Structure

```
mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript output
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variable template
├── .env                  # Your environment variables (not committed)
└── README.md            # This file
```

## Troubleshooting

### Claude Desktop doesn't show the MCP server

1. Make sure the `claude_desktop_config.json` file is in the correct location
2. Verify the absolute path to `dist/index.js` is correct
3. Check that the environment variables are properly set
4. Restart Claude Desktop completely (quit and reopen)
5. Check Claude Desktop's developer console for error messages

### "Missing Supabase credentials" error

1. Verify your `.env` file has the correct credentials
2. Make sure the environment variables in `claude_desktop_config.json` match your `.env` file
3. Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are both set

### "Failed to generate blueprint" error

1. Check your internet connection
2. Verify the Supabase Edge Function is deployed and running
3. Check the Supabase project dashboard for any service issues
4. Ensure your Supabase anonymous key has the correct permissions

### MCP server not responding

1. Make sure you ran `npm run build` after making changes
2. Check the Claude Desktop logs for error messages
3. Try running the server manually: `node dist/index.js`
4. Verify Node.js version is 18 or higher

### Blueprint URLs not working

1. WordPress Playground may take a moment to load
2. Very large blueprints might timeout - try simplifying
3. Check that the base64 encoding is valid
4. Some browsers block popups - allow popups for Playground URLs

## FAQ

### Q: Do I need to deploy this server somewhere?

No! The MCP server runs locally on your machine. Claude Desktop connects to it via stdio (standard input/output).

### Q: Can I use this with the Claude web app?

No, MCP servers only work with Claude Desktop. They cannot be used with the web version of Claude.

### Q: How secure is this?

The MCP server runs locally and only communicates with:
1. Claude Desktop (via stdio)
2. Your Supabase project (using your credentials)

Your Supabase credentials are stored locally in environment variables and never sent to Anthropic or any third party.

### Q: Can I modify the tools or add new ones?

Yes! The source code is in `src/index.ts`. You can add new tools, modify existing ones, or customize the behavior. Just run `npm run build` after making changes.

### Q: Does this cost money to run?

The MCP server itself is free. However:
- Claude Desktop requires a Claude Pro subscription
- Supabase has free tier limits; heavy usage may require a paid plan
- The AI blueprint generation uses Supabase Edge Functions which may incur costs

### Q: Can I share blueprints with others?

Yes! When you generate a blueprint through the web interface, you can choose to make it public. Public blueprints appear in the community gallery and can be accessed by anyone using the MCP server.

### Q: What happens if I lose my .env file?

Your `.env` file only contains credentials that can be retrieved from your Supabase dashboard. Just create a new `.env` file with the credentials from **Project Settings > API**.

### Q: Can multiple people use the same MCP server?

Each person needs to install and configure the MCP server on their own machine. However, they can all connect to the same Supabase project to share the same blueprint database.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Supabase project logs for API errors
3. Check Claude Desktop's developer console for MCP errors
4. Verify all prerequisites are installed correctly

## License

MIT
