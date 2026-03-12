import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Role } from "../backend.d";

interface LocalMessage {
  id: string;
  role: Role;
  text: string;
  isWebSearch?: boolean;
}

interface ConversationPanelProps {
  onClose: () => void;
  localMessages: LocalMessage[];
}

export function ConversationPanel({
  onClose,
  localMessages,
}: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages.length]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.82 0.22 200 / 0.1)" }}
      >
        <span
          className="font-mono text-xs tracking-widest"
          style={{ color: "oklch(0.82 0.22 200)" }}
        >
          COMMUNICATION LOG
        </span>
        <button
          type="button"
          onClick={onClose}
          data-ocid="jarvis.conversation.close_button"
          className="p-1.5 rounded-lg transition-all hover:opacity-80"
          style={{
            background: "oklch(0.82 0.22 200 / 0.1)",
            border: "1px solid oklch(0.82 0.22 200 / 0.2)",
          }}
        >
          <X size={14} style={{ color: "oklch(0.82 0.22 200)" }} />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {localMessages.length === 0 ? (
          <div
            className="flex items-center justify-center h-24"
            data-ocid="jarvis.conversation.empty_state"
          >
            <p
              className="font-mono text-xs tracking-widest text-center"
              style={{ color: "oklch(0.4 0.06 218)" }}
            >
              NO COMMUNICATIONS ON RECORD
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {localMessages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                data-ocid={`jarvis.conversation.item.${idx + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${
                  msg.role === Role.user ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === Role.user
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.role === Role.user
                        ? "oklch(0.82 0.22 200 / 0.12)"
                        : "oklch(0.12 0.02 248 / 0.7)",
                    border:
                      msg.role === Role.user
                        ? "1px solid oklch(0.82 0.22 200 / 0.3)"
                        : "1px solid oklch(0.82 0.22 200 / 0.1)",
                  }}
                >
                  {/* Web search badge */}
                  {msg.isWebSearch && msg.role === Role.jarvis && (
                    <div
                      className="inline-flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.72 0.2 165 / 0.15)",
                        border: "1px solid oklch(0.72 0.2 165 / 0.4)",
                      }}
                    >
                      <div
                        className="rounded-full"
                        style={{
                          width: "5px",
                          height: "5px",
                          background: "oklch(0.72 0.2 165)",
                          boxShadow: "0 0 4px oklch(0.72 0.2 165)",
                        }}
                      />
                      <span
                        className="font-mono text-[9px] tracking-widest"
                        style={{ color: "oklch(0.72 0.2 165)" }}
                      >
                        WEB SEARCH
                      </span>
                    </div>
                  )}
                  <p
                    className="font-sans text-sm leading-relaxed"
                    style={{
                      color:
                        msg.role === Role.user
                          ? "oklch(0.82 0.15 205)"
                          : "oklch(0.78 0.06 210)",
                    }}
                  >
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
