// ==========================================================================
// LANGUAGE DEFINITIONS & CODES
// ==========================================================================
const languages = [
  // Special
  { code: 'auto', name: 'Auto Detect', regionalName: 'Auto Detect', isIndian: false },
  
  // Official 22 Indian Languages + English (India)
  { code: 'en-IN', name: 'English (India)', regionalName: 'English (India)', isIndian: true },
  { code: 'hi-IN', name: 'Hindi', regionalName: 'हिन्दी', isIndian: true },
  { code: 'ta-IN', name: 'Tamil', regionalName: 'தமிழ்', isIndian: true },
  { code: 'te-IN', name: 'Telugu', regionalName: 'తెలుగు', isIndian: true },
  { code: 'mr-IN', name: 'Marathi', regionalName: 'मराठी', isIndian: true },
  { code: 'bn-IN', name: 'Bengali', regionalName: 'বাংলা', isIndian: true },
  { code: 'kn-IN', name: 'Kannada', regionalName: 'ಕನ್ನಡ', isIndian: true },
  { code: 'ml-IN', name: 'Malayalam', regionalName: 'മലയാളം', isIndian: true },
  { code: 'gu-IN', name: 'Gujarati', regionalName: 'ગુજરાતી', isIndian: true },
  { code: 'pa-IN', name: 'Punjabi', regionalName: 'ਪੰਜਾਬੀ', isIndian: true },
  { code: 'ur-IN', name: 'Urdu', regionalName: 'اردو', isIndian: true },
  { code: 'or-IN', name: 'Odia', regionalName: 'ଓଡ଼ିଆ', isIndian: true },
  { code: 'as-IN', name: 'Assamese', regionalName: 'অসমীয়া', isIndian: true },
  { code: 'sa-IN', name: 'Sanskrit', regionalName: 'संस्कृतम्', isIndian: true },
  { code: 'kok-IN', name: 'Konkani', regionalName: 'कोंकणी', isIndian: true },
  { code: 'ne-IN', name: 'Nepali', regionalName: 'नेपाली', isIndian: true },
  { code: 'sd-IN', name: 'Sindhi', regionalName: 'سنڌي', isIndian: true },
  { code: 'ks-IN', name: 'Kashmiri', regionalName: 'कश्मीरी', isIndian: true },
  { code: 'mai-IN', name: 'Maithili', regionalName: 'मैथिली', isIndian: true },
  { code: 'doi-IN', name: 'Dogri', regionalName: 'डोगरी', isIndian: true },
  { code: 'brx-IN', name: 'Bodo', regionalName: 'बड़ो', isIndian: true },
  { code: 'sat-IN', name: 'Santali', regionalName: 'संताली', isIndian: true },
  { code: 'mni-IN', name: 'Manipuri', regionalName: 'মণিপুরী', isIndian: true },
  
  // Popular Global Languages
  { code: 'es', name: 'Spanish', regionalName: 'Español', isIndian: false },
  { code: 'fr', name: 'French', regionalName: 'Français', isIndian: false },
  { code: 'de', name: 'German', regionalName: 'Deutsch', isIndian: false },
  { code: 'ja', name: 'Japanese', regionalName: '日本語', isIndian: false },
  { code: 'zh', name: 'Chinese (Simplified)', regionalName: '简体中文', isIndian: false },
  { code: 'ar', name: 'Arabic', regionalName: 'العربية', isIndian: false },
  { code: 'ru', name: 'Russian', regionalName: 'Русский', isIndian: false },
  { code: 'pt', name: 'Portuguese', regionalName: 'Português', isIndian: false }
];

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
let srcLangCode = 'auto';
let tgtLangCode = 'hi-IN';
let selectedEngine = 'sarvam';
let isAutoTranslateEnabled = true;
let currentTab = 'history'; // 'history' or 'favorites'
let debounceTimer;
let recognition = null;
let isRecording = false;

// ==========================================================================
// DOM SELECTORS
// ==========================================================================
const sourceText = document.getElementById('source-text');
const targetText = document.getElementById('target-text');
const charCurrent = document.getElementById('char-current');
const engineSelect = document.getElementById('engine-select');
const currentEngineBadge = document.getElementById('current-engine-badge');

// Dropdowns
const srcLangBtn = document.getElementById('src-lang-btn');
const srcLangLabel = document.getElementById('src-lang-label');
const srcLangDropdown = document.getElementById('src-lang-dropdown');
const srcLangSearch = document.getElementById('src-lang-search');
const srcLangOptions = document.getElementById('src-lang-options');

const tgtLangBtn = document.getElementById('tgt-lang-btn');
const tgtLangLabel = document.getElementById('tgt-lang-label');
const tgtLangDropdown = document.getElementById('tgt-lang-dropdown');
const tgtLangSearch = document.getElementById('tgt-lang-search');
const tgtLangOptions = document.getElementById('tgt-lang-options');

// Action Buttons
const clearTextBtn = document.getElementById('clear-text-btn');
const speechInBtn = document.getElementById('speech-in-btn');
const speechOutSrcBtn = document.getElementById('speech-out-src-btn');
const speechOutTgtBtn = document.getElementById('speech-out-tgt-btn');
const copyBtn = document.getElementById('copy-btn');
const manualTranslateBtn = document.getElementById('manual-translate-btn');
const swapLangsBtn = document.getElementById('swap-langs-btn');
const themeToggle = document.getElementById('theme-toggle');

// Database Logs
const tabHistory = document.getElementById('tab-history');
const tabFavorites = document.getElementById('tab-favorites');
const clearLogsBtn = document.getElementById('clear-logs-btn');
const logsContainer = document.getElementById('logs-container');

// Settings Modal
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const sarvamApiKeyInput = document.getElementById('sarvam-api-key-input');
const toggleKeyVisibility = document.getElementById('toggle-key-visibility');
const sarvamStatusMsg = document.getElementById('sarvam-status-msg');
const libretranslateUrlInput = document.getElementById('libretranslate-url-input');
const autotranslateToggle = document.getElementById('autotranslate-toggle');

const translationLoader = document.getElementById('translation-loader');
const toastContainer = document.getElementById('toast-container');

// ==========================================================================
// APPLICATION INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
  populateDropdowns();
  updateUIState();
  initSpeechRecognition();
  loadLogs();
  
  // Set default theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
});

// Load Settings from LocalStorage
function loadSavedSettings() {
  const sarvamKey = localStorage.getItem('sarvam_api_key') || '';
  sarvamApiKeyInput.value = sarvamKey;
  
  const customLTUrl = localStorage.getItem('libretranslate_url') || 'https://translate.argosopentech.com/translate';
  libretranslateUrlInput.value = customLTUrl;

  const autoTrans = localStorage.getItem('autotranslate') !== 'false';
  autotranslateToggle.checked = autoTrans;
  isAutoTranslateEnabled = autoTrans;

  const storedEngine = localStorage.getItem('engine') || 'sarvam';
  selectedEngine = storedEngine;
  engineSelect.value = storedEngine;

  updateKeyStatusText(sarvamKey);
}

function updateKeyStatusText(key) {
  if (key) {
    sarvamStatusMsg.textContent = 'Key configured (Saved securely locally)';
    sarvamStatusMsg.className = 'status-indicator-key configured';
  } else {
    sarvamStatusMsg.textContent = 'No subscription key saved. Enter key to enable Sarvam engine.';
    sarvamStatusMsg.className = 'status-indicator-key not-configured';
  }
}

// Populate language options into dropdown custom elements
function populateDropdowns() {
  srcLangOptions.innerHTML = '';
  tgtLangOptions.innerHTML = '';

  // Source list contains "Auto Detect", Target does not.
  languages.forEach(lang => {
    // Add to Source options
    const srcOpt = createOptionElement(lang, 'source');
    srcLangOptions.appendChild(srcOpt);

    // Add to Target options (skip 'auto')
    if (lang.code !== 'auto') {
      const tgtOpt = createOptionElement(lang, 'target');
      tgtLangOptions.appendChild(tgtOpt);
    }
  });

  // Set initial labels
  updateLangButtonLabel('source', srcLangCode);
  updateLangButtonLabel('target', tgtLangCode);
}

function createOptionElement(lang, type) {
  const btn = document.createElement('button');
  btn.className = 'lang-option';
  btn.setAttribute('data-code', lang.code);
  
  const nameSpan = document.createElement('span');
  nameSpan.textContent = `${lang.name} (${lang.regionalName})`;
  
  const codeSpan = document.createElement('span');
  codeSpan.className = 'lang-code';
  codeSpan.textContent = lang.code.split('-')[0];

  btn.appendChild(nameSpan);
  btn.appendChild(codeSpan);

  // Mark selected state
  const currentSelected = type === 'source' ? srcLangCode : tgtLangCode;
  if (lang.code === currentSelected) {
    btn.classList.add('selected');
  }

  btn.addEventListener('click', () => {
    selectLanguage(type, lang.code);
  });

  return btn;
}

// Select a language from custom dropdowns
function selectLanguage(type, code) {
  if (type === 'source') {
    srcLangCode = code;
    updateLangButtonLabel('source', code);
    srcLangDropdown.classList.add('hidden');
    highlightActiveOption('source', code);
    
    // Enable/disable TTS for source depending on selection
    speechOutSrcBtn.disabled = (code === 'auto' || !sourceText.value.trim());
  } else {
    // Target cannot be auto detect
    if (code === 'auto') return;
    tgtLangCode = code;
    updateLangButtonLabel('target', code);
    tgtLangDropdown.classList.add('hidden');
    highlightActiveOption('target', code);
  }

  // Trigger translation if content exists
  if (sourceText.value.trim()) {
    triggerTranslation();
  }
}

function updateLangButtonLabel(type, code) {
  const langObj = languages.find(l => l.code === code);
  const text = langObj ? `${langObj.name} (${langObj.regionalName})` : 'Select Language';
  if (type === 'source') {
    srcLangLabel.textContent = text;
  } else {
    tgtLangLabel.textContent = text;
  }
}

function highlightActiveOption(type, code) {
  const container = type === 'source' ? srcLangOptions : tgtLangOptions;
  container.querySelectorAll('.lang-option').forEach(btn => {
    if (btn.getAttribute('data-code') === code) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

// Update components based on active selection and loaded environment
function updateUIState() {
  currentEngineBadge.textContent = engineSelect.options[engineSelect.selectedIndex].text.split(' ')[0];
  
  // Toggle Translate Hint/Button
  if (isAutoTranslateEnabled) {
    manualTranslateBtn.style.display = 'none';
  } else {
    manualTranslateBtn.style.display = 'flex';
  }
}

// ==========================================================================
// INTERACTIVE EVENT HANDLERS
// ==========================================================================

// Custom dropdown search filtering
srcLangSearch.addEventListener('input', (e) => filterLanguages('source', e.target.value));
tgtLangSearch.addEventListener('input', (e) => filterLanguages('target', e.target.value));

function filterLanguages(type, query) {
  const container = type === 'source' ? srcLangOptions : tgtLangOptions;
  const normalizedQuery = query.toLowerCase().trim();
  
  const options = container.querySelectorAll('.lang-option');
  options.forEach(opt => {
    const text = opt.textContent.toLowerCase();
    if (text.includes(normalizedQuery)) {
      opt.style.display = 'flex';
    } else {
      opt.style.display = 'none';
    }
  });
}

// Dropdown toggles
srcLangBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  srcLangDropdown.classList.toggle('hidden');
  tgtLangDropdown.classList.add('hidden');
  srcLangSearch.value = '';
  filterLanguages('source', '');
  srcLangSearch.focus();
});

tgtLangBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  tgtLangDropdown.classList.toggle('hidden');
  srcLangDropdown.classList.add('hidden');
  tgtLangSearch.value = '';
  filterLanguages('target', '');
  tgtLangSearch.focus();
});

// Close dropdowns on outside clicks
document.addEventListener('click', () => {
  srcLangDropdown.classList.add('hidden');
  tgtLangDropdown.classList.add('hidden');
});

// Prevent dropdown clicks from closing themselves
srcLangDropdown.addEventListener('click', (e) => e.stopPropagation());
tgtLangDropdown.addEventListener('click', (e) => e.stopPropagation());

// Engine switch handler
engineSelect.addEventListener('change', (e) => {
  selectedEngine = e.target.value;
  localStorage.setItem('engine', selectedEngine);
  updateUIState();
  
  if (sourceText.value.trim()) {
    triggerTranslation();
  }
});

// Swap Languages handler
swapLangsBtn.addEventListener('click', () => {
  // If source is auto, we can't swap because target cannot be auto.
  if (srcLangCode === 'auto') {
    showToast('Cannot swap: Select a specific source language first.', 'error');
    return;
  }

  // Swap codes
  const tempCode = srcLangCode;
  srcLangCode = tgtLangCode;
  tgtLangCode = tempCode;

  // Swap Textareas
  const tempText = sourceText.value;
  sourceText.value = targetText.value;
  targetText.value = tempText;

  // Update UI Selectors
  updateLangButtonLabel('source', srcLangCode);
  updateLangButtonLabel('target', tgtLangCode);
  highlightActiveOption('source', srcLangCode);
  highlightActiveOption('target', tgtLangCode);

  // Trigger re-translation
  if (sourceText.value.trim()) {
    triggerTranslation();
  } else {
    targetText.value = '';
  }
  updateCharCounter();
});

// Source Textarea changes
sourceText.addEventListener('input', () => {
  updateCharCounter();
  
  if (sourceText.value.trim() === '') {
    targetText.value = '';
    clearTextBtn.classList.add('hidden');
    speechOutSrcBtn.disabled = true;
    speechOutTgtBtn.disabled = true;
    copyBtn.disabled = true;
  } else {
    clearTextBtn.classList.remove('hidden');
    speechOutSrcBtn.disabled = (srcLangCode === 'auto');
    
    // Auto translation debounce trigger
    if (isAutoTranslateEnabled) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performTranslation, 600);
    }
  }
});

// Manual translation key shortcut
sourceText.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    performTranslation();
  }
});

// Manual button triggers
manualTranslateBtn.addEventListener('click', performTranslation);

// Clear button logic
clearTextBtn.addEventListener('click', () => {
  sourceText.value = '';
  targetText.value = '';
  updateCharCounter();
  clearTextBtn.classList.add('hidden');
  speechOutSrcBtn.disabled = true;
  speechOutTgtBtn.disabled = true;
  copyBtn.disabled = true;
  sourceText.focus();
});

function updateCharCounter() {
  const currentLength = sourceText.value.length;
  charCurrent.textContent = currentLength;
  if (currentLength > 2000) {
    charCurrent.style.color = 'var(--accent-danger)';
  } else {
    charCurrent.style.color = 'var(--text-muted)';
  }
}

// Copy translated output to clipboard
copyBtn.addEventListener('click', () => {
  if (!targetText.value) return;
  
  navigator.clipboard.writeText(targetText.value).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Copy failure:', err);
    showToast('Failed to copy text.', 'error');
  });
});

// Theme switches
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
}

// Modal open/closes
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// Save settings handler
saveSettingsBtn.addEventListener('click', () => {
  const key = sarvamApiKeyInput.value.trim();
  const url = libretranslateUrlInput.value.trim();
  const autoTrans = autotranslateToggle.checked;

  localStorage.setItem('sarvam_api_key', key);
  localStorage.setItem('libretranslate_url', url);
  localStorage.setItem('autotranslate', autoTrans);
  
  isAutoTranslateEnabled = autoTrans;

  updateKeyStatusText(key);
  updateUIState();
  settingsModal.classList.add('hidden');
  showToast('Settings saved successfully!', 'success');

  // Retranslate if possible
  if (sourceText.value.trim()) {
    performTranslation();
  }
});

// Toggle password text visibility
toggleKeyVisibility.addEventListener('click', () => {
  const type = sarvamApiKeyInput.type === 'password' ? 'text' : 'password';
  sarvamApiKeyInput.type = type;
  const icon = toggleKeyVisibility.querySelector('i');
  icon.className = type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
});

// ==========================================================================
// TRANSLATION API DISPATCHER
// ==========================================================================
function triggerTranslation() {
  if (isAutoTranslateEnabled) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performTranslation, 600);
  }
}

async function performTranslation() {
  const text = sourceText.value.trim();
  if (!text) return;

  // UI state preparation
  targetText.classList.add('hidden');
  translationLoader.classList.remove('hidden');
  copyBtn.disabled = true;
  speechOutTgtBtn.disabled = true;

  try {
    const sarvamKey = localStorage.getItem('sarvam_api_key') || '';
    const headers = { 'Content-Type': 'application/json' };
    if (sarvamKey) {
      headers['x-sarvam-api-key'] = sarvamKey;
    }

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        text,
        sourceLang: srcLangCode,
        targetLang: tgtLangCode,
        engine: selectedEngine
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Translation failed.');
    }

    // Output translation result
    targetText.value = data.translatedText;
    copyBtn.disabled = false;
    speechOutTgtBtn.disabled = false;

    // Reload database log list
    loadLogs();

  } catch (error) {
    console.error('Translation process error:', error);
    targetText.value = `Error: ${error.message}\n\nPlease verify that your server is running, you have a valid network connection, or that your Sarvam API Key is entered correctly in Settings.`;
    showToast(error.message, 'error');
  } finally {
    translationLoader.classList.add('hidden');
    targetText.classList.remove('hidden');
  }
}

// ==========================================================================
// AUDIO LOGIC (SPEECH SYNTHESIS & RECOGNITION)
// ==========================================================================

// 1. TEXT-TO-SPEECH (PLAYBACK)
speechOutSrcBtn.addEventListener('click', () => speakText(sourceText.value, srcLangCode));
speechOutTgtBtn.addEventListener('click', () => speakText(targetText.value, tgtLangCode));

function speakText(text, langCode) {
  if (!text) return;

  // Stop any active speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Format language code (TTS expects BCP-47 with correct case e.g., 'hi-IN')
  // For 'auto', speakText is disabled on source card
  utterance.lang = langCode;

  // Attempt to select target local language voice if configured
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // Toggle button speaker icon state during play
  const activeBtn = langCode === srcLangCode ? speechOutSrcBtn : speechOutTgtBtn;
  const originalHtml = activeBtn.innerHTML;
  activeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
  activeBtn.classList.add('speaking');

  utterance.onend = () => {
    activeBtn.innerHTML = originalHtml;
    activeBtn.classList.remove('speaking');
  };

  utterance.onerror = () => {
    activeBtn.innerHTML = originalHtml;
    activeBtn.classList.remove('speaking');
    showToast('Failed to synthesize speech in this language.', 'error');
  };

  window.speechSynthesis.speak(utterance);
}

// Load voices once they are fetched (important for Chrome/Safari compatibility)
if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

// 2. SPEECH-TO-TEXT (DICTATION)
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    speechInBtn.style.display = 'none'; // Browser does not support dictation
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isRecording = true;
    speechInBtn.classList.add('recording');
    speechInBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i>';
    showToast('Voice input started. Speak now...', 'success');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // Append to textarea
    if (sourceText.value.trim() === '') {
      sourceText.value = transcript;
    } else {
      sourceText.value += ' ' + transcript;
    }
    updateCharCounter();
    clearTextBtn.classList.remove('hidden');
    speechOutSrcBtn.disabled = (srcLangCode === 'auto');
    
    // Trigger translation
    if (isAutoTranslateEnabled) {
      performTranslation();
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    showToast(`Speech Input error: ${event.error}`, 'error');
    stopRecording();
  };

  recognition.onend = () => {
    stopRecording();
  };
}

function stopRecording() {
  isRecording = false;
  speechInBtn.classList.remove('recording');
  speechInBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
}

speechInBtn.addEventListener('click', () => {
  if (!recognition) {
    showToast('Speech Recognition not supported in your browser.', 'error');
    return;
  }

  if (isRecording) {
    recognition.stop();
  } else {
    // Set recognition language matching source selector (default to hi-IN or en-IN)
    // If set to auto, let's use the browser default (or english)
    const activeLang = srcLangCode === 'auto' ? 'en-IN' : srcLangCode;
    recognition.lang = activeLang;
    recognition.start();
  }
});

// ==========================================================================
// DATABASE / HISTORY WORKFLOWS
// ==========================================================================
tabHistory.addEventListener('click', () => {
  currentTab = 'history';
  tabHistory.classList.add('active');
  tabFavorites.classList.remove('active');
  renderLogs();
});

tabFavorites.addEventListener('click', () => {
  currentTab = 'favorites';
  tabFavorites.classList.add('active');
  tabHistory.classList.remove('active');
  renderLogs();
});

let dbRecordsCache = [];

async function loadLogs() {
  try {
    const response = await fetch('/api/history');
    if (!response.ok) throw new Error('Failed to retrieve logs.');
    dbRecordsCache = await response.json();
    renderLogs();
  } catch (error) {
    console.error('Database logs loading error:', error);
  }
}

function renderLogs() {
  logsContainer.innerHTML = '';
  
  // Filter cache
  const filtered = currentTab === 'history' 
    ? dbRecordsCache 
    : dbRecordsCache.filter(item => item.is_starred === 1);

  if (filtered.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    const icon = document.createElement('i');
    icon.className = currentTab === 'history' ? 'fa-solid fa-clock-rotate-left' : 'fa-solid fa-star';
    
    const p = document.createElement('p');
    p.textContent = currentTab === 'history' 
      ? 'No translation logs found.' 
      : 'No starred translations yet. Star records in history to save them here!';
      
    emptyState.appendChild(icon);
    emptyState.appendChild(p);
    logsContainer.appendChild(emptyState);
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-item';
    card.setAttribute('data-id', item.id);

    // Meta Header
    const meta = document.createElement('div');
    meta.className = 'item-meta';

    const tags = document.createElement('div');
    tags.className = 'meta-tags';
    
    const srcTag = document.createElement('span');
    srcTag.className = 'lang-tag';
    srcTag.textContent = item.source_lang.split('-')[0];
    
    const arrow = document.createElement('i');
    arrow.className = 'fa-solid fa-right-long';
    arrow.style.fontSize = '0.7rem';
    arrow.style.color = 'var(--text-muted)';

    const tgtTag = document.createElement('span');
    tgtTag.className = 'lang-tag highlight';
    tgtTag.textContent = item.target_lang.split('-')[0];

    const engineTag = document.createElement('span');
    engineTag.className = 'engine-tag';
    engineTag.textContent = item.engine;

    tags.appendChild(srcTag);
    tags.appendChild(arrow);
    tags.appendChild(tgtTag);
    tags.appendChild(engineTag);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const starBtn = document.createElement('button');
    starBtn.className = `small-btn fav-btn ${item.is_starred === 1 ? 'starred' : ''}`;
    starBtn.title = item.is_starred === 1 ? 'Unstar translation' : 'Star translation';
    starBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStar(item.id);
    });

    const copyLogBtn = document.createElement('button');
    copyLogBtn.className = 'small-btn';
    copyLogBtn.title = 'Copy translation';
    copyLogBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
    copyLogBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(item.translated_text);
      showToast('Translation copied!', 'success');
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'small-btn del-btn';
    delBtn.title = 'Delete record';
    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteRecord(item.id);
    });

    actions.appendChild(starBtn);
    actions.appendChild(copyLogBtn);
    actions.appendChild(delBtn);

    meta.appendChild(tags);
    meta.appendChild(actions);

    // Content Text
    const texts = document.createElement('div');
    texts.className = 'history-texts';
    
    const srcSpan = document.createElement('span');
    srcSpan.className = 'hist-src';
    srcSpan.textContent = item.source_text;

    const tgtSpan = document.createElement('span');
    tgtSpan.className = 'hist-tgt';
    tgtSpan.textContent = item.translated_text;

    texts.appendChild(srcSpan);
    texts.appendChild(tgtSpan);

    // Date
    const formattedDate = formatDate(item.created_at);
    const dateSpan = document.createElement('span');
    dateSpan.className = 'hist-date';
    dateSpan.textContent = formattedDate;

    card.appendChild(meta);
    card.appendChild(texts);
    card.appendChild(dateSpan);

    // Click item restores text to inputs
    card.addEventListener('click', () => {
      sourceText.value = item.source_text;
      targetText.value = item.translated_text;
      srcLangCode = item.source_lang;
      tgtLangCode = item.target_lang;

      // Update button labels
      updateLangButtonLabel('source', srcLangCode);
      updateLangButtonLabel('target', tgtLangCode);
      highlightActiveOption('source', srcLangCode);
      highlightActiveOption('target', tgtLangCode);
      
      updateCharCounter();
      clearTextBtn.classList.remove('hidden');
      copyBtn.disabled = false;
      speechOutSrcBtn.disabled = (srcLangCode === 'auto');
      speechOutTgtBtn.disabled = false;

      showToast('Translation restored to workspace!', 'success');
    });

    logsContainer.appendChild(card);
  });
}

function formatDate(isoStr) {
  // ISO strings in SQLite are stored in UTC. Format nicely.
  try {
    const d = new Date(isoStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoStr;
  }
}

async function toggleStar(id) {
  try {
    const response = await fetch('/api/history/star', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    
    // Update local cache item
    const item = dbRecordsCache.find(r => r.id === id);
    if (item) {
      item.is_starred = data.isStarred;
    }
    renderLogs();
    showToast(data.isStarred === 1 ? 'Added to favorites!' : 'Removed from favorites.', 'success');
  } catch (error) {
    showToast('Failed to update favorite status.', 'error');
  }
}

async function deleteRecord(id) {
  try {
    const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error();
    
    // Remove from local cache
    dbRecordsCache = dbRecordsCache.filter(r => r.id !== id);
    renderLogs();
    showToast('Record deleted.', 'success');
  } catch (error) {
    showToast('Failed to delete history record.', 'error');
  }
}

clearLogsBtn.addEventListener('click', async () => {
  if (dbRecordsCache.length === 0) return;
  if (!confirm('Are you sure you want to clear all translation history logs?')) return;

  try {
    const response = await fetch('/api/history', { method: 'DELETE' });
    if (!response.ok) throw new Error();
    
    dbRecordsCache = [];
    renderLogs();
    showToast('All translation logs cleared.', 'success');
  } catch (error) {
    showToast('Failed to clear database logs.', 'error');
  }
});

// ==========================================================================
// TOAST NOTIFICATIONS UTILITY
// ==========================================================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(textSpan);
  toastContainer.appendChild(toast);

  // Auto remove after animation completes (3 seconds)
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
