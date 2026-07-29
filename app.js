const $ = (s) => document.querySelector(s);
const dialog = $('#settingsDialog');
const source = $('#sourceText');
const result = $('#translationResult');
const customPrompt = $('#customPrompt');
const status = $('#connectionStatus');
const aiBase = location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? 'http://127.0.0.1:3000/api' : '/.netlify/functions';
let selectedLanguage = 'ar';
let uploadedFile = null;
const demoLessons = [
  ['javascript','أساسيات JavaScript','JavaScript'], ['network','مقدمة في شبكات الحاسوب','الشبكات'], ['python','البرمجة كائنية التوجه','Python'],
  ['html','HTML و CSS للمبتدئين','تطوير الويب'], ['database','مبادئ قواعد البيانات','SQL'], ['linux','أوامر Linux الأساسية','Linux'],
  ['security','أساسيات الأمن السيبراني','الأمن'], ['git','Git و GitHub','أدوات المطور'], ['api','فهم REST API','تطوير الويب'],
  ['algorithm','الخوارزميات وهياكل البيانات','البرمجة'], ['cloud','مقدمة في الحوسبة السحابية','Cloud'], ['java','أساسيات Java','Java']
];
let lessonDb;

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
    request.onsuccess = () => resolve(request.result || []); request.onerror = () => reject(request.error);
  });
}
async function saveLesson(file) {
  if (!lessonDb) await openLessonDb();
  return new Promise((resolve, reject) => {
    const entry = { id: `upload-${Date.now()}`, name: file.name, type: file.type, blob: file, createdAt: Date.now() };
    const request = lessonDb.transaction('files', 'readwrite').objectStore('files').put(entry);
    request.onsuccess = () => resolve(entry); request.onerror = () => reject(request.error);
  });
}
async function saveFileAndRefresh(file) {
  try { const saved = await saveLesson(file); await refreshLibrary(); return saved; }
  catch (error) { toast('لم يستطع المتصفح حفظ الملف. شغّل الموقع عبر Live Server ثم أعد الرفع.'); throw error; }
}
function fileKind(type) { return type === 'application/pdf' ? 'PDF' : type.startsWith('image/') ? 'IMG' : 'TXT'; }
function renderLibrary(uploaded = []) {
  const list = $('#libraryList');
  const demos = demoLessons.map(([id, name, subject]) => ({ id, name, subject, demo: true }));
  const all = [...uploaded.sort((a,b) => b.createdAt - a.createdAt), ...demos];
  $('#libraryCount').textContent = all.length;
  list.innerHTML = all.map(item => {
    const kind = item.demo ? 'درس' : fileKind(item.type);
    const category = item.demo ? '' : (item.type === 'application/pdf' ? 'pdf' : item.type.startsWith('image/') ? 'image' : '');
    const date = item.demo ? 'درس تقني' : new Date(item.createdAt).toLocaleDateString('ar-EG');
    return `<a class="library-item" href="lesson.html?id=${encodeURIComponent(item.id)}&demo=${item.demo ? '1' : '0'}" target="_blank"><div class="library-item-top"><span class="library-file-icon ${category}">${kind}</span><time>${date}</time></div><h3>${item.name}</h3><p>${item.demo ? item.subject : 'ملف مرفوع — اضغط للعرض'}</p></a>`;
  }).join('');
}
async function refreshLibrary() { if (!lessonDb) await openLessonDb(); renderLibrary(await storedLessons()); }
function openLesson(id, demo) { window.open(`lesson.html?id=${encodeURIComponent(id)}&demo=${demo ? '1' : '0'}`, '_blank', 'noopener'); }

// Move users away from models that are unavailable to new Gemini API users.
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3000); }
function quotaMessage() { return 'لا توجد حصة متاحة لهذا المفتاح أو النموذج. افتح الإعدادات واختر Gemini 2.5 Flash، ثم راجع الحصة في AI Studio.'; }
async function updateStatus() { try { const response = await fetch(`${aiBase}/health`); const data = await response.json(); status.classList.toggle('connected', data.ready); status.innerHTML = `<span></span> Gemini ${data.ready ? 'متصل عبر السيرفر' : 'غير متصل'}`; } catch { status.classList.remove('connected'); status.innerHTML = '<span></span> Gemini غير متصل'; } }
function showSettings() { customPrompt.value = localStorage.getItem('ofuqCustomPrompt') || ''; dialog.showModal(); }

$('#openSettings').addEventListener('click', showSettings);
status.addEventListener('click', showSettings);
function persistGeminiSettings(silent = false) { localStorage.setItem('ofuqCustomPrompt', customPrompt.value.trim()); if (!silent) toast('تم حفظ تعليماتك الخاصة للمساعد'); }
$('#saveSettings').addEventListener('click', () => persistGeminiSettings());
customPrompt.addEventListener('input', () => persistGeminiSettings(true));
$('#uploadTrigger').addEventListener('click', () => $('#fileInput').click());
$('#heroUpload').addEventListener('click', () => $('#fileInput').click());
$('#menuBtn').addEventListener('click', () => $('.sidebar').classList.toggle('open'));

document.querySelectorAll('.lang-tab').forEach(btn => btn.addEventListener('click', () => { document.querySelector('.lang-tab.active').classList.remove('active'); btn.classList.add('active'); selectedLanguage = btn.dataset.lang; if (source.value.trim()) translate(); }));

$('#fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 50 * 1024 * 1024) { toast('الملف أكبر من 50MB. اختر ملفًا أصغر.'); return; }
  const preview = $('#filePreview');
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    uploadedFile = null;
    source.value = await file.text();
    preview.hidden = true;
    await saveFileAndRefresh(file);
    toast(`تم تحميل ${file.name} وحفظه في مكتبتي`);
    return;
  }
  if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) { toast('الصيغ المدعومة هي PDF والصور وTXT فقط.'); return; }
  const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  uploadedFile = { name: file.name, mimeType: file.type, data: dataUrl.split(',')[1], previewUrl: dataUrl };
  source.value = '';
  preview.hidden = false;
  const stored = await saveFileAndRefresh(file);
  preview.innerHTML = file.type.startsWith('image/') ? `<img src="${dataUrl}" alt="معاينة الملف"><strong>${file.name}</strong><button data-open-file="${stored.id}">فتح</button>` : `<span class="pdf-icon">PDF</span><strong>${file.name}</strong><button data-open-file="${stored.id}">فتح</button>`;
  toast(`تم تحميل ${file.name}. اختر تلخيصًا أو شرحًا أو ترجمة.`);
});

function documentParts(prompt) { return uploadedFile ? [{ text: prompt }, { inline_data: { mime_type: uploadedFile.mimeType, data: uploadedFile.data } }] : [{ text: prompt }]; }
async function callAi(prompt, parts = []) {
  const personal = localStorage.getItem('ofuqCustomPrompt');
  const completePrompt = personal ? `${personal}\n\n${prompt}` : prompt;
  const response = await fetch(`${aiBase}/gemini`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ prompt: completePrompt, parts }) });
  const raw = await response.text(); let data;
  try { data = JSON.parse(raw); } catch { throw new Error('وظيفة الذكاء الاصطناعي لم تُنشر. انشر المشروع عبر GitHub أو Netlify CLI، وليس Netlify Drop.'); }
  if (!response.ok) throw new Error(data.error || 'تعذر الاتصال بسيرفر الذكاء الاصطناعي');
  return data.text || 'لم تصل إجابة من Gemini. حاول مرة أخرى.';
}

async function translate() {
  const text = source.value.trim();
  if (!text && !uploadedFile) return toast('أضف نصًا أو ارفع ملف PDF أو صورة أولًا');
  result.innerHTML = '<div class="uploading">✦ جارٍ إنشاء ترجمة دقيقة…</div>';
  const language = selectedLanguage === 'ar' ? 'العربية' : 'English';
  const prompt = `Translate the following German educational lesson into ${language}. Preserve headings, key terms, formulas and educational meaning. Return only the translated text, formatted clearly.\n\nGerman lesson:\n${text}`;
  try {
    result.textContent = await callAi(prompt, documentParts(prompt).slice(1));
  } catch (error) { result.innerHTML = `<div class="empty-result"><span>!</span><p>تعذّرت الترجمة</p><small>${error.message}</small></div>`; }
}
$('#translateBtn').addEventListener('click', translate);

async function analyzeUploadedFile(mode) {
  const text = source.value.trim();
  if (!text && !uploadedFile) return toast('ارفع PDF أو صورة، أو ألصق نص الدرس أولًا');
  result.innerHTML = `<div class="uploading">✦ جارٍ ${mode === 'summary' ? 'تلخيص' : 'شرح'} الدرس…</div>`;
  const instruction = mode === 'summary'
    ? 'لخّص هذا الدرس باللغة العربية. ابدأ بعنوان، ثم اكتب النقاط الأساسية، المصطلحات المهمة، وخلاصة قصيرة للمراجعة.'
    : 'اشرح هذا الدرس باللغة العربية بأسلوب مبسط لطالب IT. قسّم الفكرة إلى خطوات، اشرح المصطلحات، وأضف مثالًا صغيرًا إن كان مناسبًا.';
  try {
    const prompt = `${instruction}\n\nالنص الإضافي من الطالب: ${text || 'لا يوجد؛ استخدم الملف المرفوع.'}`;
    result.textContent = await callAi(prompt, documentParts(prompt).slice(1));
  } catch (error) { result.innerHTML = `<div class="empty-result"><span>!</span><p>تعذّر تحليل الملف</p><small>${error.message}</small></div>`; }
}

$('#summarizeBtn').addEventListener('click', () => analyzeUploadedFile('summary'));
$('#explainBtn').addEventListener('click', () => analyzeUploadedFile('explain'));
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-file]');
  if (button) openLesson(button.dataset.openFile, false);
});
refreshLibrary().catch(() => toast('تعذر فتح مكتبة الدروس. شغّل الموقع عبر Live Server.'));
if (navigator.storage?.persist) navigator.storage.persist();
if (location.protocol === 'file:') setTimeout(() => toast('لضمان حفظ الملفات والمفتاح: شغّل الموقع عبر Live Server بدل file://'), 900);
updateStatus();

const chatMessages = $('#chatMessages');
const chatInput = $('#chatInput');
const chatHistory = [];

function addMessage(text, role) {
  const message = document.createElement('div');
  message.className = `message ${role}`;
  message.textContent = text;
  const time = document.createElement('small');
  time.textContent = 'الآن';
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
  if (!title) return toast('اكتب اسم درس IT أولًا');
  const target = $('#ideasResult');
  target.innerHTML = '<div class="uploading">✦ جارٍ إعداد خطة التعلّم…</div>';
  try {
    const reply = await askGemini(`عنوان الدرس: ${title}`, 'You are an expert IT tutor for Arabic-speaking students. Create concise Arabic study suggestions based on the lesson title: 3 practical exercises with increasing difficulty, 2 additional concepts to review, and one mini-project. Use simple HTML headings and bullet points only.');
    if (reply) target.innerHTML = `<div class="idea-list">${reply.replace(/\n/g, '<br>')}</div>`;
  } catch (error) { target.innerHTML = `<div class="idea-empty"><span>!</span><p>تعذر إنشاء الاقتراحات</p><small>${error.message}</small></div>`; }
});

function renderGlobalSuggestions(query) {
  const box = $('#pageSuggestions');
  const term = query.trim();
  if (!term) { box.innerHTML = ''; return; }
  const safeTerm = term.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const encoded = encodeURIComponent(term + ' programming tutorial');
  const mdnQuery = encodeURIComponent(term + ' site:developer.mozilla.org');
  box.innerHTML = `<p class="suggestion-label">صفحات عالمية عن: <strong>${safeTerm}</strong></p><div class="global-links"><a href="https://www.google.com/search?q=${encoded}" target="_blank" rel="noopener noreferrer"><b>G</b><span>بحث Google</span><small>نتائج ومقالات</small></a><a href="https://www.youtube.com/results?search_query=${encoded}" target="_blank" rel="noopener noreferrer"><b>▶</b><span>دروس YouTube</span><small>شروحات فيديو</small></a><a href="https://www.google.com/search?q=${mdnQuery}" target="_blank" rel="noopener noreferrer"><b>⌘</b><span>توثيق MDN</span><small>مرجع للمطورين</small></a></div>`;
}
$('#lessonTitle').addEventListener('input', (event) => renderGlobalSuggestions(event.target.value));

async function sendChat() {
  const question = chatInput.value.trim();
  if (!question) return;
  chatInput.value = '';
  addMessage(question, 'user');
  const waiting = addMessage('✦ أفكر في الإجابة…', 'ai');
  try {
    const context = chatHistory.map(item => `${item.role}: ${item.text}`).join('\n');
    const answer = await askGemini(`${context}\nStudent: ${question}`, 'You are a friendly IT study tutor. Reply in clear Arabic. Explain concepts step-by-step, give a small example when useful, and do not invent facts. Keep the answer focused and reasonably concise.');
    waiting.remove();
    if (answer) { chatHistory.push({role:'Student', text:question}, {role:'Tutor', text:answer}); addMessage(answer, 'ai'); }
  } catch (error) { waiting.textContent = `تعذر إرسال الرسالة: ${error.message}`; }
}

$('#sendChat').addEventListener('click', sendChat);
chatInput.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendChat(); } });
$('#clearChat').addEventListener('click', () => { chatHistory.length = 0; chatMessages.innerHTML = '<div class="message ai">مرحبًا! أنا مساعدك الدراسي في IT. كيف يمكنني مساعدتك؟<small>الآن</small></div>'; });
