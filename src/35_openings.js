/* =====================================================================
   冒頭(機長の決まった言い方)
   ・挨拶の状況(greet: true の搭乗中のアナウンス・上空での挨拶)を含むとき … いつもの挨拶
     便名はフライト情報の便名から(未入力なら〇〇で、言うときに補う)。行き先は目的地の設定から。
   ・それ以外の状況 … 操縦室よりご案内申し上げます。当便機長の〇〇です。
   ===================================================================== */
function opening(greeting) {
  if (!greeting) return {
    ja: `操縦室よりご案内申し上げます。当便機長の${CAPTAIN.ja}です。`,
    en: `This is your Captain ${CAPTAIN.en} speaking from the flight deck.`,
  };
  const g = greet(), d = DEST();
  return {
    ja: `皆さま、${g[0]}。本日も日本航空${S.flight.fn || P('〇〇')}便${d.bj}行きをご利用いただきありがとうございます。当便機長${CAPTAIN.ja}です。`,
    en: `${g[1]}, everyone. Welcome aboard Japan Airlines Flight ${S.flight.fn || P('___')} to ${d.be}. This is your Captain ${CAPTAIN.en} speaking.`,
  };
}
const TIMINGS = [['pre', '出発前'], ['air', '上空'], ['arr', '到着後'], ['emg', '緊急'], ['free', '自由作成']];

/* =====================================================================
   本文の並び(機長の好みの構成)
   挨拶 → その他の本文 → 遅れの理由 → 飛行時間 → 揺れ等の気象情報 → ベルト着用のお願い → 締め
   気象情報は wx(現地の天候・Marginal など)→ route(航路上の天候)の順。航路上の天候をベルトのお願いの直前に置く
   (英語の "But, for your own safety…" が「概ね良好」を受けるため)。svc(機内サービスの制限の案内)はベルトの後。
   状況の本文(build の ja / en)は、その状況の sec(省略時 main)の段に入る。
   build の parts: [{ s: 段, ja, en }] で、本文の一部を別の段に入れられる。
   time と belt の段は、複数の状況から来ても1つだけ残す(後の状況のもの)。
   ===================================================================== */
const SECTION_ORDER = ['main', 'delay', 'time', 'wx', 'route', 'belt', 'svc'];
const SECTION_SINGLE = ['time', 'belt'];

/* =====================================================================
   締めの言葉。種類(g)ごとに1つだけ残し、この順に並べる。
   英語の thanks("Thank you.")は、ほかの締めの英語に thank があれば省く。
   ===================================================================== */
const CLOSE_ORDER = ['info', 'sorry', 'wait', 'understand', 'enjoy', 'thanks'];
const CL = {
  waitSorry: { g: 'wait', ja: 'お急ぎのところを申し訳ございませんが、今しばらくお待ちください。', en: 'Thank you for your understanding.' },
  thanks: { g: 'thanks', ja: '', en: 'Thank you.' },
  understand: { g: 'understand', ja: '', en: 'Thank you for your understanding.' },
};

/* 状況の一覧。ファイル 40〜60 で追加する */
const SITS = [];
const opt = (list, key) => list.find(o => o[0] === key) || list[0];
const optsOf = list => list.map(o => [o[0], o[1]]);
// 選択肢の [key, ラベル, 日本語, 英語]。日本語・英語は文字列か (v, x) => 文字列
const pickJa = (o, v, x) => (typeof o[2] === 'function' ? o[2](v, x) : o[2]);
const pickEn = (o, v, x) => (typeof o[3] === 'function' ? o[3](v, x) : o[3]);
const an = w => (/^[aeiou]/i.test(w) ? 'an' : 'a');
