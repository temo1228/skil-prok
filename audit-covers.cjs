const fs=require('fs'),vm=require('vm'),{chromium}=require('@playwright/test');
(async()=>{
 const context={window:{}};vm.createContext(context);for(const file of ['tracks.js','catalog.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
 const songs=[...new Map([...context.window.STARTER_TRACKS,...context.window.DISCOVERY_TRACKS].map(song=>[song.id,song])).values()];
 const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'});
 try{
  const page=await browser.newPage();await page.goto('http://localhost:3000');
  const covers=await page.evaluate(async urls=>{
   const results=[];let next=0;
   await Promise.all(Array.from({length:10},async()=>{while(next<urls.length){const url=urls[next++];results.push(await new Promise(resolve=>{const image=new Image();const timer=setTimeout(()=>resolve({url,ok:false,error:'timeout'}),12000);image.onload=()=>{clearTimeout(timer);resolve({url,ok:image.naturalWidth>20&&image.naturalHeight>20,width:image.naturalWidth,height:image.naturalHeight});};image.onerror=()=>{clearTimeout(timer);resolve({url,ok:false,error:'load failure'});};image.src=url;}));}}));
   return results;
  },[...new Set(songs.map(song=>song.cover))]);
  const failed=new Set(covers.filter(cover=>!cover.ok).map(cover=>cover.url));
  const report={checkedAt:new Date().toISOString(),songs:songs.length,covers:covers.length,failedSongs:songs.filter(song=>failed.has(song.cover)).map(({id,title,artist,cover,remoteCover})=>({id,title,artist,cover,remoteCover})),results:covers};
  fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/cover-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({songs:report.songs,covers:report.covers,failedSongs:report.failedSongs},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
