Thoth - Plano de Implementacao                                                                                                                                                                                                                                                                     
 Contexto

 Thoth e uma aplicacao web local para auxiliar nos estudos e execucao de um TCC. O objetivo e combinar funcionalidades de Notion, Excalidraw e    
 Obsidian em uma unica ferramenta. O projeto esta vazio - apenas CLAUDE.md e README.md existem. Este plano cobre desde o scaffolding ate a        
 implementacao completa.

 ---
 Stack Tecnologica

 ┌────────────────┬─────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────┐
 │     Camada     │                     Tecnologia                      │                            Motivo                            │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ Monorepo       │ pnpm workspaces                                     │ Rapido, eficiente em disco                                   │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ Backend        │ Fastify + tRPC                                      │ Type-safety end-to-end, sem necessidade de manter specs REST │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ Banco de Dados │ SQLite (better-sqlite3) + Drizzle ORM               │ Zero config, arquivo unico, FTS5 built-in                    │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ Frontend       │ React + Vite + TypeScript                           │ Conforme requisitos                                          │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ UI             │ shadcn/ui + Tailwind CSS v4                         │ Componentes customizaveis sem lock-in                        │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ Editor         │ Tiptap (ProseMirror)                                │ Markdown shortcuts, extensivel, headless                     │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ Diagramas      │ @excalidraw/excalidraw                              │ Componente React pronto, MIT                                 │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ PDF            │ react-pdf (visualizacao) + pdf-parse (extracao)     │                                                              │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ Estado         │ TanStack Query (server state) + React state (local) │                                                              │
 ├────────────────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ Roteamento     │ React Router v7                                     │                                                              │
 └────────────────┴─────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘

 ---
 Estrutura do Projeto

 thoth/
 ├── package.json
 ├── pnpm-workspace.yaml
 ├── tsconfig.base.json
 ├── .gitignore
 ├── packages/
 │   └── shared/                  # Tipos compartilhados
 │       ├── package.json
 │       ├── tsconfig.json
 │       └── src/
 │           └── types/           # note.ts, document.ts, diagram.ts, task.ts, tag.ts
 ├── apps/
 │   ├── api/                     # Backend Fastify + tRPC
 │   │   ├── package.json
 │   │   ├── tsconfig.json
 │   │   ├── drizzle.config.ts
 │   │   └── src/
 │   │       ├── index.ts         # Entry point
 │   │       ├── config.ts
 │   │       ├── db/
 │   │       │   ├── schema.ts    # Drizzle schema (source of truth)
 │   │       │   └── migrations/
 │   │       ├── trpc/
 │   │       │   ├── router.ts    # Root router
 │   │       │   ├── context.ts
 │   │       │   └── procedures/  # notes.ts, documents.ts, diagrams.ts, tasks.ts, tags.ts, search.ts
 │   │       └── services/
 │   │           ├── pdf.ts       # Extracao de texto
 │   │           ├── search.ts    # FTS5
 │   │           └── storage.ts   # Upload de arquivos
 │   └── web/                     # Frontend React + Vite
 │       ├── package.json
 │       ├── vite.config.ts
 │       └── src/
 │           ├── main.tsx
 │           ├── App.tsx
 │           ├── trpc.ts          # Cliente tRPC
 │           ├── components/
 │           │   ├── ui/          # shadcn/ui
 │           │   ├── layout/      # Sidebar, TopBar, AppShell
 │           │   ├── editor/      # NoteEditor, extensions, toolbar
 │           │   ├── documents/   # DocumentList, PdfViewer, DocumentNotes
 │           │   ├── diagrams/    # DiagramCanvas, DiagramList
 │           │   ├── tasks/       # TaskBoard, TaskItem, TaskDetail
 │           │   └── search/      # GlobalSearch
 │           ├── pages/           # NotesPage, DocumentsPage, DiagramsPage, TasksPage, DashboardPage
 │           └── hooks/           # useNotes, useDocuments, useDiagrams, useTasks, useDebounce
 └── data/                        # Runtime (gitignored)
     ├── thoth.db
     └── uploads/pdfs/

 ---
 Schema do Banco de Dados

 notes

 - id TEXT PK (nanoid), title TEXT, content TEXT (JSON Tiptap), content_text TEXT (para busca)
 - parent_id TEXT FK nullable (estrutura em arvore), is_folder BOOLEAN, icon TEXT nullable
 - sort_order INTEGER, created_at TEXT, updated_at TEXT

 documents

 - id TEXT PK, title TEXT, authors TEXT nullable, file_path TEXT, file_size INTEGER
 - reading_status TEXT ('unread' | 'to_read' | 'reading' | 'read'), extracted_text TEXT nullable
 - created_at TEXT, updated_at TEXT

 document_notes

 - id TEXT PK, document_id TEXT FK, content TEXT (JSON), content_text TEXT
 - page_number INTEGER nullable, created_at TEXT, updated_at TEXT

 diagrams

 - id TEXT PK, title TEXT, data TEXT (JSON Excalidraw), thumbnail TEXT nullable
 - created_at TEXT, updated_at TEXT

 tasks

 - id TEXT PK, title TEXT, description TEXT (JSON) nullable
 - status TEXT ('todo' | 'in_progress' | 'done'), priority TEXT ('low' | 'medium' | 'high')
 - due_date TEXT nullable, sort_order INTEGER, created_at TEXT, updated_at TEXT

 tags

 - id TEXT PK, name TEXT UNIQUE, color TEXT

 taggables (join polimorfico)

 - tag_id TEXT, taggable_id TEXT, taggable_type TEXT ('note' | 'document' | 'diagram' | 'task')
 - PK composta: (tag_id, taggable_id, taggable_type)

 links (referencias bidirecionais)

 - source_id TEXT, source_type TEXT, target_id TEXT, target_type TEXT, created_at TEXT
 - PK composta: (source_id, source_type, target_id, target_type)

 FTS5 (busca full-text)

 CREATE VIRTUAL TABLE search_index USING fts5(entity_id, entity_type, title, content);

 ---
 Fases de Implementacao

 Fase 0 - Scaffolding

 - Inicializar pnpm workspace, tsconfig base, .gitignore
 - Setup packages/shared com tipos
 - Setup apps/api: Fastify + tRPC + Drizzle + SQLite, migracao inicial
 - Setup apps/web: Vite + React + Tailwind + shadcn/ui + tRPC client
 - Visual colorido/vibrante: paleta de cores rica, uso de cores para categorizar entidades (notas, docs, diagramas, tarefas)
 - Script dev que roda api e web simultaneamente
 - Verificar que um procedimento tRPC simples funciona end-to-end

 Fase 1 - Sistema de Notas

 - Backend: CRUD de notas com suporte a arvore (parent_id, reordenacao)
 - Frontend: Sidebar com arvore colapsavel de pastas e notas
 - Frontend: Editor Tiptap com extensoes (StarterKit, TaskList, CodeBlock, Table, Link, Image, Markdown shortcuts)
 - Auto-save com debounce (1s apos parar de digitar)
 - Menu slash command (digitar / para inserir blocos)
 - Quick Capture (Ctrl+N): Modal global para captura rapida de nota/tarefa/URL de qualquer lugar do app

 Fase 2 - Gestao de Documentos/PDFs

 - Armazenamento local: PDFs ficam em data/uploads/pdfs/ dentro do diretorio do projeto (sem nuvem)
 - Backend: Importacao de PDFs (copiar para data/uploads/pdfs/ com nome unico via nanoid, preservando nome original no banco)
 - Backend: Extracao de texto com pdf-parse no momento da importacao
 - Backend: CRUD de documents e document_notes
 - Backend: Endpoint para servir arquivos PDF estaticamente (Fastify static)
 - Frontend: Importacao de pasta inteira (apontar pasta local, importar todos os PDFs de uma vez)
 - Frontend: Organizacao em categorias/pastas hierarquicas dentro do Thoth (por tema, disciplina, etc.)
 - Schema: adicionar folder_id TEXT FK nullable na tabela documents + tabela document_folders (id, name, parent_id, sort_order, created_at)       
 - Frontend: Lista de documentos com filtros e badges de status de leitura
 - Frontend: Visualizador PDF (react-pdf) com layout side-by-side (PDF + notas)
 - Ao deletar documento: opcao de remover tambem o arquivo fisico ou manter

 Fase 3 - Editor de Diagramas

 - Backend: CRUD de diagramas
 - Frontend: Excalidraw embeddado como componente React
 - Auto-save do estado como JSON, geracao de thumbnail
 - Lista de diagramas com grid de thumbnails

 Fase 4 - Gestao de Tarefas

 - Backend: CRUD de tarefas
 - Frontend: Kanban board (To Do / In Progress / Done) com drag-and-drop (@dnd-kit)
 - Modal de detalhes com editor rich text (reuso do Tiptap)
 - Indicadores de prioridade e date picker
 - Pomodoro Timer: Widget persistente no top bar, vinculavel a tarefas, tracking de tempo por atividade
   - Tabela pomodoro_sessions: id, task_id (nullable), duration, started_at, completed_at
   - Configuracao de intervalos (trabalho/pausa curta/pausa longa)
   - Contagem de sessoes no card da tarefa

 Fase 5 - Tags, Links e Busca

 - Tags: CRUD, associacao polimorfica, filtro por tag
 - Links: Sintaxe [[wiki-link]] no Tiptap com autocomplete
 - Busca: FTS5, dialog global (Ctrl+K), backlinks panel
 - Exportacao de notas como Markdown

 Fase 6 - Flashcards e Repeticao Espacada

 - Tabela flashcards: id, front (TEXT), back (TEXT), source_id, source_type, next_review (TEXT), interval (INTEGER), ease_factor (REAL)
 - Tabela flashcard_reviews: id, flashcard_id, rating, reviewed_at
 - Backend: CRUD de flashcards + procedimento de revisao com algoritmo SM-2
 - Frontend: Criar flashcard a partir de selecao de texto em notas/documentos
 - Frontend: Pagina de revisao com cards devidos para hoje, interface de flip + rating
 - Estatisticas de revisao (streak, cards revisados, proximas revisoes)

 Fase 7 - Dashboard e Polish

 - Dashboard: notas recentes, progresso de leitura, tarefas proximas, diagramas recentes, flashcards pendentes
 - Estatisticas de leitura com graficos (recharts)
 - Atalhos de teclado + modal de ajuda
 - Backup/restore do banco (ZIP do SQLite + uploads)
 - Estados de loading, erro e vazio

 ---
 Ideias Futuras (pos-MVP)

 Estas podem ser adicionadas apos as fases acima estarem completas:
 1. Grafo de conhecimento - Visualizacao force-directed (d3) de notas/documentos/links interconectados
 2. Features com IA - Resumos, sugestao de conexoes, chat com documentos (Ollama/OpenAI, opcional)
 3. Busca em PDFs com highlight - Mostrar pagina e posicao exata de matches dentro do PDF viewer
 4. Mind Mapping - Modo dedicado com reactflow ou Excalidraw em modo restrito
 5. Timeline/Gantt - Visualizacao de tarefas com due dates em timeline horizontal

 ---
 Verificacao

 Para testar cada fase:
 1. pnpm dev deve iniciar api (porta 3001) e web (porta 5173) simultaneamente
 2. Fase 0: Abrir o app no browser, verificar que a conexao tRPC funciona
 3. Fase 1: Criar/editar/deletar notas, verificar persistencia apos reload
 4. Fase 2: Upload de PDF, verificar visualizacao e notas por documento
 5. Fase 3: Criar diagrama, verificar save/load
 6. Fase 4: Criar tarefas, drag-and-drop entre colunas do kanban
 7. Fase 5: Ctrl+K para busca global, criar tags e links entre entidades
 8. Fase 6: Criar flashcard a partir de nota, revisar cards, verificar algoritmo SM-2
 9. Fase 7: Dashboard mostra dados reais, backup gera ZIP valido

 ---
 Arquivos Criticos

 - apps/api/src/db/schema.ts - Source of truth do modelo de dados
 - apps/api/src/trpc/router.ts - Superficie da API
 - apps/web/src/components/editor/NoteEditor.tsx - Componente mais complexo (reusado em notas, anotacoes de documentos, descricao de tarefas)     
 - apps/web/src/trpc.ts - Bridge type-safe frontend<->backend