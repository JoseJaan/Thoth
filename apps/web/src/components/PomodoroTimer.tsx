import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Timer, Coffee, X } from "lucide-react";
import { trpc } from "../trpc";

type TimerMode = "work" | "short_break" | "long_break";

const modeConfig: Record<TimerMode, { label: string; duration: number; color: string }> = {
  work: { label: "Trabalho", duration: 25 * 60, color: "#ef4444" },
  short_break: { label: "Pausa curta", duration: 5 * 60, color: "#10b981" },
  long_break: { label: "Pausa longa", duration: 15 * 60, color: "#3b82f6" },
};

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PomodoroTimer({ isOpen, onClose }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(modeConfig.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPomodoro = trpc.tasks.startPomodoro.useMutation();
  const completePomodoro = trpc.tasks.completePomodoro.useMutation();

  const config = modeConfig[mode];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (sessionId) {
      completePomodoro.mutate({ id: sessionId });
    }

    if (mode === "work") {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      // After 4 work sessions, take a long break
      if (newCount % 4 === 0) {
        setMode("long_break");
        setTimeLeft(modeConfig.long_break.duration);
      } else {
        setMode("short_break");
        setTimeLeft(modeConfig.short_break.duration);
      }
    } else {
      setMode("work");
      setTimeLeft(modeConfig.work.duration);
    }

    // Play notification sound
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczHjqIxN7LcjwZLIa/2tF+RiQihbzZ03pGJiSEu9XTfEklIoS71dN8SSUjhLvV03xJJSOFvNbSfEgkIoS61tR8SCQig7rW1HxIJCKDutbUfEgkIoO61tR8SCQig7rW1A==");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}

    setSessionId(null);
  }, [mode, sessionId, sessionsCompleted, completePomodoro]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleComplete]);

  const handleStart = async () => {
    setIsRunning(true);
    if (mode === "work") {
      const session = await startPomodoro.mutateAsync({
        duration: config.duration,
        taskId: null,
      });
      setSessionId(session.id);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(config.duration);
    setSessionId(null);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modeConfig[newMode].duration);
    setSessionId(null);
  };

  if (!isOpen) return null;

  const progress = 1 - timeLeft / config.duration;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-72">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer size={16} style={{ color: config.color }} />
            <span className="text-sm font-semibold text-slate-700">Pomodoro</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={14} className="text-slate-400" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-0.5">
          {(Object.keys(modeConfig) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-colors ${
                mode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              {modeConfig[m].label}
            </button>
          ))}
        </div>

        {/* Timer circle */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none" stroke="#e2e8f0" strokeWidth="6"
              />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke={config.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800 font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-slate-400">{config.label}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw size={16} className="text-slate-400" />
          </button>
          <button
            onClick={isRunning ? handlePause : handleStart}
            className="p-3 rounded-xl text-white shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.color }}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="w-8" /> {/* spacer */}
        </div>

        {/* Session count */}
        <div className="text-center mt-3">
          <span className="text-xs text-slate-400">
            {sessionsCompleted} sessoes completadas
          </span>
        </div>
      </div>
    </div>
  );
}
