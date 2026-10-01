/* =====================================================================
   出発前(1/2)  ハンドブック 2.3.2.4.2.3 / 2.3.2.4.3.x
   ===================================================================== */
// 挨拶 → 出発準備 → (遅れの理由) → 飛行時間(言うときに補う) → 現地の天候と気温・航路上の天候 → ベルト着用のお願い → 到着までどうぞごゆっくり
SITS.push({
  id: 'boarding', t: ['pre'], g: '搭乗中', label: '搭乗中のアナウンス(通常)', src: '2.3.2.4.2.3', greet: true,
  defaults: { prep: 'soon', route: 'good' },
  fields: [
    { k: 'prep', t: 'seg', label: '出発準備', opts: [['soon', '間もなく整う'], ['done', '整っている'], ['', '入れない']],
      hint: '「整っている」は「出発の準備は全て整っておりますが、」で、一緒に選んだ出発の遅れ・フローなどの理由につなげます(選ばないときは理由を言うときに補います)。' },
    { t: 'row', items: [{ k: 'dwx', t: 'sel', label: '現地の天候', opts: WX_OPTS }, { k: 'dtemp', t: 'num', label: '気温', unit: '℃', neg: true }] },
    { k: 'route', t: 'seg', label: '航路上の天候', opts: [['good', '概ね良好'], ['bumpy', '多少気流が不安定'], ['', '入れない']] },
  ],
  notes: ['実施する場合、客室乗務員と事前確認する事が望ましい。'],
  build(v, x) {
    const W = destWeather(v, x.d, true), RB = routeAndBelt(v);
    return {
      // 「整っている」は、理由がつながらないときの形(つながるときは compose の mergeReady が理由の文頭に入れる)
      ja: [v.prep === 'soon' && '間もなく出発の準備が全て整います。', v.prep === 'done' && READY_DONE_JA + FX(`${P('理由')}のため、出発まで今しばらくお待ちください。`)],
      en: [v.prep === 'soon' && `We will soon be ready for our departure to ${x.d.en}.`, v.prep === 'done' && FX(`We are all ready for departure. However, due to ${P('reason')}, we ask that you wait a little longer.`)],
      parts: [
        { s: 'time', ja: `当便の${x.d.ja}までの飛行時間は${P('〇〇')}を予定しています。`, en: `Our flight time is expected to be ${P('___')}.` },
        { s: 'wx', ja: FX(W.ja), en: FX(W.en) },
        { s: 'route', ...RB.route },
        { s: 'belt', ...RB.belt },
      ],
      close: [{ g: 'enjoy', ja: '到着までどうぞごゆっくりお過ごしください。', en: 'We wish you a pleasant flight.' }, CL.thanks],
    };
  },
});

// 悪天候で上空の機内サービスを制限するときの出発前の案内(ハンドブックに文例なし・作成。ベルト着用のお願いの後に入る)
// [key, ラベル, 日本語(「安全確保のため、」の後), 英語]
const SVCADV_R = [
  ['cold', '冷たい飲み物のみ', '機内サービスは冷たいお飲み物のみとさせていただきます。', 'our in-flight service will be limited to cold beverages only for your safety.'],
  ['maybe', '状況により中断', '揺れの状況によっては機内サービスを中断させていただく場合がございます。', 'we may need to suspend the in-flight service for your safety, depending on the conditions.'],
  ['none', '行わない', '機内サービスを控えさせていただきます。', 'we will not be providing in-flight service for your safety.'],
];
SITS.push({
  id: 'svcAdvance', t: ['pre'], g: '搭乗中', label: 'サービス制限の事前案内(悪天候)', src: '文例なし(作成)', sec: 'svc',
  defaults: { svc: 'cold', sign: true },
  fields: [
    { k: 'svc', t: 'seg', label: '上空での機内サービス', opts: optsOf(SVCADV_R) },
    { k: 'sign', t: 'chk', label: '「ベルト着用のサインを長時間点灯する場合がございます」を入れる' },
  ],
  notes: ['ハンドブックに専用の文例がないため作成しています(全文が追加扱い)。サービス内容は事前に客室乗務員と確認してください。'],
  build(v) {
    const r = opt(SVCADV_R, v.svc);
    return {
      ja: [FX(J(`本日は航路上で揺れが予想されますので、安全確保のため、${r[2]}`, v.sign && 'また、ベルト着用のサインを長時間点灯させていただく場合がございます。'))],
      en: [FX(E(`As we expect turbulence along our route today, ${r[3]}`, v.sign && 'The seat belt sign may also remain on for an extended period.'))],
      close: [{ g: 'understand', ja: FX('ご不便をおかけいたしますが、安全運航へのご理解、ご協力をお願いいたします。'), en: FX('We apologize for the inconvenience and appreciate your understanding and cooperation with our safe operation.') }],
    };
  },
});

// 機体の系統(ハンドブック 2.3.2.4.4.1 GTB の一覧。出発の遅れの整備作業と、機材トラブルで引き返しで共用)
const GTB_SYS = [
  ['elec', '電気系統', '電気系統', 'electrical system'], ['hyd', '油圧系統', '油圧系統', 'hydraulic system'],
  ['ac', '空調システム', '空調システム', 'air conditioning system'], ['eng', 'エンジン', 'エンジン', 'engine system'],
  ['fc', '操縦系統', '操縦系統', 'flight control system'], ['nav', 'ナビゲーションシステム', 'ナビゲーションシステム', 'navigation system'],
  ['tire', 'タイヤ', 'タイヤ', 'landing gear system'],
];
const DELAY_R = [
  ['prep', '出発準備', FX('出発準備に時間を要しているため'), 'due to departure preparation'],
  ['inbound', '使用機の到着遅れ', FX('この便に使用する飛行機の到着が遅れたため'), 'due to the late arrival of this aircraft'],
  ['count', '人数の再確認', 'お客さまの人数を再度確認するため', 'to re-count and confirm the number of passengers'],
  ['conn', '乗り継ぎのお客さま待ち', '乗り継ぎのお客さまをお待ちしているため', 'since we are still waiting for some connecting passengers'],
  ['pax', 'お客さま待ち', 'お客さまをお待ちしているため', 'since we are still waiting for some passengers'],
  ['cargo', '貨物・手荷物の積み込み', '貨物や手荷物の積み込みのため', 'due to the loading of additional cargo and baggage'],
  ['offload', '手荷物の取りおろし', 'お乗りいただけないお客さまの手荷物を取りおろすため', 'to off-load the baggage of the passenger who did not come on board'],
  ['atc', '管制塔の許可待ち', '管制塔からの許可を待っているため', 'since we are still waiting for the departure clearance from the control tower'],
  ['maint', '整備作業',
    v => `${v.sys === 'other' ? or(v.sysJa, '〇〇') : opt(GTB_SYS, v.sys)[2]}の整備作業のため`,
    v => `due to maintenance of the ${v.sys === 'other' ? `${or(v.sysEn, '___')} system` : opt(GTB_SYS, v.sys)[3]}`],
  ['snow', '機体の除雪', '飛行機の除雪のため', 'due to snow removal from the aircraft to obtain proper performance'],
  ['wx', '天候', v => (v.wxa === 'orig' ? '当空港' : v.wxa === 'dest' ? `目的地の${DEST().ja}` : which(v, 'wxa').ja) + 'の天候が良くないため', v => `due to bad weather conditions at ${which(v, 'wxa').en}`],
  ['closed', '空港の閉鎖', v => `${or(v.whyJa, '〇〇')}により${which(v, 'cla').ja}が閉鎖されているため`, v => `since ${which(v, 'cla').en} is closed due to ${or(v.whyEn, '___')}`],
  ['unruly', '指示に従わない方', '乗務員の指示に従っていただけない方がいらっしゃるため', "due to security reasons caused by a passenger's unruly behavior"],
];
SITS.push({
  id: 'delay', sec: 'delay', t: ['pre'], g: '出発の遅れ', label: '出発の遅れ', src: '2.3.2.4.3.1',
  defaults: { reason: 'atc', verb: 'late', wxa: 'dest', cla: 'dest' },
  fields: [
    { k: 'reason', t: 'sel', label: '理由', opts: optsOf(DELAY_R) },
    { k: 'sys', t: 'sel', label: '整備する系統', opts: [...optsOf(GTB_SYS), ['other', 'その他(手入力)']], show: v => v.reason === 'maint' },
    { k: 'sys', t: 'text2', label: '系統(手入力)', ph: ['例:燃料系統', 'e.g. fuel'], show: v => v.reason === 'maint' && v.sys === 'other' },
    ...whichField('wxa', '天候が良くない空港').map(f => ({ ...f, show: f.show ? v => v.reason === 'wx' && v.wxa === 'other' : v => v.reason === 'wx' })),
    ...whichField('cla', '閉鎖されている空港').map(f => ({ ...f, show: f.show ? v => v.reason === 'closed' && v.cla === 'other' : v => v.reason === 'closed' })),
    { k: 'why', t: 'text2', label: '閉鎖の原因', ph: ['例:大雪', 'e.g. heavy snow'], show: v => v.reason === 'closed' },
    { k: 'verb', t: 'seg', label: '言い方', opts: [['late', '出発が遅れております'], ['hold', '出発を見合わせております']] },
    { k: 'min', t: 'num', label: '出発までの見込み(任意)', unit: '分' },
  ],
  build(v, x) {
    const r = opt(DELAY_R, v.reason);
    return {
      ja: [J('現在、出発時刻を過ぎましたが、', pickJa(r, v, x), '、', v.verb === 'hold' ? '出発を見合わせております。' : '出発が遅れております。', has(v.min) && `あと${v.min}分程で出発できる見込みです。`)],
      en: [E(`Our departure will be delayed ${pickEn(r, v, x)}.`, has(v.min) && `We should be able to depart in about ${v.min} minutes.`)],
      close: [CL.waitSorry],
    };
  },
});

// フローコントロールは機長のいつもの文例(飛行時間は言うときに補う)
const FLOW_AT = [
  ['route', '航空路', '航空路', 'along the airway'],
  ['dest', '目的地空港周辺', (v, x) => `${x.d.ja}周辺`, (v, x) => `around ${x.d.en}`],
  ['orig', '出発空港周辺', (v, x) => `${x.o.ja}周辺`, (v, x) => `around ${x.o.en}`],
];
SITS.push({
  id: 'flow', t: ['pre'], g: '出発の遅れ', label: 'フローコントロール', src: 'いつもの文例', sec: 'delay',
  defaults: { at: ['route', 'dest'], early: true },
  fields: [
    { k: 'at', t: 'chips', label: '混雑しているところ', opts: optsOf(FLOW_AT) },
    { k: 'tt', t: 'time', label: '管制から指定された離陸時刻' },
    { k: 'early', t: 'chk', label: '「早々にご搭乗いただき恐縮ではございますが」を入れる' },
  ],
  build(v, x) {
    const at = FLOW_AT.filter(o => (v.at || []).includes(o[0]));
    const wj = at.length ? at.map(o => pickJa(o, v, x)).join('および') : P('混雑の場所');
    const we = at.length ? at.map(o => pickEn(o, v, x)).join(' and ') : P('where');
    return {
      ja: [J(v.early && '早々にご搭乗いただき恐縮ではございますが、', `本日は${wj}の混雑の影響で、管制より我々の離陸時刻が現時点で${jt(v.tt)}と指定されております。`, '多少前後する可能性がございますが、この時間に合わせて駐機場を出発する予定です。', 'どうぞご着席のままお待ちいただきますようお願い申し上げます。')],
      en: [E(`Due to congestion ${we}, air traffic control has assigned us a current departure time of ${et(v.tt)}.`, 'This may vary slightly, but we plan to leave the stand in accordance with that schedule.', 'We kindly ask that you remain seated while we wait.')],
      parts: [{ s: 'time', ja: `本日の予定飛行時間は${P('〇〇')}ですが、到着予定時刻につきましては離陸後改めてご案内させていただきます。`, en: `Our estimated flight time today is ${P('___')}, and we will provide you with an updated arrival time after takeoff.` }],
      close: [
        { g: 'wait', ja: 'それでは出発まで今しばらくお待ちください。', en: 'We appreciate your patience and understanding, and thank you for flying with us today.' },
        { g: 'thanks', ja: '本日のご搭乗まことにありがとうございます。', en: '' },
      ],
    };
  },
});

SITS.push({
  id: 'swap', sec: 'delay', t: ['pre'], g: '出発の遅れ', label: 'SWAP(悪天候の時間制限)', src: '2.3.2.4.3.1',
  defaults: { dir: 'dep' },
  fields: [{ k: 'dir', t: 'seg', label: '対象', opts: [['dep', '出発地から(出発が遅れる)'], ['arr', '目的地へ(到着が遅れる)']] }],
  build(v, x) {
    const dep = v.dir !== 'arr', a = dep ? x.o : x.d;
    return {
      ja: [J(`航空管制は現在、悪天候のため${a.ja}${dep ? 'から' : 'へ'}のフライトに時間制限の措置を講じています。`, `悪天候によるフライト数の調整により、${dep ? '出発' : '到着'}時刻が遅れます。`)],
      en: [E(`${FX('Air traffic control', 'The air traffic control')} is currently applying a measure to the flights ${dep ? 'departing from' : FX('arriving at', 'arriving into')} ${a.en} due to severe weather conditions.`, `Due to coordination of flight planning caused by bad weather, our ${dep ? 'departure' : 'arrival'} time will be delayed.`)],
      close: [{ g: 'wait', ja: 'お急ぎのところを恐縮ですが、出発まで今しばらくお待ちください。', en: FX('Thank you for your patience.', 'Please wait for the moment. Thank you.') }],
    };
  },
});

SITS.push({
  id: 'unclear', sec: 'delay', t: ['pre'], g: '出発の遅れ', label: '理由の不明確な遅れ(中国線等)', src: '2.3.2.4.3.2',
  defaults: { st: 'first', china: true, recover: true },
  fields: [
    { k: 'st', t: 'seg', label: '段階', opts: [['first', '最初のご案内'], ['flow', 'フローコントロールと判明'], ['push', 'Push Backのみ許可'], ['go', '出発']] },
    { k: 'china', t: 'chk', label: '「中国当局から」を入れる', show: v => v.st === 'first' },
    { k: 'num', t: 'num', label: '出発の順番', unit: '番目', show: v => v.st === 'flow' },
    { k: 'tt', t: 'time', label: '指示された離陸時刻(以降)', show: v => v.st === 'go' },
    { k: 'mv', t: 'num', label: '移動開始まで', unit: '分後', show: v => v.st === 'go' },
    { k: 'recover', t: 'chk', label: '「遅れを取り戻すよう努力」を入れる', show: v => v.st === 'go' },
  ],
  notes: ['中国等では航空路の一時的な閉鎖などで出発・到着が遅れることがあります。PAでは機密情報に当たる「軍事演習」という文言の使用は避け、「管制上の理由で」といった説明を行ってください。'],
  build(v, x) {
    if (v.st === 'flow') return {
      ja: [J('出発が遅れご迷惑をお掛けしております。', '引き続き管制塔に確認しておりますが、飛行機の混雑により遅れがでているようです。', 'この影響で、多くの飛行機が出発の順番待ちをしております。', `現在この飛行機の順番は${or(v.num, '〇')}番目ですが、まだはっきりとした出発時刻は決まっておりません。`)],
      en: [E('We are still waiting for our departure clearance from the control tower.', 'It seems that the traffic flow is limited due to congestion of the airways.', `According to the latest information, we are ${FX(`number ${or(v.num, '__')} for departure`, 'told to be number ( ) for the departure')}.`)],
      close: [{ g: 'wait', ja: '申し訳ありませんが、引き続きお待ちください。', en: 'Thank you for your patience and understanding.' }],
    };
    if (v.st === 'push') return {
      ja: [J('大変長らくお待たせしております。', 'この飛行機の最終的な離陸時刻について、まだ管制塔より指示がありません。', 'しかし、駐機場を離れる許可は得ることができました。', '飛行機が動き出しますので、シートベルトをお確かめください。')],
      en: [E(FX('We have not been informed of our take-off time yet.', 'We are not informed of our take-off time yet.'), FX('However, we have been cleared to move out from this parking spot.', 'However, we were approved to move out from this parking spot.'), 'We will commence our push back.', 'Please fasten your seat belt.')],
      close: [CL.thanks],
    };
    if (v.st === 'go') return {
      ja: [J('大変長らくお待たせしました。', `管制塔より、離陸時刻は${jt(v.tt)}以降との指示がありました。`, `この飛行機は${or(v.mv, '〇')}分後に移動を開始します。`, '大幅な出発遅れとなり申し訳ございません。', v.recover && 'このあと、安全運航を第一にしながら、少しでも遅れを取り戻すよう努力いたします。')],
      en: [E('Thank you very much for waiting.', `The control tower has given us the clearance to take off at or later than ${et(v.tt)}.`, `We will start moving in ${or(v.mv, '__')} minutes.`, 'Due to this major delay in our departure, the arrival will be delayed as well.')],
      close: [{ g: 'understand', ja: '', en: 'Once again, thank you for your understanding.' }],
    };
    return {
      ja: [J('この便の出発準備は全て整っております。', 'ただいま管制塔からの出発許可を待っております。', `しかしながら、今の時点では、${v.china ? '中国当局から' : ''}許可の下りる時刻がはっきりとしておりません。`)],
      en: [E('We have completed our departure preparations.', `However, we are still waiting for our departure clearance from the ${v.china ? 'Chinese ' : ''}control tower.`, 'Our departure time is yet unknown.')],
      close: [{ g: 'info', ja: '情報が入り次第ご案内いたしますので今しばらくお待ちください。', en: '' }, CL.understand],
    };
  },
});

const SYS_R = [
  ['checkin', 'チェックインシステム', '旅客チェックインシステムの障害により', 'passenger check-in computer system'],
  ['wb', '重量管理システム', '飛行機の運航を行う上で必要な重量管理システムの障害により', 'weight and balance management system'],
  ['dispatch', '運航管理システム', '運航管理システムの障害により', 'flight dispatch system'],
  ['security', '保安検査システム', '空港の旅客セキュリティーシステムの障害により', "airport's security system"],
];
SITS.push({
  id: 'sysfail', sec: 'delay', t: ['pre'], g: '出発の遅れ', label: 'システム障害(大規模イレギュラー)', src: '2.3.2.4.3.1',
  defaults: { sys: 'checkin', info: true },
  fields: [
    { k: 'sys', t: 'sel', label: '障害', opts: optsOf(SYS_R) },
    { k: 'cancel', t: 'chk', label: '欠航も出ている' },
    { k: 'info', t: 'chk', label: '「新たな情報が入り次第ご案内」を入れる' },
  ],
  build(v) {
    const r = opt(SYS_R, v.sys);
    return {
      ja: [J('ただいま、', r[2], v.cancel ? '多数の便の遅延や欠航が生じております。' : '多数の便の遅延が生じております。', 'お客さまにはご不便、ご迷惑をおかけしておりますことお詫び申し上げます。')],
      en: [E(`I would like to apologize for the ${v.cancel ? 'flight irregularities' : 'delay'} caused by ${FX('a problem with the', 'the trouble of')} ${r[3]}.`, 'We are making our utmost effort to solve the situation.')],
      close: [v.info && { g: 'info', ja: '出発の時間等、新たな情報が入り次第ご案内致します。', en: 'Further information will be provided once received.' }, CL.understand].filter(Boolean),
    };
  },
});

SITS.push({
  id: 'crewrest', sec: 'delay', t: ['pre'], g: '出発の遅れ', label: '乗務員の休養・勤務時間による遅れ', src: '2.3.2.4.3.1',
  defaults: { st: 'rest' },
  fields: [{ k: 'st', t: 'seg', label: '理由', opts: [['rest', '休養時間の確保'], ['duty', '勤務時間の制限']] }],
  build(v) {
    if (v.st === 'duty') return {
      ja: [J('本日の天候や航路の状況により、法令で定められた勤務時間の制限を超えるため、安全規程にのっとり出発時刻の調整が必要となりました。', 'そのため、当便の出発が遅れましたことをお詫び申し上げます。')],
      en: [E(`Due to today's weather and en-route conditions, it was necessary to adjust the departure time in accordance with the safety regulations, as it ${FX('would otherwise have exceeded', 'exceeded')} the flight hour limit for the flight crew stipulated by laws and regulations.`, 'We apologize for the delay in the departure of our flight.')],
    };
    return {
      ja: ['当便の出発が、安全規定に定める乗務員の休養時間確保のために遅れましたことをお詫び申し上げます。'],
      en: [`We apologize for the delay in the departure of this flight due to ${FX('the need to ensure', 'ensuring')} the crew's rest time under the safety regulations.`],
    };
  },
});
