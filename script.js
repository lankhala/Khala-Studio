document.addEventListener('DOMContentLoaded', function () {
  var phoneElem = document.querySelector('.phone');
  var appIcons = document.querySelectorAll('.app');
  var appPanel = document.querySelector('.app-panel');
  var backBtn = document.querySelector('.back-btn');
  var moreBtn = document.querySelector('.more-btn');
  var appTitle = document.querySelector('.app-title');
  var appPages = document.querySelectorAll('.app-page');
  var moreSheet = document.querySelector('.app-more-sheet');
  var moreSheetClose = document.querySelector('.app-more-close');

  var currentAppId = null;
  var smSplashTimer = null;

  function setPanelOriginFromIcon(iconEl) {
    if (!phoneElem || !appPanel || !iconEl) return;
    var phoneRect = phoneElem.getBoundingClientRect();
    var iconRect = iconEl.getBoundingClientRect();

    var cx = (iconRect.left + iconRect.width / 2 - phoneRect.left) / phoneRect.width * 100;
    var cy = (iconRect.top + iconRect.height / 2 - phoneRect.top) / phoneRect.height * 100;

    cx = Math.max(15, Math.min(85, cx));
    cy = Math.max(10, Math.min(90, cy));

    appPanel.style.setProperty('--ox', cx + '%');
    appPanel.style.setProperty('--oy', cy + '%');
  }

  function activatePage(appId) {
    for (var i = 0; i < appPages.length; i++) {
      var page = appPages[i];
      if (page.getAttribute('data-app-page') === appId) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    }

    // reset SM Digital splash & detail state
    if (appId === 'sm-digital') {
      var smPage = document.querySelector('.app-page[data-app-page="sm-digital"]');
      if (smPage) {
        var splash = smPage.querySelector('.sm-splash');
        var main = smPage.querySelector('.sm-main');
        var detail = smPage.querySelector('.sm-detail');

        if (detail) {
          detail.classList.remove('open');
        }
        if (splash && main) {
          splash.classList.remove('hidden');
          main.classList.add('sm-main-hidden');
        }

        if (smSplashTimer) {
          window.clearTimeout(smSplashTimer);
        }
        smSplashTimer = window.setTimeout(function () {
          if (splash && main) {
            splash.classList.add('hidden');
            main.classList.remove('sm-main-hidden');
          }
        }, 2000);
      }
    } else {
      if (smSplashTimer) {
        window.clearTimeout(smSplashTimer);
        smSplashTimer = null;
      }
    }
  }

  function openApp(appId, label, iconEl) {
    currentAppId = appId;
    setPanelOriginFromIcon(iconEl);

    if (appTitle) {
      if (appId === 'sm-digital') {
        appTitle.textContent = 'SM DIGITAL';
      } else {
        appTitle.textContent = label || 'App';
      }
    }

    activatePage(appId);
    if (appPanel) {
      appPanel.classList.add('open');
    }
  }

  function closeApp() {
    if (!currentAppId) return;
    if (smSplashTimer) {
      window.clearTimeout(smSplashTimer);
      smSplashTimer = null;
    }
    if (appPanel) {
      appPanel.classList.remove('open');
    }
    currentAppId = null;
  }

  // click apps on home
  for (var i = 0; i < appIcons.length; i++) {
    (function (icon) {
      icon.addEventListener('click', function (e) {
        e.preventDefault();
        var appId = icon.getAttribute('data-app');
        if (!appId) return;
        var labelEl = icon.querySelector('span');
        var label = labelEl ? labelEl.textContent.trim() : 'App';
        openApp(appId, label, icon);
      });
    })(appIcons[i]);
  }

  // back button -> close whole app panel (back to home screen)
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      closeApp();
    });
  }

  // more button -> toggle sheet
  if (moreBtn && moreSheet) {
    moreBtn.addEventListener('click', function () {
      moreSheet.classList.toggle('open');
    });
  }
  if (moreSheet && moreSheetClose) {
    moreSheetClose.addEventListener('click', function () {
      moreSheet.classList.remove('open');
    });
  }

  // resize: update origin if app is open
  window.addEventListener('resize', function () {
    if (!currentAppId) return;
    for (var i = 0; i < appIcons.length; i++) {
      var app = appIcons[i];
      if (app.getAttribute('data-app') === currentAppId) {
        setPanelOriginFromIcon(app);
        break;
      }
    }
  });

  // ===== SM Digital slider =====
  var heroTrack = document.querySelector('.app-page[data-app-page="sm-digital"] .sm-hero-track');
  var heroDots = document.querySelectorAll('.app-page[data-app-page="sm-digital"] .sm-hero-dots span');
  var currentSlide = 0;
  var totalSlides = heroDots.length;

  function goToSlide(idx) {
    if (!heroTrack || !totalSlides) return;
    currentSlide = (idx + totalSlides) % totalSlides;
    heroTrack.style.transform = 'translateX(' + (-100 * currentSlide) + '%)';
    for (var i = 0; i < heroDots.length; i++) {
      if (i === currentSlide) {
        heroDots[i].classList.add('active');
      } else {
        heroDots[i].classList.remove('active');
      }
    }
  }

  if (totalSlides > 0) {
    for (var d = 0; d < heroDots.length; d++) {
      (function (index) {
        heroDots[index].addEventListener('click', function () {
          goToSlide(index);
        });
      })(d);
    }

    setInterval(function () {
      if (currentAppId === 'sm-digital') {
        goToSlide(currentSlide + 1);
      }
    }, 3500);
  }

  // ===== SM Digital product list & detail =====
  var smPage = document.querySelector('.app-page[data-app-page="sm-digital"]');
  if (smPage) {
    var productItems = smPage.querySelectorAll('.sm-product-item');
    var detail = smPage.querySelector('.sm-detail');
    var detailName = smPage.querySelector('.sm-detail-name');
    var detailPrice = smPage.querySelector('.sm-detail-price');
    var detailText = smPage.querySelector('.sm-detail-text');
    var detailBuyBtn = smPage.querySelector('.sm-detail-buy');
    var detailBackBtn = smPage.querySelector('.sm-detail-back');

    function openDetail(item) {
      if (!detail) return;

      var name = item.getAttribute('data-product') || '';
      var price = item.getAttribute('data-price') || '';
      var desc = item.getAttribute('data-description') || '';
      var telegramText = item.getAttribute('data-telegram-text') || ('Hello SM service! ' + name);

      if (detailName) detailName.textContent = name;
      if (detailPrice) detailPrice.textContent = price;
      if (detailText) detailText.textContent = desc;
      if (detailBuyBtn) {
        detailBuyBtn.dataset.telegramText = telegramText;
      }

      detail.classList.add('open');
    }

    for (var p = 0; p < productItems.length; p++) {
      (function (item) {
        var buyBtn = item.querySelector('.sm-product-buy');

        item.addEventListener('click', function (e) {
          if (e.target && e.target.closest('.sm-product-buy')) {
            // click handled in buyBtn
            return;
          }
          openDetail(item);
        });

        if (buyBtn) {
          buyBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            openDetail(item);
          });
        }
      })(productItems[p]);
    }

    if (detailBackBtn && detail) {
      detailBackBtn.addEventListener('click', function () {
        detail.classList.remove('open');
      });
    }

    if (detailBuyBtn) {
      detailBuyBtn.addEventListener('click', function () {
        var text = detailBuyBtn.dataset.telegramText || 'Hello SM service!';
        var encoded = encodeURIComponent(text);
        // TODO: change "SMservice" to your Telegram username / bot
        var url = 'https://t.me/SMservice?text=' + encoded;
        window.open(url, '_blank');
      });
    }
  }
});