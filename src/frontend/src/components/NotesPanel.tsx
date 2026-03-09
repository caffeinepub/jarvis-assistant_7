import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Note } from "../backend.d";
import { useAddNote, useDeleteNote, useGetNotes } from "../hooks/useQueries";

interface NotesPanelProps {
  onClose: () => void;
}

export function NotesPanel({ onClose }: NotesPanelProps) {
  const { data: notes = [] } = useGetNotes();
  const addNote = useAddNote();
  const deleteNote = useDeleteNote();
  const [newContent, setNewContent] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const sorted = [...notes].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  function handleAdd() {
    if (!newContent.trim()) return;
    addNote.mutate(newContent.trim());
    setNewContent("");
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

  function renderNote(note: Note) {
    return (
      <motion.div
        key={String(note.id)}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="glass-card rounded-xl p-3 mb-2"
      >
        <div className="flex items-start gap-2">
          <FileText
            size={13}
            className="mt-0.5 flex-shrink-0"
            style={{ color: "oklch(0.82 0.22 200 / 0.6)" }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap break-words"
              style={{ color: "oklch(0.85 0.04 210)" }}
            >
              {note.content}
            </p>
            <p
              className="text-xs mt-1.5"
              style={{ color: "oklch(0.4 0.04 220)" }}
            >
              {formatDate(note.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => deleteNote.mutate(note.id)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "oklch(0.55 0.08 15)" }}
            aria-label="Delete note"
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
          <FileText size={14} style={{ color: "oklch(0.82 0.22 200)" }} />
          <div>
            <h2 className="font-display text-sm font-semibold tracking-widest text-arc-cyan glow-text-sm">
              NOTES
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.45 0.08 215)" }}
            >
              {notes.length} {notes.length === 1 ? "entry" : "entries"} stored
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
              <Textarea
                placeholder="Enter note..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                className="resize-none glass-card border-0"
                style={{
                  background: "oklch(0.12 0.02 248 / 0.7)",
                  color: "oklch(0.88 0.04 210)",
                  fontSize: "16px",
                }}
              />
              <Button
                onClick={handleAdd}
                disabled={!newContent.trim()}
                className="w-full h-9 text-xs tracking-wider font-display"
                style={{
                  background: "oklch(0.82 0.22 200)",
                  color: "oklch(0.08 0.015 250)",
                  boxShadow: "0 0 12px oklch(0.82 0.22 200 / 0.3)",
                }}
              >
                SAVE NOTE
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <ScrollArea className="flex-1 px-3 py-2 scrollbar-arc">
        <AnimatePresence>
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <FileText
                size={22}
                style={{ color: "oklch(0.82 0.22 200 / 0.3)" }}
              />
              <p
                className="text-xs tracking-widest font-display"
                style={{ color: "oklch(0.4 0.06 220)" }}
              >
                NO NOTES ON FILE
              </p>
              <p className="text-xs" style={{ color: "oklch(0.35 0.04 220)" }}>
                Say "Note: ..." or tap +
              </p>
            </div>
          ) : (
            sorted.map(renderNote)
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
