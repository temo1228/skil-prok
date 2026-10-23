const fs=require('node:fs');const vm=require('node:vm');const languages=require('./languages');
const source=fs.readFileSync('i18n.js','utf8');
const rows=vm.runInNewContext(source.slice(source.indexOf('const rows = ')+13,source.indexOf('\n const extraLabels')).replace(/;\s*$/,''));
const extras=vm.runInNewContext(source.slice(source.indexOf('const extraLabels = ')+20,source.indexOf('\n const locales')).replace(/;\s*$/,''));
const templates=vm.runInNewContext(source.slice(source.indexOf('const templates = ')+18,source.indexOf('\n let locale')).replace(/;\s*$/,''));
const originals=[...new Set([...rows.map(r=>r[0]),...extras,...templates.map(r=>r[1][0])])];
const primary=['en','ru','ka','zh','es'];fs.mkdirSync('locales',{recursive:true});
async function translateBatch(texts,code){
 const protectedTexts=texts.map(t=>t.replace(/\$(\d+)/g,'GROOVEVAR$1TOKEN'));
 const params=new URLSearchParams({client:'gtx',sl:'en',tl:code==='zh'?'zh-CN':code==='fil'?'tl':code,dt:'t',q:protectedTexts.join('\n')});
 for(let attempt=0;attempt<3;attempt++){
  try{const response=await fetch('https://translate.googleapis.com/translate_a/single?'+params,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Translation HTTP ${response.status}`);const data=await response.json();const lines=data[0].map(x=>x[0]||'').join('').trim().split(/\r?\n/).map(x=>x.trim().replace(/GROOVE\s*VAR\s*(\d+)\s*TOKEN/gi,'$$$1'));
   if(lines.length!==texts.length)throw new Error(`Translation line count ${lines.length}/${texts.length}`);return lines;
  }catch(error){if(attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,1500*(attempt+1)));}
 }
}
async function build([code]){
 const file=`locales/${code}.json`;let result={};if(fs.existsSync(file))result=JSON.parse(fs.readFileSync(file,'utf8'));
 if(code==='en'){fs.writeFileSync(file,JSON.stringify(Object.fromEntries(originals.map(s=>[s,s])),null,2));return;}
 const index=primary.indexOf(code);if(index>0){for(const row of rows)result[row[0]]=row[index];for(const [,values] of templates)result[values[0]]=values[index];}
 const missing=originals.filter(t=>!result[t]);
 const batches=[];let batch=[],length=0;for(const text of missing){if(length+text.length>2800){batches.push(batch);batch=[];length=0;}batch.push(text);length+=text.length+1;}if(batch.length)batches.push(batch);
 for(const texts of batches){const values=await translateBatch(texts,code);texts.forEach((text,i)=>result[text]=values[i]);fs.writeFileSync(file,JSON.stringify(result,null,2),'utf8');await new Promise(resolve=>setTimeout(resolve,150));}
 console.log(`${code}: ${Object.keys(result).length} translated labels`);
}
let position=0,failures=[];
async function worker(){while(position<languages.length){const language=languages[position++];try{await build(language);}catch(error){failures.push(language[0]);console.error(`${language[0]}: ${error.message}`);}}}
Promise.all([worker(),worker(),worker()]).then(()=>{console.log(`Language packs: ${languages.length-failures.length}/${languages.length}`);if(failures.length){console.error('Incomplete: '+failures.join(','));process.exitCode=1;}});
