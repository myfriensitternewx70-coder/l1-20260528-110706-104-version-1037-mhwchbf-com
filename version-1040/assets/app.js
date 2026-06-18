(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll(".hero-shell").forEach(function (shell) {
      var slides = Array.prototype.slice.call(shell.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(shell.querySelectorAll(".hero-dot"));
      var prev = shell.querySelector(".hero-arrow.prev");
      var next = shell.querySelector(".hero-arrow.next");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      shell.addEventListener("mouseenter", stop);
      shell.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var searchInput = scope.querySelector("[data-search-input]");
      var regionInput = scope.querySelector("[data-filter-region]");
      var typeInput = scope.querySelector("[data-filter-type]");
      var yearInput = scope.querySelector("[data-filter-year]");
      var status = scope.querySelector("[data-filter-status]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q && searchInput) {
        searchInput.value = q;
      }

      function valueOf(input) {
        return input ? input.value.trim().toLowerCase() : "";
      }

      function matchText(card, keyword) {
        if (!keyword) {
          return true;
        }
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" ").toLowerCase();
        return text.indexOf(keyword) !== -1;
      }

      function matchContains(card, attr, value) {
        if (!value) {
          return true;
        }
        return (card.getAttribute(attr) || "").toLowerCase().indexOf(value) !== -1;
      }

      function apply() {
        var keyword = valueOf(searchInput);
        var region = valueOf(regionInput);
        var type = valueOf(typeInput);
        var year = valueOf(yearInput);
        var visible = 0;

        cards.forEach(function (card) {
          var ok = matchText(card, keyword) &&
            matchContains(card, "data-region", region) &&
            matchContains(card, "data-type", type) &&
            matchContains(card, "data-year", year);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (status) {
          status.textContent = visible ? "筛选结果已更新" : "未找到符合条件的影片";
        }
      }

      [searchInput, regionInput, typeInput, yearInput].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
})();
