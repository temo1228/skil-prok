const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const auth = require('./auth');
const fullTrackSource = require('./full-track-source.cjs');
const vm = require('node:vm');
const catalogueContext={window:{}};vm.createContext(catalogueContext);for(const name of ['tracks.js','catalog.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),catalogueContext);
const catalogueSongs=new Map([...catalogueContext.window.STARTER_TRACKS,...catalogueContext.window.DISCOVERY_TRACKS].map(song=>[song.id,song]));
const assistant = require('./assistant-api');
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const publicFiles = new Set(['index.html','style.css','features.css','account.css','polish.css','settings.css','settings.js','stream-player.js','beat-visualizer.js','app.js','tracks.js','catalog.js','playlist-store.js','i18n.js','languages.js','account.js','finder.js','music-search.js','vendor/jsmediatags.min.js']);
http.createServer((req,res) => {
 let pathname;
 try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
 if(pathname === '/api/full-track' && req.method === 'GET') { const song=catalogueSongs.get(new URL(req.url,'http://localhost').searchParams.get('id')); if(!song){res.writeHead(404,{'Content-Type':'application/json'}).end(JSON.stringify({error:'Song not found.'}));return;} fullTrackSource.resolve(song,(new URL(req.url,'http://localhost').searchParams.get('exclude') || '').split(',').filter(id=>/^[\w-]{11}$/.test(id)).slice(0,4)).then(source=>{res.writeHead(source?200:404,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(source?{source}:{error:'A full recording is not available for this song yet.'}));}).catch(()=>res.writeHead(503,{'Content-Type':'application/json'}).end(JSON.stringify({error:'Full-song connection is unavailable. Please try again.'})));return; }
 if(pathname.startsWith('/api/assistant')) { assistant(req,res,pathname); return; }
 if(pathname.startsWith('/api/')) { auth(req,res,pathname); return; }
 if(!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
 if(!publicFiles.has(pathname === '/' ? 'index.html' : pathname.slice(1)) && !/^\/locales\/[a-z]{2,3}(?:-[A-Z]{2})?\.json$/.test(pathname) && !/^\/assets\/covers\/[a-f0-9]{16}\.jpg$/.test(pathname)) { res.writeHead(404).end('Not found'); return; }
 const file = path.resolve(__dirname, '.' + (pathname === '/' ? '/index.html' : pathname));
 if (!file.startsWith(__dirname + path.sep)) { res.writeHead(403).end(); return; }
 fs.readFile(file,(err,data) => { if(err) { res.writeHead(404).end('Not found'); return; } res.writeHead(200,{'Content-Type':(types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'}); res.end(req.method === 'HEAD' ? undefined : data); });
}).listen(process.env.PORT || 3000, () => console.log('Groove is ready at http://localhost:' + (process.env.PORT || 3000)));
