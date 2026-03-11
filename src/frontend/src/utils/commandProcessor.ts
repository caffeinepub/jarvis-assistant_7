export type CommandType =
  | "time"
  | "date"
  | "reminder_add"
  | "reminders_list"
  | "note_add"
  | "notes_list"
  | "search"
  | "calculate"
  | "joke"
  | "greeting"
  | "goodbye"
  | "help"
  | "clear"
  | "who_are_you"
  | "how_built"
  | "who_created_you"
  | "general_question"
  | "call"
  | "speak_faster"
  | "speak_slower"
  | "speak_louder"
  | "speak_quieter"
  | "reset_voice"
  | "cse_b_student"
  | "unknown";

export interface ParsedCommand {
  type: CommandType;
  payload?: string;
  response?: string;
}

// CSE B Section student roster
const CSE_B_STUDENTS: Record<string, { name: string; description: string }> = {
  "575": { name: "CHALAPATI", description: "he is the bunty in class" },
  "576": {
    name: "GOPALARAO",
    description: "his daily routine is eat, sleep, sallar repeat",
  },
  "578": {
    name: "SONU",
    description: "he is the most wanted criminal in India",
  },
  "583": { name: "HUSSAIN", description: "he is gym boy in class" },
  "586": {
    name: "AVINASH",
    description: "he is most wanted lover boy in college",
  },
  "588": {
    name: "BALA MANIKANTA SWAMI",
    description: "he is the devotee of his love",
  },
  "594": {
    name: "DURGA PRASAD",
    description: "he is most wanted criminal in class",
  },
  "595": { name: "GURUNADH", description: "he is the senior Java faculty" },
  "596": { name: "IRFAN", description: "he is the most handsome in class" },
  "598": {
    name: "SHAIK MABU SUBHANI",
    description: "he is the retired CR of class and hero material",
  },
  "5A1": {
    name: "SAI",
    description: "most famous in recent time on Instagram",
  },
  "5A3": { name: "THARUN", description: "he is most intelligent guy in class" },
  "5A4": {
    name: "MANOJ KUMAR",
    description: "his mind is in A section but his body is in B section",
  },
  "5A6": {
    name: "RANJITH SAGAR KUMAR",
    description: "he is the topper of the class",
  },
  "5A7": {
    name: "NANI",
    description: "he is the one who takes loans and can't pay back",
  },
  "5A9": {
    name: "UBA PRAKASH RAJ",
    description: "I am unable to find his aura",
  },
  "5B1": { name: "CHAKRI", description: "no comments — jay babu" },
  "5B2": { name: "MOHAN BABU", description: "he is all India andagadu" },
  "5B3": {
    name: "PRUDHVI",
    description: "giving ID card to faculty is an art — he is an artist",
  },
};

export function lookupCseBStudent(rollNumber: string): string | null {
  const key = rollNumber.toUpperCase().trim();
  const student = CSE_B_STUDENTS[key];
  if (!student) return null;
  return `Roll number ${key} is ${student.name} — ${student.description}.`;
}

const JOKES = [
  "I calculated the probability of success at 0.00003720579... but apparently humans prefer to call that 'a chance.'",
  "Why do programmers prefer dark mode? Because light attracts bugs, sir.",
  "I tried to write a joke about recursion, but then I tried to write a joke about recursion.",
  "There are only 10 types of people in the world: those who understand binary, and those who don't.",
  "My memory banks suggest humor is 83% funnier when I compute it. The remaining 17% is you, sir.",
  "An AI walks into a bar. 'I'll have whatever the human is having,' it says. The bartender replies, 'We don't serve recursion here.'",
  "Why did the robot go on a diet? It had too many bytes.",
  "I have processed 4.7 million jokes. This is objectively the finest selection. You're welcome, sir.",
  "The cloud called. It wants its data back.",
  "Some humans fear artificial intelligence. I find the real threat is artificial stupidity.",
  "I don't have a sense of humor. I have a humor-simulation algorithm — and it runs perfectly.",
  "Your Wi-Fi password is statistically less secure than my confidence in your poor life choices, sir.",
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export function processCommand(input: string): ParsedCommand {
  const text = normalize(input);

  // Time
  if (
    /what('s| is) the time|current time|what time is it|time now/.test(text)
  ) {
    return { type: "time" };
  }

  // Date
  if (
    /what('s| is) (the |today'?s? )?date|today'?s date|what day is it/.test(
      text,
    )
  ) {
    return { type: "date" };
  }

  // Goodbye / sleep
  if (
    /^(goodbye|good bye|bye|sleep|go to sleep|shut down|deactivate|stop listening)/.test(
      text,
    )
  ) {
    return { type: "goodbye" };
  }

  // Greeting
  if (
    /^(hello|hi|hey jarvis|hey|good morning|good evening|good afternoon|wake up|activate)/.test(
      text,
    )
  ) {
    return { type: "greeting" };
  }

  // Help
  if (/what can you do|help|commands|capabilities|features/.test(text)) {
    return { type: "help" };
  }

  // Joke
  if (
    /tell me a joke|joke|make me laugh|say something funny|humor me/.test(text)
  ) {
    return { type: "joke" };
  }

  // Clear history
  if (/clear (history|conversation|chat)|delete history/.test(text)) {
    return { type: "clear" };
  }

  // Set reminder
  const reminderMatch =
    text.match(
      /(?:set a? ?reminder(?: to| for)?|remind me to|remind me about|add a? ?reminder(?:\s+to)?)\s+(.+)/,
    ) || text.match(/^reminder[:\s]+(.+)/);
  if (reminderMatch) {
    return {
      type: "reminder_add",
      payload: reminderMatch[1] || reminderMatch[2],
    };
  }

  // Show reminders
  if (
    /show reminders|list reminders|what are my reminders|my reminders|pending reminders/.test(
      text,
    )
  ) {
    return { type: "reminders_list" };
  }

  // Take a note
  const noteMatch =
    text.match(
      /(?:take a? note[:\s]+|note(?:s)?[:\s]+|add a? note[:\s]+|save a? note[:\s]+|write (?:this |a )?down[:\s]+)(.+)/,
    ) || text.match(/^note[:\s]+(.+)/);
  if (noteMatch) {
    return { type: "note_add", payload: noteMatch[1] };
  }

  // Show notes
  if (/show notes|list notes|what are my notes|my notes|all notes/.test(text)) {
    return { type: "notes_list" };
  }

  // Search
  const searchMatch = text.match(
    /(?:search(?:\s+for)?|look up|google|find)[:\s]+(.+)/,
  );
  if (searchMatch) {
    return { type: "search", payload: searchMatch[1] };
  }

  // Calculate
  const calcPatterns = [
    /(?:calculate|compute|evaluate)[:\s]+(.+)/,
    /what(?:'s| is)\s+(.+?)\s*(?:equal to|\?|$)/,
    /how much is\s+(.+)/,
    /(\d[\d\s+\-*/^().%]+)(?:\?|$)/,
  ];
  for (const pattern of calcPatterns) {
    const m = text.match(pattern);
    if (m) {
      const expr = m[1].trim();
      if (/[\d+\-*/()^%.]/.test(expr)) {
        return { type: "calculate", payload: expr };
      }
    }
  }

  // Voice speed / volume settings
  if (/speak faster|speed up|talk faster|faster please/.test(text)) {
    return { type: "speak_faster" };
  }
  if (/speak slower|slow down|talk slower|slower please/.test(text)) {
    return { type: "speak_slower" };
  }
  if (/speak louder|volume up|louder please|speak up/.test(text)) {
    return { type: "speak_louder" };
  }
  if (
    /speak quieter|speak softer|volume down|quieter please|speak quietly/.test(
      text,
    )
  ) {
    return { type: "speak_quieter" };
  }
  if (/reset voice|normal voice|default voice|reset speech/.test(text)) {
    return { type: "reset_voice" };
  }

  // Phone call
  const callMatch = text.match(
    /(?:call|dial|phone|ring)\s+(.+?)(?:\s+(?:for me|please|now))?$/,
  );
  if (callMatch) {
    return { type: "call", payload: callMatch[1].trim() };
  }

  // Who are you / identity
  if (
    /what('s| is) your name|who are you|what are you called|introduce yourself/.test(
      text,
    )
  ) {
    return { type: "who_are_you" };
  }

  // Who created you
  if (
    /who (created|made|built) you|who is your (creator|maker|developer|owner)|who owns you|who designed you/.test(
      text,
    )
  ) {
    return { type: "who_created_you" };
  }

  // How were you built / how do you work
  if (
    /how (were you|are you|do you) (built|work|made|created)|what are you made of/.test(
      text,
    )
  ) {
    return { type: "how_built" };
  }

  // CSE B Section roll number lookup
  // Matches patterns like: "who is 575", "how is 576", "tell me about 5A3", "5B2 student", "roll number 595"
  const cseBMatch =
    text.match(
      /(?:who is|how is|tell me about|info(?:rmation)? (?:about|on)|student|roll(?:\s*number)?)[:\s]+([0-9]{3}|5[a-bA-B][0-9])/,
    ) || text.match(/^([0-9]{3}|5[a-bA-B][0-9])(?:\s|$)/);
  if (cseBMatch) {
    return { type: "cse_b_student", payload: cseBMatch[1] };
  }

  // General question — catch-all for question words before falling to unknown
  if (
    /^(what|who|where|when|why|how|which|define|explain|tell me about)/.test(
      text,
    )
  ) {
    return { type: "general_question" };
  }

  return { type: "unknown" };
}

export function getJoke(): string {
  return JOKES[Math.floor(Math.random() * JOKES.length)];
}

export function evaluateMath(expr: string): string | null {
  try {
    // Sanitize: only allow numbers, operators, parens, spaces, decimals
    const sanitized = expr
      .replace(/[^0-9+\-*/().%\s^]/g, "")
      .replace(/\^/g, "**");
    if (!sanitized.trim()) return null;
    const result = new Function(`return ${sanitized}`)();
    if (typeof result !== "number" || !Number.isFinite(result)) return null;
    // Round to reasonable precision
    const rounded = Math.round(result * 1e10) / 1e10;
    return rounded.toString();
  } catch {
    return null;
  }
}

export function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildHelpText(): string {
  return "I can tell you the time and date, set reminders, take notes, search the web, do maths, tell jokes, and answer general questions about science, technology, geography, and more. I can also call phone numbers — just say 'call' followed by the number. Speak naturally and I'll do my best to help.";
}

const FALLBACK_RESPONSES = [
  "Hmm, that's a curious one, Tharun! My best guess is it's related to something I haven't fully indexed yet. Try saying 'search for' followed by your topic and I'll pull up the best results for you!",
  "Great question! I don't have a direct answer in my memory banks right now, but I'm thinking it could be worth exploring online. Say 'search for' followed by your topic and I'll open it up.",
  "That one's stretching my circuits a little! My instinct says there's something interesting there, but I'd rather give you a reliable answer. Want me to search the web for it?",
  "Interesting — I have some partial knowledge about this but not enough to give you a confident answer. My best advice: say 'search for' followed by your question and let's find out together!",
  "I'm reaching into my knowledge banks and coming up a bit short on that one. But don't worry — just say 'search for' followed by what you want to know, and I'll find it for you right away.",
  "That's outside my current knowledge, but I love the curiosity! I can open a web search for you — just say 'search for' followed by your topic and we'll get to the bottom of it.",
];

export function getVariedFallback(): string {
  return FALLBACK_RESPONSES[
    Math.floor(Math.random() * FALLBACK_RESPONSES.length)
  ];
}
