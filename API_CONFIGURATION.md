# API Configuration Guide

This frontend application is ready to connect to your existing diagram generation API. Here's how to configure the API URL:

## Method 1: Environment Variable (Recommended)

1. Create a `.env` file in the root directory of the project:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and set your API URL:
   ```
   VITE_API_URL=http://your-api-url:port
   ```

3. Restart the development server for changes to take effect.

## Method 2: Direct Configuration

Alternatively, you can directly edit the configuration file:

1. Open `client/src/lib/config.ts`
2. Change the fallback URL to your API endpoint:
   ```typescript
   export const API_URL = import.meta.env.VITE_API_URL || "http://your-api-url:port";
   ```

## API Endpoints Expected

The frontend expects your API to have the following endpoints:

- `POST /{diagramType}/{format}` - Generate a diagram
  - **diagramType**: `mermaid`, `graphviz`, `bpmn`, or `excalidraw`
  - **format**: `svg` or `png`
  - **Request Body**: Plain text containing the diagram code
  - **Response**: Image file (SVG or PNG)

### Example API Calls

```bash
# Mermaid SVG
POST http://your-api:port/mermaid/svg
Content-Type: text/plain

sequenceDiagram
    participant Alice
    participant Bob
    Bob->>Alice: Hi Alice
    Alice->>Bob: Hi Bob
```

```bash
# Graphviz PNG
POST http://your-api:port/graphviz/png
Content-Type: text/plain

digraph G {
    A -> B;
    B -> C;
}
```

## Current Default

The default API URL is set to: `http://10.11.0.28:8000`

Change this to match your API server location.

## Testing

After configuration:
1. Start the development server: `npm run dev`
2. Open the app in your browser
3. Try generating a diagram with the default Mermaid example
4. If successful, you should see the generated diagram in the preview area
