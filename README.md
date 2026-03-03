# WordPress Blueprint Generator

A powerful visual tool for creating WordPress site blueprints that can be instantly launched in WordPress Playground. Design complete WordPress sites with pages, posts, plugins, themes, and more through an intuitive interface or AI-powered generation.

## Features

- **Visual Blueprint Builder**: Create WordPress sites step-by-step with an easy-to-use interface
- **AI-Powered Generation**: Describe your site in natural language and let AI build the blueprint
- **Community Gallery**: Browse and use blueprints created by the community
- **Instant WordPress Playground**: Every blueprint generates a WordPress Playground URL for immediate testing
- **Save & Share**: Save your blueprints and share them with others
- **Screenshot Management**: Add screenshots to showcase your blueprints
- **Voting System**: Upvote your favorite community blueprints

## Getting Started

### Web Interface

1. Visit the web application
2. Choose to start from scratch or browse the gallery
3. Add steps to build your WordPress site:
   - Install plugins and themes
   - Create pages and posts
   - Add media files
   - Configure menus and settings
   - Set homepage and site options
4. Generate and launch in WordPress Playground
5. Save and share your blueprint with the community

### AI Generator

1. Click "AI Generator" in the interface
2. Describe the WordPress site you want to create
3. The AI will generate a complete blueprint with all necessary steps
4. Review, customize, and launch in WordPress Playground

## Claude Integration (MCP Server)

This project includes a Model Context Protocol (MCP) server that allows you to interact with the Blueprint Generator directly through Claude Desktop.

### What You Can Do

- **Generate Sites with Natural Language**: "Create a photography portfolio with a gallery page"
- **Browse Community Blueprints**: "Show me the most popular blueprints"
- **Search for Specific Templates**: "Find blueprints about restaurants"
- **Get Detailed Information**: "Tell me about blueprint abc-123"

### Setup Instructions

See the [MCP Server README](./mcp-server/README.md) for complete installation and configuration instructions.

Quick setup:

```bash
# Install dependencies
cd mcp-server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Build the server
npm run build

# Add to Claude Desktop config
# See mcp-server/README.md for detailed instructions
```

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (for database and edge functions)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
├── src/
│   ├── components/        # React components
│   ├── utils/            # Utility functions
│   ├── lib/              # Library integrations (Supabase)
│   └── types/            # TypeScript type definitions
├── mcp-server/           # MCP server for Claude integration
│   ├── src/
│   │   └── index.ts      # MCP server implementation
│   └── README.md         # MCP server documentation
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
└── public/               # Static assets
```

### Database

This project uses Supabase for data persistence. The database schema includes:

- **blueprints**: Stores blueprint data, metadata, and voting information
- **wordpress_studio_blueprints**: Stores WordPress Studio format blueprints
- **ai_blueprint_history**: Tracks AI-generated blueprints
- **shared_links**: Manages shared blueprint links

### Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Features in Detail

### Blueprint Steps

The builder supports various step types:

- **Install Plugin**: Add WordPress plugins from the repository or custom sources
- **Install Theme**: Add and activate WordPress themes
- **Add Page**: Create WordPress pages with content
- **Add Post**: Create blog posts
- **Add Media**: Upload images and media files
- **Set Homepage**: Configure the site's homepage
- **Create Navigation Menu**: Build custom menus
- **Set Site Options**: Configure WordPress settings
- **Add User Role**: Create custom user roles with capabilities
- **Login Configuration**: Set up admin credentials
- **WP-Config**: Define WordPress configuration constants

### Community Features

- **Public Gallery**: Share your blueprints with the community
- **Voting System**: Upvote blueprints you find useful
- **Search & Filter**: Find blueprints by keywords and popularity
- **Screenshot Previews**: See visual previews of blueprints

### Admin Features

- Manage all community blueprints
- Delete inappropriate content
- Edit blueprint screenshots
- Access protected features

## Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Edge Functions, Storage)
- **AI**: OpenAI GPT-4 (via Supabase Edge Functions)
- **Integration**: Model Context Protocol (MCP) for Claude Desktop
- **Target Platform**: WordPress Playground

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT

## Support

For issues or questions:
- Check the documentation
- Review existing issues
- Open a new issue with details about your problem

## Acknowledgments

- WordPress Playground team for the amazing platform
- Supabase for the backend infrastructure
- Anthropic for Claude and MCP
- OpenAI for AI-powered blueprint generation
