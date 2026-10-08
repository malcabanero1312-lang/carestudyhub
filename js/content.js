// Editable content layer. Moderator edits → saved locally → published to everyone. Students pull updates automatically.
import{topics}from'./data/topics.js';import{qa}from'./data/qa.js';import{extras}from'./data/extras.js';import{rebuild}from'./book.js';import{resetIndex}from'./offline.js';
const KEY='careHub.content';export const CONTENT={v:0,announce:'',onlineAI:false,dirty:false};
const ORIG=JSON.stringify({topics,qa,extras});
export function apply(c){if(c.topics)topics.splice(0,topics.length,...c.topics);if(c.qa)qa.splice(0,qa.length,...c.qa);if(c.extras)extras.splice(0,extras.length,...c.extras);
 CONTENT.v=c.v||0;CONTENT.announce=c.announce||'';CONTENT.onlineAI=!!c.onlineAI;CONTENT.dirty=!!c.dirty;rebuild();resetIndex()}
export const snapshot=()=>({v:CONTENT.v,topics,qa,extras,announce:CONTENT.announce,onlineAI:CONTENT.onlineAI});
export const saveLocal=()=>{try{localStorage.setItem(KEY,JSON.stringify({...snapshot(),dirty:CONTENT.dirty}))}catch(e){console.warn(e)}};
export function loadLocal(){try{const c=JSON.parse(localStorage.getItem(KEY)||'null');c&&apply(c)}catch{}}
export function restoreOriginal(){localStorage.removeItem(KEY);apply({...JSON.parse(ORIG),v:0,announce:'',onlineAI:false,dirty:false})}
const lines=t=>t.split('\n').map(x=>x.trim()).filter(Boolean);
export const toText=b=>b.k=='table'?b.r.map(r=>r.join(' | ')).join('\n'):b.k=='cols'?b.c.map(c=>'## '+c[0]+'\n'+c[1].join('\n')).join('\n'):['def','say','mem'].includes(b.k)?(b.t||''):(b.i||[]).join('\n');
export function fromText(b,t){if(['def','say','mem'].includes(b.k))b.t=t.trim();else if(b.k=='table')b.r=lines(t).map(l=>{const p=l.split('|');return[p[0].trim(),p.slice(1).join('|').trim()]});
 else if(b.k=='cols'){const c=[];lines(t).forEach(l=>{if(l.startsWith('##'))c.push([l.replace(/^#+\s*/,''),[]]);else{if(!c.length)c.push(['Group',[]]);c[c.length-1][1].push(l)}});b.c=c}else b.i=lines(t)}
