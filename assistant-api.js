const fs=require('node:fs');const vm=require('node:vm');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'catalog.js'),'utf8'),context);
const catalog=context.window.DISCOVERY_TRACKS.map(s=>({id:s.id,title:s.title,artist:s.artist,genre:s.genre,duration:s.fullDuration}));
const ids=new Set(catalog.map(s=>s.id)),limits=new Map();
module.exports=async(req,res,pathname)=>{
 const reply=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(pathname==='/api/assistant/status'&&req.method==='GET'){reply(200,{configured:!!process.env.OPENAI_API_KEY});return;}
 if(pathname!=='/api/assistant'||req.method!=='POST'){reply(404,{error:'Not found.'});return;}
 if(req.headers.origin&&![`http://${req.headers.host}`,`https://${req.headers.host}`].includes(req.headers.origin)){reply(403,{error:'Request not allowed.'});return;}
 if(!process.env.OPENAI_API_KEY){reply(200,{mode:'local'});return;}
 try{
  const ip=req.socket.remoteAddress,now=Date.now();for(const [key,item] of limits)if(now>item.until)limits.delete(key);const rate=limits.get(ip)||{count:0,until:now+60000};limits.set(ip,rate);if(++rate.count>12){reply(429,{error:'Please wait a moment before trying again.'});return;}
  let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>8192){reply(413,{error:'Message is too long.'});return;}}
  const input=JSON.parse(body);if(typeof input.message!=='string'||!input.message.trim()||input.message.length>500){reply(400,{error:'Describe the music you want in 500 characters or fewer.'});return;}
  const history=Array.isArray(input.history)?input.history.slice(-6).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,1000)})):[];
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(25000),body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',store:false,instructions:'You are Groove music finder. Help the user find music by artist, title, mood, or description. Only recommend IDs in the supplied catalogue. Catalogue tracks have previews; do not claim full playback. Ask a short clarification if needed. Reply in the language used by the user. Never invent catalogue songs or lyrics. Return at most 6 song IDs. Catalogue: '+JSON.stringify(catalog),input:[...history,{role:'user',content:input.message}],text:{format:{type:'json_schema',name:'music_recommendations',strict:true,schema:{type:'object',properties:{message:{type:'string'},songIds:{type:'array',items:{type:'string'}}},required:['message','songIds'],additionalProperties:false}}},max_output_tokens:1200})});
  if(!response.ok){reply(502,{error:'The AI connection is unavailable. Using local suggestions instead.'});return;}
  const data=await response.json();const text=(data.output||[]).flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('');const result=JSON.parse(text);
  if(typeof result.message!=='string'||!Array.isArray(result.songIds))throw new Error('Invalid response');
  reply(200,{mode:'ai',message:result.message.slice(0,2000),songIds:[...new Set(result.songIds)].filter(id=>ids.has(id)).slice(0,6)});
 }catch{reply(502,{error:'The AI connection is unavailable. Using local suggestions instead.'});}
};
