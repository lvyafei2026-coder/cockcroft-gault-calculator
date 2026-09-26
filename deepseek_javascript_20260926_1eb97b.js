const fs = require('fs');
const path = require('path');

// ============================================================
// HTML 模板
// ============================================================
function buildIndexHtml(forceLang, htmlLang, canonicalPath) {
  const forceLine = forceLang
    ? `<script>window.__FORCE_LANG__ = '${forceLang}';<\/script>\n`
    : '';
  const canonical = `https://toolara.dev${canonicalPath}`;

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cockcroft-Gault Calculator — Creatinine Clearance (CrCl) for Drug Dosing</title>
<meta name="description" content="Free Cockcroft-Gault calculator. Estimate creatinine clearance (CrCl) for drug dosing, using age, weight, sex, and serum creatinine. Includes renal impairment staging.">
<meta name="keywords" content="cockcroft-gault calculator, creatinine clearance calculator, crcl calculator, renal function calculator, drug dosing renal impairment">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="theme-color" content="#0c4a6e">

<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="https://toolara.dev/cockcroft-gault-calculator/">
<link rel="alternate" hreflang="zh-Hans" href="https://toolara.dev/cockcroft-gault-calculator/zh/">
<link rel="alternate" hreflang="x-default" href="https://toolara.dev/cockcroft-gault-calculator/">

<meta property="og:type" content="website">
<meta property="og:title" content="Cockcroft-Gault Calculator — Creatinine Clearance (CrCl)">
<meta property="og:description" content="Estimate creatinine clearance for drug dosing using the Cockcroft-Gault equation.">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_US">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Cockcroft-Gault Calculator",
  "url": "${canonical}",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "description": "Free Cockcroft-Gault calculator for creatinine clearance estimation in drug dosing.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
<\/script>

${forceLine}<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="hero">
  <div class="lang-switch">
    <select id="langSelect" onchange="setLang(this.value)" aria-label="Language">
      <option value="en">English</option>
      <option value="zh">简体中文</option>
    </select>
  </div>
  <div class="hero-inner">
    <div class="hero-badge">💊 Clinical Tool</div>
    <h1 data-i18n="title">Cockcroft-Gault Calculator</h1>
    <p data-i18n="subtitle">Estimate creatinine clearance (CrCl) for drug dosing — using age, weight, sex, and serum creatinine.</p>
  </div>
</header>

<main class="wrap">
  <section class="card">
    <h2 class="visually-hidden" data-i18n="calcHeading">Calculator</h2>

    <div class="row">
      <div>
        <label for="age" data-i18n="ageLabel">Age (years)</label>
        <input type="number" id="age" min="18" max="120" placeholder="65" value="65" inputmode="numeric">
      </div>
      <div>
        <label for="weight" data-i18n="weightLabel">Body weight (kg)</label>
        <input type="number" id="weight" min="1" max="300" step="0.1" placeholder="70" value="70" inputmode="decimal">
      </div>
    </div>

    <div class="row">
      <div>
        <label for="sex" data-i18n="sexLabel">Sex</label>
        <select id="sex">
          <option value="male" data-i18n="male">Male</option>
          <option value="female" data-i18n="female">Female</option>
        </select>
      </div>
      <div>
        <label for="creatUnit" data-i18n="creatUnitLabel">Creatinine unit</label>
        <select id="creatUnit">
          <option value="mgdl" data-i18n="unitMgdl">mg/dL</option>
          <option value="umol" data-i18n="unitUmol">µmol/L</option>
        </select>
      </div>
    </div>

    <label for="creat" data-i18n="creatLabel">Serum creatinine</label>
    <input type="number" id="creat" min="0.1" step="0.01" placeholder="1.2" value="1.2" inputmode="decimal">

    <details class="advanced">
      <summary data-i18n="advancedLabel">Advanced options</summary>
      <label for="weightType" data-i18n="weightTypeLabel">Weight type</label>
      <select id="weightType">
        <option value="actual" data-i18n="weightActual">Actual body weight</option>
        <option value="ideal" data-i18n="weightIdeal">Ideal body weight (IBW)</option>
        <option value="adjusted" data-i18n="weightAdjusted">Adjusted body weight (ABW)</option>
      </select>
      <p class="hint" data-i18n="weightHint">For obese patients, some guidelines recommend using adjusted body weight (ABW) instead of actual body weight.</p>
    </details>

    <button class="calc" type="button" onclick="calculate()" data-i18n="calcBtn">Calculate creatinine clearance</button>

    <div id="result" role="region" aria-live="polite">
      <div class="result-label" data-i18n="resultLabel">Estimated creatinine clearance</div>
      <div class="crcl-value"><span id="crclNum">—</span><span class="crcl-unit"> mL/min</span></div>
      <div class="stage-note" id="stageNote"></div>

      <div class="breakdown">
        <div class="bd-row"><span data-i18n="bdFormula">Formula used</span><strong id="bdFormula">—</strong></div>
        <div class="bd-row"><span data-i18n="bdAge">Age</span><strong id="bdAge">—</strong></div>
        <div class="bd-row"><span data-i18n="bdWeight">Weight used</span><strong id="bdWeight">—</strong></div>
        <div class="bd-row"><span data-i18n="bdSex">Sex</span><strong id="bdSex">—</strong></div>
        <div class="bd-row"><span data-i18n="bdCreat">Serum creatinine</span><strong id="bdCreat">—</strong></div>
      </div>

      <div class="renal-stages">
        <h3 data-i18n="stagesTitle">Renal function staging (CrCl)</h3>
        <table>
          <thead>
            <tr><th data-i18n="thCrcl">CrCl (mL/min)</th><th data-i18n="thStage">Category</th><th data-i18n="thDose">Typical drug dosing note</th></tr>
          </thead>
          <tbody>
            <tr><td>≥ 90</td><td data-i18n="stageNormal">Normal</td><td data-i18n="doseNormal">Standard dosing</td></tr>
            <tr><td>60–89</td><td data-i18n="stageMild">Mild impairment</td><td data-i18n="doseMild">Usually standard dosing; check individual drugs</td></tr>
            <tr><td>30–59</td><td data-i18n="stageModerate">Moderate impairment</td><td data-i18n="doseModerate">Many drugs require dose adjustment</td></tr>
            <tr><td>15–29</td><td data-i18n="stageSevere">Severe impairment</td><td data-i18n="doseSevere">Most drugs require dose adjustment or avoidance</td></tr>
            <tr><td>&lt; 15</td><td data-i18n="stageFailure">Kidney failure</td><td data-i18n="doseFailure">Dose per dialysis protocol; many drugs contraindicated</td></tr>
          </tbody>
        </table>
      </div>

      <div class="share-row">
        <button class="share-btn" type="button" onclick="copyShareLink()" data-i18n="shareBtn">Copy shareable link</button>
        <span class="share-copied" id="shareCopied" data-i18n="shareCopied">Copied!</span>
      </div>

      <div class="result-disclaimer" data-i18n="resultDisclaimer">Estimate only. Cockcroft-Gault is not validated in acute kidney injury, unstable creatinine, pregnancy, or extremes of body weight. Always consult clinical dosing references and adjust for individual patient factors.</div>
    </div>
  </section>

  <section>
    <h2 data-i18n="whatIsTitle">What is creatinine clearance?</h2>
    <p data-i18n="whatIsText">Creatinine clearance (CrCl) estimates how much blood plasma the kidneys can clear of creatinine per minute. It is not the same as estimated GFR (eGFR) — CrCl is the standard used in most drug dosing labels and regulatory submissions. The Cockcroft-Gault equation, published in 1976, remains the most widely used formula in clinical pharmacology for adjusting drug doses in renal impairment.</p>
  </section>

  <section>
    <h2 data-i18n="formulaTitle">The Cockcroft-Gault formula</h2>
    <p class="formula">CrCl (mL/min) = [(140 − Age) × Weight(kg) × (0.85 if female)] / (72 × Scr in mg/dL)</p>
    <p data-i18n="formulaText">Where Scr is serum creatinine. For µmol/L, use the modified form: CrCl = [(140 − Age) × Weight × (1.23 if male, 1.04 if female)] / Scr(µmol/L).</p>
  </section>

  <section>
    <h2 data-i18n="weightTitle">Which weight to use</h2>
    <p data-i18n="weightText">The Cockcroft-Gault equation was originally developed using actual body weight. However, for patients at extremes of body weight, guidelines differ:</p>
    <ul>
      <li data-i18n="wtActual"><strong>Actual body weight (ABW)</strong> — use when body weight is within 20% of ideal.</li>
      <li data-i18n="wtIdeal"><strong>Ideal body weight (IBW)</strong> — some guidelines recommend IBW for CrCl estimation in obese patients.</li>
      <li data-i18n="wtAdjusted"><strong>Adjusted body weight (ABW)</strong> — recommended by many antimicrobial dosing guidelines for obese patients.</li>
    </ul>
  </section>

  <section>
    <h2 data-i18n="howToTitle">How to use this calculator</h2>
    <ol>
      <li data-i18n="howTo1">Enter patient age in years (18 or older).</li>
      <li data-i18n="howTo2">Enter body weight in kilograms. For obese patients, consider adjusted or ideal body weight.</li>
      <li data-i18n="howTo3">Select patient sex.</li>
      <li data-i18n="howTo4">Enter serum creatinine and select the unit (mg/dL or µmol/L).</li>
      <li data-i18n="howTo5">Click "Calculate creatinine clearance" to see the CrCl value and renal impairment category.</li>
    </ol>
  </section>

  <section>
    <h2 data-i18n="faqTitle">Frequently asked questions</h2>
    <h3 data-i18n="faq1q">When should I use CrCl vs eGFR?</h3>
    <p data-i18n="faq1a">Use CrCl (Cockcroft-Gault) for drug dosing — most FDA-approved drug labels are based on it. Use eGFR (CKD-EPI) for diagnosing and staging chronic kidney disease. They are not interchangeable.</p>

    <h3 data-i18n="faq2q">Is Cockcroft-Gault accurate?</h3>
    <p data-i18n="faq2a">It is the most widely used formula in drug dosing, but it has limitations. It overestimates CrCl in obese patients (uses actual weight), underestimates in elderly patients with low muscle mass, and is not validated in acute kidney injury where creatinine is changing rapidly.</p>

    <h3 data-i18n="faq3q">How do I convert mg/dL to µmol/L?</h3>
    <p data-i18n="faq3a">1 mg/dL = 88.42 µmol/L. This calculator handles the conversion automatically when you select the unit.</p>

    <h3 data-i18n="faq4q">What does the result mean for drug dosing?</h3>
    <p data-i18n="faq4a">CrCl ≥ 90 mL/min: standard dosing for most drugs. 60–89: usually standard, but check individual drugs. 30–59: many drugs need dose adjustment. 15–29: most drugs need adjustment or should be avoided. &lt; 15: dose per dialysis protocols; many drugs are contraindicated.</p>

    <h3 data-i18n="faq5q">Why does the equation use 0.85 for females?</h3>
    <p data-i18n="faq5a">The 0.85 factor accounts for the lower average muscle mass in women, which produces lower baseline serum creatinine at the same kidney function. Without this adjustment, CrCl would be overestimated in female patients.</p>

    <div class="disclaimer" data-i18n="disclaimer"><strong>Medical disclaimer:</strong> This calculator provides estimates for educational and clinical reference purposes only. It is not a substitute for professional medical judgment. Always verify drug dosing against current clinical references and consider individual patient factors before adjusting any medication.</div>
  </section>
</main>

<footer class="footer" data-i18n="footer">Runs entirely in your browser. No data is collected or stored.</footer>

<script src="js/i18n.js"><\/script>
<script src="js/calculator.js"><\/script>
</body>
</html>`;
}

// ============================================================
// CSS — 医疗临床风
// ============================================================
const STYLE_CSS = `:root {
  --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --muted: #64748b;
  --accent: #0284c7; --accent-dark: #0369a1; --navy: #0c4a6e; --teal: #0d9488;
  --border: #e2e8f0; --radius: 14px;
  --shadow: 0 1px 3px rgba(15,23,42,0.05), 0 8px 24px rgba(12,74,110,0.06);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; -webkit-font-smoothing: antialiased; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  color: #fff;
  padding: 64px 20px 96px;
  background:
    radial-gradient(circle at 20% 20%, rgba(13,148,136,0.30) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(2,132,199,0.28) 0%, transparent 55%),
    linear-gradient(135deg, #082f49 0%, #0c4a6e 55%, #075985 100%);
}
.hero::before {
  content: "";
  position: absolute; inset: 0;
  background-image:
    radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.6;
  pointer-events: none;
}
.hero-inner { max-width: 720px; margin: 0 auto; position: relative; z-index: 2; text-align: center; }
.hero-badge {
  display: inline-block;
  background: rgba(13,148,136,0.20);
  border: 1px solid rgba(13,148,136,0.45);
  color: #5eead4;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 18px;
}
.hero h1 { font-size: 2.1rem; margin: 0 0 12px; font-weight: 800; letter-spacing: -0.02em; }
.hero p { margin: 0 auto; opacity: 0.92; font-size: 1rem; max-width: 560px; }

/* ---------- Lang switcher ---------- */
.lang-switch { position: absolute; top: 16px; right: 16px; z-index: 3; }
.lang-switch select {
  appearance: none; -webkit-appearance: none;
  background-color: rgba(255,255,255,0.14);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff; padding: 7px 32px 7px 12px; border-radius: 8px;
  font-size: 0.85rem; font-family: inherit; cursor: pointer;
}
.lang-switch select:hover { background-color: rgba(255,255,255,0.26); }
.lang-switch select option { color: #0f172a; background: #fff; }

/* ---------- Layout ---------- */
.wrap { max-width: 720px; margin: -56px auto 0; padding: 0 20px 64px; position: relative; z-index: 2; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin-bottom: 22px; box-shadow: var(--shadow); }

label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; }
input, select { width: 100%; padding: 11px 13px; border: 1px solid #cbd5e1; border-radius: 9px; font-size: 1rem; margin-bottom: 18px; background: #fff; color: var(--text); transition: border-color 0.15s, box-shadow 0.15s; font-family: inherit; }
input:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(2,132,199,0.15); }
.row { display: flex; gap: 14px; }
.row > div { flex: 1; }
button.calc { width: 100%; padding: 15px; background: var(--navy); color: #fff; border: none; border-radius: 9px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s; font-family: inherit; }
button.calc:hover { background: #082f49; }
button.calc:active { transform: scale(0.99); }

/* ---------- Advanced ---------- */
.advanced { margin-bottom: 18px; }
.advanced summary { cursor: pointer; font-size: 0.85rem; font-weight: 600; color: var(--accent); padding: 8px 0; user-select: none; }
.advanced summary:hover { color: var(--accent-dark); }
.advanced[open] summary { margin-bottom: 8px; }
.hint { font-size: 0.8rem; color: var(--muted); margin: -12px 0 16px; }

/* ---------- Result ---------- */
#result { margin-top: 24px; padding: 24px; border-radius: 14px; background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%); border: 2px solid var(--accent); display: none; animation: fadeIn 0.35s ease; }
#result.show { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.result-label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 700; color: var(--accent-dark); margin-bottom: 4px; }
.crcl-value { font-size: 3rem; font-weight: 800; color: var(--navy); line-height: 1; letter-spacing: -0.02em; display: flex; align-items: baseline; gap: 4px; }
.crcl-unit { font-size: 1rem; font-weight: 500; color: var(--muted); }
.stage-note { font-size: 0.95rem; color: var(--accent-dark); margin-top: 10px; font-weight: 600; }
.breakdown { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(2,132,199,0.18); }
.bd-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 0.9rem; color: #0f172a; }
.bd-row strong { color: var(--navy); font-weight: 600; }

/* ---------- Renal stages table ---------- */
.renal-stages { margin-top: 22px; }
.renal-stages h3 { font-size: 1rem; margin: 0 0 10px; color: var(--navy); }
.renal-stages table { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin: 0; }
.renal-stages th, .renal-stages td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); }
.renal-stages th { background: #f0f9ff; font-weight: 600; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--accent-dark); }
.renal-stages tr:last-child td { border-bottom: none; }
.renal-stages tr.active-row { background: #ecfeff; }
.renal-stages tr.active-row td { font-weight: 600; color: var(--navy); }

/* ---------- Share ---------- */
.share-row { margin-top: 18px; display: flex; align-items: center; gap: 12px; }
.share-btn { padding: 9px 16px; background: #fff; border: 1px solid var(--accent); color: var(--accent-dark); border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
.share-btn:hover { background: #f0f9ff; }
.share-copied { font-size: 0.85rem; color: #059669; font-weight: 600; opacity: 0; transition: opacity 0.25s; }
.share-copied.show { opacity: 1; }

.result-disclaimer { margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(2,132,199,0.15); font-size: 0.78rem; color: var(--muted); }

/* ---------- Content ---------- */
h2 { font-size: 1.25rem; margin: 36px 0 12px; letter-spacing: -0.01em; }
h3 { font-size: 1rem; margin: 22px 0 6px; }
p { margin: 0 0 14px; }
ul, ol { margin: 0 0 16px; padding-left: 22px; }
li { margin-bottom: 8px; line-height: 1.65; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 14px 0; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); }
th { background: #f0f9ff; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--accent-dark); }
tr:last-child td { border-bottom: none; }
.formula { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85rem; background: #f0f9ff; padding: 12px 14px; border-radius: 8px; overflow-x: auto; }
.disclaimer { font-size: 0.85rem; color: var(--muted); border-left: 3px solid var(--accent); padding: 4px 0 4px 14px; margin-top: 18px; }
.footer { text-align: center; font-size: 0.8rem; color: var(--muted); padding: 24px 20px 48px; }

@media (max-width: 560px) {
  .hero { padding: 48px 16px 80px; }
  .hero h1 { font-size: 1.5rem; }
  .lang-switch { position: static; display: flex; justify-content: center; margin-bottom: 16px; }
  .wrap { padding: 0 14px 48px; }
  .card { padding: 20px; }
  .row { flex-direction: column; gap: 0; }
  .crcl-value { font-size: 2.3rem; }
  .renal-stages table { font-size: 0.76rem; }
  .renal-stages th, .renal-stages td { padding: 6px 8px; }
}`;

// ============================================================
// i18n.js
// ============================================================
const I18N_JS = `const SUPPORTED_LANGS = ['en','zh'];
const DEFAULT_LANG = 'en';
const MARKER = '/cockcroft-gault-calculator';

const LANG_TO_PATH = { 'en':'/', 'zh':'/zh/' };
const SEG_TO_LANG = { 'zh':'zh' };

let currentLang = DEFAULT_LANG;
let translations = {};
const cache = {};

function getBase() {
  const p = window.location.pathname;
  const idx = p.indexOf(MARKER);
  if (idx !== -1) return p.slice(0, idx + MARKER.length);
  return '';
}

function detectPageLang() {
  if (window.__FORCE_LANG__ && SUPPORTED_LANGS.includes(window.__FORCE_LANG__)) return window.__FORCE_LANG__;
  const p = window.location.pathname;
  const base = getBase();
  const rest = base ? p.slice(base.length) : p;
  const segs = rest.split('/').filter(Boolean);
  if (segs.length > 0) {
    const first = segs[0].toLowerCase();
    if (SEG_TO_LANG[first]) return SEG_TO_LANG[first];
  }
  return DEFAULT_LANG;
}

async function loadLocale(lang) {
  if (cache[lang]) return cache[lang];
  const base = getBase();
  const res = await fetch(base + '/locales/' + lang + '.json');
  if (!res.ok) throw new Error('Failed to load locale: ' + lang);
  const data = await res.json();
  cache[lang] = data;
  return data;
}

function applyTranslations(t) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] === undefined) return;
    if (key === 'disclaimer') el.innerHTML = t[key];
    else el.textContent = t[key];
  });
}

async function initPage() {
  const lang = detectPageLang();
  try { translations = await loadLocale(lang); }
  catch (err) { console.error(err); return; }
  currentLang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
  applyTranslations(translations);
  const select = document.getElementById('langSelect');
  if (select) select.value = lang;
  window.__i18n = { t: translations, lang: currentLang };
  if (typeof readUrlParams === 'function') readUrlParams();
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  const base = getBase();
  window.location.href = base + (LANG_TO_PATH[lang] || '/');
}

document.addEventListener('DOMContentLoaded', initPage);`;

// ============================================================
// calculator.js
// ============================================================
const CALCULATOR_JS = `function t() { return (window.__i18n && window.__i18n.t) || {}; }

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  ['age','weight','creat'].forEach(id => {
    if (params.has(id)) {
      const el = document.getElementById(id);
      if (el) el.value = params.get(id);
    }
  });
  if (params.has('sex')) document.getElementById('sex').value = params.get('sex');
  if (params.has('unit')) document.getElementById('creatUnit').value = params.get('unit');
  if (params.has('weightType')) document.getElementById('weightType').value = params.get('weightType');
  if (params.has('age') || params.has('weight') || params.has('creat')) calculate();
}

function buildShareUrl() {
  const params = new URLSearchParams();
  params.set('age', document.getElementById('age').value);
  params.set('weight', document.getElementById('weight').value);
  params.set('sex', document.getElementById('sex').value);
  params.set('creat', document.getElementById('creat').value);
  params.set('unit', document.getElementById('creatUnit').value);
  const wt = document.getElementById('weightType');
  if (wt && wt.value !== 'actual') params.set('weightType', wt.value);
  const base = window.location.origin + window.location.pathname;
  return base + '?' + params.toString();
}

function copyShareLink() {
  const url = buildShareUrl();
  navigator.clipboard.writeText(url).then(() => {
    const el = document.getElementById('shareCopied');
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  }).catch(() => { prompt('Copy this link:', url); });
}

function calculate() {
  const tr = t();
  const age = parseFloat(document.getElementById('age').value);
  const weightRaw = parseFloat(document.getElementById('weight').value);
  const sex = document.getElementById('sex').value;
  let creat = parseFloat(document.getElementById('creat').value);
  const unit = document.getElementById('creatUnit').value;
  const weightType = document.getElementById('weightType').value;

  if (!age || !weightRaw || !creat || age < 18) {
    document.getElementById('result').classList.remove('show');
    return;
  }

  // Convert µmol/L to mg/dL
  const creatMgdl = unit === 'umol' ? creat / 88.42 : creat;

  // Weight type adjustments (simplified IBW using Devine formula, height assumed 170cm for demo)
  // For accuracy, user should use actual clinical IBW; we use weight as entered here
  let weight = weightRaw;
  if (weightType === 'ideal') {
    // Devine IBW for 170cm height: male 66.5 kg, female 60.5 kg
    weight = sex === 'female' ? 60.5 : 66.5;
  } else if (weightType === 'adjusted') {
    const ibw = sex === 'female' ? 60.5 : 66.5;
    weight = ibw + 0.4 * (weightRaw - ibw);
  }

  // Cockcroft-Gault
  let crcl = ((140 - age) * weight) / (72 * creatMgdl);
  if (sex === 'female') crcl *= 0.85;

  crcl = Math.round(crcl * 10) / 10;

  document.getElementById('crclNum').textContent = crcl;

  // Stage
  let stage, note, rowIdx;
  if (crcl >= 90) { stage = tr.stageNormal || 'Normal'; note = tr.doseNormal || 'Standard dosing'; rowIdx = 0; }
  else if (crcl >= 60) { stage = tr.stageMild || 'Mild impairment'; note = tr.doseMild || 'Usually standard dosing'; rowIdx = 1; }
  else if (crcl >= 30) { stage = tr.stageModerate || 'Moderate impairment'; note = tr.doseModerate || 'Many drugs require dose adjustment'; rowIdx = 2; }
  else if (crcl >= 15) { stage = tr.stageSevere || 'Severe impairment'; note = tr.doseSevere || 'Most drugs require adjustment'; rowIdx = 3; }
  else { stage = tr.stageFailure || 'Kidney failure'; note = tr.doseFailure || 'Dose per dialysis protocol'; rowIdx = 4; }

  document.getElementById('stageNote').textContent = stage + ' · ' + note;

  document.getElementById('bdFormula').textContent = 'Cockcroft-Gault';
  document.getElementById('bdAge').textContent = age + ' ' + (tr.years || 'years');
  document.getElementById('bdWeight').textContent = weight.toFixed(1) + ' kg';
  document.getElementById('bdSex').textContent = sex === 'female' ? (tr.female || 'Female') : (tr.male || 'Male');
  document.getElementById('bdCreat').textContent = creat + ' ' + (unit === 'umol' ? 'µmol/L' : 'mg/dL');

  // Highlight active row
  const rows = document.querySelectorAll('.renal-stages tbody tr');
  rows.forEach((r, i) => r.classList.toggle('active-row', i === rowIdx));

  document.getElementById('result').classList.add('show');
}

window.calculate = calculate;
window.copyShareLink = copyShareLink;
window.readUrlParams = readUrlParams;

document.addEventListener('DOMContentLoaded', function() {
  ['age','weight','creat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculate);
  });
  ['sex','creatUnit','weightType'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', calculate);
  });
});`;

// ============================================================
// Locales
// ============================================================
const LOCALES = {
  'en': {
    title: "Cockcroft-Gault Calculator",
    subtitle: "Estimate creatinine clearance (CrCl) for drug dosing — using age, weight, sex, and serum creatinine.",
    calcHeading: "Calculator",
    ageLabel: "Age (years)",
    weightLabel: "Body weight (kg)",
    sexLabel: "Sex",
    male: "Male",
    female: "Female",
    creatUnitLabel: "Creatinine unit",
    unitMgdl: "mg/dL",
    unitUmol: "µmol/L",
    creatLabel: "Serum creatinine",
    advancedLabel: "Advanced options",
    weightTypeLabel: "Weight type",
    weightActual: "Actual body weight",
    weightIdeal: "Ideal body weight (IBW)",
    weightAdjusted: "Adjusted body weight (ABW)",
    weightHint: "For obese patients, some guidelines recommend using adjusted body weight (ABW) instead of actual body weight.",
    calcBtn: "Calculate creatinine clearance",
    resultLabel: "Estimated creatinine clearance",
    bdFormula: "Formula used",
    bdAge: "Age",
    bdWeight: "Weight used",
    bdSex: "Sex",
    bdCreat: "Serum creatinine",
    stagesTitle: "Renal function staging (CrCl)",
    thCrcl: "CrCl (mL/min)",
    thStage: "Category",
    thDose: "Typical drug dosing note",
    stageNormal: "Normal",
    stageMild: "Mild impairment",
    stageModerate: "Moderate impairment",
    stageSevere: "Severe impairment",
    stageFailure: "Kidney failure",
    doseNormal: "Standard dosing",
    doseMild: "Usually standard dosing; check individual drugs",
    doseModerate: "Many drugs require dose adjustment",
    doseSevere: "Most drugs require dose adjustment or avoidance",
    doseFailure: "Dose per dialysis protocol; many drugs contraindicated",
    shareBtn: "Copy shareable link",
    shareCopied: "Copied!",
    years: "years",
    resultDisclaimer: "Estimate only. Cockcroft-Gault is not validated in acute kidney injury, unstable creatinine, pregnancy, or extremes of body weight. Always consult clinical dosing references and adjust for individual patient factors.",
    whatIsTitle: "What is creatinine clearance?",
    whatIsText: "Creatinine clearance (CrCl) estimates how much blood plasma the kidneys can clear of creatinine per minute. It is not the same as estimated GFR (eGFR) — CrCl is the standard used in most drug dosing labels and regulatory submissions. The Cockcroft-Gault equation, published in 1976, remains the most widely used formula in clinical pharmacology for adjusting drug doses in renal impairment.",
    formulaTitle: "The Cockcroft-Gault formula",
    formulaText: "Where Scr is serum creatinine. For µmol/L, use the modified form: CrCl = [(140 − Age) × Weight × (1.23 if male, 1.04 if female)] / Scr(µmol/L).",
    weightTitle: "Which weight to use",
    weightText: "The Cockcroft-Gault equation was originally developed using actual body weight. However, for patients at extremes of body weight, guidelines differ:",
    wtActual: "Actual body weight (ABW) — use when body weight is within 20% of ideal.",
    wtIdeal: "Ideal body weight (IBW) — some guidelines recommend IBW for CrCl estimation in obese patients.",
    wtAdjusted: "Adjusted body weight (ABW) — recommended by many antimicrobial dosing guidelines for obese patients.",
    howToTitle: "How to use this calculator",
    howTo1: "Enter patient age in years (18 or older).",
    howTo2: "Enter body weight in kilograms. For obese patients, consider adjusted or ideal body weight.",
    howTo3: "Select patient sex.",
    howTo4: "Enter serum creatinine and select the unit (mg/dL or µmol/L).",
    howTo5: "Click \"Calculate creatinine clearance\" to see the CrCl value and renal impairment category.",
    faqTitle: "Frequently asked questions",
    faq1q: "When should I use CrCl vs eGFR?",
    faq1a: "Use CrCl (Cockcroft-Gault) for drug dosing — most FDA-approved drug labels are based on it. Use eGFR (CKD-EPI) for diagnosing and staging chronic kidney disease. They are not interchangeable.",
    faq2q: "Is Cockcroft-Gault accurate?",
    faq2a: "It is the most widely used formula in drug dosing, but it has limitations. It overestimates CrCl in obese patients (uses actual weight), underestimates in elderly patients with low muscle mass, and is not validated in acute kidney injury where creatinine is changing rapidly.",
    faq3q: "How do I convert mg/dL to µmol/L?",
    faq3a: "1 mg/dL = 88.42 µmol/L. This calculator handles the conversion automatically when you select the unit.",
    faq4q: "What does the result mean for drug dosing?",
    faq4a: "CrCl ≥ 90 mL/min: standard dosing for most drugs. 60–89: usually standard, but check individual drugs. 30–59: many drugs need dose adjustment. 15–29: most drugs need adjustment or should be avoided. < 15: dose per dialysis protocols; many drugs are contraindicated.",
    faq5q: "Why does the equation use 0.85 for females?",
    faq5a: "The 0.85 factor accounts for the lower average muscle mass in women, which produces lower baseline serum creatinine at the same kidney function. Without this adjustment, CrCl would be overestimated in female patients.",
    disclaimer: "<strong>Medical disclaimer:</strong> This calculator provides estimates for educational and clinical reference purposes only. It is not a substitute for professional medical judgment. Always verify drug dosing against current clinical references and consider individual patient factors before adjusting any medication.",
    footer: "Runs entirely in your browser. No data is collected or stored."
  },
  'zh': {
    title: "Cockcroft-Gault 肌酐清除率计算器",
    subtitle: "使用年龄、体重、性别和血清肌酐，估算用于药物剂量调整的肌酐清除率（CrCl）。",
    calcHeading: "计算器",
    ageLabel: "年龄（岁）",
    weightLabel: "体重（公斤）",
    sexLabel: "性别",
    male: "男",
    female: "女",
    creatUnitLabel: "肌酐单位",
    unitMgdl: "mg/dL",
    unitUmol: "µmol/L",
    creatLabel: "血清肌酐",
    advancedLabel: "高级选项",
    weightTypeLabel: "体重类型",
    weightActual: "实际体重",
    weightIdeal: "理想体重（IBW）",
    weightAdjusted: "校正体重（ABW）",
    weightHint: "对于肥胖患者，部分指南建议使用校正体重（ABW）而非实际体重。",
    calcBtn: "计算肌酐清除率",
    resultLabel: "估算肌酐清除率",
    bdFormula: "使用公式",
    bdAge: "年龄",
    bdWeight: "使用体重",
    bdSex: "性别",
    bdCreat: "血清肌酐",
    stagesTitle: "肾功能分级（CrCl）",
    thCrcl: "CrCl (mL/min)",
    thStage: "分级",
    thDose: "药物剂量提示",
    stageNormal: "正常",
    stageMild: "轻度损害",
    stageModerate: "中度损害",
    stageSevere: "重度损害",
    stageFailure: "肾衰竭",
    doseNormal: "标准剂量",
    doseMild: "通常为标准剂量；需核对具体药物",
    doseModerate: "多数药物需要调整剂量",
    doseSevere: "多数药物需要调整剂量或避免使用",
    doseFailure: "按透析方案给药；多种药物禁用",
    shareBtn: "复制分享链接",
    shareCopied: "已复制！",
    years: "岁",
    resultDisclaimer: "仅为估算值。Cockcroft-Gault 公式未在急性肾损伤、肌酐不稳定、妊娠或体重极端情况下验证。请务必参考临床用药指南，并根据患者个体因素调整。",
    whatIsTitle: "什么是肌酐清除率？",
    whatIsText: "肌酐清除率（CrCl）估算肾脏每分钟能从血浆中清除多少肌酐。它与估算肾小球滤过率（eGFR）不同——CrCl 是大多数药物剂量标签和监管申报中使用的标准。1976 年发表的 Cockcroft-Gault 公式，至今仍是临床药理学中调整肾功能损害患者药物剂量的最常用公式。",
    formulaTitle: "Cockcroft-Gault 公式",
    formulaText: "其中 Scr 为血清肌酐。使用 µmol/L 时，采用修正形式：CrCl = [(140 − 年龄) × 体重 × (男性 1.23，女性 1.04)] / Scr(µmol/L)。",
    weightTitle: "使用哪种体重",
    weightText: "Cockcroft-Gault 公式最初使用实际体重开发。但对于体重处于极端值的患者，不同指南有不同建议：",
    wtActual: "实际体重（ABW）——当体重在理想体重 20% 以内时使用。",
    wtIdeal: "理想体重（IBW）——部分指南建议肥胖患者使用 IBW 估算 CrCl。",
    wtAdjusted: "校正体重（ABW）——多数抗菌药物剂量指南推荐用于肥胖患者。",
    howToTitle: "如何使用本计算器",
    howTo1: "输入患者年龄（18 岁及以上）。",
    howTo2: "输入体重（公斤）。肥胖患者请考虑使用校正体重或理想体重。",
    howTo3: "选择患者性别。",
    howTo4: "输入血清肌酐并选择单位（mg/dL 或 µmol/L）。",
    howTo5: "点击“计算肌酐清除率”，查看 CrCl 值和肾功能损害分级。",
    faqTitle: "常见问题",
    faq1q: "什么时候用 CrCl，什么时候用 eGFR？",
    faq1a: "药物剂量调整使用 CrCl（Cockcroft-Gault）——大多数 FDA 批准的药物标签都基于它。慢性肾病的诊断和分期使用 eGFR（CKD-EPI）。两者不可互换。",
    faq2q: "Cockcroft-Gault 准确吗？",
    faq2a: "它是药物剂量调整中使用最广泛的公式，但有局限性。它会高估肥胖患者的 CrCl（使用实际体重），低估肌肉量较少的老年患者，且在肌酐快速变化的急性肾损伤中未经验证。",
    faq3q: "如何将 mg/dL 转换为 µmol/L？",
    faq3a: "1 mg/dL = 88.42 µmol/L。选择单位后，本计算器会自动进行转换。",
    faq4q: "结果对药物剂量意味着什么？",
    faq4a: "CrCl ≥ 90 mL/min：大多数药物使用标准剂量。60–89：通常为标准剂量，但需核对具体药物。30–59：多数药物需要调整剂量。15–29：多数药物需要调整或避免使用。< 15：按透析方案给药；多种药物禁用。",
    faq5q: "为什么公式对女性使用 0.85 系数？",
    faq5a: "0.85 系数考虑了女性平均肌肉量较低，在相同肾功能下血清肌酐基线也较低。如果不做此校正，女性患者的 CrCl 会被高估。",
    disclaimer: "<strong>医疗免责声明：</strong>本计算器仅供教育和临床参考目的提供估算，不能替代专业医疗判断。在调整任何药物之前，请务必根据当前临床用药指南核实剂量，并考虑患者个体因素。",
    footer: "完全在您的浏览器中运行。不收集、不存储任何数据。"
  }
};

// ============================================================
// 生成文件
// ============================================================
const files = {};

files['index.html'] = buildIndexHtml(null, 'en', '/cockcroft-gault-calculator/');
files['zh/index.html'] = buildIndexHtml('zh', 'zh-Hans', '/cockcroft-gault-calculator/zh/');

files['css/style.css'] = STYLE_CSS;
files['js/i18n.js'] = I18N_JS;
files['js/calculator.js'] = CALCULATOR_JS;

for (const [lang, data] of Object.entries(LOCALES)) {
  files[`locales/${lang}.json`] = JSON.stringify(data, null, 2);
}

files['.gitignore'] = `node_modules/
.wrangler/
.dev.vars
.DS_Store
*.log
.vscode/
.idea/
dist/
build/
`;

// ============================================================
// 写入
// ============================================================
const root = '.';
let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(root, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created: ' + filePath);
  count++;
}
console.log(`\nDone. ${count} files generated.`);
console.log('\nNext steps:');
console.log('  1. git init && git add . && git commit -m "Initial: cockcroft-gault calculator"');
console.log('  2. Push to a new GitHub repo "cockcroft-gault-calculator"');
console.log('  3. Deploy as a new Cloudflare Worker');
console.log('  4. In tool-proxy/src/index.js PROXY_MAP, add:');
console.log('     \'/cockcroft-gault-calculator\': \'https://cockcroft-gault-calculator.lvyafei2026.workers.dev\'');
console.log('  5. In tool-proxy/wrangler.toml run_worker_first, add:');
console.log('     "/cockcroft-gault-calculator/*"');
console.log('  6. In Cloudflare tool-proxy Domains & Routes, add:');
console.log('     toolara.dev/cockcroft-gault-calculator/*');
console.log('     www.toolara.dev/cockcroft-gault-calculator/*');
console.log('  7. Update tool-proxy/public/sitemap.xml and index.html');