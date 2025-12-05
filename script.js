// script.js — render 8 apps with required layouts & behaviors
// Back button fixed at top-left for all apps; detail overlays no longer create their own back button.
// - SM Digital: 4-per-row product tiles, detail overlay, buy -> t.me/smservicekh
// - Design/Program: full-row images -> open telegram
// - Library: 2-per-row book tiles (image + title) -> open telegram
// - Software: 3-per-row tiles -> open telegram
// - Freelance/News: empty state (no data)
// - PNG: list of text items -> open telegram
// Performance: cached selectors, delegation, rAF, lazy img attributes

document.addEventListener('DOMContentLoaded', function () {
  var phoneElem = document.querySelector('.phone');
  var appIcons = Array.from(document.querySelectorAll('.app'));
  var appPanel = document.querySelector('.app-panel');
  // find the pinned back button (class "fixed" added in HTML)
  var backBtn = document.querySelector('.back-btn.fixed');
  var appInner = document.querySelector('.app-inner');
  var appContent = document.querySelector('.app-content');

  var detail = null;
  var currentApp = null;

  // Telegram base
  var TELEGRAM_BASE = 'https://t.me/smservicekh';

  // sample datasets (images are placeholders; replace with your assets)
  var DATA = {
    'sm-digital': [
      { id: 'd1', name: 'Canva Pro 1 Year', price: '$4', img: 'canva.webp', desc: 'Canva Pro license (1 year)' },
      { id: 'd2', name: 'Icon Pack', price: '$5', img: 'iconpack.jpg', desc: 'Set of 200 icons' },
      { id: 'd3', name: 'Preset Pack', price: '$7', img: 'preset.jpg', desc: 'Color presets for editors' },
      { id: 'd4', name: 'UI Kit', price: '$10', img: 'uikit.jpg', desc: 'Design components' },
      { id: 'd5', name: 'Template Pack', price: '$6', img: 'template.jpg', desc: 'Website templates' },
      { id: 'd6', name: 'Font Bundle', price: '$8', img: 'fontpack.jpg', desc: 'Handpicked fonts' },
      { id: 'd7', name: 'Sticker Set', price: '$3', img: 'stickers.jpg', desc: 'Chat stickers' },
      { id: 'd8', name: 'Mockup Kit', price: '$9', img: 'mockup.jpg', desc: 'Device mockups' }
    ],
    'design': [
      { id: 'g1', name: 'Poster A', img: 'design1.jpg', telegramText: 'Interested in Poster A' },
      { id: 'g2', name: 'Poster B', img: 'design2.jpg', telegramText: 'Interested in Poster B' },
      { id: 'g3', name: 'Flyer', img: 'design3.jpg', telegramText: 'Interested in Flyer' }
    ],
    'program': [
      { id: 'p1', name: 'Script A', img: 'program1.jpg', telegramText: 'Interested in Script A' },
      { id: 'p2', name: 'Tool B', img: 'program2.jpg', telegramText: 'Interested in Tool B' }
    ],
    'library': [
      { id: 'b1', title: 'ទស្សនៈវិជ្ជាពិភពលោក', img: 'book1.jpg', telegramText: 'Interested in Book One' },
      { id: 'b2', title: 'Book Two', img: 'book2.jpg', telegramText: 'Interested in Book Two' },
      { id: 'b3', title: 'Book Three', img: 'book3.jpg', telegramText: 'Interested in Book Three' },
      { id: 'b4', title: 'Book Four', img: 'book4.jpg', telegramText: 'Interested in Book Four' },
      { id: 'b5', title: 'Book Five', img: 'book5.jpg', telegramText: 'Interested in Book Five' },
      { id: 'b6', title: 'Book Six', img: 'book6.jpg', telegramText: 'Interested in Book Six' },
      { id: 'b7', title: 'Book Seven', img: 'book7.jpg', telegramText: 'Interested in Book Seven' },
      { id: 'b8', title: 'Book Eight', img: 'book8.jpg', telegramText: 'Interested in Book Eight' }
    ],
    'software': [
      { id: 's1', name: 'Mobile App', price: '$15', img: 'soft1.jpg', desc: 'App license' },
      { id: 's2', name: 'Desktop Tool', price: '$25', img: 'soft2.jpg', desc: 'Tool license' },
      { id: 's3', name: 'Plugin', price: '$9', img: 'soft3.jpg', desc: 'Plugin license' },
      { id: 's4', name: 'Theme', price: '$7', img: 'soft4.jpg', desc: 'Theme pack' }
    ],
    'freelance': [], // no data
    'png': [
      'PNG Asset 1',
      'PNG Asset 2',
      'PNG Asset 3',
      'PNG Asset 4',
      'PNG Asset 5'
    ],
    'news': [] // no data
  };

  // helpers
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m];
    });
  }

  function setPanelOriginFromIcon(iconEl) {
    if (!phoneElem || !appPanel || !iconEl) return;
    var phoneRect = phoneElem.getBoundingClientRect();
    var iconRect = iconEl.getBoundingClientRect();
    var cx = (iconRect.left + iconRect.width/2 - phoneRect.left) / phoneRect.width * 100;
    var cy = (iconRect.top + iconRect.height/2 - phoneRect.top) / phoneRect.height * 100;
    cx = Math.max(15, Math.min(85, cx));
    cy = Math.max(10, Math.min(90, cy));
    appPanel.style.setProperty('--ox', cx + '%');
    appPanel.style.setProperty('--oy', cy + '%');
  }

  function openPanelForApp(appId, label, iconEl) {
    currentApp = appId;
    setPanelOriginFromIcon(iconEl);
    renderAppContent(appId);
    requestAnimationFrame(function () {
      appPanel.classList.add('open');
      appPanel.setAttribute('aria-hidden', 'false');
      // keep body locked; the pinned back button is inside the panel and does not scroll with .app-inner
      document.body.style.overflow = 'hidden';
    });
  }

  function closePanel() {
    var det = document.querySelector('.sm-detail.open');
    if (det) {
      det.classList.remove('open');
      det.setAttribute('aria-hidden', 'true');
      return;
    }
    appPanel.classList.remove('open');
    appPanel.setAttribute('aria-hidden', 'true');
    // keep body locked (home content already internally managed)
    document.body.style.overflow = 'hidden';
    currentApp = null;
  }

  // render per app
  function renderAppContent(appId) {
    appContent.innerHTML = '';
    if (appId === 'sm-digital') renderSmDigital();
    else if (appId === 'design') renderGallery('design');
    else if (appId === 'program') renderGallery('program');
    else if (appId === 'library') renderLibrary();
    else if (appId === 'software') renderSoftware();
    else if (appId === 'freelance' || appId === 'news') renderEmpty(appId);
    else if (appId === 'png') renderPngList();
    else renderEmpty(appId);
  }

  /* SM Digital: 4 per row grid */
  function renderSmDigital() {
    var grid = document.createElement('div');
    grid.className = 'tiles sm-digital';
    DATA['sm-digital'].forEach(function (p) {
      var t = document.createElement('div');
      t.className = 'tile';
      t.setAttribute('data-id', p.id);
      t.innerHTML = ''
        + '<img src="' + p.img + '" alt="' + escapeHtml(p.name) + '" loading="lazy">'
        + '<div class="title">' + escapeHtml(p.name) + '</div>'
        + '<div class="subtitle">' + escapeHtml(p.desc) + '</div>'
        + '<div class="row"><div class="price">' + escapeHtml(p.price) + '</div><button class="buy-btn" data-name="' + escapeHtml(p.name) + '">Buy</button></div>';
      grid.appendChild(t);
    });
    appContent.appendChild(grid);

    // delegated click for tile or buy
    grid.addEventListener('click', function (e) {
      var tile = e.target.closest('.tile');
      if (!tile) return;
      if (e.target.matches('.buy-btn')) {
        var name = e.target.getAttribute('data-name') || tile.querySelector('.title').textContent;
        openTelegramForPurchase(name);
      } else {
        openDetail('sm-digital', tile.getAttribute('data-id'));
      }
    }, { passive: true });
  }

  function openDetail(appId, itemId) {
    var source = DATA[appId] || [];
    var item = source.find(function (x) { return x.id === itemId; });
    if (!item) return;
    ensureDetailExists();
    var imgEl = detail.querySelector('.sm-detail-img');
    var nameEl = detail.querySelector('.sm-detail-name');
    var priceEl = detail.querySelector('.sm-detail-price');
    var descEl = detail.querySelector('.sm-detail-desc');
    var buyBtn = detail.querySelector('.sm-detail-buy');

    imgEl.src = item.img;
    imgEl.alt = item.name;
    nameEl.textContent = item.name || '';
    priceEl.textContent = item.price || '';
    descEl.textContent = item.desc || '';
    buyBtn.dataset.name = item.name || '';
    detail.classList.add('open');
    detail.setAttribute('aria-hidden', 'false');
  }

  function ensureDetailExists() {
    if (detail) return;
    detail = document.createElement('div');
    detail.className = 'sm-detail';
    // NOTE: removed internal back button so fixed back button (top-left) is used consistently
    detail.innerHTML = ''
      + '<div class="sm-detail-overlay"></div>'
      + '<div class="sm-detail-sheet">'
      +   '<div class="sm-detail-body">'
      +     '<img class="sm-detail-img" src="" alt="" style="width:100%;border-radius:8px;margin-bottom:8px;">'
      +     '<div class="sm-detail-name" style="font-weight:700;font-size:16px;margin-bottom:6px;"></div>'
      +     '<div class="sm-detail-price" style="color:#2563eb;font-weight:700;margin-bottom:8px;"></div>'
      +     '<p class="sm-detail-desc" style="color:#374151;margin-bottom:12px;"></p>'
      +     '<button class="sm-detail-buy buy-btn" type="button">Buy via Telegram</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(detail);

    // buy button behavior
    detail.querySelector('.sm-detail-buy').addEventListener('click', function () {
      var name = this.dataset.name || '';
      openTelegramForPurchase(name);
    });
  }

  function openTelegramForPurchase(name) {
    var text = name ? ('Hello SM service! I want to buy: ' + name) : 'Hello SM service!';
    var url = TELEGRAM_BASE + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  /* Design & Program: render full-row images; open telegram with message */
  function renderGallery(key) {
    var tiles = document.createElement('div');
    tiles.className = 'tiles fullrow';
    (DATA[key] || []).forEach(function (it) {
      var t = document.createElement('div');
      t.className = 'tile';
      t.setAttribute('data-id', it.id);
      t.innerHTML = ''
        + '<img src="' + it.img + '" alt="' + escapeHtml(it.name) + '" loading="lazy">'
        + '<div class="title">' + escapeHtml(it.name) + '</div>'
        + '<div class="row"><button class="buy-btn" data-text="' + escapeHtml(it.telegramText || it.name) + '">Contact</button></div>';
      tiles.appendChild(t);
    });
    appContent.appendChild(tiles);

    tiles.addEventListener('click', function (e) {
      var btn = e.target.closest('.buy-btn');
      if (btn) {
        var text = btn.dataset.text || 'Hello SM service!';
        window.open(TELEGRAM_BASE + '?text=' + encodeURIComponent(text), '_blank');
      }
    }, { passive: true });
  }

  /* Library: 2-per-row book tiles with image+title */
  function renderLibrary() {
    var grid = document.createElement('div');
    grid.className = 'tiles library';
    (DATA['library'] || []).forEach(function (b) {
      var t = document.createElement('div');
      t.className = 'tile';
      t.setAttribute('data-id', b.id || b.title);
      t.innerHTML = ''
        + '<img src="' + b.img + '" alt="' + escapeHtml(b.title) + '" loading="lazy">'
        + '<div class="title">' + escapeHtml(b.title) + '</div>'
        + '<div class="row"><button class="buy-btn" data-text="' + escapeHtml(b.telegramText) + '">Details</button></div>';
      grid.appendChild(t);
    });
    appContent.appendChild(grid);

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.buy-btn');
      if (btn) {
        var text = btn.dataset.text || 'Hello SM service!';
        window.open(TELEGRAM_BASE + '?text=' + encodeURIComponent(text), '_blank');
      }
    }, { passive: true });
  }

  /* Software: 3-per-row tiles similar to SM Digital but 3 columns */
  function renderSoftware() {
    var grid = document.createElement('div');
    grid.className = 'tiles software';
    (DATA['software'] || []).forEach(function (p) {
      var t = document.createElement('div');
      t.className = 'tile';
      t.setAttribute('data-id', p.id);
      t.innerHTML = ''
        + '<img src="' + p.img + '" alt="' + escapeHtml(p.name) + '" loading="lazy">'
        + '<div class="title">' + escapeHtml(p.name) + '</div>'
        + '<div class="subtitle">' + escapeHtml(p.desc) + '</div>'
        + '<div class="row"><div class="price">' + escapeHtml(p.price) + '</div><button class="buy-btn" data-name="' + escapeHtml(p.name) + '">Buy</button></div>';
      grid.appendChild(t);
    });
    appContent.appendChild(grid);

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.buy-btn');
      if (btn) {
        var name = btn.dataset.name || '';
        openTelegramForPurchase(name);
        return;
      }
      var tile = e.target.closest('.tile');
      if (tile) {
        var id = tile.getAttribute('data-id');
        openDetail('software', id);
      }
    }, { passive: true });
  }

  /* PNG: list of text items -> open telegram with text */
  function renderPngList() {
    var ul = document.createElement('ul');
    ul.className = 'png-list';
    (DATA['png'] || []).forEach(function (text, idx) {
      var li = document.createElement('li');
      li.textContent = text;
      li.setAttribute('data-text', text);
      ul.appendChild(li);
    });
    appContent.appendChild(ul);

    ul.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      var txt = li.getAttribute('data-text') || li.textContent;
      window.open(TELEGRAM_BASE + '?text=' + encodeURIComponent('Hello SM service! ' + txt), '_blank');
    }, { passive: true });
  }

  /* Empty state for freelance/news */
  function renderEmpty(appId) {
    var d = document.createElement('div');
    d.className = 'empty';
    d.innerHTML = '<strong>' + escapeHtml(capitalize(appId || 'App')) + '</strong><p style="margin-top:8px;color:#cbd5e1;">No data available.</p>';
    appContent.appendChild(d);
  }

  function capitalize(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

  // attach app icons
  appIcons.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var id = a.getAttribute('data-app') || 'app';
      openPanelForApp(id, null, a);
    }, { passive: true });
  });

  // back button uses single fixed control for all panels and details
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      var det = document.querySelector('.sm-detail.open');
      if (det) {
        det.classList.remove('open');
        det.setAttribute('aria-hidden', 'true');
        return;
      }
      closePanel();
    });
  }

  // esc key closes
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var det = document.querySelector('.sm-detail.open');
      if (det) { det.classList.remove('open'); det.setAttribute('aria-hidden', 'true'); return; }
      if (appPanel.classList.contains('open')) closePanel();
    }
  });

  // keep body locked on home initially
  document.body.style.overflow = 'hidden';

  // cleanup detail on unload
  window.addEventListener('beforeunload', function () {
    if (detail) { try { detail.remove(); } catch (err) {} }
  });

});