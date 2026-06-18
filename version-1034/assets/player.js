import { H as Hls } from "./hls-dru42stk.js";

export function initPlayer(options) {
  const video = document.querySelector(options.video);
  const cover = document.querySelector(options.cover);
  const src = options.src;
  let ready = false;
  let hls = null;

  if (!video || !cover || !src) {
    return;
  }

  const playVideo = () => {
    const result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  };

  const loadVideo = () => {
    cover.classList.add("is-hidden");
    video.controls = true;

    if (ready) {
      playVideo();
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
      playVideo();
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
      playVideo();
      return;
    }

    video.src = src;
    video.load();
    playVideo();
  };

  cover.addEventListener("click", loadVideo);

  video.addEventListener("click", () => {
    if (video.paused) {
      loadVideo();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (hls) {
      hls.destroy();
    }
  });
}
