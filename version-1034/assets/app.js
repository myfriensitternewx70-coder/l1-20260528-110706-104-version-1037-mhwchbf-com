(() => {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", () => {
      const open = mobilePanel.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let current = 0;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => show(index));
    });

    if (slides.length > 1) {
      setInterval(() => show(current + 1), 5000);
    }
  }

  const searchInput = document.querySelector("[data-search-input]");
  const typeFilter = document.querySelector("[data-filter-type]");
  const yearFilter = document.querySelector("[data-filter-year]");
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const emptyState = document.querySelector("[data-empty-state]");

  if (searchInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query) {
      searchInput.value = query;
    }

    const applyFilters = () => {
      const terms = searchInput.value.trim().toLowerCase();
      const typeValue = typeFilter ? typeFilter.value.trim() : "";
      const yearValue = yearFilter ? yearFilter.value.trim() : "";
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.dataset.text || "").toLowerCase();
        const type = card.dataset.type || "";
        const year = card.dataset.year || "";
        const matchText = !terms || text.includes(terms);
        const matchType = !typeValue || type === typeValue;
        const matchYear = !yearValue || year === yearValue;
        const ok = matchText && matchType && matchYear;
        card.hidden = !ok;

        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    };

    searchInput.addEventListener("input", applyFilters);

    if (typeFilter) {
      typeFilter.addEventListener("change", applyFilters);
    }

    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilters);
    }

    applyFilters();
  }
})();
