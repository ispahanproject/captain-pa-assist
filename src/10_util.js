/* =====================================================================
   共通ヘルパー
   ⟦…⟧ … 未入力の項目(黄色で表示)
   ⁅新¦原文⁆ … ハンドブックの文例から直した/足した箇所(点線の下線で表示)
   ===================================================================== */
const P = s => `⟦${s}⟧`;
const FX = (neu, orig = '') => `⁅${neu}¦${orig}⁆`;
const has = x => x !== undefined && x !== null && String(x).trim() !== '';
const J = (...a) => a.filter(Boolean).join('');
const E = (...a) => a.filter(Boolean).join(' ');
const or = (x, ph) => (has(x) ? x : P(ph));
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- 時刻・時間 ---------- */
function hm(t) { return t.split(':').map(Number); }
function jt(t) {                       // 日本語の時刻(午後3時45分 / 15時45分)
  if (!has(t)) return P('時刻');
  const [h, m] = hm(t);
  if (S.flight.clock === '24') return `${h}時${m ? m + '分' : ''}`;
  return `${h >= 12 ? '午後' : '午前'}${h % 12}時${m ? m + '分' : ''}`;
}
function et(t) {                       // 英語の時刻(3:45 p.m. / 15:45)
  if (!has(t)) return P('time');
  const [h, m] = hm(t), mm = String(m).padStart(2, '0');
  if (S.flight.clock === '24') return `${String(h).padStart(2, '0')}:${mm}`;
  if (h === 12 && m === 0) return 'noon';
  if (h === 0 && m === 0) return 'midnight';
  return `${h % 12 || 12}:${mm} ${h >= 12 ? 'p.m.' : 'a.m.'}`;
}
const LTJ = () => (S.flight.lt ? '現地時間の' : '');
const LTE = () => (S.flight.lt ? ' local time' : '');

/* ---------- 高度・気温・天候 ---------- */
function jaFeet(n) {
  n = Math.round(n / 100) * 100;
  const man = Math.floor(n / 10000), sen = Math.floor((n % 10000) / 1000), hyaku = Math.floor((n % 1000) / 100);
  return (man ? man + '万' : '') + (sen ? sen + '千' : '') + (hyaku ? hyaku + '百' : '') + 'フィート';
}
const meters = ft => (Math.round(ft * 0.3048 / 100) * 100).toLocaleString('en-US');
const jaTemp = t => (t < 0 ? 'マイナス' + -t : t) + '度';
function fBand(c) {                    // 華氏は "in the high 70s" の言い方(ハンドブック推奨)
  const f = Math.round(c * 9 / 5 + 32);
  if (f < 10) return `around ${f} degrees Fahrenheit`;
  const r = f % 10, w = r <= 3 ? 'low' : r <= 6 ? 'mid' : 'high';
  return `in the ${w} ${Math.floor(f / 10) * 10}s Fahrenheit`;
}
function enTemp(c) {                  // 英語は摂氏と華氏の両方(日本語は摂氏のみ)
  return `${c < 0 ? 'minus ' + -c : c} degrees Celsius, or ${fBand(c)}`;
}
// ハンドブックの天候用語(2.3.2.4.2.4)
const WX = [
  ['', '—', ''], ['clear', '快晴', 'clear'], ['fair', '晴れ', 'fair'], ['hazy', '高曇り', 'hazy'],
  ['cloudy', '曇り', 'cloudy'], ['rainy', '雨', 'rainy'], ['snowy', '雪', 'snowy'],
  ['foggy', '霧', 'foggy'], ['dense', '濃霧', 'densely fogged'],
];
const WX_OPTS = WX.map(w => [w[0], w[1]]);

// 航路上の天候とベルト着用のお願い(ベルト着用のお願いは常に入れる)。v.route: good / bumpy / ''
// 「概ね良好」は1文にまとめる(機長の言い方)。英語の But は「概ね良好」を受けるときだけ
function routeAndBelt(v) {
  const beltEn = 'please keep your seat belt fastened at all times while you are seated.';
  if (v.route === 'good') return {
    route: {
      ja: '航路上の天候は概ね良好と思われますが、突然の揺れに備えて、ご着席中は常にシートベルトをお締めいただきますようご協力お願いいたします。',
      en: `Our flight conditions are expected to be fair all the way. But, for your own safety, ${beltEn}`,
    },
    belt: { ja: '', en: '' },
  };
  if (v.route === 'bumpy') return {
    route: { ja: '航路上の天候は多少気流が不安定な為、思いがけず突然大きく揺れることもあります。', en: 'We are likely to have some turbulence during this flight.' },
    belt: {
      ja: '揺れましても飛行の安全性には影響ございませんが、みなさまの怪我防止のため、ご着席中は常にシートベルトをお締めいただきますようご協力お願いいたします。',
      en: `For your own safety, ${beltEn}`,
    },
  };
  // 航路上の天候を言わないときは揺れに触れていないので、「揺れましても」ではなく「突然の揺れに備えて」にする
  return {
    route: { ja: '', en: '' },
    belt: { ja: '突然の揺れに備えて、ご着席中は常にシートベルトをお締めいただきますようご協力お願いいたします。', en: `For your own safety, ${beltEn}` },
  };
}
// 現地(目的地)の天候と気温。v.dwx / v.dtemp。req=true なら未入力を〔 〕で示し、false なら無ければ null
function destWeather(v, d, req) {
  const w = WX.find(x => x[0] === v.dwx), hw = !!(w && w[0]), ht = has(v.dtemp);
  if (!req && !hw && !ht) return null;
  const wj = hw ? w[1] : P('天候'), we = hw ? w[2] : P('weather');
  const tj = ht ? jaTemp(+v.dtemp) : P('気温'), te = ht ? enTemp(+v.dtemp) : P('temperature');
  if (!req && !ht) return { ja: `現在の${d.city}の天候は${wj}と報告されております。`, en: `The current weather at ${d.en} is reported to be ${we}.` };
  if (!req && !hw) return { ja: `現在の${d.city}の気温は${tj}と報告されております。`, en: `The current temperature at ${d.en} is reported to be ${te}.` };
  return { ja: `現在の${d.city}の天候は${wj}、気温は${tj}と報告されております。`, en: `The current weather at ${d.en} is reported to be ${we}, with a temperature of ${te}.` };
}

/* ---------- 挨拶・名乗り ---------- */
const CAPTAIN = { ja: P('〇〇'), en: P('___') };   // 冒頭の挨拶で名乗る名前(空欄:読むときに補う)
function greet() {
  const g = S.flight.greet, h = new Date().getHours();
  const k = g === 'auto' ? (h < 11 ? 'm' : h < 18 ? 'a' : 'e') : g;
  return { m: ['おはようございます', 'Good morning'], a: ['こんにちは', 'Good afternoon'], e: ['こんばんは', 'Good evening'] }[k];
}

/* ---------- 空港 ----------
   ja: 空港名 / city: 天候案内用の地名 / en: 英語名 / bj・be: 「〇〇行き」の地名 */
function apt(v, k) {
  const c = v[k];
  if (c === '__') {
    const ja = v[k + 'Ja'], en = v[k + 'En'];
    const city = has(ja) ? ja.replace(/空港$/, '') : P('空港名');
    return { ja: has(ja) ? city + '空港' : city, city, en: has(en) ? en : P('airport'), bj: city, be: has(en) ? en.replace(/ Airport$/i, '') : P('airport') };
  }
  const a = AIRPORTS.find(x => x[0] === c);
  if (!a) return { ja: P('空港'), city: P('空港'), en: P('airport'), bj: P('行き先'), be: P('destination') };
  const b = BOUND[c] || [a[3], a[4].replace(/ Airport$/, '')];
  return { ja: S.flight.nick && a[2] ? a[2] : a[1], city: a[3], en: a[4], bj: b[0], be: b[1] };
}
const ORIG = () => apt(S.flight, 'orig');
const DEST = () => apt(S.flight, 'dest');
// 「出発地 / 目的地 / その他」から空港を選ぶ項目
function which(v, k) {
  if (v[k] === 'orig') return ORIG();
  if (v[k] === 'dest') return DEST();
  return apt(v, k + 'Apt');
}
const WHICH_OPTS = [['dest', '目的地'], ['orig', '出発地'], ['other', 'その他']];
function whichField(k, label) {
  return [
    { k, t: 'seg', label, opts: WHICH_OPTS },
    { k: k + 'Apt', t: 'airport', label: '空港', show: v => v[k] === 'other' },
  ];
}
