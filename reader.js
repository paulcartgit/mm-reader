// Molineux Mix clean reader. Run as a bookmarklet on any molineuxmix.co.uk forum page.
(function () {
  if (window.__mmr) return;
  window.__mmr = 1;

  var ORIGIN = location.origin;
  var D = document;
  var startUrl = location.href;

  // Silence the site: stop loading, clear its timers, then replace the whole document.
  try { window.stop(); } catch (e) {}
  var hi = setTimeout(function () {}, 0);
  while (hi--) { clearTimeout(hi); clearInterval(hi); }

  var CSS = [
    ':root{--bg:#fff;--fg:#111;--mut:#6b6b6b;--card:#f4f4f5;--line:#e4e4e7;--acc:#c98a00;--q:#ececef}',
    '@media(prefers-color-scheme:dark){:root{--bg:#000;--fg:#ececec;--mut:#9a9a9a;--card:#16161a;--line:#2a2a2e;--acc:#fdb913;--q:#222228}}',
    '*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--fg)}',
    'body{font:17px/1.45 -apple-system,system-ui,sans-serif;-webkit-text-size-adjust:100%;padding-bottom:90px}',
    'a{color:var(--acc)}',
    '#bar{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:8px 12px calc(8px) ;display:flex;gap:8px;align-items:center}',
    '#bar h1{font-size:15px;margin:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    'button,.btn{font:inherit;font-size:14px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:999px;padding:6px 12px;text-decoration:none;white-space:nowrap}',
    'button.on{background:var(--acc);color:#000;border-color:var(--acc)}',
    '.post{padding:12px;border-bottom:1px solid var(--line)}',
    '.meta{display:flex;gap:8px;align-items:baseline;font-size:14px;color:var(--mut);margin-bottom:4px}',
    '.meta b{color:var(--fg);font-size:15px}.meta .n{margin-left:auto}',
    '.body{overflow-wrap:anywhere}.body img{max-width:100%;height:auto}',
    '.body img.smilie{width:1.25em;height:1.25em;vertical-align:-.2em}',
    '.body iframe{max-width:100%}',
    'blockquote{margin:6px 0;padding:6px 10px;background:var(--q);border-left:3px solid var(--acc);border-radius:6px;font-size:15px}',
    'blockquote .qc{max-height:4.4em;overflow:hidden}blockquote.open .qc{max-height:none}',
    'blockquote .qt{font-size:13px;color:var(--mut);font-weight:600}',
    '.rx{font-size:13px;color:var(--mut);margin-top:4px}',
    '.new{animation:fl 2s}@keyframes fl{from{background:rgba(253,185,19,.25)}}',
    '.pager{display:flex;gap:8px;justify-content:center;align-items:center;padding:14px;color:var(--mut);font-size:14px}',
    '.th{display:block;padding:12px;border-bottom:1px solid var(--line);color:var(--fg);text-decoration:none}',
    '.th .t{font-weight:600}.th.unread .t{color:var(--acc)}.th .s{font-size:13px;color:var(--mut);margin-top:2px}',
    '.th .l{float:right;margin-left:8px}',
    '#pill{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:6;display:none;background:var(--acc);color:#000;border:0;font-weight:600;box-shadow:0 2px 10px rgba(0,0,0,.3)}',
    '#reply{padding:12px;border-top:1px solid var(--line)}#reply textarea{width:100%;min-height:90px;font:inherit;background:var(--card);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:8px}',
    '#msg{padding:30px 12px;text-align:center;color:var(--mut)}'
  ].join('');

  // document.open() also wipes every event listener the site added (some swallow taps).
  D.open();
  D.write('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Molineux Mix</title><style>' + CSS + '</style></head><body><div id="bar"></div><main id="main"><div id="msg">Loading…</div></main><button id="pill"></button></body></html>');
  D.close();
  var html = D.documentElement;

  var bar = D.getElementById('bar'), main = D.getElementById('main'), pill = D.getElementById('pill');
  var ours = [D.head, D.body];

  // Keep the site's leftover scripts from injecting ads or overlays back in.
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.type === 'attributes') {
        if (m.target === html || m.target === D.body) m.target.removeAttribute(m.attributeName);
        return;
      }
      m.addedNodes.forEach(function (n) {
        if (n.parentNode === html && ours.indexOf(n) < 0) n.remove();
      });
    });
  }).observe(html, { childList: true, subtree: false, attributes: true, attributeFilter: ['style', 'class'] });
  [bar, main, pill].forEach(function (n) { n.__ok = 1; });
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (!n.__ok && n.nodeType === 1) n.remove(); }); });
  }).observe(D.body, { childList: true });
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.tagName !== 'META' && n.nodeType === 1) n.remove(); }); });
  }).observe(D.head, { childList: true });
  new MutationObserver(function () {
    [html, D.body].forEach(function (n) { if (n.getAttribute('style')) n.removeAttribute('style'); });
  }).observe(D.body, { attributes: true });

  function el(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function abs(u) { try { var x = new URL(u, ORIGIN + '/forum/'); if (x.hostname.indexOf('molineuxmix') >= 0) { x.protocol = location.protocol; x.host = location.host; } return x.href; } catch (e) { return u; } }

  function when(ts) {
    var d = new Date(ts * 1000), now = new Date();
    var hm = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return hm;
    if (now - d < 6 * 864e5) return d.toLocaleDateString([], { weekday: 'short' }) + ' ' + hm;
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + hm;
  }

  function get(url) {
    return fetch(url, { credentials: 'include' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text().then(function (t) { var doc = new DOMParser().parseFromString(t, 'text/html'); doc.__url = r.url; return doc; });
    });
  }

  function pageInfo(doc) {
    var cur = doc.querySelector('.pageNav-page--current');
    var pages = doc.querySelectorAll('.pageNav-main .pageNav-page a');
    var nx = doc.querySelector('link[rel=next]'), pv = doc.querySelector('link[rel=prev]');
    return {
      cur: cur ? +cur.textContent.trim() : 1,
      last: pages.length ? +pages[pages.length - 1].textContent.trim() : 1,
      next: nx && abs(nx.getAttribute('href')),
      prev: pv && abs(pv.getAttribute('href'))
    };
  }

  // ---------- Thread view ----------
  var T = null; // thread state
  var timer = null;

  function cleanBody(src) {
    var b = src.cloneNode(true);
    b.querySelectorAll('script,noscript,.bbCodeBlock-expandLink,.js-selectToQuoteEnd,[class*=samCode],[class*=samItem]').forEach(function (n) { n.remove(); });
    b.querySelectorAll('img').forEach(function (i) {
      var s = i.getAttribute('data-src') || i.getAttribute('src'); if (s) i.src = abs(s);
      i.removeAttribute('srcset'); i.removeAttribute('style');
      if (!i.classList.contains('smilie')) { i.removeAttribute('width'); i.removeAttribute('height'); }
      i.loading = 'lazy';
      var pa = i.closest('a[href*="attachments/"]');
      if (pa && !i.classList.contains('smilie')) {
        var thumb = i.src; // full size needs a login; fall back to the thumbnail
        i.onerror = function () { i.onerror = null; i.src = thumb; };
        i.src = abs(pa.getAttribute('href'));
      }
    });
    b.querySelectorAll('a[href]').forEach(function (a) { a.href = abs(a.getAttribute('href')); });
    b.querySelectorAll('blockquote.bbCodeBlock--quote').forEach(function (q) {
      var who = q.getAttribute('data-quote');
      var c = q.querySelector('.bbCodeBlock-expandContent') || q.querySelector('.bbCodeBlock-content');
      var nq = el('blockquote');
      if (who) nq.appendChild(el('div', 'qt', who + ' said:'));
      var qc = el('div', 'qc'); qc.innerHTML = c ? c.innerHTML : q.innerHTML; nq.appendChild(qc);
      nq.onclick = function () { nq.classList.toggle('open'); };
      q.replaceWith(nq);
    });
    return b;
  }

  function parsePosts(doc) {
    return Array.prototype.map.call(doc.querySelectorAll('article.message--post'), function (a) {
      var t = a.querySelector('.message-attribution-main time');
      var nums = a.querySelectorAll('.message-attribution-opposite li a');
      var body = a.querySelector('.message-body .bbWrapper');
      var rl = a.querySelector('.reactionsBar-link'), rc = 0;
      if (rl) { rc = rl.querySelectorAll('bdi').length; var m = rl.textContent.match(/and (\d+) other/); if (m) rc += +m[1]; }
      return {
        id: a.getAttribute('data-content'),
        author: a.getAttribute('data-author') || '?',
        ts: t ? +t.getAttribute('data-timestamp') : 0,
        num: nums.length ? nums[nums.length - 1].textContent.trim() : '',
        body: body,
        rc: rc
      };
    });
  }

  function postEl(p, isNew) {
    var d = el('div', 'post' + (isNew ? ' new' : ''));
    d.id = p.id;
    var m = el('div', 'meta');
    m.appendChild(el('b', null, p.author));
    m.appendChild(el('span', null, p.ts ? when(p.ts) : ''));
    m.appendChild(el('span', 'n', p.num));
    d.appendChild(m);
    var b = p.body ? cleanBody(p.body) : el('div'); b.className = 'body'; d.appendChild(b);
    if (p.rc) d.appendChild(el('div', 'rx', '👍 ' + p.rc));
    return d;
  }

  function threadBase(u) { var m = u.match(/^(.*?index\.php\?threads\/[^\/]+\/)/); return m ? m[1] : null; }

  function renderThread(doc, url, req) {
    stopLive();
    var pi = pageInfo(doc);
    var title = (doc.querySelector('h1.p-title-value') || {}).textContent || 'Thread';
    T = { base: threadBase(url), seen: {}, first: pi.cur, last: pi.cur, lastPages: pi.last, nextUrl: pi.next, prevUrl: pi.prev, pageUrl: doc.__url || url,
          csrf: doc.documentElement.getAttribute('data-csrf'), loggedIn: doc.documentElement.getAttribute('data-logged-in') === 'true',
          lastDate: 0, req: req, back: (doc.querySelector('.p-breadcrumbs li:last-child a') || { getAttribute: function () { return null; } }).getAttribute('href') };

    bar.innerHTML = '';
    var back = el('button', null, '‹'); back.onclick = function () { go(T.back ? abs(T.back) : ORIGIN + '/forum/index.php?whats-new/posts/'); };
    bar.appendChild(back);
    bar.appendChild(el('h1', null, title.trim()));
    var live = el('button', null, 'Live'); live.id = 'live';
    live.onclick = function () { timer ? stopLive() : startLive(); };
    bar.appendChild(live);

    main.innerHTML = '';
    var top = el('div', 'pager');
    if (pi.prev) { var pb = el('button', null, '↑ Earlier (page ' + (pi.cur - 1) + ')'); pb.onclick = loadEarlier; top.appendChild(pb); }
    else top.appendChild(el('span', null, 'Start of thread'));
    top.id = 'top'; main.appendChild(top);
    var list = el('div'); list.id = 'posts'; main.appendChild(list);
    var bottom = el('div', 'pager'); bottom.id = 'bottom'; main.appendChild(bottom);
    addPosts(parsePosts(doc), false);
    updateBottom();
    if (T.loggedIn) main.appendChild(replyBox());

    // fetch() drops #post-123 anchors, so work the target out from the link we followed.
    var h = (T.req || url).split('#')[1], g = (T.req || '').match(/goto\/post&(?:amp;)?id=(\d+)|posts\/(\d+)/);
    if (g) h = 'post-' + (g[1] || g[2]);
    var target = h && D.getElementById(h);
    if (target) target.scrollIntoView();
    else if (/\/(latest|unread)\/?$/.test(T.req || '')) window.scrollTo(0, D.documentElement.scrollHeight);
    else window.scrollTo(0, 0);
  }

  function addPosts(ps, mark, prepend) {
    var list = D.getElementById('posts'), added = 0, frag = D.createDocumentFragment();
    ps.forEach(function (p) {
      if (T.seen[p.id]) return;
      T.seen[p.id] = 1; added++;
      if (p.ts > T.lastDate) T.lastDate = p.ts;
      frag.appendChild(postEl(p, mark));
    });
    if (prepend) list.insertBefore(frag, list.firstChild); else list.appendChild(frag);
    return added;
  }

  function updateBottom() {
    var b = D.getElementById('bottom'); b.innerHTML = '';
    b.appendChild(el('span', null, 'Page ' + T.last + ' of ' + T.lastPages));
    if (T.nextUrl) {
      var n = el('button', null, 'Next page ↓'); n.onclick = function () { loadNext(false); }; b.appendChild(n);
      var l = el('button', null, 'Latest ⇣'); l.onclick = function () { go(T.base + 'latest'); }; b.appendChild(l);
    }
  }

  function loadEarlier() {
    if (!T.prevUrl) return;
    var top = D.getElementById('top'); top.innerHTML = 'Loading…';
    var h0 = D.documentElement.scrollHeight, y0 = window.scrollY;
    get(T.prevUrl).then(function (doc) {
      var pi = pageInfo(doc);
      addPosts(parsePosts(doc), false, true);
      T.prevUrl = pi.prev; T.first = pi.cur;
      top.innerHTML = '';
      if (pi.prev) { var pb = el('button', null, '↑ Earlier (page ' + (pi.cur - 1) + ')'); pb.onclick = loadEarlier; top.appendChild(pb); }
      else top.appendChild(el('span', null, 'Start of thread'));
      window.scrollTo(0, y0 + D.documentElement.scrollHeight - h0);
    }).catch(function (e) { top.textContent = 'Could not load: ' + e.message; });
  }

  // Fetch the newest page we know of, append anything new, and follow "next" links.
  function loadNext(mark) {
    var url = T.nextUrl || T.pageUrl;
    return get(url).then(function (doc) {
      var pi = pageInfo(doc);
      var nearEnd = window.innerHeight + window.scrollY > D.documentElement.scrollHeight - 300;
      var n = addPosts(parsePosts(doc), mark);
      T.pageUrl = doc.__url || url; T.last = pi.cur; T.lastPages = pi.last; T.nextUrl = pi.next;
      updateBottom();
      if (n && mark) {
        if (nearEnd) window.scrollTo({ top: D.documentElement.scrollHeight, behavior: 'smooth' });
        else { T.unseen = (T.unseen || 0) + n; pill.textContent = T.unseen + ' new ↓'; pill.style.display = 'block'; }
      }
      if (pi.next && mark) return loadNext(mark);
    });
  }

  pill.onclick = function () { T.unseen = 0; pill.style.display = 'none'; window.scrollTo({ top: D.documentElement.scrollHeight, behavior: 'smooth' }); };
  window.addEventListener('scroll', function () {
    if (pill.style.display === 'block' && window.innerHeight + window.scrollY > D.documentElement.scrollHeight - 300) { T.unseen = 0; pill.style.display = 'none'; }
  }, { passive: true });

  function tick() { if (!D.hidden && T) loadNext(true).catch(function () {}); }
  function startLive() {
    var b = D.getElementById('live'); if (b) { b.classList.add('on'); b.textContent = 'Live ●'; }
    // Jump to the end of the thread first, then poll every 20 seconds.
    (T.nextUrl ? loadNext(true).then(function () { window.scrollTo(0, D.documentElement.scrollHeight); }) : Promise.resolve()).then(tick);
    timer = setInterval(tick, 20000);
  }
  function stopLive() {
    if (timer) clearInterval(timer); timer = null;
    var b = D.getElementById('live'); if (b) { b.classList.remove('on'); b.textContent = 'Live'; }
  }
  D.addEventListener('visibilitychange', function () { if (!D.hidden && timer) tick(); });

  function replyBox() {
    var w = el('div'); w.id = 'reply';
    var ta = el('textarea'); ta.placeholder = 'Reply…';
    var row = el('div', 'pager'), send = el('button', null, 'Post reply'), st = el('span');
    row.appendChild(st); row.appendChild(send);
    w.appendChild(ta); w.appendChild(row);
    send.onclick = function () {
      if (!ta.value.trim()) return;
      send.disabled = true; st.textContent = 'Posting…';
      var fd = new FormData();
      fd.append('message', ta.value);
      fd.append('_xfToken', T.csrf);
      fd.append('_xfResponseType', 'json');
      fd.append('_xfWithData', '1');
      fd.append('last_date', String(T.lastDate));
      fetch(T.base + 'add-reply', { method: 'POST', body: fd, credentials: 'include' })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.status === 'ok') { ta.value = ''; st.textContent = 'Posted'; return loadNext(true); }
          st.textContent = (j.errors && j.errors.join(' ')) || 'Not posted';
        })
        .catch(function (e) { st.textContent = 'Not posted: ' + e.message; })
        .then(function () { send.disabled = false; });
    };
    return w;
  }

  // ---------- Thread list view (forums, What's new, search results) ----------
  function renderList(doc, url) {
    stopLive(); T = null;
    var pi = pageInfo(doc);
    var title = ((doc.querySelector('h1.p-title-value') || {}).textContent || 'Molineux Mix').trim();
    bar.innerHTML = '';
    var nw = el('button', null, 'New posts'); nw.onclick = function () { go(ORIGIN + '/forum/index.php?whats-new/posts/'); };
    bar.appendChild(el('h1', null, title));
    bar.appendChild(nw);
    main.innerHTML = '';
    var items = doc.querySelectorAll('.structItem--thread');
    items.forEach(function (it) {
      var a = it.querySelector('.structItem-title a[data-tp-primary], .structItem-title a:last-child');
      if (!a) return;
      var href = abs(a.getAttribute('href'));
      var row = el('a', 'th' + (it.classList.contains('is-unread') ? ' unread' : ''));
      row.href = href;
      var lt = it.querySelector('.structItem-latestDate');
      var lu = it.querySelector('.structItem-cell--latest .username');
      var rep = it.querySelector('.structItem-cell--meta dd');
      var latest = el('a', 'btn l', 'Latest'); latest.href = threadBase(href) + 'latest';
      row.appendChild(latest);
      row.appendChild(el('div', 't', a.textContent.trim()));
      var forum = it.querySelector('.structItem-parts a[href*="forums/"]');
      row.appendChild(el('div', 's', [
        rep ? rep.textContent.trim() + ' replies' : '',
        lt ? when(+lt.getAttribute('data-timestamp')) : '',
        lu ? lu.textContent.trim() : '',
        forum ? forum.textContent.trim() : ''
      ].filter(Boolean).join(' · ')));
      main.appendChild(row);
    });
    if (!items.length) main.appendChild(el('div', null, 'No threads on this page.')).id = 'msg';
    var pg = el('div', 'pager');
    if (pi.prev) { var p = el('button', null, '‹ Prev'); p.onclick = function () { go(pi.prev); }; pg.appendChild(p); }
    pg.appendChild(el('span', null, 'Page ' + pi.cur + ' of ' + pi.last));
    if (pi.next) { var n = el('button', null, 'Next ›'); n.onclick = function () { go(pi.next); }; pg.appendChild(n); }
    main.appendChild(pg);
    window.scrollTo(0, 0);
  }

  // ---------- Navigation ----------
  function render(doc, url, req) {
    if (doc.querySelector('article.message--post')) renderThread(doc, url, req);
    else if (doc.querySelector('.structItem--thread') || /whats-new|forums\//.test(url)) renderList(doc, url);
    else { location.href = url; }
  }

  function go(url, noPush) {
    stopLive();
    main.innerHTML = '<div id="msg">Loading…</div>';
    return get(url).then(function (doc) {
      var final = doc.__url || url;
      if (!noPush) history.pushState({ mmr: 1 }, '', final);
      render(doc, final, url);
    }).catch(function (e) { main.innerHTML = ''; var m = el('div', null, 'Could not load (' + e.message + '). '); m.id = 'msg'; var a = el('a', null, 'Open normally'); a.href = url; m.appendChild(a); main.appendChild(m); });
  }

  window.addEventListener('popstate', function () { go(location.href, true); });

  // Open forum links inside the reader; everything else behaves normally.
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented) return;
    var u = a.href;
    if (u.indexOf(ORIGIN) !== 0 && u.replace(/^http:/, 'https:').indexOf(ORIGIN.replace(/^http:/, 'https:')) !== 0) { a.target = '_blank'; return; }
    if (/index\.php\?(threads\/|forums\/|whats-new|goto\/post|posts\/\d+\/?$)/.test(u)) { e.preventDefault(); go(u); }
  });

  // First render: the page we are already on.
  go(startUrl, true);
})();
