import { H as Hls } from './hls-vendor-dru42stk.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach(function (card) {
  const shell = card.querySelector('[data-player-shell]');
  const cover = card.querySelector('[data-player-cover]');
  const video = card.querySelector('video');
  const source = video ? video.getAttribute('data-stream') : '';
  let started = false;
  let hls = null;

  function playVideo() {
    if (!video) {
      return;
    }

    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function start() {
    if (!video || !source || started) {
      return;
    }

    started = true;
    card.classList.add('is-playing');
    if (shell) {
      shell.classList.add('is-playing');
    }
    video.setAttribute('controls', 'controls');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal || !hls) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      playVideo();
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  }
});
