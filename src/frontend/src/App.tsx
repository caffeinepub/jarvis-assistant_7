import { Toaster } from "@/components/ui/sonner";
import {
  BellRing,
  FileText,
  MessageSquare,
  Mic,
  MicOff,
  Radio,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Role } from "./backend.d";
import { ConversationPanel } from "./components/ConversationPanel";
import { JarvisOrb, type OrbState } from "./components/JarvisOrb";
import { NotesPanel } from "./components/NotesPanel";
import { RemindersPanel } from "./components/RemindersPanel";
import {
  useAddMessage,
  useAddNote,
  useAddReminder,
  useGetNotes,
  useGetReminders,
} from "./hooks/useQueries";
import {
  buildHelpText,
  evaluateMath,
  formatDate,
  formatTime,
  getJoke,
  getVariedFallback,
  lookupCseBStudent,
  processCommand,
} from "./utils/commandProcessor";
import { answerGeneral } from "./utils/intelligenceEngine";

type Panel = "conversation" | "reminders" | "notes" | null;

interface LocalMessage {
  id: string;
  role: Role;
  text: string;
}

// Speech API types
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onresult:
    | ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => unknown)
    | null;
  onerror:
    | ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => unknown)
    | null;
}

interface ISpeechRecognitionResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface ISpeechRecognitionEvent extends Event {
  results: { length: number; [index: number]: ISpeechRecognitionResult };
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function App() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [transcript, setTranscript] = useState("");
  const [statusText, setStatusText] = useState("READY");
  const [isListening, setIsListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [hasSpeechAPI] = useState(() => !!SpeechRecognitionAPI);
  const [textInput, setTextInput] = useState("");
  const [micPermission, setMicPermission] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  const [voiceRate, setVoiceRate] = useState(0.85);
  const [voicePitch, setVoicePitch] = useState(0.95);
  const [voiceVolume, setVoiceVolume] = useState(1.0);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isSpeakingRef = useRef(false);
  const isHoldingRef = useRef(false);
  const continuousModeRef = useRef(false);
  // Use a ref for startListening to break circular dependency with speak
  const startListeningRef = useRef<() => void>(() => {});
  // Keep voice setting refs in sync for use inside speak callback
  const voiceRateRef = useRef(0.85);
  const voicePitchRef = useRef(0.95);
  const voiceVolumeRef = useRef(1.0);

  const addMessage = useAddMessage();
  const addReminder = useAddReminder();
  const addNote = useAddNote();
  const { data: reminders = [] } = useGetReminders();
  const { data: notes = [] } = useGetNotes();

  // Keep continuous mode ref in sync
  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

  // Keep voice setting refs in sync
  useEffect(() => {
    voiceRateRef.current = voiceRate;
  }, [voiceRate]);
  useEffect(() => {
    voicePitchRef.current = voicePitch;
  }, [voicePitch]);
  useEffect(() => {
    voiceVolumeRef.current = voiceVolume;
  }, [voiceVolume]);

  // Init speech synthesis with Android Chrome voice retry
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      // Android Chrome loads voices asynchronously — retry up to 5 times
      let retries = 0;
      const tryLoadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0 || retries >= 5) return;
        retries++;
        setTimeout(tryLoadVoices, 200);
      };
      tryLoadVoices();

      // Also listen for the voiceschanged event — warm up synthesis engine
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        // Warm up: speak a silent utterance so Android Chrome initialises the audio pipeline
        const warmUp = new SpeechSynthesisUtterance(" ");
        warmUp.volume = 0;
        window.speechSynthesis.speak(warmUp);
      });
    }
  }, []);

  // Voice selection — prefer clear, natural-sounding English voices
  const getJarvisVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    return (
      voices.find((v) => v.name === "Google US English") ||
      voices.find((v) => v.name.toLowerCase().includes("zira")) ||
      voices.find((v) => v.name === "Google UK English Female") ||
      voices.find(
        (v) =>
          v.lang === "en-US" &&
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("victoria") ||
            v.name.toLowerCase().includes("karen") ||
            v.name.toLowerCase().includes("moira") ||
            v.name.toLowerCase().includes("tessa")),
      ) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synthRef.current) {
        onEnd?.();
        return;
      }
      synthRef.current.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.pitch = voicePitchRef.current;
      utt.rate = voiceRateRef.current;
      utt.volume = voiceVolumeRef.current;
      const voice = getJarvisVoice();
      if (voice) utt.voice = voice;

      isSpeakingRef.current = true;
      setOrbState("speaking");
      setStatusText("SPEAKING");

      utt.onend = () => {
        isSpeakingRef.current = false;
        setOrbState("idle");
        setStatusText("READY");
        onEnd?.();

        // Resume continuous listening after speaking
        if (continuousModeRef.current) {
          setTimeout(() => startListeningRef.current(), 150);
        }
      };

      utt.onerror = () => {
        isSpeakingRef.current = false;
        setOrbState("idle");
        setStatusText("READY");
        onEnd?.();
      };

      synthRef.current.speak(utt);
    },
    [getJarvisVoice],
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (!isSpeakingRef.current) {
      setOrbState("idle");
      setStatusText("READY");
    }
    setTranscript("");
  }, []);

  const handleCommand = useCallback(
    async (input: string) => {
      if (!input.trim()) return;

      setTranscript("");
      setOrbState("processing");
      setStatusText("PROCESSING");

      const userMsg: LocalMessage = {
        id: `user-${Date.now()}`,
        role: Role.user,
        text: input,
      };
      setLocalMessages((prev) => [...prev, userMsg]);

      let response = "";
      const cmd = processCommand(input);

      switch (cmd.type) {
        case "time":
          response = `The current time is ${formatTime()}.`;
          break;

        case "date":
          response = `Today is ${formatDate()}.`;
          break;

        case "greeting":
          response =
            "Hey Tharun! Great to hear from you. All systems are running perfectly. How can I help you today?";
          break;

        case "goodbye":
          response =
            "Alright Tharun, I'll be right here whenever you need me. Take care!";
          if (continuousModeRef.current) {
            setContinuousMode(false);
            stopListening();
          }
          break;

        case "help":
          response = buildHelpText();
          break;

        case "joke":
          response = getJoke();
          break;

        case "clear":
          response = "Conversation history cleared. Starting fresh.";
          setLocalMessages([]);
          break;

        case "reminder_add": {
          const title = cmd.payload || "Untitled reminder";
          try {
            await addReminder.mutateAsync({ title, description: "" });
            response = `Got it! Reminder set: "${title}". I'll keep that on record.`;
          } catch {
            response =
              "I encountered an error setting that reminder. Please try again.";
          }
          break;
        }

        case "reminders_list": {
          const pending = reminders.filter((r) => !r.done);
          if (pending.length === 0) {
            response = "You have no pending reminders. Your schedule is clear.";
          } else {
            const titles = pending
              .slice(0, 5)
              .map((r, i) => `${i + 1}. ${r.title}`)
              .join(". ");
            response = `You have ${pending.length} active ${pending.length === 1 ? "reminder" : "reminders"}: ${titles}.`;
          }
          setActivePanel("reminders");
          break;
        }

        case "note_add": {
          const content = cmd.payload || "";
          if (!content) {
            response = "I didn't catch the note content. Please try again.";
          } else {
            try {
              await addNote.mutateAsync(content);
              response = `Note saved: "${content.slice(0, 60)}${content.length > 60 ? "..." : ""}".`;
            } catch {
              response = "I encountered an error saving that note.";
            }
          }
          break;
        }

        case "notes_list": {
          if (notes.length === 0) {
            response = "No notes on file yet. Your data banks are clear.";
          } else {
            response = `You have ${notes.length} ${notes.length === 1 ? "note" : "notes"} on file.`;
          }
          setActivePanel("notes");
          break;
        }

        case "search": {
          const query = cmd.payload || "";
          if (query) {
            const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(url, "_blank");
            response = `Searching for "${query}". Opening results now.`;
          } else {
            response = "What would you like me to search for?";
          }
          break;
        }

        case "calculate": {
          const expr = cmd.payload || "";
          const result = evaluateMath(expr);
          if (result !== null) {
            response = `The result of ${expr} is ${result}.`;
          } else {
            response =
              "I'm afraid I couldn't evaluate that expression. Please check the formula.";
          }
          break;
        }

        case "who_are_you": {
          response =
            "My name is Jarvis — Just A Rather Very Intelligent System. I'm your personal AI assistant, created by Yash to help you with just about anything.";
          break;
        }

        case "how_built": {
          response =
            "I was created by Yash. He built me using a Motoko smart contract running on the Internet Computer blockchain for my memory and data, and a React frontend for my interface. My voice and speech recognition use your device's built-in Web Speech API — so I run entirely in your browser.";
          break;
        }

        case "who_created_you": {
          response =
            "I was created by Yash. He designed and built me from the ground up to be your intelligent personal assistant.";
          break;
        }

        case "call": {
          const number = cmd.payload || "";
          if (number) {
            window.location.href = `tel:${number.replace(/\s+/g, "")}`;
            response = `Calling ${number} now.`;
          } else {
            response =
              "Please tell me a number to call. Say 'call' followed by the number.";
          }
          break;
        }

        case "speak_faster": {
          const newRate = Math.min(1.5, voiceRateRef.current + 0.1);
          setVoiceRate(newRate);
          voiceRateRef.current = newRate;
          response = "Speaking faster now.";
          break;
        }

        case "speak_slower": {
          const newRate = Math.max(0.5, voiceRateRef.current - 0.1);
          setVoiceRate(newRate);
          voiceRateRef.current = newRate;
          response = "Speaking a bit slower now.";
          break;
        }

        case "speak_louder": {
          const newVol = Math.min(1.0, voiceVolumeRef.current + 0.2);
          setVoiceVolume(newVol);
          voiceVolumeRef.current = newVol;
          response = "Speaking louder.";
          break;
        }

        case "speak_quieter": {
          const newVol = Math.max(0.2, voiceVolumeRef.current - 0.2);
          setVoiceVolume(newVol);
          voiceVolumeRef.current = newVol;
          response = "Lowering my volume.";
          break;
        }

        case "reset_voice": {
          setVoiceRate(0.88);
          setVoicePitch(1.0);
          setVoiceVolume(1.0);
          voiceRateRef.current = 0.88;
          voicePitchRef.current = 1.0;
          voiceVolumeRef.current = 1.0;
          response = "Voice reset to default.";
          break;
        }

        case "cse_b_student": {
          const roll = cmd.payload || "";
          const info = lookupCseBStudent(roll);
          if (info) {
            response = info;
          } else {
            response = `I don't have any information for roll number ${roll} in CSE B section.`;
          }
          break;
        }

        default: {
          // Try intelligence engine first (covers general_question + unknown)
          const smartAnswer = answerGeneral(input, localMessages);
          response = smartAnswer || getVariedFallback();
          break;
        }
      }

      const jarvisMsg: LocalMessage = {
        id: `jarvis-${Date.now()}`,
        role: Role.jarvis,
        text: response,
      };
      setLocalMessages((prev) => [...prev, jarvisMsg]);

      // Save to backend
      addMessage.mutate({ role: Role.user, text: input });
      addMessage.mutate({ role: Role.jarvis, text: response });

      speak(response);
    },
    [
      reminders,
      notes,
      localMessages,
      addMessage,
      addReminder,
      addNote,
      speak,
      stopListening,
    ],
  );

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    if (isSpeakingRef.current) return;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "en-GB";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setOrbState("listening");
        setStatusText("LISTENING");
        setMicPermission("granted");
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        const last = event.results[event.results.length - 1];
        const text = last[0].transcript;
        setTranscript(text);
        if (last.isFinal) {
          setTranscript("");
          recognition.stop();
          handleCommand(text);
        }
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        if (event.error === "not-allowed") {
          setMicPermission("denied");
          toast.error(
            "Microphone access denied. Please enable it in browser settings.",
          );
        }
        setIsListening(false);
        if (!isSpeakingRef.current) {
          setOrbState("idle");
          setStatusText("READY");
        }
        setTranscript("");
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        if (!isSpeakingRef.current) {
          setOrbState("idle");
          setStatusText("READY");
        }
        setTranscript("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      toast.error("Failed to start speech recognition.");
    }
  }, [handleCommand]);

  // Keep startListeningRef in sync to allow speak to call it without circular dep
  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // Continuous mode effect
  useEffect(() => {
    if (continuousMode && !isListening && !isSpeakingRef.current) {
      const t = setTimeout(() => startListening(), 200);
      return () => clearTimeout(t);
    }
  }, [continuousMode, isListening, startListening]);

  // Touch hold handlers for push-to-talk
  function handleMicPressStart() {
    if (!hasSpeechAPI) return;
    isHoldingRef.current = true;
    if (!isListening && !isSpeakingRef.current) {
      startListening();
    }
  }

  function handleMicPressEnd() {
    if (!hasSpeechAPI) return;
    isHoldingRef.current = false;
    if (isListening && !continuousMode) {
      stopListening();
    }
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleCommand(textInput.trim());
    setTextInput("");
  }

  function togglePanel(panel: Panel) {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  // Use a ref for speak to use in one-time greeting without exhaustive-deps issue
  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // Greeting on first load
  useEffect(() => {
    const t = setTimeout(() => {
      speakRef.current(
        "Hey Tharun! I'm Jarvis, your intelligent assistant. All systems are ready. What can I do for you?",
      );
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const statusColors: Record<string, string> = {
    READY: "oklch(0.82 0.22 200)",
    LISTENING: "oklch(0.88 0.2 185)",
    SPEAKING: "oklch(0.92 0.15 195)",
    PROCESSING: "oklch(0.75 0.18 220)",
  };

  return (
    <div
      className="relative flex flex-col"
      style={{
        height: "100dvh",
        width: "100dvw",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 80% 80% at 50% 0%, oklch(0.12 0.03 240 / 0.9) 0%, oklch(0.07 0.014 250) 60%, oklch(0.05 0.01 260) 100%)",
      }}
    >
      <Toaster position="top-center" theme="dark" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.82 0.22 200 / 0.03) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.22 200 / 0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <div
          className="w-12 h-12"
          style={{
            borderTop: "1px solid oklch(0.82 0.22 200 / 0.3)",
            borderLeft: "1px solid oklch(0.82 0.22 200 / 0.3)",
          }}
        />
      </div>
      <div className="absolute top-3 right-3 pointer-events-none">
        <div
          className="w-12 h-12"
          style={{
            borderTop: "1px solid oklch(0.82 0.22 200 / 0.3)",
            borderRight: "1px solid oklch(0.82 0.22 200 / 0.3)",
          }}
        />
      </div>
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <div
          className="w-12 h-12"
          style={{
            borderBottom: "1px solid oklch(0.82 0.22 200 / 0.3)",
            borderLeft: "1px solid oklch(0.82 0.22 200 / 0.3)",
          }}
        />
      </div>
      <div className="absolute bottom-3 right-3 pointer-events-none">
        <div
          className="w-12 h-12"
          style={{
            borderBottom: "1px solid oklch(0.82 0.22 200 / 0.3)",
            borderRight: "1px solid oklch(0.82 0.22 200 / 0.3)",
          }}
        />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-10 text-center pt-8 pb-2 flex-shrink-0 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1
            className="font-display text-4xl font-bold tracking-[0.3em] animate-flicker"
            style={{
              color: "oklch(0.88 0.2 195)",
              textShadow:
                "0 0 12px oklch(0.82 0.22 200 / 0.9), 0 0 40px oklch(0.82 0.22 200 / 0.5), 0 0 80px oklch(0.82 0.22 200 / 0.25)",
              letterSpacing: "0.4em",
            }}
          >
            J.A.R.V.I.S
          </h1>
          <p
            className="font-sans text-xs tracking-[0.2em] mt-1.5"
            style={{
              color: "oklch(0.55 0.1 215)",
              letterSpacing: "0.25em",
            }}
          >
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </p>
        </motion.div>

        {/* System status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center justify-center gap-4 mt-3"
        >
          {["SYSTEMS ONLINE", "NEURAL NET ACTIVE", "MEMORY NOMINAL"].map(
            (label) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className="rounded-full animate-corner-blink"
                  style={{
                    width: "5px",
                    height: "5px",
                    background: "oklch(0.72 0.2 165)",
                    boxShadow: "0 0 6px oklch(0.72 0.2 165)",
                  }}
                />
                <span
                  className="font-mono text-[9px] tracking-widest hidden sm:block"
                  style={{ color: "oklch(0.45 0.08 215)" }}
                >
                  {label}
                </span>
              </div>
            ),
          )}
        </motion.div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 min-h-0">
        {/* Transcript overlay */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              key="transcript"
              className="animate-transcript text-center mb-4 px-6 max-w-xs"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <p
                className="font-sans text-sm leading-relaxed"
                style={{
                  color: "oklch(0.75 0.12 210 / 0.8)",
                  textShadow: "0 0 10px oklch(0.82 0.22 200 / 0.3)",
                }}
              >
                "{transcript}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orb */}
        <JarvisOrb state={orbState} />

        {/* Status text */}
        <motion.div
          className="mt-2 text-center"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <div
              className="rounded-full"
              style={{
                width: "6px",
                height: "6px",
                background: statusColors[statusText] || "oklch(0.82 0.22 200)",
                boxShadow: `0 0 8px ${statusColors[statusText] || "oklch(0.82 0.22 200)"}`,
                transition: "all 0.3s ease",
              }}
            />
            <span
              className="font-display text-xs tracking-[0.3em]"
              style={{
                color: statusColors[statusText] || "oklch(0.82 0.22 200)",
                textShadow: `0 0 8px ${statusColors[statusText] || "oklch(0.82 0.22 200 / 0.5)"}`,
              }}
            >
              {statusText}
            </span>
          </div>
        </motion.div>

        {/* Mic permission warning */}
        {micPermission === "denied" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 px-4 py-2 rounded-lg text-center"
            style={{
              background: "oklch(0.62 0.24 27 / 0.15)",
              border: "1px solid oklch(0.62 0.24 27 / 0.3)",
            }}
          >
            <p className="text-xs" style={{ color: "oklch(0.78 0.18 27)" }}>
              Microphone access denied. Enable in browser settings.
            </p>
          </motion.div>
        )}

        {/* Text input — always visible */}
        <form
          onSubmit={handleTextSubmit}
          className="mt-4 w-full max-w-sm flex gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type a command or question..."
            className="flex-1 px-4 rounded-xl outline-none"
            style={{
              background: hasSpeechAPI
                ? "oklch(0.10 0.018 248 / 0.6)"
                : "oklch(0.12 0.02 248 / 0.8)",
              border: `1px solid ${hasSpeechAPI ? "oklch(0.82 0.22 200 / 0.15)" : "oklch(0.82 0.22 200 / 0.2)"}`,
              color: "oklch(0.88 0.04 210)",
              fontSize: "16px",
              height: hasSpeechAPI ? "40px" : "48px",
              opacity: hasSpeechAPI ? 0.85 : 1,
            }}
          />
          <button
            type="submit"
            className="rounded-xl font-display text-xs tracking-widest"
            style={{
              background: "oklch(0.82 0.22 200)",
              color: "oklch(0.08 0.015 250)",
              padding: hasSpeechAPI ? "0 14px" : "0 20px",
              height: hasSpeechAPI ? "40px" : "48px",
            }}
          >
            SEND
          </button>
        </form>
      </main>

      {/* ── CONTROLS ── */}
      <footer className="relative z-10 flex-shrink-0 pb-8 pt-4 px-6">
        {/* Main controls row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Conversation toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("conversation")}
            className="flex flex-col items-center gap-1.5 min-w-[52px]"
            aria-label="Conversation"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background:
                  activePanel === "conversation"
                    ? "oklch(0.82 0.22 200 / 0.15)"
                    : "oklch(0.12 0.02 248 / 0.6)",
                border: `1px solid ${
                  activePanel === "conversation"
                    ? "oklch(0.82 0.22 200 / 0.5)"
                    : "oklch(0.82 0.22 200 / 0.15)"
                }`,
                boxShadow:
                  activePanel === "conversation"
                    ? "0 0 12px oklch(0.82 0.22 200 / 0.3)"
                    : "none",
              }}
            >
              <MessageSquare
                size={20}
                style={{
                  color:
                    activePanel === "conversation"
                      ? "oklch(0.82 0.22 200)"
                      : "oklch(0.55 0.1 215)",
                }}
              />
            </div>
            <span
              className="font-mono text-[9px] tracking-widest"
              style={{ color: "oklch(0.45 0.06 218)" }}
            >
              LOG
            </span>
          </motion.button>

          {/* MAIN MIC BUTTON */}
          {hasSpeechAPI && (
            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                onPointerDown={handleMicPressStart}
                onPointerUp={handleMicPressEnd}
                onPointerLeave={handleMicPressEnd}
                whileTap={{ scale: 0.93 }}
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: isListening
                    ? "radial-gradient(circle, oklch(0.82 0.22 200 / 0.25) 0%, oklch(0.14 0.025 240) 100%)"
                    : "radial-gradient(circle, oklch(0.16 0.03 240) 0%, oklch(0.1 0.018 250) 100%)",
                  border: `2px solid ${
                    isListening
                      ? "oklch(0.82 0.22 200 / 0.8)"
                      : "oklch(0.82 0.22 200 / 0.3)"
                  }`,
                  boxShadow: isListening
                    ? "0 0 24px oklch(0.82 0.22 200 / 0.6), 0 0 48px oklch(0.82 0.22 200 / 0.25), inset 0 0 16px oklch(0.82 0.22 200 / 0.1)"
                    : "0 0 12px oklch(0.82 0.22 200 / 0.2), inset 0 0 8px oklch(0.82 0.22 200 / 0.05)",
                  transition: "all 0.2s ease",
                  touchAction: "none",
                  userSelect: "none",
                }}
                aria-label={isListening ? "Stop listening" : "Hold to speak"}
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    <MicOff
                      size={28}
                      style={{ color: "oklch(0.88 0.2 195)" }}
                    />
                  </motion.div>
                ) : (
                  <Mic
                    size={28}
                    style={{
                      color: "oklch(0.82 0.22 200)",
                      filter: "drop-shadow(0 0 6px oklch(0.82 0.22 200 / 0.6))",
                    }}
                  />
                )}
              </motion.button>
              <span
                className="font-mono text-[9px] tracking-widest"
                style={{ color: "oklch(0.45 0.06 218)" }}
              >
                HOLD
              </span>
            </div>
          )}

          {/* Continuous listen toggle */}
          {hasSpeechAPI && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const next = !continuousMode;
                setContinuousMode(next);
                if (!next) {
                  stopListening();
                }
              }}
              className="flex flex-col items-center gap-1.5 min-w-[52px]"
              aria-label="Toggle continuous listening"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  background: continuousMode
                    ? "oklch(0.72 0.2 165 / 0.15)"
                    : "oklch(0.12 0.02 248 / 0.6)",
                  border: `1px solid ${
                    continuousMode
                      ? "oklch(0.72 0.2 165 / 0.5)"
                      : "oklch(0.82 0.22 200 / 0.15)"
                  }`,
                  boxShadow: continuousMode
                    ? "0 0 12px oklch(0.72 0.2 165 / 0.3)"
                    : "none",
                }}
              >
                <Radio
                  size={20}
                  style={{
                    color: continuousMode
                      ? "oklch(0.72 0.2 165)"
                      : "oklch(0.55 0.1 215)",
                  }}
                />
              </div>
              <span
                className="font-mono text-[9px] tracking-widest"
                style={{ color: "oklch(0.45 0.06 218)" }}
              >
                AUTO
              </span>
            </motion.button>
          )}
        </div>

        {/* Secondary controls */}
        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("reminders")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{
              background:
                activePanel === "reminders"
                  ? "oklch(0.82 0.22 200 / 0.12)"
                  : "oklch(0.12 0.02 248 / 0.5)",
              border: `1px solid ${
                activePanel === "reminders"
                  ? "oklch(0.82 0.22 200 / 0.4)"
                  : "oklch(0.82 0.22 200 / 0.12)"
              }`,
              transition: "all 0.2s ease",
            }}
            aria-label="Reminders"
          >
            <BellRing
              size={15}
              style={{
                color:
                  activePanel === "reminders"
                    ? "oklch(0.82 0.22 200)"
                    : "oklch(0.55 0.1 215)",
              }}
            />
            <span
              className="font-mono text-[10px] tracking-widest"
              style={{
                color:
                  activePanel === "reminders"
                    ? "oklch(0.82 0.22 200)"
                    : "oklch(0.5 0.06 218)",
              }}
            >
              REMINDERS
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("notes")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{
              background:
                activePanel === "notes"
                  ? "oklch(0.82 0.22 200 / 0.12)"
                  : "oklch(0.12 0.02 248 / 0.5)",
              border: `1px solid ${
                activePanel === "notes"
                  ? "oklch(0.82 0.22 200 / 0.4)"
                  : "oklch(0.82 0.22 200 / 0.12)"
              }`,
              transition: "all 0.2s ease",
            }}
            aria-label="Notes"
          >
            <FileText
              size={15}
              style={{
                color:
                  activePanel === "notes"
                    ? "oklch(0.82 0.22 200)"
                    : "oklch(0.55 0.1 215)",
              }}
            />
            <span
              className="font-mono text-[10px] tracking-widest"
              style={{
                color:
                  activePanel === "notes"
                    ? "oklch(0.82 0.22 200)"
                    : "oklch(0.5 0.06 218)",
              }}
            >
              NOTES
            </span>
          </motion.button>
        </div>

        {/* Caffeine footer */}
        <div className="text-center mt-4">
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[9px] tracking-widest transition-opacity hover:opacity-80"
            style={{ color: "oklch(0.35 0.05 220)" }}
          >
            © {new Date().getFullYear()}. BUILT WITH ♥ USING CAFFEINE.AI
          </a>
        </div>
      </footer>

      {/* ── SLIDE-UP PANELS ── */}
      <AnimatePresence>
        {activePanel && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-20"
              style={{ background: "oklch(0.05 0.01 260 / 0.7)" }}
              onClick={() => setActivePanel(null)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 z-30 rounded-t-3xl flex flex-col"
              style={{
                height: "70dvh",
                background: "oklch(0.09 0.017 248 / 0.97)",
                backdropFilter: "blur(24px) saturate(1.8)",
                WebkitBackdropFilter: "blur(24px) saturate(1.8)",
                border: "1px solid oklch(0.82 0.22 200 / 0.15)",
                borderBottom: "none",
                boxShadow:
                  "0 -8px 40px oklch(0.82 0.22 200 / 0.12), 0 -2px 12px oklch(0 0 0 / 0.4)",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div
                  className="rounded-full"
                  style={{
                    width: "36px",
                    height: "3px",
                    background: "oklch(0.82 0.22 200 / 0.25)",
                  }}
                />
              </div>

              {activePanel === "conversation" && (
                <ConversationPanel
                  onClose={() => setActivePanel(null)}
                  localMessages={localMessages}
                />
              )}
              {activePanel === "reminders" && (
                <RemindersPanel onClose={() => setActivePanel(null)} />
              )}
              {activePanel === "notes" && (
                <NotesPanel onClose={() => setActivePanel(null)} />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
