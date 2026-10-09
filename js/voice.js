// Browser speech: text-to-speech + speech-to-text (Chrome/Edge/Safari). No external service.
let q=[],busy=false;
export const voices=()=>('speechSynthesis'in window)?speechSynthesis.getVoices():[];
export const supported={tts:'speechSynthesis'in window,stt:!!(window.SpeechRecognition||window.webkitSpeechRecognition)};
let gen=0;
export function say(parts,{rate=1,voice='',done}={}){if(!supported.tts)return false;stop();const g=++gen;q=[].concat(parts).filter(Boolean);
 const next=()=>{if(g!=gen)return;const t=q.shift();if(!t){busy=false;done&&done();return}busy=true;const u=new SpeechSynthesisUtterance(t);u.rate=rate;const v=voices().find(x=>x.name==voice);if(v)u.voice=v;u.onend=()=>{if(g==gen)next()};u.onerror=()=>{};speechSynthesis.speak(u)};next();return true}
export const stop=()=>{gen++;q=[];busy=false;supported.tts&&speechSynthesis.cancel()};
export function listen(onText,onEnd,onErr){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){onErr('Speech recognition is not supported in this browser. Use Chrome/Edge/Safari, or type your answer.');return null}
 const r=new R();r.lang='en-US';r.interimResults=true;r.continuous=false;let final='';
 r.onresult=e=>{let t='';for(const x of e.results)t+=x[0].transcript;final=t;onText(t)};r.onerror=e=>onErr(e.error=='not-allowed'?'Microphone permission denied.':'Mic error: '+e.error);r.onend=()=>onEnd(final);r.start();return r}
const STOP=new Set('that this with from your have will they them then than into when what which should would could their there about also each does done been being were over only some such very more most make made'.split(' '));
export const keyPoints=a=>[...new Set((a.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>(w.length>=4&&!STOP.has(w))||/\d/.test(w)))].slice(0,10);
export function grade(ans,expected){const a=ans.toLowerCase(),k=keyPoints(expected),hit=k.filter(w=>a.includes(w.length>5?w.slice(0,5):w));return{hit,miss:k.filter(w=>!hit.includes(w)),pct:k.length?Math.round(100*hit.length/k.length):0}}