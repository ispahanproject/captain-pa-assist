/* =====================================================================
   到着後  ハンドブック 2.3.2.4.6.x / 2.3.2.4.2.4 / 2.3.2.4.7.4〜.5
   ===================================================================== */
SITS.push({
  id: 'spotStop', t: ['arr'], g: '地上待機', label: '駐機場手前での一旦停止', src: '2.3.2.4.6.1',
  defaults: { occ: true },
  fields: [{ k: 'occ', t: 'chk', label: '「指定された駐機場にまだ他の飛行機がおります」を入れる' }],
  notes: ['原則として Parking Brake が Set されていること。'],
  build(v) {
    return {
      ja: [J(v.occ && '指定された駐機場にまだ他の飛行機がおりますので、', 'この場で一旦止まって待ちます。', '再び移動しますので、お座りのままでお待ちください。')],
      en: [E(v.occ && 'Our assigned parking spot is still occupied.', 'We are making a brief stop. Please remain seated.')],
    };
  },
});

// 機長の文例(英語は訳を追加)
SITS.push({
  id: 'thunder', t: ['arr'], g: '地上待機', label: '雷で駐機場に入れない(地上作業停止)', src: 'いつもの文例', sec: 'delay',
  defaults: { conn: true },
  fields: [{ k: 'conn', t: 'chk', label: '乗り継ぎのお客さまへの一言を入れる' }],
  build(v, x) {
    return {
      ja: [
        J(`当機${x.d.ja}へ着陸し、駐機場へ向け走行しておりましたが、現在空港周辺に発達した雷雲が接近しており、地上作業がストップしているとのことです。`, '従いまして、大変恐縮ではございますが、雷雲が過ぎ去り安全が確認できるまで、みなさまには機内にてお待ちいただきます。'),
        J('情報が入り次第、適宜ご案内させていただきます。', v.conn && '至近に乗り継ぎ予定等のあるお客様につきましてもご心配おかけしておりますが、こちらでも情報収集に努めますので、分かり次第ご案内させていただきます。'),
      ],
      en: [
        E(FX(`We have landed at ${x.d.en} and were taxiing to our parking stand. However, strong thunderstorms are approaching the airport, and ground operations have been suspended.`), 'Therefore, we kindly ask that you remain seated on board until the thunderstorms pass and it is confirmed safe to continue.'),
        FX(E('We will keep you updated as soon as we receive more information.', v.conn && 'For those of you with tight connections, we understand your concern. We are also gathering information and will let you know as soon as possible.')),
      ],
      close: [{ g: 'wait', ja: 'ご不便おかけし申し訳ございませんが、次のご案内まで今しばらくお待ちください。', en: FX('We apologize for the inconvenience and thank you for your patience until our next announcement.') }],
    };
  },
});

SITS.push({
  id: 'afterDivert', t: ['arr'], g: '引き返し・ダイバート後', label: '引き返し・ダイバート後の案内', src: '2.3.2.4.6.2',
  defaults: { st: 'cont' },
  fields: [
    { k: 'st', t: 'seg', label: '内容', opts: [['cont', '乗務継続・再出発'], ['mech', '整備士の対応が必要'], ['duty', '勤務時間制限'], ['unruly', '安全阻害行為'], ['med', '急病人']] },
    { k: 'hrs', t: 'num', label: '整備士の到着まで', unit: '時間ほど', show: v => v.st === 'mech' },
    { k: 'here', t: 'airport', label: '到着した空港', show: v => v.st === 'med' },
  ],
  notes: [SICK_NOTE],
  build(v, x) {
    if (v.st === 'mech') return {
      ja: [J('着陸後の再出発にあたりましては、規則上整備士による処置及び確認が必要となります。', `資格を有する整備士が到着するまで${or(v.hrs, '〇')}時間ほど要する見込みです。`, '誠に申し訳ございませんが、ご理解いただきますようよろしくお願いいたします。')],
      en: [E('Regarding the continuation of this flight, we will require some actions and endorsements by the certified maintenance staff.', `It is likely to take approximately ${or(v.hrs, '__')} hours for the certified staff to reach this airport.`, 'I sincerely ask for your understanding and patience. Thank you.')],
    };
    if (v.st === 'duty') return {
      ja: [J('再出発に関してですが、安全上定められた乗務時間の制限にかかってしまうため、本日中に出発することはできません。', '誠に申し訳ございませんが、航空安全上の理由によるものです。', 'ご理解いただきますよう宜しくお願いいたします。')],
      en: [E('Regarding the continuation of this flight, I regret to announce that we will not be able to make another departure on this day due to flight duty time restrictions regulated to assure safety of flight.', 'I sincerely ask for your understanding. Thank you.')],
    };
    if (v.st === 'unruly') return {
      ja: [J('先程のお客さまには飛行機を降りていただきました。', '準備が整いしだい、再出発いたします。', 'お急ぎのところ、ご迷惑をおかけしました。', 'このあと、安全運航を第一にしながら、少しでも遅れを取り戻すよう努力いたします。', '皆さまのご協力に感謝いたします。ありがとうございました。')],
      en: [E(FX('The unruly passenger has deplaned.', 'The passenger with unruly behavior was de-planed.'), 'We will resume our flight as soon as possible.', 'Thank you for your understanding.')],
    };
    if (v.st === 'med') {
      const a = apt(v, 'here');
      return {
        ja: [J(`${a.ja}に到着いたしました。`, '急病のお客さまを医療機関へ救急搬送いたしますので、そのままお座席でお待ちください。', '準備が整いしだい、再出発いたします。', 'このあと、安全運航を第一にしながら、少しでも遅れを取り戻すよう努力いたします。', '人命に関わる皆さまのご協力に感謝いたします。ありがとうございました。')],
        en: [E(`We ${FX('have arrived', 'arrived')} at ${a.en}.`, FX('A passenger who has suddenly fallen ill will be taken to a medical institution by ambulance, so please remain in your seat.', 'We will provide emergency transportation to medical institutions for passengers with sudden illnesses, so please wait in your seat.'), 'We will resume our flight as soon as possible.', FX('I would like to thank you for your cooperation in this lifesaving situation.', 'I would like to express my gratitude for the cooperation of an emergency lifesaving situation.'), 'Thank you very much.')],
      };
    }
    return {
      ja: [`再出発に関してですが、到着した後、必要な準備、燃料の搭載を済ませ、目的地${x.d.ja}に向け飛行を再開する予定です。`],
      en: [`Regarding the continuation of this flight, we will conduct necessary preparations and refueling for another departure to ${x.d.en} ${FX('once', 'as')} the situation is settled.`],
      close: [CL.thanks],
    };
  },
});

SITS.push({
  id: 'deplaneThanks', t: ['arr'], g: '御礼', label: '降機中の搭乗御礼', src: '2.3.2.4.2.4',
  defaults: { why: '' },
  fields: [
    { k: 'why', t: 'seg', label: '上空で挨拶しなかった理由(任意)', opts: [['', '入れない'], ['short', '飛行時間が短い'], ['ife', '機内エンターテイメント']] },
    { k: 'late', t: 'chk', label: '到着遅れのお詫びを入れる(追加)' },
  ],
  notes: ['原則としてチェックリスト終了後に行う。客室乗務員と事前確認することが望ましい。'],
  build(v) {
    const wj = { short: '飛行時間が短く、', ife: '機内エンターテイメントをお楽しみ頂くために、' }[v.why];
    const we = { short: 'As the flight was short, we refrained from making an announcement during the flight.', ife: 'We refrained from making an announcement during the flight so that you could enjoy the in-flight entertainment.' }[v.why];
    return {
      ja: [J('本日は日本航空をご利用いただきまして、誠にありがとうございました。', v.late && FX('本日は到着が遅れ、大変ご迷惑をおかけいたしました。'), wj && `${wj}上空でのご挨拶を控えさせていただきました。`, 'またのご搭乗を心よりお待ち申し上げております。', 'この先もどうぞお気をつけて目的地までお出掛けください。')],
      // 英語の結びは機長の文(ハンドブックの "Have a nice trip to your destination." と意味が重なるため置き換え)
      en: [E('On behalf of the entire crew, thank you for flying with Japan Airlines.', v.late && FX('We apologize for the late arrival today.'), we && FX(we), 'We look forward to welcoming you on board again. Also, we wish you a safe and pleasant journey ahead. Thank you.')],
    };
  },
});

// 機長の文例(揺れで機内サービスを制限したとき)
const SVC_R = [
  ['cold', '冷たい飲み物のみ',
    'あわせて、安全確保のため、機内サービスは冷たいお飲み物のみとさせていただきました。ご不便をおかけいたしましたことをお詫び申し上げます。',
    'For the same reason, our in-flight service was limited to cold beverages only. We apologize for any inconvenience this may have caused.'],
  ['suspended', '中断',
    'あわせて、安全確保のため、機内サービスを中断させていただきました。すべてのお客様にサービスをご提供することができず、申し訳ございませんでした。',
    'For the same reason, our in-flight service was suspended during the flight. We were unable to serve all of our passengers, and for that we sincerely apologize.'],
  ['none', '不可',
    'あわせて、安全確保のため、本日は機内サービスを行うことができませんでした。お客様にサービスをご提供できず、誠に申し訳ございませんでした。',
    'For the same reason, we were unable to provide any in-flight service today. We sincerely apologize that we could not offer our service to you.'],
];
SITS.push({
  id: 'svcLimited', t: ['arr'], g: '御礼', label: 'サービス制限のお詫び(揺れ)', src: 'いつもの文例',
  defaults: { cause: 'over', svc: 'cold' },
  fields: [
    { k: 'cause', t: 'seg', label: '揺れ', opts: [['over', '予想以上の揺れ'], ['forecast', '想定された揺れ']] },
    { k: 'svc', t: 'seg', label: '機内サービス', opts: optsOf(SVC_R) },
  ],
  build(v) {
    const r = opt(SVC_R, v.svc), fc = v.cause === 'forecast';
    return {
      ja: [fc
        ? FX(J('本日は雲や風の変化が大きく、飛行中は揺れが続く状況となりました。', 'お客様に安全にお過ごしいただくため、ベルト着用のサインを長時間点灯させていただきました。'))
        : J('本日は当初の予想以上に雲や風の変化が大きく、飛行中は揺れが続く状況となりました。', 'お客様に安全にお過ごしいただくため、ベルト着用のサインを予定より長く点灯させていただきました。'), r[2]],
      en: [fc
        ? FX(E('Today, changes in the clouds and winds caused continued turbulence during the flight.', 'For your safety, we kept the seatbelt sign on for an extended period.'))
        : E('The weather conditions were not as good as we had initially expected, and we experienced continued turbulence during the flight.', 'For your safety, we kept the seatbelt sign on longer than originally planned.'), r[3]],
      close: [{ g: 'understand',
        ja: '本日も安全運航にご理解とご協力を賜り、誠にありがとうございました。またのご搭乗を心よりお待ち申し上げております。この先もどうぞお気をつけて目的地までお出掛けください。',
        en: 'Thank you for your understanding and cooperation with our safe operation today. We look forward to welcoming you on board again. Also, we wish you a safe and pleasant journey ahead. Thank you.' }],
    };
  },
});

SITS.push({
  id: 'quarantine', t: ['arr'], g: '特殊', label: '検疫検査の実施', src: '2.3.2.4.7.4',
  build() {
    return {
      ja: [J('この飛行機では検疫検査が実施されることとなりました。', 'ご着席のままお待ちください。', '検疫検査官の許可が下りるまでの間、飛行機内でお待ちいただくことになります。', 'ご理解、ご協力のほど、お願いします。')],
      en: [E('The Quarantine officers are going to inspect this airplane.', `Please remain seated until ${FX('further notice', 'further advice')}.`, 'Thank you for your cooperation.')],
    };
  },
});

SITS.push({
  id: 'kadena', t: ['arr'], g: '特殊', label: '嘉手納へダイバートした場合', src: '2.3.2.4.7.5',
  notes: ['RM_JALISSUE_Japan - RODN - / DNA 嘉手納 参照。'],
  build() {
    return {
      ja: [J('嘉手納空港に着陸しましたが、諸事情により飛行機を降りることはできません。', 'また、基地の写真撮影も固く禁じられております。', 'この後のスケジュールに関しましては、状況を確認後、改めてご案内します。', 'ご理解、ご協力のほどお願いします。')],
      en: [E(`We have landed at ${FX('Kadena Air Base', 'Kadena Airforce Base')}.`, 'However, you are asked to remain in this airplane.', `Also, ${FX('taking photographs', 'taking photograph')} is prohibited at this airport.`, 'Further information will be provided when able.', 'Thank you for your understanding.')],
    };
  },
});

/* =====================================================================
   緊急  ハンドブック 2.3.2.4.8.x / 2.3.2.4.7.8
   ===================================================================== */
SITS.push({
  id: 'emgLanding', t: ['emg'], g: '緊急', label: '緊急着陸・着水', src: '2.3.2.4.8.1',
  defaults: { kind: 'land' },
  fields: [
    { k: 'kind', t: 'seg', label: '種類', opts: [['land', '緊急着陸'], ['ditch', '不時着水']] },
    { k: 'why', t: 'text2', label: '理由', ph: ['例:エンジンの故障', 'e.g. engine failure'] },
  ],
  build(v) {
    const d = v.kind === 'ditch';
    return {
      ja: [J(`当機は${or(v.whyJa, '〇〇')}のため、このまま飛行を続けることが困難となりました。`, `安全のための最善の措置として、この飛行機は${d ? '不時着水' : '緊急着陸'}することにいたしました。`), J('私ども全乗務員は、こうした緊急事態のための訓練を、日頃から繰り返し十分に行っております。', '安心して乗務員の指示に従ってください。', `追って${d ? '着水' : '着陸'}の時間をお知らせします。`)],
      en: [E(`We are unable to continue this flight due to ${or(v.whyEn, '___')}.`, `We have decided to make an emergency landing ${d ? 'on open water' : 'on an open field'} as the best possible choice.`), E(FX('The crew members are fully trained for this kind of situation.', 'The crewmembers are fully trained for this kind of situations.'), 'Please follow our instructions and stay calm.', 'We will inform you again before the impact.')],
    };
  },
});

SITS.push({
  id: 'decomp', t: ['emg'], g: '緊急', label: '急減圧(安全高度到達後)', src: '2.3.2.4.8.2',
  notes: ['安全高度への到達後に実施。', '「Oxygen」は英語では「オクスィジェン」と発音します。「オキシゲン」ではありません。'],
  build() {
    return {
      ja: [J('この飛行機は急速に機内の気圧が下がったため、安全のために高度を下げ、現在安全な高度まで達しました。', 'どうぞ酸素マスクをおはずしください。')],
      en: [E(`We have made an emergency descent due to ${FX('decompression', 'de-compression')}.`, `We are now at ${FX('a safe altitude', 'safe altitude')}.`, 'You may take off your oxygen mask at this time.')],
    };
  },
});

SITS.push({
  id: 'lowpass', t: ['emg'], g: '緊急', label: 'ローパス(着陸装置の目視確認)', src: 'いつもの文例',
  // 機長の文例(タイヤ・着陸装置の不具合の可能性)
  build() {
    return {
      ja: [J('現在この飛行機の着陸装置に不具合がある可能性があるため、一度滑走路上を低空で飛行し、地上から係員が目で見て確認をいたします。', '状況が確認できた上で、改めて着陸態勢に入ります。')],
      en: [E('The instruments show a possible problem with the landing gear system.', 'We will make a low pass over the runway so that our ground crew can make a visual inspection.', 'After confirming the situation, we will make another approach for landing.')],
    };
  },
});

SITS.push({
  id: 'bomb', t: ['emg'], g: '緊急', label: 'B/B Threat Step 2(機内捜索開始)', src: '2.3.2.4.8.4',
  build() {
    return {
      ja: [J('ただ今この飛行機に対し、爆発物が仕掛けられている可能性があるとの情報が入りました。', '情報の分析および対応につきましては弊社の安全部門でも全力で取り組んでいますが、同時にこの機内でも不審物の捜索を開始します。', '客室乗務員の指示に従って下さい。')],
      en: [E(FX('We have received information concerning the possibility of an explosive device having been placed on this airplane.', 'We have received information concerning possibility of having an explosive device placed in this airplane.'), "Our company's safety and security experts are analyzing the situation.", 'At this time, we would like to conduct our safety programs in the cabin.', "Please follow our cabin attendants' instructions.")],
      close: [{ g: 'understand', ja: '皆さまのご理解、ご協力をお願いします。', en: 'Your understanding and cooperation are requested. Thank you.' }],
    };
  },
});

SITS.push({
  id: 'rapid', t: ['emg'], g: '参考(客室乗務員のPA)', label: 'Rapid Deplaning', src: '2.3.2.4.7.8',
  defaults: { whyJa: '隣の飛行機から火災が発生しました', whyEn: 'A fire has broken out on the aircraft next to us' },
  fields: [{ k: 'why', t: 'text2', label: '理由', ph: ['例:隣の飛行機から火災が発生しました', 'e.g. A fire has broken out on the aircraft next to us'] }],
  notes: ['CAM SAFETY記載の文例で、Rapid Deplaningが判断された場合に客室乗務員が行うアナウンスです(参考)。', '英語の理由の初期値は、原文 “A fire has broken out from the next aircraft” を直しています。'],
  build(v) {
    return {
      ja: [J(`ただいま${or(v.whyJa, '〇〇')}。`, '皆さまの安全のため飛行機から降りていただくことになりました。', '荷物を置いて降りて下さい。', '走らずに、落ち着いて前方の開いているドアから降りてください。', '降りた後は地上係員の指示に従ってください。')],
      en: [E(`${or(v.whyEn, '___')}.`, 'We have decided to deplane for your own safety.', 'Please leave your baggage upon deplaning.', FX('Please do not run, and deplane calmly through the open exit at the front.', 'Please do not run and deplane from the open exit in the front.'), 'After deplaning, please follow the instructions from our ground staff.')],
    };
  },
});
