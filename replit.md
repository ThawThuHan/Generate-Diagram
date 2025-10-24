# Diagram Generator Application

## Overview

This is a web-based diagram generation tool that allows users to create diagrams using various formats (Mermaid, Graphviz, BPMN, and Excalidraw) and export them as SVG or PNG images. The application features a clean, split-view interface with a code editor on the left and real-time diagram preview on the right.

The frontend is built with React, TypeScript, and Vite, using shadcn/ui components for the UI layer. It connects to an external diagram rendering API to generate images from diagram code.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool.

**Rationale**: Vite provides fast development builds and hot module replacement, while TypeScript ensures type safety. React is chosen for its component-based architecture and ecosystem.

**UI Component System**: shadcn/ui (Radix UI primitives with Tailwind CSS).

**Rationale**: Provides accessible, customizable components that follow modern design patterns. The "New York" style variant is used for a clean, professional aesthetic. Components are locally owned (not installed as dependencies), allowing full customization.

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables.

**Rationale**: Utility-first CSS enables rapid UI development with consistent spacing, colors, and responsive design. Custom CSS variables support theme switching and maintain design system consistency.

**State Management**: React hooks (useState) for local component state, TanStack Query for server state.

**Rationale**: TanStack Query handles API calls, caching, and loading states declaratively. Local state is sufficient for UI interactions since there's minimal global state requirements.

**Routing**: Wouter (lightweight routing library).

**Rationale**: Minimalist routing solution suitable for the single-page application with limited route complexity. Avoids the overhead of React Router for a simple use case.

**Design System**: Follows Linear, Excalidraw, and Mermaid Live Editor patterns with focus on split-view efficiency and minimal distraction.

**Rationale**: Developer-focused tools require clarity and fast iteration. The split-view allows simultaneous editing and preview without context switching.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**Rationale**: Express provides a minimal, flexible HTTP server foundation. TypeScript compilation with esbuild creates efficient production bundles.

**Development Setup**: Custom Vite middleware integration for seamless HMR during development.

**Rationale**: Allows the Express server to serve Vite's development assets while handling API routes, creating a unified development experience.

**API Design**: The backend currently serves as a pass-through proxy. The actual diagram generation is handled by an external API service.

**Rationale**: Separates concerns between the UI application and the compute-intensive diagram rendering. Allows independent scaling and deployment of rendering services.

**Storage Layer**: In-memory storage implementation with an interface pattern (IStorage).

**Rationale**: Provides flexibility to swap storage backends (e.g., add PostgreSQL via Drizzle ORM later) without changing business logic. Currently includes placeholder user management schema.

### Data Storage Solutions

**Database ORM**: Drizzle ORM configured for PostgreSQL with schema definitions.

**Current State**: Database configuration exists but is not actively used. Schema defines a basic users table with UUID primary keys.

**Rationale**: Drizzle provides type-safe database queries with minimal overhead. PostgreSQL support via @neondatabase/serverless allows serverless deployment scenarios.

**Session Storage**: connect-pg-simple configured for PostgreSQL-backed sessions.

**Rationale**: Persistent session storage for when authentication is implemented. Currently unused but infrastructure is in place.

### External Dependencies

**Diagram Rendering API**: External HTTP API that accepts diagram code and returns SVG/PNG images.

**Endpoints**:
- `POST /{diagramType}/{format}` where diagramType is mermaid/graphviz/bpmn/excalidraw and format is svg/png
- Request body contains plain text diagram code
- Response is the rendered image file

**Configuration**: API URL configurable via `VITE_API_URL` environment variable, with fallback to hardcoded URL in `client/src/lib/config.ts`.

**Rationale**: Environment-based configuration allows different API endpoints for development, staging, and production without code changes.

**Font Services**: Google Fonts for typography (Inter for UI, JetBrains Mono for code).

**Rationale**: Web fonts ensure consistent typography across platforms. Inter provides clean readability for UI elements, while JetBrains Mono offers excellent code legibility.

**Component Libraries**:
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling
- Lucide React for icons
- TanStack Query for data fetching

**Rationale**: Best-in-class solutions for their respective domains. Radix ensures accessibility compliance, Tailwind enables rapid styling, Lucide provides consistent iconography, and TanStack Query simplifies async state management.

**Development Tools**:
- Replit-specific plugins for error overlays, cartographer, and dev banners
- ESBuild for production server bundling
- Drizzle Kit for database schema migrations

**Rationale**: Replit plugins enhance the development experience on the Replit platform. ESBuild provides fast TypeScript compilation for production. Drizzle Kit manages database schema versioning.

### Authentication and Authorization

**Current State**: Infrastructure exists (session storage, user schema) but no authentication is implemented.

**Planned Approach**: User table schema suggests username/password authentication pattern.

**Rationale**: Authentication infrastructure is prepared but not active, allowing the diagram generation features to be developed and tested independently before adding user management complexity.