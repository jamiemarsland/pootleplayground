import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, Terminal, Check } from 'lucide-react';
import { Footer } from './Footer';

export function McpInstructionsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen blueprint-paper">
      <header className="blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-blueprint-text hover:text-blueprint-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blueprint-accent" />
                <h1 className="text-xl font-bold text-blueprint-text">MCP Instructions</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="blueprint-paper border border-blueprint-accent/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-blueprint-text mb-4">
              Connect Claude Desktop to Blueprint Generator
            </h2>
            <p className="text-blueprint-text/70 text-lg">
              Chat with Claude to create custom WordPress sites, browse community blueprints, and get instant WordPress Playground URLs.
            </p>
          </div>

          <div className="blueprint-paper border border-blueprint-accent/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-blueprint-text mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              What You'll Get
            </h3>
            <ul className="space-y-3 text-blueprint-text/80">
              <li className="flex items-start gap-3">
                <span className="text-blueprint-accent mt-1">•</span>
                <span><strong>AI-Powered Site Generation:</strong> Describe a WordPress site and get a fully configured blueprint</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blueprint-accent mt-1">•</span>
                <span><strong>Community Gallery Access:</strong> Browse, search, and load blueprints shared by others</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blueprint-accent mt-1">•</span>
                <span><strong>Instant WordPress Playground URLs:</strong> Every blueprint comes with a ready-to-use link</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blueprint-accent mt-1">•</span>
                <span><strong>Detailed Blueprint Information:</strong> Get comprehensive details about what each blueprint creates</span>
              </li>
            </ul>
          </div>

          <div className="blueprint-paper border border-blueprint-accent/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-blueprint-text mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-blueprint-accent" />
              What You Need
            </h3>
            <ul className="space-y-3 text-blueprint-text/80">
              <li className="flex items-start gap-3">
                <span className="text-blueprint-accent mt-1">•</span>
                <span><strong>Node.js</strong> version 18 or higher (<a href="https://nodejs.org/" target=\"_blank" rel="noopener noreferrer\" className="text-blue-500 hover:underline">Download here</a>)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blueprint-accent mt-1">•</span>
                <span><strong>Claude Desktop</strong> app (<a href="https://claude.ai/download" target=\"_blank" rel="noopener noreferrer\" className="text-blue-500 hover:underline">Download here</a>)</span>
              </li>
            </ul>
            <p className="text-sm text-blueprint-text/60 mt-4">
              Not sure if you have Node.js? Open Terminal (Mac/Linux) or Command Prompt (Windows) and type: <code className="px-2 py-1 bg-blueprint-accent/10 rounded">node --version</code>
            </p>
            <p className="text-sm text-green-600 mt-2">
              <strong>Note:</strong> No Supabase account needed! This MCP server connects to the Blueprint Generator's shared community database.
            </p>
          </div>

          <div className="blueprint-paper border border-blue-500/20 rounded-xl p-8 bg-blue-50/50">
            <h3 className="text-xl font-semibold text-blueprint-text mb-6 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-500" />
              Quick Installation (Recommended)
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-blueprint-text mb-3">For Mac &amp; Linux Users</h4>
                <ol className="space-y-2 text-blueprint-text/80">
                  <li>1. Open Terminal</li>
                  <li>2. Navigate to the mcp-server folder</li>
                  <li>3. Run: <code className="px-2 py-1 bg-blueprint-accent/10 rounded">./install.sh</code></li>
                  <li>4. Restart Claude Desktop</li>
                  <li>5. Look for the plugin icon in Claude</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-blueprint-text mb-3">For Windows Users</h4>
                <ol className="space-y-2 text-blueprint-text/80">
                  <li>1. Open PowerShell</li>
                  <li>2. Navigate to the mcp-server folder</li>
                  <li>3. Run: <code className="px-2 py-1 bg-blueprint-accent/10 rounded">.\install.ps1</code></li>
                  <li>4. Restart Claude Desktop</li>
                  <li>5. Look for the plugin icon in Claude</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="blueprint-paper border border-blueprint-accent/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-blueprint-text mb-4">Manual Installation</h3>
            <div className="space-y-4 text-blueprint-text/80">
              <p>If the automatic installer doesn't work, follow these steps:</p>

              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-2">1. Install Dependencies</p>
                  <code className="block px-4 py-2 bg-blueprint-accent/10 rounded">
                    cd mcp-server<br />
                    npm install
                  </code>
                </div>

                <div>
                  <p className="font-medium mb-2">2. Build the Server</p>
                  <code className="block px-4 py-2 bg-blueprint-accent/10 rounded">
                    npm run build
                  </code>
                </div>

                <div>
                  <p className="font-medium mb-2">3. Configure Claude Desktop</p>
                  <p className="text-sm mb-2">Add this to your Claude Desktop config file:</p>
                  <p className="text-sm mb-2">
                    <strong>Mac/Linux:</strong> <code className="px-2 py-1 bg-blueprint-accent/10 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                  </p>
                  <p className="text-sm mb-3">
                    <strong>Windows:</strong> <code className="px-2 py-1 bg-blueprint-accent/10 rounded">%APPDATA%\Claude\claude_desktop_config.json</code>
                  </p>
                  <pre className="text-xs px-4 py-3 bg-blueprint-accent/10 rounded overflow-x-auto">
{`{
  "mcpServers": {
    "blueprint-generator": {
      "command": "node",
      "args": ["/full/path/to/mcp-server/build/index.js"]
    }
  }
}`}
                  </pre>
                  <p className="text-sm text-blueprint-text/60 mt-2">
                    Replace <code className="px-2 py-1 bg-blueprint-accent/10 rounded">/full/path/to/</code> with your actual path
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-2">4. Restart Claude Desktop</p>
                  <p>Completely quit and restart Claude Desktop for changes to take effect.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="blueprint-paper border border-green-500/20 rounded-xl p-8 bg-green-50/50">
            <h3 className="text-xl font-semibold text-blueprint-text mb-4">Example Commands</h3>
            <p className="text-blueprint-text/70 mb-4">Once connected, try these commands in Claude:</p>
            <ul className="space-y-2 text-blueprint-text/80">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">•</span>
                <span>"Create a photography portfolio with a gallery page"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">•</span>
                <span>"Show me the most popular blueprints"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">•</span>
                <span>"Find blueprints about restaurants"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">•</span>
                <span>"Build a blog with 5 posts about technology"</span>
              </li>
            </ul>
          </div>

          <div className="blueprint-paper border border-blueprint-accent/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-blueprint-text mb-4">Troubleshooting</h3>
            <div className="space-y-4 text-blueprint-text/80">
              <div>
                <p className="font-medium mb-2">MCP server not showing up?</p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• Make sure you completely quit and restarted Claude Desktop</li>
                  <li>• Check the config file path is correct for your operating system</li>
                  <li>• Verify Node.js is installed: run <code className="px-2 py-1 bg-blueprint-accent/10 rounded">node --version</code></li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Connection errors?</p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• The server connects to a shared database, no credentials needed</li>
                  <li>• Check your internet connection</li>
                  <li>• Try running <code className="px-2 py-1 bg-blueprint-accent/10 rounded">npm run build</code> again in the mcp-server folder</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
