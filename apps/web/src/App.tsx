import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "./trpc";

function Dashboard() {
  const health = trpc.health.useQuery();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-diagrams)] to-[var(--color-flashcards)] bg-clip-text text-transparent">
          Thoth
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Sua ferramenta de estudos pessoal
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          {[
            { label: "Notas", color: "var(--color-notes)", icon: "📝" },
            { label: "Documentos", color: "var(--color-documents)", icon: "📄" },
            { label: "Diagramas", color: "var(--color-diagrams)", icon: "🎨" },
            { label: "Tarefas", color: "var(--color-tasks)", icon: "✅" },
            { label: "Flashcards", color: "var(--color-flashcards)", icon: "🃏" },
          ].map((item) => (
            <div
              key={item.label}
              className="px-4 py-2 rounded-lg text-white font-medium text-sm shadow-md hover:scale-105 transition-transform cursor-pointer"
              style={{ backgroundColor: item.color }}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </div>

        {health.data && (
          <p className="text-sm text-[var(--color-text-muted)]">
            API: {health.data.status} &#x2022; {health.data.timestamp}
          </p>
        )}
        {health.isLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">Conectando...</p>
        )}
        {health.isError && (
          <p className="text-sm text-[var(--color-error)]">Erro ao conectar com a API</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
