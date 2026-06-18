(function () {
  function init(streamUrl, posterImage) {
    var video = document.getElementById('movie-video');
    var layer = document.getElementById('player-layer');
    var button = document.getElementById('player-start');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    if (posterImage) {
      video.setAttribute('poster', posterImage);
    }

    function attachStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }

      attachStream();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (layer) {
      layer.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
