# Thoth

**Ferramenta pessoal de estudos.** Uma aplicação local que combina recursos do Notion, Excalidraw e Obsidian em um único ambiente integrado para organizar pesquisas, anotações, documentos e tarefas acadêmicas.

## Licença e Uso

O uso deste software é **livre para atividades não comerciais**.

Para qualquer uso com **finalidade comercial**, é necessário entrar em contato previamente com a **Universidade Federal de Lavras (UFLA)** para obter autorização.

Os termos completos estão no arquivo [LICENSE](LICENSE).

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Anotações** | Editor de texto rico com Tiptap (listas, tabelas, código, imagens, links) e organização hierárquica em pastas |
| **Documentos/PDFs** | Upload, visualização integrada com rolagem contínua, extração de texto, status de leitura, resumo geral e anotações por página. Importação de pastas pelo explorador de arquivos |
| **Diagramas** | Editor visual com Excalidraw para criar diagramas, fluxogramas e esquemas |
| **Tarefas/Kanban** | Quadro Kanban com colunas (A Fazer, Em Andamento, Concluído), arrastar e soltar, prioridades e prazos |
| **Pomodoro** | Temporizador integrado (25min) que pode ser vinculado a tarefas para acompanhamento de foco |
| **Flashcards SM-2** | Sistema de repetição espaçada com o algoritmo SM-2 para memorização eficiente |
| **Tags** | Sistema polimórfico de tags com cores para categorizar anotações, documentos, diagramas e tarefas |
| **Busca Global** | Busca unificada em anotações, documentos, diagramas e tarefas (Ctrl+Shift+K) |
| **Vínculos** | Conexões bidirecionais entre quaisquer entidades do sistema |
| **Captura Rápida** | Criação rápida de anotações e tarefas com Ctrl+Shift+N |

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

### Stack Tecnológica

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

    subgraph Comunicacao["Comunicação"]
        TRPC_C["@trpc/client"]
        TQ["TanStack Query"]
        TRPC_S["@trpc/server"]
    end

    subgraph Backend
        FASTIFY["Fastify 5"]
        DRIZZLE["Drizzle ORM"]
        ZOD["Zod"]
    end

    subgraph BancoDeDados["Banco de Dados"]
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

## Pré-requisitos

- **Node.js** >= 20.0.0
- **pnpm** (gerenciador de pacotes)
- **Docker** (opcional, para execução em contêiner)

## Início Rápido

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone <repo-url>
cd thoth

# 2. Instale as dependências
pnpm install

# 3. Execute as migrações do banco de dados
pnpm db:migrate

# 4. Inicie em modo de desenvolvimento (API + Web simultaneamente)
pnpm dev
```

A aplicação estará disponível em:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

### Docker

```bash
# Build e inicialização
docker compose up -d

# A aplicação estará disponível em http://localhost:3001
```

O contêiner serve tanto a API quanto o frontend compilado em uma única porta (3001). Os dados (SQLite + PDFs) são persistidos no volume `./data`.

## Estrutura do Projeto

```
thoth/
├── apps/
│   ├── api/                        # Backend (Fastify + tRPC)
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts       # Definição das tabelas (Drizzle)
│   │   │   │   ├── index.ts        # Conexão com o SQLite
│   │   │   │   ├── migrate.ts      # Script de migração
│   │   │   │   └── migrations/     # Arquivos SQL gerados
│   │   │   ├── trpc/
│   │   │   │   ├── router.ts       # Router principal
│   │   │   │   ├── trpc.ts         # Configuração do tRPC
│   │   │   │   ├── context.ts      # Contexto (db)
│   │   │   │   └── procedures/     # Routers por domínio
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
│   │   │   │   └── pdf.ts          # Extração de texto
│   │   │   ├── utils/
│   │   │   │   └── id.ts           # Geração de IDs (nanoid)
│   │   │   ├── config.ts           # Configuração
│   │   │   └── index.ts            # Ponto de entrada
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
│       │   └── app.css             # Variáveis CSS / tema
│       └── package.json
│
├── packages/
│   └── shared/                     # Tipos compartilhados
│       └── package.json
│
├── package.json                    # Workspace raiz
├── pnpm-workspace.yaml
├── Dockerfile                     # Build multi-stage
├── docker-compose.yml             # Orquestração
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
    document_folders ||--o{ documents : "contém"

    document_notes {
        text id PK
        text document_id FK
        text content
        text content_text
        integer page_number
        text created_at
        text updated_at
    }
    documents ||--o{ document_notes : "anotações"

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
    tasks ||--o{ pomodoro_sessions : "sessões"

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
    flashcards ||--o{ flashcard_reviews : "revisões"

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
    tags ||--o{ taggables : "associações"

    links {
        text source_id
        text source_type
        text target_id
        text target_type
        text created_at
    }
```

## Atalhos de Teclado

| Atalho | Ação |
|---|---|
| `Ctrl + Shift + N` | Captura Rápida: cria uma anotação rápida |
| `Ctrl + Shift + K` | Busca Global: pesquisa em todo o sistema |
