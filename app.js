const $ = s => document.querySelector(s);
const audio = $('#audio');
const fallback = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="#5a7141"/><stop offset="1" stop-color="#182713"/></linearGradient></defs><rect width="600" height="600" fill="url(#a)"/><circle cx="300" cy="300" r="190" fill="#171e13"/><circle cx="300" cy="300" r="80" fill="#c8ed85"/><text x="300" y="322" text-anchor="middle" font-size="65" fill="#25351a">♫</text></svg>');
const isVerity = song => song.collections?.includes('verity');
const starterIds = new Set(window.STARTER_TRACKS.filter(s => !isVerity(s)).map(s => s.id));
const catalogIds = new Set([...(window.DISCOVERY_TRACKS || []),...window.STARTER_TRACKS].map(s => s.id));
let songs = [...new Map([...window.STARTER_TRACKS, ...(window.DISCOVERY_TRACKS || [])].map(s => [s.id,s])).values()], current = songs.find(s => !isVerity(s)), view = 'home', filter = 'all', shuffled = false, repeating = false, db;
let playlistStorage;
try { playlistStorage = localStorage; } catch { playlistStorage = {getItem(){return null;},setItem(){throw new Error('Browser storage unavailable');}}; }
const playlists = new PlaylistStore(playlistStorage);
let activePlaylistId = null, activeArtist = null, queueIds = [...starterIds], pageSize = 30, editingPlaylistId = null, addingSongId = null, sortOrder = 'default', songCollection = 'all', linkingSongId = null;
const normalizeText = text => text.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
function artistNames(artist) { return artist.split(/\s*(?:,|&|\bfeat\.?|\bfeaturing)\s*/i).filter(Boolean); }
function songsByArtist(artist) { return songs.filter(s => artistNames(s.artist).some(name => name.toLowerCase() === artist.toLowerCase())); }
let playCounts={};try{playCounts=JSON.parse(localStorage.getItem('groove-play-counts') || '{}') || {};}catch{}
let countedSong=null;
let randomizedOrder=new Map();
function randomizeSongs(){
 const previous=visibleSongs().map(song=>song.id);
 const ids=songs.map(song=>song.id);
 for(let index=ids.length-1;index>0;index--){const target=Math.floor(Math.random()*(index+1));[ids[index],ids[target]]=[ids[target],ids[index]];}
 randomizedOrder=new Map(ids.map((id,index)=>[id,index]));sortOrder='random';$('#sort-songs').value='random';
 const reordered=visibleSongs().map(song=>song.id);
 if(previous.length>1 && reordered.every((id,index)=>id===previous[index])){const [first,second]=previous,firstRank=randomizedOrder.get(first);randomizedOrder.set(first,randomizedOrder.get(second));randomizedOrder.set(second,firstRank);}
 pageSize=30;queueIds=visibleSongs().map(song=>song.id);shuffled=false;$('#shuffle').setAttribute('aria-pressed','false');
 $('#sort-note').hidden=true;render();toast('Song order shuffled.');
}
function countPlay(song){if(countedSong===song.id)return;countedSong=song.id;playCounts[song.id]=(Number(playCounts[song.id])||0)+1;try{localStorage.setItem('groove-play-counts',JSON.stringify(playCounts));}catch{}}
const isPlaying=()=>window.GrooveStream.active?window.GrooveStream.playing:!audio.paused;
const isUpload=s=>!s.preview && !s.sourceProvider;
let likes;
try { likes = new Set(JSON.parse(localStorage.getItem('groove-likes') || '[]')); } catch { likes = new Set(); }
const format = n => `${Math.floor((n || 0) / 60)}:${String(Math.floor((n || 0) % 60)).padStart(2, '0')}`;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('#toast').classList.remove('visible'), 3800); }
function visibleSongs() {
 const q = normalizeText($('#search').value.trim());
 const saved = new Set([...starterIds,...likes,...playlists.items.flatMap(p => p.songIds)]);
 let source = songs;
 if (view === 'artist') source = songsByArtist(activeArtist);
 if (view === 'playlist') { const byId = new Map(songs.map(s => [s.id,s])); source = (playlists.get(activePlaylistId)?.songIds || []).map(id => byId.get(id)).filter(Boolean); }
 const list = source.filter(s => (view !== 'verity' || isVerity(s)) && (!['home','discover'].includes(view) || !isVerity(s)) && (view !== 'home' || q || starterIds.has(s.id)) && (view !== 'library' || isUpload(s) || saved.has(s.id)) && (view !== 'discover' || catalogIds.has(s.id)) && (view !== 'liked' || likes.has(s.id)) && (view !== 'uploads' || isUpload(s)) && (filter !== 'uploads' || isUpload(s)) && (filter !== 'preview' || catalogIds.has(s.id)) && (songCollection === 'all' || (songCollection === 'ready' ? s.playbackStatus==='working' || isUpload(s) : songCollection === 'popular' ? !!s.popularRank : s.collections?.includes(songCollection))) && normalizeText(`${s.title} ${s.artist} ${s.album || ''}`).includes(q));
 if (sortOrder === 'random') list.sort((a,b)=>(randomizedOrder.get(a.id)??Infinity)-(randomizedOrder.get(b.id)??Infinity));
 else if (sortOrder === 'used') list.sort((a,b)=>(Number(playCounts[b.id])||0)-(Number(playCounts[a.id])||0)||a.title.localeCompare(b.title));
 else if (sortOrder === 'popular') list.sort((a,b)=>(a.popularRank || Infinity)-(b.popularRank || Infinity)||a.title.localeCompare(b.title));
 else if (sortOrder === 'az' || sortOrder === 'za') list.sort((a,b)=>a.title.localeCompare(b.title,undefined,{sensitivity:'base',numeric:true})*(sortOrder === 'az' ? 1 : -1));
 else if (sortOrder === 'shortest' || sortOrder === 'longest') list.sort((a,b)=>{const x=a.fullDuration || (!a.preview ? a.duration : 0),y=b.fullDuration || (!b.preview ? b.duration : 0);if(!x)return y ? 1 : 0;if(!y)return -1;return (x-y)*(sortOrder === 'shortest' ? 1 : -1);});
 else if (sortOrder === 'default') {const priority=s=>s.playbackStatus==='working' || isUpload(s)?0:s.playbackStatus==='blocked'?2:1;list.sort((a,b)=>priority(a)-priority(b));}
 return list;
}
function render() {
 const list = visibleSongs(); $('#song-grid').replaceChildren();
 for (const song of list.slice(0,pageSize)) {
  const card = document.createElement('article'); card.className = 'song-card' + (current?.id === song.id && isPlaying() ? ' playing' : '');
  const cover = document.createElement('button'); cover.className = 'cover-button'; cover.setAttribute('aria-label', `Play ${song.title}`);
  const img = document.createElement('img'); img.src = song.cover || fallback; img.alt = `${song.title} cover`; img.loading = 'lazy'; img.onerror = () => { img.onerror = null; img.src = fallback; };
  const play = document.createElement('span'); play.className = 'card-play'; play.textContent = current?.id === song.id && isPlaying() ? 'Ⅱ' : '▶'; cover.append(img, play); cover.onclick = () => { queueIds = visibleSongs().map(s => s.id); playSong(song); };
  const title = document.createElement('h3'); title.textContent = song.title; title.title = song.title;
  const artist = document.createElement('div'); artist.className = 'song-artists';
  artistNames(song.artist).forEach((name,index) => { if(index) artist.append(document.createTextNode(', ')); const link = document.createElement('button'); link.className = 'artist-link'; link.textContent = name; link.title = `More songs by ${name}`; link.onclick = () => setView('artist',null,name); artist.append(link); });
  const like = document.createElement('button'); like.className = 'card-like' + (likes.has(song.id) ? ' is-liked' : ''); like.textContent = likes.has(song.id) ? '♥' : '♡'; like.setAttribute('aria-label', `${likes.has(song.id) ? 'Unlike' : 'Like'} ${song.title}`); like.onclick = () => toggleLike(song);
  const tag = document.createElement('span'); tag.className = 'song-tag'; tag.textContent = song.sourceProvider ? 'FULL SONG · '+song.sourceProvider.toUpperCase() : song.preview ? 'FULL SONG · YOUTUBE' : 'YOUR UPLOAD · FULL TRACK';
  if(song.playbackStatus==='blocked'){tag.textContent='UNAVAILABLE IN LAST CHECK';tag.title='The provider blocked embedded playback during the latest check. You can retry; availability varies by region.';tag.classList.add('song-unavailable');}
  else if(song.playbackStatus==='working')tag.title='Passed a live playback check beyond 35 seconds.';
  if(song.fullDuration) { const duration = document.createElement('span'); duration.className = 'card-duration'; duration.textContent = format(song.fullDuration); duration.title = 'Full song length'; cover.append(duration); }
  if(song.popularRank) { const rank = document.createElement('span'); rank.className = 'chart-rank'; rank.textContent = '#' + song.popularRank; rank.title = 'Apple Music US chart'; cover.append(rank); }
  const actions = document.createElement('div'); actions.className = 'song-actions';
  const add = document.createElement('button'); add.className = 'add-to-playlist'; add.textContent = '+ Playlist'; add.setAttribute('aria-label', `Add ${song.title} to a playlist`); add.onclick = () => openAddDialog(song); actions.append(add);
  if(isUpload(song)) { const download = document.createElement('button'); download.className = 'download-track'; download.textContent = '\u2193'; download.title = 'Download song'; download.setAttribute('aria-label','Download song'); download.onclick = () => downloadSong(song); actions.append(download); }
  if (view === 'playlist') { const remove = document.createElement('button'); remove.className = 'remove-from-playlist'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${song.title} from playlist`); remove.onclick = () => { try { playlists.remove(activePlaylistId,song.id); render(); toast('Song removed from playlist.'); } catch { toast('Could not save changes. Check browser storage.'); } }; actions.append(remove); }
  card.append(cover, title, artist, like, tag, actions); $('#song-grid').append(card);
 }
 $('#empty').hidden = list.length > 0; $('#track-count').textContent = `${list.length} ${list.length === 1 ? 'song' : 'songs'} in your orbit`;
 $('#like-count').textContent = likes.size; $('#upload-count').textContent = songs.filter(isUpload).length;
 $('#player-like').textContent = likes.has(current?.id) ? '♥' : '♡'; $('#player-like').classList.toggle('is-liked', likes.has(current?.id));
 $('#load-more').hidden = list.length <= pageSize;
 $('#results-summary').textContent = list.length > 30 ? `Showing ${Math.min(pageSize,list.length)} of ${list.length} songs` : '';
 renderPlaylists();
 renderArtistResults();
}
function toggleLike(song) { if (!song) return; likes.has(song.id) ? likes.delete(song.id) : likes.add(song.id); try { localStorage.setItem('groove-likes', JSON.stringify([...likes])); } catch { toast('Likes cannot be saved in this browser.'); } render(); }
function updatePlayer() { $('#player-cover').src = current.cover || fallback; $('#player-cover').onerror = () => { $('#player-cover').onerror = null; $('#player-cover').src = fallback; }; $('#player-title').textContent = current.title; $('#player-artist').textContent = current.artist; $('#preview-label').textContent = current.preview ? 'YOUTUBE · FULL SONG' : 'FULL TRACK'; $('#player-full-song').hidden = true; const mobile=$('.mobile-download'); if(mobile)mobile.hidden=!current.audioFile; $('#download-song').hidden = !current.audioFile; $('#duration').textContent = format(current.fullDuration || current.duration); $('#download-song').title = current.preview ? 'Add full audio to download this song' : 'Download your original audio file'; }
async function playSong(song, force = false) {
 if (!song) return;
 if(song.preview){if(!force && current?.id===song.id && window.GrooveStream.active){window.GrooveStream.toggle();return;}audio.pause();current=song;countedSong=null;updatePlayer();await window.GrooveStream.play(song);render();return;}
 window.GrooveStream.stop();
 const source = song.source || song.src || song.url;
 if (!source) { toast('This track has no audio source.'); return; }
 if(current?.id!==song.id)countedSong=null;
 if (!force && current?.id === song.id && audio.src && !audio.paused) { audio.pause(); return; }
 const resolvedSource = new URL(source, document.baseURI).href;
 current = { ...song, src: source };
 if (audio.src !== resolvedSource) {
  audio.pause();
  audio.removeAttribute('crossorigin');
  audio.src = source;
  audio.load();
 }
 updatePlayer();
 try { await audio.play(); countPlay(current); }
 catch (e) { if (e.name !== 'AbortError') toast(`Could not play ${current.title}. Check the connection or try another track.`); }
 render();
}
function next(direction = 1) { const byId = new Map(songs.map(s => [s.id,s])); const queue = queueIds.map(id => byId.get(id)).filter(Boolean); if (!queue.length) return; const index = queue.findIndex(s => s.id === current?.id); const target = (index + direction + queue.length) % queue.length; if (shuffled && queue.length > 1) { const others = queue.filter(s => s.id !== current?.id); return playSong(others[Math.floor(Math.random() * others.length)], true); } if(queue[target].id === current?.id) audio.currentTime = 0; playSong(queue[target], true); }
$('#play').onclick = () => window.GrooveStream.active ? window.GrooveStream.toggle() : audio.paused ? playSong(current || songs[0], true) : audio.pause();
$('#previous').onclick = () => { if(window.GrooveStream.active && window.GrooveStream.currentTime>3)window.GrooveStream.seek(0);else if (audio.currentTime > 3) audio.currentTime = 0; else next(-1); }; $('#next').onclick = () => next();
$('#play-mix').onclick = () => { setView('home'); const list=visibleSongs();queueIds=list.map(song=>song.id);playSong(list[0],true); };
$('#player-like').onclick = () => toggleLike(current);
$('#shuffle').onclick = () => { shuffled = !shuffled; $('#shuffle').setAttribute('aria-pressed', shuffled); };
$('#repeat').onclick = () => { repeating = !repeating; $('#repeat').setAttribute('aria-pressed', repeating); };
audio.volume = .7;
$('#volume').oninput = e => { audio.volume = Number(e.target.value); audio.muted = false; $('#mute').textContent = audio.volume ? '◖))' : '◖×'; };
$('#mute').onclick = () => { audio.muted = !audio.muted; $('#mute').textContent = audio.muted ? '◖×' : '◖))'; };
$('#seek').oninput = e => { if(window.GrooveStream.active)window.GrooveStream.seek((current.fullDuration || 0)*Number(e.target.value)/100);else if (Number.isFinite(audio.duration)) audio.currentTime = audio.duration * Number(e.target.value) / 100; };
audio.ontimeupdate = () => { $('#elapsed').textContent = format(audio.currentTime); $('#seek').value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0; };
audio.onloadedmetadata = () => { $('#duration').textContent = format(audio.duration); };
document.addEventListener('groove-stream-state',event=>{$('#play').textContent=event.detail.playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',event.detail.playing?'Pause':'Play');render();});
document.addEventListener('groove-stream-started',event=>countPlay(event.detail.song));
document.addEventListener('groove-stream-progress',event=>{const {time,duration}=event.detail;$('#elapsed').textContent=format(time);$('#duration').textContent=format(duration);$('#seek').value=duration?time/duration*100:0;if(duration)current.fullDuration=duration;});
document.addEventListener('groove-stream-ended',()=>{if(repeating)playSong(current,true);else if(window.GrooveSettings?.autoplay!==false)next();});
audio.onplay = () => { $('#play').textContent = 'Ⅱ'; $('#play').setAttribute('aria-label', 'Pause'); render(); };
audio.onpause = () => { $('#play').textContent = '▶'; $('#play').setAttribute('aria-label', 'Play'); render(); };
audio.onended = () => { if (repeating) { audio.currentTime = 0; playSong(current, true); } else if(window.GrooveSettings?.autoplay !== false) next(); };
audio.onerror = () => toast('Audio is unavailable. Try another song or upload your own.');
$('#search').oninput = () => { pageSize = 30; $('#hero').hidden = !!$('#search').value || view !== 'home'; render(); };
$('#search-nav').onclick = () => $('#search').focus();
function setView(nextView,playlistId = null,artist = null) {
 view = nextView; filter = 'all'; pageSize = 30; activePlaylistId = playlistId; activeArtist = artist; $('#search').value = ''; songCollection='all'; $('#song-collection').value='all';
 $('#verity-open').setAttribute('aria-pressed',String(view === 'verity'));
 const playlist = playlists.get(playlistId);
 for (const selector of ['#page-title','#breadcrumb','#section-title','#page-description']) $(selector).toggleAttribute('data-no-translate',view === 'playlist' || (view === 'artist' && selector !== '#page-description'));
 const names = {verity:'Verity songs',home:'Home',discover:'Discover',library:'Your library',liked:'Liked songs',uploads:'Your uploads',playlist:playlist?.name || 'Playlist',artist};
 $('#breadcrumb').textContent = names[view]; $('#page-title').textContent = view === 'home' ? 'Your music. Your space.' : names[view] + '.';
 $('#page-description').textContent = {verity:'Your Verity favorites, all in one place.',home:'A soundtrack for every version of you.',discover:`Explore ${songs.filter(s => catalogIds.has(s.id) && !isVerity(s)).length} songs. Find a favorite and make it part of your playlist.`,library:'Your starter songs, likes, playlist picks, and uploads.',liked:'The songs you keep coming back to.',uploads:'Your own sound. Your own collection.',playlist:playlist?.description || 'A soundtrack made by you.',artist:`More from ${artist}. Find your next favorite.`}[view];
 $('#hero').hidden = view !== 'home' || !!$('#search').value;
 $('#section-title').textContent = view === 'home' ? 'Made for your rotation ↗' : names[view];
 $('#section-description').textContent = view === 'home' ? 'A few favorites to get things started.' : view === 'discover' ? 'Stream full songs here. Find a favorite and save it to your playlists.' : 'Press play and make yourself at home.';
 $('#playlist-tools').hidden = view !== 'playlist';
 $('#artist-tools').hidden = view !== 'artist';
 $('.filter-row').hidden = view === 'playlist' || view === 'artist' || view === 'verity';
 if(view === 'artist') { const artistSongs = songsByArtist(artist); $('#artist-cover').src = artistSongs[0]?.cover || fallback; $('#artist-summary').textContent = `${artistSongs.length} songs in your orbit`; }
 $('#view-all').hidden = view !== 'home';
 $('#search').placeholder = view === 'playlist' ? 'Search this playlist' : 'Search songs, artists, or albums';
 document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));
 document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('selected', b.dataset.filter === 'all')); render();
}
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => setView(b.dataset.view));
document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { if (b.dataset.filter === 'preview') { setView('discover'); filter = 'preview'; } else if (b.dataset.filter === 'uploads') { setView('uploads'); filter = 'uploads'; } else { setView(view === 'discover' ? 'discover' : 'library'); } document.querySelectorAll('[data-filter]').forEach(x => x.classList.toggle('selected', x === b)); render(); });
$('#verity-open').onclick = () => setView('verity');
$('#view-all').onclick = () => setView('discover');
$('#empty-discover').onclick = () => setView('discover');
$('#load-more').onclick = () => { pageSize += 30; render(); };
$('#song-collection').onchange = e => { const selection=e.target.value; if(view==='home')setView('discover'); songCollection=selection; $('#song-collection').value=selection; pageSize=30;render(); };
$('#randomize-songs').onclick=randomizeSongs;
$('#sort-songs').onchange = e => { if(e.target.value==='random'){randomizeSongs();return;}sortOrder = e.target.value; pageSize = 30; $('#sort-note').hidden = !['popular','shortest','longest','used'].includes(sortOrder); $('#sort-note').textContent=sortOrder==='used'?'Most used counts song plays on this device.':'Popularity: Apple Music US chart. Length: full recording.'; render(); };
function downloadSong(song) { if(!song)return;if(song.preview || !song.audioFile) {openFullSong(song);return;}const extension=song.audioFile.name?.split('.').pop() || ({'audio/mpeg':'mp3','audio/wav':'wav','audio/mp4':'m4a','audio/ogg':'ogg','audio/flac':'flac'}[song.audioFile.type] || 'audio');const a=document.createElement('a');a.href=song.src;a.download=song.title.replace(/[<>:"/\\|?*\x00-\x1F]/g,'_')+'.'+extension;a.hidden=true;document.body.append(a);a.click();a.remove();}
$('#player-full-song').onclick = () => current && openFullSong(current);
$('#download-song').onclick = () => downloadSong(current);
const mobileDownload = document.createElement('button');mobileDownload.className='icon mobile-download';mobileDownload.setAttribute('aria-label','Download song');mobileDownload.textContent='\u2193';mobileDownload.onclick=()=>downloadSong(current);$('.now-playing').append(mobileDownload);
function renderArtistResults() {
 const q = normalizeText($('#search').value.trim()); $('#artist-results').replaceChildren();
 if(!q || view === 'playlist' || view === 'artist') { $('#artist-results').hidden = true; return; }
 const matches = [...new Set(songs.filter(s => view === 'verity' ? isVerity(s) : !['home','discover'].includes(view) || !isVerity(s)).flatMap(s=>artistNames(s.artist)))].filter(name=>normalizeText(name).includes(q)).slice(0,8);
 $('#artist-results').hidden = !matches.length;
 for(const name of matches) { const list = songsByArtist(name),button = document.createElement('button'); button.className = 'artist-result'; const image = document.createElement('img'); image.src = list[0]?.cover || fallback; image.alt = ''; const label = document.createElement('span'); label.textContent = name; label.setAttribute('data-no-translate',''); button.append(image,label); button.onclick = () => setView('artist',null,name); $('#artist-results').append(button); }
}
function openFullSong(song) { linkingSongId = song.id; $('#full-song-cover').src = song.cover || fallback; $('#full-song-title').textContent = song.title; $('#full-song-artist').textContent = song.artist; $('#open-full-song').href = song.url; $('#full-song-dialog').showModal(); }
$('#full-song-close').onclick = () => $('#full-song-dialog').close();
$('#upload-full-song').onclick = () => { const song = songs.find(s=>s.id === linkingSongId); $('#full-song-dialog').close(); openUpload(song); };
$('#player-artist').onclick = () => current && setView('artist',null,artistNames(current.artist)[0]);
$('#play-artist').onclick = () => { const list = visibleSongs(); queueIds = list.map(s => s.id); playSong(list[0],true); };
function renderPlaylists() {
 $('#playlist-nav').replaceChildren();
 for (const p of playlists.items) {
  const button = document.createElement('button'); button.className = 'nav playlist-nav-item' + (view === 'playlist' && activePlaylistId === p.id ? ' active' : ''); button.title = p.name;
  const icon = document.createElement('span'); icon.textContent = '\u266b';
  const name = document.createElement('b'); name.textContent = p.name;
  const count = document.createElement('small'); count.textContent = p.songIds.length;
  button.append(icon,name,count); button.onclick = () => setView('playlist',p.id); $('#playlist-nav').append(button);
 }
 if (!playlists.items.length) { const hint = document.createElement('p'); hint.className = 'playlist-hint'; hint.textContent = 'Your next favorite mix starts here.'; $('#playlist-nav').append(hint); }
 if (view === 'playlist') {
  const p = playlists.get(activePlaylistId); const count = p?.songIds.filter(id => songs.some(s => s.id === id)).length || 0;
  $('#playlist-summary').textContent = `${count} ${count === 1 ? 'song' : 'songs'} · Made by you`;
  $('#play-playlist').disabled = !count;
 }
}
function openPlaylistDialog(id = null, songId = null) {
 editingPlaylistId = id; addingSongId = songId;
 const p = playlists.get(id); $('#playlist-name').value = p?.name || ''; $('#playlist-description').value = p?.description || '';
 $('#playlist-dialog-title').textContent = id ? 'Edit your playlist.' : 'Create a playlist.';
 $('#save-playlist').textContent = id ? 'Save changes' : songId ? 'Create and add song' : 'Create playlist';
 $('#playlist-error').textContent = ''; $('#playlist-dialog').showModal(); $('#playlist-name').focus();
}
$('#create-playlist').onclick = () => openPlaylistDialog();
$('#new-playlist-mobile').onclick = () => openPlaylistDialog();
$('#close-playlist-dialog').onclick = () => $('#playlist-dialog').close();
$('#close-add-dialog').onclick = () => $('#add-dialog').close();
$('#create-from-add').onclick = () => { const id = addingSongId; $('#add-dialog').close(); openPlaylistDialog(null,id); };
$('#playlist-form').onsubmit = e => {
 e.preventDefault();
 if (!$('#playlist-name').value.trim()) { $('#playlist-error').textContent = 'Give your playlist a name.'; return; }
 try {
  let p;
  if (editingPlaylistId) { playlists.edit(editingPlaylistId,$('#playlist-name').value,$('#playlist-description').value); p = playlists.get(editingPlaylistId); }
  else { p = playlists.create($('#playlist-name').value,$('#playlist-description').value); if (addingSongId) playlists.add(p.id,addingSongId); }
  $('#playlist-dialog').close(); setView('playlist',p.id); toast(editingPlaylistId ? 'Playlist updated.' : 'Your playlist is ready.');
 } catch { $('#playlist-error').textContent = 'Could not save the playlist. Check your browser storage and try again.'; }
};
function openAddDialog(song) {
 addingSongId = song.id; $('#adding-song').textContent = `${song.title} · ${song.artist}`; $('#playlist-choices').replaceChildren();
 for (const p of playlists.items) {
  const button = document.createElement('button'); button.className = 'playlist-choice';
  const name = document.createElement('span'); name.textContent = p.name;
  const status = document.createElement('small'); status.textContent = p.songIds.includes(song.id) ? 'Already added' : '+ Add'; button.disabled = p.songIds.includes(song.id);
  button.append(name,status); button.onclick = () => { try { playlists.add(p.id,song.id); $('#add-dialog').close(); render(); toast(`Added to ${p.name}.`); } catch { toast('Could not save changes. Check browser storage.'); } }; $('#playlist-choices').append(button);
 }
 if (!playlists.items.length) { const hint = document.createElement('p'); hint.className = 'form-note'; hint.textContent = 'Create your first playlist to keep this song.'; $('#playlist-choices').append(hint); }
 $('#add-dialog').showModal();
}
$('#play-playlist').onclick = () => { const p = playlists.get(activePlaylistId); if (!p) return; queueIds = visibleSongs().map(song=>song.id); const first = queueIds.map(id => songs.find(s => s.id === id)).find(Boolean); if(first) { if(current?.id === first.id) audio.currentTime = 0; playSong(first,true); } };
$('#edit-playlist').onclick = () => openPlaylistDialog(activePlaylistId);
$('#delete-playlist').onclick = () => { const p = playlists.get(activePlaylistId); if (!p || !window.confirm(window.I18n ? I18n.t(`Delete "${p.name}"? Your songs will stay available.`) : `Delete "${p.name}"? Your songs will stay available.`)) return; try { playlists.delete(p.id); setView('library'); toast('Playlist deleted.'); } catch { toast('Could not delete playlist. Check browser storage.'); } };
function openUpload(song = null) { linkingSongId = song?.id || null; $('#upload-playlist').replaceChildren(); const option = document.createElement('option'); option.value = ''; option.textContent = 'Just my library'; $('#upload-playlist').append(option); for(const p of playlists.items) { const option = document.createElement('option'); option.value = p.id; option.textContent = p.name; option.setAttribute('data-no-translate',''); $('#upload-playlist').append(option); } $('#upload-playlist').value = view === 'playlist' ? activePlaylistId : ''; if(song) { $('#song-name').value = song.title; $('#song-artist').value = song.artist; } $('#upload-dialog').showModal(); }
document.querySelectorAll('.upload-trigger').forEach(b => b.onclick = () => openUpload());
$('#close-dialog').onclick = () => $('#upload-dialog').close();
$('#upload-dialog').onclick = e => { if (e.target === $('#upload-dialog')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } };
let selectedCover = null, coverPreviewURL = null, metadataVersion = 0;
const editedFields = new Set();
function previewCover(blob) {
 selectedCover = blob;
 if (coverPreviewURL) URL.revokeObjectURL(coverPreviewURL);
 coverPreviewURL = blob ? URL.createObjectURL(blob) : null;
 $('#upload-cover-preview').src = coverPreviewURL || fallback;
}
for (const field of ['song-name', 'song-artist']) $( '#' + field).addEventListener('input', () => editedFields.add(field));
$('#cover-file').onchange = e => { const file = e.target.files[0]; if (!file) return; if (!file.type.startsWith('image/')) { $('#form-error').textContent = 'Please choose an image for your cover.'; e.target.value = ''; return; } editedFields.add('cover'); previewCover(file); $('#form-error').textContent = ''; };
$('#remove-cover').onclick = () => { editedFields.add('cover'); $('#cover-file').value = ''; previewCover(null); };
$('#audio-file').onchange = e => {
 const file = e.target.files[0], version = ++metadataVersion;
 editedFields.clear(); previewCover(null); $('#cover-file').value = ''; $('#song-artist').value = ''; $('#form-error').textContent = '';
 $('#audio-label').textContent = file?.name || 'Choose an audio file';
 const linked = songs.find(s=>s.id === linkingSongId);
 $('#song-name').value = linked?.title || (file ? file.name.replace(/\.[^.]+$/, '') : ''); $('#song-artist').value = linked?.artist || '';
 if (!file) { $('#metadata-status').textContent = 'Choose a song to read its details.'; $('#save-song').disabled = false; return; }
 $('#metadata-status').textContent = 'Reading song details and cover photo…'; $('#save-song').disabled = true;
 let finished = false;
 const finish = tags => {
  if (version !== metadataVersion || finished) return;
  finished = true; clearTimeout(timer);
  if (tags.title && !editedFields.has('song-name')) $('#song-name').value = String(tags.title).slice(0,120);
  if (tags.artist && !editedFields.has('song-artist')) $('#song-artist').value = String(tags.artist).slice(0,120);
  const picture = Array.isArray(tags.picture) ? tags.picture[0] : tags.picture;
  if (picture?.data?.length && !editedFields.has('cover')) previewCover(new Blob([new Uint8Array(picture.data)], {type:picture.format || 'image/jpeg'}));
  $('#metadata-status').textContent = tags.title || tags.artist || picture ? 'Details filled in from your file. Change anything you like.' : 'No embedded details found. You can add a name, artist, and photo.';
  $('#save-song').disabled = false;
 };
 const timer = setTimeout(() => finish({}), 10000);
 try { window.jsmediatags.read(file, {onSuccess: result => finish(result.tags || {}), onError: () => finish({})}); } catch { finish({}); }
};
previewCover(null);
for (const event of ['dragenter','dragover']) $('#audio-drop').addEventListener(event,e => { e.preventDefault(); $('#audio-drop').classList.add('dragging'); });
for (const event of ['dragleave','drop']) $('#audio-drop').addEventListener(event,e => { e.preventDefault(); $('#audio-drop').classList.remove('dragging'); });
$('#audio-drop').addEventListener('drop',e => { const file = e.dataTransfer.files[0]; if(!file) return; if(!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|flac|aac|opus|webm)$/i.test(file.name)) { $('#form-error').textContent = 'Please choose an audio file.'; return; } const transfer = new DataTransfer(); transfer.items.add(file); $('#audio-file').files = transfer.files; $('#audio-file').onchange({target:$('#audio-file')}); });
const dbReady = new Promise(resolve => {
 if (!window.indexedDB) { resolve(null); return; }
 const request = indexedDB.open('groove-library', 1);
 request.onupgradeneeded = () => request.result.createObjectStore('songs', {keyPath:'id'});
 request.onerror = () => resolve(null);
 request.onsuccess = () => { db = request.result; const read = db.transaction('songs').objectStore('songs').getAll(); read.onsuccess = () => { for(const record of read.result) { const song = inflate(record), index = songs.findIndex(s=>s.id === song.id); if(index < 0) songs.push(song); else songs[index] = song; } if(current && !audio.src) { current = songs.find(s=>s.id === current.id); updatePlayer(); } render(); resolve(db); }; read.onerror = () => resolve(null); };
});
function inflate(record) { const original = songs.find(s=>s.id === record.linkedSongId); return {...original,...record, src:URL.createObjectURL(record.audioFile), cover:record.coverFile ? URL.createObjectURL(record.coverFile) : record.originalCover || fallback}; }
function readAudioDuration(file) { return new Promise(resolve=>{ const probe = document.createElement('audio'),url = URL.createObjectURL(file); let done = false; const finish = value => {if(done)return;done=true;clearTimeout(timer);probe.removeAttribute('src');probe.load();URL.revokeObjectURL(url);resolve(value);};const timer=setTimeout(()=>finish(0),4000);probe.onloadedmetadata=()=>finish(Number.isFinite(probe.duration)?probe.duration:0);probe.onerror=()=>finish(0);probe.preload='metadata';probe.src=url; }); }
$('#upload-form').onsubmit = async e => {
 e.preventDefault(); const file = $('#audio-file').files[0], cover = selectedCover; const title = $('#song-name').value.trim(); $('#form-error').textContent = '';
 if (!file || !title) { $('#form-error').textContent = 'Choose an audio file and enter a song name.'; return; }
 if (cover && !cover.type.startsWith('image/')) { $('#form-error').textContent = 'Please choose an image for your cover.'; return; }
 if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|flac|aac|opus|webm)$/i.test(file.name)) { $('#form-error').textContent = 'Please choose a supported audio file.'; return; }
 $('#save-song').disabled = true; $('#save-song').textContent = 'Saving…';
 try {
  const database = await dbReady; if (!database) throw new Error('Browser storage is unavailable. Enable site storage to save music.');
  const duration = await readAudioDuration(file); const original = songs.find(s=>s.id === linkingSongId);
  const record = {id:linkingSongId || 'local-' + crypto.randomUUID(),linkedSongId:linkingSongId,title,artist:$('#song-artist').value.trim() || 'Unknown artist',album:original?.album || 'Your uploads',audioFile:file,coverFile:cover || null,originalCover:original?.cover || null,preview:false,duration,fullDuration:duration || original?.fullDuration || 0};
  await new Promise((resolve,reject) => { const tx = database.transaction('songs','readwrite'); tx.objectStore('songs').put(record); tx.oncomplete = resolve; tx.onerror = () => reject(new Error('Could not save this song. Your browser storage may be full.')); tx.onabort = () => reject(new Error('Saving was interrupted. Please try again.')); });
  const inflated = inflate(record), existing = songs.findIndex(s=>s.id === record.id); if(existing < 0) songs.push(inflated); else songs[existing] = inflated;
  if(current?.id === record.id) { audio.pause(); current = inflated; audio.src = inflated.src; updatePlayer(); }
  let playlistWarning = false; const targetPlaylist = $('#upload-playlist').value;
  if (targetPlaylist) { try { playlists.add(targetPlaylist,record.id); } catch { playlistWarning = true; } }
  ++metadataVersion; $('#upload-form').reset(); previewCover(null); $('#metadata-status').textContent = 'Song details and artwork fill in automatically. Everything is editable.'; $('#audio-label').textContent = 'Drop your song here'; $('#upload-dialog').close(); $('#search').value = ''; setView(targetPlaylist && !playlistWarning ? 'playlist' : 'uploads',targetPlaylist); toast(playlistWarning ? 'Song saved, but could not add it to the playlist.' : 'Your song is ready. Make yourself at home.');
 } catch (err) { $('#form-error').textContent = err.message; } finally { $('#save-song').disabled = false; $('#save-song').textContent = 'Add to my music →'; }
};
document.addEventListener('keydown', e => { if (e.code === 'Space' && !['INPUT','TEXTAREA','BUTTON'].includes(e.target.tagName) && !document.querySelector('dialog[open]')) { e.preventDefault(); $('#play').click(); } });
updatePlayer(); render();
