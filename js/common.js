// Islamic Calculator Pro - common.js: global state, i18n, heir data, utilities, language, navigation, init
// Split from the original single-file app; loaded as a classic script.

// ==================== GLOBAL STATE & DEFINITIONS ====================
let currentLang = 'ur';
let deceasedGender = 'male';
let mirathChartInstance = null;
let mirathChartDark = null;
let customAssets = [];

const I18N = {
  ur: {
    dir: 'rtl',
    topTagline: 'فقہِ حنفی کے مستند اصولوں پر مبنی جدید خودکار اسلامی کیلکولیٹر',
    langLabel: 'زبان:',
    heroTitle: 'اسلامی میراث، زکوٰۃ، عشر اور مناسخہ کیلکولیٹر (ایڈوانسڈ پرو)',
    heroSub: 'اصحابِ فرائض، عصبات، ذوی الارحام، عول، رد، حجب (شرعی دلائل سمیت)، حمل کی وراثت، مناسخہ اور ملٹی یونٹ پراپرٹی و زکوٰۃ کا مکمل خودکار نظام',
    tabMirath: 'میراث کیلکولیٹر (Inheritance)',
    tabZakat: 'زکوٰۃ و عشر کیلکولیٹر (Zakat & Ushr)',
    tabMunasakha: 'مناسخہ (Multi-Stage Death)',
    tabGuides: 'شرعی اصول و رہنمائی',
    tabHome: 'ہوم', tabUshr: 'عشر کیلکولیٹر',
    smartTitle: 'اسمارٹ کیس انپٹ (Smart AI Case Parser) اور مثالیں',
    smartDesc: 'اپنا مسئلہ اردو، رومن اردو یا انگلش میں لکھیں (مثلاً: "میت مرد، 1 بیوہ، 2 بیٹے، 3 بیٹیاں، والدہ زندہ، کل مال 1 کروڑ، قرض 5 لاکھ، 10 مرلہ زمین") یا نیچے دی گئی مثالوں میں سے منتخب کریں:',
    btnSmartParse: 'خودکار فارم فل کریں',
    step1Title: 'ترکہ، شرعی منہائی (کفن دفن، قرض، وصیت) اور زمین',
    step2Title: 'ورثاء کا انتخاب (زندہ مسلمان رشتہ داروں کی تعداد)',
    resultsHeading: 'تقسیمِ ترکہ کا شرعی نتیجہ اور تفصیل',
    acreLabel: 'ایکڑ (Acres - 8 کنال)',
    assetListTitle: 'الگ الگ اثاثہ جات کی فہرست (جائیداد، سونا، گاڑی، بینک اکاؤنٹ: اختیاری)',
    btnCopySummary: 'واٹس ایپ خلاصہ کاپی کریں',
    btnPrintPdf: 'پرنٹ / PDF محفوظ کریں',
    btnSendMunasakha: 'مناسخہ (Stage 2) میں بھیجیں',
    chartTitle: 'حصص کا گرافیکل چارٹ (Visual Distribution)',
    currencyLabel: 'کرنسی:',
    debtHint: 'بندوں کا قرض اور بیوی کا غیر ادا شدہ مہر',
    debtLabel: '۲. قرضہ جات اور واجب الادا حق مہر (منہا)',
    deceasedGenderLabel: 'میت کون تھا؟ (Deceased Gender)',
    femaleLabel: 'عورت (Female)',
    fiqhProofTitle: 'شرعی دلائل اور حجب (وجہِ محرومی) کی تفصیل',
    funeralHint: 'کفن دفن کے ضروری اخراجات (جو ترکہ سے ادا ہوئے)',
    funeralLabel: '۱. تجہیز و تکفین کا خرچہ (منہا)',
    grossEstateHint: 'نقدی، بینک، سونا، مکان، دکان سب کی کل مالیت',
    grossEstateLabel: 'کل ترکہ / مجموعی مالیت (Gross Estate)',
    hamlSub: 'اگر میت کی بیوہ حاملہ ہو تو لڑکا اور لڑکی دونوں کے امکان کا تقابلی حساب اور موقوف حصہ دکھائیں',
    hamlTitle: 'حمل کی وراثت (Unborn Child / Pregnancy Mode)',
    kanalLabel: 'کنال (Kanal - 20 مرلہ)',
    landSectionTitle: 'کل زمین و پلاٹ کا رقبہ: ملٹی یونٹ کنورٹر (اختیاری)',
    maleLabel: 'مرد (Male)',
    marlaLabel: 'مرلہ (Marla)',
    marlaStandardLabel: 'مرلہ اسٹینڈرڈ:',
    netEstateFormulaLabel: 'قابلِ تقسیم خالص ترکہ (Net Distributable Estate):',
    newFeatureBadge: 'Advanced Feature',
    presetLabel: 'مثالی کیسز (Examples):',
    sqftLabel: 'اضافی مربع فٹ (Extra Sq.Ft)',
    step2Sub: 'جو رشتہ دار میت کی وفات کے وقت حیات تھے ان کی تعداد منتخب کریں: کیلکولیٹر خودکار طور پر اصحاب الفرائض، عصبات اور محجوبین کا فیصلہ کرے گا',
    wasiyyahConsentLabel: '1/3 سے زائد پر تمام عاقل بالغ ورثاء راضی ہیں',
    wasiyyahLabel: '۳. جائز وصیت (زیادہ سے زیادہ 1/3)'
  },
  ro: {
    dir: 'ltr',
    topTagline: 'Fiqh-e-Hanafi ke usoolon par mabni Advanced Islamic Inheritance & Zakat Calculator',
    langLabel: 'Language:',
    heroTitle: 'Advanced Wirasat, Zakat, Ushr & Munasakha Calculator Pro',
    heroSub: 'Ashab-ul-Faraiz, Asabat, Zawil-Arham, Awl, Radd, Hajb (Shariah reasons ke sath), Haml aur Multi-Unit Property & Zakat System',
    tabMirath: 'Wirasat Calculator',
    tabZakat: 'Zakat & Ushr Calculator',
    tabMunasakha: 'Munasakha (Stage 2)',
    tabGuides: 'Shariah Usool aur Guidance',
    tabHome: 'Home', tabUshr: 'Ushr Calculator',
    smartTitle: 'Smart AI Case Input & Misali Cases (Examples)',
    smartDesc: 'Apna masla Roman Urdu ya English mein likhein (e.g. "1 bewa, 2 bete, 3 betiyan, walida, 10000000 cash, 10 marla"):',
    btnSmartParse: 'Auto-Fill Form',
    step1Title: 'Tarka (Gross Estate), Funeral, Debts, Wasiyyah & Land Area',
    step2Title: 'Select Living Muslim Heirs (Warisoon ki Tadaad)',
    resultsHeading: 'Taqseem-e-Wirasat Result & Shariah Breakdown',
    acreLabel: 'Aikar (Acres - 8 Kanal)',
    assetListTitle: 'Alag alag asasa jaat ki fehrist (jaidad, sona, gaari, bank account, ikhtiyari)',
    btnCopySummary: 'WhatsApp khulasa copy karein',
    btnPrintPdf: 'Print / PDF save karein',
    btnSendMunasakha: 'Munasakha (Stage 2) mein bhejein',
    chartTitle: 'Hisas ka graphical chart (Visual Distribution)',
    currencyLabel: 'Currency:',
    debtHint: 'Bandan ka qarz aur biwi ka ghair ada shuda mehr',
    debtLabel: '2. Qarzajaat aur wajib ul ada haq mehr (minus)',
    deceasedGenderLabel: 'Mayyat kaun tha? (Deceased Gender)',
    femaleLabel: 'Aurat (Female)',
    fiqhProofTitle: 'Shariah dalail aur Hajb (mehroomi ki wajah) ki tafseel',
    funeralHint: 'Kafan dafan ke zaroori akhrajat (jo tarke se ada huay)',
    funeralLabel: '1. Tajheez o takfeen ka kharcha (minus)',
    grossEstateHint: 'Naqdi, bank, sona, makaan, dukaan sab ki kul maliyat',
    grossEstateLabel: 'Kul tarka / majmoi maliyat (Gross Estate)',
    hamlSub: 'Agar mayyat ki bewa hamla ho to larka aur larki dono ke imkaan ka taqabuli hisaab aur mauqoof hissa dikhayen',
    hamlTitle: 'Hamal ki wirasat (Unborn Child / Pregnancy Mode)',
    kanalLabel: 'Kanal (Kanal - 20 Marla)',
    landSectionTitle: 'Kul zameen o plot ka raqba, Multi Unit Converter (ikhtiyari)',
    maleLabel: 'Mard (Male)',
    marlaLabel: 'Marla (Marla)',
    marlaStandardLabel: 'Marla Standard:',
    netEstateFormulaLabel: 'Qabil e taqseem khalis tarka (Net Distributable Estate):',
    newFeatureBadge: 'Advanced Feature',
    presetLabel: 'Misali Cases (Examples):',
    sqftLabel: 'Izafi murabba foot (Extra Sq.Ft)',
    step2Sub: 'Jo rishtedaar mayyat ki wafat ke waqt zinda thay un ki tadaad muntakhib karein, calculator khud Ashab ul Faraiz, Asabat aur Mehjoobeen ka faisla kare ga',
    wasiyyahConsentLabel: '1/3 se zyada par tamam aqil baligh warasa raazi hain',
    wasiyyahLabel: '3. Jaiz wasiyyat (zyada se zyada 1/3)'
  },
  en: {
    dir: 'ltr',
    topTagline: 'Advanced Hanafi Islamic Inheritance (Mirath), Zakat & Ushr Engine',
    langLabel: 'Language:',
    heroTitle: 'Islamic Inheritance (Mirath), Zakat, Ushr & Munasakha Pro',
    heroSub: 'Complete Hanafi Faraid engine with Ashab al-Faraid, Asabat, Dhawu al-Arham, Awl, Radd, Hajb explanations, Unborn Child (Haml), and Multi-Unit Land distribution',
    tabMirath: 'Inheritance (Mirath)',
    tabZakat: 'Zakat & Ushr Calculator',
    tabMunasakha: 'Munasakha (Successive Deaths)',
    tabGuides: 'Shariah Principles & Guides',
    tabHome: 'Home', tabUshr: 'Ushr Calculator',
    smartTitle: 'Smart Natural Language Case Parser & Examples',
    smartDesc: 'Type your case in plain English or Roman Urdu (e.g., "1 wife, 2 sons, 3 daughters, mother, 10000000 cash, 10 marla") or pick an example:',
    btnSmartParse: 'Smart Auto-Fill',
    step1Title: 'Gross Estate, Automatic Shariah Deductions & Land Area',
    step2Title: 'Select Living Heirs at Time of Death (29 Heir Types)',
    resultsHeading: 'Islamic Inheritance Distribution & Fiqhi Proof',
    acreLabel: 'Acres (1 Acre = 8 Kanal)',
    assetListTitle: 'Itemised asset list (property, gold, vehicle, bank account, optional)',
    btnCopySummary: 'Copy WhatsApp summary',
    btnPrintPdf: 'Print / Save PDF',
    btnSendMunasakha: 'Send to Munasakha (Stage 2)',
    chartTitle: 'Visual Distribution Chart',
    currencyLabel: 'Currency:',
    debtHint: 'Debts owed to people and the wife’s unpaid mahr',
    debtLabel: '2. Debts & unpaid Mahr (deducted)',
    deceasedGenderLabel: 'Who was the deceased? (Deceased Gender)',
    femaleLabel: 'Female',
    fiqhProofTitle: 'Shariah proofs & Hajb (reasons for exclusion) in detail',
    funeralHint: 'Necessary funeral and burial expenses (paid from the estate)',
    funeralLabel: '1. Funeral & burial expenses (deducted)',
    grossEstateHint: 'Total value of cash, bank, gold, house, shop, everything',
    grossEstateLabel: 'Gross Estate (total value of all assets)',
    hamlSub: 'If the widow is pregnant, show a comparative calculation for a boy and a girl and the reserved share',
    hamlTitle: 'Inheritance of the Unborn Child (Haml / Pregnancy Mode)',
    kanalLabel: 'Kanal (1 Kanal = 20 Marla)',
    landSectionTitle: 'Total land & plot area, multi-unit converter (optional)',
    maleLabel: 'Male',
    marlaLabel: 'Marla',
    marlaStandardLabel: 'Marla standard:',
    netEstateFormulaLabel: 'Net Distributable Estate:',
    newFeatureBadge: 'Advanced Feature',
    presetLabel: 'Example cases:',
    sqftLabel: 'Extra Sq.Ft',
    step2Sub: 'Select the numbers of relatives who were alive at the time of death. The calculator decides the fixed-share heirs, residuaries and the excluded, automatically',
    wasiyyahConsentLabel: 'All adult, sane heirs consent to more than 1/3',
    wasiyyahLabel: '3. Valid bequest / wasiyyat (maximum 1/3)'
  },
  hi: {
    dir: 'ltr',
    topTagline: 'फ़िक़्ह-ए-हनफ़ी पर आधारित एडवांस्ड इस्लामी विरासत और ज़कात कैलकुलेटर',
    langLabel: 'भाषा:',
    heroTitle: 'इस्लामी विरासत (मीरास), ज़कात, उश्र और मुनासख़ा कैलकुलेटर प्रो',
    heroSub: 'असहाब-उल-फ़राइज़, असबात, ज़विल-अरहाम, औल, रद्द, हज्ब और मल्टी-यूनिट प्रॉपर्टी व ज़कात का संपूर्ण सिस्टम',
    tabMirath: 'विरासत कैलकुलेटर',
    tabZakat: 'ज़कात और उश्र कैलकुलेटर',
    tabMunasakha: 'मुनासख़ा (Stage 2)',
    tabGuides: 'शरई उसूल और मार्गदर्शन',
    tabHome: 'होम', tabUshr: 'उश्र कैलकुलेटर',
    smartTitle: 'स्मार्ट केस इनपुट और उदाहरण',
    smartDesc: 'अपना केस लिखें (जैसे: "1 bewa, 2 bete, 3 betiyan, 10000000 cash, 10 marla") या नीचे दिए गए उदाहरण चुनें:',
    btnSmartParse: 'ऑटो-फ़िल करें',
    step1Title: 'कुल संपत्ति, कफ़न-दफ़न, क़र्ज़, वसीयत और ज़मीन',
    step2Title: 'जीवित वारिसों का चयन (29 रिश्तेदार श्रेणियाँ)',
    resultsHeading: 'विरासत का शरई बंटवारा और दलील',
    acreLabel: 'एकड़ (Acres - 8 कनाल)',
    assetListTitle: 'अलग अलग संपत्तियों की सूची (जायदाद, सोना, गाड़ी, बैंक खाता, वैकल्पिक)',
    btnCopySummary: 'WhatsApp सारांश कॉपी करें',
    btnPrintPdf: 'प्रिंट / PDF सहेजें',
    btnSendMunasakha: 'मुनासख़ा (Stage 2) में भेजें',
    chartTitle: 'हिस्सों का ग्राफ़िकल चार्ट (Visual Distribution)',
    currencyLabel: 'मुद्रा:',
    debtHint: 'लोगों का क़र्ज़ और पत्नी का अवैतनिक महर',
    debtLabel: '2. क़र्ज़े और देय हक़ महर (घटाएँ)',
    deceasedGenderLabel: 'मृतक कौन था? (Deceased Gender)',
    femaleLabel: 'महिला (Female)',
    fiqhProofTitle: 'शरई दलीलें और हज्ब (वंचित होने के कारण) विस्तार से',
    funeralHint: 'कफ़न दफ़न के आवश्यक ख़र्च (जो संपत्ति से दिए गए)',
    funeralLabel: '1. कफ़न दफ़न का ख़र्च (घटाएँ)',
    grossEstateHint: 'नक़दी, बैंक, सोना, मकान, दुकान सबकी कुल कीमत',
    grossEstateLabel: 'कुल संपत्ति / कुल मूल्य (Gross Estate)',
    hamlSub: 'यदि मृतक की विधवा गर्भवती हो तो लड़का और लड़की दोनों की संभावना का तुलनात्मक हिसाब और आरक्षित हिस्सा दिखाएँ',
    hamlTitle: 'गर्भस्थ शिशु की विरासत (Unborn Child / Pregnancy Mode)',
    kanalLabel: 'कनाल (Kanal - 20 मरला)',
    landSectionTitle: 'कुल ज़मीन व प्लॉट का क्षेत्रफल, मल्टी यूनिट कन्वर्टर (वैकल्पिक)',
    maleLabel: 'पुरुष (Male)',
    marlaLabel: 'मरला (Marla)',
    marlaStandardLabel: 'मरला स्टैंडर्ड:',
    netEstateFormulaLabel: 'वितरण योग्य शुद्ध संपत्ति (Net Distributable Estate):',
    newFeatureBadge: 'Advanced Feature',
    presetLabel: 'उदाहरण केस (Examples):',
    sqftLabel: 'अतिरिक्त वर्ग फ़ुट (Extra Sq.Ft)',
    step2Sub: 'जो रिश्तेदार मृतक की मृत्यु के समय जीवित थे उनकी संख्या चुनें, कैलकुलेटर ख़ुद असहाब-उल-फ़राइज़, असबात और महजूबीन का निर्णय करेगा',
    wasiyyahConsentLabel: '1/3 से अधिक पर सभी वयस्क समझदार वारिस सहमत हैं',
    wasiyyahLabel: '3. वैध वसीयत (अधिकतम 1/3)'
  }
};

// 29 Heirs Definition matching tahirmadani.com + extended metadata
const HEIR_CATEGORIES = [
  {
    id: 'spouses',
    titleUr: 'زوجین (Spouses)',
    titleEn: 'Spouses (Husband / Wife)',
    titleRo: 'Zojain (Spouses)', titleHi: 'पति-पत्नी (Spouses)',
    heirs: [
      { id: 'wife', nameUr: 'بیوی (زوجہ)', nameRo: 'Bewa / Wife', nameEn: 'Wife (Zawjah)', nameHi: 'पत्नी (ज़ौजा)', max: 4, onlyForDeceased: 'male', defaultCount: 0 },
      { id: 'husband', nameUr: 'شوہر (زوج)', nameRo: 'Shohar / Husband', nameEn: 'Husband (Zawj)', nameHi: 'पति (ज़ौज)', max: 1, onlyForDeceased: 'female', defaultCount: 0 }
    ]
  },
  {
    id: 'descendants',
    titleUr: 'اولاد و اولادِ اولاد (Descendants)',
    titleEn: 'Children & Male-Line Grandchildren',
    titleRo: 'Aulad wa Aulad-e-Aulad (Descendants)', titleHi: 'संतान और संतान की संतान (Descendants)',
    heirs: [
      { id: 'son', nameUr: 'بیٹا (ابن)', nameRo: 'Beta (Son)', nameEn: 'Son (Ibn)', nameHi: 'बेटा (इब्न)', max: 20, defaultCount: 0 },
      { id: 'daughter', nameUr: 'بیٹی (بنت)', nameRo: 'Beti (Daughter)', nameEn: 'Daughter (Bint)', nameHi: 'बेटी (बिन्त)', max: 20, defaultCount: 0 },
      { id: 'grandson', nameUr: 'پوتا (ابن الابن)', nameRo: 'Pota (Son\'s Son)', nameEn: 'Paternal Grandson', nameHi: 'पोता', max: 20, defaultCount: 0 },
      { id: 'granddaughter', nameUr: 'پوتی (بنت الابن)', nameRo: 'Poti (Son\'s Daughter)', nameEn: 'Paternal Granddaughter', nameHi: 'पोती', max: 20, defaultCount: 0 },
      { id: 'great_grandson', nameUr: 'پڑپوتا (ابن ابن الابن)', nameRo: 'Parpota (Great-Grandson)', nameEn: 'Paternal Great-Grandson', nameHi: 'परपोता', max: 20, defaultCount: 0 },
      { id: 'great_granddaughter', nameUr: 'پڑپوتی (بنت ابن الابن)', nameRo: 'Parpoti (Great-Granddaughter)', nameEn: 'Paternal Great-Granddaughter', nameHi: 'परपोती', max: 20, defaultCount: 0 }
    ]
  },
  {
    id: 'ascendants',
    titleUr: 'اصول: والدین اور دادا/دادی/نانی (Ascendants)',
    titleEn: 'Parents & Grandparents',
    titleRo: 'Usool, Waldain aur Dada Dadi Nani (Ascendants)', titleHi: 'मूल, माता-पिता और दादा-दादी, नाना-नानी (Ascendants)',
    heirs: [
      { id: 'father', nameUr: 'والد (اب)', nameRo: 'Walid (Father)', nameEn: 'Father (Ab)', nameHi: 'पिता (अब)', max: 1, defaultCount: 0 },
      { id: 'mother', nameUr: 'والدہ (ام)', nameRo: 'Walida (Mother)', nameEn: 'Mother (Umm)', nameHi: 'माता (उम्म)', max: 1, defaultCount: 0 },
      { id: 'paternal_grandfather', nameUr: 'دادا (جدّ صحیح)', nameRo: 'Dada (Paternal Grandfather)', nameEn: 'Paternal Grandfather', nameHi: 'दादा', max: 1, defaultCount: 0 },
      { id: 'paternal_great_grandfather', nameUr: 'پردادا (دادا کا باپ)', nameRo: 'Pardada (Great-Grandfather)', nameEn: 'Paternal Great-Grandfather', nameHi: 'परदादा', max: 1, defaultCount: 0 },
      { id: 'paternal_grandmother', nameUr: 'دادی (والد کی ماں)', nameRo: 'Dadi (Paternal Grandmother)', nameEn: 'Paternal Grandmother', nameHi: 'दादी', max: 1, defaultCount: 0 },
      { id: 'paternal_great_grandmother', nameUr: 'پردادی (دادا کی ماں)', nameRo: 'Pardadi (Paternal Great-Grandmother)', nameEn: 'Paternal Great-Grandmother', nameHi: 'परदादी', max: 1, defaultCount: 0 },
      { id: 'maternal_grandmother', nameUr: 'نانی (والدہ کی ماں)', nameRo: 'Nani (Maternal Grandmother)', nameEn: 'Maternal Grandmother', nameHi: 'नानी', max: 1, defaultCount: 0 },
      { id: 'maternal_great_grandmother', nameUr: 'پرنانی (نانی کی ماں)', nameRo: 'Parnani (Maternal Great-Grandmother)', nameEn: 'Maternal Great-Grandmother', nameHi: 'परनानी', max: 1, defaultCount: 0 }
    ]
  },
  {
    id: 'siblings',
    titleUr: 'بھائی اور بہنیں (Siblings)',
    titleEn: 'Full, Consanguine & Uterine Siblings',
    titleRo: 'Bhai aur Behnein (Siblings)', titleHi: 'भाई और बहनें (Siblings)',
    heirs: [
      { id: 'real_brother', nameUr: 'حقیقی بھائی (اخ شقیق)', nameRo: 'Haqeeqi Bhai (Full Brother)', nameEn: 'Full Brother', nameHi: 'सगा भाई', max: 20, defaultCount: 0 },
      { id: 'real_sister', nameUr: 'حقیقی بہن (اخت شقیقہ)', nameRo: 'Haqeeqi Behan (Full Sister)', nameEn: 'Full Sister', nameHi: 'सगी बहन', max: 20, defaultCount: 0 },
      { id: 'consanguine_brother', nameUr: 'علاتی بھائی (والد شریک)', nameRo: 'Allati Bhai (Paternal Half-Brother)', nameEn: 'Paternal Half-Brother', nameHi: 'सौतेला भाई (पिता शरीक)', max: 20, defaultCount: 0 },
      { id: 'consanguine_sister', nameUr: 'علاتی بہن (والد شریک)', nameRo: 'Allati Behan (Paternal Half-Sister)', nameEn: 'Paternal Half-Sister', nameHi: 'सौतेली बहन (पिता शरीक)', max: 20, defaultCount: 0 },
      { id: 'uterine_sibling', nameUr: 'اخیافی بھائی/بہن (ماں شریک)', nameRo: 'Akhyafi Bhai/Behan (Maternal Sibling)', nameEn: 'Maternal Half-Sibling', nameHi: 'माँ शरीक भाई/बहन', max: 20, defaultCount: 0 }
    ]
  },
  {
    id: 'other_agnates',
    titleUr: 'دیگر عصبات: بھتیجے، چچا، چچازاد (Other Agnates)',
    titleEn: 'Nephews, Paternal Uncles & Male Cousins',
    titleRo: 'Deegar Asabat, Bhatijay, Chacha, Chachazad (Other Agnates)', titleHi: 'अन्य असबात, भतीजे, चाचा, चचेरे (Other Agnates)',
    heirs: [
      { id: 'real_nephew', nameUr: 'بھتیجا حقیقی (ابن اخ شقیق)', nameRo: 'Bhatija Haqeeqi (Full Brother\'s Son)', nameEn: 'Full Brother\'s Son', nameHi: 'सगा भतीजा', max: 20, defaultCount: 0 },
      { id: 'consanguine_nephew', nameUr: 'بھتیجا علاتی (ابن اخ لأب)', nameRo: 'Bhatija Allati (Half-Brother\'s Son)', nameEn: 'Paternal Half-Brother\'s Son', nameHi: 'सौतेला भतीजा (पिता शरीक)', max: 20, defaultCount: 0 },
      { id: 'real_paternal_uncle', nameUr: 'چچا حقیقی (عم شقیق)', nameRo: 'Chacha Haqeeqi (Full Paternal Uncle)', nameEn: 'Full Paternal Uncle', nameHi: 'सगा चाचा', max: 20, defaultCount: 0 },
      { id: 'consanguine_paternal_uncle', nameUr: 'چچا علاتی (عم لأب)', nameRo: 'Chacha Allati (Half Paternal Uncle)', nameEn: 'Paternal Half-Uncle', nameHi: 'सौतेला चाचा (पिता शरीक)', max: 20, defaultCount: 0 },
      { id: 'real_paternal_cousin', nameUr: 'چچازاد حقیقی (ابن عم شقیق)', nameRo: 'Chachazad Haqeeqi (Full Cousin)', nameEn: 'Full Paternal Uncle\'s Son', nameHi: 'सगा चचेरा भाई', max: 20, defaultCount: 0 },
      { id: 'consanguine_paternal_cousin', nameUr: 'چچازاد علاتی (ابن عم لأب)', nameRo: 'Chachazad Allati (Half Cousin)', nameEn: 'Paternal Half-Uncle\'s Son', nameHi: 'सौतेला चचेरा भाई (पिता शरीक)', max: 20, defaultCount: 0 }
    ]
  },
  {
    id: 'distant_kindred',
    titleUr: 'ذوی الارحام: نواسے، نانا، بھانجے، پھوپھی، خالہ، ماموں (Distant Kindred)',
    titleEn: 'Distant Kindred (Dhawu al-Arham - Inherits only if no Ashab al-Faraid/Asabat)',
    titleRo: 'Zawil-Arham, Nawasay, Nana, Bhanjay, Phuphi, Khala, Mamoo (Distant Kindred)', titleHi: 'ज़विल-अरहाम, नवासे, नाना, भांजे, बुआ, ख़ाला, मामू (Distant Kindred)',
    heirs: [
      { id: 'daughters_son', nameUr: 'نواسا (ابن البنت)', nameRo: 'Nawasa (Daughter\'s Son)', nameEn: 'Daughter\'s Son', nameHi: 'नवासा (बेटी का बेटा)', max: 20, defaultCount: 0 },
      { id: 'daughters_daughter', nameUr: 'نواسی (بنت البنت)', nameRo: 'Nawasi (Daughter\'s Daughter)', nameEn: 'Daughter\'s Daughter', nameHi: 'नवासी (बेटी की बेटी)', max: 20, defaultCount: 0 },
      { id: 'maternal_grandfather', nameUr: 'نانا (اب الام)', nameRo: 'Nana (Maternal Grandfather)', nameEn: 'Maternal Grandfather', nameHi: 'नाना', max: 1, defaultCount: 0 },
      { id: 'sisters_son', nameUr: 'بھانجا (ابن الاخت)', nameRo: 'Bhanja (Sister\'s Son)', nameEn: 'Sister\'s Son', nameHi: 'भांजा (बहन का बेटा)', max: 20, defaultCount: 0 },
      { id: 'sisters_daughter', nameUr: 'بھانجی (بنت الاخت)', nameRo: 'Bhanji (Sister\'s Daughter)', nameEn: 'Sister\'s Daughter', nameHi: 'भांजी (बहन की बेटी)', max: 20, defaultCount: 0 },
      { id: 'brothers_daughter', nameUr: 'بھتیجی (بنت الاخ)', nameRo: 'Bhatiji (Brother\'s Daughter)', nameEn: 'Brother\'s Daughter', nameHi: 'भतीजी (भाई की बेटी)', max: 20, defaultCount: 0 },
      { id: 'paternal_aunt', nameUr: 'پھوپھی (عمّہ)', nameRo: 'Phuphi (Paternal Aunt)', nameEn: 'Paternal Aunt', nameHi: 'बुआ (फूफी)', max: 20, defaultCount: 0 },
      { id: 'maternal_aunt', nameUr: 'خالہ (خالہ)', nameRo: 'Khala (Maternal Aunt)', nameEn: 'Maternal Aunt', nameHi: 'ख़ाला', max: 20, defaultCount: 0 },
      { id: 'maternal_uncle', nameUr: 'ماموں (خال)', nameRo: 'Mamu (Maternal Uncle)', nameEn: 'Maternal Uncle', nameHi: 'मामू', max: 20, defaultCount: 0 }
    ]
  }
];

const heirCounts = {};
HEIR_CATEGORIES.forEach(cat => {
  cat.heirs.forEach(h => {
    heirCounts[h.id] = h.defaultCount || 0;
  });
});

// ==================== UTILITY HELPERS ====================
function showToast(msg, icon = '✅') {
  const box = document.getElementById('toastBox');
  const txt = document.getElementById('toastText');
  const icn = document.getElementById('toastIcon');
  if (!box || !txt) return;
  txt.textContent = msg;
  icn.textContent = icon;
  box.classList.remove('hidden');
  setTimeout(() => {
    box.classList.add('hidden');
  }, 3200);
}

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function lcm(a, b) {
  if (!a || !b) return 1;
  return Math.abs((a * b) / gcd(a, b));
}

function formatNum(n, decimals = 0) {
  if (!isFinite(n)) return '0';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function getHeirMeta(id) {
  for (const cat of HEIR_CATEGORIES) {
    for (const h of cat.heirs) {
      if (h.id === id) return h;
    }
  }
  return { id, nameUr: id, nameRo: id, nameEn: id, max: 20 };
}

function getHeirDisplayName(id) {
  const h = getHeirMeta(id);
  if (currentLang === 'en') return h.nameEn;
  if (currentLang === 'ro') return h.nameRo;
  if (currentLang === 'hi') return h.nameHi || h.nameEn;
  return h.nameUr;
}

const iosTabbarEl = document.querySelector('.site-navbar');
window.addEventListener('scroll', () => {
  if (iosTabbarEl) iosTabbarEl.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });
const iosTabtrackEl = document.querySelector('.site-navlinks');
if (iosTabtrackEl) {
  iosTabtrackEl.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    const btns = Array.from(iosTabtrackEl.querySelectorAll('a'));
    const cur = btns.indexOf(document.activeElement);
    if (cur < 0) return;
    e.preventDefault();
    const nxt = e.key === 'Home' ? 0 : (e.key === 'End' ? btns.length - 1 : (cur + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length);
    btns[nxt].focus();
    btns[nxt].click();
  });
}

// ==================== COPY & NAVIGATION ACTIONS ====================
function copyTextFallback(text, msg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(() => fallbackExecCopy(text, msg));
  } else {
    fallbackExecCopy(text, msg);
  }
}

function fallbackExecCopy(text, msg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  showToast(msg);
}

function copyMirathWhatsAppSummary() {
  const res = solveHanafiMirath(heirCounts);
  const net = document.getElementById('netEstateDisplay').textContent;
  let lines = [`📜 *تقسیمِ میراث رپورٹ (فقہِ حنفی)*`, `قابلِ تقسیم ترکہ: ${net}`, `نوعیت: ${res.caseStatus}`, ``];
  res.activeHeirs.forEach(h => {
    lines.push(`• ${getHeirDisplayName(h.id)} (${h.count}): ${(h.shareRatio * 100).toFixed(2)}% [سہام ${h.siham}/${h.totalSiham}]`);
  });
  copyTextFallback(lines.join('\n'), 'واٹس ایپ خلاصہ کاپی ہو گیا!');
}

function copyZakatSummary() {
  const net = document.getElementById('zakatNetWorthOut').textContent;
  const due = document.getElementById('zakatPayableOut').textContent;
  const text = `💰 *زکوٰۃ و عشر رپورٹ*\nخالص قابلِ زکوٰۃ مالیت: ${net}\nکل واجب الادا زکوٰۃ و عشر: ${due}`;
  copyTextFallback(text, 'زکوٰۃ کا خلاصہ کاپی ہو گیا!');
}

function switchMainTab(tabId) {
  const target = PAGE_MAP[tabId];
  if (target) location.href = target;
}

function setLanguage(lang) {
  currentLang = lang;
  const dict = I18N[lang] || I18N.ur;
  const root = document.getElementById('htmlRoot');
  root.setAttribute('dir', dict.dir);
  root.setAttribute('lang', lang);

  ['ur', 'ro', 'en', 'hi'].forEach(l => {
    const btn = document.getElementById(`langBtn-${l}`);
    if (btn) {
      btn.className = (l === lang)
        ? 'px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold transition is-active'
        : 'px-2.5 py-1 rounded-md bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 transition';
      btn.setAttribute('aria-pressed', l === lang ? 'true' : 'false');
    }
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (dict[k]) el.textContent = dict[k];
  });

  try { localStorage.setItem('calcLang', lang); } catch (e) {}
  const langSel = document.getElementById('langSwitch');
  if (langSel) langSel.value = lang;
  if (document.getElementById('panel-mirath')) { renderHeirsGrid(); calculateMirath(); }
  markUrduText();
}

// ==================== MULTI-PAGE NAVIGATION, LANGUAGE, USHR ====================
const PAGE_MAP = { home: 'index.html', mirath: 'mirath.html', zakat: 'zakat.html', ushr: 'ushr.html', munasakha: 'munasakha.html', guides: 'guides.html' };

function initLanguage() {
  let saved = null;
  try { saved = localStorage.getItem('calcLang'); } catch (e) {}
  setLanguage(saved && I18N[saved] ? saved : 'ur');
}




// Urdu script text keeps the Nastaleeq font even in LTR languages,
// where the body font is Latin. In Urdu (RTL) the body already uses it.
function markUrduText() {
  const root = document.getElementById('htmlRoot');
  if (!root || root.getAttribute('dir') === 'rtl') return;
  document.querySelectorAll('p, li, td, th, span, label, h2, h3, h4, option, button, a').forEach(el => {
    if (el.children.length === 0 && /[\u0600-\u06FF]/.test(el.textContent || '')) el.classList.add('urdu-text');
  });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  if (document.getElementById('panel-mirath')) { renderHeirsGrid(); calculateMirath(); }
  if (document.getElementById('panel-zakat')) calculateZakat();
  if (document.getElementById('panel-ushr')) calculateUshr();
  if (document.getElementById('panel-munasakha')) { applyMunasakhaTransfer(); calculateMunasakha(); }
  markUrduText();
});
  
