const {test,expect} = require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.route('https://fonts.gstatic.com/**',r=>r.abort());
 await page.goto('/');
});
test('clean text, large catalogue, pagination, search and artist pages',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await expect(page.locator('#song-grid .song-card')).toHaveCount(await page.evaluate(()=>starterIds.size));
 await expect.poll(()=>page.locator('.cover-button img').first().evaluate(image=>image.naturalWidth)).toBeGreaterThan(0);
 expect(await page.locator('body').innerText()).not.toMatch(/â€|â™|â†|Ã—|Â·|\uFFFD/);
 await page.locator('[data-view=discover]').click();
 expect(await page.evaluate(()=>visibleSongs().length)).toBeGreaterThan(200);
 await expect(page.locator('.song-card')).toHaveCount(30);
 await page.locator('#load-more').click();await expect(page.locator('.song-card')).toHaveCount(60);
 await page.locator('#search').fill('Dua Lipa');
 expect(await page.locator('.song-card').count()).toBeGreaterThan(5);
 await page.locator('.artist-link').filter({hasText:/^Dua Lipa$/}).first().click();
 await expect(page.locator('#artist-tools')).toBeVisible();
 await expect(page.locator('#page-title')).toHaveText('Dua Lipa.');
 expect(await page.locator('.song-card').count()).toBeGreaterThan(5);
 expect(errors).toEqual([]);
});
test('playlist creation, adding, duplicate prevention, persistence, rename and remove',async({page})=>{
 await page.locator('#create-playlist').click();await page.locator('#playlist-name').fill('Evening mix');await page.locator('#save-playlist').click();
 await expect(page.locator('#page-title')).toHaveText('Evening mix.');await expect(page.locator('#play-playlist')).toBeDisabled();
 await page.locator('[data-view=discover]').click();await page.locator('.add-to-playlist').first().click();await page.locator('.playlist-choice').first().click();
 await page.locator('.add-to-playlist').first().click();await expect(page.locator('.playlist-choice').first()).toBeDisabled();await page.locator('#close-add-dialog').click();
 await page.reload();await page.locator('.playlist-nav-item').first().click();await expect(page.locator('.song-card')).toHaveCount(1);await expect(page.locator('#play-playlist')).toBeEnabled();
 await page.locator('#edit-playlist').click();await page.locator('#playlist-name').fill('My favorites');await page.locator('#save-playlist').click();await expect(page.locator('#page-title')).toHaveText('My favorites.');
 await page.locator('.remove-from-playlist').click();await expect(page.locator('.song-card')).toHaveCount(0);
});
test('language switching, persistence and sign-in language selector',async({page})=>{
 await page.locator('#settings-open').click();
 for(const [language,label] of [['ru','Язык приложения'],['ka','აპლიკაციის ენა'],['zh','应用语言'],['es','Idioma de la aplicación'],['en','App language']]) {
  await page.locator('#settings-language').selectOption(language);await expect(page.locator('html')).toHaveAttribute('lang',language);await expect(page.locator('.language-label')).toHaveText(label);
 }
 await page.locator('#settings-language').selectOption('ka');await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','ka');
 await page.locator('#account-open').click();await expect(page.locator('#account-language')).toHaveCount(0);await page.locator('#account-close').click();await page.locator('#settings-open').click();await page.locator('#settings-language').selectOption('en');await page.locator('#settings-close').click();
});
test('registration, session, language preference, sign-out and login',async({page})=>{
 const email=`listener-${Date.now()}@example.com`;
 await page.locator('#account-open').click();await page.locator('#register-tab').click();await page.locator('#account-name').fill('Music listener');await page.locator('#account-email').fill(email);await page.locator('#account-password').fill('music-test-pass-123');await page.locator('#account-submit').click();
 await expect(page.locator('#account-dialog')).not.toBeVisible();await expect(page.locator('#account-open')).toHaveText('Music listener');
 await page.reload();await expect(page.locator('#profile-name')).toHaveText('Music listener');
 await page.locator('#settings-open').click();await page.locator('#settings-language').selectOption('ru');await expect.poll(async()=> (await (await page.request.get('/api/account')).json()).user.locale).toBe('ru');
 await page.locator('#sign-out').click();await expect(page.locator('#sign-out')).not.toBeVisible();await page.locator('#settings-language').selectOption('en');await page.locator('#settings-close').click();
 await page.locator('#account-open').click();await page.locator('#account-email').fill(email);await page.locator('#account-password').fill('incorrect-password');await page.locator('#account-submit').click();await expect(page.locator('#account-error')).toHaveText('Email or password is incorrect.');
 await page.locator('#account-password').fill('music-test-pass-123');await page.locator('#account-submit').click();await expect(page.locator('#account-dialog')).not.toBeVisible();
 expect((await page.request.get('/.data/accounts.json')).status()).toBe(404);expect((await page.request.get('/auth.js')).status()).toBe(404);
});
test('uploaded metadata remains editable and persists with custom cover',async({page})=>{
 const frame=(id,data)=>{const h=Buffer.alloc(10);h.write(id);h.writeUInt32BE(data.length,4);return Buffer.concat([h,data]);};
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==','base64');
 const content=Buffer.concat([frame('TIT2',Buffer.from('\0Embedded song')),frame('TPE1',Buffer.from('\0Test artist')),frame('APIC',Buffer.concat([Buffer.from('\0image/png\0\x03\0','binary'),png]))]);
 const header=Buffer.from([73,68,51,3,0,0,0,0,0,0]);let size=content.length;for(let i=9;i>=6;i--){header[i]=size&127;size>>=7;}
 await page.locator('.upload-trigger').first().click();await page.locator('#audio-file').setInputFiles({name:'file-name.mp3',mimeType:'audio/mpeg',buffer:Buffer.concat([header,content,Buffer.alloc(100)])});
 await expect(page.locator('#song-name')).toHaveValue('Embedded song');await expect(page.locator('#song-artist')).toHaveValue('Test artist');await expect(page.locator('#upload-cover-preview')).toHaveAttribute('src',/^blob:/);
 await page.locator('#song-name').fill('My custom title');await page.locator('#cover-file').setInputFiles({name:'cover.png',mimeType:'image/png',buffer:png});await page.locator('#save-song').click();
 await expect(page.locator('#upload-dialog')).not.toBeVisible();await expect(page.locator('.song-card h3')).toHaveText('My custom title');await page.reload();await page.locator('[data-view=uploads]').click();await expect(page.locator('.song-card h3')).toHaveText('My custom title');
});
test('mobile layout and upload dialog fit the viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.reload();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 await page.locator('.upload-button').click();await expect(page.locator('#upload-dialog')).toBeVisible();
 const box=await page.locator('#upload-dialog').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.width).toBeLessThanOrEqual(390);
 await page.screenshot({path:'test-results/upload-mobile.png'});
});
test('78 alphabetized languages, translated labels, and right-to-left layout',async({page})=>{
 await page.locator('#settings-open').click();
 const choices=await page.locator('#settings-language option').allTextContents();expect(choices.length).toBeGreaterThan(50);expect(choices).toEqual([...choices].sort((a,b)=>a.localeCompare(b,'en')));
 for(const [locale,label] of [['fr','Langue de l’application'],['de','App-Sprache'],['ja','アプリの言語']]){
  await page.locator('#settings-language').selectOption(locale);await expect(page.locator('html')).toHaveAttribute('lang',locale);await expect(page.locator('.language-label')).not.toHaveText('App language');
 }
 await page.locator('#settings-language').selectOption('ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');await page.locator('#settings-close').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
 await page.locator('#settings-open').click();await page.locator('#settings-language').selectOption('en');await expect(page.locator('html')).toHaveAttribute('dir','ltr');await expect(page.locator('.language-label')).toHaveText('App language');
});
test('sorting uses recording lengths, titles, and real chart ranks',async({page})=>{
 await page.locator('[data-view=discover]').click();
 for(const order of ['shortest','longest','az','za','popular']){
  await page.locator('#sort-songs').selectOption(order);
  const list=await page.evaluate(()=>visibleSongs().map(s=>({title:s.title,length:s.fullDuration,rank:s.popularRank})));
  if(order==='shortest'||order==='longest'){const values=list.map(s=>s.length).filter(Boolean);expect(values).toEqual([...values].sort((a,b)=>(a-b)*(order==='shortest'?1:-1)));}
  if(order==='az'||order==='za'){const values=list.map(s=>s.title);expect(values).toEqual([...values].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base',numeric:true})*(order==='az'?1:-1)));}
  if(order==='popular'){expect(list[0].rank).toBe(1);expect(list[1].rank).toBe(2);}
 }
 await page.screenshot({path:'test-results/discover-desktop.png',fullPage:false});
 await expect(page.locator('#playback-filter')).toHaveCount(0);
});
test('local music finder recommends matching catalogue songs',async({page})=>{
 await page.locator('#finder-open').click();await page.locator('#finder-input').fill('songs by Dua Lipa');await page.locator('#finder-send').click();
 await expect(page.locator('.finder-song')).toHaveCount(6);await expect(page.locator('.finder-song').first()).toContainText('Dua Lipa');
 await expect(page.locator('#finder-mode')).toHaveText('Local catalogue helper');await page.locator('.finder-song-add').first().click();await expect(page.locator('#add-dialog')).toBeVisible();
});
test('full uploaded audio plays past 30 seconds and downloads its original bytes',async({page})=>{
 const duration=34,sampleRate=8000,dataLength=duration*sampleRate*2;const wav=Buffer.alloc(44+dataLength);wav.write('RIFF');wav.writeUInt32LE(36+dataLength,4);wav.write('WAVE',8);wav.write('fmt ',12);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(dataLength,40);
 for(let i=0;i<dataLength/2;i++)wav.writeInt16LE(Math.round(Math.sin(i/sampleRate*440*Math.PI*2)*3000),44+i*2);
 await page.locator('.upload-button').click();await page.locator('#audio-file').setInputFiles({name:'full-track.wav',mimeType:'audio/wav',buffer:wav});await page.locator('#song-name').fill('Full track');await expect(page.locator('#save-song')).toBeEnabled();await page.locator('#save-song').click();await expect(page.locator('#upload-dialog')).not.toBeVisible();
 await page.locator('.cover-button').click();await expect.poll(()=>page.locator('#audio').evaluate(a=>a.duration)).toBe(34);await page.locator('#audio').evaluate(a=>a.currentTime=31);await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(30);
 const downloadPromise=page.waitForEvent('download');await page.locator('#download-song').click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('Full track.wav');const file=await download.path();expect(require('node:fs').readFileSync(file)).toEqual(wav);
});

test('searchable languages and phone registration and login',async({page})=>{
 await page.locator('#settings-open').click(); const picker=page.locator('#settings-dialog .language-picker');
 await expect(picker.locator('.language-option')).toHaveCount(121);
 await picker.locator('input').fill('belar'); await expect(picker.locator('.language-option')).toHaveCount(1); await picker.locator('.language-option').click(); await expect(page.locator('html')).toHaveAttribute('lang','be');
 await picker.locator('input').fill('zzzzzz'); await expect(picker.locator('.language-status')).toContainText('No languages found');
 await picker.locator('input').fill('English'); await picker.locator('.language-option').click(); await page.locator('#settings-close').click();
 await page.locator('#account-open').click(); await page.locator('#register-tab').click(); await page.locator('#phone-method').click(); await page.locator('#account-name').fill('Phone listener');
 const phone='+995'+String(Date.now()).slice(-9); await page.locator('#account-phone').fill(phone); await page.locator('#account-password').fill('phone-password-123'); await page.locator('#account-submit').click(); await expect(page.locator('#account-dialog')).not.toBeVisible();
 await page.locator('#settings-open').click(); await expect(page.locator('#settings-account-detail')).toHaveText(phone); await page.locator('#sign-out').click(); await page.locator('#settings-close').click();
 await page.locator('#account-open').click(); await page.locator('#phone-method').click(); await page.locator('#account-phone').fill(phone); await page.locator('#account-password').fill('wrong-password'); await page.locator('#account-submit').click(); await expect(page.locator('#account-error')).toContainText('incorrect'); await page.locator('#account-password').fill('phone-password-123'); await page.locator('#account-submit').click(); await expect(page.locator('#account-open')).toHaveText('Phone listener');
});

test('themes and listening preferences persist, affect playback, and reset',async({page})=>{
 await page.locator('#settings-open').click();
 await page.locator('[data-theme-choice=light]').click(); await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await expect(page.locator('[data-theme-choice=light]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#settings-large-text').check();await page.locator('#settings-reduced-motion').check();await page.locator('#settings-autoplay').uncheck();
 await page.locator('#settings-volume').fill('35');await page.locator('#settings-volume').dispatchEvent('input');await expect(page.locator('#volume')).toHaveValue('0.35');await expect(page.locator('#settings-volume-value')).toHaveText('35%');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');await expect(page.locator('html')).toHaveClass(/larger-text/);await expect(page.locator('html')).toHaveClass(/reduced-motion/);await expect(page.locator('#volume')).toHaveValue('0.35');
 expect(await page.locator('#audio').evaluate(a=>a.volume)).toBe(0.35);
 const source=await page.locator('#audio').evaluate(a=>a.src);await page.locator('#audio').dispatchEvent('ended');expect(await page.locator('#audio').evaluate(a=>a.src)).toBe(source);
 await page.locator('#settings-open').click();await expect(page.locator('#settings-autoplay')).not.toBeChecked();await page.screenshot({path:'test-results/settings-light.png'});
 await page.locator('#settings-reset').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await expect(page.locator('#settings-autoplay')).toBeChecked();await expect(page.locator('#settings-large-text')).not.toBeChecked();await expect(page.locator('#volume')).toHaveValue('0.7');
 await page.locator('[data-theme-choice=light]').click();await page.locator('#settings-close').click();await page.screenshot({path:'test-results/home-light.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('#settings-open').click();await page.screenshot({path:'test-results/settings-light-mobile.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const bounds=await page.locator('#settings-dialog').boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(390);
});

test('popular, TikTok, and variety collections contain searchable tracks',async({page})=>{
 await page.locator('[data-view=discover]').click();await page.locator('#song-collection').selectOption('tiktok');await expect(page.locator('.song-card').first()).toBeVisible();
 expect(await page.evaluate(()=>visibleSongs().length)).toBeGreaterThanOrEqual(15);expect(await page.evaluate(()=>visibleSongs().every(s=>s.collections.includes('tiktok')))).toBe(true);
 await page.locator('#search').fill('The One That Got Away');await expect(page.locator('.song-card')).toHaveCount(1);await expect(page.locator('.song-card')).toContainText('Katy Perry');
 await page.locator('#search').fill('');await page.locator('#song-collection').selectOption('variety');expect(await page.evaluate(()=>visibleSongs().length)).toBeGreaterThan(50);
 await page.locator('#song-collection').selectOption('popular');expect(await page.evaluate(()=>visibleSongs().every(s=>s.popularRank))).toBe(true);
 await page.locator('[data-view=home]').click();await expect(page.locator('#song-collection')).toHaveValue('all');await expect(page.locator('.song-card')).toHaveCount(5);
});


test('full catalogue playback uses YouTube, supports seeking past 30 seconds, and never requests previews',async({page})=>{
 let previewRequests=0;await page.route('**/*',async route=>{if(route.request().url().includes('audio-ssl.itunes.apple.com')){previewRequests++;await route.abort();}else await route.fallback();});
 await page.route('**/api/full-track?*',route=>route.fulfill({json:{source:{videoId:'tVlKLpxyCBY',duration:122,title:"It's me, It's Verity"}}}));
 await page.route('https://www.youtube.com/iframe_api',route=>route.fulfill({contentType:'application/javascript',body:`window.YT={PlayerState:{PLAYING:1,PAUSED:2,ENDED:0,CUED:5},Player:class{constructor(id,options){this.options=options;this.time=0;this.volume=70;const iframe=document.createElement('iframe');iframe.id=id;iframe.title='Full song';iframe.src='about:blank';document.getElementById(id).replaceWith(iframe);setTimeout(()=>options.events.onReady(),0);}loadVideoById(id){this.videoId=id;this.time=0;this.playVideo();}playVideo(){this.options.events.onStateChange({data:1});}pauseVideo(){this.options.events.onStateChange({data:2});}stopVideo(){}getCurrentTime(){return this.time;}getDuration(){return 122;}setVolume(value){this.volume=value;}seekTo(value){this.time=value;}}};window.onYouTubeIframeAPIReady();`}));
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.locator('.cover-button').first().click();await expect(page.locator('#stream-panel')).toBeVisible();await expect(page.locator('#play')).toHaveAttribute('aria-label','Pause');
 await page.locator('#seek').fill('40');await page.locator('#seek').dispatchEvent('input');await expect.poll(()=>page.evaluate(()=>GrooveStream.currentTime)).toBeGreaterThan(30);await expect(page.locator('#duration')).toHaveText('2:02');
 expect(await page.locator('#audio').evaluate(a=>a.getAttribute('src'))).toBeNull();expect(previewRequests).toBe(0);await expect(page.locator('#beat-visualizer')).toHaveAttribute('aria-label','Playback animation');
 await page.locator('#play').click();await expect(page.locator('#play')).toHaveAttribute('aria-label','Play');await page.locator('#play').click();await expect(page.locator('#play')).toHaveAttribute('aria-label','Pause');
 await page.locator('#sort-songs').selectOption('used');expect(await page.evaluate(()=>visibleSongs()[0].id)).toBe(await page.evaluate(()=>current.id));
 await page.locator('#settings-open').click();await page.locator('[data-theme-choice=green]').click();await expect(page.locator('html')).toHaveAttribute('data-theme','green');await page.locator('#settings-close').click();await page.screenshot({path:'test-results/full-song-green.png'});
 await page.locator('#stream-stop').click();await expect(page.locator('#stream-panel')).not.toBeVisible();
});

test('free full streams stay separate from uploads and use native audio playback',async({page})=>{
 const sampleRate=8000,seconds=34,size=sampleRate*seconds*2,wav=Buffer.alloc(44+size);wav.write('RIFF');wav.writeUInt32LE(size+36,4);wav.write('WAVE',8);wav.write('fmt ',12);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(size,40);
 await page.route('https://api.audius.co/v1/tracks/*/stream?*',route=>{const range=route.request().headers().range?.match(/bytes=(\d+)-(\d*)/);const start=range?Number(range[1]):0,end=range?.[2]?Math.min(Number(range[2]),wav.length-1):wav.length-1;return route.fulfill({status:range?206:200,contentType:'audio/wav',headers:{'Access-Control-Allow-Origin':'*','Accept-Ranges':'bytes',...(range?{'Content-Range':'bytes '+start+'-'+end+'/'+wav.length}:{})},body:wav.subarray(start,end+1)});});
 await expect(page.locator('#upload-count')).toHaveText('0');await page.locator('#song-collection').selectOption('free');expect(await page.locator('.song-card').count()).toBeGreaterThan(10);
 await page.locator('.cover-button').first().click();await expect.poll(()=>page.locator('#audio').evaluate(a=>a.duration)).toBe(34);await page.locator('#audio').evaluate(a=>a.currentTime=31);await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(30);
 await expect(page.locator('#stream-panel')).not.toBeVisible();await expect(page.locator('#download-song')).not.toBeVisible();await expect(page.locator('#beat-visualizer')).toHaveAttribute('aria-label','Audio frequency visualization');await page.locator('[data-view=uploads]').click();await expect(page.locator('#empty')).toBeVisible();
});

test('a blocked pinned Verity video retries another recording and failed playback can restart',async({page})=>{
 const lookups=[];let firstLookup=true;
 await page.route('**/api/full-track?*',route=>{
  const url=new URL(route.request().url());lookups.push(url.searchParams.get('exclude'));
  const source={videoId:url.searchParams.has('exclude')?'alternate01':'tVlKLpxyCBY',duration:122};
  if(firstLookup){firstLookup=false;return route.fulfill({status:503,json:{error:'Temporary connection failure'}});}
  return route.fulfill({json:{source}});
 });
 await page.route('https://www.youtube.com/iframe_api',route=>route.fulfill({contentType:'application/javascript',body:`window.YT={PlayerState:{PLAYING:1,PAUSED:2,ENDED:0,CUED:5},Player:class{constructor(id,options){this.options=options;this.time=0;setTimeout(()=>options.events.onReady(),0);}loadVideoById(id){this.videoId=id;setTimeout(()=>id==='tVlKLpxyCBY'?this.options.events.onError({data:150}):this.playVideo(),0);}getVideoData(){return {video_id:this.videoId};}playVideo(){this.options.events.onStateChange({data:1});}pauseVideo(){this.options.events.onStateChange({data:2});}stopVideo(){}getCurrentTime(){return this.time;}getDuration(){return 122;}setVolume(){}seekTo(value){this.time=value;}}};window.onYouTubeIframeAPIReady();`}));
 await page.locator('.cover-button').first().click();await expect(page.locator('#stream-retry')).toBeVisible();
 await page.locator('#play').click();await expect(page.locator('#play')).toHaveAttribute('aria-label','Pause');
 expect(lookups).toContain('tVlKLpxyCBY');await expect(page.locator('#stream-retry')).not.toBeVisible();
 await page.evaluate(()=>GrooveStream.seek(40));expect(await page.evaluate(()=>GrooveStream.currentTime)).toBe(40);
 await page.locator('[data-view=discover]').click();await page.locator('#song-collection').selectOption('verity');
 const titles=await page.locator('.song-card h3').allTextContents();expect(titles).toContain('Lord Verity – Master of Humanity');expect(titles).toContain('The Verity Band – Be My Friend');
});

test('shuffle songs changes the displayed order without losing songs and keeps a stable queue',async({page})=>{
 await page.locator('[data-view=discover]').click();await page.locator('#song-collection').selectOption('verity');
 const before=await page.evaluate(()=>visibleSongs().map(song=>song.id));
 await page.locator('#randomize-songs').click();await expect(page.locator('#sort-songs')).toHaveValue('random');
 const after=await page.evaluate(()=>visibleSongs().map(song=>song.id));expect([...after].sort()).toEqual([...before].sort());expect(after).not.toEqual(before);
 expect(await page.evaluate(()=>queueIds)).toEqual(after);await page.evaluate(()=>render());expect(await page.evaluate(()=>visibleSongs().map(song=>song.id))).toEqual(after);
 await page.locator('#randomize-songs').click();const reshuffled=await page.evaluate(()=>visibleSongs().map(song=>song.id));expect(reshuffled).not.toEqual(after);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await expect(page.locator('#randomize-songs')).toBeVisible();
 await page.screenshot({path:'test-results/shuffle-mobile.png'});
});

test('playback checked collection shows audited successes and blocked songs disclose their status',async({page})=>{
 await page.locator('[data-view=discover]').click();expect(await page.evaluate(()=>visibleSongs()[0].playbackStatus)).toBe('working');
 await page.locator('#song-collection').selectOption('ready');const checked=await page.evaluate(()=>visibleSongs());expect(checked.length).toBeGreaterThanOrEqual(39);expect(checked.every(song=>song.playbackStatus==='working')).toBe(true);
 await page.locator('#song-collection').selectOption('all');await page.locator('#search').fill('Blinding Lights');await expect(page.locator('.song-tag').first()).toHaveText('UNAVAILABLE IN LAST CHECK');
 await page.locator('#song-collection').selectOption('ready');await expect(page.locator('.song-card')).toHaveCount(0);
});
