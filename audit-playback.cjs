const fs=require('fs'),vm=require('vm'),{spawn}=require('child_process'),{chromium}=require('@playwright/test');
const context={window:{}};vm.createContext(context);for(const file of ['tracks.js','catalog.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const allSongs=[...new Map([...context.window.STARTER_TRACKS,...context.window.DISCOVERY_TRACKS].map(s=>[s.id,s])).values()];
const retry=process.argv.includes('--retry-transient');
const previous=retry?JSON.parse(fs.readFileSync('artifacts/playback-audit.json','utf8')):null;
const retryIds=new Set(previous?.results.filter(result=>result.status!=='working' && !/YouTube (100|101|150)/.test(result.message)).map(result=>result.id));
const songs=retry?allSongs.filter(song=>retryIds.has(song.id)):process.env.AUDIT_SCOPE==='verity'?allSongs.filter(s=>s.collections?.includes('verity')):allSongs;
const port=retry?3105:process.env.AUDIT_SCOPE==='verity'?3104:3103;
const report=process.env.AUDIT_SCOPE==='verity'?'artifacts/verity-playback-audit.json':'artifacts/playback-audit.json';
const results=previous?.results || [];let next=0,completed=0;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const server=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});let browser;
 try{
  for(let n=0;n<60;n++){try{if((await fetch('http://127.0.0.1:'+port)).ok)break;}catch{}await delay(250);}
  browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',args:['--autoplay-policy=no-user-gesture-required']});
  fs.mkdirSync('artifacts',{recursive:true});
  await Promise.all(Array.from({length:4},async()=>{
   const page=await browser.newPage();await page.goto('http://127.0.0.1:'+port);
   while(next<songs.length){
    const song=songs[next++];let result={id:song.id,title:song.title,artist:song.artist,provider:song.preview?'YouTube':song.sourceProvider};
    try{
     await page.evaluate(song=>{playSong(song,true);},song);
     await page.waitForFunction(preview=>preview?GrooveStream.playing || !document.getElementById('stream-retry').hidden:!document.getElementById('audio').paused && document.getElementById('audio').readyState>=3,song.preview,{timeout:22000}).catch(()=>{});
     if(song.preview && !await page.evaluate(()=>GrooveStream.playing)){
      const frame=page.frames().find(f=>f.url().includes('youtube.com/embed'));
      if(frame)await frame.locator('.ytp-large-play-button').click({timeout:1000}).catch(()=>{});
      await page.waitForFunction(()=>GrooveStream.playing || !document.getElementById('stream-retry').hidden,null,{timeout:3000}).catch(()=>{});
     }
     const playing=await page.evaluate(preview=>preview?GrooveStream.playing:!document.getElementById('audio').paused,song.preview);
     if(playing){
      await page.evaluate(preview=>{if(preview)GrooveStream.seek(35);else document.getElementById('audio').currentTime=35;},song.preview);
      await page.waitForFunction(preview=>{const audio=document.getElementById('audio');return preview?GrooveStream.playing && GrooveStream.currentTime>35.5:!audio.paused && audio.currentTime>35.5;},song.preview,{timeout:8000}).catch(()=>{});
      const state=await page.evaluate(preview=>{const a=document.getElementById('audio');return preview?{playing:GrooveStream.playing,time:GrooveStream.currentTime,duration:document.getElementById('duration').textContent}:{playing:!a.paused,time:a.currentTime,duration:a.duration};},song.preview);
      result={...result,...state,status:state.playing&&state.time>35.5?'working':'failed',message:song.preview?await page.locator('#stream-status').textContent():'Native full stream · '+song.sourceProvider};
     }else result={...result,status:'failed',message:song.preview?await page.locator('#stream-status').textContent():await page.locator('#audio').evaluate(a=>'Audio error '+(a.error?.code||'loading timeout'))};
    }catch(error){result={...result,status:'failed',message:error.message};}
    const existing=results.findIndex(entry=>entry.id===result.id);if(existing<0)results.push(result);else results[existing]=result;completed++;
    fs.writeFileSync(report,JSON.stringify({checkedAt:new Date().toISOString(),total:retry?allSongs.length:songs.length,tested:results.length,working:results.filter(r=>r.status==='working').length,results},null,2));
    console.log(`${completed}/${songs.length} ${result.status}: ${song.title} | ${result.message||''}`);
   }
   await page.close();
  }));
 }finally{await browser?.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
