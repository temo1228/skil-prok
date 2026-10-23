(() => {
 const $=s=>document.querySelector(s);let configured=false,busy=false;const history=[];
 function open(){ $('#finder-dialog').showModal();$('#finder-input').focus(); }
 $('#finder-open').onclick=open;$('#finder-inline').onclick=open;$('#finder-close').onclick=()=>$('#finder-dialog').close();
 fetch('/api/assistant/status').then(r=>r.json()).then(data=>{configured=data.configured;$('#finder-mode').textContent=configured?'AI music assistant':'Local catalogue helper';$('#finder-disclosure').textContent=configured?'Your messages are sent to the AI provider to suggest songs.':'Local suggestions use catalogue matches and mood tags. AI is not connected.';}).catch(()=>{});
 function message(text,role,ids=[]){const box=document.createElement('div');box.className='finder-message '+role;const p=document.createElement('p');p.textContent=text;if(role==='user')p.setAttribute('data-no-translate','');box.append(p);
  for(const id of ids){const song=songs.find(s=>s.id===id);if(!song)continue;const row=document.createElement('div');row.className='finder-song';const image=document.createElement('img');image.src=song.cover||fallback;image.alt='';const detail=document.createElement('button');detail.className='finder-song-play';detail.setAttribute('data-no-translate','');const title=document.createElement('b');title.textContent=song.title;const artist=document.createElement('small');artist.textContent=song.artist;detail.append(title,artist);detail.onclick=()=>{queueIds=[...ids];playSong(song,true);};const add=document.createElement('button');add.className='finder-song-add';add.textContent='+';add.setAttribute('aria-label',`Add ${song.title} to a playlist`);add.onclick=()=>openAddDialog(song);row.append(image,detail,add);box.append(row);}
  $('#finder-messages').append(box);$('#finder-messages').scrollTop=$('#finder-messages').scrollHeight;
 }
 async function submit(text){if(busy||!text.trim())return;busy=true;$('#finder-send').disabled=true;$('#finder-input').value='';message(text,'user');let result;
  try{if(configured){const response=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history}),signal:AbortSignal.timeout(30000)});result=await response.json();if(!response.ok||result.mode==='local')throw new Error(result.error||'The AI connection is unavailable. Using local suggestions instead.');}else result=findMusicLocally(songs,text);
   message(result.message,'assistant',result.songIds);history.push({role:'user',content:text},{role:'assistant',content:result.message});if(history.length>6)history.splice(0,history.length-6);
  }catch{message('The AI connection is unavailable. Using local suggestions instead.','assistant');result=findMusicLocally(songs,text);message(result.message,'assistant',result.songIds);}
  finally{busy=false;$('#finder-send').disabled=false;$('#finder-input').focus();}
 }
 $('#finder-form').onsubmit=e=>{e.preventDefault();submit($('#finder-input').value.trim());};document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>submit(I18n.t(b.dataset.prompt)));
})();
