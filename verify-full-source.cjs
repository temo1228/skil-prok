const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 let searches=0,saved;
 const video=videoId=>({videoRenderer:{videoId,title:{simpleText:'Lord Verity – Master of Humanity (Official Music Video)'},ownerText:{simpleText:'HorrorSkunx'},ownerBadges:[{metadataBadgeRenderer:{style:'BADGE_STYLE_TYPE_VERIFIED'}}],lengthText:{simpleText:'2:21'}}});
 const context={module:{exports:{}},require:name=>name==='node:fs'?{readFileSync:()=> '{}',writeFileSync:(file,value)=>saved=JSON.parse(value)}:require(name),__dirname:process.cwd(),fetch:async()=>{searches++;return {ok:true,text:async()=>'<script>var ytInitialData = '+JSON.stringify({contents:[video('lhCPiauHI-g'),video('alternate01')]})+';</script>'};},AbortSignal,URLSearchParams,Map,Date};
 vm.runInNewContext(fs.readFileSync('full-track-source.cjs','utf8'),context);
 const song={id:'test-verity',youtubeId:'lhCPiauHI-g',title:'Lord Verity – Master of Humanity',artist:'Horror Skunx',fullDuration:141};
 assert.equal((await context.module.exports.resolve(song)).videoId,'lhCPiauHI-g');assert.equal(searches,0);
 assert.equal((await context.module.exports.resolve(song,['lhCPiauHI-g'])).videoId,'alternate01');assert.equal(searches,1);assert.equal(saved[song.id].videoId,'alternate01');
 assert.equal(await context.module.exports.resolve(song,['lhCPiauHI-g','alternate01']),null);
 console.log('Verified pinned Verity playback fallback and excluded-video handling.');
})().catch(error=>{console.error(error);process.exitCode=1;});
