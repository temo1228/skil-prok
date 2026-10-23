const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname,'full-sources.json');
let sources = {};
try { sources = JSON.parse(fs.readFileSync(file,'utf8')); } catch {}
const pending = new Map();
const normalize = value => value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function text(value) { return value?.simpleText || value?.runs?.map(run=>run.text).join('') || ''; }
function videos(value,result=[]) {
 if(!value || typeof value !== 'object') return result;
 if(value.videoRenderer) result.push(value.videoRenderer);
 for(const child of Object.values(value)) if(typeof child === 'object') videos(child,result);
 return result;
}
async function resolve(song,excluded=[]) {
 if(song.youtubeId && !excluded.includes(song.youtubeId)) return {videoId:song.youtubeId,title:song.title,channel:song.artist,duration:song.fullDuration || 0};
 if(sources[song.id] && !excluded.includes(sources[song.id].videoId)) return sources[song.id];
 const requestKey=song.id+':'+excluded.join(',');
 if(pending.has(requestKey)) return pending.get(requestKey);
 const task = (async()=>{
  const name=song.title.replace(/\s*[([](?:feat\.?|with|from|remaster|single version).*$/i,'').trim();
  const artists=song.artist.split(/,| & | feat\.? /i).map(value=>value.trim()).filter(Boolean),artist=artists[0];
  const response=await fetch('https://www.youtube.com/results?'+new URLSearchParams({search_query:artist+' '+name+' official audio',hl:'en'}),{signal:AbortSignal.timeout(18000),headers:{'Accept-Language':'en-US,en;q=0.9'}});
  if(!response.ok) throw new Error('Full-track search is unavailable.');
  const html=await response.text(),match=html.match(/(?:var ytInitialData|window\["ytInitialData"\])\s*=\s*(\{.*?\});<\/script>/s);
  if(!match) throw new Error('Full-track search is unavailable.');
  const candidates=videos(JSON.parse(match[1])).map(video=>{
   const title=text(video.title),channel=text(video.ownerText || video.longBylineText),parts=text(video.lengthText).split(':').map(Number);
   const duration=parts.reduce((sum,part)=>sum*60+part,0),target=normalize(name),mainArtist=normalize(artist);
   const verified=JSON.stringify(video.ownerBadges || []).includes('VERIFIED');
   const officialChannel=artists.some(value=>normalize(channel).includes(normalize(value))) || channel.endsWith(' - Topic') || ['SMTOWN','HYBE LABELS'].includes(channel);
   const correctTitle=normalize(title).includes(target);
   const correctArtist=normalize(title+' '+channel).includes(mainArtist);
   const excluded=/\b(cover|karaoke|reaction|tutorial|sped up|slowed|shorts|teaser|trailer|live performance)\b/i.test(title);
   const score=(verified?8:0)+(normalize(channel).includes(mainArtist)?12:0)+(/official (audio|music video|video|lyric)/i.test(title)?6:0)+(channel.endsWith(' - Topic')?10:0);
   return {videoId:video.videoId,title,channel,duration,score,valid:correctTitle && correctArtist && officialChannel && (verified || channel.endsWith(' - Topic')) && !excluded && duration>60 && duration<1200};
  }).filter(video=>video.valid && /^[\w-]{11}$/.test(video.videoId) && !excluded.includes(video.videoId)).sort((a,b)=>b.score-a.score);
  if(!candidates.length) return null;
  const {videoId,title,channel,duration}=candidates[0];
  const result={videoId,title,channel,duration,alternatives:candidates.slice(1,4).map(({videoId,title,channel,duration})=>({videoId,title,channel,duration})),verifiedAt:new Date().toISOString()};
  try { sources={...sources,...JSON.parse(fs.readFileSync(file,'utf8'))}; } catch {}
  sources[song.id]=result;
  fs.writeFileSync(file,JSON.stringify(sources,null,2));
  return result;
 })();
 pending.set(requestKey,task);
 try { return await task; } finally { pending.delete(requestKey); }
}
module.exports={resolve};
