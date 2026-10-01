/* =====================================================================
   状態と文の組み立て(画面に依存しない部分)
   ===================================================================== */
const KEY = 'captain-pa-assist-v2';
let S = {
  flight: { fn: '', orig: 'HND', dest: 'OKA', greet: 'auto', clock: '12', nick: false, lt: false },
  routes: {},   // 便名 → [出発地, 目的地](使いながら覚える。キーは先頭の0を除いた数字)
  edits: {},    // アナウンス文の手直し。キー(タイミング+選んだ状況) → { ja|en: { text: 直した文, base: 直したときの元の文 } }
  tm: 'air', sel: { pre: [], air: [], arr: [], emg: [], free: [] },
  free: { open: 'auto', items: [] },   // 自由作成:冒頭(auto / fixed / cockpit / none)と、選んだ文
  v: {}, extra: {}, font: 20, theme: 'dark', reader: 'ja', fix: true,
  order: {}, reorder: false,   // order: 並べ替えた順番(タイミング+選んだ状況ごと)
  listOpen: true, fold: {},    // 状況の一覧を開いているか / 閉じているグループ(タイミングごと)
  // よく使う組み合わせ(選んだ状況だけを保存。入力値は保存しない)
  presets: [
    { name: '搭乗中(通常)', tm: 'pre', ids: ['boarding'] },
    { name: '上空の挨拶', tm: 'air', ids: ['welcome'] },
    { name: '揺れ', tm: 'air', ids: ['turb'] },
  ],
};
let firstRun = true;
try {
  const s = JSON.parse(localStorage.getItem(KEY));
  if (s) { S = { ...S, ...s, flight: { ...S.flight, ...s.flight }, sel: { ...S.sel, ...s.sel }, free: { ...S.free, ...s.free } }; firstRun = false; }
} catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const $ = q => document.querySelector(q);
const ok = p => typeof p === 'string' && p.trim() !== '';
const sit = id => SITS.find(s => s.id === id);
// 前の版で「間もなく出発の準備が全て整います」を外していた設定(ready: false)を、新しい項目(prep)に引き継ぐ
if (S.v.boarding && S.v.boarding.prep === undefined && S.v.boarding.ready === false) S.v.boarding.prep = '';
function vals(id) {
  if (!S.v[id]) S.v[id] = JSON.parse(JSON.stringify(sit(id).defaults || {}));
  return S.v[id];
}

/* ---------- 便名 → 出発地・目的地 ---------- */
const fnKey = fn => (/^\d+$/.test(fn || '') ? String(+fn) : '');
const isCode = c => AIRPORTS.some(a => a[0] === c);
const fnLabel = k => 'JL' + k.padStart(3, '0');
const aptShort = c => { const a = AIRPORTS.find(x => x[0] === c); return a ? `${c} ${a[1].replace(/空港$/, '')}` : c; };
const routeText = r => `${aptShort(r[0])} → ${aptShort(r[1])}`;
// まとめて登録:1行に1便「JL901 HND OKA」「901,HND,OKA」「JL0901 HND-OKA」など
function importRoutes(text) {
  let n = 0; const bad = [];
  text.split(/\n+/).map(l => l.trim()).filter(Boolean).forEach(l => {
    const m = l.toUpperCase().replace(/[０-９Ａ-Ｚ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).match(/^(?:JL|JAL)?\s*(\d{1,4})[^A-Z0-9]+([A-Z]{3})[^A-Z0-9]+([A-Z]{3})\b/);
    if (m && isCode(m[2]) && isCode(m[3]) && m[2] !== m[3]) { S.routes[fnKey(m[1])] = [m[2], m[3]]; n++; } else bad.push(l);
  });
  return { n, bad };
}
// 内蔵の JAL 時刻表(src/22_jal_timetable.js)から便名の区間を探す。今日を含む期間を優先し、なければ日付の近い期間
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function ttMap(t) {
  if (!t.m) { t.m = {}; t.data.split(';').forEach(x => { const [n, a, b] = x.split(' '); t.m[n] = [a, b]; }); }
  return t.m;
}
function timetableRoute(fn, today = ymd(new Date())) {
  const k = fnKey(fn);
  if (!k) return null;
  const gap = t => (today < t.from ? Date.parse(t.from) - Date.parse(today) : today > t.to ? Date.parse(today) - Date.parse(t.to) : 0);
  const t = JAL_TT.filter(x => ttMap(x)[k]).sort((a, b) => gap(a) - gap(b))[0];
  return t ? { r: ttMap(t)[k], t, inPeriod: gap(t) === 0 } : null;
}
// 便名の区間:自分で登録・修正したもの → 内蔵の時刻表 の順
function routeFor(fn) {
  const u = S.routes[fnKey(fn)];
  if (u) return { r: u, src: 'user' };
  const tt = timetableRoute(fn);
  return tt && { ...tt, src: 'tt' };
}
const ttLast = () => JAL_TT.map(t => t.to).sort().pop();
const mdText = d => `${+d.slice(0, 4)}/${+d.slice(5, 7)}/${+d.slice(8, 10)}`;
const exportRoutes = () => Object.keys(S.routes).sort((a, b) => a - b).map(k => `${fnLabel(k)} ${S.routes[k][0]} ${S.routes[k][1]}`).join('\n');

/* ---------- 並び順(グループ順 → 定義順) ---------- */
const GROUP_ORDER = {
  pre: ['搭乗中', '出発の遅れ', '出発準備完了・再出発', '地上走行中', '駐機場への引き返し', '特殊'],
  air: ['挨拶', '揺れ', '遅れ・待機', '進入・着陸', '引き返し・ダイバート', '特殊'],
  arr: ['地上待機', '引き返し・ダイバート後', '御礼', '特殊'],
  emg: ['緊急', '参考(客室乗務員のPA)'],
};
const grpOf = (s, tm) => (typeof s.g === 'object' ? s.g[tm] : s.g);
const sortKey = (s, tm) => GROUP_ORDER[tm].indexOf(grpOf(s, tm)) * 1000 + SITS.indexOf(s);
// 状況のIDを並び順(グループ順 → 定義順)にそろえる
function sortIds(tm, ids) {
  return ids.map(sit).filter(s => s && s.t.includes(tm)).sort((a, b) => sortKey(a, tm) - sortKey(b, tm)).map(s => s.id);
}
function selected(tm) { return sortIds(tm, S.sel[tm]); }

/* ---------- 文の組み立て ---------- */
// 状況1つ分の本文ブロック(日本語と英語の組)と締めの言葉を作る。
// sec は段、key はブロックの目印(time と belt は段名そのもの)
function situationBlocks(s, v, tm) {
  const r = s.build(v, { t: tm, o: ORIG(), d: DEST() }) || {}, n = {}, blocks = [];
  const mk = (sec, key, ja, en) => {
    const b = { sec, key: SECTION_SINGLE.includes(sec) ? sec : key, ja: [].concat(ja || []).filter(ok), en: [].concat(en || []).filter(ok) };
    if (b.ja.length || b.en.length) blocks.push(b);
  };
  mk(s.sec || 'main', s.id, r.ja, r.en);
  (r.parts || []).forEach(p => { n[p.s] = (n[p.s] || 0) + 1; mk(p.s, `${s.id}.${p.s}${n[p.s]}`, p.ja, p.en); });
  return { blocks, closes: (r.close || []).filter(Boolean) };
}
// 締めの言葉を種類ごとに1つにまとめて決まった順に並べる。
// 英語の "Thank you." は、本文の最後の文かほかの締めにすでにお礼(thank / appreciate)があれば付けない
function closing(cl, en) {
  const THANKS = /thank|appreciate/i;
  const lastEn = (en.filter(ok).pop() || '').trim().replace(/^.*[.!?]\s+/, '');
  const enThanked = THANKS.test(lastEn) || CLOSE_ORDER.some(k => k !== 'thanks' && cl[k] && THANKS.test(cl[k].en || ''));
  const cj = [], ce = [];
  CLOSE_ORDER.forEach(k => {
    const c = cl[k]; if (!c) return;
    if (ok(c.ja)) cj.push(c.ja);
    if (ok(c.en) && !(k === 'thanks' && enThanked)) ce.push(c.en);
  });
  return { ja: J(...cj), en: E(...ce) };
}
const tidyEn = en => en.filter(ok).map(p => p.replace(/([ap]\.m\.)\./g, '$1'));
// 並べ替えた順番を覚えるキー(タイミング+選んだ状況の組み合わせ)
const orderKey = tm => `${tm}|${selected(tm).join(',')}`;
// 保存した順番を当てはめる。保存にない(あとから増えた)ブロックは標準の位置のまま
function applyOrder(blocks, saved) {
  if (!saved || !saved.length) return blocks;
  const moved = blocks.filter(b => saved.includes(b.key)).sort((a, b) => saved.indexOf(a.key) - saved.indexOf(b.key));
  let i = 0;
  return blocks.map(b => (saved.includes(b.key) ? moved[i++] : b));
}
// 冒頭をいつもの挨拶にする状況:挨拶の状況(搭乗中のアナウンス・上空での挨拶)と、出発前の「搭乗中」の状況すべて
const greets = (s, tm) => !!s && (!!s.greet || (tm === 'pre' && grpOf(s, 'pre') === '搭乗中'));
// 「出発の準備は全て整っておりますが、」を、続く待ちの理由(出発の遅れ・フローなど)の文頭につなげる。
// 理由の文頭の前置き(「現在、出発時刻を過ぎましたが、」「早々にご搭乗いただき恐縮ではございますが、」など)は外す
function mergeReady(blocks) {
  const i = blocks.findIndex(b => b.key === 'boarding' && (b.ja[0] || '').startsWith(READY_DONE_JA));
  const j = blocks.findIndex((b, n) => n > i && WAIT_IDS.includes(b.key));
  if (i < 0 || j < 0) return blocks;
  const b = blocks[j];
  const ja0 = b.ja[0].replace(/^(?:現在、)?[^。、]*?(?:過ぎましたが|ございますが)、/, '').replace(/^この便の出発準備は全て整っております。/, '');
  const en0 = b.en[0].replace(/^We have completed our departure preparations\. However, /, '');
  const en = /^(Due|Our|Air|We|There|we)\b/.test(en0)
    ? `${FX('We are all ready for departure. However,')} ${en0[0].toLowerCase()}${en0.slice(1)}` : `${FX('We are all ready for departure.')} ${en0}`;
  const out = blocks.slice();
  out[j] = { ...b, ja: [READY_DONE_JA + ja0, ...b.ja.slice(1)], en: [en, ...b.en.slice(1)] };
  out.splice(i, 1);
  return out;
}
function compose(tm) {
  if (tm === 'free') return composeFree();
  const ids = selected(tm);
  if (!ids.length) return null;
  const O = opening(ids.some(id => greets(sit(id), tm))), cl = {};
  // 本文はブロックで集め、段(SECTION_ORDER)の順に並べる。time と belt は1つだけ(後の状況のもの)
  let blocks = [];
  const add = b => {
    if (SECTION_SINGLE.includes(b.sec)) blocks = blocks.filter(o => o.sec !== b.sec);
    else if (blocks.some(o => o.ja.join() === b.ja.join() && o.en.join() === b.en.join())) return;
    blocks.push(b);
  };
  ids.forEach(id => {
    const r = situationBlocks(sit(id), vals(id), tm);
    r.blocks.forEach(add);
    r.closes.forEach(c => { cl[c.g] = c; });
  });
  blocks.sort((a, b) => SECTION_ORDER.indexOf(a.sec) - SECTION_ORDER.indexOf(b.sec));
  blocks = mergeReady(blocks);
  const ex = S.extra[tm] || {};
  if (ok(ex.xJa) || ok(ex.xEn)) add({ sec: 'extra', key: 'extra', ja: [ex.xJa].filter(ok), en: [ex.xEn].filter(ok) });
  blocks = applyOrder(blocks, S.order[orderKey(tm)]);
  const ja = [O.ja, ...blocks.flatMap(b => b.ja)], en = [O.en, ...blocks.flatMap(b => b.en)];
  const C = closing(cl, en);
  ja.push(C.ja); en.push(C.en);
  return { ja: ja.filter(ok), en: tidyEn(en), blocks, open: O, closeJa: C.ja };
}

/* ---------- 自由作成:各状況の文を選んで組み立てる ---------- */
const fieldList = s => { const out = [], walk = fs => (fs || []).forEach(f => (f.t === 'row' ? walk(f.items) : out.push(f))); walk(s.fields); return out; };
// 入力欄と同じ既定値を入れる(1つ選ぶ項目は最初の選択肢、複数選ぶ項目は空、スイッチはオフ)
function filled(s, v) {
  const o = JSON.parse(JSON.stringify(v || {}));
  fieldList(s).forEach(f => {
    if ((f.t === 'sel' || f.t === 'seg') && o[f.k] === undefined) o[f.k] = f.opts[0][0];
    if (f.t === 'chips' && !Array.isArray(o[f.k])) o[f.k] = [];
    if (f.t === 'chk') o[f.k] = !!o[f.k];
  });
  return o;
}
// 選んだ文は選択肢(o)だけを持つ。時刻・分・空港名などの入力値は、その状況の入力欄の今の値を使う
const OPT_T = ['sel', 'seg', 'chk', 'chips'];
function optionPart(s, v) {
  const o = {};
  fieldList(s).forEach(f => { if (OPT_T.includes(f.t) && v[f.k] !== undefined) o[f.k] = JSON.parse(JSON.stringify(v[f.k])); });
  return o;
}
const liveVals = s => filled(s, S.v[s.id] || s.defaults);
// 選んだ文 { id, tm, kind: 'b'(本文)|'c'(締め), key, o, sec } を今の入力で作り直す。作れなければ入力なしで作る
function resolvePiece(p) {
  const s = sit(p.id);
  if (!s) return null;
  const find = v => {
    const r = situationBlocks(s, v, p.tm);
    if (p.kind === 'c') {
      const [, g, n] = p.key.split(':'), c = r.closes.filter(d => d.g === g)[+n || 0];
      return c ? { sec: 'close', ja: [c.ja].filter(ok), en: [c.en].filter(ok) } : null;
    }
    // 段落ごとの文(key#番号)は、日本語と英語の段落の数がそろっているときだけ取り出す
    const [key, k] = p.key.split('#'), b = r.blocks.find(x => x.key === key);
    if (!b || k === undefined) return b || null;
    return b.ja.length === b.en.length && b.ja[k] ? { sec: b.sec, key: p.key, ja: [b.ja[k]], en: [b.en[k]] } : null;
  };
  return find(filled(s, { ...liveVals(s), ...p.o })) || find(filled(s, { ...s.defaults, ...p.o }));
}
// 好みの構成の順(遅れの理由 → 飛行時間 → 気象 → 航路 → ベルト → サービス → 締め)。締めの中は CLOSE_ORDER の順
const FREE_ORDER = [...SECTION_ORDER, 'close'];
const rank = p => Math.max(0, FREE_ORDER.indexOf(p.sec)) * 10 + (p.kind === 'c' ? Math.max(0, CLOSE_ORDER.indexOf(p.key.split(':')[1])) : 0);
// 選んだ文を好みの構成の位置に入れる(同じ段の文は後ろに)
function insertPiece(p) {
  const a = S.free.items;
  let i = a.length;
  while (i > 0 && rank(a[i - 1]) > rank(p)) i--;
  a.splice(i, 0, p);
}
function sortFree() {
  S.free.items = S.free.items.map((p, i) => [p, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(a => a[0]);
}
function composeFree() {
  const F = S.free, ex = S.extra.free || {};
  const pieces = F.items.map(resolvePiece).filter(Boolean);
  if (!pieces.length && !ok(ex.xJa) && !ok(ex.xEn)) return null;
  // 自動:搭乗中の状況の文、または上空での挨拶の本文を選んだときは、いつもの挨拶。
  // 飛行時間・航路・ベルト・締めのような共通の文(挨拶の状況は天候も)では変えない
  const lead = p => { const s = sit(p.id); return greets(s, p.tm) && (s.greet ? p.sec === 'main' : !['time', 'route', 'belt', 'close'].includes(p.sec)); };
  const greeting = F.open === 'auto' ? F.items.some(lead) : F.open === 'fixed';
  const O = F.open === 'none' ? { ja: '', en: '' } : opening(greeting);
  // 追加で伝えたいことは、最後に並んだ締めの言葉の前に入れる
  let k = pieces.length;
  while (k > 0 && pieces[k - 1].sec === 'close') k--;
  const body = [...pieces.slice(0, k), { sec: 'extra', ja: [ex.xJa], en: [ex.xEn] }, ...pieces.slice(k)];
  // 続けて並んだ締めの言葉は1つの段落にまとめる
  const ja = [O.ja], en = [O.en];
  for (let i = 0; i < body.length; i++) {
    if (body[i].sec !== 'close') { ja.push(...body[i].ja); en.push(...body[i].en); continue; }
    const run = [];
    while (i < body.length && body[i].sec === 'close') run.push(body[i++]);
    i--;
    ja.push(J(...run.flatMap(b => b.ja))); en.push(E(...run.flatMap(b => b.en)));
  }
  return { ja: ja.filter(ok), en: tidyEn(en), blocks: [], open: O, closeJa: '' };
}
// 文の一覧に出す言い方:今の入力のほか、選択肢を1つずつ変えた言い方も作る。
// その選択で新しく出てくる項目(例:理由=整備 → 整備する系統)も1つずつ変える。ch = 今の入力から変えた [項目, 値]
const vis = (f, v) => !f.show || f.show(v);
function variantsOf(s) {
  const base = liveVals(s), out = [{ v: base, ch: [] }], fs = fieldList(s);
  const alts = (f, v) => (f.t === 'chk' ? [!v[f.k]] : (f.t === 'sel' || f.t === 'seg') ? f.opts.map(o => o[0]).filter(o => o !== v[f.k]) : []);
  fs.forEach(f => alts(f, base).forEach(a => {
    const v = { ...base, [f.k]: a }, dep = fs.filter(g => g !== f && !vis(g, base) && vis(g, v));
    // 新しく出てくる選択肢の今の値も違いとして書く(例:整備作業・電気系統)
    out.push({ v, ch: [[f, a], ...dep.filter(g => g.opts && g.t !== 'chips').map(g => [g, v[g.k]])] });
    dep.forEach(g => alts(g, v).forEach(b => out.push({ v: { ...v, [g.k]: b }, ch: [[f, a], [g, b]] })));
  }));
  return out;
}
// 言い方の違いを短く表す(選択肢の名前。スイッチは「〜」/「〜なし」)
function valueNote(f, a) {
  if (f.t !== 'chk') return ((f.opts || []).find(o => o[0] === a) || [, ''])[1];
  const l = (f.label || '').replace(/[「」]/g, '').replace(/を入れる/, '').replace(/[((].*?[))]/g, '');
  return a ? l : `${l}なし`;
}
const sigOf = b => b.ja.join('|') + '#' + b.en.join('|');
// 全部の状況の文を、状況ごとにまとめる(タイミング → 状況の一覧と同じ順)
function phraseLibrary() {
  const groups = [];
  TIMINGS.forEach(([tm]) => {
    if (!GROUP_ORDER[tm]) return;
    sortIds(tm, SITS.map(s => s.id)).map(sit).forEach(s => {
      const items = [], seen = new Set(), base = liveVals(s);
      const push = (it, va) => {
        const sig = sigOf(it);
        if ((!it.ja.length && !it.en.length) || seen.has(sig)) return;
        seen.add(sig);
        items.push({ ...it, sig, id: s.id, tm, o: optionPart(s, va.v), ch: va.ch, note: va.ch.map(([f, a]) => valueNote(f, a)).join('・') });
      };
      variantsOf(s).forEach(va => {
        const r = situationBlocks(s, va.v, tm), n = {};
        // 段落が複数あり日本語と英語がそろっている本文は、段落ごとに選べるようにする
        r.blocks.forEach(b => (b.ja.length > 1 && b.ja.length === b.en.length
          ? b.ja.forEach((j, k) => push({ kind: 'b', key: `${b.key}#${k}`, sec: b.sec, ja: [j], en: [b.en[k]] }, va))
          : push({ kind: 'b', key: b.key, sec: b.sec, ja: b.ja, en: b.en }, va)));
        r.closes.forEach(c => {
          n[c.g] = (n[c.g] || 0) + 1;
          push({ kind: 'c', key: `c:${c.g}:${n[c.g] - 1}`, sec: 'close', ja: [c.ja].filter(ok), en: [c.en].filter(ok) }, va);
        });
      });
      // 同じ場所の文に言い方が複数あるときだけ、違い(選択肢の名前)を添える。
      // 今の入力の文には、ほかの言い方で変えた項目のうち、表示されている選択肢の今の値を書く
      const fam = {};
      items.forEach(it => (fam[it.key] = fam[it.key] || []).push(it));
      Object.values(fam).forEach(a => {
        if (a.length < 2) return a.forEach(it => (it.note = ''));
        const fs = [...new Set(a.flatMap(it => it.ch.map(([f]) => f)))].filter(f => f.t !== 'chk' && vis(f, base));
        a.forEach(it => { if (!it.ch.length) it.note = [...new Set(fs.map(f => valueNote(f, base[f.k])).filter(Boolean))].join('・'); });
      });
      items.forEach(it => delete it.ch);
      if (items.length) groups.push({ tm, id: s.id, label: s.label, items });
    });
  });
  return groups;
}

/* ---------- 読む前のチェック(添削) ---------- */
// eff:読む文(手直し込み)、gen:作成された文(どちらも段落の配列)、edited:手直しした言語、open:冒頭の文(平文)
// 返り値 [{ lv: 'warn'(直したほうがよい) | 'info'(確認), msg }]
const LANG_NAME = { ja: '日本語', en: '英語' };
const cut = s => (s.length > 30 ? s.slice(0, 30) + '…' : s);
const zen2han = t => t.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
const nums = t => (zen2han(t).match(/\d+(?:[.,]\d+)*/g) || []).map(n => n.replace(/,/g, ''));
const blankCount = t => (t.match(/〔[^〕]*〕|[〇○]{2,}|_{3,}/g) || []).length;
// a にあって b にない数字(同じ数字が複数あるときは数も比べる)
function numDiff(a, b) {
  const m = new Map(), out = [];
  b.forEach(x => m.set(x, (m.get(x) || 0) + 1));
  a.forEach(x => { if (m.get(x)) m.set(x, m.get(x) - 1); else out.push(x); });
  return out;
}
const sentencesJa = t => t.replace(/([。!?!?])/g, '$1\n').split('\n').map(s => s.trim()).filter(Boolean);
const sentencesEn = t => t.replace(/\b([ap])\.m\./gi, '$1m').replace(/([.!?])\s+/g, '$1\n').split('\n').map(s => s.trim()).filter(Boolean);
function checkPA(eff, gen, edited = {}, open = {}) {
  const out = [], warn = msg => out.push({ lv: 'warn', msg }), info = msg => out.push({ lv: 'info', msg });
  const P2 = { ja: eff.ja.map(p => toText([p])), en: eff.en.map(p => toText([p])) };
  const all = { ja: P2.ja.join('\n'), en: P2.en.join(' ') };
  const sent = { ja: sentencesJa(all.ja), en: sentencesEn(all.en) };
  // 同じ文が2回
  ['ja', 'en'].forEach(l => {
    const seen = new Map();
    sent[l].filter(s => s.length >= 4).forEach(s => seen.set(s, (seen.get(s) || 0) + 1));
    seen.forEach((n, s) => { if (n > 1) warn(`${LANG_NAME[l]}で同じ文が${n}回あります:「${cut(s)}」`); });
  });
  // ハンドブックの注意:「ちょうど」と「頃」、「約」と「ぐらい」を重ねない
  sent.ja.forEach(s => {
    if (/約\s*[\d０-９一二三四五六七八九十〔]/.test(s) && /(ぐらい|くらい|ほど|程)/.test(s)) warn(`「約」と「ぐらい・ほど」が重なっています:「${cut(s)}」`);
    if (/ちょうど/.test(s) && /(頃|ごろ)/.test(s)) warn(`「ちょうど」と「頃」が重なっています:「${cut(s)}」`);
  });
  // 時刻の言い方の混在(午後3時 と 15時、3:00 p.m. と 15:00)
  if (/午[前後]\s*\d{1,2}時/.test(zen2han(all.ja)) && /(^|[^午前後\d])(1[3-9]|2[0-3])時(?!間)/.test(zen2han(all.ja))) warn('日本語で時刻の言い方(「午後3時」と「15時」)が混ざっています');
  if (/\b\d{1,2}(:\d{2})?\s?[ap]\.m\./i.test(all.en) && /\b(1[3-9]|2[0-3]):\d{2}\b/.test(all.en)) warn('英語で時刻の言い方(3:00 p.m. と 15:00)が混ざっています');
  // 手直しで数字を変えたのに、もう一方の言語の数字がそのまま
  ['ja', 'en'].forEach(l => {
    if (!edited[l]) return;
    const o = l === 'ja' ? 'en' : 'ja', now = nums(all[l]), was = nums(toText(gen[l]));
    const added = numDiff(now, was), removed = numDiff(was, now);
    if (!added.length && !removed.length) return;
    const oNow = nums(all[o]), oWas = nums(toText(gen[o]));
    if (!numDiff(oNow, oWas).length && !numDiff(oWas, oNow).length) warn(`${LANG_NAME[l]}の数字を変えました(${removed.join('・') || 'なし'} → ${added.join('・') || 'なし'})。${LANG_NAME[o]}も合っていますか?`);
  });
  // 未入力(〇〇)。冒頭(便名・機長名)は毎回なので数えない
  const body = l => P2[l].slice(P2[l][0] && P2[l][0] === open[l] ? 1 : 0).join('\n');
  const bj = blankCount(body('ja')), be = blankCount(body('en'));
  if (bj || be) info(`本文に未入力(〇〇)が${[bj && `日本語${bj}か所`, be && `英語${be}か所`].filter(Boolean).join('・')}あります。読むときに補ってください`);
  // 長さ(1分を超えるもの)
  const sj = all.ja.replace(/\s/g, '').length / 5, se = all.en.split(/\s+/).filter(Boolean).length / 2.4;
  if (sj > 60) info(`日本語が約${Math.round(sj / 5) * 5}秒と長めです`);
  if (se > 60) info(`英語が約${Math.round(se / 5) * 5}秒と長めです`);
  // 片方の言語が空
  if (all.ja.trim() && !all.en.trim()) info('英語の文がありません');
  if (all.en.trim() && !all.ja.trim()) info('日本語の文がありません');
  return out;
}

/* ---------- 表示用の変換 ---------- */
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FXRE = /⁅([^¦⁆]*)¦([^⁆]*)⁆/g;
const toHtml = (paras, fx = true) => paras.map(p => '<p>' + esc(p)
  .replace(FXRE, (m, a, b) => (fx ? `<span class="fix" data-o="${b}">${a}</span>` : a))
  .replace(/⟦(.*?)⟧/g, '<span class="ph">$1</span>') + '</p>').join('');
const toText = paras => paras.map(p => p.replace(FXRE, '$1').replace(/⟦(.*?)⟧/g, '〔$1〕')).join('\n\n');
