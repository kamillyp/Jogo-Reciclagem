"use strict";
const CH={guardian:"guardian.png",verde:"verde.png",amarelo:"amarelo.png",rosy:"rosy.png"};
const BINS={
 azul:{label:"AZUL",f:"azul",de:"do papel",css:"var(--azul)",ex:["📰","📦","📄"]},
 vermelho:{label:"VERMELHA",f:"vermelha",de:"do plástico",css:"var(--vermelho)",ex:["🥤","🧴","🛍️"]},
 verde:{label:"VERDE",f:"verde",de:"do vidro",css:"var(--verde)",ex:["🍾","🫙"]},
 amarelo:{label:"AMARELA",f:"amarela",de:"do metal",css:"var(--amarelo)",ex:["🥫","🥄"]},
 marrom:{label:"MARROM",f:"marrom",de:"do lixo orgânico (restos de comida)",css:"var(--marrom)",ex:["🍌","🍎","🥬"]}
};
const MATERIAL={azul:"Papel",vermelho:"Plástico",verde:"Vidro",amarelo:"Metal",marrom:"Orgânico"};
const POOL=[
 ["📰","O jornal","azul"],["📦","A caixa de papelão","azul"],["📄","A folha de papel","azul"],
 ["🥤","O copo de plástico","vermelho"],["🧴","O frasco de shampoo","vermelho"],["🛍️","A sacola de plástico","vermelho"],
 ["🍾","A garrafa de vidro","verde"],["🫙","O pote de vidro","verde"],
 ["🥫","A lata de milho","amarelo"],["🥄","A colher de metal","amarelo"],
 ["🍌","A casca de banana","marrom"],["🍎","O resto de maçã","marrom"],["🥬","A folha de alface","marrom"]
].map(([e,n,b])=>({e,n,b}));
const TOTAL=10;const NAMES={guardian:"Play Guardian",verde:"Play Green",amarelo:"Play Amarelo",rosy:"Play Rosy"};const LOGO="logo.png";
const S={hero:"guardian",pts:0,streak:0,screen:"home",sound:true,q:[],i:0,score:0,tries:0,wrong:new Set(),fb:null,lock:false,pop:null};

const $app=document.getElementById("app");
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const binSvg=c=>`<svg viewBox="0 0 60 70" aria-hidden="true"><rect x="5" y="6" width="50" height="11" rx="5" fill="${c}"/><rect x="5" y="6" width="50" height="11" rx="5" fill="#000" opacity=".18"/><path d="M10 19h40l-4 46a4 4 0 0 1-4 3H18a4 4 0 0 1-4-3z" fill="${c}"/><text x="30" y="52" text-anchor="middle" font-size="26" fill="#fff">♻</text></svg>`;
const rnd=a=>a[Math.floor(Math.random()*a.length)];
let VOICE=null;
const pickVoice=()=>{const v=speechSynthesis.getVoices().filter(x=>/^pt/i.test(x.lang)&&!/antonio|ant[oô]nio|daniel|felipe|jorge|ricardo|male/i.test(x.name));
 for(const p of [/francisca|vit[oó]ria|luciana|fernanda|helena|raquel|maria/i,/google/i,/natural|online/i]){VOICE=v.find(x=>p.test(x.name)&&/BR/i.test(x.lang))||v.find(x=>p.test(x.name));if(VOICE)return}
 VOICE=v.find(x=>/BR/i.test(x.lang))||v[0]||null};
if("speechSynthesis" in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
const speak=(t,cb)=>{let c=0;const done=()=>{if(!c++&&cb)cb()};if(!S.sound||!("speechSynthesis" in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="pt-BR";if(VOICE)u.voice=VOICE;u.pitch=1.3;u.rate=.88;u.onend=u.onerror=done;speechSynthesis.speak(u)}catch(e){done()}};
let AC;const tone=(f,t=0,d=.15,ty="sine",v=.12)=>{if(!S.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),s=AC.currentTime+t;o.type=ty;o.frequency.value=f;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.001,s+d);o.start(s);o.stop(s+d)}catch(e){}};
const sfx={ok(){[660,880,1320].forEach((f,i)=>tone(f,i*.09,.2))},no(){tone(260,0,.18,"triangle");tone(200,.12,.22,"triangle")},win(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,i*.12,.25))}};
const go=s=>{S.screen=s;render()};

function topbar(mid=""){return `<div class="top"><img class="logo" src="${LOGO}" alt="It's Play">${mid}<div class="row" style="gap:8px"><button class="chip" data-act="home" aria-label="Início">🏠</button><button class="chip" data-act="sound" aria-label="Som">${S.sound?"🔊":"🔇"}</button></div></div>`}
function guide(who,msg,cls=""){return `<div class="guide ${cls}"><img src="${CH[S.hero]}" alt="${NAMES[S.hero]}"><div class="bubble ${cls}">${msg}</div></div>`}

const VIEWS={
 home(){return topbar()+`<div class="center" style="margin:auto;display:flex;flex-direction:column;gap:18px;align-items:center">
  <img src="${CH.guardian}" alt="Play Guardian" style="height:min(42vh,300px)">
  <h1>Vamos reciclar?</h1>
  <p style="margin:0;color:var(--soft)">Ajude os Play Bots a separar o lixo!</p>
  <div class="row"><button class="big" data-act="choose">▶ Começar</button><button class="big alt" data-act="play">Pular para o jogo</button></div></div>`},
 pick(){return topbar()+`<h2 class="center">Com quem você quer jogar?</h2><div class="cards h">${Object.entries(NAMES).map(([k,n])=>`<button class="card hero" data-act="hero" data-k="${k}"><img src="${CH[k]}" alt=""><div>${n}</div></button>`).join("")}</div>`},
 why(){return topbar()+guide("guardian","Reciclar é dar uma <b>nova vida</b> para as coisas! Assim cuidamos do nosso planeta. 🌎")+
  `<div class="cards">
   <div class="card"><div class="ico">🌳</div>Protege as árvores, os rios e os animais</div>
   <div class="card"><div class="ico">🔄</div>O que reciclamos vira coisa nova</div>
   <div class="card"><div class="ico">🗑️</div>Menos lixo na natureza e nas ruas</div></div>
  <div class="row"><button class="big" data-act="bins">Conhecer as lixeiras ➜</button></div>`},
 bins(){return topbar()+guide("verde","Cada <b>cor</b> de lixeira recebe um tipo de lixo. Toque para ouvir!")+
  `<div class="cards">${Object.entries(BINS).map(([k,b])=>`<button class="card binc" style="--c:${b.css}" data-act="say" data-k="${k}">${binSvg(b.css)}<div><span class="tag">${b.label}</span></div><div>${MATERIAL[k]}</div><div class="ex">${b.ex.join(" ")}</div></button>`).join("")}</div>
  <div class="row"><button class="big" data-act="play">Jogar! ▶</button></div>`},
 play(){const it=S.q[S.i],fb=S.fb;
  const dots=Array.from({length:TOTAL},(_,n)=>`<i class="${n<S.i||(S.lock&&n===S.i)?"on":""}"></i>`).join("");
  return topbar(`<div class="prog" aria-label="Progresso">${dots}</div><span class="chip" id="pts">⭐ ${S.pts} pts${S.streak>=3?" 🔥"+S.streak:""}</span>`)+
  guide(fb.who,fb.msg,fb.cls)+
  `<div class="item ${fb.cls===""?"in":fb.cls==="no"?"shake":""}"><span class="e">${it.e}</span>${it.n}</div>`+
  `<div class="bins">${Object.entries(BINS).map(([k,b])=>{
    const c=["bin",S.pop===k&&S.fb.cls==="ok"?"pop":"",S.pop===k&&S.fb.cls==="no"?"shake":"",S.wrong.has(k)?"off":"",S.tries>=2&&k===it.b&&!S.lock?"hint":""].join(" ");
    return `<button class="${c}" style="--c:${b.css}" data-act="pick" data-k="${k}" ${S.lock||S.wrong.has(k)?"disabled":""}>${binSvg(b.css)}${b.label}<small>${MATERIAL[k]}</small></button>`}).join("")}</div>`},
 end(){const n=S.score;return topbar()+`<div class="center" style="margin:auto;display:flex;flex-direction:column;gap:14px;align-items:center">
  <img src="${CH[S.hero]}" alt="" style="height:min(34vh,260px)"><h1>Parabéns! 🎉</h1>
  <div class="score">${S.pts} pontos</div><div style="font-size:2em" class="stars">${"⭐".repeat(Math.max(1,Math.round(n/2)))}</div><div class="chip">${S.newBest?"🏆 Novo recorde!":"Recorde: "+BEST+" pontos"}</div>
  <p style="margin:0;max-width:30ch">Você acertou ${n} de ${TOTAL} de primeira e ajudou o planeta! Reciclar é muito importante. 💚</p>
  <div class="row"><button class="big" data-act="play">Jogar de novo</button><button class="big alt" data-act="bins">Rever as lixeiras</button></div></div>`}
};

function render(){$app.innerHTML=VIEWS[S.screen]()}

function startPlay(){S.q=shuffle(POOL).slice(0,TOTAL);S.i=0;S.score=0;S.pts=0;S.streak=0;newItem();go("play")}
function newItem(){const it=S.q[S.i];S.tries=0;S.wrong=new Set();S.lock=false;S.pop=null;
  S.fb={who:"guardian",msg:"Arraste o lixo até a lixeira certa, ou toque nela!",cls:""};speak(`${it.n}. Em qual lixeira vai?`)}
function pick(k){const it=S.q[S.i];if(S.lock)return;S.pop=k;
  if(k===it.b){const b=BINS[k];S.lock=true;
    let gain=S.tries===0?10:S.tries===1?5:2;
    if(S.tries===0){S.score++;S.streak++;if(S.streak>=3)gain+=5}
    S.pts+=gain;
    const msg=`${rnd(["Muito bem!","Isso mesmo!","Arrasou!"])} ${MATERIAL[k]} vai na lixeira ${b.f}.`;
    S.fb={who:S.hero,cls:"ok",msg:msg.replace(/lixeira (\S+)\./,"lixeira <b>$1</b>.")};
    render();sfx.ok();celebrate(k);floatPts(k,gain);
    let fired=false,n=0;
    const step=()=>{if(fired||++n<2)return;fired=true;S.i++;
      if(S.i>=TOTAL){saveBest();go("end");sfx.win();[.2,.5,.8].forEach(p=>setTimeout(()=>confetti(innerWidth*p,innerHeight*.35,18),p*700));speak("Parabéns! Você ajudou o planeta!")}
      else{newItem();render()}};
    setTimeout(step,2200);
    if(S.sound&&"speechSynthesis" in window){speak(msg,step);setTimeout(step,7000)}else step();
    return}
  S.tries++;S.streak=0;S.wrong.add(k);
  const b=BINS[it.b];
  const msg=S.tries>=2?`Dica: ${it.n.toLowerCase()} é ${b.de}. Procure a lixeira <b>${b.f}</b>!`:rnd(["Quase! Tente outra lixeira.","Ops! Vamos tentar de novo?"]);
  S.fb={who:"amarelo",cls:"no",msg};render();sfx.no();speak(msg.replace(/<[^>]+>/g,""))}
function celebrate(k){const it=document.querySelector(".item .e"),bin=document.querySelector(`.bin[data-k="${k}"]`);if(!it||!bin)return;
  const a=it.getBoundingClientRect(),b=bin.getBoundingClientRect();
  it.animate([{transform:"none",opacity:1},{transform:`translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top-a.top-a.height/2}px) scale(.35)`,opacity:.2}],{duration:700,easing:"ease-in",fill:"forwards"});
  setTimeout(()=>confetti(b.left+b.width/2,b.top),650)}
function confetti(x,y,n=14){const em=["⭐","✨","💚","🌟","🎉"];for(let i=0;i<n;i++){const s=document.createElement("span");s.textContent=em[i%5];
  s.style.cssText=`position:fixed;left:${x}px;top:${y}px;font-size:22px;z-index:9;pointer-events:none`;document.body.appendChild(s);
  const g=Math.random()*6.28,d=60+Math.random()*90;
  s.animate([{transform:"translate(-50%,-50%)",opacity:1},{transform:`translate(${Math.cos(g)*d}px,${Math.sin(g)*d-40}px) rotate(${Math.random()*360}deg)`,opacity:0}],{duration:900+Math.random()*400,easing:"ease-out"}).onfinish=()=>s.remove()}}
function floatPts(k,g){const bin=document.querySelector(`.bin[data-k="${k}"]`);if(!bin)return;const r=bin.getBoundingClientRect(),s=document.createElement("span");
  s.className="fp";s.textContent="+"+g;s.style.left=r.left+r.width/2+"px";s.style.top=r.top-10+"px";document.body.appendChild(s);
  s.animate([{transform:"translate(-50%,0)",opacity:1},{transform:"translate(-50%,-90px)",opacity:0}],{duration:1400,easing:"ease-out"}).onfinish=()=>s.remove();
  const c=document.getElementById("pts");if(c)c.animate([{transform:"scale(1)"},{transform:"scale(1.35)"},{transform:"scale(1)"}],{duration:500})}
let BEST=0;try{BEST=+localStorage.getItem("rec_best")||0}catch(e){}
const saveBest=()=>{S.newBest=S.pts>BEST;if(S.newBest){BEST=S.pts;try{localStorage.setItem("rec_best",BEST)}catch(e){}}};
let drag=null;
$app.addEventListener("pointerdown",e=>{const el=e.target.closest(".item");if(!el||S.lock||S.screen!=="play")return;drag={el,x:e.clientX,y:e.clientY,moved:false};el.setPointerCapture(e.pointerId)});
$app.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>6)drag.moved=true;drag.el.style.transform=`translate(${dx}px,${dy}px) scale(1.1)`;drag.el.style.zIndex=5});
$app.addEventListener("pointerup",e=>{if(!drag)return;const d=drag;drag=null;d.el.style.visibility="hidden";const t=document.elementFromPoint(e.clientX,e.clientY);d.el.style.visibility="";
  const bin=t&&t.closest(".bin");if(bin&&d.moved&&!bin.disabled)pick(bin.dataset.k);else d.el.style.transform=""});
$app.addEventListener("pointercancel",()=>{if(drag){drag.el.style.transform="";drag=null}});
$app.addEventListener("click",e=>{
  const t=e.target.closest("[data-act]");if(!t)return;const a=t.dataset.act;
  if(a==="home")go("home");
  else if(a==="choose"){go("pick");speak("Escolha com quem você quer jogar!")}
  else if(a==="hero"){S.hero=t.dataset.k;go("why");speak(`Oi! Eu sou ${NAMES[S.hero]}! Vamos reciclar juntos?`)}
  else if(a==="why"){go("why");speak("Reciclar é dar uma nova vida para as coisas! Assim cuidamos do nosso planeta.")}
  else if(a==="bins"){go("bins");speak("Cada cor de lixeira recebe um tipo de lixo. Toque para ouvir!")}
  else if(a==="play")startPlay();
  else if(a==="sound"){S.sound=!S.sound;if(!S.sound&&"speechSynthesis" in window)speechSynthesis.cancel();render()}
  else if(a==="say"){const b=BINS[t.dataset.k];speak(`Lixeira ${b.f}: ${MATERIAL[t.dataset.k]}.`)}
  else if(a==="pick")pick(t.dataset.k);
});
const sc=document.getElementById("scene");
["♻️","🍃","🌱","♻️","🍃","🌿"].forEach((e,i)=>{const s=document.createElement("span");s.className="fl";s.textContent=e;s.style.cssText=`left:${8+i*16}%;animation-duration:${16+i*3}s;animation-delay:${-i*4}s`;sc.appendChild(s)});
["☁️","☁️"].forEach((e,i)=>{const s=document.createElement("span");s.className="cloud";s.textContent=e;s.style.cssText=`top:${8+i*14}%;animation-duration:${60+i*25}s;animation-delay:${-i*30}s`;sc.appendChild(s)});
render();
