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

// Defensive infield shift (Backlog #66) — pull-hitter-aware positioning for 2B and SS.
// Shift is applied only for known sluggers (the batters opposing managers most often
// shift against). Lefty pull: 2B slides into shallow right field, SS shades to the
// right of 2B base. Righty extreme-pull: SS moves closer to 3B, 2B shifts toward
// where SS normally plays. Purely cosmetic — gameplay outcomes are unaffected.
const SHIFT_POS = {
  L: { SS: { x: 322, y: 250 }, F2B: { x: 398, y: 228 } },
  R: { SS: { x: 230, y: 250 }, F2B: { x: 298, y: 250 } },
};
function getInfieldShift(batterName, batterSide) {
  if (!batterName || !SLUGGERS.has(batterName)) return null;
  if (batterSide === 'L') return 'L';
  if (batterSide === 'R') return 'R';
  return null;
}

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

// Pitch speed ranges (mph) by pitch type — realistic MLB velocity distributions
const PITCH_SPEED_RANGES = {
  fastball: [92, 101],
  curveball: [72, 84],
  slider: [82, 91],
  changeup: [80, 88],
};
function generatePitchSpeed(pitchType) {
  const [lo, hi] = PITCH_SPEED_RANGES[pitchType] || [85, 95];
  return Math.round(lo + Math.random() * (hi - lo));
}

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

// Leadoff direction vectors per base — runners step a few pixels off their bag toward
// the next base during the pitcher's windup, snap back on delivery. Offsets are in
// the direction of travel (1B→2B up+left, 2B→3B down+left, 3B→HP down+right).
// Purely cosmetic: animation paths, steal logic, and fielding coordinates all still
// originate from F.B1/F.B2/F.B3 so nothing about gameplay changes.
const LEAD_OFFSETS = [
  { x: -7, y: -6 }, // 1B runner leads toward 2B
  { x: -7, y:  6 }, // 2B runner leads toward 3B
  { x:  7, y:  6 }, // 3B runner leads toward HP
];

// ===== 2. GLOBAL LOGIC HELPERS =====

function INIT_GS() {
  return {
    inning: 1, half: 0, outs: 0,
    bases: [null, null, null],
    count: { balls: 0, strikes: 0 },
    pitchCount: [0, 0],
    kCount: [0, 0],
    bb: [0, 0],
    reachedBase: [0, 0],
    batterIdx: [0, 0],
    innings: [[0], [0]],
    hits: [0, 0],
    errors: [0, 0],
    rallyCount: 0,
    consecutiveRetired: [0, 0], // tracks consecutive batters retired per pitcher (for groove detection)
    halfInningReached: 0, // baserunners allowed in current half-inning (for struggling detection)
    // First-pitch strike tracking (classic broadcast stat — "FPS%")
    // fps = first-pitch strikes thrown by each team's pitcher
    // fpOpps = first-pitch opportunities (i.e., 0-0 count pitches thrown)
    fps: [0, 0],
    fpOpps: [0, 0],
    gameOver: false, message: null
  };
}

function INIT_STATS(teamsData) {
  const s = [{}, {}];
  for (let t = 0; t < 2; t++) {
    for (const p of teamsData[t].players) {
      s[t][p] = { ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, cs: 0, clutchHits: 0, hitTypes: new Set() };
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

// ===== WIN PROBABILITY =====
// Returns home team's win probability as a percentage (0-100).
// Simple leverage-based model: combines run differential, inning progression,
// half-inning, baserunners, and outs. Inspired by broadcast WP overlays.
function winProbability(g) {
  if (g.gameOver) {
    const homeRunsFinal = g.innings[1].reduce((a, b) => a + b, 0);
    const awayRunsFinal = g.innings[0].reduce((a, b) => a + b, 0);
    if (homeRunsFinal > awayRunsFinal) return 100;
    if (awayRunsFinal > homeRunsFinal) return 0;
    return 50;
  }
  const homeRuns = g.innings[1].reduce((a, b) => a + b, 0);
  const awayRuns = g.innings[0].reduce((a, b) => a + b, 0);
  const diff = homeRuns - awayRuns; // positive => home leading
  const inning = g.inning;
  // Leverage scales with inning — late innings make each run matter more.
  // 1-3: low leverage (k=2.4), 4-6: mid (k=2.0), 7-9+: high (k decreasing)
  const k = inning <= 3 ? 2.4 : inning <= 6 ? 2.0 : Math.max(1.1, 1.7 - (inning - 7) * 0.15);
  // Base WP from logistic of run diff
  let wp = 1 / (1 + Math.pow(10, -diff / k));
  // Late-game adjustments: in 7th+, untied games tilt strongly toward leader
  if (inning >= 7) {
    const tilt = Math.min(0.18, (inning - 6) * 0.05);
    if (diff !== 0) wp = Math.max(0.01, Math.min(0.99, wp + tilt * Math.tanh(diff / 2)));
  }
  // Situation modifier: baserunners help the batting team, outs hurt
  const baserunners = (g.bases[0] ? 1 : 0) + (g.bases[1] ? 1 : 0) + (g.bases[2] ? 1 : 0);
  const sitMod = (baserunners * 0.012) - (g.outs * 0.008);
  const battingHome = g.half === 1;
  wp = battingHome ? Math.min(0.99, wp + sitMod) : Math.max(0.01, wp - sitMod);
  // Last-licks bonus when home is batting late
  if (battingHome && inning >= 8) wp = Math.min(0.99, wp + 0.015);
  return Math.round(Math.max(1, Math.min(99, wp * 100)));
}

// Save opportunity detector (Backlog #68). Returns true if the defensive (pitching)
// team is currently in a "save situation" per standard MLB scoring rules:
//   - Game has reached the 9th inning (top or bottom) and is not yet over.
//   - Pitching team holds the lead.
//   - AND any one of: (a) lead is 3 runs or fewer, (b) tying run is on base /
//     at the plate / on deck (i.e., reachable within the current + next ~2 batters).
// Used to drive the info-bar "SAVE OPPORTUNITY" badge.
function saveOpportunity(g, pitchingTeam) {
  if (g.inning < 9 || g.gameOver) return false;
  const battingTeam = 1 - pitchingTeam;
  const pitchRuns = g.innings[pitchingTeam].reduce((a, b) => a + b, 0);
  const batRuns = g.innings[battingTeam].reduce((a, b) => a + b, 0);
  const lead = pitchRuns - batRuns;
  if (lead <= 0) return false;
  if (lead <= 3) return true;
  // Tying run reachable: current baserunners + the batter in the box + the on-deck hitter
  const runnersOn = g.bases.filter(Boolean).length;
  return (runnersOn + 2) >= lead;
}

// Save credit computation used in the post-game pitching summary (Backlog #68).
// Returns the team index (0 = away, 1 = home) awarded the save, or null for none.
// Simplification of MLB rule 9.19: the winning team is credited with a team save
// when the game lasts 9+ innings and the final margin is 3 runs or fewer — i.e.,
// a close, held lead in the "save situation" window.
function saveCreditTeam(g) {
  if (!g.gameOver) return null;
  const away = g.innings[0].reduce((a, b) => a + b, 0);
  const home = g.innings[1].reduce((a, b) => a + b, 0);
  if (away === home) return null;
  const winner = away > home ? 0 : 1;
  const margin = Math.abs(away - home);
  const fullInnings = Math.max(g.innings[0].length, g.innings[1].length);
  if (fullInnings < 9) return null;
  if (margin > 3) return null;
  return winner;
}

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
    // Dropped third strike in the sim — ~4% of strikeouts where 1B is open. Batter
    // reaches 1B, no out. Keeps season stats aligned with live-game behavior.
    if (oc === 'strikeout' && !gs.bases[0] && Math.random() < 0.04) {
      res.outsAdded = 0;
      res.nextBases = [...res.nextBases];
      res.nextBases[0] = batter;
    }
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
      // Extra-innings ghost runner (Manfred rule): place a runner on 2B for each
      // half-inning in the 10th or later. Ghost = batter slotted before the leadoff.
      if (gs.inning >= 10) {
        const leadoffIdx = gs.batterIdx[gs.half];
        const ghostIdx = (leadoffIdx - 1 + 9) % 9;
        gs.bases[1] = teams[gs.half][ghostIdx];
      }
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

function genBallAnimLocal(oc, dir, sub, variant, isGRD = false) {
  const s = { x: F.HP.x, y: F.HP.y - 10 }, t = getBallTgtLocal(dir, oc, sub, variant);
  if (['ball', 'strike', 'strikeout', 'walk', 'hbp'].includes(oc)) return { path: linePts(F.P, F.C, 12), dur: 550, target: t };
  if (oc === 'homeRun') return { path: arcPts(s, t, 190, 45), dur: 3800, target: t };
  if (oc === 'flyOut' || oc === 'foulOut') return { path: arcPts(s, t, 135, 26), dur: 2200, target: t };
  if (oc === 'lineOut') return { path: arcPts(s, t, 15, 18), dur: 950, target: t };
  if (oc === 'bunt') return { path: linePts(s, { x: lerp(s.x, t.x, 0.45), y: lerp(s.y, t.y, 0.45) }, 12), dur: 700, target: t };
  if (['groundOut', 'doublePlay'].includes(oc)) return { path: linePts(s, t, 16), dur: 1000, target: t };
  if (oc === 'foulBall') return { path: arcPts(s, t, 60, 20), dur: 1400, target: t };
  const arcH = ['double', 'triple'].includes(oc) ? 60 : 35;
  if (isGRD && oc === 'double') {
    // Ground rule double: ball arcs down to the field just in front of the fence,
    // takes a high bounce, then sails over the wall into the stands (negative y).
    const bouncePt = { x: t.x, y: FENCE_Y + 14 };
    const overWall = { x: t.x + (Math.random() - 0.5) * 12, y: FENCE_Y - 22 };
    return { path: [...arcPts(s, bouncePt, arcH + 10, 15), ...arcPts(bouncePt, overWall, 40, 10)], dur: 2200, target: overWall, carom: false, isGRD: true };
  }
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

// Home run distance generator (Statcast-style) — derives a plausible projected
// distance (in feet) from the exit velocity. Baseline is 355 ft at 102 mph,
// adding ~7 ft per mph over that, plus +/- 18 ft of noise. Clamped to a
// realistic 340-475 ft range so even "just-enough" homers feel grounded.
function generateHRDistance(ev) {
  if (!ev) return null;
  const base = 355 + (ev - 102) * 7;
  const noise = (Math.random() - 0.5) * 36;
  return Math.max(340, Math.min(475, Math.round(base + noise)));
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
    } else if (type === 'bobble') {
      // Fielding error — leather fumble (dull thud) followed by ball-on-dirt bounce
      // First: dull glove contact (low-freq thump)
      const dur1 = 0.08, b1 = c.createBuffer(1, Math.ceil(c.sampleRate * dur1), c.sampleRate), d1 = b1.getChannelData(0);
      for (let i = 0; i < d1.length; i++) { const t = i / c.sampleRate; d1[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.35 + Math.sin(t * 300) * Math.exp(-t / 0.02) * 0.2; }
      const s1 = c.createBufferSource(); s1.buffer = b1; s1.connect(c.destination); s1.start(n);
      // Second: dirt bounce (slightly delayed, higher pitch)
      const dur2 = 0.12, b2 = c.createBuffer(1, Math.ceil(c.sampleRate * dur2), c.sampleRate), d2 = b2.getChannelData(0);
      for (let i = 0; i < d2.length; i++) { const t = i / c.sampleRate; d2[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.018) * 0.25 + Math.sin(t * 480) * Math.exp(-t / 0.025) * 0.15; }
      const s2 = c.createBufferSource(); s2.buffer = b2; s2.connect(c.destination); s2.start(n + 0.12);
    } else if (type === 'balk') {
      // Umpire whistle / two-tone signal — short rising blow for balk calls
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(880, n); o.frequency.linearRampToValueAtTime(1040, n + 0.18);
      g.gain.setValueAtTime(0.0001, n); g.gain.linearRampToValueAtTime(0.25, n + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, n + 0.30);
      o.connect(g); g.connect(c.destination); o.start(n); o.stop(n + 0.32);
    } else if (type === 'batCrack') {
      // Wood-snapping crack for a broken bat — sharp transient + mid-freq resonance + slight crackle
      const dur = 0.22, b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / c.sampleRate;
        // Sharp initial transient (snap)
        const snap = (Math.random() * 2 - 1) * Math.exp(-t / 0.006) * 0.55;
        // Mid-body wood resonance (~340 Hz) decaying quickly
        const body = Math.sin(t * 2140) * Math.exp(-t / 0.05) * 0.25;
        // Splinter crackle — random noise bursts
        const crackle = (Math.random() * 2 - 1) * Math.exp(-t / 0.04) * 0.15;
        d[i] = snap + body + crackle;
      }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'passedBall') {
      // Dropped third strike — ball skips past the catcher's mitt then a quick scramble.
      // First: a muted leather "clip" as it glances off the glove. Then: a dirt-scoot
      // rustle as the ball rolls behind home plate.
      const dur1 = 0.07, b1 = c.createBuffer(1, Math.ceil(c.sampleRate * dur1), c.sampleRate), d1 = b1.getChannelData(0);
      for (let i = 0; i < d1.length; i++) { const t = i / c.sampleRate; d1[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.008) * 0.3 + Math.sin(t * 260) * Math.exp(-t / 0.025) * 0.18; }
      const s1 = c.createBufferSource(); s1.buffer = b1; s1.connect(c.destination); s1.start(n);
      // Scramble noise (filtered-ish, longer decay)
      const dur2 = 0.26, b2 = c.createBuffer(1, Math.ceil(c.sampleRate * dur2), c.sampleRate), d2 = b2.getChannelData(0);
      for (let i = 0; i < d2.length; i++) { const t = i / c.sampleRate; d2[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.11) * 0.2 * (1 - t / dur2 * 0.6); }
      const s2 = c.createBufferSource(); s2.buffer = b2; s2.connect(c.destination); s2.start(n + 0.08);
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
  const isBatFlip = phase === 'batFlip';
  const isStepOut = phase === 'stepOut';
  const stepOffset = isStepOut ? 12 * f : 0;
  const ba = s ? (l ? -70 : 70) : (l ? 30 : -30);
  const batDown = isStepOut ? 60 * f : ba;
  // Bat flip: batter drops arms, bat spins upward — classic HR celebration
  if (isBatFlip) {
    return (<g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" />
      <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
      <line x1={0} y1={8} x2={-3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={0} y1={8} x2={3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Arms drop to sides — admiring the shot */}
      <line x1={0} y1={2} x2={-5 * f} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={0} y1={2} x2={5 * f} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* Spinning bat tossed upward */}
      <g>
        <animateTransform attributeName="transform" type="translate" values={`${8 * f},-2; ${12 * f},-18; ${14 * f},-28; ${13 * f},-22; ${11 * f},-10`} dur="0.7s" fill="freeze" />
        <line x1={0} y1={-6} x2={0} y2={8} stroke="#b8860b" strokeWidth={2.5} strokeLinecap="round" opacity="0.9">
          <animateTransform attributeName="transform" type="rotate" values="0,0,1; 360,0,1; 720,0,1" dur="0.7s" fill="freeze" />
        </line>
      </g>
      <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
      {/* Head tilted up slightly, watching the ball fly */}
      <path d={`M${-5 * f},-7 Q0,-15 ${5 * f},-7`} fill={color} />
    </g>);
  }
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
function SVGCatcher({ x, y, color = '#1e40af', isMoving = false, signs = 0 }) {
  const b = isMoving ? Math.sin(Date.now() / 50) * 2 : 0;
  // Catcher's signs — flashing fingers between the catcher's legs during the pitcher's windup.
  // `signs` is a number (1–4) indicating how many fingers are extended (as real catchers do).
  const signCount = signs > 0 && !isMoving ? Math.min(4, Math.max(1, signs)) : 0;
  return (<g transform={`translate(${x},${y + b})`}><ellipse cx={0} cy={8} rx={6} ry={2} fill="rgba(0,0,0,.1)" /><line x1={0} y1={-4} x2={0} y2={2} stroke={color} strokeWidth={3} strokeLinecap="round" /><line x1={0} y1={2} x2={-5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={-5} y1={0} x2={-5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={2} x2={5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={5} y1={0} x2={5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><circle cx={9.5} cy={-3.5} r={4.5} fill="#8B4513" stroke="#5a3010" strokeWidth={.6} /><circle cx={0} cy={-9} r={5} fill="#f5d0a0" /><path d={`M-5,-10 Q0,-17 5,-10`} fill={color} /><rect x={-3.5} y={-8} width={7} height={5} rx={1} fill="none" stroke="#555" strokeWidth={.7} opacity={.5}/>{signCount > 0 && (
    <g key={`sign-${signCount}`}>
      {/* Small "glove hand" disk between the legs (hides the signs from the batter) */}
      <ellipse cx={0} cy={4.5} rx={2.4} ry={1.4} fill="#7a3a12" opacity={0.6} />
      {/* Finger lines — one line per sign, centered between the catcher's legs */}
      {Array.from({ length: signCount }, (_, i) => {
        const offsetX = (i - (signCount - 1) / 2) * 1.1;
        return (
          <line key={`sgn-${i}`} x1={offsetX} y1={3.4} x2={offsetX} y2={5.6} stroke="#f5d0a0" strokeWidth={0.75} strokeLinecap="round" opacity={0.95}>
            <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.25;0.75;1" dur="0.9s" fill="freeze" />
          </line>
        );
      })}
    </g>
  )}</g>);
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

// Error bobble animation — ball bouncing off glove with red "E!" flash at the fielder's position
function ErrorBobble({ x, y }) {
  if (!x || !y) return null;
  return (
    <g>
      {/* Red flash circle expanding outward */}
      <circle cx={x} cy={y} r={6} fill="#ef4444" opacity={0.6}>
        <animate attributeName="r" from="3" to="16" dur="0.7s" fill="freeze" />
        <animate attributeName="opacity" from="0.7" to="0" dur="0.7s" fill="freeze" />
      </circle>
      {/* Ball bouncing off glove — small white ball bouncing upward then down */}
      <circle cx={x + 3} cy={y - 4} r={2.5} fill="#fff" stroke="#c00" strokeWidth={0.5}>
        <animate attributeName="cy" values={`${y - 4};${y - 18};${y - 6};${y - 12};${y - 2}`} dur="0.9s" fill="freeze" />
        <animate attributeName="cx" values={`${x + 3};${x + 8};${x + 12};${x + 14};${x + 16}`} dur="0.9s" fill="freeze" />
        <animate attributeName="opacity" values="1;1;1;0.7;0.4" dur="0.9s" fill="freeze" />
      </circle>
      {/* "E!" text floating upward — classic error indicator */}
      <text x={x} y={y - 16} textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="sans-serif" stroke="#fff" strokeWidth={0.6} paintOrder="stroke" opacity={1}>
        <animate attributeName="y" from={y - 12} to={y - 30} dur="1.2s" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="1.2s" fill="freeze" />
        E!
      </text>
      {/* Dust/dirt puff from the bobble */}
      {[0, 1, 2].map(i => {
        const angle = (i - 1) * 40;
        const dx = Math.cos(angle * Math.PI / 180) * 6;
        const dy = Math.sin(angle * Math.PI / 180) * 4;
        return (
          <circle key={`eb-dust-${i}`} cx={x + dx} cy={y + 2} r={2} fill="#d4a574" opacity={0.5}>
            <animate attributeName="cx" from={x} to={x + dx * 2} dur="0.6s" fill="freeze" />
            <animate attributeName="cy" from={y + 2} to={y + dy} dur="0.6s" fill="freeze" />
            <animate attributeName="opacity" from="0.5" to="0" dur="0.6s" fill="freeze" />
            <animate attributeName="r" from="1" to="4" dur="0.6s" fill="freeze" />
          </circle>
        );
      })}
    </g>
  );
}

// Broken bat animation — after a shattered-bat swing, a splintered barrel
// piece spins away from the batter. `side` is 'L' or 'R' so the barrel flies
// in the appropriate direction (toward the foul side that would be natural).
function BrokenBat({ x, y, side = 'R' }) {
  if (x == null || y == null) return null;
  const f = side === 'L' ? -1 : 1;
  // Target: arcing toward the infield in front of the plate — 40-55px away,
  // slightly up then down in a tumble. Spins 2+ revolutions on the way.
  const endX = x + 46 * f;
  const endY = y + 18;
  const midX = x + 22 * f;
  const midY = y - 18;
  return (
    <g>
      {/* The flying broken barrel piece (shorter than a full bat) */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values={`${x},${y}; ${midX},${midY}; ${endX},${endY}`}
          keyTimes="0;0.5;1" dur="0.9s" fill="freeze" />
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0" to={`${820 * f}`} dur="0.9s" fill="freeze" />
          {/* Splintered barrel piece — jagged top, clean bottom */}
          <line x1={0} y1={-7} x2={0} y2={5} stroke="#b8860b" strokeWidth={2.4} strokeLinecap="round" />
          {/* Splinter at the break point */}
          <polyline points={`-1.5,-7 0.5,-8.5 -0.5,-10 1.5,-9 0,-7`} fill="none" stroke="#8b5a00" strokeWidth={0.7} />
        </g>
        {/* Fade out on the way down */}
        <animate attributeName="opacity" values="1;1;0.2" keyTimes="0;0.7;1" dur="0.9s" fill="freeze" />
      </g>
      {/* Small splinter particles at the break point */}
      {[0, 1, 2, 3].map(i => {
        const ang = ((i - 1.5) * 22) * Math.PI / 180;
        const dx = Math.cos(ang) * 8 * f;
        const dy = Math.sin(ang) * 5 - 3;
        return (
          <line key={`splinter-${i}`}
            x1={x} y1={y - 4} x2={x + dx * 0.2} y2={y - 4 + dy * 0.2}
            stroke="#a07030" strokeWidth={0.6} strokeLinecap="round" opacity={0.8}>
            <animate attributeName="x2" from={x} to={x + dx} dur="0.5s" fill="freeze" />
            <animate attributeName="y2" from={y - 4} to={y - 4 + dy} dur="0.5s" fill="freeze" />
            <animate attributeName="opacity" from="0.85" to="0" dur="0.5s" fill="freeze" />
          </line>
        );
      })}
      {/* Brief "CRACK!" text flash */}
      <text x={x + 10 * f} y={y - 14} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#f59e0b" stroke="#000" strokeWidth="0.4" paintOrder="stroke">
        <animate attributeName="y" from={y - 14} to={y - 28} dur="0.9s" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="0.9s" fill="freeze" />
        CRACK!
      </text>
    </g>
  );
}

// Crowd reaction text bubbles — floating text in the stands on big plays
function CrowdReactions({ reactions }) {
  if (!reactions || reactions.length === 0) return null;
  return (
    <g>
      {reactions.map((r, i) => (
        <g key={`crowd-${r.id}`}>
          <text x={r.x} y={r.y} textAnchor="middle" fontSize={r.size || 7} fontWeight="bold" fontFamily="sans-serif" fill={r.color || '#fff'} opacity={0.9} stroke={r.stroke || '#000'} strokeWidth={0.4} paintOrder="stroke">
            <animate attributeName="y" from={r.y} to={r.y - 22} dur="2s" fill="freeze" />
            <animate attributeName="opacity" from="0.95" to="0" dur="2s" fill="freeze" />
            {r.text}
          </text>
        </g>
      ))}
    </g>
  );
}

// Center-field flagpole with a gently waving American flag — classic stadium detail.
// Positioned in the stands area above the CF wall (well outside the play area).
// The flag animates via an SVG <animate> cycle on the path `d` attribute so the cloth
// appears to ripple in the breeze. Night games dim the flag slightly so it reads like
// it's illuminated by stadium lighting rather than daylight.
function StadiumFlag({ isNightGame = false }) {
  const px = 478; // pole x-coord (right-of-center in the CF stands)
  const pyTop = 6; // top of pole
  const pyBot = 76; // bottom of pole (anchors into the stands)
  const fy = pyTop + 3; // flag top y
  const fw = 26; // flag width
  const fh = 15; // flag height
  const opacityScale = isNightGame ? 0.75 : 1;
  // Three keyframes of the flag path give a soft wave cycle (~3s loop).
  const wave1 = `M ${px} ${fy} Q ${px + fw * 0.5} ${fy - 1.5} ${px + fw} ${fy + 1} L ${px + fw} ${fy + fh} Q ${px + fw * 0.5} ${fy + fh - 1.5} ${px} ${fy + fh} Z`;
  const wave2 = `M ${px} ${fy} Q ${px + fw * 0.5} ${fy + 3} ${px + fw} ${fy - 0.5} L ${px + fw} ${fy + fh - 1.5} Q ${px + fw * 0.5} ${fy + fh + 2} ${px} ${fy + fh} Z`;
  const wave3 = `M ${px} ${fy} Q ${px + fw * 0.5} ${fy - 1.5} ${px + fw} ${fy + 1} L ${px + fw} ${fy + fh} Q ${px + fw * 0.5} ${fy + fh - 1.5} ${px} ${fy + fh} Z`;
  return (
    <g opacity={opacityScale}>
      {/* Flagpole */}
      <line x1={px} y1={pyTop} x2={px} y2={pyBot} stroke="#8b9299" strokeWidth={1.2} />
      {/* Finial at top */}
      <circle cx={px} cy={pyTop - 1.2} r={1.1} fill="#c0c4cb" />
      {/* Red-and-white striped flag body (bottom half) */}
      <path d={wave1} fill="#c91d1d" stroke="#7a0f0f" strokeWidth={0.3}>
        <animate attributeName="d" values={`${wave1};${wave2};${wave3}`} dur="3.4s" repeatCount="indefinite" />
      </path>
      {/* White stripes overlaid on the red (simulate alternating stripes) */}
      <path d={wave1} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={0.9}>
        <animate attributeName="d" values={`
          M ${px} ${fy + fh * 0.22} Q ${px + fw * 0.5} ${fy + fh * 0.22 - 1.5} ${px + fw} ${fy + fh * 0.22 + 1} ;
          M ${px} ${fy + fh * 0.22} Q ${px + fw * 0.5} ${fy + fh * 0.22 + 3} ${px + fw} ${fy + fh * 0.22 - 0.5} ;
          M ${px} ${fy + fh * 0.22} Q ${px + fw * 0.5} ${fy + fh * 0.22 - 1.5} ${px + fw} ${fy + fh * 0.22 + 1}
        `} dur="3.4s" repeatCount="indefinite" />
      </path>
      <path d={wave1} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={0.9}>
        <animate attributeName="d" values={`
          M ${px} ${fy + fh * 0.55} Q ${px + fw * 0.5} ${fy + fh * 0.55 - 1.5} ${px + fw} ${fy + fh * 0.55 + 1} ;
          M ${px} ${fy + fh * 0.55} Q ${px + fw * 0.5} ${fy + fh * 0.55 + 3} ${px + fw} ${fy + fh * 0.55 - 0.5} ;
          M ${px} ${fy + fh * 0.55} Q ${px + fw * 0.5} ${fy + fh * 0.55 - 1.5} ${px + fw} ${fy + fh * 0.55 + 1}
        `} dur="3.4s" repeatCount="indefinite" />
      </path>
      <path d={wave1} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={0.9}>
        <animate attributeName="d" values={`
          M ${px} ${fy + fh * 0.88} Q ${px + fw * 0.5} ${fy + fh * 0.88 - 1.5} ${px + fw} ${fy + fh * 0.88 + 1} ;
          M ${px} ${fy + fh * 0.88} Q ${px + fw * 0.5} ${fy + fh * 0.88 + 3} ${px + fw} ${fy + fh * 0.88 - 0.5} ;
          M ${px} ${fy + fh * 0.88} Q ${px + fw * 0.5} ${fy + fh * 0.88 - 1.5} ${px + fw} ${fy + fh * 0.88 + 1}
        `} dur="3.4s" repeatCount="indefinite" />
      </path>
      {/* Blue canton (top-left quadrant) with tiny white star dots */}
      <rect x={px + 0.4} y={fy + 0.3} width={fw * 0.42} height={fh * 0.5} fill="#162c6b">
        <animate attributeName="y" values={`${fy + 0.3};${fy + 1.6};${fy + 0.3}`} dur="3.4s" repeatCount="indefinite" />
      </rect>
      {/* Star field — three rows of dots approximating stars */}
      {[0.12, 0.28].map((row, ri) =>
        [0.06, 0.14, 0.22, 0.30].map((col, ci) => (
          <circle key={`star-${ri}-${ci}`} cx={px + fw * col + (ri % 2 ? 2 : 0)} cy={fy + fh * row} r={0.45} fill="#ffffff" opacity={0.95}>
            <animate attributeName="cy" values={`${fy + fh * row};${fy + fh * row + 1.3};${fy + fh * row}`} dur="3.4s" repeatCount="indefinite" />
          </circle>
        ))
      )}
    </g>
  );
}

/**
 * OUT-OF-TOWN SCOREBOARD TICKER
 * A narrow scrolling band above the outfield stands that displays fictional
 * "around the league" scores, like every modern ballpark has. Uses an SVG
 * `<animate>` on a translate so the text loops smoothly right-to-left, with
 * the content duplicated so there's no visible seam when it wraps.
 *
 * Purely atmospheric — no gameplay effect. Dims slightly in night mode to read
 * as flood-lit rather than daylight-bright.
 */
const OUT_OF_TOWN_GAMES = [
  'BOS 4 · TB 2 · F/8',
  'SD 1 · LAD 3 · T7',
  'HOU 5 · TEX 2 · F/9',
  'ATL 6 · MIA 1 · B6',
  'CHC 2 · STL 2 · T5',
  'SF 3 · ARI 4 · F/10',
  'NYY 7 · BAL 3 · F/9',
  'CLE 0 · MIN 1 · B8',
  'SEA 4 · OAK 0 · T4',
  'PHI 2 · WSH 5 · F/9',
  'DET 3 · KC 3 · B9',
  'TOR 6 · CWS 2 · F/8',
  'MIL 1 · CIN 0 · T9',
  'COL 5 · PIT 4 · F/9',
  'LAA 2 · NYM 6 · B7',
];
function OutOfTownTicker({ isNightGame = false }) {
  const bx = 90;    // left edge of ticker
  const bw = 380;   // ticker width — stops at x=470, clearing the flag pole at x=478
  const by = 82;    // top of ticker
  const bh = 14;    // ticker height
  const labelW = 66; // "OUT OF TOWN" label panel width
  const scrollArea = bw - labelW; // available width for scrolling content
  // Build a single content string; " • " separator between games. Duplicate it
  // so the second copy reaches the right edge of the first, giving a seamless loop.
  const joined = OUT_OF_TOWN_GAMES.join('   •   ') + '   •   ';
  // Empirical width per character at fontSize 7 ≈ 4.1px — used to size the content
  // group and pick an animation distance that exactly matches one copy's length.
  const perChar = 4.1;
  const contentW = Math.ceil(joined.length * perChar);
  const opacity = isNightGame ? 0.85 : 1;
  return (
    <g opacity={opacity}>
      {/* Ticker body — dark navy with gold border */}
      <rect x={bx} y={by} width={bw} height={bh} rx={2} fill="#0b1a33" stroke="#d4a800" strokeWidth={0.7} />
      {/* Subtle inner shadow for depth */}
      <rect x={bx + 1} y={by + 1} width={bw - 2} height={1.4} fill="#1a2a4d" opacity={0.7} />
      {/* Left-side "OUT OF TOWN" label panel */}
      <rect x={bx + 1} y={by + 1} width={labelW} height={bh - 2} fill="#1a2a4d" />
      <text x={bx + 1 + labelW / 2} y={by + bh / 2 + 2.3} textAnchor="middle" fill="#fbbf24" fontSize="5.2" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">OUT OF TOWN</text>
      {/* Divider between label and scrolling content */}
      <line x1={bx + 1 + labelW} y1={by + 1.5} x2={bx + 1 + labelW} y2={by + bh - 1.5} stroke="#d4a800" strokeWidth={0.4} opacity={0.7} />
      {/* Scrolling content — clipped to the right-hand area of the ticker */}
      <defs>
        <clipPath id="ootClip">
          <rect x={bx + 1 + labelW} y={by + 1} width={scrollArea - 2} height={bh - 2} />
        </clipPath>
      </defs>
      <g clipPath="url(#ootClip)">
        <g>
          <animateTransform attributeName="transform" attributeType="XML" type="translate"
            from={`${bx + 1 + labelW + 2} 0`} to={`${bx + 1 + labelW + 2 - contentW} 0`}
            dur="52s" repeatCount="indefinite" />
          <text x={0} y={by + bh / 2 + 2.4} fill="#fff8d0" fontSize="7" fontFamily="monospace" fontWeight="600" letterSpacing="0.3">
            {joined}
          </text>
          {/* Duplicate: placed immediately to the right so the tail of copy #1 flows
              into the head of copy #2 without a visible seam. */}
          <text x={contentW} y={by + bh / 2 + 2.4} fill="#fff8d0" fontSize="7" fontFamily="monospace" fontWeight="600" letterSpacing="0.3">
            {joined}
          </text>
        </g>
      </g>
    </g>
  );
}

const CROWD_REACTIONS = {
  homeRun: { positive: ['GO! GO! GO!', 'OUTTA HERE!', 'SEE YA!', 'GONE!', 'CRUSHED!', 'BOOM!'], negative: ['...', 'oh no', 'ugh', 'sit down'] },
  grandSlam: { positive: ['GRAND SLAM!', 'WOW!', 'UNREAL!', 'INCREDIBLE!'], negative: ['...', '😬', 'painful'] },
  strikeout: { positive: ['SIT DOWN!', 'K!', 'YEAH!', 'GOT EM!'], negative: ['come on!', 'ugh', 'boo'] },
  error: { positive: ["WE'LL TAKE IT!", 'HA!', 'LUCKY!'], negative: ['BOO!', 'COME ON!', 'YIKES'] },
  webGem: { positive: ['WOW!', 'WHAT A CATCH!', 'NO WAY!', 'UNREAL!'], negative: ['oh man...', 'wow...', 'no...'] },
  doublePlay: { positive: ['DOUBLE PLAY!', 'TWO!', 'NICE!'], negative: ['come on...', 'ugh', 'rally killer'] },
  walk: { positive: ['GOOD EYE!', 'WALK!'], negative: ['boo', 'throw strikes!'] },
};

/**
 * BULLPEN WARMUP
 * Small SVG rendered in the stands area (top-left corner, opposite the flag) that
 * shows a relief pitcher going through a warm-up throwing motion when the current
 * defensive pitcher's count exceeds ~80 pitches. A visual companion to the fatigue
 * system and the existing pitching-change animation — you can literally see the
 * reliever getting loose before the manager ever leaves the dugout.
 */
function BullpenWarmup({ visible, reliefColor = '#1e40af', isNightGame = false }) {
  if (!visible) return null;
  const bx = 18, by = 18; // top-left anchor in the stands area
  const w = 66, h = 44;
  const mx = bx + 32, my = by + 32; // pitcher's rubber (mound center)
  const cy = by + h - 6; // catcher y
  const opacity = isNightGame ? 0.7 : 0.92;
  return (
    <g opacity={opacity}>
      {/* Bullpen pen — dirt strip with a chain-link boundary */}
      <rect x={bx} y={by + 8} width={w} height={h - 8} rx={3} fill="#b58b54" stroke="#6e4f28" strokeWidth={0.5} opacity={0.85} />
      {/* Chain-link fence pattern (faint) */}
      <g opacity={0.25}>
        {[0, 1, 2, 3].map(i => (
          <line key={`bpfv${i}`} x1={bx + 6 + i * 18} y1={by + 8} x2={bx + 6 + i * 18} y2={by + h} stroke="#fff" strokeWidth={0.3} />
        ))}
        {[0, 1, 2].map(i => (
          <line key={`bpfh${i}`} x1={bx} y1={by + 14 + i * 12} x2={bx + w} y2={by + 14 + i * 12} stroke="#fff" strokeWidth={0.3} />
        ))}
      </g>
      {/* Mound dirt */}
      <ellipse cx={mx} cy={my + 3} rx={10} ry={3.5} fill="#8c6836" opacity={0.95} />
      {/* Home-plate chalk square for the bullpen catcher */}
      <rect x={mx - 4} y={cy + 1} width={8} height={1.8} fill="#fff" opacity={0.85} />
      {/* BULLPEN label banner */}
      <rect x={bx + 10} y={by + 1} width={w - 20} height={7} rx={1} fill="#1f2937" opacity={0.85} />
      <text x={bx + w / 2} y={by + 6.3} textAnchor="middle" fill="#fbbf24" fontSize="4.8" fontWeight="bold" fontFamily="sans-serif">BULLPEN</text>
      {/* Relief pitcher — simple silhouette with an animated throwing arm (loops every 1.8s) */}
      <g transform={`translate(${mx}, ${my})`}>
        {/* Legs */}
        <line x1={-1.3} y1={1} x2={-2.6} y2={5.5} stroke={reliefColor} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={1.3} y1={1} x2={2.6} y2={5.5} stroke={reliefColor} strokeWidth={1.6} strokeLinecap="round" />
        {/* Torso */}
        <rect x={-2} y={-6} width={4} height={7} rx={1} fill={reliefColor} />
        {/* Head + cap */}
        <circle cx={0} cy={-8.4} r={2} fill="#f5c99c" />
        <path d={`M ${-2.2} ${-9.2} Q 0 ${-11.4} ${2.2} ${-9.2} L ${2.6} ${-8.4} L ${-2.6} ${-8.4} Z`} fill={reliefColor} />
        {/* Glove arm (front) — subtle bob */}
        <line x1={-1.6} y1={-4} x2={-4} y2={-3.5} stroke="#f5c99c" strokeWidth={1.3} strokeLinecap="round">
          <animate attributeName="y2" values="-3.5;-4.5;-3.5" dur="1.8s" repeatCount="indefinite" />
        </line>
        <circle cx={-4.2} cy={-3.5} r={1.2} fill="#5a3a22">
          <animate attributeName="cy" values="-3.5;-4.5;-3.5" dur="1.8s" repeatCount="indefinite" />
        </circle>
        {/* Throwing arm (back) — full windup cycle: coil → raise → release → follow */}
        <line x1={1.6} y1={-4} x2={4.5} y2={-6} stroke="#f5c99c" strokeWidth={1.3} strokeLinecap="round">
          <animate attributeName="x2" values="4.5;-2;2;6;5.5;4.5" keyTimes="0;0.25;0.45;0.6;0.8;1" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="y2" values="-6;-9;-11;-4;-2;-6" keyTimes="0;0.25;0.45;0.6;0.8;1" dur="1.8s" repeatCount="indefinite" />
        </line>
        {/* Ball in the hand — visible only during the back half of the windup */}
        <circle r={0.9} fill="#fff" stroke="#c00" strokeWidth={0.2}>
          <animate attributeName="cx" values="4.5;-2;2;6;5.5;4.5" keyTimes="0;0.25;0.45;0.6;0.8;1" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="cy" values="-6;-9;-11;-4;-2;-6" keyTimes="0;0.25;0.45;0.6;0.8;1" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;1;1;0;0;1" keyTimes="0;0.25;0.45;0.5;0.8;1" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>
      {/* Bullpen catcher — crouched, receiving */}
      <g transform={`translate(${mx}, ${cy - 3})`}>
        <rect x={-2.2} y={-3} width={4.4} height={4} rx={0.8} fill={reliefColor} />
        <circle cx={0} cy={-4.2} r={1.7} fill="#f5c99c" />
        {/* Mitt */}
        <circle cx={3} cy={-2} r={1.6} fill="#6b4422" stroke="#2a1a0a" strokeWidth={0.3} />
      </g>
      {/* "Warming up" pulsing glow dot — unmistakable signal */}
      <circle cx={bx + w - 6} cy={by + 4.5} r={1.6} fill="#fbbf24">
        <animate attributeName="opacity" values="1;0.25;1" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function BaseballField({ bases, defColor, offColor, ballPos, ballTrail = [], pitchPhase, batterPhase, showFW, fwKey, movingRunners, movingFielder, batterSide = 'R', platePlay = null, isPlayoff = false, pitchingChange = null, homeColor = '#b91c1c', awayColor = '#1e40af', homeKs = 0, awayKs = 0, isNightGame = false, webGem = null, errorBobble = null, umpirePhase = 'idle', crowdReactions = [], pitchLocations = [], inning = 1, catcherSigns = 0, bullpenActive = false, reliefColor = '#1e40af', moundVisit = null, brokenBat = null, pickoffDive = null, shiftType = null, leadCaution = 1 }) {
  const hp = F.HP, isLefty = batterSide === 'L';
  // Defensive shift positions — SS and 2B reposition for pull-hitting sluggers.
  // The shift is cosmetic: it only affects where the static fielder SVGs are drawn.
  // Fielder animations (groundouts, flyouts, etc.) still emanate from the original
  // F.SS / F.F2B coordinates so the existing animation logic is unchanged.
  const ssPos = shiftType && SHIFT_POS[shiftType] ? SHIFT_POS[shiftType].SS : F.SS;
  const f2bPos = shiftType && SHIFT_POS[shiftType] ? SHIFT_POS[shiftType].F2B : F.F2B;
  const batterX = isLefty ? hp.x + 25 : hp.x - 25;
  const staticField = useMemo(() => {
    const fc = {cx:310, cy:430, rx:330, ry:370};
    const fl = (()=>{ const dx = F.B3.x-hp.x, dy = F.B3.y-hp.y, a = (dx/fc.rx)**2+(dy/fc.ry)**2, b = 2*((hp.x-fc.cx)*dx/fc.rx**2+(hp.y-fc.cy)*dy/fc.ry**2), c = ((hp.x-fc.cx)/fc.rx)**2+((hp.y-fc.cy)/fc.ry)**2-1, disc = b*b-4*a*c, t = (-b+Math.sqrt(Math.max(0,disc)))/(2*a); return {x:hp.x+dx*t,y:hp.y+dy*t}})();
    const fr = (()=>{ const dx = F.B1.x-hp.x, dy = F.B1.y-hp.y, a = (dx/fc.rx)**2+(dy/fc.ry)**2, b = 2*((hp.x-fc.cx)*dx/fc.rx**2+(hp.y-fc.cy)*dy/fc.ry**2), c = ((hp.x-fc.cx)/fc.rx)**2+((hp.y-fc.cy)/fc.ry)**2-1, disc = b*b-4*a*c, t = (-b+Math.sqrt(Math.max(0,disc)))/(2*a); return {x:hp.x+dx*t,y:hp.y+dy*t}})();
    const flx = fl.x, frx = fr.x, fry = fr.y;
    const dp = `M ${hp.x-40} ${hp.y+5} L ${F.B3.x-22} ${F.B3.y+5} Q ${F.B3.x-15} ${F.B3.y-15} ${F.B3.x} ${F.B3.y-18} Q ${F.B2.x-30} ${F.B2.y-5} ${F.B2.x} ${F.B2.y-22} Q ${F.B2.x+30} ${F.B2.y-5} ${F.B1.x} ${F.B1.y-18} Q ${F.B1.x+15} ${F.B1.y-15} ${F.B1.x+22} ${F.B1.y+5} L ${hp.x+40} ${hp.y+5} Z`;
    const aL = Math.atan2(flx - fc.cx, fc.cy - fl.y), aR = Math.atan2(frx - fc.cx, fc.cy - fry);
    const marks = [{label:'330',frac:0},{label:'370',frac:.25},{label:'400',frac:.5},{label:'370',frac:.75},{label:'330',frac:1}];
    // Time-of-day sky gradient — shifts from morning blue (innings 1-3) to
    // afternoon warm (4-6) to golden hour (7+). Night games override entirely.
    let dayPhase = 'morning';
    if (!isNightGame) {
      if (inning >= 7) dayPhase = 'goldenHour';
      else if (inning >= 4) dayPhase = 'afternoon';
    }
    const skySwatches = {
      morning:    ['#6db8e8', '#a8d8f0', '#6ab840'], // bright clear blue
      afternoon:  ['#7fc1e0', '#f5d8a8', '#6ab840'], // soft warm haze creeping in
      goldenHour: ['#e89b58', '#f4c98c', '#5fa83a'], // golden / amber light, dimmer field rim
    }[dayPhase];
    const skyId = isNightGame ? 'sky1n' : `sky1d_${dayPhase}`;
    const fieldStops = isNightGame
      ? ['#2d8a1a', '#1e6010']
      : dayPhase === 'goldenHour' ? ['#3da025', '#287018']
        : dayPhase === 'afternoon' ? ['#46ae28', '#318818']
          : ['#4cb82a', '#358a1a'];
    return (
      <React.Fragment>
        <defs>
          <radialGradient id="g1" cx="50%" cy="86%" r="55%"><stop offset="0%" stopColor={fieldStops[0]} /><stop offset="100%" stopColor={fieldStops[1]} /></radialGradient>
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">{isNightGame ? (<><stop offset="0%" stopColor="#0a1628" /><stop offset="40%" stopColor="#152040" /><stop offset="100%" stopColor="#1a4a20" /></>) : (<><stop offset="0%" stopColor={skySwatches[0]} /><stop offset="60%" stopColor={skySwatches[1]} /><stop offset="100%" stopColor={skySwatches[2]} /></>)}</linearGradient>
          <clipPath id="fc1"><path d={`M${hp.x} ${hp.y + 12} L${flx - 8} ${fl.y} A${fc.rx} ${fc.ry} 0 0 1 ${frx + 8} ${fry} Z`} /></clipPath>
        </defs>
        <rect width="620" height="500" fill={`url(#${skyId})`} />
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
  }, [isNightGame, inning]);

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
        <StadiumFlag isNightGame={isNightGame} />
        <OutOfTownTicker isNightGame={isNightGame} />
        <BullpenWarmup visible={bullpenActive} reliefColor={reliefColor} isNightGame={isNightGame} />
        <Dugouts homeColor={homeColor} awayColor={awayColor} />
        <StrikeoutKs kCount={homeKs} side="home" />
        <StrikeoutKs kCount={awayKs} side="away" />
        {pitchingChange && <SVGManager x={pitchingChange.x} y={pitchingChange.y} progress={pitchingChange.progress} />}
        {[{ b: bases[0], ...F.B1 }, { b: bases[1], ...F.B2 }, { b: bases[2], ...F.B3 }].map((base, idx) => {
          // Runner leadoff — offset the runner sprite off the bag during the pitcher's windup
          // and delivery. Full lead during windup, reduced "lean" during throw, hugs the bag
          // otherwise. After a pickoff throw, the runner plays it cautious and leads smaller
          // for the next pitch (leadCaution scales from 0.4 → 1 as caution decays).
          const leadScale = pitchPhase === 'windup' ? 1 : pitchPhase === 'throw' ? 0.5 : 0;
          const cautionMul = leadCaution != null ? leadCaution : 1;
          const lead = LEAD_OFFSETS[idx];
          const rx = base.x + lead.x * leadScale * cautionMul;
          const ry = base.y + lead.y * leadScale * cautionMul;
          return (
            <g key={idx}>
              <rect x={base.x - 7} y={base.y - 7} width={14} height={14} fill={base.b && !movingRunners?.length ? offColor : '#fff'} stroke={base.b ? offColor : '#ddd'} strokeWidth={1.5} transform={`rotate(45,${base.x},${base.y})`} />
              {base.b && !movingRunners?.length && ( <RunnerOnBase x={rx} y={ry} color={offColor} /> )}
            </g>
          );
        })}
        {movingRunners?.map((r, i) => <SVGRunner key={`mr${i}`} x={r.x} y={r.y} color={r.color} t={r.t} facingRight={r.facingRight} />)}
        {movingFielder?.id !== 'LF' && <SVGFielder x={F.LF.x} y={F.LF.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'CF' && <SVGFielder x={F.CF.x} y={F.CF.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'RF' && <SVGFielder x={F.RF.x} y={F.RF.y} color={defColor} glove="left" />}
        {movingFielder?.id !== 'F3B' && <SVGFielder x={F.F3B.x} y={F.F3B.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'SS' && <SVGFielder x={ssPos.x} y={ssPos.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'F2B' && <SVGFielder x={f2bPos.x} y={f2bPos.y} color={defColor} glove="left" />}
        {movingFielder?.id !== 'F1B' && <SVGFielder x={F.F1B.x} y={F.F1B.y} color={defColor} glove="left" />}
        {movingFielder?.id !== 'C' && !moundVisit && <SVGCatcher x={F.C.x} y={F.C.y - 8} color={defColor} signs={catcherSigns} />}
        {/* Mound visit — catcher animates out to the mound and back. While visible, the
            normal home-plate catcher is hidden. A tiny "talk" shimmer circles above the
            mound during the chat phase. */}
        {moundVisit && movingFielder?.id !== 'C' && (
          <g>
            <SVGCatcher x={moundVisit.x} y={moundVisit.y} color={defColor} isMoving={moundVisit.phase !== 'chat'} />
            {moundVisit.phase === 'chat' && (
              <g>
                <circle cx={moundVisit.x} cy={moundVisit.y - 20} r={3.2} fill="#fff" stroke={defColor} strokeWidth={0.6} opacity={0.85}>
                  <animate attributeName="opacity" values="0.5;0.95;0.5" dur="0.6s" repeatCount="indefinite" />
                </circle>
                <circle cx={moundVisit.x + 4} cy={moundVisit.y - 22} r={1.6} fill="#fff" stroke={defColor} strokeWidth={0.5} opacity={0.7}>
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="0.6s" begin="0.15s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>
        )}
        {/* Fielder position labels */}
        {[
          { id: 'LF', x: F.LF.x, y: F.LF.y + 22, label: 'LF' },
          { id: 'CF', x: F.CF.x, y: F.CF.y + 22, label: 'CF' },
          { id: 'RF', x: F.RF.x, y: F.RF.y + 22, label: 'RF' },
          { id: 'F3B', x: F.F3B.x, y: F.F3B.y + 22, label: '3B' },
          { id: 'SS', x: ssPos.x, y: ssPos.y + 22, label: 'SS' },
          { id: 'F2B', x: f2bPos.x, y: f2bPos.y + 22, label: '2B' },
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
        {/* K-Zone: Pitch location overlay near home plate — like a TV broadcast strike zone tracker */}
        {pitchLocations.length > 0 && (
          <g transform={`translate(${batterSide === 'L' ? F.HP.x - 55 : F.HP.x + 30}, ${F.HP.y - 42})`} opacity={0.75}>
            {/* Strike zone box */}
            <rect x={0} y={0} width={24} height={30} fill="none" stroke="#fff" strokeWidth={0.8} opacity={0.6} rx={1} />
            {/* Zone grid lines */}
            <line x1={8} y1={0} x2={8} y2={30} stroke="#fff" strokeWidth={0.3} opacity={0.3} />
            <line x1={16} y1={0} x2={16} y2={30} stroke="#fff" strokeWidth={0.3} opacity={0.3} />
            <line x1={0} y1={10} x2={24} y2={10} stroke="#fff" strokeWidth={0.3} opacity={0.3} />
            <line x1={0} y1={20} x2={24} y2={20} stroke="#fff" strokeWidth={0.3} opacity={0.3} />
            {/* Pitch dots with speed readout on latest pitch */}
            {pitchLocations.map((p, i) => {
              const dotX = 12 + p.x * 12; // map normalized [-1.7, 1.7] to SVG coords
              const dotY = 15 + p.y * 15;
              const color = p.type === 'strike' ? '#22c55e' : p.type === 'ball' ? '#ef4444' : '#eab308';
              const isLatest = i === pitchLocations.length - 1;
              return (
                <g key={`kz-${i}`}>
                  <circle cx={dotX} cy={dotY} r={isLatest ? 2.8 : 2} fill={color} opacity={isLatest ? 1 : 0.5} stroke={isLatest ? '#fff' : 'none'} strokeWidth={0.5} />
                  {isLatest && <circle cx={dotX} cy={dotY} r={2.8} fill="none" stroke={color} strokeWidth={0.6} opacity={0.6}>
                    <animate attributeName="r" values="2.8;5;2.8" dur="1s" repeatCount="2" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="1s" repeatCount="2" />
                  </circle>}
                  {/* Pitch speed readout on the latest pitch — broadcast-style velocity display */}
                  {isLatest && p.speed && (
                    <g>
                      <rect x={-2} y={33} width={28} height={9} rx={2} fill="rgba(0,0,0,0.75)" />
                      <text x={12} y={39.5} textAnchor="middle" fill={p.speed >= 96 ? '#ef4444' : p.speed >= 88 ? '#f59e0b' : '#94a3b8'} fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
                        {p.speed} mph
                      </text>
                      <text x={12} y={45} textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="sans-serif" opacity={0.8}>
                        {p.pitchType}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            {/* K-ZONE label */}
            <text x={12} y={-3} textAnchor="middle" fill="#fff" fontSize="4" fontWeight="bold" fontFamily="sans-serif" opacity={0.5}>K-ZONE</text>
          </g>
        )}
        {ballTrail.length > 0 && ballTrail.map((tp, i) => {
          const opacity = (i + 1) / ballTrail.length * 0.35;
          const r = 1.5 + (i / ballTrail.length) * 1.5;
          return <circle key={`bt${i}`} cx={tp.x} cy={tp.y} r={r} fill="#fff" opacity={opacity} />;
        })}
        {ballPos && ( <g><ellipse cx={ballPos.x} cy={ballPos.y + 3} rx={3} ry={1.2} fill="rgba(0,0,0,.12)" /><circle cx={ballPos.x} cy={ballPos.y} r={3.5} fill="#fff" stroke="#c00" strokeWidth={.7} /></g> )}
        {webGem && <WebGemSparkle x={webGem.x} y={webGem.y} />}
        {errorBobble && <ErrorBobble x={errorBobble.x} y={errorBobble.y} />}
        {brokenBat && <BrokenBat x={brokenBat.x} y={brokenBat.y} side={brokenBat.side} />}
        {/* Pickoff dive — runner briefly slides back to 1B. Ball is rendered by ballPos. */}
        {pickoffDive && (
          <g transform={`translate(${F.B1.x - 6},${F.B1.y + 2})`}>
            {/* Sliding diver silhouette pointing toward 1B */}
            <ellipse cx={0} cy={6} rx={8} ry={2} fill="rgba(0,0,0,.18)">
              <animate attributeName="opacity" values="0;0.3;0" dur="0.9s" fill="freeze" />
            </ellipse>
            <line x1={-8} y1={2} x2={6} y2={4} stroke={pickoffDive.color || '#b91c1c'} strokeWidth={2.6} strokeLinecap="round">
              <animate attributeName="x1" values="-4;-10;-8" dur="0.9s" fill="freeze" />
            </line>
            <circle cx={7} cy={2} r={3.2} fill="#f5d0a0" />
            {/* Dust puff */}
            {[0, 1, 2].map(i => (
              <circle key={`pod-${i}`} cx={-3 - i * 2} cy={5} r={1.2} fill="#d4a574" opacity={0.55}>
                <animate attributeName="r" from="1" to="3.5" dur="0.9s" fill="freeze" />
                <animate attributeName="opacity" from="0.55" to="0" dur="0.9s" fill="freeze" />
                <animate attributeName="cy" from="5" to={5 + (i - 1) * 2} dur="0.9s" fill="freeze" />
              </circle>
            ))}
          </g>
        )}
        <CrowdReactions reactions={crowdReactions} />
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
  const [hrDistance, setHrDistance] = useState(null); // Statcast-style HR distance readout (feet)
  const [popTime, setPopTime] = useState(null); // Catcher pop-time on SB attempts (seconds, e.g. 1.93)
  const [webGem, setWebGem] = useState(null);
  const [errorBobble, setErrorBobble] = useState(null); // { x, y } position of fielding error bobble animation
  const [umpirePhase, setUmpirePhase] = useState('idle');
  const [scoringFlash, setScoringFlash] = useState(null); // { team: 0|1, runs: N }
  const [pitchMilestone, setPitchMilestone] = useState(null); // { count: 50|75|100, team: 'name' }
  const [clutchBadge, setClutchBadge] = useState(null); // { batter: 'name', team: 0|1 }
  const [leadChangeBadge, setLeadChangeBadge] = useState(null); // { type: 'leadChange'|'tied', teamName: string }
  const [walkUpStats, setWalkUpStats] = useState(null); // { name, avg, abH, hr, rbi }
  const [cycleWatch, setCycleWatch] = useState(null); // { batter: 'name', team: 0|1, completed: bool }
  const [showPostGame, setShowPostGame] = useState(false);
  const [crowdReactions, setCrowdReactions] = useState([]); // floating text bubbles in stands
  const [grooveBadge, setGrooveBadge] = useState(null); // { type: 'groove'|'struggling', team: 'name' }
  const [pitchLocations, setPitchLocations] = useState([]); // K-Zone pitch dots: [{ x, y, type: 'strike'|'ball'|'foul' }]
  const [catcherSigns, setCatcherSigns] = useState(0); // 0 = hidden, 1-4 = number of fingers flashed during windup
  const [firstPitchStrikeBadge, setFirstPitchStrikeBadge] = useState(null); // brief "1ST-PITCH STRIKE" flash, { team: 'name' }
  const [moundVisit, setMoundVisit] = useState(null); // { x, y, progress, phase } — catcher walking to mound
  const [grdBadge, setGrdBadge] = useState(null); // brief "GROUND RULE DOUBLE" badge flash, { team: 0|1 }
  const [pickoffBadge, setPickoffBadge] = useState(null); // brief "PICKOFF!" or "CLOSE AT 1ST" badge, { outcome: 'out'|'safe', team: 0|1 }
  const [pickoffDive, setPickoffDive] = useState(null); // brief "runner dives back" animation, { color }
  const [leadCaution, setLeadCaution] = useState(1); // Runner leadoff scale 0..1 — drops after a pickoff throw so the next 1-2 leads read as cautious, then decays back to full.
  const [brokenBat, setBrokenBat] = useState(null); // { x, y, side: 'L'|'R' } — flying bat-barrel piece
  const [passedBallBadge, setPassedBallBadge] = useState(null); // { batter, team } — dropped 3rd strike badge flash
  const [pitchClockBadge, setPitchClockBadge] = useState(null); // { team: 'name', violator: 'pitcher'|'batter' } — modern MLB pitch clock violation flash
  const crowdIdRef = useRef(0); // unique id for crowd reaction elements
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
  const prevLeadRef = useRef(null); // 0 = away leads, 1 = home leads, null = tied

  useEffect(() => { sndRef.current = soundOn; spdRef.current = autoSpeed; }, [soundOn, autoSpeed]);
  useEffect(() => { return () => { if (animRef.current) cancelAnimationFrame(animRef.current); if (runnerAnimRef.current) cancelAnimationFrame(runnerAnimRef.current); if (fielderAnimRef.current) cancelAnimationFrame(fielderAnimRef.current); if (plateAnimRef.current) cancelAnimationFrame(plateAnimRef.current); if (moundVisitRef.current) cancelAnimationFrame(moundVisitRef.current); }; }, []);
  useEffect(() => { if (!autoPlay || phase !== 'playing') return; const id = setInterval(() => { if (procRef.current || gs.current.gameOver) return; doDrawCard(); }, autoSpeed); return () => clearInterval(id); }, [autoPlay, autoSpeed, phase]);

  // Clear K-Zone pitch dots when batter changes or game resets
  useEffect(() => { setPitchLocations([]); }, [activeBatter]);

  // Generate a pitch location dot for the K-Zone overlay
  // Strike zone is roughly a rectangle; strikes land inside, balls outside, fouls on edges
  function addPitchLocation(type, pitchType) {
    // Zone coords relative to a normalized box: x in [-1,1], y in [-1,1] where (0,0) is zone center
    let px, py;
    const pt = pitchType || randomPitch();
    const speed = generatePitchSpeed(pt);
    if (type === 'strike') {
      // Strikes: inside the zone with some scatter
      px = (Math.random() - 0.5) * 1.6; // -0.8 to 0.8
      py = (Math.random() - 0.5) * 1.6;
    } else if (type === 'ball') {
      // Balls: outside the zone
      const side = Math.floor(Math.random() * 4);
      if (side === 0) { px = -1.1 - Math.random() * 0.6; py = (Math.random() - 0.5) * 2.4; } // left
      else if (side === 1) { px = 1.1 + Math.random() * 0.6; py = (Math.random() - 0.5) * 2.4; } // right
      else if (side === 2) { px = (Math.random() - 0.5) * 2.4; py = -1.1 - Math.random() * 0.6; } // high
      else { px = (Math.random() - 0.5) * 2.4; py = 1.1 + Math.random() * 0.6; } // low
    } else {
      // Fouls: edges of the zone
      px = (Math.random() - 0.5) * 2.2;
      py = (Math.random() - 0.5) * 2.2;
    }
    setPitchLocations(prev => [...prev, { x: px, y: py, type, speed, pitchType: pt }]);
  }

  // Walk-up stats overlay: show brief batter stats chyron when active batter changes
  useEffect(() => {
    if (phase !== 'playing' || !activeBatter || gs.current.gameOver) return;
    const bt = gs.current.half;
    const S = statsRef.current[bt][activeBatter];
    if (!S) return;
    const avg = S.ab === 0 ? '---' : (S.h / S.ab).toFixed(3).replace(/^0/, '');
    const abH = `${S.h}-for-${S.ab}`;
    setWalkUpStats({ name: activeBatter, avg, abH, hr: S.hr, rbi: S.rbi });
    const timer = setTimeout(() => setWalkUpStats(null), 2800);
    return () => clearTimeout(timer);
  }, [activeBatter, phase]);

  function rerender() { setRenderTick(t => t + 1); }
  function triggerFireworks() { setShowFW(true); setFwKey(k => k + 1); setTimeout(() => setShowFW(false), 4500); }
  function addLog(text, type = 'play') { setLog(p => [...p, { text, type }]); }

  // Crowd reaction text bubbles — spawn floating text in the stands area behind the outfield fence
  function triggerCrowdReaction(eventType, battingTeam) {
    const reactions = CROWD_REACTIONS[eventType];
    if (!reactions) return;
    // Home crowd cheers for home team (bt=1), boos for away (bt=0)
    const isHomeBatting = battingTeam === 1;
    // For defensive plays (strikeout, doublePlay, webGem), flip — home crowd cheers when the home team is on defense
    const isDefPlay = ['strikeout', 'webGem', 'doublePlay'].includes(eventType);
    const homeFavorable = isDefPlay ? !isHomeBatting : isHomeBatting;
    const pool = homeFavorable ? reactions.positive : reactions.negative;
    // Spawn 3-5 reactions at random positions in the stands/sky area
    const count = 3 + Math.floor(Math.random() * 3);
    const newReactions = [];
    for (let i = 0; i < count; i++) {
      const x = 80 + Math.random() * 460; // spread across the outfield area
      const y = 55 + Math.random() * 50;  // in the stands zone above the field
      const text = pick(pool);
      const colors = homeFavorable
        ? ['#fff', '#fbbf24', '#f0f0f0', '#fde68a', '#bef264']
        : ['#f87171', '#fca5a5', '#d4d4d4', '#fbbf24'];
      newReactions.push({
        id: crowdIdRef.current++,
        x, y, text,
        color: pick(colors),
        stroke: '#000',
        size: 6 + Math.floor(Math.random() * 4),
      });
    }
    setCrowdReactions(newReactions);
    setTimeout(() => setCrowdReactions([]), 2200);
  }
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

  // Mound visit — catcher jogs out from behind the plate to the mound for a
  // brief conference with the pitcher, then jogs back. No mechanical effect on
  // the game state; purely atmospheric pre-pitch flavor to mirror real MLB
  // broadcasts. Total duration ~2100ms: walk out (650) → chat (700) → walk back (650) → settle (100).
  function animateMoundVisit(onComplete) {
    const startX = F.C.x, startY = F.C.y - 8;
    const moundX = F.MOUND.x, moundY = F.MOUND.y + 6;
    const walkOut = 650, chat = 700, walkBack = 650;
    const total = walkOut + chat + walkBack;
    const s = performance.now();
    function tick(now) {
      const elapsed = now - s;
      const rawT = Math.min(1, elapsed / total);
      let x, y, phase;
      if (elapsed < walkOut) {
        const t = elapsed / walkOut;
        x = lerp(startX, moundX, t);
        y = lerp(startY, moundY, t);
        phase = 'out';
      } else if (elapsed < walkOut + chat) {
        x = moundX; y = moundY;
        phase = 'chat';
      } else if (elapsed < total) {
        const t = (elapsed - walkOut - chat) / walkBack;
        x = lerp(moundX, startX, t);
        y = lerp(moundY, startY, t);
        phase = 'back';
      } else {
        x = startX; y = startY;
        phase = 'done';
      }
      setMoundVisit({ x, y, progress: rawT, phase });
      if (elapsed < total) moundVisitRef.current = requestAnimationFrame(tick);
      else { setTimeout(() => { setMoundVisit(null); if (onComplete) onComplete(); }, 100); }
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
    setPlayHistory([]); setReplayIdx(-1); setHalfStartIdx(0); setDrawnPile([]); setDispensedCard(null); setDispensing(false); setOutcome(null); setShowFW(false); setAutoPlay(false); setBallPos(null); setPitchPhase('idle'); setBatterPhase('stance'); setAnnounceText(''); setExitVelo(null); setHrDistance(null); setPopTime(null); setPlatePlay(null); setUmpirePhase('idle'); setScoringFlash(null); setPitchMilestone(null); setClutchBadge(null); setLeadChangeBadge(null); setCycleWatch(null); setWalkUpStats(null); setCrowdReactions([]); setGrooveBadge(null); setPitchLocations([]); setErrorBobble(null); setCatcherSigns(0); setFirstPitchStrikeBadge(null); setMoundVisit(null); setGrdBadge(null); setPickoffBadge(null); setPickoffDive(null); setLeadCaution(1); setBrokenBat(null); setPassedBallBadge(null); setPitchClockBadge(null); prevLeadRef.current = null; setShowPostGame(false); setActiveBatter(teams[0].players[0]); shuffleDeck(); setPhase('playing'); rerender();
  }

  function doDrawCard() {
    if (procRef.current || gs.current.gameOver) return;
    procRef.current = true; setReplayIdx(-1);
    const thisPlayId = ++playIdRef.current;
    const bt = gs.current.half, batter = teams[bt].players[gs.current.batterIdx[bt]];
    setActiveBatter(batter);

    // Balk mechanic: rare pitching infraction (~1.5% per pitch with runners on base).
    // The umpire calls a balk on the pitcher; all runners advance one base and a
    // runner on 3rd scores. Does not count as a pitch, ball, or at-bat — no card is
    // drawn, the count is untouched, and no outs are added. Classic baseball oddity.
    const hasRunnerOnBase = gs.current.bases.some(r => r);
    if (hasRunnerOnBase && Math.random() < 0.015) {
      const preBases = [...gs.current.bases];
      const balkRuns = preBases[2] ? 1 : 0;
      const balkBases = [null, preBases[0], preBases[1]];
      const balkTexts = [
        `BALK! The umpire catches the pitcher flinching — all runners advance a base.`,
        `BALK called! He double-clutched on the delivery and the ump waves every runner up.`,
        `BALK! A costly mistake from the mound — every runner moves up ninety feet.`
      ];
      const balkNarText = pick(balkTexts);
      setAnnounceText(balkNarText);
      addLog(balkNarText, 'play');
      if (sndRef.current) playSoundLocal('balk');
      // Brief aborted motion: pitcher starts windup, then the umpire waves it off
      setPitchPhase('windup');
      setTimeout(() => {
        if (playIdRef.current !== thisPlayId) return;
        setPitchPhase('idle');
        // Animate runners advancing one base each
        const rps = [];
        if (preBases[2]) rps.push([F.B3, F.HP]);
        if (preBases[1]) rps.push([F.B2, F.B3]);
        if (preBases[0]) rps.push([F.B1, F.B2]);
        if (rps.length) animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', 800);
        setTimeout(() => {
          if (playIdRef.current !== thisPlayId) return;
          gs.current.bases = balkBases;
          if (balkRuns > 0) {
            gs.current.innings[bt][gs.current.innings[bt].length - 1] += balkRuns;
            setScoringFlash({ team: bt, runs: balkRuns });
            setTimeout(() => setScoringFlash(null), 2000);
            // Lead change detection on balk-scored runs
            const balkAway = gs.current.innings[0].reduce((a, b) => a + b, 0);
            const balkHome = gs.current.innings[1].reduce((a, b) => a + b, 0);
            const balkLead = balkAway > balkHome ? 0 : balkHome > balkAway ? 1 : null;
            if (balkLead !== prevLeadRef.current) {
              if (balkLead === null) { setLeadChangeBadge({ type: 'tied', teamName: teams[bt].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
              else if (prevLeadRef.current !== null && balkLead !== prevLeadRef.current) { setLeadChangeBadge({ type: 'leadChange', teamName: teams[balkLead].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
            }
            prevLeadRef.current = balkLead;
          }
          let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
          setPlayHistory(p => [...p, { card: null, outcome: 'balk', narration: balkNarText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isBalk: true, balkRuns }]);
          // Walk-off check: a balk in the bottom of the 9th+ that scores the go-ahead run ends the game.
          if (balkRuns > 0 && bt === 1 && gs.current.inning >= 9) {
            const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
            const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
            if (homeTotal > awayTotal) {
              gs.current.gameOver = true;
              gs.current.message = `${teams[1].name} win on a walk-off balk! Final: ${homeTotal}-${awayTotal}`;
              triggerFireworks(); triggerFireworks();
              if (sndRef.current) setTimeout(() => playSoundLocal('walkOff'), 400);
              setTimeout(() => setAnnounceText(`WALK-OFF BALK! ${teams[1].name} win!`), 600);
              setAutoPlay(false);
              setTimeout(() => setShowPostGame(true), 3500);
            }
          }
          procRef.current = false;
          rerender();
        }, 850);
      }, 500);
      return;
    }

    // Pickoff attempt: ~2.2% chance per pitch with a runner on 1st (only). The pitcher
    // spins and throws over to the first baseman. Most of the time the runner dives back
    // safely; ~14% of attempts actually pick the runner off. Does NOT count as a pitch:
    // no card drawn, no pitch count increment, ball/strike count untouched. If the pickoff
    // is the 3rd out, transitions the half-inning. Classic baseball flavor.
    if (gs.current.bases[0] && !gs.current.gameOver && Math.random() < 0.022) {
      const preBases = [...gs.current.bases];
      const runnerName = gs.current.bases[0];
      const pickoffOut = Math.random() < 0.14;
      const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
      const poTexts = pickoffOut
        ? [
            `PICKOFF! ${runnerName} is caught leaning off first — he's OUT!`,
            `Got him! The pitcher picks ${runnerName} off at first base!`,
            `Pickoff at first! ${runnerName} couldn't get back in time — a huge out for the defense.`
          ]
        : [
            `Throw over to first — ${runnerName} dives back safely.`,
            `Pickoff attempt! ${runnerName} scrambles back to the bag just in time.`,
            `The pitcher throws over — ${runnerName} gets back. No play.`
          ];
      const poText = pick(poTexts);
      setAnnounceText(poText);
      addLog(poText, 'play');
      setPitchPhase('windup');
      setTimeout(() => {
        if (playIdRef.current !== thisPlayId) return;
        setPitchPhase('idle');
        // Ball from P → F1B
        animateBall(linePts(F.P, F.B1, 14), 380, () => {
          setBallPos(null);
          if (sndRef.current) playSoundLocal('glovePop');
          // Show runner diving back (brief animation)
          setPickoffDive({ color: offColor });
          setTimeout(() => setPickoffDive(null), 900);
          setTimeout(() => {
            if (playIdRef.current !== thisPlayId) return;
            if (pickoffOut) {
              gs.current.bases[0] = null;
              gs.current.outs++;
              // Count as caught-stealing for the runner (official scoring is picked off = CS on basepath)
              if (statsRef.current[bt][runnerName]) statsRef.current[bt][runnerName].cs++;
              // Pitcher "retires" a baserunner, resetting struggling-accumulator feel is not needed:
              // halfInningReached doesn't reset on pickoff (runner was already counted). But consecutiveRetired
              // isn't incremented either, since pickoff isn't a batter retired — conservative.
              setPickoffBadge({ outcome: 'out', team: 1 - bt });
              setTimeout(() => setPickoffBadge(null), 2600);
              let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
              setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: true }]);
              // 3rd out check — if pickoff ends the half-inning, transition (or end game)
              if (gs.current.outs >= 3) {
                const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
                const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
                const isTopOf9thPlus = bt === 0 && gs.current.inning >= 9;
                const isBotOf9thPlus = bt === 1 && gs.current.inning >= 9;
                // Game-over: top of 9th+ with home leading (pickoff 3rd out ends the game),
                // or bottom of 9th+ with away leading and no walk-off runs in play.
                if ((isTopOf9thPlus && homeTotal > awayTotal) || (isBotOf9thPlus && awayTotal > homeTotal)) {
                  const winTeamIdx = homeTotal > awayTotal ? 1 : 0;
                  gs.current.gameOver = true;
                  gs.current.message = `${teams[winTeamIdx].name} win! Final: ${winTeamIdx === 1 ? homeTotal : awayTotal}-${winTeamIdx === 1 ? awayTotal : homeTotal}`;
                  setAutoPlay(false);
                  procRef.current = false;
                  setTimeout(() => setShowPostGame(true), 2000);
                  rerender();
                  return;
                }
                procRef.current = true; // keep locked; transitionHalf releases
                setTimeout(() => transitionHalf(), 900);
                rerender();
                return;
              }
              procRef.current = false;
              rerender();
            } else {
              setPickoffBadge({ outcome: 'safe', team: 1 - bt });
              setTimeout(() => setPickoffBadge(null), 2200);
              // Runner plays the next pitch cautiously — smaller lead, then decays back to full.
              setLeadCaution(0.35);
              setTimeout(() => setLeadCaution(0.65), 2400);
              setTimeout(() => setLeadCaution(1), 4800);
              let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
              setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: false }]);
              // Ball back to pitcher
              animateBall(linePts(F.B1, F.P, 12), 360, () => {
                setBallPos(null);
                procRef.current = false;
                rerender();
              });
            }
          }, 480);
        });
      }, 450);
      return;
    }

    // Mound visit: ~1.5% chance per pitch that the catcher jogs out to chat with the
    // pitcher. Gated to situations that make narrative sense — runners on base, or a
    // deep count (2+ balls), or after a hot start for the opposing offense (3+ base-
    // runners allowed in the current half-inning). Never triggers in the first ~20
    // pitches of a game so the opening innings don't feel interrupted. Purely visual;
    // no mechanical effect on the game state (doesn't count as a pitch, doesn't reset
    // the count, doesn't change stats).
    const mvDefIdx = 1 - gs.current.half;
    const mvEligible = !gs.current.gameOver && gs.current.pitchCount[mvDefIdx] >= 20 &&
      (hasRunnerOnBase || gs.current.count.balls >= 2 || gs.current.halfInningReached >= 3);
    if (mvEligible && Math.random() < 0.015) {
      const mvTexts = [
        `Mound visit — the catcher heads out to calm down the pitcher.`,
        `The catcher jogs out to the mound for a quick chat.`,
        `Time out called. The catcher and pitcher meet on the mound.`
      ];
      const mvText = pick(mvTexts);
      addLog(mvText, 'info');
      animateMoundVisit(() => {
        if (playIdRef.current !== thisPlayId) return;
        // After the visit, release procRef and re-dispatch so the play flows naturally.
        // We deliberately do NOT consume the pitch or draw a card here.
        procRef.current = false;
        doDrawCard();
      });
      return;
    }

    // Pitch clock violation (Backlog #69) — modern MLB rule. ~0.3% chance per pitch that
    // the umpire calls a pitch clock violation. 65% of the time the pitcher is late with
    // his delivery → automatic ball added to the count. 35% of the time the batter isn't
    // alert in the box → automatic strike added to the count. No pitch is thrown, no card
    // is drawn, and no pitch count is incremented. We intentionally skip this branch when
    // the count is already at a walk/K threshold (balls=3 for pitcher, strikes=2 for
    // batter) so the addition is purely atmospheric without triggering a chain of free
    // walks or strikeouts from the mechanic.
    if (!gs.current.gameOver && Math.random() < 0.003) {
      const pitcherEligible = gs.current.count.balls < 3;
      const batterEligible = gs.current.count.strikes < 2;
      if (pitcherEligible || batterEligible) {
        // Weighted roll: 65% pitcher violation, 35% batter violation, but only from eligible options.
        let violator;
        if (pitcherEligible && batterEligible) violator = Math.random() < 0.65 ? 'pitcher' : 'batter';
        else violator = pitcherEligible ? 'pitcher' : 'batter';

        const preBalls = gs.current.count.balls;
        const preStrikes = gs.current.count.strikes;
        const pitcherTexts = [
          `Pitch clock violation on the pitcher! Automatic ball added to the count.`,
          `Late to the set position — the umpire calls a pitch clock violation. Ball added.`,
          `Clock runs down on the mound! Pitch clock violation — the count goes to ${preBalls + 1}-${preStrikes}.`
        ];
        const batterTexts = [
          `Pitch clock violation on the batter! Automatic strike added to the count.`,
          `The batter isn't in the box in time — the umpire calls a pitch clock violation. Strike added.`,
          `Clock runs down at the plate! Pitch clock violation on the hitter — the count goes to ${preBalls}-${preStrikes + 1}.`
        ];
        const pcText = pick(violator === 'pitcher' ? pitcherTexts : batterTexts);
        setAnnounceText(pcText);
        addLog(pcText, 'play');
        // Reuse the balk whistle sound — the umpire's quick two-tone signal fits a clock call.
        if (sndRef.current) playSoundLocal('balk');

        if (violator === 'pitcher') gs.current.count.balls = preBalls + 1;
        else gs.current.count.strikes = preStrikes + 1;

        setPitchClockBadge({ team: teams[1 - bt].name, violator });
        setTimeout(() => setPitchClockBadge(null), 2600);

        let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
        setPlayHistory(p => [...p, { card: null, outcome: 'pitchClock', narration: pcText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases: [...gs.current.bases], team: bt, pileSnapshot: cp, isPitchClock: true, pitchClockViolator: violator, preBalls, preStrikes }]);

        procRef.current = false;
        rerender();
        return;
      }
    }

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
            // Lead change detection on IBB scoring
            const ibbAway = gs.current.innings[0].reduce((a, b) => a + b, 0);
            const ibbHome = gs.current.innings[1].reduce((a, b) => a + b, 0);
            const ibbLead = ibbAway > ibbHome ? 0 : ibbHome > ibbAway ? 1 : null;
            if (ibbLead !== prevLeadRef.current) {
              if (ibbLead === null) { setLeadChangeBadge({ type: 'tied', teamName: teams[bt].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
              else if (prevLeadRef.current !== null && ibbLead !== prevLeadRef.current) { setLeadChangeBadge({ type: 'leadChange', teamName: teams[ibbLead].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
            }
            prevLeadRef.current = ibbLead;
          }
          gs.current.reachedBase[bt]++;
          gs.current.rallyCount++;
          gs.current.bb[1 - bt]++; // IBB counts as a walk (BB) for the pitcher
          // IBB resets pitcher groove and counts toward struggling
          gs.current.consecutiveRetired[1 - bt] = 0;
          gs.current.halfInningReached++;
          setGrooveBadge(prev => prev?.type === 'groove' && prev.team === teams[1 - bt].name ? null : prev);
          if (gs.current.halfInningReached >= 3) setGrooveBadge({ type: 'struggling', team: teams[1 - bt].name });
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
    // First-pitch strike tracking (broadcast-style FPS% stat). A "first pitch" is a
    // pitch thrown with a 0-0 count. Strike = called strike, swinging strike, foul
    // ball, or ball put in play. Ball and HBP do not count. Flash a brief badge in
    // the info bar whenever the defensive pitcher paints the first-pitch strike.
    const isFirstPitch = gs.current.count.balls === 0 && gs.current.count.strikes === 0;
    if (isFirstPitch) {
      gs.current.fpOpps[defTeam]++;
      if (oc !== 'ball' && oc !== 'hbp') {
        gs.current.fps[defTeam]++;
        setFirstPitchStrikeBadge({ team: teams[defTeam].name });
        setTimeout(() => setFirstPitchStrikeBadge(null), 1800);
      }
    }
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
    // Ground rule double detection (~6% of doubles). The ball bounces over the
    // outfield wall into the stands — dead-ball, all runners limited to +2 bases
    // each. In this simplified game engine, a regular double already advances
    // runners by exactly two bases (runner on 1st goes to 3rd, doesn't score), so
    // the mechanical outcome is identical. The GRD flag exists purely to drive a
    // distinct narration, a "GROUND RULE DOUBLE" badge, and a ball-over-the-wall
    // animation — a small but iconic broadcast touch. Flag is threaded through
    // play history for replay consistency.
    const isGRD = oc === 'double' && Math.random() < 0.06;
    const nar = narrateLocal(oc, batter, gs.current.bases, res.runs, gs.current.outs, Math.floor(Math.random() * 5));
    if (isGRD) {
      const grdTexts = [
        `Ground rule double! The ball bounces over the wall into the stands.${res.runs > 0 ? ` ${res.runs === 1 ? '1 run scores!' : `${res.runs} runs score!`}` : ''}`,
        `GROUND RULE DOUBLE! A one-hopper that carries right over the fence.${res.runs > 0 ? ` ${res.runs === 1 ? '1 run scores!' : `${res.runs} runs score!`}` : ''}`,
        `That ball takes a high bounce and sails over the wall — ground rule double for ${batter}.${res.runs > 0 ? ` ${res.runs === 1 ? '1 run scores!' : `${res.runs} runs score!`}` : ''}`
      ];
      nar.text = pick(grdTexts);
      nar.isGRD = true;
    }
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
    // Dropped third strike / passed ball (Backlog #67) — ~4% of strikeouts where first
    // base is OPEN, the catcher can't hold on and the batter legs it out to 1B safely.
    // Requirement: 1B must be empty (we avoid forcing the existing 1B runner). The K
    // is still credited to the pitcher (kCount increments normally below), but no out
    // is added and the batter ends the play on 1B. We reuse the existing reached-base
    // / rally / groove pathways by flagging nar.isDropped3rd and handling it in
    // processOutcome. A "DROPPED 3RD STRIKE" info-bar badge flashes and a new
    // passedBall sound plays at the catcher. Note: we avoid triggering on isCalledK
    // here because strikeouts from the 'strike' card (3 strikes called) go through a
    // different path (bD via 'strike' outcome, not oc === 'strikeout').
    const isDropped3rd = oc === 'strikeout' && !gs.current.bases[0] && Math.random() < 0.04;
    if (isDropped3rd) {
      // Batter reaches 1B on a passed third strike. Preserve runners on 2B / 3B.
      res.outsAdded = 0;
      res.nextBases = [...res.nextBases];
      res.nextBases[0] = batter;
      const d3Texts = [
        `Dropped third strike! The catcher can't hold on — ${batter} hustles down to first!`,
        `Strike three... but the ball gets away! ${batter} reaches first base on the passed ball!`,
        `Ball in the dirt on strike three! ${batter} beats the throw to first — K recorded, but he's aboard!`,
      ];
      nar.text = pick(d3Texts);
      nar.isDropped3rd = true;
      setPassedBallBadge({ batter, team: bt });
      setTimeout(() => setPassedBallBadge(null), 3200);
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
    // Catcher flashes signs (1-4 fingers) between his legs during the windup — the classic
    // pre-pitch tell. A fresh random count is picked per pitch so signs animate visibly.
    const signCount = 1 + Math.floor(Math.random() * 4);
    if (doesStepOut) {
      setBatterPhase('stepOut');
      setTimeout(() => setBatterPhase('stance'), 800);
      setTimeout(() => { setPitchPhase('windup'); setCatcherSigns(signCount); }, stepOutDelay);
    } else {
      setPitchPhase('windup'); setBatterPhase('stance'); setCatcherSigns(signCount);
    }
    setTimeout(() => {
      setPitchPhase('throw'); setCatcherSigns(0);
      animateBall(linePts(F.P, { x: F.HP.x, y: F.HP.y - 5 }, 16), 550, () => {
        if (!doesSwing(oc)) {
          if (stolenBaseEvent) {
            const sbe = stolenBaseEvent; const startPos = [F.B1, F.B2, F.B3][sbe.from]; const endPos = [F.B1, F.B2, F.B3][sbe.to];
            // Statcast-style catcher pop-time readout: time from ball hitting catcher's mitt
            // to the fielder catching the throw at the next base. Elite <1.90, avg 1.90-2.05,
            // slow >2.05. Biased slightly slower on successful steals (tips the outcome).
            const popBase = sbe.success ? 2.02 : 1.90;
            const popTimeVal = Math.round((popBase + (Math.random() - 0.5) * 0.22) * 100) / 100;
            setPopTime(popTimeVal);
            setTimeout(() => setPopTime(null), 2800);
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
    // Broken bat: ~4% chance on weak-contact outcomes. The bat visibly splinters
    // as the batter swings — barrel piece spins away, splinters scatter, CRACK!
    // Purely visual/sound flavor — no mechanical effect on the outcome.
    const isWeakContact = ['groundOut', 'flyOut', 'single', 'foulOut', 'lineOut'].includes(oc);
    const isBrokenBat = isWeakContact && Math.random() < 0.04;
    if (doesSwing(oc)) {
      setTimeout(() => {
        setBatterPhase(oc === 'bunt' ? 'bunt' : 'swing'); if (sndRef.current && !['ball', 'strike', 'walk', 'hbp'].includes(oc)) playSoundLocal('hit');
        // Broken bat flourish: trigger a flying barrel piece and a wood-crack sound
        // right on contact. Position is the batter's box (opposite side of home plate
        // from which hand they bat with), so the barrel flies toward the mound/infield.
        if (isBrokenBat) {
          const bbX = F.HP.x + (batterSide === 'L' ? -14 : 14);
          const bbY = F.HP.y - 14;
          setBrokenBat({ x: bbX, y: bbY, side: batterSide });
          if (sndRef.current) setTimeout(() => playSoundLocal('batCrack'), 20);
          setTimeout(() => setBrokenBat(null), 950);
        }
        setAnnounceText(nar.text);
        // Exit velocity display (Statcast-style)
        const ev = generateExitVelo(oc);
        if (ev) { setExitVelo(ev); setTimeout(() => setExitVelo(null), 2500); }
        // HR distance readout (Statcast-style) — show alongside exit velo on home runs
        if (oc === 'homeRun') {
          const dist = generateHRDistance(ev);
          if (dist) { setHrDistance(dist); setTimeout(() => setHrDistance(null), 3500); }
        }
        if (['single', 'double', 'triple', 'homeRun', 'error', 'groundOut', 'doublePlay', 'bunt'].includes(oc) || (res.isSacFly && ['flyOut', 'lineOut'].includes(oc))) {
           const runnerOc = oc === 'bunt' ? 'single' : (res.isSacFly ? 'sacFly' : oc);
           const rps = computeRunnerPaths([...gs.current.bases], runnerOc);
           const troDur = oc === 'homeRun' ? 6500 : 2500;
           animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', troDur);
           if (rps.some(p => p[0].x === F.HP.x)) {
             if (oc === 'homeRun') {
               // Bat flip: swing → batFlip (400ms) → gone (after 800ms flip animation)
               setTimeout(() => setBatterPhase('batFlip'), 400);
               setTimeout(() => setBatterPhase('gone'), 1200);
             } else {
               setTimeout(() => setBatterPhase('gone'), 500);
             }
           }
           setTimeout(() => { if (playIdRef.current === thisPlayId) { gs.current.bases = res.nextBases; rerender(); } }, troDur);
        } else if (nar.isDropped3rd) {
           // Dropped third strike: batter sprints HP → 1B while the catcher scrambles.
           // Preserve any existing runners on 2B/3B by only animating the batter.
           const troDur = 2200;
           animateRunners([[F.HP, F.B1]], bt === 0 ? '#b91c1c' : '#1e40af', troDur);
           setTimeout(() => setBatterPhase('gone'), 500);
           setTimeout(() => { if (playIdRef.current === thisPlayId) { gs.current.bases = res.nextBases; rerender(); } }, troDur);
        }
      }, 1050 + stepOutDelay);
      setTimeout(() => {
        setPitchPhase('idle'); setOutcome(oc);
        const ba = genBallAnimLocal(oc, nar.dir, nar.sub, nar.variant, isGRD);
        // Ground rule double: flash a badge and play a fence-hit sound at the bounce moment.
        if (isGRD) {
          setGrdBadge({ team: bt });
          setTimeout(() => setGrdBadge(null), 3200);
          if (sndRef.current) setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.5);
        }
        if (sndRef.current && ba.carom && !isGRD) { setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.65); }
        if (sndRef.current && oc === 'homeRun' && (nar.sub === 'lf' || nar.sub === 'rf') && Math.random() < 0.35) { setTimeout(() => playSoundLocal('foulPole'), ba.dur * 0.5); }
        const isH = ['single', 'double', 'triple', 'error'].includes(oc), isG = ['groundOut', 'doublePlay', 'bunt'].includes(oc);
        if (['flyOut', 'lineOut', 'foulOut'].includes(oc)) {
          const fk = (oc === 'foulOut') ? 'C' : (OF_MAP[nar.sub] || INF_MAP[nar.sub]);
          if (fk) animateFielder(fk, F[fk], ba.target, ba.dur);
          // Web gem sparkle effect at catch point
          if (isWebGem && ba.target) {
            setTimeout(() => { setWebGem({ x: ba.target.x, y: ba.target.y }); setTimeout(() => setWebGem(null), 1200); }, ba.dur);
            setTimeout(() => triggerCrowdReaction('webGem', bt), ba.dur + 200);
          }
        } else if (isG) {
          const fk = INF_MAP[nar.sub] || 'SS'; animateFielder(fk, F[fk], ba.target, ba.dur);
        } else if (isH && !isGRD) {
          const ofk = OF_MAP[nar.sub] || 'CF'; animateFielder(ofk, F[ofk], ba.target, ba.dur + 500);
          // Error bobble animation at the fielder's target position
          if (oc === 'error' && ba.target) {
            setTimeout(() => {
              setErrorBobble({ x: ba.target.x, y: ba.target.y });
              if (sndRef.current) playSoundLocal('bobble');
              setTimeout(() => setErrorBobble(null), 1300);
            }, ba.dur + 200);
          }
        }
        animateBall(ba.path, ba.dur, () => {
          if (isGRD) {
            // Dead ball — it's in the stands. No throw-back; just pause briefly
            // for the runners to reach their limit before resolving the outcome.
            setTimeout(() => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }, 700);
          } else if (isH) {
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
          } else if (nar.isDropped3rd) {
            // Ball reaches the catcher, who can't hold on — passed-ball sound fires,
            // the ball dribbles free, and we hold briefly while the batter sprints to 1B.
            if (sndRef.current) playSoundLocal('passedBall');
            setTimeout(() => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }, 900);
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
    let nO = g.outs + res.outsAdded, bD = false, isCalledK = false, isBallFourWalk = false;
    if (oc === 'ball') { g.count.balls++; addPitchLocation('ball'); if (g.count.balls >= 4) { bD = true; isBallFourWalk = true; } }
    else if (oc === 'strike') { g.count.strikes++; addPitchLocation('strike'); if (g.count.strikes >= 3) { nO++; bD = true; isCalledK = true; } }
    else if (oc === 'foulBall') { addPitchLocation('foul'); if (g.count.strikes < 2) g.count.strikes++; }
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
    // Cycle watch: track hit types per batter and detect when nearing or completing the cycle
    if (['single', 'double', 'triple', 'homeRun'].includes(oc)) {
      S.hitTypes.add(oc);
      if (S.hitTypes.size === 4) {
        // HITTING FOR THE CYCLE! — rare baseball achievement
        setCycleWatch({ batter: bat, team: bt, completed: true });
        triggerFireworks();
        setTimeout(() => triggerFireworks(), 600);
        if (sndRef.current) setTimeout(() => playSoundLocal('walkOff'), 500);
        setTimeout(() => setAnnounceText(`🚴 ${bat} HAS HIT FOR THE CYCLE! 🚴`), 800);
        setTimeout(() => setCycleWatch(null), 6000);
      } else if (S.hitTypes.size === 3) {
        // 3 of 4 — cycle watch!
        const needed = ['single', 'double', 'triple', 'homeRun'].find(t => !S.hitTypes.has(t));
        const needLabel = needed === 'homeRun' ? 'HR' : needed === 'single' ? '1B' : needed === 'double' ? '2B' : '3B';
        setCycleWatch({ batter: bat, team: bt, completed: false, needed: needLabel });
        setTimeout(() => setCycleWatch(null), 4000);
      }
    } else if (oc === 'bunt' && res.outsAdded === 0) {
      // Bunt single counts as a single for cycle purposes
      S.hitTypes.add('single');
      if (S.hitTypes.size === 4) {
        setCycleWatch({ batter: bat, team: bt, completed: true });
        triggerFireworks();
        setTimeout(() => triggerFireworks(), 600);
        if (sndRef.current) setTimeout(() => playSoundLocal('walkOff'), 500);
        setTimeout(() => setAnnounceText(`🚴 ${bat} HAS HIT FOR THE CYCLE! 🚴`), 800);
        setTimeout(() => setCycleWatch(null), 6000);
      } else if (S.hitTypes.size === 3) {
        const needed = ['single', 'double', 'triple', 'homeRun'].find(t => !S.hitTypes.has(t));
        const needLabel = needed === 'homeRun' ? 'HR' : needed === 'single' ? '1B' : needed === 'double' ? '2B' : '3B';
        setCycleWatch({ batter: bat, team: bt, completed: false, needed: needLabel });
        setTimeout(() => setCycleWatch(null), 4000);
      }
    }
    // Track baserunners reaching (for no-hitter/perfect game detection). A dropped
    // third strike also puts a runner on base (pitcher's no-no technically breaks).
    const isDropped3rd = !!nar.isDropped3rd;
    if (['single', 'double', 'triple', 'homeRun', 'error', 'walk', 'hbp'].includes(oc) || (oc === 'bunt' && res.outsAdded === 0) || isBallFourWalk || isDropped3rd) g.reachedBase[bt]++;
    // Rally tracking: consecutive batters reaching base in current half-inning.
    // On a dropped 3rd strike the batter reached base, so it's NOT an out for
    // rally / groove purposes even though oc === 'strikeout'.
    if (bD) {
      const strikeoutIsOut = !isDropped3rd;
      const isOut = res.outsAdded > 0 || isCalledK || (['groundOut', 'flyOut', 'lineOut', 'foulOut', 'doublePlay'].includes(oc)) || (oc === 'strikeout' && strikeoutIsOut) || (oc === 'bunt' && res.outsAdded > 0);
      if (!isOut) g.rallyCount++;
      else g.rallyCount = 0;
    }
    // Track walks (BB) charged to defensive team's pitcher (not HBP — that's separate)
    if (oc === 'walk' || isBallFourWalk) {
      g.bb[1 - bt]++;
    }
    // Track strikeouts for K display (charge to defensive team's pitcher)
    if (oc === 'strikeout' || isCalledK) {
      g.kCount[1 - bt]++;
      // Umpire punch-out animation on strikeouts — but NOT on a dropped 3rd strike,
      // where the play is still live and the ump is tracking the batter's dash to 1B.
      if (!isDropped3rd) {
        setUmpirePhase('punchOut');
        setTimeout(() => setUmpirePhase('idle'), 1200);
      }
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

    // Crowd reaction text bubbles — trigger on big plays
    if (oc === 'homeRun') {
      setTimeout(() => triggerCrowdReaction(res.runs === 4 ? 'grandSlam' : 'homeRun', bt), 600);
    } else if ((oc === 'strikeout' && !isDropped3rd) || isCalledK) {
      setTimeout(() => triggerCrowdReaction('strikeout', bt), 400);
    } else if (oc === 'error') {
      setTimeout(() => triggerCrowdReaction('error', bt), 400);
    } else if (oc === 'doublePlay') {
      setTimeout(() => triggerCrowdReaction('doublePlay', bt), 400);
    }
    // (Web gem crowd reactions are triggered separately in the web gem section below)

    // Pitcher groove / struggling tracking
    const defIdx = 1 - bt;
    if (bD) {
      // Dropped 3rd strike puts a runner on — does NOT count as a retired batter.
      const strikeoutIsOut2 = !isDropped3rd;
      const isOut = res.outsAdded > 0 || isCalledK || (['groundOut', 'flyOut', 'lineOut', 'foulOut', 'doublePlay'].includes(oc)) || (oc === 'strikeout' && strikeoutIsOut2) || (oc === 'bunt' && res.outsAdded > 0);
      if (isOut) {
        g.consecutiveRetired[defIdx]++;
        // Show groove badge at 6+ consecutive outs
        if (g.consecutiveRetired[defIdx] === 6) {
          setGrooveBadge({ type: 'groove', team: teams[defIdx].name });
        }
      } else {
        // Baserunner reached — reset groove streak
        g.consecutiveRetired[defIdx] = 0;
        g.halfInningReached++;
        setGrooveBadge(prev => prev?.type === 'groove' && prev.team === teams[defIdx].name ? null : prev);
        // Show struggling badge at 3+ baserunners in a half-inning
        if (g.halfInningReached >= 3) {
          setGrooveBadge({ type: 'struggling', team: teams[defIdx].name });
        }
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
    setPlayHistory(p => [...p, { card, outcome: oc, narration: nar.text, dir: nar.dir, sub: nar.sub, variant: nar.variant, isHR: oc === 'homeRun', batter: bat, preBases: [...g.bases], team: bt, resultData: res, pileSnapshot: cp, isGRD: nar.isGRD || false, isDropped3rd: !!nar.isDropped3rd }]);
    g.bases = res.nextBases; g.outs = nO;

    // LEAD CHANGE / TIE DETECTION — compare current lead to previous lead state
    const lcAwayScore = g.innings[0].reduce((a, b) => a + b, 0);
    const lcHomeScore = g.innings[1].reduce((a, b) => a + b, 0);
    const currentLead = lcAwayScore > lcHomeScore ? 0 : lcHomeScore > lcAwayScore ? 1 : null;
    if (currentLead !== prevLeadRef.current && (lcAwayScore + lcHomeScore) > 0) {
      if (currentLead === null && prevLeadRef.current !== null) {
        // Game just got tied
        setLeadChangeBadge({ type: 'tied', teamName: teams[bt].name });
        setTimeout(() => setLeadChangeBadge(null), 3500);
      } else if (currentLead !== null && prevLeadRef.current !== null && currentLead !== prevLeadRef.current) {
        // Lead changed hands
        setLeadChangeBadge({ type: 'leadChange', teamName: teams[currentLead].name });
        setTimeout(() => setLeadChangeBadge(null), 3500);
      }
    }
    prevLeadRef.current = currentLead;

    // GAME-OVER DETECTION
    const awayScore = lcAwayScore;
    const homeScore = lcHomeScore;
    
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

    // Pitching change check (reuses defIdx from groove tracking above)
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
        g.outs = 0; g.bases = [null, null, null]; g.count = { balls: 0, strikes: 0 }; g.rallyCount = 0; g.halfInningReached = 0;
        // Extra-innings ghost runner (Manfred rule) — in the 10th inning and beyond, the
        // batting team starts each half-inning with a runner on 2nd base. The "ghost runner"
        // is the batter in the lineup spot immediately before the half's leadoff hitter
        // (i.e., the batter who made the last out of the previous half, by convention).
        if (g.inning >= 10) {
          const leadoffIdx = g.batterIdx[g.half];
          const ghostIdx = (leadoffIdx - 1 + 9) % 9;
          const ghostRunner = teams[g.half].players[ghostIdx];
          g.bases[1] = ghostRunner;
          addLog(`Extra innings! ${ghostRunner} automatically placed on second base.`, 'info');
        }
        // Clear struggling badge on half-inning transition; groove persists if still active
        setGrooveBadge(prev => prev?.type === 'struggling' ? null : prev);
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
    // Balk replay — no card, no ball flight. Show windup → aborted, runners advance.
    if (p.isBalk) {
      setDrawnPile(p.pileSnapshot || []);
      setOutcome(null); setAnnounceText(p.narration); setPitchPhase('windup'); setBatterPhase('stance'); setActiveBatter(p.batter);
      if (sndRef.current) playSoundLocal('balk');
      setTimeout(() => {
        setPitchPhase('idle');
        const rps = [];
        if (p.preBases[2]) rps.push([F.B3, F.HP]);
        if (p.preBases[1]) rps.push([F.B2, F.B3]);
        if (p.preBases[0]) rps.push([F.B1, F.B2]);
        if (rps.length) animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', 800);
        setTimeout(() => { procRef.current = false; }, 900);
      }, 500);
      return;
    }
    // Pitch clock violation replay — no card, no pitch, no animation. Just badge + sound.
    if (p.isPitchClock) {
      setDrawnPile(p.pileSnapshot || []);
      setOutcome(null); setAnnounceText(p.narration); setPitchPhase('idle'); setBatterPhase('stance'); setActiveBatter(p.batter);
      if (sndRef.current) playSoundLocal('balk');
      setPitchClockBadge({ team: teams[1 - bt].name, violator: p.pitchClockViolator });
      setTimeout(() => setPitchClockBadge(null), 2600);
      setTimeout(() => { procRef.current = false; }, 800);
      return;
    }
    // Pickoff replay — no card, no pitch. Windup → throw to 1B → dive-back → (out or safe)
    if (p.isPickoff) {
      setDrawnPile(p.pileSnapshot || []);
      setOutcome(null); setAnnounceText(p.narration); setPitchPhase('windup'); setBatterPhase('stance'); setActiveBatter(p.batter);
      const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
      setTimeout(() => {
        setPitchPhase('idle');
        animateBall(linePts(F.P, F.B1, 14), 380, () => {
          setBallPos(null);
          if (sndRef.current) playSoundLocal('glovePop');
          setPickoffDive({ color: offColor });
          setTimeout(() => setPickoffDive(null), 900);
          if (p.pickoffOut) {
            setPickoffBadge({ outcome: 'out', team: 1 - bt });
            setTimeout(() => setPickoffBadge(null), 2600);
            setTimeout(() => { procRef.current = false; }, 950);
          } else {
            setPickoffBadge({ outcome: 'safe', team: 1 - bt });
            setTimeout(() => setPickoffBadge(null), 2200);
            setTimeout(() => {
              animateBall(linePts(F.B1, F.P, 12), 360, () => { setBallPos(null); procRef.current = false; });
            }, 500);
          }
        });
      }, 450);
      return;
    }
    setDispensedCard(p.card); setDispensing(false); setTimeout(() => setDispensing(true), 30);
    setDrawnPile(p.pileSnapshot || []);
    setOutcome(null); setAnnounceText(''); setPitchPhase('windup'); setBatterPhase('stance'); setActiveBatter(p.batter);
    setCatcherSigns(1 + Math.floor(Math.random() * 4));
    setTimeout(() => { setPitchPhase('throw'); setCatcherSigns(0); animateBall(linePts(F.P, { x: F.HP.x, y: F.HP.y - 5 }, 16), 550); }, 550);
    setTimeout(() => {
      if (doesSwing(p.outcome)) {
        setBatterPhase('swing');
        if (sndRef.current && !['ball', 'strike', 'walk', 'hbp'].includes(p.outcome)) playSoundLocal('hit');
        if (p.isDropped3rd) {
          // Dropped 3rd replay — batter sprints to 1B instead of being retired.
          animateRunners([[F.HP, F.B1]], bt === 0 ? '#b91c1c' : '#1e40af', 2200);
          setTimeout(() => setBatterPhase('gone'), 500);
        } else {
          animateRunners(computeRunnerPaths([...p.preBases], p.outcome === 'bunt' ? 'single' : p.outcome), bt === 0 ? '#b91c1c' : '#1e40af', p.outcome === 'homeRun' ? 6500 : 2500);
        }
      }
    }, 1050);
    setTimeout(() => {
      setPitchPhase('idle'); setAnnounceText(p.narration);
      const ba = genBallAnimLocal(p.outcome, p.dir, p.sub, p.variant, p.isGRD || false);
      if (p.isGRD) {
        setGrdBadge({ team: bt });
        setTimeout(() => setGrdBadge(null), 3200);
        if (sndRef.current) setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.5);
      }
      if (['flyOut', 'lineOut', 'foulOut'].includes(p.outcome)) { const fk = (p.outcome === 'foulOut') ? 'C' : (OF_MAP[p.sub] || INF_MAP[p.sub]); if (fk) animateFielder(fk, F[fk], ba.target, ba.dur); }
      else if (['groundOut', 'doublePlay', 'bunt'].includes(p.outcome)) { const fk = INF_MAP[p.sub] || 'SS'; animateFielder(fk, F[fk], ba.target, ba.dur); }
      else if (['single', 'double', 'triple', 'error'].includes(p.outcome) && !p.isGRD) { const ofk = OF_MAP[p.sub] || 'CF'; animateFielder(ofk, F[ofk], ba.target, ba.dur + 500); }
      animateBall(ba.path, ba.dur, () => { setBallPos(null); setMovingFielder(null); procRef.current = false; });
      if (p.outcome === 'doublePlay' && sndRef.current) setTimeout(() => playSoundLocal('doublePlayTurn'), ba.dur + 350);
      if (p.isHR) triggerFireworks();
      // Dropped 3rd strike replay — passed ball sound + badge, no umpire punch-out
      if (p.isDropped3rd) {
        if (sndRef.current) setTimeout(() => playSoundLocal('passedBall'), ba.dur);
        setPassedBallBadge({ batter: p.batter, team: bt });
        setTimeout(() => setPassedBallBadge(null), 3200);
      } else if (p.outcome === 'strikeout') {
        // Umpire punch-out on strikeout replay
        setUmpirePhase('punchOut'); setTimeout(() => setUmpirePhase('idle'), 1200);
      }
      // Error bobble animation on replay
      if (p.outcome === 'error' && ba.target) { setTimeout(() => { setErrorBobble({ x: ba.target.x, y: ba.target.y }); if (sndRef.current) playSoundLocal('bobble'); setTimeout(() => setErrorBobble(null), 1300); }, ba.dur + 200); }
    }, 1100);
    setTimeout(() => { setPitchPhase('idle'); setBatterPhase('stance'); }, 2500);
  }

  const baValue = (name, t) => { const s = statsRef.current[t][name]; return (!s || s.ab === 0) ? '.000' : (s.h / s.ab).toFixed(3).replace(/^0/, ''); };
  const displayBases = useMemo(() => replayIdx !== -1 && playHistory[replayIdx] ? playHistory[replayIdx].preBases : gs.current.bases, [replayIdx, playHistory, renderTick]);
  const batterSide = useMemo(() => { const raw = PLAYER_HANDS[activeBatter] || 'R'; return raw === 'S' ? 'L' : raw; }, [activeBatter]);
  // Defensive infield shift — only the defensive team "shifts" against the hitter,
  // and only when the current batter is a known slugger. Returns 'L' (lefty pull
  // shift), 'R' (righty extreme pull shift), or null when no shift is on.
  const infieldShift = useMemo(() => getInfieldShift(activeBatter, batterSide), [activeBatter, batterSide]);

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10 font-sans text-gray-900">
        <h1 className="text-4xl font-black text-blue-900 mb-2 tracking-tight uppercase">⚾ Card Baseball v41</h1>
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
        {/* Count leverage badge — hitter's count (advantage batter) or pitcher's count (advantage pitcher) */}
        {!gs.current.gameOver && gs.current.count.balls >= 2 && gs.current.count.strikes <= 1 && !(gs.current.count.balls === 3 && gs.current.count.strikes === 2) && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-green-600 text-white border border-green-700" title={`${gs.current.count.balls}-${gs.current.count.strikes} — hitter has the advantage`}>
            HITTER'S COUNT
          </span>
        )}
        {!gs.current.gameOver && gs.current.count.strikes === 2 && gs.current.count.balls === 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-red-700 text-white border border-red-800" title="0-2 — pitcher has the advantage">
            PITCHER'S COUNT
          </span>
        )}
        {/* Infield shift badge (Backlog #66) — defense has shifted against a pull slugger */}
        {infieldShift && !gs.current.gameOver && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-slate-700 text-white border border-slate-800" title={`Infield shift on for ${activeBatter} — 2B and SS pulled to the ${infieldShift === 'L' ? 'right' : 'left'} side`}>
            INFIELD SHIFT
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
        {/* First-pitch strike — classic broadcast FPS flash */}
        {firstPitchStrikeBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-sky-600 text-white border border-sky-700" title={`${firstPitchStrikeBadge.team} pitcher gets ahead 0-1`}>
            1ST-PITCH STRIKE
          </span>
        )}
        {/* Ground rule double badge — ball cleared the fence on a bounce */}
        {grdBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${grdBadge.team === 0 ? 'bg-blue-700 text-white border-blue-800' : 'bg-red-700 text-white border-red-800'}`} title="Ground rule double: ball bounced over the outfield wall. Dead ball, runners advance two bases.">
            GROUND RULE 2B
          </span>
        )}
        {/* Pickoff badge — flashes on every pickoff attempt (green for successful out, amber for a safe dive-back) */}
        {pickoffBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${pickoffBadge.outcome === 'out' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-amber-200 text-amber-900 border-amber-400'}`} title={pickoffBadge.outcome === 'out' ? 'Pickoff! Runner caught leaning off first base.' : 'Pickoff attempt — runner dove back safely.'}>
            {pickoffBadge.outcome === 'out' ? 'PICKOFF!' : 'THROW OVER'}
          </span>
        )}
        {/* Dropped-third-strike (passed ball) badge (Backlog #67) — batter reaches 1B on a K */}
        {passedBallBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-yellow-500 text-yellow-900 border border-yellow-700" title={`Dropped third strike! ${passedBallBadge.batter} reaches first — K recorded, but the catcher couldn't hold on.`}>
            DROPPED 3RD STRIKE
          </span>
        )}
        {/* Save opportunity badge (Backlog #68) — defensive team is nursing a late-game save-situation lead */}
        {!gs.current.gameOver && saveOpportunity(gs.current, 1 - gs.current.half) && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-violet-600 text-white border border-violet-700" title={`${teams[1 - gs.current.half].name} is in a save situation — lead of 3 or fewer, or tying run reachable, in the 9th+`}>
            SAVE OPP
          </span>
        )}
        {/* Pitch clock violation flash (Backlog #69) — modern MLB rule, automatic ball/strike */}
        {pitchClockBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${pitchClockBadge.violator === 'pitcher' ? 'bg-red-600 text-white border-red-800' : 'bg-orange-600 text-white border-orange-800'}`} title={`Pitch clock violation — ${pitchClockBadge.violator === 'pitcher' ? 'automatic ball, pitcher was late to set' : 'automatic strike, batter not alert in the box'}`}>
            ⏱ PITCH CLOCK ({pitchClockBadge.violator.toUpperCase()})
          </span>
        )}
        {/* Mound visit indicator — brief note while catcher is chatting with the pitcher */}
        {moundVisit && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-slate-500 text-white border border-slate-600" title="Mound visit in progress">
            MOUND VISIT
          </span>
        )}
        {/* Bullpen warming notice — pitcher count at/above 80 but below the automatic change */}
        {!gs.current.gameOver && gs.current.pitchCount[1 - gs.current.half] >= 80 && gs.current.pitchCount[1 - gs.current.half] < 120 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-amber-100 text-amber-800 border border-amber-300" title={`${teams[1 - gs.current.half].name} has a reliever warming up in the bullpen`}>
            🔥 BULLPEN ACTIVE
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
        {/* Pitcher groove / struggling badge */}
        {grooveBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${grooveBadge.type === 'groove' ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-orange-500 text-white border-orange-600'}`}
            title={grooveBadge.type === 'groove' ? `${grooveBadge.team} pitcher has retired 6+ consecutive batters` : `${grooveBadge.team} pitcher has allowed 3+ baserunners this inning`}>
            {grooveBadge.type === 'groove' ? 'IN A GROOVE' : 'STRUGGLING'}
          </span>
        )}
        {/* Clutch hit badge */}
        {clutchBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-orange-500 text-white border border-orange-600" title={`${clutchBadge.batter} with a clutch hit!`}>
            CLUTCH! 🔥
          </span>
        )}
        {/* Cycle watch badge */}
        {cycleWatch && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${cycleWatch.completed ? 'bg-purple-600 text-white border-purple-700' : 'bg-violet-500 text-white border-violet-600'}`}
            title={cycleWatch.completed ? `${cycleWatch.batter} hit for the cycle!` : `${cycleWatch.batter} needs a ${cycleWatch.needed} for the cycle!`}>
            {cycleWatch.completed ? '🚴 CYCLE! 🚴' : `CYCLE WATCH — needs ${cycleWatch.needed}`}
          </span>
        )}
        {/* Lead change / tie badge */}
        {leadChangeBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${leadChangeBadge.type === 'tied' ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-rose-600 text-white border-rose-700'}`}
            title={leadChangeBadge.type === 'tied' ? 'The game is tied!' : `${leadChangeBadge.teamName} takes the lead!`}>
            {leadChangeBadge.type === 'tied' ? 'TIED!' : 'LEAD CHANGE!'}
          </span>
        )}
        {/* Win Probability — broadcast-style live WP% bar (home vs away) */}
        {!gs.current.gameOver && gs.current.inning >= 1 && (() => {
          const homeWP = winProbability(gs.current);
          const awayWP = 100 - homeWP;
          const homeColorBg = '#b91c1c'; // red
          const awayColorBg = '#1e40af'; // blue
          const advantageHome = homeWP >= 50;
          const advLabel = advantageHome ? `${teams[1].name.split(' ').pop()} ${homeWP}%` : `${teams[0].name.split(' ').pop()} ${awayWP}%`;
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-slate-100 text-slate-700 border border-slate-300"
              title={`Win Probability — ${teams[0].name} ${awayWP}% / ${teams[1].name} ${homeWP}%`}>
              <span className="opacity-60">WP</span>
              <span className="relative inline-block w-16 h-2 rounded-full overflow-hidden border border-slate-400" style={{ background: awayColorBg }}>
                <span className="absolute inset-y-0 right-0" style={{ width: `${homeWP}%`, background: homeColorBg }} />
              </span>
              <span className={`font-black ${advantageHome ? 'text-red-700' : 'text-blue-800'}`}>{advLabel}</span>
            </span>
          );
        })()}
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

      <BaseballField bases={displayBases} defColor={gs.current.half === 0 ? '#1e40af' : '#b91c1c'} offColor={gs.current.half === 0 ? '#b91c1c' : '#1e40af'} ballPos={ballPos} ballTrail={ballTrail} pitchPhase={pitchPhase} batterPhase={batterPhase} showFW={showFW} fwKey={fwKey} movingRunners={movingRunners} movingFielder={movingFielder} batterSide={batterSide} platePlay={platePlay} isPlayoff={isPlayoff} pitchingChange={pitchingChange} homeColor={'#b91c1c'} awayColor={'#1e40af'} homeKs={gs.current.kCount[1]} awayKs={gs.current.kCount[0]} isNightGame={isNightGame} webGem={webGem} errorBobble={errorBobble} umpirePhase={umpirePhase} crowdReactions={crowdReactions} pitchLocations={pitchLocations} inning={gs.current.inning} catcherSigns={catcherSigns} bullpenActive={!gs.current.gameOver && gs.current.pitchCount[1 - gs.current.half] >= 80 && gs.current.pitchCount[1 - gs.current.half] < 120} reliefColor={(1 - gs.current.half) === 1 ? '#b91c1c' : '#1e40af'} moundVisit={moundVisit} brokenBat={brokenBat} pickoffDive={pickoffDive} shiftType={infieldShift} leadCaution={leadCaution} />

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

      {/* Walk-up stats chyron — TV-style lower-third for batter stats */}
      {walkUpStats && !gs.current.gameOver && (
        <div className="max-w-[750px] mx-auto px-2 overflow-hidden">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-1 rounded shadow-lg text-[10px] font-bold tracking-wide" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <span className="text-slate-300 uppercase text-[8px]">Today</span>
            <span className="text-white font-black">{walkUpStats.abH}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300 uppercase text-[8px]">AVG</span>
            <span className="font-mono font-black">{walkUpStats.avg}</span>
            {walkUpStats.hr > 0 && <><span className="text-slate-400">|</span><span className="text-slate-300 uppercase text-[8px]">HR</span><span className="font-black text-yellow-300">{walkUpStats.hr}</span></>}
            {walkUpStats.rbi > 0 && <><span className="text-slate-400">|</span><span className="text-slate-300 uppercase text-[8px]">RBI</span><span className="font-black text-green-300">{walkUpStats.rbi}</span></>}
          </div>
        </div>
      )}

      <div className="max-w-[750px] mx-auto my-2 text-center min-h-[40px]">
        <div className="bg-blue-900 text-white inline-block px-6 py-2 rounded-full italic font-bold shadow-md text-sm">
          {announceText || "Ready for pitch..."}
        </div>
        {(exitVelo || hrDistance || popTime) && (
          <div className="mt-1 flex justify-center items-center gap-1.5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            {exitVelo && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm border ${exitVelo >= 100 ? 'bg-red-100 text-red-800 border-red-300' : exitVelo >= 90 ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                <span className="uppercase opacity-60">Exit Velo</span>
                <span className="text-[12px]">{exitVelo}</span>
                <span className="uppercase opacity-60">mph</span>
              </span>
            )}
            {hrDistance && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm border ${hrDistance >= 440 ? 'bg-purple-100 text-purple-800 border-purple-300' : hrDistance >= 410 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-sky-100 text-sky-800 border-sky-300'}`} title={hrDistance >= 440 ? 'Mammoth shot!' : hrDistance >= 410 ? 'No doubt about it!' : 'Just enough'}>
                <span className="uppercase opacity-60">Distance</span>
                <span className="text-[12px]">{hrDistance}</span>
                <span className="uppercase opacity-60">ft</span>
              </span>
            )}
            {popTime && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm border ${popTime < 1.90 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : popTime <= 2.00 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'}`} title={popTime < 1.90 ? 'Elite pop time!' : popTime <= 2.00 ? 'Average pop time' : 'Slow release'}>
                <span className="uppercase opacity-60">Pop</span>
                <span className="text-[12px]">{popTime.toFixed(2)}</span>
                <span className="uppercase opacity-60">s</span>
              </span>
            )}
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
                {/* Inning-by-inning line score — classic baseball box score format */}
                {(() => {
                  const maxInnings = Math.max(gs.current.innings[0].length, gs.current.innings[1].length);
                  return (
                    <div className="mb-4">
                      <div className="text-xs font-black uppercase tracking-widest mb-2 text-gray-500">Line Score</div>
                      <table className="w-full text-center border-collapse text-[11px]">
                        <thead><tr className="border-b-2 border-gray-200 text-gray-400 uppercase font-bold text-[9px]">
                          <th className="py-1 pl-2 text-left w-28">Team</th>
                          {Array.from({ length: maxInnings }, (_, i) => <th key={i} className="py-1 w-6">{i + 1}</th>)}
                          <th className="py-1 w-8 border-l-2 border-gray-200 font-black text-gray-600">R</th>
                          <th className="py-1 w-8 font-black text-gray-600">H</th>
                          <th className="py-1 w-8 font-black text-gray-600">E</th>
                        </tr></thead>
                        <tbody>{[0, 1].map(t => {
                          const totalR = gs.current.innings[t].reduce((a, b) => a + b, 0);
                          return (
                            <tr key={t} className={`border-b border-gray-100 ${t === winner ? 'font-bold' : ''}`}>
                              <td className="py-1.5 pl-2 text-left text-gray-800 text-[10px] truncate max-w-[112px]">{teams[t].name}</td>
                              {Array.from({ length: maxInnings }, (_, i) => {
                                const val = gs.current.innings[t][i];
                                const scored = val !== undefined && val > 0;
                                return <td key={i} className={`py-1.5 ${val === undefined ? 'text-gray-300' : scored ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>{val !== undefined ? val : 'x'}</td>;
                              })}
                              <td className={`py-1.5 border-l-2 border-gray-200 font-black ${t === winner ? 'text-green-700' : 'text-gray-800'}`}>{totalR}</td>
                              <td className="py-1.5 font-bold text-gray-700">{gs.current.hits[t]}</td>
                              <td className="py-1.5 text-gray-600">{gs.current.errors[t]}</td>
                            </tr>
                          );
                        })}</tbody>
                      </table>
                    </div>
                  );
                })()}
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
                {/* Pitching Summary */}
                <div className="mb-4 mt-2 border-t-2 border-gray-100 pt-3">
                  <div className="text-xs font-black uppercase tracking-widest mb-2 text-indigo-700">Pitching Summary</div>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead><tr className="border-b-2 border-gray-200 text-gray-400 uppercase font-bold text-[9px]">
                      <th className="py-1 pl-2">Team</th><th className="py-1 text-center w-10">IP</th><th className="py-1 text-center w-8">H</th><th className="py-1 text-center w-8">R</th><th className="py-1 text-center w-8">K</th><th className="py-1 text-center w-8">BB</th><th className="py-1 text-center w-12" title="First-Pitch Strike %">FPS%</th><th className="py-1 text-center w-8" title="Save — close-game win in the 9th or later (≤3 run margin)">SV</th><th className="py-1 text-right pr-2 w-14">Pitches</th>
                    </tr></thead>
                    <tbody>{(() => { const svTeam = saveCreditTeam(gs.current); return [0, 1].map(t => {
                      // Pitcher for team t faces the opposing lineup: allowed hits[1-t], runs from innings[1-t], etc.
                      const opp = 1 - t;
                      const hitsAllowed = gs.current.hits[opp];
                      const runsAllowed = gs.current.innings[opp].reduce((a, b) => a + b, 0);
                      const kRecorded = gs.current.kCount[t];
                      const bbAllowed = gs.current.bb[t];
                      const pitches = gs.current.pitchCount[t];
                      // First-pitch strike % — classic broadcast pitching metric
                      const fps = gs.current.fps[t];
                      const fpOpps = gs.current.fpOpps[t];
                      const fpsPct = fpOpps > 0 ? Math.round((fps / fpOpps) * 100) : null;
                      const fpsColor = fpsPct === null ? 'text-gray-400' : fpsPct >= 65 ? 'text-emerald-700 font-bold' : fpsPct >= 55 ? 'text-amber-700' : 'text-red-700';
                      // Innings pitched: count full innings from opposing innings array, partial from current outs if game ended mid-inning
                      const oppInnings = gs.current.innings[opp];
                      const fullIP = oppInnings.length;
                      // Display as integer (we track full innings completed by the opposing team's at-bats)
                      return (
                        <tr key={t} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-1 pl-2 text-gray-800 font-bold">{teams[t].name}</td>
                          <td className="py-1 text-center text-gray-700">{fullIP}</td>
                          <td className="py-1 text-center text-gray-800 font-bold">{hitsAllowed}</td>
                          <td className="py-1 text-center text-red-700 font-bold">{runsAllowed}</td>
                          <td className="py-1 text-center text-indigo-700 font-bold">{kRecorded}</td>
                          <td className="py-1 text-center text-gray-600">{bbAllowed}</td>
                          <td className={`py-1 text-center font-mono ${fpsColor}`} title={fpsPct === null ? 'No first-pitch opportunities' : `${fps} / ${fpOpps} first pitches`}>
                            {fpsPct === null ? '-' : `${fpsPct}%`}
                          </td>
                          <td className={`py-1 text-center font-bold ${svTeam === t ? 'text-violet-700' : 'text-gray-300'}`} title={svTeam === t ? 'Save credited — close-game win in the 9th or later (margin ≤ 3 runs)' : 'No save situation'}>
                            {svTeam === t ? 'SV' : '-'}
                          </td>
                          <td className="py-1 text-right pr-2 font-mono text-gray-700">{pitches}</td>
                        </tr>
                      );
                    }); })()}</tbody>
                  </table>
                </div>
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