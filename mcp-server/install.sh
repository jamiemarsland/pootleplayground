#!/bin/bash

set -e

echo "======================================"
echo "Blueprint MCP Server Installer"
echo "======================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📍 Installation directory: $SCRIPT_DIR"
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

if [ ! -f "$SCRIPT_DIR/.env.example" ]; then
    echo "❌ Error: .env.example file not found!"
    echo "Please run this script from the mcp-server directory."
    exit 1
fi

echo "======================================"
echo "Step 1: Using Shared Supabase Project"
echo "======================================"
echo ""
echo "This MCP server connects to the Blueprint Generator's"
echo "shared Supabase database. All users share the same"
echo "community blueprint gallery."
echo ""

SUPABASE_URL="https://qnhseyvcanynadeewdxk.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaHNleXZjYW55bmFkZWV3ZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTk0ODMsImV4cCI6MjA3NTM5NTQ4M30.dUoFBKVFUHR_RZHH3GWw1O2T_yI5RB5yNZMBi8x4HCc"

echo "✓ Connected to Blueprint Generator community database"
echo ""

echo "======================================"
echo "Step 2: Installing Dependencies"
echo "======================================"
echo ""

cd "$SCRIPT_DIR"
npm install

echo ""
echo "✓ Dependencies installed"
echo ""

echo "======================================"
echo "Step 3: Building Server"
echo "======================================"
echo ""

npm run build

echo ""
echo "✓ Server built successfully"
echo ""

DIST_PATH="$SCRIPT_DIR/dist/index.js"

if [ ! -f "$DIST_PATH" ]; then
    echo "❌ Error: Build failed - dist/index.js not found!"
    exit 1
fi

echo "======================================"
echo "Step 4: Configuring Claude Desktop"
echo "======================================"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

CONFIG_DIR=$(dirname "$CONFIG_PATH")

if [ ! -d "$CONFIG_DIR" ]; then
    echo "Creating Claude config directory..."
    mkdir -p "$CONFIG_DIR"
fi

if [ -f "$CONFIG_PATH" ]; then
    echo "Backing up existing config to ${CONFIG_PATH}.backup"
    cp "$CONFIG_PATH" "${CONFIG_PATH}.backup"

    if command -v python3 &> /dev/null; then
        python3 -c "
import json
import sys

config_path = '$CONFIG_PATH'
try:
    with open(config_path, 'r') as f:
        config = json.load(f)
except:
    config = {}

if 'mcpServers' not in config:
    config['mcpServers'] = {}

config['mcpServers']['blueprint-generator'] = {
    'command': 'node',
    'args': ['$DIST_PATH'],
    'env': {
        'VITE_SUPABASE_URL': '$SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY': '$SUPABASE_ANON_KEY'
    }
}

with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print('✓ Configuration updated')
" || {
            echo "⚠️  Warning: Could not automatically update config file."
            echo "Please manually add the configuration (instructions below)."
        }
    else
        echo "⚠️  Warning: Python3 not found. Cannot automatically update config."
        echo "Please manually add the configuration (instructions below)."
    fi
else
    cat > "$CONFIG_PATH" << EOF
{
  "mcpServers": {
    "blueprint-generator": {
      "command": "node",
      "args": ["$DIST_PATH"],
      "env": {
        "VITE_SUPABASE_URL": "$SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY": "$SUPABASE_ANON_KEY"
      }
    }
  }
}
EOF
    echo "✓ Configuration file created"
fi

echo ""
echo "======================================"
echo "✅ Installation Complete!"
echo "======================================"
echo ""
echo "Configuration saved to: $CONFIG_PATH"
echo "Server location: $DIST_PATH"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop completely (Quit and reopen)"
echo "2. Open a new conversation"
echo "3. Look for the 🔌 icon to verify MCP connection"
echo ""
echo "If you don't see the connection:"
echo "- Make sure Claude Desktop is completely closed"
echo "- Check the config file at: $CONFIG_PATH"
echo "- Restart your computer if needed"
echo ""
echo "For troubleshooting, see: $SCRIPT_DIR/README.md"
echo ""
