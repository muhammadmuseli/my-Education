const $ = (s) => document.querySelector(s);
const dialog = $('#settingsDialog');
const source = $('#sourceText');
const result = $('#translationResult');
const customPrompt = $('#customPrompt');
const status = $('#connectionStatus');
const aiBase = location.hostname === '127.0.0.1' || location.hostname === 'localhost'
  ? 'http://127.0.0.1:3000/api'
  : '/.netlify/functions';

let selectedLanguage = 'en';
let uploadedFile = null;
let lessonDb;

const demoLessons = [
  ['javascript', 'JavaScript Fundamentals', 'JavaScript'],
  ['network', 'Introduction to Computer Networks', 'Networking'],
  ['python', 'Object-Oriented Programming', 'Python'],
  ['html', 'HTML & CSS for Beginners', 'Web Development'],
  ['database', 'Database Design Principles', 'SQL'],
  ['linux', 'Essential Linux CLI Commands', 'Linux'],
  ['security', 'Cybersecurity Fundamentals', 'Security'],
  ['git', 'Git & GitHub Version Control', 'Developer Tools'],
  ['api', 'Understanding REST APIs', 'Web Development'],
  ['algorithm', 'Algorithms & Data Structures', 'Computer Science'],
  ['cloud', 'Introduction to Cloud Computing', 'Cloud'],
  ['java', 'Core Java Programming', 'Java']
];

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function openLessonDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ofuqLessons', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
    request.onsuccess = () => { lessonDb = request.result; resolve(); };
    request.onerror = () => reject(request.error);
  });
}

function storedLessons() {
  return new Promise((resolve, reject) => {
    const request = lessonDb.transaction('files', 'readonly').objectStore('files').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function saveLesson(file) {
  if (!lessonDb) await openLessonDb();
  return new Promise((resolve, reject) => {
    const entry = {
      id: `upload-${Date.now()}`,
      name: file.name,
      type: file.type,
      blob: file,
      createdAt: Date.now()
    };
    const request = lessonDb.transaction('files', 'readwrite').objectStore('files').put(entry);
    request.onsuccess = () => resolve(entry);
    request.onerror = () => reject(request.error);
  });
}

async function saveFileAndRefresh(file) {
  try {
    const saved = await saveLesson(file);
    await refreshLibrary();
    return saved;
  } catch (error) {
    toast('Browser storage failed. Please run the app via Live Server and re-upload.');
    throw error;
  }
}

function fileKind(type) {
  return type === 'application/pdf' ? 'PDF' : type.startsWith('image/') ? 'IMG' : 'TXT';
}

function renderLibrary(uploaded = []) {
  const list = $('#libraryList');
  const demos = demoLessons.map(([id, name, subject]) => ({ id, name, subject, demo: true }));
  const all = [...uploaded.sort((a, b) => b.createdAt - a.createdAt), ...demos];
  $('#libraryCount').textContent = all.length;

  list.innerHTML = all.map(item => {
    const kind = item.demo ? 'Lesson' : fileKind(item.type);
    const category = item.demo ? '' : (item.type === 'application/pdf' ? 'pdf' : item.type.startsWith('image/') ? 'image' : '');
    const date = item.demo ? 'Tech Module' : new Date(item.createdAt).toLocaleDateString('en-US');
    const safeName = escapeHtml(item.name);
    const safeSubtitle = item.demo ? escapeHtml(item.subject) : 'Uploaded file — click to view';

    return `<a class="library-item" href="lesson.html?id=${encodeURIComponent(item.id)}&demo=${item.demo ? '1' : '0'}" target="_blank" rel="noopener noreferrer">
      <div class="library-item-top"><span class="library-file-icon ${category}">${kind}</span><time>${date}</time></div>
      <h3>${safeName}</h3>
      <p>${safeSubtitle}</p>
    </a>`;
  }).join('');
}

async function refreshLibrary() {
  if (!lessonDb) await openLessonDb();
  renderLibrary(await storedLessons());
}

function openLesson(id, demo) {
  window.open(`lesson.html?id=${encodeURIComponent(id)}&demo=${demo ? '1' : '0'}`, '_blank', 'noopener');
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

async function updateStatus() {
  try {
    const response = await fetch(`${aiBase}/health`);
    const data = await response.json();
    status.classList.toggle('connected', data.ready);
    status.innerHTML = `<span></span> Gemini ${data.ready ? 'Connected' : 'Disconnected'}`;
  } catch {
    status.classList.remove('connected');
    status.innerHTML = '<span></span> Gemini Disconnected';
  }
}

function showSettings() {
  customPrompt.value = localStorage.getItem('ofuqCustomPrompt') || '';
  dialog.showModal();
}

$('#openSettings').addEventListener('click', showSettings);
status.addEventListener('click', showSettings);

function persistGeminiSettings(silent = false) {
  localStorage.setItem('ofuqCustomPrompt', customPrompt.value.trim());
  if (!silent) toast('Custom assistant instructions saved');
}

$('#saveSettings').addEventListener('click', () => persistGeminiSettings());
customPrompt.addEventListener('input', () => persistGeminiSettings(true));
$('#uploadTrigger').addEventListener('click', () => $('#fileInput').click());
$('#heroUpload').addEventListener('click', () => $('#fileInput').click());
$('#menuBtn').addEventListener('click', () => $('.sidebar').classList.toggle('open'));

document.querySelectorAll('.lang-tab').forEach(btn => btn.addEventListener('click', () => {
  document.querySelector('.lang-tab.active').classList.remove('active');
  btn.classList.add('active');
  selectedLanguage = btn.dataset.lang;
  if (source.value.trim()) translate();
}));

$('#fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 50 * 1024 * 1024) {
    toast('File exceeds 50MB limit. Please choose a smaller file.');
    return;
  }

  const preview = $('#filePreview');
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    uploadedFile = null;
    source.value = await file.text();
    preview.hidden = true;
    await saveFileAndRefresh(file);
    toast(`Loaded ${file.name} and saved to library`);
    return;
  }

  if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
    toast('Supported formats: PDF, Images, and TXT only.');
    return;
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  uploadedFile = {
    name: file.name,
    mimeType: file.type,
    data: dataUrl.split(',')[1],
    previewUrl: dataUrl
  };

  source.value = '';
  preview.hidden = false;
  const stored = await saveFileAndRefresh(file);
  const safeFileName = escapeHtml(file.name);

  preview.innerHTML = file.type.startsWith('image/')
    ? `<img src="${dataUrl}" alt="File preview"><strong>${safeFileName}</strong><button data-open-file="${stored.id}">Open</button>`
    : `<span class="pdf-icon">PDF</span><strong>${safeFileName}</strong><button data-open-file="${stored.id}">Open</button>`;

  toast(`Uploaded ${file.name}. Select Summarize, Explain, or Translate.`);
});

function getAttachmentParts() {
  return uploadedFile
    ? [{ inline_data: { mime_type: uploadedFile.mimeType, data: uploadedFile.data } }]
    : [];
}

async function callAi(prompt, parts = []) {
  const personal = localStorage.getItem('ofuqCustomPrompt');
  const completePrompt = personal ? `${personal}\n\n${prompt}` : prompt;
  const response = await fetch(`${aiBase}/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: completePrompt, parts })
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('AI serverless endpoint is not deployed. Deploy via GitHub or Netlify CLI.');
  }

  if (!response.ok) throw new Error(data.error || 'Failed to connect to AI server');
  return data.text || 'No response received from Gemini. Please try again.';
}

async function translate() {
  const text = source.value.trim();
  if (!text && !uploadedFile) return toast('Enter text or upload a PDF/image first');

  result.innerHTML = '<div class="uploading">✦ Generating accurate translation…</div>';
  const language = selectedLanguage === 'ar' ? 'Arabic' : 'English';
  const prompt = `Translate the following educational lesson into ${language}. Preserve headings, key terms, formulas, and educational context. Return only the translated text, formatted clearly.\n\nLesson content:\n${text}`;

  try {
    result.textContent = await callAi(prompt, getAttachmentParts());
  } catch (error) {
    result.innerHTML = `<div class="empty-result"><span>!</span><p>Translation Failed</p><small>${escapeHtml(error.message)}</small></div>`;
  }
}

$('#translateBtn').addEventListener('click', translate);

async function analyzeUploadedFile(mode) {
  const text = source.value.trim();
  if (!text && !uploadedFile) return toast('Upload a PDF/image or paste lesson text first');

  result.innerHTML = `<div class="uploading">✦ ${mode === 'summary' ? 'Summarizing' : 'Explaining'} lesson…</div>`;
  const targetLang = selectedLanguage === 'ar' ? 'Arabic' : 'English';
  const instruction = mode === 'summary'
    ? `Summarize this lesson in ${targetLang}. Start with a clear title, followed by key bullet points, important technical terms, and a concise review takeaway.`
    : `Explain this lesson clearly in ${targetLang} for an IT student. Break complex concepts down step-by-step, define key terminology, and include a practical example where appropriate.`;

  try {
    const prompt = `${instruction}\n\nAdditional student notes: ${text || 'None; analyze the attached document.'}`;
    result.textContent = await callAi(prompt, getAttachmentParts());
  } catch (error) {
    result.innerHTML = `<div class="empty-result"><span>!</span><p>Analysis Failed</p><small>${escapeHtml(error.message)}</small></div>`;
  }
}

$('#summarizeBtn').addEventListener('click', () => analyzeUploadedFile('summary'));
$('#explainBtn').addEventListener('click', () => analyzeUploadedFile('explain'));

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-file]');
  if (button) openLesson(button.dataset.openFile, false);
});

refreshLibrary().catch(() => toast('Could not load lesson library. Please run via Live Server.'));
if (navigator.storage?.persist) navigator.storage.persist();
if (location.protocol === 'file:') {
  setTimeout(() => toast('Run via Live Server instead of file:// to persist files and settings'), 900);
}
updateStatus();

const chatMessages = $('#chatMessages');
const chatInput = $('#chatInput');
const chatHistory = [];

function addMessage(text, role) {
  const message = document.createElement('div');
  message.className = `message ${role}`;
  message.textContent = text;
  const time = document.createElement('small');
  time.textContent = 'Just now';
  message.appendChild(time);
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

async function askGemini(prompt, instruction) {
  return callAi(`${instruction}\n\n${prompt}`);
}

$('#ideasBtn').addEventListener('click', async () => {
  const title = $('#lessonTitle').value.trim();
  if (!title) return toast('Enter an IT lesson title first');

  const target = $('#ideasResult');
  target.innerHTML = '<div class="uploading">✦ Generating study plan…</div>';
  try {
    const reply = await askGemini(
      `Lesson Title: ${title}`,
      'You are an expert IT tutor. Create concise study suggestions based on the lesson title: 3 practical exercises with increasing difficulty, 2 additional concepts to review, and 1 mini-project. Use simple HTML headings and bullet points only.'
    );
    if (reply) target.innerHTML = `<div class="idea-list">${reply.replace(/\n/g, '<br>')}</div>`;
  } catch (error) {
    target.innerHTML = `<div class="idea-empty"><span>!</span><p>Failed to generate suggestions</p><small>${escapeHtml(error.message)}</small></div>`;
  }
});

function renderGlobalSuggestions(query) {
  const box = $('#pageSuggestions');
  const term = query.trim();
  if (!term) { box.innerHTML = ''; return; }

  const safeTerm = escapeHtml(term);
  const encoded = encodeURIComponent(term + ' programming tutorial');
  const mdnQuery = encodeURIComponent(term + ' site:developer.mozilla.org');

  box.innerHTML = `<p class="suggestion-label">Global resources for: <strong>${safeTerm}</strong></p>
    <div class="global-links">
      <a href="https://www.google.com/search?q=${encoded}" target="_blank" rel="noopener noreferrer"><b>G</b><span>Google Search</span><small>Articles & guides</small></a>
      <a href="https://www.youtube.com/results?search_query=${encoded}" target="_blank" rel="noopener noreferrer"><b>▶</b><span>YouTube Tutorials</span><small>Video walkthroughs</small></a>
      <a href="https://www.google.com/search?q=${mdnQuery}" target="_blank" rel="noopener noreferrer"><b>⌘</b><span>MDN Docs</span><small>Developer reference</small></a>
    </div>`;
}

$('#lessonTitle').addEventListener('input', (event) => renderGlobalSuggestions(event.target.value));

async function sendChat() {
  const question = chatInput.value.trim();
  if (!question) return;

  chatInput.value = '';
  addMessage(question, 'user');
  const waiting = addMessage('✦ Thinking…', 'ai');

  try {
    const context = chatHistory.map(item => `${item.role}: ${item.text}`).join('\n');
    const answer = await askGemini(
      `${context}\nStudent: ${question}`,
      'You are a friendly IT study tutor. Explain concepts step-by-step, provide a concise practical example when useful, and avoid fabricating facts.'
    );
    waiting.remove();
    if (answer) {
      chatHistory.push({ role: 'Student', text: question }, { role: 'Tutor', text: answer });
      addMessage(answer, 'ai');
    }
  } catch (error) {
    waiting.textContent = `Failed to send message: ${error.message}`;
  }
}

$('#sendChat').addEventListener('click', sendChat);
chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChat();
  }
});

$('#clearChat').addEventListener('click', () => {
  chatHistory.length = 0;
  chatMessages.innerHTML = '<div class="message ai">Hello! I am your IT study assistant. How can I help you today?<small>Just now</small></div>';
});
