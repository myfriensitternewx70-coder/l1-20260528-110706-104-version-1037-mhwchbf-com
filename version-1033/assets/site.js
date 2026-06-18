(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function basePath() {
    return document.body.getAttribute('data-base') || './';
  }

  function joinPath(base, path) {
    if (!path) {
      return base;
    }
    return base + path.replace(/^\.\//, '');
  }

  function setupMenu() {
    var button = $('[data-menu-toggle]');
    var nav = $('[data-site-nav]');
    var search = $('.global-search');
    if (!button || !nav || !search) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      search.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function setupGlobalSearch() {
    var input = $('[data-global-search]');
    var results = $('[data-global-results]');
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!input || !results || !data.length) {
      return;
    }

    function render(items) {
      var base = basePath();
      if (!items.length) {
        results.innerHTML = '<div class="global-result-item"><div></div><div><strong>未找到匹配影片</strong><span>请尝试其他关键词</span></div></div>';
        results.classList.add('visible');
        return;
      }
      results.innerHTML = items.slice(0, 12).map(function (item) {
        return [
          '<a class="global-result-item" href="', joinPath(base, item.url), '">',
          '<img src="', joinPath(base, item.cover), '" alt="', escapeHtml(item.title), '">',
          '<div><strong>', escapeHtml(item.title), '</strong>',
          '<span>', escapeHtml(item.year), ' · ', escapeHtml(item.type), ' · ', escapeHtml(item.region), '</span></div>',
          '</a>'
        ].join('');
      }).join('');
      results.classList.add('visible');
    }

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.classList.remove('visible');
        results.innerHTML = '';
        return;
      }
      var matched = data.filter(function (item) {
        return item.search.indexOf(q) !== -1;
      });
      render(matched);
    });

    document.addEventListener('click', function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.classList.remove('visible');
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupLocalFilter() {
    var grid = $('[data-grid]');
    if (!grid) {
      return;
    }
    var cards = $all('[data-card]', grid);
    var queryInput = $('[data-local-search]');
    var typeSelect = $('[data-filter-type]');
    var yearSelect = $('[data-filter-year]');
    var status = $('[data-filter-status]');

    function match(card) {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var typeOk = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
      var yearOk = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
      var queryOk = !q || haystack.indexOf(q) !== -1;
      return typeOk && yearOk && queryOk;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var isMatch = match(card);
        card.classList.toggle('is-hidden', !isMatch);
        if (isMatch) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = visible ? '筛选结果已更新' : '未找到匹配影片';
      }
    }

    [queryInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupPlayer() {
    var shell = $('[data-player]');
    if (!shell) {
      return;
    }
    var video = $('video', shell);
    var button = $('[data-play-button]', shell);
    var src = shell.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function initialize() {
      if (initialized || !video || !src) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      initialize();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });
    video.addEventListener('click', function () {
      initialize();
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilter();
    setupPlayer();
  });
})();
