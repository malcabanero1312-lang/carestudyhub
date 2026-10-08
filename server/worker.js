// CareStudyHub cloud (Cloudflare Worker). Does 3 jobs with ONE url:
//  1) Student accounts + progress sync (needs a KV namespace bound as DB)
//  2) Moderator tools + publishing lesson edits to everyone (secret MOD_KEY)
//  3) Optional online AI fallback (secret ANTHROPIC_API_KEY, or the free Workers AI binding AI)
const enc=new TextEncoder();
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const hmac=async(k,m)=>b64(await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',enc.encode(k),{name:'HMAC',hash:'SHA-256'},false,['sign']),enc.encode(m)));
const sha=async s=>b64(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const uid=async n=>(await sha('u:'+n.trim().toLowerCase())).slice(0,22);
export default{async fetch(req,env){
 const url=new URL(req.url);
 const CORS={'Access-Control-Allow-Origin':env.ALLOWED_ORIGIN||'*','Access-Control-Allow-Headers':'Content-Type,Authorization,X-Mod-Key','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'};
 const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...CORS,'content-type':'application/json'}});
 if(req.method=='OPTIONS')return new Response(null,{headers:CORS});
 if(url.pathname.startsWith('/api/')){try{return await api(req,env,url,J)}catch(e){return J({error:'Server error: '+e.message},500)}}
 if(req.method!='POST')return new Response('CareStudyHub cloud is running ✅',{headers:CORS});
 let b;try{b=await req.json()}catch{return J({error:'Invalid JSON'},400)}b.max_tokens=Math.min(b.max_tokens||1200,2000);
 if(env.ANTHROPIC_API_KEY){const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify(b)});return new Response(r.body,{status:r.status,headers:{...CORS,'content-type':'application/json'}})}
 if(env.AI){try{const o=await env.AI.run(env.CF_MODEL||'@cf/meta/llama-3.3-70b-instruct-fp8-fast',{max_tokens:b.max_tokens,messages:[{role:'system',content:b.system||''},...b.messages]});return J({content:[{type:'text',text:o.response||o.result?.response||''}]})}catch(e){return J({error:{message:'Workers AI: '+e.message}},500)}}
 return J({error:{message:'No AI backend on the worker (add ANTHROPIC_API_KEY or the AI binding).'}},500)}};
async function api(req,env,url,J){
 if(!env.DB)return J({error:'Storage not connected: bind a KV namespace named DB to the worker.'},500);
 const p=url.pathname.slice(5),M=req.method,SECRET=(env.MOD_KEY||'dev')+'|tok';
 const body=(M=='POST'||M=='PUT')?await req.json().catch(()=>({})):{};
 const gj=async k=>{const v=await env.DB.get(k);return v?JSON.parse(v):null},pj=(k,v)=>env.DB.put(k,JSON.stringify(v));
 const isMod=()=>!!env.MOD_KEY&&req.headers.get('X-Mod-Key')===env.MOD_KEY;
 const mint=async id=>{const exp=Date.now()+90*864e5;return`${id}.${exp}.${await hmac(SECRET,id+'.'+exp)}`};
 const me=async()=>{const[id,exp,sig]=(req.headers.get('Authorization')||'').replace('Bearer ','').split('.');return(sig&&+exp>Date.now()&&sig===await hmac(SECRET,id+'.'+exp))?id:null};
 if(p=='ping')return J({ok:true});
 if(p=='register'&&M=='POST'){const n=String(body.name||'').trim(),pin=String(body.pin||'');if(n.length<2||n.length>30)return J({error:'Name must be 2–30 characters'},400);if(!/^\d{4,8}$/.test(pin))return J({error:'PIN must be 4–8 digits'},400);
  const id=await uid(n);if(await env.DB.get('user:'+id))return J({error:'That name is taken. Log in, or add your surname to make it unique.'},409);
  const salt=b64(crypto.getRandomValues(new Uint8Array(9)));await pj('user:'+id,{name:n,salt,h:await sha(salt+pin),created:Date.now(),act:Date.now(),sum:null,fails:0});return J({token:await mint(id),name:n})}
 if(p=='login'&&M=='POST'){const id=await uid(String(body.name||'')),u=await gj('user:'+id);if(!u)return J({error:'No account with that name. Check spelling or create one.'},404);
  if(u.lock&&u.lock>Date.now())return J({error:'Too many wrong PINs. Try again in a few minutes.'},429);
  if(u.h!==await sha(u.salt+String(body.pin||''))){u.fails=(u.fails||0)+1;if(u.fails>=8){u.lock=Date.now()+6e5;u.fails=0}await pj('user:'+id,u);return J({error:'Wrong PIN'},401)}
  u.fails=0;u.act=Date.now();await pj('user:'+id,u);return J({token:await mint(id),name:u.name,data:await gj('data:'+id)})}
 if(p=='sync'){const id=await me();if(!id)return J({error:'Please log in again'},401);
  if(M=='GET')return J({data:await gj('data:'+id)});
  if(M=='PUT'){const u=await gj('user:'+id);if(!u)return J({error:'Account not found'},401);await pj('data:'+id,body.data||{});u.sum=body.sum||null;u.act=Date.now();await pj('user:'+id,u);return J({ok:true})}}
 if(p=='content'&&M=='GET')return J((await gj('content'))||{});
 if(p.startsWith('mod/')){if(!isMod())return J({error:'Wrong moderator key'},401);
  if(p=='mod/users'){const l=await env.DB.list({prefix:'user:',limit:1000}),us=await Promise.all(l.keys.map(k=>gj(k.name)));return J({users:us.map((u,i)=>({id:l.keys[i].name.slice(5),name:u.name,created:u.created,act:u.act||0,sum:u.sum||null}))})}
  if(p=='mod/content'&&M=='POST'){const c={...body,v:Date.now()};delete c.dirty;await pj('content',c);return J({ok:true,v:c.v})}
  if(p=='mod/reset'&&M=='POST'){const u=await gj('user:'+body.id);if(!u)return J({error:'Not found'},404);if(!/^\d{4,8}$/.test(String(body.pin)))return J({error:'PIN must be 4–8 digits'},400);u.salt=b64(crypto.getRandomValues(new Uint8Array(9)));u.h=await sha(u.salt+String(body.pin));u.fails=0;u.lock=0;await pj('user:'+body.id,u);return J({ok:true})}
  if(p.startsWith('mod/user/')){const id=p.slice(9);if(M=='GET')return J({data:await gj('data:'+id),user:await gj('user:'+id)});if(M=='DELETE'){await env.DB.delete('user:'+id);await env.DB.delete('data:'+id);return J({ok:true})}}}
 return J({error:'Not found'},404)}
