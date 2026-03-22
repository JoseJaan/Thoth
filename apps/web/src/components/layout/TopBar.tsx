import { Plus } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  color?: string;
  onQuickCapture: () => void;
}

export default function TopBar({ title, subtitle, color, onQuickCapture }: TopBarProps) {
  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        {color && (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onQuickCapture}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          title="Captura rápida (Ctrl+N)"
        >
          <Plus size={14} />
          Novo
        </button>
      </div>
    </header>
  );
}
