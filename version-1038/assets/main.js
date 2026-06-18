(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(activeIndex + 1);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var noResult = document.querySelector('[data-no-result]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
      var keyword = normalize(filterForm.querySelector('[name="keyword"]').value);
      var year = normalize(filterForm.querySelector('[name="year"]').value);
      var kind = normalize(filterForm.querySelector('[name="kind"]').value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchKind = !kind || normalize(card.getAttribute('data-type')).indexOf(kind) !== -1;
        var matched = matchKeyword && matchYear && matchKind;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (noResult) {
        noResult.classList.toggle('is-visible', visible === 0);
      }
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter();
    });

    filterForm.addEventListener('input', runFilter);
    filterForm.addEventListener('change', runFilter);
    runFilter();
  }

  var searchMount = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchSelect = document.querySelector('[data-search-kind]');
  var searchSummary = document.querySelector('[data-search-summary]');

  if (searchMount && searchInput && typeof MOVIE_SEARCH_INDEX !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q') || '';

    if (preset) {
      searchInput.value = preset;
    }

    function renderResults() {
      var keyword = searchInput.value.toLowerCase().trim();
      var kind = searchSelect ? searchSelect.value.toLowerCase().trim() : '';
      var data = MOVIE_SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.region, item.type, item.genre, item.year].join(' ').toLowerCase();
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        var kindOk = !kind || String(item.type || '').toLowerCase().indexOf(kind) !== -1;
        return keywordOk && kindOk;
      }).slice(0, 120);

      searchMount.innerHTML = data.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + item.url + '">',
          '    <img src="' + item.poster + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
          '    <span class="play-dot">▶</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <div class="meta-line"><span>' + item.year + '</span><span>' + item.type + '</span><span>' + item.region + '</span></div>',
          '    <h3><a href="' + item.url + '">' + item.title + '</a></h3>',
          '    <p>' + item.oneLine + '</p>',
          '    <div class="tag-list"><span>' + item.genre + '</span><span>' + item.category + '</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      if (searchSummary) {
        searchSummary.textContent = data.length ? '为你匹配到以下片单结果' : '未找到相关影片';
      }
    }

    searchInput.addEventListener('input', renderResults);

    if (searchSelect) {
      searchSelect.addEventListener('change', renderResults);
    }

    renderResults();
  }
})();
