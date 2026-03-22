import { Plus, Timer } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  color?: string;
  onQuickCapture: () => void;
  onTogglePomodoro?: () => void;
  pomodoroOpen?: boolean;
}

export default function TopBar({ title, subtitle, color, onQuickCapture, onTogglePomodoro, pomodoroOpen }: TopBarProps) {
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
        {onTogglePomodoro && (
          <button
            onClick={onTogglePomodoro}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              pomodoroOpen
                ? "bg-red-100 text-red-600"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="Pomodoro Timer"
          >
            <Timer size={14} />
            Pomodoro
          </button>
        )}
        <button
          onClick={onQuickCapture}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          title="Captura rapida (Ctrl+N)"
        >
          <Plus size={14} />
          Novo
        </button>
      </div>
    </header>
  );
}
