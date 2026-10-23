(() => {
 const canvas=document.getElementById('beat-visualizer'),ctx=canvas.getContext('2d'),audio=document.getElementById('audio');
 let context,analyser,bins,frame;
 function init(){
  if(context){context.resume().catch(()=>{});return;}
  try{context=new AudioContext();analyser=context.createAnalyser();analyser.fftSize=128;context.createMediaElementSource(audio).connect(analyser);analyser.connect(context.destination);bins=new Uint8Array(analyser.frequencyBinCount);}catch{}
 }
 function draw(){
  const streaming=window.GrooveStream?.active,playing=streaming?window.GrooveStream.playing:!audio.paused;
  const reduced=document.documentElement.classList.contains('reduced-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(playing && !reduced){
   canvas.setAttribute('aria-label',streaming?'Playback animation':'Audio frequency visualization');
   const color=getComputedStyle(document.documentElement).getPropertyValue('--beat-color').trim() || '146, 203, 92';
   if(!streaming && analyser)analyser.getByteFrequencyData(bins);
   const count=48,width=canvas.width/count,time=(streaming?window.GrooveStream.currentTime:audio.currentTime);
   for(let i=0;i<count;i++){
    // Cross-origin video audio is unavailable to Web Audio. Video uses an explicitly labelled playback animation.
    const value=streaming?(Math.sin(time*5+i*.8)+Math.sin(time*2.7-i*.5)+2)/4:(bins?.[Math.floor(i/count*(bins.length-1))] || 0)/255;
    const height=value*canvas.height*.85;ctx.fillStyle='rgba('+color+', '+(.12+value*.22)+')';ctx.fillRect(i*width,canvas.height-height,width-3,height);
   }
  }
  frame=requestAnimationFrame(draw);
 }
 audio.addEventListener('play',init);
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);if(!document.hidden)draw();});
 draw();
})();
