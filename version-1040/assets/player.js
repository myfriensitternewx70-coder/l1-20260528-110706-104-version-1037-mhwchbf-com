(function () {
  function init() {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("play-button");
    var streamPath = window.currentStreamUrl;
    var hlsInstance = null;

    if (!video || !button || !streamPath) {
      return;
    }

    function playVideo() {
      button.classList.add("is-hidden");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = streamPath;
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(streamPath);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (!video.src) {
        video.src = streamPath;
      }
      video.play().catch(function () {});
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
