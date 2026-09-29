/* =====================================================================
   外資系の航空会社の機長PAでよく聞く英語の定番フレーズ(参考として見るだけ。アナウンス文には入れない)
   ハンドブックの文例ではない。日本語はアナウンスで読める形の言い換え。
   note は、どこでよく聞くかなどの短い説明(一般的な傾向)。
   "ladies and gentlemen" は使わず、性別を問わない everyone にしている。
   揺れのときの英語の「安全には支障ありません」は入れない(英語では言わない、という機長のルール)。
   文は文字列か (x) => 文字列。x = { o: 出発地, d: 目的地, g: [挨拶(日本語), 挨拶(英語)] }
   ===================================================================== */
const PHRASES = [
  { id: 'intro', label: '挨拶・自己紹介', items: [
    { id: 'hello', note: '定番', ja: x => `皆さま、${x.g[0]}。ご搭乗いただきありがとうございます。`, en: x => `${x.g[1]}, everyone, and welcome aboard.` },
    { id: 'fromfd', note: '英国系に多い', ja: x => `皆さま、${x.g[0]}。操縦室よりご案内申し上げます。`, en: x => `${x.g[1]}, everyone, from the flight deck.` },
    { id: 'captain', note: '定番', ja: `機長の${CAPTAIN.ja}です。`, en: `This is Captain ${CAPTAIN.en} speaking.` },
    { id: 'fo', note: '副操縦士の紹介', ja: `本日の副操縦士は${P('〇〇')}です。`, en: `Joining me on the flight deck today is First Officer ${P('___')}.` },
    { id: 'behalf', note: '定番', ja: '日本航空ならびに乗務員一同、皆さまのご搭乗を心より歓迎いたします。', en: 'On behalf of Japan Airlines and the entire crew, welcome aboard.' },
    { id: 'cabin', note: '客室乗務員の紹介', ja: `本日は${P('〇〇')}をはじめとする客室乗務員が、皆さまのお世話をさせていただきます。`, en: `Our cabin crew, led by ${P('___')}, will be taking good care of you today.` },
  ] },
  { id: 'ground', label: '出発前・地上', items: [
    { id: 'complete', note: '定番', ja: 'ご搭乗の手続きが完了いたしましたので、間もなく出発いたします。', en: "Boarding is now complete, and we'll be pushing back shortly." },
    { id: 'paper', note: '出発直前', ja: '最終の書類が整い次第、出発いたします。', en: "We're just waiting for the final paperwork, and then we'll be on our way." },
    { id: 'number', note: '地上走行中', ja: `当機の離陸の順番は${P('〇')}番目で、あと${P('〇')}分ほどで離陸する予定です。`, en: `We're number ${P('___')} for takeoff, so we should be airborne in about ${P('___')} minutes.` },
    { id: 'takeoff', note: '離陸前', ja: '間もなく離陸いたします。シートベルトをしっかりとお締めください。', en: "We'll be taking off shortly. Please make sure your seat belt is securely fastened." },
    { id: 'afterTO', note: '次の案内の予告', ja: '離陸後、改めて飛行についてご案内いたします。', en: "Once we're airborne, I'll be back with more information about our flight." },
  ] },
  { id: 'info', label: '飛行情報', items: [
    { id: 'ftime', note: '定番', ja: `本日の飛行時間は${P('〇〇')}を予定しております。`, en: `Our flight time today is ${P('___')}.` },
    { id: 'alt', note: '定番', ja: `巡航高度は${P('〇〇')}フィートを予定しております。`, en: `We'll be cruising at an altitude of ${P('___')} feet.` },
    { id: 'early', note: '早く着くとき', ja: '追い風に恵まれ、定刻より数分早く到着する見込みです。', en: 'With the help of some tailwinds, we expect to arrive a few minutes ahead of schedule.' },
    { id: 'ontime', note: '定刻のとき', ja: '到着は定刻どおりを予定しております。', en: 'We expect to arrive right on schedule.' },
    { id: 'eta', note: '到着予定', ja: x => `${x.d.ja}には${LTJ()}${P('〇時〇分')}頃に到着する予定です。`, en: x => `We expect to arrive at ${x.d.en} at around ${P('___')}${LTE()}.` },
    { id: 'dwx', note: '目的地の天候', ja: x => `${x.d.city}の天候は${P('〇〇')}、気温は${P('〇〇')}度と報告されております。`, en: x => `The weather at ${x.d.en} is ${P('___')}, with a temperature of ${P('___')} degrees Celsius, or ${P('___')} degrees Fahrenheit.` },
    { id: 'smooth', note: '定番', ja: '本日は揺れの少ない飛行が予想されます。', en: "We're expecting a smooth ride today." },
    { id: 'chop', note: '米国系(chop=小刻みな揺れ)', ja: '途中、多少揺れることが予想されます。', en: 'We may encounter some light chop along the way.' },
    { id: 'view', note: '景色', ja: `${P('右')}側のお座席からは、${P('〇〇')}がご覧いただけます。`, en: `If you're seated on the ${P('right')} side of the aircraft, you'll be able to see ${P('___')}.` },
  ] },
  { id: 'turb', label: '揺れ・ベルト', items: [
    { id: 'signOn', note: '定番', ja: 'この先揺れが予想されるため、シートベルト着用サインを点灯いたしました。', en: "We've turned on the seat belt sign, as we're expecting some turbulence ahead." },
    { id: 'return', note: '定番', ja: 'お席にお戻りになり、シートベルトをしっかりとお締めください。', en: 'Please return to your seats and make sure your seat belts are securely fastened.' },
    { id: 'lav', note: '揺れている間', ja: 'シートベルト着用サインが消えるまで、化粧室のご使用はお控えください。', en: 'Please refrain from using the lavatories until the seat belt sign has been turned off.' },
    { id: 'duration', note: '揺れの見込み', ja: `この揺れは${P('〇〇')}分ほど続く見込みです。`, en: `We expect the rough air to last for about ${P('___')} minutes.` },
    { id: 'smoother', note: '定番', ja: '揺れの少ない高度に変更できるよう、管制と調整しております。', en: "We're working with air traffic control to find a smoother altitude." },
    { id: 'signOff', note: '米国系の定番', ja: 'シートベルト着用サインを消灯いたしました。', en: "We've turned off the seat belt sign, so you're now free to move about the cabin." },
    { id: 'keepOn', note: '定番', ja: 'ただし、突然の揺れに備えて、ご着席中はシートベルトをお締めください。', en: "However, while you're seated, we recommend that you keep your seat belt fastened, just in case we encounter any unexpected turbulence." },
  ] },
  { id: 'delay', label: '遅れ・お詫び', items: [
    { id: 'clearance', note: '出発待ち', ja: '現在、管制からの出発許可を待っております。', en: "We're currently waiting for our departure clearance from air traffic control." },
    { id: 'hold', note: '上空待機', ja: x => `${x.d.ja}周辺の混雑のため、管制の指示により${P('〇〇')}分ほど上空で待機いたします。`, en: x => `Due to heavy traffic into ${x.d.en}, air traffic control has asked us to hold for about ${P('___')} minutes.` },
    { id: 'valuable', note: '米国系に多い', ja: 'お急ぎのところ誠に申し訳ございません。一刻も早く出発できるよう努めてまいります。', en: "We know your time is valuable, and we're doing everything we can to get you on your way as soon as possible." },
    { id: 'makeup', note: '遅れの取り戻し', ja: '上空で少しでも遅れを取り戻せるよう努めてまいります。', en: "We'll do our best to make up some of the lost time en route." },
    { id: 'update', note: '定番', ja: '新しい情報が入り次第、改めてご案内いたします。', en: "We'll keep you updated as soon as we have more information." },
    { id: 'sorry', note: '定番', ja: '遅れましたことをお詫び申し上げます。お待ちいただき、ありがとうございます。', en: 'We apologize for the delay, and we thank you for your patience.' },
    { id: 'patience', note: '定番', ja: '皆さまのご理解とご協力に感謝いたします。', en: 'Thank you for your patience and understanding.' },
  ] },
  { id: 'arrival', label: '降下・到着', items: [
    { id: 'descent', note: '定番', ja: x => `当機はただ今、${x.d.ja}に向けて降下を開始いたしました。`, en: x => `We've just begun our descent into ${x.d.be}.` },
    { id: 'landing', note: '定番', ja: `あと${P('〇〇')}分ほどで着陸いたします。`, en: `We'll be landing in about ${P('___')} minutes.` },
    { id: 'local', note: '到着時', ja: `現在の時刻は${P('〇時〇分')}です。`, en: `The local time is ${P('___')}.` },
    { id: 'prepare', note: '客室乗務員のPAで多い', ja: 'シートベルトをお締めになり、座席の背もたれとテーブルを元の位置にお戻しください。', en: 'Please make sure your seat belt is fastened, your seat back is upright, and your tray table is stowed.' },
    { id: 'welcome', note: '到着後の定番', ja: x => `${x.d.ja}に到着いたしました。`, en: x => `Welcome to ${x.d.be}.` },
    { id: 'remain', note: '到着後の定番', ja: '飛行機が完全に止まり、シートベルト着用サインが消えるまで、お座席でお待ちください。', en: 'Please remain seated with your seat belt fastened until the aircraft has come to a complete stop and the seat belt sign has been turned off.' },
    { id: 'belongings', note: '到着後', ja: 'お降りの際は、お手回り品をお忘れにならないようお確かめください。', en: 'Before you leave, please check around your seat for any personal belongings.' },
    { id: 'connect', note: '乗り継ぎ', ja: 'お乗り継ぎのお客さまは、地上係員がご案内いたします。', en: 'If you have a connecting flight, our ground staff will be happy to assist you.' },
  ] },
  { id: 'close', label: '締め・お礼', items: [
    { id: 'pleasant', note: '欧州系に多い(いつもの締め)', ja: 'どうぞごゆっくりお過ごしください。', en: 'We wish you a pleasant flight.' },
    { id: 'relax', note: '米国系の定番', ja: 'どうぞごゆっくりお過ごしください。', en: 'Sit back, relax, and enjoy the flight.' },
    { id: 'rest', note: '上空で', ja: '引き続き、空の旅をお楽しみください。', en: 'Enjoy the rest of your flight.' },
    { id: 'backBefore', note: '機長PAの定番', ja: '降下を始める前に、改めてご案内いたします。', en: "I'll be back with you before we begin our descent." },
    { id: 'anything', note: '定番', ja: '何かございましたら、お気軽に客室乗務員にお申し付けください。', en: "If there's anything we can do to make your flight more comfortable, please don't hesitate to let one of our cabin crew know." },
    { id: 'choosing', note: '定番', ja: '日本航空をお選びいただき、ありがとうございます。', en: 'Thank you for choosing Japan Airlines.' },
    { id: 'behalfThanks', note: '定番', ja: '乗務員一同、ご搭乗に心より感謝申し上げます。', en: 'On behalf of the entire crew, thank you for flying with Japan Airlines.' },
    { id: 'again', note: '到着後', ja: 'またのご搭乗を心よりお待ち申し上げております。', en: 'We hope to see you again soon.' },
    { id: 'journey', note: '到着後(米国系に多い)', ja: 'この先もどうぞお気をつけてお出掛けください。', en: 'Have a wonderful day, wherever your travels take you.' },
    { id: 'safe', note: '短く', ja: 'どうぞお気をつけて。', en: 'Safe travels.' },
  ] },
];
// フレーズの日本語と英語(目的地や挨拶は今の設定で)
function phraseText(it) {
  const x = { o: ORIG(), d: DEST(), g: greet() }, t = f => (typeof f === 'function' ? f(x) : f);
  return { ja: t(it.ja), en: t(it.en) };
}
