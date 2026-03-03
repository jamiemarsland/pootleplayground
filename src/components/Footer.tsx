import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="blueprint-paper border-t border-blueprint-accent/30 py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-sm text-blueprint-text/70">
        <Link
          to="/mcp-instructions"
          className="flex items-center gap-2 hover:text-blueprint-accent transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>MCP Instructions</span>
        </Link>
      </div>
    </footer>
  );
}
