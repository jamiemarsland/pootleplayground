# Blueprint Generator MCP Server

Connect Claude Desktop to your WordPress Blueprint Generator! This lets you chat with Claude to create custom WordPress sites, browse community blueprints, and get instant WordPress Playground URLs.

## What You'll Get

- **AI-Powered Site Generation**: Describe a WordPress site and get a fully configured blueprint
- **Community Gallery Access**: Browse, search, and load blueprints shared by others
- **Instant WordPress Playground URLs**: Every blueprint comes with a ready-to-use link
- **Detailed Blueprint Information**: Get comprehensive details about what each blueprint creates

## What You Need Before Installing

- **Node.js** version 18 or higher ([Download here](https://nodejs.org/))
- **Claude Desktop** app ([Download here](https://claude.ai/download))

Not sure if you have Node.js? Open Terminal (Mac/Linux) or Command Prompt (Windows) and type: `node --version`

**Note:** No Supabase account needed! This MCP server connects to the Blueprint Generator's shared community database. All credentials are pre-configured.

---

## 🚀 Quick Installation (Recommended)

We've created automatic installers that do all the work for you!

### For Mac & Linux Users

1. Open Terminal
2. Navigate to the mcp-server folder:
   ```bash
   cd /path/to/mcp-server
   ```
3. Run the installer:
   ```bash
   ./install.sh
   ```
4. Wait for the installation to complete (no manual input needed - everything is pre-configured!)
5. Restart Claude Desktop completely
6. Look for the 🔌 icon in Claude to verify the connection

### For Windows Users

1. Open PowerShell (right-click Start menu → Windows PowerShell)
2. Navigate to the mcp-server folder:
   ```powershell
   cd C:\path\to\mcp-server
   ```
3. Run the installer:
   ```powershell
   .\install.ps1
   ```
4. Wait for the installation to complete (no manual input needed - everything is pre-configured!)
5. Restart Claude Desktop completely
6. Look for the 🔌 icon in Claude to verify the connection

---

## 📋 Manual Installation (Alternative Method)

If the automatic installer doesn't work for you, follow these detailed steps:

### Step 1: Install Required Packages

Open Terminal/Command Prompt, navigate to the mcp-server folder, and run:

```bash
npm install
```

Wait for all packages to download (this may take a minute or two).

### Step 2: Build the Server

Still in the same window, run:

```bash
npm run build
```

This creates the files needed for Claude to connect.

### Step 3: Find Your Configuration File

You need to edit a configuration file. The location depends on your operating system:

- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Tip for Mac users:** In Finder, press `Cmd + Shift + G` and paste the path above.

**Tip for Windows users:** Press `Win + R`, type `%APPDATA%\Claude`, and press Enter.

### Step 4: Edit the Configuration File

Open the configuration file in a text editor and add this configuration:

**Important:** Replace `/absolute/path/to/mcp-server` with the actual full path to your mcp-server folder. The Supabase credentials are pre-configured for the shared community database.

**Example for Mac/Linux:**
```json
{
  "mcpServers": {
    "blueprint-generator": {
      "command": "node",
      "args": ["/Users/yourname/projects/mcp-server/dist/index.js"],
      "env": {
        "VITE_SUPABASE_URL": "https://qnhseyvcanynadeewdxk.supabase.co",
        "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaHNleXZjYW55bmFkZWV3ZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTk0ODMsImV4cCI6MjA3NTM5NTQ4M30.dUoFBKVFUHR_RZHH3GWw1O2T_yI5RB5yNZMBi8x4HCc"
      }
    }
  }
}
```

**Example for Windows:**
```json
{
  "mcpServers": {
    "blueprint-generator": {
      "command": "node",
      "args": ["C:\\Users\\yourname\\projects\\mcp-server\\dist\\index.js"],
      "env": {
        "VITE_SUPABASE_URL": "https://qnhseyvcanynadeewdxk.supabase.co",
        "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaHNleXZjYW55bmFkZWV3ZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTk0ODMsImV4cCI6MjA3NTM5NTQ4M30.dUoFBKVFUHR_RZHH3GWw1O2T_yI5RB5yNZMBi8x4HCc"
      }
    }
  }
}
```

**How to find the full path:**
- **Mac/Linux**: In Terminal, type `pwd` while in the mcp-server folder
- **Windows**: In the folder's address bar, copy the full path

### Step 5: Restart Claude Desktop

**Important:** You must completely quit Claude Desktop:
- **Mac**: Right-click Claude in the Dock → Quit
- **Windows**: Right-click Claude in the system tray → Quit
- **Linux**: Close all windows and quit from the menu

Then open Claude Desktop again.

### Step 6: Verify the Connection

Open a new conversation in Claude and look for a small 🔌 (plug) icon near the text input. This means the MCP server is connected!

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

### I don't see the 🔌 icon in Claude

**This means the MCP server isn't connected. Try these steps:**

1. **Completely restart Claude Desktop**
   - Don't just close the window - you must quit the app completely
   - Mac: Right-click Claude in Dock → Quit
   - Windows: Right-click Claude in system tray → Quit
   - Then reopen Claude Desktop

2. **Check the configuration file location**
   - Make sure you edited the correct file:
     - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
     - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
     - Linux: `~/.config/Claude/claude_desktop_config.json`

3. **Verify the path is correct**
   - The path in your config file must point to the actual location of `dist/index.js`
   - Use the full path (e.g., `/Users/yourname/projects/mcp-server/dist/index.js`)
   - Windows users: Use backslashes `\\` in paths

4. **Verify the Supabase credentials in your config**
   - Make sure the URL is: `https://qnhseyvcanynadeewdxk.supabase.co`
   - The anon key should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - These credentials are the same for all users

5. **Make sure Node.js is installed**
   - Open Terminal/Command Prompt and type: `node --version`
   - You should see a version number like `v18.0.0` or higher
   - If not, [download Node.js](https://nodejs.org/)

6. **Try restarting your computer**
   - Sometimes a full restart is needed for configuration changes to take effect

### "Missing Supabase credentials" error

This means Claude can't find the Supabase information in your configuration.

**Solution:**
- Double-check that both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in your config file
- Make sure there are no typos in the variable names
- Verify you're using the correct shared credentials:
  - URL: `https://qnhseyvcanynadeewdxk.supabase.co`
  - Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaHNleXZjYW55bmFkZWV3ZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTk0ODMsImV4cCI6MjA3NTM5NTQ4M30.dUoFBKVFUHR_RZHH3GWw1O2T_yI5RB5yNZMBi8x4HCc`

### Claude says it can't generate a blueprint

**Possible causes and solutions:**

1. **Check your internet connection**
   - The server needs internet to connect to Supabase

2. **Verify you have an internet connection**
   - The MCP server needs internet to connect to the shared Supabase database

3. **Try a simpler request**
   - Very complex sites might take longer or fail
   - Start with something simple like "Create a basic blog with 3 posts"

### The automatic installer didn't work

**Try the manual installation method instead:**
- Scroll up to the "Manual Installation (Alternative Method)" section
- Follow each step carefully
- Take your time and don't skip steps

**Common installer issues:**

- **"npm: command not found"**: You need to install Node.js first
- **"Permission denied" on Mac/Linux**: The script might not have execute permissions. Try one of these:
  - Run `chmod +x install.sh` then `./install.sh`
  - Or simply run `bash install.sh` instead
- **"PowerShell execution policy"**: On Windows, open PowerShell as Administrator and run: `Set-ExecutionPolicy RemoteSigned`

### WordPress Playground links don't work

1. **Give it a moment**
   - Large blueprints can take 10-20 seconds to load

2. **Check your browser**
   - Some browsers block popups - allow popups for playground.wordpress.net
   - Try opening the link in a different browser

3. **Try a smaller blueprint**
   - Very large blueprints (100+ steps) might timeout
   - Create simpler sites with fewer pages and plugins

### Still having problems?

**Check these common issues:**

1. **Did you build the server?**
   - Make sure you ran `npm run build` in the mcp-server folder
   - You should see a `dist` folder appear after building

2. **Is the config file valid JSON?**
   - JSON is very picky about commas and quotes
   - Use a JSON validator to check: [jsonlint.com](https://jsonlint.com)
   - Make sure every opening brace `{` has a closing brace `}`

3. **Are you using Claude Desktop?**
   - MCP servers only work with Claude Desktop, not the web version
   - Download Claude Desktop from [claude.ai/download](https://claude.ai/download)

## Frequently Asked Questions

### Do I need to host this somewhere online?

**No!** The MCP server runs on your own computer. It's completely local and private. Claude Desktop talks to it directly on your machine.

### Can I use this with Claude on the web?

**No**, MCP servers only work with the Claude Desktop app. You need to download and install Claude Desktop on your computer.

### Is this safe? Where does my data go?

**Yes, it's safe!** The MCP server:
- Runs entirely on your computer
- Only talks to Claude Desktop (locally) and the shared Blueprint Generator Supabase database
- The Supabase credentials are public (anon key only) - they're designed to be shared
- Nothing is sent to Anthropic or any third party
- All users connect to the same community database to share blueprints

### Does this cost money?

**Completely free!** You need:
- **Claude Desktop**: Free to use (Claude Pro gives you more features)
- **Supabase**: The shared database is hosted by the Blueprint Generator project
- **AI Blueprint Generation**: Uses shared Supabase Edge Functions

No Supabase account or payment required on your end.

### Can I share blueprints with my team?

**Yes!** Anyone can install the MCP server on their computer. Everyone uses the same shared Supabase database, so all public blueprints are visible to everyone in the community. Your team will automatically see each other's public blueprints.

### What if I want to change or customize the tools?

**You can!** The code is in `src/index.ts`. You can:
- Add new tools
- Modify existing functionality
- Customize how blueprints are generated

Just remember to run `npm run build` after making any changes.

### I lost my Supabase credentials, what do I do?

**No problem!** The credentials are in the `.env.example` file in the mcp-server folder:
- URL: `https://qnhseyvcanynadeewdxk.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaHNleXZjYW55bmFkZWV3ZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTk0ODMsImV4cCI6MjA3NTM5NTQ4M30.dUoFBKVFUHR_RZHH3GWw1O2T_yI5RB5yNZMBi8x4HCc`

These credentials are the same for all users.

### Can multiple people install this from the same project?

**Yes!** Each person installs the MCP server on their own computer. Everyone automatically uses the same shared Supabase database and can access the community blueprint gallery.

### What version of Node.js do I need?

**Version 18 or newer.** Check your version by running `node --version` in Terminal/Command Prompt. If you need to update, download the latest from [nodejs.org](https://nodejs.org/).

### Do I need to know how to code to use this?

**No!** Once installed, you just chat with Claude normally. For installation:
- Use the automatic installer (no coding needed)
- Or follow the step-by-step manual guide (copy-paste commands)

You only need coding knowledge if you want to customize the MCP server itself.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Supabase project logs for API errors
3. Check Claude Desktop's developer console for MCP errors
4. Verify all prerequisites are installed correctly

## License

MIT
