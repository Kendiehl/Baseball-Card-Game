import React, { useState, useEffect, useRef, Component, useMemo } from 'react';

/**
 * ERROR BOUNDARY
 */
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
        <div className="p-5 bg-red-50 border-2 border-red-500 rounded-xl m-5 max-w-xl shadow-lg font-sans text-gray-900">
          <h2 className="text-red-700 font-bold mb-2 text-xl">System Reset Required</h2>
          <pre className="bg-white p-3 rounded-lg text-xs overflow-auto text-gray-800 whitespace-pre-wrap mb-4 border border-red-200">{this.state.error?.message || 'Unknown error'}</pre>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-lg border border-red-500 bg-white text-red-700 font-bold hover:bg-red-700 cursor-pointer shadow-sm transition-all"
          >
            Restart Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===== 1. GLOBAL CONSTANTS & DATA =====
const SUITS = ['♣', '♦', '♥', '♠'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED_SUITS = new Set(['♥', '♦']);

const PRESETS = {
  'New York Yankees':['Anthony Volpe','Juan Soto','Aaron Judge','Giancarlo Stanton','Jazz Chisholm Jr.','Austin Wells','Anthony Rizzo','Gleyber Torres','Alex Verdugo'],
  'Los Angeles Dodgers':['Mookie Betts','Shohei Ohtani','Freddie Freeman','Teoscar Hernández','Will Smith','Max Muncy','Tommy Edman','Andy Pages','James Outman'],
  'Atlanta Braves':['Ronald Acuña Jr.','Ozzie Albies','Austin Riley','Matt Olson','Marcell Ozuna','Sean Murphy','Michael Harris II','Orlando Arcia','Jarred Kelenic'],
};

const PLAYER_HANDS = {
  'Anthony Volpe': 'R', 'Juan Soto': 'L', 'Aaron Judge': 'R', 'Giancarlo Stanton': 'R', 'Jazz Chisholm Jr.': 'L', 'Austin Wells': 'L', 'Anthony Rizzo': 'L', 'Gleyber Torres': 'R', 'Alex Verdugo': 'L',
  'Mookie Betts': 'R', 'Shohei Ohtani': 'L', 'Freddie Freeman': 'L', 'Teoscar Hernández': 'R', 'Will Smith': 'R', 'Max Muncy': 'L', 'Tommy Edman': 'S', 'Andy Pages': 'R', 'James Outman': 'L',
  'Ronald Acuña Jr.': 'R', 'Ozzie Albies': 'S', 'Austin Riley': 'R', 'Matt Olson': 'L', 'Marcell Ozuna': 'R', 'Sean Murphy': 'R', 'Michael Harris II': 'L', 'Orlando Arcia': 'R', 'Jarred Kelenic': 'L'
};

const SLUGGERS = new Set(['Aaron Judge', 'Shohei Ohtani', 'Yordan Alvarez', 'Juan Soto', 'Marcell Ozuna', 'Kyle Schwarber', 'BRYCE HARPER', 'Giancarlo Stanton']);

const DIRS = {
  lf: ['to left field', 'to shallow left', 'to deep left'],
  cf: ['to center field', 'to shallow center', 'to deep center'],
  rf: ['to right field', 'to shallow right', 'to deep right'],
  inf: ['to the shortstop', 'to the second baseman', 'to the third baseman', 'to the first baseman']
};

const INF_MAP = { 'the shortstop': 'SS', 'the second baseman': 'F2B', 'the third baseman': 'F3B', 'the first baseman': 'F1B', 'the catcher': 'C' };
const OF_MAP = { 'lf': 'LF', 'cf': 'CF', 'rf': 'RF' };

const CARD_MAP = {
  'A♣':'walk','2♣':'groundOut','3♣':'ball','4♣':'foulBall','5♣':'flyOut',
  '6♣':'groundOut','7♣':'strikeout','8♣':'bunt','9♣':'single','10♣':'strike',
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

const F = {
  HP:{x:310,y:430}, B1:{x:420,y:325}, B2:{x:310,y:225}, B3:{x:200,y:325}, MOUND:{x:310,y:340},
  C:{x:310,y:455}, UMP:{x:310,y:468}, P:{x:310,y:335},
  F1B:{x:405,y:300}, F2B:{x:360,y:248}, SS:{x:260,y:248}, F3B:{x:215,y:300},
  LF:{x:180,y:190}, CF:{x:310,y:140}, RF:{x:440,y:190},
};
const FENCE_Y = 110;

// ===== 2. GLOBAL LOGIC HELPERS =====

function INIT_GS() {
  return {
    inning: 1, half: 0, outs: 0,
    bases: [null, null, null],
    count: { balls: 0, strikes: 0 },
    pitchCount: [0, 0],
    batterIdx: [0, 0],
    innings: [[0], [0]],
    hits: [0, 0],
    errors: [0, 0],
    gameOver: false, message: null
  };
}

function INIT_STATS(teamsData) {
  const s = [{}, {}];
  for (let t = 0; t < 2; t++) {
    for (const p of teamsData[t].players) {
      s[t][p] = { ab: 0, h: 0, hr: 0, sb: 0, cs: 0 };
    }
  }
  return s;
}

function lerp(a, b, t) { return a + (b - a) * t; }
function arcPts(s, e, h, n = 20) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    p.push({ x: lerp(s.x, e.x, t), y: lerp(s.y, e.y, t) - h * 4 * t * (1 - t) });
  }
  return p;
}
function linePts(s, e, n = 15) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    p.push({ x: lerp(s.x, e.x, t), y: lerp(s.y, e.y, t) });
  }
  return p;
}
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function createDeck() {
  const c = [];
  for (const s of SUITS) for (const v of VALUES) c.push({ value: v, suit: s, key: v + s });
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c;
}
function doesSwing(oc) {
  return ['single', 'double', 'triple', 'homeRun', 'error', 'groundOut', 'flyOut', 'lineOut', 'foulOut', 'foulBall', 'doublePlay', 'strikeout', 'bunt'].includes(oc);
}

function resolveWalkForce(b, batterName) {
  let n = [...b], r = 0;
  if (n[0]) {
    if (n[1]) { if (n[2]) r++; n[2] = n[1]; }
    n[1] = n[0];
  }
  n[0] = batterName;
  return { bases: n, runs: r };
}

function advanceRunners(bases, type, batterName) {
  let nb = [null, null, null], runs = 0;
  const rs = [];
  if (bases[2]) rs.push({ pos: 2, name: bases[2] });
  if (bases[1]) rs.push({ pos: 1, name: bases[1] });
  if (bases[0]) rs.push({ pos: 0, name: bases[0] });

  if (type === 'single' || type === 'error') {
    for (const r of rs) { if (r.pos + 1 > 2) runs++; else nb[r.pos + 1] = r.name; }
    nb[0] = batterName;
  } else if (type === 'double') {
    for (const r of rs) { if (r.pos + 2 > 2) runs++; else nb[r.pos + 2] = r.name; }
    nb[1] = batterName;
  } else if (type === 'triple') {
    runs += rs.length;
    nb[2] = batterName;
  } else if (type === 'homeRun') {
    runs += rs.length + 1;
  }
  return { bases: nb, runs };
}

function calculatePlayResult(currentgs, type, batterName) {
  let nextBases = [null, null, null], runs = 0, outsAdded = 0;
  const bases = currentgs.bases;

  if (['walk', 'hbp'].includes(type) || (type === 'ball' && currentgs.count.balls === 3)) {
    const res = resolveWalkForce(bases, batterName);
    return { nextBases: res.bases, runs: res.runs, outsAdded: 0 };
  }

  if (['single', 'double', 'triple', 'homeRun', 'error'].includes(type)) {
    const res = advanceRunners(bases, type, batterName);
    return { nextBases: res.bases, runs: res.runs, outsAdded: 0 };
  }

  if (type === 'bunt') {
    let nb = [null, null, null], r = 0;
    if (bases[2]) r++;
    if (bases[1]) nb[2] = bases[1];
    if (bases[0]) nb[1] = bases[0];
    if (Math.random() < 0.25) { nb[0] = batterName; return { nextBases: nb, runs: r, outsAdded: 0 }; }
    return { nextBases: nb, runs: r, outsAdded: 1 };
  }

  if (type === 'groundOut') {
    if (bases[0]) {
      nextBases[0] = batterName;
      if (bases[1] && !bases[2]) nextBases[2] = bases[1];
      else if (bases[1] && bases[2]) { nextBases[2] = bases[2]; }
      return { nextBases, runs: 0, outsAdded: 1 };
    } else {
      if (currentgs.outs < 2 && bases[2]) runs = 1;
      nextBases[1] = bases[1];
      nextBases[2] = (currentgs.outs < 2 && bases[2]) ? null : bases[2];
      return { nextBases, runs, outsAdded: 1 };
    }
  }

  if (type === 'doublePlay') {
    if (bases[0]) { nextBases[2] = bases[2]; return { nextBases, runs: 0, outsAdded: 2 }; }
    else { return { nextBases: [null, bases[1], bases[2]], runs: 0, outsAdded: 1 }; }
  }

  if (['flyOut', 'lineOut', 'foulOut', 'strikeout'].includes(type)) {
    return { nextBases: [...bases], runs: 0, outsAdded: 1 };
  }

  return { nextBases: [...bases], runs: 0, outsAdded: 0 };
}

function narrateLocal(oc, bat, bases, rs, outs, lockedFielderIdx = null) {
  const sc = rs > 0 ? (rs === 1 ? ` 1 run scores!` : ` ${rs} runs score!`) : '';
  let dir = 'cf', sub = '', variant = 0;
  const rd = pick(['lf', 'cf', 'rf']);
  const infKeys = Object.keys(INF_MAP).filter(k => k !== 'the catcher');
  const selectedInf = lockedFielderIdx !== null ? infKeys[lockedFielderIdx % infKeys.length] : pick(infKeys);
  variant = Math.floor(Math.random() * 3);

  switch (oc) {
    case 'single': dir = rd; return { text: `${bat} hits a single ${DIRS[dir][variant]}.${sc}`, dir, sub: dir, variant };
    case 'double': dir = rd; return { text: `${bat} drives a double ${DIRS[dir][variant]}!${sc}`, dir, sub: dir, variant };
    case 'triple': dir = pick(['lf', 'rf']); return { text: `${bat} smashes a triple ${DIRS[dir][variant]}!${sc}`, dir, sub: dir, variant };
    case 'homeRun': dir = rd; return { text: rs > 1 ? `${bat} crushes a ${rs}-run HOMER ${DIRS[dir][variant]}!` : `${bat} launches a solo HOMER ${DIRS[dir][variant]}!`, dir, sub: dir, variant };
    case 'walk': return { text: `${bat} draws a walk.${sc}`, dir: 'none', sub: '', variant: 0 };
    case 'hbp': return { text: `${bat} is hit by the pitch.${sc}`, dir: 'none', sub: '', variant: 0 };
    case 'error': dir = pick(['lf', 'cf', 'rf', 'inf']); sub = dir === 'inf' ? selectedInf : dir; return { text: `Error! ${bat} reaches first.${sc}`, dir, sub, variant };
    case 'groundOut': dir = 'inf'; return { text: `${bat} grounds out to ${selectedInf}.${sc}`, dir, sub: selectedInf, variant };
    case 'flyOut': dir = rd; return { text: `${bat} flies out ${DIRS[dir][variant]}.`, dir, sub: dir, variant };
    case 'lineOut': dir = pick(['lf', 'cf', 'rf', 'inf']); sub = dir === 'inf' ? selectedInf : dir; return { text: `${bat} lines out ${dir === 'inf' ? 'to ' + selectedInf : DIRS[dir][variant]}.`, dir, sub, variant };
    case 'foulOut': return { text: `${bat} pops out in foul territory.`, dir: 'foul', sub: 'the catcher', variant: 0 };
    case 'strikeout': return { text: `${bat} strikes out${outs >= 2 ? ' to end the inning.' : '.'}`, dir: 'none', sub: '', variant: 0 };
    case 'bunt': return { text: `${bat} lays down a bunt toward ${selectedInf}.${sc}`, dir: 'inf', sub: selectedInf, variant };
    case 'doublePlay': return { text: bases[0] ? `${bat} grounds into a double play!` : `${bat} grounds out.${sc}`, dir: 'inf', sub: selectedInf, variant: 0 };
    default: return { text: `${bat} — ${oc}`, dir: 'cf', sub: 'cf', variant: 0 };
  }
}

function getBallTgtLocal(dir, oc, sub, variant) {
  const hp = F.HP;
  const jitter = () => (Math.random() - 0.5) * 6;
  if (dir === 'none') return (oc === 'hbp' ? { x: hp.x + 20, y: hp.y - 15 } : { x: F.C.x, y: F.C.y - 10 });
  if (dir === 'foul') return { x: hp.x + (Math.random() > 0.5 ? 90 : -90), y: hp.y - 45 };
  if (dir === 'inf') { const key = INF_MAP[sub] || 'MOUND'; return { x: F[key].x + jitter(), y: F[key].y + jitter() }; }
  const baseOf = OF_MAP[sub] || 'CF';
  let fp = { ...F[baseOf] };
  let dm = 1.0;
  if (variant === 1) dm = 0.82; if (variant === 2) dm = 1.25;

  if (oc === 'single' || oc === 'error') {
    const t = Math.max(0.78, Math.min(0.85 * dm, 0.95)); fp.x = lerp(hp.x, fp.x, t) + jitter(); fp.y = lerp(hp.y, fp.y, t) + jitter();
  } else if (oc === 'double') {
    const gap = (sub === 'cf') ? (Math.random() > 0.5 ? 55 : -55) : (sub === 'lf' ? 30 : -30);
    fp.x = fp.x + gap + (fp.x - hp.x) * 0.15 + jitter(); fp.y = lerp(fp.y, FENCE_Y, 0.75 * Math.max(dm, 1.15)) + jitter();
  } else if (oc === 'triple') {
    fp = { x: (sub === 'rf' ? (F.RF.x+F.CF.x)/2 : (F.LF.x+F.CF.x)/2), y: FENCE_Y + 10 }; fp.x += jitter()*2;
  } else if (oc === 'homeRun') {
    const dx = fp.x - hp.x; fp.x = hp.x + dx * 2.8; fp.y = -180;
  } else if (['flyOut', 'lineOut'].includes(oc)) {
    fp.y = lerp(fp.y, FENCE_Y, variant === 2 ? 0.4 : variant === 1 ? -0.2 : 0);
  }
  if (oc !== 'homeRun') fp.y = Math.max(FENCE_Y + 5, fp.y);
  return fp;
}

function genBallAnimLocal(oc, dir, sub, variant) {
  const s = { x: F.HP.x, y: F.HP.y - 10 }, t = getBallTgtLocal(dir, oc, sub, variant);
  if (['ball', 'strike', 'strikeout', 'walk', 'hbp'].includes(oc)) return { path: linePts(F.P, F.C, 12), dur: 550, target: t };
  if (oc === 'homeRun') return { path: arcPts(s, t, 190, 45), dur: 3800, target: t };
  if (oc === 'flyOut' || oc === 'foulOut') return { path: arcPts(s, t, 135, 26), dur: 2200, target: t };
  if (oc === 'lineOut') return { path: arcPts(s, t, 15, 18), dur: 950, target: t };
  if (oc === 'bunt') return { path: linePts(s, { x: lerp(s.x, t.x, 0.45), y: lerp(s.y, t.y, 0.45) }, 12), dur: 700, target: t };
  const arcH = ['double', 'triple'].includes(oc) ? 60 : 35;
  if (['double', 'triple'].includes(oc)) {
    const hf = oc === 'triple' || variant === 2 || (variant === 0 && Math.random() > 0.6);
    if (hf) {
      const ft = { x: t.x, y: FENCE_Y + 2 }, bt = { x: t.x + (Math.random() - 0.5) * 12, y: FENCE_Y + 18 };
      return { path: [...arcPts(s, ft, arcH, 15), ...linePts(ft, bt, 6)], dur: 2200, target: bt, carom: true };
    }
  }
  return { path: (oc === 'single' && variant === 2) ? linePts(s, t, 20) : arcPts(s, t, arcH, 20), dur: 1600, target: t };
}

function computeRunnerPaths(oldBases, outcomeType) {
  const ps = [], hp = F.HP, b1 = F.B1, b2 = F.B2, b3 = F.B3;
  if (['single', 'error'].includes(outcomeType)) {
    if (oldBases[2]) ps.push([b3, hp]); if (oldBases[1]) ps.push([b2, b3]); if (oldBases[0]) ps.push([b1, b2]); ps.push([hp, b1]);
  } else if (outcomeType === 'double') {
    if (oldBases[2]) ps.push([b3, hp]); if (oldBases[1]) ps.push([b2, b3, hp]); if (oldBases[0]) ps.push([b1, b2, b3]); ps.push([hp, b1, b2]);
  } else if (outcomeType === 'triple') {
    if (oldBases[2]) ps.push([b3, hp]); if (oldBases[1]) ps.push([b2, b3, hp]); if (oldBases[0]) ps.push([b1, b2, b3, hp]); ps.push([hp, b1, b2, b3]);
  } else if (outcomeType === 'homeRun') {
    if (oldBases[2]) ps.push([b3, hp]); if (oldBases[1]) ps.push([b2, b3, hp]); if (oldBases[0]) ps.push([b1, b2, b3, hp]); ps.push([hp, b1, b2, b3, hp]);
  } else if (['walk', 'hbp'].includes(outcomeType)) {
    if (oldBases[0]) { if (oldBases[1]) { if (oldBases[2]) ps.push([b3, hp]); ps.push([b2, b3]); } ps.push([b1, b2]); } ps.push([hp, b1]);
  } else if (['groundOut', 'doublePlay'].includes(outcomeType)) {
    if (oldBases[2]) ps.push([b3, hp]); if (oldBases[1]) ps.push([b2, b3]); if (oldBases[0]) ps.push([b1, b2]); ps.push([hp, b1]);
  }
  return ps;
}

// ===== 3. AUDIO SINGLETON =====
let sharedAudioCtx = null;
function playSoundLocal(type) {
  try {
    if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
    const c = sharedAudioCtx, n = c.currentTime;
    if (type === 'cardFlip') {
      const b = c.createBuffer(1, c.sampleRate * .06, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * .008)) * .3;
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'hit') {
      const b = c.createBuffer(1, c.sampleRate * .2, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t / .02) * .5 + Math.sin(t * 800) * Math.exp(-t / .02) * .3; }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'homerun') {
      const b = c.createBuffer(1, c.sampleRate * .15, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * .015)) * .6;
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'shuffle') {
      const totalDur = 1.8, numSnaps = 28;
      for (let i = 0; i < numSnaps; i++) {
        const snapTime = n + (i / numSnaps) * totalDur * 0.6 + (totalDur * 0.2);
        const progress = i / numSnaps;
        const snapDur = 0.008 + Math.abs(progress - 0.5) * 0.012;
        const snapVol = 0.12 + Math.sin(progress * Math.PI) * 0.18;
        const b = c.createBuffer(1, Math.ceil(c.sampleRate * snapDur), c.sampleRate), d = b.getChannelData(0);
        for (let j = 0; j < d.length; j++) { d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (c.sampleRate * 0.003)) * snapVol; }
        const s = c.createBufferSource(); s.buffer = b;
        const g = c.createGain(); g.gain.setValueAtTime(snapVol, snapTime); g.gain.exponentialRampToValueAtTime(0.001, snapTime + snapDur);
        s.connect(g); g.connect(c.destination); s.start(snapTime);
      }
      const thwapTime = n + totalDur * 0.85;
      const tb = c.createBuffer(1, Math.ceil(c.sampleRate * 0.05), c.sampleRate), td = tb.getChannelData(0);
      for (let i = 0; i < td.length; i++) td[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.008)) * 0.35;
      const ts = c.createBufferSource(); ts.buffer = tb; ts.connect(c.destination); ts.start(thwapTime);
    } else if (type === 'fenceHit') {
      const dur = 0.35, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.015) * 0.4 + Math.sin(t * 420) * Math.exp(-t / 0.12) * 0.35; }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'foulPole') {
      const dur = 0.6, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = Math.sin(t * 1800) * Math.exp(-t / 0.25) * 0.3 + Math.sin(t * 2700) * Math.exp(-t / 0.18) * 0.15 + (Math.random() * 2 - 1) * Math.exp(-t / 0.008) * 0.25; }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'stolenBase') {
      const dur = 0.25, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.08) * 0.3 * (1 - t / dur); }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'caughtStealing') {
      const dur = 0.12, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.01) * 0.5 + Math.sin(t * 600) * Math.exp(-t / 0.02) * 0.2; }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    }
  } catch (e) {}
}

// ===== 4. ASSET COMPONENTS =====

function FireworksComp({ active }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const cv = ref.current, c = cv.getContext('2d'), W = cv.width = 620, H = cv.height = 500;
    const cols = ['#eab308', '#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899'];
    let ps = [], bu = 0, run = true;
    function burst(x, y) { for (let i = 0; i < 45; i++) { const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 4; ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, life: 1, decay: .012 + Math.random() * .018, color: cols[Math.floor(Math.random() * cols.length)], size: 1.5 + Math.random() * 2.5 }) } }
    const bi = setInterval(() => { if (bu < 6) { burst(80 + Math.random() * 460, 60 + Math.random() * 200); bu++ } else clearInterval(bi) }, 250);
    function draw() { if (!run) return; c.clearRect(0, 0, W, H); for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.x += p.vx; p.y += p.vy; p.vy += .04; p.vx *= .99; p.life -= p.decay; if (p.life <= 0) { ps[i] = ps[ps.length - 1]; ps.pop(); continue } c.beginPath(); c.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); c.fillStyle = p.color; c.globalAlpha = p.life; c.fill(); c.globalAlpha = 1 } if (ps.length > 0 || bu < 6) requestAnimationFrame(draw) }
    draw(); return () => { run = false; clearInterval(bi) }
  }, [active]);
  return active ? <canvas ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }} /> : null;
}

function MiniCard({ card, style }) {
  if (!card) return null;
  const red = RED_SUITS.has(card.suit), c = red ? '#c00' : '#1a1a1a';
  return (
    <div style={{ width: 60, height: 84, borderRadius: 6, background: '#fffef5', border: `1.5px solid ${red ? '#c0000030' : '#00000015'}`, padding: '3px 5px', fontFamily: 'Inter,sans-serif', boxShadow: '0 2px 6px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', flexShrink: 0, ...style }}>
      <div style={{ color: c, fontSize: 12, fontWeight: 'bold', lineHeight: 1 }}>{card.value}</div>
      <div style={{ color: c, fontSize: 14, lineHeight: 1, marginTop: -1 }}>{card.suit}</div>
      <div className="flex-1 flex items-center justify-center font-serif opacity-30" style={{ color: c, fontSize: 24 }}>{card.suit}</div>
    </div>
  );
}

function CardAreaComp({ drawnPile, dispensedCard, dispensing, onDraw, canDraw, autoPlay, gameOver, shuffling, shuffleCards }) {
  return (
    <div className="flex items-start gap-8 justify-center flex-wrap p-2 relative font-sans min-h-[140px]">
      <style>{`
        @keyframes riffleLeft { 0% { transform: translateX(-80px) rotate(-20deg) scale(0.9); opacity: 0; } 15% { transform: translateX(-50px) rotate(-15deg) scale(1); opacity: 1; } 40% { transform: translateX(-40px) rotate(-10deg); } 60% { transform: translateX(0px) rotate(0deg); } 100% { transform: translateX(0px) rotate(0deg); opacity: 1; } }
        @keyframes riffleRight { 0% { transform: translateX(80px) rotate(20deg) scale(0.9); opacity: 0; } 15% { transform: translateX(50px) rotate(15deg) scale(1); opacity: 1; } 40% { transform: translateX(40px) rotate(10deg); } 60% { transform: translateX(0px) rotate(0deg); } 100% { transform: translateX(0px) rotate(0deg); opacity: 1; } }
      `}</style>
      {shuffling && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/95 rounded-xl font-bold text-blue-900 shadow-inner">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-sm uppercase tracking-widest font-black text-gray-400 mb-4">Deck Shuffle</div>
            <div className="relative w-48 h-32 flex justify-center items-center">
              {shuffleCards.map((card, i) => (
                <div key={i} className="absolute transition-all" style={{ zIndex: i, animation: `${i % 2 === 0 ? 'riffleLeft' : 'riffleRight'} 1.2s cubic-bezier(0.45, 0, 0.55, 1) forwards`, animationDelay: `${(i * 0.04)}s` }}>
                  <MiniCard card={card} style={{ width: 45, height: 63, fontSize: 8 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="relative w-28 h-44 bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-2xl rounded-b-lg border-x-4 border-t-4 border-gray-400 shadow-2xl flex flex-col items-center overflow-hidden">
          <div className="bg-black/40 w-full text-center py-1 border-b border-gray-500 mb-2"><span className="text-[9px] text-yellow-500 font-bold tracking-[3px] uppercase">Shuffler</span></div>
          <button disabled={!canDraw} onClick={onDraw} className={`mt-1 w-20 py-3 rounded-lg border-b-4 transition-all active:translate-y-1 active:border-b-0 ${canDraw ? 'bg-red-600 border-red-800 shadow-red-950/40 cursor-pointer' : 'bg-gray-700 border-gray-900 opacity-50 cursor-not-allowed'}`}>
            <div className={`text-[10px] text-white font-black leading-none ${canDraw && !autoPlay ? 'animate-pulse' : ''}`}>{autoPlay ? 'PAUSE' : gameOver ? 'OVER' : '⚾ DRAW'}</div>
          </button>
          <div className="mt-8 w-24 h-1 bg-black rounded-full shadow-[0_-2px_4px_rgba(255,255,255,0.2)]" /><div className="w-full bg-gray-900/50 flex-1 flex items-end justify-center pb-2"><span className="text-[8px] text-gray-500 font-mono tracking-widest uppercase italic">Authentic MLB Deck</span></div>
          {dispensedCard && ( <div className={`absolute left-4 z-10 transition-all duration-500 cubic-bezier(0.17, 0.67, 0.83, 0.67) ${dispensing ? 'top-24 scale-100' : 'top-16 scale-75 opacity-0'}`}><MiniCard card={dispensedCard} /></div> )}
        </div>
      </div>
      <div className="min-w-[90px] pt-4">
        <div className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-widest text-center">Inning Stack ({drawnPile.length})</div>
        <div className="relative w-16 h-24 mx-auto">
            {drawnPile.slice(-5).map((card, i) => (
                <div key={i} className="absolute transition-all duration-200" style={{ top: Math.min(i * 0.6, 12), left: (i % 3) * 0.8, zIndex: i }}>
                    <MiniCard card={card} style={{ width: 50, height: 70, fontSize: 10 }} />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SVGFielder({ x, y, color = '#1e40af', glove = 'right', isMoving = false }) {
  const gx = glove === 'left' ? -7 : 7, b = isMoving ? Math.sin(Date.now() / 50) * 2 : 0;
  return (<g transform={`translate(${x},${y + b})`}><ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" /><line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" /><line x1={0} y1={8} x2={-3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={8} x2={3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><circle cx={gx * 1.1} cy={-1} r={3.5} fill="#8B4513" stroke="#5a3010" strokeWidth={.6} /><circle cx={0} cy={-5} r={5} fill="#f5d0a0" /><path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} /></g>);
}
function SVGPitcher({ x, y, color = '#1e40af', phase = 'idle' }) {
  const a = phase === 'windup' ? -60 : phase === 'throw' ? 40 : 0;
  return (<g transform={`translate(${x},${y})`}><ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" /><line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" /><line x1={0} y1={8} x2={-3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={8} x2={3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><g transform={`rotate(${a},0,2)`}><line x1={0} y1={2} x2={8} y2={-4} stroke={color} strokeWidth={2} strokeLinecap="round" />{phase !== 'throw' && <circle cx={9} cy={-5} r={2.5} fill="#fff" stroke="#c00" strokeWidth={.5} />}</g><circle cx={0} cy={-5} r={5} fill="#f5d0a0" /><path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} /></g>);
}
function SVGBatter({ x, y, color = '#dc2626', phase = 'stance', side = 'R' }) {
  if (phase === 'gone') return null;
  const l = side === 'L', f = l ? -1 : 1, s = phase === 'swing';
  const isStepOut = phase === 'stepOut';
  const stepOffset = isStepOut ? 12 * f : 0;
  const ba = s ? (l ? -70 : 70) : (l ? 30 : -30);
  const batDown = isStepOut ? 60 * f : ba;
  return (<g transform={`translate(${x + stepOffset},${y})`}>
    <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" />
    <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
    <line x1={0} y1={8} x2={-3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <line x1={0} y1={8} x2={3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    {isStepOut && <line x1={-2 * f} y1={1} x2={-8 * f} y2={-3} stroke={color} strokeWidth={2} strokeLinecap="round" />}
    <g transform={`rotate(${batDown},${6 * f},-2)`}><line x1={6 * f} y1={-2} x2={6 * f} y2={-18} stroke="#b8860b" strokeWidth={2.5} strokeLinecap="round" /></g>
    <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
    <path d={`M${-5 * f},-6 Q0,-13 ${5 * f},-6`} fill={color} />
  </g>);
}
function SVGCatcher({ x, y, color = '#1e40af', isMoving = false }) {
  const b = isMoving ? Math.sin(Date.now() / 50) * 2 : 0;
  return (<g transform={`translate(${x},${y + b})`}><ellipse cx={0} cy={8} rx={6} ry={2} fill="rgba(0,0,0,.1)" /><line x1={0} y1={-4} x2={0} y2={2} stroke={color} strokeWidth={3} strokeLinecap="round" /><line x1={0} y1={2} x2={-5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={-5} y1={0} x2={-5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={2} x2={5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={5} y1={0} x2={5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><circle cx={9.5} cy={-3.5} r={4.5} fill="#8B4513" stroke="#5a3010" strokeWidth={.6} /><circle cx={0} cy={-9} r={5} fill="#f5d0a0" /><path d={`M-5,-10 Q0,-17 5,-10`} fill={color} /><rect x={-3.5} y={-8} width={7} height={5} rx={1} fill="none" stroke="#555" strokeWidth={.7} opacity={.5}/></g>);
}
function SVGUmpire({ x, y }) {
  return (<g transform={`translate(${x},${y})`}><ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.1)"/><line x1={0} y1={0} x2={0} y2={8} stroke="#222" strokeWidth={3} strokeLinecap="round"/><line x1={0} y1={8} x2={-3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={8} x2={3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/><circle cx={0} cy={-5} r={5} fill="#f5d0a0"/><path d={`M-6,-6 Q0,-14 6,-6`} fill="#222"/></g>);
}
function RunnerOnBase({ x, y, color }) {
  return (<g transform={`translate(${x},${y - 10})`}><ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)"/><line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.5} strokeLinecap="round"/><line x1={0} y1={8} x2={-3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={8} x2={3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><circle cx={0} cy={-4} r={4.5} fill="#f5d0a0"/><path d={`M-4.5,-5 Q0,-11 4.5,-5`} fill={color}/></g>);
}
function SVGRunner({ x, y, color, t = 0, facingRight = true }) {
  const cy = Math.sin(t * Math.PI * 6), ls = cy * 5, f = facingRight ? 1 : -1;
  return (<g transform={`translate(${x},${y - 12})`}><ellipse cx={0} cy={16} rx={6} ry={2.5} fill="rgba(0,0,0,.15)" /><line x1={f * 2} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.5} strokeLinecap="round" /><line x1={0} y1={8} x2={-ls * f} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" /><line x1={0} y1={8} x2={ls * f} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" /><circle cx={f * 2.5} cy={-4} r={4.5} fill="#f5d0a0" /><path d={`M${f * 2.5 - 4.5},-5 Q${f * 2.5},-11 ${f * 2.5 + 4.5},-5`} fill={color} /></g>);
}

function BaseballField({ bases, defColor, offColor, ballPos, pitchPhase, batterPhase, showFW, fwKey, movingRunners, movingFielder, batterSide = 'R' }) {
  const hp = F.HP, isLefty = batterSide === 'L';
  const batterX = isLefty ? hp.x + 25 : hp.x - 25;
  const staticField = useMemo(() => {
    const fc = {cx:310, cy:430, rx:330, ry:370};
    const fl = (()=>{ const dx = F.B3.x-hp.x, dy = F.B3.y-hp.y, a = (dx/fc.rx)**2+(dy/fc.ry)**2, b = 2*((hp.x-fc.cx)*dx/fc.rx**2+(hp.y-fc.cy)*dy/fc.ry**2), c = ((hp.x-fc.cx)/fc.rx)**2+((hp.y-fc.cy)/fc.ry)**2-1, disc = b*b-4*a*c, t = (-b+Math.sqrt(Math.max(0,disc)))/(2*a); return {x:hp.x+dx*t,y:hp.y+dy*t}})();
    const fr = (()=>{ const dx = F.B1.x-hp.x, dy = F.B1.y-hp.y, a = (dx/fc.rx)**2+(dy/fc.ry)**2, b = 2*((hp.x-fc.cx)*dx/fc.rx**2+(hp.y-fc.cy)*dy/fc.ry**2), c = ((hp.x-fc.cx)/fc.rx)**2+((hp.y-fc.cy)/fc.ry)**2-1, disc = b*b-4*a*c, t = (-b+Math.sqrt(Math.max(0,disc)))/(2*a); return {x:hp.x+dx*t,y:hp.y+dy*t}})();
    const flx = fl.x, frx = fr.x, fry = fr.y;
    const dp = `M ${hp.x-40} ${hp.y+5} L ${F.B3.x-22} ${F.B3.y+5} Q ${F.B3.x-15} ${F.B3.y-15} ${F.B3.x} ${F.B3.y-18} Q ${F.B2.x-30} ${F.B2.y-5} ${F.B2.x} ${F.B2.y-22} Q ${F.B2.x+30} ${F.B2.y-5} ${F.B1.x} ${F.B1.y-18} Q ${F.B1.x+15} ${F.B1.y-15} ${F.B1.x+22} ${F.B1.y+5} L ${hp.x+40} ${hp.y+5} Z`;
    const aL = Math.atan2(flx - fc.cx, fc.cy - fl.y), aR = Math.atan2(frx - fc.cx, fc.cy - fry);
    const marks = [{label:'330',frac:0},{label:'370',frac:.25},{label:'400',frac:.5},{label:'370',frac:.75},{label:'330',frac:1}];
    return (
      <>
        <defs>
          <radialGradient id="g1" cx="50%" cy="86%" r="55%"><stop offset="0%" stopColor="#4cb82a" /><stop offset="100%" stopColor="#358a1a" /></radialGradient>
          <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6db8e8" /><stop offset="60%" stopColor="#a8d8f0" /><stop offset="100%" stopColor="#6ab840" /></linearGradient>
          <clipPath id="fc1"><path d={`M${hp.x} ${hp.y + 12} L${flx - 8} ${fl.y} A${fc.rx} ${fc.ry} 0 0 1 ${frx + 8} ${fry} Z`} /></clipPath>
        </defs>
        <rect width="620" height="500" fill="url(#sky1)" />
        <path d={`M${hp.x} ${hp.y + 12} L${flx - 4} ${fl.y + 2} A${fc.rx} ${fc.ry} 0 0 1 ${frx + 4} ${fry + 2} Z`} fill="url(#g1)" />
        <g clipPath="url(#fc1)" opacity=".05"> {Array.from({length:22},(_,i)=><rect key={i} x={0} y={50+i*22} width={620} height={11} fill="#fff"/>)} </g>
        <path d={`M${flx} ${fl.y} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry}`} fill="none" stroke="#0d3d08" strokeWidth={18} />
        <path d={`M${flx} ${fl.y} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry}`} fill="none" stroke="#1a6b10" strokeWidth={14} />
        <path d={`M${flx} ${fl.y-7} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry-7}`} fill="none" stroke="#d4a800" strokeWidth={2.5} opacity=".9"/>
        {marks.map((m,i)=>{
          const a = aL + (aR - aL) * m.frac, px = fc.cx + fc.rx * Math.sin(a), py = fc.cy - fc.ry * Math.cos(a);
          return (<g key={i}><rect x={px-12} y={py-7} width={24} height={13} rx={2} fill="#0d3d08" opacity=".9"/><text x={px} y={py+.5} textAnchor="middle" dominantBaseline="middle" fill="#ffd700" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{m.label}</text></g>);
        })}
        <line x1={flx} y1={fl.y} x2={flx} y2={fl.y - 45} stroke="#fbbf24" strokeWidth={4} strokeLinecap="round" />
        <line x1={frx} y1={fry} x2={frx} y2={fry - 45} stroke="#fbbf24" strokeWidth={4} strokeLinecap="round" />
        <line x1={hp.x} y1={hp.y} x2={flx} y2={fl.y} stroke="#fff" strokeWidth={1.8} opacity=".5" /><line x1={hp.x} y1={hp.y} x2={frx} y2={fry} stroke="#fff" strokeWidth={1.8} opacity=".5" />
        <path d={dp} fill="#c9a25c" opacity=".7" /><circle cx={310} cy={350} r={42} fill="#4ab82a" opacity=".5" /><polygon points={`${hp.x},${hp.y + 6} ${hp.x - 7},${hp.y + 1} ${hp.x - 7},${hp.y - 3} ${hp.x + 7},${hp.y - 3} ${hp.x + 7},${hp.y - 3} ${hp.x + 7},${hp.y + 1}`} fill="#fff" />
      </>
    );
  }, []);
  return (
    <div className="relative w-full max-w-[750px] mx-auto overflow-hidden rounded-xl shadow-2xl">
      <FireworksComp active={showFW} key={`fw-${fwKey}`} />
      <svg viewBox="0 0 620 500" className="w-full h-auto block bg-blue-100 font-sans">
        {staticField}
        {[{ b: bases[0], ...F.B1 }, { b: bases[1], ...F.B2 }, { b: bases[2], ...F.B3 }].map((base, idx) => (
          <g key={idx}>
            <rect x={base.x - 7} y={base.y - 7} width={14} height={14} fill={base.b && !movingRunners?.length ? offColor : '#fff'} stroke={base.b ? offColor : '#ddd'} strokeWidth={1.5} transform={`rotate(45,${base.x},${base.y})`} />
            {base.b && !movingRunners?.length && ( <RunnerOnBase x={base.x} y={base.y} color={offColor} /> )}
          </g>
        ))}
        {movingRunners?.map((r, i) => <SVGRunner key={`mr${i}`} x={r.x} y={r.y} color={r.color} t={r.t} facingRight={r.facingRight} />)}
        {movingFielder?.id !== 'LF' && <SVGFielder x={F.LF.x} y={F.LF.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'CF' && <SVGFielder x={F.CF.x} y={F.CF.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'RF' && <SVGFielder x={F.RF.x} y={F.RF.y} color={defColor} glove="left" />}
        {movingFielder?.id !== 'F3B' && <SVGFielder x={F.F3B.x} y={F.F3B.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'SS' && <SVGFielder x={F.SS.x} y={F.SS.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'F2B' && <SVGFielder x={F.F2B.x} y={F.F2B.y} color={defColor} glove="left" />}
        {movingFielder?.id !== 'F1B' && <SVGFielder x={F.F1B.x} y={F.F1B.y} color={defColor} glove="left" />}
        {movingFielder?.id !== 'C' && <SVGCatcher x={F.C.x} y={F.C.y - 8} color={defColor} />}
        {movingFielder && ( movingFielder.id === 'C' ? <SVGCatcher x={movingFielder.x} y={movingFielder.y - 8} color={defColor} isMoving={true} /> : <SVGFielder x={movingFielder.x} y={movingFielder.y} color={defColor} isMoving={true} /> )}
        <SVGPitcher x={F.P.x} y={F.P.y - 14} color={defColor} phase={pitchPhase} />
        <SVGUmpire x={310 + (batterSide === 'L' ? -18 : 18)} y={F.UMP.y - 12} />
        <SVGBatter x={batterX} y={F.HP.y - 5} color={offColor} phase={batterPhase} side={batterSide} />
        {ballPos && ( <g><ellipse cx={ballPos.x} cy={ballPos.y + 3} rx={3} ry={1.2} fill="rgba(0,0,0,.12)" /><circle cx={ballPos.x} cy={ballPos.y} r={3.5} fill="#fff" stroke="#c00" strokeWidth={.7} /></g> )}
      </svg>
    </div>
  );
}

// ===== 6. MAIN APPLICATION =====
function BaseballCardGameInner() {
  const [phase, setPhase] = useState('setup');
  const [teams, setTeams] = useState([{ name: 'New York Yankees', players: [...PRESETS['New York Yankees']] }, { name: 'Los Angeles Dodgers', players: [...PRESETS['Los Angeles Dodgers']] }]);
  const [renderTick, setRenderTick] = useState(0);
  const gs = useRef(INIT_GS());
  const [log, setLog] = useState([]);
  const [playHistory, setPlayHistory] = useState([]);
  const [halfStartIdx, setHalfStartIdx] = useState(0);
  const [replayIdx, setReplayIdx] = useState(-1);
  const [drawnPile, setDrawnPile] = useState([]);
  const [dispensedCard, setDispensedCard] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [showFW, setShowFW] = useState(false);
  const [fwKey, setFwKey] = useState(0);
  const [shuffling, setShuffling] = useState(false);
  const [shuffleCards, setShuffleCards] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(4500);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showCardLibrary, setShowCardLibrary] = useState(false);
  const [inningSummary, setInningSummary] = useState(null);
  const [ballPos, setBallPos] = useState(null);
  const [pitchPhase, setPitchPhase] = useState('idle');
  const [batterPhase, setBatterPhase] = useState('stance');
  const [announceText, setAnnounceText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [movingRunners, setMovingRunners] = useState([]);
  const [movingFielder, setMovingFielder] = useState(null);
  const [activeBatter, setActiveBatter] = useState('');
  const statsRef = useRef([{}, {}]);
  const procRef = useRef(false);
  const sndRef = useRef(true);
  const spdRef = useRef(4500);
  const deckRef = useRef(createDeck());
  const deckIdxRef = useRef(0);
  const animRef = useRef(null);
  const fielderAnimRef = useRef(null);
  const runnerAnimRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => { sndRef.current = soundOn; spdRef.current = autoSpeed; }, [soundOn, autoSpeed]);
  useEffect(() => { return () => { if (animRef.current) cancelAnimationFrame(animRef.current); if (runnerAnimRef.current) cancelAnimationFrame(runnerAnimRef.current); if (fielderAnimRef.current) cancelAnimationFrame(fielderAnimRef.current); }; }, []);
  useEffect(() => { if (!autoPlay || phase !== 'playing') return; const id = setInterval(() => { if (procRef.current || gs.current.gameOver) return; doDrawCard(); }, autoSpeed); return () => clearInterval(id); }, [autoPlay, autoSpeed, phase]);

  function rerender() { setRenderTick(t => t + 1); }
  function triggerFireworks() { setShowFW(true); setFwKey(k => k + 1); setTimeout(() => setShowFW(false), 4500); }
  function addLog(text, type = 'play') { setLog(p => [...p, { text, type }]); }
  function shuffleDeck() { deckRef.current = createDeck(); deckIdxRef.current = 0 };

  function animateBall(path, dur, cb) {
    if (!Array.isArray(path) || path.length < 2) { if (cb) cb(); return; }
    const s = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - s) / dur);
      const idx = Math.min(Math.floor(t * (path.length - 1)), path.length - 2), fr = (t * (path.length - 1)) - idx;
      const p0 = path[idx], p1 = path[idx + 1] || p0;
      if (p0 && p1) setBallPos({ x: lerp(p0.x, p1.x, fr), y: lerp(p0.y, p1.y, fr) });
      if (t < 1) animRef.current = requestAnimationFrame(tick); else if (cb) cb();
    }
    animRef.current = requestAnimationFrame(tick);
  }

  function animateFielder(id, sPos, ePos, dur) {
    const s = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - s) / dur);
      setMovingFielder({ id, x: lerp(sPos.x, ePos.x, t), y: lerp(sPos.y, ePos.y, t) });
      if (t < 1) fielderAnimRef.current = requestAnimationFrame(tick);
    }
    fielderAnimRef.current = requestAnimationFrame(tick);
  }

  function animateRunners(paths, color, dur = 600) {
    if (!paths?.length) return;
    const s = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - s) / dur);
      const eased = t < 0.5 ? 2 * t * t : (1 - Math.pow(-2 * t + 2, 2) / 2);
      const pos = paths.map(wps => {
        const ts = wps.length - 1, pr = eased * ts, i = Math.min(Math.floor(pr), ts - 1), st = pr - i;
        const cx = lerp(wps[i].x, wps[i+1].x, st), cy = lerp(wps[i].y, wps[i+1].y, st);
        return { x: cx, y: cy, color, t, facingRight: (wps[i+1].x - wps[i].x) >= 0 };
      });
      setMovingRunners(pos); if (t < 1) runnerAnimRef.current = requestAnimationFrame(tick); else setMovingRunners([]);
    }
    runnerAnimRef.current = requestAnimationFrame(tick);
  }

  function doShuffleAnimation(onComplete) {
    setShuffling(true); const samples = [];
    for (let i = 0; i < 24; i++) samples.push({ value: pick(VALUES), suit: pick(SUITS), key: `S${i}` });
    setShuffleCards(samples);
    if (sndRef.current) playSoundLocal('shuffle');
    setTimeout(() => { setShuffling(false); setShuffleCards([]); if (onComplete) onComplete(); }, 2600);
  }

  function startGame() {
    if (!teams[0].name || !teams[1].name) return;
    setConfirmReset(false);
    gs.current = INIT_GS(); statsRef.current = INIT_STATS(teams);
    setLog([{ text: `⚾ Play Ball! ${teams[0].name} at ${teams[1].name}`, type: 'info' }]);
    setPlayHistory([]); setReplayIdx(-1); setHalfStartIdx(0); setDrawnPile([]); setDispensedCard(null); setDispensing(false); setOutcome(null); setShowFW(false); setAutoPlay(false); setBallPos(null); setPitchPhase('idle'); setBatterPhase('stance'); setAnnounceText(''); setActiveBatter(teams[0].players[0]); shuffleDeck(); setPhase('playing'); rerender();
  }

  function doDrawCard() {
    if (procRef.current || gs.current.gameOver) return;
    procRef.current = true; setReplayIdx(-1);
    if (deckIdxRef.current >= deckRef.current.length) shuffleDeck();
    const card = deckRef.current[deckIdxRef.current++];
    let oc = CARD_MAP[card.key];
    const bt = gs.current.half, batter = teams[bt].players[gs.current.batterIdx[bt]];
    setActiveBatter(batter);
    if (oc === 'double' && SLUGGERS.has(batter) && Math.random() < 0.3) oc = 'homeRun';

    // Pitcher fatigue
    const defTeam = 1 - bt;
    gs.current.pitchCount[defTeam]++;
    const pc = gs.current.pitchCount[defTeam];
    if (pc > 100) {
      const fatigueBonus = Math.min(0.15, (pc - 100) * 0.01);
      if (oc === 'groundOut' && Math.random() < fatigueBonus) oc = 'single';
      else if (oc === 'flyOut' && Math.random() < fatigueBonus) oc = 'double';
      else if (oc === 'strike' && Math.random() < fatigueBonus * 0.5) oc = 'ball';
      else if (oc === 'single' && Math.random() < fatigueBonus * 0.4) oc = 'double';
    }

    const res = calculatePlayResult(gs.current, oc, batter);
    const nar = narrateLocal(oc, batter, gs.current.bases, res.runs, gs.current.outs, Math.floor(Math.random() * 5));
    setDispensedCard(card); setDispensing(false); setTimeout(() => setDispensing(true), 30);
    if (sndRef.current) playSoundLocal('cardFlip');

    // Stolen base logic
    const isNonContactPitch = ['ball', 'strike', 'foulBall'].includes(oc);
    let stolenBaseEvent = null;
    if (isNonContactPitch && gs.current.outs < 2) {
      const stealCandidates = [];
      if (gs.current.bases[0] && !gs.current.bases[1]) stealCandidates.push({ from: 0, to: 1, name: gs.current.bases[0] });
      if (gs.current.bases[1] && !gs.current.bases[2]) stealCandidates.push({ from: 1, to: 2, name: gs.current.bases[1] });
      for (const cand of stealCandidates) {
        if (Math.random() < 0.10) {
          const success = Math.random() < 0.65;
          stolenBaseEvent = { ...cand, success };
          break;
        }
      }
    }

    // Step-out Reset
    const doesStepOut = Math.random() < 0.15;
    const stepOutDelay = doesStepOut ? 1200 : 0;
    if (doesStepOut) {
      setBatterPhase('stepOut');
      setTimeout(() => setBatterPhase('stance'), 800);
      setTimeout(() => setPitchPhase('windup'), stepOutDelay);
    } else {
      setPitchPhase('windup'); setBatterPhase('stance');
    }

    setTimeout(() => {
      setPitchPhase('throw');
      animateBall(linePts(F.P, { x: F.HP.x, y: F.HP.y - 5 }, 16), 550, () => {
        if (!doesSwing(oc)) {
          if (stolenBaseEvent) {
            const sbe = stolenBaseEvent;
            const baseNames = ['first', 'second', 'third'];
            const startPos = [F.B1, F.B2, F.B3][sbe.from];
            const endPos = [F.B1, F.B2, F.B3][sbe.to];
            animateRunners([[startPos, endPos]], bt === 0 ? '#b91c1c' : '#1e40af', 800);
            if (sbe.success) {
              if (sndRef.current) setTimeout(() => playSoundLocal('stolenBase'), 600);
              setTimeout(() => {
                gs.current.bases[sbe.to] = sbe.name; gs.current.bases[sbe.from] = null;
                if (statsRef.current[bt][sbe.name]) statsRef.current[bt][sbe.name].sb++;
                addLog(`${sbe.name} steals ${baseNames[sbe.to]}!`, 'play');
                setAnnounceText(`${sbe.name} steals ${baseNames[sbe.to]}!`);
                rerender();
              }, 850);
            } else {
              if (sndRef.current) setTimeout(() => playSoundLocal('caughtStealing'), 600);
              setTimeout(() => {
                gs.current.bases[sbe.from] = null; gs.current.outs++;
                if (statsRef.current[bt][sbe.name]) statsRef.current[bt][sbe.name].cs++;
                addLog(`${sbe.name} caught stealing ${baseNames[sbe.to]}!`, 'play');
                setAnnounceText(`${sbe.name} caught stealing ${baseNames[sbe.to]}!`);
                rerender();
              }, 850);
            }
            setTimeout(() => {
              const postStealRes = calculatePlayResult(gs.current, oc, batter);
              animateBall(linePts(F.C, F.P, 16), 500, () => { setBallPos(null); processOutcome(oc, card, nar, false, postStealRes); });
            }, 1200);
          } else {
            setTimeout(() => { animateBall(linePts(F.C, F.P, 16), 500, () => { setBallPos(null); processOutcome(oc, card, nar, false, res); }); }, 300);
          }
        }
      });
    }, 550 + stepOutDelay);

    if (doesSwing(oc)) {
      setTimeout(() => {
        setBatterPhase(oc === 'bunt' ? 'bunt' : 'swing'); if (sndRef.current && !['ball', 'strike', 'walk', 'hbp'].includes(oc)) playSoundLocal('hit');
        setAnnounceText(nar.text);
        if (['single', 'double', 'triple', 'homeRun', 'error', 'groundOut', 'doublePlay', 'bunt'].includes(oc)) {
           const rps = computeRunnerPaths([...gs.current.bases], oc === 'bunt' ? 'single' : oc);
           const troDur = oc === 'homeRun' ? 6500 : 2500;
           animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', troDur);
           if (rps.some(p => p[0].x === F.HP.x)) setTimeout(() => setBatterPhase('gone'), 500);
           setTimeout(() => { gs.current.bases = res.nextBases; rerender(); }, troDur);
        }
      }, 1050 + stepOutDelay);
      setTimeout(() => {
        setPitchPhase('idle'); setOutcome(oc);
        const ba = genBallAnimLocal(oc, nar.dir, nar.sub, nar.variant);
        if (sndRef.current && ba.carom) { setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.65); }
        if (sndRef.current && oc === 'homeRun' && (nar.sub === 'lf' || nar.sub === 'rf') && Math.random() < 0.35) { setTimeout(() => playSoundLocal('foulPole'), ba.dur * 0.5); }

        const isH = ['single', 'double', 'triple', 'error'].includes(oc), isG = ['groundOut', 'doublePlay', 'bunt'].includes(oc);
        if (['flyOut', 'lineOut', 'foulOut'].includes(oc)) {
          const fk = (oc === 'foulOut') ? 'C' : (OF_MAP[nar.sub] || INF_MAP[nar.sub]);
          if (fk) animateFielder(fk, F[fk], ba.target, ba.dur);
        } else if (isG) {
          const fk = INF_MAP[nar.sub] || 'SS'; animateFielder(fk, F[fk], ba.target, ba.dur);
        } else if (isH) {
          const ofk = OF_MAP[nar.sub] || 'CF'; animateFielder(ofk, F[ofk], ba.target, ba.dur + 500);
        }
        animateBall(ba.path, ba.dur, () => {
          if (isH) {
            setTimeout(() => animateBall(linePts(ba.target, F.SS, 16), 550, () => animateBall(linePts(F.SS, F.P, 16), 550, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); })), 600);
          } else if (isG) {
            setTimeout(() => {
              const r1 = !!gs.current.bases[0], cb = r1 ? F.B2 : F.B1, fk = INF_MAP[nar.sub] || 'SS', rfk = r1 ? (fk === 'SS' || fk === 'F3B' ? 'F2B' : 'SS') : 'F1B';
              animateFielder(rfk, F[rfk], cb, 300);
              animateBall(linePts(ba.target, cb, 16), 400, () => {
                if (oc === 'doublePlay' && r1) animateBall(linePts(cb, F.B1, 16), 400, () => animateBall(linePts(F.B1, F.P, 16), 400, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }));
                else animateBall(linePts(cb, F.P, 16), 400, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); });
              });
            }, 300);
          } else { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }
        });
      }, 1100 + stepOutDelay);
    } else setTimeout(() => setAnnounceText(nar.text), 1100 + stepOutDelay);
  }

  function processOutcome(oc, card, nar, animated = false, result = null) {
    const g = gs.current, bt = g.half, bat = teams[bt].players[g.batterIdx[bt]], S = statsRef.current[bt][bat];
    const res = result || calculatePlayResult(g, oc, bat);
    let nO = g.outs + res.outsAdded, bD = false;
    if (oc === 'ball') { g.count.balls++; if (g.count.balls >= 4) bD = true; }
    else if (oc === 'strike') { g.count.strikes++; if (g.count.strikes >= 3) { nO++; bD = true; } }
    else if (oc === 'foulBall') { if (g.count.strikes < 2) g.count.strikes++; }
    else if (doesSwing(oc) || ['walk', 'hbp'].includes(oc)) bD = true;
    if (bD) { S.ab++; if (['single', 'double', 'triple', 'homeRun'].includes(oc)) { S.h++; if (oc === 'homeRun') S.hr++; g.hits[bt]++; } if (oc === 'bunt' && res.outsAdded === 0) { S.h++; g.hits[bt]++; } g.count = { balls: 0, strikes: 0 }; g.batterIdx[bt] = (g.batterIdx[bt] + 1) % 9; }
    if (res.runs > 0) g.innings[bt][g.innings[bt].length - 1] += res.runs;
    if (oc === 'homeRun') triggerFireworks();
    const aS = g.innings[0].reduce((a, b) => a + b, 0), hS = g.innings[1].reduce((a, b) => a + b, 0);
    if (nO >= 3 && g.inning >= 9 && g.half === 0 && hS > aS) { g.gameOver = true; g.message = `${teams[1].name} wins!`; }
    else if (g.inning >= 9 && g.half === 1 && hS > aS) { g.gameOver = true; g.message = `${teams[1].name} wins on a walk-off!`; }
    else if (nO >= 3 && g.inning >= 9 && g.half === 1 && aS !== hS) { g.gameOver = true; g.message = aS > hS ? `${teams[0].name} wins!` : `${teams[1].name} wins!`; }
    addLog(nar.text, oc === 'homeRun' ? 'homer' : 'play');
    let cp; setDrawnPile(prev => { cp = [...prev, card]; return cp; });
    setPlayHistory(p => [...p, { card, outcome: oc, narration: nar.text, dir: nar.dir, sub: nar.sub, variant: nar.variant, isHR: oc === 'homeRun', batter: bat, preBases: [...g.bases], team: bt, resultData: res, pileSnapshot: cp }]);
    g.bases = res.nextBases; g.outs = nO;
    if (g.gameOver) { procRef.current = false; rerender(); return; }
    if (nO >= 3) setTimeout(() => transitionHalf(), 1500);
    else { procRef.current = false; setBatterPhase('stance'); setActiveBatter(teams[bt].players[g.batterIdx[bt]]); rerender(); }
  }

  function transitionHalf() {
    const g = gs.current;
    const summary = { label: `${g.half === 0 ? '▲ Top' : '▼ Bottom'} ${g.inning}`, awayScore: g.innings[0].reduce((a, b) => a + b, 0), homeScore: g.innings[1].reduce((a, b) => a + b, 0), awayName: teams[0].name, homeName: teams[1].name, runs: g.innings[g.half][g.innings[g.half].length - 1] || 0 };
    setInningSummary(summary);
    setTimeout(() => {
      setInningSummary(null);
      if (g.half === 1) { g.inning++; g.half = 0; g.innings[0].push(0); g.innings[1].push(0); } else g.half = 1;
      g.outs = 0; g.bases = [null, null, null]; g.count = { balls: 0, strikes: 0 };
      setDrawnPile([]); setOutcome(null); setReplayIdx(-1); setHalfStartIdx(playHistory.length); rerender();
      doShuffleAnimation(() => { setActiveBatter(teams[g.half].players[g.batterIdx[g.half]]); shuffleDeck(); procRef.current = false; rerender(); });
    }, 2500);
  }

  function replayPlay(idx) {
    if (idx < 0 || idx >= playHistory.length || procRef.current) return;
    procRef.current = true; setReplayIdx(idx);
    const p = playHistory[idx], bt = p.team;
    setDispensedCard(p.card); setDispensing(false); setTimeout(() => setDispensing(true), 30);
    setDrawnPile(p.pileSnapshot || []);
    setOutcome(null); setAnnounceText(''); setPitchPhase('windup'); setBatterPhase('stance'); setActiveBatter(p.batter);
    setTimeout(() => { setPitchPhase('throw'); animateBall(linePts(F.P, { x: F.HP.x, y: F.HP.y - 5 }, 16), 550); }, 550);
    setTimeout(() => { if (doesSwing(p.outcome)) { setBatterPhase('swing'); if (sndRef.current && !['ball', 'strike', 'walk', 'hbp'].includes(p.outcome)) playSoundLocal('hit'); animateRunners(computeRunnerPaths([...p.preBases], p.outcome === 'bunt' ? 'single' : p.outcome), bt === 0 ? '#b91c1c' : '#1e40af', p.outcome === 'homeRun' ? 6500 : 2500); } }, 1050);
    setTimeout(() => {
      setPitchPhase('idle'); setAnnounceText(p.narration);
      const ba = genBallAnimLocal(p.outcome, p.dir, p.sub, p.variant);
      if (['flyOut', 'lineOut', 'foulOut'].includes(p.outcome)) { const fk = (p.outcome === 'foulOut') ? 'C' : (OF_MAP[p.sub] || INF_MAP[p.sub]); if (fk) animateFielder(fk, F[fk], ba.target, ba.dur); }
      else if (['groundOut', 'doublePlay', 'bunt'].includes(p.outcome)) { const fk = INF_MAP[p.sub] || 'SS'; animateFielder(fk, F[fk], ba.target, ba.dur); }
      else if (['single', 'double', 'triple', 'error'].includes(p.outcome)) { const ofk = OF_MAP[p.sub] || 'CF'; animateFielder(ofk, F[ofk], ba.target, ba.dur + 500); }
      animateBall(ba.path, ba.dur, () => { setBallPos(null); setMovingFielder(null); procRef.current = false; });
      if (p.isHR) triggerFireworks();
    }, 1100);
    setTimeout(() => { setPitchPhase('idle'); setBatterPhase('stance'); }, 2500);
  }

  const baValue = (name, t) => { const s = statsRef.current[t][name]; return (!s || s.ab === 0) ? '.000' : (s.h / s.ab).toFixed(3).replace(/^0/, ''); };
  const displayBases = useMemo(() => replayIdx !== -1 && playHistory[replayIdx] ? playHistory[replayIdx].preBases : gs.current.bases, [replayIdx, playHistory, renderTick]);
  const batterSide = useMemo(() => { const raw = PLAYER_HANDS[activeBatter] || 'R'; return raw === 'S' ? 'L' : raw; }, [activeBatter]);

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10 font-sans text-gray-900">
        <h1 className="text-4xl font-black text-blue-900 mb-2 tracking-tight">⚾ MLB CARD BASEBALL</h1>
        <div className="flex gap-10 flex-wrap justify-center max-w-4xl mt-12">
          {[0, 1].map(t => (
            <div key={t} className="bg-white p-6 rounded-2xl shadow-xl w-80 border-t-8 border-blue-900">
              <h2 className="font-bold text-gray-400 mb-4 tracking-widest uppercase text-xs">{t === 0 ? 'Visiting' : 'Home'} Team</h2>
              <select className="w-full p-3 border rounded-lg mb-4 bg-gray-50 font-bold text-blue-900" onChange={e => { const nt = [...teams]; nt[t] = { name: e.target.value, players: [...PRESETS[e.target.value]] }; setTeams(nt); }} value={teams[t].name}>{Object.keys(PRESETS).map(n => <option key={n} value={n}>{n}</option>)}</select>
              <div className="space-y-1">{teams[t].players.map((p, i) => <div key={i} className="text-xs text-gray-600 flex justify-between p-1 bg-gray-50 rounded"><span>{i + 1}. {p}</span> {SLUGGERS.has(p) && <span title="Slugger">🔥</span>}</div>)}</div>
            </div>
          ))}
        </div>
        <button onClick={startGame} className="mt-12 px-16 py-5 bg-green-600 hover:bg-green-700 text-white font-black text-2xl rounded-full shadow-2xl active:scale-95 transition-all cursor-pointer">START SIMULATION</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-2 font-sans select-none overflow-x-hidden text-gray-900 text-[10px]">
      <div className="max-w-[750px] mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-3 mb-2 overflow-x-auto">
         <table className="w-full text-center border-collapse">
           <thead><tr className="border-b-2 border-gray-100"><th className="text-left py-1 text-gray-400 font-bold uppercase text-[10px]">Team</th>{Array.from({length: Math.max(9, gs.current.innings[0].length)}, (_, i) => <th key={i} className="w-6 text-[10px] text-gray-400">{i+1}</th>)}<th className="w-10 font-black text-red-600 text-lg border-l-2 ml-2">R</th><th className="w-10 font-bold text-gray-700 text-lg">H</th><th className="w-10 font-bold text-gray-700 text-lg">E</th></tr></thead>
           <tbody>{[0, 1].map(t => ( <tr key={t} className={gs.current.half === t ? 'bg-blue-50/50' : ''}><td className={`text-left font-bold truncate max-w-[120px] ${t === 1 ? 'text-red-600' : 'text-blue-900'}`}>{t === gs.current.half && '▸'} {teams[t].name}</td>{Array.from({length: Math.max(9, gs.current.innings[0].length)}, (_, i) => {
             const showScore = (t === 0) ? (i < gs.current.inning) : (i < gs.current.inning - 1 || (i === gs.current.inning - 1 && gs.current.half === 1));
             return (<td key={i} className="text-gray-600 font-mono">{showScore ? (gs.current.innings[t][i] ?? 0) : ''}</td>);
           })}<td className="font-black text-red-600 text-xl border-l-2">{gs.current.innings[t].reduce((a,b)=>a+b,0)}</td><td className="font-bold text-gray-800 text-lg">{gs.current.hits[t]}</td><td className="font-bold text-gray-800 text-lg">{gs.current.errors[t]}</td></tr> ))}</tbody>
         </table>
      </div>
      <div className="max-w-[750px] mx-auto flex items-center justify-center gap-6 mb-2 text-blue-900 font-bold uppercase tracking-tight">
        <span>{gs.current.half === 0 ? '▲' : '▼'} Inning {gs.current.inning}</span>
        <span className="flex gap-1 text-lg"><span className="text-blue-500">{'●'.repeat(gs.current.count.balls)}{'○'.repeat(3-gs.current.count.balls)}</span><span className="text-red-500">{'●'.repeat(gs.current.count.strikes)}{'○'.repeat(2-gs.current.count.strikes)}</span></span>
        <span className="text-red-700">{'●'.repeat(gs.current.outs)} OUT</span>
        <span className={`text-gray-500 ${gs.current.pitchCount[1 - gs.current.half] > 100 ? 'text-orange-600 font-black' : ''}`} title="Pitch count (fatigue after 100)">{gs.current.pitchCount[1 - gs.current.half]}P</span>
      </div>

      <BaseballField bases={displayBases} defColor={gs.current.half === 0 ? '#1e40af' : '#b91c1c'} offColor={gs.current.half === 0 ? '#b91c1c' : '#1e40af'} ballPos={ballPos} pitchPhase={pitchPhase} batterPhase={batterPhase} showFW={showFW} fwKey={fwKey} movingRunners={movingRunners} movingFielder={movingFielder} batterSide={batterSide} />

      <div className="max-w-[750px] mx-auto flex flex-col items-start mt-2 px-2 text-gray-900">
        <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-sm text-[9px] font-black uppercase">At Bat</span>
            <span className="font-bold text-slate-800 text-[12px] tracking-tight">{activeBatter}</span>
        </div>
        {gs.current.gameOver && <div className="w-full text-center text-red-600 font-black text-[13px] animate-pulse py-1 bg-red-50 rounded-lg border border-red-100 uppercase tracking-widest">GAME OVER — {gs.current.message}</div>}
      </div>

      <div className="max-w-[750px] mx-auto my-2 text-center min-h-[40px]">
        <div className="bg-blue-900 text-white inline-block px-6 py-2 rounded-full italic font-bold shadow-md text-sm">
          {announceText || "Ready for pitch..."}
        </div>
      </div>

      {inningSummary && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center pointer-events-auto border-t-4 border-blue-900" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <div className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-1">End of</div>
            <div className="text-2xl font-black text-blue-900 mb-3">{inningSummary.label}</div>
            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mb-2">
              <div className="text-left">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Away</div>
                <div className="font-bold text-blue-900 text-sm truncate max-w-[100px]">{inningSummary.awayName}</div>
              </div>
              <div className="text-3xl font-black text-gray-800 tracking-wider">{inningSummary.awayScore} – {inningSummary.homeScore}</div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Home</div>
                <div className="font-bold text-red-700 text-sm truncate max-w-[100px]">{inningSummary.homeName}</div>
              </div>
            </div>
            {inningSummary.runs > 0 ? (
              <div className="text-sm font-bold text-green-700 bg-green-50 rounded-lg py-1 px-3 inline-block">{inningSummary.runs} run{inningSummary.runs > 1 ? 's' : ''} scored</div>
            ) : ( <div className="text-sm font-bold text-gray-400 bg-gray-50 rounded-lg py-1 px-3 inline-block">Scoreless inning</div> )}
          </div>
        </div>
      )}

      <div className="max-w-[750px] mx-auto"><CardAreaComp drawnPile={drawnPile} dispensedCard={dispensedCard} dispensing={dispensing} onDraw={doDrawCard} canDraw={!procRef.current && !gs.current.gameOver && !autoPlay} autoPlay={autoPlay} gameOver={gs.current.gameOver} shuffling={shuffling} shuffleCards={shuffleCards} /></div>
      <div className="max-w-[750px] mx-auto flex justify-center items-center gap-4 mt-6">
        <button onClick={() => setSoundOn(!soundOn)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full border shadow-sm cursor-pointer text-gray-900">{soundOn ? '🔊' : '🔇'}</button>
        <div className="flex bg-white rounded-lg border shadow-sm overflow-hidden h-10">
          <button disabled={playHistory.length <= halfStartIdx || procRef.current} onClick={() => { const current = (replayIdx === -1 ? playHistory.length : replayIdx); const prev = current > halfStartIdx ? (replayIdx === -1 ? playHistory.length - 1 : replayIdx - 1) : halfStartIdx; replayPlay(prev); }} className="px-4 hover:bg-gray-50 border-r disabled:opacity-20 cursor-pointer text-gray-900">◄</button>
          <div className="px-4 flex items-center font-bold text-gray-500 tracking-tighter uppercase">{replayIdx !== -1 ? `Play ${replayIdx + 1}` : 'REPLAY'}</div>
          <button disabled={replayIdx === -1 || replayIdx >= playHistory.length - 1 || procRef.current} onClick={() => replayPlay(replayIdx + 1)} className="px-4 hover:bg-gray-50 disabled:opacity-20 cursor-pointer text-gray-900">►</button>
        </div>
        <button onClick={() => setAutoPlay(!autoPlay)} className={`px-6 py-2 h-10 rounded-lg font-bold shadow-sm transition-colors cursor-pointer ${autoPlay ? 'bg-green-600 text-white' : 'bg-white text-gray-900'}`}>{autoPlay ? '⏸ PAUSE' : '▶ AUTO'}</button>
        <button onClick={() => setShowCardLibrary(true)} className="h-10 px-4 bg-white rounded-lg border shadow-sm text-blue-600 font-bold hover:bg-blue-50 cursor-pointer uppercase">🃏 Cards</button>
        <button onClick={() => setConfirmReset(true)} className="h-10 px-4 bg-white rounded-lg border shadow-sm text-gray-400 font-bold hover:text-red-500 cursor-pointer uppercase">Reset</button>
      </div>
      {confirmReset && ( <div className="max-w-[750px] mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-4 text-xs font-bold text-red-700"><span>RESTART GAME?</span><button onClick={startGame} className="px-6 py-1 bg-red-600 text-white rounded font-black cursor-pointer">YES</button><button onClick={() => setConfirmReset(false)} className="px-6 py-1 bg-white border rounded cursor-pointer">NO</button></div> )}

      {showCardLibrary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" onClick={() => setShowCardLibrary(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-blue-900 text-white rounded-t-2xl">
              <h2 className="font-black text-lg tracking-tight">🃏 Card Library — 52-Card Deck Outcomes</h2>
              <button onClick={() => setShowCardLibrary(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center cursor-pointer">✕</button>
            </div>
            <div className="overflow-y-auto p-4 text-gray-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {SUITS.map(suit => {
                  const isRed = RED_SUITS.has(suit);
                  const suitColor = isRed ? 'text-red-600' : 'text-gray-900';
                  const suitBg = isRed ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
                  const outcomeBadge = (oc) => {
                    const colors = { single: 'bg-green-100 text-green-800', double: 'bg-green-200 text-green-900', triple: 'bg-emerald-200 text-emerald-900', homeRun: 'bg-orange-200 text-orange-900 font-black', walk: 'bg-blue-100 text-blue-800', hbp: 'bg-blue-100 text-blue-800', strikeout: 'bg-red-100 text-red-700', groundOut: 'bg-gray-200 text-gray-700', flyOut: 'bg-gray-200 text-gray-700', lineOut: 'bg-gray-200 text-gray-700', foulOut: 'bg-gray-200 text-gray-700', doublePlay: 'bg-red-200 text-red-800', error: 'bg-yellow-100 text-yellow-800', ball: 'bg-sky-100 text-sky-700', strike: 'bg-amber-100 text-amber-800', foulBall: 'bg-amber-50 text-amber-700', bunt: 'bg-teal-100 text-teal-800' };
                    const labels = { single: 'Single', double: 'Double', triple: 'Triple', homeRun: 'HR', walk: 'Walk', hbp: 'HBP', strikeout: 'K', groundOut: 'GO', flyOut: 'FO', lineOut: 'LO', foulOut: 'PO', doublePlay: 'DP', error: 'E', ball: 'Ball', strike: 'Strike', foulBall: 'Foul', bunt: 'Bunt' };
                    return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${colors[oc] || 'bg-gray-100 text-gray-600'}`}>{labels[oc] || oc}</span>;
                  };
                  return (
                    <div key={suit} className={`rounded-xl border ${suitBg} p-3 text-gray-900`}>
                      <div className={`text-center font-black text-2xl mb-2 ${suitColor}`}>{suit}</div>
                      <div className="space-y-1.5 text-gray-900">
                        {VALUES.map(val => {
                          const key = val + suit;
                          const oc = CARD_MAP[key];
                          return ( <div key={key} className="flex items-center justify-between bg-white rounded px-2 py-1 shadow-sm border border-gray-100"><span className={`font-bold text-xs ${suitColor}`}>{val}{suit}</span>{outcomeBadge(oc)}</div> );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[750px] mx-auto mt-6 flex gap-4 h-52 overflow-hidden items-stretch text-gray-900">
        <div ref={logRef} className="flex-1 bg-white p-3 rounded-xl shadow-inner overflow-y-auto"><h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Play-by-Play</h3>{log.slice().reverse().map((l, i) => <div key={i} className={`text-xs mb-1 ${l.type === 'homer' ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>{l.text}</div>)}</div>
        <div className="w-80 bg-white p-3 rounded-xl shadow-inner overflow-hidden flex flex-col text-gray-900">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Stats ({teams[gs.current.half].name})</h3>
             <button onClick={()=>setShowStats(!showStats)} className="text-[10px] text-blue-600 font-bold cursor-pointer">{showStats ? 'Hide' : 'Show'}</button>
          </div>
          {showStats ? (
            <div className="overflow-y-auto flex-1"><table className="w-full text-left border-collapse text-gray-900">
                <thead className="sticky top-0 bg-white"><tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[9px]"><th className="py-1">Player</th><th className="py-1 text-center w-8">AB</th><th className="py-1 text-center w-8">H</th><th className="py-1 text-center w-8 text-orange-600">SB</th><th className="py-1 text-right w-12">AVG</th></tr></thead>
                <tbody>{teams[gs.current.half].players.map((p, i) => { const s = statsRef.current[gs.current.half][p] || { ab: 0, h: 0, hr: 0, sb: 0, cs: 0 }; const isCurrent = gs.current.batterIdx[gs.current.half] === i; return (<tr key={i} className={`${isCurrent ? 'bg-blue-50 font-bold text-blue-900' : 'text-gray-700'} border-b border-gray-50/50 hover:bg-stone-50`}><td className="py-1.5 truncate max-w-[100px]">{p}</td><td className="py-1.5 text-center">{s.ab}</td><td className="py-1.5 text-center">{s.h}</td><td className="py-1.5 text-center">{s.hr}</td><td className="py-1.5 text-center">{s.sb > 0 || s.cs > 0 ? `${s.sb}/${s.sb+s.cs}` : '-'}</td><td className="py-1.5 text-right font-mono">{baValue(p, gs.current.half)}</td></tr>);})}</tbody></table></div>
          ) : ( <div className="flex-1 flex items-center justify-center text-gray-300 italic text-center text-[9px]">Click 'Show' to see live batting stats</div> )}
        </div>
      </div>
    </div>
  );
}

export default function App() { return ( <ErrorBoundary><BaseballCardGameInner /></ErrorBoundary> ); }