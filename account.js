(() => {
 const find = s => document.querySelector(s);
 for(const selector of ['#settings-language']) { const select=find(selector);select.replaceChildren();for(const [code,name,native] of GROOVE_LANGUAGES){const option=document.createElement('option');option.value=code;option.textContent=name===native?name:`${name} — ${native}`;select.append(option);} }
 let account = null, mode = 'login', method = 'email';
 function syncLanguage() { find('#settings-language').value = I18n.locale; document.dispatchEvent(new Event('language-picker-update')); }
 function updateAccount() {
  find('#account-open').textContent = account ? account.name : 'Sign in';
  find('#account-open').toggleAttribute('data-no-translate',!!account);
  find('#profile-name').textContent = account ? account.name : 'Guest listener';
  find('#profile-name').toggleAttribute('data-no-translate',!!account);
  find('#profile-avatar').textContent = account ? Array.from(account.name)[0].toUpperCase() : 'G';
  find('#profile-subtitle').textContent = account ? 'Your personal listening space' : 'Make yourself at home';
  find('#settings-account-name').textContent = account ? account.name : 'Your account';
  find('#settings-account-name').toggleAttribute('data-no-translate',!!account);
  find('#settings-account-detail').textContent = account ? (account.email || account.phone) : 'Sign in to save your language preference.';
  find('#settings-sign-in').hidden = !!account; find('#sign-out').hidden = !account;
 }
 function setMode(next) {
  mode = next; const register = mode === 'register';
  find('#account-title').textContent = register ? 'Find your groove.' : 'Welcome back.';
  find('#account-intro').textContent = register ? 'A little space for you and your music.' : 'Sign in and make yourself at home.';
  find('#account-name-label').hidden = !register; find('#account-name').required = register;
  find('#account-password').autocomplete = register ? 'new-password' : 'current-password';
  find('#account-submit').textContent = register ? 'Create account' : 'Sign in';
  find('#login-tab').classList.toggle('selected',!register); find('#register-tab').classList.toggle('selected',register);
  find('#account-error').textContent = '';
 }
 function openAccount() { if(account) { find('#settings-dialog').showModal(); return; } setMode('login'); syncLanguage(); find('#account-dialog').showModal(); }
 async function api(url,method = 'GET',data) { const response = await fetch(url,{method,headers:{'Content-Type':'application/json'},...(data ? {body:JSON.stringify(data)} : {})}); const result = await response.json(); if(!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.'); return result; }
 find('#settings-open').onclick = () => { syncLanguage(); find('#settings-dialog').showModal(); };
 find('#settings-close').onclick = () => find('#settings-dialog').close();
 find('#account-close').onclick = () => { find('#account-dialog').close(); find('#account-password').value = ''; };
 find('#account-open').onclick = openAccount; find('#profile-open').onclick = openAccount;
 find('#settings-sign-in').onclick = () => { find('#settings-dialog').close(); openAccount(); };
 find('#login-tab').onclick = () => setMode('login'); find('#register-tab').onclick = () => setMode('register');
 function setMethod(value) { method=value; const phone=value==='phone'; find('#account-email-label').hidden=phone; find('#account-email').required=!phone; find('#account-email').disabled=phone; find('#account-phone-label').hidden=!phone; find('#account-phone').required=phone; find('#account-phone').disabled=!phone; for(const type of ['email','phone']) { find('#'+type+'-method').classList.toggle('selected',type===value); find('#'+type+'-method').setAttribute('aria-pressed',String(type===value)); } find('#account-error').textContent=''; }
 find('#email-method').onclick=()=>setMethod('email'); find('#phone-method').onclick=()=>setMethod('phone'); setMethod('email');
 find('#password-toggle').onclick = () => { const input = find('#account-password'); const show = input.type === 'password'; input.type = show ? 'text' : 'password'; find('#password-toggle').textContent = show ? 'Hide' : 'Show'; find('#password-toggle').setAttribute('aria-label',show ? 'Hide password' : 'Show password'); };
 let languageSave = Promise.resolve();
 async function changeLanguage(locale) {
  await I18n.setLanguage(locale); syncLanguage();
  if(account) languageSave = languageSave.then(async()=>{ try { const result = await api('/api/account','PATCH',{locale}); account = result.user; } catch { toast('Language changed on this device. Could not update your account.'); } });
 }
 find('#settings-language').onchange = e => changeLanguage(e.target.value);
 find('#account-form').onsubmit = async e => {
  e.preventDefault(); find('#account-error').textContent = ''; find('#account-submit').disabled = true; find('#account-submit').textContent = 'Please wait...';
  try {
   const result = await api(mode === 'register' ? '/api/register' : '/api/login','POST',{name:find('#account-name').value,...(method==='phone' ? {phone:find('#account-phone').value} : {email:find('#account-email').value}),password:find('#account-password').value,locale:I18n.locale});
   account = result.user; await I18n.setLanguage(account.locale || 'en'); syncLanguage(); updateAccount(); find('#account-dialog').close(); find('#account-password').value = ''; toast('You are signed in. Welcome to Groove.');
  } catch(error) { find('#account-error').textContent = error.message; }
  finally { find('#account-submit').disabled = false; find('#account-submit').textContent = mode === 'register' ? 'Create account' : 'Sign in'; }
 };
 find('#sign-out').onclick = async () => { try { await api('/api/logout','POST'); account = null; updateAccount(); toast('You are signed out.'); } catch { toast('Could not sign out. Please try again.'); } };
 api('/api/account').then(async result=>{ account = result.user; if(account) await I18n.setLanguage(account.locale || 'en'); syncLanguage(); updateAccount(); }).catch(()=>{});

 const normalize=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase();
 for(const selector of ['#settings-language']) {
  const select=find(selector), wrapper=document.createElement('div'); wrapper.className='language-picker';
  const search=document.createElement('input'); search.type='search'; search.className='language-search'; search.placeholder='Search languages'; search.setAttribute('aria-label','Search languages'); search.autocomplete='off';
  const results=document.createElement('div'); results.className='language-results'; results.setAttribute('role','group'); results.setAttribute('aria-label','Languages'); results.dataset.noTranslate='';
  const status=document.createElement('p'); status.className='language-status'; status.setAttribute('role','status'); status.dataset.noTranslate='';
  select.before(wrapper); wrapper.append(search,results,status); select.classList.add('language-native');
  const render=()=>{ const query=normalize(search.value.trim()); const matches=GROOVE_LANGUAGES.filter(row=>normalize(row.join(' ')).includes(query)); results.replaceChildren(); status.textContent=matches.length ? matches.length+' languages · '+(GROOVE_LANGUAGES.find(row=>row[0]===I18n.locale)?.[1] || 'English')+' selected' : 'No languages found. Try another name or code.';
   for(const [code,name,native] of matches) { const button=document.createElement('button'); button.type='button'; button.className='language-option'; button.setAttribute('aria-pressed',String(code===I18n.locale)); const title=document.createElement('span'); title.textContent=name; const subtitle=document.createElement('small'); subtitle.textContent=native; subtitle.dir='auto'; const mark=document.createElement('span'); mark.className='language-check'; mark.textContent=code===I18n.locale?'✓':code.toUpperCase(); button.append(title,subtitle,mark); button.onclick=async()=>{ await changeLanguage(code); document.dispatchEvent(new Event('language-picker-update')); }; results.append(button); }
  }; search.oninput=render; select.addEventListener('change',()=>setTimeout(()=>document.dispatchEvent(new Event('language-picker-update')),100)); document.addEventListener('language-picker-update',render); render();
 }
 syncLanguage(); updateAccount();
})();
