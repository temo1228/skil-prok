const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
(async()=>{
 const context={window:{}};vm.createContext(context);for(const file of ['tracks.js','catalog.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
 const report=JSON.parse(fs.readFileSync('artifacts/cover-audit.json','utf8'));
 for(const failed of report.failedSongs){
  const songs=[...context.window.STARTER_TRACKS,...context.window.DISCOVERY_TRACKS].filter(song=>song.id===failed.id);
  const song=songs[0];if(!song)continue;
  const urls=[];
  if(song.sourceProvider==='Audius'){
   const response=await fetch('https://api.audius.co/v1/tracks/'+song.id.replace('audius-','')+'?app_name=Groove',{signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('Audius metadata: '+response.status);
   const data=(await response.json()).data;
   const original=data.artwork?.['480x480'];
   if(original)for(const mirror of data.artwork.mirrors || [])urls.push(new URL(new URL(original).pathname,mirror).href);
   for(const key of ['480x480','1000x1000','150x150'])if(data.artwork?.[key])urls.push(data.artwork[key]);
  }
  if(song.remoteCover)urls.push(song.remoteCover);if(song.cover?.startsWith('https://'))urls.push(song.cover);
  let fixed=false;
  for(const url of [...new Set(urls)]){
   try{
    const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('HTTP '+response.status);
    const type=response.headers.get('content-type');if(!type?.startsWith('image/'))throw new Error('Not an image');
    const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<100)throw new Error('Empty image');
    const file='assets/covers/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,16)+'.jpg';fs.writeFileSync(file,bytes);
    for(const copy of songs){copy.cover=file;copy.remoteCover=url;}
    console.log('Fixed:',song.title,file);fixed=true;break;
   }catch(error){console.log('Cover failed:',url,error.message);}
  }
  if(!fixed)throw new Error('Could not repair '+song.title);
 }
 fs.writeFileSync('tracks.js','window.STARTER_TRACKS = '+JSON.stringify(context.window.STARTER_TRACKS,null,2)+';\n');
 fs.writeFileSync('catalog.js','window.DISCOVERY_TRACKS = '+JSON.stringify(context.window.DISCOVERY_TRACKS,null,2)+';\nwindow.CHART_INFO = '+JSON.stringify(context.window.CHART_INFO)+';\n');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
