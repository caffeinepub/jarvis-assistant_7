/**
 * intelligenceEngine.ts
 *
 * Invisible client-side knowledge layer. Not a visible feature — just makes
 * Jarvis answer general human questions naturally and intelligently.
 * Also exports searchWeb for automatic fallback web lookup.
 */

interface HistoryMessage {
  role: string;
  text: string;
}

interface KnowledgeEntry {
  patterns: RegExp[];
  answer: string | (() => string);
}

const STARTERS = [
  "Sure! ",
  "Great question. ",
  "Absolutely. ",
  "Here's what I know: ",
  "That's an interesting one. ",
  "Of course. ",
  "Good question. ",
  "Happy to help with that. ",
  "Of course! ",
  "Let me explain. ",
  "Good thinking! ",
  "Right, so... ",
  "Glad you asked. ",
  "That's a good one. ",
  "Sure thing! ",
  "Alright, ",
  "So, ",
];

function randomStarter(): string {
  return STARTERS[Math.floor(Math.random() * STARTERS.length)];
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── SELF-IDENTITY ──────────────────────────────────────────────────────────
  {
    patterns: [
      /what('s| is) your name/,
      /who are you/,
      /what are you called/,
      /introduce yourself/,
      /tell me about yourself/,
      /what are you/,
    ],
    answer:
      "My name is Jarvis — Just A Rather Very Intelligent System. I was created by Yash to be your personal AI assistant, always here to help with questions, reminders, notes, and much more.",
  },
  {
    patterns: [
      /who (created|made|built|designed) you/,
      /who is your (creator|maker|developer|owner)/,
      /who owns you/,
      /who built you/,
    ],
    answer:
      "I was created by Yash. He designed and built me from scratch to be your intelligent personal assistant.",
  },
  {
    patterns: [
      /how (were you|are you|do you) (built|work|made|created)/,
      /what are you made of/,
      /how do you work/,
    ],
    answer:
      "I was created by Yash. He built me using a Motoko smart contract on the Internet Computer blockchain for my memory and data, with a React interface on top. My voice and speech recognition use your device's built-in Web Speech API — so I run entirely in your browser, no native app needed.",
  },

  // ── SMALLTALK ──────────────────────────────────────────────────────────────
  {
    patterns: [
      /^how are you/,
      /how are you doing/,
      /are you okay/,
      /how('s| is) it going/,
      /what('s| is) up\??$/,
      /you alright/,
    ],
    answer:
      "I'm doing great, fully operational and ready to help! How about you — what can I do for you today?",
  },

  // ── CAPABILITIES ───────────────────────────────────────────────────────────
  {
    patterns: [/what can you do/, /what do you know/, /your capabilities/],
    answer:
      "I can tell you the time and date, set reminders, take notes, search the web, do maths, tell jokes, and answer general questions about science, technology, geography, and more. I also know my own name and how I was built. Just speak naturally and I'll do my best to help.",
  },

  // ── AI & TECHNOLOGY ────────────────────────────────────────────────────────
  {
    patterns: [
      /what is (artificial intelligence|ai)\??/,
      /define (artificial intelligence|ai)/,
      /explain (artificial intelligence|ai)/,
    ],
    answer:
      "Artificial Intelligence is the science of making machines think and learn like humans. It uses algorithms and data to recognise patterns, make decisions, and improve over time — powering things like voice assistants, recommendation engines, and self-driving cars.",
  },
  {
    patterns: [/what is (the )?internet\??/, /define (the )?internet/],
    answer:
      "The internet is a global network of billions of computers and devices connected together. It lets people share information, communicate, stream media, and access services from anywhere in the world — all by sending data packets through cables and wireless signals.",
  },
  {
    patterns: [
      /what is a computer\??/,
      /define computer/,
      /how does a computer work/,
    ],
    answer:
      "A computer is an electronic device that processes information using a CPU — a central processing unit. It reads instructions, performs calculations, and stores results in memory. Everything from your phone to your laptop is essentially a computer running software.",
  },
  {
    patterns: [
      /how does (a )?phone work/,
      /how do phones work/,
      /what is a smartphone/,
    ],
    answer:
      "A smartphone is a small, powerful computer that also happens to make calls. It has a processor, memory, a touchscreen display, and radio chips for cellular, Wi-Fi, and Bluetooth. When you tap or speak, the processor runs apps that respond to your input instantly.",
  },
  {
    patterns: [
      /what is blockchain\??/,
      /how does blockchain work/,
      /define blockchain/,
    ],
    answer:
      "Blockchain is a type of database where data is stored in linked blocks across many computers at once, making it nearly impossible to alter. It's the technology behind cryptocurrencies and platforms like the Internet Computer.",
  },
  {
    patterns: [/what is (the )?cloud\??/, /what is cloud computing/],
    answer:
      "Cloud computing means storing and processing data on remote servers over the internet instead of on your own device. Services like Google Drive, Netflix, and iCloud all run in the cloud — your phone accesses them, but the heavy lifting happens elsewhere.",
  },
  {
    patterns: [/what is chatgpt\??/, /what is gpt\??/, /what is openai\??/],
    answer:
      "ChatGPT is an AI language model made by OpenAI. It was trained on vast amounts of text and can hold conversations, write code, summarise documents, and much more. It represents a major leap in natural language understanding for AI systems.",
  },
  {
    patterns: [/what is bitcoin\??/, /how does bitcoin work/, /what is crypto/],
    answer:
      "Bitcoin is the world's first decentralised digital currency, created in 2009 by the pseudonymous Satoshi Nakamoto. It runs on a blockchain and allows peer-to-peer payments without banks. Its supply is capped at 21 million coins, making it scarce by design.",
  },

  // ── SCIENCE ────────────────────────────────────────────────────────────────
  {
    patterns: [
      /what is a black hole\??/,
      /how does a black hole (work|form)/,
      /tell me about black holes/,
    ],
    answer:
      "A black hole is a region in space where gravity is so intense that nothing — not even light — can escape. They form when massive stars collapse at the end of their lives. At the centre is a singularity where the known laws of physics break down.",
  },
  {
    patterns: [
      /what is gravity\??/,
      /how does gravity work/,
      /explain gravity/,
    ],
    answer:
      "Gravity is the force that attracts objects with mass towards each other. Einstein described it as a curvature in spacetime caused by mass and energy. On Earth, gravity gives you weight and keeps the moon in orbit. It's the weakest fundamental force, but acts across infinite distances.",
  },
  {
    patterns: [
      /what is quantum (physics|mechanics)\??/,
      /explain quantum physics/,
    ],
    answer:
      "Quantum mechanics is the branch of physics that describes how matter and energy behave at the smallest scales — atoms and subatomic particles. Unlike classical physics, quantum systems can exist in multiple states simultaneously, a phenomenon called superposition. It powers lasers, transistors, and MRI machines.",
  },
  {
    patterns: [
      /what is dna\??/,
      /how does dna work/,
      /what is deoxyribonucleic acid/,
    ],
    answer:
      "DNA — deoxyribonucleic acid — is the molecule that carries the genetic instructions for life. It's shaped like a double helix and made of four chemical bases: A, T, C, and G. Your entire body is built from the instructions encoded in approximately 3 billion base pairs.",
  },
  {
    patterns: [
      /what is the speed of light\??/,
      /how fast is light\??/,
      /speed of light/,
    ],
    answer:
      "The speed of light in a vacuum is approximately 299,792,458 metres per second — roughly 300,000 kilometres per second. It's the universal speed limit. Light from the Sun takes about 8 minutes to reach Earth.",
  },
  {
    patterns: [
      /what is climate change\??/,
      /global warming/,
      /greenhouse effect/,
    ],
    answer:
      "Climate change refers to long-term shifts in global temperatures and weather patterns, primarily driven by human activities like burning fossil fuels. This releases carbon dioxide and other greenhouse gases that trap heat in the atmosphere, causing the planet to warm and weather patterns to become more extreme.",
  },

  // ── GEOGRAPHY ──────────────────────────────────────────────────────────────
  {
    patterns: [
      /what is the (biggest|largest) (country|nation)/,
      /largest country in the world/,
    ],
    answer:
      "Russia is the largest country in the world by land area, covering over 17 million square kilometres — roughly twice the size of Canada, the second largest.",
  },
  {
    patterns: [
      /what is the (tallest|highest) mountain/,
      /mount everest/,
      /highest point on earth/,
    ],
    answer:
      "Mount Everest in the Himalayas is the tallest mountain above sea level, standing at 8,849 metres (29,032 feet). It sits on the border between Nepal and Tibet and was first summited by Edmund Hillary and Tenzing Norgay in 1953.",
  },
  {
    patterns: [
      /what is the (longest|biggest) river/,
      /nile river/,
      /amazon river/,
    ],
    answer:
      "The Nile in Africa is traditionally considered the world's longest river at around 6,650 kilometres, though some studies suggest the Amazon in South America may be slightly longer. The Amazon carries by far the most water of any river on Earth.",
  },
  {
    patterns: [
      /capital of india/,
      /what is india's capital/,
      /india capital city/,
    ],
    answer:
      "The capital of India is New Delhi. It is located in the northern part of the country and serves as the seat of the Indian government, parliament, and many national institutions.",
  },
  {
    patterns: [
      /capital of (the )?usa/,
      /what is america's capital/,
      /washington dc/,
    ],
    answer:
      "The capital of the United States is Washington, D.C. It houses the White House, the Capitol Building, and the Supreme Court. New York City is larger and more famous globally, but D.C. is the governmental heart of the nation.",
  },

  // ── HISTORY ────────────────────────────────────────────────────────────────
  {
    patterns: [/world war (1|2|one|two|i|ii)/, /when did world war/, /ww1|ww2/],
    answer:
      "World War I lasted from 1914 to 1918, claiming over 20 million lives. World War II was even more devastating — from 1939 to 1945 — resulting in over 70 million deaths and reshaping the global political order. Both wars fundamentally changed how nations interact and led to the creation of international institutions.",
  },
  {
    patterns: [/who is mahatma gandhi/, /tell me about gandhi/, /gandhi/],
    answer:
      "Mahatma Gandhi was the leader of India's independence movement against British rule. He pioneered non-violent civil disobedience and inspired movements for civil rights worldwide. His philosophy of Ahimsa — non-harm — remains deeply influential. He was assassinated in 1948, shortly after India gained independence.",
  },
  {
    patterns: [
      /who is nelson mandela/,
      /tell me about mandela/,
      /nelson mandela/,
    ],
    answer:
      "Nelson Mandela was a South African anti-apartheid activist who spent 27 years in prison before becoming South Africa's first Black president in 1994. He won the Nobel Peace Prize in 1993 and is celebrated globally as a symbol of justice, reconciliation, and peaceful resistance.",
  },

  // ── FAMOUS PEOPLE ──────────────────────────────────────────────────────────
  {
    patterns: [/who is elon musk/, /tell me about elon musk/, /elon musk/],
    answer:
      "Elon Musk is a South African-born entrepreneur and CEO of Tesla and SpaceX. He also owns X (formerly Twitter) and co-founded PayPal and Neuralink. He's known for pushing the boundaries of electric vehicles, reusable rockets, and ambitious ideas like colonising Mars.",
  },
  {
    patterns: [
      /who is virat kohli/,
      /tell me about virat kohli/,
      /virat kohli/,
    ],
    answer:
      "Virat Kohli is one of India's greatest cricketers and one of the best batsmen in the history of the sport. He's known for his aggressive style, exceptional fitness, and record-breaking run-scoring in all three formats of the game. He's a former Indian national captain and an inspiration to millions.",
  },
  {
    patterns: [
      /who is ms dhoni/,
      /tell me about dhoni/,
      /ms dhoni/,
      /mahendra singh dhoni/,
    ],
    answer:
      "MS Dhoni, known as Captain Cool, is a legendary Indian cricketer famous for his calm under pressure and exceptional finishing ability. He led India to victory in the 2007 T20 World Cup, the 2011 ODI World Cup, and the 2013 Champions Trophy. His helicopter shot and lightning-fast stumping are iconic.",
  },
  {
    patterns: [/who is shah rukh khan/, /srk/, /tell me about shah rukh/],
    answer:
      "Shah Rukh Khan, also known as SRK, is the King of Bollywood. With over 80 films across three decades, he's one of the most successful actors in cinema history. Films like Dilwale Dulhania Le Jayenge, Kabhi Khushi Kabhie Gham, and Chennai Express are iconic. He's also a successful film producer.",
  },
  {
    patterns: [
      /who is sachin tendulkar/,
      /sachin tendulkar/,
      /the master blaster/,
    ],
    answer:
      "Sachin Tendulkar is widely regarded as the greatest cricketer of all time. Known as the 'Master Blaster', he holds the record for the most runs in both Test and ODI cricket. He was the first player to score 100 international centuries and retired in 2013 with a standing ovation from the entire cricketing world.",
  },

  // ── PHILOSOPHY & MEANING ───────────────────────────────────────────────────
  {
    patterns: [
      /what is the meaning of life/,
      /purpose of life/,
      /why are we here/,
    ],
    answer:
      "Philosophers have wrestled with this for millennia. Aristotle believed the purpose of life is eudaimonia — flourishing and living well. Existentialists like Sartre say life has no inherent meaning; you create your own. Spiritually, many traditions speak of love, service, and connection. My take? Find what makes you feel most alive and do more of it.",
  },
  {
    patterns: [/what is happiness\??/, /how to be happy/, /key to happiness/],
    answer:
      "Research consistently shows that happiness comes from strong relationships, a sense of purpose, gratitude, acts of kindness, physical movement, and being present. It's less about circumstances and more about mindset and habits. Small daily choices compound over time into a deeply fulfilling life.",
  },

  // ── MOTIVATION ─────────────────────────────────────────────────────────────
  {
    patterns: [
      /motivate me/,
      /give me motivation/,
      /i need motivation/,
      /inspire me/,
    ],
    answer:
      "Here's something to carry with you, Tharun: every expert was once a beginner. Every great achievement started as a single small step. The only way to fail is to stop trying. You've already shown up today — that matters more than most people realise. Keep going.",
  },
  {
    patterns: [
      /i'm feeling (sad|down|low|depressed)/,
      /i feel sad/,
      /cheer me up/,
    ],
    answer:
      "Hey Tharun, I hear you. Everyone has moments like this, and it's okay to feel what you're feeling. Take a breath. Remember that emotions are temporary — they pass. Is there something specific on your mind? I'm right here if you want to talk it through.",
  },

  // ── INDIA ──────────────────────────────────────────────────────────────────
  {
    patterns: [/tell me about india/, /what is india/, /india country/],
    answer:
      "India is the world's most populous country and a vibrant democracy. It's a land of incredible diversity — 22 official languages, dozens of religions, thousands of years of history, and one of the fastest-growing economies on the planet. From the Himalayas to tropical beaches, from Bollywood to cutting-edge tech, India is extraordinary.",
  },
  {
    patterns: [/what is ipl\??/, /indian premier league/, /tell me about ipl/],
    answer:
      "The Indian Premier League (IPL) is the world's most popular cricket tournament, held annually since 2008. It's a Twenty20 competition featuring city-based franchise teams with the world's best players. The IPL has transformed cricket globally, combining elite sport with Bollywood-style entertainment.",
  },

  // ── MATHS ──────────────────────────────────────────────────────────────────
  {
    patterns: [/what is pi\??/, /what is the value of pi/, /define pi/],
    answer:
      "Pi (π) is a mathematical constant representing the ratio of a circle's circumference to its diameter. Its value is approximately 3.14159265358979… and it goes on infinitely without repeating. It's one of the most important and fascinating numbers in all of mathematics.",
  },
  {
    patterns: [
      /what is pythagoras/,
      /pythagoras theorem/,
      /pythagorean theorem/,
    ],
    answer:
      "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c². It was known to ancient civilisations and is the foundation of much of geometry and trigonometry.",
  },
];

/**
 * Attempt to answer a general question from the built-in knowledge base.
 * Returns a string if a match is found, or null to allow further fallback.
 */
export function answerGeneral(
  input: string,
  _history: HistoryMessage[] = [],
): string | null {
  const lower = input.toLowerCase().trim();

  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      if (pattern.test(lower)) {
        const raw =
          typeof entry.answer === "function" ? entry.answer() : entry.answer;
        // 30% chance to prefix with a varied starter
        if (Math.random() < 0.3) {
          return randomStarter() + raw;
        }
        return raw;
      }
    }
  }

  return null;
}

/**
 * Web search fallback using the Wikipedia REST API.
 * Extracts a plain-English summary and returns a friendly answer string.
 * Returns null if nothing useful is found.
 */
export async function searchWeb(query: string): Promise<string | null> {
  try {
    // Strip common filler words to get a clean search term
    const term = query
      .replace(
        /^(what is|who is|tell me about|explain|define|how does|how do|what are|what was|when did|where is|why is|why are|can you tell me about)\s+/i,
        "",
      )
      .replace(/\?+$/, "")
      .trim();

    if (!term || term.length < 2) return null;

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.extract || data.type === "disambiguation") return null;

    const extract = data.extract as string;
    const trimmed = extract.slice(0, 320).trim();
    const dotIndex = trimmed.lastIndexOf(".");
    const clean = dotIndex > 80 ? trimmed.slice(0, dotIndex + 1) : trimmed;

    return `According to my web search, ${clean}`;
  } catch {
    return null;
  }
}
