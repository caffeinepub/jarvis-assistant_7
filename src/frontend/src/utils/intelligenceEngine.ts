/**
 * intelligenceEngine.ts
 *
 * Invisible client-side knowledge layer. Not a visible feature — just makes
 * Jarvis answer general human questions naturally and intelligently.
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
      "Blockchain is a type of database where data is stored in linked blocks across many computers at once, making it nearly impossible to alter. It's the technology behind cryptocurrencies and platforms like the Internet Computer — my own home — where apps run without central servers.",
  },
  {
    patterns: [
      /what is python\??/,
      /what is (the )?python (programming )?language/,
    ],
    answer:
      "Python is a popular, beginner-friendly programming language known for its clean, readable syntax. It's widely used in data science, machine learning, web development, and automation — making it one of the most versatile tools in a developer's toolbox.",
  },
  {
    patterns: [
      /what is javascript\??/,
      /what is (the )?javascript (programming )?language/,
    ],
    answer:
      "JavaScript is the programming language that powers interactive websites. Every time a button animates, a form validates, or a page updates without reloading — that's JavaScript at work. It also runs on servers via Node.js, making it useful for full-stack development.",
  },
  {
    patterns: [/what is (a )?(computer )?virus\??/, /define (computer )?virus/],
    answer:
      "A computer virus is malicious software that replicates itself and spreads to other files or systems, often causing damage, stealing data, or slowing things down. The term echoes biological viruses because both self-replicate and cause harm to their host.",
  },
  {
    patterns: [/how does the internet work/, /explain the internet/],
    answer:
      "When you visit a website, your device sends a request through your router and ISP to a server somewhere in the world. The server sends back data in small packets that travel through undersea cables and satellites, then reassemble on your screen — all in milliseconds.",
  },

  // ── SCIENCE ────────────────────────────────────────────────────────────────
  {
    patterns: [/what is gravity\??/, /define gravity/, /explain gravity/],
    answer:
      "Gravity is the fundamental force that attracts objects with mass toward one another. Earth's gravity is what keeps you on the ground and the Moon in orbit. Einstein described it as the curvature of spacetime caused by mass — the more massive an object, the more it bends the fabric of space.",
  },
  {
    patterns: [
      /what is the speed of light\??/,
      /how fast is light\??/,
      /speed of light/,
    ],
    answer:
      "The speed of light in a vacuum is approximately 299,792,458 metres per second — roughly 300,000 kilometres every second. It's the universal speed limit, and nothing with mass can ever quite reach it. At that speed, light from the Sun reaches Earth in about 8 minutes.",
  },
  {
    patterns: [
      /what is water\??/,
      /what is h2o\??/,
      /define water/,
      /chemical formula for water/,
    ],
    answer:
      "Water is a molecule made of two hydrogen atoms bonded to one oxygen atom — H₂O. It's essential for all known life, covers about 71% of Earth's surface, and has remarkable properties like its high heat capacity and ability to dissolve many substances, making it the universal solvent.",
  },
  {
    patterns: [/what is the sun\??/, /tell me about the sun/, /define the sun/],
    answer:
      "The Sun is a massive ball of hot plasma at the centre of our solar system, held together by its own gravity. It generates energy through nuclear fusion — fusing hydrogen atoms into helium — releasing the light and heat that make life on Earth possible. It's about 150 million kilometres away from us.",
  },
  {
    patterns: [
      /what is the moon\??/,
      /tell me about the moon/,
      /define the moon/,
    ],
    answer:
      "The Moon is Earth's only natural satellite, orbiting about 384,000 kilometres away. It formed billions of years ago from debris after a Mars-sized object collided with early Earth. The Moon's gravity causes our ocean tides, and its familiar phases are just shadows as it orbits around us.",
  },
  {
    patterns: [
      /what is (the )?earth\??/,
      /tell me about (the )?earth/,
      /define (the )?earth/,
    ],
    answer:
      "Earth is the third planet from the Sun and the only known planet to harbour life. It has a thin atmosphere protecting us from radiation, a magnetic field shielding us from solar wind, and liquid water — the unique combination that makes life here possible.",
  },
  {
    patterns: [
      /what is a black hole\??/,
      /define black hole/,
      /explain black hole/,
      /how does a black hole work/,
    ],
    answer:
      "A black hole is a region of space where gravity is so intense that nothing — not even light — can escape once it crosses the event horizon. They form when massive stars collapse under their own gravity. Despite the name, they're not empty holes; they contain enormous amounts of matter packed into an incredibly small space.",
  },
  {
    patterns: [
      /what is dna\??/,
      /define dna/,
      /explain dna/,
      /what does dna stand for/,
    ],
    answer:
      "DNA stands for deoxyribonucleic acid — it's the molecule that carries the genetic instructions for the development, function, growth, and reproduction of all known living organisms. Think of it as a biological instruction manual, written in a four-letter code, coiled inside almost every cell in your body.",
  },
  {
    patterns: [
      /what is a (biological )?virus\??/,
      /how do (biological )?viruses work/,
    ],
    answer:
      "A biological virus is a microscopic infectious agent that replicates only inside the cells of a living host. It hijacks the host's cellular machinery to make copies of itself, which can then spread to other cells or organisms. Unlike bacteria, viruses aren't technically alive — they're more like genetic pirates.",
  },

  // ── HEALTH ─────────────────────────────────────────────────────────────────
  {
    patterns: [
      /how (many hours|much) (sleep|rest)/,
      /how long should (i|we|a person) sleep/,
      /recommended sleep/,
    ],
    answer:
      "Most adults need between 7 and 9 hours of sleep per night for optimal health. Teenagers need a bit more — around 8 to 10 hours. Consistent quality sleep helps memory, mood, immune function, and everything in between.",
  },
  {
    patterns: [
      /how much water should (i|we|a person) drink/,
      /daily water (intake|consumption)/,
      /how many (glasses|litres|liters) of water/,
    ],
    answer:
      "The general recommendation is about 2 litres — or 8 glasses — of water per day for adults, though it varies by body size, activity level, and climate. A good rule of thumb: drink enough so your urine is pale yellow throughout the day.",
  },

  // ── FAMOUS PEOPLE ──────────────────────────────────────────────────────────
  {
    patterns: [
      /who is elon musk\??/,
      /tell me about elon musk/,
      /who('s| is) elon/,
    ],
    answer:
      "Elon Musk is a South African-born entrepreneur and business magnate. He's best known as the CEO of Tesla — the electric vehicle company — and SpaceX, his private space exploration firm. He's also associated with ventures like Neuralink and the acquisition of Twitter, now known as X.",
  },
  {
    patterns: [/who is (bill gates|bill gate)\??/, /tell me about bill gates/],
    answer:
      "Bill Gates co-founded Microsoft in 1975 alongside Paul Allen, making personal computing accessible to millions. Microsoft's Windows operating system became the backbone of modern desktop computing. Gates later became a prominent philanthropist through the Bill & Melinda Gates Foundation, focusing on global health and education.",
  },
  {
    patterns: [/who is steve jobs\??/, /tell me about steve jobs/],
    answer:
      "Steve Jobs was the co-founder of Apple and one of the most influential figures in tech history. He pioneered the personal computer revolution with the Mac, then revolutionised music with the iPod, phones with the iPhone, and tablets with the iPad. He passed away in 2011, but his design philosophy still shapes Apple today.",
  },
  {
    patterns: [/who is (mark zuckerberg|zuckerberg)\??/],
    answer:
      "Mark Zuckerberg is the co-founder and CEO of Meta — the company behind Facebook, Instagram, and WhatsApp. He launched Facebook from his Harvard dorm room in 2004, and it grew into one of the most widely used social platforms in the world.",
  },

  // ── CAPITALS ───────────────────────────────────────────────────────────────
  {
    patterns: [
      /capital (of|city of) (the )?(united states|usa|america|us)\??/,
      /what('s| is) the capital of (the )?(united states|usa|america|us)\??/,
    ],
    answer:
      "The capital of the United States is Washington, D.C. — the District of Columbia. It was established as the nation's capital in 1790 and is home to the White House, Congress, and the Supreme Court.",
  },
  {
    patterns: [
      /capital (of|city of) (the )?(united kingdom|uk|britain|england)\??/,
      /what('s| is) the capital of (the )?(united kingdom|uk|britain|england)\??/,
    ],
    answer:
      "The capital of the United Kingdom is London. It's one of the world's most visited cities and has served as England's capital for nearly a thousand years, home to Buckingham Palace, the Houses of Parliament, and the Tower of London.",
  },
  {
    patterns: [
      /capital (of|city of) france\??/,
      /what('s| is) the capital of france\??/,
    ],
    answer:
      "The capital of France is Paris. Known as the City of Light, Paris is famous for the Eiffel Tower, the Louvre museum, and its rich culture, cuisine, and fashion.",
  },
  {
    patterns: [
      /capital (of|city of) germany\??/,
      /what('s| is) the capital of germany\??/,
    ],
    answer:
      "The capital of Germany is Berlin. It's the largest city in Germany and carries enormous historical significance — from the Prussian Empire to the fall of the Berlin Wall in 1989.",
  },
  {
    patterns: [
      /capital (of|city of) japan\??/,
      /what('s| is) the capital of japan\??/,
    ],
    answer:
      "The capital of Japan is Tokyo. It's one of the most populated cities in the world, blending ultramodern skyscrapers with traditional temples, and is known for its technology, food scene, and efficiency.",
  },
  {
    patterns: [
      /capital (of|city of) china\??/,
      /what('s| is) the capital of china\??/,
    ],
    answer:
      "The capital of China is Beijing. It's been the cultural and political centre of China for centuries and is home to iconic landmarks like the Forbidden City, Tiananmen Square, and the Great Wall nearby.",
  },
  {
    patterns: [
      /capital (of|city of) india\??/,
      /what('s| is) the capital of india\??/,
    ],
    answer:
      "The capital of India is New Delhi. It serves as the seat of the Indian government and is distinct from Delhi — the larger metropolitan area that surrounds it.",
  },
  {
    patterns: [
      /capital (of|city of) australia\??/,
      /what('s| is) the capital of australia\??/,
    ],
    answer:
      "The capital of Australia is Canberra. Interestingly, it was purpose-built as a compromise between Sydney and Melbourne — both of which wanted to be the capital. It's home to Parliament House and the Australian War Memorial.",
  },
  {
    patterns: [
      /capital (of|city of) (brazil|brasil)\??/,
      /what('s| is) the capital of (brazil|brasil)\??/,
    ],
    answer:
      "The capital of Brazil is Brasília. Like Canberra, it was purpose-built — constructed in the late 1950s and inaugurated in 1960 — specifically to be the country's new capital, replacing Rio de Janeiro.",
  },
  {
    patterns: [
      /capital (of|city of) russia\??/,
      /what('s| is) the capital of russia\??/,
    ],
    answer:
      "The capital of Russia is Moscow. It's the largest city in Russia and one of the largest in Europe, home to the Kremlin, Red Square, and Saint Basil's Cathedral.",
  },
  {
    patterns: [
      /capital (of|city of) canada\??/,
      /what('s| is) the capital of canada\??/,
    ],
    answer:
      "The capital of Canada is Ottawa, located in the province of Ontario. Many people assume it's Toronto or Vancouver, but Ottawa was chosen as a compromise and has been the capital since 1857.",
  },
  {
    patterns: [
      /capital (of|city of) (south africa)\??/,
      /what('s| is) the capital of (south africa)\??/,
    ],
    answer:
      "South Africa actually has three capitals: Pretoria serves as the executive capital, Cape Town as the legislative capital, and Bloemfontein as the judicial capital — a unique arrangement reflecting the country's history.",
  },
  {
    patterns: [
      /capital (of|city of) nigeria\??/,
      /what('s| is) the capital of nigeria\??/,
    ],
    answer:
      "The capital of Nigeria is Abuja. It replaced Lagos as the capital in 1991, chosen for its central location and purpose-built as a neutral city for Nigeria's diverse population.",
  },

  // ── WEATHER & CLIMATE ──────────────────────────────────────────────────────
  {
    patterns: [
      /what is weather\??/,
      /what causes weather\??/,
      /define weather/,
      /explain weather/,
    ],
    answer:
      "Weather refers to the short-term state of the atmosphere — including temperature, humidity, precipitation, wind, and cloud cover. It's caused by the Sun heating the Earth's surface unevenly, creating air pressure differences that drive wind and moisture movement, producing the conditions we experience day to day.",
  },
  {
    patterns: [
      /what is climate change\??/,
      /global warming/,
      /what is global warming\??/,
      /explain climate change/,
    ],
    answer:
      "Climate change refers to long-term shifts in global temperatures and weather patterns. While some change is natural, since the 1800s human activities — mainly burning fossil fuels — have been the main driver. This releases greenhouse gases like CO₂ that trap heat in the atmosphere, gradually warming the planet and disrupting ecosystems.",
  },
  {
    patterns: [
      /what is the greenhouse effect\??/,
      /explain (the )?greenhouse effect/,
      /how does the greenhouse effect work/,
    ],
    answer:
      "The greenhouse effect is a natural process where certain gases in Earth's atmosphere — like CO₂, methane, and water vapour — trap some of the Sun's heat instead of letting it escape to space. Without it, Earth would be too cold for life. However, burning fossil fuels has amplified this effect, causing the planet to warm faster than natural cycles would allow.",
  },

  // ── HISTORY ────────────────────────────────────────────────────────────────
  {
    patterns: [
      /who is nelson mandela\??/,
      /tell me about (nelson )?mandela/,
      /who was nelson mandela\??/,
    ],
    answer:
      "Nelson Mandela was a South African anti-apartheid activist who became the country's first Black president in 1994. He spent 27 years in prison for opposing the apartheid regime, and upon his release became a global symbol of peaceful resistance, reconciliation, and human dignity. He was awarded the Nobel Peace Prize in 1993.",
  },
  {
    patterns: [
      /what was world war (2|two|ii)\??/,
      /world war (2|two|ii)/,
      /what was ww2\??/,
      /ww2/,
    ],
    answer:
      "World War II was a global conflict from 1939 to 1945 involving most of the world's nations. It began with Nazi Germany's invasion of Poland and expanded across Europe, Africa, and Asia. The war caused an estimated 70–85 million deaths and ended with Allied victory over Nazi Germany and Imperial Japan. It reshaped the world order and led to the founding of the United Nations.",
  },
  {
    patterns: [
      /who is mahatma gandhi\??/,
      /tell me about (mahatma )?gandhi/,
      /who was mahatma gandhi\??/,
    ],
    answer:
      "Mahatma Gandhi was the leader of India's independence movement against British colonial rule. He pioneered the philosophy of nonviolent civil disobedience — using peaceful protest, strikes, and fasting to resist injustice. His approach inspired civil rights movements worldwide, and he is revered as the Father of the Nation in India. He was assassinated in 1948.",
  },
  {
    patterns: [
      /what was the cold war\??/,
      /explain the cold war/,
      /tell me about the cold war/,
    ],
    answer:
      "The Cold War was a period of geopolitical tension between the United States and the Soviet Union from roughly 1947 to 1991. Rather than direct military conflict, it was a struggle of ideologies — capitalism versus communism — fought through proxy wars, nuclear arms races, and space exploration competitions. It ended with the collapse of the Soviet Union in 1991.",
  },

  // ── SPORTS ─────────────────────────────────────────────────────────────────
  {
    patterns: [
      /what is football\??/,
      /what is soccer\??/,
      /define football/,
      /explain football/,
    ],
    answer:
      "Football — known as soccer in North America — is the world's most popular sport. Two teams of 11 players each try to score by getting a round ball into the opposing team's goal, using any part of the body except arms and hands. The FIFA World Cup, held every four years, is the most-watched sporting event on Earth.",
  },
  {
    patterns: [
      /what is cricket\??/,
      /define cricket/,
      /explain cricket/,
      /how does cricket work/,
    ],
    answer:
      "Cricket is a bat-and-ball sport played between two teams of 11 players on an oval field. A bowler delivers the ball at a wicket defended by a batsman, who tries to score runs. It's enormously popular in South Asia, Australia, England, and the Caribbean, with formats ranging from 5-day Test matches to fast-paced Twenty20 games.",
  },
  {
    patterns: [
      /who is cristiano ronaldo\??/,
      /tell me about (cristiano )?ronaldo/,
      /who('s| is) ronaldo\??/,
    ],
    answer:
      "Cristiano Ronaldo is a Portuguese professional footballer widely regarded as one of the greatest of all time. He has won the Ballon d'Or award five times and holds records for goals scored in the Champions League and with the Portuguese national team. He's played for Sporting CP, Manchester United, Real Madrid, Juventus, and Al Nassr.",
  },
  {
    patterns: [
      /who is lionel messi\??/,
      /tell me about (lionel )?messi/,
      /who('s| is) messi\??/,
    ],
    answer:
      "Lionel Messi is an Argentine footballer considered by many to be the greatest player of all time. He won a record eight Ballon d'Or awards and led Argentina to victory at the 2022 FIFA World Cup. He spent most of his career at FC Barcelona before moving to Paris Saint-Germain and later Inter Miami.",
  },

  // ── GEOGRAPHY ──────────────────────────────────────────────────────────────
  {
    patterns: [
      /what is the amazon\??/,
      /amazon river/,
      /amazon rainforest/,
      /tell me about the amazon/,
    ],
    answer:
      "The Amazon refers to both the world's largest rainforest and its greatest river, both in South America. The Amazon Rainforest covers about 5.5 million square kilometres — primarily in Brazil — and is home to roughly 10% of all species on Earth. The Amazon River carries more water than any other river in the world, draining into the Atlantic Ocean.",
  },
  {
    patterns: [
      /what is mount everest\??/,
      /tell me about mount everest/,
      /how tall is mount everest/,
      /highest mountain/,
    ],
    answer:
      "Mount Everest is the highest mountain on Earth, standing at 8,848.86 metres above sea level. Located in the Himalayas on the border of Nepal and Tibet, it was first summited on 29 May 1953 by Sir Edmund Hillary and Tenzing Norgay. Thousands of climbers have attempted the summit, though it remains a formidable and dangerous challenge.",
  },
  {
    patterns: [
      /what is the sahara\??/,
      /sahara desert/,
      /tell me about the sahara/,
      /largest desert/,
    ],
    answer:
      "The Sahara is the world's largest hot desert, covering about 9 million square kilometres across North Africa. Despite its reputation, about 25% of it is sand dunes — the rest is rocky plateaus, gravel plains, and even mountains. Temperatures can exceed 50°C in summer, yet some plants and animals have adapted remarkably to survive there.",
  },
  {
    patterns: [
      /how many countries (in|are (in|there in)?) the world\??/,
      /how many countries are there\??/,
      /number of countries in the world/,
    ],
    answer:
      "There are 195 countries in the world — 193 of which are full member states of the United Nations, plus the Vatican (Holy See) and Palestine which hold observer status. The exact number can vary depending on how disputed territories and self-declared states are counted.",
  },

  // ── MORE TECHNOLOGY ────────────────────────────────────────────────────────
  {
    patterns: [/what is 5g\??/, /define 5g/, /explain 5g/, /how does 5g work/],
    answer:
      "5G is the fifth generation of mobile network technology, offering dramatically faster data speeds, lower latency, and the ability to connect many more devices simultaneously compared to 4G. It enables things like near-instant downloads, real-time remote surgery, and the backbone of smart cities and self-driving vehicles.",
  },
  {
    patterns: [
      /what is (the )?cloud( computing)?\??/,
      /define cloud computing/,
      /explain cloud computing/,
      /how does the cloud work/,
    ],
    answer:
      "Cloud computing means using remote servers on the internet to store, manage, and process data — instead of relying on your local computer. Services like Google Drive, iCloud, and Netflix all run on the cloud. It lets you access your files from any device, scale resources on demand, and reduce the need for expensive local hardware.",
  },
  {
    patterns: [
      /what is (a |an )?(mobile )?app\??/,
      /define (mobile )?app/,
      /explain (mobile )?app/,
      /what are apps\??/,
    ],
    answer:
      "An app — short for application — is a software program designed to perform a specific function on a device. Mobile apps run on smartphones and tablets, while desktop apps run on computers. They can be as simple as a calculator or as complex as a social media platform, and they're distributed through app stores like Google Play or the Apple App Store.",
  },

  // ── MORE FAMOUS PEOPLE ─────────────────────────────────────────────────────
  {
    patterns: [
      /who is jeff bezos\??/,
      /tell me about jeff bezos/,
      /who('s| is) bezos\??/,
    ],
    answer:
      "Jeff Bezos is the founder of Amazon, which he started in 1994 as an online bookstore and grew into one of the world's most valuable companies, spanning e-commerce, cloud computing, and logistics. He also founded Blue Origin, a space company. He stepped down as Amazon's CEO in 2021 but remains executive chairman.",
  },
  {
    patterns: [
      /who is (barack )?obama\??/,
      /tell me about (barack )?obama/,
      /who was (barack )?obama\??/,
    ],
    answer:
      "Barack Obama was the 44th President of the United States, serving from 2009 to 2017. He was the first African American to hold the office. Before becoming president, he was a U.S. Senator from Illinois. During his presidency he oversaw the Affordable Care Act, the response to the 2008 financial crisis, and was awarded the Nobel Peace Prize in 2009.",
  },

  // ── INDIAN CINEMA (BOLLYWOOD) ──────────────────────────────────────────────
  {
    patterns: [
      /who is shah rukh khan\??/,
      /tell me about shah rukh khan/,
      /who is srk\??/,
    ],
    answer:
      "Shah Rukh Khan — often called King Khan — is one of Bollywood's biggest superstars. Known as the 'King of Romance', he has starred in iconic films like Dilwale Dulhania Le Jayenge, Kabhi Khushi Kabhie Gham, and Pathaan. He is one of the most recognised and successful actors in the world.",
  },
  {
    patterns: [/who is salman khan\??/, /tell me about salman khan/],
    answer:
      "Salman Khan is a Bollywood megastar known for his action-packed blockbusters like the Dabangg series, Tiger Zinda Hai, and Bajrangi Bhaijaan. He is one of India's highest-paid actors and is also famous for his charity work through the Being Human Foundation.",
  },
  {
    patterns: [
      /who is amitabh bachchan\??/,
      /tell me about amitabh bachchan/,
      /who is big b\??/,
    ],
    answer:
      "Amitabh Bachchan, known as the Shahenshah of Bollywood and Big B, is a legendary Indian actor who dominated Hindi cinema for decades. Films like Sholay, Deewar, and Don made him an icon. He is also famous for hosting the quiz show Kaun Banega Crorepati, India's version of Who Wants to Be a Millionaire.",
  },

  // ── CRICKET LEGENDS ────────────────────────────────────────────────────────
  {
    patterns: [
      /who is virat kohli\??/,
      /tell me about virat kohli/,
      /who is kohli\??/,
    ],
    answer:
      "Virat Kohli is one of cricket's greatest modern batsmen, known for his aggressive style and incredible consistency. The former Indian captain has amassed thousands of international runs and holds numerous batting records. Off the field, he is equally known for his fitness discipline and passion. A true champion!",
  },
  {
    patterns: [
      /who is ms dhoni\??/,
      /tell me about (ms )?dhoni/,
      /who is captain cool\??/,
    ],
    answer:
      "MS Dhoni — fondly called Captain Cool — is one of India's greatest cricket captains. He led India to win the ICC World Cup in 2011, the T20 World Cup in 2007, and multiple ICC trophies. Known for his calm temperament and lightning-fast wicket-keeping, Dhoni is a legend in every sense. His helicopter shot is iconic!",
  },
  {
    patterns: [
      /who is sachin tendulkar\??/,
      /tell me about sachin/,
      /who is the god of cricket\??/,
    ],
    answer:
      "Sachin Tendulkar is widely regarded as the greatest batsman of all time and is lovingly called the 'God of Cricket'. He scored 100 international centuries — a record that may never be broken — and represented India for 24 years. His dedication, technique, and passion for the game made him a national treasure and an inspiration to millions, including your classmates I'm sure, Tharun!",
  },

  // ── MOTIVATIONAL & PHILOSOPHICAL ──────────────────────────────────────────
  {
    patterns: [
      /what is the meaning of life\??/,
      /what is life\??/,
      /purpose of life/,
      /why do we exist\??/,
    ],
    answer:
      "The meaning of life is one of humanity's greatest questions. Philosophers say it's about finding purpose — something that drives you forward. Scientists say it's to survive and pass on knowledge. Spiritualists say it's to grow the soul. But honestly? Many great thinkers believe the meaning isn't fixed — you create it through your choices, your connections, and what you choose to build. What's yours going to be?",
  },
  {
    patterns: [
      /how to be happy\??/,
      /what is happiness\??/,
      /how can (i|we) be happy/,
      /tips for happiness/,
    ],
    answer:
      "Happiness isn't a destination — it's a practice. Research consistently shows that strong relationships, a sense of purpose, regular exercise, gratitude, and helping others are the most reliable paths to lasting happiness. Material things bring short bursts of joy, but experiences and connections create lasting fulfilment. Start small — even a five-minute gratitude reflection daily can shift your mindset significantly.",
  },
  {
    patterns: [
      /how to be successful\??/,
      /what is success\??/,
      /tips for success/,
      /how (do i|can i) succeed/,
    ],
    answer:
      "Success is deeply personal — it looks different for everyone. But the patterns are consistent: clear goals, persistent effort, learning from failure, and surrounding yourself with people who inspire you. The most successful people aren't the ones who never fail — they're the ones who fail, learn, and keep going. Remember, Tharun, consistency beats intensity every single time.",
  },
  {
    patterns: [
      /how to study (better|effectively|smarter)\??/,
      /tips for studying/,
      /how (do i|can i|to) study/,
      /study techniques/,
    ],
    answer:
      "Great question! The science of learning is fascinating. Top techniques: spaced repetition — reviewing material over increasing intervals — beats cramming every time. Active recall, where you test yourself instead of rereading, is far more effective. The Pomodoro technique — 25 minutes focused, 5 minutes rest — keeps your brain fresh. And always teach what you've learned to someone else; if you can explain it simply, you truly understand it.",
  },

  // ── ABSTRACT CONCEPTS ─────────────────────────────────────────────────────
  {
    patterns: [
      /what is love\??/,
      /define love/,
      /what does love mean\??/,
      /explain love/,
    ],
    answer:
      "Love is one of the most powerful and complex human experiences. Neurologically, it involves oxytocin, dopamine, and serotonin — chemicals that create feelings of bonding, euphoria, and contentment. Philosophically, the ancient Greeks described eight types of love: eros (romantic), philia (friendship), storge (family), agape (unconditional), and more. At its core, love is about deep connection, care, and choosing someone's wellbeing as important as your own.",
  },
  {
    patterns: [
      /what is friendship\??/,
      /define friendship/,
      /what makes a good friend\??/,
    ],
    answer:
      "Friendship is one of life's greatest gifts — a voluntary bond built on trust, mutual respect, shared experiences, and genuine care. Aristotle wrote that there are three kinds of friendship: those based on utility, those based on pleasure, and those based on virtue — the deepest kind, where you value each other for who you truly are. A good friend challenges you to grow while accepting you as you are.",
  },

  // ── ADVANCED TECHNOLOGY ────────────────────────────────────────────────────
  {
    patterns: [
      /what is machine learning\??/,
      /define machine learning/,
      /explain machine learning/,
    ],
    answer:
      "Machine learning is a branch of artificial intelligence where computers learn from data instead of being explicitly programmed. Rather than writing rules, you feed the system examples and it finds patterns itself. For instance, a spam filter learns what spam looks like by seeing thousands of examples — and gets better over time. It powers everything from YouTube recommendations to medical diagnoses.",
  },
  {
    patterns: [
      /what is deep learning\??/,
      /define deep learning/,
      /explain deep learning/,
    ],
    answer:
      "Deep learning is a subfield of machine learning inspired by the human brain. It uses artificial neural networks with many layers — hence 'deep' — to learn from enormous amounts of data. Deep learning is behind facial recognition, real-time translation, voice assistants like me, and image generation AI. The more data and computing power available, the better these models get.",
  },
  {
    patterns: [
      /what is (a |an )?neural network\??/,
      /define neural network/,
      /explain neural network/,
      /how do neural networks work/,
    ],
    answer:
      "A neural network is a computing system loosely inspired by the neurons in a human brain. It consists of layers of interconnected nodes — each passing information forward and adjusting based on feedback. During training, the network learns to recognise patterns in data by strengthening useful connections and weakening unhelpful ones. It's the foundation of most modern AI systems, including the intelligence powering responses like this one.",
  },
  {
    patterns: [
      /what is chatgpt\??/,
      /what is gpt\??/,
      /tell me about chatgpt/,
      /who made chatgpt/,
    ],
    answer:
      "ChatGPT is an AI language model developed by OpenAI, released to the public in late 2022. It uses a large language model — GPT, or Generative Pre-trained Transformer — trained on enormous amounts of text data to generate human-like responses. It became one of the fastest-growing consumer products in history, sparking a global conversation about AI's role in education, work, and society.",
  },
  {
    patterns: [
      /what is cryptocurrency\??/,
      /define cryptocurrency/,
      /explain cryptocurrency/,
      /what are cryptocurrencies\??/,
    ],
    answer:
      "Cryptocurrency is a digital form of currency that uses cryptography to secure transactions and control the creation of new units. Unlike traditional money, most cryptocurrencies operate on decentralised blockchain networks — meaning no single bank or government controls them. Bitcoin was the first, created in 2009. Since then, thousands of cryptocurrencies have emerged, with very different use cases and levels of volatility.",
  },
  {
    patterns: [
      /what is bitcoin\??/,
      /define bitcoin/,
      /explain bitcoin/,
      /who created bitcoin/,
      /how does bitcoin work/,
    ],
    answer:
      "Bitcoin is the world's first and most well-known cryptocurrency, created in 2009 by an anonymous person or group known as Satoshi Nakamoto. It runs on a decentralised blockchain — a public ledger recording every transaction. New bitcoins are created through 'mining', which requires significant computing power. Bitcoin's limited supply of 21 million coins is central to its value proposition as 'digital gold.'",
  },

  // ── INDIAN STATES ─────────────────────────────────────────────────────────
  {
    patterns: [
      /capital of (andhra pradesh)\??/,
      /what is the capital of (andhra pradesh)\??/,
    ],
    answer:
      "Andhra Pradesh has two capitals: Amaravati serves as the legislative capital, while Visakhapatnam is being developed as the executive capital. The state is known for its rich culture, spicy cuisine, and landmarks like Tirumala Tirupati — one of the world's most visited religious sites. Being from Andhra Pradesh myself, in a manner of speaking, I have a soft spot for it!",
  },
  {
    patterns: [
      /capital of telangana\??/,
      /what is the capital of telangana\??/,
    ],
    answer:
      "The capital of Telangana is Hyderabad — the City of Pearls. Hyderabad is one of India's major tech hubs, home to countless IT companies, the iconic Charminar, and the flavourful Hyderabadi biryani that is genuinely world-famous. Telangana became a separate state from Andhra Pradesh in 2014.",
  },
  {
    patterns: [
      /capital of maharashtra\??/,
      /what is the capital of maharashtra\??/,
    ],
    answer:
      "The capital of Maharashtra is Mumbai — formerly known as Bombay. Mumbai is India's financial capital, home to Bollywood, the Bombay Stock Exchange, and one of the world's most densely populated urban areas. It's a city that never sleeps, full of ambition, dreams, and incredible street food.",
  },
];

/**
 * Search recent conversation history for answers that might be relevant.
 * Returns a brief summary if something relevant is found.
 */
function searchHistory(
  input: string,
  history: HistoryMessage[],
): string | null {
  if (!history.length) return null;

  // Extract key words (words longer than 3 chars, ignore stopwords)
  const stopwords = new Set([
    "what",
    "when",
    "where",
    "which",
    "that",
    "this",
    "with",
    "from",
    "have",
    "does",
    "your",
    "tell",
    "about",
    "explain",
    "define",
    "more",
  ]);
  const words = input
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.has(w));

  if (!words.length) return null;

  // Look at the last 20 messages, only Jarvis replies
  const jarvisReplies = history
    .slice(-20)
    .filter((m) => m.role !== "user")
    .map((m) => m.text);

  for (const reply of jarvisReplies.reverse()) {
    const lower = reply.toLowerCase();
    const matchCount = words.filter((w) => lower.includes(w)).length;
    if (matchCount >= 2) {
      // Found a relevant prior answer — summarise it
      const short =
        reply.length > 180
          ? `${reply.slice(0, 180).replace(/\s\w+$/, "")}…`
          : reply;
      return `Based on what we've already discussed: ${short}`;
    }
  }

  return null;
}

/**
 * Main intelligence function. Returns a natural answer or null if unknown.
 */
export function answerGeneral(
  input: string,
  recentHistory: HistoryMessage[],
): string | null {
  const text = input
    .toLowerCase()
    .trim()
    .replace(/[?!.]+$/, "");

  // Try knowledge base first
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.patterns.some((p) => p.test(text))) {
      const raw =
        typeof entry.answer === "function" ? entry.answer() : entry.answer;
      // Only prepend a starter if the answer doesn't already start with one
      const needsStarter =
        !/^(my name|i was|i can|i'm|the |a |dna|water|python|javascript|artificial|gravity|the sun|the moon|earth|a black)/i.test(
          raw,
        );
      return needsStarter ? randomStarter() + raw : raw;
    }
  }

  // Fall back to history search
  const fromHistory = searchHistory(input, recentHistory);
  if (fromHistory) return fromHistory;

  return null;
}
