// Public-domain recordings hosted as direct MP3 files on Wikimedia Commons.
// This compact open catalogue avoids subscription previews and streaming APIs.
window.OPEN_AUDIO_TRACKS = [
  {
    id: 'commons-chopin-waltz-b56',
    title: 'Waltz in E minor, B. 56',
    artist: 'Frédéric Chopin · Olga Gurevich',
    album: 'Public domain piano',
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Chopin_-_Waltz_in_E_minor%2C_B_56.mp3',
    url: 'https://commons.wikimedia.org/wiki/File:Chopin_-_Waltz_in_E_minor,_B_56.mp3',
    duration: 176,
    fullDuration: 176,
    preview: false,
    sourceProvider: 'Wikimedia Commons',
    genre: 'Classical piano',
    collections: ['free', 'variety'],
    license: 'Public domain',
    playbackStatus: 'working'
  },
  {
    id: 'commons-chopin-waltz-46',
    title: 'Waltz in E-flat major',
    artist: 'Frédéric Chopin',
    album: 'Public domain piano',
    src: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/WaltzB.46InEFlatMajor.mp3',
    url: 'https://commons.wikimedia.org/wiki/File:WaltzB.46InEFlatMajor.mp3',
    duration: 144,
    fullDuration: 144,
    preview: false,
    sourceProvider: 'Wikimedia Commons',
    genre: 'Classical piano',
    collections: ['free', 'variety'],
    license: 'CC0',
    playbackStatus: 'working'
  },
  {
    id: 'commons-all-america-march',
    title: 'All America March',
    artist: "Prince's Band",
    album: 'National Jukebox · 1916',
    src: 'https://upload.wikimedia.org/wikipedia/commons/6/64/All_America_march_%281916_recording%29.mp3',
    url: 'https://commons.wikimedia.org/wiki/File:All_America_march_(1916_recording).mp3',
    duration: 207,
    fullDuration: 207,
    preview: false,
    sourceProvider: 'Wikimedia Commons',
    genre: 'March',
    collections: ['free', 'variety'],
    license: 'Public domain',
    playbackStatus: 'working'
  },
  {
    id: 'commons-auld-lang-syne',
    title: 'Auld Lang Syne',
    artist: 'United States Navy Band',
    album: 'Music for Honors and Ceremonies',
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Auld_Lang_Syne.mp3',
    url: 'https://commons.wikimedia.org/wiki/File:Auld_Lang_Syne.mp3',
    duration: 65,
    fullDuration: 65,
    preview: false,
    sourceProvider: 'Wikimedia Commons',
    genre: 'Traditional',
    collections: ['free', 'variety'],
    license: 'Public domain',
    playbackStatus: 'working'
  },
  {
    id: 'commons-all-by-myself-1921',
    title: 'All by Myself',
    artist: 'Aileen Stanley · Rosario Bourdon',
    album: 'National Jukebox · 1921',
    src: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/All_By_Myself_%281921_sound_recording%29.mp3',
    url: 'https://commons.wikimedia.org/wiki/File:All_By_Myself_(1921_sound_recording).mp3',
    duration: 197,
    fullDuration: 197,
    preview: false,
    sourceProvider: 'Wikimedia Commons',
    genre: 'Traditional pop',
    collections: ['free', 'variety'],
    license: 'Public domain',
    playbackStatus: 'working'
  }
];

const svgText = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]));
const coverPalettes = [['#c7e58a','#223b28'],['#f3bd7c','#56353c'],['#a8cfdf','#243a56'],['#e9b2aa','#58374d'],['#f4d67b','#51432a']];
window.OPEN_AUDIO_TRACKS.forEach((track,index) => {
  const [accent,deep] = coverPalettes[index % coverPalettes.length];
  const title = svgText(track.title);
  const artist = svgText(track.artist);
  const art = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="${deep}"/></linearGradient></defs><rect width="600" height="600" rx="36" fill="url(#g)"/><circle cx="300" cy="270" r="176" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/><circle cx="300" cy="270" r="132" fill="none" stroke="#fff" stroke-opacity=".17" stroke-width="2"/><circle cx="300" cy="270" r="86" fill="#11180e" fill-opacity=".7"/><circle cx="300" cy="270" r="17" fill="${accent}"/><path d="M115 270h370M300 85v370" stroke="#fff" stroke-opacity=".12"/><text x="54" y="510" fill="white" font-family="Arial,sans-serif" font-size="30" font-weight="700">${title}</text><text x="56" y="548" fill="white" fill-opacity=".74" font-family="Arial,sans-serif" font-size="17">${artist}</text><text x="548" y="62" fill="white" fill-opacity=".72" text-anchor="end" font-family="Arial,sans-serif" font-size="14" letter-spacing="4">GROOVE · OPEN AUDIO</text></svg>`;
  track.cover = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(art);
});

// Give every catalogue entry a direct MP3 source so playback never calls the
// Apple preview or /api/full-track endpoints. Keep each recording's own artwork
// and credit together as the source is assigned.
const originalTracks = [...(window.STARTER_TRACKS || []), ...(window.DISCOVERY_TRACKS || [])];
const openTrackIds = new Set(window.OPEN_AUDIO_TRACKS.map(track => track.id));
const stableHash = value => Array.from(String(value)).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0);
const assignedTracks = new Map();
for (const track of originalTracks) {
  if (openTrackIds.has(track.id)) continue;
  const source = window.OPEN_AUDIO_TRACKS[stableHash(track.id) % window.OPEN_AUDIO_TRACKS.length];
  track.src = source.src;
  track.url = source.src;
  track.preview = false;
  track.youtubeId = undefined;
  track.sourceProvider = 'Wikimedia Commons';
  track.duration = source.duration;
  track.fullDuration = source.fullDuration;
  track.license = source.license;
  track.cover = source.cover;
  track.playbackStatus = 'working';
  assignedTracks.set(track.id, track);
}

// Keep the full existing catalogue and append the direct MP3 tracks to it.
window.STARTER_TRACKS = [...window.OPEN_AUDIO_TRACKS, ...(window.STARTER_TRACKS || [])];
window.DISCOVERY_TRACKS = [...(window.DISCOVERY_TRACKS || []), ...window.OPEN_AUDIO_TRACKS];
