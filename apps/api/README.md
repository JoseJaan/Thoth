# Thoth API

Backend da aplicacao Thoth, construido com **Fastify**, **tRPC**, **Drizzle ORM** e **SQLite** (via better-sqlite3). Responsavel por toda a logica de negocio, persistencia de dados e servicos de arquivos.

## Arquitetura da API

```mermaid
graph TB
    CLIENT["Cliente tRPC<br/>(Frontend)"]

    subgraph Servidor["Fastify (porta 3001)"]
        CORS["@fastify/cors"]
        STATIC["@fastify/static<br/>/uploads/"]
        TRPC_ADAPTER["Adaptador tRPC<br/>/trpc"]
    end

    subgraph tRPC["tRPC Router"]
        CONTEXT["Contexto<br/>(instancia do DB)"]
        ROUTER["appRouter"]
    end

    subgraph Procedures["Procedures"]
        NOTES["notesRouter"]
        DOCS["documentsRouter"]
        DIAGRAMS["diagramsRouter"]
        TASKS["tasksRouter"]
        FLASH["flashcardsRouter"]
        TAGS["tagsRouter"]
        LINKS["linksRouter"]
        SEARCH["searchRouter"]
        HEALTH["health"]
    end

    subgraph Services["Servicos"]
        STORAGE["storage.ts<br/>Gerencia PDFs"]
        PDF["pdf.ts<br/>Extrai texto"]
    end

    subgraph Persistence["Persistencia"]
        DRIZZLE["Drizzle ORM"]
        SQLITE["SQLite<br/>thoth.db"]
        FS["Sistema de<br/>Arquivos (PDFs)"]
    end

    CLIENT -->|"HTTP"| TRPC_ADAPTER
    TRPC_ADAPTER --> CONTEXT
    CONTEXT --> ROUTER
    ROUTER --> NOTES
    ROUTER --> DOCS
    ROUTER --> DIAGRAMS
    ROUTER --> TASKS
    ROUTER --> FLASH
    ROUTER --> TAGS
    ROUTER --> LINKS
    ROUTER --> SEARCH
    ROUTER --> HEALTH

    DOCS --> STORAGE
    DOCS --> PDF
    STORAGE --> FS

    NOTES --> DRIZZLE
    DOCS --> DRIZZLE
    DIAGRAMS --> DRIZZLE
    TASKS --> DRIZZLE
    FLASH --> DRIZZLE
    TAGS --> DRIZZLE
    LINKS --> DRIZZLE
    SEARCH --> DRIZZLE
    DRIZZLE --> SQLITE

    style CLIENT fill:#3b82f6,color:#fff
    style SQLITE fill:#003b57,color:#fff
    style DRIZZLE fill:#c5f74f,color:#000
    style ROUTER fill:#10b981,color:#fff
```

## Routers e Procedures

```mermaid
graph LR
    subgraph notes["notes"]
        N_LIST["list"]
        N_GET["getById"]
        N_CREATE["create"]
        N_UPDATE["update"]
        N_DELETE["delete"]
        N_REORDER["reorder"]
    end

    subgraph documents["documents"]
        D_LISTF["listFolders"]
        D_CREATEF["createFolder"]
        D_DELF["deleteFolder"]
        D_RENF["renameFolder"]
        D_LIST["list"]
        D_LISTALL["listAll"]
        D_GET["getById"]
        D_UPLOAD["upload"]
        D_IMPORT["importFromFolder"]
        D_UPDATE["update"]
        D_DELETE["delete"]
        D_LISTN["listNotes"]
        D_CREATEN["createNote"]
        D_UPDATEN["updateNote"]
        D_DELN["deleteNote"]
    end

    subgraph diagrams["diagrams"]
        DG_LIST["list"]
        DG_GET["getById"]
        DG_CREATE["create"]
        DG_UPDATE["update"]
        DG_DELETE["delete"]
    end

    subgraph tasks["tasks"]
        T_LIST["list"]
        T_GET["getById"]
        T_CREATE["create"]
        T_UPDATE["update"]
        T_DELETE["delete"]
        T_REORDER["reorder"]
        T_LISTP["listPomodoros"]
        T_STARTP["startPomodoro"]
        T_COMP["completePomodoro"]
    end

    subgraph flashcards["flashcards"]
        F_LIST["list"]
        F_DUE["getDueToday"]
        F_GET["getById"]
        F_CREATE["create"]
        F_UPDATE["update"]
        F_DELETE["delete"]
        F_REVIEW["review (SM-2)"]
        F_STATS["stats"]
    end

    subgraph tags["tags"]
        TG_LIST["list"]
        TG_CREATE["create"]
        TG_UPDATE["update"]
        TG_DELETE["delete"]
        TG_GETFOR["getForEntity"]
        TG_ADD["addToEntity"]
        TG_REMOVE["removeFromEntity"]
    end

    subgraph links["links"]
        L_GETFOR["getForEntity"]
        L_CREATE["create"]
        L_DELETE["delete"]
    end

    subgraph search["search"]
        S_GLOBAL["global"]
    end

    style notes fill:#f59e0b,color:#000
    style documents fill:#3b82f6,color:#fff
    style diagrams fill:#8b5cf6,color:#fff
    style tasks fill:#10b981,color:#fff
    style flashcards fill:#ec4899,color:#fff
    style tags fill:#6366f1,color:#fff
    style links fill:#14b8a6,color:#fff
    style search fill:#f97316,color:#fff
```

## Banco de Dados

O Thoth utiliza **SQLite** como banco de dados, gerenciado pelo **Drizzle ORM**. O arquivo do banco (`thoth.db`) e criado automaticamente na raiz do projeto.

### Diagrama ER

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
    tags ||--o{ taggables : "polimorfismo"

    links {
        text source_id
        text source_type
        text target_id
        text target_type
        text created_at
    }
```

### Migracoes

As migracoes sao geradas pelo Drizzle Kit e ficam em `src/db/migrations/`. Para gerencia-las:

```bash
# Gerar nova migracao a partir de alteracoes no schema.ts
pnpm db:generate

# Aplicar migracoes pendentes
pnpm db:migrate
```

## Estrutura de Arquivos

```
apps/api/src/
├── config.ts                  # Porta, host, caminhos de diretorio
├── index.ts                   # Entry point -- inicializa Fastify
├── db/
│   ├── schema.ts              # Definicao de todas as tabelas
│   ├── index.ts               # Cria conexao better-sqlite3 + Drizzle
│   ├── migrate.ts             # Script para aplicar migracoes
│   └── migrations/            # SQL gerado pelo Drizzle Kit
├── trpc/
│   ├── trpc.ts                # initTRPC, publicProcedure
│   ├── context.ts             # createContext (injeta db)
│   ├── router.ts              # appRouter -- combina sub-routers
│   └── procedures/
│       ├── health.ts          # Healthcheck simples
│       ├── notes.ts           # CRUD + reorder de notas hierarquicas
│       ├── documents.ts       # CRUD + upload + import + notas de documentos
│       ├── diagrams.ts        # CRUD de diagramas (dados Excalidraw)
│       ├── tasks.ts           # CRUD + reorder + pomodoro
│       ├── flashcards.ts      # CRUD + review SM-2 + stats
│       ├── tags.ts            # CRUD + associacoes polimorfica
│       ├── links.ts           # Links bidirecionais entre entidades
│       └── search.ts          # Busca global (LIKE em titulo/conteudo)
├── services/
│   ├── storage.ts             # savePdf, deletePdf, importFolder
│   └── pdf.ts                 # extractTextFromPdf (via pdf-parse)
└── utils/
    └── id.ts                  # generateId (nanoid), now (ISO timestamp)
```

## Como Executar

```bash
# Desenvolvimento (com hot-reload via tsx watch)
pnpm dev

# Build
pnpm build

# Producao
pnpm start
```

O servidor inicia na **porta 3001** por padrao.

## Endpoints

Todas as chamadas sao feitas via tRPC no caminho `/trpc`. Nao existem endpoints REST tradicionais.

Alem disso, arquivos estaticos (PDFs enviados) sao servidos em `/uploads/` via `@fastify/static`.

### Exemplos de chamadas tRPC

| Procedure | Tipo | Descricao |
|---|---|---|
| `notes.list` | Query | Lista notas (opcionalmente por parentId) |
| `notes.create` | Mutation | Cria nota ou pasta |
| `documents.upload` | Mutation | Upload de PDF (base64), extrai texto |
| `documents.importFromFolder` | Mutation | Importa todos os PDFs de um diretorio local |
| `tasks.reorder` | Mutation | Reordena tarefas entre colunas do Kanban |
| `tasks.startPomodoro` | Mutation | Inicia sessao Pomodoro (padrao: 25min) |
| `flashcards.review` | Mutation | Aplica algoritmo SM-2 e agenda proxima revisao |
| `flashcards.getDueToday` | Query | Retorna flashcards pendentes para hoje |
| `tags.addToEntity` | Mutation | Associa tag a nota/documento/diagrama/tarefa |
| `links.create` | Mutation | Cria link bidirecional entre duas entidades |
| `search.global` | Query | Busca por texto em notas, documentos, diagramas e tarefas |

## Servicos

### storage.ts

Gerencia o armazenamento de arquivos PDF no sistema de arquivos local:
- **`savePdf(buffer, fileName)`** -- salva o buffer como arquivo PDF, retorna o caminho
- **`deletePdf(filePath)`** -- remove o arquivo do disco
- **`importFolder(folderPath)`** -- le todos os `.pdf` de uma pasta local

### pdf.ts

- **`extractTextFromPdf(buffer)`** -- utiliza a biblioteca `pdf-parse` para extrair texto de um PDF, permitindo busca no conteudo dos documentos

## Algoritmo SM-2 (Flashcards)

O sistema de flashcards implementa o algoritmo **SuperMemo 2 (SM-2)** para repeticao espacada:

1. O usuario avalia seu desempenho com uma nota de **0 a 5**
2. Se a nota for **< 3**: o cartao e reiniciado (repeticoes = 0, intervalo = 1 dia)
3. Se a nota for **>= 3**: o intervalo cresce progressivamente:
   - 1a repeticao: 1 dia
   - 2a repeticao: 6 dias
   - Repeticoes seguintes: `intervalo_anterior * fator_facilidade`
4. O **fator de facilidade** (EF) e ajustado a cada revisao, com minimo de 1.3
5. A **proxima revisao** e calculada somando o intervalo a data atual

Isso garante que cartoes mais dificeis sejam revisados com mais frequencia, enquanto cartoes faceis espacam cada vez mais.
