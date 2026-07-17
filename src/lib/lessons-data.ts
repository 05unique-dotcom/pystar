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
    title: "Meet Python",
    topic: "Basics",
    emoji: "🐍",
    gradient: "from-fuchsia-500 to-pink-500",
    summary: "Learn what Python is and write your very first program.",
    content: [
      {
        heading: "What is Python?",
        body: "Python is a simple, readable, general-purpose programming language. It is used for web development, data science, AI, automation and much more.",
      },
      {
        heading: "Hello, World!",
        body: "The classic first program prints a message to the screen using the built-in print function.",
        code: `print("Hello, Python!")`,
      },
      {
        heading: "Comments",
        body: "Anything after a # on a line is a comment. Python ignores comments — they are notes for humans.",
        code: `# This is a comment\nprint("Hi")  # inline comment`,
      },
    ],
    quiz: [
      { q: "Which function prints text to the screen?", options: ["echo()", "print()", "show()", "log()"], answer: 1 },
      { q: "Python is best described as a…", options: ["Markup language", "Database", "Programming language", "Web browser"], answer: 2 },
      { q: "Which symbol starts a single-line comment?", options: ["//", "#", "--", "/*"], answer: 1 },
      { q: "What does print(\"Hi\") output?", options: ["Hi", "\"Hi\"", "Nothing", "Error"], answer: 0 },
      { q: "Python source files usually end with…", options: [".js", ".pt", ".py", ".python"], answer: 2 },
      { q: "Is Python case-sensitive?", options: ["Yes", "No", "Only for numbers", "Only in Windows"], answer: 0 },
      { q: "Which of these is NOT a Python use case?", options: ["AI", "Web apps", "Data science", "Compiling to a CPU directly without an interpreter"], answer: 3 },
      { q: "The command to see the Python version is…", options: ["python --version", "python -v0", "py.version", "version python"], answer: 0 },
      { q: "print() automatically adds what at the end by default?", options: ["A space", "A tab", "A newline", "Nothing"], answer: 2 },
      { q: "Which is a valid Python statement?", options: ["print 'Hi'", "print(\"Hi\");", "print(\"Hi\")", "console.log(\"Hi\")"], answer: 2 },
    ],
  },
  {
    slug: "variables",
    title: "Variables & Data Types",
    topic: "Basics",
    emoji: "📦",
    gradient: "from-indigo-500 to-purple-500",
    summary: "Store data in variables and understand basic types.",
    content: [
      {
        heading: "Creating variables",
        body: "A variable is a name that refers to a value. You assign with =.",
        code: `name = "Aarav"\nage = 21\nprint(name, age)`,
      },
      {
        heading: "Common types",
        body: "int (whole numbers), float (decimals), str (text), bool (True/False). Python detects the type automatically.",
        code: `pi = 3.14      # float\nis_on = True   # bool\ncity = "Delhi" # str`,
      },
      {
        heading: "Type checking",
        body: "Use type(x) to see what type a value has.",
        code: `print(type(42))       # <class 'int'>\nprint(type("hi"))     # <class 'str'>`,
      },
    ],
    quiz: [
      { q: "In `age = 21`, what is the type of age?", options: ["str", "float", "int", "bool"], answer: 2 },
      { q: "Which is a valid variable name?", options: ["2name", "my-name", "my_name", "class"], answer: 2 },
      { q: "What is the type of 3.14?", options: ["int", "float", "str", "decimal"], answer: 1 },
      { q: "What is the type of \"True\"?", options: ["bool", "str", "int", "None"], answer: 1 },
      { q: "Which keyword represents a boolean true value?", options: ["true", "TRUE", "True", "yes"], answer: 2 },
      { q: "How do you check a value's type?", options: ["typeof(x)", "type(x)", "x.type", "kindof(x)"], answer: 1 },
      { q: "What is stored in `x` after `x = 5; x = \"hi\"`?", options: ["5", "\"hi\"", "Error", "Both"], answer: 1 },
      { q: "Which is a Python string?", options: ["'hello'", "\"hello\"", "Both a and b", "Neither"], answer: 2 },
      { q: "The value None represents…", options: ["Zero", "Empty string", "Absence of a value", "False"], answer: 2 },
      { q: "Which is NOT a built-in type?", options: ["int", "float", "char", "bool"], answer: 2 },
    ],
  },
  {
    slug: "conditionals",
    title: "If / Elif / Else",
    topic: "Control Flow",
    emoji: "🔀",
    gradient: "from-cyan-500 to-blue-500",
    summary: "Teach your program how to make decisions.",
    content: [
      {
        heading: "if / else",
        body: "Run a block only when a condition is True; otherwise run the else block.",
        code: `marks = 75\nif marks >= 40:\n    print("Pass")\nelse:\n    print("Fail")`,
      },
      {
        heading: "elif",
        body: "elif checks additional conditions in order. The first True branch runs.",
        code: `x = 0\nif x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")`,
      },
      {
        heading: "Comparison and logic",
        body: "Use ==, !=, <, >, <=, >=, and combine with and / or / not.",
      },
    ],
    quiz: [
      { q: "Which keyword checks a condition?", options: ["when", "if", "check", "case"], answer: 1 },
      { q: "How do you test equality?", options: ["=", "==", "===", "eq"], answer: 1 },
      { q: "Which operator means NOT equal?", options: ["<>", "!=", "!==", "not="], answer: 1 },
      { q: "What runs if the if is False and no elif matches?", options: ["Nothing", "else block", "if block again", "Error"], answer: 1 },
      { q: "`True and False` evaluates to…", options: ["True", "False", "None", "Error"], answer: 1 },
      { q: "`True or False` evaluates to…", options: ["True", "False", "None", "Error"], answer: 0 },
      { q: "How is a code block grouped in Python?", options: ["Braces { }", "Indentation", "Parentheses", "Semicolons"], answer: 1 },
      { q: "Which value is falsy?", options: ["\"0\"", "1", "0", "\"False\""], answer: 2 },
      { q: "`not True` is…", options: ["True", "False", "0", "None"], answer: 1 },
      { q: "In an if/elif/else chain, how many branches run?", options: ["All True ones", "Exactly one", "None", "The last one only"], answer: 1 },
    ],
  },
  {
    slug: "loops",
    title: "Loops: for & while",
    topic: "Control Flow",
    emoji: "🔁",
    gradient: "from-emerald-500 to-teal-500",
    summary: "Repeat work efficiently using for and while loops.",
    content: [
      {
        heading: "for loop",
        body: "Iterate over a sequence such as a list or a range of numbers.",
        code: `for i in range(3):\n    print("Hi", i)`,
      },
      {
        heading: "while loop",
        body: "Runs as long as the condition is True.",
        code: `n = 3\nwhile n > 0:\n    print(n)\n    n -= 1`,
      },
      {
        heading: "break & continue",
        body: "break exits the loop early. continue skips to the next iteration.",
      },
    ],
    quiz: [
      { q: "How many times does `range(3)` iterate?", options: ["2", "3", "4", "Infinite"], answer: 1 },
      { q: "What does `range(1, 5)` produce?", options: ["1,2,3,4", "1,2,3,4,5", "0,1,2,3,4", "1..5"], answer: 0 },
      { q: "Which keyword exits a loop immediately?", options: ["stop", "exit", "break", "end"], answer: 2 },
      { q: "Which keyword skips to the next iteration?", options: ["skip", "next", "continue", "pass"], answer: 2 },
      { q: "A while loop runs while its condition is…", options: ["False", "True", "None", "0"], answer: 1 },
      { q: "How do you loop over a list `nums`?", options: ["for i in nums:", "foreach nums:", "loop nums:", "while nums:"], answer: 0 },
      { q: "What does `range(0, 10, 2)` produce?", options: ["0,2,4,6,8", "0..10", "2,4,6,8,10", "0,1,2..10"], answer: 0 },
      { q: "Which loop is best when count is unknown?", options: ["for", "while", "do-while", "foreach"], answer: 1 },
      { q: "Nested loops mean…", options: ["A loop inside another loop", "Two loops after each other", "A recursive function", "A function inside a loop"], answer: 0 },
      { q: "`for _ in range(2): print('x')` prints x how many times?", options: ["0", "1", "2", "3"], answer: 2 },
    ],
  },
  {
    slug: "functions",
    title: "Functions",
    topic: "Functions",
    emoji: "🧩",
    gradient: "from-orange-500 to-rose-500",
    summary: "Package reusable logic into named blocks.",
    content: [
      {
        heading: "def keyword",
        body: "Use def to define a function. Parameters go in parentheses.",
        code: `def greet(name):\n    return f"Namaste, {name}!"\n\nprint(greet("Riya"))`,
      },
      {
        heading: "Default arguments",
        body: "Parameters can have default values.",
        code: `def greet(name="friend"):\n    return f"Hi, {name}"`,
      },
      {
        heading: "Return values",
        body: "return sends a value back to the caller. Without return, the function returns None.",
      },
    ],
    quiz: [
      { q: "Which keyword defines a function?", options: ["func", "define", "def", "function"], answer: 2 },
      { q: "How do you call a function named add?", options: ["call add", "add()", "run add", "add.call"], answer: 1 },
      { q: "Without an explicit return, a function returns…", options: ["0", "\"\"", "None", "False"], answer: 2 },
      { q: "Which returns a value from a function?", options: ["print", "yield", "return", "give"], answer: 2 },
      { q: "In `def f(x=5)`, x is a…", options: ["Required arg", "Default arg", "Keyword-only arg", "Global"], answer: 1 },
      { q: "Where do parameters go?", options: ["Between [ ]", "Between ( )", "After :", "In { }"], answer: 1 },
      { q: "A function that takes no parameters is defined as…", options: ["def f:", "def f():", "def f[]:", "def f{}:"], answer: 1 },
      { q: "`*args` collects extra arguments into a…", options: ["dict", "tuple", "list", "set"], answer: 1 },
      { q: "`**kwargs` collects extra keyword arguments into a…", options: ["dict", "tuple", "list", "set"], answer: 0 },
      { q: "A variable created inside a function is by default…", options: ["Global", "Local", "Nonlocal", "Static"], answer: 1 },
    ],
  },
  {
    slug: "lists",
    title: "Lists & Dictionaries",
    topic: "Data Structures",
    emoji: "🗂️",
    gradient: "from-yellow-500 to-amber-500",
    summary: "Organize collections of values efficiently.",
    content: [
      {
        heading: "List",
        body: "An ordered, mutable collection. Access items by index (0-based).",
        code: `fruits = ["mango", "apple", "banana"]\nprint(fruits[0])   # mango\nfruits.append("kiwi")`,
      },
      {
        heading: "Dictionary",
        body: "A collection of key-value pairs. Access values by key.",
        code: `me = {"name": "Ali", "age": 19}\nprint(me["name"])\nme["age"] = 20`,
      },
      {
        heading: "Useful methods",
        body: "Lists: append, remove, sort, len. Dicts: keys, values, items, get.",
      },
    ],
    quiz: [
      { q: "How do you access a dict value?", options: ["By index", "By key", "By position", "By type"], answer: 1 },
      { q: "Lists are…", options: ["Immutable", "Mutable", "Fixed size", "Keyed only"], answer: 1 },
      { q: "The first index in a list is…", options: ["-1", "0", "1", "None"], answer: 1 },
      { q: "Which returns list length?", options: ["size(x)", "x.length", "len(x)", "count(x)"], answer: 2 },
      { q: "How do you add an item to a list?", options: [".add()", ".push()", ".append()", ".insert(0)"], answer: 2 },
      { q: "Which is a valid dict?", options: ["{1,2,3}", "[1:2]", "{\"a\": 1}", "(a=1)"], answer: 2 },
      { q: "What does `d.get(\"x\", 0)` return if key \"x\" is missing?", options: ["Error", "None", "0", "\"x\""], answer: 2 },
      { q: "Which removes and returns the last list item?", options: [".remove()", ".pop()", ".drop()", ".delete()"], answer: 1 },
      { q: "Tuples are like lists but…", options: ["Faster only", "Immutable", "Keyed", "Only for numbers"], answer: 1 },
      { q: "A set is best when you need…", options: ["Order", "Duplicates", "Unique items", "Key-value pairs"], answer: 2 },
    ],
  },
];

export const BADGES = [
  { id: "first-step", name: "First Step", emoji: "👟", need: 1, desc: "Complete your first lesson" },
  { id: "learner", name: "Curious Learner", emoji: "📚", need: 3, desc: "Complete 3 lessons" },
  { id: "pythonista", name: "Pythonista", emoji: "🐍", need: 6, desc: "Complete all lessons" },
  { id: "quizzer", name: "Quiz Master", emoji: "🧠", need: 3, desc: "Pass 3 quizzes", type: "quiz" as const },
  { id: "quiz-legend", name: "Quiz Legend", emoji: "🏅", need: 6, desc: "Pass all quizzes", type: "quiz" as const },
  { id: "streak-3", name: "On Fire", emoji: "🔥", need: 3, desc: "3-day streak", type: "streak" as const },
  { id: "streak-7", name: "Unstoppable", emoji: "⚡", need: 7, desc: "7-day streak", type: "streak" as const },
  { id: "points-100", name: "Century", emoji: "💯", need: 100, desc: "Earn 100 points", type: "points" as const },
  { id: "points-300", name: "High Scorer", emoji: "🌟", need: 300, desc: "Earn 300 points", type: "points" as const },
];
