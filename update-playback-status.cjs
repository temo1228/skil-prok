const fs=require('fs'),vm=require('vm');
const audit=JSON.parse(fs.readFileSync('artifacts/playback-audit.json','utf8'));
if(audit.tested!==audit.total)throw new Error('Complete the catalogue playback audit before updating status.');
const verity=JSON.parse(fs.readFileSync('artifacts/verity-playback-audit.json','utf8'));
const results=new Map([...audit.results,...verity.results].map(result=>[result.id,result]));
const context={window:{}};vm.createContext(context);
for(const file of ['tracks.js','catalog.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
for(const song of [...context.window.STARTER_TRACKS,...context.window.DISCOVERY_TRACKS]){
 const result=results.get(song.id);if(!result)continue;
 song.playbackStatus=result.status==='working'?'working':/YouTube (100|101|150)/.test(result.message)?'blocked':'unavailable';
 song.playbackCheckedAt=audit.checkedAt;
 if(result.status==='working' && typeof result.duration==='string'){song.fullDuration=result.duration.split(':').map(Number).reduce((sum,value)=>sum*60+value,0);}
}
fs.writeFileSync('tracks.js','window.STARTER_TRACKS = '+JSON.stringify(context.window.STARTER_TRACKS,null,2)+';\n');
fs.writeFileSync('catalog.js','window.DISCOVERY_TRACKS = '+JSON.stringify(context.window.DISCOVERY_TRACKS,null,2)+';\nwindow.CHART_INFO = '+JSON.stringify(context.window.CHART_INFO)+';\n');
console.log('Updated '+results.size+' playback statuses.');
