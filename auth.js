const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const {promisify} = require('node:util');
const scrypt = promisify(crypto.scrypt);
const locales = new Set(require('./languages').map(language=>language[0]));
const folder = process.env.GROOVE_DATA_DIR || path.join(__dirname,'.data');
const accountFile = path.join(folder,'accounts.json');
const sessions = new Map(), attempts = new Map();
let writeQueue = Promise.resolve();
function json(res,status,value) { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(value)); }
function fail(message,status = 400) { const error = new Error(message); error.status = status; throw error; }
async function users() { try { return JSON.parse(await fs.readFile(accountFile,'utf8')); } catch(error) { if(error.code === 'ENOENT') return []; throw error; } }
async function updateUsers(change) { const task = writeQueue.then(async()=>{ const list = await users(); const result = change(list); await fs.mkdir(folder,{recursive:true}); await fs.writeFile(accountFile+'.tmp',JSON.stringify(list),'utf8'); await fs.rename(accountFile+'.tmp',accountFile); return result; }); writeQueue = task.catch(()=>{}); return task; }
function publicUser(user) { return {id:user.id,name:user.name,email:user.email,phone:user.phone,locale:user.locale}; }
function sessionToken(req) { return (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('groove_session='))?.slice(15); }
async function currentUser(req) { const token = sessionToken(req), session = sessions.get(token); if(!session || session.expires < Date.now()) { if(token) sessions.delete(token); return null; } return (await users()).find(u => u.id === session.userId) || null; }
function signIn(req,res,user) { const old = sessionToken(req); if(old) sessions.delete(old); const token = crypto.randomBytes(32).toString('hex'); sessions.set(token,{userId:user.id,expires:Date.now()+7*86400000}); res.setHeader('Set-Cookie',`groove_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${req.socket.encrypted ? '; Secure' : ''}`); }
async function body(req) { let content = ''; for await (const chunk of req) { content += chunk; if(Buffer.byteLength(content) > 8192) fail('Request is too large.',413); } try { return JSON.parse(content || '{}'); } catch { fail('Invalid request.'); } }
function limit(req) { const key = req.socket.remoteAddress; const now = Date.now(); for(const [ip,value] of attempts) if(value.until < now) attempts.delete(ip); const value = attempts.get(key) || {count:0,until:now+15*60000}; if(++value.count > 30) fail('Too many attempts. Please try again later.',429); attempts.set(key,value); }
module.exports = async function auth(req,res,pathname) {
 try {
  if(req.method !== 'GET' && req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) fail('Request not allowed.',403);
  if(pathname === '/api/account' && req.method === 'GET') { const user = await currentUser(req); json(res,200,{user:user ? publicUser(user) : null}); return; }
  if(pathname === '/api/logout' && req.method === 'POST') { sessions.delete(sessionToken(req)); res.setHeader('Set-Cookie','groove_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); json(res,200,{ok:true}); return; }
  if(pathname === '/api/account' && req.method === 'PATCH') { const user = await currentUser(req); if(!user) fail('Please sign in first.',401); const input = await body(req); if(!locales.has(input.locale)) fail('Choose a supported language.'); const updated = await updateUsers(list=>{ const row = list.find(u=>u.id === user.id); row.locale = input.locale; return publicUser(row); }); json(res,200,{user:updated}); return; }
  if(!['/api/register','/api/login'].includes(pathname) || req.method !== 'POST') { json(res,404,{error:'Not found.'}); return; }
  limit(req); const input = await body(req); const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''; const password = typeof input.password === 'string' ? input.password : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim().replace(/[\s().-]/g,'') : '';
  if(phone && !/^\+[1-9]\d{7,14}$/.test(phone)) fail('Enter a valid phone number with country code.');
  if(!phone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fail('Enter a valid email address.');
  if(password.length < 8 || password.length > 128) fail('Use a password with 8 to 128 characters.');
  let user;
  if(pathname === '/api/register') {
   const name = typeof input.name === 'string' ? input.name.trim().slice(0,80) : ''; if(!name) fail('Enter your name.');
   const salt = crypto.randomBytes(16).toString('hex'); const hash = (await scrypt(password,salt,64)).toString('hex');
   user = await updateUsers(list=>{ if(list.some(u=>phone ? u.phone === phone : u.email === email)) fail('An account with this '+(phone ? 'phone number' : 'email')+' already exists.',409); const row = {id:crypto.randomUUID(),name,email:phone ? undefined : email,phone:phone || undefined,salt,hash,locale:locales.has(input.locale) ? input.locale : 'en'}; list.push(row); return row; });
  } else {
   user = (await users()).find(u=>phone ? u.phone === phone : u.email === email);
   const hash = await scrypt(password,user?.salt || 'groove-dummy-salt',64);
   if(!user || !crypto.timingSafeEqual(hash,Buffer.from(user.hash,'hex'))) fail(phone ? 'Phone number or password is incorrect.' : 'Email or password is incorrect.',401);
   if(locales.has(input.locale) && input.locale !== user.locale) user = await updateUsers(list=>{ const row = list.find(u=>u.id === user.id); row.locale = input.locale; return row; });
  }
  signIn(req,res,user); json(res,200,{user:publicUser(user)});
 } catch(error) { json(res,error.status || 500,{error:error.status ? error.message : 'Could not save account changes. Please try again.'}); }
};

