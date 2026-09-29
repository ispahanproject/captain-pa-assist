/* =====================================================================
   上空(2/2)  ハンドブック 2.3.2.4.5.2〜.5 / 2.3.2.4.7.1〜.3
   ===================================================================== */
// 上空待機:機長の文例(滑走路上のバードストライク)の流れを、ほかの理由にも使う
// [key, ラベル, 理由(日本語), 理由(英語), 英語「〜まで待機」, 日本語「〜が未定のため」, 英語「As … not yet …」]
const HM = '(いつもの文例の形に合わせて作成)';
const RWY_TBD = ['滑走路の運用再開時刻が未定のため', 'As its reopening time has not yet been determined'];
const WX_TBD = [FX('天候の回復時期が未定のため', HM), FX('As we do not yet know when the weather will improve', HM)];
const HOLD_R = [
  ['bird', '滑走路上のバードストライク',
    '我々が着陸予定の滑走路において、先行機が鳥と衝突したとの情報が入りました。現在、後続機への安全確認のため滑走路が一時的に閉鎖されております。',
    'However, we have received information that there was a bird strike on the runway where we were scheduled to land. The runway is now temporarily closed to ensure the safety of following aircraft.',
    'until the runway reopens', ...RWY_TBD],
  ['cong', '到着機の混雑',
    (v, x) => FX(`${x.d.ja}周辺が大変混雑しております。`, HM),
    (v, x) => FX(`However, there is heavy traffic around ${x.d.en}.`, HM),
    FX('until air traffic control clears us for our approach', HM), FX('待機時間が未定のため', HM), FX('As we do not yet know how long we will need to hold', HM)],
  ['closed', '滑走路の閉鎖',
    FX('我々が着陸予定の滑走路が、現在一時的に閉鎖されております。', HM),
    FX('However, the runway where we are scheduled to land is now temporarily closed.', HM),
    'until the runway reopens', ...RWY_TBD],
  ['rwy', '滑走路の点検',
    FX('我々が着陸予定の滑走路で、現在点検作業が行われております。', HM),
    FX('However, the runway where we are scheduled to land is currently closed for inspection.', HM),
    'until the runway reopens', ...RWY_TBD],
  ['wx', '天候不良',
    (v, x) => FX(`${x.d.city}の天候が悪く、現在着陸できる状態ではございません。`, HM),
    (v, x) => FX(`However, due to bad weather conditions at ${x.d.en}, we are unable to land at the moment.`, HM),
    FX('until the weather improves', HM), ...WX_TBD],
  ['ts', '雷雨',
    (v, x) => FX(`現在、${x.d.city}周辺に発達した雷雲があり、着陸できる状態ではございません。`, HM),
    (v, x) => FX(`However, due to thunderstorms around ${x.d.en}, we are unable to land at the moment.`, HM),
    FX('until the thunderstorms pass', HM), ...WX_TBD],
  ['power', '停電',
    (v, x) => FX(`${x.d.ja}で停電が発生しており、現在着陸できる状態ではございません。`, HM),
    (v, x) => FX(`However, due to an electrical blackout at ${x.d.en}, we are unable to land at the moment.`, HM),
    FX('until power is restored at the airport', HM), FX('停電の復旧時刻が未定のため', HM), FX('As we do not yet know when power will be restored', HM)],
  ['limit', '気象状態が制限値を超過',
    v => FX(`現在、${or(v.limJa, '〇〇')}が、安全に着陸するために決められた制限値を超えております。`, HM),
    v => FX(`However, ${has(v.limEn) ? v.limEn : 'the weather conditions'} currently exceed our limits for a safe landing.`, HM),
    FX('until conditions improve', HM), ...WX_TBD],
];
SITS.push({
  id: 'holding', sec: 'delay', t: ['air'], g: '遅れ・待機', label: '上空待機(HOLDING)', src: 'いつもの文例',
  defaults: { r: 'bird', safe: true, eta: 'tbd' },
  fields: [
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(HOLD_R) },
    { k: 'lim', t: 'text2', label: '気象の状態(できるだけ具体的に)', ph: ['例:強い横風', 'e.g. strong crosswinds'], show: v => v.r === 'limit' },
    { k: 'safe', t: 'chk', label: '「安全上の問題はございません」を入れる' },
    { k: 'eta', t: 'seg', label: '到着時刻', opts: [['tbd', '未定(客室乗務員より案内)'], ['min', '見込みあり']] },
    { k: 'min', t: 'num', label: '着陸までの見込み', unit: '分', show: v => v.eta === 'min' },
  ],
  notes: [AOV, '気象の状態をできるだけ具体的に説明してください。「強い横風」「霧による視界の低下」等々。'],
  build(v, x) {
    const r = opt(HOLD_R, v.r), tbd = v.eta !== 'min';
    return {
      ja: [
        J('当機は着陸に向けて順調に飛行を続けておりましたが、', pickJa(r, v, x), 'このため、当機はただ今上空で待機しております。'),
        v.safe && '安全上の問題はございませんので、どうぞご安心ください。',
        tbd ? `${r[5]}、現時点での到着時刻はお伝えできない状況ですが、状況がわかり次第、客室乗務員より改めてご案内いたします。`
          : `現在のところ${or(v.min, '〇')}分ほどで着陸できる見込みです。`,
      ],
      en: [
        E(`We had been making good progress toward ${x.d.be}.`, pickEn(r, v, x), v.safe && 'There are no safety concerns with the aircraft.', `For now, we will need to hold ${r[4]}.`),
        tbd ? E(`${r[6]}, we cannot give you an arrival time at this point.`, 'Our cabin crew will update you as soon as we have more information.')
          : `We should be able to land in about ${or(v.min, '__')} minutes.`,
      ],
      close: [
        { g: 'wait', ja: '到着は遅れる見込みで、お客様にはご不便をおかけいたしますが、到着まで今しばらくお待ちください。', en: 'Our arrival will be delayed, and we apologize for the inconvenience. We ask for your patience for a little while longer.' },
        { g: 'understand', ja: '安全運航へのご協力、誠にありがとうございます。', en: 'Thank you for your cooperation with our safe operation.' },
      ],
    };
  },
});

// 目的地の天候がMarginal:[key, ラベル, 原因(日本語), 原因(英語), 種類 vis=視界・雲 / wind=風]
const MARG_R = [
  ['fog', '霧による視界不良', '霧による視界不良', 'poor visibility caused by fog', 'vis'],
  ['rain', '雨による視界不良', '雨による視界不良', 'poor visibility caused by heavy rain', 'vis'],
  ['snow', '雪による視界不良', '雪による視界不良', 'poor visibility caused by snow', 'vis'],
  ['cloud', '低い雲', '低い雲', 'low clouds', 'vis'],
  ['xwind', '強い横風', '強い横風', 'strong crosswinds', 'wind'],
  ['gust', '風の乱れ', '強い風の乱れ', 'gusty winds', 'wind'],
  ['other', 'その他(手入力)', v => or(v.cJa, '〇〇'), v => or(v.cEn, '___'), 'vis'],
];
SITS.push({
  id: 'nearLimit', t: ['pre', 'air'], g: { pre: '搭乗中', air: '進入・着陸' }, label: '目的地の天候がMarginal', src: 'いつもの文例',
  defaults: { st: 'before', c: 'fog', nx: 'min' },
  fields: [
    { k: 'st', t: 'seg', label: '段階', opts: [['before', '天候のご案内'], ['ga', 'Go Aroundした場合(ハンドブック)']], show: () => S.tm === 'air' },
    { k: 'c', t: 'sel', label: '原因', opts: optsOf(MARG_R) },
    { k: 'c', t: 'text2', label: '原因(手入力)', ph: ['例:煙霧による視界不良', 'e.g. poor visibility caused by haze'], show: v => v.c === 'other' },
    { k: 'nx', t: 'seg', label: 'このあと', opts: [['min', '約〇分後に再度着陸'], ['later', '後ほど改めて説明']], show: v => S.tm === 'air' && v.st === 'ga' },
    { k: 'min', t: 'num', label: '再度の着陸まで', unit: '分', show: v => S.tm === 'air' && v.st === 'ga' && v.nx === 'min' },
  ],
  notes: [AOV, '出発前は搭乗中のアナウンスと組み合わせると、気象情報の段(ベルト着用のお願いの前)に入ります。'],
  build(v, x) {
    const c = opt(MARG_R, v.c), wind = c[4] === 'wind';
    if (x.t === 'air' && v.st === 'ga') {
      const kj = wind ? '横風' : '天気';
      return {
        ja: [J(`先ほどご案内しましたが、着陸のための進入中に空港の${kj}が安全上の基準を満たさなくなりました。`, 'そのために着陸を取りやめました。', v.nx === 'min' ? `約${or(v.min, '〇')}分後に改めて着陸を試みます。` : '後ほど改めて状況を説明します。')],
        en: [E('We have aborted the landing due to safety reasons.', v.nx === 'min' ? FX(`We will attempt another landing in about ${or(v.min, '__')} minutes.`, 'We will attempt for another landing in ___ minutes.') : 'Further information will be provided when able.')],
        close: [CL.thanks],
      };
    }
    // 天候のご案内(機長の文例)。風が原因のときは「滑走路を視認できない」が当てはまらないので言い換える
    const cj = pickJa(c, v, x), ce = pickEn(c, v, x);
    return {
      ja: [], en: [],
      parts: [
        { s: 'wx',
          ja: J(wind ? FX(`ただ今、目的地${x.d.ja}付近は${cj}により、安全に着陸できる制限に近い状況となっております。`, HM) : `ただ今、目的地${x.d.ja}付近は${cj}により、最終進入を開始できる制限に近い天候となっております。`,
            wind ? FX('また、最終進入中に風が制限を超えた場合や、安全に着陸できないと判断した場合には、一旦着陸をやり直すことがございます。', HM) : 'また、最終進入を開始できた場合にも、定められた高度で滑走路を視認できない場合や、安全に着陸できないと判断した場合には、一旦着陸をやり直すことがございます。'),
          en: E(`The weather at ${x.d.en} is currently marginal for landing due to ${ce}.`,
            wind ? FX('Even after we begin our final approach, if the wind exceeds our limits, or if a safe landing is not possible, we may go around and make another approach.', HM) : 'Even after we begin our final approach, if we are unable to see the runway at the required point, or if a safe landing is not possible, we may go around and make another approach.') },
        { s: 'wx',
          ja: '天候の回復が見込めない場合には、目的地上空でしばらく待機することや、状況によっては出発地へ引き返す、あるいは他の空港に着陸する可能性もございます。',
          en: 'If the weather is not expected to improve, we may hold over the destination for a while, or, depending on the situation, return to our departure airport or divert to another airport.' },
      ],
      close: [{ g: 'understand', ja: 'ご不便、ご心配をおかけして大変恐縮ですが、安全運航へのご理解、ご協力に感謝いたします。', en: 'We are very sorry for the inconvenience and concern this may cause, and we sincerely appreciate your understanding and cooperation with our safe operation.' }],
    };
  },
});

const GA_R = [
  ['atc', '管制塔の指示', '管制塔からの指示により', FX('due to instructions from the control tower', 'due to instruction from the control tower')],
  ['wx', '天候の急変', '天候が急変したため', FX('due to a sudden change in weather conditions', 'due to sudden change of weather conditions')],
  ['vis', '視界不良', '視界不良により', 'due to low visibility'],
  ['turb', '乱気流', '乱気流のため', 'due to gusty wind conditions'],
  ['xw', '横風制限を超えた', '安全の為の横風制限を超えたため', 'due to crosswind performance limitations'],
  ['unst', '安定した進入を確保できない', '安定した進入を確保出来なくなったために', FX('due to an unstable approach', 'due to unstable approach')],
];
SITS.push({
  id: 'ga', t: ['air'], g: '進入・着陸', label: '着陸のやり直し(Go Around)', src: '2.3.2.4.5.4',
  defaults: { r: 'atc', safe: true },
  fields: [
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(GA_R) },
    { k: 'min', t: 'num', label: '着陸までの見込み', unit: '分後' },
    { k: 'safe', t: 'chk', label: '「飛行の安全には支障ありません」を入れる' },
  ],
  notes: [AOV, 'G/A時、操縦席から状況の事前共有や連絡がない場合でも、客室乗務員は「この飛行機は着陸態勢に入っておりましたが、再び上昇しております。シートベルトはそのままお締めください。」とPAします。', '理由や今後の方針を伝えるには運航乗務員からの情報が必須です(ステライルコクピットのため、客室乗務員からは連絡できません)。上空で情報提供できない場合は、駐機場到着後にPAすると安心感を与えられます。'],
  build(v, x) {
    const r = opt(GA_R, v.r);
    return {
      ja: [J(pickJa(r, v, x), '、着陸をとりやめました。', v.safe && '飛行の安全には支障ありませんのでどうぞご安心ください。', `${or(v.min, '〇')}分後に着陸を予定しています。`)],
      en: [E(`We have aborted the landing ${pickEn(r, v, x)}.`, `We should be able to land in about ${or(v.min, '__')} minutes.`)],
    };
  },
});

const DIV_MECH = [
  ['sys', 'システムの不具合', v => `${or(v.sysJa, '〇〇')}システムの不具合により`, v => (has(v.sysEn) ? `due to ${an(v.sysEn)} ${v.sysEn} malfunction` : 'due to a ___ malfunction')],
  ['eng', 'エンジンの不具合', 'エンジンの不具合により', 'due to an engine malfunction'],
  ['tire', 'タイヤの不具合', 'タイヤの不具合により', 'due to trouble with the landing gear system'],
];
// 天候理由(目的地の天候不良・台風)は、上空で待機して回復を待ったことを前置する(機長の言い方)。
// 5番目があるものは英語を「待機していた → However, 理由, so we have decided …」の形にする
const WX_HOLD_JA = '目的地上空にて待機しながら天候の回復を待っておりましたが、';
const WX_HOLD_EN = 'We have been holding over our destination while waiting for the weather to improve.';
const DIV_WX = [
  ['wx', '目的地の天候不良', `${WX_HOLD_JA}現在も着陸できる基準を下回っており、この先も回復が見込めないため、`,
    'the weather is still below our landing minimums and is not expected to improve', WX_HOLD_EN],
  ['typhoon', '台風', J(WX_HOLD_JA, FX('台風の影響により'), '現在も着陸できる基準を下回っており、この先も回復が見込めないため、'),
    'due to the typhoon, the weather is still below our landing minimums and is not expected to improve', WX_HOLD_EN],
  ['closed', '目的地空港の閉鎖', (v, x) => `${x.d.ja}が閉鎖されたため、`, (v, x) => `due to the closure of ${x.d.en}`],
  ['curfew', '運用時間内に着陸できない', (v, x) => `${x.d.ja}の運用時間内に着陸できないため、`, (v, x) => `due to the curfew at ${x.d.en}`],
];
SITS.push({
  id: 'divert', t: ['air'], g: '引き返し・ダイバート', label: '引き返し・ダイバート', src: '2.3.2.4.5.5',
  defaults: { kind: 'wx', act: 'div', mr: 'eng', wr: 'wx', safe: true, act3: 'div', order: true },
  fields: [
    { k: 'kind', t: 'seg', label: '理由の種類', opts: [['mech', '機材関連'], ['wx', '天候・閉鎖・カーフュー'], ['med', '急病人'], ['unruly', '安全阻害行為']] },
    { k: 'mr', t: 'sel', label: '不具合', opts: optsOf(DIV_MECH), show: v => v.kind === 'mech' },
    { k: 'sys', t: 'text2', label: 'システム名', ph: ['例:電気', 'e.g. electrical system'], show: v => v.kind === 'mech' && v.mr === 'sys' },
    { k: 'wr', t: 'sel', label: '理由', opts: optsOf(DIV_WX), show: v => v.kind === 'wx' },
    { k: 'act', t: 'seg', label: '行き先', opts: [['div', '他の空港へ着陸'], ['ret', '出発地へ引き返す']], show: v => v.kind !== 'unruly' },
    { k: 'act3', t: 'seg', label: '行き先', opts: [['term', 'ターミナルへ'], ['ret', '出発地へ'], ['div', '臨時着陸']], show: v => v.kind === 'unruly' },
    { k: 'alt', t: 'airport', label: '着陸する空港', show: v => (v.kind === 'unruly' ? v.act3 === 'div' : v.act === 'div') },
    { k: 'eta', t: 'time', label: '着陸予定時刻', show: v => v.kind !== 'unruly' },
    { k: 'min', t: 'num', label: '到着まで(任意)', unit: '分', show: v => v.kind === 'unruly' && v.act3 !== 'term' },
    { k: 'safe', t: 'chk', label: '「空港まで十分安全に飛行を続け、着陸できます」を入れる', show: v => v.kind === 'mech' },
    { k: 'order', t: 'chk', label: '「機内の秩序が守れないと判断いたしました」を入れる', show: v => v.kind === 'unruly' },
  ],
  build(v, x) {
    const ret = v.kind === 'unruly' ? v.act3 === 'ret' : v.act === 'ret';
    const a = ret ? x.o : apt(v, 'alt'), go = ret ? '引き返す' : '着陸する';
    const etaJa = `只今のところ${a.ja}へは、${jt(v.eta)}頃に着陸する予定です。`;
    if (v.kind === 'unruly') {
      const dj = { term: 'ターミナルへ引き返さざるを得ないことになりました。', ret: `出発地${x.o.ja}に引き返さざるを得ないことになりました。`, div: `${a.ja}に臨時着陸せざるを得ないことになりました。` }[v.act3];
      const de = { term: 'to return to a parking spot', ret: `to return to ${x.o.en}`, div: `to make an unscheduled landing at ${a.en}` }[v.act3];
      const far = v.act3 !== 'term' && has(v.min);
      return {
        ja: [J('この飛行機内に、法律に基づいた安全に関する指示に従っていただけない方がいらっしゃいます。', v.order && 'そのため、機内の秩序が守れないと判断いたしました。'), J('お客さまには大変ご迷惑をお掛けしますが、この先の安全な運航のためには', dj, far && `およそ${v.min}分で${a.ja}に到着する予定です。`), '安全を最優先に考えた措置として、どうぞご理解、ご協力くださいますようお願いいたします。'],
        en: [E('We seem to have a passenger on board who will not follow the in-flight safety regulations.', `We have decided ${de} to ensure the safety of this flight.`, far && `We will arrive at ${a.en} in about ${v.min} minutes.`)],
        close: [{ g: 'understand', ja: '', en: 'We ask for your understanding. Thank you.' }],
      };
    }
    if (v.kind === 'med') return {
      ja: [J('ただ今、急病のお客さまがいらっしゃいます。', `医療処置が必要なため、${a.ja}に向かうことにいたしました。`, `只今のところ、${a.ja}には、${jt(v.eta)}頃に着陸する予定です。`)],
      en: [E(`We have a passenger ${FX('in need of', 'in need for')} medical treatment.`, ret ? `We have decided to return to ${a.en} due to ${FX('a medical emergency', 'medical emergency')}.` : `We have decided to make a diversion to ${a.en} due to ${FX('a medical emergency', 'medical emergency')}.`, `Our estimated time of landing at ${a.en} is ${et(v.eta)}.`)],
      close: [{ g: 'understand', ja: '', en: FX('We ask for your understanding. Thank you.', 'I ask for your understanding on this situation. Thank you.') }],
    };
    const info = { g: 'info', ja: 'この後のスケジュールに関しましては、改めてご案内します。', en: 'Further information will be provided when able.' };
    if (v.kind === 'mech') {
      const r = opt(DIV_MECH, v.mr);
      return {
        ja: [`この飛行機は${pickJa(r, v, x)}${a.ja}へ${go}ことになりました。`, v.safe && 'なお、一部に不具合がありましても、この飛行機は空港まで十分安全に飛行を続け、着陸できますので、どうぞご安心ください。', etaJa],
        en: [E(`We have decided to ${ret ? 'return to' : 'divert to'} ${a.en} ${pickEn(r, v, x)}.`, v.safe && 'We are still able to safely continue our flight to the airport.', `The estimated time of landing at ${a.en} is ${et(v.eta)}.`)],
        close: [info, CL.thanks],
      };
    }
    const r = opt(DIV_WX, v.wr), lead = !!r[4];
    // 結びは機長の文(英語は訳)。「長時間の飛行ならびに」は上空で待機していた天候理由のときだけ
    return {
      ja: [
        J(lead ? `${pickJa(r, v, x)}この飛行機は${a.ja}へ${go}ことになりました。` : `この飛行機は${pickJa(r, v, x)}${a.ja}へ${go}ことになりました。`, etaJa),
        J(`皆様のご移動に際しまして、${lead ? '長時間の飛行ならびに' : ''}目的地の変更に伴い、大変なご負担とご心配をおかけして申し訳ございません。`, '安全運航へのご理解、ご協力感謝いたします。', '着陸後の対応に関しましては、着陸後に改めてご案内させていただきますので、到着後もお座席にてお待ちいただきますようお願いいたします。', 'それでは着陸まで引き続き安全運航に努めてまいります。'),
      ],
      en: [
        E(lead ? FX(`${r[4]} However, ${pickEn(r, v, x)}, so we have decided to ${ret ? 'return to' : 'divert to'} ${a.en}.`) : `We have decided to ${ret ? 'return to' : 'divert to'} ${a.en} ${pickEn(r, v, x)}.`, `Our estimated time of landing at ${a.en} is ${et(v.eta)}.`),
        FX(E(`We sincerely apologize for the inconvenience and concern caused by ${lead ? 'the long flight and ' : ''}the change of destination.`, 'Thank you for your understanding and cooperation with our safe operation.', 'We will provide further information after landing, so please remain seated even after we arrive.', 'We will continue to do our utmost for a safe flight until we land.')),
      ],
    };
  },
});

SITS.push({
  id: 'lightning', t: ['air'], g: '特殊', label: '落雷', src: '2.3.2.4.7.1',
  defaults: { what: ['shock', 'light'], res: 'ok', dev: 'inst', act: 'land' },
  fields: [
    { k: 'what', t: 'chips', label: 'お客さまが感じたもの', opts: [['shock', '衝撃'], ['light', '光'], ['sound', '音']] },
    { k: 'res', t: 'seg', label: '影響', opts: [['ok', '影響なし'], ['dmg', '損傷あり(臨時着陸・引き返し)']] },
    { k: 'dev', t: 'seg', label: '損傷した機器', opts: [['inst', '飛行計器'], ['radar', 'レーダー']], show: v => v.res === 'dmg' },
    { k: 'act', t: 'seg', label: '行き先', opts: [['land', '臨時着陸'], ['ret', '引き返し']], show: v => v.res === 'dmg' },
    { k: 'alt', t: 'airport', label: '着陸する空港', show: v => v.res === 'dmg' && v.act === 'land' },
  ],
  build(v, x) {
    const w = (v.what || []).map(k => ({ shock: '衝撃', light: '光', sound: '音' }[k]));
    const lead = `さきほどの${w.length ? w.join('や') : '衝撃'}には驚かれたと思いますが、原因は雷によるものです。`;
    if (v.res !== 'dmg') return {
      ja: [J(lead, '飛行計器等への影響はありませんのでご安心ください。')],
      en: [E('Our airplane was struck by lightning.', 'However, this airplane is operating normally and is safe.', FX("Please don't worry.", 'Don`t worry.'))],
      close: [CL.thanks],
    };
    const land = v.act !== 'ret', a = land ? apt(v, 'alt') : x.o;
    return {
      ja: [J(lead, `${v.dev === 'radar' ? 'レーダー' : '飛行計器'}に多少の損傷を受けましたので、念のため${a.ja}へ${land ? '臨時着陸する' : '引返す'}ことになりました。`, '到着後の詳しいことは、後ほどご案内します。', '飛行の継続には支障ありません。ご安心ください。')],
      en: [E('Our airplane was struck by lightning.', `We seem to have slight trouble with the ${v.dev === 'radar' ? 'radar system' : 'flight instruments'}.`, `We will ${land ? 'make a landing at' : 'return to'} ${a.en} for ${FX('inspection', 'inspections')}.`)],
      close: [CL.thanks],
    };
  },
});

SITS.push({
  id: 'emi', t: ['air'], g: '特殊', label: '電磁干渉障害の疑い', src: '2.3.2.4.7.3',
  defaults: { st: 'abn' },
  fields: [{ k: 'st', t: 'seg', label: '段階', opts: [['abn', '計器等の異常発生時'], ['norm', '正常に戻った場合']] }],
  build(v) {
    if (v.st === 'norm') return {
      ja: [J('操縦室の計器のトラブルは正常に戻りました。', 'どうぞご安心ください。')],
      en: [E('Our instruments are now showing normal indications.', 'We will safely continue our flight, thank you.')],
    };
    return {
      ja: [J('ただいま操縦室の計器類に異常が発生しています。', '全ての電子機器の電源を、速やかにお切りください。')],
      en: [E(FX('We are now having some trouble with our instruments.', 'We are now having some troubles with our instruments.'), 'I would need to ask that you turn off all electronic devices.')],
      close: [{ g: 'thanks', ja: '皆さまのご協力をお願いいたします。', en: 'Thank you for your cooperation.' }],
    };
  },
});

SITS.push({
  id: 'smoking', t: ['air'], g: '特殊', label: '化粧室内での喫煙の抑止', src: '2.3.2.4.7.2',
  build() {
    return {
      ja: [J('先ほど、化粧室の中で煙草を吸った方がいるようです。', '化粧室内での喫煙は、運航の安全に重大な影響を与える極めて危険な行為です。', '法律でも固く禁じられています。', '機内での喫煙はご遠慮ください。')],
      en: [E('Evidence of smoking was found in the lavatory.', 'Please be reminded that smoking in the lavatory is a risk to the safety of our flight and is against the law.')],
      close: [CL.understand],
    };
  },
});
