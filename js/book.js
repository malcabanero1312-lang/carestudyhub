// Builds the offline "Book of Questions & Answers" from your chapters + Q&A + extras. Rebuilt automatically when content is edited.
import{topics}from'./data/topics.js';import{qa}from'./data/qa.js';import{extras}from'./data/extras.js';
const fmt=b=>b.k=='def'?b.t:b.k=='table'?b.r.map(r=>`${r[0]}: ${r[1]}`).join('\n'):b.k=='cols'?b.c.map(c=>`${c[0]}: ${c[1].join('; ')}`).join('\n'):b.k=='steps'?b.i.map((x,i)=>`${i+1}. ${x}`).join('\n'):b.k=='say'?`“${b.t}”`:(b.i||[]).map(x=>'• '+x).join('\n');
export const book=[];
export function rebuild(){book.length=0;
 topics.forEach(t=>t.blocks.forEach(b=>{if(b.k=='mem'){book.push({t:t.id,q:[`memory trick ${t.title}`,`how to remember ${t.title}`],a:b.t,mem:1,title:`Memory trick — ${t.title}`});return}
  const h=b.h||b.k;book.push({t:t.id,kind:b.k,q:[h,`${h} ${t.title}`,`${t.title} ${h}`,`what is ${h}`],a:fmt(b),title:`${t.title}: ${h}`});
  if(b.k=='table')b.r.forEach(r=>book.push({t:t.id,micro:1,q:[`${r[0]} ${h} ${t.title}`,r[0]],a:`${r[0]}: ${r[1]}`}));
  if(b.k=='steps')b.i.forEach((s,i)=>book.push({t:t.id,micro:1,q:[`step ${i+1} of ${h} ${t.title}`],a:`Step ${i+1} (${h}): ${s}`}));
  if(b.k=='cols')b.c.forEach(c=>book.push({t:t.id,micro:1,q:[`${c[0]} ${h} ${t.title}`],a:`${c[0]}: ${c[1].join('; ')}`}))}));
 extras.forEach(([t,q,a])=>{const v=q.split('|').map(x=>x.trim()).filter(Boolean);book.push({t,q:v,a,title:v[0]})});
 qa.forEach(x=>book.push({t:'qa',q:[x.q],a:x.a,n:x.n,title:`Q${x.n}. ${x.q}`}))}
rebuild();
