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
  'Houston Astros':['Jose Altuve','Yordan Alvarez','Alex Bregman','Kyle Tucker','Jeremy Peña','Yainer Diaz','Mauricio Dubón','Jake Meyers','Chas McCormick'],
  'Philadelphia Phillies':['Kyle Schwarber','Trea Turner','Bryce Harper','Nick Castellanos','J.T. Realmuto','Alec Bohm','Bryson Stott','Brandon Marsh','Johan Rojas'],
  'Baltimore Orioles':['Gunnar Henderson','Adley Rutschman','Anthony Santander','Ryan Mountcastle','Cedric Mullins','Jordan Westburg','Colton Cowser','Ramón Urías','Jackson Holliday'],
  'San Diego Padres':['Fernando Tatis Jr.','Manny Machado','Xander Bogaerts','Jake Cronenworth','Ha-Seong Kim','Jurickson Profar','Luis Arraez','Luis Campusano','Jackson Merrill'],
  'Texas Rangers':['Marcus Semien','Corey Seager','Adolis García','Josh Jung','Wyatt Langford','Jonah Heim','Nathaniel Lowe','Leody Taveras','Ezequiel Duran'],
  'Minnesota Twins':['Carlos Correa','Byron Buxton','Royce Lewis','Willi Castro','Ryan Jeffers','Max Kepler','Alex Kirilloff','Christian Vázquez','Trevor Larnach'],
  "1927 Yankees":['Earle Combs','Mark Koenig','Babe Ruth','Lou Gehrig','Bob Meusel','Tony Lazzeri','Joe Dugan','Pat Collins','Wiley Moore'],
  "1975 Reds":['Pete Rose','Ken Griffey Sr.','Joe Morgan','Johnny Bench','Tony Pérez','George Foster','Dave Concepción','César Gerónimo','Don Gullett'],
};

const PLAYER_HANDS = {
  'Anthony Volpe': 'R', 'Juan Soto': 'L', 'Aaron Judge': 'R', 'Giancarlo Stanton': 'R', 'Jazz Chisholm Jr.': 'L', 'Austin Wells': 'L', 'Anthony Rizzo': 'L', 'Gleyber Torres': 'R', 'Alex Verdugo': 'L',
  'Mookie Betts': 'R', 'Shohei Ohtani': 'L', 'Freddie Freeman': 'L', 'Teoscar Hernández': 'R', 'Will Smith': 'R', 'Max Muncy': 'L', 'Tommy Edman': 'S', 'Andy Pages': 'R', 'James Outman': 'L',
  'Ronald Acuña Jr.': 'R', 'Ozzie Albies': 'S', 'Austin Riley': 'R', 'Matt Olson': 'L', 'Marcell Ozuna': 'R', 'Sean Murphy': 'R', 'Michael Harris II': 'L', 'Orlando Arcia': 'R', 'Jarred Kelenic': 'L',
  'Jose Altuve': 'R', 'Yordan Alvarez': 'L', 'Alex Bregman': 'R', 'Kyle Tucker': 'L', 'Jeremy Peña': 'R', 'Yainer Diaz': 'R', 'Mauricio Dubón': 'R', 'Jake Meyers': 'R', 'Chas McCormick': 'R',
  'Kyle Schwarber': 'L', 'Trea Turner': 'R', 'Bryce Harper': 'L', 'Nick Castellanos': 'R', 'J.T. Realmuto': 'R', 'Alec Bohm': 'R', 'Bryson Stott': 'L', 'Brandon Marsh': 'L', 'Johan Rojas': 'R',
  'Gunnar Henderson': 'L', 'Adley Rutschman': 'S', 'Anthony Santander': 'S', 'Ryan Mountcastle': 'R', 'Cedric Mullins': 'S', 'Jordan Westburg': 'R', 'Colton Cowser': 'L', 'Ramón Urías': 'R', 'Jackson Holliday': 'L',
  'Fernando Tatis Jr.': 'R', 'Manny Machado': 'R', 'Xander Bogaerts': 'R', 'Jake Cronenworth': 'L', 'Ha-Seong Kim': 'R', 'Jurickson Profar': 'S', 'Luis Arraez': 'L', 'Luis Campusano': 'R', 'Jackson Merrill': 'L',
  'Marcus Semien': 'R', 'Corey Seager': 'L', 'Adolis García': 'R', 'Josh Jung': 'R', 'Wyatt Langford': 'R', 'Jonah Heim': 'S', 'Nathaniel Lowe': 'L', 'Leody Taveras': 'S', 'Ezequiel Duran': 'R',
  'Carlos Correa': 'R', 'Byron Buxton': 'R', 'Royce Lewis': 'R', 'Willi Castro': 'S', 'Ryan Jeffers': 'R', 'Max Kepler': 'L', 'Alex Kirilloff': 'L', 'Christian Vázquez': 'R', 'Trevor Larnach': 'L',
  'Earle Combs': 'L', 'Mark Koenig': 'S', 'Babe Ruth': 'L', 'Lou Gehrig': 'L', 'Bob Meusel': 'R', 'Tony Lazzeri': 'R', 'Joe Dugan': 'R', 'Pat Collins': 'S', 'Wiley Moore': 'R',
  'Pete Rose': 'S', 'Ken Griffey Sr.': 'L', 'Joe Morgan': 'L', 'Johnny Bench': 'R', 'Tony Pérez': 'R', 'George Foster': 'R', 'Dave Concepción': 'R', 'César Gerónimo': 'L', 'Don Gullett': 'R',
};

const SLUGGERS = new Set(['Aaron Judge', 'Shohei Ohtani', 'Yordan Alvarez', 'Juan Soto', 'Marcell Ozuna', 'Kyle Schwarber', 'Bryce Harper', 'Giancarlo Stanton', 'Fernando Tatis Jr.', 'Adolis García', 'Gunnar Henderson', 'Corey Seager', 'Anthony Santander', 'Byron Buxton', 'Babe Ruth', 'Lou Gehrig', 'Johnny Bench', 'George Foster']);

const DIRS = {
  lf: ['to left field', 'to shallow left', 'to deep left'],
  cf: ['to center field', 'to shallow center', 'to deep center'],
  rf: ['to right field', 'to shallow right', 'to deep right'],
  inf: ['to the shortstop', 'to the second baseman', 'to the third baseman', 'to the first baseman']
};

const INF_MAP = { 'the shortstop': 'SS', 'the second baseman': 'F2B', 'the third baseman': 'F3B', 'the first baseman': 'F1B', 'the catcher': 'C' };
const OF_MAP = { 'lf': 'LF', 'cf': 'CF', 'rf': 'RF' };

// Pitch type system for richer narration on non-contact outcomes
const PITCH_TYPES = ['fastball', 'curveball', 'slider', 'changeup'];
function randomPitch() { return pick(PITCH_TYPES); }

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
    kCount: [0, 0],
    reachedBase: [0, 0],
    batterIdx: [0, 0],
    innings: [[0], [0]],
    hits: [0, 0],
    errors: [0, 0],
    rallyCount: 0,
    gameOver: false, message: null
  };
}

function INIT_STATS(teamsData) {
  const s = [{}, {}];
  for (let t = 0; t < 2; t++) {
    for (const p of teamsData[t].players) {
      s[t][p] = { ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, cs: 0, clutchHits: 0 };
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

// ===== SEASON SIMULATION ENGINE =====
function simulateGameInstant(team1Players, team2Players) {
  let deck = createDeck(), deckIdx = 0;
  const nextCard = () => { if (deckIdx >= deck.length) { deck = createDeck(); deckIdx = 0; } return deck[deckIdx++]; };
  const teams = [team1Players, team2Players];
  const gs = { inning: 1, half: 0, outs: 0, bases: [null, null, null], count: { balls: 0, strikes: 0 }, pitchCount: [0, 0], batterIdx: [0, 0], score: [0, 0], hits: [0, 0] };
  const stats = [{}, {}];
  for (let t = 0; t < 2; t++) for (const p of teams[t]) stats[t][p] = { ab: 0, h: 0, hr: 0, rbi: 0 };

  let safety = 6000;
  while (safety-- > 0) {
    const card = nextCard();
    let oc = CARD_MAP[card.key];
    const bt = gs.half, batter = teams[bt][gs.batterIdx[bt]];
    // Intentional walk in simulation: same criteria as live game
    const ibbSim = gs.inning >= 7 && SLUGGERS.has(batter) && !gs.bases[0]
      && (gs.bases[1] || gs.bases[2]) && gs.outs < 2 && Math.random() < 0.30;
    if (ibbSim) {
      const ibbRes = resolveWalkForce([...gs.bases], batter);
      if (ibbRes.runs > 0) { gs.score[bt] += ibbRes.runs; stats[bt][batter].rbi += ibbRes.runs; }
      gs.bases = ibbRes.bases; gs.count = { balls: 0, strikes: 0 }; gs.batterIdx[bt] = (gs.batterIdx[bt] + 1) % 9;
      continue;
    }
    if (oc === 'double' && SLUGGERS.has(batter) && Math.random() < 0.3) oc = 'homeRun';
    const defTeam = 1 - bt;
    gs.pitchCount[defTeam]++;
    const pc = gs.pitchCount[defTeam];
    if (pc > 100) {
      const fb = Math.min(0.15, (pc - 100) * 0.01);
      if (oc === 'groundOut' && Math.random() < fb) oc = 'single';
      else if (oc === 'flyOut' && Math.random() < fb) oc = 'double';
      else if (oc === 'strike' && Math.random() < fb * 0.5) oc = 'ball';
      else if (oc === 'single' && Math.random() < fb * 0.4) oc = 'double';
    }
    if (pc >= 120) gs.pitchCount[defTeam] = 0;
    const res = calculatePlayResult(gs, oc, batter);
    let nO = gs.outs + res.outsAdded, bD = false;
    if (oc === 'ball') { gs.count.balls++; if (gs.count.balls >= 4) bD = true; }
    else if (oc === 'strike') { gs.count.strikes++; if (gs.count.strikes >= 3) { nO++; bD = true; } }
    else if (oc === 'foulBall') { if (gs.count.strikes < 2) gs.count.strikes++; }
    else if (doesSwing(oc) || ['walk', 'hbp'].includes(oc)) bD = true;
    if (bD) {
      stats[bt][batter].ab++;
      if (['single', 'double', 'triple', 'homeRun'].includes(oc)) { stats[bt][batter].h++; if (oc === 'homeRun') stats[bt][batter].hr++; gs.hits[bt]++; }
      if (oc === 'bunt' && res.outsAdded === 0) { stats[bt][batter].h++; gs.hits[bt]++; }
      if (res.runs > 0) stats[bt][batter].rbi += res.runs;
      gs.count = { balls: 0, strikes: 0 }; gs.batterIdx[bt] = (gs.batterIdx[bt] + 1) % 9;
    }
    if (res.runs > 0) gs.score[bt] += res.runs;
    gs.bases = res.nextBases; gs.outs = nO;
    const [aS, hS] = gs.score;
    if (bt === 1 && gs.inning >= 9 && hS > aS) return { score: [aS, hS], hits: [...gs.hits], stats, winner: 1 };
    if (bt === 0 && gs.inning >= 9 && nO >= 3 && hS > aS) return { score: [aS, hS], hits: [...gs.hits], stats, winner: 1 };
    if (bt === 1 && nO >= 3 && gs.inning >= 9 && aS > hS) return { score: [aS, hS], hits: [...gs.hits], stats, winner: 0 };
    if (nO >= 3) {
      if (gs.half === 1) { gs.inning++; gs.half = 0; } else gs.half = 1;
      gs.outs = 0; gs.bases = [null, null, null]; gs.count = { balls: 0, strikes: 0 };
    }
  }
  return { score: [...gs.score], hits: [...gs.hits], stats, winner: gs.score[0] > gs.score[1] ? 0 : (gs.score[1] > gs.score[0] ? 1 : -1) };
}

function simulateSeason(teamNames) {
  const n = teamNames.length;
  // Each team plays ~162 games: play each opponent enough times to approximate that
  const gamesPerMatchup = Math.max(2, Math.round(162 / (n - 1)));
  const standings = {};
  const playerStats = {};
  for (const name of teamNames) {
    standings[name] = { w: 0, l: 0, rs: 0, ra: 0 };
    playerStats[name] = {};
    for (const p of PRESETS[name]) playerStats[name][p] = { ab: 0, h: 0, hr: 0, rbi: 0 };
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const t1 = teamNames[i], t2 = teamNames[j];
      for (let g = 0; g < gamesPerMatchup; g++) {
        // Alternate home/away
        const [away, home] = g % 2 === 0 ? [t1, t2] : [t2, t1];
        const result = simulateGameInstant(PRESETS[away], PRESETS[home]);
        const winner = result.winner === 0 ? away : home;
        const loser = winner === away ? home : away;
        standings[winner].w++;
        standings[loser].l++;
        standings[away].rs += result.score[0];
        standings[away].ra += result.score[1];
        standings[home].rs += result.score[1];
        standings[home].ra += result.score[0];
        // Aggregate player stats
        const awayPlayers = PRESETS[away], homePlayers = PRESETS[home];
        for (const p of awayPlayers) {
          const s = result.stats[0][p];
          if (s) { playerStats[away][p].ab += s.ab; playerStats[away][p].h += s.h; playerStats[away][p].hr += s.hr; playerStats[away][p].rbi += s.rbi; }
        }
        for (const p of homePlayers) {
          const s = result.stats[1][p];
          if (s) { playerStats[home][p].ab += s.ab; playerStats[home][p].h += s.h; playerStats[home][p].hr += s.hr; playerStats[home][p].rbi += s.rbi; }
        }
      }
    }
  }
  // Sort standings by win%
  const sorted = teamNames.map(name => ({ name, ...standings[name], pct: standings[name].w / (standings[name].w + standings[name].l) })).sort((a, b) => b.pct - a.pct);
  // Top players by HR and AVG
  const allPlayers = [];
  for (const team of teamNames) {
    for (const p of PRESETS[team]) {
      const s = playerStats[team][p];
      if (s.ab > 0) allPlayers.push({ name: p, team, ...s, avg: s.h / s.ab });
    }
  }
  const hrLeaders = [...allPlayers].sort((a, b) => b.hr - a.hr).slice(0, 10);
  const avgLeaders = [...allPlayers].filter(p => p.ab >= 30).sort((a, b) => b.avg - a.avg).slice(0, 10);
  const rbiLeaders = [...allPlayers].sort((a, b) => b.rbi - a.rbi).slice(0, 10);
  return { standings: sorted, hrLeaders, avgLeaders, rbiLeaders, gamesPerMatchup };
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

  if (['flyOut', 'lineOut'].includes(type)) {
    if (bases[2] && currentgs.outs < 2) {
      const nb = [...bases];
      nb[2] = null;
      return { nextBases: nb, runs: 1, outsAdded: 1, isSacFly: true };
    }
    return { nextBases: [...bases], runs: 0, outsAdded: 1 };
  }

  if (['foulOut', 'strikeout'].includes(type)) {
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
    case 'homeRun': {
      dir = rd;
      if (rs === 4) {
        const gsTexts = [
          `GRAND SLAM! ${bat} clears the bases with a blast ${DIRS[dir][variant]}!`,
          `${bat} CRUSHES a GRAND SLAM ${DIRS[dir][variant]}! Four runs score!`,
          `IT'S A GRAND SLAM! ${bat} empties the bases with a moonshot ${DIRS[dir][variant]}!`
        ];
        return { text: gsTexts[variant], dir, sub: dir, variant };
      }
      return { text: rs > 1 ? `${bat} crushes a ${rs}-run HOMER ${DIRS[dir][variant]}!` : `${bat} launches a solo HOMER ${DIRS[dir][variant]}!`, dir, sub: dir, variant };
    }
    case 'walk': { const pt = randomPitch(); const walkTexts = [`${bat} draws a walk on a ${pt} low.${sc}`, `Ball four — ${pt} misses outside. ${bat} takes first.${sc}`, `${bat} lays off a ${pt} and earns the free pass.${sc}`]; return { text: walkTexts[variant], dir: 'none', sub: '', variant: 0 }; }
    case 'hbp': { const pt = randomPitch(); return { text: `${bat} is hit by a ${pt}. Take your base.${sc}`, dir: 'none', sub: '', variant: 0 }; }
    case 'error': dir = pick(['lf', 'cf', 'rf', 'inf']); sub = dir === 'inf' ? selectedInf : dir; return { text: `Error! ${bat} reaches first.${sc}`, dir, sub, variant };
    case 'groundOut': dir = 'inf'; return { text: `${bat} grounds out to ${selectedInf}.${sc}`, dir: 'inf', sub: selectedInf, variant };
    case 'doublePlay': {
      dir = 'inf';
      const dpTexts = [
        `${bat} grounds into a double play! ${selectedInf} to second to first.`,
        `DOUBLE PLAY! ${bat} hits a grounder — ${selectedInf} turns two!`,
        `${bat} bounces to ${selectedInf} — around the horn, two are down!`
      ];
      return { text: dpTexts[variant], dir: 'inf', sub: selectedInf, variant };
    }
    case 'bunt': {
      dir = 'inf';
      const buntTexts = [
        `${bat} lays down a sacrifice bunt to ${selectedInf}.${sc}`,
        `${bat} squares and bunts toward ${selectedInf}.${sc}`,
        `${bat} drops a bunt down the line to ${selectedInf}.${sc}`
      ];
      return { text: buntTexts[variant], dir: 'inf', sub: selectedInf, variant };
    }
    case 'flyOut': dir = rd; return { text: `${bat} flies out ${DIRS[dir][variant]}.${sc ? ' Runner tags and scores!' : ''}`, dir, sub: dir, variant };
    case 'lineOut': dir = pick(['lf', 'cf', 'rf', 'inf']); sub = dir === 'inf' ? selectedInf : dir; return { text: `${bat} lines out ${dir === 'inf' ? 'to ' + selectedInf : DIRS[dir][variant]}.${sc ? ' Runner tags and scores!' : ''}`, dir, sub, variant };
    case 'foulOut': return { text: `${bat} pops out in foul territory.`, dir: 'foul', sub: 'the catcher', variant: 0 };
    case 'strikeout': { const pt = randomPitch(); const kTexts = [`${bat} goes down swinging on a ${pt}${outs >= 2 ? ' to end the inning.' : '.'}`, `Strike three! ${bat} misses the ${pt}${outs >= 2 ? ' — that retires the side.' : '.'}`, `${bat} whiffs on a nasty ${pt}${outs >= 2 ? '. Three up, three down!' : '.'}`]; return { text: kTexts[variant], dir: 'none', sub: '', variant: 0 }; }
    case 'ball': { const pt = randomPitch(); const ballTexts = [`${pt[0].toUpperCase() + pt.slice(1)} misses low. Ball.`, `${pt[0].toUpperCase() + pt.slice(1)} — just off the corner. Ball.`, `${bat} takes a ${pt} outside for a ball.`]; return { text: ballTexts[variant], dir: 'none', sub: '', variant: 0 }; }
    case 'strike': { const pt = randomPitch(); const stTexts = [`${pt[0].toUpperCase() + pt.slice(1)} catches the corner. Strike!`, `${bat} watches a ${pt} paint the zone. Called strike.`, `Strike! That ${pt} nipped the black.`]; return { text: stTexts[variant], dir: 'none', sub: '', variant: 0 }; }
    case 'foulBall': { const pt = randomPitch(); const foulTexts = [`${bat} fouls off a ${pt}.`, `${pt[0].toUpperCase() + pt.slice(1)} — fouled back. Still alive.`, `Foul ball! ${bat} fights off the ${pt}.`]; return { text: foulTexts[variant], dir: 'foul', sub: '', variant: 0 }; }
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
    if (sub === 'lf' || (sub === 'cf' && Math.random() > 0.5)) fp = { x: (F.LF.x + F.CF.x) / 2, y: FENCE_Y + 10 };
    else fp = { x: (F.RF.x + F.CF.x) / 2, y: FENCE_Y + 10 };
    fp.x += jitter() * 2;
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
  if (['groundOut', 'doublePlay'].includes(oc)) return { path: linePts(s, t, 16), dur: 1000, target: t };
  if (oc === 'foulBall') return { path: arcPts(s, t, 60, 20), dur: 1400, target: t };
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

// Exit velocity generator (Statcast-style) based on outcome type
function generateExitVelo(oc) {
  const rand = () => Math.random();
  switch (oc) {
    case 'homeRun': return Math.round(102 + rand() * 14); // 102-116 mph
    case 'triple': return Math.round(98 + rand() * 10); // 98-108 mph
    case 'double': return Math.round(93 + rand() * 13); // 93-106 mph
    case 'single': return Math.round(78 + rand() * 22); // 78-100 mph
    case 'lineOut': return Math.round(92 + rand() * 14); // 92-106 mph (hard hit, right at someone)
    case 'flyOut': return Math.round(82 + rand() * 16); // 82-98 mph
    case 'groundOut': return Math.round(75 + rand() * 18); // 75-93 mph
    case 'doublePlay': return Math.round(80 + rand() * 14); // 80-94 mph
    case 'foulOut': return Math.round(70 + rand() * 18); // 70-88 mph
    case 'error': return Math.round(82 + rand() * 16); // 82-98 mph
    case 'bunt': return Math.round(35 + rand() * 20); // 35-55 mph
    default: return null;
  }
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
  } else if (outcomeType === 'sacFly') {
    if (oldBases[2]) ps.push([b3, hp]);
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
    } else if (type === 'shuffle') {
      const totalDur = 1.8, numSnaps = 28;
      for (let i = 0; i < numSnaps; i++) {
        const snapTime = n + (i / numSnaps) * totalDur * 0.6 + (totalDur * 0.2);
        const progress = i / numSnaps; const snapDur = 0.008 + Math.abs(progress - 0.5) * 0.012; const snapVol = 0.12 + Math.sin(progress * Math.PI) * 0.18;
        const b = c.createBuffer(1, Math.ceil(c.sampleRate * snapDur), c.sampleRate), d = b.getChannelData(0);
        for (let j = 0; j < d.length; j++) { d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (c.sampleRate * 0.003)) * snapVol; }
        const s = c.createBufferSource(); s.buffer = b; const g = c.createGain(); g.gain.setValueAtTime(snapVol, snapTime); g.gain.exponentialRampToValueAtTime(0.001, snapTime + snapDur);
        s.connect(g); g.connect(c.destination); s.start(snapTime);
      }
      const thwapTime = n + totalDur * 0.85; const tb = c.createBuffer(1, Math.ceil(c.sampleRate * 0.05), c.sampleRate), td = tb.getChannelData(0);
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
    } else if (type === 'slideHome') {
      const dur = 0.4, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.12) * 0.35 * (1 - t / dur * 0.5) + Math.sin(t * 200 * (1 - t)) * Math.exp(-t / 0.1) * 0.15; }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'doublePlayTurn') {
      // Two quick mitt pops — catch at 2B then throw to 1B
      for (let i = 0; i < 2; i++) {
        const popTime = n + i * 0.18;
        const dur = 0.1, b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
        const freq = i === 0 ? 700 : 500; // higher pitch on pivot, lower on catch at 1B
        for (let j = 0; j < d.length; j++) { const t = j / c.sampleRate; d[j] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.45 + Math.sin(t * freq) * Math.exp(-t / 0.025) * 0.2; }
        const s = c.createBufferSource(); s.buffer = b; const g = c.createGain();
        g.gain.setValueAtTime(0.4, popTime); g.gain.exponentialRampToValueAtTime(0.001, popTime + dur);
        s.connect(g); g.connect(c.destination); s.start(popTime);
      }
    } else if (type === 'wildPitch') {
      // Ball bouncing off backstop — sharp thud then rattle
      const dur = 0.3, b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.015) * 0.5 + Math.sin(t * 350) * Math.exp(-t / 0.06) * 0.25; }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'seventhStretch') {
      // Organ-style "Take Me Out to the Ball Game" opening phrase
      const melody = [
        { freq: 523.25, start: 0, dur: 0.22 },     // C5
        { freq: 523.25, start: 0.25, dur: 0.22 },   // C5
        { freq: 440.00, start: 0.5, dur: 0.22 },    // A4
        { freq: 392.00, start: 0.75, dur: 0.22 },   // G4
        { freq: 329.63, start: 1.0, dur: 0.22 },    // E4
        { freq: 392.00, start: 1.25, dur: 0.45 },   // G4 (held)
        { freq: 293.66, start: 1.8, dur: 0.55 },    // D4 (held)
      ];
      melody.forEach(({ freq, start, dur }) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(freq, n + start);
        g.gain.setValueAtTime(0.22, n + start); g.gain.exponentialRampToValueAtTime(0.001, n + start + dur);
        o.connect(g); g.connect(c.destination); o.start(n + start); o.stop(n + start + dur + 0.1);
      });
    } else if (type === 'glovePop') {
      // Quick leather mitt pop — used for around-the-horn catches
      const dur = 0.08, b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.01) * 0.3 + Math.sin(t * 650) * Math.exp(-t / 0.02) * 0.15; }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'walkOff') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const o = sharedAudioCtx.createOscillator(), g = sharedAudioCtx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(freq, n + i * 0.15);
        g.gain.setValueAtTime(0.25, n + i * 0.15); g.gain.exponentialRampToValueAtTime(0.001, n + i * 0.15 + 0.6);
        o.connect(g); g.connect(sharedAudioCtx.destination); o.start(n + i * 0.15); o.stop(n + i * 0.15 + 0.6);
      });
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

function SVGSlidingRunner({ x, y, color, progress = 0 }) {
  const slideOffset = progress * 20;
  const collisionPhase = Math.max(0, (progress - 0.6) / 0.4); 
  const safeTextOpacity = progress > 0.85 ? Math.min(1, (progress - 0.85) / 0.1) : 0;
  return (
    <g transform={`translate(${x - slideOffset},${y})`}>
      <ellipse cx={0} cy={14} rx={8} ry={2} fill="rgba(0,0,0,.12)" /><line x1={-6} y1={8} x2={6} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" /><line x1={6} y1={8} x2={14} y2={10} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={-6} y1={6} x2={-16} y2={10} stroke={color} strokeWidth={2} strokeLinecap="round" /><circle cx={-8} cy={4} r={4.5} fill="#f5d0a0" /><path d={`M-12.5,3 Q-8,-3 -3.5,3`} fill={color} />
      {progress > 0.3 && (
        <g transform={`translate(${-24 + collisionPhase * 4},${-6})`} opacity={Math.min(1, (progress - 0.3) * 3)}>
          <line x1={0} y1={4} x2={0} y2={10} stroke="#1e3a5f" strokeWidth={2.8} strokeLinecap="round" /><line x1={0} y1={10} x2={-4} y2={14} stroke="#1e3a5f" strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={10} x2={4} y2={14} stroke="#1e3a5f" strokeWidth={2.2} strokeLinecap="round" /><circle cx={7} cy={2} r={4} fill="#8B4513" stroke="#5a3010" strokeWidth={0.6} /><circle cx={0} cy={0} r={4.5} fill="#f5d0a0" /><path d={`M-4.5,-1 Q0,-7 4.5,-1`} fill="#1e3a5f" /><rect x={-3} y={-1} width={6} height={4} rx={1} fill="none" stroke="#555" strokeWidth={0.6} opacity={0.5} />
        </g>
      )}
      {collisionPhase > 0 && collisionPhase < 0.5 && ( <g opacity={(0.5 - collisionPhase) * 2}><circle cx={-14} cy={6} r={8 + collisionPhase * 12} fill="#fff" opacity={0.3} /></g> )}
      {safeTextOpacity > 0 && ( <g opacity={safeTextOpacity}><rect x={-28} y={-28} width={40} height={16} rx={3} fill="#16a34a" /><text x={-8} y={-18} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">SAFE!</text></g> )}
    </g>
  );
}

function MiniCardArea({ drawnPile, dispensedCard, dispensing, onDraw, canDraw, autoPlay, gameOver, shuffling, shuffleCards }) {
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
function SVGUmpire({ x, y, phase = 'idle' }) {
  // Classic umpire "punch out" call on strikeouts — right arm pumps up
  const isPunchOut = phase === 'punchOut';
  return (<g transform={`translate(${x},${y})`}>
    <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.1)"/>
    <line x1={0} y1={0} x2={0} y2={8} stroke="#222" strokeWidth={3} strokeLinecap="round"/>
    <line x1={0} y1={8} x2={-3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
    <line x1={0} y1={8} x2={3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
    {/* Left arm — hangs at side normally, or pulls back during punchout */}
    <line x1={0} y1={2} x2={isPunchOut ? -5 : -6} y2={isPunchOut ? 5 : 8} stroke="#222" strokeWidth={2} strokeLinecap="round"/>
    {/* Right arm — punches up on strikeout call */}
    {isPunchOut ? (
      <g>
        <line x1={0} y1={2} x2={7} y2={-6} stroke="#222" strokeWidth={2.2} strokeLinecap="round">
          <animate attributeName="x2" values="6;7;7" dur="0.4s" fill="freeze" />
          <animate attributeName="y2" values="2;-8;-6" dur="0.4s" fill="freeze" />
        </line>
        <circle cx={7} cy={-7} r={2.2} fill="#f5d0a0" stroke="#222" strokeWidth={0.5}>
          <animate attributeName="cy" values="2;-9;-7" dur="0.4s" fill="freeze" />
        </circle>
      </g>
    ) : (
      <line x1={0} y1={2} x2={6} y2={8} stroke="#222" strokeWidth={2} strokeLinecap="round"/>
    )}
    <circle cx={0} cy={-5} r={5} fill="#f5d0a0"/>
    <path d={`M-6,-6 Q0,-14 6,-6`} fill="#222"/>
  </g>);
}
function SVGManager({ x, y, progress = 0 }) {
  const walkCycle = Math.sin(progress * Math.PI * 8) * 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" /><line x1={0} y1={0} x2={0} y2={8} stroke="#1a1a1a" strokeWidth={2.8} strokeLinecap="round" /><line x1={0} y1={8} x2={-3 + walkCycle} y2={14} stroke="#1a1a1a" strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={8} x2={3 - walkCycle} y2={14} stroke="#1a1a1a" strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={2} x2={-5} y2={5} stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round" /><line x1={0} y1={2} x2={5} y2={5} stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round" /><circle cx={0} cy={-5} r={5} fill="#f5d0a0" /><path d="M-5.5,-6 Q0,-13 5.5,-6" fill="#1a1a1a" />
    </g>
  );
}
function RunnerOnBase({ x, y, color }) {
  return (<g transform={`translate(${x},${y - 10})`}><ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)"/><line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.5} strokeLinecap="round"/><line x1={0} y1={8} x2={-3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><line x1={0} y1={8} x2={3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round"/><circle cx={0} cy={-4} r={4.5} fill="#f5d0a0"/><path d={`M-4.5,-5 Q0,-11 4.5,-5`} fill={color}/></g>);
}
function SVGRunner({ x, y, color, t = 0, facingRight = true }) {
  const cy = Math.sin(t * Math.PI * 6), ls = cy * 5, f = facingRight ? 1 : -1;
  return (<g transform={`translate(${x},${y - 12})`}><ellipse cx={0} cy={16} rx={6} ry={2.5} fill="rgba(0,0,0,.15)" /><line x1={f * 2} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.5} strokeLinecap="round" /><line x1={0} y1={8} x2={-ls * f} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" /><line x1={0} y1={8} x2={ls * f} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" /><circle cx={f * 2.5} cy={-4} r={4.5} fill="#f5d0a0" /><path d={`M${f * 2.5 - 4.5},-5 Q${f * 2.5},-11 ${f * 2.5 + 4.5},-5`} fill={color} /></g>);
}

function PlayoffBunting({ visible }) {
  if (!visible) return null;
  const buntingColors = ['#b91c1c', '#ffffff', '#1e40af'];
  const buntingPositions = [
    { x: 120, y: 118, scale: 1 }, { x: 175, y: 95, scale: 1 }, { x: 230, y: 78, scale: 1 }, { x: 285, y: 70, scale: 1 },
    { x: 340, y: 70, scale: 1 }, { x: 395, y: 78, scale: 1 }, { x: 450, y: 95, scale: 1 }, { x: 505, y: 118, scale: 1 },
    { x: 260, y: 465, scale: 0.7 }, { x: 310, y: 470, scale: 0.7 }, { x: 360, y: 465, scale: 0.7 },
  ];
  return (
    <g>
      {buntingPositions.map((pos, i) => {
        const s = pos.scale, w = 48 * s, h = 18 * s;
        return (
          <g key={`bunting-${i}`} transform={`translate(${pos.x},${pos.y})`}>
            {buntingColors.map((color, ci) => {
              const offsetX = (ci - 1) * w * 0.33;
              return ( <path key={ci} d={`M${offsetX - w * 0.17},0 Q${offsetX},${h * 0.9} ${offsetX + w * 0.17},0`} fill={color} opacity={0.85} stroke={color === '#ffffff' ? '#ddd' : color} strokeWidth={0.5} /> );
            })}
            <line x1={-w * 0.5} y1={0} x2={w * 0.5} y2={0} stroke="#8B7355" strokeWidth={1.5 * s} /><circle cx={-w * 0.33} cy={0} r={1.5 * s} fill="#fbbf24" /><circle cx={0} cy={0} r={1.5 * s} fill="#fbbf24" /><circle cx={w * 0.33} cy={0} r={1.5 * s} fill="#fbbf24" />
          </g>
        );
      })}
      <g><rect x={235} y={42} width={150} height={18} rx={3} fill="#1e3a5f" opacity={0.9} /><text x={310} y={54} textAnchor="middle" dominantBaseline="middle" fill="#ffd700" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="3">POSTSEASON</text></g>
    </g>
  );
}

function Dugouts({ homeColor, awayColor }) {
  return (
    <g>
      <rect x={68} y={420} width={60} height={22} rx={3} fill="#3a3a3a" opacity={0.85} /><rect x={70} y={418} width={56} height={4} rx={1.5} fill={homeColor} opacity={0.9} /><rect x={72} y={424} width={52} height={14} rx={2} fill="#2a2a2a" opacity={0.6} />
      {[0,1,2,3,4].map(i => ( <circle key={`hd${i}`} cx={82 + i * 10} cy={430} r={3} fill={homeColor} opacity={0.5} /> ))}
      <text x={98} y={416} textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="sans-serif" opacity={0.7}>DUGOUT</text>
      <rect x={492} y={420} width={60} height={22} rx={3} fill="#3a3a3a" opacity={0.85} /><rect x={494} y={418} width={56} height={4} rx={1.5} fill={awayColor} opacity={0.9} /><rect x={496} y={424} width={52} height={14} rx={2} fill="#2a2a2a" opacity={0.6} />
      {[0,1,2,3,4].map(i => ( <circle key={`ad${i}`} cx={506 + i * 10} cy={430} r={3} fill={awayColor} opacity={0.5} /> ))}
      <text x={522} y={416} textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="sans-serif" opacity={0.7}>DUGOUT</text>
    </g>
  );
}

function StrikeoutKs({ kCount, side = 'home' }) {
  // Display K signs along the outfield fence, stadium-style
  const count = Math.min(kCount, 20); // Cap display at 20
  if (count === 0) return null;
  const isHome = side === 'home';
  // Home team K's on left fence, away team K's on right fence
  const startX = isHome ? 130 : 490;
  const dirX = isHome ? 14 : -14;
  const baseY = isHome ? 138 : 138;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = startX + i * dirX;
        const y = baseY + (isHome ? (i < 5 ? 0 : i < 10 ? -16 : i < 15 ? -32 : -48) : (i < 5 ? 0 : i < 10 ? -16 : i < 15 ? -32 : -48));
        const col = i < 5 ? x : startX + (i % 5) * dirX;
        const row = Math.floor(i / 5);
        const kY = baseY - row * 16;
        return (
          <g key={`k-${side}-${i}`} transform={`translate(${col},${kY})`}>
            <rect x={-5.5} y={-7} width={11} height={14} rx={1.5} fill="#fff" stroke="#c00" strokeWidth={0.8} opacity={0.92} />
            <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fill="#c00" fontSize="9" fontWeight="bold" fontFamily="sans-serif">K</text>
          </g>
        );
      })}
    </g>
  );
}

function StadiumLights() {
  // Four tall light towers at the stadium corners
  const towers = [
    { x: 85, y: 130 },   // left field
    { x: 200, y: 55 },   // left-center
    { x: 420, y: 55 },   // right-center
    { x: 535, y: 130 },  // right field
  ];
  return (
    <g>
      {towers.map((t, i) => (
        <g key={`lt-${i}`}>
          <line x1={t.x} y1={t.y} x2={t.x} y2={t.y - 55} stroke="#666" strokeWidth={2.5} />
          <rect x={t.x - 8} y={t.y - 58} width={16} height={6} rx={1.5} fill="#888" stroke="#555" strokeWidth={0.5} />
          <ellipse cx={t.x} cy={t.y - 55} rx={14} ry={8} fill="#fffbe6" opacity={0.35} />
          {[-5, -1.5, 2, 5.5].map((dx, j) => (
            <circle key={j} cx={t.x + dx} cy={t.y - 55} r={1.8} fill="#fff8dc" opacity={0.9} />
          ))}
          <path d={`M${t.x - 6},${t.y - 52} L${t.x - 35},${t.y + 40} L${t.x + 35},${t.y + 40} L${t.x + 6},${t.y - 52} Z`} fill="#fffbe6" opacity={0.04} />
        </g>
      ))}
    </g>
  );
}

function WebGemSparkle({ x, y }) {
  if (!x || !y) return null;
  // 6 sparkle points radiating out from catch point with fade animation
  const sparkles = [
    { dx: 0, dy: -12 }, { dx: 10, dy: -6 }, { dx: 10, dy: 6 },
    { dx: 0, dy: 12 }, { dx: -10, dy: 6 }, { dx: -10, dy: -6 }
  ];
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill="#fbbf24" opacity={0.5}>
        <animate attributeName="r" from="4" to="18" dur="0.8s" fill="freeze" />
        <animate attributeName="opacity" from="0.7" to="0" dur="0.8s" fill="freeze" />
      </circle>
      {sparkles.map((s, i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x + s.dx * 1.8} y2={y + s.dy * 1.8} stroke="#fbbf24" strokeWidth={1.5} strokeLinecap="round" opacity={0.9}>
            <animate attributeName="opacity" from="0.9" to="0" dur="1s" begin="0.1s" fill="freeze" />
          </line>
          <circle cx={x + s.dx * 2} cy={y + s.dy * 2} r={2} fill="#fff" opacity={0.9}>
            <animate attributeName="opacity" from="0.9" to="0" dur="1s" begin="0.15s" fill="freeze" />
            <animate attributeName="cx" from={x + s.dx} to={x + s.dx * 2.5} dur="0.8s" fill="freeze" />
            <animate attributeName="cy" from={y + s.dy} to={y + s.dy * 2.5} dur="0.8s" fill="freeze" />
          </circle>
        </g>
      ))}
      <text x={x} y={y - 18} textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold" fontFamily="sans-serif" opacity={1}>
        <animate attributeName="opacity" from="1" to="0" dur="1.2s" fill="freeze" />
        <animate attributeName="y" from={y - 14} to={y - 28} dur="1.2s" fill="freeze" />
        WEB GEM!
      </text>
    </g>
  );
}

function BaseballField({ bases, defColor, offColor, ballPos, ballTrail = [], pitchPhase, batterPhase, showFW, fwKey, movingRunners, movingFielder, batterSide = 'R', platePlay = null, isPlayoff = false, pitchingChange = null, homeColor = '#b91c1c', awayColor = '#1e40af', homeKs = 0, awayKs = 0, isNightGame = false, webGem = null, umpirePhase = 'idle' }) {
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
      <React.Fragment>
        <defs>
          <radialGradient id="g1" cx="50%" cy="86%" r="55%"><stop offset="0%" stopColor={isNightGame ? '#2d8a1a' : '#4cb82a'} /><stop offset="100%" stopColor={isNightGame ? '#1e6010' : '#358a1a'} /></radialGradient>
          <linearGradient id={isNightGame ? 'sky1n' : 'sky1d'} x1="0" y1="0" x2="0" y2="1">{isNightGame ? (<><stop offset="0%" stopColor="#0a1628" /><stop offset="40%" stopColor="#152040" /><stop offset="100%" stopColor="#1a4a20" /></>) : (<><stop offset="0%" stopColor="#6db8e8" /><stop offset="60%" stopColor="#a8d8f0" /><stop offset="100%" stopColor="#6ab840" /></>)}</linearGradient>
          <clipPath id="fc1"><path d={`M${hp.x} ${hp.y + 12} L${flx - 8} ${fl.y} A${fc.rx} ${fc.ry} 0 0 1 ${frx + 8} ${fry} Z`} /></clipPath>
        </defs>
        <rect width="620" height="500" fill={`url(#${isNightGame ? 'sky1n' : 'sky1d'})`} />
        <path d={`M${hp.x} ${hp.y + 12} L${flx - 4} ${fl.y + 2} A${fc.rx} ${fc.ry} 0 0 1 ${frx + 4} ${fry + 2} Z`} fill="url(#g1)" />
        <g clipPath="url(#fc1)" opacity=".05"> {Array.from({length:22},(_,i)=><rect key={i} x={0} y={50+i*22} width={620} height={11} fill="#fff"/>)} </g>
        <path d={`M${flx} ${fl.y} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry}`} fill="none" stroke="#0d3d08" strokeWidth={18} /><path d={`M${flx} ${fl.y} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry}`} fill="none" stroke="#1a6b10" strokeWidth={14} /><path d={`M${flx} ${fl.y-7} A${fc.rx} ${fc.ry} 0 0 1 ${frx} ${fry-7}`} fill="none" stroke="#d4a800" strokeWidth={2.5} opacity=".9"/>
        {marks.map((m,i)=>{
          const a = aL + (aR - aL) * m.frac, px = fc.cx + fc.rx * Math.sin(a), py = fc.cy - fc.ry * Math.cos(a);
          return (<g key={i}><rect x={px-12} y={py-7} width={24} height={13} rx={2} fill="#0d3d08" opacity=".9"/><text x={px} y={py+.5} textAnchor="middle" dominantBaseline="middle" fill="#ffd700" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{m.label}</text></g>);
        })}
        <line x1={flx} y1={fl.y} x2={flx} y2={fl.y - 45} stroke="#fbbf24" strokeWidth={4} strokeLinecap="round" /><line x1={frx} y1={fry} x2={frx} y2={fry - 45} stroke="#fbbf24" strokeWidth={4} strokeLinecap="round" /><line x1={hp.x} y1={hp.y} x2={flx} y2={fl.y} stroke="#fff" strokeWidth={1.8} opacity=".5" /><line x1={hp.x} y1={hp.y} x2={frx} y2={fry} stroke="#fff" strokeWidth={1.8} opacity=".5" />
        <path d={dp} fill="#c9a25c" opacity=".7" /><circle cx={310} cy={350} r={42} fill="#4ab82a" opacity=".5" /><polygon points={`${hp.x},${hp.y + 6} ${hp.x - 7},${hp.y + 1} ${hp.x - 7},${hp.y - 3} ${hp.x + 7},${hp.y - 3} ${hp.x + 7},${hp.y + 1}`} fill="#fff" />
      </React.Fragment>
    );
  }, [isNightGame]);

  return (
    <div className="relative w-full max-w-[750px] mx-auto overflow-hidden rounded-xl shadow-2xl">
      <FireworksComp active={showFW} key={`fw-${fwKey}`} />
      <svg viewBox="0 0 620 500" className="w-full h-auto block bg-blue-100 font-sans">
        {staticField}
        {isNightGame && <StadiumLights />}
        {/* Night game stars */}
        {isNightGame && (
          <g>
            {[{x:50,y:15},{x:120,y:8},{x:190,y:22},{x:280,y:6},{x:340,y:18},{x:410,y:10},{x:480,y:25},{x:540,y:12},{x:580,y:20},{x:30,y:35},{x:160,y:40},{x:350,y:35},{x:460,y:42},{x:565,y:38}].map((s,i) => (
              <circle key={`star-${i}`} cx={s.x} cy={s.y} r={i % 3 === 0 ? 1.2 : 0.8} fill="#fff" opacity={0.4 + (i % 4) * 0.15} />
            ))}
          </g>
        )}
        <PlayoffBunting visible={isPlayoff} />
        <Dugouts homeColor={homeColor} awayColor={awayColor} />
        <StrikeoutKs kCount={homeKs} side="home" />
        <StrikeoutKs kCount={awayKs} side="away" />
        {pitchingChange && <SVGManager x={pitchingChange.x} y={pitchingChange.y} progress={pitchingChange.progress} />}
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
        {/* Fielder position labels */}
        {[
          { id: 'LF', x: F.LF.x, y: F.LF.y + 22, label: 'LF' },
          { id: 'CF', x: F.CF.x, y: F.CF.y + 22, label: 'CF' },
          { id: 'RF', x: F.RF.x, y: F.RF.y + 22, label: 'RF' },
          { id: 'F3B', x: F.F3B.x, y: F.F3B.y + 22, label: '3B' },
          { id: 'SS', x: F.SS.x, y: F.SS.y + 22, label: 'SS' },
          { id: 'F2B', x: F.F2B.x, y: F.F2B.y + 22, label: '2B' },
          { id: 'F1B', x: F.F1B.x, y: F.F1B.y + 22, label: '1B' },
          { id: 'P', x: F.P.x, y: F.P.y + 8, label: 'P' },
          { id: 'C', x: F.C.x + 14, y: F.C.y - 6, label: 'C' },
        ].filter(f => movingFielder?.id !== f.id).map(f => (
          <g key={`lbl-${f.id}`}>
            <text x={f.x} y={f.y} textAnchor="middle" dominantBaseline="middle" fill="#000" fontSize="6" fontWeight="bold" fontFamily="sans-serif" opacity={0.3} stroke="#000" strokeWidth={1.5} paintOrder="stroke">
              {f.label}
            </text>
            <text x={f.x} y={f.y} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="sans-serif" opacity={0.75}>
              {f.label}
            </text>
          </g>
        ))}
        {movingFielder && ( movingFielder.id === 'C' ? <SVGCatcher x={movingFielder.x} y={movingFielder.y - 8} color={defColor} isMoving={true} /> : <SVGFielder x={movingFielder.x} y={movingFielder.y} color={defColor} isMoving={true} /> )}
        <SVGPitcher x={F.P.x} y={F.P.y - 14} color={defColor} phase={pitchPhase} />
        <SVGUmpire x={310 + (batterSide === 'L' ? -18 : 18)} y={F.UMP.y - 12} phase={umpirePhase} />
        <SVGBatter x={batterX} y={F.HP.y - 5} color={offColor} phase={batterPhase} side={batterSide} />
        {platePlay && ( <SVGSlidingRunner x={F.HP.x - 15} y={F.HP.y - 8} color={offColor} progress={platePlay.progress} /> )}
        {ballTrail.length > 0 && ballTrail.map((tp, i) => {
          const opacity = (i + 1) / ballTrail.length * 0.35;
          const r = 1.5 + (i / ballTrail.length) * 1.5;
          return <circle key={`bt${i}`} cx={tp.x} cy={tp.y} r={r} fill="#fff" opacity={opacity} />;
        })}
        {ballPos && ( <g><ellipse cx={ballPos.x} cy={ballPos.y + 3} rx={3} ry={1.2} fill="rgba(0,0,0,.12)" /><circle cx={ballPos.x} cy={ballPos.y} r={3.5} fill="#fff" stroke="#c00" strokeWidth={.7} /></g> )}
        {webGem && <WebGemSparkle x={webGem.x} y={webGem.y} />}
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
  const [isPlayoff, setIsPlayoff] = useState(false);
  const [isNightGame, setIsNightGame] = useState(false);
  const [showCardLibrary, setShowCardLibrary] = useState(false);
  const [seasonResults, setSeasonResults] = useState(null);
  const [seasonTab, setSeasonTab] = useState('standings');
  const [inningSummary, setInningSummary] = useState(null);
  const [seventhStretch, setSeventhStretch] = useState(false);
  const [ballPos, setBallPos] = useState(null);
  const [ballTrail, setBallTrail] = useState([]);
  const ballTrailRef = useRef([]);
  const [pitchPhase, setPitchPhase] = useState('idle');
  const [batterPhase, setBatterPhase] = useState('stance');
  const [announceText, setAnnounceText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [movingRunners, setMovingRunners] = useState([]);
  const [movingFielder, setMovingFielder] = useState(null);
  const [platePlay, setPlatePlay] = useState(null);
  const [pitchingChange, setPitchingChange] = useState(null);
  const [activeBatter, setActiveBatter] = useState('');
  const [exitVelo, setExitVelo] = useState(null);
  const [webGem, setWebGem] = useState(null);
  const [umpirePhase, setUmpirePhase] = useState('idle');
  const [scoringFlash, setScoringFlash] = useState(null); // { team: 0|1, runs: N }
  const [pitchMilestone, setPitchMilestone] = useState(null); // { count: 50|75|100, team: 'name' }
  const [clutchBadge, setClutchBadge] = useState(null); // { batter: 'name', team: 0|1 }
  const [showPostGame, setShowPostGame] = useState(false);
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
  const plateAnimRef = useRef(null);
  const moundVisitRef = useRef(null);
  const playIdRef = useRef(0);

  useEffect(() => { sndRef.current = soundOn; spdRef.current = autoSpeed; }, [soundOn, autoSpeed]);
  useEffect(() => { return () => { if (animRef.current) cancelAnimationFrame(animRef.current); if (runnerAnimRef.current) cancelAnimationFrame(runnerAnimRef.current); if (fielderAnimRef.current) cancelAnimationFrame(fielderAnimRef.current); if (plateAnimRef.current) cancelAnimationFrame(plateAnimRef.current); if (moundVisitRef.current) cancelAnimationFrame(moundVisitRef.current); }; }, []);
  useEffect(() => { if (!autoPlay || phase !== 'playing') return; const id = setInterval(() => { if (procRef.current || gs.current.gameOver) return; doDrawCard(); }, autoSpeed); return () => clearInterval(id); }, [autoPlay, autoSpeed, phase]);

  function rerender() { setRenderTick(t => t + 1); }
  function triggerFireworks() { setShowFW(true); setFwKey(k => k + 1); setTimeout(() => setShowFW(false), 4500); }
  function addLog(text, type = 'play') { setLog(p => [...p, { text, type }]); }
  function shuffleDeck() { deckRef.current = createDeck(); deckIdxRef.current = 0 };

  function animateBall(path, dur, cb) {
    if (!Array.isArray(path) || path.length < 2) { if (cb) cb(); return; }
    const s = performance.now();
    ballTrailRef.current = [];
    function tick(now) {
      const t = Math.min(1, (now - s) / dur);
      const idx = Math.min(Math.floor(t * (path.length - 1)), path.length - 2), fr = (t * (path.length - 1)) - idx;
      const p0 = path[idx], p1 = path[idx + 1] || p0;
      if (p0 && p1) {
        const pos = { x: lerp(p0.x, p1.x, fr), y: lerp(p0.y, p1.y, fr) };
        setBallPos(pos);
        ballTrailRef.current = [...ballTrailRef.current.slice(-7), pos];
        setBallTrail([...ballTrailRef.current]);
      }
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else { ballTrailRef.current = []; setBallTrail([]); if (cb) cb(); }
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

  function animatePlatePlay(dur = 1800, onComplete) {
    const s = performance.now();
    function tick(now) {
      const rawT = Math.min(1, (now - s) / dur);
      const t = rawT < 0.6 ? (rawT / 0.6) * (rawT / 0.6) * 0.6 : 0.6 + (1 - Math.pow(1 - (rawT - 0.6) / 0.4, 2)) * 0.4;
      setPlatePlay({ progress: t });
      if (rawT < 1) plateAnimRef.current = requestAnimationFrame(tick);
      else { setTimeout(() => { setPlatePlay(null); if (onComplete) onComplete(); }, 600); }
    }
    plateAnimRef.current = requestAnimationFrame(tick);
  }

  function animatePitchingChange(defTeamIdx, onComplete) {
    const isHome = defTeamIdx === 1;
    const dugoutX = isHome ? 98 : 522;
    const dugoutY = 430;
    const moundX = F.MOUND.x;
    const moundY = F.MOUND.y;
    const dur = 2800;
    const s = performance.now();
    function tick(now) {
      const rawT = Math.min(1, (now - s) / dur);
      let x, y;
      if (rawT < 0.45) { const t = rawT / 0.45; x = lerp(dugoutX, moundX, t); y = lerp(dugoutY, moundY, t); } 
      else if (rawT < 0.7) { x = moundX; y = moundY; } 
      else { const t = (rawT - 0.7) / 0.3; x = lerp(moundX, dugoutX, t); y = lerp(moundY, dugoutY, t); }
      setPitchingChange({ x, y, progress: rawT });
      if (rawT < 1) moundVisitRef.current = requestAnimationFrame(tick);
      else { setPitchingChange(null); if (onComplete) onComplete(); }
    }
    moundVisitRef.current = requestAnimationFrame(tick);
  }

  // "Around the horn" — after a K with empty bases, ball goes C → 3B → 2B → SS → P
  function animateAroundTheHorn(onComplete) {
    const legs = [
      { from: F.C, to: F.F3B, dur: 300 },
      { from: F.F3B, to: F.F2B, dur: 250 },
      { from: F.F2B, to: F.SS, dur: 200 },
      { from: F.SS, to: F.P, dur: 250 },
    ];
    let i = 0;
    function nextLeg() {
      if (i >= legs.length) { setBallPos(null); setBallTrail([]); if (onComplete) onComplete(); return; }
      const leg = legs[i];
      if (sndRef.current && i > 0) playSoundLocal('glovePop');
      animateBall(linePts(leg.from, leg.to, 16), leg.dur, () => { i++; setTimeout(nextLeg, 80); });
    }
    nextLeg();
  }

  function doShuffleAnimation(onComplete) {
    setShuffling(true); const samples = [];
    for (let i = 0; i < 24; i++) samples.push({ value: pick(VALUES), suit: pick(SUITS), key: `S${i}` });
    setShuffleCards(samples);
    if (sndRef.current) playSoundLocal('shuffle');
    setTimeout(() => { setShuffling(false); setShuffleCards([]); if (onComplete) onComplete(); }, 2600);
  }

  function runSeason() {
    const allTeams = Object.keys(PRESETS);
    const results = simulateSeason(allTeams);
    setSeasonResults(results);
    setSeasonTab('standings');
    setPhase('season');
  }

  function startGame() {
    if (!teams[0].name || !teams[1].name) return;
    setConfirmReset(false);
    gs.current = INIT_GS(); statsRef.current = INIT_STATS(teams);
    setLog([{ text: `⚾ Play Ball! ${teams[0].name} at ${teams[1].name}`, type: 'info' }]);
    setPlayHistory([]); setReplayIdx(-1); setHalfStartIdx(0); setDrawnPile([]); setDispensedCard(null); setDispensing(false); setOutcome(null); setShowFW(false); setAutoPlay(false); setBallPos(null); setPitchPhase('idle'); setBatterPhase('stance'); setAnnounceText(''); setExitVelo(null); setPlatePlay(null); setUmpirePhase('idle'); setScoringFlash(null); setPitchMilestone(null); setClutchBadge(null); setShowPostGame(false); setActiveBatter(teams[0].players[0]); shuffleDeck(); setPhase('playing'); rerender();
  }

  function doDrawCard() {
    if (procRef.current || gs.current.gameOver) return;
    procRef.current = true; setReplayIdx(-1);
    const thisPlayId = ++playIdRef.current;
    const bt = gs.current.half, batter = teams[bt].players[gs.current.batterIdx[bt]];
    setActiveBatter(batter);

    // Intentional walk strategy: in late-game situations (7th inning+), when a slugger is up
    // with first base open, runner(s) in scoring position, and fewer than 2 outs, the defense
    // may intentionally walk the batter (~30% chance). Classic baseball strategy.
    const ibbEligible = gs.current.inning >= 7 && SLUGGERS.has(batter) && !gs.current.bases[0]
      && (gs.current.bases[1] || gs.current.bases[2]) && gs.current.outs < 2 && !gs.current.gameOver;
    if (ibbEligible && Math.random() < 0.30) {
      const preBases = [...gs.current.bases];
      const ibbRes = resolveWalkForce([...gs.current.bases], batter);
      const ibbTexts = [
        `Intentional walk! The defense puts ${batter} on first to set up the force play.`,
        `They're walking ${batter} intentionally! Too dangerous to pitch to in this situation.`,
        `Strategic move — ${batter} is intentionally walked. The defense wants no part of that bat.`
      ];
      const ibbNarText = pick(ibbTexts);
      setAnnounceText(ibbNarText);
      addLog(ibbNarText, 'play');
      setPitchPhase('windup');
      setTimeout(() => {
        setPitchPhase('throw');
        const catcherWide = { x: F.C.x + (batterSide === 'L' ? -30 : 30), y: F.C.y - 5 };
        animateBall(linePts(F.P, catcherWide, 12), 450, () => {
          setBallPos(null);
          // IBB is a plate appearance; we don't increment AB (matching real scoring rules)
          gs.current.count = { balls: 0, strikes: 0 };
          gs.current.batterIdx[bt] = (gs.current.batterIdx[bt] + 1) % 9;
          if (ibbRes.runs > 0) {
            gs.current.innings[bt][gs.current.innings[bt].length - 1] += ibbRes.runs;
            const S = statsRef.current[bt][batter];
            if (S) S.rbi += ibbRes.runs;
            setScoringFlash({ team: bt, runs: ibbRes.runs });
            setTimeout(() => setScoringFlash(null), 2000);
          }
          gs.current.reachedBase[bt]++;
          gs.current.rallyCount++;
          gs.current.bases = ibbRes.bases;
          const rps = computeRunnerPaths(preBases, 'walk');
          animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', 800);
          let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
          setPlayHistory(p => [...p, { card: null, outcome: 'walk', narration: ibbNarText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, resultData: ibbRes, pileSnapshot: cp, isIBB: true }]);
          setPitchPhase('idle');
          setBatterPhase('stance');
          setActiveBatter(teams[bt].players[gs.current.batterIdx[bt]]);
          procRef.current = false;
          rerender();
        });
      }, 400);
      return;
    }

    if (deckIdxRef.current >= deckRef.current.length) shuffleDeck();
    const card = deckRef.current[deckIdxRef.current++];
    let oc = CARD_MAP[card.key];
    if (oc === 'double' && SLUGGERS.has(batter) && Math.random() < 0.3) oc = 'homeRun';
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
    // Pitch count milestone announcements (50, 75, 100)
    if ([50, 75, 100].includes(pc)) {
      const milestoneTeam = teams[defTeam].name;
      setPitchMilestone({ count: pc, team: milestoneTeam });
      setTimeout(() => setPitchMilestone(null), 3000);
    }
    const res = calculatePlayResult(gs.current, oc, batter);
    const nar = narrateLocal(oc, batter, gs.current.bases, res.runs, gs.current.outs, Math.floor(Math.random() * 5));
    // Web gem / diving catch detection (~15% on fly outs and line outs that aren't sac flies)
    const isWebGem = ['flyOut', 'lineOut'].includes(oc) && !res.isSacFly && Math.random() < 0.15;
    if (isWebGem) {
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : nar.sub === 'rf' ? 'right fielder' : nar.sub;
      const gemTexts = [
        `WHAT A CATCH! The ${fielderName} makes a spectacular diving grab to rob ${batter}!`,
        `WEB GEM! An incredible leaping catch by the ${fielderName}! ${batter} can't believe it!`,
        `UNBELIEVABLE! The ${fielderName} lays out full extension for a jaw-dropping catch on ${batter}!`
      ];
      nar.text = pick(gemTexts);
    }
    setDispensedCard(card); setDispensing(false); setTimeout(() => setDispensing(true), 30);
    if (sndRef.current) playSoundLocal('cardFlip');

    const isNonContactPitch = ['ball', 'strike', 'foulBall'].includes(oc);
    let stolenBaseEvent = null;
    if (isNonContactPitch && gs.current.outs < 2) {
      const stealCandidates = [];
      if (gs.current.bases[0] && !gs.current.bases[1]) stealCandidates.push({ from: 0, to: 1, name: gs.current.bases[0] });
      if (gs.current.bases[1] && !gs.current.bases[2]) stealCandidates.push({ from: 1, to: 2, name: gs.current.bases[1] });
      for (const cand of stealCandidates) { if (Math.random() < 0.10) { stolenBaseEvent = { ...cand, success: Math.random() < 0.65 }; break; } }
    }

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
            const sbe = stolenBaseEvent; const startPos = [F.B1, F.B2, F.B3][sbe.from]; const endPos = [F.B1, F.B2, F.B3][sbe.to];
            animateRunners([[startPos, endPos]], bt === 0 ? '#b91c1c' : '#1e40af', 800);
            if (sbe.success) {
              if (sndRef.current) setTimeout(() => playSoundLocal('stolenBase'), 600);
              setTimeout(() => {
                gs.current.bases[sbe.to] = sbe.name; gs.current.bases[sbe.from] = null;
                if (statsRef.current[bt][sbe.name]) statsRef.current[bt][sbe.name].sb++;
                addLog(`${sbe.name} steals!`, 'play'); setAnnounceText(`${sbe.name} steals!`); rerender();
              }, 850);
            } else {
              if (sndRef.current) setTimeout(() => playSoundLocal('caughtStealing'), 600);
              setTimeout(() => {
                gs.current.bases[sbe.from] = null; gs.current.outs++;
                if (statsRef.current[bt][sbe.name]) statsRef.current[bt][sbe.name].cs++;
                addLog(`${sbe.name} caught stealing!`, 'play'); setAnnounceText(`${sbe.name} caught stealing!`); rerender();
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
        // Exit velocity display (Statcast-style)
        const ev = generateExitVelo(oc);
        if (ev) { setExitVelo(ev); setTimeout(() => setExitVelo(null), 2500); }
        if (['single', 'double', 'triple', 'homeRun', 'error', 'groundOut', 'doublePlay', 'bunt'].includes(oc) || (res.isSacFly && ['flyOut', 'lineOut'].includes(oc))) {
           const runnerOc = oc === 'bunt' ? 'single' : (res.isSacFly ? 'sacFly' : oc);
           const rps = computeRunnerPaths([...gs.current.bases], runnerOc);
           const troDur = oc === 'homeRun' ? 6500 : 2500;
           animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', troDur);
           if (rps.some(p => p[0].x === F.HP.x)) setTimeout(() => setBatterPhase('gone'), 500);
           setTimeout(() => { if (playIdRef.current === thisPlayId) { gs.current.bases = res.nextBases; rerender(); } }, troDur);
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
          // Web gem sparkle effect at catch point
          if (isWebGem && ba.target) {
            setTimeout(() => { setWebGem({ x: ba.target.x, y: ba.target.y }); setTimeout(() => setWebGem(null), 1200); }, ba.dur);
          }
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
                if (oc === 'doublePlay' && r1) { if (sndRef.current) playSoundLocal('doublePlayTurn'); animateBall(linePts(cb, F.B1, 16), 400, () => animateBall(linePts(F.B1, F.P, 16), 400, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); })); }
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
    // Capture pre-play state for clutch hit detection
    const preOuts = g.outs;
    const preRISP = g.bases[1] !== null || g.bases[2] !== null; // runners in scoring position
    let nO = g.outs + res.outsAdded, bD = false, isCalledK = false;
    if (oc === 'ball') { g.count.balls++; if (g.count.balls >= 4) bD = true; }
    else if (oc === 'strike') { g.count.strikes++; if (g.count.strikes >= 3) { nO++; bD = true; isCalledK = true; } }
    else if (oc === 'foulBall') { if (g.count.strikes < 2) g.count.strikes++; }
    else if (doesSwing(oc) || ['walk', 'hbp'].includes(oc)) bD = true;
    if (bD) { S.ab++; if (['single', 'double', 'triple', 'homeRun'].includes(oc)) { S.h++; if (oc === 'homeRun') S.hr++; g.hits[bt]++; } if (oc === 'bunt' && res.outsAdded === 0) { S.h++; g.hits[bt]++; } g.count = { balls: 0, strikes: 0 }; g.batterIdx[bt] = (g.batterIdx[bt] + 1) % 9; }
    if (res.runs > 0) {
      g.innings[bt][g.innings[bt].length - 1] += res.runs;
      // Scoring play flash — highlight scoreboard R column with floating "+X" badge
      setScoringFlash({ team: bt, runs: res.runs });
      setTimeout(() => setScoringFlash(null), 2000);
    }
    // RBI tracking: credit batter for runs on hits, sac flies, walks/HBP (bases loaded), groundouts, bunts
    // No RBI on errors or double plays (standard baseball scoring)
    if (res.runs > 0 && oc !== 'error' && oc !== 'doublePlay') S.rbi += res.runs;
    if (oc === 'error') g.errors[1 - bt]++;
    // Clutch hit detection: hit with RISP and 2 outs
    const isHit = ['single', 'double', 'triple', 'homeRun'].includes(oc) || (oc === 'bunt' && res.outsAdded === 0);
    if (isHit && preRISP && preOuts === 2) {
      S.clutchHits++;
      setClutchBadge({ batter: bat, team: bt });
      setTimeout(() => setClutchBadge(null), 3000);
    }
    // Track baserunners reaching (for no-hitter/perfect game detection)
    if (['single', 'double', 'triple', 'homeRun', 'error', 'walk', 'hbp'].includes(oc) || (oc === 'bunt' && res.outsAdded === 0) || (oc === 'ball' && g.count.balls >= 4)) g.reachedBase[bt]++;
    // Rally tracking: consecutive batters reaching base in current half-inning
    // When bD is true and outcome is ball, it was a walk (4th ball). bD+strike means strikeout (out).
    if (bD) {
      const isOut = res.outsAdded > 0 || isCalledK || ['groundOut', 'flyOut', 'lineOut', 'foulOut', 'strikeout', 'doublePlay'].includes(oc) || (oc === 'bunt' && res.outsAdded > 0);
      if (!isOut) g.rallyCount++;
      else g.rallyCount = 0;
    }
    // Track strikeouts for K display (charge to defensive team's pitcher)
    if (oc === 'strikeout' || isCalledK) {
      g.kCount[1 - bt]++;
      // Umpire punch-out animation on strikeouts
      setUmpirePhase('punchOut');
      setTimeout(() => setUmpirePhase('idle'), 1200);
    }
    // Grand slam gets triple fireworks and a special sound; regular HR gets single fireworks
    if (oc === 'homeRun') {
      triggerFireworks();
      if (res.runs === 4) {
        // Grand slam — extra fireworks bursts and walk-off fanfare
        setTimeout(() => triggerFireworks(), 600);
        setTimeout(() => triggerFireworks(), 1200);
        if (sndRef.current) setTimeout(() => playSoundLocal('walkOff'), 1000);
        setTimeout(() => setAnnounceText('🏆 GRAND SLAM! 🏆'), 1500);
      }
    }

    // Wild pitch mechanic — on ball outcomes with runners on base, ~8% chance the pitch gets away
    const hasRunners = res.nextBases[0] || res.nextBases[1] || res.nextBases[2];
    const isWildPitch = oc === 'ball' && hasRunners && Math.random() < 0.08;
    if (isWildPitch) {
      let wpRuns = 0;
      // Advance all runners one base; runner on 3rd scores
      if (res.nextBases[2]) { wpRuns++; }
      const advBases = [null, res.nextBases[0] || null, res.nextBases[1] || null];
      res.nextBases[0] = advBases[0];
      res.nextBases[1] = advBases[1];
      res.nextBases[2] = advBases[2];
      if (wpRuns > 0) {
        g.innings[bt][g.innings[bt].length - 1] += wpRuns;
        setScoringFlash({ team: bt, runs: wpRuns });
        setTimeout(() => setScoringFlash(null), 2000);
      }
      const wpText = pick([
        `Wild pitch! The ball gets past the catcher!${wpRuns > 0 ? ' Runner scores from third!' : ' Runners advance!'}`,
        `Ball in the dirt! It scoots to the backstop!${wpRuns > 0 ? ' Run scores!' : ' Runners move up!'}`,
        `Wild one! The catcher can't handle it!${wpRuns > 0 ? ' Runner trots home!' : ' Runners advance a base!'}`
      ]);
      if (sndRef.current) setTimeout(() => playSoundLocal('wildPitch'), 400);
      setTimeout(() => { addLog(wpText, 'play'); setAnnounceText(wpText); rerender(); }, 600);
    }

    const hadRunnerOn3rd = g.bases[2] !== null;
    const isClosePlay = hadRunnerOn3rd && ['single', 'error', 'groundOut', 'flyOut', 'lineOut'].includes(oc) && res.runs > 0 && Math.random() < 0.35;
    if (isClosePlay) {
      const scoringRunner = g.bases[2];
      animatePlatePlay(1800); 
      if (sndRef.current) setTimeout(() => playSoundLocal('slideHome'), 600);
      const plateText = pick([`${scoringRunner} slides home safely! SAFE at the plate!`, `Here comes the throw... ${scoringRunner} slides... SAFE!`, `Close play at the plate! ${scoringRunner} slides in safely!`]);
      setTimeout(() => { addLog(plateText, 'play'); setAnnounceText(plateText); }, 800);
    }

    addLog(nar.text, oc === 'homeRun' ? 'homer' : 'play');
    let cp; setDrawnPile(prev => { cp = [...prev, card]; return cp; });
    setPlayHistory(p => [...p, { card, outcome: oc, narration: nar.text, dir: nar.dir, sub: nar.sub, variant: nar.variant, isHR: oc === 'homeRun', batter: bat, preBases: [...g.bases], team: bt, resultData: res, pileSnapshot: cp }]);
    g.bases = res.nextBases; g.outs = nO;

    // GAME-OVER DETECTION
    const awayScore = g.innings[0].reduce((a, b) => a + b, 0);
    const homeScore = g.innings[1].reduce((a, b) => a + b, 0);
    
    if (bt === 1 && g.inning >= 9 && homeScore > awayScore) {
      g.gameOver = true;
      g.message = `${teams[1].name} win with walk-off! Final: ${homeScore}-${awayScore}`;
      triggerFireworks(); triggerFireworks();
      if (sndRef.current) setTimeout(() => playSoundLocal('walkOff'), 800);
      setTimeout(() => { setAnnounceText(`WALK-OFF! ${teams[1].name} win!`); }, isClosePlay ? 2500 : 500);
      setAutoPlay(false); procRef.current = false; setTimeout(() => setShowPostGame(true), 3500); rerender(); return;
    }
    if (bt === 0 && g.inning >= 9 && nO >= 3 && homeScore > awayScore) {
      g.gameOver = true;
      g.message = `${teams[1].name} win! Final: ${homeScore}-${awayScore}`;
      setAutoPlay(false); procRef.current = false; setTimeout(() => setShowPostGame(true), 2000); rerender(); return;
    }
    if (bt === 1 && nO >= 3 && g.inning >= 9 && awayScore > homeScore) {
      g.gameOver = true;
      g.message = `${teams[0].name} win! Final: ${awayScore}-${homeScore}`;
      setAutoPlay(false); procRef.current = false; setTimeout(() => setShowPostGame(true), 2000); rerender(); return;
    }

    // Pitching change check
    const defIdx = 1 - bt;
    const needsPitchingChange = bD && g.pitchCount[defIdx] >= 120 && nO < 3;
    if (needsPitchingChange) {
      const changeDelay = isClosePlay ? 3500 : 1500;
      setTimeout(() => {
        addLog(`⚾ Pitching change! Manager to the mound.`, 'info');
        setAnnounceText('Pitching change!');
        animatePitchingChange(defIdx, () => {
          g.pitchCount[defIdx] = 0;
          setAnnounceText('New pitcher in the game!');
          procRef.current = false; setBatterPhase('stance'); setActiveBatter(teams[bt].players[g.batterIdx[bt]]); rerender();
        });
      }, changeDelay);
    } else if (nO >= 3) setTimeout(() => transitionHalf(), isClosePlay ? 3500 : 1500);
    else {
      // "Around the horn" — after strikeout with no runners, animate ball around infield
      const isK = oc === 'strikeout' || isCalledK;
      const basesEmpty = !g.bases[0] && !g.bases[1] && !g.bases[2];
      if (isK && basesEmpty && nO < 3) {
        // Delay ready state while ball goes around the horn
        setTimeout(() => {
          animateAroundTheHorn(() => {
            procRef.current = false; setBatterPhase('stance'); setActiveBatter(teams[bt].players[g.batterIdx[bt]]); rerender();
          });
        }, 800); // brief pause after the K before starting
      } else {
        procRef.current = false; setBatterPhase('stance'); setActiveBatter(teams[bt].players[g.batterIdx[bt]]); rerender();
      }
    }
  }

  function transitionHalf() {
    const g = gs.current;
    const summary = { label: `${g.half === 0 ? '▲ Top' : '▼ Bottom'} ${g.inning}`, awayScore: g.innings[0].reduce((a, b) => a + b, 0), homeScore: g.innings[1].reduce((a, b) => a + b, 0), awayName: teams[0].name, homeName: teams[1].name, runs: g.innings[g.half][g.innings[g.half].length - 1] || 0 };
    setInningSummary(summary);
    // 7th inning stretch: triggers after top of 7th (half===0, inning===7)
    const is7thStretch = g.half === 0 && g.inning === 7;
    setTimeout(() => {
      setInningSummary(null);
      const doTransition = () => {
        if (g.half === 1) { g.inning++; g.half = 0; g.innings[0].push(0); g.innings[1].push(0); } else g.half = 1;
        g.outs = 0; g.bases = [null, null, null]; g.count = { balls: 0, strikes: 0 }; g.rallyCount = 0;
        setDrawnPile([]); setOutcome(null); setReplayIdx(-1); setHalfStartIdx(playHistory.length); rerender();
        doShuffleAnimation(() => { setActiveBatter(teams[g.half].players[g.batterIdx[g.half]]); shuffleDeck(); procRef.current = false; rerender(); });
      };
      if (is7thStretch) {
        setSeventhStretch(true);
        if (sndRef.current) playSoundLocal('seventhStretch');
        setTimeout(() => { setSeventhStretch(false); doTransition(); }, 4000);
      } else {
        doTransition();
      }
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
      if (p.outcome === 'doublePlay' && sndRef.current) setTimeout(() => playSoundLocal('doublePlayTurn'), ba.dur + 350);
      if (p.isHR) triggerFireworks();
      // Umpire punch-out on strikeout replay
      if (p.outcome === 'strikeout') { setUmpirePhase('punchOut'); setTimeout(() => setUmpirePhase('idle'), 1200); }
    }, 1100);
    setTimeout(() => { setPitchPhase('idle'); setBatterPhase('stance'); }, 2500);
  }

  const baValue = (name, t) => { const s = statsRef.current[t][name]; return (!s || s.ab === 0) ? '.000' : (s.h / s.ab).toFixed(3).replace(/^0/, ''); };
  const displayBases = useMemo(() => replayIdx !== -1 && playHistory[replayIdx] ? playHistory[replayIdx].preBases : gs.current.bases, [replayIdx, playHistory, renderTick]);
  const batterSide = useMemo(() => { const raw = PLAYER_HANDS[activeBatter] || 'R'; return raw === 'S' ? 'L' : raw; }, [activeBatter]);

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10 font-sans text-gray-900">
        <h1 className="text-4xl font-black text-blue-900 mb-2 tracking-tight uppercase">⚾ Card Baseball v27</h1>
        <div className="flex gap-10 flex-wrap justify-center max-w-4xl mt-12 text-gray-900">
          {[0, 1].map(t => (
            <div key={t} className="bg-white p-6 rounded-2xl shadow-xl w-80 border-t-8 border-blue-900 text-gray-900">
              <h2 className="font-bold text-gray-400 mb-4 tracking-widest uppercase text-xs">{t === 0 ? 'Visiting' : 'Home'} Team</h2>
              <select className="w-full p-3 border rounded-lg mb-4 bg-gray-50 font-bold text-blue-900" onChange={e => { const nt = [...teams]; nt[t] = { name: e.target.value, players: [...PRESETS[e.target.value]] }; setTeams(nt); }} value={teams[t].name}>{Object.keys(PRESETS).map(n => <option key={n} value={n}>{n}</option>)}</select>
              <div className="space-y-1 text-gray-900">{teams[t].players.map((p, i) => <div key={i} className="text-xs text-gray-600 flex justify-between p-1 bg-gray-50 rounded"><span>{i + 1}. {p}</span> {SLUGGERS.has(p) && <span title="Slugger">🔥</span>}</div>)}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-8 flex-wrap justify-center">
          <label className="flex items-center gap-3 cursor-pointer select-none bg-white px-6 py-3 rounded-xl shadow-md border border-gray-200 hover:border-blue-300 transition-colors">
            <input type="checkbox" checked={isPlayoff} onChange={e => setIsPlayoff(e.target.checked)} className="w-5 h-5 accent-blue-700 cursor-pointer" />
            <span className="font-bold text-blue-900 text-sm uppercase tracking-wide">Playoff Game</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none bg-white px-6 py-3 rounded-xl shadow-md border border-gray-200 hover:border-indigo-400 transition-colors">
            <input type="checkbox" checked={isNightGame} onChange={e => setIsNightGame(e.target.checked)} className="w-5 h-5 accent-indigo-700 cursor-pointer" />
            <span className="font-bold text-indigo-900 text-sm uppercase tracking-wide">Night Game</span>
          </label>
        </div>
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <button onClick={startGame} className="px-16 py-5 bg-green-600 hover:bg-green-700 text-white font-black text-2xl rounded-full shadow-2xl active:scale-95 transition-all cursor-pointer">START GAME</button>
          <button onClick={runSeason} className="px-10 py-5 bg-blue-800 hover:bg-blue-900 text-white font-black text-lg rounded-full shadow-2xl active:scale-95 transition-all cursor-pointer border-2 border-blue-600">📊 QUICK SEASON</button>
        </div>
        <p className="mt-3 text-xs text-gray-400 italic max-w-md text-center">Quick Season simulates a full round-robin season across all {Object.keys(PRESETS).length} teams with standings and stat leaders.</p>
      </div>
    );
  }

  if (phase === 'season' && seasonResults) {
    const { standings, hrLeaders, avgLeaders, rbiLeaders, gamesPerMatchup } = seasonResults;
    const totalGames = standings[0] ? standings[0].w + standings[0].l : 0;
    return (
      <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-blue-900 tracking-tight uppercase">📊 Season Results</h1>
            <p className="text-sm text-gray-500 mt-1">{Object.keys(PRESETS).length} teams · {totalGames} games each · {gamesPerMatchup} per matchup</p>
          </div>
          <div className="flex justify-center gap-2 mb-6">
            {['standings', 'hr', 'avg', 'rbi'].map(tab => (
              <button key={tab} onClick={() => setSeasonTab(tab)} className={`px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors cursor-pointer ${seasonTab === tab ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
                {tab === 'standings' ? '🏆 Standings' : tab === 'hr' ? '💣 HR Leaders' : tab === 'avg' ? '🎯 AVG Leaders' : '📈 RBI Leaders'}
              </button>
            ))}
          </div>
          {seasonTab === 'standings' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <table className="w-full text-left">
                <thead><tr className="bg-blue-900 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-3 w-8">#</th><th className="p-3">Team</th><th className="p-3 text-center">W</th><th className="p-3 text-center">L</th><th className="p-3 text-center">PCT</th><th className="p-3 text-center">RS</th><th className="p-3 text-center">RA</th><th className="p-3 text-center">DIFF</th>
                </tr></thead>
                <tbody>{standings.map((t, i) => {
                  const diff = t.rs - t.ra;
                  return (
                    <tr key={t.name} className={`border-b border-gray-100 ${i === 0 ? 'bg-yellow-50' : i < 3 ? 'bg-green-50/40' : 'hover:bg-gray-50'}`}>
                      <td className="p-3 font-black text-gray-400 text-sm">{i + 1}</td>
                      <td className="p-3 font-bold text-blue-900">{i === 0 && '🏆 '}{t.name}</td>
                      <td className="p-3 text-center font-bold text-green-700">{t.w}</td>
                      <td className="p-3 text-center font-bold text-red-600">{t.l}</td>
                      <td className="p-3 text-center font-black">{t.pct.toFixed(3).replace(/^0/, '')}</td>
                      <td className="p-3 text-center text-gray-700">{t.rs}</td>
                      <td className="p-3 text-center text-gray-700">{t.ra}</td>
                      <td className={`p-3 text-center font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'}`}>{diff > 0 ? '+' : ''}{diff}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
          {seasonTab === 'hr' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <table className="w-full text-left">
                <thead><tr className="bg-orange-800 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-3 w-8">#</th><th className="p-3">Player</th><th className="p-3">Team</th><th className="p-3 text-center font-black">HR</th><th className="p-3 text-center">AB</th><th className="p-3 text-center">H</th><th className="p-3 text-center">AVG</th>
                </tr></thead>
                <tbody>{hrLeaders.map((p, i) => (
                  <tr key={`${p.name}-${p.team}`} className={`border-b border-gray-100 ${i === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                    <td className="p-3 font-black text-gray-400">{i + 1}</td>
                    <td className="p-3 font-bold text-gray-900">{i === 0 && '👑 '}{p.name}</td>
                    <td className="p-3 text-gray-500 text-sm">{p.team}</td>
                    <td className="p-3 text-center font-black text-orange-700 text-lg">{p.hr}</td>
                    <td className="p-3 text-center text-gray-600">{p.ab}</td>
                    <td className="p-3 text-center text-gray-600">{p.h}</td>
                    <td className="p-3 text-center font-mono">{p.avg.toFixed(3).replace(/^0/, '')}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {seasonTab === 'avg' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <table className="w-full text-left">
                <thead><tr className="bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-3 w-8">#</th><th className="p-3">Player</th><th className="p-3">Team</th><th className="p-3 text-center font-black">AVG</th><th className="p-3 text-center">AB</th><th className="p-3 text-center">H</th><th className="p-3 text-center">HR</th>
                </tr></thead>
                <tbody>{avgLeaders.map((p, i) => (
                  <tr key={`${p.name}-${p.team}`} className={`border-b border-gray-100 ${i === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                    <td className="p-3 font-black text-gray-400">{i + 1}</td>
                    <td className="p-3 font-bold text-gray-900">{i === 0 && '👑 '}{p.name}</td>
                    <td className="p-3 text-gray-500 text-sm">{p.team}</td>
                    <td className="p-3 text-center font-black text-emerald-700 text-lg">{p.avg.toFixed(3).replace(/^0/, '')}</td>
                    <td className="p-3 text-center text-gray-600">{p.ab}</td>
                    <td className="p-3 text-center text-gray-600">{p.h}</td>
                    <td className="p-3 text-center text-gray-600">{p.hr}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {seasonTab === 'rbi' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <table className="w-full text-left">
                <thead><tr className="bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-3 w-8">#</th><th className="p-3">Player</th><th className="p-3">Team</th><th className="p-3 text-center font-black">RBI</th><th className="p-3 text-center">HR</th><th className="p-3 text-center">H</th><th className="p-3 text-center">AVG</th>
                </tr></thead>
                <tbody>{rbiLeaders.map((p, i) => (
                  <tr key={`${p.name}-${p.team}`} className={`border-b border-gray-100 ${i === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                    <td className="p-3 font-black text-gray-400">{i + 1}</td>
                    <td className="p-3 font-bold text-gray-900">{i === 0 && '👑 '}{p.name}</td>
                    <td className="p-3 text-gray-500 text-sm">{p.team}</td>
                    <td className="p-3 text-center font-black text-indigo-700 text-lg">{p.rbi}</td>
                    <td className="p-3 text-center text-gray-600">{p.hr}</td>
                    <td className="p-3 text-center text-gray-600">{p.h}</td>
                    <td className="p-3 text-center font-mono">{p.avg.toFixed(3).replace(/^0/, '')}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => setPhase('setup')} className="px-8 py-3 bg-white text-blue-900 font-bold rounded-full border-2 border-blue-900 hover:bg-blue-50 shadow-md cursor-pointer">← Back to Setup</button>
            <button onClick={runSeason} className="px-8 py-3 bg-blue-800 text-white font-bold rounded-full hover:bg-blue-900 shadow-md cursor-pointer">🔄 Simulate Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-2 font-sans select-none overflow-x-hidden text-gray-900 text-[10px]">
      <style>{`@keyframes scoreFlash { 0% { background: rgba(34,197,94,0.3); } 100% { background: transparent; } } @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-16px); } }`}</style>
      <div className="max-w-[750px] mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-3 mb-2 overflow-x-auto text-gray-900">
         <table className="w-full text-center border-collapse">
           <thead><tr className="border-b-2 border-gray-100 text-gray-900"><th className="text-left py-1 text-gray-400 font-bold uppercase text-[10px]">Team</th>{Array.from({length: Math.max(9, gs.current.innings[0].length)}, (_, i) => <th key={i} className="w-6 text-[10px] text-gray-400">{i+1}</th>)}<th className="w-10 font-black text-red-600 text-lg border-l-2 ml-2">R</th><th className="w-10 font-bold text-gray-700 text-lg">H</th><th className="w-10 font-bold text-gray-700 text-lg">E</th></tr></thead>
           <tbody>{[0, 1].map(t => ( <tr key={t} className={gs.current.half === t ? 'bg-blue-50/50' : ''}><td className={`text-left font-bold truncate max-w-[120px] ${t === 1 ? 'text-red-600' : 'text-blue-900'}`}>{t === gs.current.half && '▸'} {teams[t].name}</td>{Array.from({length: Math.max(9, gs.current.innings[0].length)}, (_, i) => {
             const showScore = (t === 0) ? (i < gs.current.inning) : (i < gs.current.inning - 1 || (i === gs.current.inning - 1 && gs.current.half === 1));
             return (<td key={i} className="text-gray-600 font-mono">{showScore ? (gs.current.innings[t][i] ?? 0) : ''}</td>);
           })}<td className={`font-black text-xl border-l-2 relative ${scoringFlash && scoringFlash.team === t ? 'text-green-600' : 'text-red-600'}`} style={scoringFlash && scoringFlash.team === t ? { animation: 'scoreFlash 2s ease-out', background: 'rgba(34,197,94,0.15)' } : {}}>{gs.current.innings[t].reduce((a,b)=>a+b,0)}{scoringFlash && scoringFlash.team === t && <span className="absolute -top-2 -right-1 text-[10px] font-black text-green-600 animate-bounce" style={{ animation: 'floatUp 2s ease-out forwards' }}>+{scoringFlash.runs}</span>}</td><td className="font-bold text-gray-800 text-lg">{gs.current.hits[t]}</td><td className="font-bold text-gray-800 text-lg">{gs.current.errors[t]}</td></tr> ))}</tbody>
         </table>
      </div>
      <div className="max-w-[750px] mx-auto flex items-center justify-center gap-6 mb-2 text-blue-900 font-bold uppercase tracking-tight">
        <span>{gs.current.half === 0 ? '▲' : '▼'} Inning {gs.current.inning}</span>
        <span className="flex gap-1 text-lg"><span className="text-blue-500">{'●'.repeat(Math.min(gs.current.count.balls, 3))}{'○'.repeat(Math.max(0, 3-gs.current.count.balls))}</span><span className="text-red-500">{'●'.repeat(Math.min(gs.current.count.strikes, 2))}{'○'.repeat(Math.max(0, 2-gs.current.count.strikes))}</span></span>
        <span className="text-red-700">{'●'.repeat(Math.min(gs.current.outs, 3))} OUT</span>
        <span className={`text-gray-500 ${gs.current.pitchCount[1 - gs.current.half] > 100 ? 'text-orange-600 font-black' : ''}`} title="Pitch count">{gs.current.pitchCount[1 - gs.current.half]}P</span>
        {gs.current.rallyCount >= 3 && !gs.current.gameOver && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${gs.current.half === 0 ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`} title={`${gs.current.rallyCount} consecutive batters reached base`}>
            RALLY! {gs.current.rallyCount}
          </span>
        )}
        {/* Count-based tension badges */}
        {!gs.current.gameOver && gs.current.count.balls === 3 && gs.current.count.strikes === 2 && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-purple-600 text-white" title="Full count — 3 balls, 2 strikes">
            FULL COUNT
          </span>
        )}
        {!gs.current.gameOver && gs.current.count.strikes === 2 && gs.current.count.balls < 3 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-amber-500 text-white" title="Two strikes">
            2 STRIKES
          </span>
        )}
        {/* Pitcher's duel badge — both teams ≤2 runs through 6+ innings */}
        {!gs.current.gameOver && gs.current.inning >= 6 && (() => {
          const awayRuns = gs.current.innings[0].reduce((a, b) => a + b, 0);
          const homeRuns = gs.current.innings[1].reduce((a, b) => a + b, 0);
          return awayRuns <= 2 && homeRuns <= 2;
        })() && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-teal-600 text-white" title="Both teams have 2 or fewer runs through 6+ innings">
            PITCHER'S DUEL
          </span>
        )}
        {/* Pitch count milestone badge */}
        {pitchMilestone && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${pitchMilestone.count >= 100 ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' : pitchMilestone.count >= 75 ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-gray-100 text-gray-600 border-gray-300'}`} title={`${pitchMilestone.team} pitcher has thrown ${pitchMilestone.count} pitches`}>
            {pitchMilestone.count} PITCHES
          </span>
        )}
        {/* Quality start badge — defensive pitcher has gone 6+ innings with ≤3 runs allowed */}
        {!gs.current.gameOver && (() => {
          // Defensive pitcher's completed innings: in top (half=0) home pitcher has done inning-1;
          // in bottom (half=1) away pitcher has done inning-1. So it's always inning-1.
          const ip = gs.current.inning - 1;
          // Runs allowed by the defensive pitcher = runs scored by the batting team
          const ra = gs.current.innings[gs.current.half].reduce((a, b) => a + b, 0);
          return ip >= 6 && ra <= 3;
        })() && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-emerald-100 text-emerald-700 border border-emerald-300" title="Quality Start: 6+ innings pitched, 3 or fewer runs allowed">
            QUALITY START
          </span>
        )}
        {/* Clutch hit badge */}
        {clutchBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-orange-500 text-white border border-orange-600" title={`${clutchBadge.batter} with a clutch hit!`}>
            CLUTCH! 🔥
          </span>
        )}
      </div>

      {(() => {
        // No-hitter / perfect game alert: check if the defensive pitcher has allowed no hits through 5+ innings
        const defTeam = 1 - gs.current.half; // team pitching (0=away pitching when home bats, 1=home pitching when away bats)
        const battingTeam = gs.current.half;
        // Completed innings by the batting team against this pitcher
        const completedInnings = battingTeam === 0
          ? (gs.current.half === 0 ? gs.current.inning - 1 : gs.current.inning)
          : (gs.current.half === 1 ? gs.current.inning - 1 : gs.current.inning - 1);
        // Simpler: away team has batted through (inning-1) complete innings when it's top of current inning, or through full inning when bottom
        // Home team has batted through (inning-1) complete innings when bottom, or (inning-1) when top
        const awayCompletedInnings = gs.current.half === 0 ? gs.current.inning - 1 : gs.current.inning;
        const homeCompletedInnings = gs.current.half === 1 ? gs.current.inning - 1 : gs.current.inning - 1;
        // For each pitcher, check if batting team they face has 0 hits through 5+ completed innings
        const alerts = [];
        // Home pitcher (defTeam=1) faces away batters (team 0)
        if (gs.current.hits[0] === 0 && awayCompletedInnings >= 5 && !gs.current.gameOver) {
          const isPerfect = gs.current.reachedBase[0] === 0;
          alerts.push({ team: teams[1].name, type: isPerfect ? 'PERFECT GAME' : 'NO-HITTER', innings: awayCompletedInnings });
        }
        // Away pitcher (defTeam=0) faces home batters (team 1)
        if (gs.current.hits[1] === 0 && homeCompletedInnings >= 5 && !gs.current.gameOver) {
          const isPerfect = gs.current.reachedBase[1] === 0;
          alerts.push({ team: teams[0].name, type: isPerfect ? 'PERFECT GAME' : 'NO-HITTER', innings: homeCompletedInnings });
        }
        if (alerts.length === 0) return null;
        return (
          <div className="max-w-[750px] mx-auto flex justify-center gap-3 mb-1">
            {alerts.map((a, i) => (
              <div key={i} className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider animate-pulse shadow-md ${a.type === 'PERFECT GAME' ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-600' : 'bg-red-600 text-white border-2 border-red-800'}`}>
                <span>🚨</span>
                <span>{a.type} IN PROGRESS</span>
                <span className="opacity-70 font-bold normal-case">— {a.team} through {a.innings}</span>
              </div>
            ))}
          </div>
        );
      })()}

      <BaseballField bases={displayBases} defColor={gs.current.half === 0 ? '#1e40af' : '#b91c1c'} offColor={gs.current.half === 0 ? '#b91c1c' : '#1e40af'} ballPos={ballPos} ballTrail={ballTrail} pitchPhase={pitchPhase} batterPhase={batterPhase} showFW={showFW} fwKey={fwKey} movingRunners={movingRunners} movingFielder={movingFielder} batterSide={batterSide} platePlay={platePlay} isPlayoff={isPlayoff} pitchingChange={pitchingChange} homeColor={'#b91c1c'} awayColor={'#1e40af'} homeKs={gs.current.kCount[1]} awayKs={gs.current.kCount[0]} isNightGame={isNightGame} webGem={webGem} umpirePhase={umpirePhase} />

      <div className="max-w-[750px] mx-auto flex flex-col items-start mt-2 px-2 text-gray-900">
        <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-sm text-[9px] font-black uppercase">At Bat</span>
            <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-sm text-[8px] font-bold" title={`#${gs.current.batterIdx[gs.current.half] + 1} in the lineup`}>#{gs.current.batterIdx[gs.current.half] + 1}</span>
            <span className="font-bold text-slate-800 text-[12px] tracking-tight">{activeBatter}</span>
            {(() => { const hand = PLAYER_HANDS[activeBatter] || 'R'; const handLabel = hand === 'S' ? 'Switch' : hand === 'L' ? 'Left' : 'Right'; const handColor = hand === 'L' ? 'bg-sky-100 text-sky-700 border-sky-300' : hand === 'S' ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-gray-100 text-gray-600 border-gray-300'; return <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${handColor}`} title={`Bats ${handLabel}`}>{hand === 'S' ? 'S' : hand}</span>; })()}
            {(() => { const s = statsRef.current[gs.current.half]?.[activeBatter]; return s && s.h >= 2 ? <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase animate-pulse" title={`${s.h}-for-${s.ab} today`}>HOT</span> : s && s.h >= 1 ? <span className="bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-[8px] font-bold" title={`${s.h}-for-${s.ab} today`}>{s.h}-{s.ab}</span> : null; })()}
        </div>
        {(() => {
          const bt = gs.current.half;
          const curIdx = gs.current.batterIdx[bt];
          const onDeck = teams[bt].players[(curIdx + 1) % 9];
          const inTheHole = teams[bt].players[(curIdx + 2) % 9];
          return (
            <div className="flex items-center gap-4 mb-1">
              <span className="flex items-center gap-1"><span className="bg-gray-400 text-white px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase">On Deck</span><span className="text-gray-500 text-[11px]">{onDeck}</span>{SLUGGERS.has(onDeck) && <span title="Slugger" className="text-[8px]">🔥</span>}</span>
              <span className="flex items-center gap-1"><span className="bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase">In the Hole</span><span className="text-gray-400 text-[11px]">{inTheHole}</span>{SLUGGERS.has(inTheHole) && <span title="Slugger" className="text-[8px]">🔥</span>}</span>
            </div>
          );
        })()}
        {gs.current.gameOver && <div className="w-full text-center py-1 bg-red-50 rounded-lg border border-red-100 shadow-sm flex items-center justify-center gap-3">
          <span className="text-red-600 font-black text-[13px] animate-pulse uppercase tracking-widest">GAME OVER — {gs.current.message}</span>
          <button onClick={() => setShowPostGame(true)} className="px-3 py-0.5 bg-blue-800 text-white text-[10px] font-bold rounded cursor-pointer hover:bg-blue-900 uppercase tracking-wide">Box Score</button>
        </div>}
      </div>

      <div className="max-w-[750px] mx-auto my-2 text-center min-h-[40px]">
        <div className="bg-blue-900 text-white inline-block px-6 py-2 rounded-full italic font-bold shadow-md text-sm">
          {announceText || "Ready for pitch..."}
        </div>
        {exitVelo && (
          <div className="mt-1" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm border ${exitVelo >= 100 ? 'bg-red-100 text-red-800 border-red-300' : exitVelo >= 90 ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
              <span className="uppercase opacity-60">Exit Velo</span>
              <span className="text-[12px]">{exitVelo}</span>
              <span className="uppercase opacity-60">mph</span>
            </span>
          </div>
        )}
      </div>

      {inningSummary && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center pointer-events-auto border-t-4 border-blue-900" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <div className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-1 text-gray-900">End of</div>
            <div className="text-2xl font-black text-blue-900 mb-3">{inningSummary.label}</div>
            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mb-2 text-gray-900">
              <div className="text-left text-gray-900">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Away</div>
                <div className="font-bold text-blue-900 text-sm truncate max-w-[100px]">{inningSummary.awayName}</div>
              </div>
              <div className="text-3xl font-black text-gray-800 tracking-wider text-gray-900">{inningSummary.awayScore} – {inningSummary.homeScore}</div>
              <div className="text-right text-gray-900">
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

      {seventhStretch && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-2xl shadow-2xl p-8 w-96 text-center pointer-events-auto border-4 border-yellow-400" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div className="text-5xl mb-3" style={{ animation: 'stretchBounce 1s ease-in-out infinite' }}>⚾</div>
            <style>{`@keyframes stretchBounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.1); } }`}</style>
            <div className="text-yellow-400 font-black text-2xl tracking-tight mb-1 uppercase">7th Inning Stretch!</div>
            <div className="text-blue-200 text-sm italic font-bold mb-3">"Take me out to the ball game..."</div>
            <div className="flex justify-center gap-1 text-2xl opacity-80">🎵🎶🎵</div>
          </div>
        </div>
      )}

      <div className="max-w-[750px] mx-auto"><MiniCardArea drawnPile={drawnPile} dispensedCard={dispensedCard} dispensing={dispensing} onDraw={doDrawCard} canDraw={!procRef.current && !gs.current.gameOver && !autoPlay} autoPlay={autoPlay} gameOver={gs.current.gameOver} shuffling={shuffling} shuffleCards={shuffleCards} /></div>
      <div className="max-w-[750px] mx-auto flex justify-center items-center gap-4 mt-6">
        <button onClick={() => setSoundOn(!soundOn)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full border shadow-sm cursor-pointer text-gray-900">{soundOn ? '🔊' : '🔇'}</button>
        <div className="flex bg-white rounded-lg border shadow-sm overflow-hidden h-10 text-gray-900">
          <button disabled={playHistory.length <= halfStartIdx || procRef.current} onClick={() => { const current = (replayIdx === -1 ? playHistory.length : replayIdx); const prev = current > halfStartIdx ? (replayIdx === -1 ? playHistory.length - 1 : replayIdx - 1) : halfStartIdx; replayPlay(prev); }} className="px-4 hover:bg-gray-50 border-r disabled:opacity-20 cursor-pointer">◄</button>
          <div className="px-4 flex items-center font-bold text-gray-500 tracking-tighter uppercase text-gray-900">{replayIdx !== -1 ? `Play ${replayIdx + 1}` : 'REPLAY'}</div>
          <button disabled={replayIdx === -1 || replayIdx >= playHistory.length - 1 || procRef.current} onClick={() => replayPlay(replayIdx + 1)} className="px-4 hover:bg-gray-50 disabled:opacity-20 cursor-pointer text-gray-900">►</button>
        </div>
        <button onClick={() => setAutoPlay(!autoPlay)} className={`px-6 py-2 h-10 rounded-lg font-bold shadow-sm transition-colors cursor-pointer ${autoPlay ? 'bg-green-600 text-white' : 'bg-white text-gray-900'}`}>{autoPlay ? '⏸ PAUSE' : '▶ AUTO'}</button>
        <button onClick={() => setShowCardLibrary(true)} className="h-10 px-4 bg-white rounded-lg border shadow-sm text-blue-600 font-bold hover:bg-blue-50 cursor-pointer uppercase text-gray-900 text-gray-900">🃏 Cards</button>
        <button onClick={() => setConfirmReset(true)} className="h-10 px-4 bg-white rounded-lg border shadow-sm text-gray-400 font-bold hover:text-red-500 cursor-pointer uppercase text-gray-900 text-gray-900">Reset</button>
      </div>
      {confirmReset && ( <div className="max-w-[750px] mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-4 text-xs font-bold text-red-700 text-gray-900"><span>RESTART GAME?</span><button onClick={startGame} className="px-6 py-1 bg-red-600 text-white rounded font-black cursor-pointer shadow-sm hover:bg-red-700">YES</button><button onClick={() => setConfirmReset(false)} className="px-6 py-1 bg-white border border-red-200 rounded cursor-pointer font-bold">NO</button></div> )}

      {showCardLibrary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 text-gray-900" onClick={() => setShowCardLibrary(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col text-gray-900 text-gray-900" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-blue-900 text-white rounded-t-2xl">
              <h2 className="font-black text-lg tracking-tight text-white">🃏 Card Library — Outcomes</h2>
              <button onClick={() => setShowCardLibrary(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center cursor-pointer">✕</button>
            </div>
            <div className="overflow-y-auto p-4 text-gray-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-gray-900">
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
                          return ( <div key={key} className="flex items-center justify-between bg-white rounded px-2 py-1 shadow-sm border border-gray-100 text-gray-900"><span className={`font-bold text-xs ${suitColor}`}>{val}{suit}</span>{outcomeBadge(oc)}</div> );
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

      {showPostGame && gs.current.gameOver && (() => {
        // Compute Player of the Game: highest (hits + hr*2 + rbi) across both teams
        let potg = null, potgScore = -1, potgTeam = 0;
        for (let t = 0; t < 2; t++) {
          for (const p of teams[t].players) {
            const s = statsRef.current[t][p] || { ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, cs: 0 };
            const score = s.h + s.hr * 2 + s.rbi;
            if (score > potgScore || (score === potgScore && s.h > (potg?.h || 0))) { potg = { name: p, ...s }; potgScore = score; potgTeam = t; }
          }
        }
        const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
        const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
        const winner = homeTotal > awayTotal ? 1 : 0;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" onClick={() => setShowPostGame(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()} style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="bg-blue-900 text-white p-4 rounded-t-2xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-[4px] text-blue-300 mb-1">Final Score</div>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-right"><div className="text-sm font-bold text-blue-200 uppercase">{teams[0].name}</div><div className="text-4xl font-black">{awayTotal}</div></div>
                  <div className="text-2xl font-black text-blue-400">—</div>
                  <div className="text-left"><div className="text-sm font-bold text-blue-200 uppercase">{teams[1].name}</div><div className="text-4xl font-black">{homeTotal}</div></div>
                </div>
                {potg && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-4 py-1">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-yellow-300 text-[11px] font-bold uppercase tracking-wide">Player of the Game</span>
                    <span className="text-white font-black text-sm">{potg.name}</span>
                    <span className="text-yellow-300 text-[10px]">({potg.h}-{potg.ab}, {potg.hr} HR, {potg.rbi} RBI)</span>
                  </div>
                )}
              </div>
              <div className="overflow-y-auto p-4">
                {[0, 1].map(t => (
                  <div key={t} className="mb-4">
                    <div className={`text-xs font-black uppercase tracking-widest mb-2 ${t === winner ? 'text-green-700' : 'text-gray-500'}`}>
                      {t === winner ? '🏆 ' : ''}{teams[t].name}{t === winner ? ' (W)' : ' (L)'}
                    </div>
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead><tr className="border-b-2 border-gray-200 text-gray-400 uppercase font-bold text-[9px]">
                        <th className="py-1 pl-2">Player</th><th className="py-1 text-center w-8">AB</th><th className="py-1 text-center w-8">H</th><th className="py-1 text-center w-8">HR</th><th className="py-1 text-center w-8">RBI</th><th className="py-1 text-center w-8">SB</th><th className="py-1 text-center w-8" title="Clutch Hits (RISP, 2 outs)">CLT</th><th className="py-1 text-right pr-2 w-14">AVG</th>
                      </tr></thead>
                      <tbody>{teams[t].players.map((p, i) => {
                        const s = statsRef.current[t][p] || { ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, cs: 0, clutchHits: 0 };
                        const avg = s.ab > 0 ? (s.h / s.ab).toFixed(3).replace(/^0/, '') : '.000';
                        const isPotg = potg && potg.name === p && potgTeam === t;
                        return (
                          <tr key={i} className={`border-b border-gray-50 ${isPotg ? 'bg-yellow-50 font-bold' : 'hover:bg-gray-50'}`}>
                            <td className="py-1 pl-2 text-gray-800">{isPotg && '⭐ '}{p}</td>
                            <td className="py-1 text-center text-gray-600">{s.ab}</td>
                            <td className="py-1 text-center text-gray-800 font-bold">{s.h}</td>
                            <td className="py-1 text-center text-orange-700 font-bold">{s.hr > 0 ? s.hr : '-'}</td>
                            <td className="py-1 text-center text-blue-700 font-bold">{s.rbi > 0 ? s.rbi : '-'}</td>
                            <td className="py-1 text-center text-gray-600">{s.sb > 0 ? s.sb : '-'}</td>
                            <td className="py-1 text-center text-orange-500 font-bold">{(s.clutchHits || 0) > 0 ? s.clutchHits : '-'}</td>
                            <td className="py-1 text-right pr-2 font-mono text-gray-700">{avg}</td>
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-3 p-3 border-t bg-gray-50 rounded-b-2xl">
                <button onClick={() => setShowPostGame(false)} className="px-6 py-2 bg-white text-gray-700 font-bold rounded-lg border shadow-sm hover:bg-gray-100 cursor-pointer text-sm">Close</button>
                <button onClick={() => { setShowPostGame(false); setPhase('setup'); }} className="px-6 py-2 bg-blue-800 text-white font-bold rounded-lg shadow-sm hover:bg-blue-900 cursor-pointer text-sm">New Game</button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="max-w-[750px] mx-auto mt-6 flex gap-4 h-52 overflow-hidden items-stretch text-gray-900 text-gray-900">
        <div ref={logRef} className="flex-1 bg-white p-3 rounded-xl shadow-inner overflow-y-auto text-gray-900"><h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-gray-900">Play-by-Play</h3>{log.slice().reverse().map((l, i) => <div key={i} className={`text-xs mb-1 ${l.type === 'homer' ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>{l.text}</div>)}</div>
        <div className="w-80 bg-white p-3 rounded-xl shadow-inner overflow-hidden flex flex-col text-gray-900 text-gray-900">
          <div className="flex justify-between items-center mb-2 text-gray-900">
             <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-gray-900">Live Stats ({teams[gs.current.half].name})</h3>
             <button onClick={()=>setShowStats(!showStats)} className="text-[10px] text-blue-600 font-bold cursor-pointer text-gray-900">{showStats ? 'Hide' : 'Show'}</button>
          </div>
          {showStats ? (
            <div className="overflow-y-auto flex-1 text-gray-900"><table className="w-full text-left border-collapse text-gray-900 text-gray-900">
                <thead className="sticky top-0 bg-white text-gray-900"><tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[9px] text-gray-900 text-gray-900"><th className="py-1">Player</th><th className="py-1 text-center w-8 text-gray-900">AB</th><th className="py-1 text-center w-8 text-gray-900">H</th><th className="py-1 text-center w-8 text-gray-900">HR</th><th className="py-1 text-center w-8 text-blue-600">RBI</th><th className="py-1 text-center w-8 text-orange-600">SB</th><th className="py-1 text-right w-12 text-gray-900">AVG</th></tr></thead>
                <tbody>{teams[gs.current.half].players.map((p, i) => { const s = statsRef.current[gs.current.half][p] || { ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, cs: 0 }; const isCurrent = gs.current.batterIdx[gs.current.half] === i; return (<tr key={i} className={`${isCurrent ? 'bg-blue-50 font-bold text-blue-900' : 'text-gray-700'} border-b border-gray-50/50 hover:bg-stone-50 text-gray-900`}><td className="py-1.5 truncate max-w-[100px] text-gray-900">{p}</td><td className="py-1.5 text-center text-gray-900">{s.ab}</td><td className="py-1.5 text-center text-gray-900">{s.h}</td><td className="py-1.5 text-center text-gray-900">{s.hr}</td><td className="py-1.5 text-center text-blue-700">{s.rbi || 0}</td><td className="py-1.5 text-center text-gray-900">{s.sb > 0 || s.cs > 0 ? `${s.sb}/${s.sb+s.cs}` : '-'}</td><td className="py-1.5 text-right font-mono text-gray-900">{baValue(p, gs.current.half)}</td></tr>);})}</tbody></table></div>
          ) : ( <div className="flex-1 flex items-center justify-center text-gray-300 italic text-center text-[9px] text-gray-900 text-gray-900">Click 'Show' to see live batting stats</div> )}
        </div>
      </div>
    </div>
  );
}

export default function App() { return ( <ErrorBoundary><BaseballCardGameInner /></ErrorBoundary> ); }