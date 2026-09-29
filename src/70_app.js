/* =====================================================================
   画面
   ===================================================================== */
/* ---------- 入力欄 ---------- */
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v);
  }
  kids.flat().forEach(c => c != null && c !== false && n.append(c));
  return n;
};

/* ---------- アイコン(線画) ---------- */
const SVG = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICONS = {
  pre: SVG('<path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z"/>'),
  air: SVG('<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'),
  arr: SVG('<path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1l-1.18.15c-.47.06-.95-.02-1.37-.24L4.29 11.15a2 2 0 0 1-.52-.38Z"/>'),
  emg: SVG('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  check: SVG('<path d="M20 6 9 17l-5-5"/>'),
  x: SVG('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  reset: SVG('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'),
  info: SVG('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
  sun: SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  moon: SVG('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  copy: SVG('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  expand: SVG('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>'),
  sliders: SVG('<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>'),
  chev: SVG('<path d="m6 9 6 6 6-6"/>'),
  down: SVG('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
  up: SVG('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>'),
  updown: SVG('<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>'),
  megaphone: SVG('<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>'),
  search: SVG('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  free: SVG('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
  plus: SVG('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  left: SVG('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),
  book: SVG('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
};
const ic = name => { const s = el('span', { class: 'ic' }); s.innerHTML = ICONS[name]; return s; };

function aptOptions(sel, blank) {
  if (blank) sel.append(el('option', { value: '' }, '— 選択 —'));
  const lab = a => `${a[0]}  ${a[1]}${a[2] ? `(${a[2]})` : ''}`;
  sel.append(el('optgroup', { label: '国内' }, AIRPORTS_DOM.map(a => el('option', { value: a[0] }, lab(a)))));
  sel.append(el('optgroup', { label: '国際' }, AIRPORTS_INT.map(a => el('option', { value: a[0] }, lab(a)))));
  sel.append(el('option', { value: '__' }, 'その他(手入力)'));
}
function buildFields(container, fields, vals, onChange) {
  const shows = [];
  const refresh = () => shows.forEach(([n, fn]) => (n.hidden = !fn(vals)));
  const change = k => { refresh(); onChange(k); };
  const set = (k, val) => { vals[k] = val; change(k); };
  const txt = (k, ph, lang) => el('input', { type: 'text', lang, autocapitalize: lang === 'en' ? 'off' : null, placeholder: ph || '', value: vals[k] || '', oninput: e => set(k, e.target.value) });
  const mk = f => {
    const wrap = el('div', { class: 'field' });
    if (f.show) shows.push([wrap, f.show]);
    const lbl = f.label ? el('div', { class: 'lbl' }, f.label) : '';   // append(null) は「null」と表示されるので空文字
    switch (f.t) {
      case 'row': {
        const r = el('div', { class: 'row2' });
        f.items.forEach(it => r.append(mk(it)));
        wrap.append(r); break;
      }
      case 'text': wrap.append(lbl, txt(f.k, f.ph)); break;
      case 'text2': wrap.append(lbl, el('div', { class: 'row2' }, txt(f.k + 'Ja', f.ph[0], 'ja'), txt(f.k + 'En', f.ph[1], 'en'))); break;
      case 'num': {
        const i = el('input', { type: 'text', inputmode: f.neg ? 'text' : 'numeric', value: vals[f.k] ?? '', oninput: e => {
          const t = e.target.value.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[－ー−]/g, '-').replace(f.neg ? /[^0-9-]/g : /[^0-9]/g, '');
          if (t !== e.target.value) e.target.value = t;
          set(f.k, t);
        } });
        wrap.append(lbl, el('div', { class: 'affix' }, i, f.unit ? el('span', { class: 'unit' }, f.unit) : null));
        if (f.hint) wrap.append(el('div', { class: 'hint' }, f.hint));
        break;
      }
      case 'time': {
        const i = el('input', { type: 'time', value: vals[f.k] || '', oninput: e => set(f.k, e.target.value) });
        wrap.append(lbl, el('div', { class: 'timebox' }, i, el('button', { class: 'icon-btn', type: 'button', 'aria-label': '時刻をクリア', onclick: () => { i.value = ''; set(f.k, ''); } }, ic('x'))));
        break;
      }
      case 'sel': {
        const s = el('select', { onchange: e => set(f.k, e.target.value) }, f.opts.map(([v, l]) => el('option', { value: v }, l)));
        if (vals[f.k] === undefined) vals[f.k] = f.opts[0][0];
        s.value = vals[f.k];
        wrap.append(lbl, s); break;
      }
      case 'seg': case 'chips': {
        const multi = f.t === 'chips';
        if (multi && !Array.isArray(vals[f.k])) vals[f.k] = [];
        if (!multi && vals[f.k] === undefined) vals[f.k] = f.opts[0][0];
        // 1つ選ぶ → 区切りボタン、複数選ぶ → ピル
        const box = el('div', { class: multi ? 'pills' : 'seg', role: 'group', 'aria-label': f.label || '' });
        const paint = () => box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', multi ? vals[f.k].includes(b.dataset.v) : vals[f.k] === b.dataset.v));
        f.opts.forEach(([v, l]) => box.append(el('button', { class: multi ? 'pill' : '', type: 'button', 'data-v': v, onclick: () => {
          if (multi) { const a = vals[f.k]; vals[f.k] = a.includes(v) ? a.filter(z => z !== v) : [...a, v]; } else vals[f.k] = v;
          paint(); change(f.k);
        } }, multi ? ic('check') : null, l)));
        paint(); wrap.append(lbl, box); break;
      }
      case 'chk': {
        const c = el('input', { type: 'checkbox', class: 'switch', role: 'switch', onchange: e => set(f.k, e.target.checked) });
        c.checked = !!vals[f.k];
        wrap.append(el('label', { class: 'switch-row' }, el('span', { class: 'txt' }, f.label), c)); break;
      }
      case 'flightno': {   // 便名(数字だけ。前に JL を表示)
        const i = el('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: '4', placeholder: f.ph || '', value: vals[f.k] || '', onblur: () => f.blur && f.blur(), oninput: e => {
          const t = e.target.value.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/\D/g, '').slice(0, 4);
          if (t !== e.target.value) e.target.value = t;
          set(f.k, t);
        } });
        wrap.append(lbl, el('div', { class: 'affix pre' }, el('span', { class: 'unit pre' }, 'JL'), i), el('div', { class: 'hint fn-hint', id: 'fnHint' }));
        break;
      }
      case 'airport': {
        const custom = el('div', { class: 'row2', style: 'margin-top:8px' }, txt(f.k + 'Ja', '空港名(日本語)', 'ja'), txt(f.k + 'En', 'Airport (English)', 'en'));
        const s = el('select', { 'data-k': f.k, onchange: e => { custom.hidden = e.target.value !== '__'; set(f.k, e.target.value); } });
        aptOptions(s, !f.noBlank);
        s.value = vals[f.k] || '';
        custom.hidden = vals[f.k] !== '__';
        wrap.append(lbl, s, custom); break;
      }
      case 'landmark': {
        const memo = el('div', { class: 'hint' });
        const custom = el('div', { class: 'row2', style: 'margin-top:8px' }, txt('lmJa', '見えるもの(日本語)', 'ja'), txt('lmEn', 'Landmark (English)', 'en'));
        const item = el('select', { onchange: e => { vals.lmI = e.target.value; sync(); change('lm'); } });
        const reg = el('select', { onchange: e => { vals.lmR = e.target.value; vals.lmI = ''; fill(); sync(); change('lm'); } },
          el('option', { value: '' }, '— 地域 —'), LANDMARKS.map((r, i) => el('option', { value: String(i) }, r.r)));
        const fill = () => {
          item.innerHTML = '';
          item.append(el('option', { value: '' }, '— 選択 —'));
          const r = LANDMARKS[vals.lmR];
          if (r) r.items.forEach((it, i) => item.append(el('option', { value: String(i) }, it[0])));
          item.append(el('option', { value: '__' }, 'その他(手入力)'));
          item.value = vals.lmI ?? '';
        };
        const sync = () => {
          custom.hidden = vals.lmI !== '__';
          const r = LANDMARKS[vals.lmR], it = r && r.items[vals.lmI];
          memo.textContent = it && it[4] ? `メモ:${it[4]}` : '';
          memo.hidden = !memo.textContent;
        };
        reg.value = vals.lmR ?? '';
        fill(); sync();
        wrap.append(lbl, el('div', { class: 'row2' }, reg, item), custom, memo); break;
      }
    }
    return wrap;
  };
  fields.forEach(f => container.append(mk(f)));
  refresh();
}

const FLIGHT_FIELDS = [
  { k: 'fn', t: 'flightno', label: '便名', ph: '例:901', blur: () => { fnBase = null; } },
  { k: 'orig', t: 'airport', label: '出発地', noBlank: true },
  { k: 'dest', t: 'airport', label: '目的地', noBlank: true },
  { t: 'row', items: [
    { k: 'greet', t: 'sel', label: '挨拶の言葉', opts: [['auto', '自動(時刻から)'], ['m', 'おはようございます'], ['a', 'こんにちは'], ['e', 'こんばんは']] },
    { k: 'clock', t: 'sel', label: '時刻の言い方', opts: [['12', '午後3時45分 / 3:45 p.m.'], ['24', '15時45分 / 15:45']] },
  ] },
  { k: 'nick', t: 'chk', label: '愛称のある空港は愛称で呼ぶ(例:阿蘇くまもと空港)' },
  { k: 'lt', t: 'chk', label: '時差あり(到着時刻に「現地時間」を付ける)' },
];

/* ---------- 便名 → 出発地・目的地(使いながら覚える) ---------- */
// 登録済みの便名なら出発地と目的地を入れる。未登録なら、空港を選んだときにその便名の区間として覚える
// fnBase:便名を打っている途中で自動で入れる前の区間。打ち終わる前に未登録の番号になったら元に戻す
// (例:JL90 が登録済みで JL901 が未登録のとき、途中の JL90 の区間が残らないように)。便名の欄を離れたら確定
let fnMsg = '', fnBase = null;
function setRoute(orig, dest) {
  Object.assign(S.flight, { orig, dest });
  ['orig', 'dest'].forEach(k => { const sel = $(`#flightForm select[data-k="${k}"]`); if (sel) { sel.value = S.flight[k]; sel.nextElementSibling.hidden = S.flight[k] !== '__'; } });
}
function applyFlightNo() {
  fnMsg = '';
  const f = routeFor(S.flight.fn);
  if (f) { if (!fnBase) fnBase = [S.flight.orig, S.flight.dest]; setRoute(...f.r); }
  else if (fnBase) { setRoute(...fnBase); fnBase = null; }
}
// 空港を選び直したら、その便名の区間として覚える(時刻表と同じなら覚えず、時刻表どおりに戻す)
function learnRoute() {
  fnBase = null;   // 手で選んだ区間が基準になる
  const k = fnKey(S.flight.fn), { orig, dest } = S.flight, old = S.routes[k], tt = timetableRoute(S.flight.fn);
  if (!k || !isCode(orig) || !isCode(dest) || orig === dest || (old && old[0] === orig && old[1] === dest)) return;
  if (tt && tt.r[0] === orig && tt.r[1] === dest) {
    if (old) { delete S.routes[k]; fnMsg = `${fnLabel(k)} を時刻表どおりの区間に戻しました`; }
    return;
  }
  S.routes[k] = [orig, dest];
  fnMsg = `${fnLabel(k)} を「${routeText(S.routes[k])}」で${old ? '更新' : '登録'}しました${tt ? '(時刻表より優先)' : ''}`;
}
function flightChange(k) {
  if (k === 'fn') applyFlightNo();
  else if (k === 'orig' || k === 'dest') learnRoute();
  paintFlightHint(); paintRoutes(); render();
}
function paintFlightHint() {
  const h = $('#fnHint'), k = fnKey(S.flight.fn), f = k && routeFor(S.flight.fn);
  if (!h) return;
  h.replaceChildren(...(!k ? [`便名を入れると、JALの時刻表(〜${mdText(ttLast())})から出発地と目的地が自動で入ります。`]
    : fnMsg ? [ic('check'), fnMsg]
    : f && f.src === 'user' ? [ic('check'), `自分で登録した区間を入れました:${routeText(f.r)}`]
    : f ? [ic('check'), `JAL時刻表(${mdText(f.t.from)}〜${mdText(f.t.to)})より:${routeText(f.r)}`, f.inPeriod ? '' : el('span', { class: 'warn' }, '※今日は時刻表の期間外です')]
    : ['時刻表にない便名です。出発地と目的地を選ぶと、次からこの便名で自動で入ります。',
      isCode(S.flight.orig) && isCode(S.flight.dest) && S.flight.orig !== S.flight.dest
        ? el('button', { type: 'button', class: 'tbtn', onclick: () => { learnRoute(); paintFlightHint(); paintRoutes(); save(); } }, `今の区間(${S.flight.orig} → ${S.flight.dest})で登録`) : '']));
}
// 登録した便名の一覧(削除・まとめて登録・コピー)
function paintRoutes() {
  const box = $('#routeBox'), keys = Object.keys(S.routes).sort((a, b) => a - b);
  if (!box) return;
  box.querySelector('summary .t').textContent = `自分で登録・修正した便名(${keys.length}件)`;
  const last = ttLast(), stale = ymd(new Date()) > last;
  box.querySelector('.tt-info').replaceChildren(
    `JALの時刻表を内蔵しています(${JAL_TT.map(t => `${t.kind} ${mdText(t.from)}〜${mdText(t.to)}:${t.n}便`).join('、')})。時刻表と違う区間を選ぶと、その便名はここに登録され、時刻表より優先されます。`,
    stale ? el('span', { class: 'warn' }, ` 内蔵の時刻表の期間(〜${mdText(last)})を過ぎています。時刻表の更新が必要です。`) : '');
  box.querySelector('.route-list').replaceChildren(...(keys.length ? keys.map(k => el('li', {},
    el('span', { class: 'fn' }, fnLabel(k)), el('span', { class: 'rt' }, routeText(S.routes[k])),
    el('button', { type: 'button', class: 'icon-btn', 'aria-label': `${fnLabel(k)} を削除`, onclick: () => { delete S.routes[k]; fnMsg = ''; paintRoutes(); paintFlightHint(); save(); } }, ic('x'))))
    : [el('li', { class: 'none' }, 'まだありません。')]));
}
function routeBox() {
  const ta = el('textarea', { rows: '3', placeholder: '1行に1便ずつ(例:JL901 HND OKA)', autocapitalize: 'characters', spellcheck: 'false' });
  return el('details', { class: 'notes', id: 'routeBox' },
    el('summary', {}, ic('info'), el('span', { class: 't' })),
    el('div', { class: 'ctt' },
      el('p', { class: 'tt-info' }),
      el('ul', { class: 'route-list' }),
      el('div', { class: 'lbl-s' }, 'まとめて登録'), ta,
      el('div', { class: 'route-actions' },
        el('button', { type: 'button', class: 'tbtn', onclick: () => {
          const r = importRoutes(ta.value);
          if (!r.n && !r.bad.length) return toast('登録する便を入力してください');
          ta.value = r.bad.join('\n');   // 読めなかった行だけ残す
          applyFlightNo(); paintFlightHint(); paintRoutes(); render();
          toast(r.bad.length ? `${r.n}便を登録しました(${r.bad.length}行は読めませんでした)` : `${r.n}便を登録しました`, 3000);
        } }, 'まとめて登録'),
        el('button', { type: 'button', class: 'tbtn', onclick: async () => {
          const t = exportRoutes();
          if (!t) return toast('登録した便名はありません');
          try { await navigator.clipboard.writeText(t); } catch (e) { const x = el('textarea'); x.value = t; document.body.append(x); x.select(); document.execCommand('copy'); x.remove(); }
          toast('一覧をコピーしました(まとめて登録にそのまま貼り付けできます)', 3000);
        } }, ic('copy'), '一覧をコピー'))));
}

/* ---------- 描画 ---------- */
let current = null;
// 選んでいる数(自由作成は選んだ文の数)
const count = tm => (tm === 'free' ? S.free.items.length : selected(tm).length);
// All clear:すべてのタイミングの選択(自由作成の文も)と「追加で伝えたいこと」を消す。入力した時刻などは残す
const anySelected = () => TIMINGS.some(([t]) => count(t)) || Object.values(S.extra).some(x => ok(x.xJa) || ok(x.xEn));
function allClear() {
  if (!anySelected() || !confirm('出発前・上空・到着後・緊急・自由作成の選択と「追加で伝えたいこと」をすべて消しますか?\n(入力した時刻などの内容は残ります)')) return;
  Object.keys(S.sel).forEach(t => (S.sel[t] = []));
  S.free.items = [];
  S.extra = {};
  S.listOpen = true; libAt = null; clearSearch();
  paintAll(); toast('すべての選択をクリアしました');
}
function paintTabs() {
  const box = $('#tabs'); box.innerHTML = '';
  TIMINGS.forEach(([id, l]) => {
    const n = count(id);
    box.append(el('button', { type: 'button', class: id === 'emg' ? 'danger' : '', 'aria-pressed': S.tm === id, onclick: () => { S.tm = id; clearSearch(); if (!count(id)) S.listOpen = true; paintAll(); } },
      ic(id), el('span', {}, l), n ? el('span', { class: 'cnt' }, String(n)) : null));
  });
}
function toggleSit(id) {
  const a = S.sel[S.tm], i = a.indexOf(id);
  if (i >= 0) a.splice(i, 1); else a.push(id);
  paintAll();
}
/* ---------- よく使う組み合わせ ---------- */
const TIMING_LABEL = Object.fromEntries(TIMINGS);
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
// 自由作成の組み合わせは、選んだ文(選択肢だけ。時刻などの入力値は持たない)と冒頭を保存する
const pieceOf = ({ id, tm, kind, key, o, sec }) => ({ id, tm, kind, key, o, sec });
const pieceJson = items => JSON.stringify(items.map(pieceOf));
const presetOn = p => (p.tm === 'free'
  ? S.tm === 'free' && S.free.open === p.open && pieceJson(S.free.items) === pieceJson(p.items || [])
  : S.tm === p.tm && sameSet(selected(p.tm), p.ids));
let presetEdit = false;
function paintPresets() {
  const box = $('#presets'); box.innerHTML = '';
  S.presets.forEach((p, i) => box.append(el('button', {
    type: 'button', class: 'preset' + (p.tm === 'emg' ? ' danger' : ''),
    'aria-pressed': !presetEdit && presetOn(p),
    onclick: () => (presetEdit ? deletePreset(i) : applyPreset(p)),
  }, el('span', { class: 'tm' }, TIMING_LABEL[p.tm]), p.name, presetEdit ? ic('x') : null)));
  if (!presetEdit) box.append(el('button', { type: 'button', class: 'preset sub', onclick: savePreset }, '＋ 今の選択を保存'));
  if (S.presets.length) box.append(el('button', { type: 'button', class: 'preset sub', 'aria-pressed': presetEdit, onclick: () => { presetEdit = !presetEdit; paintPresets(); } }, presetEdit ? '完了' : '編集'));
}
function applyPreset(p) {
  S.tm = p.tm;
  if (p.tm === 'free') S.free = { open: p.open || 'auto', items: JSON.parse(pieceJson(p.items || [])) };
  else S.sel[p.tm] = p.ids.filter(id => sit(id) && sit(id).t.includes(p.tm));
  S.listOpen = false;   // 選び終わっているので一覧を閉じ、入力欄をすぐ見せる
  clearSearch();
  paintAll();
}
function savePreset() {
  const free = S.tm === 'free', ids = free ? [] : selected(S.tm);
  if (free ? !S.free.items.length : !ids.length) return toast(free ? '先に文を選んでください' : '先に状況を選んでください');
  const names = free ? [...new Set(S.free.items.map(p => pieceSource(p).split('・').pop()))] : ids.map(id => sit(id).label);
  const name = prompt('この組み合わせの名前', names.filter(Boolean).slice(0, 3).map(l => l.replace(/[((].*$/, '')).join('+'));
  if (!name || !name.trim()) return;
  S.presets.push(free ? { name: name.trim(), tm: 'free', open: S.free.open, items: JSON.parse(pieceJson(S.free.items)) } : { name: name.trim(), tm: S.tm, ids });
  paintPresets(); save(); toast('保存しました');
}
function deletePreset(i) {
  if (!confirm(`「${S.presets[i].name}」を削除しますか?`)) return;
  S.presets.splice(i, 1);
  if (!S.presets.length) presetEdit = false;
  paintPresets(); save();
}

/* ---------- 状況の検索(全タイミングから探す) ---------- */
// ラベル・グループ・選択肢のほか、言い換えでも見つかるようにする
const KEYWORDS = {
  boarding: 'ファーウェル 挨拶 出発準備', welcome: 'ウェルカム 挨拶 見どころ 景色', deplaneThanks: '降機 お礼 挨拶',
  flow: 'フロー 出発制限 離陸時刻 EDCT CTOT スロット', delay: '遅延 遅れ', tkoffDelay: '離陸待ち 順番 バードストライク',
  turb: 'タービュランス ベルトサイン シートベルト', arrDelay: '遅延 到着遅れ', holding: 'ホールディング 待機',
  nearLimit: 'マージナル ミニマム 視界 横風', ga: 'ゴーアラウンド ミストアプローチ 着陸やり直し',
  divert: 'ダイバート ダイバージョン 引き返し 目的地変更', thunder: 'ブロックイン スポット 駐機場',
  svcLimited: '機内サービス 飲み物', svcAdvance: '機内サービス 飲み物 悪天候 揺れ', gtbMech: 'GTB ランプリターン 故障', gtbOther: 'GTB ランプリターン', rto: '離陸中止 バードストライク', lowpass: 'LOW PASS タイヤ ギア 脚',
};
let query = '';
const kana = s => s.normalize('NFKC').toLowerCase().replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
function optionLabels(s) {
  const out = [], walk = fs => (fs || []).forEach(f => (f.t === 'row' ? walk(f.items) : f.opts && out.push(...f.opts.map(o => o[1]))));
  walk(s.fields);
  return out;
}
function clearSearch() { query = ''; $('#sitSearch').value = ''; $('#sitSearch').blur(); }
function paintSearch(box) {
  const q = kana(query.trim()), hits = [];
  TIMINGS.forEach(([tm, tl]) => SITS.filter(s => s.t.includes(tm)).forEach(s => {
    const direct = [s.label, grpOf(s, tm), KEYWORDS[s.id] || ''].some(t => kana(t).includes(q));
    const opts = optionLabels(s).filter(o => kana(o).includes(q));
    if (direct || opts.length) hits.push({ s, tm, tl, sub: direct ? '' : opts.slice(0, 3).join('・') });
  }));
  if (!hits.length) return box.append(el('div', { class: 'hint' }, '見つかりませんでした。別の言葉で探してください。'));
  box.append(el('div', { class: 'tiles' }, hits.map(h => {
    const on = S.sel[h.tm].includes(h.s.id);
    return el('button', { type: 'button', class: 'tile' + (h.tm === 'emg' ? ' danger' : ''), 'aria-pressed': on, onclick: () => {
      S.tm = h.tm;
      if (!on) S.sel[h.tm].push(h.s.id);
      clearSearch();
      paintAll();
    } }, el('span', { class: 'mark' }, on ? '✓' : ''), el('span', { class: 'tt' }, el('span', { class: 'tm' }, h.tl), h.s.label, h.sub ? el('small', {}, h.sub) : null));
  })));
}

/* ---------- 状況の一覧(全体を閉じる / グループごとに折りたたむ) ---------- */
function setListOpen(open) {
  S.listOpen = open;
  if (!open) clearSearch();
  paintSits(); save();
}
function toggleFold(tm, g) {
  const f = S.fold[tm] || (S.fold[tm] = []), i = f.indexOf(g);
  if (i >= 0) f.splice(i, 1); else f.push(g);
  paintSits(); save();
}
function paintSits() {
  const box = $('#sits'); box.innerHTML = '';
  const tm = S.tm, free = tm === 'free', sel = free ? [] : selected(tm);
  $('#step2').textContent = free ? '文を選ぶ' : '状況';
  $('#step2Sub').textContent = free ? 'タップで追加・もう一度で外す' : '複数選べます';
  $('#sitSearch').placeholder = free ? '文を探す(例:ベルト、到着時刻、お詫び)' : '状況を探す(例:雷、フロー、ダイバート)';
  $('#listToggle').replaceChildren(ic('chev'), S.listOpen ? '一覧を閉じる' : '一覧を開く');
  $('#listToggle').setAttribute('aria-expanded', S.listOpen);
  $('#sitSearch').parentElement.hidden = !S.listOpen;
  // 一覧を閉じているときは、選んだ状況だけを並べる(押すと一覧が開く)
  if (!S.listOpen) {
    const n = count(tm);
    box.append(el('div', { class: 'sel-summary', role: 'button', onclick: () => setListOpen(true) },
      free ? (n ? el('span', { class: 'chipsel' }, el('span', { class: 'n' }, String(n)), '文を選んでいます') : el('span', { class: 'hint' }, '文が選ばれていません。押すと一覧が開きます。'))
        : sel.length ? sel.map((id, i) => el('span', { class: 'chipsel' }, el('span', { class: 'n' }, String(i + 1)), sit(id).label))
        : el('span', { class: 'hint' }, '状況が選ばれていません。押すと一覧が開きます。')));
    return;
  }
  if (free) return paintLibrary(box);
  if (query.trim()) return paintSearch(box);
  const folded = S.fold[tm] || [];
  GROUP_ORDER[tm].forEach(g => {
    const items = SITS.filter(s => s.t.includes(tm) && grpOf(s, tm) === g);
    if (!items.length) return;
    const open = !folded.includes(g), n = items.filter(s => sel.includes(s.id)).length;
    box.append(el('button', { type: 'button', class: 'grp', 'aria-expanded': String(open), onclick: () => toggleFold(tm, g) },
      ic('chev'), g, n ? el('span', { class: 'gcnt' }, `${n}件選択中`) : null));
    if (!open) return;
    box.append(el('div', { class: 'tiles' }, items.map(s => {
      const i = sel.indexOf(s.id);   // 丸印の番号 = アナウンス文での順番
      return el('button', { type: 'button', class: 'tile' + (tm === 'emg' ? ' danger' : ''), 'aria-pressed': i >= 0, onclick: () => toggleSit(s.id) },
        el('span', { class: 'mark' }, i >= 0 ? String(i + 1) : ''), el('span', {}, s.label));
    })));
  });
}
/* ---------- 自由作成:② 文の一覧(状況 → 文)と ③ 組み立て ---------- */
let libAt = null;   // 開いている状況(`${タイミング}|${id}`)。null なら状況の一覧
// 選んだ文の出どころ(③の一覧に出す)
const pieceSource = p => { const s = sit(p.id); return s ? `${TIMING_LABEL[p.tm]}・${s.label}` : ''; };
const phHtml = paras => paras.map(p => esc(p).replace(FXRE, '$1').replace(/⟦(.*?)⟧/g, '<span class="ph">$1</span>')).join('<br>');
const usedSigs = () => new Set(S.free.items.map(resolvePiece).filter(Boolean).map(sigOf));
function togglePhrase(it, used) {
  if (used.has(it.sig)) {
    S.free.items = S.free.items.filter(p => { const b = resolvePiece(p); return !(b && sigOf(b) === it.sig); });
    toast('外しました');
  } else {
    insertPiece(pieceOf(it));
    toast('追加しました');
  }
  paintAll();
}
function phraseRow(it, used) {
  const on = used.has(it.sig), ja = el('span', { class: 'ja' }), en = el('span', { class: 'en', lang: 'en' });
  if (it.ja.length) ja.innerHTML = phHtml(it.ja); else ja.textContent = '(日本語なし)';
  if (it.en.length) en.innerHTML = phHtml(it.en); else en.textContent = '(英語なし)';
  return el('button', { type: 'button', class: 'phrase', 'aria-pressed': String(on), onclick: () => togglePhrase(it, used) },
    el('span', { class: 'mark' }, ic(on ? 'check' : 'plus')),
    el('span', { class: 'body' }, el('span', { class: 'top' }, el('span', { class: 'tag' }, SEC_LABEL[it.sec] || '本文'), it.note ? el('span', { class: 'note' }, it.note) : null), ja, en));
}
function paintLibrary(box) {
  const lib = phraseLibrary(), used = usedSigs(), q = kana(query.trim());
  // 検索:文そのもの・段の名前・状況の名前(言い換えを含む)から探す。同じ文は最初の1回だけ
  if (q) {
    const shown = new Set(), hits = [];
    lib.forEach(g => {
      const direct = [g.label, KEYWORDS[g.id] || ''].some(t => kana(t).includes(q));
      const items = g.items.filter(it => !shown.has(it.sig) && (direct || kana(plain(it.ja.join('') + ' ' + it.en.join(' ')) + ' ' + (SEC_LABEL[it.sec] || '')).includes(q)));
      items.forEach(it => shown.add(it.sig));
      if (items.length) hits.push({ g, items });
    });
    if (!hits.length) return box.append(el('div', { class: 'hint' }, '見つかりませんでした。別の言葉で探してください。'));
    hits.forEach(h => box.append(
      el('div', { class: 'lib-sub' }, el('span', { class: 'tm' }, TIMING_LABEL[h.g.tm]), h.g.label),
      el('div', { class: 'phrases' }, h.items.map(it => phraseRow(it, used)))));
    return;
  }
  // 状況を開いているときは、その状況の文を並べる
  const g = libAt && lib.find(x => `${x.tm}|${x.id}` === libAt);
  if (g) {
    box.append(el('div', { class: 'lib-head' },
      el('button', { type: 'button', class: 'tbtn', onclick: () => { libAt = null; paintSits(); } }, ic('left'), '状況の一覧'),
      el('span', { class: 'tt' }, el('span', { class: 'tm' }, TIMING_LABEL[g.tm]), g.label)),
      el('div', { class: 'phrases' }, g.items.map(it => phraseRow(it, used))));
    return;
  }
  libAt = null;
  const folded = S.fold.free || [];
  TIMINGS.forEach(([tm, tl]) => {
    const gs = lib.filter(x => x.tm === tm);
    if (!gs.length) return;
    const open = !folded.includes(tm), n = new Set(gs.flatMap(x => x.items.filter(it => used.has(it.sig)).map(it => it.sig))).size;
    box.append(el('button', { type: 'button', class: 'grp', 'aria-expanded': String(open), onclick: () => toggleFold('free', tm) },
      ic('chev'), tl, n ? el('span', { class: 'gcnt' }, `${n}文を選択中`) : null));
    if (!open) return;
    box.append(el('div', { class: 'tiles' }, gs.map(x => {
      const k = x.items.filter(it => used.has(it.sig)).length;   // 丸印の数字 = この状況から選んだ文の数
      return el('button', { type: 'button', class: 'tile' + (tm === 'emg' ? ' danger' : ''), 'aria-pressed': String(k > 0), onclick: () => {
        libAt = `${x.tm}|${x.id}`;
        paintSits();
        $('#step2').scrollIntoView({ block: 'nearest' });
      } }, el('span', { class: 'mark' }, k ? String(k) : ''), el('span', { class: 'tt' }, x.label, el('small', {}, `${x.items.length}文`)));
    })));
  });
}
function extraCard(tm, sub) {
  const bd = el('div', { class: 'bd' });
  buildFields(bd, [{ k: 'x', t: 'text2', ph: ['日本語で入力', 'English'] }], S.extra[tm] || (S.extra[tm] = {}), render);
  return el('section', { class: 'fcard panel' }, el('div', { class: 'hd' }, el('div', { class: 'ttl' }, '追加で伝えたいこと', el('small', {}, sub))), bd);
}
function paintFreeForms(box) {
  const F = S.free, last = F.items.length - 1;
  box.append(el('div', { class: 'step' }, el('span', { class: 'n' }, '3'), '組み立て', el('small', {}, 'アナウンス文の順に並んでいます')));
  const b0 = el('div', { class: 'bd' });
  buildFields(b0, [{ k: 'open', t: 'seg', opts: [['auto', '自動'], ['fixed', 'いつもの挨拶'], ['cockpit', '操縦室より'], ['none', 'なし']] }], F, () => { paintPresets(); render(); });
  b0.querySelector('.seg').setAttribute('aria-label', '冒頭');
  box.append(el('section', { class: 'fcard panel' },
    el('div', { class: 'hd' }, el('div', { class: 'ttl' }, '冒頭', el('small', {}, '自動:搭乗中・上空での挨拶の本文を選ぶと「いつもの挨拶」、それ以外は「操縦室より…」'))), b0));
  const move = (i, d) => { const a = F.items; [a[i], a[i + d]] = [a[i + d], a[i]]; paintAll(); };
  const list = el('ol', { class: 'freelist' }, F.items.map((p, i) => {
    const b = resolvePiece(p), text = b && (b.ja.join('') || b.en.join(' '));
    return el('li', { class: b ? '' : 'broken' },
      el('div', { class: 'txt' },
        el('div', { class: 'meta' }, el('span', { class: 'tag' }, b ? SEC_LABEL[b.sec] || '本文' : '—'), el('span', { class: 'src' }, pieceSource(p))),
        el('div', { class: 'ja' }, b ? plain(text) : 'この文は今の入力では作れません。×で外してください。')),
      el('button', { type: 'button', class: 'icon-btn', 'aria-label': '上へ', disabled: i === 0 ? '' : null, onclick: () => move(i, -1) }, ic('up')),
      el('button', { type: 'button', class: 'icon-btn', 'aria-label': '下へ', disabled: i === last ? '' : null, onclick: () => move(i, 1) }, ic('down')),
      el('button', { type: 'button', class: 'icon-btn', 'aria-label': '外す', onclick: () => { F.items.splice(i, 1); paintAll(); } }, ic('x')));
  }));
  box.append(el('section', { class: 'fcard panel' },
    el('div', { class: 'hd' }, el('div', { class: 'ttl' }, `選んだ文(${F.items.length})`, el('small', {}, '好みの構成の位置に入ります。↑↓で入れ替え')),
      F.items.length > 1 ? el('button', { type: 'button', class: 'tbtn', onclick: () => { sortFree(); paintAll(); toast('標準の順に並べました'); } }, ic('reset'), '標準の順') : null),
    F.items.length ? list : el('div', { class: 'bd' }, el('div', { class: 'hint' }, '②の一覧で文をタップすると、ここに入ります。'))));
  box.append(extraCard('free', '任意・最後の締めの言葉の前に入ります'));
}
function paintForms() {
  const box = $('#forms'); box.innerHTML = '';
  const tm = S.tm, ids = selected(tm);
  if (tm === 'free') return paintFreeForms(box);
  if (!ids.length) return;
  box.append(el('div', { class: 'step' }, el('span', { class: 'n' }, '3'), '入力', el('small', {}, 'アナウンス文の順に並んでいます')));
  ids.forEach((id, i) => {
    const s = sit(id), bd = el('div', { class: 'bd' });
    box.append(el('section', { class: 'fcard panel' + (tm === 'emg' ? ' danger' : '') },
      el('div', { class: 'hd' }, el('span', { class: 'num' }, String(i + 1)), el('div', { class: 'ttl' }, s.label, el('small', {}, s.src || '')),
        el('button', { type: 'button', class: 'icon-btn', title: '入力を初期状態に戻す', 'aria-label': '入力を初期状態に戻す', onclick: () => { delete S.v[id]; paintForms(); render(); } }, ic('reset')),
        el('button', { type: 'button', class: 'icon-btn', title: '選択を外す', 'aria-label': '選択を外す', onclick: () => toggleSit(id) }, ic('x'))),
      bd));
    if (s.fields && s.fields.length) buildFields(bd, s.fields, vals(id), render);
    else bd.append(el('div', { class: 'hint' }, '入力する項目はありません。'));
    if (s.notes && s.notes.length) bd.append(el('details', { class: 'notes' }, el('summary', {}, ic('info'), `ハンドブックの注意(${s.notes.length})`), el('div', { class: 'ctt' }, s.notes.map(n => el('p', {}, n)))));
  });
  box.append(extraCard(tm, '任意・締めの言葉の前に入ります'));
}
function render() {
  current = compose(S.tm);
  $('#empty').hidden = !!current;
  $('#outCards').hidden = !current;
  $('#outCards').classList.toggle('show-fix', S.fix);
  $('#fixBtn').setAttribute('aria-pressed', S.fix);
  $('#orderBtn').setAttribute('aria-pressed', S.reorder);
  $('#orderBtn').hidden = S.tm === 'free';   // 自由作成は ③ で並べ替える
  $('#allClear').disabled = !anySelected();
  $('#emptyMsg').textContent = S.tm === 'free' ? '文を選ぶと、ここにアナウンス文ができます' : '状況を選ぶと、ここにアナウンス文ができます';
  paintOrder();
  if (current) {
    $('#outJa').innerHTML = toHtml(current.ja);
    $('#outEn').innerHTML = toHtml(current.en);
    const jl = toText(current.ja).replace(/\s/g, '').length, ew = toText(current.en).split(/\s+/).filter(Boolean).length;
    $('#jaMeta').textContent = `約${Math.max(5, Math.round(jl / 5 / 5) * 5)}秒`;
    $('#enMeta').textContent = `about ${Math.max(5, Math.round(ew / 2.4 / 5) * 5)} sec`;
  }
  const route = `${S.flight.fn ? `JL${S.flight.fn}  ` : ''}${ORIG().city} → ${DEST().city}`;
  $('#summary').textContent = route;
  $('#setSub').textContent = route;
  updateFab();
  if ($('#reader').classList.contains('open')) paintReader();
  save();
}
// 並べ替え:ブロック(日本語と英語の組)ごとに ↑↓ で入れ替える。冒頭と締めは固定
const SEC_LABEL = { main: '本文', delay: '遅れの理由', time: '飛行時間', wx: '気象情報', route: '航路上の天候', belt: 'ベルト', svc: 'サービス', close: '締め', extra: '追加' };
const plain = p => p.replace(FXRE, '$1').replace(/⟦(.*?)⟧/g, '$1');
function paintOrder() {
  const box = $('#orderPanel');
  box.hidden = !S.reorder || !current || S.tm === 'free';
  if (box.hidden) return;
  const keys = current.blocks.map(b => b.key), last = keys.length - 1;
  const move = (i, d) => {
    const k = keys.slice();
    [k[i], k[i + d]] = [k[i + d], k[i]];
    S.order[orderKey(S.tm)] = k;
    render();
  };
  const row = (tag, text, i) => el('li', { class: i === undefined ? 'fixed' : '' },
    el('span', { class: 'tag' }, tag), el('span', { class: 'txt' }, plain(text)),
    i === undefined ? null : [
      el('button', { type: 'button', class: 'icon-btn', 'aria-label': '上へ', disabled: i === 0 ? '' : null, onclick: () => move(i, -1) }, ic('up')),
      el('button', { type: 'button', class: 'icon-btn', 'aria-label': '下へ', disabled: i === last ? '' : null, onclick: () => move(i, 1) }, ic('down')),
    ]);
  box.replaceChildren(
    el('div', { class: 'head' }, '文の順番', el('span', { class: 'meta' }, '日本語と英語が一緒に動きます'),
      el('button', { type: 'button', class: 'tbtn', onclick: () => { delete S.order[orderKey(S.tm)]; render(); toast('標準の順番に戻しました'); } }, ic('reset'), '元に戻す')),
    el('ol', {},
      row('冒頭', current.open.ja),
      current.blocks.map((b, i) => row(SEC_LABEL[b.sec] || '本文', b.ja[0] || b.en[0] || '', i)),
      current.closeJa ? row('締め', current.closeJa) : null));
}

// 1列表示のとき、アナウンス文が画面外なら「アナウンス文へ」ボタンを出す
let outVisible = false;
function updateFab() { $('#fab').hidden = !current || outVisible; }
function paintAll() { paintPresets(); paintTabs(); paintSits(); paintForms(); render(); }

function paintReader() {
  const m = S.reader, parts = [];
  if (!current) { $('#readerBody').innerHTML = ''; return; }
  if (m !== 'en') parts.push(`<div lang="ja">${toHtml(current.ja, false)}</div>`);
  if (m !== 'ja') parts.push(`<div lang="en">${toHtml(current.en, false)}</div>`);
  $('#readerBody').innerHTML = parts.join('<hr>');
  [['ja', '#rJa'], ['en', '#rEn'], ['both', '#rBoth']].forEach(([k, q]) => $(q).setAttribute('aria-pressed', m === k));
}
/* ---------- 外資系のフレーズ集(参考として見るだけ。アナウンス文には入れない) ---------- */
let pbQuery = '';
function paintPhrasebook() {
  const q = kana(pbQuery.trim());
  const secs = PHRASES.map(c => ({ c, items: c.items.map(it => ({ it, t: phraseText(it) }))
    .filter(({ it, t }) => !q || kana(plain(`${t.en} ${t.ja} ${it.note || ''} ${c.label}`)).includes(q)) })).filter(x => x.items.length);
  // 分類のボタン(押すとその分類へ移動)
  $('#pbCats').replaceChildren(...secs.map(({ c, items }) => el('button', { type: 'button', class: 'pill', onclick: () => $('#pb-' + c.id).scrollIntoView({ block: 'start', behavior: 'smooth' }) },
    c.label, el('span', { class: 'n' }, String(items.length)))));
  $('#pbBody').replaceChildren(...(secs.length ? secs.map(({ c, items }) => el('section', { class: 'pb-sec', id: 'pb-' + c.id }, el('h3', {}, c.label),
    items.map(({ it, t }) => {
      const en = el('div', { class: 'en', lang: 'en' }), ja = el('div', { class: 'ja' });
      en.innerHTML = phHtml([t.en]); ja.innerHTML = phHtml([t.ja]);
      return el('div', { class: 'pb-item' }, en, ja, it.note ? el('span', { class: 'note' }, it.note) : null);
    })))
    : [el('p', { class: 'hint pb-none' }, '見つかりませんでした。別の言葉で探してください。')]));
}
function applyLook() {
  document.documentElement.dataset.theme = S.theme;
  document.documentElement.style.setProperty('--pa-size', S.font + 'px');
  $('#themeBtn').replaceChildren(ic(S.theme === 'dark' ? 'moon' : 'sun'));
}
let toastTimer;
function toast(t, ms = 1600) {
  const n = $('#toast'); n.textContent = t; n.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => n.classList.remove('show'), ms);
}

/* ---------- 初期化 ---------- */
// Web で公開した版(https)では、オフラインでも開けるようにキャッシュする。ファイルを直接開いたときは何もしない
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
document.querySelectorAll('[data-ic]').forEach(n => { n.classList.add('ic'); n.innerHTML = ICONS[n.dataset.ic]; });
buildFields($('#flightForm'), FLIGHT_FIELDS, S.flight, flightChange);
$('#flightForm').append(routeBox());
paintRoutes(); paintFlightHint();
if (firstRun) $('#flightBox').open = true;
applyLook();
paintAll();
if ('IntersectionObserver' in window) {
  new IntersectionObserver(es => { outVisible = es[0].isIntersecting; updateFab(); }, { threshold: 0.1 }).observe($('#outputPane'));
}

$('#sitSearch').addEventListener('input', e => { query = e.target.value; paintSits(); });
$('#listToggle').onclick = () => setListOpen(!S.listOpen);
$('#allClear').onclick = allClear;
$('#summary').onclick = () => { $('#flightBox').open = true; $('#flightBox').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
$('#fab').onclick = () => $('#outputPane').scrollIntoView({ behavior: 'smooth', block: 'start' });

$('#themeBtn').onclick = () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; applyLook(); save(); };
$('#fontUp').onclick = () => { S.font = Math.min(34, S.font + 2); applyLook(); save(); };
$('#fontDown').onclick = () => { S.font = Math.max(14, S.font - 2); applyLook(); save(); };
$('#fixBtn').onclick = () => { S.fix = !S.fix; render(); };
$('#orderBtn').onclick = () => { S.reorder = !S.reorder; render(); };
$('#clearSel').onclick = () => {
  if (S.tm === 'free') {
    if (!S.free.items.length || !confirm('選んだ文をすべて外しますか?')) return;
    S.free.items = [];
  } else S.sel[S.tm] = [];
  paintAll(); toast('選択をクリアしました');
};
$('#readBtn').onclick = () => { if (!current) return toast(S.tm === 'free' ? '先に文を選んでください' : '先に状況を選んでください'); $('#reader').classList.add('open'); paintReader(); };
$('#rClose').onclick = () => $('#reader').classList.remove('open');
$('#phraseBtn').onclick = () => { $('#phrasebook').classList.add('open'); paintPhrasebook(); $('#pbBody').scrollTop = 0; };
$('#pbClose').onclick = () => $('#phrasebook').classList.remove('open');
$('#pbSearch').addEventListener('input', e => { pbQuery = e.target.value; paintPhrasebook(); });
[['ja', '#rJa'], ['en', '#rEn'], ['both', '#rBoth']].forEach(([k, q]) => ($(q).onclick = () => { S.reader = k; paintReader(); save(); }));
$('#outCards').addEventListener('click', e => {
  const f = e.target.closest('.fix');
  if (!f || !S.fix) return;
  const o = f.dataset.o;
  toast(!o ? 'ハンドブックの文例になし(追加)' : o.startsWith('(') ? o.slice(1, -1) : `原文:${o}`, 4000);
});
document.querySelectorAll('[data-copy]').forEach(b => (b.onclick = async () => {
  if (!current) return;
  const t = toText(current[b.dataset.copy]);
  try { await navigator.clipboard.writeText(t); }
  catch (e) { const ta = el('textarea'); ta.value = t; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  toast('コピーしました');
}));
