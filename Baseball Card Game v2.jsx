import React, { useState, useEffect, useRef, Component, useMemo } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:20,background:'#fef2f2',border:'2px solid #ef4444',borderRadius:12,margin:20,maxWidth:600}}>
          <h2 style={{color:'#b91c1c',margin:'0 0 10px'}}>Something went wrong</h2>
          <pre style={{background:'#fff',padding:12,borderRadius:8,fontSize:12,overflow:'auto',whiteSpace:'pre-wrap',color:'#333'}}>{this.state.error?.message || 'Unknown error'}</pre>
          <pre style={{background:'#fff',padding:12,borderRadius:8,fontSize:10,overflow:'auto',whiteSpace:'pre-wrap',color:'#888',marginTop:8,maxHeight:200}}>{this.state.error?.stack || ''}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{marginTop:12,padding:'8px 20px',borderRadius:8,border:'1px solid #ef4444',background:'#fff',color:'#b91c1c',cursor:'pointer',fontWeight:700}}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===== CONSTANTS =====
const CARD_MAP = {
  'A♣':'walk','2♣':'groundOut','3♣':'ball','4♣':'foulBall','5♣':'flyOut',
  '6♣':'groundOut','7♣':'strikeout','8♣':'groundOut','9♣':'single','10♣':'strike',
  'J♣':'groundOut','Q♣':'foulOut','K♣':'ball',
  'A♦':'homeRun','2♦':'double','3♦':'flyOut','4♦':'ball','5♦':'strike',
  '6♦':'double','7♦':'strikeout','8♦':'single','9♦':'groundOut','10♦':'lineOut',
  'J♦':'ball','Q♦':'hbp','K♦':'doublePlay',
  'A♥':'lineOut','2♥':'flyOut','3♥':'single','4♥':'single','5♥':'single',
  '6♥':'flyOut','7♥':'strikeout','8♥':'flyOut','9♥':'single','10♥':'homeRun',
  'J♥':'flyOut','Q♥':'strike','K♥':'double',
  'A♠':'error','2♠':'foulOut','3♠':'triple','4♠':'groundOut','5♠':'groundOut',
  '6♠':'strike','7♠':'doublePlay','8♠':'ball','9♠':'foulBall','10♠':'flyOut',
  'J♠':'single','Q♠':'walk','K♠':'lineOut'
};
const SUITS = ['♣','♦','♥','♠'], VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const RED_SUITS = new Set(['♥','♦']);
const OI = {
  ball:{label:'Ball',color:'#2563eb',type:'count'},strike:{label:'Strike',color:'#dc2626',type:'count'},
  foulBall:{label:'Foul Ball',color:'#d97706',type:'count'},strikeout:{label:'Strikeout!',color:'#dc2626',type:'out'},
  walk:{label:'Walk',color:'#2563eb',type:'onbase'},hbp:{label:'Hit By Pitch!',color:'#7c3aed',type:'onbase'},
  single:{label:'Single!',color:'#16a34a',type:'hit'},double:{label:'Double!',color:'#16a34a',type:'hit'},
  triple:{label:'Triple!',color:'#16a34a',type:'hit'},homeRun:{label:'HOME RUN!',color:'#ea580c',type:'hit'},
  groundOut:{label:'Ground Out',color:'#6b7280',type:'out'},flyOut:{label:'Fly Out',color:'#6b7280',type:'out'},
  lineOut:{label:'Line Out',color:'#6b7280',type:'out'},foulOut:{label:'Foul Out',color:'#6b7280',type:'out'},
  doublePlay:{label:'Double Play!',color:'#991b1b',type:'out'},error:{label:'Error!',color:'#ea580c',type:'onbase'},
};
const PRESETS = {
  'New York Yankees':['Anthony Volpe','Juan Soto','Aaron Judge','Giancarlo Stanton','Jazz Chisholm Jr.','Austin Wells','Anthony Rizzo','Gleyber Torres','Alex Verdugo'],
  'Los Angeles Dodgers':['Mookie Betts','Shohei Ohtani','Freddie Freeman','Teoscar Hernández','Will Smith','Max Muncy','Tommy Edman','Andy Pages','James Outman'],
  'Atlanta Braves':['Ronald Acuña Jr.','Ozzie Albies','Austin Riley','Matt Olson','Marcell Ozuna','Sean Murphy','Michael Harris II','Orlando Arcia','Jarred Kelenic'],
  'Philadelphia Phillies':['Kyle Schwarber','Trea Turner','Bryce Harper','Nick Castellanos','Alec Bohm','J.T. Realmuto','Brandon Marsh','Johan Rojas','Bryson Stott'],
  'Houston Astros':['Jose Altuve','Alex Bregman','Yordan Alvarez','Kyle Tucker','Yainer Diaz','Jeremy Peña','Chas McCormick','Jake Meyers','Mauricio Dubón'],
  'Baltimore Orioles':['Gunnar Henderson','Adley Rutschman','Anthony Santander','Ryan Mountcastle','Colton Cowser','Jordan Westburg','Cedric Mullins','Ramón Urías','Jackson Holliday'],
};
const SLUGGERS = new Set(['Aaron Judge', 'Shohei Ohtani', 'Yordan Alvarez', 'Juan Soto', 'Marcell Ozuna', 'Kyle Schwarber', 'Bryce Harper', 'Giancarlo Stanton']);

// Field positions (viewBox 0 0 620 500)
const F = {
  HP:{x:310,y:430}, B1:{x:420,y:325}, B2:{x:310,y:225}, B3:{x:200,y:325}, MOUND:{x:310,y:340},
  C:{x:310,y:455}, UMP:{x:310,y:468}, P:{x:310,y:335},
  F1B:{x:420,y:310}, F2B:{x:360,y:248}, SS:{x:260,y:248}, F3B:{x:200,y:310},
  LF:{x:110,y:145}, CF:{x:310,y:75}, RF:{x:510,y:145},
  BAT:{x:290,y:425},
};
const FENCE = {cx:310, cy:430, rx:330, ry:370};

// ===== SOUND (Fix: Singleton Audio Context) =====
let sharedAudioCtx = null;
function playSound(type,vol=0.5){
  try{
    if(!sharedAudioCtx) sharedAudioCtx = new(window.AudioContext||window.webkitAudioContext)();
    if(sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
    const c = sharedAudioCtx;
    const n = c.currentTime;
    const v = Math.max(.05,Math.min(1,vol));
    
    if(type==='cardFlip'){const b=c.createBuffer(1,c.sampleRate*.06,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.008))*.3;const s=c.createBufferSource();const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=2000;s.buffer=b;s.connect(f);f.connect(c.destination);s.start(n)}
    else if(type==='hit'){const b=c.createBuffer(1,c.sampleRate*.2,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++){const t=i/c.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-t/.02)*.5+Math.sin(t*800)*Math.exp(-t/.05)*.3}const s=c.createBufferSource();const g=c.createGain();s.buffer=b;s.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.5,n);s.start(n)}
    else if(type==='homerun'){const b=c.createBuffer(1,c.sampleRate*.15,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.015))*.6;const s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(n);[523.25,659.25,783.99,1046.5].forEach((fr,i)=>{const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.value=fr;const t=n+.15+i*.12;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+.5);o.start(t);o.stop(t+.5)})}
    else if(type==='out'){const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(280,n);o.frequency.exponentialRampToValueAtTime(140,n+.25);g.gain.setValueAtTime(.1,n);g.gain.exponentialRampToValueAtTime(.001,n+.3);o.start(n);o.stop(n+.3)}
    else if(type==='walk'){[440,520].forEach((f,i)=>{const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=f;const t=n+i*.1;g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.start(t);o.stop(t+.15)})}
    else if(type==='strike'){const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.type='square';o.frequency.value=220;g.gain.setValueAtTime(.07,n);g.gain.exponentialRampToValueAtTime(.001,n+.12);o.start(n);o.stop(n+.12)}
    else if(type==='ball'){const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=350;g.gain.setValueAtTime(.05,n);g.gain.exponentialRampToValueAtTime(.001,n+.1);o.start(n);o.stop(n+.1)}
    else if(type==='crowd'){const dur=.4+v*1.2;const b=c.createBuffer(1,c.sampleRate*dur,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++){const e=Math.sin(Math.PI*i/d.length);d[i]=(Math.random()*2-1)*e*(.08+v*.25)}const s=c.createBufferSource();const f=c.createBiquadFilter();const g=c.createGain();f.type='bandpass';f.frequency.value=800+v*600;f.Q.value=.4;s.buffer=b;s.connect(f);f.connect(g);g.connect(c.destination);g.gain.setValueAtTime(v*.4,n);s.start(n)}
    else if(type==='gameOver'){[523.25,587.33,659.25,783.99,659.25,783.99,1046.5].forEach((fr,i)=>{const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.value=fr;const t=n+i*.15;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.15,t+.05);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.start(t);o.stop(t+.35)})}
    else if(type==='firework'){const b=c.createBuffer(1,c.sampleRate*.3,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++){const t=i/c.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-t/.08)*.2*Math.sin(t*150)}const s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(n+Math.random()*.3)}
  }catch(e){}
}

// ===== GAME LOGIC =====
function createDeck(){const c=[];for(const s of SUITS)for(const v of VALUES)c.push({value:v,suit:s,key:v+s});for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]]}return c}
function resolveWalkForce(b){let n=[...b],r=0;if(n[0]){if(n[1]){if(n[2])r++;n[2]=n[1]}n[1]=n[0]}n[0]='batter';return{bases:n,runs:r}}
function advanceRunners(bases,type){
  let nb=[null,null,null],runs=0;const rs=[];
  if(bases[2])rs.push({pos:3,name:bases[2]});
  if(bases[1])rs.push({pos:2,name:bases[1]});
  if(bases[0])rs.push({pos:1,name:bases[0]});
  
  if(type==='single'||type==='error'){for(const r of rs){if(r.pos+1>3)runs++;else nb[r.pos]=r.name}nb[0]='batter'}
  else if(type==='double'){for(const r of rs){if(r.pos+2>3)runs++;else nb[r.pos+1]=r.name}nb[1]='batter'}
  else if(type==='triple'){runs+=rs.length;nb[2]='batter'}
  else if(type==='homeRun'){runs+=rs.length+1}
  else if(type==='groundOut'){for(const r of rs){if(r.pos+1>3)runs++;else nb[r.pos]=r.name}}
  else if(type==='doublePlay'){
    if(bases[0]){
      nb=[null,bases[1]||null,bases[2]||null];
    }else{
      nb=[...bases];
    }
  }
  return{bases:nb,runs}
}
function getCrowdIntensity(inn,diff,runners,outs){let v=.2;if(inn>=7)v+=.15;if(inn>=9)v+=.15;if(Math.abs(diff)<=2)v+=.2;if(Math.abs(diff)<=1)v+=.15;if(runners>0)v+=.1;if(outs===2)v+=.1;return Math.min(1,v)}

const DIRS={lf:['to left field','to shallow left','down the left field line'],cf:['to center field','to deep center','up the middle'],rf:['to right field','to shallow right','down the right field line'],inf:['to the shortstop','to the second baseman','to the third baseman','to the first baseman']};
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function narrate(oc,bat,bases,rs,outs){
  const sc=rs>0?` ${rs} run${rs>1?'s':''} score!`:'';let dir='cf';const rd=pick(['lf','cf','rf']);
  switch(oc){
    case'single':dir=rd;return{text:`${bat} lines a single ${pick(DIRS[dir])}.${sc}`,dir};
    case'double':dir=rd;return{text:`${bat} drives a double ${pick(DIRS[dir])}!${sc}`,dir};
    case'triple':dir=pick(['lf','rf']);return{text:`${bat} smashes a triple ${pick(DIRS[dir])}!${sc}`,dir};
    case'homeRun':dir=rd;return{text:rs>1?`${bat} crushes a ${rs}-run HOMER ${pick(DIRS[dir])}!`:`${bat} launches a solo HOMER ${pick(DIRS[dir])}!`,dir};
    case'walk':return{text:`${bat} draws a walk.${sc}`,dir:'none'};
    case'hbp':return{text:`${bat} is hit by the pitch.${sc}`,dir:'none'};
    case'error':dir=pick(['lf','cf','rf','inf']);return{text:`Error! ${bat} reaches first.${sc}`,dir};
    case'groundOut':dir='inf';return{text:`${bat} grounds out to ${pick(DIRS.inf)}.${sc}`,dir};
    case'flyOut':dir=rd;return{text:`${bat} flies out ${pick(DIRS[dir])}.`,dir};
    case'lineOut':dir=pick(['lf','cf','rf','inf']);return{text:`${bat} lines out ${pick(DIRS[dir==='inf'?'inf':dir])}.`,dir};
    case'foulOut':return{text:`${bat} pops out in foul territory.`,dir:'foul'};
    case'strikeout':return{text:`${bat} strikes out${outs>=3?' to end the inning.':'.'}`,dir:'none'};
    case'doublePlay':return{text:bases[0]?`${bat} grounds into a double play!`:`${bat} grounds out.${sc}`,dir:'inf'};
    default:return{text:`${bat} — ${oc}`,dir:'cf'};
  }
}

// ===== BALL PATHS =====
function lerp(a,b,t){return a+(b-a)*t}
function arcPts(s,e,h,n=20){const p=[];for(let i=0;i<=n;i++){const t=i/n;p.push({x:lerp(s.x,e.x,t),y:lerp(s.y,e.y,t)-h*4*t*(1-t)})}return p}
function linePts(s,e,n=15){const p=[];for(let i=0;i<=n;i++){const t=i/n;p.push({x:lerp(s.x,e.x,t),y:lerp(s.y,e.y,t)})}return p}
function clampToFence(pt, margin=20){
  const fc=FENCE;
  const dx=(pt.x-fc.cx)/fc.rx, dy=(pt.y-fc.cy)/fc.ry;
  const dist=Math.sqrt(dx*dx+dy*dy);
  if(dist>1){
    const scale=(1-margin/Math.max(fc.rx,fc.ry))/dist;
    return{x:fc.cx+dx*fc.rx*scale, y:fc.cy+dy*fc.ry*scale};
  }
  return pt;
}

function getBallTgt(dir,oc){
  const j=()=>(Math.random()-.5)*20;
  const hp=F.HP;
  const infTgts=[{x:F.SS.x+j()*.4, y:F.SS.y+j()*.4},{x:F.F2B.x+j()*.4, y:F.F2B.y+j()*.4},{x:F.F3B.x+j()*.4, y:F.F3B.y+j()*.4},{x:F.F1B.x+j()*.4, y:F.F1B.y+j()*.4}];
  const shallowOF={lf:{x:lerp(F.F3B.x,F.LF.x,.55)+j(), y:lerp(F.F3B.y,F.LF.y,.55)+j()},cf:{x:lerp(F.SS.x+F.F2B.x,F.CF.x*2,.25)+j(), y:lerp(F.SS.y,F.CF.y,.45)+j()},rf:{x:lerp(F.F1B.x,F.RF.x,.55)+j(), y:lerp(F.F1B.y,F.RF.y,.55)+j()}};
  const deepOF={lf:{x:F.LF.x+j(), y:F.LF.y+j()*.5},cf:{x:F.CF.x+j(), y:F.CF.y+j()*.5+15},rf:{x:F.RF.x+j(), y:F.RF.y+j()*.5}};
  const wallArea={lf:{x:F.LF.x-25+j(), y:F.LF.y-25+j()*.3},cf:{x:F.CF.x+j(), y:F.CF.y-15+j()*.3},rf:{x:F.RF.x+25+j(), y:F.RF.y-25+j()*.3}};
  const foulTgts=[{x:hp.x-75+j()*.5, y:hp.y-40+j()*.5},{x:hp.x+75+j()*.5, y:hp.y-40+j()*.5},{x:hp.x-55+j()*.3, y:hp.y-70},{x:hp.x+55+j()*.3, y:hp.y-70}];

  let t;
  if(oc==='homeRun'){const hrDir=dir||pick(['lf','cf','rf']);const fence=wallArea[hrDir]||wallArea.cf;return {x:fence.x, y:fence.y-40}}
  if(oc==='triple') t=wallArea[dir]||wallArea[pick(['lf','rf'])];
  else if(oc==='double') t=deepOF[dir]||deepOF[pick(['lf','cf','rf'])];
  else if(oc==='single'||oc==='error') t=dir==='inf'?pick(infTgts):shallowOF[dir]||shallowOF[pick(['lf','cf','rf'])];
  else if(['groundOut','doublePlay'].includes(oc)) t=pick(infTgts);
  else if(['flyOut'].includes(oc)) t=dir==='inf'?pick(infTgts):(deepOF[dir]||deepOF[pick(['lf','cf','rf'])]);
  else if(oc==='lineOut') t=dir==='inf'?pick(infTgts):(shallowOF[dir]||shallowOF[pick(['lf','cf','rf'])]);
  else if(oc==='foulOut'||oc==='foulBall') t=pick(foulTgts);
  else t={x:hp.x, y:hp.y};

  return clampToFence(t, 25);
}

function genBallAnim(oc,dir){
  const s={x:F.HP.x,y:F.HP.y-10}, t=getBallTgt(dir,oc);
  if(['ball','strike','strikeout','walk','hbp'].includes(oc)) return{path:linePts(F.P,F.C,12),dur:650,type:'pitch'};
  if(oc==='foulBall') return{path:arcPts(s,t,50+Math.random()*30,20),dur:1250,type:'foul'};
  if(oc==='foulOut') return{path:arcPts(s,t,90,24),dur:1600,type:'fly'};
  if(oc==='homeRun') return{path:arcPts(s,t,120,32),dur:2600,type:'hr'};
  if(oc==='flyOut') return{path:arcPts(s,t,dir==='inf'?60:90,26),dur:1750,type:'fly'};
  if(oc==='lineOut') return{path:arcPts(s,t,dir==='inf'?8:18,18),dur:850,type:'line'};
  if(['groundOut','doublePlay'].includes(oc)) return{path:linePts(s,t,16),dur:900,type:'ground'};
  if(oc==='single'||oc==='error') return{path:arcPts(s,t,dir==='inf'?8:25,20),dur:1200,type:'hit'};
  if(oc==='double') return{path:arcPts(s,t,40,24),dur:1450,type:'hit'};
  if(oc==='triple') return{path:arcPts(s,t,50,26),dur:1550,type:'hit'};
  return{path:linePts(s,t,14),dur:1000,type:'generic'};
}
function doesSwing(oc){return['single','double','triple','homeRun','error','groundOut','flyOut','lineOut','foulOut','foulBall','doublePlay','strikeout'].includes(oc)}

// ===== FIREWORKS =====
function Fireworks({active}){const ref=useRef(null);useEffect(()=>{if(!active||!ref.current)return;const cv=ref.current,c=cv.getContext('2d');const W=cv.width=620,H=cv.height=500;const cols=['#eab308','#ef4444','#3b82f6','#22c55e','#f97316','#a855f7','#ec4899'];let ps=[],bu=0,run=true;function burst(x,y){for(let i=0;i<45;i++){const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*4;ps.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,life:1,decay:.012+Math.random()*.018,color:cols[Math.floor(Math.random()*cols.length)],size:1.5+Math.random()*2.5})}}const bi=setInterval(()=>{if(bu<6){burst(80+Math.random()*460,60+Math.random()*200);bu++}else clearInterval(bi)},250);function draw(){if(!run)return;c.clearRect(0,0,W,H);for(let i=ps.length-1;i>=0;i--){const p=ps[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.04;p.vx*=.99;p.life-=p.decay;if(p.life<=0){ps.splice(i,1);continue}c.beginPath();c.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);c.fillStyle=p.color;c.globalAlpha=p.life;c.fill();c.globalAlpha=1}if(ps.length>0||bu<6)requestAnimationFrame(draw)}draw();return()=>{run=false;clearInterval(bi)}},[active]);if(!active)return null;return <canvas ref={ref} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:50}}/>}

// ===== SVG PEOPLE =====
function SVGFielder({x,y,color='#1e40af',glove='right'}){
  const gx=glove==='left'?-7:7;
  return (<g transform={`translate(${x},${y})`}><ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)"/><line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round"/><line x1={0} y1={8} x2={-3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={8} x2={3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={2} x2={-gx} y2={5} stroke={color} strokeWidth={2} strokeLinecap="round"/><line x1={0} y1={2} x2={gx} y2={0} stroke={color} strokeWidth={2} strokeLinecap="round"/><circle cx={gx*1.1} cy={-1} r={3.5} fill="#8B4513" stroke="#5a3010" strokeWidth={.6}/><circle cx={0} cy={-5} r={5} fill="#f5d0a0"/><path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color}/><line x1={-5.5} y1={-6} x2={-8.5} y2={-6.5} stroke={color} strokeWidth={1.8} strokeLinecap="round"/></g>);
}
function SVGPitcher({x,y,color='#1e40af',phase='idle'}){
  const armAngle = phase==='windup'?-60:phase==='throw'?40:0;
  const bodyLean = phase==='throw'?3:phase==='windup'?-2:0;
  return (<g transform={`translate(${x},${y})`}><ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)"/><line x1={bodyLean} y1={0} x2={bodyLean} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round"/><line x1={bodyLean} y1={8} x2={bodyLean-3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={bodyLean} y1={8} x2={bodyLean+3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={bodyLean} y1={2} x2={bodyLean-7} y2={4} stroke={color} strokeWidth={2} strokeLinecap="round"/><circle cx={bodyLean-8} cy={4} r={3.5} fill="#8B4513" stroke="#5a3010" strokeWidth={.6}/><g transform={`rotate(${armAngle},${bodyLean},2)`}><line x1={bodyLean} y1={2} x2={bodyLean+8} y2={-4} stroke={color} strokeWidth={2} strokeLinecap="round"/>{phase!=='throw'&&<circle cx={bodyLean+9} cy={-5} r={2.5} fill="#fff" stroke="#c00" strokeWidth={.5}/>}</g><circle cx={bodyLean} cy={-5} r={5} fill="#f5d0a0"/><path d={`M${bodyLean-5.5},-6 Q${bodyLean},-13 ${bodyLean+5.5},-6`} fill={color}/><line x1={bodyLean-5.5} y1={-6} x2={bodyLean-8.5} y2={-6.5} stroke={color} strokeWidth={1.8} strokeLinecap="round"/></g>);
}
function SVGCatcher({x,y,color='#1e40af'}){
  return (<g transform={`translate(${x},${y})`}><ellipse cx={0} cy={8} rx={6} ry={2} fill="rgba(0,0,0,.1)"/><line x1={0} y1={-4} x2={0} y2={2} stroke={color} strokeWidth={3} strokeLinecap="round"/><line x1={0} y1={2} x2={-5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={-5} y1={0} x2={-5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={2} x2={5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={5} y1={0} x2={5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={-1} x2={8} y2={-3} stroke={color} strokeWidth={2} strokeLinecap="round"/><circle cx={9.5} cy={-3.5} r={4.5} fill="#8B4513" stroke="#5a3010" strokeWidth={.6}/><circle cx={0} cy={-9} r={5} fill="#f5d0a0"/><path d={`M-5,-10 Q0,-17 5,-10`} fill={color}/><rect x={-3.5} y={-8} width={7} height={5} rx={1} fill="none" stroke="#555" strokeWidth={.7} opacity={.5}/></g>);
}
function SVGUmpire({x,y}){
  return (<g transform={`translate(${x},${y})`}><ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.1)"/><line x1={0} y1={0} x2={0} y2={8} stroke="#222" strokeWidth={3} strokeLinecap="round"/><line x1={0} y1={8} x2={-3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={8} x2={3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={2} x2={-5} y2={6} stroke="#222" strokeWidth={2} strokeLinecap="round"/><line x1={0} y1={2} x2={5} y2={6} stroke="#222" strokeWidth={2} strokeLinecap="round"/><circle cx={0} cy={-5} r={5} fill="#f5d0a0"/><path d={`M-6,-6 Q0,-14 6,-6`} fill="#222"/><rect x={-3.5} y={-5} width={7} height={4} rx={1} fill="none" stroke="#555" strokeWidth={.6} opacity={.4}/></g>);
}
function SVGBatter({x,y,color='#dc2626',phase='stance'}){
  if(phase==='gone') return null;
  const swinging = phase==='swing';
  const batAngle = swinging ? 70 : -30;
  const bodyTwist = swinging ? 4 : 0;
  return (<g transform={`translate(${x},${y})`}><ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)"/><line x1={bodyTwist} y1={0} x2={bodyTwist} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round"/><line x1={bodyTwist} y1={8} x2={bodyTwist-3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={bodyTwist} y1={8} x2={bodyTwist+3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={bodyTwist} y1={2} x2={bodyTwist+6} y2={swinging?4:-2} stroke={color} strokeWidth={2} strokeLinecap="round"/><g transform={`rotate(${batAngle},${bodyTwist+6},${swinging?4:-2})`}><line x1={bodyTwist+6} y1={swinging?4:-2} x2={bodyTwist+6} y2={swinging?4-16:-2-16} stroke="#b8860b" strokeWidth={2.5} strokeLinecap="round"/></g><circle cx={bodyTwist} cy={-5} r={5} fill="#f5d0a0"/><path d={`M${bodyTwist-5},-6 Q${bodyTwist},-13 ${bodyTwist+5},-6`} fill={color}/><line x1={bodyTwist+5} y1={-6} x2={bodyTwist+8} y2={-6.5} stroke={color} strokeWidth={1.8} strokeLinecap="round"/></g>);
}
function RunnerOnBase({x,y,color}){
  return (<g transform={`translate(${x},${y-10})`}><ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)"/><line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.5} strokeLinecap="round"/><line x1={0} y1={8} x2={-3} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round"/><line x1={0} y1={8} x2={3} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round"/><line x1={0} y1={2} x2={-4} y2={5} stroke={color} strokeWidth={1.8} strokeLinecap="round"/><line x1={0} y1={2} x2={4} y2={5} stroke={color} strokeWidth={1.8} strokeLinecap="round"/><circle cx={0} cy={-4} r={4.5} fill="#f5d0a0"/><path d={`M-4.5,-5 Q0,-11 4.5,-5`} fill={color}/></g>);
}
function SVGRunner({x,y,color,t=0,facingRight=true}){
  const cycle=Math.sin(t*Math.PI*6);
  const legSpread=cycle*5, armSwing=cycle*4, flip=facingRight?1:-1;
  return (<g transform={`translate(${x},${y-12})`}><ellipse cx={0} cy={16} rx={6} ry={2.5} fill="rgba(0,0,0,.15)"/><line x1={flip*2} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.5} strokeLinecap="round"/><line x1={0} y1={8} x2={-legSpread*flip} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round"/><line x1={0} y1={8} x2={legSpread*flip} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round"/><line x1={flip*1.5} y1={2} x2={flip*1.5+armSwing*flip} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round"/><line x1={flip*1.5} y1={2} x2={flip*1.5-armSwing*flip} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round"/><circle cx={flip*2.5} cy={-4} r={4.5} fill="#f5d0a0"/><path d={`M${flip*2.5-4.5},-5 Q${flip*2.5},-11 ${flip*2.5+4.5},-5`} fill={color}/></g>);
}

// ===== THE FIELD =====
function BaseballField({bases, defColor, offColor, ballPos, pitchPhase, batterPhase, showFW, fwKey, movingRunners}){
  const hp=F.HP, fc=FENCE;
  const foulPole=(base)=>{
    const dx=base.x-hp.x, dy=base.y-hp.y;
    const a=(dx/fc.rx)**2+(dy/fc.ry)**2;
    const b=2*((hp.x-fc.cx)*dx/fc.rx**2+(hp.y-fc.cy)*dy/fc.ry**2);
    const c=((hp.x-fc.cx)/fc.rx)**2+((hp.y-fc.cy)/fc.ry)**2-1;
    const disc=b*b-4*a*c;
    const t=(-b+Math.sqrt(Math.max(0,disc)))/(2*a);
    return{x:hp.x+dx*t, y:hp.y+dy*t};
  };
  const fl=foulPole(F.B3), fr=foulPole(F.B1);
  const flx=fl.x, fly=fl.y, frx=fr.x, fry=fr.y;

  const dirtPath = `M ${hp.x-40} ${hp.y+5} L ${F.B3.x-22} ${F.B3.y+5} Q ${F.B3.x-15} ${F.B3.y-15} ${F.B3.x} ${F.B3.y-18} Q ${F.B2.x-30} ${F.B2.y-5} ${F.B2.x} ${F.B2.y-22} Q ${F.B2.x+30} ${F.B2.y-5} ${F.B1.x} ${F.B1.y-18} Q ${F.B1.x+15} ${F.B1.y-15} ${F.B1.x+22} ${F.B1.y+5} L ${hp.x+40} ${hp.y+5} Z`;

  const staticBackground = useMemo(() => (
    <>
      <defs>
        <radialGradient id="g1" cx="50%" cy="86%" r="55%"><stop offset="0%" stopColor="#4cb82a"/><stop offset="100%" stopColor="#358a1a"/></radialGradient>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6db8e8"/><stop offset="60%" stopColor="#a8d8f0"/><stop offset="100%" stopColor="#6ab840"/></linearGradient>
        <clipPath id="fc1"><path d={`M${hp.x} ${hp.y+12} L${flx-8} ${fly} A${fc.rx} ${fc.ry} 0 0 1 ${frx+8} ${fry} Z`}/></clipPath>
      </defs>
      <rect width="620" height="500" fill="url(#sky1)"/>
      <path d={`M${hp.x} ${hp.y+12} L${flx-4} ${fly+2} A${fc.rx} ${fc.ry} 0 0 1 ${frx+4} ${fry+2} Z`} fill="url(#g1)"/>
      <g clipPath="url(#fc1)" opacity=".05">
        {Array.from({length:22},(_,i)=><rect key={i} x={0} y={50+i*22} width={620} height={11} fill="#fff"/>)}
      </g>
      <path d={`M${flx} ${fly+4} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry+4} L${frx*.96+hp.x*.04} ${fry+16} A${fc.rx*.96} ${fc.ry*.96} 0 0 0 ${flx*.96+hp.x*.04} ${fly+16} Z`} fill="#b8943c" opacity=".3"/>
      <path d={`M${flx} ${fly} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry}`} fill="none" stroke="#1a6b10" strokeWidth={8}/>
      <path d={`M${flx} ${fly-3.5} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry-3.5}`} fill="none" stroke="#d4a800" strokeWidth={2} opacity=".8"/>
      <line x1={hp.x} y1={hp.y} x2={flx} y2={fly} stroke="#fff" strokeWidth={1.8} opacity=".5"/>
      <line x1={hp.x} y1={hp.y} x2={frx} y2={fry} stroke="#fff" strokeWidth={1.8} opacity=".5"/>
      <path d={dirtPath} fill="#c9a25c" opacity=".7"/>
      <ellipse cx={F.MOUND.x} cy={F.MOUND.y+2} rx={20} ry={14} fill="#bfa055" opacity=".5"/>
      <ellipse cx={F.MOUND.x} cy={F.MOUND.y} rx={18} ry={12} fill="#c9a860"/>
      <ellipse cx={F.MOUND.x} cy={F.MOUND.y-2} rx={14} ry={9} fill="#d4b56e" opacity=".6"/>
      <rect x={F.MOUND.x-5} y={F.MOUND.y-2} width={10} height={3} rx={1} fill="#fff" opacity=".7"/>
      <circle cx={310} cy={350} r={42} fill="#4ab82a" opacity=".5"/>
      <line x1={hp.x} y1={hp.y} x2={F.B1.x} y2={F.B1.y} stroke="rgba(255,255,255,.2)" strokeWidth={1.5}/>
      <line x1={F.B1.x} y1={F.B1.y} x2={F.B2.x} y2={F.B2.y} stroke="rgba(255,255,255,.2)" strokeWidth={1.5}/>
      <line x1={F.B2.x} y1={F.B2.y} x2={F.B3.x} y2={F.B3.y} stroke="rgba(255,255,255,.2)" strokeWidth={1.5}/>
      <line x1={F.B3.x} y1={F.B3.y} x2={hp.x} y2={hp.y} stroke="rgba(255,255,255,.2)" strokeWidth={1.5}/>
      <ellipse cx={hp.x} cy={hp.y+5} rx={28} ry={16} fill="#c9a25c" opacity=".5"/>
      <rect x={hp.x-22} y={hp.y-12} width={12} height={22} rx={1} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={.8}/>
      <rect x={hp.x+10} y={hp.y-12} width={12} height={22} rx={1} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={.8}/>
      <polygon points={`${hp.x},${hp.y+6} ${hp.x-7},${hp.y+1} ${hp.x-7},${hp.y-3} ${hp.x+7},${hp.y-3} ${hp.x+7},${hp.y+1}`} fill="#fff"/>
      {(()=>{
        const aL=Math.atan2(flx-fc.cx, fc.cy-fly);
        const aR=Math.atan2(frx-fc.cx, fc.cy-fry);
        const marks=[{label:'330',frac:0},{label:'370',frac:.25},{label:'400',frac:.5},{label:'370',frac:.75},{label:'330',frac:1}];
        return marks.map((m,i)=>{
          const a=aL+(aR-aL)*m.frac;
          const px=fc.cx+fc.rx*Math.sin(a), py=fc.cy-fc.ry*Math.cos(a);
          return <g key={i}>
            <rect x={px-12} y={py-7} width={24} height={13} rx={2} fill="#0d3d08" opacity=".9"/>
            <text x={px} y={py+.5} textAnchor="middle" dominantBaseline="middle" fill="#ffd700" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{m.label}</text>
          </g>;
        });
      })()}
    </>
  ), [hp.x, hp.y, flx, fly, frx, fry, fc.rx, fc.ry, fc.cx, fc.cy, dirtPath]);

  return(
    <div style={{position:'relative',width:'100%',maxWidth:750,margin:'0 auto'}}>
      <Fireworks active={showFW} key={`fw-${fwKey}`}/>
      <svg viewBox="0 0 620 500" style={{width:'100%',height:'auto',display:'block',borderRadius:14,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,.12)'}}>
        {staticBackground}

        {/* Dynamic Items */}
        {[{b:bases[0],...F.B1},{b:bases[1],...F.B2},{b:bases[2],...F.B3}].map((base,idx)=>(
          <g key={idx}>
            <rect x={base.x-7} y={base.y-7} width={14} height={14} fill={base.b&&!(movingRunners&&movingRunners.length>0)?offColor:'#fff'} stroke={base.b?offColor:'#ddd'} strokeWidth={1.5} transform={`rotate(45,${base.x},${base.y})`}/>
            {base.b && !(movingRunners&&movingRunners.length>0) && <RunnerOnBase x={base.x} y={base.y} color={offColor}/>}
          </g>
        ))}
        {movingRunners&&movingRunners.map((r,i)=><SVGRunner key={`mr${i}`} x={r.x} y={r.y} color={r.color} t={r.t} facingRight={r.facingRight}/>)}
        <SVGFielder x={F.LF.x} y={F.LF.y} color={defColor} glove="right"/>
        <SVGFielder x={F.CF.x} y={F.CF.y} color={defColor} glove="right"/>
        <SVGFielder x={F.RF.x} y={F.RF.y} color={defColor} glove="left"/>
        <SVGFielder x={F.F3B.x} y={F.F3B.y} color={defColor} glove="right"/>
        <SVGFielder x={F.SS.x} y={F.SS.y} color={defColor} glove="right"/>
        <SVGFielder x={F.F2B.x} y={F.F2B.y} color={defColor} glove="left"/>
        <SVGFielder x={F.F1B.x} y={F.F1B.y} color={defColor} glove="left"/>
        <SVGPitcher x={F.P.x} y={F.P.y-14} color={defColor} phase={pitchPhase}/>
        <SVGCatcher x={F.C.x} y={F.C.y-8} color={defColor}/>
        <SVGUmpire x={F.UMP.x+16} y={F.UMP.y-12}/>
        <SVGBatter x={F.BAT.x} y={F.BAT.y} color={offColor} phase={batterPhase}/>
        {ballPos&&<g><ellipse cx={ballPos.x} cy={ballPos.y+3} rx={3} ry={1.2} fill="rgba(0,0,0,.12)"/><circle cx={ballPos.x} cy={ballPos.y} r={3.5} fill="#fff" stroke="#c00" strokeWidth={.7}/></g>}
      </svg>
    </div>
  );
}

// ===== CARD MACHINE + DRAWN PILE =====
function MiniCard({card, style}){
  if(!card) return null;
  const red = RED_SUITS.has(card.suit);
  const c = red?'#c00':'#1a1a1a';
  return (
    <div style={{width:60,height:84,borderRadius:6,background:'#fffef5',border:`1.5px solid ${red?'#c0000030':'#00000015'}`,padding:'3px 5px',fontFamily:'Georgia,serif',boxShadow:'0 2px 6px rgba(0,0,0,.15)',display:'flex',flexDirection:'column',flexShrink:0,...style}}>
    <div style={{color:c,fontSize:12,fontWeight:'bold',lineHeight:1}}>{card.value}</div>
    <div style={{color:c,fontSize:14,lineHeight:1,marginTop:-1}}>{card.suit}</div>
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:20,color:c,opacity:.4}}>{card.suit}</span></div>
    </div>
  );
}

function CardArea({drawnPile, dispensedCard, dispensing, onDraw, canDraw, autoPlay, gameOver, shuffling, shuffleCards}){
  return(
    <div style={{display:'flex',alignItems:'flex-start',gap:16,justifyContent:'center',flexWrap:'wrap',padding:'0 8px',position:'relative'}}>
      {shuffling&&<div style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:20,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(232,228,216,.9)',borderRadius:10}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <div style={{fontSize:12,fontWeight:700,color:'#1a3a5c',background:'#fff',padding:'4px 14px',borderRadius:6,boxShadow:'0 2px 6px rgba(0,0,0,.12)'}}>🔀 Shuffling 52 Cards...</div>
          <div style={{position:'relative',width:180,height:80}}>
            {shuffleCards.slice(0,8).map((card,i)=><div key={`sl${i}`} style={{position:'absolute',left:10+i*1.5,top:i*0.5,animation:`shuffleRiffle .4s ease-in-out ${i*.05}s infinite alternate`,zIndex:i,opacity:.9}}><MiniCard card={card} style={{width:36,height:50,fontSize:7,padding:'1px 2px',boxShadow:'0 1px 4px rgba(0,0,0,.15)'}}/></div>)}
            {shuffleCards.slice(8,16).map((card,i)=><div key={`sr${i}`} style={{position:'absolute',right:10+i*1.5,top:i*0.5,animation:`shuffleRiffleR .4s ease-in-out ${i*.05}s infinite alternate`,zIndex:i,opacity:.9}}><MiniCard card={card} style={{width:36,height:50,fontSize:7,padding:'1px 2px',boxShadow:'0 1px 4px rgba(0,0,0,.15)'}}/></div>)}
          </div>
        </div>
      </div>}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
        <div style={{position:'relative',width:100,height:152,cursor:canDraw?'pointer':'default',userSelect:'none',transition:'transform .1s'}} onClick={canDraw?onDraw:undefined} onMouseDown={e=>{if(canDraw)e.currentTarget.style.transform='scale(.95)'}} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} role="button" tabIndex={0} onKeyDown={e=>{if(canDraw&&(e.key==='Enter'||e.key===' '))onDraw()}}>
          <div style={{width:100,height:152,borderRadius:'12px 12px 8px 8px',background:'linear-gradient(180deg,#5a5a5a 0%,#444 30%,#333 100%)',border:canDraw?'2px solid #5a5':'2px solid #666',boxShadow:canDraw?'0 4px 16px rgba(0,0,0,.3),0 0 12px rgba(80,180,80,.25)':'0 4px 12px rgba(0,0,0,.2)',position:'relative',overflow:'hidden',transition:'border-color .3s, box-shadow .3s'}}>
            <div style={{background:'#222',margin:'8px 12px 0',padding:'2px 6px',borderRadius:3,textAlign:'center'}}><span style={{color:'#c9a227',fontSize:10,fontWeight:700,letterSpacing:1.5,fontFamily:'system-ui'}}>CARD</span></div>
            <div style={{margin:'4px 10px',padding:'4px 6px',borderRadius:4,textAlign:'center',background:canDraw?'linear-gradient(135deg,#2d8c1f,#1a6b12)':'#555',transition:'background .3s'}}><span style={{color:'#fff',fontSize:9,fontWeight:800,letterSpacing:1,fontFamily:'system-ui',animation:canDraw&&!autoPlay?'drawPulse 1.5s ease-in-out infinite':'none'}}>{autoPlay?'⏸ AUTO':gameOver?'GAME OVER':'⚾ CLICK HERE'}</span></div>
            <div style={{background:'#222',margin:'0 12px',padding:'2px 6px',borderRadius:3,textAlign:'center'}}><span style={{color:'#c9a227',fontSize:10,fontWeight:700,letterSpacing:1.5,fontFamily:'system-ui'}}>DEALER</span></div>
            <div style={{width:74,height:4,background:'#111',borderRadius:2,margin:'6px auto 0',boxShadow:'inset 0 1px 3px rgba(0,0,0,.5)'}}/>
            <div style={{margin:'5px auto 0',width:52,height:30,background:'linear-gradient(135deg,#1e3a5f,#0f2440)',borderRadius:3,border:'1px solid #c9a227',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'#c9a227',fontSize:14}}>⚾</span></div>
          </div>
        </div>
        <div style={{height:90,position:'relative',width:100,overflow:'visible',zIndex:1}}>
          {dispensedCard && <div style={{position:'absolute',top:dispensing?4:-60,left:20,transition:dispensing?'top .35s cubic-bezier(.34,1.56,.64,1)':'none'}}><MiniCard card={dispensedCard}/></div>}
        </div>
      </div>
      <div style={{minWidth:90,minHeight:110,flexShrink:0}}>
        <div style={{fontSize:10,color:'#888',fontWeight:700,textTransform:'uppercase',letterSpacing:.8,marginBottom:4}}>This Half-Inning ({drawnPile.length})</div>
        <div style={{position:'relative',width:60,height:90}}>
          {drawnPile.length===0 && <div style={{color:'#ccc',fontSize:11,fontStyle:'italic',padding:'20px 0',width:100}}>Cards pile here</div>}
          {drawnPile.map((card,i)=>{
            const isTop=i===drawnPile.length-1, rot=i===0?0:((i*13+7)%11-5)*1.2, ox=i===0?0:((i*11+3)%9-4)*0.6, oy=Math.min(i*0.4,5);
            return <div key={`p${i}`} style={{position:'absolute',top:oy,left:ox,transform:`rotate(${rot}deg)`,zIndex:i,opacity:isTop?1:.85,transition:'transform .2s'}}><MiniCard card={card} style={{width:50,height:70,fontSize:9,padding:'2px 3px',boxShadow:isTop?'0 2px 8px rgba(0,0,0,.2)':'0 1px 3px rgba(0,0,0,.1)'}}/></div>;
          })}
        </div>
      </div>
    </div>
  );
}

// ===== MAIN GAME =====
const INIT_GS=()=>({inning:1,half:0,outs:0,bases:[null,null,null],count:{balls:0,strikes:0},batterIdx:[0,0],innings:[[0],[0]],hits:[0,0],errors:[0,0],gameOver:false,message:null});
const INIT_STATS=(teams)=>{const s=[{},{}];for(let t=0;t<2;t++)for(const p of teams[t].players)s[t][p]={ab:0,h:0,d:0,tr:0,hr:0,rbi:0,r:0,bb:0,so:0};return s};

function BaseballCardGameInner(){
  const [phase,setPhase]=useState('setup');
  const [teams,setTeams]=useState([{name:'New York Yankees',players:[...PRESETS['New York Yankees']]},{name:'Los Angeles Dodgers',players:[...PRESETS['Los Angeles Dodgers']]}]);
  const [renderTick,setRenderTick]=useState(0);
  const gs=useRef(INIT_GS());
  const [log,setLog]=useState([]);
  const [playHistory,setPlayHistory]=useState([]);
  const [halfStartIdx,setHalfStartIdx]=useState(0);
  const [replayIdx,setReplayIdx]=useState(-1);
  const [drawnPile,setDrawnPile]=useState([]);
  const [dispensedCard,setDispensedCard]=useState(null);
  const [dispensing,setDispensing]=useState(false);
  const [outcome,setOutcome]=useState(null);
  const [showFW,setShowFW]=useState(false);
  const [fwKey,setFwKey]=useState(0);
  const [shuffling,setShuffling]=useState(false);
  const [shuffleCards,setShuffleCards]=useState([]);
  const [soundOn,setSoundOn]=useState(true);
  const [autoPlay,setAutoPlay]=useState(false);
  const [autoSpeed,setAutoSpeed]=useState(4500);
  const [confirmReset,setConfirmReset]=useState(false);
  const [ballPos,setBallPos]=useState(null);
  const [pitchPhase,setPitchPhase]=useState('idle');
  const [batterPhase,setBatterPhase]=useState('stance');
  const [announceText,setAnnounceText]=useState('');
  const [showStats,setShowStats]=useState(false);
  const [movingRunners,setMovingRunners]=useState([]);
  const statsRef=useRef([{},{}]);
  const procRef=useRef(false);
  const sndRef=useRef(true);
  const autoRef=useRef(false);
  const spdRef=useRef(4500);
  const deckRef=useRef(createDeck());
  const deckIdxRef=useRef(0);
  const logRef=useRef(null);
  const animRef=useRef(null);
  const runnerAnimRef=useRef(null);

  useEffect(()=>{sndRef.current=soundOn},[soundOn]);
  useEffect(()=>{autoRef.current=autoPlay},[autoPlay]);
  useEffect(()=>{spdRef.current=autoSpeed},[autoSpeed]);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight},[log]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (runnerAnimRef.current) cancelAnimationFrame(runnerAnimRef.current);
    };
  }, []);

  useEffect(()=>{if(!autoPlay||phase!=='playing')return;const id=setInterval(()=>{if(!autoRef.current||procRef.current||gs.current.gameOver)return;doDrawCard()},autoSpeed);return()=>clearInterval(id)},[autoPlay,autoSpeed,phase]);

  const rerender=()=>setRenderTick(t=>t+1);
  const addLog=(text,type='play')=>setLog(p=>[...p,{text,type}]);
  const shuffleDeck=()=>{deckRef.current=createDeck();deckIdxRef.current=0};

  const animateBall=(path,dur,cb)=>{
    if(!path||path.length<2){console.warn('animateBall: invalid path');if(cb)cb();return;}
    const start=performance.now();
    function tick(now){
      const t=Math.min(1,(now-start)/dur);
      const idx=Math.min(Math.floor(t*(path.length-1)),path.length-2);
      const fr=(t*(path.length-1))-idx;
      const p0=path[idx],p1=path[Math.min(idx+1,path.length-1)];
      setBallPos({x:lerp(p0.x,p1.x,fr),y:lerp(p0.y,p1.y,fr)});
      if(t<1)animRef.current=requestAnimationFrame(tick);
      else{if(cb)cb()}
    }
    animRef.current=requestAnimationFrame(tick);
  };
  const clearBall=()=>{if(animRef.current)cancelAnimationFrame(animRef.current);setBallPos(null)};

  const computeRunnerPaths=(oldBases, outcome)=>{
    const paths=[]; const hp=F.HP, b1=F.B1, b2=F.B2, b3=F.B3;
    if(['single','error'].includes(outcome)){
      if(oldBases[2]) paths.push([b3,hp]);
      if(oldBases[1]) paths.push([b2,b3]);
      if(oldBases[0]) paths.push([b1,b2]);
      paths.push([hp,b1]);
    } else if(outcome==='double'){
      if(oldBases[2]) paths.push([b3,hp]);
      if(oldBases[1]) paths.push([b2,b3,hp]);
      if(oldBases[0]) paths.push([b1,b2,b3]);
      paths.push([hp,b1,b2]);
    } else if(outcome==='triple'){
      if(oldBases[2]) paths.push([b3,hp]);
      if(oldBases[1]) paths.push([b2,b3,hp]);
      if(oldBases[0]) paths.push([b1,b2,b3,hp]);
      paths.push([hp,b1,b2,b3]);
    } else if(outcome==='homeRun'){
      if(oldBases[2]) paths.push([b3,hp]);
      if(oldBases[1]) paths.push([b2,b3,hp]);
      if(oldBases[0]) paths.push([b1,b2,b3,hp]);
      paths.push([hp,b1,b2,b3,hp]);
    } else if(['walk','hbp'].includes(outcome)){
      if(oldBases[0]){
        if(oldBases[1]){ if(oldBases[2]) paths.push([b3,hp]); paths.push([b2,b3]); }
        paths.push([b1,b2]);
      }
      paths.push([hp,b1]);
    } else if(outcome==='groundOut'){
      if(oldBases[2]) paths.push([b3,hp]);
      if(oldBases[1]) paths.push([b2,b3]);
      if(oldBases[0]) paths.push([b1,b2]);
    } else if(outcome==='doublePlay'){
      if(oldBases[2]) paths.push([b3,hp]);
      if(oldBases[1]&&!oldBases[0]) paths.push([b2,b3]);
    }
    return paths;
  };

  const animateRunners=(paths, color, duration=600)=>{
    if(!paths||paths.length===0)return;
    if(runnerAnimRef.current)cancelAnimationFrame(runnerAnimRef.current);
    const start=performance.now();
    function tick(now){
      const t=Math.min(1,(now-start)/duration);
      const eased=t<0.5?2*t*t:(1-Math.pow(-2*t+2,2)/2);
      const positions=paths.map(wps=>{
        const totalSeg=wps.length-1;
        const progress=eased*totalSeg;
        const segIdx=Math.min(Math.floor(progress),totalSeg-1);
        const segT=progress-segIdx;
        const cx=lerp(wps[segIdx].x,wps[segIdx+1].x,segT);
        const cy=lerp(wps[segIdx].y,wps[segIdx+1].y,segT);
        const dx=wps[segIdx+1].x-wps[segIdx].x;
        return{x:cx,y:cy,color,t,facingRight:dx>=0};
      });
      setMovingRunners(positions);
      if(t<1)runnerAnimRef.current=requestAnimationFrame(tick);
      else setMovingRunners([]);
    }
    runnerAnimRef.current=requestAnimationFrame(tick);
  };

  const startGame=()=>{
    if(!teams[0].name||!teams[1].name||teams[0].players.some(p=>!p)||teams[1].players.some(p=>!p))return;
    gs.current=INIT_GS();statsRef.current=INIT_STATS(teams);
    setLog([{text:`⚾ Play Ball! ${teams[0].name} at ${teams[1].name}`,type:'info'}]);
    setPlayHistory([]);setReplayIdx(-1);setHalfStartIdx(0);setDrawnPile([]);setDispensedCard(null);setDispensing(false);setOutcome(null);
    setShowFW(false);setAutoPlay(false);setConfirmReset(false);
    clearBall();setPitchPhase('idle');setBatterPhase('stance');setAnnounceText('');
    shuffleDeck();setPhase('playing');rerender();
  };

  const doDrawCard=()=>{
    if(procRef.current||gs.current.gameOver)return;
    procRef.current=true; setReplayIdx(-1);

    if(deckIdxRef.current>=deckRef.current.length)shuffleDeck();
    const card=deckRef.current[deckIdxRef.current++];
    
    let oc=CARD_MAP[card.key];
    if(!oc){procRef.current=false;return;}
    
    const batterName = teams[gs.current.half].players[gs.current.batterIdx[gs.current.half]];
    if (oc === 'double' && SLUGGERS.has(batterName) && Math.random() < 0.3) {
      oc = 'homeRun';
    }

    const swings=doesSwing(oc);
    const isPitchOnly=['ball','strike','walk','hbp'].includes(oc);

    setDispensedCard(card);setDispensing(false);
    setTimeout(()=>setDispensing(true),30);
    if(sndRef.current)playSound('cardFlip');

    setPitchPhase('windup');setBatterPhase('stance');
    setTimeout(()=>{
      setPitchPhase('throw');
      animateBall(linePts(F.P,{x:F.HP.x,y:F.HP.y-5},16),650,()=>{});
    },550);

    setTimeout(()=>{
      if(swings){ setBatterPhase('swing'); if(sndRef.current&&!isPitchOnly)playSound('hit'); }
    },1200);

    setTimeout(()=>{
      setPitchPhase('idle'); setDrawnPile(prev=>[...prev,card]); setOutcome(oc);

      if(isPitchOnly||oc==='strikeout'){
        setBatterPhase('stance'); setTimeout(()=>animateBall(linePts(F.C,F.P,14),600,()=>clearBall()),500);
      } else if(oc==='foulBall'){
        const ba=genBallAnim(oc,'foul'); animateBall(ba.path,ba.dur,()=>{clearBall();setBatterPhase('stance');});
      } else if(oc==='foulOut'){
        setBatterPhase('swing'); const ba=genBallAnim(oc,'foul'); animateBall(ba.path,ba.dur,()=>{setTimeout(()=>clearBall(),400);setBatterPhase('stance');});
      } else if(['groundOut','doublePlay'].includes(oc)){
        setBatterPhase('swing'); const ba=genBallAnim(oc,'inf'); animateBall(ba.path,ba.dur,()=>{setTimeout(()=>clearBall(),300);setBatterPhase('stance');});
      } else if(['flyOut','lineOut'].includes(oc)){
        setBatterPhase('swing'); const nar=narrate(oc,batterName,gs.current.bases,0,gs.current.outs); const ba=genBallAnim(oc,nar.dir);
        animateBall(ba.path,ba.dur,()=>{setTimeout(()=>clearBall(),350);setBatterPhase('stance');});
      } else {
        setBatterPhase('gone'); const nar=narrate(oc,batterName,gs.current.bases,0,gs.current.outs); const ba=genBallAnim(oc,nar.dir);
        animateBall(ba.path,ba.dur,()=>clearBall());
      }
    },1400);

    const logicDelays = { ball:2300, strike:2300, walk:2300, hbp:2300, strikeout:2300, foulBall:2800, foulOut:3200, groundOut:2500, doublePlay:2500, lineOut:2400, flyOut:3300, single:2800, error:2800, double:3000, triple:3100, homeRun:4200 };
    setTimeout(()=>{
      try{ clearBall(); setPitchPhase('idle');
        const isHitType=['single','double','triple','homeRun','error','walk','hbp'].includes(oc);
        if(!isHitType)setBatterPhase('stance');
        processOutcome(oc,card);
      }catch(e){ procRef.current=false; setBatterPhase('stance'); rerender(); }
    }, logicDelays[oc] || 1500);
  };

  const processOutcome=(oc,card)=>{
    const g=gs.current;const bt=g.half; const batter=teams[bt].players[g.batterIdx[bt]];
    const stats=statsRef.current; const st=stats[bt]&&stats[bt][batter]?stats[bt][batter]:null;
    if(!st){stats[bt]=stats[bt]||{};stats[bt][batter]={ab:0,h:0,d:0,tr:0,hr:0,rbi:0,r:0,bb:0,so:0}}
    const S=stats[bt][batter];
    let newOuts=g.outs,newBases=[...g.bases],newCount={...g.count},runs=0,batDone=false,snd=null,isHR=false;
    const aR=g.innings[0].reduce((s,r)=>s+r,0),hR=g.innings[1].reduce((s,r)=>s+r,0);
    const diff=bt===0?aR-hR:hR-aR; const crowdI=getCrowdIntensity(g.inning,diff,g.bases.filter(Boolean).length,g.outs);
    let nar={text:'',dir:'none'};

    if(oc==='ball'){newCount.balls++;if(newCount.balls>=4){const r=resolveWalkForce(newBases);newBases=r.bases.map(b=>b==='batter'?batter:b);runs=r.runs;batDone=true;snd='walk';nar=narrate('walk',batter,g.bases,runs,newOuts);S.bb++;S.ab++}else{snd='ball';nar={text:`Ball ${newCount.balls}.`,dir:'none'}}}
    else if(oc==='strike'){newCount.strikes++;if(newCount.strikes>=3){newOuts++;batDone=true;snd='out';nar=narrate('strikeout',batter,g.bases,0,newOuts);S.so++;S.ab++}else{snd='strike';nar={text:`Strike ${newCount.strikes}!`,dir:'none'}}}
    else if(oc==='foulBall'){if(newCount.strikes<2){newCount.strikes++;nar={text:`Foul ball. Strike ${newCount.strikes}.`,dir:'foul'}}else nar={text:'Foul ball.',dir:'foul'};snd='strike'}
    else if(oc==='strikeout'){newOuts++;batDone=true;snd='out';nar=narrate('strikeout',batter,g.bases,0,newOuts);S.so++;S.ab++}
    else if(oc==='walk'||oc==='hbp'){const r=resolveWalkForce(newBases);newBases=r.bases.map(b=>b==='batter'?batter:b);runs=r.runs;batDone=true;snd='walk';nar=narrate(oc,batter,g.bases,runs,newOuts);S.bb++}
    else if(['single','double','triple','homeRun','error'].includes(oc)){const r=advanceRunners(newBases,oc);newBases=r.bases.map(b=>b==='batter'?batter:b);runs=r.runs;batDone=true;g.hits[bt]++;S.ab++;S.h++;S.rbi+=runs;if(oc==='double')S.d++;if(oc==='triple')S.tr++;if(oc==='homeRun'){S.hr++;isHR=true}if(oc==='error'){g.hits[bt]--;S.h--;g.errors[1-bt]++}snd=isHR?'homerun':'hit';nar=narrate(oc,batter,g.bases,runs,newOuts);if(runs>0)setTimeout(()=>{if(sndRef.current)playSound('crowd',crowdI)},400)}
    else if(oc==='groundOut'){const r=advanceRunners(newBases,'groundOut');newBases=r.bases;runs=r.runs;newOuts++;batDone=true;snd='out';nar=narrate('groundOut',batter,g.bases,runs,newOuts);S.ab++;if(runs>0)setTimeout(()=>{if(sndRef.current)playSound('crowd',crowdI*.5)},400)}
    else if(['flyOut','lineOut','foulOut'].includes(oc)){newOuts++;batDone=true;snd='out';nar=narrate(oc,batter,g.bases,0,newOuts);S.ab++}
    else if(oc==='doublePlay'){const hasR1=!!newBases[0];const r=advanceRunners(newBases,'doublePlay');newBases=r.bases;runs=r.runs;newOuts+=hasR1?2:1;batDone=true;snd='out';nar=narrate('doublePlay',batter,g.bases,runs,newOuts);S.ab++}

    if(runs>0){g.innings[bt][g.innings[bt].length-1]+=runs;
      for(let i=0;i<3;i++)if(g.bases[i]&&!newBases[i]&&(oc!=='doublePlay'||i!==0)){const runner=g.bases[i];const rs=stats[bt]&&stats[bt][runner];if(rs)rs.r++}
      if(oc==='homeRun')S.r++;
    }

    addLog(nar.text,isHR?'homer':OI[oc]?.type==='hit'?'hit':OI[oc]?.type==='out'?'out':'count');
    setAnnounceText(nar.text);
    if(sndRef.current&&snd)setTimeout(()=>playSound(snd),100);
    if(isHR){setShowFW(true);setFwKey(k=>k+1);if(sndRef.current){setTimeout(()=>playSound('crowd',Math.min(1,crowdI+.3)),600);setTimeout(()=>playSound('firework'),800);setTimeout(()=>playSound('firework'),1100)}setTimeout(()=>setShowFW(false),3000)}

    setPlayHistory(prev=>[...prev,{card,outcome:oc,narration:nar.text,dir:nar.dir,isHR,batter,preBases:[...g.bases],team:bt}]);

    const runColor=bt===0?'#b91c1c':'#1e40af';
    const rPaths=computeRunnerPaths(g.bases,oc);
    const runDur=oc==='homeRun'?2400:['walk','hbp'].includes(oc)?1300:1200;
    const batterRuns=rPaths.some(p=>p.length>0&&p[0].x===F.HP.x&&p[0].y===F.HP.y);
    if(rPaths.length>0){
      if(batterRuns) setBatterPhase('gone');
      animateRunners(rPaths,runColor,runDur);
      setTimeout(()=>setBatterPhase('stance'),runDur+50);
    } else { setBatterPhase('stance'); }

    g.bases=newBases;g.count=batDone?{balls:0,strikes:0}:newCount;g.outs=newOuts;
    if(batDone)g.batterIdx[bt]=(g.batterIdx[bt]+1)%9;
    rerender();

    const aRuns=g.innings[0].reduce((s,r)=>s+r,0),hRuns=g.innings[1].reduce((s,r)=>s+r,0);
    if(g.half===1&&g.inning>=9&&hRuns>aRuns&&batDone){endGame(teams[1].name,hRuns,aRuns,true);return}

    if(newOuts>=3){const dl=autoRef.current?Math.min(1500,spdRef.current*.5):2500;setTimeout(()=>transitionHalf(),dl)}
    else if(batDone){const dl=autoRef.current?Math.min(900,spdRef.current*.3):1500;setTimeout(()=>{setOutcome(null);shuffleDeck();procRef.current=false;rerender()},dl)}
    else{const dl=autoRef.current?Math.min(400,spdRef.current*.12):500;setTimeout(()=>{procRef.current=false;rerender()},dl)}
  };

  const transitionHalf=()=>{
    const g=gs.current;
    const aR=g.innings[0].reduce((s,r)=>s+r,0),hR=g.innings[1].reduce((s,r)=>s+r,0);
    if(g.half===0&&g.inning>=9&&hR>aR){endGame(teams[1].name,hR,aR,false);return}
    if(g.half===1&&g.inning>=9&&hR!==aR){const w=hR>aR?teams[1].name:teams[0].name;endGame(w,Math.max(hR,aR),Math.min(hR,aR),false);return}
    if(g.half===1){g.inning++;g.half=0;g.innings[0].push(0);g.innings[1].push(0);addLog(`── Top of Inning ${g.inning} ──`,'info')}
    else{g.half=1;addLog(`── Bottom of Inning ${g.inning} ──`,'info')}
    g.outs=0;g.bases=[null,null,null];g.count={balls:0,strikes:0};
    setDrawnPile([]);setDispensedCard(null);setDispensing(false);setOutcome(null);clearBall();
    setPitchPhase('idle');setBatterPhase('stance');setReplayIdx(-1);
    setHalfStartIdx(playHistory.length); 
    setAnnounceText(g.half===1?`Bottom of inning ${g.inning}`:`Top of inning ${g.inning}`);
    rerender();
    doShuffleAnimation(()=>{shuffleDeck();rerender();procRef.current=false;});
  };

  const doShuffleAnimation=(onComplete)=>{
    setShuffling(true); const sampleCards=[];
    for(let i=0;i<16;i++){const s=SUITS[Math.floor(Math.random()*4)], v=VALUES[Math.floor(Math.random()*13)]; sampleCards.push({value:v,suit:s,key:v+s});}
    setShuffleCards(sampleCards);
    if(sndRef.current)playSound('cardFlip');
    setTimeout(()=>{if(sndRef.current)playSound('cardFlip')},350);
    setTimeout(()=>{if(sndRef.current)playSound('cardFlip')},700);
    setTimeout(()=>{if(sndRef.current)playSound('cardFlip')},1050);
    setTimeout(()=>{setShuffling(false);setShuffleCards([]);if(onComplete)onComplete();},1600);
  };

  const endGame=(winner,ws,ls,walkoff)=>{
    gs.current.gameOver=true;gs.current.message=`${winner} win!${walkoff?' Walk-off!':''} Final: ${ws}-${ls}`;
    setAutoPlay(false);addLog(`🎉 ${walkoff?'WALK-OFF! ':''}${winner} win ${ws}-${ls}!`,'info');
    if(sndRef.current){setTimeout(()=>playSound('gameOver'),600);setTimeout(()=>playSound('crowd',1),300)}
    if(walkoff){setShowFW(true);setFwKey(k=>k+1);setTimeout(()=>setShowFW(false),3500)}
    setAnnounceText(`🎉 ${gs.current.message}`);rerender();procRef.current=false;
  };

  const replayPlay=(idx)=>{
    if(idx<0||idx>=playHistory.length||procRef.current)return;
    procRef.current=true; const play=playHistory[idx]; setReplayIdx(idx);
    const oc=play.outcome, swings=doesSwing(oc), isPitchOnly=['ball','strike','walk','hbp'].includes(oc), isHit=['single','double','triple','homeRun','error','walk','hbp'].includes(oc);

    setDispensedCard(play.card);setDispensing(false);
    setTimeout(()=>setDispensing(true),30); if(sndRef.current)playSound('cardFlip');
    setOutcome(null);setAnnounceText(''); setPitchPhase('windup');setBatterPhase('stance');

    setTimeout(()=>{ setPitchPhase('throw'); animateBall(linePts(F.P,{x:F.HP.x,y:F.HP.y-5},16),650,()=>{}) },550);
    setTimeout(()=>{ if(swings){ setBatterPhase('swing'); if(sndRef.current&&!isPitchOnly)playSound('hit'); } },1200);

    setTimeout(()=>{
      setPitchPhase('idle'); setOutcome(oc); setAnnounceText(play.narration);
      if(isPitchOnly||oc==='strikeout'){ setBatterPhase('stance'); setTimeout(()=>animateBall(linePts(F.C,F.P,14),600,()=>clearBall()),500); }
      else if(oc==='foulBall'){ const ba=genBallAnim(oc,'foul'); animateBall(ba.path,ba.dur,()=>{clearBall();setBatterPhase('stance');}); }
      else if(oc==='foulOut'){ setBatterPhase('swing'); const ba=genBallAnim(oc,'foul'); animateBall(ba.path,ba.dur,()=>{setTimeout(()=>clearBall(),400);setBatterPhase('stance');}); }
      else if(['groundOut','doublePlay'].includes(oc)){ setBatterPhase('swing'); const ba=genBallAnim(oc,'inf'); animateBall(ba.path,ba.dur,()=>{setTimeout(()=>clearBall(),300);setBatterPhase('stance');}); }
      else if(['flyOut','lineOut'].includes(oc)){ setBatterPhase('swing'); const ba=genBallAnim(oc,play.dir); animateBall(ba.path,ba.dur,()=>{setTimeout(()=>clearBall(),350);setBatterPhase('stance');}); }
      else { setBatterPhase('gone'); const ba=genBallAnim(oc,play.dir); animateBall(ba.path,ba.dur,()=>clearBall()); }
      if(sndRef.current){const snd=play.isHR?'homerun':['single','double','triple','error'].includes(oc)?'hit':['groundOut','flyOut','lineOut','foulOut','strikeout','doublePlay'].includes(oc)?'out':isPitchOnly?'ball':'walk';playSound(snd)}
      if(play.isHR){setShowFW(true);setFwKey(k=>k+1);if(sndRef.current){setTimeout(()=>playSound('crowd',.8),500);setTimeout(()=>playSound('firework'),700)}setTimeout(()=>setShowFW(false),2500)}
    },1400);

    const logicDelay= {ball:2300,strike:2300,walk:2300,hbp:2300,strikeout:2300,foulBall:2800,foulOut:3200,groundOut:2500,doublePlay:2500,lineOut:2400,flyOut:3300,single:2800,error:2800,double:3000,triple:3100,homeRun:4200}[oc]||2500;
    setTimeout(()=>{
      clearBall();setPitchPhase('idle');
      if(isHit){
        const bt=play.team!==undefined?play.team:gs.current.half, runColor=bt===0?'#b91c1c':'#1e40af', preBases=play.preBases||[null,null,null], rPaths=computeRunnerPaths(preBases,oc), runDur=oc==='homeRun'?2400:['walk','hbp'].includes(oc)?1300:1200;
        if(rPaths.length>0){ animateRunners(rPaths,runColor,runDur); setTimeout(()=>{setBatterPhase('stance');procRef.current=false},runDur+100); }
        else { setBatterPhase('stance');procRef.current=false; }
      } else { setBatterPhase('stance');procRef.current=false; }
    },logicDelay);
  };

  if(phase==='setup'){
    return(
      <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#e8e4d8 0%,#f5f3eb 30%,#fff 100%)',color:'#1a1a1a',fontFamily:'system-ui,-apple-system,sans-serif',padding:20,display:'flex',flexDirection:'column',alignItems:'center'}}>
        <h1 style={{fontSize:32,fontWeight:800,color:'#1a3a5c',marginBottom:2,letterSpacing:-.5}}>⚾ Card Baseball</h1>
        <p style={{color:'#666',fontSize:14,marginBottom:24}}>52-Card MLB Simulation</p>
        <div style={{display:'flex',gap:20,flexWrap:'wrap',justifyContent:'center',maxWidth:800}}>
          {[0,1].map(t=>(
            <div key={t} style={{background:'#fff',border:'1px solid #ddd',borderRadius:12,padding:18,width:350,boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <div style={{fontSize:14,color:'#1a3a5c',marginBottom:8,fontWeight:700}}>{t===0?'Away Team':'Home Team'}</div>
              <select value={Object.keys(PRESETS).includes(teams[t].name)?teams[t].name:'custom'} onChange={e=>{const n=e.target.value;const nt=[...teams];nt[t]=n==='custom'?{name:'',players:Array(9).fill('')}:{name:n,players:[...PRESETS[n]]};setTeams(nt)}} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',background:'#fafafa',fontSize:14,marginBottom:10,cursor:'pointer'}}><option value="">— Select —</option>{Object.keys(PRESETS).map(n=><option key={n} value={n}>{n}</option>)}<option value="custom">Custom Team...</option></select>
              {!Object.keys(PRESETS).includes(teams[t].name)&&<input placeholder="Team Name" value={teams[t].name} onChange={e=>{const nt=[...teams];nt[t]={...nt[t],name:e.target.value};setTeams(nt)}} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ccc',background:'#fafafa',fontSize:13,marginBottom:8,boxSizing:'border-box'}}/>}
              <div style={{fontSize:11,color:'#888',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>Batting Order</div>
              {teams[t].players.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}><span style={{fontSize:12,color:'#999',width:18,textAlign:'right',fontWeight:600}}>{i+1}.</span><input value={p} onChange={e=>{const nt=[...teams];nt[t].players[i]=e.target.value;setTeams(nt)}} placeholder={`Player ${i+1}`} style={{flex:1,padding:'5px 10px',borderRadius:6,border:'1px solid #ddd',fontSize:13,background:'#fafafa',boxSizing:'border-box'}}/></div>)}
            </div>
          ))}
        </div>
        <button onClick={startGame} disabled={!teams[0].name||!teams[1].name||teams[0].players.some(p=>!p)||teams[1].players.some(p=>!p)} style={{marginTop:24,padding:'14px 48px',borderRadius:10,border:'2px solid #1a5c2a',background:'linear-gradient(135deg,#2d8c1f,#1a6b12)',color:'#fff',fontSize:20,fontWeight:800,cursor:'pointer',letterSpacing:.5,opacity:(!teams[0].name||!teams[1].name||teams[0].players.some(p=>!p)||teams[1].players.some(p=>!p))?.4:1,boxShadow:'0 4px 12px rgba(26,92,18,.3)'}}>PLAY BALL!</button>
      </div>
    );
  }

  const g=gs.current,bt=g.half, batter=teams[bt].players[g.batterIdx[bt]];
  const aR=g.innings[0].reduce((s,r)=>s+r,0),hR=g.innings[1].reduce((s,r)=>s+r,0), maxInn=Math.max(g.innings[0].length,g.innings[1].length,9), innH=Array.from({length:maxInn},(_,i)=>i+1);
  const ba=(name,t)=>{const s=statsRef.current[t][name];if(!s||s.ab===0)return '.000';return(s.h/s.ab).toFixed(3).replace(/^0/,'')};
  const canDraw=!procRef.current&&!g.gameOver&&!autoPlay;

  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#e8e4d8 0%,#f0ede4 50%,#e8e4d8 100%)',color:'#1a1a1a',fontFamily:'system-ui,-apple-system,sans-serif',padding:'6px 8px'}}>
      <style>{`@keyframes drawPulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes shuffleRiffle{0%{transform:translateX(0) translateY(0)}50%{transform:translateX(30px) translateY(-12px) rotate(5deg)}100%{transform:translateX(0) translateY(0)}}@keyframes shuffleRiffleR{0%{transform:translateX(0) translateY(0)}50%{transform:translateX(-30px) translateY(-12px) rotate(-5deg)}100%{transform:translateX(0) translateY(0)}}`}</style>
      <div style={{maxWidth:750,margin:'0 auto 6px',background:'#fff',borderRadius:10,border:'1px solid #ddd',boxShadow:'0 2px 8px rgba(0,0,0,.08)',padding:'6px 10px',overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:420}}>
          <thead><tr style={{borderBottom:'2px solid #e0e0e0'}}><th style={{textAlign:'left',padding:'3px 6px',width:140,fontWeight:700,color:'#333'}}></th>{innH.map(i=><th key={i} style={{textAlign:'center',padding:'3px 3px',width:26,fontWeight:600,color:i===g.inning?'#1a3a5c':'#999',fontSize:12,background:i===g.inning?'#eef2ff':'transparent',borderRadius:4}}>{i}</th>)}<th style={{textAlign:'center',padding:'3px 6px',fontWeight:800,color:'#c41e1e',fontSize:15,borderLeft:'2px solid #e0e0e0'}}>R</th><th style={{textAlign:'center',padding:'3px 5px',fontWeight:700,color:'#333',fontSize:12}}>H</th><th style={{textAlign:'center',padding:'3px 5px',fontWeight:700,color:'#333',fontSize:12}}>E</th></tr></thead>
          <tbody>{[0,1].map(t=>(<tr key={t} style={{background:bt===t&&!g.gameOver?'#f8f9ff':'transparent'}}><td style={{padding:'4px 6px',fontWeight:bt===t?700:500,color:bt===t&&!g.gameOver?'#1a3a5c':'#555',fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:140}}>{bt===t&&!g.gameOver&&<span style={{color:'#c41e1e',marginRight:3}}>▸</span>}{teams[t].name}</td>{innH.map((_,i)=><td key={i} style={{textAlign:'center',padding:'3px',fontWeight:600,color:g.innings[t][i]!==undefined?(g.innings[t][i]>0?'#1a1a1a':'#888'):'transparent',fontSize:14,background:i+1===g.inning?'#eef2ff':'transparent',borderRadius:4,fontVariantNumeric:'tabular-nums'}}>{g.innings[t][i]!==undefined?g.innings[t][i]:''}</td>)}<td style={{textAlign:'center',padding:'3px 6px',fontWeight:800,color:'#c41e1e',fontSize:17,borderLeft:'2px solid #e0e0e0',fontVariantNumeric:'tabular-nums'}}>{t===0?aR:hR}</td><td style={{textAlign:'center',padding:'3px 5px',fontWeight:600,fontSize:13,fontVariantNumeric:'tabular-nums'}}>{g.hits[t]}</td><td style={{textAlign:'center',padding:'3px 5px',fontWeight:600,fontSize:13,fontVariantNumeric:'tabular-nums'}}>{g.errors[t]}</td></tr>))}</tbody>
        </table>
      </div>
      <div style={{maxWidth:750,margin:'0 auto 4px',display:'flex',alignItems:'center',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
        <span style={{fontSize:15,fontWeight:700,color:'#1a3a5c'}}>{g.half===0?'▲':'▼'} {g.inning}{g.inning===1?'st':g.inning===2?'nd':g.inning===3?'rd':'th'}</span><span style={{color:'#ccc'}}>│</span>
        <span style={{fontSize:15,letterSpacing:3}}><span style={{color:'#2563eb'}}>{'●'.repeat(Math.min(3,Math.max(0,g.count.balls)))}</span><span style={{color:'#ddd'}}>{'●'.repeat(Math.max(0,3-g.count.balls))}</span>{' '}<span style={{color:'#dc2626'}}>{'●'.repeat(Math.min(2,Math.max(0,g.count.strikes)))}</span><span style={{color:'#ddd'}}>{'●'.repeat(Math.max(0,2-g.count.strikes))}</span></span><span style={{color:'#ccc'}}>│</span>
        <span style={{fontSize:15,letterSpacing:3}}><span style={{color:'#dc2626'}}>{'●'.repeat(Math.min(g.outs,3))}</span><span style={{color:'#ddd'}}>{'●'.repeat(Math.max(0,3-g.outs))}</span><span style={{fontSize:11,color:'#999',marginLeft:4,letterSpacing:0}}> Out</span></span><span style={{color:'#ccc'}}>│</span>
        <span style={{fontSize:13,fontWeight:600,color:'#444'}}>AB: {batter}</span>
      </div>
      <BaseballField bases={g.bases} defColor={bt===0?'#1e40af':'#b91c1c'} offColor={bt===0?'#b91c1c':'#1e40af'} ballPos={ballPos} pitchPhase={pitchPhase} batterPhase={batterPhase} showFW={showFW} fwKey={fwKey} movingRunners={movingRunners}/>
      <div style={{maxWidth:750,margin:'6px auto',background:announceText?'#1a2744':'transparent',borderRadius:8,padding:announceText?'8px 16px':'0',minHeight:announceText?36:0,transition:'all .3s',display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
        {announceText&&<p style={{margin:0,color:'#fff',fontSize:15,fontWeight:600,textAlign:'center',fontStyle:'italic',flex:1}}>{announceText}</p>}
        {outcome&&<span style={{padding:'3px 12px',borderRadius:16,background:OI[outcome]?.color+'22',border:`1.5px solid ${OI[outcome]?.color}55`,color:OI[outcome]?.color,fontSize:13,fontWeight:700,whiteSpace:'nowrap'}}>{OI[outcome]?.label}</span>}
      </div>
      <div style={{maxWidth:750,margin:'6px auto 0'}}><CardArea drawnPile={drawnPile} dispensedCard={dispensedCard} dispensing={dispensing} onDraw={doDrawCard} canDraw={canDraw} autoPlay={autoPlay} gameOver={g.gameOver} shuffling={shuffling} shuffleCards={shuffleCards}/></div>
      <div style={{maxWidth:750,margin:'8px auto',display:'flex',alignItems:'center',gap:8,justifyContent:'center',flexWrap:'wrap',position:'relative',zIndex:5}}>
        <button onClick={()=>setSoundOn(!soundOn)} style={{background:'#fff',border:'1px solid #ddd',borderRadius:6,padding:'4px 10px',fontSize:12,cursor:'pointer',color:'#555'}}>{soundOn?'🔊':'🔇'}</button>
        <button onClick={()=>{if(!g.gameOver)setAutoPlay(!autoPlay)}} style={{background:autoPlay?'#dcfce7':'#fff',border:`1px solid ${autoPlay?'#22c55e':'#ddd'}`,borderRadius:6,padding:'4px 12px',color:autoPlay?'#15803d':'#555',fontSize:12,fontWeight:600,cursor:g.gameOver?'default':'pointer'}}>{autoPlay?'⏸ Pause':'▶ Auto-Play'}</button>
        {autoPlay&&<div style={{display:'flex',gap:3}}>{[{l:'1×',v:4500},{l:'2×',v:3000},{l:'4×',v:1800},{l:'8×',v:1000}].map(s=><button key={s.l} onClick={()=>setAutoSpeed(s.v)} style={{background:autoSpeed===s.v?'#e0e7ff':'#fff',border:`1px solid ${autoSpeed===s.v?'#6366f1':'#ddd'}`,borderRadius:4,padding:'2px 6px',color:autoSpeed===s.v?'#4338ca':'#888',fontSize:10,fontWeight:600,cursor:'pointer'}}>{s.l}</button>)}</div>}<span style={{color:'#ddd'}}>│</span>
        <div style={{display:'flex',alignItems:'center',gap:3}}>
          <button onClick={()=>{const minIdx=halfStartIdx; const idx=replayIdx<0?playHistory.length-1:(replayIdx<=minIdx?minIdx:replayIdx-1); replayPlay(idx);}} disabled={playHistory.length<=halfStartIdx||procRef.current||(replayIdx>=0&&replayIdx<=halfStartIdx)} style={{background:'#fff',border:'1px solid #ddd',borderRadius:6,padding:'4px 8px',fontSize:11,cursor:'pointer',color:'#555',opacity:playHistory.length>halfStartIdx&&!procRef.current&&!(replayIdx>=0&&replayIdx<=halfStartIdx)?1:.4}}>◄</button>
          <span style={{fontSize:10,color:'#888',minWidth:55,textAlign:'center'}}>{replayIdx>=halfStartIdx?`${replayIdx-halfStartIdx+1}/${playHistory.length-halfStartIdx}`:`Replay (${playHistory.length-halfStartIdx})`}</span>
          <button onClick={()=>{const maxIdx=playHistory.length-1; const idx=replayIdx<0?halfStartIdx:Math.min(replayIdx+1,maxIdx); replayPlay(idx);}} disabled={playHistory.length<=halfStartIdx||procRef.current||(replayIdx>=0&&replayIdx>=playHistory.length-1)} style={{background:'#fff',border:'1px solid #ddd',borderRadius:6,padding:'4px 8px',fontSize:11,cursor:'pointer',color:'#555',opacity:playHistory.length>halfStartIdx&&!procRef.current&&!(replayIdx>=0&&replayIdx>=playHistory.length-1)?1:.4}}>►</button>
        </div>
        <button onClick={()=>{setAutoPlay(false);setConfirmReset(true)}} style={{background:'#fff',border:'1px solid #ddd',borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer',color:'#888'}}>↺ Reset</button>
      </div>
      {confirmReset&&<div style={{maxWidth:750,margin:'6px auto',padding:'10px 16px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,display:'flex',gap:10,alignItems:'center',justifyContent:'center',flexWrap:'wrap'}}><span style={{fontSize:13,color:'#b91c1c',fontWeight:600}}>Reset?</span><button onClick={()=>{setConfirmReset(false);startGame()}} style={{padding:'4px 14px',borderRadius:6,border:'1px solid #ef4444',background:'#fef2f2',color:'#b91c1c',fontSize:12,fontWeight:700,cursor:'pointer'}}>Restart</button><button onClick={()=>{setConfirmReset(false);setPhase('setup');gs.current=INIT_GS();rerender()}} style={{padding:'4px 14px',borderRadius:6,border:'1px solid #d97706',background:'#fffbeb',color:'#92400e',fontSize:12,fontWeight:700,cursor:'pointer'}}>New Teams</button><button onClick={()=>setConfirmReset(false)} style={{padding:'4px 14px',borderRadius:6,border:'1px solid #ddd',background:'#fff',color:'#888',fontSize:12,cursor:'pointer'}}>Cancel</button></div>}
      {g.gameOver&&g.message&&<div style={{maxWidth:750,margin:'8px auto',padding:'14px 28px',borderRadius:10,background:'linear-gradient(135deg,#fefce8,#fff)',border:'2px solid #ca8a04',textAlign:'center',boxShadow:'0 4px 15px rgba(0,0,0,.1)'}}><div style={{fontSize:20,fontWeight:800,color:'#92400e'}}>🎉 {g.message}</div><button onClick={()=>{setPhase('setup');gs.current=INIT_GS();rerender()}} style={{marginTop:10,padding:'8px 28px',borderRadius:8,border:'2px solid #1a5c2a',background:'linear-gradient(135deg,#2d8c1f,#1a6b12)',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>New Game</button></div>}
      <div style={{maxWidth:750,margin:'8px auto 0',display:'flex',gap:8,flexWrap:'wrap'}}>
        <div ref={logRef} style={{flex:'1 1 300px',maxHeight:180,overflowY:'auto',background:'#fff',border:'1px solid #ddd',borderRadius:8,padding:8}}><div style={{fontSize:10,color:'#999',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Play-by-Play</div>{log.map((e,i)=><div key={i} style={{fontSize:12,padding:'2px 0',lineHeight:1.5,color:e.type==='info'?'#1a3a5c':e.type==='homer'?'#ea580c':e.type==='hit'?'#16a34a':e.type==='out'?'#888':'#555',fontWeight:e.type==='info'||e.type==='homer'?700:400,borderBottom:e.type==='info'?'1px solid #eee':'none',paddingBottom:e.type==='info'?4:0,marginBottom:e.type==='info'?4:0}}>{e.text}</div>)}</div>
        <div style={{flex:'1 1 300px',maxHeight:180,overflowY:'auto',background:'#fff',border:'1px solid #ddd',borderRadius:8,padding:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}><span style={{fontSize:10,color:'#999',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Player Stats</span><button onClick={()=>setShowStats(s=>!s)} style={{background:'none',border:'none',fontSize:10,color:'#1a3a5c',fontWeight:700,cursor:'pointer'}}>{showStats?'Hide':'Show'}</button></div>{showStats&&[0,1].map(t=><div key={t} style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:700,color:'#1a3a5c',marginBottom:2}}>{teams[t].name}</div><table style={{width:'100%',fontSize:10,borderCollapse:'collapse'}}><thead><tr style={{borderBottom:'1px solid #eee'}}>{['Player','AB','H','2B','3B','HR','RBI','R','BB','SO','AVG'].map(h=><th key={h} style={{padding:'2px 2px',textAlign:h==='Player'?'left':'center',color:'#999',fontWeight:600}}>{h}</th>)}</tr></thead><tbody>{teams[t].players.map((p,i)=>{const s=statsRef.current[t][p]||{};return <tr key={i} style={{borderBottom:'1px solid #f5f5f5',background:bt===t&&g.batterIdx[t]===i?'#eef2ff':'transparent'}}><td style={{padding:'2px 2px',fontWeight:bt===t&&g.batterIdx[t]===i?700:400,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p}</td>{[s.ab||0,s.h||0,s.d||0,s.tr||0,s.hr||0,s.rbi||0,s.r||0,s.bb||0,s.so||0].map((v,j)=><td key={j} style={{textAlign:'center',padding:'2px',fontVariantNumeric:'tabular-nums'}}>{v}</td>)}<td style={{textAlign:'center',padding:'2px',fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{ba(p,t)}</td></tr>})}</tbody></table></div>)}</div>
      </div>
    </div>
  );
}

export default function BaseballCardGame() {
  return <ErrorBoundary><BaseballCardGameInner /></ErrorBoundary>;
}