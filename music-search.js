(function(root){
 const clean = s => String(s).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
 const stop = new Set('a an the me i some something songs song music find want need for by from please like give show with to of and that listen can you my more'.split(' '));
 const moods = [
  {pattern:/night|chill|calm|relax|sleep|ноч|спокой|ღამ|მშვიდ|夜|放松|noche|tranquil/i,artists:/weeknd|billie|sza|neighbourhood|adele|frank ocean|lana del rey/i,genres:/r&b|alternative|ambient/i},
  {pattern:/workout|gym|energy|dance|party|run|тренир|танц|ვარჯიშ|ცეკვ|运动|派对|entren|fiesta/i,artists:/dua lipa|bruno mars|ariana|sabrina|beyonce|beyoncé|bad bunny|drake/i,genres:/dance|hip-hop|pop/i},
  {pattern:/sad|heartbreak|cry|груст|სევდ|悲伤|triste/i,artists:/adele|billie|sza|taylor swift|olivia rodrigo/i,genres:/singer|alternative/i},
  {pattern:/happy|summer|sun|joy|весел|ზაფხულ|მხიარულ|快乐|夏|feliz|verano/i,artists:/harry styles|bruno mars|dua lipa|coldplay|sabrina/i,genres:/pop/i},
  {pattern:/focus|study|work|учеб|სწავლ|学习|estudi/i,artists:/billie|coldplay|adele|ed sheeran/i,genres:/alternative|singer/i}
 ];
 function find(catalog,query){
  const q=clean(query),tokens=q.split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>1&&!stop.has(t)),mood=moods.find(m=>m.pattern.test(q));
  const requestedArtists=[...new Set(catalog.map(s=>s.artist))].filter(a=>q.includes(clean(a)));
  let ranked=catalog.map(song=>{const title=clean(song.title),artist=clean(song.artist),genre=clean(song.genre || '');let score=0;if(q.includes(title)&&title.length>3)score+=100;if(requestedArtists.includes(song.artist))score+=80;for(const token of tokens){if(title.includes(token))score+=8;if(artist.includes(token))score+=10;if(genre.includes(token))score+=3;}if(mood){if(mood.artists.test(song.artist))score+=16;if(mood.genres.test(song.genre || ''))score+=4;}return {song,score};}).filter(r=>r.score>0);
  if(/popular|hits|top|популяр|პოპულარულ|热门|popular/i.test(q)){if(!ranked.length)ranked=catalog.map(song=>({song,score:0}));ranked.sort((a,b)=>(a.song.popularRank || 9999)-(b.song.popularRank || 9999));}
  else ranked.sort((a,b)=>b.score-a.score||(a.song.popularRank || 9999)-(b.song.popularRank || 9999));
  if(/short|long|корот|длин|მოკლე|გრძელი|最短|最长|corta|larga/i.test(q)){if(!ranked.length)ranked=catalog.map(song=>({song,score:0}));const reverse=/long|длин|გრძელი|最长|larga/i.test(q);ranked=ranked.filter(r=>r.song.fullDuration).sort((a,b)=>(a.song.fullDuration-b.song.fullDuration)*(reverse?-1:1));}
  return {songIds:ranked.slice(0,6).map(r=>r.song.id),message:ranked.length ? (mood ? 'Here are a few picks for that mood. Try one, or tell me an artist you like.' : 'These songs match your request. Play a full song or save a favorite to your playlist.') : 'I could not find a match in this catalogue. Try an artist name, song title, or a mood like chill or workout.'};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=find;else root.findMusicLocally=find;
})(globalThis);
