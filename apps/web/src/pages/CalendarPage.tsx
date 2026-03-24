import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { trpc } from "../trpc";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const priorityConfig = {
  low: { label: "Low", color: "#94a3b8", icon: "↓" },
  medium: { label: "Medium", color: "#f59e0b", icon: "→" },
  high: { label: "High", color: "#ef4444", icon: "↑" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  todo: { label: "To do", color: "#94a3b8" },
  in_progress: { label: "In progress", color: "#3b82f6" },
  done: { label: "Done", color: "#10b981" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allTasks = trpc.tasks.list.useQuery({});

  const tasksByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const task of allTasks.data ?? []) {
      if (task.dueDate) {
        const dateKey = task.dueDate.split("T")[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(task);
      }
    }
    return map;
  }, [allTasks.data]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(todayStr);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build calendar grid cells
  const cells: Array<{ day: number; dateStr: string } | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr });
  }

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];

  return (
    <div className="h-full flex">
      {/* Calendar grid */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Calendar</h2>
            <p className="text-sm text-slate-400">View your tasks by date</p>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <h3 className="text-lg font-semibold text-slate-700">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-t border-l border-slate-200">
          {cells.map((cell, i) => {
            if (!cell) {
              return (
                <div key={`empty-${i}`} className="border-r border-b border-slate-200 bg-slate-50/50 min-h-[90px]" />
              );
            }

            const { day, dateStr } = cell;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayTasks = tasksByDate[dateStr] ?? [];
            const hasOverdue = dayTasks.some(
              (t: any) => t.status !== "done" && dateStr < todayStr
            );

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`border-r border-b border-slate-200 min-h-[90px] p-1.5 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-cyan-50 ring-2 ring-inset ring-cyan-400"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-cyan-600 text-white"
                        : hasOverdue
                          ? "text-red-500"
                          : "text-slate-600"
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task: any) => {
                    const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
                    const isDone = task.status === "done";
                    return (
                      <div
                        key={task.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate ${isDone ? "line-through opacity-50" : ""}`}
                        style={{
                          backgroundColor: `${priority.color}15`,
                          color: priority.color,
                        }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] text-slate-400 px-1">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedTasks.length === 0
                ? "No tasks"
                : `${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2">
            {selectedTasks.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No tasks for this day
              </div>
            ) : (
              selectedTasks.map((task: any) => {
                const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
                const status = statusConfig[task.status] ?? statusConfig.todo;
                const isDone = task.status === "done";
                const isOverdue = !isDone && selectedDate < todayStr;

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      isOverdue
                        ? "border-red-200 bg-red-50/50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <h4
                      className={`text-sm font-medium mb-1.5 ${
                        isDone ? "line-through text-slate-400" : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          color: priority.color,
                          backgroundColor: `${priority.color}15`,
                        }}
                      >
                        {priority.icon} {priority.label}
                      </span>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          color: status.color,
                          backgroundColor: `${status.color}15`,
                        }}
                      >
                        {status.label}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] font-medium text-red-500 px-1.5 py-0.5 rounded-full bg-red-100">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
