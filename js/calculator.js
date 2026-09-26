function t() { return (window.__i18n && window.__i18n.t) || {}; }

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
});