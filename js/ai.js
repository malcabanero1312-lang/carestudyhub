// AI tutor — pick a provider in Settings → AI:
//  proxy     → your Cloudflare Worker (server/worker.js). Recommended: key stays secret, works for Claude OR free Cloudflare Workers AI.
//  anthropic → Anthropic API directly from your browser (key stored on this device only).
//  openai    → any OpenAI-compatible chat endpoint (Cloudflare AI Gateway / Workers AI compat, OpenRouter, etc.).
import{db}from'./storage.js';
export const provider=()=>{const s=db.settings;return s.aiProvider||(s.aiUrl?'proxy':s.aiKey?'anthropic':'offline')};
export const aiReady=()=>{const s=db.settings,p=provider();return p=='offline'||p=='anthropic'?!!s.aiKey:!!s.aiUrl};
async function post(url,headers,body){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});let j;try{j=await r.json()}catch{throw new Error('Bad response ('+r.status+')')}
 if(!r.ok)throw new Error(j.error?.message||(typeof j.error=='string'?j.error:'')||j.errors?.[0]?.message||('HTTP '+r.status));return j}
export async function chat(messages,system){const s=db.settings,p=provider(),model=s.aiModel||(p=='openai'?'@cf/meta/llama-3.3-70b-instruct-fp8-fast':'claude-sonnet-4-6');messages=messages.slice(-12);
 if(p=='openai'){const j=await post(s.aiUrl,s.aiKey?{Authorization:'Bearer '+s.aiKey}:{},{model,max_tokens:1400,messages:[{role:'system',content:system},...messages]});
  return(j.choices?.[0]?.message?.content||j.result?.response||j.response||'').trim()||'(no answer)'}
 const body={model,max_tokens:1400,system,messages};if(s.web!==false)body.tools=[{type:'web_search_20250305',name:'web_search',max_uses:3}];
 const j=p=='proxy'?await post(s.aiUrl,{},body):await post('https://api.anthropic.com/v1/messages',{'x-api-key':s.aiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body);
 return(j.content||[]).filter(c=>c.type=='text').map(c=>c.text).join('').trim()||'(no answer)'}
export const SYSTEM=(ctx,who)=>`You are the personal AI caregiving tutor inside "Caregiving Study Hub", made for ${who}. You can talk about ANYTHING the student asks (use web search when available for current or outside facts), but for caregiving questions treat the student's NOTEBOOK below as the primary source of truth and follow its wording, steps and numbers even if they differ from other sources; if you add outside info, label it clearly. Be warm, clear and concise; use short paragraphs/bullets, mnemonics and examples. Never invent steps missing from the notebook — say it needs clarification. This is study help, not medical advice for real emergencies.\n\nNOTEBOOK CONTEXT:\n${ctx}`;
