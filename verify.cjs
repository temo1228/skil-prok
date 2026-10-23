const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const tags = require('jsmediatags');
const frame = (id, data) => { const header = Buffer.alloc(10); header.write(id); header.writeUInt32BE(data.length, 4); return Buffer.concat([header,data]); };
const content = Buffer.concat([frame('TIT2',Buffer.from('\0Embedded title')), frame('TPE1',Buffer.from('\0Embedded artist')), frame('APIC',Buffer.concat([Buffer.from('\0image/png\0\x03\0','binary'),Buffer.from([137,80,78,71])]))]);
const header = Buffer.from([73,68,51,3,0,0,0,0,0,0]); let size = content.length; for(let i=9;i>=6;i--){header[i]=size&127;size>>=7;}
const fixture = path.join(os.tmpdir(), `groove-tags-${process.pid}.mp3`);
fs.writeFileSync(fixture,Buffer.concat([header,content,Buffer.alloc(100)]));
const nodes = new Map();
function element() { return {value:'',files:[],dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},toggleAttribute(){},append(){},replaceChildren(){},addEventListener(name,fn){this['listener_'+name]=fn;}}; }
const get = s => { if(!nodes.has(s))nodes.set(s,element());return nodes.get(s); };
let pending;
const context = {console,Blob,URL,Uint8Array,setTimeout,clearTimeout,crypto:require('node:crypto').webcrypto,PlaylistStore:require('./playlist-store'),localStorage:{getItem(){return null;},setItem(){}},document:{querySelector:get,querySelectorAll(){return [];},createElement:element,createTextNode:text=>text,addEventListener(){}},window:{GrooveStream:{active:false,playing:false},STARTER_TRACKS:[{id:'one',title:'Song',artist:'Artist',preview:true,src:'test',duration:30}],jsmediatags:{read(file,callbacks){pending=callbacks;}}}};
vm.createContext(context); vm.runInContext(fs.readFileSync('app.js','utf8'),context);
const select = name => get('#audio-file').onchange({target:{files:[{name,type:'audio/mpeg'}]}});
(async()=>{
 try {
 const parsed = await new Promise((resolve,reject)=>tags.read(fixture,{onSuccess:resolve,onError:reject}));
 assert.equal(parsed.tags.title,'Embedded title'); assert.equal(parsed.tags.artist,'Embedded artist'); assert.equal(parsed.tags.picture.data.length,4);
 select('filename.mp3'); pending.onSuccess(parsed);
 assert.equal(get('#song-name').value,'Embedded title'); assert.equal(get('#song-artist').value,'Embedded artist'); assert.ok(get('#upload-cover-preview').src.startsWith('blob:'));
 select('untagged.mp3'); pending.onError({}); assert.equal(get('#song-name').value,'untagged'); assert.equal(get('#song-artist').value,'');
 select('custom.mp3'); get('#song-name').value='My edited title'; get('#song-name').listener_input(); get('#remove-cover').onclick(); pending.onSuccess(parsed);
 assert.equal(get('#song-name').value,'My edited title'); assert.ok(get('#upload-cover-preview').src.startsWith('data:'));
 select('first.mp3'); const stale=pending; select('second.mp3'); stale.onSuccess(parsed); assert.equal(get('#song-name').value,'second'); pending.onError({});
 assert.equal(get('#save-song').disabled,false);
 console.log('PASS: real ID3 title, artist and cover parsing; upload autofill; untagged fallback; user edits; cover removal; stale read protection.');
 } finally {fs.unlinkSync(fixture);}
})().catch(err=>{console.error(err);process.exitCode=1;});
