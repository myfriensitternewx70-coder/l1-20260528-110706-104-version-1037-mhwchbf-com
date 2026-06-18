(function () {
    'use strict';

    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function getRoot() {
        return document.body ? (document.body.getAttribute('data-root') || '') : '';
    }

    function initMobileMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener('click', function () {
            var opened = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function initHeroSlider() {
        var slider = qs('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var index = 0;
        var timer = null;

        if (slides.length <= 1) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initStaticFilters() {
        qsa('[data-filter-toolbar]').forEach(function (toolbar) {
            var container = toolbar.parentElement || document;
            var cards = qsa('[data-movie-card]', container);
            var input = qs('[data-filter-input]', toolbar);
            var region = qs('[data-filter-region]', toolbar);
            var year = qs('[data-filter-year]', toolbar);
            var genre = qs('[data-filter-genre]', toolbar);
            var reset = qs('[data-filter-reset]', toolbar);
            var count = qs('[data-filter-count]', toolbar);

            if (!cards.length) {
                return;
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                var genreValue = normalize(genre && genre.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute('data-search'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardGenre = normalize(card.getAttribute('data-genre'));
                    var matched = true;

                    if (keyword && searchText.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (regionValue && cardRegion.indexOf(regionValue) === -1 && searchText.indexOf(regionValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear.indexOf(yearValue) !== 0) {
                        matched = false;
                    }
                    if (genreValue && cardGenre.indexOf(genreValue) === -1 && searchText.indexOf(genreValue) === -1) {
                        matched = false;
                    }

                    card.classList.toggle('is-filtered-out', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 条';
                }
            }

            [input, region, year, genre].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', apply);
                    el.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) input.value = '';
                    if (region) region.value = '';
                    if (year) year.value = '';
                    if (genre) genre.value = '';
                    apply();
                });
            }

            apply();
        });
    }

    function movieCardTemplate(movie, root) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        var url = root + movie.url;
        var cover = root + movie.cover;
        var search = escapeHtml([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            (movie.tags || []).join(' '),
            movie.oneLine
        ].join(' ').toLowerCase());

        return '' +
            '<article class="movie-card" data-movie-card data-search="' + search + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre + ' ' + (movie.tags || []).join(' ')) + '">' +
                '<a class="movie-cover" href="' + escapeHtml(url) + '" aria-label="查看 ' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">' +
                    '<span class="movie-score">' + escapeHtml(movie.score) + '</span>' +
                    '<span class="movie-play">播放</span>' +
                '</a>' +
                '<div class="movie-body">' +
                    '<h3><a href="' + escapeHtml(url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</p>' +
                    '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initSearchPage() {
        var results = qs('[data-search-results]');

        if (!results || !window.MOVIE_INDEX) {
            return;
        }

        var root = getRoot();
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var form = qs('[data-search-page-form]');
        var input = qs('[data-search-page-input]');
        var toolbarInput = qs('[data-filter-input]');

        if (input) {
            input.value = query;
        }
        if (toolbarInput) {
            toolbarInput.value = query;
        }

        function render() {
            var keyword = normalize((toolbarInput && toolbarInput.value) || (input && input.value) || '');
            var movies = window.MOVIE_INDEX.filter(function (movie) {
                var searchText = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                return !keyword || searchText.indexOf(keyword) !== -1;
            });

            if (!movies.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配内容，请更换关键词。</div>';
                initStaticFilters();
                return;
            }

            results.innerHTML = movies.map(function (movie) {
                return movieCardTemplate(movie, root);
            }).join('');
            initStaticFilters();
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                if (toolbarInput && input) {
                    toolbarInput.value = input.value;
                }
                var nextUrl = new URL(window.location.href);
                nextUrl.searchParams.set('q', input ? input.value : '');
                window.history.replaceState({}, '', nextUrl.toString());
                render();
            });
        }

        render();
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        return new Promise(function (resolve, reject) {
            var existing = qs('script[data-hls-loader]');
            if (existing) {
                existing.addEventListener('load', function () {
                    resolve(window.Hls);
                });
                existing.addEventListener('error', reject);
                return;
            }

            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
            script.async = true;
            script.setAttribute('data-hls-loader', 'true');
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('Hls.js did not load.'));
                }
            };
            script.onerror = function () {
                var fallback = document.createElement('script');
                fallback.src = 'https://unpkg.com/hls.js@1/dist/hls.min.js';
                fallback.async = true;
                fallback.setAttribute('data-hls-loader', 'true');
                fallback.onload = function () {
                    if (window.Hls) {
                        resolve(window.Hls);
                    } else {
                        reject(new Error('Hls.js fallback did not load.'));
                    }
                };
                fallback.onerror = reject;
                document.head.appendChild(fallback);
            };
            document.head.appendChild(script);
        });
    }

    function initPlayers() {
        qsa('.player-widget').forEach(function (widget) {
            var button = qs('[data-play-video]', widget);
            var video = qs('video', widget);
            var status = qs('[data-player-status]', widget);
            var source = widget.getAttribute('data-m3u8');
            var hlsInstance = null;
            var started = false;

            if (!button || !video || !source) {
                return;
            }

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('浏览器阻止了自动播放，请再次点击视频播放按钮。');
                    });
                }
            }

            button.addEventListener('click', function () {
                button.classList.add('is-hidden');

                if (started) {
                    playVideo();
                    return;
                }

                started = true;
                setStatus('正在加载影片...');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', playVideo, { once: true });
                    setStatus('正在播放。');
                    return;
                }

                loadHlsLibrary()
                    .then(function (Hls) {
                        if (!Hls || !Hls.isSupported()) {
                            throw new Error('当前浏览器暂不支持播放。');
                        }

                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: false,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                            setStatus('影片已准备就绪，正在播放。');
                            playVideo();
                        });
                        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setStatus('播放暂时失败，请刷新页面后重试。');
                                if (hlsInstance) {
                                    hlsInstance.destroy();
                                    hlsInstance = null;
                                }
                            }
                        });
                    })
                    .catch(function () {
                        video.src = source;
                        setStatus('正在尝试播放。');
                        playVideo();
                    });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroSlider();
        initSearchPage();
        initStaticFilters();
        initPlayers();
    });
}());
