const config = window.CHATBOT_CONFIG;
const urlParameters = new URLSearchParams(window.location.search);
const requestedArticle = urlParameters.get("article");
const articleSlug = config.articles?.[requestedArticle]
  ? requestedArticle
  : config.defaultArticle;
const articleConfig = config.articles?.[articleSlug];
const elements = {
  messages: document.querySelector("#messages"),
  suggestions: document.querySelector("#suggestions"),
  form: document.querySelector("#chatForm"),
  input: document.querySelector("#questionInput"),
  statusDot: document.querySelector("#statusDot"),
  statusText: document.querySelector("#statusText"),
  reload: document.querySelector("#reloadButton"),
  send: document.querySelector("#sendButton"),
  credit: document.querySelector("#credit"),
  copyright: document.querySelector("#copyright"),
  languageButtons: [...document.querySelectorAll("[data-language]")],
};

const ui = {
  id: {
    loading: "Memuat data...",
    ready: (count) => `${count} informasi tersedia`,
    error: "Sheet gagal dimuat",
    placeholder: "Tanyakan proses liputan, penulis, atau narasumber...",
    inputLabel: "Ketik pertanyaan",
    sendLabel: "Kirim pertanyaan",
    reloadLabel: "Muat ulang data",
    suggestionsLabel: "Saran pertanyaan",
    credit: "Jawaban bersumber dari lembar transparansi editorial",
    copyright: "© 2026 Irene Sarwindaningrum untuk Kompas.id",
    welcome: "Halo Sahabat Kompas 👋 Saya adalah bot transparansi berita. Saya bisa jelaskan proses peliputan hingga penyusunan artikel ini. Harap tidak memasukkan data pribadi. Apa yang ingin Anda ketahui?",
    fallback: "Maaf, saya belum menemukan informasi yang cocok. Coba tanyakan dengan kalimat lain—saya akan berusaha membantu.",
    sensitiveDataWarning: "Demi keamanan, pertanyaan yang memuat email, nomor telepon, alamat rumah, atau data sensitif tidak dikirim ke bot. Silakan hapus data pribadi itu, lalu kirim ulang pertanyaannya.",
    readArticle: "Baca artikel",
    samplesTitle: "Contoh tulisan penulis",
    thinking: "Sebentar, saya sedang membaca sumbernya…",
  },
  en: {
    loading: "Loading data...",
    ready: (count) => `${count} items available`,
    error: "Unable to load the Sheet",
    placeholder: "Ask about the reporting process, writer, or sources...",
    inputLabel: "Type a question",
    sendLabel: "Send question",
    reloadLabel: "Reload data",
    suggestionsLabel: "Suggested questions",
    credit: "Answers are sourced from the editorial transparency sheet",
    copyright: "© 2026 Irene Sarwindaningrum for Kompas.id",
    welcome: "Hello! 👋 I’m a news transparency bot. I can explain how this story was reported and prepared. Please do not enter personal data. What would you like to know?",
    fallback: "Sorry, I couldn’t find a matching answer yet. Try asking in a different way—I’ll do my best to help.",
    sensitiveDataWarning: "For safety, questions containing an email address, phone number, home address, or sensitive data are not sent to the bot. Please remove the personal data and send the question again.",
    readArticle: "Read article",
    samplesTitle: "Examples of the writer’s work",
    thinking: "One moment, I’m reading the source…",
  },
};

const rules = [
  { match: /^judul$/, q: { id: "Apa judul beritanya?", en: "What is the story title?" }, k: { id: "judul artikel berita liputan", en: "title article story report" } },
  { match: /^link_berita$/, q: { id: "Di mana saya bisa membaca beritanya?", en: "Where can I read the story?" }, k: { id: "link tautan baca artikel berita", en: "link url read article story" } },
  { match: /^tanggal_liputan/, q: { id: "Kapan liputan ini dilakukan?", en: "When was this story reported?" }, k: { id: "tanggal waktu kapan liputan terbit", en: "date time when reporting published" } },
  { match: /^nama_reporter$/, q: { id: "Siapa penulis berita ini?", en: "Who wrote this story?" }, k: { id: "reporter wartawan jurnalis penulis siapa", en: "reporter journalist writer author who" } },
  { match: /^(profil|bio|latar_belakang)_(penulis|reporter)$/, q: { id: "Apa latar belakang penulisnya?", en: "What is the writer’s background?" }, k: { id: "profil biodata latar belakang pengalaman penulis reporter wartawan", en: "profile biography bio background experience writer reporter journalist" } },
  { match: /^cara_peliputan$/, q: { id: "Bagaimana proses pembuatan?", en: "How was the article produced?" }, k: { id: "cara proses pembuatan peliputan wawancara pengamatan reportase", en: "how article produced reporting process interview observation newsgathering" } },
  { match: /^metode_verifikasi$/, q: { id: "Bagaimana informasi dalam berita diverifikasi?", en: "How was the information verified?" }, k: { id: "metode verifikasi cek fakta data dokumen sumber validasi", en: "verification fact check data documents sources validation" } },
  { match: /^metode_penunjang$/, q: { id: "Apa metode penunjang liputan ini?", en: "What supporting methods were used?" }, k: { id: "metode penunjang referensi tambahan data", en: "supporting methods references additional data" } },
  { match: /^alasan_angle$/, q: { id: "Kenapa berita ini penting?", en: "Why is this story important?" }, k: { id: "kenapa mengapa berita penting alasan angle sudut pandang fokus berita", en: "why story important reason angle perspective focus" } },
  { match: /^latar_belakang_pemberitaan$/, q: { id: "Apa latar belakang pemberitaan ini?", en: "What is the background of this coverage?" }, k: { id: "latar belakang konteks alasan liputan", en: "background context reason coverage" } },
  { match: /^relevansi_publik_indonesia$/, q: { id: "Kenapa berita ini penting?", en: "Why is this story important?" }, k: { id: "kenapa mengapa berita penting publik indonesia relevansi dampak", en: "why story important Indonesian public relevance impact" } },
  { match: /^apakah_ai_digunakan/, q: { id: "Apakah AI digunakan dalam pembuatan?", en: "Was AI used in its production?" }, k: { id: "ai kecerdasan buatan transkripsi penggunaan pembuatan", en: "ai artificial intelligence transcription use production" } },
  { match: /^nama_narasumber/, q: { id: "Siapa narasumber {n}?", en: "Who is source {n}?" }, k: { id: "nama narasumber sumber wawancara ahli siapa {n}", en: "name interview source expert who {n}" } },
  { match: /^atribusi_narasumber/, q: { id: "Apa keahlian narasumber {n}?", en: "What are source {n}’s credentials?" }, k: { id: "atribusi profil jabatan keahlian narasumber {n}", en: "credentials profile role expertise source {n}" } },
  { match: /^alasan_pemilihan_narasumber/, q: { id: "Mengapa narasumber {n} dipilih?", en: "Why was source {n} selected?" }, k: { id: "alasan pemilihan narasumber ahli {n}", en: "reason selection interview source expert {n}" } },
];

const requestedLanguage = urlParameters.get("lang");
let language = requestedLanguage === "en" || requestedLanguage === "id"
  ? requestedLanguage
  : (config.defaultLanguage === "en" ? "en" : "id");
let records = [];
let knowledgeBase = [];

function normalize(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeKey(text) {
  return normalize(text).replace(/\s+/g, "_");
}

function tokenize(text) {
  const ignored = new Set(["apa", "yang", "dan", "di", "ke", "dari", "untuk", "saya", "bagaimana", "apakah", "what", "is", "the", "a", "an", "of", "this", "how", "was"]);
  return normalize(text).split(" ").filter((word) => word.length > 1 && !ignored.has(word));
}

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index], next = text[index + 1];
    if (char === '"' && quoted && next === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function rowsToRecords(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeKey);
  const hasHeader = ["kunci", "key", "field"].includes(headers[0]);
  const idIndex = headers.findIndex((header) => ["indonesia", "id", "bahasa_indonesia"].includes(header));
  const enIndex = headers.findIndex((header) => ["english", "en", "inggris", "bahasa_inggris"].includes(header));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  return dataRows.map((row) => ({
    key: normalizeKey(row[0]),
    id: String(row[hasHeader && idIndex >= 0 ? idIndex : 1] || "").trim(),
    en: String(row[hasHeader && enIndex >= 0 ? enIndex : 2] || "").trim(),
  })).filter((record) => record.key && (record.id || record.en));
}

function valueFor(record) {
  const selected = record?.[language] || "";
  const fallback = record?.id || record?.en || "";
  return /^#(?:VALUE!|REF!|N\/A|ERROR!|NAME\?)/i.test(selected) ? fallback : (selected || fallback);
}

function createKnowledgeBase() {
  const items = records
    .filter((record) => !/^contoh_tulisan_\d+_(judul|link)$/.test(record.key) && !/^sample_article_\d+_(title|link)$/.test(record.key))
    .map((record) => {
      const number = record.key.match(/(\d+)$/)?.[1] || "";
      const rule = rules.find((candidate) => candidate.match.test(record.key));
      const readableKey = record.key.replace(/_/g, " ");
      const generic = language === "id" ? `Apa informasi tentang ${readableKey}?` : `What is the information about ${readableKey}?`;
      return {
        key: record.key,
        question: (rule?.q[language] || generic).replaceAll("{n}", number).replace(/\s+\?/g, "?"),
        keywords: `${readableKey} ${(rule?.k[language] || "").replaceAll("{n}", number)}`,
        answer: valueFor(record),
      };
    });

  const overview = buildOverview();
  if (overview) {
    items.push({
      key: "ringkasan",
      question: language === "id" ? "Apa inti artikel?" : "What is the article’s main point?",
      keywords: language === "id" ? "ringkas rangkum ringkasan ikhtisar keseluruhan isi liputan" : "summarize summary overview entire coverage story",
      answer: overview,
    });
  }

  const samples = collectSamples();
  if (samples.length) {
    items.push({
      key: "contoh_tulisan",
      question: language === "id" ? "Apa contoh tulisan penulis ini?" : "What are examples of this writer’s work?",
      keywords: language === "id" ? "contoh tulisan artikel karya penulis reporter portofolio" : "examples writing articles work writer reporter portfolio",
      samples,
    });
  }
  knowledgeBase = items;
}

function buildOverview() {
  const sections = language === "id"
    ? [
        ["Judul", ["judul"]],
        ["Penulis", ["nama_reporter"]],
        ["Latar belakang penulis", ["profil_reporter", "profil_penulis"]],
        ["Cara peliputan", ["cara_peliputan"]],
        ["Verifikasi", ["metode_verifikasi"]],
        ["Alasan sudut pandang", ["alasan_angle"]],
        ["Penggunaan AI", ["apakah_ai_digunakan_dalam_proses_berita_ini"]],
      ]
    : [
        ["Title", ["judul"]],
        ["Writer", ["nama_reporter"]],
        ["Writer’s background", ["profil_reporter", "profil_penulis"]],
        ["Reporting process", ["cara_peliputan"]],
        ["Verification", ["metode_verifikasi"]],
        ["Reason for the angle", ["alasan_angle"]],
        ["Use of AI", ["apakah_ai_digunakan_dalam_proses_berita_ini"]],
      ];
  return sections.map(([label, keys]) => {
    const record = keys.map((key) => records.find((candidate) => candidate.key === key)).find(Boolean);
    const value = valueFor(record);
    if (!value) return "";
    const concise = value.length > 360 ? `${value.slice(0, 357).trim()}…` : value;
    return `• ${label}: ${concise}`;
  }).filter(Boolean).join("\n");
}

function toPointers(text) {
  const value = String(text || "").trim();
  if (!value || /^https?:\/\/\S+$/i.test(value) || value.startsWith("• ")) return value;
  const parts = value.split(/\n+|(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  return parts.slice(0, 4).map((part) => `• ${part}`).join("\n");
}

function collectSamples() {
  const numbers = new Set();
  records.forEach((record) => {
    const match = record.key.match(/^(?:contoh_tulisan|sample_article)_(\d+)_(?:judul|title|link)$/);
    if (match) numbers.add(match[1]);
  });
  return [...numbers].sort((a, b) => Number(a) - Number(b)).map((number) => {
    const title = records.find((record) => record.key === `contoh_tulisan_${number}_judul`) || records.find((record) => record.key === `sample_article_${number}_title`);
    const link = records.find((record) => record.key === `contoh_tulisan_${number}_link`) || records.find((record) => record.key === `sample_article_${number}_link`);
    return { title: valueFor(title) || `${ui[language].readArticle} ${number}`, link: valueFor(link) };
  }).filter((sample) => sample.title || sample.link);
}

function similarity(query, item) {
  const cleanQuery = normalize(query), cleanQuestion = normalize(item.question);
  if (cleanQuery === cleanQuestion) return 1;
  if (cleanQuestion.includes(cleanQuery) || cleanQuery.includes(cleanQuestion)) return 0.9;
  const queryWords = tokenize(query);
  const sourceWords = new Set(tokenize(`${item.question} ${item.keywords}`));
  if (!queryWords.length) return 0;
  let matches = 0;
  queryWords.forEach((word) => {
    if (sourceWords.has(word)) matches += 1;
    else if ([...sourceWords].some((source) => source.includes(word) || word.includes(source))) matches += 0.5;
  });
  return matches / queryWords.length;
}

function setStatus(type, text) {
  elements.statusDot.className = `status-dot ${type}`;
  elements.statusText.textContent = text;
}

function appendLinkedText(container, text) {
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g);
  parts.forEach((part) => {
    if (/^https?:\/\//.test(part)) {
      const link = document.createElement("a");
      link.href = part;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = ui[language].readArticle + " ↗";
      container.appendChild(link);
    } else container.appendChild(document.createTextNode(part));
  });
}

function containsPersonalData(text) {
  const value = String(text || "");
  const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const phonePattern = /(?:\+?\d[\s().-]*){9,}\d/;
  const addressPattern = /\b(?:alamat|address|rumah|home address|jalan|jl\.?|jln\.?|street|st\.?|rt|rw)\b/i;
  return emailPattern.test(value) || phonePattern.test(value) || addressPattern.test(value);
}

function addMessage(content, sender = "bot") {
  const wrapper = document.createElement("div"), bubble = document.createElement("div");
  wrapper.className = `message ${sender}`;
  bubble.className = "bubble";
  if (content?.typing) {
    bubble.classList.add("typing-bubble");
    bubble.setAttribute("aria-label", ui[language].thinking);
    for (let index = 0; index < 3; index += 1) {
      const dot = document.createElement("span");
      dot.className = "typing-dot";
      dot.setAttribute("aria-hidden", "true");
      bubble.appendChild(dot);
    }
  } else if (content?.samples) {
    const title = document.createElement("strong");
    title.textContent = ui[language].samplesTitle;
    const list = document.createElement("ol");
    content.samples.forEach((sample) => {
      const item = document.createElement("li");
      if (sample.link) {
        const link = document.createElement("a");
        link.href = sample.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `${sample.title} ↗`;
        item.appendChild(link);
      } else item.textContent = sample.title;
      list.appendChild(item);
    });
    bubble.append(title, list);
  } else appendLinkedText(bubble, String(content));
  wrapper.appendChild(bubble);
  elements.messages.appendChild(wrapper);
  elements.messages.scrollTop = elements.messages.scrollHeight;
  return wrapper;
}

function showSuggestions() {
  elements.suggestions.replaceChildren();
  const importanceKey = knowledgeBase.some((item) => item.key === "relevansi_publik_indonesia")
    ? "relevansi_publik_indonesia"
    : "alasan_angle";
  const preferred = ["ringkasan", "cara_peliputan", "apakah_ai_digunakan_dalam_proses_berita_ini", importanceKey];
  const sorted = [...knowledgeBase].sort((a, b) => {
    const ai = preferred.indexOf(a.key), bi = preferred.indexOf(b.key);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  sorted.slice(0, config.suggestionCount).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.question;
    button.addEventListener("click", () => ask(item.question));
    elements.suggestions.appendChild(button);
  });
}

async function ask(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  if (containsPersonalData(cleanQuestion)) {
    elements.input.value = "";
    addMessage(ui[language].sensitiveDataWarning);
    elements.input.focus();
    return;
  }
  addMessage(cleanQuestion, "user");
  elements.input.value = "";
  elements.input.disabled = true;
  elements.send.disabled = true;
  const thinkingMessage = addMessage({ typing: true });
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: cleanQuestion, language, article: articleSlug }),
    });
    const result = await response.json();
    if (!response.ok || !result.answer) throw new Error(result.code || result.error || "AI unavailable");
    thinkingMessage.remove();
    addMessage(result.answer.replace(/\*\*/g, ""));
  } catch (error) {
    const best = knowledgeBase.map((item) => ({ item, score: similarity(cleanQuestion, item) })).sort((a, b) => b.score - a.score)[0];
    thinkingMessage.remove();
    if (!best || best.score < config.minimumScore) addMessage(ui[language].fallback);
    else if (best.item.samples) addMessage({ samples: best.item.samples });
    else addMessage(toPointers(best.item.answer));
  } finally {
    elements.input.disabled = false;
    elements.send.disabled = false;
    elements.input.focus();
  }
}

function applyLanguage(nextLanguage, resetConversation = true) {
  language = nextLanguage;
  document.documentElement.lang = language;
  elements.languageButtons.forEach((button) => {
    const active = button.dataset.language === language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  elements.input.placeholder = ui[language].placeholder;
  elements.input.previousElementSibling.textContent = ui[language].inputLabel;
  elements.send.setAttribute("aria-label", ui[language].sendLabel);
  elements.reload.title = ui[language].reloadLabel;
  elements.reload.setAttribute("aria-label", ui[language].reloadLabel);
  elements.suggestions.setAttribute("aria-label", ui[language].suggestionsLabel);
  elements.credit.textContent = ui[language].credit;
  elements.copyright.textContent = ui[language].copyright;
  createKnowledgeBase();
  setStatus(records.length ? "" : "loading", records.length ? ui[language].ready(records.length) : ui[language].loading);
  showSuggestions();
  if (resetConversation) {
    elements.messages.replaceChildren();
    addMessage(ui[language].welcome);
  }
}

async function loadData() {
  setStatus("loading", ui[language].loading);
  elements.reload.disabled = true;
  try {
    const separator = articleConfig.sheetUrl.includes("?") ? "&" : "?";
    const response = await fetch(`${articleConfig.sheetUrl}${separator}cache=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    records = rowsToRecords(parseCSV(await response.text()));
    if (!records.length) throw new Error("Spreadsheet kosong");
    applyLanguage(language, false);
  } catch (error) {
    records = [];
    knowledgeBase = [];
    setStatus("error", ui[language].error);
    elements.suggestions.replaceChildren();
    console.error("Gagal memuat spreadsheet:", error);
  } finally {
    elements.reload.disabled = false;
  }
}

elements.form.addEventListener("submit", (event) => { event.preventDefault(); ask(elements.input.value); });
elements.reload.addEventListener("click", loadData);
elements.languageButtons.forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.language)));

document.title = articleConfig.botName;
document.querySelector("h1").textContent = articleConfig.botName;
applyLanguage(language);
loadData();
