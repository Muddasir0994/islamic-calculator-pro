// Islamic Calculator Pro - ushr.js: ushr calculator
// Split from the original single-file app; loaded as a classic script.

function calculateUshr() {
  const cropEl = document.getElementById('ushrCropValue');
  const typeEl = document.getElementById('ushrIrrigationType');
  if (!cropEl || !typeEl) return;
  const cropVal = Math.max(0, parseFloat(cropEl.value) || 0);
  const rate = parseFloat(typeEl.value) || 0.10;
  const amount = cropVal * rate;
  const badge = document.getElementById('ushrOutputBadge');
  if (badge) badge.textContent = `واجب الادا عشر (${(rate * 100).toFixed(1)}%): ${formatNum(amount, 0)}`;
  const total = document.getElementById('ushrTotalOut');
  if (total) total.textContent = formatNum(amount, 0);
}
