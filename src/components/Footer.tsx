import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer
      style={{
        background: '#ffffff',
        borderTop: '1px solid #dcdcde',
        padding: '10px 24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <Link
          to="/mcp-instructions"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#787c82', textDecoration: 'none', transition: 'color 0.12s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#2271b1')}
          onMouseOut={e => (e.currentTarget.style.color = '#787c82')}
        >
          <BookOpen style={{ width: 13, height: 13 }} />
          MCP Instructions
        </Link>
      </div>
    </footer>
  );
}
