export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
};

export type Lesson = {
  slug: string;
  title: string;
  topic: string;
  emoji: string;
  gradient: string;
  summary: string;
  content: { heading: string; body: string; code?: string }[];
  quiz: QuizQuestion[];
};

export const LESSONS: Lesson[] = [
  {
    slug: "intro",
    title: "Python se Dosti",
    topic: "Basics",
    emoji: "🐍",
    gradient: "from-fuchsia-500 to-pink-500",
    summary: "Python kya hai aur pehla program likhna seekho.",
    content: [
      {
        heading: "Python kya hai?",
        body: "Python ek simple, readable programming language hai. Web, AI, data — sab jagah use hoti hai.",
      },
      {
        heading: "Hello World",
        body: "Ye pehla program hota hai jo screen par message print karta hai.",
        code: `print("Hello, Python!")`,
      },
    ],
    quiz: [
      {
        q: "Screen par text dikhane ke liye kaunsa function use hota hai?",
        options: ["echo()", "print()", "show()", "log()"],
        answer: 1,
      },
    ],
  },
  {
    slug: "variables",
    title: "Variables & Data Types",
    topic: "Basics",
    emoji: "📦",
    gradient: "from-indigo-500 to-purple-500",
    summary: "Data ko store karna aur types samajhna.",
    content: [
      {
        heading: "Variable banao",
        body: "Variable ek dabba hai jismein value store hoti hai.",
        code: `name = "Aarav"\nage = 21\nprint(name, age)`,
      },
      {
        heading: "Types",
        body: "int, float, str, bool — Python khud detect kar leta hai.",
      },
    ],
    quiz: [
      {
        q: "`age = 21` mein `age` ka type kya hai?",
        options: ["str", "float", "int", "bool"],
        answer: 2,
      },
    ],
  },
  {
    slug: "conditionals",
    title: "If / Else Decisions",
    topic: "Control Flow",
    emoji: "🔀",
    gradient: "from-cyan-500 to-blue-500",
    summary: "Program ko decisions lena sikhao.",
    content: [
      {
        heading: "if / else",
        body: "Condition true hui to ek block, warna doosra chalega.",
        code: `marks = 75\nif marks >= 40:\n    print("Pass")\nelse:\n    print("Fail")`,
      },
    ],
    quiz: [
      {
        q: "Kaunsa keyword condition check karta hai?",
        options: ["when", "if", "check", "case"],
        answer: 1,
      },
    ],
  },
  {
    slug: "loops",
    title: "Loops se Repeat",
    topic: "Control Flow",
    emoji: "🔁",
    gradient: "from-emerald-500 to-teal-500",
    summary: "For aur while loops se kaam repeat karo.",
    content: [
      {
        heading: "for loop",
        body: "List ya range par ghoomta hai.",
        code: `for i in range(3):\n    print("Hi", i)`,
      },
      {
        heading: "while loop",
        body: "Jab tak condition true — chalta rehta hai.",
      },
    ],
    quiz: [
      {
        q: "`range(3)` kitni baar chalega?",
        options: ["2", "3", "4", "Infinite"],
        answer: 1,
      },
    ],
  },
  {
    slug: "functions",
    title: "Functions Banao",
    topic: "Functions",
    emoji: "🧩",
    gradient: "from-orange-500 to-rose-500",
    summary: "Reusable code blocks bana ke time bachao.",
    content: [
      {
        heading: "def keyword",
        body: "Function define karne ke liye `def` use hota hai.",
        code: `def greet(name):\n    return f"Namaste, {name}!"\n\nprint(greet("Riya"))`,
      },
    ],
    quiz: [
      {
        q: "Function define karne ka keyword kya hai?",
        options: ["func", "define", "def", "function"],
        answer: 2,
      },
    ],
  },
  {
    slug: "lists",
    title: "Lists aur Dicts",
    topic: "Data Structures",
    emoji: "🗂️",
    gradient: "from-yellow-500 to-amber-500",
    summary: "Multiple values ko organize karna seekho.",
    content: [
      {
        heading: "List",
        body: "Ordered collection of items.",
        code: `fruits = ["mango", "apple", "kela"]\nprint(fruits[0])`,
      },
      {
        heading: "Dictionary",
        body: "Key-value pairs.",
        code: `me = {"name": "Ali", "age": 19}\nprint(me["name"])`,
      },
    ],
    quiz: [
      {
        q: "Dictionary mein value access karne ke liye kya use karte hain?",
        options: ["Index number", "Key", "Position", "Name only"],
        answer: 1,
      },
    ],
  },
];

export const BADGES = [
  { id: "first-step", name: "First Step", emoji: "👟", need: 1, desc: "Pehla lesson complete" },
  { id: "learner", name: "Curious Learner", emoji: "📚", need: 3, desc: "3 lessons complete" },
  { id: "pythonista", name: "Pythonista", emoji: "🐍", need: 6, desc: "All lessons complete" },
  { id: "quizzer", name: "Quiz Master", emoji: "🧠", need: 3, desc: "3 quizzes pass", type: "quiz" as const },
  { id: "streak-3", name: "On Fire", emoji: "🔥", need: 3, desc: "3 day streak", type: "streak" as const },
];
