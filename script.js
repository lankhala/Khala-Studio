// script.js — updated: SM Digital panel renders an internal apps-grid that matches homepage layout (4 per row).
// Internal anchors use same markup (.app + .app-icon + <span>) but are created only inside the panel.
// Clicks on those internal anchors open the bottom-sheet detail (square image). Home icons remain unchanged.

document.addEventListener('DOMContentLoaded', function () {
  var phoneElem = document.querySelector('.phone');
  // capture only the home-level app anchors (initial, direct children of the top .apps-grid)
  var homeAppIcons = Array.from(document.querySelectorAll('.apps-grid > a.app'));
  var appPanel = document.querySelector('.app-panel');
  var backBtn = document.querySelector('.back-btn.fixed');
  var appInner = document.querySelector('.app-inner');
  var appContent = document.querySelector('.app-content');

  var detail = null;
  var currentApp = null;

  var TELEGRAM_BASE = 'https://t.me/smservicekh';

  // SM Digital data (items shown as apps inside the panel)
  // NOTE: added detailImg for the larger / alternate image shown in the 1x1 detail sheet.
  var DATA = {
    'sm-digital': [
      { id: 'a1', name: 'Canva Pro', img: 'canvalogo.png', detailImg: 'canva.jpg', telegramUrl: 'https://t.me/sm_canva' },
      { id: 'a2', name: 'Gemini Pro', img: 'geminilogo.png', detailImg: 'gemini.jpg', telegramUrl: 'https://t.me/sm_icons' },
      { id: 'a3', name: 'CapCut Pro', img: 'capcutlogo.png', detailImg: 'capcut.png', telegramUrl: 'https://t.me/sm_presets' },
      { id: 'a4', name: 'Freepik', img: 'freepiklogo.png', detailImg: 'freepik.png', telegramUrl: 'https://t.me/sm_uikit' },
      // { id: 'a5', name: 'Templates', img: 'template.jpg', detailImg: 'template_detail.jpg', telegramUrl: 'https://t.me/sm_templates' },
      // { id: 'a6', name: 'Fonts', img: 'fontpack.jpg', detailImg: 'fontpack_detail.jpg', telegramUrl: 'https://t.me/sm_fonts' },
      // { id: 'a7', name: 'Stickers', img: 'stickers.jpg', detailImg: 'stickers_detail.jpg', telegramUrl: 'https://t.me/sm_stickers' },
      // { id: 'a8', name: 'Mockups', img: 'mockup.jpg', detailImg: 'mockup_detail.jpg', telegramUrl: 'https://t.me/sm_mockups' }
    ],
    // other apps (kept simple)
    'design': [],
    'program': [],
    'library': [],
    'software': [],
    'freelance': [],
    'png': [],
    'news': []
  };

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

  function openPanelForApp(appId, iconEl) {
    currentApp = appId;
    setPanelOriginFromIcon(iconEl);
    renderAppContent(appId);
    requestAnimationFrame(function () {
      appPanel.classList.add('open');
      appPanel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }

  function closePanel() {
    var det = document.querySelector('.sm-detail.open');
    if (det) {
      closeDetail();
      return;
    }
    appPanel.classList.remove('open');
    appPanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden';
    currentApp = null;
  }

  /* DETAIL: bottom-sheet with square image and draggable behavior */
  function ensureDetailExists() {
    if (detail) return;
    detail = document.createElement('div');
    detail.className = 'sm-detail';
    detail.setAttribute('aria-hidden', 'true');
    detail.innerHTML = ''
      + '<div class="sm-detail-overlay" data-role="overlay"></div>'
      + '<div class="sm-detail-sheet" role="dialog" aria-modal="true" aria-label="Item details">'
      +   '<div class="sm-detail-handle" aria-hidden="true"></div>'
      +   '<div class="sm-detail-body">'
      +     '<div class="sm-detail-imgwrap"><img class="sm-detail-img" src="" alt="" loading="lazy" draggable="false"></div>'
      +     '<div class="sm-detail-name"></div>'
      +     '<div class="sm-detail-desc"></div>'
      +     '<div class="sm-detail-actions"><button class="sm-detail-buy buy-btn" type="button">Buy Now</button></div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(detail);

    // overlay click closes
    detail.querySelector('.sm-detail-overlay').addEventListener('click', function () {
      closeDetail();
    }, { passive: true });

    detail.querySelector('.sm-detail-buy').addEventListener('click', function () {
      var url = this.dataset.telegramUrl || TELEGRAM_BASE;
      window.open(url, '_blank');
    });

    // make sheet draggable
    initSheetDrag(detail.querySelector('.sm-detail-sheet'));
  }

  function openDetailFor(item) {
    ensureDetailExists();
    var imgEl = detail.querySelector('.sm-detail-img');
    var nameEl = detail.querySelector('.sm-detail-name');
    var descEl = detail.querySelector('.sm-detail-desc');
    var buyBtn = detail.querySelector('.sm-detail-buy');

    // Prefer detailImg (alternate/large image) if provided, otherwise fall back to item.img (the small/logo)
    var detailSrc = item.detailImg || item.img || '';

    if (detailSrc) {
      imgEl.src = detailSrc;
      imgEl.alt = item.name || item.title || '';
      imgEl.style.display = '';
    } else {
      imgEl.style.display = 'none';
      imgEl.removeAttribute('src'); imgEl.alt = '';
    }

    nameEl.textContent = item.name || item.title || '';
    descEl.textContent = item.desc || item.telegramText || '';

    var tg = item.telegramUrl;
    if (!tg) {
      var text = item.telegramText || nameEl.textContent;
      tg = TELEGRAM_BASE + '?text=' + encodeURIComponent(String(text || 'Hello'));
    }
    buyBtn.dataset.telegramUrl = tg;

    // reset inline transform and open
    var sheet = detail.querySelector('.sm-detail-sheet');
    sheet.style.transition = '';
    sheet.style.transform = '';
    requestAnimationFrame(function () {
      detail.classList.add('open');
      detail.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeDetail() {
    if (!detail) return;
    var sheet = detail.querySelector('.sm-detail-sheet');
    sheet.style.transition = 'transform 320ms cubic-bezier(.22,.61,.36,1)';
    sheet.style.transform = '';
    detail.classList.remove('open');
    detail.setAttribute('aria-hidden', 'true');
    setTimeout(function () {}, 320);
  }

  /* render per app (SM Digital uses same apps-grid markup as home) */
  function renderAppContent(appId) {
    appContent.innerHTML = '';
    if (appId === 'sm-digital') renderSmDigitalUsingTemplate();
    else renderEmpty(appId);
  }

  function renderSmDigitalUsingTemplate() {
    // create a grid with the exact same markup as homepage .apps-grid
    var grid = document.createElement('div');
    grid.className = 'apps-grid';
    grid.setAttribute('aria-hidden', 'false');

    DATA['sm-digital'].forEach(function (p) {
      var a = document.createElement('a');
      a.href = '#';
      a.className = 'app1';
      // mark internal id so home-level listeners (which were bound at load) won't accidentally handle these
      a.setAttribute('data-item', p.id);
      a.innerHTML = ''
        + '<div class="app-icon1"><img src="' + p.img + '" alt="' + escapeHtml(p.name) + '" loading="lazy" draggable="false"></div>'
        + '<span>' + escapeHtml(p.name) + '</span>';
      grid.appendChild(a);
    });

    appContent.appendChild(grid);

    // bind clicks for internal anchors only (prevent propagation to home anchors)
    grid.addEventListener('click', function (e) {
      var a = e.target.closest('a.app1');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      var id = a.getAttribute('data-item');
      var item = DATA['sm-digital'].find(function (x) { return x.id === id; });
      if (!item) return;
      openDetailFor(item);
    }, { passive: true });
  }

  function renderEmpty(appId) {
    var d = document.createElement('div');
    d.className = 'empty';
    d.innerHTML = '<strong>' + escapeHtml(capitalize(appId || 'App')) + '</strong><p style="margin-top:8px;color:#cbd5e1;">កម្មវិធីកំពុងអាប់ដេត...</p>';
    appContent.appendChild(d);
  }

  function capitalize(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

  // bind only the original home icons to open the panel
  homeAppIcons.forEach(function (el) {
    el.addEventListener('click', function (ev) {
      ev.preventDefault();
      var id = el.getAttribute('data-app') || 'app1';
      openPanelForApp(id, el);
    }, { passive: true });
  });

  // back button
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      var det = document.querySelector('.sm-detail.open');
      if (det) { closeDetail(); return; }
      closePanel();
    });
  }

  // esc key closes
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var det = document.querySelector('.sm-detail.open');
      if (det) { closeDetail(); return; }
      if (appPanel.classList.contains('open')) closePanel();
    }
  });

  // keep body locked on home initially
  document.body.style.overflow = 'hidden';

  // cleanup
  window.addEventListener('beforeunload', function () {
    if (detail) { try { detail.remove(); } catch (err) {} }
  });

  // --------------- sheet drag implementation ---------------
  function initSheetDrag(sheet) {
    if (!sheet) return;
    var startY = 0;
    var currentY = 0;
    var dragging = false;
    var sheetHeight = 0;

    function pointerDown(e) {
      var target = e.target;
      if (!(target.closest('.sm-detail-handle') || target.closest('.sm-detail-imgwrap') || target.closest('.sm-detail-img'))) {
        return;
      }
      dragging = true;
      startY = (e.touches ? e.touches[0].clientY : e.clientY);
      currentY = 0;
      sheetHeight = sheet.offsetHeight || window.innerHeight * 0.75;
      sheet.style.transition = '';
      document.addEventListener('pointermove', pointerMove, { passive: false });
      document.addEventListener('pointerup', pointerUp, { passive: true });
      document.addEventListener('touchmove', pointerMove, { passive: false });
      document.addEventListener('touchend', pointerUp, { passive: true });
      e.preventDefault();
    }

    function pointerMove(e) {
      if (!dragging) return;
      var y = (e.touches ? e.touches[0].clientY : e.clientY);
      currentY = Math.max(0, y - startY);
      sheet.style.transform = 'translateY(' + currentY + 'px)';
      e.preventDefault();
    }

    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      var threshold = (sheetHeight || window.innerHeight * 0.75) * 0.25;
      sheet.style.transition = 'transform 220ms cubic-bezier(.22,.61,.36,1)';
      if (currentY > threshold) {
        sheet.style.transform = 'translateY(100%)';
        setTimeout(function () { closeDetail(); }, 220);
      } else {
        sheet.style.transform = '';
      }
      document.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('pointerup', pointerUp);
      document.removeEventListener('touchmove', pointerMove);
      document.removeEventListener('touchend', pointerUp);
    }

    sheet.addEventListener('pointerdown', pointerDown, { passive: false });
    sheet.addEventListener('touchstart', pointerDown, { passive: false });

    var imgwrap = sheet.querySelector('.sm-detail-imgwrap');
    if (imgwrap) {
      imgwrap.addEventListener('pointerdown', pointerDown, { passive: false });
      imgwrap.addEventListener('touchstart', pointerDown, { passive: false });
    }
  }
  // --------------- end sheet drag ---------------
});