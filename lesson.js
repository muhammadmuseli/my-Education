const demos = {
  javascript:['أساسيات JavaScript','JavaScript','تعرف على المتغيرات والدوال والتعامل مع عناصر صفحة الويب.','المتغيرات وأنواع البيانات|الدوال والمعاملات|DOM والأحداث','const welcome = (name) => `Hello ${name}`;\nconsole.log(welcome("Student"));'],
  network:['مقدمة في شبكات الحاسوب','الشبكات','نظرة منظمة إلى طريقة اتصال الأجهزة وتبادل البيانات عبر الإنترنت.','عنوان IP وDNS|طبقات TCP/IP|الفرق بين LAN وWAN','Browser → DNS → Server\n         ← TCP/IP ←'],
  python:['البرمجة كائنية التوجه','Python','استخدم الأصناف والكائنات لتنظيم الكود وإعادة استخدامه.','class و object|الدالة __init__|الوراثة والتغليف','class Student:\n  def __init__(self, name):\n    self.name = name'],
  html:['HTML و CSS للمبتدئين','تطوير الويب','ابنِ هيكل الصفحة ثم نسّقه بأسلوب CSS.','العناصر الدلالية|Flexbox|التصميم المتجاوب','<main class="page">Hello</main>'],
  database:['مبادئ قواعد البيانات','SQL','تعلم كيفية تخزين البيانات واسترجاعها بطريقة منظمة.','الجداول والمفاتيح|SELECT و WHERE|العلاقات','SELECT name FROM students WHERE active = 1;'],
  linux:['أوامر Linux الأساسية','Linux','أوامر عملية للتنقل بين الملفات وإدارة بيئة التطوير.','cd و ls|الملفات والصلاحيات|Terminal','ls -la\ncd projects\npwd'],
  security:['أساسيات الأمن السيبراني','الأمن','مبادئ لحماية الحسابات والأنظمة والبيانات.','كلمات المرور|التصيد|التحديثات الأمنية','Never share API keys in public repositories.'],
  git:['Git و GitHub','أدوات المطور','تعقب التغييرات في المشروع والعمل مع الفروع.','commit|branch|pull request','git add .\ngit commit -m "feature"'],
  api:['فهم REST API','تطوير الويب','تعلم كيف تتواصل التطبيقات مع الخوادم عبر HTTP.','GET و POST|JSON|أكواد الحالة','fetch("/api/lessons").then(r => r.json())'],
  algorithm:['الخوارزميات وهياكل البيانات','البرمجة','اختر بنية البيانات والخوارزمية المناسبة لحل المشكلة.','Arrays|Stacks|تعقيد الوقت','O(n) means the work grows linearly with input size.'],
  cloud:['مقدمة في الحوسبة السحابية','Cloud','تشغيل الخدمات والبيانات عبر بنية تحتية على الإنترنت.','IaaS و PaaS|التوسع|النشر','App → Cloud service → Database'],
  java:['أساسيات Java','Java','ابدأ بكتابة برامج Java وفهم بنيتها الأساسية.','المتغيرات|الدوال|الأصناف','public class Main {\n  public static void main(String[] args) {}\n}']
};
const main = document.querySelector('#lessonContent');
const params = new URLSearchParams(location.search);
const id = params.get('id');
const aiBase = location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? 'http://127.0.0.1:3000/api' : '/.netlify/functions';
let openedFile = null;
const lessonExtras = {
  javascript:{icon:'{ }',goal:'إنشاء صفحة ويب تتفاعل مع المستخدم عند النقر والكتابة.',example:'جرّب إنشاء زر يغير رسالة الترحيب عند النقر.',exercise:'اكتب دالة تستقبل رقمين ثم تعرض مجموعهما في الصفحة.'},
  network:{icon:'⌁',goal:'فهم رحلة البيانات من جهازك إلى الموقع الذي تزوره.',example:'عند كتابة اسم موقع، يقوم DNS بتحويل الاسم إلى عنوان IP ثم يبدأ الاتصال.',exercise:'ارسم شبكة منزلية تتضمن Router وحاسوبًا وهاتفًا وخادم DNS.'},
  python:{icon:'⌘',goal:'تنظيم برنامجك باستخدام أصناف تمثل أشياء حقيقية.',example:'يمكن أن يمثل class باسم Student طالبًا يملك الاسم والعمر والدورات.',exercise:'أنشئ class باسم Book مع عنوان ومؤلف ودالة لعرض البيانات.'},
  html:{icon:'</>',goal:'بناء صفحة منظمة ثم جعلها جميلة وسهلة الاستخدام.',example:'استخدم main للمحتوى الرئيسي وsection لمجموعة معلومات مترابطة.',exercise:'صمم بطاقة تعريف عن نفسك تحتوي عنوانًا وزرًا وصورة.'},
  database:{icon:'▦',goal:'تخزين البيانات والبحث فيها بدون تكرار أو فوضى.',example:'جدول students يحفظ الاسم والبريد، ولكل طالب رقم فريد.',exercise:'اكتب استعلامًا يعرض الطلاب النشطين مرتبين حسب الاسم.'},
  linux:{icon:'>_',goal:'استخدام الطرفية للتنقل بين الملفات وتشغيل أدوات التطوير.',example:'الأمر pwd يعرض مكانك الحالي، بينما ls يعرض الملفات حولك.',exercise:'أنشئ مجلدًا باسم project ثم ملفًا نصيًا بداخله من الطرفية.'},
  security:{icon:'⌑',goal:'تقليل المخاطر وحماية الحسابات والبيانات.',example:'المصادقة الثنائية تضيف طبقة حماية حتى عند تسريب كلمة المرور.',exercise:'حلل رسالة بريد مشبوهة واكتب ثلاث علامات تدل على التصيد.'},
  git:{icon:'⑂',goal:'حفظ تاريخ المشروع والعمل بأمان مع التغييرات.',example:'كل commit هو نقطة حفظ تحمل وصفًا واضحًا لما تغير.',exercise:'أنشئ فرعًا لميزة جديدة ثم ادمجه بعد اختبار التغييرات.'},
  api:{icon:'⇄',goal:'فهم تبادل البيانات بين الواجهة والخادم.',example:'GET يجلب البيانات وPOST يرسل بيانات جديدة إلى الخادم.',exercise:'صمم طلب JSON لإضافة درس جديد إلى API افتراضي.'},
  algorithm:{icon:'◫',goal:'اختيار خطوات فعالة لحل مشكلة برمجية.',example:'البحث الخطي يفحص العناصر واحدًا تلو الآخر حتى يجد القيمة.',exercise:'اكتب خوارزمية تبحث عن أكبر رقم في قائمة.'},
  cloud:{icon:'☁',goal:'تشغيل التطبيق والبيانات على خدمات متاحة عبر الإنترنت.',example:'يمكن لتطبيقك استخدام خادم افتراضي وقاعدة بيانات مُدارة في السحابة.',exercise:'اختر خدمة مناسبة لتطبيق صور واشرح أين ستخزن الملفات والبيانات.'},
  java:{icon:'☕',goal:'بناء برامج منظمة باستخدام الأصناف والدوال في Java.',example:'تبدأ البرامج غالبًا من الدالة main داخل class.',exercise:'اكتب برنامجًا يطبع اسمك ثم ينفذ عملية جمع بسيطة.'}
};
function demoLesson(data) {
  const [title, subject, description, topics, code] = data; const extra = lessonExtras[id]; const list = topics.split('|'); document.title = `${title} | أُفُق`;
  main.innerHTML = `<section class="lesson-header"><p class="eyebrow">${subject} · درس تقني</p><h1>${title}</h1><p>${description}</p><div class="lesson-tags"><span>⏱ 15 دقيقة</span><span>◎ مستوى مبتدئ</span><span>✓ درس تفاعلي</span></div></section><section class="tech-visual"><div class="visual-orb">${extra.icon}</div><div class="visual-flow"><span>${list[0]}</span><b>←</b><span>${list[1] || 'تطبيق عملي'}</span><b>←</b><span>${list[2] || 'نتيجة'}</span></div><p>خريطة مبسطة تساعدك على ربط مفاهيم الدرس.</p></section><article class="content-card demo-content"><section class="lesson-block"><p class="block-label">01 · الفكرة الأساسية</p><h2>ماذا ستتعلم؟</h2><p>${extra.goal}</p><ul>${list.map(t => `<li>${t}</li>`).join('')}</ul></section><section class="lesson-block explanation"><p class="block-label">02 · الشرح</p><h2>كيف نفهمها ببساطة؟</h2><p>${description} ابدأ بالمفهوم الأول، ثم اربطه بموقف واقعي قبل كتابة أي كود. بهذه الطريقة لا تحفظ المصطلح فقط، بل تفهم سبب استخدامه داخل المشروع.</p><div class="callout"><b>مثال واقعي</b><p>${extra.example}</p></div></section><section class="lesson-block"><p class="block-label">03 · مثال عملي</p><h2>اقرأ المثال</h2><p>افتح محرر الأكواد، انسخ المثال التالي، ثم بدّل قيمة واحدة واختبر النتيجة.</p><code>${code}</code></section><section class="lesson-block practice"><p class="block-label">04 · تمرين</p><h2>طبّق بنفسك</h2><p>${extra.exercise}</p><button class="complete-btn" onclick="this.textContent='✓ تم وضع علامة كمكتمل';this.classList.add('done')">وضع علامة «مكتمل»</button></section></article>`;
}
function openDbFile() {
  if (!('indexedDB' in window)) return showMissing('متصفحك لا يدعم حفظ الملفات محليًا. شغّل الموقع بواسطة Live Server.');
  const request = indexedDB.open('ofuqLessons', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
  request.onsuccess = () => {
    const read = request.result.transaction('files','readonly').objectStore('files').get(id);
    read.onsuccess = () => renderFile(read.result); read.onerror = () => showMissing();
  };
  request.onerror = () => showMissing('تعذر الوصول إلى مكتبة الملفات. افتح الموقع عبر Live Server.');
  request.onblocked = () => showMissing('أغلق النوافذ الأخرى للموقع ثم حاول مجددًا.');
}
function renderFile(file) {
  if (!file) return showMissing(); openedFile = file; document.title = `${file.name} | أُفُق`;
  const url = URL.createObjectURL(file.blob); const isPdf = file.type === 'application/pdf'; const isImage = file.type.startsWith('image/');
  const viewer = isPdf ? `<iframe class="pdf-viewer" src="${url}" title="${file.name}"></iframe>` : isImage ? `<img class="image-viewer" src="${url}" alt="${file.name}">` : `<pre class="text-viewer"></pre>`;
  main.innerHTML = `<section class="lesson-header"><p class="eyebrow">ملفك المرفوع</p><h1>${file.name}</h1><p>يمكنك مشاهدة الملف هنا بصيغته الأصلية.</p></section><section class="file-ai-tools"><div><span>✦</span><div><b>مساعد الدرس</b><p>حلّل الملف المفتوح مباشرةً باستخدام Gemini.</p></div></div><div class="file-ai-buttons"><button data-file-action="summary">تلخيص الدرس</button><button data-file-action="explain">شرح مبسّط</button></div></section><article class="content-card">${viewer}</article><section id="fileAiResult" class="file-ai-result" hidden></section>`;
  if (!isPdf && !isImage) main.querySelector('pre').textContent = 'ملف نصي محفوظ في المكتبة.';
  main.querySelectorAll('[data-file-action]').forEach(button => button.addEventListener('click', () => analyzeOpenedFile(button.dataset.fileAction)));
}
async function analyzeOpenedFile(mode) {
  if (!openedFile) return;
  const result = document.querySelector('#fileAiResult'); result.hidden = false; result.textContent = mode === 'summary' ? '✦ جارٍ تلخيص الدرس…' : '✦ جارٍ شرح الدرس…';
  const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(openedFile.blob); });
  const personal = localStorage.getItem('ofuqCustomPrompt') || '';
  const task = mode === 'summary' ? 'لخّص هذا الدرس بالعربية: عنوان، نقاط أساسية، مصطلحات مهمة، وخلاصة للمراجعة.' : 'اشرح هذا الدرس بالعربية البسيطة لطالب IT، على مراحل، مع مثال عملي وتمرين قصير.';
  try {
    const response = await fetch(`${aiBase}/gemini`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: `${personal}\n\n${task}`, parts:[{ inline_data:{ mime_type: openedFile.type, data: dataUrl.split(',')[1] } }] }) });
    const raw = await response.text(); let data;
    try { data = JSON.parse(raw); } catch { throw new Error('وظيفة الذكاء الاصطناعي لم تُنشر. استخدم GitHub أو Netlify CLI للنشر.'); }
    if (!response.ok) throw new Error(data.error || 'تعذر الاتصال بسيرفر الذكاء الاصطناعي');
    result.textContent = data.text || 'لم تصل إجابة. حاول مرة أخرى.';
  } catch (error) { result.textContent = `تعذّر التحليل: ${error.message}. تأكد من تشغيل start-server.bat.`; }
}
function showMissing(message = 'لم نعثر على هذا الدرس. افتحه من مكتبتك مرة أخرى.'){ main.innerHTML = `<div class="loading">${message}<br><br><a href="index.html">العودة إلى مكتبتي ←</a></div>`; }
if (!id) showMissing('هذه نافذة عرض الدرس. افتح درسًا من مكتبتك أولًا.');
else if (params.get('demo') === '1' && demos[id]) demoLesson(demos[id]);
else openDbFile();
