const fs=require('fs'),vm=require('vm');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('catalog.js','utf8'),context);
for(const [youtubeId,title,duration] of [['lhCPiauHI-g','Lord Verity – Master of Humanity',140],['anhQ3fC1_hY','The Verity Band – Be My Friend',127]]){
 const id='yt-'+youtubeId;
 if(context.window.DISCOVERY_TRACKS.some(song=>song.id===id))continue;
 context.window.DISCOVERY_TRACKS.push({id,title,artist:'Horror Skunx',album:'Verity songs',cover:`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,remoteCover:`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,src:'',url:`https://www.youtube.com/watch?v=${youtubeId}`,duration,fullDuration:duration,preview:true,youtubeId,genre:'Viral & Gaming',popularRank:null,collections:['verity','tiktok']});
}
fs.writeFileSync('catalog.js','window.DISCOVERY_TRACKS = '+JSON.stringify(context.window.DISCOVERY_TRACKS,null,2)+';\nwindow.CHART_INFO = '+JSON.stringify(context.window.CHART_INFO)+';\n');
