(() => {
 let player,readyPromise,request=0,poll,active=false,playing=false,currentSong=null,currentSource=null,currentVideoId=null,alternative=0,excluded=[];
 const find=id=>document.getElementById(id);
 function message(value){find('stream-status').textContent=value;}
 function dispatch(type,detail={}){document.dispatchEvent(new CustomEvent('groove-stream-'+type,{detail}));}
 function load(){
  if(readyPromise)return readyPromise;
  readyPromise=new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>{readyPromise=null;reject(new Error('YouTube could not connect. Please try again.'));},15000);
   const create=()=>{
    player=new YT.Player('youtube-host',{width:'100%',height:'220',host:'https://www.youtube.com',playerVars:{controls:1,playsinline:1,origin:location.origin},events:{
     onReady:()=>{clearTimeout(timeout);resolve(player);},
     onStateChange:event=>{if(!active || !currentVideoId)return;playing=event.data===YT.PlayerState.PLAYING;dispatch('state',{playing});if(playing){message('Full song · YouTube');dispatch('started',{song:currentSong});}else if(event.data===YT.PlayerState.CUED || event.data===YT.PlayerState.PAUSED)message('Press play to listen.');if(event.data===YT.PlayerState.ENDED){playing=false;dispatch('ended');}},
     onError:async event=>{if(!active || !currentVideoId)return;playing=false;dispatch('state',{playing:false});const version=request;const blocked=player.getVideoData?.().video_id || currentVideoId || currentSource?.videoId;if(blocked && !excluded.includes(blocked))excluded.push(blocked);const fallback=currentSource?.alternatives?.[alternative++];if([100,101,150].includes(event.data) && excluded.length<4){message('Trying another official recording…');try{let source=fallback;if(!source){const response=await fetch('/api/full-track?id='+encodeURIComponent(currentSong.id)+'&exclude='+encodeURIComponent(excluded.join(',')));const data=await response.json();if(!response.ok)throw new Error(data.error);source=data.source;}if(version!==request || !active)return;if(!fallback){currentSource=source;alternative=0;}currentVideoId=source.videoId;player.loadVideoById(source.videoId);return;}catch{if(version!==request)return;}}message(event.data===153?'YouTube needs a valid website referrer. Open this page through the web server.':'This recording cannot play here (YouTube '+event.data+'). Try another song.');find('stream-retry').hidden=false;}
    }});
   };
   if(window.YT?.Player)create();else{window.onYouTubeIframeAPIReady=create;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timeout);readyPromise=null;reject(new Error('YouTube could not connect. Please try again.'));};document.head.append(script);}
  });
  return readyPromise;
 }
 async function play(song){
  const version=++request;active=true;playing=false;currentSong=song;currentVideoId=null;alternative=0;excluded=[];find('stream-panel').hidden=false;find('stream-title').textContent=song.title+' · '+song.artist;find('stream-retry').hidden=true;message('Connecting to the full recording…');
  player?.stopVideo?.();dispatch('state',{playing:false});clearInterval(poll);
  try{
   const response=await fetch('/api/full-track?id='+encodeURIComponent(song.id));const data=await response.json();if(!response.ok)throw new Error(data.error);if(version!==request)return;
   currentSource=data.source;await load();if(version!==request)return;
   const audio=find('audio');player.setVolume(audio.muted?0:audio.volume*100);currentVideoId=data.source.videoId;player.loadVideoById(data.source.videoId);message('Press play in the video if playback does not start.');
   poll=setInterval(()=>{if(active && player?.getCurrentTime)dispatch('progress',{time:player.getCurrentTime(),duration:player.getDuration() || currentSource.duration});},250);
  }catch(error){if(version!==request)return;playing=false;message(error.message || 'Could not play the full recording.');find('stream-retry').hidden=false;dispatch('state',{playing:false});}
 }
 function stop(){++request;active=false;playing=false;player?.stopVideo?.();clearInterval(poll);find('stream-panel').hidden=true;dispatch('state',{playing:false});}
 window.GrooveStream={play,stop,get active(){return active;},get playing(){return playing;},get currentTime(){return player?.getCurrentTime?.() || 0;},toggle(){if(!currentVideoId || !find('stream-retry').hidden){if(currentSong)play(currentSong);return;}if(!player)return;if(playing)player.pauseVideo();else player.playVideo();},seek(time){player?.seekTo?.(time,true);},volume(volume,muted){player?.setVolume?.(muted?0:volume*100);}};
 document.addEventListener('DOMContentLoaded',()=>{find('stream-stop').onclick=stop;find('stream-retry').onclick=()=>currentSong && play(currentSong);find('audio').addEventListener('volumechange',()=>{const audio=find('audio');window.GrooveStream.volume(audio.volume,audio.muted);});});
})();
