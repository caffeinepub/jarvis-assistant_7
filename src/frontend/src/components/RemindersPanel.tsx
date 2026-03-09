import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BellRing, Check, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Reminder } from "../backend.d";
import {
  useAddReminder,
  useDeleteReminder,
  useGetReminders,
  useMarkDone,
} from "../hooks/useQueries";

interface RemindersPanelProps {
  onClose: () => void;
}

export function RemindersPanel({ onClose }: RemindersPanelProps) {
  const { data: reminders = [] } = useGetReminders();
  const markDone = useMarkDone();
  const deleteReminder = useDeleteReminder();
  const addReminder = useAddReminder();
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const pending = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);

  function handleAdd() {
    if (!newTitle.trim()) return;
    addReminder.mutate({ title: newTitle.trim(), description: newDesc.trim() });
    setNewTitle("");
    setNewDesc("");
    setShowAdd(false);
  }

  function formatDate(ts: bigint): string {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderReminder(r: Reminder) {
    return (
      <motion.div
        key={String(r.id)}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8, height: 0 }}
        transition={{ duration: 0.2 }}
        className="glass-card rounded-xl p-3 mb-2"
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => !r.done && markDone.mutate(r.id)}
            className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
            style={{
              border: r.done
                ? "none"
                : "1.5px solid oklch(0.82 0.22 200 / 0.5)",
              background: r.done ? "oklch(0.82 0.22 200)" : "transparent",
              boxShadow: r.done ? "0 0 8px oklch(0.82 0.22 200 / 0.5)" : "none",
            }}
            aria-label={r.done ? "Completed" : "Mark complete"}
          >
            {r.done && (
              <Check size={11} style={{ color: "oklch(0.08 0.015 250)" }} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium leading-tight"
              style={{
                color: r.done ? "oklch(0.45 0.06 220)" : "oklch(0.88 0.04 210)",
                textDecoration: r.done ? "line-through" : "none",
              }}
            >
              {r.title}
            </p>
            {r.description && (
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "oklch(0.5 0.06 215)" }}
              >
                {r.description}
              </p>
            )}
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.4 0.04 220)" }}
            >
              {formatDate(r.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => deleteReminder.mutate(r.id)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "oklch(0.55 0.08 15)" }}
            aria-label="Delete reminder"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.82 0.22 200 / 0.12)" }}
      >
        <div className="flex items-center gap-2">
          <BellRing size={14} style={{ color: "oklch(0.82 0.22 200)" }} />
          <div>
            <h2 className="font-display text-sm font-semibold tracking-widest text-arc-cyan glow-text-sm">
              REMINDERS
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.45 0.08 215)" }}
            >
              {pending.length} active · {done.length} completed
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            style={{ color: "oklch(0.82 0.22 200)" }}
            onClick={() => setShowAdd(!showAdd)}
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            style={{ color: "oklch(0.55 0.08 220)" }}
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden flex-shrink-0"
            style={{ borderBottom: "1px solid oklch(0.82 0.22 200 / 0.1)" }}
          >
            <div className="p-3 space-y-2">
              <Input
                placeholder="Reminder title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="glass-card border-0"
                style={{
                  background: "oklch(0.12 0.02 248 / 0.7)",
                  color: "oklch(0.88 0.04 210)",
                  fontSize: "16px",
                }}
              />
              <Input
                placeholder="Description (optional)..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="glass-card border-0"
                style={{
                  background: "oklch(0.12 0.02 248 / 0.7)",
                  color: "oklch(0.88 0.04 210)",
                  fontSize: "16px",
                }}
              />
              <Button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="w-full h-9 text-xs tracking-wider font-display"
                style={{
                  background: "oklch(0.82 0.22 200)",
                  color: "oklch(0.08 0.015 250)",
                  boxShadow: "0 0 12px oklch(0.82 0.22 200 / 0.3)",
                }}
              >
                ADD REMINDER
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <ScrollArea className="flex-1 px-3 py-2 scrollbar-arc">
        <AnimatePresence>
          {reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <BellRing
                size={22}
                style={{ color: "oklch(0.82 0.22 200 / 0.3)" }}
              />
              <p
                className="text-xs tracking-widest font-display"
                style={{ color: "oklch(0.4 0.06 220)" }}
              >
                NO ACTIVE REMINDERS
              </p>
              <p className="text-xs" style={{ color: "oklch(0.35 0.04 220)" }}>
                Say "Remind me to..." or tap +
              </p>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <>
                  <p
                    className="text-xs tracking-widest mb-2 font-display"
                    style={{ color: "oklch(0.82 0.22 200 / 0.5)" }}
                  >
                    ACTIVE
                  </p>
                  {pending.map(renderReminder)}
                </>
              )}
              {done.length > 0 && (
                <>
                  <p
                    className="text-xs tracking-widest mt-3 mb-2 font-display"
                    style={{ color: "oklch(0.45 0.04 220)" }}
                  >
                    COMPLETED
                  </p>
                  {done.map(renderReminder)}
                </>
              )}
            </>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
