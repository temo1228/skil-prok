const fs=require('node:fs');const {spawnSync}=require('node:child_process');
const files=['stream-player.js','beat-visualizer.js','full-track-source.cjs','settings.js','app.js','server.js','auth.js','account.js','i18n.js','languages.js','playlist-store.js','music-search.js','assistant-api.js','finder.js','catalog.js','tracks.js'];
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
const languages=require('./languages');const reference=Object.keys(JSON.parse(fs.readFileSync('locales/en.json','utf8')));
for(const [code] of languages){const pack=JSON.parse(fs.readFileSync(`locales/${code}.json`,'utf8'));for(const key of reference){if(typeof pack[key]!=='string'||!pack[key].trim())throw new Error(`Missing ${code}: ${key}`);for(const token of key.match(/\$\d+/g)||[])if(!pack[key].includes(token))throw new Error(`Missing placeholder ${code}: ${key}`);}}
const html=fs.readFileSync('index.html','utf8');if(/â€|â™|â†|Ã—|Â·|\uFFFD/.test(html))throw new Error('Corrupted HTML encoding');
console.log(`Validated ${files.length} scripts and ${languages.length} complete language packs.`);
