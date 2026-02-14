# Overview

Indigamate Studio is an interactive game builder designed for creating language learning applications. It facilitates the rapid prototyping and iteration of interactive educational experiences by allowing users to import designs, define interactive game objects, set up scenes with various states, and configure dynamic triggers. The platform aims to streamline the development process from initial design to interactive prototype for language learning content.

# User Preferences

Preferred communication style: Simple, everyday language.

## Prime Directives

> **Quick Reference:** Use *Status Keywords* to control session state. Use *Chain Keywords* for sequential task execution. Use *Selection Keywords* to act on specific components. Use *Base Keywords* to adjust agent modes or trigger workflows.

### Status Keywords
*Control session state and view progress reports.*

| Keyword | Trigger | Behavior |
|---------|---------|----------|
| **Status** | User says "Status" | Display all Prime Directives, current plans with task statuses, current agent modes, open tasks list, and documentation mode |
| **Continue** | User says "Continue" | Gather all open tasks, proceed with first task, prompt review after each completion |
| **Pause** | User says "Pause" | Finish current task, wait for quick task, then await further instructions |
| **Resume** | User says "Resume" | Resume paused tasks and continue through task list |
| **Skip** | User says "Skip" | Skip current task, move to next. Skipped tasks queued for end. Prompt for each skipped item when revisiting. |

### Chain Keywords
*Execute a series of instructions in sequence with approval prompts.*

| Keyword | Syntax | Behavior |
|---------|--------|----------|
| **Chain** | `Chain [task1]. [task2]. [task3].` | Parse instructions into ordered steps. Execute sequentially with approval prompt before each step. |

**Chain Execution Protocol:**
1. Parse chain into numbered steps
2. Display chain overview:
   ```
   Chain detected with N steps:
   1. [First task]
   2. [Second task]
   3. [Third task]
   Proceed with Step 1?
   ```
3. After each step completion, prompt:
   ```
   ✓ Step N complete. Proceed to Step N+1: [next task]?
   ```
4. User can respond: Yes/Continue, Skip, or Stop
5. If **Skip** used during chain: task moves to end of chain queue

**Skip Behavior in Chains:**
- Skipped tasks are collected and queued after all other chain steps complete
- When revisiting skipped items, prompt for each:
  ```
  Skipped items remaining: [count]
  Next skipped item: [task description]
  Continue with this task? (Yes/Skip again/Remove)
  ```
- "Skip again" moves item to end of skipped queue
- "Remove" discards the task entirely

**Example Chain:**
```
Chain
Agent properties.
NACA API update.
Implement NACA agent status drawer.
```

### Scope Keywords
*Define boundaries of work to manage efficiency and prevent scope creep.*

| Scope | Description | Behavior |
|-------|-------------|----------|
| **Regional** | Localized changes | Work affects specific feature, component, or file. Default scope for most tasks. |
| **Global** | Project-wide changes | Work affects architecture, multiple systems, or requires refactoring across the codebase. |

**Scope Escalation Protocol:**
- Current work begins at **Regional** scope by default
- If during work I identify the need for broader changes, I will prompt:
  > **Scope Escalation Request:** This task may require Global scope changes affecting [list affected areas]. Approve scope increase?
- User must approve before proceeding with Global-scope work
- Scope status displayed in task updates

**Current Scope:** Regional

**Status Display Details:**
- **Open Tasks List** (ordered by priority 1-N):
  | # | Task | UI | UX | Data | Improvements | Age | Relevancy |
  |---|------|----|----|------|--------------|-----|-----------|
  - UI/UX/Data: Status levels (None/Partial/Complete)
  - Improvements: Suggested enhancements
  - Age: Recent/Mid-term/Legacy
  - Relevancy: High/Medium/Low

- **Documentation Mode:**
  | Mode | Name | Behavior |
  |------|------|----------|
  | 1 | Active | Real-time documentation updates during work |
  | 2 | Reminder | Prompt: "Documentation may be stale. Update replit.md?" |
  | 3 | WaitMode | Prompt: "Session idle. Review documentation before continuing?" |

### Selection Keywords
*Target specific objects, components, or features for action.*

| Keyword | Syntax | Scope | Output |
|---------|--------|-------|--------|
| **Inspect** | `Inspect [target]` | Read-only | Description: type, location, purpose, functionality, connections, state |
| **Implement** | `Implement [target]` | Full-stack | Consult architect, connect components, test end-to-end |
| **Refactor** | `Refactor [target] [description]` | Varies | Plan: current state, target outcome, steps, dependencies, tests |
| **Fix** | `Fix [target]` | Targeted | Build context, diagnose, resolve, test verification |
| **Test** | `Test [target]` | Verification | Comprehensive scenarios, execute tests, report findings, suggest fixes |
| **Remove** | `Remove [target]` | UI-only | Remove UI elements, keep backend intact, confirm before executing |
| **Remove Deep** | `Remove Deep [target]` | Full-stack | Analyze all layers, display impact warning, require confirmation |

**Remove Deep Impact Warning:**
| Category | Affected Items |
|----------|----------------|
| UI | Components to be removed |
| Routes | API endpoints affected |
| Database | Tables/columns to be dropped |
| Types | Schemas and interfaces |
| Dependencies | Features that depend on this |

*Execution order: UI → routes → types → database*

### Base Keywords
*Control agent modes, workflows, and global behaviors.*

| Keyword | Trigger | Behavior |
|---------|---------|----------|
| **Agent Status** | User says "Agent Status" | Display all mode options, ask which to change |
| **Build** | User says "Build" | Display modes, prompt for mode selection before starting |
| **API Update** | User says "API Update" | Check NACA docs, compare implementation, update client/types/hooks, test, document |
| **Testing Workflow** | During fixes/bugs | Prompt "**Testing:**" with verification action, wait for user confirmation |

**Mode Selection Format:**
```
Current modes: [Builder: X, Planner: Y, Tester: Z]
Would you like to change any modes before we begin?
```

*See Agent Modes section below for available options.*

## Agent Modes

### Builder Modes
| Mode | Description |
|------|-------------|
| UI/UX Component Specialist | Focus on visual components, styling, user interactions |
| Domain Specialist | Focus on business logic and domain-specific features |
| Routing Specialist | Focus on navigation, routes, page structure |
| Component Specialist | Focus on reusable component architecture |
| API | Focus on backend endpoints, data flow, integrations |
| Testing | Focus on debugging, fix verification, user-prompted testing workflow |

### Tester Modes
| Mode | Description |
|------|-------------|
| Auto Tester | Automated testing after each build/fix |
| Auto Tester Task Group | Test all tasks in a group together |
| Auto Tester Individual Task | Test each task individually as completed |
| Auto Tester Individual Completing for Verification | Test individual items requiring user verification before marking complete |
| Prompt Mode | Prompt user with "**Testing:**" for each fix/feature, asking for verification or feedback before proceeding |

### Planner Modes
| Mode | Description |
|------|-------------|
| UI/UX | Planning for visual design and user experience |
| Infrastructure | Planning for system architecture, deployment, scaling |
| Data | Planning for data models, database schema, relationships |
| API | Planning for API design, endpoints, integrations |

### Expertise Modes
*Define the agent's focus area for optimized behavior.*

| Mode | Description |
|------|-------------|
| UI/UX | Visual components, styling, user interactions (default) |
| Data | Data models, database schema, relationships |
| Testing | Debugging, verification, quality assurance |
| Creative Analysis | Design analysis and creative problem solving |
| Routing | Navigation, routes, page structure |
| Domains | Business logic and domain-specific features |
| Interactive Data-Driven Animation | GSAP animations, interactive elements, data binding |

### Response Styles
*Control how the agent formats its output.*

| Style | Description |
|-------|-------------|
| Bullet Points | Concise bullet-point format for quick scanning |
| Brief | Short, focused responses with essential information (default) |
| Verbose | Detailed explanations with full context |

### Completion Levels
*Set the target completion level for agent work.*

| Level | Description |
|-------|-------------|
| Wireframing | Basic structure and layout placeholders |
| UI/UX | Visual design with styling but limited functionality |
| Fully Functional & Tested | Complete implementation with testing verification (default) |
| Expert Analyzed Refactor | Production-ready code with optimization and best practices |

### Current Preferences
- **Builder Mode**: API
- **Planner Mode**: API
- **Tester Mode**: Auto Tester
- **Expertise**: UI/UX
- **Response**: Brief
- **Completion**: Fully Functional & Tested

# System Architecture

## Frontend
The frontend uses React, TypeScript, and Vite, with Wouter for routing and TanStack Query for server state. UI components are built with shadcn/ui (Radix UI + Tailwind CSS) in a "new-york" style. GSAP handles canvas animations, and React Hook Form with Zod manages form validation. The architecture prioritizes component-based design, real-time visual feedback, dual edit/preview modes, and responsive touch interactions.

## Backend
The backend is built with Node.js, Express.js, and TypeScript, offering a RESTful API for managing game content (screens, objects, scenes, states, triggers). It features a storage abstraction for database independence and centralized error handling.

## Database and ORM
PostgreSQL (Neon serverless) is the chosen database, managed with Drizzle ORM for type-safe schemas. Drizzle Kit handles migrations, and Drizzle-Zod generates Zod schemas.

## Key Features
- **SVG Import & Figma Integration**: Supports multi-source SVG import (Figma, Adobe Illustrator, Animate) with automatic source detection and smart re-sync for Figma layers.
- **Interactive Elements**: Features object management (`customId`, `classes`, `tags`, `zIndex`), an advanced trigger system with CSS-like selectors, multiple targets, various actions, and conditional logic.
- **Content Management**: Includes vocabulary and media management (add, categorize, search, bind to objects), NACA dictionary integration, and activity export.
- **NACA Integration**: Real-time bidirectional WebSocket synchronization (DevSync), CRUD for activity drafts, notifications, changelog tracking, authentication (Replit OAuth, JWT), rate limiting, API monitoring, and server environment switching.
- **Editor UX & Design**: Resizable panels, persistent states, Adobe Animate-style shortcuts, dual selection tools (Illustrator-style), Figma-style transform handles, GSAP timeline engine, keyframe editing, and a contextual interface assistance system.
- **Professional Editor Features**: Includes Z-order, snapping, alignment, enhanced zoom, undo/redo, duplicate, export, rulers, outline mode, styles, components, constraints, prototyping, micro-interactions, loading states, touch/trackpad improvements, version history, and collaboration UI mocks. Enhanced right-click context menu with Group Actions submenu (Enter Group/Isolation, Exit Isolation, Select All Inside with child count, Ungroup).
- **Enhanced Timeline Features**: Time ruler, draggable playhead, work area controls, multi-keyframe selection, keyframe operations, shift-constrained drag, and per-keyframe interpolation.
- **API Documentation System**: Auto-generated bi-directional API documentation for NACA, including schema drift detection and specific endpoints for activity editor, rebuild, and publish.
- **Administration Tools System**: Comprehensive settings management with 5 configuration areas:
  - **Site Settings**: Video help, tooltips, autosave, notifications, NACA environment switching, Agent Expertise mode selection (7 modes with UI/UX as default)
  - **Keyboard Shortcuts**: Custom key bindings with conflict detection and enable/disable toggles
  - **Component Options**: Canvas grid/snap settings, timeline increments, object visibility controls
  - **Workspace Layout**: Resizable panel dimensions with 4 preset layouts (default/compact/expanded/custom)
  - **Theming**: Light/dark/system modes, 8 font families, community font integration with @font-face injection, accent colors, UI density, border radius. URL validation and sanitization for security.

# External Dependencies

## Core Frameworks
*   React
*   Express.js
*   Vite
*   TypeScript

## Data Management
*   Neon Serverless PostgreSQL
*   Drizzle ORM
*   Drizzle Kit
*   Drizzle Zod

## UI & Styling
*   Radix UI
*   shadcn/ui
*   Tailwind CSS
*   Lucide React

## State & Forms
*   TanStack Query
*   React Hook Form
*   Zod

## Animation & Routing
*   GSAP
*   Wouter

## Utilities
*   date-fns
*   nanoid
*   clsx, tailwind-merge

## Session Management
*   express-session
*   connect-pg-simple