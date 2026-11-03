// Islamic Calculator Pro - zakat.js: zakat calculator
// Split from the original single-file app; loaded as a classic script.

// ==================== ZAKAT & USHR ENGINE ====================
function onZakatUnitChange() {
  const unitSel = document.getElementById('zakatWeightUnit');
  const unit = unitSel.value;
  const prevUnit = unitSel.dataset.prevUnit || 'tola';
  const GRAMS_PER = { tola: 11.6638, gram: 1, ounce: 31.1035 };
  if (prevUnit !== unit && GRAMS_PER[prevUnit] && GRAMS_PER[unit]) {
    const wFactor = GRAMS_PER[prevUnit] / GRAMS_PER[unit];
    const rFactor = GRAMS_PER[unit] / GRAMS_PER[prevUnit];
    ['zakatGold24', 'zakatSilverWeight'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value !== '') el.value = Math.round((parseFloat(el.value) || 0) * wFactor * 10000) / 10000;
    });
    ['goldRateInput', 'silverRateInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value !== '') el.value = Math.round((parseFloat(el.value) || 0) * rFactor);
    });
  }
  unitSel.dataset.prevUnit = unit;
  const gLabel = document.getElementById('goldRateLabel');
  const sLabel = document.getElementById('silverRateLabel');
  if (unit === 'tola') {
    gLabel.textContent = 'سونا (24K): فی تولہ قیمت';
    sLabel.textContent = 'چاندی: فی تولہ قیمت';
  } else if (unit === 'gram') {
    gLabel.textContent = 'سونا (24K): فی گرام قیمت';
    sLabel.textContent = 'چاندی: فی گرام قیمت';
  } else {
    gLabel.textContent = 'سونا (24K): فی اونس قیمت';
    sLabel.textContent = 'چاندی: فی اونس قیمت';
  }
  calculateZakat();
}

function applyCountryGoldPreset(code) {
  document.getElementById('zakatWeightUnit').value = 'tola';
  onZakatUnitChange();
  if (code === 'PKR') {
    document.getElementById('goldRateInput').value = 285000;
    document.getElementById('silverRateInput').value = 3300;
  } else if (code === 'INR') {
    document.getElementById('goldRateInput').value = 92000;
    document.getElementById('silverRateInput').value = 1100;
  } else if (code === 'SAR') {
    document.getElementById('goldRateInput').value = 3850;
    document.getElementById('silverRateInput').value = 46;
  } else if (code === 'USD') {
    document.getElementById('goldRateInput').value = 1020;
    document.getElementById('silverRateInput').value = 12.5;
  }
  calculateZakat();
  showToast(`${code} کے تخمینی مارکیٹ ریٹس لوڈ کر دیے گئے ہیں`, '💰');
}

function resetZakatForm() {
  ['zakatGold24', 'zakatSilverWeight', 'zakatGoldDirectVal', 'zakatCashHand', 'zakatBankBalance',
   'zakatCommitteeBC', 'zakatLoanGiven', 'zakatStockGoods', 'zakatTradingPlots', 'zakatPartnership',
   'zakatRentalSaved', 'zakatDebtOwed', 'zakatCommitteePayable', 'zakatBillsSalaries', 'zakatPastUnpaid', 'ushrCropValue'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = 0;
  });
  calculateZakat();
  showToast('زکوٰۃ فارم ری سیٹ کر دیا گیا ہے', '🔄');
}

function calculateZakat() {
  const unit = document.getElementById('zakatWeightUnit').value;
  const goldRate = Math.max(0, parseFloat(document.getElementById('goldRateInput').value) || 0);
  const silverRate = Math.max(0, parseFloat(document.getElementById('silverRateInput').value) || 0);
  const basis = document.getElementById('nisabBasisSelect').value;

  const goldNisabUnits = unit === 'tola' ? 7.5 : (unit === 'gram' ? 87.48 : 2.8125);
  const silverNisabUnits = unit === 'tola' ? 52.5 : (unit === 'gram' ? 612.36 : 19.6875);

  const goldNisabValue = goldNisabUnits * goldRate;
  const silverNisabValue = silverNisabUnits * silverRate;

  const goldW = Math.max(0, parseFloat(document.getElementById('zakatGold24').value) || 0);
  const karatFactor = parseFloat(document.getElementById('zakatGoldKarat').value) || 1;
  const silverW = Math.max(0, parseFloat(document.getElementById('zakatSilverWeight').value) || 0);
  const directMetalVal = Math.max(0, parseFloat(document.getElementById('zakatGoldDirectVal').value) || 0);

  const goldVal = goldW * karatFactor * goldRate;
  const silverVal = silverW * silverRate;
  const totalMetalVal = goldVal + silverVal + directMetalVal;

  const cashVal =
    Math.max(0, parseFloat(document.getElementById('zakatCashHand').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatBankBalance').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatCommitteeBC').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatLoanGiven').value) || 0);

  const tradeVal =
    Math.max(0, parseFloat(document.getElementById('zakatStockGoods').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatTradingPlots').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatPartnership').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatRentalSaved').value) || 0);

  const totalAssets = totalMetalVal + cashVal + tradeVal;

  const totalLiabilities =
    Math.max(0, parseFloat(document.getElementById('zakatDebtOwed').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatCommitteePayable').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatBillsSalaries').value) || 0) +
    Math.max(0, parseFloat(document.getElementById('zakatPastUnpaid').value) || 0);

  const netZakatable = Math.max(0, totalAssets - totalLiabilities);

  // Determine applicable Nisab threshold
  const onlyPureGold = (goldW > 0 && silverW === 0 && directMetalVal === 0 && cashVal === 0 && tradeVal === 0);
  let activeNisab = silverNisabValue;
  let activeNisabLabel = 'چاندی کا نصاب (52.5 تولہ)';
  if (basis === 'gold_only' || (basis === 'hanafi_auto' && onlyPureGold)) {
    activeNisab = goldNisabValue;
    activeNisabLabel = 'سونے کا نصاب (7.5 تولہ)';
  }

  const nisabUnitEl = document.getElementById('zakatWeightUnit');
  const nisabUnit = nisabUnitEl ? nisabUnitEl.value : 'tola';
  const goldWtxt = nisabUnit === 'gram' ? '87.48 گرام' : (nisabUnit === 'ounce' ? '2.8125 اونس' : '7.5 تولہ');
  const silverWtxt = nisabUnit === 'gram' ? '612.36 گرام' : (nisabUnit === 'ounce' ? '19.687 اونس' : '52.5 تولہ');
  document.getElementById('nisabThresholdsBar').innerHTML =
    `سونے کا نصاب (${goldWtxt}): <strong>${formatNum(goldNisabValue, 0)}</strong> • چاندی کا نصاب (${silverWtxt}): <strong>${formatNum(silverNisabValue, 0)}</strong> • لاگو معیار: <strong>${activeNisabLabel}</strong>`;

  const isZakatDue = netZakatable >= activeNisab && activeNisab > 0;
  const zakatAmount = isZakatDue ? (netZakatable * 0.025) : 0;

  // Ushr calculation
  const ushrCropEl = document.getElementById('ushrCropValue');
  const ushrTypeEl = document.getElementById('ushrIrrigationType');
  const cropVal = ushrCropEl ? Math.max(0, parseFloat(ushrCropEl.value) || 0) : 0;
  const ushrRate = ushrTypeEl ? (parseFloat(ushrTypeEl.value) || 0.10) : 0.10;
  const ushrAmount = cropVal * ushrRate;
  const ushrBadge = document.getElementById('ushrOutputBadge');
  if (ushrBadge) ushrBadge.textContent =
    `واجب الادا عشر (${(ushrRate * 100).toFixed(1)}%): ${formatNum(ushrAmount, 0)}`;

  document.getElementById('zakatTotalAssetsOut').textContent = formatNum(totalAssets, 0);
  document.getElementById('zakatTotalLiabOut').textContent = formatNum(totalLiabilities, 0);
  document.getElementById('zakatNetWorthOut').textContent = formatNum(netZakatable, 0);
  document.getElementById('zakatPayableOut').textContent = formatNum(zakatAmount + ushrAmount, 0);

  document.getElementById('zakatStatusText').textContent = isZakatDue
    ? `✅ آپ کا خالص مال نصاب (${formatNum(activeNisab, 0)}) سے زائد ہے، لہٰذا ڈھائی فیصد (2.5%) زکوٰۃ فرض ہے: ${formatNum(zakatAmount, 0)} ${ushrAmount > 0 ? ` (مع عشر: ${formatNum(zakatAmount + ushrAmount, 0)})` : ''}`
    : `ℹ️ آپ کا خالص قابلِ زکوٰۃ مال (${formatNum(netZakatable, 0)}) مقررہ نصاب (${formatNum(activeNisab, 0)}) سے کم ہے، لہٰذا زکوٰۃ واجب نہیں۔`;
}
