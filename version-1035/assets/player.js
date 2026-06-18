import{H as Hls}from'./hls-vendor.js';
export function initMoviePlayer(source){
const video=document.getElementById('moviePlayer');
const trigger=document.querySelector('[data-play-trigger]');
const cover=document.querySelector('.player-cover');
let ready=false;
function attach(){
if(ready||!video)return;ready=true;
if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=source}else if(Hls&&Hls.isSupported()){const hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(source);hls.attachMedia(video);window.__hls=hls}else{video.src=source}
}
function start(){attach();if(cover)cover.classList.add('is-hidden');if(video){video.controls=true;const p=video.play();if(p&&p.catch)p.catch(()=>{})}}
[trigger,cover,video].forEach(el=>{if(el)el.addEventListener('click',start)});
}