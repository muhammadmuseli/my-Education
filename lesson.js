const demos = {
  javascript: [
    'JavaScript Fundamentals',
    'JavaScript',
    'Learn variables, functions, and how to manipulate DOM elements on a web page.',
    'Variables & Data Types|Functions & Parameters|DOM & Events',
    'const welcome = (name) => `Hello ${name}`;\nconsole.log(welcome("Student"));'
  ],
  network: [
    'Introduction to Computer Networks',
    'Networking',
    'A structured overview of how devices connect and exchange data across the internet.',
    'IP Addressing & DNS|TCP/IP Layers|LAN vs. WAN',
    'Browser → DNS → Server\n          ← TCP/IP ←'
  ],
  python: [
    'Object-Oriented Programming',
    'Python',
    'Use classes and objects to structure, modularize, and reuse your code efficiently.',
    'Classes & Objects|The __init__ Method|Inheritance & Encapsulation',
    'class Student:\n  def __init__(self, name):\n    self.name = name'
  ],
  html: [
    'HTML & CSS for Beginners',
    'Web Development',
    'Build semantic page structures and style them with modern CSS.',
    'Semantic Elements|Flexbox Layout|Responsive Design',
    '<main class="page">Hello</main>'
  ],
  database: [
    'Database Design Principles',
    'SQL',
    'Learn how to store, query, and retrieve relational data systematically.',
    'Tables & Keys|SELECT & WHERE Queries|Relational Mapping',
    'SELECT name FROM students WHERE active = 1;'
  ],
  linux: [
    'Essential Linux CLI Commands',
    'Linux',
    'Practical terminal commands for navigating filesystems and managing dev environments.',
    'cd & ls Navigation|File Permissions|Terminal Workflows',
    'ls -la\ncd projects\npwd'
  ],
  security: [
    'Cybersecurity Fundamentals',
    'Security',
    'Core principles for securing accounts, systems, and application data.',
    'Authentication & Passwords|Phishing Defense|Security Patching',
    'Never commit API keys or secrets to public repositories.'
  ],
  git: [
    'Git & GitHub Version Control',
    'Developer Tools',
    'Track project changes, manage history, and collaborate using branches.',
    'Commits|Branching|Pull Requests',
    'git add .\ngit commit -m "feat: add new module"'
  ],
  api: [
    'Understanding REST APIs',
    'Web Development',
    'Learn how frontend applications communicate with backend servers over HTTP.',
    'GET & POST Requests|JSON Payloads|HTTP Status Codes',
    'fetch("/api/lessons").then(r => r.json())'
  ],
  algorithm: [
    'Algorithms & Data Structures',
    'Computer Science',
    'Select the optimal data structure and algorithm to solve computational problems.',
    'Arrays & Lists|Stacks & Queues|Time Complexity (Big O)',
    'O(n) means execution time scales linearly with the input size.'
  ],
  cloud: [
    'Introduction to Cloud Computing',
    'Cloud',
    'Deploy applications and manage data over scalable cloud infrastructure.',
    'IaaS vs. PaaS|Auto-Scaling|Cloud Deployment',
    'App → Cloud Service → Managed Database'
  ],
  java: [
    'Core Java Programming',
    'Java',
    'Get started writing strongly-typed Java applications and understanding class structure.',
    'Variables & Types|Methods|Classes & Objects',
    'public class Main {\n  public static void main(String[] args) {}\n}'
  ]
};

const lessonExtras = {
  javascript: {
    icon: '{ }',
    goal: 'Build interactive web pages that respond dynamically to user clicks and keyboard input.',
    example: 'Try creating a button that updates a welcome heading when clicked.',
    exercise: 'Write a function that takes two numbers and displays their sum on the page.'
  },
  network: {
    icon: '⌁',
    goal: 'Understand the end-to-end journey of data packets from your device to a remote server.',
    example: 'When you type a domain name, DNS resolves it to an IP address before establishing a TCP connection.',
    exercise: 'Diagram a home network including a router, workstation, smartphone, and DNS resolver.'
  },
  python: {
    icon: '⌘',
    goal: 'Organize your codebase using classes that model real-world entities.',
    example: 'A Student class can encapsulate attributes like name, age, and enrolled courses.',
    exercise: 'Create a Book class with title and author attributes and a method to display its details.'
  },
  html: {
    icon: '</>',
    goal: 'Construct a well-structured semantic document and style it for usability.',
    example: 'Use <main> for primary content and <section> for thematically grouped information.',
    exercise: 'Design a personal profile card containing a heading, an image, and an action button.'
  },
  database: {
    icon: '▦',
    goal: 'Store and query structured data efficiently without redundancy.',
    example: 'A students table stores names and emails where each record has a unique primary key.',
    exercise: 'Write an SQL query that retrieves all active students sorted alphabetically by name.'
  },
  linux: {
    icon: '>_',
    goal: 'Use the command-line interface to navigate directories and run development tools.',
    example: 'The pwd command prints your current working directory, while ls lists its contents.',
    exercise: 'Create a directory named project and initialize an empty text file inside it via the CLI.'
  },
  security: {
    icon: '⌑',
    goal: 'Mitigate vulnerabilities and protect user accounts and sensitive data.',
    example: 'Two-factor authentication (2FA) adds a critical defense layer even if a password is leaked.',
    exercise: 'Analyze a suspicious email and list three indicators of a phishing attempt.'
  },
  git: {
    icon: '⑂',
    goal: 'Preserve project history and experiment safely with isolated branches.',
    example: 'Every commit acts as a documented checkpoint describing what changed and why.',
    exercise: 'Create a feature branch, commit a change, and merge it back into the main branch.'
  },
  api: {
    icon: '⇄',
    goal: 'Master asynchronous data exchange between client interfaces and backend services.',
    example: 'GET requests retrieve resources while POST requests submit new data to the server.',
    exercise: 'Design a JSON payload to create a new lesson record via a REST API endpoint.'
  },
  algorithm: {
    icon: '◫',
    goal: 'Formulate efficient, step-by-step computational solutions.',
    example: 'Linear search inspects elements sequentially until the target value is located.',
    exercise: 'Write an algorithm that finds and returns the maximum number in an unsorted array.'
  },
  cloud: {
    icon: '☁',
    goal: 'Run applications and databases on resilient, internet-accessible infrastructure.',
    example: 'Your web app can run on a serverless function connected to a managed cloud database.',
    exercise: 'Select an appropriate cloud storage architecture for a media-sharing application.'
  },
  java: {
    icon: '☕',
    goal: 'Build modular, object-oriented programs using Java classes and methods.',
    example: 'Execution in standard Java applications begins at the public static void main method.',
    exercise: 'Write a Java program that prints your name and outputs the result of a basic arithmetic operation.'
  }
};

const main = document.querySelector('#lessonContent');
const params = new URLSearchParams(location.search);
const id = params.get('id');
const aiBase = location.hostname === '127.0.0.1' || location.hostname === 'localhost'
  ? 'http://127.0.0.1:3000/api'
  : '/.netlify/functions';

let openedFile = null;
let activeObjectUrl = null;

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

window.addEventListener('beforeunload', () => {
  if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
});

function demoLesson(data) {
  const [title, subject, description, topics, code] = data;
  const extra = lessonExtras[id];
  const list = topics.split('|');
  document.title = `${title} | Ofoq`;

  main.innerHTML = `
    <section class="lesson-header">
      <p class="eyebrow">${escapeHtml(subject)} · Technical Module</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <div class="lesson-tags">
        <span>⏱ 15 mins</span>
        <span>◎ Fundamentals</span>
        <span>✓ Interactive Lesson</span>
      </div>
    </section>
    <section class="tech-visual">
      <div class="visual-orb">${extra.icon}</div>
      <div class="visual-flow">
        <span>${escapeHtml(list[0])}</span><b>→</b>
        <span>${escapeHtml(list[1] || 'Practical Application')}</span><b>→</b>
        <span>${escapeHtml(list[2] || 'Outcome')}</span>
      </div>
      <p>A conceptual roadmap connecting the core topics of this module.</p>
    </section>
    <article class="content-card demo-content">
      <section class="lesson-block">
        <p class="block-label">01 · Core Objective</p>
        <h2>What You Will Learn</h2>
        <p>${escapeHtml(extra.goal)}</p>
        <ul>${list.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
      </section>
      <section class="lesson-block explanation">
        <p class="block-label">02 · Breakdown</p>
        <h2>Understanding the Concept</h2>
        <p>${escapeHtml(description)} Start with the foundational concept and map it to a real-world engineering scenario before writing code. This builds deep architectural intuition rather than rote memorization.</p>
        <div class="callout">
          <b>Real-World Scenario</b>
          <p>${escapeHtml(extra.example)}</p>
        </div>
      </section>
      <section class="lesson-block">
        <p class="block-label">03 · Code Example</p>
        <h2>Inspect the Implementation</h2>
        <p>Copy the snippet below into your code editor, modify a parameter, and observe the output.</p>
        <code>${escapeHtml(code)}</code>
      </section>
      <section class="lesson-block practice">
        <p class="block-label">04 · Hands-On Exercise</p>
        <h2>Apply It Yourself</h2>
        <p>${escapeHtml(extra.exercise)}</p>
        <button type="button" class="complete-btn" onclick="this.textContent='✓ Marked as Completed';this.classList.add('done')">Mark as Completed</button>
      </section>
    </article>`;
}

function openDbFile() {
  if (!('indexedDB' in window)) {
    return showMissing('Your browser does not support local IndexedDB storage. Please run via Live Server.');
  }
  const request = indexedDB.open('ofuqLessons', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
  request.onsuccess = () => {
    const read = request.result.transaction('files', 'readonly').objectStore('files').get(id);
    read.onsuccess = () => renderFile(read.result);
    read.onerror = () => showMissing();
  };
  request.onerror = () => showMissing('Could not access the file library. Please open via Live Server.');
  request.onblocked = () => showMissing('Close other open tabs of this application and try again.');
}

async function renderFile(file) {
  if (!file) return showMissing();
  openedFile = file;
  const safeName = escapeHtml(file.name);
  document.title = `${file.name} | Ofoq`;

  if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = URL.createObjectURL(file.blob);

  const isPdf = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');
  const viewer = isPdf
    ? `<iframe class="pdf-viewer" src="${activeObjectUrl}" title="${safeName}"></iframe>`
    : isImage
      ? `<img class="image-viewer" src="${activeObjectUrl}" alt="${safeName}">`
      : `<pre class="text-viewer">Loading text content…</pre>`;

  main.innerHTML = `
    <section class="lesson-header">
      <p class="eyebrow">Uploaded Document</p>
      <h1>${safeName}</h1>
      <p>Viewing your uploaded study material in its original format.</p>
    </section>
    <section class="file-ai-tools">
      <div>
        <span>✦</span>
        <div>
          <b>AI Lesson Assistant</b>
          <p>Analyze this document directly using Gemini AI.</p>
        </div>
      </div>
      <div class="file-ai-buttons">
        <button type="button" data-file-action="summary">Summarize Lesson</button>
        <button type="button" data-file-action="explain">Simplified Explanation</button>
      </div>
    </section>
    <article class="content-card">${viewer}</article>
    <section id="fileAiResult" class="file-ai-result" hidden></section>`;

  if (!isPdf && !isImage) {
    try {
      main.querySelector('pre').textContent = await file.blob.text();
    } catch {
      main.querySelector('pre').textContent = 'Text document saved in library.';
    }
  }

  main.querySelectorAll('[data-file-action]').forEach(button => {
    button.addEventListener('click', () => analyzeOpenedFile(button.dataset.fileAction));
  });
}

async function analyzeOpenedFile(mode) {
  if (!openedFile) return;
  const result = document.querySelector('#fileAiResult');
  result.hidden = false;
  result.textContent = mode === 'summary' ? '✦ Generating lesson summary…' : '✦ Generating step-by-step explanation…';

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(openedFile.blob);
  });

  const personal = localStorage.getItem('ofuqCustomPrompt') || '';
  const task = mode === 'summary'
    ? 'Summarize this lesson clearly in English: provide a title, key bullet points, important technical terms, and a concise review takeaway.'
    : 'Explain this lesson clearly in English for an IT student: break it down step-by-step, include a practical example, and add a short exercise.';

  try {
    const response = await fetch(`${aiBase}/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${personal}\n\n${task}`.trim(),
        parts: [{ inline_data: { mime_type: openedFile.type, data: dataUrl.split(',')[1] } }]
      })
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('AI serverless endpoint is not deployed. Deploy via GitHub or Netlify CLI.');
    }

    if (!response.ok) throw new Error(data.error || 'Failed to connect to AI server');
    result.textContent = data.text || 'No response received. Please try again.';
  } catch (error) {
    result.textContent = `Analysis failed: ${error.message}. Ensure the local server (node server.js) is running.`;
  }
}

function showMissing(message = 'Lesson not found. Please open it from your library again.') {
  main.innerHTML = `<div class="loading">${escapeHtml(message)}<br><br><a href="index.html">← Back to My Library</a></div>`;
}

if (!id) showMissing('This is the lesson viewer. Please select a lesson from your library first.');
else if (params.get('demo') === '1' && demos[id]) demoLesson(demos[id]);
else openDbFile();
