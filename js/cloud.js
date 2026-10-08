// Cloud client: accounts, progress sync, moderator tools, content updates. Everything degrades gracefully when offline.
import{CFG}from'./config.js';
try{const c=new URLSearchParams(location.search).get('c');if(c){localStorage.setItem('careHub.cloud',c);history.replaceState(null,'',location.pathname+location.hash)}}catch{}
const AK='careHub.auth',MK='careHub.mod';
export const cloudUrl=()=>(localStorage.getItem('careHub.cloud')||CFG.cloud||'').replace(/\/+$/,'');
export const setCloud=u=>u?localStorage.setItem('careHub.cloud',u.trim()):localStorage.removeItem('careHub.cloud');
export const auth=()=>{try{return JSON.parse(localStorage.getItem(AK))}catch{return null}};
export const setAuth=a=>a?localStorage.setItem(AK,JSON.stringify(a)):localStorage.removeItem(AK);
export const modKey=()=>localStorage.getItem(MK)||'';export const setMod=k=>k?localStorage.setItem(MK,k):localStorage.removeItem(MK);export const isMod=()=>!!modKey();
export const status={ok:null,t:0};
export const shareUrl=()=>location.origin+location.pathname+(cloudUrl()?'?c='+encodeURIComponent(cloudUrl()):'');
async function call(path,{method='GET',body,token,mod}={}){const h={};if(body)h['Content-Type']='application/json';if(token)h.Authorization='Bearer '+token;if(mod)h['X-Mod-Key']=mod;
 let r;try{r=await fetch(cloudUrl()+'/api/'+path,{method,headers:h,body:body?JSON.stringify(body):undefined})}catch{throw new Error('No internet connection')}
 const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||('Error '+r.status)),{status:r.status});return j}
export const register=(name,pin)=>call('register',{method:'POST',body:{name,pin}});
export const login=(name,pin)=>call('login',{method:'POST',body:{name,pin}});
export const push=(data,sum)=>{const a=auth();return a?call('sync',{method:'PUT',token:a.token,body:{data,sum}}):Promise.resolve()};
export const pull=()=>{const a=auth();return call('sync',{token:a.token})};
export const getContent=()=>call('content');
export const modUsers=()=>call('mod/users',{mod:modKey()});export const modUser=id=>call('mod/user/'+id,{mod:modKey()});
export const modDelete=id=>call('mod/user/'+id,{method:'DELETE',mod:modKey()});export const modReset=(id,pin)=>call('mod/reset',{method:'POST',mod:modKey(),body:{id,pin}});
export const publish=c=>call('mod/content',{method:'POST',mod:modKey(),body:c});
export async function cloudChat(messages,system){let r;try{r=await fetch(cloudUrl(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1100,system,messages,tools:[{type:'web_search_20250305',name:'web_search',max_uses:3}]})})}catch{throw new Error('offline')}
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||'AI error');return(j.content||[]).filter(c=>c.type=='text').map(c=>c.text).join('').trim()}
