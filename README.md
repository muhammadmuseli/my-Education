# Ofoq (my-Education) — AI-Powered Technical Study & Document Analysis Platform

An interactive full-stack web application designed for IT students and software engineering learners to upload study materials (`PDF`, `Images`, `TXT`), store them locally via **IndexedDB**, and generate structured summaries, step-by-step technical explanations, translations, and interactive study plans powered by the **Google Gemini API**.

---

## Architecture & Tech Stack

- **Frontend:** Vanilla JavaScript (`app.js`, `lesson.js`), Semantic HTML5 (`index.html`, `lesson.html`), and Modular CSS (`style.css`, `lesson.css`) with client-side **IndexedDB** persistence and DOM **XSS sanitization**.
- **Backend / Serverless:** Zero-dependency Node.js HTTP server (`server.js`) and Serverless Netlify Functions (`netlify/functions/gemini.js`, `netlify/functions/health.js`) configured via `netlify.toml`.
- **AI Integration & Resilience:** Google Gemini API (`gemini-3.8-flash` primary model) featuring automated **exponential backoff retry logic** and **multi-model fallback** (`gemini-3.8-flash-lite`, `gemini-3.8-pro`, `gemini-2.0-flash`) to handle `503 High Demand` and rate-limit spikes gracefully.

---

## Key Features

- **Multimodal Document Analysis:** Accepts PDF documents, technical diagrams/images, and raw text for contextual summarization, simplified step-by-step explanations, and bilingual translation (English / Arabic).
- **Resilient Dual-Runtime Backend:** Seamlessly switches between a local Node.js development server (`http://127.0.0.1:3000/api`) and cloud-deployed Netlify Functions (`/.netlify/functions`).
- **Offline-Ready Lesson Library:** Uses browser **IndexedDB** storage to persist uploaded study files alongside 12 built-in interactive IT & Software Engineering modules (JavaScript, Python OOP, Networking, SQL, Linux, Git, REST APIs, Algorithms, Cloud, Cybersecurity, Java, HTML/CSS).
- **Interactive AI Study Assistant:** Includes a context-aware IT tutor chat interface and a topic-based study roadmap generator.

---

## Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/muhammadmuseli/my-Education.git](https://github.com/muhammadmuseli/my-Education.git)
   cd my-Education
