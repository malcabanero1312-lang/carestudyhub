const K='careHub.v2';
export const base={t:{},qa:{},quiz:[],notes:{},marks:[],days:[],log:[],chat:[],sess:0,upd:0,
 settings:{theme:'aurora',fs:16,rate:1,voice:'',motion:true,autoSpeak:false,name:'',address:'',school:'',goal:'Pass my caregiving oral assessment',daily:10,style:'friendly',aiUrl:'',aiKey:'',aiProvider:'',aiModel:'claude-sonnet-4-6',web:true}};
let s;try{s=JSON.parse(localStorage.getItem(K)||'{}')}catch{s={}}
export const db=Object.assign(JSON.parse(JSON.stringify(base)),s);db.settings=Object.assign({},base.settings,s.settings||{});
export const save=()=>{db.upd=Date.now();try{localStorage.setItem(K,JSON.stringify(db))}catch(e){console.warn('save failed',e)}try{dispatchEvent(new Event('carehub-save'))}catch{}};
export const today=()=>new Date().toISOString().slice(0,10);
export const touch=()=>{if(!db.days.includes(today())){db.days.push(today());save()}};
export const bump=(n=1)=>{const d=today();let r=db.log.find(x=>x.d==d);if(!r)db.log.push(r={d,n:0});r.n+=n;db.log=db.log.slice(-60);save()};
export const exportData=()=>JSON.stringify(db,null,1);
export const importData=t=>{Object.assign(db,JSON.parse(t));save()};
export const reset=()=>{localStorage.removeItem(K);location.reload()};
const DEV=['aiKey','aiUrl','aiProvider','aiModel','web'];
export const blob=()=>{const c=JSON.parse(JSON.stringify(db));DEV.forEach(k=>delete c.settings[k]);return c};
export function importRemote(r){const take=(r.upd||0)>=(db.upd||0),keep={};DEV.forEach(k=>keep[k]=db.settings[k]);
 const uni=(a,b,key)=>{const m=new Map();[...(a||[]),...(b||[])].forEach(x=>m.set(key?x[key]:x,x));return[...m.values()]};
 const days=uni(db.days,r.days),marks=uni(db.marks,r.marks),quiz=uni(db.quiz,r.quiz,'d');
 if(take){Object.assign(db,r);db.settings=Object.assign({},base.settings,r.settings||{},keep)}
 db.days=days;db.marks=marks;db.quiz=quiz;save()}
