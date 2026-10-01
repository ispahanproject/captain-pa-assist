/* =====================================================================
   上空(1/2)  ハンドブック 2.3.2.4.2.1〜.2 挨拶 / 2.3.2.4.5.1 TURBULENCE
   ===================================================================== */
function lmPick(v) {                   // 見どころの選択 → { nj, ne, item|null }
  const reg = LANDMARKS[v.lmR];
  if (v.lmI === '__' || !reg) return { nj: or(v.lmJa, '見えるもの'), ne: or(v.lmEn, '___'), item: null };
  const it = reg.items[v.lmI];
  return it ? { nj: it[0], ne: it[1], item: it } : { nj: P('見えるもの'), ne: P('___'), item: null };
}

SITS.push({
  id: 'welcome', t: ['air'], g: '挨拶', label: '上空での挨拶', src: '2.3.2.4.2.1〜.2', greet: true,
  defaults: { kind: 'full', side: '', lmR: '', lmI: '', color: true, route: 'good', condAct: 'ret', lobby: true },
  fields: [
    { k: 'kind', t: 'seg', label: '種類', opts: [['full', '通常版'], ['simple', '簡易版(早朝・深夜・短距離)']] },
    { k: 'pos', t: 'text2', label: '現在の場所(任意)', ph: ['例:静岡県浜松市', 'e.g. Hamamatsu, Shizuoka'], show: v => v.kind !== 'simple' },
    { k: 'alt', t: 'num', label: '高度(任意)', unit: 'ft', show: v => v.kind !== 'simple' },
    { k: 'side', t: 'seg', label: '見どころ', opts: [['', 'なし'], ['right', '右側'], ['left', '左側']], show: v => v.kind !== 'simple' },
    { k: 'lm', t: 'landmark', label: '見えるもの', show: v => v.kind !== 'simple' && !!v.side },
    { k: 'color', t: 'chk', label: '彩りを添える一言(標高など)を入れる', show: v => v.kind !== 'simple' && !!v.side && v.lmI !== '__' && v.lmI !== '' },
    { k: 'eta', t: 'time', label: '到着予定時刻(任意・追加)', show: v => v.kind !== 'simple' },
    { t: 'row', show: v => v.kind !== 'simple', items: [{ k: 'dwx', t: 'sel', label: '目的地の天候(任意・追加)', opts: WX_OPTS }, { k: 'dtemp', t: 'num', label: '気温', unit: '℃', neg: true }] },
    { k: 'route', t: 'seg', label: '航路上の天候', opts: [['', '記載なし'], ['good', '概ね良好'], ['bumpy', '多少気流が不安定']], show: v => v.kind !== 'simple' },
    { k: 'cond', t: 'chk', label: '条件付き運航の案内を入れる', show: v => v.kind !== 'simple' },
    { k: 'condAct', t: 'seg', label: '基準を満たさない場合', opts: [['ret', '引き返し'], ['div', '他の空港への目的地変更']], show: v => v.kind !== 'simple' && v.cond },
    { k: 'lobby', t: 'chk', label: '「出発ロビーでもご案内させていただきましたように」を入れる', show: v => v.kind !== 'simple' && v.cond },
  ],
  notes: ['簡易版:早朝や深夜、また短いフライトでは、タイミングを工夫してシンプルなご挨拶をすることでも、お客さまに感謝の意を示すことができます。', '修学旅行生へのアナウンスは積極的に。ただし学校名を入れるかどうかは、先任客室乗務員に確認(客室本部が学校側と事前確認済み)。', '「ちょうど」と「頃」、「約」と「ぐらい」を重ねない(例:「午後4時前後の予定です」「約15分」)。'],
  build(v, x) {
    if (v.kind === 'simple') return { ja: [], en: [], close: [{ g: 'enjoy', ja: 'どうぞごゆっくりお過ごしください。', en: 'We wish you a pleasant flight.' }, CL.thanks] };
    const ja = [], en = [];
    const L = v.side ? lmPick(v) : null, sj = v.side === 'right' ? '右' : '左';
    const ft = has(v.alt) ? +v.alt : null;
    if (has(v.posJa) || ft || L) {
      const where = J(has(v.posJa) && `${v.posJa}の上空を`, ft && `高度${jaFeet(ft)}、約${meters(ft)}メートルにて`);
      ja.push(J(where ? `この飛行機は${where}順調に飛行しており` : '', L ? `${where ? '、' : ''}${sj}にお座りのお客さまには、ただ今、${L.nj}がごらんいただけます。` : 'ます。'));
      en.push(E((has(v.posEn) || ft) && `We are flying${has(v.posEn) ? ' over ' + v.posEn : ''}${ft ? ` at an altitude of ${ft.toLocaleString('en-US')} feet, or ${meters(ft)} meters` : ''}.`, L && FX(`You can now see ${L.ne} on your ${v.side}.`, 'Just you can see ___ on your right / left.')));
      if (L && L.item && v.color) { const s = lmSentence(L.item); ja.push(FX(s.ja, '(地域別の見どころの資料から作成)')); en.push(FX(s.en, '(地域別の見どころの資料から作成)')); }
    }
    // 到着予定 → 気象情報(目的地の天候・航路上の天候・条件付き運航) → ベルト着用のお願い の段へ
    const W = destWeather(v, x.d, false), RB = routeAndBelt(v), ret = v.condAct !== 'div';
    const parts = [
      { s: 'time', ja: has(v.eta) && FX(`${x.d.ja}には、${LTJ()}${jt(v.eta)}頃の到着を予定しております。`), en: has(v.eta) && FX(`We expect to arrive at ${x.d.en} at around ${et(v.eta)}${LTE()}.`) },
      { s: 'wx', ja: W && FX(W.ja), en: W && FX(W.en) },
      { s: 'route', ...RB.route },
    ];
    if (v.cond) parts.push({ s: 'wx',
      ja: J(v.lobby && '出発ロビーでもご案内させていただきましたように、', `この便の到着予定時刻における目的地${x.d.ja}の天候が、着陸に関する安全基準値を下回る可能性がございます。`, `着陸時に安全基準が満たされない場合、やむを得ず${ret ? '引き返し' : '他の空港への目的地変更'}を行う場合があります。`, '予めご了承ください。'),
      en: E(`${v.lobby ? 'As previously announced in the departure lobby, the' : 'The'} weather conditions at ${x.d.en} may not satisfy our safe landing limitations.`, `If the weather conditions do not meet our safety standards, we may have to ${ret ? FX('return to ' + x.o.en, 'return back') : FX('divert to another airport', 'change our destination to the other airport')}.`, FX('We ask for your understanding.', 'We ask for your understanding on this situation.')) });
    parts.push({ s: 'belt', ...RB.belt });
    return { ja, en, parts, close: [{ g: 'enjoy', ja: '皆様、どうぞごゆっくりお過ごし下さい。ご搭乗、誠にありがとうございます。', en: 'We wish you a pleasant flight.' }, CL.thanks] };
  },
});

SITS.push({
  id: 'turb', sec: 'wx', t: ['air'], g: '揺れ', label: '揺れ(ベルトサイン)', src: '2.3.2.4.5.1',
  defaults: { st: 'pred', cause: 'wind', crew: true, safe: true },
  fields: [
    { k: 'st', t: 'seg', label: '状況', opts: [['pred', '予測できる揺れ'], ['sudden', '突然の揺れ'], ['after', '揺れる空域を通過後']] },
    { k: 'cause', t: 'seg', label: '原因', opts: [['', '記載なし'], ['wind', '風の変化'], ['cloud', '雲の影響']], show: v => v.st === 'pred' },
    { k: 'info', t: 'chk', label: '「前を飛ぶ飛行機からの情報」を入れる', show: v => v.st === 'pred' },
    { t: 'row', show: v => v.st === 'pred', items: [{ k: 'inMin', t: 'num', label: 'サイン点灯まで', unit: '分後' }, { k: 'at', t: 'time', label: '点灯時刻' }] },
    { k: 'dur', t: 'num', label: 'サインを点灯させる時間(任意)', unit: '分間', show: v => v.st === 'pred' },
    { k: 'crew', t: 'chk', label: '客室乗務員への着席の指示を入れる', show: v => v.st !== 'after' },
    { k: 'safe', t: 'chk', label: '「飛行の安全には支障ありません」を入れる(日本語)', show: v => v.st !== 'after' },
  ],
  notes: ['ベルト着用サインの運用に関するガイドライン OM_SD 9.2.1.1 に従い、運航乗務員は Monitoring を優先させること。', 'ベルトサインONでPAする際は、化粧室使用禁止も同時に案内する(客室乗務員がPAを重複させる必要がなくなる)。', '揺れが予測される場合は、ベルトサインを点灯する時刻を明確に伝える。英語は "After xx minutes" ではなく "In xx minutes"。', '「先行機からの情報」は「戦闘機からの情報」と聞き間違えやすいため、「前を飛ぶ飛行機からの情報」「他の飛行機からの情報」と言う。', '「飛行の安全には支障ありません」は日本のお客さまには有意義。英語では必ずしも同様の案内は必要ないため、日本語だけに入れています。'],
  build(v) {
    if (v.st === 'after') return {
      ja: [J('揺れが予想された空域を通り過ぎました。', 'シートベルト着用のサインは消しますが、突然揺れることもありますので、着席中はシートベルトをお締めください。')],
      en: [E('The seat belt sign will be turned off.', 'However, for your safety, we still recommend that you keep your seat belt fastened while you are seated.')],
      close: [CL.thanks],
    };
    if (v.st === 'sudden') return {
      ja: [J('ただいま、気流の悪い中を飛んでおります。', '着席し、シートベルトをお締めください。', '化粧室はご使用になれません。', v.crew && '客室乗務員も直ちに着席してください。', v.safe && '飛行の安全には支障ありません。どうぞご安心ください。')],
      en: [E('Please be seated and fasten your seat belt.', 'Please do not use the restrooms.', v.crew && 'Cabin crew, take your seats now.')],
    };
    const m = has(v.inMin), a = has(v.at);
    const whenJa = m && a ? `${v.inMin}分後(${jt(v.at)})に` : m ? `${v.inMin}分後に` : a ? `${jt(v.at)}に` : `${P('〇分後')}に`;
    const byJa = m && a ? `${jt(v.at)}(${v.inMin}分後)` : a ? jt(v.at) : m ? `${v.inMin}分後` : P('時刻');
    const whenEn = m ? `in about ${v.inMin} minutes` : a ? `at ${et(v.at)}` : `in ${P('xx')} minutes`;
    const byEn = a ? `by ${et(v.at)}` : m ? `within the next ${v.inMin} minutes` : `by ${P('time')}`;
    const cj = { wind: '風の変化により', cloud: '雲の影響で' }[v.cause] || '';
    return {
      ja: [
        J(v.info && FX('前を飛ぶ飛行機からの情報によりますと、', '(One Point Adviceの表現を追加)'), `これから先、${cj}揺れることが予想されます。`, `${whenJa}シートベルト着用サインを点灯します。`, has(v.dur) && `ベルトサインは約${v.dur}分間点灯させる見込みです。`),
        J(`化粧室の使用などで座席をお立ちになるお客さまは、${byJa}までに席にお戻りください。`, 'シートベルト着用のサインが点きましたら、安全のため、シートベルトをしっかりとお締めください。', v.safe && '揺れましても飛行の安全には支障ありません。どうぞご安心ください。', v.crew && `客室乗務員も、${byJa}までに着席してください。`),
      ],
      en: [
        E(v.info && FX('According to information from an aircraft ahead of us,', '(One Point Adviceの表現を追加)'), v.info ? 'we are expecting some turbulence.' : 'We are expecting some turbulence.', `We will turn on the seat belt sign ${whenEn}.`, has(v.dur) && `The seat belt sign will be kept on for about ${v.dur} minutes.`),
        E(`If you need to leave your seat, please return to your seat ${byEn}.`, 'While the seat belt sign is on, you must be seated with your seat belt fastened.', v.crew && FX(`Cabin crew, please be seated ${byEn}.`)),
      ],
      close: [CL.thanks],
    };
  },
});

const ARRD_R = [
  ['dep', '出発の遅れ', '出発が遅れた影響で', 'Due to our late departure'],
  ['wind', '向かい風', '上空の向かい風が強く', 'Due to strong headwinds'],
  ['cong', '到着空港の混雑', (v, x) => `${x.d.ja}周辺の混雑により`, (v, x) => `Due to congestion around ${x.d.en}`],
  ['wx', '天候', '天候の影響により', 'Due to the weather'],
  ['swap', 'SWAP(時間制限の措置)', (v, x) => `悪天候のため${x.d.ja}へのフライトに時間制限の措置が講じられており`, (v, x) => `Due to flow restrictions on flights arriving at ${x.d.en} caused by bad weather`],
];
SITS.push({
  id: 'arrDelay', sec: 'delay', t: ['air'], g: '遅れ・待機', label: '到着の遅れ', src: '文例なし(作成)',
  defaults: { r: 'dep' },
  fields: [
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(ARRD_R) },
    { k: 'min', t: 'num', label: '定刻からの遅れ', unit: '分' },
    { k: 'eta', t: 'time', label: '到着見込み時刻(任意)' },
  ],
  notes: ['ハンドブックに専用の文例がないため、SWAPや出発遅れの文例をもとに作成しています(全文が追加扱い)。'],
  build(v, x) {
    const r = opt(ARRD_R, v.r);
    return {
      ja: [FX(J(pickJa(r, v, x), `、${x.d.ja}への到着は定刻より${or(v.min, '〇')}分程遅れ`, has(v.eta) ? `、${LTJ()}${jt(v.eta)}頃となる見込みです。` : 'る見込みです。'))],
      en: [FX(`${pickEn(r, v, x)}, we expect to arrive at ${x.d.en} about ${or(v.min, '__')} minutes behind schedule${has(v.eta) ? `, at around ${et(v.eta)}${LTE()}` : ''}.`)],
      close: [{ g: 'sorry', ja: FX('お急ぎのところ、ご迷惑をおかけして申し訳ございません。'), en: FX('We apologize for the inconvenience.') }],
    };
  },
});
