// ===== UPLOAD A FORMULA (PDF / photo + offline OCR) =====
// Loaded lazily from index.html. Uses globals: DR, stepF, fx, fitFx, build, lex, esc, escA, gid, state, back, buildEd
const UPL={open:false,src:null,name:'',kind:'',page:1,pages:1,pdf:null,zoom:1,rects:{},crops:{},rectSeq:0,view:'doc',worker:null,busy:false,res:null,job:null,n:1,stall:[15000,60000],cardSeq:0,langProbeCtrl:null,ocrLanguages:'eng',greekModelMissing:false,auto:null,returnToSummary:false,hasSummaryDraft:false};
// phones / low-memory devices get smaller canvases so the page never lags or gets killed by the system
const PHONE=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||Math.min(screen.width||999,screen.height||999)<700||(navigator.deviceMemory&&navigator.deviceMemory<=4)||false;
const LIM={dispW:PHONE?1400:2200,dispPx:PHONE?2.6e6:7e6,ocrW:PHONE?1600:1800,ocrPx:PHONE?2.8e6:3.2e6,cropPx:PHONE?1.6e6:2.4e6,photo:PHONE?2800:4000,zoom:PHONE?3:4};
const UTYPES=[['Name','#3b82c4'],['Formula','#d0583a'],['Legend','#3f9a5a'],['Mnemonics','#9a5fc4']];
const roleLabel=r=>r==='Legend'?'Where':r==='Mnemonics'?'Mnemonic':r;
const UCOL=Object.fromEntries(UTYPES);
const SUPR=Object.fromEntries(Object.entries(SUPM).map(([a,b])=>[b,a]));
const SUBR=Object.fromEntries(Object.entries(SUBM).map(([a,b])=>[b,a]));
const loadJS=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('Could not load '+src));document.head.appendChild(s)});
const uq=s=>document.querySelector('#up '+s);

function uplCSS(){if(document.getElementById('upcss'))return;const s=document.createElement('style');s.id='upcss';s.textContent=`
#up{position:fixed;inset:0;z-index:12;background:var(--bg);color:var(--ink);display:none;flex-direction:column;font-family:var(--ff);padding-left:var(--sal);padding-right:var(--sar)}
#up.show{display:flex}
#up .uh{display:flex;align-items:center;gap:8px;padding:calc(var(--sat) + 8px) 10px 6px}
#up .uh b{flex:1;font-size:17px;text-align:center}
#up .ub{background:var(--pill);color:var(--ink);border:2px solid var(--tb);border-bottom-width:4px;border-radius:14px;padding:8px 13px;font:600 14px var(--ff)}
#up .ub.pri{background:var(--acc);color:var(--onacc);border-color:var(--accd)}
#up .ub[disabled]{opacity:.45}
#up .uchips{display:flex;gap:6px;padding:4px 10px;touch-action:none}
#up .uchip{flex:1;min-width:0;height:44px;border:2px dashed;border-radius:6px;display:flex;align-items:center;justify-content:center;font:700 12px var(--ff);touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;position:relative}
#up .uchip.used::after{content:'✓';position:absolute;top:1px;right:4px;font-size:11px}
#up .uhint{font-size:12px;color:var(--mut);padding:0 12px 4px;text-align:center;line-height:1.3}
#up .ubar{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:2px 10px 6px;font-size:13px;color:var(--mut)}
#up .ubar .ub{padding:5px 12px}
#up .uv{flex:1;overflow:auto;padding:26px 0 calc(40px + var(--sab));background:color-mix(in srgb,var(--ink) 12%,var(--bg));position:relative;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#up .upw{position:relative;margin:0 auto;line-height:0;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.25);touch-action:none}
#up .ufileactions{display:flex;justify-content:flex-end;padding:0 10px 2px;margin-top:-2px}
#up .ufileactions .ub{padding:5px 10px;font-size:12px;color:var(--mut)}
#up .upw canvas{width:100%;display:block}
#up .ur{position:absolute;border:2px solid;border-radius:3px;touch-action:none;cursor:move;box-sizing:border-box}
#up .ur .ul{position:absolute;left:-2px;top:-20px;height:18px;padding:0 4px;color:#fff;font:700 11px/18px var(--ff);border-radius:4px 4px 0 0;white-space:nowrap;display:flex;gap:6px;align-items:center}
#up .ur .ul i{font-style:normal;padding:0 3px;cursor:pointer}
#up .ur .uhd{position:absolute;width:22px;height:22px;touch-action:none}
#up .ur .uhd::after{content:'';position:absolute;left:7px;top:7px;width:10px;height:10px;background:#fff;border:2px solid currentColor;border-radius:2px;box-sizing:border-box}
#up .uempty{margin:auto;text-align:center;padding:30px;color:var(--mut);display:flex;flex-direction:column;gap:14px;align-items:center}
#up .uempty .ub{font-size:17px;padding:14px 22px}
#up .ugh{position:fixed;z-index:30;pointer-events:none;border:2px solid;border-radius:5px;padding:12px 18px;font:700 14px var(--ff);color:#fff;opacity:.9}
#up .ubody{flex:1;overflow:auto;padding:6px max(14px,calc((100% - 880px)/2)) 20px;display:flex;flex-direction:column;gap:8px}
#up .ubody>*{flex-shrink:0}
#up .ubody img{max-width:100%;max-height:90px;border-radius:8px;border:2px solid var(--tb);background:#fff;align-self:flex-start}
#up .ubody .lbl{color:var(--mut);font-size:13px;letter-spacing:.08em;text-transform:uppercase;margin:6px 4px 0}
#up .ubusy{position:absolute;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:40}
#up .ubusy.show{display:flex}
#up .ubusy>div{background:var(--card);border:2px solid var(--tb);border-radius:18px;padding:18px 24px;text-align:center;width:min(320px,86%);display:flex;flex-direction:column;gap:6px;align-items:stretch}
#up .ubusy .bar{height:24px;border-radius:999px;border:1px solid var(--tb);background:var(--pill);margin-top:6px;overflow:hidden;position:relative}
#up .ubusy .bar i{position:absolute;left:0;top:0;bottom:0;display:block;height:100%;width:0;background:var(--acc);transition:width .2s;z-index:1}
#up .ubusy .bar #ubq{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 13px/1 var(--ff);color:var(--ink);z-index:3;text-shadow:0 1px 0 var(--card),0 -1px 0 var(--card)}
#up .ubusy .bar.ind::after{content:'';position:absolute;top:0;bottom:0;width:35%;background:linear-gradient(90deg,transparent,var(--acc),transparent);animation:uind 1.1s linear infinite;z-index:2}
@keyframes uind{from{left:-35%}to{left:100%}}
#up .ubusy .uhn{font-size:12.5px;color:var(--mut);min-height:16px;line-height:1.35}
#up .ubusy .ub{margin-top:6px}
#up .ubusy .ub.stop{display:none}
#up .uslid{display:flex;flex-direction:column;gap:2px;padding:0 12px 4px}
#up .uslid .usr{display:flex;gap:10px;align-items:center}
#up .uslid .usr input{flex:1;min-width:0;width:auto;margin:0}
#up .uslid .usr .ub{white-space:nowrap}
#up .uslid .lb{font-size:12.5px;color:var(--mut)}
#up .uslid .lb b{color:var(--ink)}
#up .ub.pri{flex:none;box-shadow:none;letter-spacing:.03em;font-size:13px;padding:8px 12px;white-space:nowrap}
#up .ubar2{display:flex;flex-wrap:wrap;gap:6px;padding:0 10px 6px}
#up .ubar2 .ub{flex:1 1 auto;padding:8px 10px;font-size:13px}
#up .sumtop{display:flex;gap:8px;align-items:center;padding:4px max(12px,calc((100% - 880px)/2))}
#up .sumtop .ub{flex:1;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:6px}
#up .scd{background:var(--card);border:2px solid var(--tb);border-bottom-width:4px;border-radius:16px;padding:10px;display:flex;flex-direction:column;gap:8px}
#up .scd.none{opacity:.75;border-style:dashed}
#up .scd.selected{border-color:var(--accd);box-shadow:0 0 0 2px var(--acc);background:color-mix(in srgb,var(--acc) 7%,var(--card))}
#up .scn{font-size:12px;color:var(--mut);display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
#up .scn>span{flex:1;min-width:0;line-height:1.35;padding-top:3px}
#up .scops{display:flex;align-items:center;justify-content:flex-end;gap:5px;flex-wrap:wrap}
#up .scn button{background:none;border:0;color:#b04d58;font:600 12px var(--ff);padding:2px 4px}
#up .scn .catpick{background:var(--pill);color:var(--ink);border:2px solid var(--tb);border-radius:9px;padding:5px 7px;font:600 11px var(--ff);max-width:155px}
#up .scn .catpick b{font-weight:800}
#up .scn .catbadge{display:inline-flex;align-items:center;background:var(--pill);color:var(--ink);border:1px solid var(--tb);border-radius:8px;padding:4px 7px;font:700 11px var(--ff);white-space:nowrap}
#up #ssave{font-size:11px;padding:6px 7px;white-space:nowrap;max-width:145px}
#up #ssave[hidden]{display:none}
#up .scrop{max-width:100%;max-height:96px;object-fit:contain;align-self:flex-start;margin-bottom:3px}
#up .scd.saved{border-color:#8ac985;background:color-mix(in srgb,#dff3d9 35%,var(--card))}
#up .scd.saved .scn>span{color:#276b36;font-weight:700}
#up .srow.savedrow{opacity:.82}
#up .srow [disabled]{opacity:.8}
#up .scd.saved .scact .ub{background:#dff3d9;color:#276b36;border-color:#8ac985}
#up .scact{display:flex;justify-content:flex-end;border-top:1px solid var(--tb);padding-top:6px}
#up .scact .ub{min-width:88px;justify-content:center}
#up .srow [data-t]{width:100%}
#up .srow{display:flex;gap:8px;align-items:flex-start}
#up .srow.skip{opacity:.5}
#up .rch{flex:none;width:76px;border:2px solid;border-radius:10px;padding:7px 2px;font:700 12px var(--ff);background:transparent;margin-top:6px}
#up .rcol{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
#up .rcol textarea{padding:9px 10px;font-size:15px;min-height:42px}
#up .rpv{background:var(--bg);border-radius:10px;padding:2px 6px;overflow:hidden}
#up .rpv .fxw{font-size:22px}
#up .rx{flex:none;background:none;border:0;color:var(--mut);font-size:16px;padding:8px 4px;margin-top:4px}
#up .addl{align-self:flex-start;background:none;border:2px dashed var(--tb);border-radius:10px;color:var(--mut);font:600 12px var(--ff);padding:5px 10px}
#up .sumfoot{display:flex;gap:8px;padding:8px max(12px,calc((100% - 880px)/2)) calc(var(--sab) + 10px);border-top:2px solid var(--tb);background:var(--bg)}
#up .sumfoot .ub{padding:13px}
#up .urm{position:fixed;z-index:60;background:var(--card);border:2px solid var(--tb);border-bottom-width:4px;border-radius:14px;padding:6px;display:flex;flex-direction:column;gap:4px;min-width:150px;max-height:60dvh;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.3)}
#up .urm button{background:none;border:0;text-align:left;padding:10px 12px;border-radius:9px;font:600 14px var(--ff);color:var(--ink)}
#up .urm button:active{background:var(--pill)}
#up .urb{position:fixed;inset:0;z-index:55}
#up details.guide{margin:0}
`;document.head.appendChild(s)}

function uplShell(){
 let el=gid('up');
 if(!el){el=document.createElement('div');el.id='up';document.body.appendChild(el)}
 return el}

function uplOpen(){
 uplCSS();const el=uplShell();UPL.open=true;if(window.nativeKbSuspend)nativeKbSuspend();el.classList.add('show');uplDoc();if(UPL.src)uplWarmLater()}
function uplClose(){if(UPL.job)uplCancel();UPL.open=false;const el=gid('up');if(el)el.classList.remove('show');if(window.nativeKbResume)nativeKbResume()}
function uplRemoveFile(){
 if(!UPL.src&&!UPL.pdf)return;
 if(!confirm('Remove the uploaded PDF or image? Your current boxes and unsubmitted OCR selections will be cleared.'))return;
 if(UPL.job)uplCancel();
 freeCv(UPL.src);
 try{UPL.pdf&&UPL.pdf.destroy()}catch(e){}
 Object.assign(UPL,{src:null,name:'',kind:'',page:1,pages:1,pdf:null,zoom:1,rects:{},crops:{},rectSeq:0,res:null,auto:null,returnToSummary:false,hasSummaryDraft:false,view:'doc',n:1,greekModelMissing:false});
 const input=uq('#uf');if(input)input.value='';
 uplDoc();
}
// returns true if it consumed the back press
function uplBack(){
 if(!UPL.open)return false;
 if(UPL.busy||UPL.job){uplCancel();return true} // back = cancel the running job, never a dead end
 if(UPL.view==='review'||UPL.view==='sum'){UPL.returnToSummary=UPL.view==='sum'&&!!UPL.auto;uplMenuClose();uplDoc();return true}
 uplClose();return true}

// ---------- jobs: everything slow runs as a job that can be cancelled ----------
const CANCELLED={cancelled:true},STOP={stop:true};
function jobStart(){
 if(UPL.job)uplCancel();
 const J={cancelled:false,undo:[],canStop:false,done:0};
 J.p=new Promise((_,no)=>{J.rej=no});J.p.catch(()=>{});UPL.job=J;return J}
const jobOn=(J,f)=>{if(J)J.undo.push(f)};
const jobChk=J=>{if(J&&J.cancelled)throw J.why||CANCELLED};
const W=(J,p)=>J?Promise.race([p,J.p]):p; // wait for p, but give up at once if the job is cancelled
function jobEnd(J){if(UPL.job===J)UPL.job=null;UPL.prog=null;UPL.initp=null}
function jobAbort(why){const J=UPL.job;if(!J||J.cancelled)return;J.cancelled=true;J.why=why;
 J.undo.splice(0).forEach(f=>{try{f()}catch(e){}});J.rej(why)}
function uplCancel(){jobAbort(CANCELLED);UPL.job=null;UPL.prog=null;UPL.initp=null;uplBusy(false)}
function uplStop(){const J=UPL.job;if(J&&J.canStop&&J.done>0)jobAbort(STOP)}
const freeCv=c=>{try{if(c&&c.width){c.width=c.height=0}}catch(e){}};

// ---------- document view ----------
function uplDoc(){
 UPL.view='doc';const el=uplShell(),pdf=UPL.kind==='pdf',multi=pdf&&UPL.pages>1,rem=Math.max(1,UPL.pages-UPL.page+1);
 UPL.n=Math.max(1,Math.min(UPL.n||1,rem));
 el.innerHTML=`<div class="uh"><button class="ub" id="uc">‹ Close</button><b>Upload formula</b>${UPL.src?'<button class="ub" id="uo">Change file</button>':''}</div>
 <div class="udoc"><div class="utb">
 ${UPL.src?'<div class="ufileactions"><button class="ub" id="urmf" aria-label="Remove uploaded PDF or image">✕ Remove file</button></div>':''}
 <div class="uchips" id="uch">${UTYPES.map(([n,c])=>`<div class="uchip${Object.values(UPL.rects).some(r=>r.role===n)?' used':''}" data-n="${n}" style="border-color:${c};color:${c};background:${c}1f">${roleLabel(n)}</div>`).join('')}</div>
 ${UPL.src?'<div class="uhint">Drag a box onto the page, then move / resize it over that part. Add as many Name, Formula, Where, or Mnemonic boxes as you need.</div>':''}
 ${UPL.src?`<div class="ubar">${pdf?`<button class="ub" id="upv">‹</button><span>Page ${UPL.page} / ${UPL.pages}</span><button class="ub" id="unx">›</button><span style="flex:1"></span>`:'<span style="flex:1"></span>'}<button class="ub" id="uzo">−</button><span id="uzl">${Math.round(UPL.zoom*100)}%</span><button class="ub" id="uzi">+</button></div>
 <div class="ubar2">${UPL.returnToSummary&&UPL.hasSummaryDraft?'<button class="ub pri" id="ursum">Return to Summary</button>':''}<button class="ub pri" id="urd"${Object.keys(UPL.rects).length?'':' disabled'}>Read boxes ▸</button><button class="ub pri" id="uar">Read whole ${pdf?'page':'photo'}</button>${multi?`<button class="ub pri" id="uaa">Read all ${UPL.pages} pages</button>`:''}</div>
 ${multi?`<div class="uslid"><div class="lb" id="unl"></div><div class="usr"><input type="range" id="unr" min="1" max="${rem}" value="${UPL.n}"${rem<2?' disabled':''} aria-label="Number of pages to read"><button class="ub pri" id="unb"></button></div></div>`:''}`:''}
 </div><div class="uv" id="uvw">${UPL.src?'<div class="upw" id="upw"></div>':`<div class="uempty"><div style="font-size:42px">📄</div><div>Open a PDF or photo (JPG/JPEG, PNG, WebP, GIF, BMP) that contains formulas</div><button class="ub pri" id="uo2">Open PDF / photo</button></div>`}</div></div>
 <input type="file" id="uf" accept="application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp,image/gif,.gif,image/bmp,.bmp" hidden>
 <div class="ubusy" id="ubz"><div><span id="ubt">Working…</span><div class="bar" id="ubb"><i id="ubp"></i><span id="ubq">0%</span></div><div class="uhn" id="ubh"></div><button class="ub stop" id="ubs">Stop &amp; use pages read so far</button><button class="ub" id="ubc">Cancel</button></div></div>`;
 uq('#uc').onclick=uplClose;uq('#ubc').onclick=uplCancel;uq('#ubs').onclick=uplStop;
 const pick=()=>uq('#uf').click();const openBtn=uq('#uo');if(openBtn)openBtn.onclick=pick;const o2=uq('#uo2');if(o2)o2.onclick=pick;const rs=uq('#ursum');if(rs)rs.onclick=()=>{UPL.returnToSummary=false;uplSummary()};
 const rm=uq('#urmf');if(rm)rm.onclick=uplRemoveFile;
 uq('#uf').onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(f)uplLoad(f)};
 if(UPL.src){
  uplFit();uplRects();uplBindViewerGestures();
  const pg=async d=>{const n=UPL.page+d;if(n<1||n>UPL.pages)return;
   const J=jobStart();uplBusy(true,'Opening page '+n+'…',.05);await tick();
   try{const c=await uplPageCanvas(n,{w:LIM.dispW,maxPx:LIM.dispPx,J,onp:p=>uplBusy(true,null,.05+.9*p)});jobChk(J);
    freeCv(UPL.src);UPL.page=n;UPL.src=c;UPL.rects={};UPL.crops={}}
   catch(e){jobEnd(J);if(e===CANCELLED)return;uplBusy(false);alert('Could not open the page: '+(e&&e.message||e));return}
   jobEnd(J);uplBusy(false);uplDoc()};
  if(pdf){uq('#upv').onclick=()=>pg(-1);uq('#unx').onclick=()=>pg(1)}
  const zl=uq('#uzl'),zoom=f=>{UPL.zoom=Math.max(.5,Math.min(LIM.zoom,UPL.zoom*f));uplSize();zl.textContent=Math.round(UPL.zoom*100)+'%'}; // no full redraw: keeps zooming smooth
  uq('#uzo').onclick=()=>zoom(1/1.25);uq('#uzi').onclick=()=>zoom(1.25);
  uq('#urd').onclick=uplRead;
  uq('#uar').onclick=()=>uplAuto(UPL.page,1);const aa=uq('#uaa');if(aa)aa.onclick=()=>uplAuto(1,UPL.pages);
  if(multi){
   const nl=()=>{const a=UPL.page,n=UPL.n;uq('#unl').innerHTML=`Pages to read · <b>${n}</b> (${n===1?'page '+a:'pages '+a+'–'+(a+n-1)})`;uq('#unb').textContent='Read '+n+(n===1?' page':' pages')};
   uq('#unr').oninput=e=>{UPL.n=+e.target.value;nl()};uq('#unb').onclick=()=>uplAuto(UPL.page,UPL.n);nl()}
  uplChips();
 }
}
// progress overlay: progress bar with centered percent + Cancel. The value only ever goes up within one job.
// If nothing moves for a few seconds the bar animates and a hint appears, so it never looks frozen.
function uplBusy(on,t,p){
 if(on&&!UPL.busy){UPL.pmax=0;UPL.lastProg=Date.now();UPL.bt=null}
 UPL.busy=!!on;
 if(!on){clearInterval(UPL.tm);UPL.tm=0}
 const z=uq('#ubz');if(!z)return;
 z.classList.toggle('show',!!on);if(!on)return;
 if(!UPL.tm)UPL.tm=setInterval(busyTick,500);
 if(t!=null&&t!==UPL.bt){UPL.bt=t;uq('#ubt').textContent=t;UPL.lastProg=Date.now()}
 if(p!=null){p=Math.max(UPL.pmax||0,Math.min(1,p));if(p>(UPL.pmax||0))UPL.lastProg=Date.now();UPL.pmax=p;const n=Math.round(p*100);uq('#ubp').style.width=n+'%';uq('#ubq').textContent=n+'%'}
 busyTick()}
function busyTick(){
 if(!UPL.busy)return;
 const idle=Date.now()-UPL.lastProg;
 const b=uq('#ubb');if(b)b.classList.toggle('ind',idle>2500);
 const h=uq('#ubh');if(h)h.textContent=idle>45000?'No response from the reader for a while. Press Cancel and try again (or read fewer pages).':idle>15000?'Still working… this device is a bit slow. You can wait, or press Cancel.':'';
 const J=UPL.job,s=uq('#ubs');if(s)s.style.display=J&&J.canStop&&J.done>0?'block':'none'}
const readFile=(f,cb)=>new Promise((ok,no)=>{const r=new FileReader();r.onprogress=e=>{if(e.lengthComputable&&cb)cb(e.loaded/e.total)};r.onload=()=>ok(r.result);r.onerror=()=>no(new Error('Could not read the file'));r.readAsArrayBuffer(f)});
const tick=()=>new Promise(r=>setTimeout(r,30));

function uplFit(){
 const w=uq('#upw');w.innerHTML='';w.appendChild(UPL.src);uplSize()}
function uplSize(){
 const w=uq('#upw'),v=uq('#uvw');if(w&&v)w.style.width=Math.max(120,(v.clientWidth-16)*UPL.zoom)+'px'}
// Pinch/pan are implemented only on the uploaded PDF/photo surface. The app viewport
// disables browser-level pinch zoom; the existing + / − controls remain available.
function uplBindViewerGestures(){
 const v=uq('#uvw'),w=uq('#upw');if(!v||!w)return;
 const pts=new Map();let mode='',pin=null,raf=0,pendingScroll=null;
 const zoomLabel=()=>{const z=uq('#uzl');if(z)z.textContent=Math.round(UPL.zoom*100)+'%'};
 const pair=()=>[...pts.entries()].slice(0,2);
 const midpoint=a=>({x:(a[0][1].x+a[1][1].x)/2,y:(a[0][1].y+a[1][1].y)/2});
 const distance=a=>Math.max(1,Math.hypot(a[0][1].x-a[1][1].x,a[0][1].y-a[1][1].y));
 const startPinch=()=>{
  const a=pair();if(a.length<2)return;
  // A second finger turns any in-progress box drag into a page gesture.
  w.querySelectorAll('.ur').forEach(d=>{
   d.onpointermove=d.onpointerup=d.onpointercancel=null;
   for(const [id] of a){try{if(d.hasPointerCapture(id))d.releasePointerCapture(id)}catch(e){}}
  });
  pin={ids:a.map(x=>x[0]),dist:distance(a),zoom:UPL.zoom,scrollLeft:v.scrollLeft,scrollTop:v.scrollTop};
  const c=midpoint(a),r=v.getBoundingClientRect();pin.cx=c.x-r.left;pin.cy=c.y-r.top;
  for(const [id] of a){try{v.setPointerCapture(id)}catch(e){}}
  mode='pinch';
 };
 const onDown=e=>{
  if(e.pointerType!=='touch'||!e.target.closest('#upw'))return;
  const isBox=!!e.target.closest('.ur');
  pts.set(e.pointerId,{x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,isBox});
  if(pts.size===1){
   mode=isBox?'box':'pan';
   if(mode==='pan'){try{v.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();e.stopPropagation()}
   return;
  }
  if(pts.size>=2){startPinch();e.preventDefault();e.stopPropagation()}
 };
 const onMove=e=>{
  const p=pts.get(e.pointerId);if(!p)return;
  p.x=e.clientX;p.y=e.clientY;
  if(mode==='pinch'&&pin){
   const a=pin.ids.map(id=>[id,pts.get(id)]);if(a.some(x=>!x[1]))return;
   const c=midpoint(a),r=v.getBoundingClientRect(),z=Math.max(.5,Math.min(LIM.zoom,pin.zoom*distance(a)/pin.dist));
   UPL.zoom=z;uplSize();zoomLabel();
   const ratio=z/pin.zoom,cx=c.x-r.left,cy=c.y-r.top,snap=pin;
   pendingScroll={left:Math.max(0,(snap.scrollLeft+snap.cx)*ratio-cx),top:Math.max(0,(snap.scrollTop+snap.cy)*ratio-cy)};
   if(!raf)raf=requestAnimationFrame(()=>{
    raf=0;if(pendingScroll){v.scrollLeft=pendingScroll.left;v.scrollTop=pendingScroll.top;pendingScroll=null}
   });
   e.preventDefault();e.stopPropagation();return;
  }
  if(mode==='pan'&&pts.size===1){
   v.scrollLeft-=e.clientX-p.lastX;v.scrollTop-=e.clientY-p.lastY;p.lastX=e.clientX;p.lastY=e.clientY;
   e.preventDefault();e.stopPropagation();return;
  }
 };
 const onEnd=e=>{
  if(!pts.has(e.pointerId))return;
  const wasPinch=mode==='pinch';pts.delete(e.pointerId);
  if(wasPinch){e.preventDefault();e.stopPropagation()}
  if(pts.size>=2&&wasPinch){startPinch();return}
  if(pts.size===1&&wasPinch){
   mode='pan';pin=null;const [id,p]=[...pts.entries()][0];p.lastX=p.x;p.lastY=p.y;try{v.setPointerCapture(id)}catch(x){}
   return;
  }
  if(!pts.size){mode='';pin=null}
 };
 v.addEventListener('pointerdown',onDown,true);
 v.addEventListener('pointermove',onMove,true);
 v.addEventListener('pointerup',onEnd,true);
 v.addEventListener('pointercancel',onEnd,true);
}

async function uplLoad(file){
 const J=jobStart(),B=(t,p)=>uplBusy(true,t,p);let task=null,url=null;
 jobOn(J,()=>{try{task&&task.destroy()}catch(e){}if(url)URL.revokeObjectURL(url)});
 B('Opening…',0);await tick();
 try{
  const isPdf=/pdf/i.test(file.type)||/\.pdf$/i.test(file.name),N={};
  const imageOK=/\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)||/^image\/(jpeg|png|webp|gif|bmp)$/i.test(file.type);
  if(!isPdf&&!imageOK)throw new Error('Compatible formats: PDF, JPG/JPEG, PNG, WebP, GIF, and BMP.');
  if(isPdf){
   if(!window.pdfjsLib){B('Loading the PDF reader…',.02);await W(J,loadJS('lib/pdf.min.js'));jobChk(J);pdfjsLib.GlobalWorkerOptions.workerSrc='lib/pdf.worker.min.js'}
   B('Reading the file…',.1);
   const buf=await W(J,readFile(file,p=>B('Reading the file…',.1+.35*p)));jobChk(J);
   B('Opening the PDF…',.5);await tick();
   task=pdfjsLib.getDocument({data:buf,isEvalSupported:false});task.onProgress=o=>{if(o&&o.total)B('Opening the PDF…',.5+.2*Math.min(1,o.loaded/o.total))};
   N.pdf=await W(J,task.promise);jobChk(J);
   N.kind='pdf';N.pages=N.pdf.numPages;
   B('Drawing page 1…',.72);await tick();
   N.src=await uplPageCanvas(1,{pdf:N.pdf,w:LIM.dispW,maxPx:LIM.dispPx,J,onp:p=>B('Drawing page 1…',.72+.26*p)})}
  else{
   B('Reading the photo…',.1);url=URL.createObjectURL(file);
   B('Decoding the photo…',.3);await tick();
   const img=await W(J,new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('That image could not be opened'));i.src=url}));jobChk(J);
   B('Preparing the photo…',.8);await tick();
   const k=Math.min(1,LIM.photo/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');
   c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   URL.revokeObjectURL(url);url=null;img.src='';N.src=c;N.kind='img';N.pages=1}
  jobChk(J);B('Done',1);await tick();jobChk(J);
  // everything worked: only now replace the previous document
  freeCv(UPL.src);try{UPL.pdf&&UPL.pdf.destroy()}catch(e){}
  Object.assign(UPL,{rects:{},crops:{},rectSeq:0,name:file.name,zoom:1,page:1,n:1,pdf:N.pdf||null,src:N.src,kind:N.kind,pages:N.pages,auto:null,returnToSummary:false,hasSummaryDraft:false});
  jobEnd(J);uplBusy(false);uplDoc();uplWarmLater();
 }catch(e){jobEnd(J);if(e===CANCELLED)return;uplBusy(false);try{task&&task.destroy()}catch(x){}alert('Could not open the file: '+(e&&e.message||e))}
}
// draw one PDF page into a canvas, no wider than o.w and no bigger than o.maxPx pixels
async function uplPageCanvas(n,o){
 o=o||{};const pdf=o.pdf||UPL.pdf,J=o.J;
 const pg=await W(J,pdf.getPage(n)),v1=pg.getViewport({scale:1});
 let sc=Math.min(4,Math.max(1,(o.w||LIM.dispW)/v1.width));const mp=o.maxPx||LIM.dispPx;
 if(v1.width*v1.height*sc*sc>mp)sc=Math.sqrt(mp/(v1.width*v1.height));
 const vp=pg.getViewport({scale:sc}),c=document.createElement('canvas');c.width=Math.round(vp.width);c.height=Math.round(vp.height);
 const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
 const rt=pg.render({canvasContext:g,viewport:vp});if(J)jobOn(J,()=>{try{rt.cancel()}catch(e){}});
 // pdf.js gives no progress for one page, so the bar creeps toward the end while it draws
 let fin=false,q=0;const iv=o.onp?setInterval(()=>{if(fin)return;q+=(0.9-q)*.12;o.onp(q)},120):0;
 try{await W(J,rt.promise)}finally{fin=true;clearInterval(iv);try{pg.cleanup()}catch(e){}}
 c._sc=sc;if(o.onp)o.onp(1);return c}

// ---------- rectangles ----------
function uplRects(){
 const w=uq('#upw');w.querySelectorAll('.ur').forEach(x=>x.remove());
 for(const [id,r] of Object.entries(UPL.rects)){const n=r.role,c=UCOL[n]||'#8a7a62';if(!r)continue;
  const d=document.createElement('div');d.className='ur';d.dataset.id=id;d.dataset.role=n;d.style.cssText=`border-color:${c};background:${c}26;color:${c}`;
  const same=Object.values(UPL.rects).filter(x=>x.role===n),ord=same.indexOf(r)+1;
  d.innerHTML=`<div class="ul" style="background:${c}">${roleLabel(n)}${same.length>1?' #'+ord:''}<i data-x>✕</i></div>`+['nw','n','ne','e','se','s','sw','w'].map(h=>`<div class="uhd" data-h="${h}" style="${uHandle(h)}"></div>`).join('');
  uPlace(d,r);w.appendChild(d);uBind(d,r)}
 uplChips();
}
function uHandle(h){const p={n:'left:calc(50% - 11px);top:-11px;cursor:ns-resize',s:'left:calc(50% - 11px);bottom:-11px;cursor:ns-resize',e:'right:-11px;top:calc(50% - 11px);cursor:ew-resize',w:'left:-11px;top:calc(50% - 11px);cursor:ew-resize',nw:'left:-11px;top:-11px;cursor:nwse-resize',se:'right:-11px;bottom:-11px;cursor:nwse-resize',ne:'right:-11px;top:-11px;cursor:nesw-resize',sw:'left:-11px;bottom:-11px;cursor:nesw-resize'};return p[h]}
function uPlace(d,r){d.style.left=r.x*100+'%';d.style.top=r.y*100+'%';d.style.width=r.w*100+'%';d.style.height=r.h*100+'%'}
function uBind(d,r){
 const MIN=.02;let raf=0;
 d.onpointerdown=e=>{
  if(e.target.closest('[data-x]')){delete UPL.rects[d.dataset.id];delete UPL.crops[d.dataset.id];uplRects();uplRdBtn();return}
  e.preventDefault();e.stopPropagation();
  const h=e.target.closest('[data-h]'),mode=h?h.dataset.h:'m',W=uq('#upw').getBoundingClientRect(),o={...r},sx=e.clientX,sy=e.clientY;
  d.setPointerCapture(e.pointerId);
  d.onpointermove=ev=>{
   const dx=(ev.clientX-sx)/W.width,dy=(ev.clientY-sy)/W.height;let{x,y,w,h:hh}=o;
   if(mode==='m'){x=Math.min(1-w,Math.max(0,o.x+dx));y=Math.min(1-hh,Math.max(0,o.y+dy))}
   else{
    if(mode.includes('e'))w=Math.min(1-x,Math.max(MIN,o.w+dx));
    if(mode.includes('s'))hh=Math.min(1-y,Math.max(MIN,o.h+dy));
    if(mode.includes('w')){const nx=Math.min(o.x+o.w-MIN,Math.max(0,o.x+dx));w=o.x+o.w-nx;x=nx}
    if(mode.includes('n')){const ny=Math.min(o.y+o.h-MIN,Math.max(0,o.y+dy));hh=o.y+o.h-ny;y=ny}}
   Object.assign(r,{x,y,w,h:hh});if(!raf)raf=requestAnimationFrame(()=>{raf=0;uPlace(d,r)})}; // one layout per frame, not per touch event
  d.onpointerup=d.onpointercancel=()=>{d.onpointermove=null;if(raf){cancelAnimationFrame(raf);raf=0}uPlace(d,r);delete UPL.crops[d.dataset.id]};
 };
}
function uplRdBtn(){const b=uq('#urd');if(b)b.disabled=!Object.keys(UPL.rects).length}
// drag a labelled box from the top bar onto the page
function uplChips(){
 uq('#uch').querySelectorAll('.uchip').forEach(ch=>{
  ch.classList.toggle('used',Object.values(UPL.rects).some(r=>r.role===ch.dataset.n));
  ch.onpointerdown=e=>{
   e.preventDefault();const n=ch.dataset.n,c=UCOL[n],g=document.createElement('div');g.className='ugh';g.textContent=roleLabel(n);g.style.cssText+=`;background:${c}b0;border-color:${c}`;
   gid('up').appendChild(g);
   let gr=0;const mv=ev=>{if(gr)return;const X=ev.clientX,Y=ev.clientY;gr=requestAnimationFrame(()=>{gr=0;g.style.left=X-g.offsetWidth/2+'px';g.style.top=Y-g.offsetHeight/2+'px'})};mv(e);
   const sx=e.clientX,sy=e.clientY;let moved=false;
   ch.setPointerCapture(e.pointerId);
   ch.onpointermove=ev=>{if(Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>8)moved=true;mv(ev)};
   ch.onpointerup=ev=>{
    ch.onpointermove=ch.onpointerup=ch.onpointercancel=null;g.remove();
    const w=uq('#upw'),v=uq('#uvw');if(!w)return;const W=w.getBoundingClientRect(),V=v.getBoundingClientRect();
    let cx,cy;
    if(moved&&ev.clientX>=V.left&&ev.clientX<=V.right&&ev.clientY>=V.top&&ev.clientY<=V.bottom){cx=ev.clientX;cy=ev.clientY}
    else if(!moved){cx=V.left+V.width/2;cy=V.top+V.height/3}
    else return;
    const side=Math.min(90,W.width*.32,W.height*.18),bw=Math.min(.95,side/W.width),bh=Math.min(.95,side/W.height);
    let x=(cx-W.left)/W.width-bw/2,y=(cy-W.top)/W.height-bh/2;
    x=Math.min(1-bw,Math.max(0,x));y=Math.min(1-bh,Math.max(0,y));
    const id='box-'+(++UPL.rectSeq);UPL.rects[id]={id,role:n,x,y,w:bw,h:bh};delete UPL.crops[id];uplRects();uplRdBtn()};
   ch.onpointercancel=()=>{ch.onpointermove=ch.onpointerup=ch.onpointercancel=null;g.remove()};
  }});
}

// ---------- OCR ----------
// Median height of the text lines inside a region of the source, measured on a small copy (fast).
function lineHeight(S,sx,sy,sw,sh){
 const m=Math.min(1,500/sw,500/sh),w=Math.max(4,Math.round(sw*m)),h=Math.max(4,Math.round(sh*m));
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});
 g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(S,sx,sy,sw,sh,0,0,w,h);
 const a=g.getImageData(0,0,w,h).data,rows=new Int32Array(h);let lo=255,hi=0;
 for(let i=0;i<a.length;i+=4){const y=a[i]*.3+a[i+1]*.59+a[i+2]*.11;if(y<lo)lo=y;if(y>hi)hi=y}
 const th=lo+(hi-lo)*.55;if(hi-lo<30)return 0;
 for(let y=0;y<h;y++){let n=0;for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i]*.3+a[i+1]*.59+a[i+2]*.11<th)n++}rows[y]=n}
 const runs=[];let st=-1;const mn=Math.max(1,w*.004);
 for(let y=0;y<=h;y++){const ink=y<h&&rows[y]>=mn;if(ink&&st<0)st=y;else if(!ink&&st>=0){runs.push(y-st);st=-1}}
 const big=Math.max(0,...runs);const L=runs.filter(x=>x>=big*.45).sort((p,q)=>p-q);
 freeCv(c);return L.length?L[L.length>>1]/m:0}
// grey + contrast stretch (what the reader likes best)
function finishCrop(c){
 const g=c.getContext('2d',{willReadFrequently:true}),d=g.getImageData(0,0,c.width,c.height),a=d.data;let lo=255,hi=0;
 for(let i=0;i<a.length;i+=4){const y=(a[i]*.3+a[i+1]*.59+a[i+2]*.11)|0;a[i]=a[i+1]=a[i+2]=y;if(y<lo)lo=y;if(y>hi)hi=y}
 const sp=Math.max(40,hi-lo);for(let i=0;i<a.length;i+=4){const y=Math.max(0,Math.min(255,((a[i]-lo)/sp*255)|0));a[i]=a[i+1]=a[i+2]=y}
 g.putImageData(d,0,0);return c}
// how much to scale a region so its text lines are ~opt.line px tall (and stay under the pixel budget)
function cropScale(S,r,opt,kmax){
 const sx=Math.round(r.x*S.width),sy=Math.round(r.y*S.height),sw=Math.max(8,Math.round(r.w*S.width)),sh=Math.max(8,Math.round(r.h*S.height));
 let Lh=0;try{Lh=lineHeight(S,sx,sy,sw,sh)}catch(e){}
 let k=Lh>6?(opt.line||44)/Lh:(sh<120?2:1);
 k=Math.min(k,kmax,(opt.maxW||1800)/sw);k=Math.max(.3,k);
 const maxPx=opt.maxPx||LIM.cropPx;if(sw*sh*k*k>maxPx)k=Math.sqrt(maxPx/(sw*sh));
 return{sx,sy,sw,sh,k}}
// cut a region out of the source, scaled so text lines are ~44px, grey + contrast stretched
function cropRect(r,opt){
 opt=opt||{};const S=opt.src||UPL.src,{sx,sy,sw,sh,k}=cropScale(S,r,opt,3);
 const pad=12,c=document.createElement('canvas');c.width=Math.round(sw*k)+pad*2;c.height=Math.round(sh*k)+pad*2;
 const g=c.getContext('2d',{willReadFrequently:true});g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
 g.imageSmoothingQuality='high';g.drawImage(S,sx,sy,sw,sh,pad,pad,c.width-pad*2,c.height-pad*2);
 return finishCrop(c)}
// same, but for a PDF the region is drawn again straight from the page at the exact size needed:
// sharper text for the reader and no huge page-sized canvas in memory (important on phones)
async function cropPdf(r,opt,J){
 const S=UPL.src,{k}=cropScale(S,r,opt,4);
 const pg=await W(J,UPL.pdf.getPage(UPL.page)),vp=pg.getViewport({scale:S._sc*k});
 const pad=12,cw=Math.max(8,Math.round(r.w*vp.width)),ch=Math.max(8,Math.round(r.h*vp.height));
 const c=document.createElement('canvas');c.width=cw+pad*2;c.height=ch+pad*2;
 const g=c.getContext('2d',{willReadFrequently:true});g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
 const rt=pg.render({canvasContext:g,viewport:vp,transform:[1,0,0,1,pad-r.x*vp.width,pad-r.y*vp.height]});
 jobOn(J,()=>{try{rt.cancel()}catch(e){}});
 try{await W(J,rt.promise)}finally{try{pg.cleanup()}catch(e){}}
 return finishCrop(c)}
async function uplCrop(r,opt,J){
 if(UPL.kind==='pdf'&&UPL.pdf&&UPL.src&&UPL.src._sc){
  try{return await cropPdf(r,opt,J)}catch(e){if(e===CANCELLED||e===STOP||(J&&J.cancelled))throw e}}
 return cropRect(r,opt)}

// ---- the reader (Tesseract) ----
// One shared reader. It can always be stopped: we keep the browser Worker it creates so Cancel really
// ends the work (not just hides the screen). If it does not answer for a long time we restart it
// in "compatibility mode" (the plain, non-SIMD core), which some phones need.
// Keep the language model uncompressed and named .traineddata: Android's AAPT strips a final .gz
// suffix from packaged assets, which made Tesseract request a file that was not present in the APK.
let _wkp=null;
function killWorker(){
 try{UPL.langProbeCtrl&&UPL.langProbeCtrl.abort()}catch(e){}UPL.langProbeCtrl=null;
 try{UPL.abort&&UPL.abort()}catch(e){}
 const w=UPL.worker;UPL.worker=null;_wkp=null;UPL.lastInit=null;
 if(w)try{w.terminate()}catch(e){}}
function spawnWorker(T,D,languages){
 return new Promise((ok,no)=>{
  let spawned=null,done=false,patched=true,alive=false,last=Date.now(),iv=0,stage='';
  const Wk=window.Worker,unpatch=()=>{if(patched){patched=false;window.Worker=Wk}};
  window.Worker=function(u,o){const w=new Wk(u,o);
   if(!spawned&&(/(^|\/)worker\.min\.js/.test(String(u))||/^blob:/.test(String(u)))){spawned=w;unpatch(); // grab Tesseract's worker so it can be terminated
    w.addEventListener('error',e=>{D.err=(e&&(e.message||'error')+' '+(e.filename||'').split('/').pop()+':'+(e.lineno||''))});
    w.addEventListener('messageerror',()=>{D.err='messageerror'})}
   return w};
  window.Worker.prototype=Wk.prototype;
  const kill=()=>{try{spawned&&spawned.terminate()}catch(e){}};
  const abort=()=>{kill();fin(no,CANCELLED)};
  const fin=(f,v)=>{if(done)return;done=true;clearInterval(iv);unpatch();if(UPL.abort===abort)UPL.abort=null;f(v)};
  UPL.abort=abort;
  // a worker that has not said a single word after T.first ms never started (blocked / broken file); after that give it T.stall ms per stage
  iv=setInterval(()=>{const lim=alive?T.stall:T.first;if(Date.now()-last>lim){kill();D.alive=alive;D.stage=stage;D.after=Math.round((Date.now()-last)/1000);fin(no,new Error(alive?'stuck':'silent'))}},1000);
  let p;
  try{p=Tesseract.createWorker(languages||'eng+ell',1,{workerPath:'lib/worker.min.js',corePath:T.core,langPath:'lib/lang',gzip:false,cacheMethod:'none',workerBlobURL:!!T.blob,
   logger:m=>{last=Date.now();alive=true;if(m.status==='recognizing text'){if(UPL.prog)UPL.prog(m.progress)}else{stage=m.status;UPL.lastInit=m;if(UPL.initp)UPL.initp(m)}}})}
  catch(e){kill();D.err=String(e&&e.message||e);fin(no,e);return}
  p.then(async wk=>{
   if(done){try{wk.terminate()}catch(e){}return}
   try{await wk.setParameters({tessedit_do_invert:'0',user_defined_dpi:'300'})}catch(e){try{wk.terminate()}catch(x){}D.err=String(e&&e.message||e);fin(no,e);return}
   if(done){try{wk.terminate()}catch(e){}return}
   fin(ok,wk)},e=>{kill();D.err=String(e&&e.message||e);fin(no,e)})})}
// What does this phone actually receive for the reader's files? (sizes are compared with the real ones; a wrong size / HTML page means the file is blocked or replaced)
async function uplProbe(){
 const exp={'lib/worker.min.js':123724,'lib/tesseract-core-simd-lstm.wasm.js':3954569,'lib/tesseract-core-lstm.wasm.js':3938277,'lib/lang/eng.traineddata':5199098,'lib/lang/ell.traineddata':0};
 const one=async(u,n)=>{try{const r=await Promise.race([fetch(u),new Promise((_,no)=>setTimeout(()=>no(new Error('timeout 12s')),12000))]);const b=await r.arrayBuffer(),h=new Uint8Array(b.slice(0,1))[0];
   const sizeOK=n===0?b.byteLength>1000000:b.byteLength===n;return u.split('/').pop()+': '+r.status+' '+b.byteLength+(sizeOK?' ok':' (should be '+(n||'a Greek model > 1 MB')+(h===60?', looks like a web page':'')+')')}catch(e){return u.split('/').pop()+': '+(e&&e.message||e)}};
 const out=await Promise.all(Object.entries(exp).map(([u,n])=>one(u,n)));
 let simd=false;try{simd=WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]))}catch(e){}
 out.push('wasm:'+(typeof WebAssembly)+' simd:'+simd+' ram:'+(navigator.deviceMemory||'?')+'GB cores:'+(navigator.hardwareConcurrency||'?')+' sw:'+!!(navigator.serviceWorker&&navigator.serviceWorker.controller));
 out.push((navigator.userAgent.match(/Android [\d.]+|Chrome\/[\d.]+/g)||[]).join(' '));
 return out.join('\n')}
async function uplGreekModelAvailable(){
 // Check the exact local asset before asking Tesseract to load both languages. A missing Greek
 // file must never prevent the previously working English OCR from starting. This probe is abortable.
 const ctrl=new AbortController();UPL.langProbeCtrl=ctrl;
 const timer=setTimeout(()=>ctrl.abort(),8000);
 try{
  const r=await fetch('lib/lang/ell.traineddata',{cache:'no-store',signal:ctrl.signal});
  if(!r.ok)return false;
  const len=Number(r.headers.get('content-length')||0);
  if(len>1000000){try{if(r.body)await r.body.cancel()}catch(e){}return true}
  return (await r.arrayBuffer()).byteLength>1000000;
 }catch(e){if(UPL.job&&UPL.job.cancelled)throw CANCELLED;return false}
 finally{clearTimeout(timer);if(UPL.langProbeCtrl===ctrl)UPL.langProbeCtrl=null}
}
async function initWorker(){
 if(!window.Tesseract)await loadJS('lib/tesseract.min.js');
 // Only enable Greek when the local model actually exists. Older/stale APKs then keep working in English.
 const hasGreek=await uplGreekModelAvailable(),languages=hasGreek?'eng+ell':'eng';
 UPL.ocrLanguages=languages;UPL.greekModelMissing=!hasGreek;
 if(!hasGreek&&UPL.initp)UPL.initp({status:'greekmissing'});
 // 1) normal  2) if the worker never woke up: load it through a blob  3) plain (non-SIMD) core.  If it woke up but got stuck: go straight to the plain core.
 const T0={core:'lib',label:'normal'},T1={core:'lib',blob:true,label:'blob worker'},T2={core:'lib/tesseract-core-lstm.wasm.js',compat:true,label:'compatibility core'},T3={core:'lib/tesseract-core-lstm.wasm.js',compat:true,blob:true,label:'compatibility core + blob worker'};
 const rep=[];let q=[T0],tried=0;
 while(q.length){
  const T=q.shift();tried++;T.first=UPL.stall[0];T.stall=UPL.stall[1];
  UPL.lastInit=null;if(T.compat&&UPL.initp)UPL.initp({status:'compat'});
  const D={};
  try{const wk=await spawnWorker(T,D,languages);UPL.compat=!!T.compat;UPL.worker=wk;return wk}
  catch(e){if(e===CANCELLED)throw e;
   rep.push(`${tried}. ${T.label}: `+(e.message==='silent'?`worker never responded (${D.after}s)`:e.message==='stuck'?`stuck at "${D.stage}" for ${D.after}s`:String(e.message||e).slice(0,120))+(D.err?` [${D.err.slice(0,120)}]`:''));
   if(tried===1)q=e.message==='silent'?[T1,T2,T3]:[T2]}}
 let det='';try{det=await uplProbe()}catch(e){}
 const E=new Error('The reader could not start on this phone.\n\nDetails (please send a screenshot of this):\n'+rep.join('\n')+'\n'+det);E.final=true;throw E}
function uplWorker(){
 if(UPL.worker)return Promise.resolve(UPL.worker);
 if(!_wkp){const p=_wkp=initWorker();p.catch(()=>{if(_wkp===p)_wkp=null})}
 return _wkp}
// start loading the reader in the background once a file is on screen (after the page has been drawn, so the two never compete)
function uplWarmLater(){
 if(UPL.worker||_wkp||UPL.warmT)return;
 UPL.warmT=setTimeout(()=>{UPL.warmT=0;if(UPL.open&&!UPL.job&&!UPL.busy)uplWorker().catch(()=>{})},700)}
// wait for the reader, showing real progress. If it was already loading in the background we replay its current stage.
async function uplEnsure(J,INIT,label){
 if(UPL.worker)return UPL.worker;
 let lab=label;const ST=['loading tesseract core','initializing tesseract','loading language traineddata','initializing api'];
 const show=m=>{if(m.status==='compat'){lab=label.replace('…',' (compatibility mode)…');uplBusy(true,lab,null);return}
  if(m.status==='greekmissing'){lab=label.replace('reader','English reader (Greek model missing)');uplBusy(true,lab,null);return}
  const k=ST.indexOf(m.status);uplBusy(true,lab,k>=0?INIT*(k+(m.progress||0))/ST.length:null)};
 UPL.initp=show;if(UPL.lastInit)show(UPL.lastInit);
 jobOn(J,killWorker);
 try{return await W(J,uplWorker())}finally{UPL.initp=null}}

async function uplRead(){
 const boxes=Object.entries(UPL.rects).sort((a,b)=>a[1].y-b[1].y||a[1].x-b[1].x);if(!boxes.length)return;
 const J=jobStart();jobOn(J,killWorker);
 uplBusy(true,'Starting the reader…',0);await tick();
 const INIT=.12,N=boxes.length;
 try{
  const wk=await uplEnsure(J,INIT,'Starting the reader…');
  uplBusy(true,'Starting the reader…',INIT);const lines=[],res={};
  for(let i=0;i<N;i++){
   const [id,rect]=boxes[i],role=rect.role,at=(a,b,t)=>{UPL.prog=p=>uplBusy(true,`${t||'Reading '+roleLabel(role)}…`,INIT+(1-INIT)*(i+a+(b-a)*p)/N)};
   jobChk(J);UPL.prog=null;
   uplBusy(true,`Preparing ${roleLabel(role)}${i+1>1?' '+(i+1):''}…`,INIT+(1-INIT)*i/N);await tick();
   const c=await uplCrop(rect,{line:role==='Formula'?52:40},J);jobChk(J);UPL.crops[id]=c.toDataURL('image/jpeg',.85);
   uplBusy(true,`Reading ${roleLabel(role)}${i+1>1?' '+(i+1):''}…`,INIT+(1-INIT)*(i+.05)/N);
   await W(J,wk.setParameters({tessedit_pageseg_mode:role==='Name'?'7':'6',preserve_interword_spaces:'1'}));
   at(.05,role==='Formula'?.8:1);
   const rr=await W(J,wk.recognize(c,{},role==='Formula'?{text:true,blocks:true}:{text:true}));jobChk(J);
   const data=role==='Formula'?{...rr.data,_f:await uplFormula(wk,c,rr.data,at,J)}:rr.data;
   const text=(uplTexts({[role]:data})[role]||'').trim();res[id]=data;
   lines.push({role,text,page:UPL.page,crop:UPL.crops[id],_boxId:id,_y:rect.y,_x:rect.x});
   freeCv(c);uplBusy(true,null,INIT+(1-INIT)*(i+1)/N)
  }
  UPL.prog=null;uplBusy(true,'Done',1);await tick();jobChk(J);jobEnd(J);uplBusy(false);
  lines.sort((a,b)=>a._y-b._y||a._x-b._x).forEach(x=>{delete x._y;delete x._x});
  UPL.res=res;
  UPL.auto={lines,cat:(typeof DR!=='undefined'&&DR&&DR.cat)||Object.keys(CATS)[0],individual:false,source:'boxes',notice:UPL.greekModelMissing?'Greek OCR data was not found in this APK, so English OCR was used to keep reading working. Rebuild with the latest Build APK workflow to enable Greek recognition.':''};
  UPL.returnToSummary=false;uplSummary();
 }catch(e){jobEnd(J);if(e===CANCELLED)return;uplBusy(false);alert('Reading failed: '+(e&&e.message||e))}
}

// turn OCR output into app fields
function uplTexts(o){
 const r={};
 if(o.Name)r.Name=cleanLines(o.Name).join(' ').replace(/[:.\s]+$/,'');
 if(o.Formula)r.Formula=o.Formula._f!=null?o.Formula._f:ocrFormula(o.Formula);
 if(o.Legend)r.Legend=cleanLines(o.Legend).map(s=>s.replace(/^[\s•·*\-–—]+/,'').replace(/^(where|wher|whe)\s*[:,]?\s+/i,'').replace(/\s[=–—-]\s/,' = ').trim()).filter(Boolean).join('\n');
 if(o.Mnemonics)r.Mnemonics=cleanLines(o.Mnemonics).join(' ').replace(/^(mnemonics?|mnemonic)\s*[:\-–—]?\s*/i,'').trim();
 return r}
const cleanLines=d=>(d.text||'').split('\n').map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);

function lineStr(line){
 // rebuild a line, using the size/position of each letter to find exponents and subscripts
 const ws=(line.words||[]);
 const syms=ws.flatMap(w=>w.symbols||[]);
 if(!syms.length)return (line.text||'').trim();
 const hs=syms.filter(s=>/[A-Za-z0-9]/.test(s.text)).map(s=>s.bbox.y1-s.bbox.y0).sort((a,b)=>a-b);
 const H=hs.length?hs[Math.floor(hs.length*.75)]:0;
 const bs=syms.filter(s=>/[A-Za-z0-9]/.test(s.text)&&(s.bbox.y1-s.bbox.y0)>=H*.8).map(s=>s.bbox.y1).sort((a,b)=>a-b);
 const base=bs.length?bs[Math.floor(bs.length/2)]:0;
 let out='';
 for(const w of ws){
  let s='',mode='';const syms2=w.symbols||[];let buf='';
  const flush=()=>{if(!buf)return;if(mode==='sup')s+=[...buf].every(ch=>SUPR[ch])?[...buf].map(ch=>SUPR[ch]).join(''):'^('+buf+')';else if(mode==='sub')s+=[...buf].every(ch=>SUBR[ch])?[...buf].map(ch=>SUBR[ch]).join(''):'_('+buf+')';else s+=buf;buf=''};
  syms2.forEach((y,i)=>{
   const h=y.bbox.y1-y.bbox.y0;let m='';
   if(H&&i>0&&/[A-Za-z0-9+\-−]/.test(y.text)&&h<H*.8){
    if(y.bbox.y1<base-H*.3)m='sup';else if(y.bbox.y1>base+H*.12&&!/[gjpqy]/.test(y.text))m='sub'}
   if(m!==mode){flush();mode=m}
   buf+=y.text});
  flush();out+=(out?' ':'')+s}
 return out}

const OCR_FRACS={'½':'(1/2)','⅓':'(1/3)','⅔':'(2/3)','¼':'(1/4)','¾':'(3/4)','⅕':'(1/5)','⅖':'(2/5)','⅗':'(3/5)','⅘':'(4/5)','⅙':'(1/6)','⅚':'(5/6)','⅛':'(1/8)','⅜':'(3/8)','⅝':'(5/8)','⅞':'(7/8)','⅐':'(1/7)','⅑':'(1/9)','⅒':'(1/10)'};
function normF(s){
 s=[...String(s||'')].map(ch=>OCR_FRACS[ch]||ch).join('');
 s=s.replace(/[–—﹣]/g,'−').replace(/-/g,'−').replace(/⁄/g,'/').replace(/\bsqrt\b/gi,'√').replace(/\bpi\b/gi,'π').replace(/\btheta\b/gi,'θ').replace(/\balpha\b/gi,'α').replace(/\bbeta\b/gi,'β')
  .replace(/\bgamma\b/gi,'γ').replace(/\bdelta\b/gi,'δ').replace(/\bphi\b/gi,'φ').replace(/\bomega\b/gi,'ω')
  .replace(/[“”‘’]/g,'').replace(/\|/g,'').replace(/\s*=\s*/g,' = ').replace(/\s*\+\s*/g,' + ').replace(/\s*−\s*/g,' − ');
 // OCR reads a root sign as √, V, or v: wrap what follows. Preserve Greek variables too.
 s=s.replace(/(^|[\s=+−(])[Vv√]\s*(\([^)]*\)|[A-Za-z0-9Α-Ωα-ω²³]+)/g,(m,p,body)=>p+'√('+body.replace(/^\(|\)$/g,'')+')');
 return s.replace(/\s+/g,' ').replace(/^\s*−\s/,'−').trim()}
function ocrFormula(d){
 let lines=(d.lines&&d.lines.length)?d.lines.map(lineStr):((d.text||'').split('\n'));
 lines=lines.map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);
 // stacked fractions: a line made only of dashes between two lines
 const out=[];
 for(let i=0;i<lines.length;i++){
  const l=lines[i];
  if((/^[-–—_=~. ]{2,}$/.test(l)||/^[─━―]{1,}$/.test(l))&&out.length&&i+1<lines.length){const top=out.pop(),bot=lines[++i];out.push('(('+top+')/('+bot+'))')}
  else out.push(l)}
 return normF(out.join(' '))}

// Small raised / lowered marks (exponents, subscripts) are often dropped by OCR.
// Find them as separate ink blobs, read each one alone and slot it back in by position.
function inkComps(c){
 const w=c.width,h=c.height,a=c.getContext('2d').getImageData(0,0,w,h).data,m=new Uint8Array(w*h);
 for(let i=0;i<w*h;i++)m[i]=a[i*4]<140?1:0;
 const lab=new Int32Array(w*h),comps=[],st=[];
 for(let p=0;p<w*h;p++){
  if(!m[p]||lab[p])continue;
  const id=comps.length+1;let x0=w,y0=h,x1=0,y1=0,n=0;lab[p]=id;st.length=0;st.push(p);
  while(st.length){const q=st.pop(),x=q%w,y=(q/w)|0;n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const r=ny*w+nx;if(m[r]&&!lab[r]){lab[r]=id;st.push(r)}}}
  comps.push({x0,y0,x1:x1+1,y1:y1+1,n})}
 return comps.filter(k=>k.n>=12)}
function scriptGroups(comps){
 if(comps.length<3)return[];
 const med=a=>{a=a.slice().sort((x,y)=>x-y);return a[a.length>>1]};
 const hs=comps.map(k=>k.y1-k.y0).sort((a,b)=>a-b),H0=hs[Math.floor(hs.length*.85)];
 const big=comps.filter(k=>k.y1-k.y0>=.5*H0);if(big.length<2)return[];
 const base=med(big.map(k=>k.y1)),tops=big.map(k=>k.y0).sort((a,b)=>a-b),top=tops[Math.floor(tops.length*.2)],Hc=base-top;
 if(Hc<20)return[];
 const sc=comps.map(k=>{const h=k.y1-k.y0;let kind='';
  if(h<.75*Hc&&h>=.2*Hc){
   if(k.y1<base-.25*Hc&&k.y0<top+.25*Hc)kind='sup';
   else if(k.y1>base+.08*Hc&&k.y0>top+.45*Hc)kind='sub'}
  return{...k,kind}}).sort((a,b)=>a.x0-b.x0);
 const groups=[];
 for(const k of sc){if(!k.kind)continue;
  const g=groups[groups.length-1];
  if(g&&g.kind===k.kind&&k.x0-g.x1<.5*Hc){g.x1=Math.max(g.x1,k.x1);g.y0=Math.min(g.y0,k.y0);g.y1=Math.max(g.y1,k.y1);g.n++}
  else groups.push({kind:k.kind,x0:k.x0,x1:k.x1,y0:k.y0,y1:k.y1,n:1})}
 // absorb thin neighbours that belong to the same script (e.g. the minus in x⁻¹)
 for(const g of groups)for(const k of sc){if(k.kind)continue;const cy=(k.y0+k.y1)/2;
  if(cy>=g.y0&&cy<=g.y1&&(k.y1-k.y0)<.5*Hc&&((k.x1<=g.x0&&g.x0-k.x1<.35*Hc)||(k.x0>=g.x1&&k.x0-g.x1<.35*Hc))){g.x0=Math.min(g.x0,k.x0);g.x1=Math.max(g.x1,k.x1);g.y0=Math.min(g.y0,k.y0);g.y1=Math.max(g.y1,k.y1)}}
 return groups}
const scr=(t,mode)=>{const R=mode==='sup'?SUPR:SUBR;return [...t].every(ch=>R[ch])?[...t].map(ch=>R[ch]).join(''):(mode==='sup'?'^(':'_(')+t+')'};
async function uplFormula(wk,c,d1,at,J){
 if((d1.lines||[]).length!==1)return ocrFormula(d1);
 const syms=d1.symbols||[];
 let items=syms.filter(s=>s.text.trim()).map(s=>({x0:s.bbox.x0,x1:s.bbox.x1,t:s.text,mode:''}));
 if(at)UPL.prog=null;
 let groups=[];try{groups=scriptGroups(inkComps(c))}catch(e){}
 if(groups.length){
  await W(J,wk.setParameters({tessedit_char_whitelist:'0123456789+-nxyzabcdkmqrtαβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',tessedit_pageseg_mode:'7'}));
  let gi=0;for(const g of groups){
   jobChk(J);if(at)UPL.prog=null;uplBusy(true,'Reading Formula (powers & subscripts)…',null);
   const p=20,cc=document.createElement('canvas');cc.width=g.x1-g.x0+p*2;cc.height=g.y1-g.y0+p*2;const x=cc.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cc.width,cc.height);x.drawImage(c,g.x0,g.y0,g.x1-g.x0,g.y1-g.y0,p,p,g.x1-g.x0,g.y1-g.y0);
   g.t=((await W(J,wk.recognize(cc,{},{text:true}))).data.text||'').replace(/[^0-9a-z+\-\u0370-\u03FF]/gi,'').replace(/-/g,'−')}
  await W(J,wk.setParameters({tessedit_char_whitelist:'',tessedit_pageseg_mode:'6'}));
  const ok=groups.filter(g=>g.t);
  items=items.filter(it=>{const mx=(it.x0+it.x1)/2;return !ok.some(g=>mx>g.x0&&mx<g.x1)});
  ok.forEach(g=>items.push({x0:g.x0,x1:g.x1,t:g.t,mode:g.kind}))}
 items.sort((a,b)=>a.x0-b.x0);
 let s='',mode='',buf='';const flush=()=>{if(buf)s+=mode?scr(buf,mode):buf;buf=''};
 for(const it of items){if(it.mode!==mode){flush();mode=it.mode}buf+=it.t}flush();
 return normF(s)}

// ---------- read EVERYTHING (no boxes) ----------
const ROLES=[['Name','#3b82c4'],['Formula','#d0583a'],['Legend','#3f9a5a'],['Mnemonics','#9a5fc4'],['Skip','#8a7a62']];
const RCOL=Object.fromEntries(ROLES);
const MATHCH=/[=+−×÷±√∫π∞²³⁴^_Α-Ωα-ω∑∏∂∆∇≠≤≥≈°′″½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d\s*\/\s*\d|[a-zA-ZΑ-Ωα-ω]\s*\/\s*[a-zA-ZΑ-Ωα-ω(]/;
function isLegendLine(t){ // "A = area", "r = radius of the circle"
 const m=t.match(/^[A-Za-zΑ-Ωα-ωͰ-Ͽ][A-Za-z0-9Α-Ωα-ω₀-₉'′]{0,3}(?:\s*,\s*[A-Za-zΑ-Ωα-ωͰ-Ͽ][A-Za-z0-9Α-Ωα-ω₀-₉]{0,3})*\s*(?:=|:|[−-])\s*(.+)$/);
 if(!m)return false;const rhs=m[1];
 return /[A-Za-z]{3,}/.test(rhs)&&!/[+−×÷±√∫^]/.test(rhs.replace(/[A-Za-z]{3,}.*/,''))&&(rhs.match(/[A-Za-z]{3,}/g)||[]).length>=1&&!/\d\s*[+−×÷]/.test(rhs)}
function classify(rows){
 const out=[];let prev='',prevPage=null;
 const nxt=i=>{for(let j=i+1;j<rows.length;j++){const u=(rows[j].text||'').replace(/\s+/g,' ').trim();if(u.length>=2&&/[A-Za-z0-9Α-Ωα-ω=√∫π∑∏]/.test(u))return u}return''};
 for(let ri=0;ri<rows.length;ri++){const r=rows[ri];
  let t=r.text.replace(/\s+/g,' ').trim();if(t.length<2||!/[A-Za-z0-9Α-Ωα-ω=+−×÷±√∫π∞∑∏∂∆∇½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/.test(t))continue;
  let role;
  if(/^\(?\s*mnemonics?\b/i.test(t)){role='Mnemonics';t=t.replace(/^\(?\s*mnemonics?\s*\)?\s*[:\-–—]?\s*/i,'')}
  else if(/^(where|wher|whe)\b\s*[:,]?/i.test(t)){role='Legend';t=t.replace(/^(where|wher|whe)\s*[:,]?\s*/i,'')}
  else if(prev==='Legend'&&isLegendLine(t))role='Legend';
  // a wrapped mnemonic continues on the next line, but a line that is followed by a formula (or starts a new page) is the next card's Name
  else if(prev==='Mnemonics'&&r.page===prevPage&&!MATHCH.test(t)&&!MATHCH.test(nxt(ri))&&!/:\s*$/.test(t)&&t.length>3){role='Mnemonics'}
  else if(MATHCH.test(t)&&!(isLegendLine(t)&&(prev==='Formula'||prev==='Legend'))){role='Formula'}
  else if(isLegendLine(t)&&(prev==='Formula'||prev==='Legend')){role='Legend'}
  else{role='Name';t=t.replace(/[:.\s]+$/,'')}
  if(role==='Legend')t=t.replace(/\s[=–—-]\s/,' = ');
  if(role==='Formula'&&r.line)t=normF(lineStr(r.line));
  out.push({role,text:t,page:r.page});prev=role;prevPage=r.page}
 return out}

// read `count` pages starting at page `start` (a photo is always just itself)
async function uplAuto(start,count){
 if(!UPL.src)return;
 const pages=UPL.kind==='pdf'?Array.from({length:count},(_,i)=>start+i).filter(p=>p>=1&&p<=UPL.pages):[1];
 if(!pages.length)return;
 const J=jobStart();jobOn(J,killWorker);J.canStop=pages.length>1;
 uplBusy(true,'Starting the reader…',0);await tick();
 const INIT=.1,N=pages.length,rows=[];
 try{
  const wk=await uplEnsure(J,INIT,'Starting the reader…');
  uplBusy(true,'Starting the reader…',INIT);
  await W(J,wk.setParameters({tessedit_pageseg_mode:'3',preserve_interword_spaces:'1',tessedit_char_whitelist:''}));
  for(let pi=0;pi<N;pi++){
   const pn=pages[pi],lab=N>1?`page ${pn} (${pi+1} of ${N})`:'the page',base=INIT+(1-INIT)*pi/N,span=(1-INIT)/N;
   jobChk(J);UPL.prog=null;
   uplBusy(true,`Preparing ${lab}…`,base);await tick();
   // draw the page only as big as the reader needs, one page at a time, and free it straight after
   const src=UPL.kind==='pdf'?await uplPageCanvas(pn,{w:LIM.ocrW,maxPx:LIM.ocrPx,J,onp:p=>uplBusy(true,`Preparing ${lab}…`,base+span*.15*p)}):UPL.src;
   jobChk(J);
   const c=cropRect({x:0,y:0,w:1,h:1},{src,line:40,maxPx:LIM.ocrPx,maxW:LIM.ocrW});
   if(src!==UPL.src)freeCv(src);
   UPL.prog=p=>uplBusy(true,`Reading ${lab}…`,base+span*(.15+.85*p));
   uplBusy(true,`Reading ${lab}…`,base+span*.15);
   const d=(await W(J,wk.recognize(c,{},{text:true,blocks:true}))).data;jobChk(J);
   freeCv(c);
   const L=(d.lines&&d.lines.length)?d.lines.map(l=>({text:l.text||'',line:l,page:pn})):(d.text||'').split('\n').map(t=>({text:t,page:pn}));
   rows.push(...L);J.done=pi+1;
   uplBusy(true,null,base+span);await tick()}
 }catch(e){
  // "Stop & use pages read so far" keeps what was already read; anything else ends the job
  if(!(e===STOP&&rows.length)){jobEnd(J);uplBusy(false);if(e!==CANCELLED&&e!==STOP)alert('Reading failed: '+(e&&e.message||e));return}}
 jobEnd(J);UPL.prog=null;uplBusy(true,'Sorting what was found…',1);await tick();
 try{
  const lines=classify(rows);
  uplBusy(false);
  if(!lines.length){alert('Nothing readable was found. Try the box method, or a clearer file.');return}
  UPL.auto={lines,cat:(typeof DR!=='undefined'&&DR&&DR.cat)||Object.keys(CATS)[0],notice:UPL.greekModelMissing?'Greek OCR data was not found in this APK, so English OCR was used to keep reading working. Rebuild with the latest Build APK workflow to enable Greek recognition.':''};
  UPL.returnToSummary=false;uplSummary();
 }catch(e){uplBusy(false);alert('Reading failed: '+(e&&e.message||e))}
}

// small pop-up menu used inside the uploader (the app's bottom sheet sits behind this screen)
function uplMenuClose(){const u=gid('up');if(!u)return;u.querySelectorAll('.urm,.urb').forEach(x=>x.remove())}
function uplMenu(anchor,opts,cb){
 uplMenuClose();const u=gid('up'),r=anchor.getBoundingClientRect();
 const bk=document.createElement('div');bk.className='urb';bk.onpointerdown=uplMenuClose;
 const m=document.createElement('div');m.className='urm';
 m.innerHTML=opts.map(([v,l,c],i)=>`<button data-i="${i}"${c?` style="color:${c}"`:''}>${esc(l)}</button>`).join('');
 u.appendChild(bk);u.appendChild(m);
 const W=innerWidth,H=innerHeight;m.style.left=Math.max(8,Math.min(W-m.offsetWidth-8,r.left))+'px';
 m.style.top=(r.bottom+4+m.offsetHeight>H?Math.max(8,r.top-m.offsetHeight-4):r.bottom+4)+'px';
 m.onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;uplMenuClose();cb(opts[+b.dataset.i][0])}}

// Group lines into formula cards. The first line keeps the card's category and selection state
// across Summary redraws, so long-press selection and per-card categories remain stable.
function uplGroups(L){
 const groups=[];let cur=null;
 L.forEach((x,i)=>{
  if(x.role==='Name'||!cur){
   if(!x._cardId)x._cardId='upload-card-'+(++UPL.cardSeq);
   cur={items:[],start:i,id:x._cardId,head:x};groups.push(cur)
  }
  cur.items.push(i)
 });
 return groups
}
function uplHasFormula(g,A=UPL.auto){return g.items.some(i=>A.lines[i].role==='Formula'&&String(A.lines[i].text||'').trim())}
function uplGroupCat(g,A=UPL.auto){if(!CATS[g.head._cat])g.head._cat=A.cat;return g.head._cat}
function uplSummary(){
 UPL.view='sum';UPL.returnToSummary=false;UPL.hasSummaryDraft=true;uplMenuClose();const el=uplShell(),A=UPL.auto;
 const G=uplGroups(A.lines),foundG=G.filter(g=>uplHasFormula(g,A)),savedCount=G.filter(g=>g.head._saved&&uplHasFormula(g,A)).length,okG=foundG.filter(g=>!g.head._saved),selected=G.filter(g=>g.head._selected&&!g.head._saved&&uplHasFormula(g,A));
 const row=(i,saved=false)=>{const x=A.lines[i],c=RCOL[x.role]||'#8a7a62',crop=x.crop||'';
  return `<div class="srow${x.role==='Skip'?' skip':''}${saved?' savedrow':''}" data-i="${i}"><button class="rch" data-role${saved?' disabled':''} style="border-color:${c};color:${c};background:${c}1f">${roleLabel(x.role)}</button><div class="rcol">${crop?`<img class="scrop" src="${crop}" alt="${roleLabel(x.role)} crop preview">`:''}<textarea rows="1" data-t${saved?' disabled':''} autocapitalize="off" autocomplete="off" spellcheck="false">${esc(String(x.text||''))}</textarea>${x.role==='Formula'?'<div class="rpv"></div>':''}</div><button class="rx" data-del aria-label="Delete line"${saved?' disabled':''}>✕</button></div>`};
 const card=(g,k)=>{const has=uplHasFormula(g,A),isSelected=!!g.head._selected,saved=!!g.head._saved;
  const catPick=saved?`<span class="catbadge">Saved to: ${esc(A.individual?uplGroupCat(g,A):A.cat)}</span>`:A.individual?`<button class="catpick" data-cardcat="${k}">Save into: <b>${esc(uplGroupCat(g,A))}</b> ▾</button>`:`<span class="catbadge">${esc(A.cat)}</span>`;
  return `<div class="scd${has?'':' none'}${isSelected&&!saved?' selected':''}${saved?' saved':''}" data-card="${g.id}"><div class="scn"><span>#${k+1}${saved?' · saved ✓':isSelected?' · selected':''}${has?'':' · no formula line — will be skipped'}</span><div class="scops">${catPick}${saved?'':'<button data-delcard="'+k+'">Remove</button>'}</div></div>${g.items.map(i=>row(i,saved)).join('')}${saved?'':'<button class="addl" data-add="'+k+'">＋ line</button>'}<div class="scact"><button class="ub pri" data-savecard="${k}"${has&&!saved?'':' disabled'}>${saved?'Saved ✓':'Save'}</button></div></div>`};
 el.innerHTML=`<div class="uh"><button class="ub" id="s0">‹ Document</button><b>Summary</b><button class="ub" id="ssave"${selected.length?'':' hidden'}>Save selected only${selected.length?` (${selected.length})`:''}</button></div>
 <div class="sumtop"><button class="ub" id="scat"><span>Save into: <b>${esc(A.individual?'Individual Category':A.cat)}</b></span><i class="chev"></i></button></div>
 <div class="ubody">
  <div class="uhint" style="text-align:left;padding:0">${foundG.length} formula${foundG.length===1?'':'s'} found${savedCount?` · ${savedCount} saved ✓`:''}${okG.length?` · ${okG.length} remaining`:''}. Fix the name, formula, Where, and mnemonic here; the formula preview updates as you type. Long-press a box to select it, then use “Save selected only” at the top. ${A.source==='boxes'?'Each field keeps its crop preview from the PDF/photo.':''}</div>
  ${A.notice?`<div class="uhint${A.noticeKind?' '+A.noticeKind:''}" style="text-align:left;padding:${A.noticeKind?'10px 12px':'8px'};${A.noticeKind?'':'border:1px solid var(--tb);border-radius:10px'}">${esc(A.notice)}</div>`:''}
  ${shGuide()}
  ${G.map(card).join('')}
 </div>
 <div class="sumfoot"><button class="ub" id="s1" style="flex:1">Back</button><button class="ub pri" id="s2" style="flex:2"${okG.length?'':' disabled'}>${okG.length?(savedCount?'Save remaining formulas':'Save All'):savedCount===foundG.length&&foundG.length?'All formulas saved ✓':'Save All'}</button></div>`;
 const body=uq('.ubody'),rows=[...body.querySelectorAll('.srow')];
 const pv=r=>{const i=+r.dataset.i,x=A.lines[i],d=r.querySelector('.rpv');if(!d)return;
  try{d.innerHTML=x.text.trim()?fx(sh2f(x.text),''):'';fitFx(d)}catch(e){d.textContent=''}};
 rows.forEach(r=>{const t=r.querySelector('textarea');elastic(t);pv(r)});
 body.oninput=e=>{const t=e.target.closest('[data-t]');if(!t)return;const r=t.closest('.srow');A.lines[+r.dataset.i].text=t.value;pv(r)};
 body.onclick=e=>{
  const rb=e.target.closest('[data-role]');
  if(rb){const i=+rb.closest('.srow').dataset.i;uplMenu(rb,ROLES.map(([r,c])=>[r,roleLabel(r),c]),v=>{A.lines[i].role=v;const y=body.scrollTop;uplSummary();uq('.ubody').scrollTop=y});return}
  const cat=e.target.closest('[data-cardcat]');
  if(cat){const g=G[+cat.dataset.cardcat];uplMenu(cat,Object.keys(CATS).map(c=>[c,c]),v=>{g.head._cat=v;const y=body.scrollTop;uplSummary();uq('.ubody').scrollTop=y});return}
  const saveCard=e.target.closest('[data-savecard]');
  if(saveCard){uplSaveGroups([G[+saveCard.dataset.savecard]],{kind:'one'});return}
  const dl=e.target.closest('[data-del]');
  if(dl){const i=+dl.closest('.srow').dataset.i,g=G.find(g=>g.items.includes(i));if(g&&g.items[0]===i&&g.items.length>1){const next=A.lines[g.items[1]];next._cardId=g.head._cardId;next._cat=g.head._cat;next._selected=g.head._selected}A.lines.splice(i,1);const y=body.scrollTop;uplSummary();uq('.ubody').scrollTop=y;return}
  const dc=e.target.closest('[data-delcard]');
  if(dc){const g=G[+dc.dataset.delcard],set=new Set(g.items.map(i=>A.lines[i]));A.lines=A.lines.filter(x=>!set.has(x));if(!A.lines.length){uplDoc();return}const y=body.scrollTop;uplSummary();uq('.ubody').scrollTop=y;return}
  const ad=e.target.closest('[data-add]');
  if(ad){const g=G[+ad.dataset.add],at=g.items[g.items.length-1]+1;A.lines.splice(at,0,{role:'Legend',text:'',page:0});const y=body.scrollTop;uplSummary();uq('.ubody').scrollTop=y;
   const nt=uq(`.srow[data-i="${at}"] textarea`);if(nt)nt.focus();return}
 };
 // Long-press a card background or its source preview to select/deselect that formula.
 let hold=null,holdStart=null;
 const clearHold=()=>{if(hold)clearTimeout(hold);hold=null;holdStart=null};
 body.addEventListener('pointerdown',e=>{
  const cardEl=e.target.closest('.scd[data-card]');if(!cardEl||e.target.closest('button,textarea,input,select,summary,a'))return;const cardGroup=G.find(g=>g.id===cardEl.dataset.card);if(cardGroup&&cardGroup.head._saved)return;
  clearHold();holdStart={x:e.clientX,y:e.clientY,id:cardEl.dataset.card};
  hold=setTimeout(()=>{const id=holdStart&&holdStart.id,g=G.find(x=>x.id===id);if(!g)return;g.head._selected=!g.head._selected;const y=body.scrollTop;clearHold();uplSummary();uq('.ubody').scrollTop=y;if(navigator.vibrate)navigator.vibrate(15)},480);
 });
 body.addEventListener('pointermove',e=>{if(!holdStart)return;if(Math.hypot(e.clientX-holdStart.x,e.clientY-holdStart.y)>10)clearHold()});
 body.addEventListener('pointerup',clearHold);body.addEventListener('pointercancel',clearHold);
 const toDoc=()=>{UPL.returnToSummary=true;uplDoc()};uq('#s0').onclick=uq('#s1').onclick=toDoc;
 uq('#scat').onclick=e=>uplMenu(e.currentTarget,[...Object.keys(CATS).map(c=>[c,c]),['__individual__','Individual Category']],v=>{
  if(v==='__individual__'){A.individual=true;G.forEach(g=>{if(!CATS[g.head._cat])g.head._cat=A.cat})}
  else{A.cat=v;A.individual=false}
  const y=body.scrollTop;A.notice='';uplSummary();uq('.ubody').scrollTop=y
 });
 uq('#ssave').onclick=()=>{const chosen=G.filter(g=>g.head._selected&&uplHasFormula(g,A));uplSaveGroups(chosen,{kind:'selected'})};
 uq('#s2').onclick=()=>uplSaveAll(okG)
}
function uplCardData(g,A){
 const it=g.items.map(i=>A.lines[i]),pick=r=>it.filter(x=>x.role===r&&String(x.text||'').trim()).map(x=>String(x.text).trim());
 const formulaText=pick('Formula')[0]||'';let f='';try{f=canonF(formulaText)}catch(e){return null}if(!f)return null;
 const cat=A.individual?uplGroupCat(g,A):A.cat;if(!CATS[cat])return null;
 const nm=(pick('Name').join(' ').replace(/\s+/g,' ').trim()||('Formula '+(CATS[cat].length+1))).replace(/[:.\s]+$/,'');
 const w=pick('Legend').flatMap(t=>t.split(/[\n;]+/).map(s=>s.trim()).filter(Boolean)),m=oneLine(pick('Mnemonics').join(' '));
 return {cat,n:nm,f,w,m}
}
function uplSaveAll(okG){uplSaveGroups(okG,{kind:'all'})}
function uplSaveGroups(groups,opts){
 const A=UPL.auto;opts=opts||{};let added=0,dup=0,bad=0;const doneIds=new Set();
 for(const g of groups){
  if(g.head._saved)continue;
  const d=uplCardData(g,A);if(!d){bad++;continue}
  if(CATS[d.cat].some(x=>x.n===d.n&&x.f===d.f)){dup++;doneIds.add(g.id);g.head._saved=true;g.head._selected=false;continue}
  const u={id:newFormulaId(),updatedAt:Date.now(),c:d.cat,n:d.n,f:d.f,w:d.w,m:d.m,ld:false,ci:false};USER.push(u);CATS[d.cat].push(u);added++;doneIds.add(g.id);g.head._saved=true;g.head._selected=false
 }
 if(added)saveU();
 const out=[];if(added)out.push(`Saved ${added} formula${added===1?'':'s'} ✓`);if(dup)out.push(`${dup} already existed ✓`);if(bad)out.push(`${bad} formula${bad===1?'':'s'} need a check`);
 A.notice=out.join(' · ')||'No formulas were saved. Check the formula line and try again.';
 A.noticeKind=(added||dup)?'success':bad?'error':'';
 // Keep the entire Summary open. Saved cards are marked and locked so they cannot be accidentally duplicated.
 uplSummary();
 if(added&&typeof promptBackupFolderAfterSave==='function')void promptBackupFolderAfterSave((message,ok)=>{A.notice=(A.notice?A.notice+' · ':'')+message;A.noticeKind=ok?'success':'error';if(UPL.open&&UPL.view==='sum')uplSummary()})
}

// Legacy entry point: box-based OCR also uses the same card-based Summary editor.
function uplReview(){
 const lines=Object.entries(UPL.rects).map(([id,r])=>({role:r.role,text:(UPL.res&&UPL.res[id]&&uplTexts({[r.role]:UPL.res[id]})[r.role])||'',page:UPL.page,crop:UPL.crops[id]||'',_boxId:id,_y:r.y,_x:r.x})).sort((a,b)=>a._y-b._y||a._x-b._x);lines.forEach(x=>{delete x._y;delete x._x});
 UPL.auto={lines,cat:(typeof DR!=='undefined'&&DR&&DR.cat)||Object.keys(CATS)[0],individual:false,source:'boxes',notice:UPL.greekModelMissing?'Greek OCR data was not found in this APK, so English OCR was used to keep reading working. Rebuild with the latest Build APK workflow to enable Greek recognition.':''};UPL.returnToSummary=false;uplSummary()
}
window.UPL=UPL;window.uplOpen=uplOpen;window.uplBack=uplBack;
