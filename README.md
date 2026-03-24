# Thoth

**Personal study tool.** A local application that combines features from Notion, Excalidraw, and Obsidian into a single integrated environment for organizing research, notes, documents, and academic tasks.

## Features

| Feature | Description |
|---|---|
| **Notes** | Rich-text editor with Tiptap (lists, tables, code, images, links) and hierarchical folder organization |
| **Documents/PDFs** | Upload, inline viewing with continuous scroll, text extraction, reading status, general summary, and per-page notes. Folder import via file explorer |
| **Diagrams** | Visual editor with Excalidraw for creating diagrams, flowcharts, and schemas |
| **Tasks/Kanban** | Kanban board with columns (To Do, In Progress, Done), drag-and-drop, priorities, and due dates |
| **Pomodoro** | Built-in timer (25min) that can be linked to tasks for focus tracking |
| **Flashcards SM-2** | Spaced repetition system with SM-2 algorithm for efficient memorization |
| **Tags** | Polymorphic tag system with colors for categorizing notes, documents, diagrams, and tasks |
| **Global Search** | Unified search across notes, documents, diagrams, and tasks (Ctrl+Shift+K) |
| **Links** | Bidirectional connections between any entity in the system |
| **Quick Capture** | Quickly create notes and tasks with Ctrl+Shift+N |

## Architecture

### Monorepo Structure

```mermaid
graph TB
    subgraph Monorepo["Thoth (pnpm workspace)"]
        subgraph Apps["apps/"]
            WEB["@thoth/web<br/>React + Vite<br/>Port 5173"]
            API["@thoth/api<br/>Fastify + tRPC<br/>Port 3001"]
        end
        subgraph Packages["packages/"]
            SHARED["@thoth/shared<br/>Shared types"]
        end
    end

    WEB -->|"tRPC client"| API
    WEB -->|"workspace:*"| SHARED
    API -->|"workspace:*"| SHARED

    style WEB fill:#3b82f6,color:#fff
    style API fill:#10b981,color:#fff
    style SHARED fill:#8b5cf6,color:#fff
```

### Technology Stack

```mermaid
graph LR
    subgraph Frontend
        REACT["React 19"]
        VITE["Vite 6"]
        TW["Tailwind CSS v4"]
        TIPTAP["Tiptap"]
        EXCALIDRAW["Excalidraw"]
        DND["@dnd-kit"]
        RPDF["react-pdf"]
    end

    subgraph Communication
        TRPC_C["@trpc/client"]
        TQ["TanStack Query"]
        TRPC_S["@trpc/server"]
    end

    subgraph Backend
        FASTIFY["Fastify 5"]
        DRIZZLE["Drizzle ORM"]
        ZOD["Zod"]
    end

    subgraph Database
        SQLITE["SQLite<br/>(better-sqlite3)"]
    end

    REACT --> TRPC_C
    TRPC_C --> TQ
    TQ -->|"HTTP /trpc"| TRPC_S
    TRPC_S --> FASTIFY
    FASTIFY --> DRIZZLE
    DRIZZLE --> SQLITE

    style REACT fill:#61dafb,color:#000
    style FASTIFY fill:#10b981,color:#fff
    style SQLITE fill:#003b57,color:#fff
    style DRIZZLE fill:#c5f74f,color:#000
```

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** (package manager)
- **Docker** (optional, for container-based execution)

## Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone <repo-url>
cd thoth

# 2. Install dependencies
pnpm install

# 3. Run database migrations
pnpm db:migrate

# 4. Start in development mode (API + Web simultaneously)
pnpm dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

### Docker

```bash
# Build and start
docker compose up -d

# The application will be available at http://localhost:3001
```

The container serves both the API and the built frontend on a single port (3001). Data (SQLite + PDFs) is persisted in the `./data` volume.

## Project Structure

```
thoth/
├── apps/
│   ├── api/                        # Backend (Fastify + tRPC)
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts       # Table definitions (Drizzle)
│   │   │   │   ├── index.ts        # SQLite connection
│   │   │   │   ├── migrate.ts      # Migration script
│   │   │   │   └── migrations/     # Generated SQL files
│   │   │   ├── trpc/
│   │   │   │   ├── router.ts       # Main router
│   │   │   │   ├── trpc.ts         # tRPC configuration
│   │   │   │   ├── context.ts      # Context (db)
│   │   │   │   └── procedures/     # Domain routers
│   │   │   │       ├── notes.ts
│   │   │   │       ├── documents.ts
│   │   │   │       ├── diagrams.ts
│   │   │   │       ├── tasks.ts
│   │   │   │       ├── flashcards.ts
│   │   │   │       ├── tags.ts
│   │   │   │       ├── links.ts
│   │   │   │       ├── search.ts
│   │   │   │       └── health.ts
│   │   │   ├── services/
│   │   │   │   ├── storage.ts      # PDF management
│   │   │   │   └── pdf.ts          # Text extraction
│   │   │   ├── utils/
│   │   │   │   └── id.ts           # ID generation (nanoid)
│   │   │   ├── config.ts           # Configuration
│   │   │   └── index.ts            # Entry point
│   │   └── package.json
│   │
│   └── web/                        # Frontend (React + Vite)
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── AppShell.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   └── TopBar.tsx
│       │   │   ├── editor/
│       │   │   │   ├── NoteEditor.tsx
│       │   │   │   └── EditorToolbar.tsx
│       │   │   ├── documents/
│       │   │   │   ├── DocumentViewer.tsx
│       │   │   │   └── DocumentNoteEditor.tsx
│       │   │   ├── diagrams/
│       │   │   │   └── DiagramEditor.tsx
│       │   │   ├── search/
│       │   │   │   └── GlobalSearch.tsx
│       │   │   ├── TagManager.tsx
│       │   │   ├── PomodoroTimer.tsx
│       │   │   └── QuickCapture.tsx
│       │   ├── pages/
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── NotesPage.tsx
│       │   │   ├── DocumentsPage.tsx
│       │   │   ├── DiagramsPage.tsx
│       │   │   ├── TasksPage.tsx
│       │   │   └── FlashcardsPage.tsx
│       │   ├── hooks/
│       │   │   └── useDebounce.ts
│       │   ├── lib/
│       │   │   └── utils.ts
│       │   ├── trpc.ts             # tRPC client
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── app.css             # CSS variables / theme
│       └── package.json
│
├── packages/
│   └── shared/                     # Shared types
│       └── package.json
│
├── package.json                    # Root workspace
├── pnpm-workspace.yaml
├── Dockerfile                     # Multi-stage build
├── docker-compose.yml             # Orchestration
├── .dockerignore
└── CLAUDE.md
```

## Database Schema

```mermaid
erDiagram
    notes {
        text id PK
        text title
        text content
        text content_text
        text parent_id FK
        boolean is_folder
        text icon
        integer sort_order
        text created_at
        text updated_at
    }
    notes ||--o{ notes : "hierarchy"

    document_folders {
        text id PK
        text name
        text parent_id FK
        integer sort_order
        text created_at
    }
    document_folders ||--o{ document_folders : "subfolders"

    documents {
        text id PK
        text title
        text authors
        text file_path
        text original_name
        integer file_size
        text reading_status
        text extracted_text
        text summary
        text folder_id FK
        text created_at
        text updated_at
    }
    document_folders ||--o{ documents : "contains"

    document_notes {
        text id PK
        text document_id FK
        text content
        text content_text
        integer page_number
        text created_at
        text updated_at
    }
    documents ||--o{ document_notes : "annotations"

    diagrams {
        text id PK
        text title
        text data
        text thumbnail
        text created_at
        text updated_at
    }

    tasks {
        text id PK
        text title
        text description
        text status
        text priority
        text due_date
        integer sort_order
        text created_at
        text updated_at
    }

    pomodoro_sessions {
        text id PK
        text task_id FK
        integer duration
        text started_at
        text completed_at
    }
    tasks ||--o{ pomodoro_sessions : "sessions"

    flashcards {
        text id PK
        text front
        text back
        text source_id
        text source_type
        text next_review
        integer interval
        text ease_factor
        integer repetitions
        text created_at
        text updated_at
    }

    flashcard_reviews {
        text id PK
        text flashcard_id FK
        integer rating
        text reviewed_at
    }
    flashcards ||--o{ flashcard_reviews : "reviews"

    tags {
        text id PK
        text name
        text color
    }

    taggables {
        text tag_id FK
        text taggable_id
        text taggable_type
    }
    tags ||--o{ taggables : "associations"

    links {
        text source_id
        text source_type
        text target_id
        text target_type
        text created_at
    }
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + N` | Quick Capture -- create a quick note |
| `Ctrl + K` | Global Search -- search across the entire system |
