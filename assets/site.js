(function () {
    const header = document.querySelector('[data-header]');
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 10);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobileMenu && header) {
        menuButton.addEventListener('click', function () {
            const visible = mobileMenu.classList.toggle('is-visible');
            header.classList.toggle('is-open', visible);
        });
    }

    document.querySelectorAll('[data-poster-img]').forEach(function (image) {
        image.addEventListener('error', function () {
            image.remove();
        });
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let activeIndex = 0;
        let timer = null;

        function showSlide(index) {
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

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        const input = filterPanel.querySelector('[data-filter-input]');
        const typeSelect = filterPanel.querySelector('[data-filter-type]');
        const yearSelect = filterPanel.querySelector('[data-filter-year]');
        const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
        const empty = filterPanel.querySelector('[data-filter-empty]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function textOf(card) {
            return [
                card.dataset.search || '',
                card.dataset.title || '',
                card.dataset.region || '',
                card.dataset.genre || '',
                card.dataset.tags || '',
                card.dataset.year || '',
                card.dataset.type || ''
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            const query = input ? input.value.trim().toLowerCase() : '';
            const typeValue = typeSelect ? typeSelect.value : '';
            const yearValue = yearSelect ? yearSelect.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const matchesQuery = !query || textOf(card).includes(query);
                const matchesType = !typeValue || (card.dataset.type || '').includes(typeValue);
                const matchesYear = !yearValue || (card.dataset.year || '') === yearValue;
                const show = matchesQuery && matchesType && matchesYear;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    const video = document.querySelector('[data-video-player]');
    const playButton = document.querySelector('[data-play-button]');

    if (video && playButton && window.__vod) {
        let ready = false;
        let hlsInstance = null;

        function prepareVideo() {
            if (ready) {
                return;
            }

            const streamUrl = window.__vod;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            ready = true;
        }

        function startVideo() {
            prepareVideo();
            playButton.classList.add('is-hidden');
            video.controls = true;
            const attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    playButton.classList.remove('is-hidden');
                });
            }
        }

        playButton.addEventListener('click', startVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                startVideo();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
}());
