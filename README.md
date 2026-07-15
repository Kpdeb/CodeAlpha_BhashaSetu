# BhashaSetu AI — Language Translation Tool

BhashaSetu AI (Connecting India through Language) is a full-stack web application designed for seamless translation across global and **22 official Indian regional languages** (Hindi, Tamil, Telugu, Marathi, Bengali, Kannada, Malayalam, Gujarati, Punjabi, Urdu, Sanskrit, and more). It provides a premium, responsive glassmorphic user interface featuring multi-engine translation proxies, text-to-speech, voice dictation, and persistent SQLite search history logs.

---

## 🚀 Live Demo

You can access the live deployed application here:
**👉 [Live Translation App (Render Demo)](https://codealpha-bhashasetu.onrender.com) 👈**

*(Note: Replace `PASTE_YOUR_RENDER_URL_HERE` with your actual Render deployment link, e.g. `https://codealpha-bhashasetu.onrender.com`)*

---

## ✨ Features

- **🌐 Indian & Global Languages:** Full support for the 22 scheduled languages of India and popular international languages.
- **🧠 Advanced AI Engine Integration:**
  - **Sarvam AI (Indic LLM):** Tailor-made for regional Indian translation accuracy.
  - **MyMemory API:** Accessible immediately with zero setup.
  - **LibreTranslate:** Open-source translation engine.
- **🎙️ Speech-to-Text (Voice Dictation):** Speak to input text using the browser's native Speech Recognition.
- **🔊 Text-to-Speech (Read Aloud):** Play back translations using the browser's Speech Synthesis.
- **📂 SQLite Persistent History:** Log all queries into a local SQLite database (`database.sqlite`). You can star favorites or reuse past translations.
- **🌗 Ambient Theming:** Interactive theme toggle supporting glassmorphic Dark Mode (default) and Light Mode.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5 (semantic layout), Vanilla CSS (glassmorphic styling, custom scrollbars, animations), Vanilla JavaScript.
- **Backend:** Node.js, Express framework.
- **Database:** SQLite (`sqlite3` module).
- **APIs:** Sarvam AI API, MyMemory API, Web Speech APIs (Synthesis & Recognition).

---

## 💻 Local Setup & Installation

Follow these steps to run the project locally on your machine:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Kpdeb/CodeAlpha_BhashaSetu.git
   cd CodeAlpha_BhashaSetu
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   PORT=3000
   SARVAM_API_KEY=your_sarvam_api_key_here
   LIBRETRANSLATE_URL=https://translate.argosopentech.com/translate
   ```

4. **Start the Application:**
   ```bash
   npm start
   ```
   Open your browser and navigate to `http://localhost:3000`.
