# Thoth

**Ferramenta pessoal de estudos para TCC** -- uma aplicacao local que combina funcionalidades de Notion, Excalidraw e Obsidian em um unico ambiente integrado para organizar pesquisas, anotacoes, documentos e tarefas academicas.

## Funcionalidades

| Funcionalidade | Descricao |
|---|---|
| **Notas** | Editor rich-text com Tiptap (listas, tabelas, codigo, imagens, links) e organizacao hierarquica em pastas |
| **Documentos/PDFs** | Upload, visualizacao inline com scroll continuo, extracao de texto, status de leitura, resumo geral e anotacoes por pagina. Importacao de pastas via explorador de arquivos |
| **Diagramas** | Editor visual com Excalidraw para criar diagramas, fluxogramas e esquemas |
| **Tarefas/Kanban** | Quadro Kanban com colunas (A Fazer, Em Progresso, Concluido), drag-and-drop, prioridades e datas de entrega |
| **Pomodoro** | Timer integrado (25min) vinculavel a tarefas para controle de foco |
| **Flashcards SM-2** | Sistema de repeticao espacada com algoritmo SM-2 para memorizacao eficiente |
| **Tags** | Sistema polimorfico de tags com cores para categorizar notas, documentos, diagramas e tarefas |
| **Busca Global** | Pesquisa unificada em notas, documentos, diagramas e tarefas (Ctrl+Shift+K) |
| **Links** | Conexoes bidirecionais entre qualquer entidade do sistema |
| **Quick Capture** | Criacao rapida de notas e tarefas com Ctrl+Shift+N |

## Arquitetura

### Estrutura do Monorepo

```mermaid
graph TB
    subgraph Monorepo["Thoth (pnpm workspace)"]
        subgraph Apps["apps/"]
            WEB["@thoth/web<br/>React + Vite<br/>Porta 5173"]
            API["@thoth/api<br/>Fastify + tRPC<br/>Porta 3001"]
        end
        subgraph Packages["packages/"]
            SHARED["@thoth/shared<br/>Tipos compartilhados"]
        end
    end

    WEB -->|"tRPC client"| API
    WEB -->|"workspace:*"| SHARED
    API -->|"workspace:*"| SHARED

    style WEB fill:#3b82f6,color:#fff
    style API fill:#10b981,color:#fff
    style SHARED fill:#8b5cf6,color:#fff
```

### Stack Tecnologica

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

    subgraph Comunicacao
        TRPC_C["@trpc/client"]
        TQ["TanStack Query"]
        TRPC_S["@trpc/server"]
    end

    subgraph Backend
        FASTIFY["Fastify 5"]
        DRIZZLE["Drizzle ORM"]
        ZOD["Zod"]
    end

    subgraph Banco
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

## Pre-requisitos

- **Node.js** >= 20.0.0
- **pnpm** (gerenciador de pacotes)
- **Docker** (opcional, para execucao via container)

## Inicio Rapido

### Desenvolvimento local

```bash
# 1. Clonar o repositorio
git clone <repo-url>
cd thoth

# 2. Instalar dependencias
pnpm install

# 3. Executar as migracoes do banco de dados
pnpm db:migrate

# 4. Iniciar em modo de desenvolvimento (API + Web simultaneamente)
pnpm dev
```

A aplicacao estara disponivel em:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

### Docker

```bash
# Construir e iniciar
docker compose up -d

# A aplicacao estara disponivel em http://localhost:3001
```

O container serve tanto a API quanto o frontend buildado em uma unica porta (3001). Os dados (SQLite + PDFs) sao persistidos no volume `./data`.

## Estrutura do Projeto

```
thoth/
├── apps/
│   ├── api/                        # Backend (Fastify + tRPC)
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts       # Definicao das tabelas (Drizzle)
│   │   │   │   ├── index.ts        # Conexao com SQLite
│   │   │   │   ├── migrate.ts      # Script de migracao
│   │   │   │   └── migrations/     # Arquivos SQL gerados
│   │   │   ├── trpc/
│   │   │   │   ├── router.ts       # Router principal
│   │   │   │   ├── trpc.ts         # Configuracao do tRPC
│   │   │   │   ├── context.ts      # Contexto (db)
│   │   │   │   └── procedures/     # Routers por dominio
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
│   │   │   │   ├── storage.ts      # Gerenciamento de PDFs
│   │   │   │   └── pdf.ts          # Extracao de texto
│   │   │   ├── utils/
│   │   │   │   └── id.ts           # Geracao de IDs (nanoid)
│   │   │   ├── config.ts           # Configuracoes
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
│       │   ├── trpc.ts             # Cliente tRPC
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── app.css             # Variaveis CSS / tema
│       └── package.json
│
├── packages/
│   └── shared/                     # Tipos compartilhados
│       └── package.json
│
├── package.json                    # Root workspace
├── pnpm-workspace.yaml
├── Dockerfile                     # Build multi-stage
├── docker-compose.yml             # Orquestracao
├── .dockerignore
└── CLAUDE.md
```

## Esquema do Banco de Dados

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
    notes ||--o{ notes : "hierarquia"

    document_folders {
        text id PK
        text name
        text parent_id FK
        integer sort_order
        text created_at
    }
    document_folders ||--o{ document_folders : "subpastas"

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
    document_folders ||--o{ documents : "contem"

    document_notes {
        text id PK
        text document_id FK
        text content
        text content_text
        integer page_number
        text created_at
        text updated_at
    }
    documents ||--o{ document_notes : "anotacoes"

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
    tasks ||--o{ pomodoro_sessions : "sessoes"

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
    flashcards ||--o{ flashcard_reviews : "revisoes"

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
    tags ||--o{ taggables : "associacoes"

    links {
        text source_id
        text source_type
        text target_id
        text target_type
        text created_at
    }
```

## Atalhos de Teclado

| Atalho | Acao |
|---|---|
| `Ctrl + N` | Quick Capture -- criar nota rapida |
| `Ctrl + K` | Busca Global -- pesquisar em todo o sistema |

## Screenshots

> _Secao reservada para capturas de tela da aplicacao._

## Licenca

Projeto pessoal e privado, desenvolvido como ferramenta de apoio ao TCC. Nao destinado a distribuicao ou uso comercial.
