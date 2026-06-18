(function () {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  function syncHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobilePanel && header) {
    menuButton.addEventListener('click', function () {
      const open = !mobilePanel.classList.contains('is-active');
      mobilePanel.classList.toggle('is-active', open);
      menuButton.classList.toggle('is-active', open);
      header.classList.toggle('is-open', open);
      document.body.classList.toggle('no-scroll', open);
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function queue() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        queue();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        queue();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        queue();
      });
    });

    show(0);
    queue();
  }

  const searches = Array.from(document.querySelectorAll('[data-search-input]'));

  searches.forEach(function (input) {
    const scopeName = input.getAttribute('data-search-input');
    const scope = scopeName ? document.querySelector('[data-search-scope="' + scopeName + '"]') : document;
    const empty = scope ? scope.querySelector('[data-empty-result]') : null;

    if (!scope) {
      return;
    }

    input.addEventListener('input', function () {
      const query = input.value.trim().toLowerCase();
      const cards = Array.from(scope.querySelectorAll('[data-search-card]'));
      let shown = 0;

      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
        const matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    });
  });
})();
