// Official artist recordings identified from the artists' public YouTube pages.
const fs=require('fs'),vm=require('vm');const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('catalog.js','utf8'),context);
const sources=JSON.parse(fs.readFileSync('full-sources.json','utf8'));
for(const [id,videoId,alternatives] of [
 ['525090710','0TFNGRYMz1U'],['1576350174','3YqPKLZF_WU'],['1623929730','j_sG_Juncn8'],
 ['604770244','4TYv2PhG89A'],['1440841382','JTVKr28GKzY',['qs50R_rRoJM']],
 ['1030116020','Y1INLCftBko'],['1458925223','IfCuarZqJzM'],['1531532767','jipQpjUA_o8']
]){
 const song=context.window.DISCOVERY_TRACKS.find(song=>song.id===id);if(!song)throw new Error('Missing '+id);
 sources[id]={videoId,title:song.title,channel:song.artist,duration:song.fullDuration,verifiedAt:new Date().toISOString(),sourceUrl:'https://www.youtube.com/watch?v='+videoId,alternatives:(alternatives||[]).map(videoId=>({videoId,title:song.title,channel:song.artist,duration:song.fullDuration}))};
}
fs.writeFileSync('full-sources.json',JSON.stringify(sources,null,2));console.log('Repaired eight missing official recording links. Playback still requires a live check.');
