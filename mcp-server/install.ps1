# Blueprint MCP Server Installer for Windows
# Run with: .\install.ps1

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Blueprint MCP Server Installer" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "📍 Installation directory: $ScriptDir" -ForegroundColor White
Write-Host ""

try {
    $nodeVersion = node --version 2>$null
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "$ScriptDir\.env.example")) {
    Write-Host "❌ Error: .env.example file not found!" -ForegroundColor Red
    Write-Host "Please run this script from the mcp-server directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Step 1: Using Shared Supabase Project" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This MCP server connects to the Blueprint Generator's" -ForegroundColor White
Write-Host "shared Supabase database. All users share the same" -ForegroundColor White
Write-Host "community blueprint gallery." -ForegroundColor White
Write-Host ""

$SupabaseUrl = "https://qnhseyvcanynadeewdxk.supabase.co"
$SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaHNleXZjYW55bmFkZWV3ZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTk0ODMsImV4cCI6MjA3NTM5NTQ4M30.dUoFBKVFUHR_RZHH3GWw1O2T_yI5RB5yNZMBi8x4HCc"

Write-Host "✓ Connected to Blueprint Generator community database" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Step 2: Installing Dependencies" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ScriptDir
npm install

Write-Host ""
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Step 3: Building Server" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

npm run build

Write-Host ""
Write-Host "✓ Server built successfully" -ForegroundColor Green
Write-Host ""

$DistPath = Join-Path $ScriptDir "dist\index.js"

if (-not (Test-Path $DistPath)) {
    Write-Host "❌ Error: Build failed - dist\index.js not found!" -ForegroundColor Red
    exit 1
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Step 4: Configuring Claude Desktop" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ConfigPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
$ConfigDir = Split-Path -Parent $ConfigPath

if (-not (Test-Path $ConfigDir)) {
    Write-Host "Creating Claude config directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
}

$Config = @{}
if (Test-Path $ConfigPath) {
    Write-Host "Backing up existing config to ${ConfigPath}.backup" -ForegroundColor Yellow
    Copy-Item $ConfigPath "${ConfigPath}.backup" -Force

    try {
        $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json -AsHashtable
    } catch {
        Write-Host "⚠️  Warning: Could not parse existing config. Creating new one." -ForegroundColor Yellow
        $Config = @{}
    }
}

if (-not $Config.ContainsKey("mcpServers")) {
    $Config["mcpServers"] = @{}
}

$Config["mcpServers"]["blueprint-generator"] = @{
    command = "node"
    args = @($DistPath)
    env = @{
        VITE_SUPABASE_URL = $SupabaseUrl
        VITE_SUPABASE_ANON_KEY = $SupabaseAnonKey
    }
}

$Config | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath -Encoding UTF8

Write-Host "✓ Configuration file updated" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration saved to: $ConfigPath" -ForegroundColor White
Write-Host "Server location: $DistPath" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Claude Desktop completely (Right-click system tray → Quit)" -ForegroundColor White
Write-Host "2. Open a new conversation" -ForegroundColor White
Write-Host "3. Look for the 🔌 icon to verify MCP connection" -ForegroundColor White
Write-Host ""
Write-Host "If you don't see the connection:" -ForegroundColor Yellow
Write-Host "- Make sure Claude Desktop is completely closed (check Task Manager)" -ForegroundColor White
Write-Host "- Check the config file at: $ConfigPath" -ForegroundColor White
Write-Host "- Restart your computer if needed" -ForegroundColor White
Write-Host ""
Write-Host "For troubleshooting, see: $ScriptDir\README.md" -ForegroundColor White
Write-Host ""
