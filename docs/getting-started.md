
# Getting Started

This guide will help you set up and start developing with the Activity Editor.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- PostgreSQL database (Neon serverless recommended)
- Figma account (optional, for import features)

## Installation

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Figma (optional)
FIGMA_ACCESS_TOKEN=your_figma_token_here

# NACA Platform (optional)
NACA_BASE_URL=https://your-naca-platform.com
```

### 3. Database Setup

```bash
# Run migrations
npm run db:push

# Verify connection
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Access the application at `http://localhost:5000`

## Project Structure

```
activity-editor/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and API clients
│   │   ├── contexts/    # React contexts
│   │   └── pages/       # Page components
├── server/              # Backend Express application
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database abstraction
│   ├── dev-sync.ts      # WebSocket server
│   └── figma-service.ts # Figma integration
├── shared/              # Shared types and schema
│   ├── schema.ts        # Drizzle ORM schema
│   └── types.ts         # TypeScript types
├── docs/                # Documentation
└── attached_assets/     # Static assets and generated files
```

## First Steps

### 1. Create Your First Project

1. Navigate to the home page
2. Click "Create New Project"
3. Enter project name and description
4. Optionally connect to a Figma file

### 2. Import Figma Designs (Optional)

1. Get your Figma file URL
2. Paste it into the Figma connection panel
3. Click "Sync Frames"
4. Frames will be imported as screens

### 3. Create Game Objects

1. Select a screen
2. Click on the canvas to create objects
3. Use the attribute editor to customize properties
4. Add custom IDs, classes, and tags

### 4. Set Up Animations

1. Select an object
2. Open the Timeline Panel (bottom)
3. Add keyframes at different times
4. Set property values (position, rotation, scale, opacity)
5. Choose easing curves

### 5. Configure Scenes

1. Open Scene Manager (right panel)
2. Create scenes for different states
3. Set object properties per scene
4. Add triggers to switch scenes

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Building for Production

```bash
# Build client and server
npm run build

# Preview production build
npm run preview
```

### Database Migrations

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Next Steps

- Read [Architecture Overview](./architecture.md) to understand the system design
- Explore [Feature Documentation](./features/README.md) for detailed feature guides
- Check [NACA Integration](./naca-integration.md) for platform integration
- Review [API Reference](./api-reference.md) for backend endpoints

## Troubleshooting

### Port Already in Use

If port 5000 is occupied:
```bash
# Kill process on port 5000
npx kill-port 5000

# Or use a different port
PORT=3000 npm run dev
```

### Database Connection Issues

```bash
# Verify DATABASE_URL is set correctly
echo $DATABASE_URL

# Test connection
npm run db:studio
```

### Figma Import Not Working

- Verify FIGMA_ACCESS_TOKEN is set
- Check token has read access to the file
- Ensure file URL is correct format

## Getting Help

- Check [Prompt History](../attached_assets/PROMPT_HISTORY.md) for development context
- Review [Roadmap](./roadmap.md) for planned features
- Check console logs for errors
- Enable DevSync indicator for real-time status
