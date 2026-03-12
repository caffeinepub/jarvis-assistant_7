import { motion } from "motion/react";

export type OrbState =
  | "idle"
  | "listening"
  | "speaking"
  | "processing"
  | "thinking";

interface JarvisOrbProps {
  state: OrbState;
}

const RIPPLE_DELAYS = [0, 0.35, 0.7];
const SPEAK_RINGS = [1, 2, 3, 4];
const PARTICLE_INDICES = [0, 1, 2, 3, 4, 5];

export function JarvisOrb({ state }: JarvisOrbProps) {
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing";
  const isThinking = state === "thinking";

  // Orbital ring speeds based on state
  const ringSpeed1 = isListening ? 2 : isSpeaking ? 1.2 : isThinking ? 6 : 4;
  const ringSpeed2 = isListening
    ? 2.8
    : isSpeaking
      ? 1.8
      : isThinking
        ? 8
        : 5.5;
  const ringSpeed3 = isListening
    ? 1.8
    : isSpeaking
      ? 1.0
      : isThinking
        ? 5
        : 3.5;

  const coreGlow = isListening
    ? "0 0 40px oklch(0.88 0.22 185 / 0.9), 0 0 80px oklch(0.82 0.22 200 / 0.6), 0 0 120px oklch(0.82 0.22 200 / 0.3)"
    : isSpeaking
      ? "0 0 50px oklch(0.92 0.18 190 / 1), 0 0 100px oklch(0.85 0.22 200 / 0.7), 0 0 150px oklch(0.82 0.22 200 / 0.4)"
      : isThinking
        ? "0 0 25px oklch(0.75 0.2 220 / 0.7), 0 0 60px oklch(0.7 0.22 230 / 0.4)"
        : isProcessing
          ? "0 0 30px oklch(0.78 0.2 215 / 0.8), 0 0 70px oklch(0.75 0.22 225 / 0.4)"
          : "0 0 20px oklch(0.82 0.22 200 / 0.5), 0 0 50px oklch(0.82 0.22 200 / 0.2), 0 0 90px oklch(0.82 0.22 200 / 0.1)";

  const coreColor = isListening
    ? "radial-gradient(circle at 35% 30%, oklch(0.95 0.12 185) 0%, oklch(0.82 0.22 195) 35%, oklch(0.55 0.25 220) 70%, oklch(0.3 0.15 250) 100%)"
    : isSpeaking
      ? "radial-gradient(circle at 35% 30%, oklch(1 0.05 190) 0%, oklch(0.88 0.18 195) 30%, oklch(0.65 0.25 210) 65%, oklch(0.38 0.18 240) 100%)"
      : isThinking
        ? "radial-gradient(circle at 35% 30%, oklch(0.75 0.18 215) 0%, oklch(0.55 0.22 230) 40%, oklch(0.35 0.15 255) 100%)"
        : isProcessing
          ? "radial-gradient(circle at 35% 30%, oklch(0.8 0.2 210) 0%, oklch(0.6 0.22 225) 40%, oklch(0.38 0.15 248) 100%)"
          : "radial-gradient(circle at 35% 30%, oklch(0.75 0.18 200) 0%, oklch(0.55 0.22 215) 40%, oklch(0.32 0.12 245) 100%)";

  const ringColor = isListening
    ? "oklch(0.88 0.22 185 / 0.7)"
    : isSpeaking
      ? "oklch(0.92 0.18 190 / 0.8)"
      : isThinking
        ? "oklch(0.65 0.2 225 / 0.5)"
        : "oklch(0.82 0.22 200 / 0.55)";

  return (
    <div
      className="relative flex items-center justify-center w-full"
      style={{ height: "280px", perspective: "600px" }}
    >
      {/* Ambient bloom */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "340px",
          height: "340px",
          background: isListening
            ? "radial-gradient(circle, oklch(0.82 0.22 200 / 0.15) 0%, transparent 65%)"
            : isSpeaking
              ? "radial-gradient(circle, oklch(0.88 0.18 195 / 0.22) 0%, transparent 65%)"
              : isThinking
                ? "radial-gradient(circle, oklch(0.65 0.2 225 / 0.1) 0%, transparent 65%)"
                : "radial-gradient(circle, oklch(0.6 0.22 220 / 0.08) 0%, transparent 65%)",
          transition: "background 0.5s ease",
        }}
      />

      {/* Listening ripple rings */}
      {isListening &&
        RIPPLE_DELAYS.map((delay) => (
          <div
            key={delay}
            className="absolute rounded-full border animate-listen-ripple pointer-events-none"
            style={{
              width: "170px",
              height: "170px",
              borderColor: `oklch(0.88 0.22 185 / ${0.55 - RIPPLE_DELAYS.indexOf(delay) * 0.15})`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}

      {/* Speaking pulse rings */}
      {isSpeaking &&
        SPEAK_RINGS.map((i) => (
          <div
            key={i}
            className="absolute rounded-full border animate-speak-ring pointer-events-none"
            style={{
              width: `${140 + i * 26}px`,
              height: `${140 + i * 26}px`,
              borderColor: `oklch(0.88 0.18 190 / ${0.55 - i * 0.1})`,
              animationDelay: `${(i - 1) * 0.15}s`,
            }}
          />
        ))}

      {/* 3D Orbital ring 1 — equatorial, clockwise */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: "210px",
          height: "210px",
          borderRadius: "50%",
          border: `1.5px solid ${ringColor}`,
          boxShadow: `0 0 8px ${ringColor.replace("/ 0.", "/ 0.3")}, inset 0 0 4px ${ringColor.replace("/ 0.", "/ 0.1")}`,
          transform: "rotateX(75deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: ringSpeed1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* 3D Orbital ring 2 — tilted 60deg, counter-clockwise */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: "190px",
          height: "190px",
          borderRadius: "50%",
          border: `1.5px solid ${ringColor}`,
          boxShadow: `0 0 6px ${ringColor.replace("/ 0.", "/ 0.25")}`,
          transform: "rotateX(60deg) rotateY(40deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: ringSpeed2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* 3D Orbital ring 3 — tilted -60deg, clockwise faster */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: "175px",
          height: "175px",
          borderRadius: "50%",
          border: `1.5px solid ${ringColor}`,
          boxShadow: `0 0 6px ${ringColor.replace("/ 0.", "/ 0.2")}`,
          transform: "rotateX(-60deg) rotateY(20deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: ringSpeed3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Outer dashed slow ring */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: "238px",
          height: "238px",
          borderRadius: "50%",
          border: "1px dashed oklch(0.82 0.22 200 / 0.18)",
          transform: "rotateX(72deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Glowing core sphere */}
      <motion.div
        className="relative rounded-full flex items-center justify-center z-10"
        style={{
          width: "118px",
          height: "118px",
          background: coreColor,
          boxShadow: coreGlow,
          transition: "background 0.5s ease, box-shadow 0.5s ease",
          position: "relative",
          overflow: "hidden",
        }}
        animate={
          isListening
            ? { scale: [1, 1.07, 1], opacity: [0.92, 1, 0.92] }
            : isSpeaking
              ? { scale: [1, 1.05, 1.1, 1.05, 1], opacity: [1, 0.95, 1] }
              : isProcessing || isThinking
                ? { scale: [0.97, 1.03, 0.97] }
                : { scale: [1, 1.02, 1] }
        }
        transition={{
          duration: isListening
            ? 0.9
            : isSpeaking
              ? 0.65
              : isProcessing || isThinking
                ? 0.75
                : 3.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Specular highlight — top-left gloss */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "10%",
            left: "15%",
            width: "35%",
            height: "35%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(1 0 0 / 0.35) 0%, transparent 70%)",
            filter: "blur(4px)",
          }}
        />

        {/* Inner hex pattern texture */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, oklch(0.82 0.22 200 / 0.07) 0deg 30deg, transparent 30deg 60deg)",
          }}
        />

        {/* Arc reactor center dot */}
        <div
          className="relative z-10 rounded-full"
          style={{
            width: "22px",
            height: "22px",
            background:
              "radial-gradient(circle, oklch(0.98 0.05 185) 0%, oklch(0.88 0.18 195) 45%, oklch(0.65 0.25 215) 100%)",
            boxShadow:
              "0 0 10px oklch(0.92 0.15 195), 0 0 22px oklch(0.82 0.22 200 / 0.7)",
          }}
        />

        {/* Scan line inside orb */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ opacity: 0.25 }}
        >
          <div
            className="animate-scan-line absolute inset-x-0"
            style={{
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, oklch(0.92 0.15 195 / 0.9), transparent)",
            }}
          />
        </div>
      </motion.div>

      {/* Orbital dot particles */}
      {PARTICLE_INDICES.map((i) => {
        const angle = (i * 60 - 30) * (Math.PI / 180);
        const r = 115;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: "5px",
              height: "5px",
              background: "oklch(0.88 0.2 195)",
              boxShadow:
                "0 0 6px oklch(0.88 0.2 195), 0 0 12px oklch(0.82 0.22 200 / 0.5)",
              left: `calc(50% + ${x}px - 2.5px)`,
              top: `calc(50% + ${y}px - 2.5px)`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
