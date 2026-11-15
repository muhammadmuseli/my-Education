# my-Education — AI-Powered PDF Study & Explanation Platform

An interactive full-stack web application that allows students and learners to upload PDF study materials and receive structured, AI-generated explanations powered by the Google Gemini API.

## Architecture & Tech Stack
- **Frontend:** Vanilla JavaScript (`app.js`, `lesson.js`), HTML5 (`index.html`, `lesson.html`), and modular CSS (`style.css`, `lesson.css`).
- **Backend / Serverless:** Node.js (`server.js`) and Netlify Functions (`netlify/functions`) configured via `netlify.toml`.
- **AI Integration:** Google Gemini API for document parsing, contextual summarization, and interactive lesson generation.

## Key Features
- **PDF Document Upload & Parsing:** Extracts content from uploaded educational PDFs for structured processing.
- **AI Lesson Generation:** Uses Gemini API endpoints via serverless functions to break down complex topics into clear explanations.
- **Dual Execution Mode:** Supports both local Node.js server execution (`start-server.bat` / `node server.js`) and serverless cloud deployment on Netlify.

## Local Setup & Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/muhammadmuseli/my-Education.git](https://github.com/muhammadmuseli/my-Education.git)
   cd my-Education
