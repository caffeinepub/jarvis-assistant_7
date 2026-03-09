import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Message } from "../backend.d";
import { Role } from "../backend.d";
import { useClearHistory, useGetHistory } from "../hooks/useQueries";

interface ConversationPanelProps {
  onClose: () => void;
  localMessages: Array<{ role: Role; text: string; id: string }>;
}

export function ConversationPanel({
  onClose,
  localMessages,
}: ConversationPanelProps) {
  const { data: history = [] } = useGetHistory();
  const clearHistory = useClearHistory();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Merge backend history with local (optimistic) messages
  const backendMessages = [...history].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger on count change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [backendMessages.length, localMessages.length]);

  function formatTimestamp(ts: bigint): string {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderMessage(
    msg: Message | { role: Role; text: string; id: string },
    index: number,
  ) {
    const isJarvis =
      (msg.role as string) === Role.jarvis || (msg.role as string) === "jarvis";
    const text = msg.text;
    const timestamp =
      "timestamp" in msg ? formatTimestamp((msg as Message).timestamp) : null;

    return (
      <motion.div
        key={"id" in msg ? String(msg.id) : (msg as { id: string }).id}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, delay: index * 0.03 }}
        className={`flex ${isJarvis ? "justify-start" : "justify-end"} mb-3`}
      >
        <div
          className={`max-w-[82%] rounded-2xl px-4 py-3 relative ${
            isJarvis ? "rounded-tl-sm" : "rounded-tr-sm"
          }`}
          style={{
            background: isJarvis
              ? "oklch(0.14 0.03 220 / 0.9)"
              : "oklch(0.18 0.04 245 / 0.9)",
            border: `1px solid ${isJarvis ? "oklch(0.82 0.22 200 / 0.2)" : "oklch(0.6 0.2 240 / 0.2)"}`,
            boxShadow: isJarvis
              ? "0 2px 12px oklch(0.82 0.22 200 / 0.1)"
              : "none",
          }}
        >
          {isJarvis && (
            <div
              className="text-xs font-display font-semibold tracking-widest mb-1.5"
              style={{
                color: "oklch(0.82 0.22 200)",
                textShadow: "0 0 8px oklch(0.82 0.22 200 / 0.5)",
              }}
            >
              JARVIS
            </div>
          )}
          <p
            className="text-sm leading-relaxed"
            style={{
              color: isJarvis ? "oklch(0.88 0.04 210)" : "oklch(0.8 0.03 220)",
            }}
          >
            {text}
          </p>
          {timestamp && (
            <div className="text-right mt-1.5">
              <span
                className="text-xs"
                style={{ color: "oklch(0.45 0.04 220)" }}
              >
                {timestamp}
              </span>
            </div>
          )}
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
        <div>
          <h2 className="font-display text-sm font-semibold tracking-widest text-arc-cyan glow-text-sm">
            CONVERSATION LOG
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.45 0.08 215)" }}
          >
            {backendMessages.length + localMessages.length} exchanges recorded
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            style={{ color: "oklch(0.55 0.08 220)" }}
            onClick={() => clearHistory.mutate()}
            title="Clear history"
          >
            <Trash2 size={14} />
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

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-2 scrollbar-arc">
        <AnimatePresence>
          {backendMessages.length === 0 && localMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <div
                className="rounded-full w-10 h-10 flex items-center justify-center"
                style={{
                  border: "1px solid oklch(0.82 0.22 200 / 0.2)",
                  background: "oklch(0.82 0.22 200 / 0.05)",
                }}
              >
                <div
                  className="rounded-full w-3 h-3"
                  style={{ background: "oklch(0.82 0.22 200 / 0.4)" }}
                />
              </div>
              <p
                className="text-xs tracking-widest font-display"
                style={{ color: "oklch(0.4 0.06 220)" }}
              >
                NO EXCHANGES ON RECORD
              </p>
              <p className="text-xs" style={{ color: "oklch(0.35 0.04 220)" }}>
                Speak to initiate conversation
              </p>
            </div>
          ) : (
            <>
              {backendMessages.map((msg, i) => renderMessage(msg, i))}
              {localMessages.map((msg, i) =>
                renderMessage(msg, backendMessages.length + i),
              )}
            </>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
}
