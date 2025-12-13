// script.js — combined SM Digital + Library UI (search, banner, categories, detail)

document.addEventListener('DOMContentLoaded', function () {
  var phoneElem = document.querySelector('.phone');
  var homeAppIcons = Array.from(document.querySelectorAll('.apps-grid > a.app'));
  var appPanel = document.querySelector('.app-panel');
  var backBtn = document.querySelector('.back-btn.fixed');
  var appInner = document.querySelector('.app-inner');
  var appContent = document.querySelector('.app-content');

  var detail = null;
  var currentApp = null;

  var TELEGRAM_BASE = 'https://t.me/smservicekh';

  var DATA = {
    'sm-digital': [
      { id: 'a1', name: 'Canva Pro', img: 'canvalogo.png', detailImg: 'canva.jpg', telegramUrl: 'https://t.me/smservicekh' },
      { id: 'a2', name: 'Gemini Pro', img: 'geminilogo.png', detailImg: 'gemini.jpg', telegramUrl: 'https://t.me/smservicekh' },
      { id: 'a3', name: 'CapCut', img: 'capcutlogo.png', detailImg: 'capcut.png', telegramUrl: 'https://t.me/smservicekh' },
      { id: 'a4', name: 'Freepik', img: 'freepiklogo.png', detailImg: 'freepik.png', telegramUrl: 'https://t.me/smservicekh' },
      { id: 'a5', name: 'ChatGPT', img: 'chatgptlogo.png', detailImg: 'chatgpt.png', telegramUrl: 'https://t.me/smservicekh' },
      { id: 'a6', name: 'Window11', img: 'windowlogo.png', detailImg: 'window.jpg', telegramUrl: 'https://t.me/smservicekh' },
      { id: 'a7', name: 'Netflix', img: 'netflixlogo.png', detailImg: 'netflix.jpg', telegramUrl: 'https://t.me/smservicekh' },
      { id: 'a8', name: 'Adobe', img: 'adobelogo.png', detailImg: 'adobe.png', telegramUrl: 'https://t.me/smservicekh' }
    ],
    'library': {
      categories: [
    {
      id: 'សម្រាប់អ្នក',
      title: 'បានណែនាំសម្រាប់អ្នក',
      items: [
        { id: 'b1', name: 'ការខិតខំក្លែងក្លាយ', img: 'book1.jpg',
          desc: 'សេចក្តីពិពណ៌នា សៀវភៅ A',
          telegramUrl: 'https://t.me/DigitalBookKH/1' },

        { id: 'b2', name: 'គ្មានជម្រើស', img: 'book2.jpg',
          desc: 'សេចក្តីពិពណ៌នា សៀវភៅ B',
          telegramUrl: 'https://t.me/DigitalBookKH/2' },

        { id: 'b3', name: 'យកឈ្នះភាពភ័យខ្លាច', img: 'book3.jpg',
          desc: 'សេចក្តីពិពណ៌នា សៀវភៅ C',
          telegramUrl: 'https://t.me/DigitalBookKH/3' },

        { id: 'b4', name: 'អំណាចនៃផ្នត់គំនិត', img: 'book4.jpg',
          desc: 'សេចក្តីពិពណ៌នា សៀវភៅ D',
          telegramUrl: 'https://t.me/DigitalBookKH/4' },

          { id: 'b5', name: 'អាថកំបាំងភាពជោគជ័យ', img: 'book5.webp',
          desc: 'សេចក្តីពិពណ៌នា សៀវភៅ A',
          telegramUrl: 'https://t.me/DigitalBookKH/1' },

        { id: 'b6', name: 'ដឹមេជិក', img: 'book6.webp',
          desc: 'សេចក្តីពិពណ៌នា សៀវភៅ B',
          telegramUrl: 'https://t.me/DigitalBookKH/2' },

        { id: 'b7', name: 'ថាមពលស្ត្រី', img: 'book7.webp',
          desc: 'សេចក្តីពិពណ៌នា សៀវភៅ C',
          telegramUrl: 'https://t.me/DigitalBookKH/3' },

        { id: 'b8', name: 'យុទ្ធសាស្រ្តទម្លុះគោលដៅ', img: 'book8.webp',
          desc: 'សេចក្តីពិពណ៌នា សៀវភៅ D',
          telegramUrl: 'https://t.me/DigitalBookKH/4' }
      ]
    }
  ]
    },
    'design': [], 'program': [], 'software': [], 'freelance': [], 'png': [], 'news': []
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
    var cat = appContent.querySelector('.category-panel');
    if (cat) cat.remove();
    appPanel.classList.remove('open');
    appPanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentApp = null;
  }

  /* DETAIL: bottom-sheet */
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
      +     '<div class="sm-detail-caption"></div>'
      +     '<div class="sm-detail-desc"></div>'
      +     '<div class="sm-detail-actions"><button class="sm-detail-buy buy-btn" type="button">Shop</button></div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(detail);

    detail.querySelector('.sm-detail-overlay').addEventListener('click', function () {
      closeDetail();
    }, { passive: true });

    detail.querySelector('.sm-detail-buy').addEventListener('click', function () {
      var url = this.dataset.telegramUrl || TELEGRAM_BASE;
      window.open(url, '_blank');
    });

    initSheetDrag(detail.querySelector('.sm-detail-sheet'));
  }

  function openDetailFor(item) {
    ensureDetailExists();
    var imgEl = detail.querySelector('.sm-detail-img');
    var nameEl = detail.querySelector('.sm-detail-name');
    var captionEl = detail.querySelector('.sm-detail-caption');
    var descEl = detail.querySelector('.sm-detail-desc');
    var buyBtn = detail.querySelector('.sm-detail-buy');

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
    captionEl.textContent = item.caption || '';
    descEl.textContent = item.desc || item.telegramText || '';

    var tg = item.telegramUrl;
    if (!tg) {
      var text = item.telegramText || nameEl.textContent;
      tg = TELEGRAM_BASE + '?text=' + encodeURIComponent(String(text || 'Hello'));
    }
    buyBtn.dataset.telegramUrl = tg;

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
    if (!appPanel.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function renderAppContent(appId) {
    appContent.innerHTML = '';
    if (appId === 'sm-digital') renderSmDigitalUsingTemplate();
    else if (appId === 'library') renderLibrary();
    else renderEmpty(appId);
  }

  function renderSmDigitalUsingTemplate() {
    var grid = document.createElement('div');
    grid.className = 'apps-grid';
    grid.setAttribute('aria-hidden', 'false');

    DATA['sm-digital'].forEach(function (p) {
      var a = document.createElement('a');
      a.href = '#';
      a.className = 'app';
      a.setAttribute('data-item', p.id);

      a.innerHTML = ''
        + '<div class="app-icon">'
        +   '<div class="liquidGlass-wrapper">'
        +     '<div class="liquidGlass-effect"></div>'
        +     '<div class="liquidGlass-tint"></div>'
        +     '<div class="liquidGlass-shine"></div>'
        +     '<div class="liquidGlass-text"><img src="' + escapeHtml(p.img) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" draggable="false"></div>'
        +   '</div>'
        + '</div>'
        + '<span>' + escapeHtml(p.name) + '</span>';

      grid.appendChild(a);
    });

    appContent.appendChild(grid);

    grid.addEventListener('click', function (e) {
      var a = e.target.closest('a.app');
      if (!a) return;
      if (!appContent.contains(a)) return;
      e.preventDefault();
      e.stopPropagation();
      var id = a.getAttribute('data-item');
      var item = DATA['sm-digital'].find(function (x) { return x.id === id; });
      if (!item) return;
      openDetailFor(item);
    }, { passive: false });
  }

  /* LIBRARY RENDERING */
  function renderLibrary() {
    appContent.innerHTML = '';

    // Search row
    var searchRow = document.createElement('div');
    searchRow.className = 'library-search-row';
    searchRow.innerHTML = ''
      + '<div class="library-search"><input type="text" placeholder="ស្វែងរកសៀវភៅ..." aria-label="Search books"><button class="library-search-toggle" aria-label="Toggle search"><img src="search-icon.png" alt="search" loading="lazy" draggable="false"></button></div>';
    appContent.appendChild(searchRow);

    var searchInput = searchRow.querySelector('input');
    var toggleBtn = searchRow.querySelector('.library-search-toggle');
    var toggleImg = toggleBtn.querySelector('img');
    var searchActive = false;

    toggleBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (!searchActive) {
        searchActive = true;
        toggleImg.src = 'close-icon.png';
        searchInput.focus();
        performSearch(searchInput.value.trim());
      } else {
        searchActive = false;
        toggleImg.src = 'search-icon.png';
        searchInput.value = '';
        renderLibraryDefault();
      }
    }, { passive: false });

    searchInput.addEventListener('input', function () {
      if (!searchActive) return;
      performSearch(this.value.trim());
    });

    // container where categories or search results will be injected
    var contentArea = document.createElement('div');
    contentArea.className = 'library-content';
    appContent.appendChild(contentArea);

    // Render default categories
    renderLibraryDefault();

    function performSearch(q) {
      var ql = String(q || '').toLowerCase();
      var results = [];
      if (ql) {
        DATA['library'].categories.forEach(function (cat) {
          cat.items.forEach(function (it) {
            if (String(it.name || '').toLowerCase().indexOf(ql) !== -1 || (it.caption && it.caption.toLowerCase().indexOf(ql) !== -1)) results.push(it);
          });
        });
      }
      renderSearchResults(results, ql);
    }

    function renderSearchResults(results, q) {
      contentArea.innerHTML = '';
      var header = document.createElement('div');
      header.className = 'search-results-header';
      header.innerHTML = '<strong>' + (q ? ('លទ្ធផលសម្រាប់ \"' + escapeHtml(q) + '\"') : 'Search') + '</strong>';
      contentArea.appendChild(header);

      if (!results || results.length === 0) {
        var nores = document.createElement('div');
        nores.className = 'no-results';
        nores.innerHTML = '<img src="no-book.png" alt="No books" loading="lazy"><p>មិនមានសៀវភៅដែលត្រឹមត្រូវ</p>';
        contentArea.appendChild(nores);
        return;
      }

      var grid = document.createElement('div');
      grid.className = 'library-grid two-cols';
      results.forEach(function (it) {
        var a = document.createElement('a');
        a.href = '#';
        a.className = 'book-tile';
        a.setAttribute('data-item', it.id);
        a.innerHTML = ''
          + '<div class="book-cover"><img src="' + escapeHtml(it.img) + '" alt="' + escapeHtml(it.name) + '" loading="lazy"></div>'
          + '<div class="book-title">' + escapeHtml(it.name) + '</div>'
        grid.appendChild(a);
      });
      contentArea.appendChild(grid);

      grid.addEventListener('click', function (ev) {
  var a = ev.target.closest('a.book-tile');
  if (!a) return;
  ev.preventDefault();
  var id = a.getAttribute('data-item');
  var item = findLibraryItemById(id);
  if (item && item.telegramUrl) {
    window.open(item.telegramUrl, '_blank'); // បើក Telegram link តែម្តង
  }
}, { passive: false });
    }

    function renderLibraryDefault() {
      contentArea.innerHTML = '';
      DATA['library'].categories.forEach(function (cat) {
        var row = document.createElement('div');
        row.className = 'library-category';

        var header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = '<strong class="category-title">' + escapeHtml(cat.title) + '</strong><button class="see-all" data-cat="' + escapeHtml(cat.id) + '">មើលទាំងអស់</button>';
        row.appendChild(header);

        var carousel = document.createElement('div');
        carousel.className = 'category-carousel';
        cat.items.forEach(function (it) {
          var a = document.createElement('a');
          a.href = '#';
          a.className = 'book-small';
          a.setAttribute('data-item', it.id);
          a.innerHTML = ''
            + '<div class="book-cover small"><img src="' + escapeHtml(it.img) + '" alt="' + escapeHtml(it.name) + '" loading="lazy"></div>'
            + '<div class="book-title small">' + escapeHtml(it.name) + '</div>'
          carousel.appendChild(a);
        });

        row.appendChild(carousel);
        contentArea.appendChild(row);
      });

      contentArea.querySelectorAll('.category-carousel').forEach(function (c) {
       c.addEventListener('click', function (ev) {
  var a = ev.target.closest('a.book-small');
  if (!a) return;
  ev.preventDefault();
  var id = a.getAttribute('data-item');
  var item = findLibraryItemById(id);
  if (item && item.telegramUrl) {
    window.open(item.telegramUrl, '_blank');
  }
}, { passive: false });
      });

      contentArea.querySelectorAll('.see-all').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          var catId = btn.getAttribute('data-cat');
          openSeeAllForCategory(catId);
        }, { passive: false });
      });
    }










function openSeeAllForCategory(catId) {
  var cat = DATA['library'].categories.find(c => c.id === catId);
  if (!cat) return;

  var panel = document.createElement('div');
  panel.className = 'category-fullpanel';
  panel.innerHTML = `
    <div class="category-fullpanel-header">
      <button class="back-btn fixed" type="button" aria-label="Back">
        <img src="backicon.png" alt="Back">
      </button>
      <strong>សៀវភៅទាំងអស់</strong>
    </div>
    <div class="library-search-row">
      <div class="library-search">
        <input type="text" placeholder="ស្វែងរកសៀវភៅ..." aria-label="Search books">
        <button class="library-search-toggle"><img src="search-icon.png" alt="search"></button>
      </div>
    </div>
    <div class="category-fullpanel-body">
      <div class="category-grid two-cols"></div>
    </div>
  `;
  document.body.appendChild(panel); // overlay on body

  var grid = panel.querySelector('.category-grid');
  // Collect all books across categories
  var allItems = [];
  DATA['library'].categories.forEach(c => { allItems = allItems.concat(c.items); });
  renderGrid(allItems);

  // Back button → slide out then remove
  panel.querySelector('.back-btn.fixed').addEventListener('click', ev => {
    ev.preventDefault();
    panel.style.animation = 'slideOutRightFade 0.3s ease forwards';
    setTimeout(() => panel.remove(), 300);
  });

  // Click book → Telegram link
  grid.addEventListener('click', ev => {
    var a = ev.target.closest('a.book-tile');
    if (!a) return;
    ev.preventDefault();
    var id = a.getAttribute('data-item');
    var item = findLibraryItemById(id);
    if (item && item.telegramUrl) {
      window.open(item.telegramUrl, '_blank');
    }
  });

  // Search behavior
  var searchInput = panel.querySelector('.library-search input');
  var searchBtn   = panel.querySelector('.library-search-toggle');
  var searchActive = false;

  searchBtn.addEventListener('click', function (ev) {
    ev.preventDefault();
    searchActive = !searchActive;
    if (searchActive) {
      searchBtn.querySelector('img').src = 'close-icon.png';
      searchInput.focus();
      doSearch(searchInput.value.trim());
    } else {
      searchBtn.querySelector('img').src = 'search-icon.png';
      searchInput.value = '';
      renderGrid(allItems);
    }
  }, { passive: false });

  searchInput.addEventListener('input', function () {
    if (!searchActive) return;
    doSearch(this.value.trim());
  });

  function doSearch(q) {
    var ql = String(q || '').toLowerCase();
    if (!ql) { renderGrid(allItems); return; }
    var filtered = allItems.filter(it =>
      String(it.name || '').toLowerCase().indexOf(ql) !== -1 ||
      (it.caption && it.caption.toLowerCase().indexOf(ql) !== -1)
    );
    renderGrid(filtered);
  }

  function renderGrid(items) {
    grid.innerHTML = '';
    items.forEach(it => {
      var a = document.createElement('a');
      a.href = '#';
      a.className = 'book-tile';
      a.setAttribute('data-item', it.id);
      a.innerHTML = `
        <div class="book-cover"><img src="${escapeHtml(it.img)}" alt="${escapeHtml(it.name)}"></div>
        <div class="book-title">${escapeHtml(it.name)}</div>
      `;
      grid.appendChild(a);
    });
  }
}




  




    function findLibraryItemById(id) {
      var found = null;
      DATA['library'].categories.forEach(function (cat) {
        cat.items.forEach(function (it) {
          if (it.id === id) found = it;
        });
      });
      return found;
    }
    var menuGrid = document.createElement('div');
menuGrid.className = 'library-menu-grid';
menuGrid.innerHTML = `
<div class="library-action-grid">
  <div class="action-card" data-cat="foreign">
    <img src="ltool1.png">
    <span>ភាសាបរទេស</span>
  </div>

  <div class="action-card" data-cat="multi">
    <img src="ltool2.png">
    <span>ជំនាញ</span>
  </div>

  <div class="action-card" data-cat="skill">
    <img src="ltool3.png">
    <span>សម្ថភាព</span>
  </div>

  <div class="action-card" data-cat="story">
    <img src="ltool4.png">
    <span>សៀវភៅរឿង</span>
  </div>

  <div class="action-card" data-cat="culture">
    <img src="ltool5.png">
    <span>វប្បធម៍ទូទៅ</span>
  </div>

  <div class="action-card" data-cat="school">
    <img src="ltool6.png">
    <span>មធ្យមសិក្សា</span>
  </div>
  
</div>
<div class="library-banner" data-cat="other">
    <img src="library-banner.png">
  </div>
  <div>
    <p style="font-size:12px; color:#94a3b8; text-align:center; margin-top:8px;">Version បណ្ណាល័យ 1.0</p>
  </div>
`;
appContent.appendChild(menuGrid);
  }

  function renderEmpty(appId) {
    appContent.innerHTML = '';
    var d = document.createElement('div');
    d.className = 'empty';
    d.innerHTML = '<strong>' + escapeHtml(capitalize(appId || 'App')) + '</strong><p style="margin-top:8px;color:#cbd5e1;">កម្មវិធីកំពុងអាប់ដេត...</p>';
    appContent.appendChild(d);
  }

  function capitalize(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

  // bind home icons to open the panel
  homeAppIcons.forEach(function (el) {
    el.addEventListener('click', function (ev) {
      ev.preventDefault();
      var id = el.getAttribute('data-app') || 'app1';
      openPanelForApp(id, el);
    }, { passive: false });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      var det = document.querySelector('.sm-detail.open');
      if (det) { closeDetail(); return; }
      closePanel();
    });
  }

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var det = document.querySelector('.sm-detail.open');
      if (det) { closeDetail(); return; }
      if (appPanel.classList.contains('open')) closePanel();
    }
  });

  // cleanup
  window.addEventListener('beforeunload', function () {
    if (detail) { try { detail.remove(); } catch (err) {} }
  });

  // sheet drag
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
});


document.addEventListener('DOMContentLoaded', function () {
  var home = document.querySelector('.home-content');

  function stop(e) { e.preventDefault(); }

  home.addEventListener('touchmove', stop, { passive: false });
  home.addEventListener('wheel', stop, { passive: false });
  home.addEventListener('dragstart', stop, { passive: false });
});