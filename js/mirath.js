// Islamic Calculator Pro - mirath.js: inheritance page (grid, gender, calculation, chart, smart parser, presets, assets)
// Split from the original single-file app; loaded as a classic script.

// ==================== UI RENDERING & TABS ====================
function renderHeirsGrid() {
  const container = document.getElementById('heirsGridContainer');
  if (!container) return;
  let html = '';

  HEIR_CATEGORIES.forEach(cat => {
    const catTitle = currentLang === 'en' ? cat.titleEn : (currentLang === 'ro' ? (cat.titleRo || cat.titleEn) : (currentLang === 'hi' ? (cat.titleHi || cat.titleEn) : cat.titleUr));
    const isDistant = (cat.id === 'other_agnates' || cat.id === 'distant_kindred');
    const toggleBtn = isDistant
      ? `<button type="button" onclick="toggleCategory('${cat.id}')" class="md:hidden text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded-lg px-2.5 py-1">➕ دکھائیں / چھپائیں</button>`
      : '';
    html += `<div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
      <div class="flex items-center justify-between mb-3 pb-1.5 border-b border-slate-200">
        <h3 class="text-xs sm:text-sm font-bold text-emerald-950">${catTitle}</h3>
        ${toggleBtn}
      </div>
      <div ${isDistant ? `id="catBody-${cat.id}" ` : ''}class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5${isDistant ? ' cat-body' : ''}">`;

    cat.heirs.forEach(h => {
      const genderBlock = (h.onlyForDeceased && h.onlyForDeceased !== deceasedGender);
      if (genderBlock) {
        // Fully hide heirs that do not apply to the deceased's gender (responsive cleanup)
        if ((heirCounts[h.id] || 0) > 0) heirCounts[h.id] = 0;
        return;
      }
      const hajb = getHeirForcedBlock(h.id);
      const isBlocked = !!hajb;
      if (isBlocked && (heirCounts[h.id] || 0) > 0) heirCounts[h.id] = 0;
      const count = isBlocked ? 0 : (heirCounts[h.id] || 0);
      const label = getHeirDisplayName(h.id);
      const activeClass = count > 0
        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/40'
        : 'bg-white border-slate-200';
      const opacityClass = isBlocked ? 'opacity-40 pointer-events-none' : '';
      let blockReason = '';
      if (genderBlock) {
        blockReason = currentLang === 'en'
          ? (h.id === 'wife' ? 'Selectable only for a male deceased' : 'Selectable only for a female deceased')
          : (h.id === 'wife' ? 'صرف مرد میت کے لیے قابلِ انتخاب' : 'صرف خاتون میت کے لیے قابلِ انتخاب');
      } else if (hajb) {
        blockReason = currentLang === 'en' ? hajb.en : hajb.ur;
      }

      html += `
        <div class="flex items-center justify-between p-2.5 rounded-xl border transition ${activeClass} ${opacityClass}">
          <div class="pe-1">
            <span class="text-xs sm:text-sm font-bold text-slate-800 block">${label}</span>
            ${h.max < 20 ? `<span class="text-[10px] text-slate-500">Max: ${h.max}</span>` : ''}
            ${blockReason ? `<span class="block text-[10px] leading-snug text-red-600 font-semibold mt-0.5">${blockReason}</span>` : ''}
          </div>
          <div class="flex items-center gap-1.5 shrink-0" dir="ltr">
            <button type="button" ${isBlocked ? 'disabled' : ''} onclick="changeHeirCount('${h.id}', -1)" class="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm flex items-center justify-center transition">−</button>
            <span id="heirCount-${h.id}" class="w-7 text-center font-bold font-mono-num text-sm ${count > 0 ? 'text-emerald-800' : 'text-slate-500'}">${count}</span>
            <button type="button" ${isBlocked ? 'disabled' : ''} onclick="changeHeirCount('${h.id}', 1)" class="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center transition">+</button>
          </div>
        </div>`;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
  applyCategoryCollapse();
}

// On small screens the distant-relative categories start collapsed (unless they hold a count)
const openCats = new Set();
function applyCategoryCollapse() {
  document.querySelectorAll('.cat-body').forEach(el => {
    if (window.innerWidth >= 768) { el.classList.remove('hidden'); return; }
    const catId = el.id.replace('catBody-', '');
    const cat = HEIR_CATEGORIES.find(c => c.id === catId);
    const total = cat ? cat.heirs.reduce((a, h) => a + (heirCounts[h.id] || 0), 0) : 0;
    if (!openCats.has(catId) && total === 0) el.classList.add('hidden');
    else el.classList.remove('hidden');
  });
}
function toggleCategory(catId) {
  const el = document.getElementById('catBody-' + catId);
  if (!el) return;
  const willOpen = el.classList.contains('hidden');
  el.classList.toggle('hidden');
  if (willOpen) openCats.add(catId); else openCats.delete(catId);
}

function changeHeirCount(id, delta) {
  const meta = getHeirMeta(id);
  if (meta.onlyForDeceased && meta.onlyForDeceased !== deceasedGender) return;
  if (getHeirForcedBlock(id)) return;
  const next = Math.max(0, Math.min(meta.max || 20, (heirCounts[id] || 0) + delta));
  heirCounts[id] = next;
  renderHeirsGrid();
  calculateMirath();
}

function setDeceasedGender(gender) {
  deceasedGender = gender;
  if (gender === 'male') {
    heirCounts.husband = 0;
  } else {
    heirCounts.wife = 0;
  }
  const mBtn = document.getElementById('genderBtn-male');
  const fBtn = document.getElementById('genderBtn-female');
  if (gender === 'male') {
    mBtn.className = 'py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-700 text-white shadow transition flex items-center justify-center gap-2 is-active';
    fBtn.className = 'py-2.5 px-4 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition flex items-center justify-center gap-2';
  } else {
    fBtn.className = 'py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-700 text-white shadow transition flex items-center justify-center gap-2 is-active';
    mBtn.className = 'py-2.5 px-4 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition flex items-center justify-center gap-2';
  }
  mBtn.setAttribute('aria-pressed', gender === 'male' ? 'true' : 'false');
  fBtn.setAttribute('aria-pressed', gender === 'female' ? 'true' : 'false');
  renderHeirsGrid();
  calculateMirath();
}

function resetMirathHeirs() {
  Object.keys(heirCounts).forEach(k => { heirCounts[k] = 0; });
  renderHeirsGrid();
  calculateMirath();
  showToast('تمام ورثاء کی تعداد صفر کر دی گئی ہے', '🔄');
}

// ==================== CALCULATE & RENDER MIRATH ====================
function formatLandBreakdown(totalMarlas, marlaSqFt) {
  if (totalMarlas <= 0.0001) return '';
  const kanals = Math.floor(totalMarlas / 20);
  const remMarlas = totalMarlas - (kanals * 20);
  const sqft = totalMarlas * marlaSqFt;
  const parts = [];
  if (kanals > 0) parts.push(`${kanals} کنال`);
  if (remMarlas > 0.01) parts.push(`${remMarlas.toFixed(2)} مرلہ`);
  return `${parts.join(' ')} (${formatNum(sqft, 0)} Sq.Ft)`;
}

function calculateMirath() {
  const currency = document.getElementById('currencySelect').value || 'PKR';
  const gross = Math.max(0, parseFloat(document.getElementById('grossEstateInput').value) || 0);
  const funeral = Math.max(0, parseFloat(document.getElementById('funeralExpenseInput').value) || 0);
  const debt = Math.max(0, parseFloat(document.getElementById('debtInput').value) || 0);
  const rawWasiyyah = Math.max(0, parseFloat(document.getElementById('wasiyyahInput').value) || 0);
  const heirConsent = document.getElementById('wasiyyahHeirConsent').checked;

  const afterFuneralDebt = Math.max(0, gross - funeral - debt);
  const maxLegalWasiyyah = afterFuneralDebt / 3;
  const alertBox = document.getElementById('wasiyyahAlertBox');

  let appliedWasiyyah = rawWasiyyah;
  if (rawWasiyyah > maxLegalWasiyyah + 0.01) {
    alertBox.classList.remove('hidden');
    if (!heirConsent) {
      appliedWasiyyah = maxLegalWasiyyah;
    } else {
      appliedWasiyyah = Math.min(afterFuneralDebt, rawWasiyyah);
    }
  } else {
    alertBox.classList.add('hidden');
  }

  const netEstate = Math.max(0, afterFuneralDebt - appliedWasiyyah);
  document.getElementById('netEstateDisplay').textContent = `${currency} ${formatNum(netEstate, 0)}`;
  document.getElementById('netEstateBreakdownText').textContent =
    `${formatNum(gross)} (کل) − ${formatNum(funeral)} (کفن دفن) − ${formatNum(debt)} (قرض) − ${formatNum(appliedWasiyyah)} (وصیت)`;

  // Land calculation
  const marlaSqFt = parseFloat(document.getElementById('marlaSizeSelect').value) || 272.25;
  const acres = Math.max(0, parseFloat(document.getElementById('landAcres').value) || 0);
  const kanals = Math.max(0, parseFloat(document.getElementById('landKanals').value) || 0);
  const marlas = Math.max(0, parseFloat(document.getElementById('landMarlas').value) || 0);
  const extraSqFt = Math.max(0, parseFloat(document.getElementById('landSqFt').value) || 0);

  const totalMarlas = (acres * 160) + (kanals * 20) + marlas + (extraSqFt / marlaSqFt);
  const totalSqFt = totalMarlas * marlaSqFt;
  const totalSqYards = totalSqFt / 9;
  document.getElementById('totalLandSummary').textContent =
    totalMarlas > 0
      ? `کل قابلِ تقسیم رقبہ: ${(totalMarlas / 20).toFixed(2)} کنال (${totalMarlas.toFixed(2)} مرلہ | ${formatNum(totalSqYards, 1)} مربع گز | ${formatNum(totalSqFt, 0)} مربع فٹ)`
      : 'کوئی زمین درج نہیں کی گئی (صرف نقدی/مالیت تقسیم ہوگی)';

  // Solve Hanafi Mirath
  const result = solveHanafiMirath(heirCounts);
  document.getElementById('masalahSummaryBadge').textContent =
    `فقہی نوعیت: ${result.caseStatus} • کل تصحیح شدہ سہام (Total Siham): ${result.finalDen}`;

  const tbody = document.getElementById('mirathResultBody');
  const tfoot = document.getElementById('mirathResultFoot');
  let rowsHtml = '';
  let cardsHtml = '';

  if (result.activeHeirs.length === 0) {
    rowsHtml = `<tr><td colspan="9" class="py-6 text-center text-slate-500 font-semibold">براہِ کرم اوپر کم از کم ایک زندہ وارث منتخب کریں۔</td></tr>`;
    cardsHtml = `<div class="p-4 text-center text-slate-500 font-semibold bg-white rounded-xl border border-slate-200">براہِ کرم اوپر کم از کم ایک زندہ وارث منتخب کریں۔</div>`;
    tfoot.innerHTML = '';
  } else {
    // Largest-remainder rounding so displayed group amounts add up exactly to the net estate
    const exactGroups = result.activeHeirs.map(h => netEstate * h.shareRatio);
    const dispGroups = exactGroups.map(x => Math.floor(x));
    let leftoverRs = Math.round(netEstate) - dispGroups.reduce((a, b) => a + b, 0);
    exactGroups.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]).forEach(([frac, i]) => {
      if (leftoverRs > 0) { dispGroups[i] += 1; leftoverRs -= 1; }
    });
    result.activeHeirs.forEach((h, idx) => {
      const name = getHeirDisplayName(h.id);
      const pct = (h.shareRatio * 100).toFixed(2);
      const groupCash = dispGroups[idx];
      const perPersonCash = groupCash / h.count;
      const groupLandMarlas = totalMarlas * h.shareRatio;

      rowsHtml += `
        <tr class="hover:bg-emerald-50/40 transition">
          <td class="py-3 px-3 font-bold text-slate-900">${name}</td>
          <td class="py-3 px-2 text-center font-mono-num font-semibold">${h.count}</td>
          <td class="py-3 px-2 text-center"><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">${h.type}</span></td>
          <td class="py-3 px-2 text-center font-mono-num text-xs font-bold text-slate-700">${h.fixedLabel}</td>
          <td class="py-3 px-2 text-center font-mono-num font-bold text-emerald-800">${h.siham} / ${h.totalSiham}</td>
          <td class="py-3 px-2 text-center font-mono-num font-semibold">${pct}%</td>
          <td class="py-3 px-3 text-center font-mono-num text-slate-800">${currency} ${formatNum(perPersonCash, 0)}</td>
          <td class="py-3 px-3 text-center font-mono-num font-bold text-emerald-900">${currency} ${formatNum(groupCash, 0)}</td>
          <td class="py-3 px-3 text-center text-xs text-slate-700">${formatLandBreakdown(groupLandMarlas, marlaSqFt)}</td>
        </tr>`;
      cardsHtml += `
        <div class="bg-white rounded-xl border border-emerald-200 p-3.5">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-bold text-slate-900">${name} <span class="text-slate-500 font-semibold">(${h.count})</span></span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">${pct}%</span>
          </div>
          <div class="text-xs text-slate-600 space-y-0.5">
            <div>نوعیت: ${h.type} • سہام: <span class="font-mono-num font-bold">${h.siham} / ${h.totalSiham}</span></div>
            <div>فی کس: <span class="font-mono-num font-semibold">${currency} ${formatNum(perPersonCash, 0)}</span> • مجموعی: <span class="font-mono-num font-bold text-emerald-900">${currency} ${formatNum(groupCash, 0)}</span></div>
            ${groupLandMarlas > 0 ? `<div>زمین: ${formatLandBreakdown(groupLandMarlas, marlaSqFt)}</div>` : ''}
          </div>
        </div>`;
    });

    tfoot.innerHTML = `
      <tr>
        <td class="py-3 px-3">میزان (Total Distributed)</td>
        <td class="py-3 px-2 text-center font-mono-num">${result.activeHeirs.reduce((a, b) => a + b.count, 0)}</td>
        <td colspan="2" class="py-3 px-2 text-center">مکمل تقسیم</td>
        <td class="py-3 px-2 text-center font-mono-num">${result.finalDen} / ${result.finalDen}</td>
        <td class="py-3 px-2 text-center font-mono-num">100.00%</td>
        <td class="py-3 px-3 text-center"></td>
        <td class="py-3 px-3 text-center font-mono-num text-emerald-900">${currency} ${formatNum(netEstate, 0)}</td>
        <td class="py-3 px-3 text-center text-xs">${formatLandBreakdown(totalMarlas, marlaSqFt)}</td>
      </tr>`;
  }
  tbody.innerHTML = rowsHtml;
  const cardsBox = document.getElementById('mobileShareCards');
  if (cardsBox) cardsBox.innerHTML = cardsHtml;

  // Render Fiqhi Proof & Excluded Heirs
  const expBox = document.getElementById('fiqhExplanationsList');
  let expHtml = '';
  result.notes.forEach(n => {
    expHtml += `<div class="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">📌 <strong>اصولی نوٹ:</strong> ${n}</div>`;
  });
  result.activeHeirs.forEach(h => {
    expHtml += `<div class="p-2.5 rounded-lg bg-white border border-emerald-200 text-slate-800">✅ <strong>${getHeirDisplayName(h.id)} (${h.count}):</strong> ${h.reason}</div>`;
  });
  result.excludedHeirs.forEach(ex => {
    expHtml += `<div class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">🚫 <strong>${getHeirDisplayName(ex.id)} (${ex.count}): محجوب (Excluded):</strong> ${ex.reason}</div>`;
  });
  expBox.innerHTML = expHtml || '<div class="text-slate-500">ورثاء منتخب کریں تاکہ شرعی دلائل ظاہر ہوں۔</div>';

  // Haml (Unborn Child) Dual Scenario Calculation
  const hamlEnabled = document.getElementById('hamlToggle').checked;
  const hamlBox = document.getElementById('hamlComparisonBox');
  if (hamlEnabled) {
    hamlBox.classList.remove('hidden');
    const countsIfBoy = Object.assign({}, heirCounts, { son: (heirCounts.son || 0) + 1 });
    const countsIfGirl = Object.assign({}, heirCounts, { daughter: (heirCounts.daughter || 0) + 1 });
    const resBoy = solveHanafiMirath(countsIfBoy);
    const resGirl = solveHanafiMirath(countsIfGirl);

    const allIds = Array.from(new Set([
      ...resBoy.activeHeirs.map(x => x.id),
      ...resGirl.activeHeirs.map(x => x.id)
    ]));

    let hamlRows = '';
    let totalSafePaid = 0;

    allIds.forEach(id => {
      const bHeir = resBoy.activeHeirs.find(x => x.id === id);
      const gHeir = resGirl.activeHeirs.find(x => x.id === id);
      const baseCount = heirCounts[id] || 0;
      if (baseCount === 0) return; // The unborn baby itself is accounted in reserve

      const bPerHeadRatio = bHeir ? (bHeir.shareRatio / bHeir.count) : 0;
      const gPerHeadRatio = gHeir ? (gHeir.shareRatio / gHeir.count) : 0;

      const boyGroupCash = netEstate * bPerHeadRatio * baseCount;
      const girlGroupCash = netEstate * gPerHeadRatio * baseCount;
      const immediateSafeCash = Math.min(boyGroupCash, girlGroupCash);
      totalSafePaid += immediateSafeCash;

      hamlRows += `
        <tr class="border-b border-amber-200/70">
          <td class="py-2 px-3 font-bold">${getHeirDisplayName(id)} (${baseCount})</td>
          <td class="py-2 px-3 text-center font-mono-num">${currency} ${formatNum(boyGroupCash, 0)}</td>
          <td class="py-2 px-3 text-center font-mono-num">${currency} ${formatNum(girlGroupCash, 0)}</td>
          <td class="py-2 px-3 text-center font-mono-num font-bold text-emerald-900 bg-emerald-50">${currency} ${formatNum(immediateSafeCash, 0)}</td>
        </tr>`;
    });

    const reservedForBaby = Math.max(0, netEstate - totalSafePaid);
    const hamlWarn = (deceasedGender === 'male' && (heirCounts.wife || 0) === 0)
      ? `<div class="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold">تنبیہ: حمل کا یہ حساب اس صورت کے لیے ہے جب میت کی بیوہ حاملہ ہو۔ آپ نے ورثاء میں بیوہ منتخب نہیں کی، اس لیے یہ موازنہ صرف فرضی رہنمائی ہے، اس پر تقسیم نہ کریں۔</div>`
      : '';
    document.getElementById('hamlComparisonTable').innerHTML = hamlWarn + `
      <table class="w-full text-xs sm:text-sm text-right bg-white rounded-xl overflow-hidden border border-amber-300">
        <thead class="bg-amber-200/80 text-amber-950">
          <tr>
            <th class="py-2 px-3">موجودہ وارث</th>
            <th class="py-2 px-3 text-center">اگر لڑکا پیدا ہو (Boy Scenario)</th>
            <th class="py-2 px-3 text-center">اگر لڑکی پیدا ہو (Girl Scenario)</th>
            <th class="py-2 px-3 text-center">فوری قابلِ ادائیگی یقینی حصہ</th>
          </tr>
        </thead>
        <tbody>${hamlRows}</tbody>
        <tfoot class="bg-amber-100 font-bold text-amber-950">
          <tr>
            <td colspan="3" class="py-2.5 px-3">بچے کی ولادت تک موقوف (Reserved Share for Unborn Child & Adjustments):</td>
            <td class="py-2.5 px-3 text-center font-mono-num text-rose-800">${currency} ${formatNum(reservedForBaby, 0)}</td>
          </tr>
        </tfoot>
      </table>`;
  } else {
    hamlBox.classList.add('hidden');
  }

  // Update Chart
  updateMirathChart(result.activeHeirs, netEstate);
  // Populate Munasakha dropdown
  populateMunasakhaDropdown(result.activeHeirs, netEstate);
  window.__munasakhaTransfer = { activeHeirs: result.activeHeirs.map(h => ({ id: h.id, shareRatio: h.shareRatio, count: h.count })), netEstate: netEstate };
}

function updateMirathChart(activeHeirs, netEstate) {
  const ctx = document.getElementById('mirathChartCanvas');
  if (!ctx || typeof Chart === 'undefined') return;
  const labels = activeHeirs.map(h => `${getHeirDisplayName(h.id)} (${(h.shareRatio * 100).toFixed(1)}%)`);
  const values = activeHeirs.map(h => Math.round(netEstate * h.shareRatio));
  const palette = ['#047857', '#34C759', '#0E9594', '#0071E3', '#F59E0B', '#AF52DE', '#FF9500', '#5AC8FA', '#A47A46', '#FF6482', '#64D2FF', '#30DB5B'];
  const chartDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (mirathChartInstance && mirathChartDark === chartDark) {
    mirathChartInstance.data.labels = labels;
    const ds0 = mirathChartInstance.data.datasets[0];
    ds0.data = values;
    ds0.backgroundColor = palette.slice(0, Math.max(1, values.length));
    mirathChartInstance.update();
    return;
  }
  if (mirathChartInstance) {
    mirathChartInstance.destroy();
  }
  mirathChartDark = chartDark;
  mirathChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: palette.slice(0, Math.max(1, values.length)),
        borderWidth: 2,
        borderColor: chartDark ? '#1C1C1E' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, color: chartDark ? '#E5E5EA' : '#666666' }
        }
      }
    }
  });
}

// ==================== SMART PARSER & PRESETS ====================
function loadMirathPreset(type) {
  Object.keys(heirCounts).forEach(k => { heirCounts[k] = 0; });
  document.getElementById('funeralExpenseInput').value = 50000;
  document.getElementById('debtInput').value = 450000;
  document.getElementById('wasiyyahInput').value = 500000;
  document.getElementById('grossEstateInput').value = 10000000;
  document.getElementById('hamlToggle').checked = false;

  if (type === 'standard') {
    setDeceasedGender('male');
    heirCounts.wife = 1;
    heirCounts.son = 2;
    heirCounts.daughter = 2;
    heirCounts.father = 1;
    heirCounts.mother = 1;
  } else if (type === 'awl') {
    setDeceasedGender('female');
    heirCounts.husband = 1;
    heirCounts.real_sister = 2;
    heirCounts.mother = 1;
  } else if (type === 'radd') {
    setDeceasedGender('male');
    heirCounts.wife = 1;
    heirCounts.daughter = 2;
    heirCounts.mother = 1;
  } else if (type === 'hajb') {
    setDeceasedGender('male');
    heirCounts.wife = 1;
    heirCounts.son = 1;
    heirCounts.grandson = 2;
    heirCounts.real_brother = 2;
    heirCounts.real_paternal_uncle = 1;
  } else if (type === 'arham') {
    setDeceasedGender('male');
    heirCounts.daughters_son = 1;
    heirCounts.daughters_daughter = 2;
    heirCounts.maternal_aunt = 1;
  }
  renderHeirsGrid();
  calculateMirath();
  showToast('مثالی کیس لوڈ ہو گیا ہے!', '✨');
}

// ==================== SMART AUTOFILLER (advanced system) ====================
// Pipeline: normalize (digits/letters, English + Roman Urdu + Urdu script)
// -> heir lexicon match, longest phrase first, quantities as digits or
// number-words -> money (estate / debt / wasiyyat) and land extraction ->
// sharai validation with the SAME hajb rules as the heir cards
// (getHeirBlockInfo): anyone who cannot inherit in this case is NOT made
// an heir; they are reported with the reason instead -> apply + report.
const SMART_NUM_EN = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
const SMART_NUM_RO = { aik: 1, ik: 1, ek: 1, do: 2, teen: 3, tin: 3, char: 4, chaar: 4, panch: 5, paanch: 5, chhe: 6, chhay: 6, chay: 6, saat: 7, aath: 8, nau: 9, das: 10, gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16, satrah: 17, atharah: 18, unnis: 19, bees: 20 };
const SMART_NUM_UR = { 'واحد': 1, 'اثنان': 2, 'ثلاثہ': 3, 'اربعہ': 4, 'خمسہ': 5, 'ستہ': 6, 'سبعہ': 7, 'ثمانیہ': 8, 'تسعہ': 9, 'عشرہ': 10, 'ایک': 1, 'دو': 2, 'تین': 3, 'چار': 4, 'پانچ': 5, 'چھ': 6, 'سات': 7, 'آٹھ': 8, 'نو': 9, 'دس': 10, 'گیارہ': 11, 'بارہ': 12, 'تیرہ': 13, 'چودہ': 14, 'پندرہ': 15, 'سولہ': 16, 'سترہ': 17, 'اٹھارہ': 18, 'انیس': 19, 'بیس': 20 };
const SMART_TERMS = [
  { id: 'wife', terms: ['wife', 'wives', 'biwi', 'bewa', 'bewi', 'زوجہ', 'بیوی', 'بیوہ', 'بیگم'] },
  { id: 'husband', terms: ['husband', 'shohar', 'شوہر', 'خاوند'] },
  { id: 'son', terms: ['son', 'sons', 'beta', 'bete', 'betay', 'بیٹا', 'بیٹے', 'ابن'] },
  { id: 'daughter', terms: ['daughter', 'daughters', 'beti', 'betiyan', 'betian', 'بیٹی', 'بیٹیاں', 'بنت'] },
  { id: 'grandson', terms: ['grandson', 'grandsons', 'grand son', 'grand sons', 'pota', 'pote', 'potay', 'پوتا', 'پوتے'] },
  { id: 'granddaughter', terms: ['granddaughter', 'granddaughters', 'grand daughter', 'grand daughters', 'poti', 'potiyan', 'پوتی', 'پوتیاں'] },
  { id: 'great_grandson', terms: ['great grandson', 'great grandsons', 'par pota', 'parpota', 'پر پوتا'] },
  { id: 'great_granddaughter', terms: ['great granddaughter', 'great granddaughters', 'par poti', 'parpoti', 'پر پوتی'] },
  { id: 'father', terms: ['father', 'walid', 'waalid', 'والد', 'ابو', 'baap', 'bap', 'abbu', 'abba'] },
  { id: 'mother', terms: ['mother', 'walida', 'walidah', 'walda', 'والدہ', 'اماں', 'امی', 'امّی', 'ماں', 'maa', 'ammi', 'amma'] },
  { id: 'paternal_grandfather', terms: ['paternal grandfather', 'grandfather', 'dada', 'دادا', 'جد'] },
  { id: 'paternal_great_grandfather', terms: ['paternal great grandfather', 'great grandfather', 'par dada', 'pardada', 'پر دادا'] },
  { id: 'paternal_grandmother', terms: ['paternal grandmother', 'grandmother', 'dadi', 'دادی', 'جدہ'] },
  { id: 'paternal_great_grandmother', terms: ['paternal great grandmother', 'great grandmother', 'par dadi', 'pardadi', 'پر دادی'] },
  { id: 'maternal_grandfather', terms: ['maternal grandfather', 'nana', 'نانا'] },
  { id: 'maternal_grandmother', terms: ['maternal grandmother', 'nani', 'نانی'] },
  { id: 'maternal_great_grandmother', terms: ['maternal great grandmother', 'par nani', 'parnani', 'پر نانی'] },
  { id: 'real_brother', terms: ['full brother', 'full brothers', 'real brother', 'real brothers', 'brother', 'brothers', 'saga bhai', 'sagay bhai', 'bhai', 'bhaiyon', 'bhaiya', 'سگا بھائی', 'بھائی'] },
  { id: 'real_sister', terms: ['full sister', 'full sisters', 'real sister', 'real sisters', 'sister', 'sisters', 'sagi behan', 'sagay behan', 'sagi behnein', 'behnein', 'behnain', 'behen', 'سگی بہن', 'بہن', 'بہنیں'] },
  { id: 'consanguine_brother', terms: ['consanguine brother', 'paternal brother', 'half brother', 'half brothers', 'step brother', 'step brothers', 'sotela bhai', 'سوتیلا بھائی', 'baap shariq bhai', 'باپ شریک بھائی'] },
  { id: 'consanguine_sister', terms: ['consanguine sister', 'paternal sister', 'half sister', 'half sisters', 'step sister', 'step sisters', 'soteli behan', 'سوتیلی بہن', 'baap shariq behan', 'باپ شریک بہن'] },
  { id: 'uterine_sibling', terms: ['uterine brother', 'uterine sister', 'uterine siblings', 'maa shariq bhai', 'maa shariq behan', 'ماں شریک بھائی', 'ماں شریک بہن', 'akhyafi', 'اخیافی'] },
  { id: 'real_nephew', terms: ['nephew', 'nephews', 'bhatija', 'bhatije', 'brothers son', 'بھتیجا', 'بھتیجے'] },
  { id: 'consanguine_nephew', terms: ['consanguine nephew', 'paternal nephew', 'half nephew', 'baap shariq bhatija', 'باپ شریک بھتیجا'] },
  { id: 'real_paternal_uncle', terms: ['paternal uncle', 'full paternal uncle', 'uncle', 'uncles', 'chacha', 'taya', 'چچا', 'تایا'] },
  { id: 'consanguine_paternal_uncle', terms: ['consanguine paternal uncle', 'half paternal uncle', 'consanguine uncle', 'baap shariq chacha', 'باپ شریک چچا'] },
  { id: 'real_paternal_cousin', terms: ['paternal cousin', 'cousin', 'cousins', 'cousin brother', 'chacha zad', 'چچا زاد'] },
  { id: 'consanguine_paternal_cousin', terms: ['consanguine cousin', 'half cousin', 'baap shariq chacha zad'] },
  { id: 'daughters_son', terms: ['daughters son', 'daughter son', 'nawasa', 'nawase', 'نواسہ', 'نواسے'] },
  { id: 'daughters_daughter', terms: ['daughters daughter', 'daughter daughter', 'nawasi', 'نواسی'] },
  { id: 'sisters_son', terms: ['sisters son', 'sister son', 'bhanja', 'bhanje', 'بھانجا', 'بھانجے'] },
  { id: 'sisters_daughter', terms: ['sisters daughter', 'sister daughter', 'niece', 'bhanji', 'بھانجی'] },
  { id: 'brothers_daughter', terms: ['brothers daughter', 'brother daughter', 'bhatiji', 'بھتیجی'] },
  { id: 'paternal_aunt', terms: ['paternal aunt', 'aunt', 'phuphi', 'phupho', 'پھوپھی'] },
  { id: 'maternal_aunt', terms: ['maternal aunt', 'khala', 'خالہ'] },
  { id: 'maternal_uncle', terms: ['maternal uncle', 'mamu', 'mamoon', 'mamun', 'ماموں'] },
  { id: '__parents__', terms: ['walidain', 'parents', 'والدین', 'امی ابو'] }
];
const SMART_NEG = ['no', 'not', 'nahi', 'nhi', 'nahin', 'نہیں', 'na', 'نہ', 'ni'];
const SMART_MULT = { lakh: 100000, lakhs: 100000, 'لاکھ': 100000, crore: 10000000, crores: 10000000, 'کروڑ': 10000000, hazar: 1000, 'ہزار': 1000, thousand: 1000, million: 1000000, 'ارب': 1000000000 };

function smartNormalize(text) {
  let t = (text || '').toLowerCase();
  t = t.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  t = t.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/ة/g, 'ہ').replace(/ـ/g, '');
  t = t.replace(/(\d),(?=\d)/g, '$1');
  t = t.replace(/['’]/g, '');
  t = t.replace(/[,،؛;]/g, ' § ');
  t = t.replace(/(\d)\.(?=\d)/g, '$1\u0001');
  t = t.replace(/[.,،؛;:!?()\[\]{}"«»\-–—]/g, ' ');
  t = t.replace(/\u0001/g, '.');
  return t.replace(/\s+/g, ' ').trim();
}
function smartQty(token) {
  if (!token) return null;
  if (/^\d+$/.test(token)) return parseInt(token, 10);
  if (SMART_NUM_EN[token] != null) return SMART_NUM_EN[token];
  if (SMART_NUM_RO[token] != null) return SMART_NUM_RO[token];
  if (SMART_NUM_UR[token] != null) return SMART_NUM_UR[token];
  return null;
}

const SMART_FILLER = ['hai', 'hain', 'he', 'ہے', 'ہیں', 'tha', 'thi', 'تھا', 'تھی', 'zinda', 'زندہ', 'alive', 'maujood', 'majood', 'mojud', 'موجود', 'dono', 'دونوں', 'both', 'bhi', 'بھی'];
function smartScanHeirs(tokens) {
  const phrases = [];
  SMART_TERMS.forEach(entry => entry.terms.forEach(term => {
    phrases.push({ id: entry.id, parts: term.split(' ') });
  }));
  phrases.sort((a, b) => (b.parts.length - a.parts.length) || (b.parts.join(' ').length - a.parts.join(' ').length));
  const TERM_TOKENS = new Set();
  phrases.forEach(p => p.parts.forEach(w => TERM_TOKENS.add(w)));
  const found = {};
  const absent = [];
  const stepUsed = [];
  const used = new Array(tokens.length).fill(false);
  for (let i = 0; i < tokens.length; i++) {
    if (used[i] || tokens[i] === '§') continue;
    for (const ph of phrases) {
      const n = ph.parts.length;
      if (i + n > tokens.length) continue;
      let ok = true;
      for (let j = 0; j < n; j++) { if (used[i + j] || tokens[i + j] !== ph.parts[j]) { ok = false; break; } }
      if (!ok) continue;
      let qty = 1, qtyIdx = -1;
      if (i > 0 && !used[i - 1] && tokens[i - 1] !== '§') { const q = smartQty(tokens[i - 1]); if (q != null) { qty = q; qtyIdx = i - 1; } }
      // Trailing quantity binds to THIS heir ("bete 2, beti 1").
      if (qtyIdx < 0 && i + n < tokens.length && !used[i + n] && tokens[i + n] !== '§') {
        const q = smartQty(tokens[i + n]);
        if (q != null) { qty = q; qtyIdx = i + n; }
      }
      // Negation before the term ("no wife"), never across a clause break.
      let neg = false, negIdx = -1;
      for (let k = i - 1; k >= Math.max(0, i - 2); k--) {
        if (tokens[k] === '§') break;
        if (!used[k] && SMART_NEG.includes(tokens[k])) { neg = true; negIdx = k; }
      }
      // Negation as the rest of the clause ("beta nahi", "bete nahi hain"):
      // everything left in this clause must be negation/filler words only,
      // so "sons, no debt" and "sons not daughters" can never misfire.
      if (!neg) {
        let r = i + n, negSeen = -1, pure = true, steps = 0;
        while (r < tokens.length && tokens[r] !== '§') {
          if (r === qtyIdx) { r++; continue; }
          // A negation already claimed by a fellow heir in this same
          // clause still counts: the negation is shared, not consumed.
          if (SMART_NEG.includes(tokens[r])) { if (negSeen < 0) negSeen = r; r++; steps++; continue; }
          if (used[r]) { r++; continue; }
          if (/^\d/.test(tokens[r]) || smartQty(tokens[r]) != null) break;
          if (SMART_FILLER.includes(tokens[r])) { r++; steps++; continue; }
          // A fellow heir named before the negation shares it
          // ("walid walida majood nhi" negates both parents).
          if (negSeen < 0 && TERM_TOKENS.has(tokens[r])) { r++; steps++; continue; }
          // Distributed negation ("walid nhi walida bhi nhi"): a second
          // negation later in the clause confirms the first one binds.
          if (negSeen >= 0) {
            let moreNeg = false;
            for (let k = r + 1; k < tokens.length && tokens[k] !== '§'; k++) { if (SMART_NEG.includes(tokens[k])) { moreNeg = true; break; } }
            if (moreNeg) break;
          }
          pure = false; break;
        }
        if (pure && negSeen >= 0 && steps > 0) { neg = true; negIdx = negSeen; }
      }
      for (let j = 0; j < n; j++) used[i + j] = true;
      if (qtyIdx >= 0) used[qtyIdx] = true;
      if (neg && negIdx >= 0) used[negIdx] = true;
      if (ph.id === '__parents__') {
        if (neg) { if (!absent.includes('father')) absent.push('father'); if (!absent.includes('mother')) absent.push('mother'); }
        else { found.father = (found.father || 0) + 1; found.mother = (found.mother || 0) + 1; }
      } else if (neg) {
        if (!absent.includes(ph.id)) absent.push(ph.id);
      } else {
        found[ph.id] = (found[ph.id] || 0) + qty;
        const w0 = ph.parts.join(' ');
        if ((w0.indexOf('step') === 0 || w0.indexOf('sotel') === 0) && !stepUsed.includes(ph.id)) stepUsed.push(ph.id);
      }
      break;
    }
  }
  return { found, absent, used, stepUsed };
}

function smartMoneyScan(tokens, used) {
  const numAt = i => {
    const t = tokens[i];
    if (/^\d+(?:\.\d+)?$/.test(t)) return parseFloat(t);
    const q = smartQty(t);
    return q != null ? q : null;
  };
  const claim = idxs => idxs.forEach(x => { if (x != null && x >= 0) used[x] = true; });
  const land = {};
  for (let i = 0; i < tokens.length - 1; i++) {
    if (used[i]) continue;
    const v = numAt(i);
    if (v == null || used[i + 1]) continue;
    const unit = tokens[i + 1];
    if (['marla', 'marlas', 'مرلہ', 'مرلے'].includes(unit)) { land.marlas = v; claim([i, i + 1]); }
    else if (['kanal', 'kanals', 'کنال'].includes(unit)) { land.kanals = v; claim([i, i + 1]); }
    else if (['acre', 'acres', 'ایکڑ'].includes(unit)) { land.acres = v; claim([i, i + 1]); }
  }
  const DEBT_W = ['qarz', 'قرض', 'debt', 'loan', 'ادھار'];
  const WAS_W = ['wasiyyat', 'wasiyyah', 'وصیت', 'bequest'];
  const FUN_W = ['janaza', 'جنازہ', 'kafan', 'کفن', 'tadfeen', 'تدفین', 'funeral'];
  const EST_TOT_W = ['kul', 'کل', 'total', 'maliyat', 'مالیت', 'maal', 'مال'];
  const EST_PART_W = ['cash', 'رقم', 'raqam', 'jaidad', 'جائیداد', 'estate', 'assets', 'property'];
  // Nearest label, scanning outward; another unconsumed NUMBER is a barrier,
  // so a label can never steal an amount across a different amount.
  const nearest = (from, to, words) => {
    let best = 99, bestIdx = -1, bestSide = 1;
    for (let k = from - 1; k >= 0; k--) {
      if (used[k]) continue;
      if (tokens[k] === '§' || numAt(k) != null) break;
      if (words.includes(tokens[k])) { if (from - k < best) { best = from - k; bestIdx = k; bestSide = 0; } break; }
    }
    for (let k = to + 1; k < tokens.length; k++) {
      if (used[k]) continue;
      if (tokens[k] === '§' || numAt(k) != null) break;
      if (words.includes(tokens[k])) { const d = k - to; if (d < best) { best = d; bestIdx = k; bestSide = 1; } break; }
    }
    return { d: best, idx: bestIdx, side: bestSide };
  };
  let debt = null, wasiyyat = null, wasiyyatPct = null, funeral = null;
  let estateTotal = null, estateParts = null, estateFallback = null;
  for (let i = 0; i < tokens.length; i++) {
    if (used[i]) continue;
    let v = numAt(i), pct = false;
    if (v == null && /^\d+(?:\.\d+)?%$/.test(tokens[i])) { v = parseFloat(tokens[i]); pct = true; }
    if (v == null) continue;
    let spanEnd = i, multIdx = -1;
    if (!pct && i + 1 < tokens.length && !used[i + 1] && SMART_MULT[tokens[i + 1]]) { v = v * SMART_MULT[tokens[i + 1]]; multIdx = i + 1; spanEnd = i + 1; }
    if (!pct && multIdx < 0 && !/^\d/.test(tokens[i])) continue;
    if (!pct && (tokens[i + 1] === '%' || tokens[i + 1] === 'فیصد' || tokens[i + 1] === 'percent')) { pct = true; spanEnd = i + 1; }
    const dDebt = nearest(i, spanEnd, DEBT_W), dWas = nearest(i, spanEnd, WAS_W), dFun = nearest(i, spanEnd, FUN_W), dTot = nearest(i, spanEnd, EST_TOT_W), dPart = nearest(i, spanEnd, EST_PART_W);
    const cats = [
      { kind: 'debt', d: dDebt.d, idx: dDebt.idx, side: dDebt.side },
      { kind: 'wasiyyat', d: dWas.d, idx: dWas.idx, side: dWas.side },
      { kind: 'funeral', d: dFun.d, idx: dFun.idx, side: dFun.side },
      { kind: 'estateTotal', d: dTot.d, idx: dTot.idx, side: dTot.side },
      { kind: 'estatePart', d: dPart.d, idx: dPart.idx, side: dPart.side }
    ].filter(c => c.d <= 3).sort((a, b) => (a.d - b.d) || (a.side - b.side));
    if (!cats.length) {
      if (!pct && (multIdx >= 0 || v >= 10000)) { if (estateFallback == null || v > estateFallback) estateFallback = v; claim([i, multIdx]); }
      continue;
    }
    // Repeated labels ACCUMULATE (two debts are added, never dropped);
    // labelled estate parts are summed, an explicit total wins over parts.
    const c = cats[0];
    if (c.kind === 'debt' && !pct) { debt = (debt || 0) + v; claim([i, multIdx]); }
    else if (c.kind === 'wasiyyat') {
      if (pct) { if (wasiyyatPct == null) wasiyyatPct = parseFloat(tokens[i]); }
      else wasiyyat = (wasiyyat || 0) + v;
      claim([i, multIdx]);
    }
    else if (c.kind === 'funeral' && !pct) { funeral = (funeral || 0) + v; claim([i, multIdx]); }
    else if (c.kind === 'estateTotal' && !pct) { if (estateTotal == null || v > estateTotal) estateTotal = v; claim([i, multIdx]); }
    else if (c.kind === 'estatePart' && !pct) { estateParts = (estateParts || 0) + v; claim([i, multIdx]); }
  }
  const estate = estateTotal != null ? estateTotal : ((estateParts == null && estateFallback == null) ? null : (estateParts || 0) + (estateFallback || 0));
  return { land, debt, wasiyyat, wasiyyatPct, estate, funeral };
}

function parseSmartCase() {
  const en = currentLang === 'en';
  const inputEl = document.getElementById('smartInputText');
  const raw0 = inputEl ? (inputEl.value || '') : '';
  if (!raw0.trim()) {
    showToast(en ? 'Please write the case in the text box first' : 'براہِ کرم پہلے ٹیکسٹ باکس میں مسئلہ لکھیں', '⚠️');
    return;
  }
  const tokens = smartNormalize(raw0).split(' ').filter(Boolean);
  const scan = smartScanHeirs(tokens.slice());
  const workTokens = tokens.slice();
  scan.used.forEach((u, i) => { if (u) workTokens[i] = ''; });
  const usedFlags = workTokens.map(t => t === '');
  const money = smartMoneyScan(workTokens, usedFlags);

  const parsed = {};
  Object.keys(heirCounts).forEach(k => { parsed[k] = 0; });
  Object.keys(scan.found).forEach(id => { parsed[id] = scan.found[id]; });

  const notes = [];
  const hasTok = arr => tokens.some(t => arr.includes(t));
  let gender = deceasedGender;
  const femaleMark = (hasTok(['aurat', 'عورت', 'khatoon', 'خاتون', 'female', 'woman']) && hasTok(['mayyat', 'میت', 'marhooma', 'مرحومہ', 'deceased'])) || hasTok(['marhooma', 'مرحومہ']);
  const maleMark = (hasTok(['mard', 'مرد', 'aadmi', 'آدمی', 'male', 'man']) && hasTok(['mayyat', 'میت', 'marhoom', 'مرحوم', 'deceased'])) || false;
  if (femaleMark) gender = 'female';
  else if (maleMark) gender = 'male';
  else if (parsed.husband > 0 && parsed.wife === 0) gender = 'female';
  else if (parsed.wife > 0 && parsed.husband === 0) gender = 'male';
  const excluded = [];
  if (gender === 'male' && parsed.husband > 0) {
    excluded.push({ id: 'husband', reason: en ? 'The deceased is male, so a husband cannot inherit' : 'میت مرد ہے، اس لیے شوہر وارث نہیں بن سکتا' });
    parsed.husband = 0;
  }
  if (gender === 'female' && parsed.wife > 0) {
    excluded.push({ id: 'wife', reason: en ? 'The deceased is female, so a wife cannot inherit' : 'میت خاتون ہے، اس لیے بیوی وارث نہیں بن سکتی' });
    parsed.wife = 0;
  }
  Object.keys(parsed).forEach(id => {
    if (parsed[id] > 0) {
      const meta = getHeirMeta(id);
      if (meta && meta.max && parsed[id] > meta.max) {
        notes.push((en ? 'Count adjusted: ' : 'تعداد شرعی حد پر لائی گئی: ') + getHeirDisplayName(id) + ' ' + parsed[id] + ' → ' + meta.max);
        parsed[id] = meta.max;
      }
    }
  });
  const info = getHeirBlockInfo(parsed);
  Object.keys(parsed).forEach(id => {
    if (parsed[id] > 0 && info[id]) {
      excluded.push({ id, reason: en ? info[id].en : info[id].ur });
      parsed[id] = 0;
    }
  });
  scan.absent.forEach(id => {
    notes.push((en ? 'Marked absent by you: ' : 'آپ کے بیان کے مطابق موجود نہیں: ') + getHeirDisplayName(id));
  });
  (scan.stepUsed || []).forEach(id => {
    notes.push((en ? 'Note: step wording read as paternal half sibling: ' : 'نوٹ: \'سوتیلا\' سے مراد علاتی (باپ شریک) لیا گیا ہے: ') + getHeirDisplayName(id));
  });

  const appliedIds = Object.keys(parsed).filter(id => parsed[id] > 0);
  const landFound = (money.land.marlas != null || money.land.kanals != null || money.land.acres != null);
  if (!appliedIds.length && !scan.absent.length && money.estate == null && money.debt == null && money.funeral == null && money.wasiyyat == null && money.wasiyyatPct == null && !landFound) {
    showToast(en ? 'No heir or amount could be understood. Please write names like: 1 wife, 2 sons, father, mother' : 'کوئی وارث یا رقم سمجھ نہیں آئی۔ مثال کے انداز میں لکھیں: 1 بیوہ، 2 بیٹے، والد، والدہ', '⚠️');
    return;
  }

  Object.keys(heirCounts).forEach(k => { heirCounts[k] = 0; });
  if (gender !== deceasedGender) setDeceasedGender(gender);
  Object.keys(parsed).forEach(id => { heirCounts[id] = parsed[id]; });
  const setVal = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = (v == null ? '' : v); };
  // Fields the new text does not mention are reset, so nothing stale
  // from a previous case silently changes this distribution.
  setVal('grossEstateInput', money.estate);
  setVal('debtInput', money.debt == null ? 0 : money.debt);
  setVal('funeralExpenseInput', money.funeral == null ? 0 : money.funeral);
  let wasiyyatApplied = money.wasiyyat;
  if (wasiyyatApplied == null && money.wasiyyatPct != null) {
    if (money.estate != null) {
      wasiyyatApplied = Math.round((money.estate - (money.debt || 0) - (money.funeral || 0)) * money.wasiyyatPct / 100);
      notes.push((en ? 'Wasiyyat calculated as ' : 'وصیت کی رقم فیصد سے نکالی گئی: ') + money.wasiyyatPct + '% = ' + wasiyyatApplied.toLocaleString('en-US'));
    } else {
      notes.push(en ? 'Wasiyyat percentage could not be applied because no total estate was written' : 'وصیت کی فیصد لاگو نہیں ہو سکی کیونکہ کل مال نہیں لکھا گیا');
    }
  }
  setVal('wasiyyahInput', wasiyyatApplied == null ? 0 : wasiyyatApplied);
  setVal('landMarlas', money.land.marlas == null ? 0 : money.land.marlas);
  setVal('landKanals', money.land.kanals == null ? 0 : money.land.kanals);
  setVal('landAcres', money.land.acres == null ? 0 : money.land.acres);
  setVal('landSqFt', 0);

  renderHeirsGrid();
  calculateMirath();

  const appliedTxt = appliedIds.map(id => getHeirDisplayName(id) + ' ×' + parsed[id]).join('، ');
  let reportHtml = '<strong>' + (en ? 'Auto-filled: ' : 'خودکار طور پر بھر دیا گیا: ') + '</strong>' + (appliedTxt || (scan.absent.length ? (en ? '(no heirs applied)' : '(کوئی وارث شامل نہیں)') : (en ? '(amounts only)' : '(صرف رقوم)')));
  const moneyBits = [];
  if (money.estate != null) moneyBits.push((en ? 'Estate ' : 'کل ترکہ ') + money.estate.toLocaleString('en-US'));
  if (money.debt != null) moneyBits.push((en ? 'Debt ' : 'قرض ') + money.debt.toLocaleString('en-US'));
  if (money.funeral != null) moneyBits.push((en ? 'Funeral ' : 'تجہیز و تکفین ') + money.funeral.toLocaleString('en-US'));
  if (wasiyyatApplied != null) moneyBits.push((en ? 'Wasiyyat ' : 'وصیت ') + wasiyyatApplied.toLocaleString('en-US'));
  if (landFound) moneyBits.push((en ? 'Land: ' : 'زمین: ') + [money.land.acres != null ? money.land.acres + (en ? ' acre' : ' ایکڑ') : '', money.land.kanals != null ? money.land.kanals + (en ? ' kanal' : ' کنال') : '', money.land.marlas != null ? money.land.marlas + (en ? ' marla' : ' مرلہ') : ''].filter(Boolean).join(' '));
  if (moneyBits.length) reportHtml += '<br/>' + moneyBits.join('، ');
  excluded.forEach(x => {
    reportHtml += '<br/><span class="smart-excl"><strong>' + (en ? 'Not made an heir: ' : 'وارث نہیں بنایا گیا: ') + '</strong>' + getHeirDisplayName(x.id) + '، ' + x.reason + '</span>';
  });
  notes.forEach(n => { reportHtml += '<br/>' + n; });
  const reportEl = document.getElementById('smartReport');
  if (reportEl) { reportEl.innerHTML = reportHtml; reportEl.classList.remove('hidden'); }
  showToast(en ? 'Form auto-filled by the smart parser' : 'اسمارٹ آٹو فلر سے فارم بھر دیا گیا!', '🤖');
}

// ==================== ITEMIZED ASSETS ====================
function addAssetItem() {
  const nameEl = document.getElementById('newAssetName');
  const valEl = document.getElementById('newAssetValue');
  const name = (nameEl.value || '').trim();
  const val = parseFloat(valEl.value) || 0;
  if (!name || val <= 0) {
    showToast('اثاثے کا نام اور درست مالیت درج کریں', '⚠️');
    return;
  }
  customAssets.push({ id: Date.now(), name, val });
  nameEl.value = '';
  valEl.value = '';
  renderAssetItems();
}

function removeAssetItem(id) {
  customAssets = customAssets.filter(x => x.id !== id);
  renderAssetItems();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function renderAssetItems() {
  const box = document.getElementById('assetListContainer');
  if (customAssets.length === 0) {
    box.innerHTML = '';
    return;
  }
  box.innerHTML = customAssets.map(a => `
    <div class="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200">
      <span class="font-medium text-slate-800">${escapeHtml(a.name)}</span>
      <div class="flex items-center gap-3">
        <span class="font-mono-num font-bold text-emerald-800">${formatNum(a.val)}</span>
        <button type="button" onclick="removeAssetItem(${a.id})" class="text-rose-600 hover:text-rose-800 font-bold">✕</button>
      </div>
    </div>
  `).join('');
}

function syncAssetsToGross() {
  if (customAssets.length === 0) {
    showToast('پہلے کم از کم ایک اثاثہ فہرست میں شامل کریں', '⚠️');
    return;
  }
  const sum = customAssets.reduce((acc, x) => acc + x.val, 0);
  document.getElementById('grossEstateInput').value = sum;
  calculateMirath();
  showToast('تمام اثاثہ جات کی مالیت کل ترکہ میں شامل کر دی گئی ہے', '✅');
}
