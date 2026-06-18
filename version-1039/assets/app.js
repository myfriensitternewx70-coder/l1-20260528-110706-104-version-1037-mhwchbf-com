(function () {
  var ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");

    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var input = document.querySelector("[data-movie-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (initial) {
      input.value = initial;
    }

    function filter(value) {
      var query = (value || "").trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        card.hidden = query && haystack.indexOf(query) === -1;
      });
    }

    input.addEventListener("input", function () {
      filter(input.value);
    });

    document.querySelectorAll("[data-filter-chip]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-filter-chip") || "";
        filter(input.value);
        input.focus();
      });
    });

    filter(input.value);
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }

      var start = function () {
        initVideo(video).then(function () {
          button.classList.add("hidden");
          var playResult = video.play();
          if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {});
          }
        });
      };

      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("hidden");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          button.classList.remove("hidden");
        }
      });
    });
  }

  function initVideo(video) {
    var src = video.getAttribute("data-src");
    if (!src) {
      return Promise.resolve();
    }

    if (video.getAttribute("data-ready") === "1") {
      return Promise.resolve();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.setAttribute("data-ready", "1");
      return Promise.resolve();
    }

    return ensureHls().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.setAttribute("data-ready", "1");
      } else {
        video.src = src;
        video.setAttribute("data-ready", "1");
      }
    });
  }

  function ensureHls() {
    if (window.Hls) {
      return Promise.resolve();
    }

    if (window.__hlsLoading) {
      return window.__hlsLoading;
    }

    window.__hlsLoading = new Promise(function (resolve) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });

    return window.__hlsLoading;
  }
})();
