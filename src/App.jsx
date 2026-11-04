
import React,{useState,useMemo} from 'react';
import htm from 'htm';
const html=htm.bind(React.createElement);
const STAGES=['Prospect','Contacted','In Talks','Committed','Received','Declined','Not Now'];
const TODAY='2026-11-03',SEM='Fall 2026',SEM_START='2026-08-15';
const $m=n=>'$'+(n||0).toLocaleString('en-US');
const addD=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const fd=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
let uid=100;const nid=()=>'x'+(uid++);

const members=[{id:'m1',name:'Maya Patel',title:'External VP',role:'Admin'},{id:'m2',name:'Jake Torres',title:'Treasurer',role:'Editor'},{id:'m3',name:'Priya Nair',title:'President',role:'Viewer'}];
const seed=()=>({org:'Mavs Engineering Society',goal:12000,me:'m1',members:structuredClone(members),
companies:[
{id:'c1',name:'Northgate Analytics',industry:'Tech',site:'northgate.example',loc:'Richardson, TX',tags:['tech','alumni owned']},
{id:'c2',name:'Cedar Springs Coffee',industry:'Food',site:'cedarsprings.example',loc:'Plano, TX',tags:['local']},
{id:'c3',name:'Lone Star Credit Union',industry:'Finance',site:'lonestarcu.example',loc:'Dallas, TX',tags:['local']},
{id:'c4',name:'Brightline Engineering',industry:'Engineering',site:'brightline.example',loc:'Addison, TX',tags:['alumni owned']},
{id:'c5',name:'Pecos Pizza Co.',industry:'Food',site:'pecospizza.example',loc:'Richardson, TX',tags:['local']},
{id:'c6',name:'Summit Staffing',industry:'Services',site:'summitstaff.example',loc:'Dallas, TX',tags:[]}],
contacts:[
{id:'p1',cid:'c1',name:'Dana Whitfield',title:'University Relations',email:'dana@northgate.example',primary:true},
{id:'p2',cid:'c2',name:'Luis Ortega',title:'Owner',email:'luis@cedarsprings.example',primary:true},
{id:'p3',cid:'c3',name:'Renee Cho',title:'Community Manager',email:'renee@lonestarcu.example',primary:true},
{id:'p4',cid:'c4',name:'Sam Okafor',title:'Principal',email:'sam@brightline.example',primary:true},
{id:'p5',cid:'c5',name:'Tony Russo',title:'Manager',email:'tony@pecospizza.example',primary:true},
{id:'p6',cid:'c6',name:'Ana Silva',title:'Recruiter',email:'ana@summitstaff.example',primary:true}],
requests:[
{id:'r1',cid:'c1',purpose:'Career night',sem:'Fall 2025',amount:500,received:500,stage:'Received',owner:'m1'},
{id:'r2',cid:'c1',purpose:'Hackathon prizes',sem:'Fall 2026',amount:1500,received:0,stage:'Committed',owner:'m1'},
{id:'r3',cid:'c3',purpose:'Competition travel',sem:'Spring 2026',amount:2000,received:2000,stage:'Received',owner:'m2'},
{id:'r4',cid:'c3',purpose:'Competition travel',sem:'Fall 2026',amount:2500,received:0,stage:'In Talks',owner:'m2'},
{id:'r5',cid:'c2',purpose:'Meeting snacks (in-kind)',sem:'Fall 2026',amount:300,received:300,stage:'Received',owner:'m2'},
{id:'r6',cid:'c4',purpose:'Shirts',sem:'Fall 2026',amount:1000,received:0,stage:'Contacted',owner:'m1'},
{id:'r7',cid:'c4',purpose:'Shirts',sem:'Spring 2026',amount:800,received:800,stage:'Received',owner:'m1'},
{id:'r8',cid:'c5',purpose:'Welcome-back pizza',sem:'Fall 2026',amount:400,received:0,stage:'Prospect',owner:'m2'},
{id:'r9',cid:'c6',purpose:'Resume workshop',sem:'Fall 2026',amount:600,received:0,stage:'Not Now',owner:'m1'}],
interactions:[
{id:'i1',cid:'c1',date:'2026-10-20',type:'Call',summary:'Dana confirmed $1,500 for hackathon prizes; wants logo on the event banner.'},
{id:'i2',cid:'c3',date:'2026-10-28',type:'Meeting',summary:'Met Renee at career fair. Board reviews sponsorships mid-November.'},
{id:'i3',cid:'c4',date:'2025-12-02',type:'Email',summary:'Sam prefers email. Last year’s logo-on-shirt deal went well.'},
{id:'i4',cid:'c2',date:'2026-09-10',type:'Email',summary:'Luis donated coffee and pastries for the first general meeting.'}],
follow:[
{id:'f1',cid:'c3',text:'Send proposal to Renee before board review',due:'2026-11-01',owner:'m2',done:false},
{id:'f2',cid:'c4',text:'Renewal ask for shirts',due:'2026-11-05',owner:'m1',done:false},
{id:'f3',cid:'c1',text:'Send thank-you and banner specs to Dana',due:'2026-11-08',owner:'m1',done:false},
{id:'f4',cid:'c6',text:'Reach back out next semester',due:'2027-01-20',owner:'m1',done:false}],
log:[{t:'2026-10-28 14:02',who:'m2',msg:'Logged meeting with Lone Star Credit Union'},{t:'2026-10-20 10:15',who:'m1',msg:'Moved “Hackathon prizes” to Committed'}]});
const empty=()=>({...seed(),org:'',companies:[],contacts:[],requests:[],interactions:[],follow:[],log:[]});

const compTotal=(d,cid)=>d.requests.filter(r=>r.cid===cid).reduce((s,r)=>s+r.received,0);
const lastTouch=(d,cid)=>d.interactions.filter(i=>i.cid===cid).map(i=>i.date).sort().pop();
const primary=(d,cid)=>d.contacts.find(c=>c.cid===cid&&c.primary&&!c.inactive)||d.contacts.find(c=>c.cid===cid);
const mname=(d,id)=>(d.members.find(m=>m.id===id)||{}).name||'—';

function Modal({title,children,onClose}){return html`<div class="modal" onClick=${onClose}><div class="card" onClick=${e=>e.stopPropagation()} role="dialog" aria-label=${title}><div class="row sp"><h2>${title}</h2><button class="g" onClick=${onClose}>Close</button></div>${children}</div></div>`}
function F({l,v,set,type,opts}){return html`<label>${l}${opts?html`<select value=${v} onChange=${e=>set(e.target.value)}>${opts.map(o=>html`<option key=${o.v??o} value=${o.v??o}>${o.l??o}</option>`)}</select>`:html`<input type=${type||'text'} value=${v} onInput=${e=>set(e.target.value)}/>`}</label>`}

function Auth({go}){
  const [org,setOrg]=useState(''),[em,setEm]=useState('');
  return html`<div class="auth"><h1>Ledger</h1><p class="sub">One sponsorship record your organization keeps, even when officers change.</p>
  <div class="card" style=${{display:'grid',gap:12}}><h2>Create your organization</h2>
  <${F} l="Organization name" v=${org} set=${setOrg}/><${F} l="Email" v=${em} set=${setEm} type="email"/>
  <button class="p" disabled=${!org||!em} onClick=${()=>go({...empty(),org})}>Create organization</button>
  <button onClick=${()=>go({...empty(),org})} disabled=${!org}>Continue with Google</button></div>
  <button onClick=${()=>go(seed())}>Explore the demo org with sample data</button></div>`}

function Home({d,up,can,open}){
  const mine=d.follow.filter(f=>f.owner===d.me&&!f.done).sort((a,b)=>a.due.localeCompare(b.due));
  const od=mine.filter(f=>f.due<TODAY);
  return html`<div><div class="top"><div><h1>My follow-ups</h1><p class="sub">${mname(d,d.me)} · ${od.length} overdue, ${mine.length-od.length} upcoming</p></div></div>
  <div class="card list">${mine.length?mine.map(f=>html`<div key=${f.id} class="row sp"><div><b>${f.text}</b><div class="mut"><button class="g" onClick=${()=>open(f.cid)}>${d.companies.find(c=>c.id===f.cid).name}</button></div></div>
  <div class="row"><span class=${'tag '+(f.due<TODAY?'w':'')}>${f.due<TODAY?'Overdue · ':'Due '}${fd(f.due)}</span><button disabled=${!can} onClick=${()=>up(x=>{x.follow.find(y=>y.id===f.id).done=true},'Completed follow-up: '+f.text)}>Mark done</button></div></div>`):html`<p class="mut">You’re all caught up. Log a follow-up from any company page.</p>`}</div></div>`}

function Dash({d,open}){
  const cur=d.requests.filter(r=>r.sem===SEM);
  const rec=cur.reduce((s,r)=>s+r.received,0),com=cur.filter(r=>['Committed','Received'].includes(r.stage)).reduce((s,r)=>s+r.amount,0);
  const all=d.requests.reduce((s,r)=>s+r.received,0);
  const top=d.companies.map(c=>({c,t:compTotal(d,c.id)})).filter(x=>x.t>0).sort((a,b)=>b.t-a.t).slice(0,5);
  const renew=d.companies.filter(c=>!c.archived&&compTotal(d,c.id)>0&&!((lastTouch(d,c.id)||'')>=SEM_START));
  const pct=Math.min(100,Math.round(com/d.goal*100));
  return html`<div><div class="top"><div><h1>Dashboard</h1><p class="sub">${SEM}</p></div></div>
  <div class="card" style=${{marginBottom:14}}><div class="row sp"><h2>Semester goal</h2><span class="mut">${$m(com)} committed of ${$m(d.goal)}</span></div><div class="big">${$m(rec)} <span class="mut" style=${{fontSize:15,fontWeight:400}}>received</span></div><div class="bar"><i style=${{width:pct+'%'}}></i></div></div>
  <div class="grid"><div class="card"><div class="mut">Committed this semester</div><div class="big">${$m(com)}</div></div><div class="card"><div class="mut">Received this semester</div><div class="big">${$m(rec)}</div></div><div class="card"><div class="mut">Received all-time</div><div class="big">${$m(all)}</div></div></div>
  <div class="grid" style=${{marginTop:14}}>
  <div class="card"><h2>Pipeline by stage</h2><div class="list">${STAGES.map(s=>{const n=cur.filter(r=>r.stage===s).length;return html`<div key=${s} class="row sp"><span>${s}</span><b>${n}</b></div>`})}</div></div>
  <div class="card"><h2>Top sponsors</h2><div class="list">${top.length?top.map(x=>html`<div key=${x.c.id} class="row sp"><button class="g" onClick=${()=>open(x.c.id)}>${x.c.name}</button><b>${$m(x.t)}</b></div>`):html`<p class="mut">No money received yet.</p>`}</div></div>
  <div class="card"><h2>Renewal candidates</h2><p class="mut">Past sponsors not contacted this semester</p><div class="list">${renew.length?renew.map(c=>html`<div key=${c.id}><button class="g" onClick=${()=>open(c.id)}>${c.name}</button></div>`):html`<p class="mut">Everyone has been contacted.</p>`}</div></div></div></div>`}

function Pipeline({d,up,can,open}){
  const [view,setView]=useState('board'),[drag,setDrag]=useState(null),[over,setOver]=useState(null),[add,setAdd]=useState(false),[sort,setSort]=useState({k:'stage',dir:1});
  const [f,setF]=useState({cid:d.companies[0]?.id||'',purpose:'',amount:'',stage:'Prospect'});
  const rs=d.requests.filter(r=>r.sem===SEM);
  const move=(id,stage)=>up(x=>{const r=x.requests.find(y=>y.id===id);r.stage=stage;if(stage==='Received'&&!r.received)r.received=r.amount},'Moved “'+d.requests.find(r=>r.id===id).purpose+'” to '+stage);
  const cn=id=>d.companies.find(c=>c.id===id)?.name;
  const rows=[...rs].sort((a,b)=>{const g=r=>sort.k==='company'?cn(r.cid):sort.k==='amount'?r.amount:sort.k==='received'?r.received:STAGES.indexOf(r.stage);return (g(a)>g(b)?1:-1)*sort.dir});
  const th=(k,l)=>html`<th onClick=${()=>setSort({k,dir:sort.k===k?-sort.dir:1})}>${l}${sort.k===k?(sort.dir>0?' ▲':' ▼'):''}</th>`;
  return html`<div><div class="top"><div><h1>Pipeline</h1><p class="sub">${SEM} sponsorship requests</p></div><div class="row"><div class="seg"><button class=${view==='board'?'on':''} onClick=${()=>setView('board')}>Board</button><button class=${view==='table'?'on':''} onClick=${()=>setView('table')}>Table</button></div><button class="p" disabled=${!can||!d.companies.length} onClick=${()=>setAdd(true)}>New request</button></div></div>
  ${view==='board'?html`<div class="kan">${STAGES.map(s=>{const items=rs.filter(r=>r.stage===s);return html`<div key=${s} class=${'col '+(over===s?'over':'')} onDragOver=${e=>{e.preventDefault();setOver(s)}} onDragLeave=${()=>setOver(null)} onDrop=${()=>{setOver(null);if(drag&&can)move(drag,s);setDrag(null)}}>
  <div class="row sp"><h3>${s}</h3><span class="mut">${items.length} · ${$m(items.reduce((t,r)=>t+r.amount,0))}</span></div>
  ${items.map(r=>html`<div key=${r.id} class="kc" draggable=${can} onDragStart=${()=>setDrag(r.id)}><b>${r.purpose}</b><div><button class="g" style=${{padding:0}} onClick=${()=>open(r.cid)}>${cn(r.cid)}</button></div><div class="row sp mut"><span>${$m(r.amount)}</span><span>${mname(d,r.owner).split(' ')[0]}</span></div>
  ${can&&html`<select aria-label="Move to stage" value=${r.stage} onChange=${e=>move(r.id,e.target.value)} style=${{marginTop:6,padding:4,fontSize:13}}>${STAGES.map(o=>html`<option key=${o}>${o}</option>`)}</select>`}</div>`)}</div>`})}</div>`
  :html`<div class="card tw"><table><thead><tr>${th('company','Company')}<th>Purpose</th>${th('stage','Stage')}${th('amount','Committed')}${th('received','Received')}<th>Owner</th></tr></thead><tbody>${rows.map(r=>html`<tr key=${r.id}><td>${cn(r.cid)}</td><td>${r.purpose}</td><td><span class="tag">${r.stage}</span></td><td>${$m(r.amount)}</td><td>${$m(r.received)}</td><td>${mname(d,r.owner)}</td></tr>`)}</tbody></table></div>`}
  ${add&&html`<${Modal} title="New request" onClose=${()=>setAdd(false)}><${F} l="Company" v=${f.cid} set=${v=>setF({...f,cid:v})} opts=${d.companies.map(c=>({v:c.id,l:c.name}))}/><${F} l="Event or purpose" v=${f.purpose} set=${v=>setF({...f,purpose:v})}/><${F} l="Ask amount ($)" type="number" v=${f.amount} set=${v=>setF({...f,amount:v})}/><${F} l="Stage" v=${f.stage} set=${v=>setF({...f,stage:v})} opts=${STAGES}/>
  <button class="p" disabled=${!f.purpose} onClick=${()=>{up(x=>{x.requests.push({id:nid(),cid:f.cid,purpose:f.purpose,sem:SEM,amount:+f.amount||0,received:0,stage:f.stage,owner:x.me})},'Added request “'+f.purpose+'”');setAdd(false)}}>Add request</button><//>`}</div>`}

function Companies({d,up,can,open}){
  const [q,setQ]=useState(''),[ind,setInd]=useState('All'),[sp,setSp]=useState(false),[arch,setArch]=useState(false),[add,setAdd]=useState(false),[n,setN]=useState(''),[i2,setI2]=useState('');
  const inds=['All',...new Set(d.companies.map(c=>c.industry))];
  const list=d.companies.filter(c=>(arch||!c.archived)&&(ind==='All'||c.industry===ind)&&(!sp||compTotal(d,c.id)>0)&&(c.name+c.tags.join()).toLowerCase().includes(q.toLowerCase()));
  return html`<div><div class="top"><div><h1>Companies</h1><p class="sub">${list.length} shown</p></div><button class="p" disabled=${!can} onClick=${()=>setAdd(true)}>Add company</button></div>
  <div class="row" style=${{marginBottom:14}}><input style=${{maxWidth:260}} placeholder="Search name or tag" aria-label="Search" value=${q} onInput=${e=>setQ(e.target.value)}/><select style=${{width:'auto'}} aria-label="Industry" value=${ind} onChange=${e=>setInd(e.target.value)}>${inds.map(o=>html`<option key=${o}>${o}</option>`)}</select>
  <label class="row" style=${{margin:0}}><input type="checkbox" style=${{width:'auto'}} checked=${sp} onChange=${e=>setSp(e.target.checked)}/>Sponsored before</label><label class="row" style=${{margin:0}}><input type="checkbox" style=${{width:'auto'}} checked=${arch} onChange=${e=>setArch(e.target.checked)}/>Show archived</label></div>
  <div class="grid">${list.map(c=>html`<button key=${c.id} class="card" style=${{textAlign:'left',opacity:c.archived?.6:1}} onClick=${()=>open(c.id)}><h3>${c.name}</h3><div class="mut">${c.industry} · ${c.loc}</div><div class="row" style=${{margin:'8px 0'}}>${c.tags.map(t=>html`<span key=${t} class="tag">${t}</span>`)}${c.archived&&html`<span class="tag w">Archived</span>`}</div><div class="row sp"><b>${$m(compTotal(d,c.id))} given</b><span class="mut">${lastTouch(d,c.id)?'Last contact '+fd(lastTouch(d,c.id)):'Never contacted'}</span></div></button>`)}</div>
  ${!list.length&&html`<p class="mut">No companies match. Add the first company your org plans to approach.</p>`}
  ${add&&html`<${Modal} title="Add company" onClose=${()=>setAdd(false)}><${F} l="Company name" v=${n} set=${setN}/><${F} l="Industry" v=${i2} set=${setI2}/>
  <button class="p" disabled=${!n} onClick=${()=>{const dup=d.companies.find(c=>c.name.toLowerCase()===n.toLowerCase());if(dup){alert(dup.name+' already exists.');return}up(x=>{x.companies.push({id:nid(),name:n,industry:i2||'Other',site:'',loc:'',tags:[]})},'Added company '+n);setAdd(false);setN('');setI2('')}}>Add company</button><//>`}</div>`}

function Profile({d,up,can,id,back}){
  const c=d.companies.find(x=>x.id===id);
  const [kind,setKind]=useState('First ask'),[draft,setDraft]=useState(''),[lg,setLg]=useState(null);
  const reqs=d.requests.filter(r=>r.cid===id),ints=d.interactions.filter(i=>i.cid===id).sort((a,b)=>b.date.localeCompare(a.date)),fu=d.follow.filter(f=>f.cid===id&&!f.done);
  const pc=primary(d,id),tot=compTotal(d,id);
  const gen=()=>{const nm=pc?pc.name.split(' ')[0]:'there',last=ints[0],past=reqs.filter(r=>r.received>0).map(r=>r.purpose+' ('+r.sem+')').join(', ');
    const body={'First ask':`I’m the ${mname(d,d.me)==='—'?'':'External VP'} of ${d.org||'our student organization'}. We’re planning ${reqs[0]?.purpose||'events this semester'} and would love ${c.name} to partner with us. I’ve attached our sponsorship packet with tiers and what sponsors receive.`,
    'Follow-up':`I wanted to follow up on our conversation${last?' ('+last.summary.slice(0,90)+')':''}. Happy to answer any questions or adjust the proposal.`,
    'Renewal':`Thank you for supporting us${past?' with '+past:''} — your ${$m(tot)} made a real difference. We’d love to work together again this semester. Could we find 15 minutes this month?`,
    'Thank-you':`Thank you for your support of ${$m(tot)}. Here’s what it made possible, and we’ll make sure your logo and shout-outs are delivered as promised.`}[kind];
    setDraft(`Subject: ${kind==='Thank-you'?'Thank you from '+d.org:'Partnering with '+(d.org||'our org')}\n\nHi ${nm},\n\n${body}\n\nBest,\n${mname(d,d.me)}`)};
  const prefill=()=>{const t=lg.raw,m=t.match(/\$\s?([\d,]+)/);setLg({...lg,summary:t.slice(0,160),amt:m?m[1].replace(/,/g,''):'',fu:'Follow up with '+(pc?.name||'contact'),due:addD(TODAY,7)})};
  return html`<div><button class="g" onClick=${back}>← All companies</button>
  <div class="top"><div><h1>${c.name}</h1><p class="sub">${c.industry} · ${c.loc||'No location'} · ${tot?$m(tot)+' given all-time':'Not yet a sponsor'}</p></div>
  <div class="row"><button disabled=${!can} onClick=${()=>setLg({raw:'',summary:'',type:'Email',fu:'',due:addD(TODAY,7),amt:''})}>Log interaction</button><button disabled=${!can} onClick=${()=>up(x=>{const k=x.companies.find(y=>y.id===id);k.archived=!k.archived},(c.archived?'Restored ':'Archived ')+c.name)}>${c.archived?'Restore':'Archive'}</button></div></div>
  <div class="grid">
  <div class="card"><h2>Contacts</h2><div class="list">${d.contacts.filter(p=>p.cid===id).map(p=>html`<div key=${p.id}><b>${p.name}</b> ${p.primary&&html`<span class="tag">Primary</span>`}<div class="mut">${p.title} · ${p.email}</div></div>`)}</div></div>
  <div class="card"><h2>Sponsorship requests</h2><div class="list">${reqs.length?reqs.map(r=>html`<div key=${r.id} class="row sp"><span>${r.purpose}<div class="mut">${r.sem} · ${r.stage}</div></span><span>${$m(r.received)} / ${$m(r.amount)}</span></div>`):html`<p class="mut">No requests yet.</p>`}</div></div>
  <div class="card"><h2>Open follow-ups</h2><div class="list">${fu.length?fu.map(f=>html`<div key=${f.id}>${f.text}<div class=${'mut'}>${fd(f.due)} · ${mname(d,f.owner)}</div></div>`):html`<p class="mut">None.</p>`}</div></div></div>
  <div class="grid" style=${{marginTop:14}}>
  <div class="card"><h2>Timeline</h2><div class="list">${ints.length?ints.map(i=>html`<div key=${i.id}><span class="tag">${i.type}</span> <span class="mut">${fd(i.date)}</span><div>${i.summary}</div></div>`):html`<p class="mut">No interactions logged.</p>`}</div></div>
  <div class="card" style=${{display:'grid',gap:10}}><h2>Draft an email</h2><p class="mut">Uses this company’s history. Always review before sending.</p><div class="row"><select style=${{width:'auto'}} value=${kind} onChange=${e=>setKind(e.target.value)} aria-label="Email type">${['First ask','Follow-up','Renewal','Thank-you'].map(o=>html`<option key=${o}>${o}</option>`)}</select><button class="p" onClick=${gen}>Generate draft</button></div>
  ${draft&&html`<textarea aria-label="Email draft" value=${draft} onInput=${e=>setDraft(e.target.value)}></textarea>`}</div></div>
  ${lg&&html`<${Modal} title="Log interaction" onClose=${()=>setLg(null)}><${F} l="Paste an email or rough notes (optional)" v=${lg.raw} set=${v=>setLg({...lg,raw:v})}/><button onClick=${prefill} disabled=${!lg.raw}>Pre-fill with AI</button>
  <${F} l="Type" v=${lg.type} set=${v=>setLg({...lg,type:v})} opts=${['Email','Call','Meeting','Career fair']}/><${F} l="Summary" v=${lg.summary} set=${v=>setLg({...lg,summary:v})}/><${F} l="Amount discussed ($)" type="number" v=${lg.amt} set=${v=>setLg({...lg,amt:v})}/><${F} l="Next step (optional)" v=${lg.fu} set=${v=>setLg({...lg,fu:v})}/><${F} l="Due date" type="date" v=${lg.due} set=${v=>setLg({...lg,due:v})}/>
  <button class="p" disabled=${!lg.summary} onClick=${()=>{up(x=>{x.interactions.push({id:nid(),cid:id,date:TODAY,type:lg.type,summary:lg.summary+(lg.amt?' (Amount discussed: '+$m(+lg.amt)+')':'')});if(lg.fu)x.follow.push({id:nid(),cid:id,text:lg.fu,due:lg.due,owner:x.me,done:false})},'Logged '+lg.type.toLowerCase()+' with '+c.name);setLg(null)}}>Save interaction</button><//>`}</div>`}

function Handoff({d,up,isAdmin}){
  const [txt,setTxt]=useState(''),[to,setTo]=useState(d.members.find(m=>m.id!==d.me)?.id);
  const gen=()=>{const act=d.companies.filter(c=>!c.archived&&(d.requests.some(r=>r.cid===c.id)||d.interactions.some(i=>i.cid===c.id)));
    const open=d.requests.filter(r=>r.sem===SEM&&!['Received','Declined'].includes(r.stage)).length;
    setTxt(`Handoff brief — ${d.org}\n${open} open requests this semester. ${$m(d.requests.reduce((s,r)=>s+r.received,0))} received all-time.\n\n`+act.map(c=>{const p=primary(d,c.id),n=d.follow.filter(f=>f.cid===c.id&&!f.done).sort((a,b)=>a.due.localeCompare(b.due))[0],g=d.requests.filter(r=>r.received>0).filter(r=>r.cid===c.id).map(r=>$m(r.received)+' in '+r.sem+' for '+r.purpose).join('; ');
      return '• '+c.name+': '+(g?'gave '+g:'no gift yet')+(p?'. Contact: '+p.name+' ('+p.email+')':'')+(n?'. Next: '+n.text+' by '+fd(n.due):'')+'.'}).join('\n'))};
  const transfer=()=>up(x=>{const a=x.members.find(m=>m.id===x.me),b=x.members.find(m=>m.id===to);b.role='Admin';a.role='Editor'},'Transferred admin to '+mname(d,to));
  return html`<div><div class="top"><div><h1>Handoff & history</h1><p class="sub">Give the next officer everything in one step.</p></div></div>
  <div class="grid"><div class="card" style=${{display:'grid',gap:10}}><h2>Handoff summary</h2><button class="p" onClick=${gen}>Generate summary</button>${txt&&html`<textarea style=${{minHeight:260}} aria-label="Handoff summary" value=${txt} onInput=${e=>setTxt(e.target.value)}></textarea>`}</div>
  <div class="card" style=${{display:'grid',gap:10,alignContent:'start'}}><h2>Transfer admin</h2><${F} l="Incoming officer" v=${to} set=${setTo} opts=${d.members.filter(m=>m.id!==d.me).map(m=>({v:m.id,l:m.name+' — '+m.title}))}/><button class="p" disabled=${!isAdmin} onClick=${transfer}>Transfer admin access</button>${!isAdmin&&html`<p class="mut">Only admins can transfer ownership.</p>`}</div></div>
  <div class="card list" style=${{marginTop:14}}><h2>Activity log</h2>${d.log.length?d.log.map((l,i)=>html`<div key=${i} class="row sp"><span>${l.msg}</span><span class="mut">${mname(d,l.who)} · ${l.t}</span></div>`):html`<p class="mut">Changes will appear here.</p>`}</div></div>`}

function App(){
  const [d,setD]=useState(null),[view,setView]=useState('home'),[sel,setSel]=useState(null);
  if(!d)return html`<${Auth} go=${setD}/>`;
  const me=d.members.find(m=>m.id===d.me),can=me.role!=='Viewer',isAdmin=me.role==='Admin';
  const up=(fn,msg)=>setD(p=>{const n=structuredClone(p);fn(n);if(msg)n.log.unshift({t:TODAY+' '+new Date().toTimeString().slice(0,5),who:n.me,msg});return n});
  const open=id=>{setSel(id);setView('companies')};
  const od=d.follow.filter(f=>f.owner===d.me&&!f.done&&f.due<TODAY).length;
  const nav=[['home','My follow-ups',od||''],['dash','Dashboard'],['pipe','Pipeline'],['companies','Companies'],['hand','Handoff & history']];
  return html`<div class="app"><nav><div class="brand">Ledger</div>${nav.map(([k,l,b])=>html`<button key=${k} class=${view===k?'on':''} onClick=${()=>{setView(k);setSel(null)}}>${l}${b?html`<span class="tag w">${b}</span>`:''}</button>`)}
  <div class="who"><div>${d.org||'Your organization'}</div><div>${me.name}</div><label style=${{color:'#9fb5a9'}}>View as role<select value=${me.role} onChange=${e=>up(x=>{x.members.find(m=>m.id===x.me).role=e.target.value})}>${['Admin','Editor','Viewer'].map(r=>html`<option key=${r}>${r}</option>`)}</select></label></div></nav>
  <main>${!can&&html`<div class="card" style=${{marginBottom:14}}>You have read-only access. Ask an admin for the Editor role to make changes.</div>`}
  ${view==='home'&&html`<${Home} d=${d} up=${up} can=${can} open=${open}/>`}${view==='dash'&&html`<${Dash} d=${d} open=${open}/>`}${view==='pipe'&&html`<${Pipeline} d=${d} up=${up} can=${can} open=${open}/>`}
  ${view==='companies'&&(sel?html`<${Profile} key=${sel} d=${d} up=${up} can=${can} id=${sel} back=${()=>setSel(null)}/>`:html`<${Companies} d=${d} up=${up} can=${can} open=${setSel}/>`)}
  ${view==='hand'&&html`<${Handoff} d=${d} up=${up} isAdmin=${isAdmin}/>`}</main></div>`}

export default App;
