(() => {
 const defaults = {theme:'dark',largeText:false,reducedMotion:false,autoplay:true,volume:70};
 let saved = {};
 try { saved = JSON.parse(localStorage.getItem('groove-settings') || '{}') || {}; } catch {}
 const preferences = {...defaults};
 if(['dark','green','light'].includes(saved.theme)) preferences.theme = saved.theme;
 for(const key of ['largeText','reducedMotion','autoplay']) if(typeof saved[key] === 'boolean') preferences[key] = saved[key];
 if(Number.isFinite(saved.volume)) preferences.volume = Math.min(100,Math.max(0,saved.volume));
 window.GrooveSettings = preferences;
 function appearance() {
  const root = document.documentElement;
  root.dataset.theme = preferences.theme;
  root.classList.toggle('larger-text',preferences.largeText);
  root.classList.toggle('reduced-motion',preferences.reducedMotion);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',preferences.theme === 'light' ? '#f5f7f0' : '#111310');
 }
 appearance();
 document.addEventListener('DOMContentLoaded',() => {
  const find = id => document.getElementById(id), audio = find('audio');
  function sync() {
   appearance();
   document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice === preferences.theme)));
   for(const [id,key] of [['settings-large-text','largeText'],['settings-reduced-motion','reducedMotion'],['settings-autoplay','autoplay']]) find(id).checked = preferences[key];
   find('settings-volume').value = preferences.volume;
   find('settings-volume-value').textContent = Math.round(preferences.volume)+'%';
   find('volume').value = preferences.volume/100;
  }
  function save() {
   try { localStorage.setItem('groove-settings',JSON.stringify(preferences)); find('settings-save-status').textContent = ''; }
   catch { find('settings-save-status').textContent = 'Settings changed, but could not be saved on this device.'; }
  }
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{preferences.theme=button.dataset.themeChoice;sync();save();}));
  for(const [id,key] of [['settings-large-text','largeText'],['settings-reduced-motion','reducedMotion'],['settings-autoplay','autoplay']]) find(id).addEventListener('change',event=>{preferences[key]=event.target.checked;sync();save();});
  find('settings-volume').addEventListener('input',event=>{audio.volume=Number(event.target.value)/100;audio.muted=false;});
  audio.addEventListener('volumechange',()=>{preferences.volume=audio.volume*100;sync();save();});
  find('settings-reset').addEventListener('click',()=>{Object.assign(preferences,defaults);audio.volume=defaults.volume/100;audio.muted=false;sync();save();});
  audio.volume=preferences.volume/100;
  sync();
 });
})();
