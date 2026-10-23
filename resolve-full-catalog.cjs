const fs=require('node:fs'),vm=require('node:vm');
const source=require('./full-track-source.cjs');
const context={window:{}};vm.createContext(context);
for(const name of ['tracks.js','catalog.js'])vm.runInContext(fs.readFileSync(name,'utf8'),context);
const allSongs=[...new Map([...context.window.STARTER_TRACKS,...context.window.DISCOVERY_TRACKS].map(song=>[song.id,song])).values()].filter(song=>song.preview);
const cache=JSON.parse(fs.readFileSync('full-sources.json','utf8'));
const songs=allSongs.filter(song=>!cache[song.id] && !song.youtubeId);
let position=0,matched=allSongs.length-songs.length;const missed=[];
async function worker(){while(position<songs.length){const song=songs[position++];try{const result=await source.resolve(song);if(result){matched++;console.log(matched+': '+song.artist+' — '+song.title);}else missed.push(song.id);}catch(error){missed.push(song.id);console.error(song.title+': '+error.message+' '+(error.cause?.code || ''));}await new Promise(resolve=>setTimeout(resolve,1200));}}
Promise.all([worker()]).then(()=>{fs.writeFileSync('full-source-report.json',JSON.stringify({total:allSongs.length,matched,missed},null,2));console.log('Full-track sources: '+matched+'/'+allSongs.length);});
