/* =====================================================================
   出発前(3/3)  ハンドブック 2.3.2.4.4.1 GTB / 2.3.2.4.7.6 ミサイル / 2.3.2.4.7.7 テクニカルランディング
   ===================================================================== */
const AOV = 'OM_SD 2.3.2.2.3 High or Medium AOV におけるアナウンスのガイドラインに従い、必要と思われる時のみ実施。';
const SICK_NOTE = '急病人発生の場合は、そのお客さまを責めているかのような印象を与えかねないため、「申し訳ない」とは言わない方がいいかもしれません。';

SITS.push({
  id: 'gtbMech', t: ['pre'], g: '駐機場への引き返し', label: '機材トラブルで引き返し', src: '2.3.2.4.4.1',
  defaults: { sys: 'elec' },
  fields: [{ k: 'sys', t: 'sel', label: '不具合の系統', opts: optsOf(GTB_SYS) }],
  notes: [AOV],
  build(v) {
    const r = opt(GTB_SYS, v.sys);
    return {
      ja: [J(`ただいま、${r[2]}の一部に不具合がみつかりました。`, 'お急ぎのところを申し訳ございませんが、安全確認のため、一旦駐機場に戻ります。')],
      en: [E(`We found a problem with the ${r[3]}.`, `We will return to a parking spot for further ${FX('inspection', 'inspections')}.`)],
      close: [{ g: 'info', ja: '再出発の時間を含めまして、後ほど詳しくご案内します。', en: '' }, CL.thanks],
    };
  },
});

const GTB_R = [
  ['sick', '急病のお客さま', '急病のお客さまがいらっしゃいますので', FX("due to a passenger's medical condition", 'due to medical reason of passenger')],
  ['cargo', '荷物の安全再確認', 'ただ今入手した情報に基づき、搭載している荷物の安全再確認が必要となったため', FX('since a safety check of our cargo loading has become necessary', 'since safety confirmation of our cargo loading became necessary')],
  ['snowac', '機体の除雪', '飛行機に積もった雪を取り除くため', 'to remove snow from this airplane'],
  ['snowrwy', '滑走路の除雪', '滑走路の除雪作業を行うため', 'due to snow removal from the runway'],
  ['closed', '滑走路の閉鎖', v => `${or(v.whyJa, '〇〇')}により、${which(v, 'ca').ja}の滑走路が閉鎖されたため`, v => `since ${which(v, 'ca').en} is now closed due to ${or(v.whyEn, '___')}`],
  ['unruly', '安全運航に協力いただけない方', '安全運航にご協力いただけない方がいらっしゃるので', "due to security reasons caused by a passenger's unruly behavior"],
];
SITS.push({
  id: 'gtbOther', t: ['pre'], g: '駐機場への引き返し', label: '急病人・荷物・除雪等で引き返し', src: '2.3.2.4.4.1',
  defaults: { r: 'sick', ca: 'orig' },
  fields: [
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(GTB_R) },
    ...whichField('ca', '閉鎖された空港').map(f => ({ ...f, show: f.show ? v => v.r === 'closed' && v.ca === 'other' : v => v.r === 'closed' })),
    { k: 'why', t: 'text2', label: '閉鎖の原因', ph: ['例:事故', 'e.g. an accident'], show: v => v.r === 'closed' },
  ],
  notes: [AOV, SICK_NOTE + '(急病のお客さまを選ぶと「お急ぎのところを申し訳ございませんが」を自動で外します)'],
  build(v, x) {
    const r = opt(GTB_R, v.r);
    return {
      ja: [J(v.r === 'sick' ? '' : 'お急ぎのところを申し訳ございませんが、', pickJa(r, v, x), '、駐機場に引き返すことになりました。')],
      en: [`We are returning to a parking spot ${pickEn(r, v, x)}.`],
      close: [{ g: 'info', ja: '新しい出発時刻など、詳しいことが決まり次第、ご案内いたします。', en: 'Further information will be provided when able.' }, CL.thanks],
    };
  },
});

SITS.push({
  id: 'gtbFuel', t: ['pre'], g: '駐機場への引き返し', label: '燃料補給のため引き返し', src: '2.3.2.4.4.1',
  notes: [AOV],
  build() {
    return {
      ja: [J('飛行機が安全に離陸できる気象状態となるまで待機しておりましたが、燃料の追加補給のため、駐機場に引き返す事が必要となりました。', 'お急ぎのところ申し訳ございません。')],
      en: [E('We were waiting for the weather conditions to improve for our safe operations. However, we need to return to a parking spot for refueling at this time.', 'We ask for your understanding.')],
      close: [{ g: 'info', ja: '再出発の時間を含めまして、後ほど詳しくご案内します。', en: 'We will inform you again as we come up with further information.' }, CL.thanks],
    };
  },
});

SITS.push({
  id: 'fuelOnboard', t: ['pre'], g: '駐機場への引き返し', label: '機内での燃料補給(On-board fueling)', src: '2.3.2.4.4.1',
  defaults: { st: 'start' },
  fields: [{ k: 'st', t: 'seg', label: '段階', opts: [['start', '補給開始'], ['end', '補給終了']] }],
  notes: ['基本的には客室乗務員がPAを行う。機長からの実施が必要な場合のみ。', '終了後はシートベルトサインをONにする。'],
  build(v) {
    if (v.st === 'end') return {
      ja: [J('只今、燃料の追加補給が終わりました。', 'シートベルトをお締めください。', 'この飛行機は間もなく出発できる予定です。')],
      en: [E(FX('The refueling has been completed.', 'The refueling has completed.'), 'Please fasten your seat belt again.', 'We should be able to depart shortly.')],
      close: [CL.thanks],
    };
    return {
      ja: [J('只今から燃料の追加補給を行います。', 'シートベルトはご案内があるまでお外しください。')],
      en: [E('We will start the additional refueling process.', `All passengers are requested to ${FX('unfasten their seat belts', 'release the seat belts')} at this time.`)],
      close: [CL.thanks],
    };
  },
});

SITS.push({
  id: 'curfew', t: ['pre'], g: '駐機場への引き返し', label: 'カーフュー(運用時間)', src: '2.3.2.4.4.1',
  defaults: { st: 'dep' },
  fields: [
    { k: 'st', t: 'seg', label: '対象', opts: [['dep', '出発空港のカーフュー'], ['arr', '到着空港のカーフュー']] },
    { k: 'tt', t: 'time', label: '離着陸できる時刻(〜まで)', show: v => v.st === 'dep' },
  ],
  notes: ['事前の確認等、地上スタッフとのコーディネーションが大変重要です。'],
  build(v, x) {
    const tail = ['これより駐機場へ引き返します。', '地上係員から今後のスケジュール等、対応についてご説明させていただきます。'];
    const close = [{ g: 'sorry', ja: 'ご迷惑をおかけしまして申し訳ございません。', en: 'We deeply apologize for the situation.' }];
    if (v.st === 'arr') return {
      ja: [J(`この便は出発が遅れたため、${x.d.ja}の運用時間内に着陸できない状況となりました。`, ...tail)],
      en: [E(`As a result of the delay, we are now unable to make our departure due to the curfew at ${x.d.en}.`, 'Unfortunately, we have to return to a parking spot.', 'Our ground staff in the lobby will provide you with further information.')],
      close,
    };
    return {
      ja: [J(`この空港で離着陸できる時間は${jt(v.tt)}までとなっており、申し訳ありませんが、この便はその時間までに離陸できない状況となりました。`, ...tail)],
      en: [E(`Unfortunately, we have to inform you that we are not able to ${FX('take off', 'takeoff')} due to the curfew at this airport.`, `Takeoff clearance will not be issued after ${et(v.tt)}.`, 'We will return to a parking spot.', 'Our ground staff in the lobby will provide you with further information.')],
      close,
    };
  },
});

SITS.push({
  id: 'missile', t: ['pre', 'air'], g: '特殊', label: 'ミサイル発射', src: '2.3.2.4.7.6',
  defaults: { st: 'cont', all: true },
  fields: [
    { k: 'st', t: 'seg', label: '状況', opts: [['cont', '安全確認済み・通常運航'], ['hold1', '①出発見合わせ(遅延)'], ['hold2', '②安全確認後に出発']] },
    { k: 'who', t: 'text2', label: '発射した国・地域', ph: ['例:〇〇〇', 'e.g. ___'] },
    { k: 'all', t: 'chk', label: '「当社の全路線も通常通り運航」を入れる', show: v => v.st === 'cont' },
  ],
  notes: ['「安全確認済み・通常運航」は、ミサイル発射のACARS MESSAGEを受領し、安全が確認された場合。'],
  build(v) {
    const wj = or(v.whoJa, '〇〇〇'), we = or(v.whoEn, '___');
    const endJa = '当社では引き続き必要な情報収集を継続し、関係機関と緊密に連携して安全運航を継続してまいりますので、どうぞご安心ください。';
    const endEn = 'We will continue to coordinate with relevant authorities and do our best for the safe operations.';
    if (v.st === 'cont') return {
      ja: [J(`先ほど、${wj}がミサイルを発射したとの連絡がございました。`, '当社は関係機関を通じて当便の航路、またその周辺の安全を確認しており、当便はこの後も通常どおりの運航を続けてまいります。', v.all && 'また、当社国際線、国内線のすべての路線につきましても通常通り運航しております。'), '引き続き必要な情報収集を継続し、関係機関と緊密に連携して安全運航を継続してまいりますので、どうぞご安心ください。'],
      en: [E(FX(`We have just received information that ${we} has launched a missile.`, 'An information on missile launch from ○○○ was just received.'), FX('With no special directives from the authorities concerned, JAL is keeping normal operations at the current stage.', 'With no special directive from authority concerned, JAL is keeping normal operations at the current stage.')), endEn],
      close: [CL.thanks],
    };
    const hold2 = v.st === 'hold2';
    return {
      ja: [J(`先ほど、${wj}がミサイルを発射したとの連絡がございました。`, hold2 ? '航路周辺の安全が確認され、出発許可が下り次第出発いたします。今しばらくお待ち下さい。' : 'この影響により現在、出発便に遅延が生じており、当機も出発を見合わせております。出発時間など、詳しい状況が入り次第お知らせいたします。今しばらくお待ちください。'), endJa],
      en: [E(`It is reported that ${we} has launched a missile.`, hold2 ? 'Departure will be arranged once safety is confirmed.' : E('To assure safety, airplane departures are being suspended at the moment.', FX('Updates on our flight will be provided when able.', 'Update on flight information will be provided when able.'))), endEn],
      close: [CL.understand],
    };
  },
});

const TL_R = [
  ['wind', '上空の向かい風', '上空の向かい風が非常に強く', 'strong head wind conditions (or en-route weather conditions)'],
  ['ground', '離陸までの時間', '出発時、離陸までに時間を要し', 'on-ground time before the takeoff which took longer than usual'],
  ['wx', '目的地の悪天', (v, x) => `目的地${x.d.city}の悪天により`, 'unfavorable weather conditions at the destination'],
];
SITS.push({
  id: 'techLanding', t: ['air', 'arr', 'pre'], g: { air: '引き返し・ダイバート', arr: '引き返し・ダイバート後', pre: '出発準備完了・再出発' },
  label: 'テクニカルランディング(乗務時間制限)', src: '2.3.2.4.7.7',
  defaults: { st: 'decide', r: 'wind', off: false },
  fields: [
    { k: 'st', t: 'seg', label: '段階', opts: [['decide', '決定後(上空)'], ['arrived', 'DVT空港に到着後'], ['redepart', '乗員交替後の再出発']] },
    { k: 'r', t: 'sel', label: '理由', opts: optsOf(TL_R), show: v => v.st === 'decide' },
    { k: 'tl', t: 'airport', label: '着陸する空港(XXX)', show: v => v.st !== 'redepart' },
    { k: 'off', t: 'chk', label: 'お客さまは一旦降機(外すと機内待機)', show: v => v.st === 'arrived' },
  ],
  notes: ['再出発のPAは交替した機長が行います(ハンドブックの冒頭は「皆さま、交替しました機長〇〇です」)。'],
  build(v, x) {
    const a = apt(v, 'tl');
    if (v.st === 'arrived') return {
      ja: [J(`当機は${a.ja}に到着いたしました。`, `乗員交替および燃料の再搭載終了後、目的地${x.d.city}に向けて再出発いたします。`), v.off ? '皆さまには一旦飛行機をお降りいただいて、出発ロビーでお待ちくださるようお願い申し上げます。' : '皆さまにはそのまま機内でお待ちくださるようお願い申し上げます。', 'この後のスケジュール等、詳しいことについては、地上係員からご案内いたします。'],
      en: [E(`We have arrived at ${a.en}.`, 'We will depart again after a change of crew and refueling.'), v.off ? 'All passengers are asked to disembark and wait in the lobby for some time.' : FX('All passengers are asked to remain on board.', 'All passengers are asked to wait on board as it is.'), 'Our ground staff will provide you with further information.'],
      close: [CL.understand],
    };
    if (v.st === 'redepart') return {
      ja: [J('法令に定められた乗務員の乗務時間制限のために乗員交替が必要となり、ご迷惑をおかけしまして申し訳ございませんでした。', `目的地${x.d.ja}に向けて再出発いたします。`)],
      en: [E('We apologize for any inconvenience caused by the need to change crew members due to the flight hour limit of the flight crew stipulated by laws and regulations.', `We will depart again for our destination, ${x.d.en}.`)],
      close: [{ g: 'thanks', ja: '皆さまのご理解、ご協力に感謝いたします。', en: 'We truly appreciate your understanding and cooperation.' }],
    };
    const r = opt(TL_R, v.r);
    return {
      ja: [J(`当便は目的地${x.d.city}に向けて飛行を続けておりましたが、`, pickJa(r, v, x), '、法令に定められた安全運航のための乗務員の乗務時間制限を超えるため、', `このまま目的地${x.d.city}への飛行継続が出来なくなりました。`), J(`一旦、${a.ja}に着陸し、乗務員交代後再出発とさせていただくこととなります。`, '大変なご不便・ご心配をおかけいたしますが、法令に定められておりますので、ご理解頂きますようお願いいたします。')],
      en: [E(`As we were flying to ${x.d.en}, it became evident that the flight time to our original destination will exceed the flight duty time limit for the flight crews established for the purpose of flight safety.`, 'The flight duty time is regulated by law and must be complied with.', `This situation is occurring due to ${pickEn(r, v, x)}.`), E(`In accordance with the law and by ${FX("the company's", "company's")} decision, we will land at ${a.en} once and then depart again after a change of ${FX('crew', 'crews')}.`, FX('We apologize for the inconvenience, and ask for your understanding.', 'We apologize for the inconveniences, and ask for your understanding.'))],
    };
  },
});
