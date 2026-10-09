// 🎧 Listen mode — voice-only Oral Q&A: hear the question, tap Next / Back / Repeat / Hear the answer. Optional hands-free loop.
import{say,stop}from'./voice.js';import{db,bump,save}from'./storage.js';
export function initListen(x){const{V,A,esc,bar,render,toast,qa,S}=x;let run=0,timer=null;
 const sh=a=>[...a].sort(()=>Math.random()-.5),L=()=>S.ls,cur=()=>qa[L().order[L().i]];
 const opt=()=>({rate:+db.settings.rate,voice:db.settings.voice});
 const halt=()=>{run++;clearTimeout(timer);stop()};
 const speakQ=cb=>{const q=cur();say([`Question ${q.n}.`,q.q],{...opt(),done:cb})};
 const speakA=cb=>say(['The answer is.',cur().a],{...opt(),done:cb});
 const auto=()=>{const me=++run,l=L();if(!l)return;l.show=false;render();speakQ(()=>{if(me!=run)return;timer=setTimeout(()=>{if(me!=run)return;l.show=true;render();speakA(()=>{if(me!=run)return;timer=setTimeout(()=>{if(me!=run)return;l.i=(l.i+1)%l.order.length;auto()},1800)})},l.pause*1000)})};
 const rangeOrder=l=>qa.map((q,i)=>i).filter(i=>qa[i].n>=l.from&&qa[i].n<=l.to);
 const go=i=>{halt();const l=L();l.i=(i+l.order.length)%l.order.length;l.show=false;if(!l.shuf)db.lsi=l.order[l.i];bump();render();l.auto?auto():speakQ()};
 V.listen=()=>{const l=L();if(!l)return'<div class="card">Nothing playing. <a href="#oral">Go to Oral Q&A</a></div>';const q=cur();
  return`<div class="card" style="text-align:center"><div class="row"><button class="ico" data-a="lexit" aria-label="Close">✕</button><button class="ico" data-a="lrange" aria-label="Choose question range" title="Choose range">🔢</button><b class="grow">🎧 Listen mode</b><span class="tag">${l.i+1}/${l.order.length}${l.order.length<qa.length?` · Q${l.from}–${l.to}`:''}</span></div>${bar(100*(l.i+1)/l.order.length)}
  ${l.rng?`<div class="card" style="text-align:left"><b>🔢 Choose which questions</b><div class="row" style="margin-top:8px"><div class="grow"><label>Start at #</label><input id="lf" type="number" inputmode="numeric" min="1" max="${qa.length}" value="${l.from}"></div><div class="grow"><label>End at # (blank = to the end)</label><input id="lt" type="number" inputmode="numeric" min="1" max="${qa.length}" value="${l.to<qa.length?l.to:''}"></div></div><div class="row" style="margin-top:10px"><button class="btn" data-a="lapply">▶ Start</button><button class="btn ghost" data-a="lall">All ${qa.length}</button></div><div class="row" style="margin-top:8px">${[[1,22],[23,44],[45,qa.length],[50,qa.length]].map(r=>`<button class="chip" style="color:inherit;cursor:pointer" data-a="lset" data-f="${r[0]}" data-t="${r[1]}">${r[0]}–${r[1]}</button>`).join('')}</div></div>`:''}<div style="font-size:3.4rem;margin:14px 0 4px">🎧</div><div class="tag">Question ${q.n}</div>
  <div class="big">${l.showQ?esc(q.q):'Listening…'}</div>${l.show?`<div class="card" style="text-align:left;border-left:6px solid var(--ok)"><b>Answer</b><br>${esc(q.a)}</div>`:''}
  <div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" style="padding:16px 20px" data-a="lback">◀ Back</button><button class="btn ghost" style="padding:16px 20px" data-a="lrepeat">🔁 Repeat</button><button class="btn" style="padding:16px 26px" data-a="lnext">Next ▶</button></div>
  <div class="row" style="justify-content:center;margin-top:8px"><button class="btn ok" style="padding:14px 22px" data-a="lans">💡 Hear the answer</button><button class="btn ghost sm" data-a="ltext">${l.showQ?'🙈 Hide text':'👁 Show text'}</button></div></div>
  <div class="card"><div class="row"><button class="btn ${l.auto?'bad':''}" data-a="lauto">${l.auto?'⏸ Stop hands-free':'▶ Hands-free (auto)'}</button><span class="grow"></span><label style="margin:0">Wait before answer</label><select data-c="lpause" style="width:auto">${[5,8,12,20].map(n=>`<option value="${n}" ${l.pause==n?'selected':''}>${n}s</option>`).join('')}</select></div><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-a="lshuf">🔀 Shuffle</button><button class="btn ghost sm" data-a="lstartover">↺ Start over</button></div><small style="color:var(--mute)">Tip: keep the screen on while listening — phones pause speech when locked.</small></div>`};
 Object.assign(A,{lstart:()=>{S.ls={order:qa.map((_,i)=>i),i:Math.min(db.lsi||0,qa.length-1),show:false,showQ:false,auto:false,pause:8,shuf:false,from:1,to:qa.length,rng:false};speakQ();location.hash='listen'},
  lnext:()=>go(L().i+1),lback:()=>go(L().i-1),lrepeat:()=>{halt();L().show=false;render();speakQ()},
  lans:()=>{halt();L().show=true;render();speakA()},ltext:()=>{L().showQ=!L().showQ;render()},
  lauto:()=>{const l=L();l.auto=!l.auto;if(l.auto)auto();else{halt();render()}},
  lshuf:()=>{const l=L();l.order=sh(l.order);l.shuf=true;l.auto=l.auto;go(0);toast('Shuffled 🔀')},
  lstartover:()=>{const l=L();l.order=rangeOrder(l);l.shuf=false;go(0)},
  lrange:()=>{L().rng=!L().rng;render()},lall:()=>{const l=L();l.from=1;l.to=qa.length;l.rng=false;l.order=rangeOrder(l);l.shuf=false;go(0)},
  lset:d=>{const l=L();l.from=+d.f;l.to=+d.t;l.rng=false;l.order=rangeOrder(l);l.shuf=false;go(0);toast('Questions '+l.from+'–'+l.to)},
  lapply:()=>{const l=L(),max=qa.length,a=parseInt(document.querySelector('#lf').value),b=parseInt(document.querySelector('#lt').value);let f=isNaN(a)?1:Math.min(Math.max(a,1),max),t=isNaN(b)?max:Math.min(Math.max(b,1),max);if(f>t)[f,t]=[t,f];l.from=f;l.to=t;l.rng=false;l.order=rangeOrder(l);l.shuf=false;go(0);toast('Questions '+f+'–'+t)},
  lexit:()=>{halt();S.ls=null;location.hash='oral'}});
 document.addEventListener('change',e=>{if(e.target.dataset.c=='lpause'&&L())L().pause=+e.target.value});
 addEventListener('hashchange',()=>{if(!location.hash.startsWith('#listen'))halt()})}