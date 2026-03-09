import { motion } from "motion/react";

export type OrbState = "idle" | "listening" | "speaking" | "processing";

interface JarvisOrbProps {
  state: OrbState;
}

export function JarvisOrb({ state }: JarvisOrbProps) {
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing";

  return (
    <div
      className="relative flex items-center justify-center w-full"
      style={{ height: "280px" }}
    >
      {/* Ambient background bloom */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "320px",
          height: "320px",
          background: isListening
            ? "radial-gradient(circle, oklch(0.82 0.22 200 / 0.12) 0%, transparent 70%)"
            : isSpeaking
              ? "radial-gradient(circle, oklch(0.88 0.18 195 / 0.18) 0%, transparent 70%)"
              : "radial-gradient(circle, oklch(0.6 0.25 240 / 0.08) 0%, transparent 70%)",
          transition: "background 0.5s ease",
        }}
      />

      {/* Listening ripple rings */}
      {isListening && (
        <>
          <div
            className="absolute rounded-full border animate-listen-ripple pointer-events-none"
            style={{
              width: "200px",
              height: "200px",
              borderColor: "oklch(0.82 0.22 200 / 0.5)",
            }}
          />
          <div
            className="absolute rounded-full border animate-listen-ripple pointer-events-none"
            style={{
              width: "200px",
              height: "200px",
              borderColor: "oklch(0.82 0.22 200 / 0.35)",
              animationDelay: "0.4s",
            }}
          />
          <div
            className="absolute rounded-full border animate-listen-ripple pointer-events-none"
            style={{
              width: "200px",
              height: "200px",
              borderColor: "oklch(0.82 0.22 200 / 0.2)",
              animationDelay: "0.8s",
            }}
          />
        </>
      )}

      {/* Speaking expanding rings */}
      {isSpeaking &&
        [1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border animate-speak-ring pointer-events-none"
            style={{
              width: `${150 + i * 28}px`,
              height: `${150 + i * 28}px`,
              borderColor: `oklch(0.82 0.22 200 / ${0.6 - i * 0.12})`,
              animationDelay: `${(i - 1) * 0.15}s`,
            }}
          />
        ))}

      {/* Outer slow-rotating hex ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "220px",
          height: "220px",
          border: "1px solid oklch(0.82 0.22 200 / 0.2)",
          borderTop: "2px solid oklch(0.82 0.22 200 / 0.5)",
          borderRight: "1px solid oklch(0.82 0.22 200 / 0.15)",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Mid rotating ring (reverse) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "190px",
          height: "190px",
          border: "1px dashed oklch(0.82 0.22 200 / 0.2)",
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Inner fast ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "160px",
          height: "160px",
          border: "1.5px solid oklch(0.82 0.22 200 / 0.3)",
          borderBottom: "2px solid oklch(0.82 0.22 200 / 0.6)",
          borderTop: "1px solid oklch(0.82 0.22 200 / 0.1)",
        }}
        animate={{ rotate: isListening ? 360 : isSpeaking ? 360 : 360 }}
        transition={{
          duration: isListening ? 2.5 : isSpeaking ? 1.5 : 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Orb core */}
      <motion.div
        className="relative rounded-full flex items-center justify-center z-10"
        style={{
          width: "130px",
          height: "130px",
          background: isListening
            ? "radial-gradient(circle at 40% 35%, oklch(0.88 0.2 195 / 0.5) 0%, oklch(0.7 0.25 220) 40%, oklch(0.45 0.2 250) 100%)"
            : isSpeaking
              ? "radial-gradient(circle at 40% 35%, oklch(0.92 0.15 195 / 0.6) 0%, oklch(0.75 0.22 205) 40%, oklch(0.5 0.2 240) 100%)"
              : isProcessing
                ? "radial-gradient(circle at 40% 35%, oklch(0.7 0.18 220 / 0.4) 0%, oklch(0.55 0.2 240) 40%, oklch(0.3 0.12 260) 100%)"
                : "radial-gradient(circle at 40% 35%, oklch(0.65 0.2 210 / 0.4) 0%, oklch(0.5 0.22 240) 40%, oklch(0.25 0.1 260) 100%)",
          boxShadow: isListening
            ? "0 0 30px oklch(0.82 0.22 200 / 0.8), 0 0 60px oklch(0.82 0.22 200 / 0.4), inset 0 0 20px oklch(0.88 0.18 195 / 0.3)"
            : isSpeaking
              ? "0 0 40px oklch(0.88 0.18 195 / 0.9), 0 0 80px oklch(0.82 0.22 200 / 0.5), inset 0 0 25px oklch(0.88 0.18 195 / 0.4)"
              : isProcessing
                ? "0 0 20px oklch(0.82 0.22 200 / 0.5), 0 0 40px oklch(0.82 0.22 200 / 0.25), inset 0 0 15px oklch(0.82 0.22 200 / 0.2)"
                : "0 0 15px oklch(0.82 0.22 200 / 0.35), 0 0 35px oklch(0.82 0.22 200 / 0.15), inset 0 0 12px oklch(0.82 0.22 200 / 0.15)",
          transition: "all 0.5s ease",
        }}
        animate={
          isListening
            ? { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }
            : isSpeaking
              ? { scale: [1, 1.04, 1.08, 1.04, 1], opacity: [1, 0.95, 1] }
              : isProcessing
                ? { scale: [0.98, 1.02, 0.98] }
                : { scale: [1, 1.02, 1] }
        }
        transition={{
          duration: isListening
            ? 1.0
            : isSpeaking
              ? 0.7
              : isProcessing
                ? 0.8
                : 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Inner hex pattern */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, oklch(0.82 0.22 200 / 0.06) 0deg 30deg, transparent 30deg 60deg)",
          }}
        />

        {/* Center arc reactor dot */}
        <div
          className="relative z-10 rounded-full"
          style={{
            width: "28px",
            height: "28px",
            background:
              "radial-gradient(circle, oklch(0.95 0.1 195) 0%, oklch(0.82 0.22 200) 50%, oklch(0.6 0.25 220) 100%)",
            boxShadow:
              "0 0 12px oklch(0.88 0.18 195), 0 0 24px oklch(0.82 0.22 200 / 0.6)",
          }}
        />

        {/* Scan line effect */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ opacity: 0.3 }}
        >
          <div
            className="animate-scan-line absolute inset-x-0"
            style={{
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, oklch(0.88 0.18 195 / 0.8), transparent)",
            }}
          />
        </div>
      </motion.div>

      {/* Hex corner indicators */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * 60 - 30) * (Math.PI / 180);
        const r = 108;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full animate-corner-blink"
            style={{
              width: "5px",
              height: "5px",
              background: "oklch(0.82 0.22 200)",
              boxShadow: "0 0 6px oklch(0.82 0.22 200)",
              left: `calc(50% + ${x}px - 2.5px)`,
              top: `calc(50% + ${y}px - 2.5px)`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        );
      })}
    </div>
  );
}
