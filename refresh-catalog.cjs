const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('tracks.js','utf8'),context);vm.runInContext(fs.readFileSync('catalog.js','utf8'),context);
async function get(url) { const response = await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Catalogue request failed: ${response.status}`);return response.json(); }
(async()=>{
 const chart = await get('https://rss.marketingtools.apple.com/api/v2/us/music/most-played/100/songs.json');
 fs.writeFileSync('chart-data.json',JSON.stringify(chart,null,2),'utf8');
 const ranks = new Map(chart.feed.results.map((s,i)=>[String(s.id),i+1]));
 const existing = new Map([...context.window.STARTER_TRACKS,...context.window.DISCOVERY_TRACKS].map(s=>[s.id,s]));
 const ids=[...new Set([...[...existing.keys()].filter(id=>/^\d+$/.test(id)),...ranks.keys()])],metadata=new Map();
 for(let i=0;i<ids.length;i+=50){const data=await get('https://itunes.apple.com/lookup?country=US&id='+ids.slice(i,i+50).join(','));for(const s of data.results)if(s.kind==='song')metadata.set(String(s.trackId),s);}
 const songs=[...existing.values()].filter(song=>song.sourceProvider || song.youtubeId);
 for(const id of ids){const m=metadata.get(id),old=existing.get(id);if(!m?.previewUrl && !old?.src)continue;songs.push({id,title:m?.trackName || old.title,artist:m?.artistName || old.artist,album:m?.collectionName || old.album,cover:m?.artworkUrl100?.replace('100x100bb','600x600bb') || old.cover,src:'',url:m?.trackViewUrl || old.url,duration:30,fullDuration:m?.trackTimeMillis ? Math.round(m.trackTimeMillis/1000) : old?.fullDuration || null,preview:true,genre:m?.primaryGenreName || old?.genre || '',collections:old?.collections || [],popularRank:ranks.get(id) || null});}
 songs.sort((a,b)=>(a.popularRank || 9999)-(b.popularRank || 9999)||a.title.localeCompare(b.title));
 if(songs.length<101)throw new Error('Incomplete catalogue');
 fs.writeFileSync('catalog.js','window.DISCOVERY_TRACKS = '+JSON.stringify(songs,null,2)+';\nwindow.CHART_INFO = '+JSON.stringify({name:chart.feed.title,updated:chart.feed.updated,country:'US',source:chart.feed.links?.[0]?.self || 'https://music.apple.com/us/browse'})+';\n');
 console.log(`Saved ${songs.length} songs, ${songs.filter(s=>s.popularRank).length} chart ranks, ${songs.filter(s=>s.fullDuration).length} song lengths.`);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
