// Islamic Calculator Pro - mirath-engine.js: Hanafi inheritance engine (hajb helpers + solver)
// Split from the original single-file app; loaded as a classic script.

// ==================== HEIR AVAILABILITY (Hajb) ====================
// Mirrors the Hajb-e-Hirman exclusions inside solveHanafiMirath():
// an heir the engine would exclude (mahjoob) is shown non-clickable in
// the grid, with the reason, and its count stays 0 until the blocking
// heir is removed. When nothing blocks it, the option is clickable.
function getHeirBlockInfo(src) {
  const n = id => (src && src[id]) || 0;
  const blocked = {};
  // w[] replays the engine's sequential zeroing: once an heir is excluded,
  // it no longer blocks anyone else (same order as solveHanafiMirath).
  const w = {};
  Object.keys(heirCounts).forEach(k => { w[k] = n(k); });
  const block = (id, ur, en) => { blocked[id] = { ur, en }; w[id] = 0; };

  const son = n('son'), daughter = n('daughter'), grandson = n('grandson'),
    granddaughter = n('granddaughter'), greatGrandson = n('great_grandson'),
    greatGranddaughter = n('great_granddaughter'),
    father = n('father'), mother = n('mother'),
    pgf = n('paternal_grandfather'), pggf = n('paternal_great_grandfather'),
    pgm = n('paternal_grandmother'), pggm = n('paternal_great_grandmother'),
    mgm = n('maternal_grandmother'), mggm = n('maternal_great_grandmother');

  const hasDescendant = (son + daughter + grandson + granddaughter + greatGrandson + greatGranddaughter) > 0;
  const hasMaleDescendant = (son + grandson + greatGrandson) > 0;
  const hasMaleAscendant = (father + pgf + pggf) > 0;
  const maleLineBlock = hasMaleDescendant || hasMaleAscendant;
  const femaleDescendantPresent = (daughter + granddaughter + greatGranddaughter) > 0;

  // Ascendants (later checks read w[], the post-exclusion counts, like the engine)
  if (w.paternal_grandfather > 0 && father > 0) block('paternal_grandfather', 'والد کی موجودگی میں محجوب', 'Blocked by the Father');
  if (w.paternal_great_grandfather > 0 && (father > 0 || w.paternal_grandfather > 0)) block('paternal_great_grandfather', 'والد یا دادا کی موجودگی میں محجوب', 'Blocked by the Father or Grandfather');
  if (w.paternal_grandmother > 0 && (mother > 0 || father > 0)) block('paternal_grandmother', 'والدہ یا والد کی موجودگی میں محجوب', 'Blocked by the Mother or the Father');
  if (w.maternal_grandmother > 0 && mother > 0) block('maternal_grandmother', 'والدہ کی موجودگی میں محجوب', 'Blocked by the Mother');
  if (w.paternal_great_grandmother > 0 && (mother > 0 || father > 0 || w.paternal_grandfather > 0 || w.paternal_grandmother > 0 || w.maternal_grandmother > 0)) block('paternal_great_grandmother', 'قریبی اصول کی موجودگی میں محجوب', 'Blocked by a nearer ascendant');
  if (w.maternal_great_grandmother > 0 && (mother > 0 || w.paternal_grandmother > 0 || w.maternal_grandmother > 0)) block('maternal_great_grandmother', 'والدہ یا قریبی دادی/نانی کی موجودگی میں محجوب', 'Blocked by the Mother or a nearer grandmother');

  // Descendants
  if (w.grandson > 0 && son > 0) block('grandson', 'بیٹے کی موجودگی میں محجوب', 'Blocked by the Son');
  if (w.granddaughter > 0 && son > 0) block('granddaughter', 'بیٹے کی موجودگی میں محجوب', 'Blocked by the Son');
  else if (w.granddaughter > 0 && daughter >= 2 && w.grandson === 0 && greatGrandson === 0) block('granddaughter', 'دو بیٹیوں کو دو تہائی (2/3) مل جانے سے محجوب', 'Blocked: two Daughters complete the 2/3 share');
  if (w.great_grandson > 0 && (son > 0 || w.grandson > 0)) block('great_grandson', 'بیٹے یا پوتے کی موجودگی میں محجوب', 'Blocked by the Son or Grandson');
  if (w.great_granddaughter > 0 && (son > 0 || w.grandson > 0)) block('great_granddaughter', 'بیٹے یا پوتے کی موجودگی میں محجوب', 'Blocked by the Son or Grandson');
  else if (w.great_granddaughter > 0 && (daughter + w.granddaughter) >= 2 && w.great_grandson === 0) block('great_granddaughter', 'دو تہائی فرض مکمل ہونے سے محجوب', 'Blocked: the 2/3 share is already complete');

  // Siblings
  if (n('uterine_sibling') > 0 && (hasDescendant || hasMaleAscendant)) block('uterine_sibling', 'اولاد یا والد/دادا کی موجودگی میں محجوب', 'Blocked by descendants or the Father/Grandfather');
  if (n('real_brother') > 0 && maleLineBlock) block('real_brother', 'بیٹے/پوتے یا والد/دادا کی موجودگی میں محجوب', 'Blocked by a male descendant or the Father/Grandfather');
  if (n('real_sister') > 0 && maleLineBlock) block('real_sister', 'بیٹے/پوتے یا والد/دادا کی موجودگی میں محجوب', 'Blocked by a male descendant or the Father/Grandfather');
  const realSisterAsabah = (n('real_sister') > 0 && n('real_brother') === 0 && femaleDescendantPresent && !maleLineBlock);
  if (n('consanguine_brother') > 0 && (maleLineBlock || n('real_brother') > 0 || realSisterAsabah)) block('consanguine_brother', 'اوپر کے درجے کے وارث کی موجودگی میں محجوب', 'Blocked by a higher-ranking heir');
  if (n('consanguine_sister') > 0 && (maleLineBlock || n('real_brother') > 0 || realSisterAsabah)) block('consanguine_sister', 'اوپر کے درجے کے وارث کی موجودگی میں محجوب', 'Blocked by a higher-ranking heir');
  else if (n('consanguine_sister') > 0 && n('real_sister') >= 2 && w.consanguine_brother === 0) block('consanguine_sister', 'دو حقیقی بہنوں کو دو تہائی (2/3) مل جانے سے محجوب', 'Blocked: two Full Sisters complete the 2/3 share');
  const consanguineSisterAsabah = (n('consanguine_sister') > 0 && n('consanguine_brother') === 0 && femaleDescendantPresent && !maleLineBlock && n('real_sister') === 0);

  // Other agnates: only the nearest available rank stays clickable
  const higherAgnate = maleLineBlock || n('real_brother') > 0 || n('consanguine_brother') > 0 || realSisterAsabah || consanguineSisterAsabah;
  const chain = ['real_nephew', 'consanguine_nephew', 'real_paternal_uncle', 'consanguine_paternal_uncle', 'real_paternal_cousin', 'consanguine_paternal_cousin'];
  let winnerFound = higherAgnate;
  chain.forEach(id => {
    if (n(id) > 0) {
      if (winnerFound) block(id, 'قریبی عصبہ کی موجودگی میں محجوب', 'Blocked by a nearer Asabah heir');
      else winnerFound = true;
    }
  });

  // Dhawu al-Arham: clickable only when no fixed-share (non-spouse) or Asabah heir is active
  const arhamIds = ['daughters_son', 'daughters_daughter', 'maternal_grandfather', 'sisters_son', 'sisters_daughter', 'brothers_daughter', 'paternal_aunt', 'maternal_aunt', 'maternal_uncle'];
  const activeRealHeir = Object.keys(heirCounts).some(id => {
    if (arhamIds.indexOf(id) !== -1 || id === 'wife' || id === 'husband') return false;
    return n(id) > 0 && !blocked[id];
  });
  if (activeRealHeir) {
    arhamIds.forEach(id => {
      if (n(id) > 0) block(id, 'اصحاب الفرائض یا عصبات کی موجودگی میں محجوب', 'Blocked while a fixed-share or Asabah heir exists');
    });
  }

  return blocked;
}

// An heir counts as blocked whenever it could never receive a share if selected now:
// evaluate the hajb rules as if this heir were present (its count forced to at least 1).
// This makes blocked options appear non-clickable from the first render, not only after a click.
function getHeirForcedBlock(id) {
  const test = Object.assign({}, heirCounts);
  test[id] = Math.max(1, test[id] || 0);
  return getHeirBlockInfo(test)[id] || null;
}

// ==================== CORE HANAFI MIRATH ENGINE ====================
function solveHanafiMirath(countsInput) {
  const c = Object.assign({}, countsInput);
  const activeHeirs = [];
  const excludedHeirs = [];
  const notes = [];

  const hasDescendant = (c.son + c.daughter + c.grandson + c.granddaughter + c.great_grandson + c.great_granddaughter) > 0;
  const hasMaleDescendant = (c.son + c.grandson + c.great_grandson) > 0;
  const hasMaleAscendant = (c.father + c.paternal_grandfather + c.paternal_great_grandfather) > 0;
  const totalSiblings = c.real_brother + c.real_sister + c.consanguine_brother + c.consanguine_sister + c.uterine_sibling;

  // 1. Check Exclusions (Hajb Hirman) first and record Fiqhi reasons
  if (c.paternal_grandfather > 0 && c.father > 0) {
    excludedHeirs.push({ id: 'paternal_grandfather', count: c.paternal_grandfather, reason: 'والد کی موجودگی میں دادا محجوب (محروم) ہو جاتا ہے۔' });
    c.paternal_grandfather = 0;
  }
  if (c.paternal_great_grandfather > 0 && (c.father > 0 || c.paternal_grandfather > 0)) {
    excludedHeirs.push({ id: 'paternal_great_grandfather', count: c.paternal_great_grandfather, reason: 'والد یا دادا کی موجودگی میں پردادا محجوب ہو جاتا ہے۔' });
    c.paternal_great_grandfather = 0;
  }

  // Grandmothers exclusion
  if (c.paternal_grandmother > 0 && (c.mother > 0 || c.father > 0)) {
    excludedHeirs.push({ id: 'paternal_grandmother', count: c.paternal_grandmother, reason: 'والدہ یا والد کی موجودگی میں دادی محجوب ہو جاتی ہے۔' });
    c.paternal_grandmother = 0;
  }
  if (c.maternal_grandmother > 0 && c.mother > 0) {
    excludedHeirs.push({ id: 'maternal_grandmother', count: c.maternal_grandmother, reason: 'والدہ کی موجودگی میں نانی محجوب ہو جاتی ہے۔' });
    c.maternal_grandmother = 0;
  }
  if (c.paternal_great_grandmother > 0 && (c.mother > 0 || c.father > 0 || c.paternal_grandfather > 0 || c.paternal_grandmother > 0 || c.maternal_grandmother > 0)) {
    excludedHeirs.push({ id: 'paternal_great_grandmother', count: c.paternal_great_grandmother, reason: 'قریبی درجہ کی ماں/دادی/نانی یا والد/دادا کی وجہ سے پردادی محجوب ہے۔' });
    c.paternal_great_grandmother = 0;
  }
  if (c.maternal_great_grandmother > 0 && (c.mother > 0 || c.paternal_grandmother > 0 || c.maternal_grandmother > 0)) {
    excludedHeirs.push({ id: 'maternal_great_grandmother', count: c.maternal_great_grandmother, reason: 'والدہ یا قریبی دادی/نانی کی موجودگی میں پرنانی محجوب ہے۔' });
    c.maternal_great_grandmother = 0;
  }

  // Descendants exclusions
  if (c.grandson > 0 && c.son > 0) {
    excludedHeirs.push({ id: 'grandson', count: c.grandson, reason: 'حقیقی بیٹے (ابن) کی موجودگی میں پوتا بالاجماع محجوب ہو جاتا ہے۔' });
    c.grandson = 0;
  }
  if (c.granddaughter > 0 && c.son > 0) {
    excludedHeirs.push({ id: 'granddaughter', count: c.granddaughter, reason: 'حقیقی بیٹے کی موجودگی میں پوتی محجوب ہو جاتی ہے۔' });
    c.granddaughter = 0;
  } else if (c.granddaughter > 0 && c.daughter >= 2 && c.grandson === 0 && c.great_grandson === 0) {
    excludedHeirs.push({ id: 'granddaughter', count: c.granddaughter, reason: 'دو یا زائد بیٹیوں کو دو تہائی (2/3) مل جانے اور کسی عصبہ بنانے والے پوتے کے نہ ہونے کی وجہ سے پوتی محجوب ہے۔' });
    c.granddaughter = 0;
  }

  if (c.great_grandson > 0 && (c.son > 0 || c.grandson > 0)) {
    excludedHeirs.push({ id: 'great_grandson', count: c.great_grandson, reason: 'بیٹے یا پوتے کی موجودگی میں پڑپوتا محجوب ہے۔' });
    c.great_grandson = 0;
  }
  if (c.great_granddaughter > 0 && (c.son > 0 || c.grandson > 0)) {
    excludedHeirs.push({ id: 'great_granddaughter', count: c.great_granddaughter, reason: 'بیٹے یا پوتے کی موجودگی میں پڑپوتی محجوب ہے۔' });
    c.great_granddaughter = 0;
  } else if (c.great_granddaughter > 0 && (c.daughter + c.granddaughter >= 2) && c.great_grandson === 0) {
    excludedHeirs.push({ id: 'great_granddaughter', count: c.great_granddaughter, reason: 'دو تہائی فرض مکمل ہونے اور پڑپوتا نہ ہونے کے سبب پڑپوتی محجوب ہے۔' });
    c.great_granddaughter = 0;
  }

  // Siblings exclusions (In Hanafi Fiqh, Father AND Paternal Grandfather both exclude all siblings)
  const maleLineBlockForSiblings = hasMaleDescendant || hasMaleAscendant;
  if (c.uterine_sibling > 0 && (hasDescendant || hasMaleAscendant)) {
    excludedHeirs.push({ id: 'uterine_sibling', count: c.uterine_sibling, reason: 'اولاد (بیٹا/بیٹی/پوتا/پوتی) یا اصولِ مذکر (والد/دادا) کی موجودگی میں اخیافی بھائی/بہن محجوب ہوتے ہیں۔' });
    c.uterine_sibling = 0;
  }
  if (c.real_brother > 0 && maleLineBlockForSiblings) {
    excludedHeirs.push({ id: 'real_brother', count: c.real_brother, reason: 'فقہِ حنفی میں بیٹے/پوتے یا والد/دادا کی موجودگی میں حقیقی بھائی محجوب ہو جاتا ہے۔' });
    c.real_brother = 0;
  }
  if (c.real_sister > 0 && maleLineBlockForSiblings) {
    excludedHeirs.push({ id: 'real_sister', count: c.real_sister, reason: 'بیٹے/پوتے یا والد/دادا کی موجودگی میں حقیقی بہن محجوب ہو جاتی ہے۔' });
    c.real_sister = 0;
  }

  // Real sister as Asabah ma'al Ghair (with daughter/granddaughter)
  const femaleDescendantPresent = (c.daughter + c.granddaughter + c.great_granddaughter) > 0;
  const realSisterIsAsabahMaalGhair = (c.real_sister > 0 && c.real_brother === 0 && femaleDescendantPresent && !maleLineBlockForSiblings);

  if (c.consanguine_brother > 0 && (maleLineBlockForSiblings || c.real_brother > 0 || realSisterIsAsabahMaalGhair)) {
    excludedHeirs.push({ id: 'consanguine_brother', count: c.consanguine_brother, reason: 'بیٹے/والد/حقیقی بھائی یا عصبہ مع الغیر حقیقی بہن کی موجودگی میں علاتی بھائی محجوب ہے۔' });
    c.consanguine_brother = 0;
  }
  if (c.consanguine_sister > 0 && (maleLineBlockForSiblings || c.real_brother > 0 || realSisterIsAsabahMaalGhair)) {
    excludedHeirs.push({ id: 'consanguine_sister', count: c.consanguine_sister, reason: 'بیٹے/والد/حقیقی بھائی یا عصبہ مع الغیر حقیقی بہن کی موجودگی میں علاتی بہن محجوب ہے۔' });
    c.consanguine_sister = 0;
  } else if (c.consanguine_sister > 0 && c.real_sister >= 2 && c.consanguine_brother === 0) {
    excludedHeirs.push({ id: 'consanguine_sister', count: c.consanguine_sister, reason: 'دو یا زائد حقیقی بہنوں کو 2/3 مل جانے اور علاتی بھائی نہ ہونے سے علاتی بہن محجوب ہے۔' });
    c.consanguine_sister = 0;
  }

  const consanguineSisterIsAsabahMaalGhair = (c.consanguine_sister > 0 && c.consanguine_brother === 0 && femaleDescendantPresent && !maleLineBlockForSiblings && c.real_sister === 0);

  // Other Agnates order of priority
  const higherAgnatePresent = maleLineBlockForSiblings || c.real_brother > 0 || c.consanguine_brother > 0 || realSisterIsAsabahMaalGhair || consanguineSisterIsAsabahMaalGhair;
  const agnateChain = [
    { id: 'real_nephew', label: 'حقیقی بھتیجا' },
    { id: 'consanguine_nephew', label: 'علاتی بھتیجا' },
    { id: 'real_paternal_uncle', label: 'حقیقی چچا' },
    { id: 'consanguine_paternal_uncle', label: 'علاتی چچا' },
    { id: 'real_paternal_cousin', label: 'حقیقی چچازاد' },
    { id: 'consanguine_paternal_cousin', label: 'علاتی چچازاد' }
  ];
  let agnateWinnerFound = higherAgnatePresent;
  agnateChain.forEach(ag => {
    if (c[ag.id] > 0) {
      if (agnateWinnerFound) {
        excludedHeirs.push({ id: ag.id, count: c[ag.id], reason: 'قریبی درجہ کے عصبہ رشتہ دار کی موجودگی میں ' + ag.label + ' محجوب ہے۔' });
        c[ag.id] = 0;
      } else {
        agnateWinnerFound = true;
      }
    }
  });

  // Fixed Shares (Ashab al-Fara'id) as [num, den]
  const fixedShares = [];
  // Spouse
  if (c.husband > 0) {
    if (hasDescendant) {
      fixedShares.push({ id: 'husband', count: 1, num: 1, den: 4, label: '1/4', type: 'ذو فرض (Ashab al-Faraid)', reason: 'اولاد کی موجودگی میں شوہر کا فرض حصہ چوتھائی (1/4) ہے۔ (سورۃ النساء: 12)' });
    } else {
      fixedShares.push({ id: 'husband', count: 1, num: 1, den: 2, label: '1/2', type: 'ذو فرض (Ashab al-Faraid)', reason: 'اولاد نہ ہونے کی صورت میں شوہر کا فرض حصہ نصف (1/2) ہے۔ (سورۃ النساء: 12)' });
    }
  }
  if (c.wife > 0) {
    if (hasDescendant) {
      fixedShares.push({ id: 'wife', count: c.wife, num: 1, den: 8, label: '1/8', type: 'ذو فرض (Ashab al-Faraid)', reason: 'اولاد کی موجودگی میں بیوہ (ایک یا زائد) کا مشترکہ حصہ آٹھواں (1/8) ہے۔' });
    } else {
      fixedShares.push({ id: 'wife', count: c.wife, num: 1, den: 4, label: '1/4', type: 'ذو فرض (Ashab al-Faraid)', reason: 'اولاد نہ ہونے کی صورت میں بیوہ کا فرض حصہ چوتھائی (1/4) ہے۔' });
    }
  }

  // Father / Grandfather
  if (c.father > 0) {
    if (hasMaleDescendant) {
      fixedShares.push({ id: 'father', count: 1, num: 1, den: 6, label: '1/6', type: 'ذو فرض (1/6)', reason: 'بیٹے یا پوتے کی موجودگی میں والد کو صرف چھٹا حصہ (1/6) ملتا ہے۔' });
    } else if (femaleDescendantPresent) {
      fixedShares.push({ id: 'father', count: 1, num: 1, den: 6, label: '1/6 + بقیہ عصبہ', type: 'ذو فرض + عصبہ', reason: 'صرف بیٹی/پوتی کی موجودگی میں والد کو 1/6 بطور فرض اور باقی بچنے والا مال بطور عصبہ ملتا ہے۔', alsoAsabah: true });
    }
  } else if (c.paternal_grandfather > 0) {
    if (hasMaleDescendant) {
      fixedShares.push({ id: 'paternal_grandfather', count: 1, num: 1, den: 6, label: '1/6', type: 'ذو فرض (1/6)', reason: 'والد کی عدم موجودگی اور بیٹے/پوتے کی موجودگی میں دادا کو 1/6 ملتا ہے۔' });
    } else if (femaleDescendantPresent) {
      fixedShares.push({ id: 'paternal_grandfather', count: 1, num: 1, den: 6, label: '1/6 + بقیہ عصبہ', type: 'ذو فرض + عصبہ', reason: 'بیٹی/پوتی کے ساتھ دادا کو 1/6 اور بقیہ مال بطور عصبہ ملتا ہے۔', alsoAsabah: true });
    }
  } else if (c.paternal_great_grandfather > 0) {
    if (hasMaleDescendant) {
      fixedShares.push({ id: 'paternal_great_grandfather', count: 1, num: 1, den: 6, label: '1/6', type: 'ذو فرض (1/6)', reason: 'پردادا کو مذکر اولاد کی موجودگی میں 1/6 ملتا ہے۔' });
    } else if (femaleDescendantPresent) {
      fixedShares.push({ id: 'paternal_great_grandfather', count: 1, num: 1, den: 6, label: '1/6 + عصبہ', type: 'ذو فرض + عصبہ', reason: 'پردادا کو 1/6 اور بقیہ عصبہ ملتا ہے۔', alsoAsabah: true });
    }
  }

  // Mother & Umariyyatan (Gharrawayn) check
  const isUmariyyatan = (!hasDescendant && totalSiblings <= 1 && c.father > 0 && c.mother > 0 && (c.husband > 0 || c.wife > 0));
  if (c.mother > 0) {
    if (hasDescendant || totalSiblings >= 2) {
      fixedShares.push({ id: 'mother', count: 1, num: 1, den: 6, label: '1/6', type: 'ذو فرض (1/6)', reason: 'اولاد یا دو/زائد بہن بھائیوں کی موجودگی میں والدہ کا حصہ چھٹا (1/6) ہے۔' });
    } else if (isUmariyyatan) {
      // 1/3 of remainder after spouse!
      if (c.husband > 0) {
        fixedShares.push({ id: 'mother', count: 1, num: 1, den: 6, label: '1/3 الباقی (1/6)', type: 'مسئلہ عمریتین', reason: 'مسئلہ عمریتین: شوہر، والد اور والدہ کی صورت میں والدہ کو شوہر کے حصے کے بعد باقی مال کا ایک تہائی (یعنی کل کا 1/6) ملتا ہے۔' });
      } else {
        fixedShares.push({ id: 'mother', count: 1, num: 1, den: 4, label: '1/3 الباقی (1/4)', type: 'مسئلہ عمریتین', reason: 'مسئلہ عمریتین: بیوہ، والد اور والدہ کی صورت میں والدہ کو بیوہ کے حصے (1/4) کے بعد باقی مال کا ایک تہائی (یعنی کل کا 1/4) ملتا ہے۔' });
      }
    } else {
      fixedShares.push({ id: 'mother', count: 1, num: 1, den: 3, label: '1/3', type: 'ذو فرض (1/3)', reason: 'اولاد اور دو بہن بھائی نہ ہونے کی صورت میں والدہ کا حصہ تہائی (1/3) ہے۔' });
    }
  }

  // Grandmothers (share 1/6)
  const activeGrandmothers = [];
  if (c.paternal_grandmother > 0) activeGrandmothers.push('paternal_grandmother');
  if (c.maternal_grandmother > 0) activeGrandmothers.push('maternal_grandmother');
  if (c.paternal_great_grandmother > 0) activeGrandmothers.push('paternal_great_grandmother');
  if (c.maternal_great_grandmother > 0) activeGrandmothers.push('maternal_great_grandmother');
  if (activeGrandmothers.length > 0) {
    const gmCount = activeGrandmothers.length;
    activeGrandmothers.forEach(gmId => {
      fixedShares.push({
        id: gmId,
        count: 1,
        num: 1,
        den: 6 * gmCount,
        label: gmCount > 1 ? `1/6 مشترکہ` : '1/6',
        type: 'ذو فرض (1/6)',
        reason: 'والدہ کی عدم موجودگی میں صحیحہ دادی/نانی کو چھٹا حصہ (1/6) ملتا ہے۔'
      });
    });
  }

  // Daughters (when no son)
  if (c.daughter > 0 && c.son === 0) {
    if (c.daughter === 1) {
      fixedShares.push({ id: 'daughter', count: 1, num: 1, den: 2, label: '1/2', type: 'ذو فرض (1/2)', reason: 'بیٹا نہ ہونے کی صورت میں ایک بیٹی کا فرض حصہ نصف (1/2) ہے۔' });
    } else {
      fixedShares.push({ id: 'daughter', count: c.daughter, num: 2, den: 3, label: '2/3', type: 'ذو فرض (2/3)', reason: 'بیٹا نہ ہونے کی صورت میں دو یا زائد بیٹیوں کا مشترکہ حصہ دو تہائی (2/3) ہے۔' });
    }
  }

  // Granddaughters (when no son and no grandson)
  if (c.granddaughter > 0 && c.son === 0 && c.grandson === 0) {
    if (c.daughter === 0) {
      if (c.granddaughter === 1) {
        fixedShares.push({ id: 'granddaughter', count: 1, num: 1, den: 2, label: '1/2', type: 'ذو فرض (1/2)', reason: 'اولاد نہ ہونے پر ایک پوتی کو بیٹی کے قائم مقام نصف (1/2) ملتا ہے۔' });
      } else {
        fixedShares.push({ id: 'granddaughter', count: c.granddaughter, num: 2, den: 3, label: '2/3', type: 'ذو فرض (2/3)', reason: 'دو یا زائد پوتیوں کو دو تہائی (2/3) ملتا ہے۔' });
      }
    } else if (c.daughter === 1) {
      fixedShares.push({ id: 'granddaughter', count: c.granddaughter, num: 1, den: 6, label: '1/6 (تکملہ ثلثین)', type: 'ذو فرض (1/6)', reason: 'ایک بیٹی (1/2) کے ساتھ پوتی کو دو تہائی مکمل کرنے کے لیے چھٹا حصہ (1/6) ملتا ہے۔' });
    }
  }

  // Great-granddaughters (when no son, grandson, great-grandson)
  if (c.great_granddaughter > 0 && c.son === 0 && c.grandson === 0 && c.great_grandson === 0) {
    const higherFemales = c.daughter + c.granddaughter;
    if (higherFemales === 0) {
      if (c.great_granddaughter === 1) {
        fixedShares.push({ id: 'great_granddaughter', count: 1, num: 1, den: 2, label: '1/2', type: 'ذو فرض (1/2)', reason: 'ایک پڑپوتی کا فرض حصہ نصف (1/2) ہے۔' });
      } else {
        fixedShares.push({ id: 'great_granddaughter', count: c.great_granddaughter, num: 2, den: 3, label: '2/3', type: 'ذو فرض (2/3)', reason: 'دو یا زائد پڑپوتیوں کا حصہ 2/3 ہے۔' });
      }
    } else if (higherFemales === 1) {
      fixedShares.push({ id: 'great_granddaughter', count: c.great_granddaughter, num: 1, den: 6, label: '1/6 (تکملہ)', type: 'ذو فرض (1/6)', reason: 'تکملہ ثلثین کے طور پر پڑپوتی کو 1/6 ملتا ہے۔' });
    }
  }

  // Real Sisters (when no descendants, no male ascendants, no real brother)
  if (c.real_sister > 0 && c.real_brother === 0 && !hasDescendant && !hasMaleAscendant) {
    if (c.real_sister === 1) {
      fixedShares.push({ id: 'real_sister', count: 1, num: 1, den: 2, label: '1/2', type: 'ذو فرض (1/2)', reason: 'اولاد اور والد/دادا نہ ہونے پر ایک حقیقی بہن کو نصف (1/2) ملتا ہے۔' });
    } else {
      fixedShares.push({ id: 'real_sister', count: c.real_sister, num: 2, den: 3, label: '2/3', type: 'ذو فرض (2/3)', reason: 'دو یا زائد حقیقی بہنوں کا فرض حصہ 2/3 ہے۔' });
    }
  }

  // Consanguine Sisters (when no descendants, no male ascendants, no real brother, no consanguine brother)
  if (c.consanguine_sister > 0 && c.consanguine_brother === 0 && c.real_brother === 0 && !hasDescendant && !hasMaleAscendant) {
    if (c.real_sister === 0) {
      if (c.consanguine_sister === 1) {
        fixedShares.push({ id: 'consanguine_sister', count: 1, num: 1, den: 2, label: '1/2', type: 'ذو فرض (1/2)', reason: 'ایک علاتی بہن کا فرض حصہ نصف (1/2) ہے۔' });
      } else {
        fixedShares.push({ id: 'consanguine_sister', count: c.consanguine_sister, num: 2, den: 3, label: '2/3', type: 'ذو فرض (2/3)', reason: 'دو یا زائد علاتی بہنوں کا حصہ 2/3 ہے۔' });
      }
    } else if (c.real_sister === 1) {
      fixedShares.push({ id: 'consanguine_sister', count: c.consanguine_sister, num: 1, den: 6, label: '1/6 (تکملہ)', type: 'ذو فرض (1/6)', reason: 'ایک حقیقی بہن (1/2) کے ساتھ علاتی بہن کو تکملہ ثلثین کے لیے 1/6 ملتا ہے۔' });
    }
  }

  // Uterine Siblings
  if (c.uterine_sibling > 0) {
    if (c.uterine_sibling === 1) {
      fixedShares.push({ id: 'uterine_sibling', count: 1, num: 1, den: 6, label: '1/6', type: 'ذو فرض (1/6)', reason: 'کلالہ کی صورت میں ایک اخیافی بھائی یا بہن کا حصہ چھٹا (1/6) ہے۔' });
    } else {
      fixedShares.push({ id: 'uterine_sibling', count: c.uterine_sibling, num: 1, den: 3, label: '1/3', type: 'ذو فرض (1/3)', reason: 'دو یا زائد اخیافی بہن بھائی ایک تہائی (1/3) میں برابر شریک ہوتے ہیں (مرد و عورت برابر)۔' });
    }
  }

  // Identify Residuary (Asabah) group in priority order
  let asabahGroup = null;
  if (c.son > 0) {
    asabahGroup = {
      type: 'عصبہ بنفسہ / بالغیر (2:1)',
      reason: 'لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ: بیٹا عصبہ ہے اور بیٹی بھی اس کے ساتھ عصبہ بالغیر بن کر 2:1 کے تناسب سے شریک ہے۔',
      members: [
        { id: 'son', count: c.son, weightPerHead: 2 },
        ...(c.daughter > 0 ? [{ id: 'daughter', count: c.daughter, weightPerHead: 1 }] : [])
      ]
    };
  } else if (c.grandson > 0) {
    asabahGroup = {
      type: 'عصبہ (2:1)',
      reason: 'پوتا عصبہ ہے اور پوتی اس کے ساتھ عصبہ بالغیر (2:1) ہے۔',
      members: [
        { id: 'grandson', count: c.grandson, weightPerHead: 2 },
        ...(c.granddaughter > 0 ? [{ id: 'granddaughter', count: c.granddaughter, weightPerHead: 1 }] : [])
      ]
    };
  } else if (c.great_grandson > 0) {
    // پوتی جب دو یا زائد بیٹیوں کی وجہ سے اپنے فرض سے محروم ہو تو اپنے درجے سے نیچے کے
    // عصبہ (پڑپوتے) کے ساتھ عصبہ بالغیر بن جاتی ہے (السراجی)۔
    const gdJoinsAsabah = c.daughter >= 2 && c.grandson === 0 && c.granddaughter > 0;
    asabahGroup = {
      type: 'عصبہ (2:1)',
      reason: gdJoinsAsabah
        ? 'پڑپوتا عصبہ ہے؛ پڑپوتی اس کے ساتھ اور پوتی (جو دو بیٹیوں کی وجہ سے فرض سے محروم تھی) بھی اس کے ساتھ 2:1 سے شریک ہے۔'
        : 'پڑپوتا عصبہ ہے اور پڑپوتی اس کے ساتھ 2:1 سے شریک ہے۔',
      members: [
        { id: 'great_grandson', count: c.great_grandson, weightPerHead: 2 },
        ...(c.great_granddaughter > 0 ? [{ id: 'great_granddaughter', count: c.great_granddaughter, weightPerHead: 1 }] : []),
        ...(gdJoinsAsabah ? [{ id: 'granddaughter', count: c.granddaughter, weightPerHead: 1 }] : [])
      ]
    };
  } else if (c.father > 0) {
    asabahGroup = {
      type: 'عصبہ بنفسہ (والد)',
      reason: 'مذکر اولاد نہ ہونے پر والد عصبہ بن کر بقیہ ترکہ پاتا ہے۔',
      members: [{ id: 'father', count: 1, weightPerHead: 1 }],
      mergeIntoFixedId: femaleDescendantPresent ? 'father' : null
    };
  } else if (c.paternal_grandfather > 0) {
    asabahGroup = {
      type: 'عصبہ بنفسہ (دادا)',
      reason: 'والد اور مذکر اولاد نہ ہونے پر دادا عصبہ بنتا ہے۔',
      members: [{ id: 'paternal_grandfather', count: 1, weightPerHead: 1 }],
      mergeIntoFixedId: femaleDescendantPresent ? 'paternal_grandfather' : null
    };
  } else if (c.paternal_great_grandfather > 0) {
    asabahGroup = {
      type: 'عصبہ بنفسہ (پردادا)',
      reason: 'پردادا عصبہ بن کر بقیہ ترکہ پاتا ہے۔',
      members: [{ id: 'paternal_great_grandfather', count: 1, weightPerHead: 1 }],
      mergeIntoFixedId: femaleDescendantPresent ? 'paternal_great_grandfather' : null
    };
  } else if (c.real_brother > 0) {
    asabahGroup = {
      type: 'عصبہ (2:1)',
      reason: 'حقیقی بھائی عصبہ ہے اور حقیقی بہن اس کے ساتھ عصبہ بالغیر (2:1) ہے۔',
      members: [
        { id: 'real_brother', count: c.real_brother, weightPerHead: 2 },
        ...(c.real_sister > 0 ? [{ id: 'real_sister', count: c.real_sister, weightPerHead: 1 }] : [])
      ]
    };
  } else if (realSisterIsAsabahMaalGhair) {
    asabahGroup = {
      type: 'عصبہ مع الغیر',
      reason: 'بیٹی یا پوتی کی موجودگی میں حقیقی بہن "عصبہ مع الغیر" بن کر بقیہ ترکہ پاتی ہے۔',
      members: [{ id: 'real_sister', count: c.real_sister, weightPerHead: 1 }]
    };
  } else if (c.consanguine_brother > 0) {
    asabahGroup = {
      type: 'عصبہ (2:1)',
      reason: 'علاتی بھائی عصبہ ہے اور علاتی بہن اس کے ساتھ 2:1 کے تناسب سے شریک ہے۔',
      members: [
        { id: 'consanguine_brother', count: c.consanguine_brother, weightPerHead: 2 },
        ...(c.consanguine_sister > 0 ? [{ id: 'consanguine_sister', count: c.consanguine_sister, weightPerHead: 1 }] : [])
      ]
    };
  } else if (consanguineSisterIsAsabahMaalGhair) {
    asabahGroup = {
      type: 'عصبہ مع الغیر',
      reason: 'بیٹی/پوتی کے ساتھ علاتی بہن عصبہ مع الغیر بن کر بقیہ مال پاتی ہے۔',
      members: [{ id: 'consanguine_sister', count: c.consanguine_sister, weightPerHead: 1 }]
    };
  } else {
    for (const ag of agnateChain) {
      if (c[ag.id] > 0) {
        asabahGroup = {
          type: 'عصبہ بنفسہ',
          reason: ag.label + ' قریبی عصبہ ہونے کی وجہ سے بقیہ ترکہ کا حقدار ہے۔',
          members: [{ id: ag.id, count: c[ag.id], weightPerHead: 1 }]
        };
        break;
      }
    }
  }

  // Compute Base Denominator (Asl al-Mas'alah)
  let baseDen = 1;
  fixedShares.forEach(fs => {
    baseDen = lcm(baseDen, fs.den);
  });

  let sumFixedUnits = 0;
  fixedShares.forEach(fs => {
    fs.units = (baseDen / fs.den) * fs.num;
    sumFixedUnits += fs.units;
  });

  let caseStatus = 'Normal (عام مسئلہ)';
  let finalDen = baseDen;

  // Case A: AWL (عول): Fixed shares exceed 100%
  if (sumFixedUnits > baseDen) {
    finalDen = sumFixedUnits;
    caseStatus = `مسئلہ عول (Awl): اصل مسئلہ ${baseDen} سے بڑھ کر ${finalDen} ہو گیا`;
    notes.push(`اس مسئلے میں ذوی الفروض کے حصوں کا مجموعہ اصل مسئلہ (${baseDen}) سے بڑھ کر (${finalDen}) ہو گیا ہے، جسے فقہ میں "عول" کہتے ہیں۔ اس لیے تمام اصحابِ فرائض کے حصوں میں متناسب کمی ہو گئی اور عصبہ کے لیے کچھ نہیں بچا۔`);
    fixedShares.forEach(fs => {
      activeHeirs.push({
        id: fs.id,
        count: fs.count,
        type: fs.type + ' (عول)',
        fixedLabel: fs.label,
        siham: fs.units,
        totalSiham: finalDen,
        shareRatio: fs.units / finalDen,
        reason: fs.reason
      });
    });
  }
  // Case B: Exact 100% covered by Fixed Shares
  else if (sumFixedUnits === baseDen) {
    caseStatus = `مکمل فرائض (اصل مسئلہ: ${baseDen})`;
    fixedShares.forEach(fs => {
      activeHeirs.push({
        id: fs.id,
        count: fs.count,
        type: fs.type,
        fixedLabel: fs.label,
        siham: fs.units,
        totalSiham: finalDen,
        shareRatio: fs.units / finalDen,
        reason: fs.reason
      });
    });
  }
  // Case C: Remainder exists (sumFixedUnits < baseDen)
  else {
    const remainderUnits = baseDen - sumFixedUnits;

    if (asabahGroup) {
      // Distribute remainder to Asabah
      caseStatus = `فرائض مع العصبات (اصل مسئلہ: ${baseDen})`;
      let totalWeight = 0;
      asabahGroup.members.forEach(m => {
        totalWeight += m.count * m.weightPerHead;
      });

      if (asabahGroup.mergeIntoFixedId) {
        // Father or Grandfather gets 1/6 + Remainder
        fixedShares.forEach(fs => {
          const extra = (fs.id === asabahGroup.mergeIntoFixedId) ? remainderUnits : 0;
          const tot = fs.units + extra;
          activeHeirs.push({
            id: fs.id,
            count: fs.count,
            type: fs.type,
            fixedLabel: fs.label,
            siham: tot,
            totalSiham: baseDen,
            shareRatio: tot / baseDen,
            reason: fs.reason
          });
        });
      } else {
        // Scale by totalWeight for exact integer Siham (Tashih)
        const scale = totalWeight / gcd(remainderUnits, totalWeight);
        finalDen = baseDen * scale;
        fixedShares.forEach(fs => {
          const s = fs.units * scale;
          activeHeirs.push({
            id: fs.id,
            count: fs.count,
            type: fs.type,
            fixedLabel: fs.label,
            siham: s,
            totalSiham: finalDen,
            shareRatio: s / finalDen,
            reason: fs.reason
          });
        });
        const scaledRem = remainderUnits * scale;
        asabahGroup.members.forEach(m => {
          const groupUnits = (scaledRem / totalWeight) * (m.count * m.weightPerHead);
          activeHeirs.push({
            id: m.id,
            count: m.count,
            type: asabahGroup.type,
            fixedLabel: 'بقیہ (عصبہ)',
            siham: groupUnits,
            totalSiham: finalDen,
            shareRatio: groupUnits / finalDen,
            reason: asabahGroup.reason
          });
        });
      }
    } else {
      // No Asabah! Check Radd (رد) or Distant Kindred (ذوی الارحام)
      const nonSpouseFixed = fixedShares.filter(fs => fs.id !== 'husband' && fs.id !== 'wife');
      const spouseFixed = fixedShares.find(fs => fs.id === 'husband' || fs.id === 'wife');

      if (nonSpouseFixed.length > 0) {
        // Apply Radd to non-spouse Ashab al-Faraid
        caseStatus = 'مسئلہ رد (Radd: بقیہ مال ذوی الفروض پر واپس)';
        notes.push('عصبہ موجود نہ ہونے کی وجہ سے بقیہ ترکہ زوجین (شوہر/بیوی) کے علاوہ دیگر اصحابِ فرائض پر ان کے حصوں کے تناسب سے واپس (رد) کر دیا گیا ہے۔');
        const nonSpouseSum = nonSpouseFixed.reduce((acc, x) => acc + x.units, 0);

        if (!spouseFixed) {
          finalDen = nonSpouseSum;
          nonSpouseFixed.forEach(fs => {
            activeHeirs.push({
              id: fs.id,
              count: fs.count,
              type: fs.type + ' + رد',
              fixedLabel: fs.label + ' (رد)',
              siham: fs.units,
              totalSiham: finalDen,
              shareRatio: fs.units / finalDen,
              reason: fs.reason + ' (مع رد)'
            });
          });
        } else {
          // Spouse gets exact fixed share (1/2, 1/4, 1/8); remainder goes proportionally to nonSpouseFixed
          const spDen = spouseFixed.den;
          const spNum = spouseFixed.num;
          const remAfterSpouse = spDen - spNum;
          finalDen = spDen * nonSpouseSum;
          const spSiham = spNum * nonSpouseSum;

          activeHeirs.push({
            id: spouseFixed.id,
            count: spouseFixed.count,
            type: spouseFixed.type,
            fixedLabel: spouseFixed.label,
            siham: spSiham,
            totalSiham: finalDen,
            shareRatio: spSiham / finalDen,
            reason: spouseFixed.reason + ' (زوجین پر رد نہیں ہوتا)'
          });

          nonSpouseFixed.forEach(fs => {
            const s = remAfterSpouse * fs.units;
            activeHeirs.push({
              id: fs.id,
              count: fs.count,
              type: fs.type + ' + رد',
              fixedLabel: fs.label + ' + رد',
              siham: s,
              totalSiham: finalDen,
              shareRatio: s / finalDen,
              reason: fs.reason + ' (بقیہ مال رد کے ذریعے ملا)'
            });
          });
        }
      } else {
        // Either ONLY spouse is present, or NO fixed/asabah heirs at all -> Check Dhawu al-Arham
        const arhamPriority = [
          {
            className: 'صنف اول (نواسے اور نواسیاں)',
            members: [
              ...(c.daughters_son > 0 ? [{ id: 'daughters_son', count: c.daughters_son, w: 2 }] : []),
              ...(c.daughters_daughter > 0 ? [{ id: 'daughters_daughter', count: c.daughters_daughter, w: 1 }] : [])
            ]
          },
          {
            className: 'صنف دوم (نانا)',
            members: [
              ...(c.maternal_grandfather > 0 ? [{ id: 'maternal_grandfather', count: c.maternal_grandfather, w: 1 }] : [])
            ]
          },
          {
            className: 'صنف سوم (بھانجے، بھانجیاں، بھتیجیاں)',
            members: [
              ...(c.brothers_daughter > 0 ? [{ id: 'brothers_daughter', count: c.brothers_daughter, w: 2 }] : []),
              ...(c.sisters_son > 0 ? [{ id: 'sisters_son', count: c.sisters_son, w: 2 }] : []),
              ...(c.sisters_daughter > 0 ? [{ id: 'sisters_daughter', count: c.sisters_daughter, w: 1 }] : [])
            ]
          },
          {
            className: 'صنف چہارم (پھوپھی، ماموں، خالہ)',
            members: [
              ...(c.paternal_aunt > 0 ? [{ id: 'paternal_aunt', count: c.paternal_aunt, w: 2 }] : []),
              ...(c.maternal_uncle > 0 ? [{ id: 'maternal_uncle', count: c.maternal_uncle, w: 2 }] : []),
              ...(c.maternal_aunt > 0 ? [{ id: 'maternal_aunt', count: c.maternal_aunt, w: 1 }] : [])
            ]
          }
        ];

        const activeArhamClass = arhamPriority.find(cl => cl.members.length > 0);

        if (activeArhamClass) {
          caseStatus = 'مسئلہ ذوی الارحام (' + activeArhamClass.className + ')';
          notes.push('اصحاب الفرائض (سوائے زوجین) اور عصبات نہ ہونے کی وجہ سے ترکہ ذوی الارحام (' + activeArhamClass.className + ') میں تقسیم کیا گیا ہے۔');
          const totalW = activeArhamClass.members.reduce((acc, m) => acc + m.count * m.w, 0);

          if (spouseFixed) {
            const spDen = spouseFixed.den;
            const spNum = spouseFixed.num;
            const rem = spDen - spNum;
            finalDen = spDen * totalW;
            activeHeirs.push({
              id: spouseFixed.id,
              count: spouseFixed.count,
              type: spouseFixed.type,
              fixedLabel: spouseFixed.label,
              siham: spNum * totalW,
              totalSiham: finalDen,
              shareRatio: (spNum * totalW) / finalDen,
              reason: spouseFixed.reason
            });
            activeArhamClass.members.forEach(m => {
              const s = rem * (m.count * m.w);
              activeHeirs.push({
                id: m.id,
                count: m.count,
                type: 'ذوی الارحام',
                fixedLabel: 'بقیہ ذوی الارحام',
                siham: s,
                totalSiham: finalDen,
                shareRatio: s / finalDen,
                reason: activeArhamClass.className + ' کے تحت بطور ذوی الارحام وارث۔'
              });
            });
          } else {
            finalDen = totalW;
            activeArhamClass.members.forEach(m => {
              const s = m.count * m.w;
              activeHeirs.push({
                id: m.id,
                count: m.count,
                type: 'ذوی الارحام',
                fixedLabel: 'ذوی الارحام',
                siham: s,
                totalSiham: finalDen,
                shareRatio: s / finalDen,
                reason: activeArhamClass.className + ' کے تحت بطور ذوی الارحام وارث۔'
              });
            });
          }
        } else if (spouseFixed) {
          // Only Husband or Wife exists in the entire world (Fatwa of late Hanafi jurists allows Radd to spouse when no Arham exist)
          caseStatus = 'صرف زوج/زوجہ (تتمہ رد علی الزوجین عند عدم الارحام)';
          notes.push('کوئی ذو فرض، عصبہ یا ذوی الارحام موجود نہ ہونے پر متاخرین فقہائے احناف کے مفتیٰ بہ قول کے مطابق کل ترکہ زوج/زوجہ کو ملے گا۔');
          finalDen = spouseFixed.count;
          activeHeirs.push({
            id: spouseFixed.id,
            count: spouseFixed.count,
            type: 'فرض + رد (عند عدم القرابة)',
            fixedLabel: '1/1 (کل ترکہ)',
            siham: spouseFixed.count,
            totalSiham: finalDen,
            shareRatio: 1,
            reason: 'کسی دوسرے رشتہ دار کے نہ ہونے کی وجہ سے کل ترکہ شوہر/بیوی کو دیا گیا۔'
          });
        }
      }
    }

    // If Ashab al-Faraid (non-spouse) or Asabah were present, mark any selected Dhawu al-Arham as excluded
    const hasRealHeirs = activeHeirs.some(h => h.type !== 'ذوی الارحام' && h.id !== 'husband' && h.id !== 'wife');
    if (hasRealHeirs) {
      const arhamIds = ['daughters_son', 'daughters_daughter', 'maternal_grandfather', 'sisters_son', 'sisters_daughter', 'brothers_daughter', 'paternal_aunt', 'maternal_aunt', 'maternal_uncle'];
      arhamIds.forEach(aid => {
        if (countsInput[aid] > 0) {
          excludedHeirs.push({
            id: aid,
            count: countsInput[aid],
            reason: 'اصحاب الفرائض یا عصبات کی موجودگی میں ذوی الارحام کو وراثت نہیں ملتی۔'
          });
        }
      });
    }
  }

  // Tashih (Make sure each group's siham is divisible by its headcount if equal shares)
  let multiplier = 1;
  activeHeirs.forEach(h => {
    if (h.count > 1) {
      const g = gcd(h.siham, h.count);
      const needed = h.count / g;
      multiplier = lcm(multiplier, needed);
    }
  });
  if (multiplier > 1) {
    finalDen *= multiplier;
    activeHeirs.forEach(h => {
      h.siham *= multiplier;
      h.totalSiham = finalDen;
    });
  }

  return {
    activeHeirs,
    excludedHeirs,
    notes,
    caseStatus,
    finalDen
  };
}
