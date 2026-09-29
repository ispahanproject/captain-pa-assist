/* =====================================================================
   出発前(2/3)  ハンドブック 2.3.2.4.3.3〜.5 / 2.3.2.4.3.1【出発準備完了】/ 2.3.2.4.4.2〜.4 / 2.3.2.4.7.9
   ===================================================================== */
SITS.push({
  id: 'phone', t: ['pre'], g: '出発の遅れ', label: '携帯電話の使用許可', src: '2.3.2.4.3.3',
  defaults: { st: 'allow', long: true, eng: true },
  fields: [
    { k: 'st', t: 'seg', label: '段階', opts: [['allow', '使用許可'], ['resume', '再出発時(機内モードへ)']] },
    { k: 'why', t: 'text2', label: '理由(任意・先に説明する)', ph: ['例:出発まで時間を要するため', 'e.g. As our departure will take some time,'], show: v => v.st === 'allow' },
    { k: 'min', t: 'num', label: '使用できる時間', unit: '分間', show: v => v.st === 'allow' },
    { k: 'eng', t: 'chk', label: '「エンジンを始動するまでの間」を入れる', show: v => v.st === 'allow' },
    { k: 'long', t: 'chk', label: '「大変ながらく」を入れる', show: v => v.st === 'allow' },
  ],
  build(v) {
    if (v.st === 'resume') return {
      ja: [J('お待たせしました。', '出発の準備が整い、間もなくエンジンを始動します。', '先程ご案内しましたとおり、携帯電話を機内モードに変更してください。')],
      en: [E('We are now ready for departure.', `Please switch your cell phones to ${FX('airplane mode', 'the airplane mode')} or turn them off at this time.`)],
      close: [{ g: 'thanks', ja: 'ご協力ありがとうございます。', en: 'Thank you.' }],
    };
    return {
      ja: [J(v.long ? '大変ながらくお待たせしておりまして申し訳ございません。' : 'お待たせしておりまして申し訳ございません。', '現在、携帯電話の通話モードの使用はお控えいただいておりますが、', has(v.whyJa) && v.whyJa.replace(/[。、]$/, '') + '、', `ただいまから${v.eng ? 'エンジンを始動するまでの間、' : ''}約${or(v.min, '〇')}分間携帯電話をご使用になれます。`, 'ご連絡等はこの時間をご利用ください。', '出発の際には改めてご案内しますので、その時には携帯電話を機内モードに再変更して下さいますようお願いします。')],
      en: [E('We apologize for keeping you waiting.', has(v.whyEn) && v.whyEn, FX('For your convenience, you may now use your cell phones in transmitting mode.', 'For your convenience, transmitting mode of cell phones may be used at this time.'), `However, we will have to ask you to switch to ${FX('airplane mode', 'the airplane mode')} once again in approximately ${or(v.min, '__')} minutes.`)],
      close: [CL.thanks],
    };
  },
});

SITS.push({
  id: 'deplane', t: ['pre'], g: '出発の遅れ', label: '一時降機', src: '2.3.2.4.3.4',
  notes: ['一時降機となる場合は、KD/KIの受け入れ準備の確認や、降機のタイミングに関する先任との打ち合わせなど、コーディネーションが大切です。'],
  build() {
    return {
      ja: [J('機体の点検・整備作業のため、しばらく時間がかかる見込みです。', '皆さまには一旦飛行機をお降りいただいて、出発ロビーでお待ちくださるようお願い申し上げます。', '詳しくは飛行機をお降りいただいたあと、地上係員からご案内いたします。')],
      en: [E(FX('Some maintenance work has become necessary for this airplane, which will require some time.', 'Some maintenance works for this airplane became necessary which will require some time.'), 'All passengers are asked to disembark and wait in the lobby for some time.', 'Our ground staff in the lobby will provide you with further information.')],
      close: [{ g: 'sorry', ja: 'ご迷惑をおかけして申し訳ございません。', en: `We deeply apologize for the ${FX('inconvenience', 'inconveniences')}.` }],
    };
  },
});

SITS.push({
  id: 'cancel', t: ['pre'], g: '出発の遅れ', label: '欠航・機材変更', src: '2.3.2.4.3.5',
  defaults: { st: 'cancel', r: 'maint', ca: 'dest' },
  fields: [
    { k: 'st', t: 'seg', label: '内容', opts: [['cancel', '欠航'], ['duty', '欠航(勤務時間制限)'], ['change', '機材変更']] },
    { k: 'r', t: 'seg', label: '欠航の理由', opts: [['maint', '整備作業'], ['wx', '天候不良'], ['rwy', '滑走路閉鎖']], show: v => v.st === 'cancel' },
    ...whichField('ca', '閉鎖された空港').map(f => ({ ...f, show: f.show ? v => v.st === 'cancel' && v.r === 'rwy' && v.ca === 'other' : v => v.st === 'cancel' && v.r === 'rwy' })),
    { k: 'why', t: 'text2', label: '機材変更の理由', ph: ['例:機材の不具合', 'e.g. a technical problem'], show: v => v.st === 'change' },
  ],
  build(v) {
    if (v.st === 'change') return {
      ja: [J(`${or(v.whyJa, '〇〇')}のため、お乗りいただく飛行機を変更することになりました。`, '準備を急いでおりますので、もうしばらくお待ちください。')],
      en: [E(`We will have to change our airplane due to ${or(v.whyEn, '___')}.`, `Please remain seated until ${FX('further notice', 'further advice')}.`)],
      close: [CL.understand],
    };
    if (v.st === 'duty') return {
      ja: [J('天候の回復を待っておりましたが、安全規定に定める乗務員の勤務時間制限を超えることとなってしまいました。', '大変申し訳ありません。やむなく、この便は欠航とさせていただきます。')],
      en: [E('I regret to inform you this flight has been cancelled.', 'We have been waiting for a chance to depart safely in this weather. However, the conditions have not improved enough for a safe departure.', 'Also, we have reached the limits of our duty time under the safety regulations.')],
      close: [{ g: 'sorry', ja: 'ご迷惑をおかけしまして申し訳ございません。', en: '' }, CL.understand],
    };
    const rj = { maint: '整備作業', wx: '天候不良', rwy: '滑走路閉鎖' }[v.r];
    const re = { maint: FX('a mechanical problem', 'mechanical problem'), wx: 'bad weather conditions', rwy: `${FX('the closure', 'closure')} of ${which(v, 'ca').en}` }[v.r];
    return {
      ja: [J(`申し訳ございませんが${rj}のため、この便は欠航とさせていただきます。`, 'この後のスケジュール等、詳しいことについては、飛行機をお降りいただいたあと、地上係員からご案内いたします。')],
      en: [E(`Unfortunately, we will have to inform you that this flight has been cancelled due to ${re}.`, 'Our ground staff in the lobby will provide you with further information.')],
      close: [{ g: 'sorry', ja: 'ご迷惑をおかけしまして申し訳ございません。', en: `We deeply apologize for the ${FX('inconvenience', 'inconveniences')}.` }],
    };
  },
});

const READY_R = [
  ['maint', '整備作業の終了', '機体の点検及び整備作業が終わりましたので', FX('The maintenance work has been completed.', 'The maintenance works have completed.')],
  ['wx', '天候の回復', v => `${which(v, 'a').ja}の天候が回復してきましたので`, v => `The weather at ${which(v, 'a').en} is improving.`],
  ['open', '空港の再開', v => `${which(v, 'a').ja}が再び使えるようになりましたので`, v => `${which(v, 'a').en} is now open.`],
  ['bag', '手荷物の取り降ろし終了', '手荷物の取り降ろしを終了しましたので', FX('The baggage has been removed.', 'The baggage have been removed.')],
];
SITS.push({
  id: 'ready', t: ['pre'], g: '出発準備完了・再出発', label: '出発準備完了', src: '2.3.2.4.3.1',
  defaults: { r: 'maint', a: 'dest', long: true, safe: true },
  fields: [
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(READY_R) },
    ...whichField('a', '空港').map(f => ({ ...f, show: f.show ? v => (v.r === 'wx' || v.r === 'open') && v.a === 'other' : v => v.r === 'wx' || v.r === 'open' })),
    { k: 'safe', t: 'chk', label: '「整備作業は完全に終了し、安全運航には問題ありません」を入れる', show: v => v.r === 'maint' },
    { k: 'long', t: 'chk', label: '「大変長らく」を入れる' },
  ],
  notes: ['整備の場合は、「なお、整備作業は完全に終了し、安全運航には問題ありません。安心してごゆっくりお過ごしください。」といった文言を追加することでお客さまに安心感を提供できます。'],
  build(v, x) {
    const r = opt(READY_R, v.r), safe = v.r === 'maint' && v.safe;
    return {
      ja: [J(v.long ? '大変長らくお待たせしました。' : 'お待たせしました。', pickJa(r, v, x), '、まもなく出発します。'), safe && 'なお、整備作業は完全に終了し、安全運航には問題ありません。安心してごゆっくりお過ごしください。'],
      en: [E(v.long ? 'Thank you very much for waiting.' : 'Thank you for waiting.', pickEn(r, v, x), 'We will be departing shortly.'), safe && FX('The maintenance work has been fully completed, and there is no concern about the safety of the flight. Please relax and enjoy the flight.')],
      close: [CL.thanks],
    };
  },
});

const RESTART_R = [
  ['maint', '整備作業の終了', '整備作業が終わりましたので', FX('the maintenance work has been completed', 'the maintenance works have completed')],
  ['sick', '急病のお客さまの降機', '急病のお客さまは飛行機を降りられましたので', FX('the passenger in need of medical care has deplaned', 'the passenger in need for medical care has de-planed')],
  ['unruly', '安全指示に従わない方の降機', '乗務員の安全指示に従っていただけなかった方には飛行機を降りていただきましたので', FX('the unruly passenger has deplaned', 'the unruly passenger has de-planed')],
  ['wx', '天候の回復', v => `${which(v, 'a').ja}の天候が回復しておりますので`, v => `the weather at ${which(v, 'a').en} is improving`],
];
SITS.push({
  id: 'restart', t: ['pre'], g: '出発準備完了・再出発', label: '再出発', src: '2.3.2.4.4.2',
  defaults: { r: 'maint', a: 'dest' },
  fields: [
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(RESTART_R) },
    ...whichField('a', '空港').map(f => ({ ...f, show: f.show ? v => v.r === 'wx' && v.a === 'other' : v => v.r === 'wx' })),
    { k: 'min', t: 'num', label: '出発までの見込み', unit: '分後' },
  ],
  build(v, x) {
    const r = opt(RESTART_R, v.r);
    return {
      ja: [J(pickJa(r, v, x), `、およそ${or(v.min, '〇')}分後に出発できる見込みです。`)],
      en: [E(`I would like to inform you that ${pickEn(r, v, x)}.`, `We should be able to depart in about ${or(v.min, '__')} minutes.`)],
      close: [{ g: 'thanks', ja: '皆さまのご理解、ご協力に感謝いたします。', en: 'Thank you.' }],
    };
  },
});

SITS.push({
  id: 'tkoffDelay', sec: 'delay', t: ['pre'], g: '地上走行中', label: '離陸の遅れ', src: '2.3.2.4.4.3',
  defaults: { st: 'clr' },
  fields: [
    { k: 'st', t: 'seg', label: '理由', opts: [['clr', '離陸許可待ち(混雑)'], ['bird', '離陸経路上の鳥'], ['xw', '横風が制限値超え']] },
    { k: 'num', t: 'num', label: '離陸の順番(任意)', unit: '番目', show: v => v.st === 'clr' },
    { k: 'min', t: 'num', label: '離陸までの見込み', unit: '分', show: v => v.st === 'clr' },
  ],
  notes: ['原則として Parking Brake が Set されていること。'],
  build(v) {
    if (v.st === 'bird') return {
      ja: ['ただいま、離陸経路上に鳥が飛んでいるため離陸を見合わせています。'],
      en: ['We are now waiting for birds to fly away from our departure path.'],
      close: [{ g: 'wait', ja: '今しばらくお待ちください。', en: 'Please remain seated.' }],
    };
    if (v.st === 'xw') return {
      ja: ['ただいま、離陸する滑走路に対する横風が非常に強く、この飛行機が安全に離陸できる制限値を超えています。'],
      en: [FX('The current wind conditions exceed the safety limitations of this aircraft for takeoff.', 'Current wind condition is exceeding the safety limitation for this aircraft for the takeoff.')],
      close: [{ g: 'wait', ja: '安全に運航が行える状態となるまで、今しばらくお待ちください。', en: E(FX('We will have to wait for the wind conditions to settle for our safe operations.', 'We will have to wait for this weather condition to settle for our safe operations.'), 'Thank you for your understanding.') }],
    };
    return {
      ja: [J('ただいま、管制塔からの離陸の許可を待っています。', has(v.num) && `この飛行機は、${v.num}番目に離陸する予定です。`, `${or(v.min, '〇')}分程で離陸できる見込みです。`)],
      en: [E('We are still waiting for the take-off clearance.', has(v.num) && `We are number ${v.num} for ${FX('departure', 'the departure')}.`, `We should be able to take off in about ${or(v.min, '__')} minutes.`)],
      close: [CL.thanks],
    };
  },
});

const TARMAC_R = [
  ['many', '出発機・到着機が多い', '出発機ならびに到着機が非常に多いため', FX('Due to the large number of departing and arriving aircraft', 'Due to numbers of departing and landing traffics')],
  ['cong', '空港内の混雑', '空港内の混雑により', 'Due to congestion in the airport'],
  ['wx', '天候', '天候上の理由により', 'Due to weather conditions'],
  ['other', 'その他(手入力)', v => `${or(v.whyJa, '〇〇')}により`, v => `Due to ${or(v.whyEn, '___')}`],
];
SITS.push({
  id: 'tarmac', sec: 'delay', t: ['pre', 'arr'], g: { pre: '地上走行中', arr: '地上待機' }, label: 'Tarmac Delay(長時間の地上待機)', src: '2.3.2.4.7.9',
  defaults: { r: 'many', lav: true, hrs: '3', cEn: 'safety' },
  fields: [
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(TARMAC_R) },
    { k: 'why', t: 'text2', label: '理由(手入力)', ph: ['例:滑走路の閉鎖', 'e.g. the closure of the runway'], show: v => v.r === 'other' },
    { k: 'min', t: 'num', label: '離陸 / 駐機場までの見込み', unit: '分' },
    { k: 'lav', t: 'chk', label: '化粧室の使用・体調不良の申し出を案内' },
    { k: 'door', t: 'chk', label: '⑥ 降機の機会の提供(ドアを開けている)' },
    { k: 'noDep', t: 'chk', label: '機長が降機できないと判断した場合' },
    { k: 'hrs', t: 'seg', label: '規定時間', opts: [['3', '3時間(カナダ・中国・タイ)'], ['4', '4時間(米国・韓国)']], show: v => v.noDep },
    { k: 'c', t: 'text2', label: '降機が困難な理由(具体例)', ph: ['例:滑走路上での待機中', 'e.g. waiting on the taxiway'], show: v => v.noDep },
    { k: 'cEn', t: 'seg', label: '英語の理由の区分', opts: [['safety', 'safety'], ['security', 'security'], ['atc', 'air traffic control']], show: v => v.noDep },
  ],
  notes: ['運航乗務員と客室乗務員は情報共有した上で、相互に実施者を確認し、30分以内の間隔で確実に機内アナウンスを行う(OMS 9.3.9.3.2)。', '規定時間は出発時刻(到着時は着陸)から、3時間(カナダ・中国・タイ)/4時間(米国・韓国)。'],
  build(v, x) {
    const r = opt(TARMAC_R, v.r), arr = x.t === 'arr', m = or(v.min, arr ? '〇' : '〇');
    const ja = [J('大変長らくお待たせし、申し訳ありません。', `ただいま、${pickJa(r, v, x)}、管制塔から移動の許可を待っています。`, `この先${arr ? '駐機場まで' : '離陸まで'}は${m}分程お時間を要する見込みです。`, '誠に恐れ入りますが、ご理解賜りますようよろしくお願い致します。')];
    const en = [E(`${pickEn(r, v, x)}, we are still waiting for the taxiing instructions from the control tower.`, `It is likely to take another ${or(v.min, '__')} minutes for us ${arr ? FX('to reach our parking spot', 'to be in our parking spot') : FX('to take off', 'to takeoff')}.`, FX('We sincerely ask for your understanding.', 'We sincerely ask for your understanding on the situation.'))];
    if (v.lav) { ja.push('また、お化粧室はご使用頂けます。ご体調の優れないお客さまがいらっしゃいましたらお申し出ください。'); en.push('Lavatories may be used at any time. Also, please report to the cabin crew if you are not feeling well.'); }
    if (v.door) { ja.push('なお、ご希望のお客さまは少しの間機外に出て頂くことが可能です。ご不便をお掛けし、申し訳ございません。'); en.push('The airplane door is open at this time. Please inform the cabin crew if you prefer to step outside for a short time while the door is open. Once again, your understanding is highly appreciated. Thank you.'); }
    if (v.noDep) {
      const h = v.hrs === '4' ? '4' : '3';
      ja.push(J(`本来であれば、消費者保護法の定めにより${arr ? '着陸' : '出発時刻'}から${h}時間以内にみなさまを飛行機の外へご案内するべきお時間ではありますが、現在${or(v.cJa, '〇〇')}によりご案内が困難な状況でございます。`, 'この対応はお客さまの安全を確保するために認められている例外措置となっております。', 'みなさまには大変ご不便をお掛けしますが、何卒ご理解頂きますようお願い申し上げます。'));
      en.push(E(`According to the regulation regarding tarmac delay, the airline operators are required to provide passengers with an opportunity to safely leave the airplane ${FX(`within ${h} hours of`, `before ${h} hours from`)} the ${arr ? 'landing time' : 'last announced departure time'}.`, `However, the current situation does not allow us to ${FX('let you deplane', 'admit you to deplane')} due to ${{ safety: 'safety', security: 'security', atc: 'air traffic control' }[v.cEn] || 'safety'} reasons.`, '(This is an exception to the requirement provided to safely protect the passengers.)', 'I must sincerely ask for your understanding and patience once again. Thank you.'));
    }
    return { ja, en };
  },
});

const RTO_R = [
  ['atc', '管制官の指示', '管制官からの指示により', 'due to an instruction from the control tower'],
  ['mech', '機体の不具合', v => `${or(v.partJa, '機体の一部')}に不具合が生じたため`, 'due to mechanical trouble'],
  ['bird', '鳥との衝突の疑い', '鳥との衝突が疑われたため', FX('due to a suspected bird strike', 'due to bird strike')],
  ['wx', '天候上の理由', '天候上の理由により', 'due to weather conditions'],
];
SITS.push({
  id: 'rto', t: ['pre'], g: '地上走行中', label: '離陸中止(RTO)', src: '2.3.2.4.4.4',
  defaults: { r: 'atc', next: 'back' },
  fields: [
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(RTO_R) },
    { k: 'partJa', t: 'text', label: '不具合の箇所(任意)', ph: '例:計器', show: v => v.r === 'mech' },
    { k: 'next', t: 'seg', label: 'このあと', opts: [['back', 'a) 駐機場に戻り点検'], ['again', 'b) 再度離陸の準備']] },
  ],
  notes: ['緊急脱出の必要がないと判断、または「Cabin crew, resume normal」のPA以降に実施。', '客室乗務員が先に「ただいま離陸を中止いたしました。詳しいことが分かり次第ご案内いたします。シートベルトをお締めのままでお待ちください。」とPAします。この文例はそれに続く簡単な理由の説明です。'],
  build(v, x) {
    const r = opt(RTO_R, v.r), back = v.next !== 'again';
    return {
      ja: [`この飛行機は、${pickJa(r, v, x)}離陸を一旦中止しました。`, back ? 'ご着席のままでお待ちください。これから駐機場に戻り安全の確認作業を行います。' : '再度離陸の準備に入りますので、引き続きシートベルトを締めたままでお待ちください。'],
      en: [`We have aborted the take-off ${pickEn(r, v, x)}.`, back ? 'Please remain seated. We will return to a parking spot for inspections.' : E('Please keep your seat belt fastened.', FX('We are preparing for another takeoff.', 'We will coordinate for another take off.'), 'Thank you.')],
    };
  },
});
