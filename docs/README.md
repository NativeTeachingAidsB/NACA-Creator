
# Activity Editor Documentation

Welcome to the Activity Editor documentation. This is a comprehensive guide for developers working on the NACA Activity Editor platform.

## Table of Contents

1. [Getting Started](./getting-started.md)
2. [Architecture Overview](./architecture.md)
3. [Feature Documentation](./features/README.md)
4. [API Reference](./api-reference.md)
5. [NACA Integration](./naca-integration.md)
6. [Development Guide](./development-guide.md)
7. [Component Reference](./components/README.md)
8. [Roadmap](./roadmap.md)

## Quick Links

- [Prompt History](../attached_assets/PROMPT_HISTORY.md) - Development history and feature requests
- [Project Roadmap](../ROADMAP.md) - Current and planned features
- [NACA Platform Documentation](./naca-integration.md) - Integration details

## What is Activity Editor?

Activity Editor is a content authoring tool for creating interactive, data-driven language learning games with Figma integration. It's part of the NACA (NativeTongueLexicon Activity Center) platform.

### Key Features

- **Figma Integration**: Import designs directly from Figma
- **Timeline Animation**: Adobe Animate-style keyframe animation system
- **Scene Management**: Multiple states per screen with triggers
- **Vocabulary System**: Language learning content management
- **Real-time Sync**: DevSync WebSocket integration with NACA platform
- **Media Library**: Audio, image, and video asset management

## System Requirements

- Node.js 18+
- PostgreSQL (Neon serverless)
- Modern web browser
- Figma API token (for import features)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5000
```

See [Getting Started](./getting-started.md) for detailed setup instructions.
