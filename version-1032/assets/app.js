(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav-links]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-thumb]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle("is-active", itemIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        activate(Number(thumb.getAttribute("data-hero-thumb")) || 0);
      });
    });

    carousel.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    carousel.addEventListener("mouseleave", startTimer);
    startTimer();
  }

  function setupHeroSearch() {
    var input = document.querySelector("[data-hero-search]");
    var button = document.querySelector("[data-hero-search-button]");
    if (!input || !button) {
      return;
    }

    function go() {
      var query = input.value.trim();
      var target = "./search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    }

    button.addEventListener("click", go);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        go();
      }
    });
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var grid = panel.parentElement.querySelector("[data-filter-grid]");
      var empty = panel.parentElement.querySelector("[data-empty-state]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.children);
      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery && input) {
        input.value = initialQuery;
      }

      function apply() {
        var keyword = input ? text(input.value) : "";
        var regionValue = region ? text(region.value) : "";
        var typeValue = type ? text(type.value) : "";
        var yearValue = year ? text(year.value) : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesRegion = !regionValue || text(card.getAttribute("data-region")) === regionValue;
          var matchesType = !typeValue || text(card.getAttribute("data-type")) === typeValue;
          var matchesYear = !yearValue || text(card.getAttribute("data-year")) === yearValue;
          var show = matchesKeyword && matchesRegion && matchesType && matchesYear;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-player-video");
    var cover = document.querySelector(".player-cover");
    if (!video || !streamUrl) {
      return;
    }

    var attached = false;
    var hls = null;
    var requestedPlay = false;

    function bindStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requestedPlay) {
            video.play().catch(function () {});
          }
        });
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback() {
      requestedPlay = true;
      bindStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupHeroSearch();
    setupFilters();
  });
})();
