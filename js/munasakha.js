// Islamic Calculator Pro - munasakha.js: munasakha (multi-stage) calculator
// Split from the original single-file app; loaded as a classic script.

// ==================== MUNASAKHA (MULTI-STAGE) ENGINE ====================
let munasakhaAutoShare = null;
function populateMunasakhaDropdown(activeHeirs, netEstate) {
  const sel = document.getElementById('munasakhaHeirSelect');
  if (!sel) return;
  const shareEl = document.getElementById('munasakhaStage1Share');
  const prevOpt = (sel.options && sel.selectedIndex >= 0) ? sel.options[sel.selectedIndex] : null;
  const prevHid = prevOpt && prevOpt.dataset ? prevOpt.dataset.hid : null;
  if (activeHeirs.length === 0) {
    sel.innerHTML = `<option value="0">کوئی وارث منتخب نہیں (دستی رقم درج کریں)</option>`;
    return;
  }
  sel.innerHTML = activeHeirs.map(h => {
    const perPerson = Math.round((netEstate * h.shareRatio) / h.count);
    return `<option value="${perPerson}" data-hid="${h.id}">${getHeirDisplayName(h.id)}: فی کس حصہ: ${formatNum(perPerson, 0)}</option>`;
  }).join('');
  let idx = 0;
  if (prevHid) { const f = activeHeirs.findIndex(h => h.id === prevHid); if (f >= 0) idx = f; }
  sel.selectedIndex = idx;
  // Keep the displayed heir and the share amount in sync, but never
  // overwrite an amount the user typed by hand.
  const newVal = parseFloat(sel.value) || 0;
  if (shareEl && (shareEl.value === '' || munasakhaAutoShare === null || (parseFloat(shareEl.value) || 0) === munasakhaAutoShare)) {
    shareEl.value = newVal;
    munasakhaAutoShare = newVal;
  }
}

function onMunasakhaHeirChange() {
  const val = parseFloat(document.getElementById('munasakhaHeirSelect').value) || 0;
  document.getElementById('munasakhaStage1Share').value = val;
  munasakhaAutoShare = val;
  calculateMunasakha();
}

function sendToMunasakha() {
  try {
    if (window.__munasakhaTransfer) sessionStorage.setItem('munasakhaTransfer', JSON.stringify(window.__munasakhaTransfer));
  } catch (e) {}
  location.href = 'munasakha.html';
}

function calculateMunasakha() {
  const stage1Share = Math.max(0, parseFloat(document.getElementById('munasakhaStage1Share').value) || 0);
  const g2 = document.getElementById('munasakhaGender2').value;
  const m2Counts = {};
  Object.keys(heirCounts).forEach(k => { m2Counts[k] = 0; });

  const sp = parseInt(document.getElementById('m2Spouse').value, 10) || 0;
  if (g2 === 'male') m2Counts.wife = Math.min(4, sp);
  else m2Counts.husband = Math.min(1, sp);

  m2Counts.son = Math.max(0, parseInt(document.getElementById('m2Sons').value, 10) || 0);
  m2Counts.daughter = Math.max(0, parseInt(document.getElementById('m2Daughters').value, 10) || 0);
  m2Counts.father = Math.min(1, Math.max(0, parseInt(document.getElementById('m2Father').value, 10) || 0));
  m2Counts.mother = Math.min(1, Math.max(0, parseInt(document.getElementById('m2Mother').value, 10) || 0));
  m2Counts.real_brother = Math.max(0, parseInt(document.getElementById('m2Brothers').value, 10) || 0);

  const res2 = solveHanafiMirath(m2Counts);
  const box = document.getElementById('munasakhaOutputContainer');
  if (res2.activeHeirs.length === 0) {
    box.innerHTML = `<div class="p-4 text-center text-slate-500">میتِ ثانی کے ورثاء کی تعداد درج کریں۔</div>`;
    return;
  }

  const rows = res2.activeHeirs.map(h => {
    const tot = stage1Share * h.shareRatio;
    const per = tot / h.count;
    return `
      <tr class="border-b border-slate-200">
        <td class="py-2.5 px-3 font-bold">${getHeirDisplayName(h.id)}</td>
        <td class="py-2.5 px-2 text-center font-mono-num">${h.count}</td>
        <td class="py-2.5 px-2 text-center font-mono-num">${h.siham} / ${h.totalSiham}</td>
        <td class="py-2.5 px-2 text-center font-mono-num">${(h.shareRatio * 100).toFixed(2)}%</td>
        <td class="py-2.5 px-3 text-center font-mono-num">${formatNum(per, 0)}</td>
        <td class="py-2.5 px-3 text-center font-mono-num font-bold text-emerald-900">${formatNum(tot, 0)}</td>
      </tr>`;
  }).join('');

  box.innerHTML = `
    <table class="w-full text-sm text-right">
      <thead class="bg-emerald-900 text-white text-xs">
        <tr>
          <th class="py-2.5 px-3">میتِ ثانی کا وارث</th>
          <th class="py-2.5 px-2 text-center">تعداد</th>
          <th class="py-2.5 px-2 text-center">سہام</th>
          <th class="py-2.5 px-2 text-center">فیصد</th>
          <th class="py-2.5 px-3 text-center">فی کس رقم</th>
          <th class="py-2.5 px-3 text-center">مجموعی رقم</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function applyMunasakhaTransfer() {
  try {
    const raw = sessionStorage.getItem('munasakhaTransfer');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.activeHeirs) && data.activeHeirs.length) {
      populateMunasakhaDropdown(data.activeHeirs, data.netEstate || 0);
    }
  } catch (e) {}
}
