import{db,save,importRemote,blob}from'./storage.js';import*as C from'./cloud.js';
export function initWelcome(x){const{$,esc,render,toast,first,buildNav,summary}=x,W=$('#welcome');let mode='new';
 const done=()=>{W.classList.add('out');setTimeout(()=>{W.hidden=true;W.classList.remove('out');buildNav();render();toast('Welcome, '+first()+'! 🎉')},450)};
 function show(){const cloud=!!C.cloudUrl();W.hidden=false;
  W.innerHTML=`<div class="wc-orbs">${['🩺','❤️','🧼','🛏️','🫀','🍼','🩹','💙'].map((e,i)=>`<span style="--i:${i}">${e}</span>`).join('')}</div><div class="wc-card"><img src="assets/icon.svg" alt="" width="84" height="84"><small>WELCOME TO</small><h1>CareStudyHub</h1><p>Your pocket-sized caregiving academy. <b>Learn it. Drill it. Ace it.</b><br>10 chapters · 65 oral Q&As · a tutor that never sleeps (or needs wifi) ✨</p>
  ${cloud?`<div class="seg"><button data-w="new" class="${mode=='new'?'on':''}">New here</button><button data-w="login" class="${mode=='login'?'on':''}">I have an account</button></div>`:''}
  <label for="wn">${mode=='new'?'What should I call you?':'Your name'}</label><input id="wn" type="text" maxlength="30" placeholder="Your name" value="${esc(db.settings.name)}" autocomplete="username">
  ${cloud?`<label for="wp">${mode=='new'?'Make a PIN (4–8 digits) to save your progress':'Your PIN'}</label><input id="wp" type="password" inputmode="numeric" maxlength="8" placeholder="PIN" autocomplete="${mode=='new'?'new-password':'current-password'}">${mode=='new'?'<input id="wp2" type="password" inputmode="numeric" maxlength="8" placeholder="Repeat PIN" style="margin-top:8px">':''}`:''}
  <div id="werr" role="alert"></div><button class="btn" id="wgo" style="width:100%;margin-top:12px;font-size:1.05rem">${mode=='new'?'Start my journey →':'Log in →'}</button>${cloud?'<button class="lnk" id="wloc">Continue on this device only (no account)</button>':''}<small class="wc-by">Made by MARC ASHER</small></div>`;
  const err=m=>{$('#werr').textContent=m};
  W.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{mode=b.dataset.w;show()});
  const local=()=>{const n=$('#wn').value.trim();if(n.length<2)return err('Please type your name (2+ letters)');db.settings.name=n;db.welcomed=true;save();done()};
  $('#wgo').onclick=async()=>{const n=$('#wn').value.trim();if(n.length<2){err('Please type your name (2+ letters)');return}if(!cloud)return local();
   const pin=$('#wp').value;if(!/^\d{4,8}$/.test(pin))return err('PIN must be 4–8 digits');if(mode=='new'&&pin!==$('#wp2').value)return err('The two PINs don\'t match');
   const b=$('#wgo');b.disabled=true;b.textContent='Please wait…';
   try{if(mode=='new'){const r=await C.register(n,pin);C.setAuth({name:r.name,token:r.token});db.settings.name=r.name;db.welcomed=true;save();C.push(blob(),summary()).catch(()=>{})}
    else{const r=await C.login(n,pin);C.setAuth({name:r.name,token:r.token});if(r.data)importRemote(r.data);db.settings.name=r.name;db.welcomed=true;save()}done()}
   catch(e){err(e.message=='No internet connection'?'No internet. Connect once to create/log in, or continue on this device only.':e.message);b.disabled=false;b.textContent=mode=='new'?'Start my journey →':'Log in →'}};
  const l=$('#wloc');if(l)l.onclick=local;W.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>e.key=='Enter'&&$('#wgo').click()));setTimeout(()=>$('#wn')&&$('#wn').focus(),300)}
 if(!db.welcomed||!db.settings.name)show();return show}
