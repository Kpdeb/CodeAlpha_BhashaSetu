const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Helper functions to promisify database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // 'this' contains lastID and changes
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize SQLite table
async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_text TEXT NOT NULL,
      translated_text TEXT NOT NULL,
      source_lang TEXT NOT NULL,
      target_lang TEXT NOT NULL,
      engine TEXT NOT NULL,
      is_starred INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await dbRun(createTableQuery);
    console.log('Translations table initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database table:', error.message);
  }
}

// ------------------------------------
// API ROUTES
// ------------------------------------

// 1. Get Configuration Status
app.get('/api/config', (req, res) => {
  res.json({
    sarvamKeyConfigured: !!process.env.SARVAM_API_KEY,
    libreTranslateUrl: process.env.LIBRETRANSLATE_URL || 'https://translate.argosopentech.com/translate'
  });
});

// 2. Perform Translation & Save to Database
app.post('/api/translate', async (req, res) => {
  const { text, sourceLang, targetLang, engine } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Text and targetLang are required.' });
  }

  const selectedEngine = engine || 'mymemory';
  let translatedText = '';
  let finalSourceLang = sourceLang || 'auto';

  try {
    if (selectedEngine === 'sarvam') {
      // Sarvam AI Integration
      const apiKey = process.env.SARVAM_API_KEY || req.headers['x-sarvam-api-key'];
      if (!apiKey) {
        return res.status(400).json({ 
          error: 'Sarvam AI subscription key is missing. Please set it in .env or settings.' 
        });
      }

      // Map "auto" to "auto" and languages to standard Sarvam codes (like hi-IN, en-IN)
      // If code doesn't have a region extension, assume regional or add it.
      let sarvamSource = finalSourceLang;
      if (sarvamSource === 'en') sarvamSource = 'en-IN';
      else if (sarvamSource !== 'auto' && !sarvamSource.includes('-')) {
        sarvamSource = `${sarvamSource}-IN`;
      }

      let sarvamTarget = targetLang;
      if (sarvamTarget === 'en') sarvamTarget = 'en-IN';
      else if (!sarvamTarget.includes('-')) {
        sarvamTarget = `${sarvamTarget}-IN`;
      }

      const response = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text,
          source_language_code: sarvamSource,
          target_language_code: sarvamTarget
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Sarvam AI API responded with ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      translatedText = data.translated_text;

    } else if (selectedEngine === 'libretranslate') {
      // LibreTranslate Integration
      const url = process.env.LIBRETRANSLATE_URL || 'https://translate.argosopentech.com/translate';
      
      // Clean up language codes for LibreTranslate (usually expects 2-char code)
      const libreSource = finalSourceLang === 'auto' ? 'auto' : finalSourceLang.split('-')[0];
      const libreTarget = targetLang.split('-')[0];

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: libreSource,
          target: libreTarget,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate API responded with status ${response.status}`);
      }

      const data = await response.json();
      translatedText = data.translatedText;

    } else {
      // Default: MyMemory Integration (Fallback)
      // MyMemory expects 'source|target' (e.g. 'en|es' or 'autodetect|hi')
      const myMemorySource = finalSourceLang === 'auto' ? 'autodetect' : finalSourceLang.split('-')[0];
      const myMemoryTarget = targetLang.split('-')[0];
      const langPair = `${myMemorySource}|${myMemoryTarget}`;

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`MyMemory API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.responseStatus !== 200) {
        throw new Error(`MyMemory Error: ${data.responseDetails || 'Translation failed'}`);
      }
      translatedText = data.responseData.translatedText;
      
      // Detect language if it was autodetect
      if (finalSourceLang === 'auto' && data.matches && data.matches.length > 0) {
        // MyMemory sometimes returns detected language in match nodes
        const detected = data.matches[0].segment; // or just keep it auto
      }
    }

    // Save translation to SQLite Database
    const insertQuery = `
      INSERT INTO translations (source_text, translated_text, source_lang, target_lang, engine)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await dbRun(insertQuery, [text, translatedText, finalSourceLang, targetLang, selectedEngine]);

    res.json({
      id: result.lastID,
      sourceText: text,
      translatedText,
      sourceLang: finalSourceLang,
      targetLang,
      engine: selectedEngine,
      isStarred: 0,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: error.message || 'Translation failed. Please check network/keys.' });
  }
});

// 3. Get Recent History
app.get('/api/history', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM translations ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Toggle Favorite / Star status
app.post('/api/history/star', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Translation record ID is required.' });
  }
  try {
    const checkRow = await dbGet('SELECT is_starred FROM translations WHERE id = ?', [id]);
    if (!checkRow) {
      return res.status(404).json({ error: 'Record not found.' });
    }
    
    const newStarValue = checkRow.is_starred === 1 ? 0 : 1;
    await dbRun('UPDATE translations SET is_starred = ? WHERE id = ?', [newStarValue, id]);
    res.json({ id, isStarred: newStarValue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Delete specific history record
app.delete('/api/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM translations WHERE id = ?', [id]);
    res.json({ success: true, message: `Record ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Clear entire history
app.delete('/api/history', async (req, res) => {
  try {
    await dbRun('DELETE FROM translations');
    res.json({ success: true, message: 'All history cleared.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Translation Server running on http://localhost:${PORT}`);
  console.log(`==================================================`);
});
