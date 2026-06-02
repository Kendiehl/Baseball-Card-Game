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
//
// Defensive outfield shift (Backlog #136) — companion to the infield shift. The
// three outfielders also slide toward the slugger's pull side (LF/CF/RF shifted
// ~20-26px in the pull direction). Standard OF positions are LF:(180,190),
// CF:(310,140), RF:(440,190); shifted versions hug the pull-side foul line
// and pull the opposite-field OF toward center. Pure render-position change —
// fielder animation paths, fielding logic, and outcome distributions are
// unaffected; the OFs still chase fly balls from their standard F.LF/F.CF/F.RF
// coordinates per the existing animation system.
const SHIFT_POS = {
  L: {
    SS: { x: 322, y: 250 }, F2B: { x: 398, y: 228 },
    LF: { x: 218, y: 200 }, CF: { x: 346, y: 152 }, RF: { x: 462, y: 178 },
  },
  R: {
    SS: { x: 230, y: 250 }, F2B: { x: 298, y: 250 },
    LF: { x: 158, y: 178 }, CF: { x: 274, y: 152 }, RF: { x: 402, y: 200 },
  },
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

// 'the pitcher' is included so the comebacker mechanic (Backlog #126) can route
// the standard fielder-animation block through the mound (P) — every other
// INF_MAP entry routes through a base/infielder coordinate, and the pitcher is
// the only infielder that wasn't previously mappable from a narration sub.
const INF_MAP = { 'the shortstop': 'SS', 'the second baseman': 'F2B', 'the third baseman': 'F3B', 'the first baseman': 'F1B', 'the catcher': 'C', 'the pitcher': 'P' };
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

// Walk-up music library — fixed catalog of famous walk-up songs that any
// batter can be tagged with as they approach the plate. Mapping uses a
// simple hash of the player's name so each batter consistently gets the
// same song within and across sessions, while different lineup spots get
// different tracks. Pure atmospheric flavor — no mechanical effect.
const WALK_UP_SONGS = [
  { title: 'Enter Sandman', artist: 'Metallica' },
  { title: 'Wild Thing', artist: 'X' },
  { title: 'Thunderstruck', artist: 'AC/DC' },
  { title: "Welcome to the Jungle", artist: "Guns N' Roses" },
  { title: 'Eye of the Tiger', artist: 'Survivor' },
  { title: 'Hell\'s Bells', artist: 'AC/DC' },
  { title: 'Crazy Train', artist: 'Ozzy Osbourne' },
  { title: 'Sweet Caroline', artist: 'Neil Diamond' },
  { title: 'Centerfield', artist: 'John Fogerty' },
  { title: 'Country Boy', artist: 'Aaron Lewis' },
  { title: 'Dirt Off Your Shoulder', artist: 'Jay-Z' },
  { title: 'Lose Yourself', artist: 'Eminem' },
  { title: "All I Do Is Win", artist: 'DJ Khaled' },
  { title: 'Sandstorm', artist: 'Darude' },
  { title: 'Seven Nation Army', artist: 'White Stripes' },
  { title: 'Renegade', artist: 'Styx' },
  { title: 'Back in Black', artist: 'AC/DC' },
  { title: 'Empire State of Mind', artist: 'Jay-Z' },
  { title: 'Started From the Bottom', artist: 'Drake' },
  { title: 'God\'s Plan', artist: 'Drake' },
  { title: 'Mo Bamba', artist: 'Sheck Wes' },
  { title: 'Old Town Road', artist: 'Lil Nas X' },
  { title: "Don't Stop Believin'", artist: 'Journey' },
  { title: 'Born in the U.S.A.', artist: 'Bruce Springsteen' },
  { title: 'Levels', artist: 'Avicii' },
];
function getWalkUpSong(name) {
  if (!name) return WALK_UP_SONGS[0];
  // Simple deterministic hash so the same batter always gets the same song
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h) + name.charCodeAt(i);
    h |= 0; // 32-bit
  }
  const idx = Math.abs(h) % WALK_UP_SONGS.length;
  return WALK_UP_SONGS[idx];
}

// ===== 2. GLOBAL LOGIC HELPERS =====

function INIT_GS() {
  return {
    inning: 1, half: 0, outs: 0,
    bases: [null, null, null],
    count: { balls: 0, strikes: 0 },
    pitchCount: [0, 0],
    // Battle at-bat tracking (Backlog #115) — pitches seen by the current
    // batter in the current at-bat. Increments on each pitch alongside the
    // per-pitcher pitchCount and resets to 0 whenever the at-bat ends
    // (g.count is reset). Drives the live "🥊 BATTLE!" info-bar badge that
    // appears at 7+ pitches. Pure cosmetic — no gameplay effect.
    currentABPitches: 0,
    kCount: [0, 0],
    // Per-pitcher strikeout history (Backlog #107) — array of 'L' (looking / called K)
    // or 'S' (swinging / contact K) per strikeout, in chronological order. Used by
    // StrikeoutKs to render called strikeouts with a backwards "K" per baseball
    // scoring tradition. Mirrors kCount length-wise (kHistory[t].length === kCount[t]).
    kHistory: [[], []],
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
  // Position player pitching (Backlog #79): activated for the losing team
  // when they trail by 8+ in the 8th inning or later. Persists for the rest
  // of the game. Mirrors the live-game implementation so season stats stay
  // close to interactive expectations.
  const posPP = [false, false];

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
    // HR robbery (Backlog #72): ~3% of would-be home runs are robbed at the wall.
    // Mirror the live-game rate so season stats match interactive games.
    if (oc === 'homeRun' && Math.random() < 0.03) oc = 'flyOut';
    // Inside-the-park home run (Idea #83): ~3% of would-be triples convert to
    // homers as the runner outruns the relay. Re-mapped to oc === 'homeRun'
    // before calculatePlayResult so all downstream logic (runner advancement,
    // HR stat increment, +run for batting team) flows through the standard HR
    // pathway. Mirrors the live-game rate so season stats match interactive
    // games.
    if (oc === 'triple' && Math.random() < 0.03) oc = 'homeRun';
    // Lost in the sun (Backlog #77): ~1.5% of fly outs become singles in the sim.
    // We don't model day vs night per game in the season engine, so we apply the
    // base rate uniformly — this matches the long-run rate across day games and
    // keeps season totals close to live-game expectations.
    if (oc === 'flyOut' && Math.random() < 0.015) oc = 'single';
    // Dropped fly ball error (Backlog #103): ~1.5% of remaining fly outs become
    // 2-base errors (E7/E8/E9). Mirror the live-game rate so season totals
    // stay close to interactive expectations. Re-mapped to oc === 'double'
    // before calculatePlayResult so all downstream logic (batter to 2B,
    // runners advance two bags) flows through the standard double pathway —
    // but the `simDroppedFly` flag suppresses the hit credit and RBI in the
    // season stats accumulator below (real-world ROE scoring rules).
    let simDroppedFly = false;
    if (oc === 'flyOut' && Math.random() < 0.015) { oc = 'double'; simDroppedFly = true; }
    // Position player pitching (Backlog #79): activate for the losing defensive
    // team in the 8th+ when down 8+. Once active, walk and HR rates spike.
    {
      const _defIdx = 1 - bt;
      if (gs.inning >= 8 && !posPP[_defIdx]) {
        const defRuns = gs.score[_defIdx];
        const batRuns = gs.score[bt];
        if (batRuns - defRuns >= 8) posPP[_defIdx] = true;
      }
      if (posPP[_defIdx]) {
        if (oc === 'strike' && Math.random() < 0.22) oc = 'ball';
        else if (oc === 'foulBall' && Math.random() < 0.14) oc = 'ball';
        else if ((oc === 'flyOut' || oc === 'lineOut') && Math.random() < 0.22) oc = 'homeRun';
        else if (oc === 'groundOut' && Math.random() < 0.16) oc = 'single';
      }
    }
    // Foul tip strikeout (Backlog #86): ~12% of 2-strike foul balls in the sim
    // become strikeouts — the catcher squeezes the foul tip cleanly. Mirrors
    // the live-game rate so season K totals stay close to interactive games.
    if (oc === 'foulBall' && gs.count.strikes === 2 && Math.random() < 0.12) {
      oc = 'strikeout';
    }
    // Throwing error (Backlog #105): ~1.2% of routine groundOuts when 1B is
    // empty convert to a throwing error — batter reaches via the standard
    // single pathway, but stat-wise treated as ROE (no hit credit, no RBI on
    // runs, AB charged, defensive errors increment). Suppressed when a
    // position-player is pitching. Re-mapped BEFORE the infield single roll
    // so they're mutually exclusive (throwing error has higher narrative
    // priority). Mirrors the live-game rate so season ERA / errors / hit
    // totals stay close to interactive expectations.
    let simIsThrowError = false;
    {
      const _ppActiveSim = posPP[1 - bt];
      if (oc === 'groundOut' && !gs.bases[0] && !_ppActiveSim && Math.random() < 0.012) {
        oc = 'single';
        simIsThrowError = true;
      }
    }
    // Infield single beat-out (Backlog #99): ~7% of routine groundOuts when
    // 1B is empty convert to infield singles. Mirrors the live-game rate so
    // season hit totals stay close to interactive expectations. Suppressed
    // when a position-player is pitching (already at 16% groundOut→single
    // conversion above). The conversion happens BEFORE calculatePlayResult so
    // runner advancement / hit credit / no-out flow naturally through the
    // standard single pathway.
    {
      const _ppActiveSim = posPP[1 - bt];
      if (oc === 'groundOut' && !gs.bases[0] && !_ppActiveSim && Math.random() < 0.07) {
        oc = 'single';
      }
    }
    // Catcher's interference (Backlog #76): ~0.15% of pitches turn into a CI
    // mid-swing — batter awarded 1B, no AB charged. We model it as a free walk
    // for season stats (no AB increment, runner advances if forced) and
    // attribute it as an error to the defensive team. Rare enough that season
    // totals barely move, but this keeps the engines consistent.
    if (Math.random() < 0.0015) {
      const ciRes = resolveWalkForce([...gs.bases], batter);
      if (ciRes.runs > 0) gs.score[bt] += ciRes.runs;
      gs.bases = ciRes.bases;
      gs.count = { balls: 0, strikes: 0 };
      gs.batterIdx[bt] = (gs.batterIdx[bt] + 1) % 9;
      continue;
    }
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
    // Steal of home (Backlog #101) — ~0.5% chance per non-contact pitch with a
    // runner on 3B and < 2 outs (inning ≥ 2). ~55% success rate. The runner
    // breaks for the plate as the pitch is delivered. On success: run scores,
    // runner from 3B gone. On failure: runner out at the plate, runner from 3B
    // gone, +1 out. The original pitch outcome (ball/strike/foul) still
    // applies. Mirrors the live-game rate so season stats reflect this rare,
    // dramatic play.
    if (['ball', 'strike', 'foulBall'].includes(oc) && gs.bases[2] && gs.outs < 2 && gs.inning >= 2 && Math.random() < 0.005) {
      if (Math.random() < 0.55) {
        // Successful steal of home — run scores
        gs.score[bt] += 1;
        gs.bases[2] = null;
      } else {
        // Caught stealing at the plate
        gs.outs++;
        gs.bases[2] = null;
      }
    }
    const res = calculatePlayResult(gs, oc, batter);
    // Dropped third strike in the sim — ~4% of strikeouts where 1B is open. Batter
    // reaches 1B, no out. Keeps season stats aligned with live-game behavior.
    if (oc === 'strikeout' && !gs.bases[0] && Math.random() < 0.04) {
      res.outsAdded = 0;
      res.nextBases = [...res.nextBases];
      res.nextBases[0] = batter;
    }
    // Manager challenge / replay review (Idea #80) — ~4% of close groundouts at
    // first in the 6th inning or later get challenged. ~30% of those get
    // overturned, converting an out into a single. Mirrors the live-game rate
    // so season stats stay close to interactive expectations.
    if (oc === 'groundOut' && !gs.bases[0] && gs.inning >= 6 && Math.random() < 0.04) {
      if (Math.random() < 0.30) {
        // Overturned — re-map to single. Recompute the play result so runner
        // advancement and the batter-to-1B behavior flow naturally.
        oc = 'single';
        const safeRes = calculatePlayResult(gs, oc, batter);
        res.outsAdded = safeRes.outsAdded;
        res.runs = safeRes.runs;
        res.nextBases = safeRes.nextBases;
        res.isSacFly = safeRes.isSacFly;
      }
    }
    // Triple play (Backlog #85) — ~10% of doublePlay outcomes that fire with 0
    // outs AND runners on both 1B AND 2B convert to a 3-out triple play. The
    // runner from 2B is also caught in the rundown. Mirrors the live-game rate
    // so season stats reflect the rare event identically. No runs can score
    // (the 3rd out is recorded before any runner crosses home).
    if (oc === 'doublePlay' && gs.outs === 0 && gs.bases[0] && gs.bases[1] && Math.random() < 0.10) {
      res.outsAdded = 3;
      res.nextBases = [null, null, null];
      res.runs = 0;
    }
    // Outfield assist at home (Idea #89) — ~10% of singles where a runner
    // scores from third get gunned out at the plate by the OF. We mutate res
    // in place: -1 run, +1 out. Mirrors the live-game rate so season RBI /
    // run-scored totals stay close to interactive expectations.
    if (oc === 'single' && gs.bases[2] && res.runs >= 1 && gs.outs <= 1 && Math.random() < 0.10) {
      res.runs -= 1;
      res.outsAdded += 1;
    }
    // Productive out (Backlog #108) — sim mirror. ~35% of routine groundouts
    // with a runner on 2B only (no force at 2B) and < 2 outs advance the
    // runner from 2B to 3B. Keeps season stats aligned with live-game behavior
    // (no statistical change to AB / H / RBI, just the runner advancement —
    // which affects subsequent run-scoring probability).
    if (oc === 'groundOut' && !gs.bases[0] && gs.bases[1] && gs.outs < 2 && Math.random() < 0.35) {
      res.nextBases = [...res.nextBases];
      res.nextBases[2] = gs.bases[1];
      res.nextBases[1] = null;
    }
    // Tag-up advance on a deep fly out (Backlog #142) — sim mirror. ~35% of
    // flyOut (and ~26% of lineOut, ≈0.75× to approximate the OUTFIELD-only
    // gating the live game applies via nar.dir) outcomes with a runner on 2B,
    // < 2 outs, and NOT a sac fly tag the runner up from 2B to 3B. 3B is open
    // in this branch (any runner on 3B with < 2 outs already converted to a
    // sac fly above). No AB/H/RBI change — just the runner advancing into
    // scoring position, which affects subsequent run-scoring probability.
    // Keeps season stats aligned with live-game behavior.
    if (['flyOut', 'lineOut'].includes(oc) && !res.isSacFly && gs.bases[1]
        && gs.outs < 2 && !res.nextBases[2]
        && Math.random() < (oc === 'flyOut' ? 0.35 : 0.26)) {
      res.nextBases = [...res.nextBases];
      res.nextBases[2] = gs.bases[1];
      res.nextBases[1] = null;
    }
    // First-to-third on a single (Backlog #123) AND outfield assist at third
    // (Backlog #146) — sim mirror. Both fire on the same base state (runner on
    // 1B only, < 2 outs, single) and are mutually exclusive, so they share one
    // random draw: ~18% the runner makes it to 3B (first-to-third), and a
    // further ~7% of the remaining ~82% (≈5.7% absolute) he's gunned down at
    // third for an out (the runner is erased, +1 out). The remaining ~76% hold
    // at 2B. Keeps season stats aligned with live-game behavior.
    if (oc === 'single' && gs.bases[0] && !gs.bases[1] && !gs.bases[2] && gs.outs < 2) {
      const aggRoll = Math.random();
      if (aggRoll < 0.18) {
        // First-to-third: runner from 1B → 3B (safe, no out, no run).
        res.nextBases = [...res.nextBases];
        res.nextBases[2] = res.nextBases[1];
        res.nextBases[1] = null;
      } else if (aggRoll < 0.18 + 0.82 * 0.07) {
        // Outfield assist at third: runner gunned down stretching the single.
        res.nextBases = [...res.nextBases];
        res.nextBases[1] = null; // runner out — off the bases
        res.outsAdded += 1;
      }
    }
    // Catcher framing (Backlog #130) — sim mirror. ~15% of `ball` outcomes
    // with count.balls < 3 AND count.strikes < 2 get a framing attempt; ~30%
    // of those convert to a strike. Net rate is ~4.5% of qualifying balls
    // becoming called strikes through pitch framing. Mirrors the live-game
    // gating: no walk-prevention (skipped when count.balls === 3), no
    // surprise strikeouts (skipped when count.strikes === 2). Keeps season
    // K/BB stats close to interactive expectations.
    if (oc === 'ball' && gs.count.balls < 3 && gs.count.strikes < 2 && Math.random() < 0.15) {
      if (Math.random() < 0.30) oc = 'strike';
    }
    let nO = gs.outs + res.outsAdded, bD = false;
    if (oc === 'ball') { gs.count.balls++; if (gs.count.balls >= 4) bD = true; }
    else if (oc === 'strike') { gs.count.strikes++; if (gs.count.strikes >= 3) { nO++; bD = true; } }
    else if (oc === 'foulBall') { if (gs.count.strikes < 2) gs.count.strikes++; }
    else if (doesSwing(oc) || ['walk', 'hbp'].includes(oc)) bD = true;
    if (bD) {
      stats[bt][batter].ab++;
      // Dropped fly ball errors (Backlog #103) and throwing errors (Backlog
      // #105) both charge an AB but suppress hit credit and RBI per ROE rules.
      if (!simDroppedFly && !simIsThrowError && ['single', 'double', 'triple', 'homeRun'].includes(oc)) { stats[bt][batter].h++; if (oc === 'homeRun') stats[bt][batter].hr++; gs.hits[bt]++; }
      if (oc === 'bunt' && res.outsAdded === 0) { stats[bt][batter].h++; gs.hits[bt]++; }
      if (!simDroppedFly && !simIsThrowError && res.runs > 0) stats[bt][batter].rbi += res.runs;
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
  // Filter out 'the catcher' (already excluded historically) and 'the pitcher'
  // (added to INF_MAP for the Backlog #126 comebacker mechanic; we don't want
  // the standard groundOut fielder roll to pick the pitcher randomly — only
  // the comebacker block should force nar.sub to 'the pitcher').
  const infKeys = Object.keys(INF_MAP).filter(k => k !== 'the catcher' && k !== 'the pitcher');
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
    case 'hbp': {
      // Hit by pitch (Idea #88) — three narration variants that each name a
      // body location for the impact, plus the pitch type. Adds visual /
      // narrative variety to a previously generic outcome. The bodyPart is
      // also threaded onto the nar object so the swing-handler can place the
      // dust-puff effect at the right vertical offset on the batter.
      const pt = randomPitch();
      const hbpVariants = [
        { text: `${bat} wears one — a ${pt} drills him on the elbow! Take your base.${sc}`, bodyPart: 'elbow' },
        { text: `${bat} can't get out of the way! The ${pt} catches him on the back. He'll take first.${sc}`, bodyPart: 'back' },
        { text: `Ouch! That ${pt} clips ${bat} on the foot. Hit by pitch — ${bat} jogs to first.${sc}`, bodyPart: 'foot' },
        { text: `${bat} is plunked by a ${pt} on the shoulder. Take your base.${sc}`, bodyPart: 'shoulder' },
        { text: `That ${pt} runs in and catches ${bat} on the hip. Hit by pitch.${sc}`, bodyPart: 'hip' },
      ];
      const hbpPick = hbpVariants[Math.floor(Math.random() * hbpVariants.length)];
      return { text: hbpPick.text, dir: 'none', sub: '', variant: 0, bodyPart: hbpPick.bodyPart };
    }
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

// Launch angle generator (Backlog #118, Statcast-style) — completes the
// Statcast trio (exit velo, distance, launch angle) that modern broadcasts
// show on every contact play. Returns a plausible launch angle in degrees
// for the outcome type. Real MLB sweet-spot is 25–35°, line drives 8–25°,
// fly balls 25–50°, ground balls -10 to 10°, popups 50°+. Ranges are tuned
// so the angle matches what the outcome looks like (a HR is more often a
// classic high-launch fly, a groundOut is a low-launch worm-burner, etc.).
function generateLaunchAngle(oc) {
  const rand = () => Math.random();
  switch (oc) {
    case 'homeRun': return Math.round(22 + rand() * 16); // 22-38° (classic HR sweet spot)
    case 'triple': return Math.round(15 + rand() * 14); // 15-29° (low line drive into the gap)
    case 'double': return Math.round(12 + rand() * 18); // 12-30° (gap drive)
    case 'single': return Math.round(8 + rand() * 18); // 8-26° (line drive or bloop)
    case 'lineOut': return Math.round(6 + rand() * 16); // 6-22° (rope right at someone)
    case 'flyOut': return Math.round(28 + rand() * 22); // 28-50° (true fly ball)
    case 'foulOut': return Math.round(45 + rand() * 30); // 45-75° (high popup behind plate)
    case 'groundOut': return Math.round(-8 + rand() * 16); // -8 to +8° (worm-burner)
    case 'doublePlay': return Math.round(-6 + rand() * 12); // -6 to +6° (sharp grounder)
    case 'error': return Math.round(0 + rand() * 18); // 0-18° (short hop or low liner)
    case 'bunt': return Math.round(-4 + rand() * 10); // -4 to +6° (rolling bunt)
    default: return null;
  }
}

// Bat speed generator (Backlog #122, Statcast-style) — completes the modern
// Statcast quartet (exit velo, distance, launch angle, bat speed) every
// broadcast graphic shows on contact plays. Bat speed was officially added
// to MLB Statcast displays in 2024. Returns mph (range ~58-86), tuned per
// outcome type to match the visual: HRs are barrel'd up with elite swings,
// solid line-drives and gap-doubles get above-average swings, weak contact
// (groundOuts, bunts, foulOuts) gets slower swings consistent with reality.
// Suppressed (returns null) for non-contact outcomes — only fires when there
// was actually bat-ball contact, so the chyron stays clean on balls / strikes.
function generateBatSpeed(oc) {
  const rand = () => Math.random();
  switch (oc) {
    case 'homeRun': return Math.round((78 + rand() * 8) * 10) / 10; // 78-86 mph (elite barrel swing)
    case 'triple': return Math.round((74 + rand() * 8) * 10) / 10; // 74-82 mph
    case 'double': return Math.round((72 + rand() * 9) * 10) / 10; // 72-81 mph
    case 'single': return Math.round((66 + rand() * 12) * 10) / 10; // 66-78 mph
    case 'lineOut': return Math.round((70 + rand() * 9) * 10) / 10; // 70-79 mph (rope right at someone)
    case 'flyOut': return Math.round((66 + rand() * 12) * 10) / 10; // 66-78 mph
    case 'foulOut': return Math.round((62 + rand() * 10) * 10) / 10; // 62-72 mph (popped up, weak)
    case 'groundOut': return Math.round((60 + rand() * 14) * 10) / 10; // 60-74 mph (mishit)
    case 'doublePlay': return Math.round((58 + rand() * 12) * 10) / 10; // 58-70 mph (jammed grounder)
    case 'error': return Math.round((64 + rand() * 12) * 10) / 10; // 64-76 mph
    case 'bunt': return Math.round((42 + rand() * 12) * 10) / 10; // 42-54 mph (deadens the ball)
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
    } else if (type === 'doubleSteal') {
      // Double steal (Backlog #144) — two runners sliding in near-unison plus a
      // quick crowd surge. Two staggered dirt-slide bursts (~140ms apart) layered
      // over a low rising swell. Fuller than a single stolenBase whoosh.
      const dur = 0.5, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / c.sampleRate;
        const s1 = (Math.random() * 2 - 1) * Math.exp(-t / 0.09) * 0.28 * (1 - t / dur * 0.4);
        const t2 = t - 0.14;
        const s2 = t2 > 0 ? (Math.random() * 2 - 1) * Math.exp(-t2 / 0.09) * 0.26 : 0;
        const swell = Math.sin(2 * Math.PI * (120 + t * 90) * t) * Math.min(t / 0.2, 1) * Math.exp(-t / 0.5) * 0.06;
        d[i] = s1 + s2 + swell;
      }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'dogPile') {
      // Walk-off dog pile (Backlog #145) — a big sustained crowd roar with a
      // water-cooler splash. Bell-shaped filtered-noise wash (the roaring crowd)
      // layered with a short splash burst, plus bright overlapping "whoop" cheer
      // tones riding on top. Longer and fuller than the walkOff fanfare it pairs with.
      const dur = 1.6, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.min(t / 0.3, 1) * Math.max(0, 1 - (t - 0.6) / 1.0);
        const roar = (Math.random() * 2 - 1) * env * 0.16;
        const ts = t - 0.15;
        const splash = (ts > 0 && ts < 0.25) ? (Math.random() * 2 - 1) * Math.exp(-ts / 0.06) * 0.18 : 0;
        d[i] = roar + splash;
      }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
      [430, 540, 360, 620, 480, 700].forEach((freq, i) => {
        const o = c.createOscillator(), g = c.createGain();
        const st = n + 0.1 + i * 0.09;
        o.type = 'sine'; o.frequency.setValueAtTime(freq * 0.9, st); o.frequency.linearRampToValueAtTime(freq, st + 0.18);
        g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(0.09, st + 0.05); g.gain.exponentialRampToValueAtTime(0.001, st + 0.4);
        o.connect(g); g.connect(c.destination); o.start(st); o.stop(st + 0.42);
      });
    } else if (type === 'dugoutCheer') {
      // Dugout high-five greeting line (Backlog #147) — the home-run hitter is
      // mobbed by teammates at the dugout. A warm medium-length cheer: a
      // bell-shaped crowd/teammate wash (~0.9s) with a handful of crisp
      // "high-five clap" transients riding on top, plus three bright overlapping
      // whoop tones. Shorter and lighter than the walk-off dogPile so it reads
      // as a celebratory greeting rather than a championship mob.
      const dur = 0.95, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.min(t / 0.12, 1) * Math.max(0, 1 - (t - 0.35) / 0.55);
        const wash = (Math.random() * 2 - 1) * env * 0.11;
        // Four staggered hand-clap transients (high-fives down the line)
        let clap = 0;
        [0.06, 0.20, 0.33, 0.46].forEach((ct) => {
          const td = t - ct;
          if (td > 0 && td < 0.05) clap += (Math.random() * 2 - 1) * Math.exp(-td / 0.012) * 0.22;
        });
        d[i] = wash + clap;
      }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
      [420, 560, 500].forEach((freq, i) => {
        const o = c.createOscillator(), g = c.createGain();
        const st = n + 0.12 + i * 0.11;
        o.type = 'sine'; o.frequency.setValueAtTime(freq * 0.9, st); o.frequency.linearRampToValueAtTime(freq, st + 0.16);
        g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(0.07, st + 0.05); g.gain.exponentialRampToValueAtTime(0.001, st + 0.34);
        o.connect(g); g.connect(c.destination); o.start(st); o.stop(st + 0.36);
      });
    } else if (type === 'hitAndRun') {
      // Hit and run (Backlog #148) — the runner breaks with the pitch, the batter
      // puts the ball on the ground, and the runner slides safely into second
      // while the batter is retired at first. Three staged beats over ~640ms:
      // (1) a crisp bat-on-ball ground-ball contact at t=0 (lighter than a full
      // `hit` crack), (2) pounding runner footfalls (the runner already in motion
      // off first), and (3) a glove pop at the bag as the batter is thrown out at
      // first. Distinct from `dragBunt` (soft bunt tap) and `stolenBase` (single
      // dirt slide) — this reads as "contact → sprint → out at first, runner safe."
      const dur = 0.64, b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / c.sampleRate;
        // (1) Ground-ball contact — short bright crack at t=0.
        const contact = (t < 0.09)
          ? ((Math.random() * 2 - 1) * Math.exp(-t / 0.014) * 0.34 + Math.sin(t * 620) * Math.exp(-t / 0.02) * 0.24)
          : 0;
        // (2) Pounding footfalls — gated low pulses from +60ms to ~460ms.
        let steps = 0;
        if (t > 0.06 && t < 0.46) {
          const env = Math.abs(Math.sin((t - 0.06) * 27)) > 0.74 ? 1 : 0;
          steps = Math.sin(t * 150) * Math.exp(-((t - 0.06) % 0.13) / 0.05) * env * 0.16;
        }
        // (3) Glove pop at first — crisp tonal pop + transient near +500ms.
        let pop = 0;
        const pt = t - 0.50;
        if (pt > 0 && pt < 0.1) pop = (Math.random() * 2 - 1) * Math.exp(-pt / 0.012) * 0.3 + Math.sin(pt * 660) * Math.exp(-pt / 0.02) * 0.22;
        d[i] = contact + steps + pop;
      }
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
    } else if (type === 'hrRobbed') {
      // HR robbery — rising whoosh of the leap + bright glove pop at the snag.
      // Whoosh: filtered noise rising 250→640 Hz over 360ms (the leap up the wall).
      const dur = 0.36, b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / c.sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t / 0.18) * 0.3 * Math.sin(t * 4);
        const sweep = Math.sin(t * (250 + 1080 * (t / dur))) * Math.exp(-t / 0.25) * 0.18;
        d[i] = noise + sweep;
      }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
      // Crisp glove pop at the catch (delayed ~280ms — the moment the ball hits leather)
      const pdur = 0.09, pb = c.createBuffer(1, Math.ceil(c.sampleRate * pdur), c.sampleRate), pd = pb.getChannelData(0);
      for (let i = 0; i < pd.length; i++) { const t = i / c.sampleRate; pd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.011) * 0.45 + Math.sin(t * 720) * Math.exp(-t / 0.022) * 0.22; }
      const ps = c.createBufferSource(); ps.buffer = pb; const pg = c.createGain();
      pg.gain.setValueAtTime(0.5, n + 0.28); pg.gain.exponentialRampToValueAtTime(0.001, n + 0.28 + pdur);
      ps.connect(pg); pg.connect(c.destination); ps.start(n + 0.28);
    } else if (type === 'catchersInterference') {
      // Catcher's interference (Backlog #76) — bat clipping the catcher's mitt.
      // A short, bright metallic-leather "tink" — a higher-frequency tonal pop
      // (the bat ticking the leather) plus a quick low transient (the mitt snap
      // from the contact). Distinct from a clean glove pop or hit; the slightly
      // dissonant overlay reads as the unintentional clash you actually hear.
      const dur = 0.14, b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / c.sampleRate;
        // High tonal "tink" (~1100Hz) — the bat ticking the leather mitt
        const tink = Math.sin(t * 6912) * Math.exp(-t / 0.025) * 0.32;
        // Low leather slap transient (~290Hz) — the mitt absorbing the bump
        const slap = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.34
                    + Math.sin(t * 290) * Math.exp(-t / 0.04) * 0.18;
        d[i] = tink + slap;
      }
      const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(n);
    } else if (type === 'lostInSun') {
      // Lost in the sun (Backlog #77) — outfielder loses a fly ball in the
      // afternoon sun. Soft rising whoosh of the missed reach, then a dull
      // thud as the ball hits the grass and dribbles. No glove pop — that's
      // the whole point. Two staged buffers played back-to-back.
      // Whoosh: filtered noise rising 180→440 Hz over 280ms (the swirling miss)
      const dur1 = 0.28, b1 = c.createBuffer(1, Math.ceil(c.sampleRate * dur1), c.sampleRate), d1 = b1.getChannelData(0);
      for (let i = 0; i < d1.length; i++) {
        const t = i / c.sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t / 0.18) * 0.22 * Math.sin(t * 6);
        const sweep = Math.sin(t * (180 + 940 * (t / dur1))) * Math.exp(-t / 0.22) * 0.14;
        d1[i] = noise + sweep;
      }
      const s1 = c.createBufferSource(); s1.buffer = b1; s1.connect(c.destination); s1.start(n);
      // Thud: dull, low-freq grass thump 220ms in (the ball lands and skips)
      const dur2 = 0.16, b2 = c.createBuffer(1, Math.ceil(c.sampleRate * dur2), c.sampleRate), d2 = b2.getChannelData(0);
      for (let i = 0; i < d2.length; i++) {
        const t = i / c.sampleRate;
        d2[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.05) * 0.26
              + Math.sin(t * 180) * Math.exp(-t / 0.08) * 0.18;
      }
      const s2 = c.createBufferSource(); s2.buffer = b2; const g2 = c.createGain();
      g2.gain.setValueAtTime(0.32, n + 0.22); g2.gain.exponentialRampToValueAtTime(0.001, n + 0.22 + dur2);
      s2.connect(g2); g2.connect(c.destination); s2.start(n + 0.22);
    } else if (type === 'bangBang') {
      // Bang-bang play at first (Backlog #75) — runner's foot hitting the bag
      // and the ball thudding into the first baseman's glove almost on top of
      // each other. Two near-synchronous transients with subtly different
      // tonal centers, separated by ~28ms (the "bang... bang") so the ear
      // can pick them apart without losing the close-call feel.
      // First "bang" — foot on bag (low woody thump, ~220Hz body)
      const dur1 = 0.11, b1 = c.createBuffer(1, Math.ceil(c.sampleRate * dur1), c.sampleRate), d1 = b1.getChannelData(0);
      for (let i = 0; i < d1.length; i++) {
        const t = i / c.sampleRate;
        d1[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.014) * 0.4
              + Math.sin(t * 220) * Math.exp(-t / 0.04) * 0.22;
      }
      const s1 = c.createBufferSource(); s1.buffer = b1; s1.connect(c.destination); s1.start(n);
      // Second "bang" — glove pop with crisp leather snap (~660Hz tonal)
      const dur2 = 0.09, b2 = c.createBuffer(1, Math.ceil(c.sampleRate * dur2), c.sampleRate), d2 = b2.getChannelData(0);
      for (let i = 0; i < d2.length; i++) {
        const t = i / c.sampleRate;
        d2[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.01) * 0.45
              + Math.sin(t * 660) * Math.exp(-t / 0.025) * 0.2;
      }
      const s2 = c.createBufferSource(); s2.buffer = b2; const g2 = c.createGain();
      g2.gain.setValueAtTime(0.45, n + 0.028); g2.gain.exponentialRampToValueAtTime(0.001, n + 0.028 + dur2);
      s2.connect(g2); g2.connect(c.destination); s2.start(n + 0.028);
    } else if (type === 'walkOff') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const o = sharedAudioCtx.createOscillator(), g = sharedAudioCtx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(freq, n + i * 0.15);
        g.gain.setValueAtTime(0.25, n + i * 0.15); g.gain.exponentialRampToValueAtTime(0.001, n + i * 0.15 + 0.6);
        o.connect(g); g.connect(sharedAudioCtx.destination); o.start(n + i * 0.15); o.stop(n + i * 0.15 + 0.6);
      });
    } else if (type === 'challengeBuzz') {
      // Manager challenge / replay review (Idea #80) — broadcast-style "review in
      // progress" tone. A low metallic buzz (~140 Hz, sustained ~1s with a slow
      // tremolo) followed by a tonal "verdict" rise from 360→520 Hz at ~1.2s in,
      // landing just as the call-stands/overturned reveal happens. Distinctive
      // from any other sound in the game — once you hear it, you know review is
      // underway.
      const o1 = c.createOscillator(), g1 = c.createGain();
      o1.type = 'sawtooth'; o1.frequency.setValueAtTime(140, n);
      g1.gain.setValueAtTime(0.0001, n); g1.gain.linearRampToValueAtTime(0.12, n + 0.05);
      g1.gain.linearRampToValueAtTime(0.12, n + 1.0);
      g1.gain.exponentialRampToValueAtTime(0.001, n + 1.25);
      o1.connect(g1); g1.connect(c.destination); o1.start(n); o1.stop(n + 1.3);
      // Slow tremolo via an LFO oscillator gating the gain
      const lfo = c.createOscillator(), lfoGain = c.createGain();
      lfo.type = 'sine'; lfo.frequency.setValueAtTime(5.5, n);
      lfoGain.gain.setValueAtTime(0.04, n);
      lfo.connect(lfoGain); lfoGain.connect(g1.gain);
      lfo.start(n); lfo.stop(n + 1.25);
      // Verdict rise — bright tonal sweep at the end
      const o2 = c.createOscillator(), g2 = c.createGain();
      o2.type = 'triangle'; o2.frequency.setValueAtTime(360, n + 1.20);
      o2.frequency.linearRampToValueAtTime(520, n + 1.55);
      g2.gain.setValueAtTime(0.0001, n + 1.20); g2.gain.linearRampToValueAtTime(0.18, n + 1.25);
      g2.gain.exponentialRampToValueAtTime(0.001, n + 1.65);
      o2.connect(g2); g2.connect(c.destination); o2.start(n + 1.20); o2.stop(n + 1.7);
    } else if (type === 'fanCheer') {
      // Foul ball into stands (Idea #81) — light "souvenir!" cheer when a fan in
      // the stands snags a foul. A small cluster of brief excited "whoop" tones
      // (random pitches in the 380–620 Hz human-voice register) layered with a
      // soft noise wash that simulates a small crowd reaction. Short and chirpy
      // — distinct from the heavier crowd-reaction bursts on big plays.
      for (let i = 0; i < 4; i++) {
        const start = n + i * 0.07 + (Math.random() * 0.05);
        const freq = 380 + Math.random() * 240;
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(freq, start);
        o.frequency.linearRampToValueAtTime(freq * 1.15, start + 0.12);
        g.gain.setValueAtTime(0.0001, start); g.gain.linearRampToValueAtTime(0.10, start + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        o.connect(g); g.connect(c.destination); o.start(start); o.stop(start + 0.25);
      }
      // Soft noise wash underneath (the broader crowd murmur reacting)
      const ndur = 0.35, nb = c.createBuffer(1, Math.ceil(c.sampleRate * ndur), c.sampleRate), nd = nb.getChannelData(0);
      for (let i = 0; i < nd.length; i++) {
        const t = i / c.sampleRate;
        nd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.25) * 0.12 * (1 - Math.exp(-t / 0.05));
      }
      const ns = c.createBufferSource(); ns.buffer = nb;
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.5, n); ng.gain.exponentialRampToValueAtTime(0.001, n + ndur);
      ns.connect(ng); ng.connect(c.destination); ns.start(n);
    } else if (type === 'insideTheParkHR') {
      // Inside-the-park home run (Idea #83) — rising fanfare cheer that builds as
      // the runner is rounding the bases, climaxing with a crowd roar and a
      // sliding-into-home thud. Three-stage layered sound: an ascending excited
      // tone cluster (the build-up as the ball rolls in the gap), a wide noise
      // wash (the crowd swelling), and a final low slide-thump (the headfirst
      // slide into the plate just before the ump signals safe).
      // Stage 1: ascending tone cluster (rises 320→760Hz over 1.0s)
      for (let i = 0; i < 3; i++) {
        const start = n + i * 0.18;
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(320 + i * 80, start);
        o.frequency.linearRampToValueAtTime(620 + i * 70, start + 0.7);
        g.gain.setValueAtTime(0.0001, start); g.gain.linearRampToValueAtTime(0.14, start + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.85);
        o.connect(g); g.connect(c.destination); o.start(start); o.stop(start + 0.9);
      }
      // Stage 2: crowd-roar noise wash (broad mid-frequency swell, 1.4s)
      const ndur = 1.4, nb = c.createBuffer(1, Math.ceil(c.sampleRate * ndur), c.sampleRate), nd = nb.getChannelData(0);
      for (let i = 0; i < nd.length; i++) {
        const t = i / c.sampleRate;
        // Noise that builds for 0.7s then sustains and falls
        const env = t < 0.7 ? (t / 0.7) : Math.exp(-(t - 0.7) / 0.5);
        nd[i] = (Math.random() * 2 - 1) * env * 0.18;
      }
      const ns = c.createBufferSource(); ns.buffer = nb;
      ns.connect(c.destination); ns.start(n + 0.1);
      // Stage 3: slide thump at the plate (low-freq impact at 1.05s in)
      const tdur = 0.18, tb = c.createBuffer(1, Math.ceil(c.sampleRate * tdur), c.sampleRate), td = tb.getChannelData(0);
      for (let i = 0; i < td.length; i++) {
        const t = i / c.sampleRate;
        td[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.05) * 0.32
              + Math.sin(t * 160) * Math.exp(-t / 0.09) * 0.22;
      }
      const ts = c.createBufferSource(); ts.buffer = tb; const tg = c.createGain();
      tg.gain.setValueAtTime(0.42, n + 1.05); tg.gain.exponentialRampToValueAtTime(0.001, n + 1.05 + tdur);
      ts.connect(tg); tg.connect(c.destination); ts.start(n + 1.05);
    } else if (type === 'rosinClap') {
      // Rosin bag clap (Backlog #84) — soft dusty leather-pat. Filtered noise
      // burst with a low-frequency body around 220Hz, decaying in ~140ms.
      // Distinct from the harder 'glovePop' / 'hit' sounds — this should read
      // as a quiet, thoughtful pat of chalk against the throwing hand, not a
      // sharp impact. Two layers: a soft puff (noise envelope) and a low body
      // tone (the muffled thump of leather against the palm).
      const dur = 0.14, b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / c.sampleRate;
        // Soft noise puff — high-end filtered chalk dust release
        const puff = (Math.random() * 2 - 1) * Math.exp(-t / 0.06) * 0.22;
        // Low body — muffled thump of canvas bag against palm (~220Hz)
        const body = Math.sin(t * 1382) * Math.exp(-t / 0.035) * 0.16;
        d[i] = puff + body;
      }
      const s = c.createBufferSource(); s.buffer = b;
      const g = c.createGain();
      g.gain.setValueAtTime(0.6, n); g.gain.exponentialRampToValueAtTime(0.001, n + dur);
      s.connect(g); g.connect(c.destination); s.start(n);
    } else if (type === 'triplePlay') {
      // Triple play (Backlog #85) — three rapid-fire mitt pops marking each
      // out at 0/0.18/0.36s, layered with a low brass-style fanfare swell that
      // rises on the third out. The three pops are slightly descending (700→
      // 600→500Hz) to match the around-the-horn relay flow (catch at 2B is
      // crisp, throw to 1B is mid, third out is the heavier "we got him too!"
      // pop). Distinct from doublePlayTurn (which is just two pops).
      // Layer 1: Three glove pops at 0 / 0.18 / 0.36s with descending tones
      const popFreqs = [700, 600, 500];
      for (let i = 0; i < 3; i++) {
        const popTime = n + i * 0.18;
        const pdur = 0.10, pb = c.createBuffer(1, Math.ceil(c.sampleRate * pdur), c.sampleRate), pd = pb.getChannelData(0);
        const freq = popFreqs[i];
        for (let j = 0; j < pd.length; j++) {
          const t = j / c.sampleRate;
          pd[j] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.45 + Math.sin(t * freq) * Math.exp(-t / 0.025) * 0.22;
        }
        const ps = c.createBufferSource(); ps.buffer = pb; const pg = c.createGain();
        // Volume rises slightly through the three pops — the third is the loudest
        const popVol = 0.35 + i * 0.08;
        pg.gain.setValueAtTime(popVol, popTime); pg.gain.exponentialRampToValueAtTime(0.001, popTime + pdur);
        ps.connect(pg); pg.connect(c.destination); ps.start(popTime);
      }
      // Layer 2: Brass-style fanfare swell — low triangle (~130Hz) rising to
      // 195Hz over 0.7s, lifting on the third out for the "we did it!" feel.
      const fanStart = n + 0.30;
      const fo = c.createOscillator(), fg = c.createGain();
      fo.type = 'triangle';
      fo.frequency.setValueAtTime(130, fanStart);
      fo.frequency.linearRampToValueAtTime(195, fanStart + 0.5);
      fg.gain.setValueAtTime(0.0001, fanStart);
      fg.gain.linearRampToValueAtTime(0.18, fanStart + 0.08);
      fg.gain.exponentialRampToValueAtTime(0.001, fanStart + 0.7);
      fo.connect(fg); fg.connect(c.destination); fo.start(fanStart); fo.stop(fanStart + 0.75);
      // Layer 3: A higher harmonic on the swell for richer brass timbre
      const fo2 = c.createOscillator(), fg2 = c.createGain();
      fo2.type = 'triangle';
      fo2.frequency.setValueAtTime(260, fanStart);
      fo2.frequency.linearRampToValueAtTime(390, fanStart + 0.5);
      fg2.gain.setValueAtTime(0.0001, fanStart);
      fg2.gain.linearRampToValueAtTime(0.10, fanStart + 0.08);
      fg2.gain.exponentialRampToValueAtTime(0.001, fanStart + 0.7);
      fo2.connect(fg2); fg2.connect(c.destination); fo2.start(fanStart); fo2.stop(fanStart + 0.75);
    } else if (type === 'hbpThud') {
      // Hit by pitch (Idea #88) — dull body thud with a mid-frequency woody tone.
      // Two-stage layer: a low-frequency body impact (~85Hz, the ball striking
      // flesh and pads) immediately followed by a higher-frequency tonal "thump"
      // (~310Hz, the ball compressing on contact). Distinct from a clean glove
      // pop or a sharp hit — this should read as the unmistakable "ouch" sound
      // every fan recognizes when a batter wears one.
      // Stage 1: low-freq body impact (the ball hitting the batter)
      const dur1 = 0.16, b1 = c.createBuffer(1, Math.ceil(c.sampleRate * dur1), c.sampleRate), d1 = b1.getChannelData(0);
      for (let i = 0; i < d1.length; i++) {
        const t = i / c.sampleRate;
        d1[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.02) * 0.42
              + Math.sin(t * 85) * Math.exp(-t / 0.07) * 0.32;
      }
      const s1 = c.createBufferSource(); s1.buffer = b1; s1.connect(c.destination); s1.start(n);
      // Stage 2: tonal mid-freq "thump" (the compression of the ball on contact, +18ms)
      const dur2 = 0.10, b2 = c.createBuffer(1, Math.ceil(c.sampleRate * dur2), c.sampleRate), d2 = b2.getChannelData(0);
      for (let i = 0; i < d2.length; i++) {
        const t = i / c.sampleRate;
        d2[i] = Math.sin(t * 310) * Math.exp(-t / 0.04) * 0.26
              + (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.18;
      }
      const s2 = c.createBufferSource(); s2.buffer = b2; const g2 = c.createGain();
      g2.gain.setValueAtTime(0.42, n + 0.018); g2.gain.exponentialRampToValueAtTime(0.001, n + 0.018 + dur2);
      s2.connect(g2); g2.connect(c.destination); s2.start(n + 0.018);
    } else if (type === 'gunDownAtPlate') {
      // Outfield assist at home (Idea #89) — dramatic crowd whoop + glove pop
      // for a runner gunned out at the plate. Layered: a rising "whoa!" tone
      // cluster (excitement as the throw sails in), a mid-frequency glove pop
      // (the catcher squeezes the ball with the runner sliding in), and a low
      // tag-thump beneath (the runner hitting the dirt at the plate as he's
      // tagged). Distinct from slideHome (which is for a SAFE call) — this
      // sound reads as "OUT! He got him!"
      // Stage 1: ascending "whoa!" tone cluster (rises over 0.4s)
      for (let i = 0; i < 3; i++) {
        const start = n + i * 0.05;
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(420 + i * 80, start);
        o.frequency.linearRampToValueAtTime(560 + i * 90, start + 0.32);
        g.gain.setValueAtTime(0.0001, start); g.gain.linearRampToValueAtTime(0.11, start + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.42);
        o.connect(g); g.connect(c.destination); o.start(start); o.stop(start + 0.45);
      }
      // Stage 2: crisp glove pop at the plate (the catch — 0.42s in)
      const popStart = n + 0.42;
      const pdur = 0.10, pb = c.createBuffer(1, Math.ceil(c.sampleRate * pdur), c.sampleRate), pd = pb.getChannelData(0);
      for (let i = 0; i < pd.length; i++) {
        const t = i / c.sampleRate;
        pd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.46
              + Math.sin(t * 700) * Math.exp(-t / 0.025) * 0.24;
      }
      const ps = c.createBufferSource(); ps.buffer = pb; const pg = c.createGain();
      pg.gain.setValueAtTime(0.55, popStart); pg.gain.exponentialRampToValueAtTime(0.001, popStart + pdur);
      ps.connect(pg); pg.connect(c.destination); ps.start(popStart);
      // Stage 3: low tag-thump 60ms after the pop (the runner hitting the dirt)
      const tdur = 0.14, tb = c.createBuffer(1, Math.ceil(c.sampleRate * tdur), c.sampleRate), td = tb.getChannelData(0);
      for (let i = 0; i < td.length; i++) {
        const t = i / c.sampleRate;
        td[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.05) * 0.28
              + Math.sin(t * 145) * Math.exp(-t / 0.08) * 0.20;
      }
      const ts = c.createBufferSource(); ts.buffer = tb; const tg = c.createGain();
      tg.gain.setValueAtTime(0.32, popStart + 0.06); tg.gain.exponentialRampToValueAtTime(0.001, popStart + 0.06 + tdur);
      ts.connect(tg); tg.connect(c.destination); ts.start(popStart + 0.06);
    } else if (type === 'foulTip') {
      // Foul tip strikeout (Backlog #86) — the bat barely grazes the ball, which
      // careens directly into the catcher's mitt for strike three. Two-stage
      // sound: a sharp high "tick" (the bat ticking the ball) at t=0, immediately
      // followed by a crisp glove-pop (the catcher squeezing the ball) at +35ms.
      // Captures the unmistakable "tick-pop" of the play.
      // Stage 1: high tick at ~1700Hz (sharp transient, decays in ~25ms)
      const tDur = 0.045, tb = c.createBuffer(1, Math.ceil(c.sampleRate * tDur), c.sampleRate), td = tb.getChannelData(0);
      for (let i = 0; i < td.length; i++) {
        const t = i / c.sampleRate;
        td[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.005) * 0.32
              + Math.sin(t * 1700) * Math.exp(-t / 0.012) * 0.30;
      }
      const ts = c.createBufferSource(); ts.buffer = tb; const tg = c.createGain();
      tg.gain.setValueAtTime(0.50, n); tg.gain.exponentialRampToValueAtTime(0.001, n + tDur);
      ts.connect(tg); tg.connect(c.destination); ts.start(n);
      // Stage 2: crisp glove-pop at ~640Hz, +35ms after the tick (the squeeze)
      const popStart = n + 0.035;
      const pDur = 0.10, pb = c.createBuffer(1, Math.ceil(c.sampleRate * pDur), c.sampleRate), pd = pb.getChannelData(0);
      for (let i = 0; i < pd.length; i++) {
        const t = i / c.sampleRate;
        pd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.42
              + Math.sin(t * 640) * Math.exp(-t / 0.025) * 0.22;
      }
      const ps = c.createBufferSource(); ps.buffer = pb; const pg = c.createGain();
      pg.gain.setValueAtTime(0.45, popStart); pg.gain.exponentialRampToValueAtTime(0.001, popStart + pDur);
      ps.connect(pg); pg.connect(c.destination); ps.start(popStart);
    } else if (type === 'texasLeaguer') {
      // Texas leaguer / bloop single (Backlog #91) — the bat just barely catches
      // the ball, popping it up in a soft floating arc that drops between the
      // infielders and outfielders. Three-stage sound: a soft "thwack" of weak
      // bat-ball contact, a descending whoosh as the ball floats softly through
      // the air, and a muted grass-thud as it drops in for a hit. Distinct from
      // a clean line-drive single — this reads as the lucky drop-in.
      // Stage 1: soft thwack of weak contact (low-mid transient at ~340Hz, 60ms)
      const cDur = 0.06, cb = c.createBuffer(1, Math.ceil(c.sampleRate * cDur), c.sampleRate), cd = cb.getChannelData(0);
      for (let i = 0; i < cd.length; i++) {
        const t = i / c.sampleRate;
        cd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.014) * 0.22
              + Math.sin(t * 340) * Math.exp(-t / 0.028) * 0.20;
      }
      const cs = c.createBufferSource(); cs.buffer = cb; const cg = c.createGain();
      cg.gain.setValueAtTime(0.35, n); cg.gain.exponentialRampToValueAtTime(0.001, n + cDur);
      cs.connect(cg); cg.connect(c.destination); cs.start(n);
      // Stage 2: descending whoosh of the soft floating arc (520→260 Hz over 380ms,
      // starting 80ms after the thwack — the ball is in the air heading down)
      const wStart = n + 0.08;
      const wDur = 0.38, wb = c.createBuffer(1, Math.ceil(c.sampleRate * wDur), c.sampleRate), wd = wb.getChannelData(0);
      for (let i = 0; i < wd.length; i++) {
        const t = i / c.sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t / 0.32) * 0.18;
        const sweep = Math.sin(t * (520 - 260 * (t / wDur))) * Math.exp(-t / 0.30) * 0.13;
        wd[i] = noise + sweep;
      }
      const ws = c.createBufferSource(); ws.buffer = wb; const wg = c.createGain();
      wg.gain.setValueAtTime(0.0001, wStart); wg.gain.linearRampToValueAtTime(0.30, wStart + 0.04);
      wg.gain.exponentialRampToValueAtTime(0.001, wStart + wDur);
      ws.connect(wg); wg.connect(c.destination); ws.start(wStart);
      // Stage 3: muted grass-thud as the ball drops in (~165Hz body, 130ms in)
      const gStart = n + 0.46;
      const gDur = 0.12, gb = c.createBuffer(1, Math.ceil(c.sampleRate * gDur), c.sampleRate), gd = gb.getChannelData(0);
      for (let i = 0; i < gd.length; i++) {
        const t = i / c.sampleRate;
        gd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.04) * 0.20
              + Math.sin(t * 165) * Math.exp(-t / 0.07) * 0.18;
      }
      const gs2 = c.createBufferSource(); gs2.buffer = gb; const gg2 = c.createGain();
      gg2.gain.setValueAtTime(0.30, gStart); gg2.gain.exponentialRampToValueAtTime(0.001, gStart + gDur);
      gs2.connect(gg2); gg2.connect(c.destination); gs2.start(gStart);
    } else if (type === 'brushback') {
      // Brushback / chin music (Backlog #94) — high-pitched whistle of a
      // fastball flying past the batter's head. Two-stage layer over ~340ms:
      // (1) a sharp rising tonal whistle (the ball whipping through the air,
      // 880→1380 Hz over 220ms — the Doppler effect of a 95+mph heater
      // crossing the batter's face) and (2) a soft glove-pop into the catcher
      // at +260ms after the ball passes. Distinct from `hit` (sharp wood
      // contact) and `hbpThud` (low body impact) — this is unmistakably an
      // "almost hit him" sound: high, fast, and fading.
      const wDur = 0.24;
      const wb = c.createBuffer(1, Math.ceil(c.sampleRate * wDur), c.sampleRate), wd = wb.getChannelData(0);
      for (let i = 0; i < wd.length; i++) {
        const t = i / c.sampleRate;
        // Rising tonal whistle (the ball Dopplering past the head)
        const freq = 880 + 500 * (t / wDur);
        const tone = Math.sin(t * freq) * Math.exp(-t / 0.18) * 0.18;
        // Filtered noise wash (air whoosh)
        const noise = (Math.random() * 2 - 1) * Math.exp(-t / 0.12) * 0.12;
        wd[i] = tone + noise;
      }
      const ws = c.createBufferSource(); ws.buffer = wb; const wg = c.createGain();
      wg.gain.setValueAtTime(0.0001, n); wg.gain.linearRampToValueAtTime(0.30, n + 0.04);
      wg.gain.exponentialRampToValueAtTime(0.001, n + wDur);
      ws.connect(wg); wg.connect(c.destination); ws.start(n);
      // Stage 2: soft glove-pop into the catcher at +260ms (the ball arrives
      // safely after sailing past the batter)
      const pStart = n + 0.26;
      const pDur = 0.07, pb = c.createBuffer(1, Math.ceil(c.sampleRate * pDur), c.sampleRate), pd = pb.getChannelData(0);
      for (let i = 0; i < pd.length; i++) {
        const t = i / c.sampleRate;
        pd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.22
              + Math.sin(t * 580) * Math.exp(-t / 0.03) * 0.18;
      }
      const ps = c.createBufferSource(); ps.buffer = pb; const pg = c.createGain();
      pg.gain.setValueAtTime(0.30, pStart); pg.gain.exponentialRampToValueAtTime(0.001, pStart + pDur);
      ps.connect(pg); pg.connect(c.destination); ps.start(pStart);
    } else if (type === 'ejection') {
      // Manager ejection (Backlog #95) — three-stage layer over ~1.2s capturing
      // the dramatic crowd-rising-then-roaring response: (1) a low rising
      // crowd murmur (the stadium realizing what's happening) for 400ms, (2)
      // a sharp umpire whistle blast at +280ms (the eject call itself, two
      // brief tonal pips), and (3) a bright crowd cheer/boo wave at +650ms.
      // Distinct from any other sound in the game — once you hear it, you
      // know the manager just got tossed.
      // Stage 1: rising crowd murmur (filtered noise + low oscillating tone)
      const mDur = 0.4, mb = c.createBuffer(1, Math.ceil(c.sampleRate * mDur), c.sampleRate), md = mb.getChannelData(0);
      for (let i = 0; i < md.length; i++) {
        const t = i / c.sampleRate;
        const noise = (Math.random() * 2 - 1) * 0.10;
        const lowOsc = Math.sin(t * 90) * 0.06;
        md[i] = (noise + lowOsc) * (t / mDur); // ramp up
      }
      const ms = c.createBufferSource(); ms.buffer = mb; const mg = c.createGain();
      mg.gain.setValueAtTime(0.0001, n); mg.gain.linearRampToValueAtTime(0.32, n + 0.30);
      mg.gain.exponentialRampToValueAtTime(0.001, n + mDur);
      ms.connect(mg); mg.connect(c.destination); ms.start(n);
      // Stage 2: umpire whistle / two-tone "you're outta here!" pip at +280ms
      const wStart = n + 0.28;
      const o1 = c.createOscillator(), o2 = c.createOscillator(), wG = c.createGain();
      o1.type = 'triangle'; o1.frequency.setValueAtTime(720, wStart); o1.frequency.linearRampToValueAtTime(960, wStart + 0.18);
      o2.type = 'triangle'; o2.frequency.setValueAtTime(1080, wStart + 0.10); o2.frequency.linearRampToValueAtTime(1320, wStart + 0.28);
      wG.gain.setValueAtTime(0.0001, wStart); wG.gain.linearRampToValueAtTime(0.22, wStart + 0.03);
      wG.gain.exponentialRampToValueAtTime(0.001, wStart + 0.30);
      o1.connect(wG); o2.connect(wG); wG.connect(c.destination);
      o1.start(wStart); o1.stop(wStart + 0.30);
      o2.start(wStart + 0.10); o2.stop(wStart + 0.30);
      // Stage 3: bright crowd cheer/boo wave at +650ms (filtered wide-band roar)
      const rStart = n + 0.65;
      const rDur = 0.55, rb = c.createBuffer(1, Math.ceil(c.sampleRate * rDur), c.sampleRate), rd = rb.getChannelData(0);
      for (let i = 0; i < rd.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.sin(Math.PI * (t / rDur)); // bell-shaped envelope
        const noise = (Math.random() * 2 - 1) * 0.18;
        const midOsc = Math.sin(t * 240) * 0.06;
        rd[i] = (noise + midOsc) * env;
      }
      const rs = c.createBufferSource(); rs.buffer = rb; const rG = c.createGain();
      rG.gain.setValueAtTime(0.42, rStart); rG.gain.exponentialRampToValueAtTime(0.001, rStart + rDur);
      rs.connect(rG); rG.connect(c.destination); rs.start(rStart);
    } else if (type === 'squeezePlay') {
      // Squeeze play (Backlog #97) — three-stage layer over ~0.85s capturing
      // the unmistakable choreography: (1) a soft "tap" of bunt-style bat-ball
      // contact (~240Hz, 80ms — the bat barely deadens the ball in front of
      // the plate), (2) a pulsating low rush of footfalls as the runner pounds
      // down the line from third (~165Hz noise + low-osc, 380ms starting at
      // +60ms), and (3) a bright crowd surge swelling at the moment the runner
      // crosses (~380Hz tonal cluster + filtered noise, 420ms starting at
      // +400ms). Distinct from a regular bunt sound — the addition of the
      // running pulse + crowd swell is what makes it read as a squeeze.
      // Stage 1: soft bunt tap (the bat barely catches the ball)
      const tDur = 0.08, tb = c.createBuffer(1, Math.ceil(c.sampleRate * tDur), c.sampleRate), td = tb.getChannelData(0);
      for (let i = 0; i < td.length; i++) {
        const t = i / c.sampleRate;
        td[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.32
              + Math.sin(t * 240) * Math.exp(-t / 0.04) * 0.20;
      }
      const ts = c.createBufferSource(); ts.buffer = tb; const tg = c.createGain();
      tg.gain.setValueAtTime(0.36, n); tg.gain.exponentialRampToValueAtTime(0.001, n + tDur);
      ts.connect(tg); tg.connect(c.destination); ts.start(n);
      // Stage 2: pounding footfalls (the runner sprinting from 3rd to home)
      const fStart = n + 0.06;
      const fDur = 0.38, fb = c.createBuffer(1, Math.ceil(c.sampleRate * fDur), c.sampleRate), fd = fb.getChannelData(0);
      for (let i = 0; i < fd.length; i++) {
        const t = i / c.sampleRate;
        // Low-frequency pulse representing footfalls (4–5 stomps over the run)
        const stomps = Math.abs(Math.sin(t * 28)) > 0.78 ? 1 : 0;
        const lowOsc = Math.sin(t * 165) * 0.18 * stomps;
        const noise = (Math.random() * 2 - 1) * 0.06 * (1 - t / fDur * 0.5);
        fd[i] = lowOsc + noise;
      }
      const fs = c.createBufferSource(); fs.buffer = fb; const fg = c.createGain();
      fg.gain.setValueAtTime(0.0001, fStart); fg.gain.linearRampToValueAtTime(0.36, fStart + 0.04);
      fg.gain.exponentialRampToValueAtTime(0.001, fStart + fDur);
      fs.connect(fg); fg.connect(c.destination); fs.start(fStart);
      // Stage 3: crowd surge (rising at the moment the runner crosses the plate)
      const cStart = n + 0.40;
      const cDur = 0.42, cb2 = c.createBuffer(1, Math.ceil(c.sampleRate * cDur), c.sampleRate), cd2 = cb2.getChannelData(0);
      for (let i = 0; i < cd2.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.sin(Math.PI * (t / cDur));
        const tone = Math.sin(t * 380) * 0.10;
        const noise = (Math.random() * 2 - 1) * 0.16;
        cd2[i] = (tone + noise) * env;
      }
      const cs = c.createBufferSource(); cs.buffer = cb2; const cg = c.createGain();
      cg.gain.setValueAtTime(0.40, cStart); cg.gain.exponentialRampToValueAtTime(0.001, cStart + cDur);
      cs.connect(cg); cg.connect(c.destination); cs.start(cStart);
    } else if (type === 'helmetThump') {
      // Flying helmet (Backlog #96) — short woody plastic-against-dirt thump
      // when the helmet hits the ground after popping off on a hard slide.
      // Two-stage layer over ~140ms: (1) a higher-pitch "knock" of the plastic
      // shell glancing off the dirt at t=0 (~520Hz), (2) a softer dirt-thud
      // beneath at +30ms (~150Hz body). The combination reads unmistakably as
      // a helmet bouncing off the field rather than a body or ball thump.
      const kDur = 0.06, kb = c.createBuffer(1, Math.ceil(c.sampleRate * kDur), c.sampleRate), kd = kb.getChannelData(0);
      for (let i = 0; i < kd.length; i++) {
        const t = i / c.sampleRate;
        kd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.008) * 0.28
              + Math.sin(t * 520) * Math.exp(-t / 0.018) * 0.22;
      }
      const ks = c.createBufferSource(); ks.buffer = kb; const kg = c.createGain();
      kg.gain.setValueAtTime(0.34, n); kg.gain.exponentialRampToValueAtTime(0.001, n + kDur);
      ks.connect(kg); kg.connect(c.destination); ks.start(n);
      // Stage 2: low dirt thud at +30ms
      const dStart = n + 0.030;
      const dDur = 0.10, db2 = c.createBuffer(1, Math.ceil(c.sampleRate * dDur), c.sampleRate), dd2 = db2.getChannelData(0);
      for (let i = 0; i < dd2.length; i++) {
        const t = i / c.sampleRate;
        dd2[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.04) * 0.18
              + Math.sin(t * 150) * Math.exp(-t / 0.06) * 0.14;
      }
      const ds = c.createBufferSource(); ds.buffer = db2; const dg = c.createGain();
      dg.gain.setValueAtTime(0.26, dStart); dg.gain.exponentialRampToValueAtTime(0.001, dStart + dDur);
      ds.connect(dg); dg.connect(c.destination); ds.start(dStart);
    } else if (type === 'plateSweep') {
      // Umpire plate sweep (Backlog #102) — soft "swish-swish" of a whisk
      // broom passing twice across home plate. Two filtered-noise sweeps
      // (~280ms each, ~600ms apart) at low volume so it reads as foreground
      // ritual without dominating the inning-summary moment. Each sweep is a
      // short noise burst with a high-pass character (filtered toward the
      // brushy 1500-2500 Hz range) plus a subtle low-end "drag" so the
      // bristles read as bristles rather than wind.
      const sweepBurst = (start) => {
        const sDur = 0.28, sb = c.createBuffer(1, Math.ceil(c.sampleRate * sDur), c.sampleRate), sd = sb.getChannelData(0);
        for (let i = 0; i < sd.length; i++) {
          const t = i / c.sampleRate;
          // Brushy noise — bandpass-ish via subtraction-of-low-rumble +
          // multiplicative shape so the burst swells and decays smoothly.
          const noise = (Math.random() * 2 - 1) * 0.18;
          const env = Math.sin((t / sDur) * Math.PI); // 0→1→0 sine envelope
          const low = Math.sin(t * 90) * 0.04 * env; // tiny low-end drag
          sd[i] = (noise * env) + low;
        }
        const ss = c.createBufferSource(); ss.buffer = sb; const sg = c.createGain();
        sg.gain.setValueAtTime(0.0001, start);
        sg.gain.linearRampToValueAtTime(0.18, start + 0.04);
        sg.gain.linearRampToValueAtTime(0.16, start + sDur - 0.05);
        sg.gain.exponentialRampToValueAtTime(0.001, start + sDur);
        ss.connect(sg); sg.connect(c.destination); ss.start(start);
      };
      sweepBurst(n);
      sweepBurst(n + 0.55);
    } else if (type === 'maskToss') {
      // Catcher's mask toss on pop-up (Backlog #98) — two-stage layer over
      // ~180ms. Stage 1: a low leather-creak transient (~190Hz, 80ms) as the
      // mask is whipped off the catcher's face. Stage 2: a softer dual-clatter
      // at +80ms (white-noise burst + a 340Hz tonal pop, the cage hitting the
      // dirt). Distinct from the helmetThump (heavier plastic-on-dirt knock)
      // and from any glove sound — reads unmistakably as a metal-cage mask
      // landing on the field.
      const cDur = 0.085, cb = c.createBuffer(1, Math.ceil(c.sampleRate * cDur), c.sampleRate), cd = cb.getChannelData(0);
      for (let i = 0; i < cd.length; i++) {
        const t = i / c.sampleRate;
        cd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.018) * 0.18
              + Math.sin(t * 190) * Math.exp(-t / 0.04) * 0.20;
      }
      const cs = c.createBufferSource(); cs.buffer = cb; const cg = c.createGain();
      cg.gain.setValueAtTime(0.32, n); cg.gain.exponentialRampToValueAtTime(0.001, n + cDur);
      cs.connect(cg); cg.connect(c.destination); cs.start(n);
      // Stage 2: dual-clatter as the cage hits the dirt (~340Hz tonal + noise burst)
      const lStart = n + 0.080;
      const lDur = 0.10, lb = c.createBuffer(1, Math.ceil(c.sampleRate * lDur), c.sampleRate), ld = lb.getChannelData(0);
      for (let i = 0; i < ld.length; i++) {
        const t = i / c.sampleRate;
        ld[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.22
              + Math.sin(t * 340) * Math.exp(-t / 0.05) * 0.16
              + Math.sin(t * 720) * Math.exp(-t / 0.025) * 0.08; // a tiny high-freq metal cage rattle
      }
      const ls = c.createBufferSource(); ls.buffer = lb; const lg = c.createGain();
      lg.gain.setValueAtTime(0.30, lStart); lg.gain.exponentialRampToValueAtTime(0.001, lStart + lDur);
      ls.connect(lg); lg.connect(c.destination); ls.start(lStart);
    } else if (type === 'infieldSingle') {
      // Infield single beat-out (Backlog #99) — three-stage layer over ~640ms
      // capturing the unmistakable rhythm of a slow grounder, the runner
      // sprinting down the line, and the throw arriving JUST after the bag.
      // Stage 1: sharp bat-ball contact "thwack" at t=0 (~380Hz with white-noise
      // burst — the contact). Stage 2: pounding footfalls at +60ms (~155Hz
      // pulses gated by a sin envelope for ~3-4 stomps over 380ms). Stage 3:
      // a bright infielder-throw glove-pop at +480ms (~620Hz tonal pop — the
      // throw arriving a beat AFTER the runner reaches the bag).
      const conDur = 0.06, conB = c.createBuffer(1, Math.ceil(c.sampleRate * conDur), c.sampleRate), conD = conB.getChannelData(0);
      for (let i = 0; i < conD.length; i++) {
        const t = i / c.sampleRate;
        conD[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.30
                + Math.sin(t * 380) * Math.exp(-t / 0.022) * 0.22;
      }
      const conS = c.createBufferSource(); conS.buffer = conB; const conG = c.createGain();
      conG.gain.setValueAtTime(0.40, n); conG.gain.exponentialRampToValueAtTime(0.001, n + conDur);
      conS.connect(conG); conG.connect(c.destination); conS.start(n);
      // Stage 2: pounding footfalls — pulsating low rumble at ~155Hz gated by a
      // sin envelope so distinct stomps emerge. Total length ~380ms starting
      // 60ms after contact.
      const ftStart = n + 0.06;
      const ftDur = 0.38, ftB = c.createBuffer(1, Math.ceil(c.sampleRate * ftDur), c.sampleRate), ftD = ftB.getChannelData(0);
      for (let i = 0; i < ftD.length; i++) {
        const t = i / c.sampleRate;
        const stomp = Math.abs(Math.sin(t * 24)) > 0.74 ? 1 : 0;
        ftD[i] = (Math.sin(t * 155) * Math.exp(-t / 0.30) * 0.18
               + (Math.random() * 2 - 1) * Math.exp(-t / 0.22) * 0.10) * stomp;
      }
      const ftS = c.createBufferSource(); ftS.buffer = ftB; const ftG = c.createGain();
      ftG.gain.setValueAtTime(0.0001, ftStart); ftG.gain.linearRampToValueAtTime(0.30, ftStart + 0.05);
      ftG.gain.linearRampToValueAtTime(0.20, ftStart + ftDur - 0.05);
      ftG.gain.exponentialRampToValueAtTime(0.001, ftStart + ftDur);
      ftS.connect(ftG); ftG.connect(c.destination); ftS.start(ftStart);
      // Stage 3: late glove-pop at the bag (~620Hz tonal + bright transient)
      const popStart = n + 0.48;
      const popDur = 0.09, popB = c.createBuffer(1, Math.ceil(c.sampleRate * popDur), c.sampleRate), popD = popB.getChannelData(0);
      for (let i = 0; i < popD.length; i++) {
        const t = i / c.sampleRate;
        popD[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.22
                + Math.sin(t * 620) * Math.exp(-t / 0.04) * 0.26;
      }
      const popS = c.createBufferSource(); popS.buffer = popB; const popG = c.createGain();
      popG.gain.setValueAtTime(0.30, popStart); popG.gain.exponentialRampToValueAtTime(0.001, popStart + popDur);
      popS.connect(popG); popG.connect(c.destination); popS.start(popStart);
    } else if (type === 'divingStop') {
      // Diving stop by infielder (Backlog #93) — three-stage layer over ~640ms
      // capturing the unmistakable "whoosh-thud-pop" of a fielder laying out
      // for a spectacular stop. Stage 1: filtered noise whoosh (the air rush
      // of the dive). Stage 2: a low body-thump as the fielder hits the dirt.
      // Stage 3: a crisp glove pop as the ball is snared.
      // Stage 1: dive whoosh (240→480 Hz over 200ms — the air rush of laying out)
      const wDur = 0.20, wb = c.createBuffer(1, Math.ceil(c.sampleRate * wDur), c.sampleRate), wd = wb.getChannelData(0);
      for (let i = 0; i < wd.length; i++) {
        const t = i / c.sampleRate;
        const sweep = Math.sin(t * (240 + 240 * (t / wDur))) * Math.exp(-t / 0.18) * 0.13;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t / 0.16) * 0.18;
        wd[i] = noise + sweep;
      }
      const ws = c.createBufferSource(); ws.buffer = wb; const wg = c.createGain();
      wg.gain.setValueAtTime(0.0001, n); wg.gain.linearRampToValueAtTime(0.32, n + 0.03);
      wg.gain.exponentialRampToValueAtTime(0.001, n + wDur);
      ws.connect(wg); wg.connect(c.destination); ws.start(n);
      // Stage 2: body-thump as fielder hits dirt (~140Hz body + noise burst at +210ms)
      const tStart = n + 0.21;
      const tDur = 0.13, tb = c.createBuffer(1, Math.ceil(c.sampleRate * tDur), c.sampleRate), td = tb.getChannelData(0);
      for (let i = 0; i < td.length; i++) {
        const t = i / c.sampleRate;
        td[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.04) * 0.22
              + Math.sin(t * 140) * Math.exp(-t / 0.08) * 0.22;
      }
      const ts2 = c.createBufferSource(); ts2.buffer = tb; const tg2 = c.createGain();
      tg2.gain.setValueAtTime(0.34, tStart); tg2.gain.exponentialRampToValueAtTime(0.001, tStart + tDur);
      ts2.connect(tg2); tg2.connect(c.destination); ts2.start(tStart);
      // Stage 3: crisp glove pop at +280ms (~720Hz tonal pop with high transient)
      const pStart = n + 0.28;
      const pDur = 0.09, pb = c.createBuffer(1, Math.ceil(c.sampleRate * pDur), c.sampleRate), pd = pb.getChannelData(0);
      for (let i = 0; i < pd.length; i++) {
        const t = i / c.sampleRate;
        pd[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.28
              + Math.sin(t * 720) * Math.exp(-t / 0.05) * 0.30;
      }
      const ps3 = c.createBufferSource(); ps3.buffer = pb; const pg3 = c.createGain();
      pg3.gain.setValueAtTime(0.36, pStart); pg3.gain.exponentialRampToValueAtTime(0.001, pStart + pDur);
      ps3.connect(pg3); pg3.connect(c.destination); ps3.start(pStart);
    } else if (type === 'comebacker') {
      // Pitcher comebacker / 1-3 putout (Backlog #126) — three-stage layer
      // over ~620ms capturing the unmistakable bat-crack → pitcher mitt pop
      // → 1B glove pop sequence of a comebacker. Stage 1: sharp bat-on-ball
      // crack (~580Hz spike at t=0, the line drive contact). Stage 2: low-mid
      // glove pop into the pitcher's mitt (~280Hz body at +240ms — slightly
      // muffled since pitchers wear smaller gloves). Stage 3: crisp first
      // baseman glove pop at +500ms (~720Hz pop with a high transient, the
      // throw arriving at 1B).
      // Stage 1: sharp bat crack (~580Hz spike)
      const cbCrackDur = 0.10, cbCrackB = c.createBuffer(1, Math.ceil(c.sampleRate * cbCrackDur), c.sampleRate), cbCrackD = cbCrackB.getChannelData(0);
      for (let i = 0; i < cbCrackD.length; i++) {
        const t = i / c.sampleRate;
        cbCrackD[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.008) * 0.34
                    + Math.sin(t * 580) * Math.exp(-t / 0.05) * 0.30;
      }
      const cbCrackS = c.createBufferSource(); cbCrackS.buffer = cbCrackB; const cbCrackG = c.createGain();
      cbCrackG.gain.setValueAtTime(0.38, n); cbCrackG.gain.exponentialRampToValueAtTime(0.001, n + cbCrackDur);
      cbCrackS.connect(cbCrackG); cbCrackG.connect(c.destination); cbCrackS.start(n);
      // Stage 2: pitcher mitt pop (~280Hz body at +240ms — muffled smaller-glove pop)
      const cbMittStart = n + 0.24;
      const cbMittDur = 0.11, cbMittB = c.createBuffer(1, Math.ceil(c.sampleRate * cbMittDur), c.sampleRate), cbMittD = cbMittB.getChannelData(0);
      for (let i = 0; i < cbMittD.length; i++) {
        const t = i / c.sampleRate;
        cbMittD[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.020) * 0.20
                   + Math.sin(t * 280) * Math.exp(-t / 0.06) * 0.26;
      }
      const cbMittS = c.createBufferSource(); cbMittS.buffer = cbMittB; const cbMittG = c.createGain();
      cbMittG.gain.setValueAtTime(0.28, cbMittStart); cbMittG.gain.exponentialRampToValueAtTime(0.001, cbMittStart + cbMittDur);
      cbMittS.connect(cbMittG); cbMittG.connect(c.destination); cbMittS.start(cbMittStart);
      // Stage 3: crisp 1B glove pop (~720Hz pop with high transient at +500ms)
      const cbFirstStart = n + 0.50;
      const cbFirstDur = 0.09, cbFirstB = c.createBuffer(1, Math.ceil(c.sampleRate * cbFirstDur), c.sampleRate), cbFirstD = cbFirstB.getChannelData(0);
      for (let i = 0; i < cbFirstD.length; i++) {
        const t = i / c.sampleRate;
        cbFirstD[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.010) * 0.28
                    + Math.sin(t * 720) * Math.exp(-t / 0.05) * 0.30;
      }
      const cbFirstS = c.createBufferSource(); cbFirstS.buffer = cbFirstB; const cbFirstG = c.createGain();
      cbFirstG.gain.setValueAtTime(0.34, cbFirstStart); cbFirstG.gain.exponentialRampToValueAtTime(0.001, cbFirstStart + cbFirstDur);
      cbFirstS.connect(cbFirstG); cbFirstG.connect(c.destination); cbFirstS.start(cbFirstStart);
    } else if (type === 'screenHit') {
      // Foul ball straight back to the screen (Backlog #127) — two-stage layer
      // over ~280ms capturing the unmistakable tick-and-clatter of a ball
      // tipped straight back into the protective netting behind home plate.
      // Stage 1: sharp high-freq tick (~1200Hz, the bat barely grazing the
      // ball) immediately followed by Stage 2: a soft chain-link "clatter"
      // (filtered noise + a brief metallic ping at ~840Hz). Distinct from
      // foulTip (tick + crisp glove-pop) and hit (heavy wood crack).
      // Stage 1: high-freq tick (50ms)
      const shTickDur = 0.05, shTickB = c.createBuffer(1, Math.ceil(c.sampleRate * shTickDur), c.sampleRate), shTickD = shTickB.getChannelData(0);
      for (let i = 0; i < shTickD.length; i++) {
        const t = i / c.sampleRate;
        shTickD[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.006) * 0.32
                   + Math.sin(t * 1200) * Math.exp(-t / 0.02) * 0.24;
      }
      const shTickS = c.createBufferSource(); shTickS.buffer = shTickB; const shTickG = c.createGain();
      shTickG.gain.setValueAtTime(0.34, n); shTickG.gain.exponentialRampToValueAtTime(0.001, n + shTickDur);
      shTickS.connect(shTickG); shTickG.connect(c.destination); shTickS.start(n);
      // Stage 2: chain-link clatter (filtered noise + 840Hz metallic ping, 220ms, starts right after tick)
      const shNetStart = n + 0.06;
      const shNetDur = 0.22, shNetB = c.createBuffer(1, Math.ceil(c.sampleRate * shNetDur), c.sampleRate), shNetD = shNetB.getChannelData(0);
      for (let i = 0; i < shNetD.length; i++) {
        const t = i / c.sampleRate;
        // Noise wash for the soft netting absorption — decays smoothly.
        const noise = (Math.random() * 2 - 1) * Math.exp(-t / 0.16) * 0.16;
        // Two brief metallic pings (~840Hz) at staggered intervals so the
        // ear reads "chain link" not "tonal note." Pings are short-attack,
        // quick-decay sine bursts overlaid on the noise wash.
        const ping1 = Math.sin(t * 840) * Math.exp(-Math.max(0, t - 0.02) / 0.04) * 0.12;
        const ping2 = Math.sin(t * 760) * Math.exp(-Math.max(0, t - 0.10) / 0.06) * 0.10;
        shNetD[i] = noise + (t >= 0.02 ? ping1 : 0) + (t >= 0.10 ? ping2 : 0);
      }
      const shNetS = c.createBufferSource(); shNetS.buffer = shNetB; const shNetG = c.createGain();
      shNetG.gain.setValueAtTime(0.0001, shNetStart); shNetG.gain.linearRampToValueAtTime(0.26, shNetStart + 0.02);
      shNetG.gain.exponentialRampToValueAtTime(0.001, shNetStart + shNetDur);
      shNetS.connect(shNetG); shNetG.connect(c.destination); shNetS.start(shNetStart);
    } else if (type === 'fistPump') {
      // Pitcher fist pump on clutch strikeout (Backlog #129) — three-stage
      // layer over ~340ms capturing the build → impact → crowd-wash reaction
      // of a closer punching his fist down after a big K. Stage 1: a quick
      // rising tone cluster (520→780Hz triangle, 120ms — the energy build
      // as the arm cocks). Stage 2: a punchy mid-frequency thump (~190Hz
      // body at +90ms — the moment the fist drives into the air). Stage 3:
      // a soft filtered-noise wash at +160ms (120ms — the implied stadium
      // roar). Bell-shaped gain envelope per layer; total cap ~0.20 so the
      // clip stays a flavor accent rather than dominating other audio.
      // Stage 1: rising tone build (120ms)
      const fpBuildDur = 0.12, fpBuildB = c.createBuffer(1, Math.ceil(c.sampleRate * fpBuildDur), c.sampleRate), fpBuildD = fpBuildB.getChannelData(0);
      for (let i = 0; i < fpBuildD.length; i++) {
        const t = i / c.sampleRate;
        // Triangle-ish rising sweep 520→780Hz (computed as a phase-modulated
        // sine to approximate a triangle harmonic content)
        const freq = 520 + (780 - 520) * (t / fpBuildDur);
        const env = Math.sin((t / fpBuildDur) * Math.PI); // bell-shaped
        fpBuildD[i] = (Math.sin(t * freq * 2 * Math.PI) * 0.6
                    + Math.sin(t * freq * 2 * Math.PI * 2) * 0.18) * env * 0.20;
      }
      const fpBuildS = c.createBufferSource(); fpBuildS.buffer = fpBuildB; const fpBuildG = c.createGain();
      fpBuildG.gain.setValueAtTime(0.0001, n); fpBuildG.gain.linearRampToValueAtTime(0.20, n + 0.02);
      fpBuildG.gain.exponentialRampToValueAtTime(0.001, n + fpBuildDur);
      fpBuildS.connect(fpBuildG); fpBuildG.connect(c.destination); fpBuildS.start(n);
      // Stage 2: punchy mid-frequency thump (~190Hz body at +90ms, 110ms)
      const fpThumpStart = n + 0.09;
      const fpThumpDur = 0.11, fpThumpB = c.createBuffer(1, Math.ceil(c.sampleRate * fpThumpDur), c.sampleRate), fpThumpD = fpThumpB.getChannelData(0);
      for (let i = 0; i < fpThumpD.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.sin((t / fpThumpDur) * Math.PI); // bell-shaped
        fpThumpD[i] = (Math.sin(t * 190 * 2 * Math.PI) * 0.55
                    + (Math.random() * 2 - 1) * 0.18) * env * 0.20;
      }
      const fpThumpS = c.createBufferSource(); fpThumpS.buffer = fpThumpB; const fpThumpG = c.createGain();
      fpThumpG.gain.setValueAtTime(0.0001, fpThumpStart); fpThumpG.gain.linearRampToValueAtTime(0.20, fpThumpStart + 0.02);
      fpThumpG.gain.exponentialRampToValueAtTime(0.001, fpThumpStart + fpThumpDur);
      fpThumpS.connect(fpThumpG); fpThumpG.connect(c.destination); fpThumpS.start(fpThumpStart);
      // Stage 3: filtered noise crowd wash at +160ms (120ms — implied roar)
      const fpRoarStart = n + 0.16;
      const fpRoarDur = 0.12, fpRoarB = c.createBuffer(1, Math.ceil(c.sampleRate * fpRoarDur), c.sampleRate), fpRoarD = fpRoarB.getChannelData(0);
      for (let i = 0; i < fpRoarD.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.sin((t / fpRoarDur) * Math.PI); // bell-shaped
        // Noise wash with a soft 380Hz mid tone underneath suggesting a
        // distant crowd reaction kicking in.
        fpRoarD[i] = ((Math.random() * 2 - 1) * 0.20
                    + Math.sin(t * 380 * 2 * Math.PI) * 0.10) * env * 0.18;
      }
      const fpRoarS = c.createBufferSource(); fpRoarS.buffer = fpRoarB; const fpRoarG = c.createGain();
      fpRoarG.gain.setValueAtTime(0.0001, fpRoarStart); fpRoarG.gain.linearRampToValueAtTime(0.18, fpRoarStart + 0.03);
      fpRoarG.gain.exponentialRampToValueAtTime(0.001, fpRoarStart + fpRoarDur);
      fpRoarS.connect(fpRoarG); fpRoarG.connect(c.destination); fpRoarS.start(fpRoarStart);
    } else if (type === 'catcherSnap') {
      // Catcher's snap-throw pickoff to 2B (Backlog #132) — a sharp two-stage
      // layer over ~340ms representing the catcher's quick pop-and-throw to
      // catch a runner napping at 2B. (1) A bright high-frequency leather pop
      // (~520Hz body + filtered-noise wash, ~80ms — the catcher's mitt
      // snapping out of the catch position into the throw) followed by (2) a
      // crisp glove-pop arrival at 2B (~720Hz at +280ms — the snap throw
      // hitting the SS/2B's glove on the bag). Distinct from `glovePop` (a
      // single broader transient) — this is two-stage to capture the
      // catch-and-throw rhythm of a real snap throw.
      const csDur1 = 0.08, csB1 = c.createBuffer(1, Math.ceil(c.sampleRate * csDur1), c.sampleRate), csD1 = csB1.getChannelData(0);
      for (let i = 0; i < csD1.length; i++) {
        const t = i / c.sampleRate;
        csD1[i] = Math.sin(t * 520) * Math.exp(-t / 0.04) * 0.20
               + (Math.random() * 2 - 1) * Math.exp(-t / 0.025) * 0.10;
      }
      const csS1 = c.createBufferSource(); csS1.buffer = csB1; const csG1 = c.createGain();
      csG1.gain.setValueAtTime(0.20, n); csG1.gain.exponentialRampToValueAtTime(0.001, n + csDur1);
      csS1.connect(csG1); csG1.connect(c.destination); csS1.start(n);
      // Stage 2: arrival pop at 2B
      const csStart2 = n + 0.28;
      const csDur2 = 0.09, csB2 = c.createBuffer(1, Math.ceil(c.sampleRate * csDur2), c.sampleRate), csD2 = csB2.getChannelData(0);
      for (let i = 0; i < csD2.length; i++) {
        const t = i / c.sampleRate;
        csD2[i] = Math.sin(t * 720) * Math.exp(-t / 0.04) * 0.22
               + (Math.random() * 2 - 1) * Math.exp(-t / 0.02) * 0.08;
      }
      const csS2 = c.createBufferSource(); csS2.buffer = csB2; const csG2 = c.createGain();
      csG2.gain.setValueAtTime(0.22, csStart2); csG2.gain.exponentialRampToValueAtTime(0.001, csStart2 + csDur2);
      csS2.connect(csG2); csG2.connect(c.destination); csS2.start(csStart2);
    } else if (type === 'wildPickoff') {
      // Wild / errant pickoff throw (Backlog #134) — the pitcher (or catcher)
      // tries to pick off a runner but the throw sails wide of the bag, skips
      // past the fielder, and the runner advances. Three-stage layer over
      // ~440ms representing the throw's flight, the skip past the bag, and
      // the dirt-scuff scatter. (1) A brief mid-frequency tonal "whoosh"
      // (~360→260 Hz triangle wave with filtered noise wash, ~120ms — the
      // sailing throw that's clearly off-target). (2) A muted leather-glance
      // pop at +140ms (~420Hz body + sharp transient, ~70ms — the ball just
      // grazing past the fielder's glove). (3) A low dirt-skid scatter at
      // +220ms (~140Hz body + filtered noise burst, ~180ms — the ball
      // skipping along the basepath into foul/OF territory). Cap gain ~0.18,
      // intentionally distinct from the standard `glovePop` (which is a
      // single clean transient) and the `bobble` effect (which is the
      // ball clanking off the heel of the glove).
      const wpDur1 = 0.12, wpB1 = c.createBuffer(1, Math.ceil(c.sampleRate * wpDur1), c.sampleRate), wpD1 = wpB1.getChannelData(0);
      for (let i = 0; i < wpD1.length; i++) {
        const t = i / c.sampleRate;
        const freq = 360 - (260 - 0) * (t / wpDur1); // descending whoosh
        wpD1[i] = (Math.sin(t * freq * 2 * Math.PI) * 0.10
                 + (Math.random() * 2 - 1) * 0.06) * Math.exp(-t / 0.07);
      }
      const wpS1 = c.createBufferSource(); wpS1.buffer = wpB1; const wpG1 = c.createGain();
      wpG1.gain.setValueAtTime(0.18, n); wpG1.gain.exponentialRampToValueAtTime(0.001, n + wpDur1);
      wpS1.connect(wpG1); wpG1.connect(c.destination); wpS1.start(n);
      // Stage 2: muted leather-glance pop (ball just grazes past the glove)
      const wpStart2 = n + 0.14;
      const wpDur2 = 0.07, wpB2 = c.createBuffer(1, Math.ceil(c.sampleRate * wpDur2), c.sampleRate), wpD2 = wpB2.getChannelData(0);
      for (let i = 0; i < wpD2.length; i++) {
        const t = i / c.sampleRate;
        wpD2[i] = Math.sin(t * 420) * Math.exp(-t / 0.03) * 0.16
               + (Math.random() * 2 - 1) * Math.exp(-t / 0.022) * 0.08;
      }
      const wpS2 = c.createBufferSource(); wpS2.buffer = wpB2; const wpG2 = c.createGain();
      wpG2.gain.setValueAtTime(0.16, wpStart2); wpG2.gain.exponentialRampToValueAtTime(0.001, wpStart2 + wpDur2);
      wpS2.connect(wpG2); wpG2.connect(c.destination); wpS2.start(wpStart2);
      // Stage 3: low dirt-skid scatter (ball skipping past the bag)
      const wpStart3 = n + 0.22;
      const wpDur3 = 0.18, wpB3 = c.createBuffer(1, Math.ceil(c.sampleRate * wpDur3), c.sampleRate), wpD3 = wpB3.getChannelData(0);
      for (let i = 0; i < wpD3.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.sin((t / wpDur3) * Math.PI) * Math.exp(-t / 0.10);
        wpD3[i] = ((Math.random() * 2 - 1) * 0.18
                 + Math.sin(t * 140) * 0.08) * env;
      }
      const wpS3 = c.createBufferSource(); wpS3.buffer = wpB3; const wpG3 = c.createGain();
      wpG3.gain.setValueAtTime(0.001, wpStart3); wpG3.gain.linearRampToValueAtTime(0.16, wpStart3 + 0.02);
      wpG3.gain.exponentialRampToValueAtTime(0.001, wpStart3 + wpDur3);
      wpS3.connect(wpG3); wpG3.connect(c.destination); wpS3.start(wpStart3);
    } else if (type === 'freshBall') {
      // Fresh ball toss from the home plate umpire to the pitcher (Backlog
      // #135) — fires after HRs and fan-grab fouls when the game ball is
      // "gone" and the umpire reaches into his ball bag for a new one. A
      // single soft mid-low tonal pat (~290Hz body) with a quick attack and
      // gentle decay, layered with a brief filtered-noise wash representing
      // the leather-on-leather catch in the pitcher's glove. ~140ms total,
      // cap gain ~0.10 — intentionally very quiet so it reads as a subtle
      // between-pitch ritual rather than a featured moment. Distinct from
      // `glovePop` (a sharper, brighter pop with a clean transient) and
      // from `tipCap` (a slightly lower-pitched single tone).
      const fbDur = 0.14, fbB = c.createBuffer(1, Math.ceil(c.sampleRate * fbDur), c.sampleRate), fbD = fbB.getChannelData(0);
      for (let i = 0; i < fbD.length; i++) {
        const t = i / c.sampleRate;
        fbD[i] = Math.sin(t * 290) * Math.exp(-t / 0.055) * 0.10
              + (Math.random() * 2 - 1) * Math.exp(-t / 0.045) * 0.05;
      }
      const fbS = c.createBufferSource(); fbS.buffer = fbB; const fbG = c.createGain();
      fbG.gain.setValueAtTime(0.0001, n); fbG.gain.linearRampToValueAtTime(0.10, n + 0.015);
      fbG.gain.exponentialRampToValueAtTime(0.001, n + fbDur);
      fbS.connect(fbG); fbG.connect(c.destination); fbS.start(n);
    } else if (type === 'dragBunt') {
      // Drag bunt single (Backlog #139) — the batter deadens a soft bunt down
      // the line and sprints to beat the throw to first. Three-stage layer
      // over ~620ms capturing the unmistakable rhythm: (1) soft bunt-tap at
      // t=0 (~240Hz dead-ball body + brief high-freq tick — the bat barely
      // contacting the ball, intentionally muted vs. the heavier `hit` crack),
      // (2) pounding footfalls at +60ms (~150Hz gated by a sin envelope so
      // distinct stomps emerge — the batter sprinting down the line, ~380ms),
      // (3) late glove-pop at the bag at +480ms (~640Hz crisp tonal pop — the
      // throw arriving JUST after the batter beats it). Distinct from
      // `infieldSingle` (sharper bat contact for a regular ground ball that
      // beat the throw) and from `squeezePlay` (similar bunt-tap rhythm but
      // with crowd surge instead of late glove-pop).
      const dbConDur = 0.05, dbConB = c.createBuffer(1, Math.ceil(c.sampleRate * dbConDur), c.sampleRate), dbConD = dbConB.getChannelData(0);
      for (let i = 0; i < dbConD.length; i++) {
        const t = i / c.sampleRate;
        dbConD[i] = Math.sin(t * 240) * Math.exp(-t / 0.022) * 0.20
                  + Math.sin(t * 880) * Math.exp(-t / 0.008) * 0.08
                  + (Math.random() * 2 - 1) * Math.exp(-t / 0.010) * 0.12;
      }
      const dbConS = c.createBufferSource(); dbConS.buffer = dbConB; const dbConG = c.createGain();
      dbConG.gain.setValueAtTime(0.32, n); dbConG.gain.exponentialRampToValueAtTime(0.001, n + dbConDur);
      dbConS.connect(dbConG); dbConG.connect(c.destination); dbConS.start(n);
      // Stage 2: pounding footfalls
      const dbFtStart = n + 0.06;
      const dbFtDur = 0.38, dbFtB = c.createBuffer(1, Math.ceil(c.sampleRate * dbFtDur), c.sampleRate), dbFtD = dbFtB.getChannelData(0);
      for (let i = 0; i < dbFtD.length; i++) {
        const t = i / c.sampleRate;
        const stomp = Math.abs(Math.sin(t * 26)) > 0.74 ? 1 : 0;
        dbFtD[i] = (Math.sin(t * 150) * Math.exp(-t / 0.30) * 0.16
                 + (Math.random() * 2 - 1) * Math.exp(-t / 0.22) * 0.09) * stomp;
      }
      const dbFtS = c.createBufferSource(); dbFtS.buffer = dbFtB; const dbFtG = c.createGain();
      dbFtG.gain.setValueAtTime(0.0001, dbFtStart); dbFtG.gain.linearRampToValueAtTime(0.28, dbFtStart + 0.05);
      dbFtG.gain.linearRampToValueAtTime(0.18, dbFtStart + dbFtDur - 0.05);
      dbFtG.gain.exponentialRampToValueAtTime(0.001, dbFtStart + dbFtDur);
      dbFtS.connect(dbFtG); dbFtG.connect(c.destination); dbFtS.start(dbFtStart);
      // Stage 3: late glove-pop at the bag (~640Hz crisp tonal pop)
      const dbPopStart = n + 0.48;
      const dbPopDur = 0.09, dbPopB = c.createBuffer(1, Math.ceil(c.sampleRate * dbPopDur), c.sampleRate), dbPopD = dbPopB.getChannelData(0);
      for (let i = 0; i < dbPopD.length; i++) {
        const t = i / c.sampleRate;
        dbPopD[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.012) * 0.22
                  + Math.sin(t * 640) * Math.exp(-t / 0.04) * 0.26;
      }
      const dbPopS = c.createBufferSource(); dbPopS.buffer = dbPopB; const dbPopG = c.createGain();
      dbPopG.gain.setValueAtTime(0.30, dbPopStart); dbPopG.gain.exponentialRampToValueAtTime(0.001, dbPopStart + dbPopDur);
      dbPopS.connect(dbPopG); dbPopG.connect(c.destination); dbPopS.start(dbPopStart);
    } else if (type === 'curtainCall') {
      // Curtain call (Backlog #141) — the home crowd roars the hero back out
      // of the dugout after a huge home run. A warm sustained crowd swell:
      // (1) a broad applause/cheer wash built from filtered noise that rises
      //     and holds (~1.2s — the standing ovation), layered with
      // (2) a small cluster of bright overlapping "whoop" cheer tones in the
      //     human-voice register (380–640 Hz) that ride on top of the wash.
      // Fuller and longer than `fanCheer` (a quick souvenir-grab chirp) — this
      // is a genuine ovation moment, so the cap gain is a touch higher.
      const ccDur = 1.2, ccB = c.createBuffer(1, Math.ceil(c.sampleRate * ccDur), c.sampleRate), ccD = ccB.getChannelData(0);
      for (let i = 0; i < ccD.length; i++) {
        const t = i / c.sampleRate;
        // Bell-shaped applause envelope: swells in over ~250ms, holds, fades.
        const env = Math.min(1, t / 0.25) * Math.exp(-Math.max(0, t - 0.55) / 0.5);
        ccD[i] = (Math.random() * 2 - 1) * env * 0.22;
      }
      const ccS = c.createBufferSource(); ccS.buffer = ccB; const ccG = c.createGain();
      ccG.gain.setValueAtTime(0.5, n); ccG.gain.exponentialRampToValueAtTime(0.001, n + ccDur);
      ccS.connect(ccG); ccG.connect(c.destination); ccS.start(n);
      // Bright overlapping cheer tones riding on the applause wash
      for (let i = 0; i < 6; i++) {
        const start = n + 0.05 + i * 0.09 + (Math.random() * 0.06);
        const freq = 380 + Math.random() * 260;
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(freq, start);
        o.frequency.linearRampToValueAtTime(freq * 1.12, start + 0.18);
        g.gain.setValueAtTime(0.0001, start); g.gain.linearRampToValueAtTime(0.07, start + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.30);
        o.connect(g); g.connect(c.destination); o.start(start); o.stop(start + 0.34);
      }
    } else if (type === 'capTipFan') {
      // Cap-tip-to-fan (Backlog #133) — a soft, brief friendly tone suggesting
      // the batter's brief acknowledgment of the fan in the stands. ~120ms
      // total: a single low-mid frequency tone (~360Hz body) with a quick
      // attack and gentle decay. Intentionally very quiet (cap gain ~0.10) so
      // it reads as a subtle background moment rather than a featured effect.
      // Distinct from `tipCap` (which is the pitcher tipping his cap to a
      // fielder — a similar but slightly lower-pitched gesture).
      const cfDur = 0.12, cfB = c.createBuffer(1, Math.ceil(c.sampleRate * cfDur), c.sampleRate), cfD = cfB.getChannelData(0);
      for (let i = 0; i < cfD.length; i++) {
        const t = i / c.sampleRate;
        cfD[i] = Math.sin(t * 360) * Math.exp(-t / 0.05) * 0.10
              + (Math.random() * 2 - 1) * Math.exp(-t / 0.035) * 0.04;
      }
      const cfS = c.createBufferSource(); cfS.buffer = cfB; const cfG = c.createGain();
      cfG.gain.setValueAtTime(0.0001, n); cfG.gain.linearRampToValueAtTime(0.14, n + 0.02);
      cfG.gain.exponentialRampToValueAtTime(0.001, n + cfDur);
      cfS.connect(cfG); cfG.connect(c.destination); cfS.start(n);
    } else if (type === 'tipCap') {
      // Tip of the cap to a fielder (Backlog #100) — a soft, almost imperceptible
      // single leather-pat tone. Pure visual emphasis — the tipCap moment is
      // about the gesture, not the sound. ~140ms total: a single low-mid
      // frequency tone (~280Hz) with a brief noise wash, decaying smoothly.
      const tcDur = 0.14, tcB = c.createBuffer(1, Math.ceil(c.sampleRate * tcDur), c.sampleRate), tcD = tcB.getChannelData(0);
      for (let i = 0; i < tcD.length; i++) {
        const t = i / c.sampleRate;
        tcD[i] = Math.sin(t * 280) * Math.exp(-t / 0.06) * 0.10
              + (Math.random() * 2 - 1) * Math.exp(-t / 0.04) * 0.06;
      }
      const tcS = c.createBufferSource(); tcS.buffer = tcB; const tcG = c.createGain();
      tcG.gain.setValueAtTime(0.18, n); tcG.gain.exponentialRampToValueAtTime(0.001, n + tcDur);
      tcS.connect(tcG); tcG.connect(c.destination); tcS.start(n);
    } else if (type === 'frameMitt') {
      // Catcher framing (Backlog #130) — a soft, muted leather creak suggesting
      // the catcher subtly turning the glove inward after the catch to "frame"
      // the pitch as a strike. Two-stage layer over ~220ms: (1) a brief mid-
      // frequency tone (~180Hz body) representing the leather mitt flexing
      // (~100ms), (2) a soft filtered-noise wash starting at +40ms (the creak
      // and slight motion through the leather, ~180ms). Intentionally very
      // quiet (cap gain ~0.12) so it reads as a subtle pre-call moment
      // without dominating the soundscape. Distinct from `glovePop` (which
      // has a sharper high-freq attack — the audible "pop" of a fastball
      // hitting the leather), from `tipCap` (a single broader tap), and
      // from `shakeOff` (a two-tap "no-no" thump).
      const fmDur = 0.10, fmB = c.createBuffer(1, Math.ceil(c.sampleRate * fmDur), c.sampleRate), fmD = fmB.getChannelData(0);
      for (let i = 0; i < fmD.length; i++) {
        const t = i / c.sampleRate;
        fmD[i] = Math.sin(t * 180) * Math.exp(-t / 0.055) * 0.10
              + (Math.random() * 2 - 1) * Math.exp(-t / 0.04) * 0.04;
      }
      const fmS = c.createBufferSource(); fmS.buffer = fmB; const fmG = c.createGain();
      fmG.gain.setValueAtTime(0.12, n); fmG.gain.exponentialRampToValueAtTime(0.001, n + fmDur);
      fmS.connect(fmG); fmG.connect(c.destination); fmS.start(n);
      // Stage 2: filtered-noise creak (the leather flexing as the glove turns)
      const fmCrkStart = n + 0.04;
      const fmCrkDur = 0.18, fmCrkB = c.createBuffer(1, Math.ceil(c.sampleRate * fmCrkDur), c.sampleRate), fmCrkD = fmCrkB.getChannelData(0);
      for (let i = 0; i < fmCrkD.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.sin((t / fmCrkDur) * Math.PI); // bell-shaped envelope
        fmCrkD[i] = ((Math.random() * 2 - 1) * 0.10
                  + Math.sin(t * 240) * 0.05) * env;
      }
      const fmCrkS = c.createBufferSource(); fmCrkS.buffer = fmCrkB; const fmCrkG = c.createGain();
      fmCrkG.gain.setValueAtTime(0.0001, fmCrkStart); fmCrkG.gain.linearRampToValueAtTime(0.10, fmCrkStart + 0.02);
      fmCrkG.gain.exponentialRampToValueAtTime(0.001, fmCrkStart + fmCrkDur);
      fmCrkS.connect(fmCrkG); fmCrkG.connect(c.destination); fmCrkS.start(fmCrkStart);
    } else if (type === 'shakeOff') {
      // Pitcher shake-off (Backlog #104) — a soft, brushy two-tap "no-no" tone
      // representing the pitcher dismissing the catcher's first sign. ~300ms
      // total: two short low-frequency thumps (~110Hz body) ~120ms apart with
      // a tiny noise wash, intentionally muted so it reads as foreground
      // ritual without dominating the pre-pitch beat. Distinct from any other
      // sound in the game — definitely not a glove pop or bobble.
      const soDur = 0.10;
      const tap = (start) => {
        const sB = c.createBuffer(1, Math.ceil(c.sampleRate * soDur), c.sampleRate), sD = sB.getChannelData(0);
        for (let i = 0; i < sD.length; i++) {
          const t = i / c.sampleRate;
          sD[i] = Math.sin(t * 110) * Math.exp(-t / 0.045) * 0.18
                + (Math.random() * 2 - 1) * Math.exp(-t / 0.025) * 0.05;
        }
        const sS = c.createBufferSource(); sS.buffer = sB; const sG = c.createGain();
        sG.gain.setValueAtTime(0.16, start); sG.gain.exponentialRampToValueAtTime(0.001, start + soDur);
        sS.connect(sG); sG.connect(c.destination); sS.start(start);
      };
      tap(n);
      tap(n + 0.13);
    } else if (type === 'stealHomeSafe') {
      // Steal of home — SAFE (Backlog #101) — three-stage layer over ~720ms
      // capturing the breakaway sprint, footfalls, and crowd surge as the
      // runner crosses the plate. Stage 1: rising tonal cluster (320→640Hz
      // over 320ms — the runner breaking for home). Stage 2: pounding
      // footfalls at +60ms (~145Hz pulses gated by sin envelope, ~5 stomps
      // over 380ms). Stage 3: crowd burst at +500ms (filtered noise + 380Hz
      // mid-osc with bell envelope — the crowd erupting as the run scores).
      const sDur = 0.32, sB = c.createBuffer(1, Math.ceil(c.sampleRate * sDur), c.sampleRate), sD = sB.getChannelData(0);
      for (let i = 0; i < sD.length; i++) {
        const t = i / c.sampleRate;
        const sweep = Math.sin(t * (320 + 320 * (t / sDur))) * Math.exp(-t / 0.30) * 0.16;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t / 0.28) * 0.08;
        sD[i] = sweep + noise;
      }
      const sS1 = c.createBufferSource(); sS1.buffer = sB; const sG1 = c.createGain();
      sG1.gain.setValueAtTime(0.0001, n); sG1.gain.linearRampToValueAtTime(0.30, n + 0.04);
      sG1.gain.exponentialRampToValueAtTime(0.001, n + sDur);
      sS1.connect(sG1); sG1.connect(c.destination); sS1.start(n);
      // Stage 2: pounding footfalls (~145Hz pulses, ~5 stomps over 380ms)
      const ftStart = n + 0.06;
      const ftDur = 0.38, ftB = c.createBuffer(1, Math.ceil(c.sampleRate * ftDur), c.sampleRate), ftD = ftB.getChannelData(0);
      for (let i = 0; i < ftD.length; i++) {
        const t = i / c.sampleRate;
        const stomp = Math.abs(Math.sin(t * 28)) > 0.78 ? 1 : 0;
        ftD[i] = (Math.sin(t * 145) * Math.exp(-t / 0.26) * 0.18
               + (Math.random() * 2 - 1) * Math.exp(-t / 0.20) * 0.10) * stomp;
      }
      const ftS = c.createBufferSource(); ftS.buffer = ftB; const ftG = c.createGain();
      ftG.gain.setValueAtTime(0.0001, ftStart); ftG.gain.linearRampToValueAtTime(0.32, ftStart + 0.05);
      ftG.gain.linearRampToValueAtTime(0.20, ftStart + ftDur - 0.05);
      ftG.gain.exponentialRampToValueAtTime(0.001, ftStart + ftDur);
      ftS.connect(ftG); ftG.connect(c.destination); ftS.start(ftStart);
      // Stage 3: crowd burst at +500ms (~380Hz mid-osc + filtered noise wash)
      const crStart = n + 0.50;
      const crDur = 0.42, crB = c.createBuffer(1, Math.ceil(c.sampleRate * crDur), c.sampleRate), crD = crB.getChannelData(0);
      for (let i = 0; i < crD.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.sin((t / crDur) * Math.PI); // bell-shaped envelope
        crD[i] = ((Math.random() * 2 - 1) * 0.20
               + Math.sin(t * 380) * 0.14
               + Math.sin(t * 540) * 0.08) * env;
      }
      const crS = c.createBufferSource(); crS.buffer = crB; const crG = c.createGain();
      crG.gain.setValueAtTime(0.0001, crStart); crG.gain.linearRampToValueAtTime(0.32, crStart + 0.06);
      crG.gain.exponentialRampToValueAtTime(0.001, crStart + crDur);
      crS.connect(crG); crG.connect(c.destination); crS.start(crStart);
    } else if (type === 'stealHomeOut') {
      // Steal of home — CAUGHT (Backlog #101) — three-stage layer over ~620ms
      // capturing the breakaway sprint, footfalls, and the catcher's tag at
      // the plate. Stage 1: rising tonal cluster (320→580Hz over 280ms — the
      // runner breaking). Stage 2: pounding footfalls at +60ms (~145Hz pulses
      // for 380ms). Stage 3: sharp catcher tag at +440ms — a crisp glove-pop
      // (~700Hz tonal pop + transient) layered with a low body-thump (~140Hz)
      // representing the runner sliding into the catcher's tag.
      const sDur = 0.28, sB = c.createBuffer(1, Math.ceil(c.sampleRate * sDur), c.sampleRate), sD = sB.getChannelData(0);
      for (let i = 0; i < sD.length; i++) {
        const t = i / c.sampleRate;
        const sweep = Math.sin(t * (320 + 260 * (t / sDur))) * Math.exp(-t / 0.26) * 0.14;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t / 0.24) * 0.07;
        sD[i] = sweep + noise;
      }
      const sS1 = c.createBufferSource(); sS1.buffer = sB; const sG1 = c.createGain();
      sG1.gain.setValueAtTime(0.0001, n); sG1.gain.linearRampToValueAtTime(0.28, n + 0.04);
      sG1.gain.exponentialRampToValueAtTime(0.001, n + sDur);
      sS1.connect(sG1); sG1.connect(c.destination); sS1.start(n);
      // Stage 2: pounding footfalls
      const ftStart = n + 0.06;
      const ftDur = 0.34, ftB = c.createBuffer(1, Math.ceil(c.sampleRate * ftDur), c.sampleRate), ftD = ftB.getChannelData(0);
      for (let i = 0; i < ftD.length; i++) {
        const t = i / c.sampleRate;
        const stomp = Math.abs(Math.sin(t * 28)) > 0.78 ? 1 : 0;
        ftD[i] = (Math.sin(t * 145) * Math.exp(-t / 0.24) * 0.16
               + (Math.random() * 2 - 1) * Math.exp(-t / 0.18) * 0.09) * stomp;
      }
      const ftS = c.createBufferSource(); ftS.buffer = ftB; const ftG = c.createGain();
      ftG.gain.setValueAtTime(0.0001, ftStart); ftG.gain.linearRampToValueAtTime(0.28, ftStart + 0.05);
      ftG.gain.exponentialRampToValueAtTime(0.001, ftStart + ftDur);
      ftS.connect(ftG); ftG.connect(c.destination); ftS.start(ftStart);
      // Stage 3: sharp catcher tag — glove-pop layered with body-thump
      const tagStart = n + 0.44;
      const tagDur = 0.14, tagB = c.createBuffer(1, Math.ceil(c.sampleRate * tagDur), c.sampleRate), tagD = tagB.getChannelData(0);
      for (let i = 0; i < tagD.length; i++) {
        const t = i / c.sampleRate;
        tagD[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.014) * 0.30
               + Math.sin(t * 700) * Math.exp(-t / 0.05) * 0.26
               + Math.sin(t * 140) * Math.exp(-t / 0.08) * 0.20; // tag body-thump
      }
      const tagS = c.createBufferSource(); tagS.buffer = tagB; const tagG = c.createGain();
      tagG.gain.setValueAtTime(0.40, tagStart); tagG.gain.exponentialRampToValueAtTime(0.001, tagStart + tagDur);
      tagS.connect(tagG); tagG.connect(c.destination); tagS.start(tagStart);
    } else if (type === 'blockedPitch') {
      // Catcher's blocked pitch in the dirt (Backlog #112) — two-stage layer
      // over ~260ms. Stage 1: a soft mid-frequency thump (~155Hz body, ~120ms)
      // representing the ball hitting the dirt just in front of the plate.
      // Stage 2: a muted leather-pat smother (~240Hz body + filtered noise
      // wash) at +60ms representing the catcher's chest protector cushioning
      // the ball. Distinct from glove pop (higher pitch) and bobble (more
      // chaotic) — unmistakably a "ball thudded in the dirt and was smothered."
      const blkDur = 0.12, blkB = c.createBuffer(1, Math.ceil(c.sampleRate * blkDur), c.sampleRate), blkD = blkB.getChannelData(0);
      for (let i = 0; i < blkD.length; i++) {
        const t = i / c.sampleRate;
        blkD[i] = Math.sin(t * 155) * Math.exp(-t / 0.06) * 0.26
              + (Math.random() * 2 - 1) * Math.exp(-t / 0.04) * 0.08;
      }
      const blkS = c.createBufferSource(); blkS.buffer = blkB; const blkG = c.createGain();
      blkG.gain.setValueAtTime(0.30, n); blkG.gain.exponentialRampToValueAtTime(0.001, n + blkDur);
      blkS.connect(blkG); blkG.connect(c.destination); blkS.start(n);
      // Stage 2: muted leather smother at +60ms
      const smStart = n + 0.06;
      const smDur = 0.14, smB = c.createBuffer(1, Math.ceil(c.sampleRate * smDur), c.sampleRate), smD = smB.getChannelData(0);
      for (let i = 0; i < smD.length; i++) {
        const t = i / c.sampleRate;
        smD[i] = Math.sin(t * 240) * Math.exp(-t / 0.07) * 0.16
              + (Math.random() * 2 - 1) * Math.exp(-t / 0.05) * 0.10;
      }
      const smS = c.createBufferSource(); smS.buffer = smB; const smG = c.createGain();
      smG.gain.setValueAtTime(0.22, smStart); smG.gain.exponentialRampToValueAtTime(0.001, smStart + smDur);
      smS.connect(smG); smG.connect(c.destination); smS.start(smStart);
    } else if (type === 'organCharge') {
      // Stadium organ "CHARGE!" fanfare (Backlog #125) — the iconic 6-note
      // ballpark organ riff every baseball fan knows: 5 quick ascending notes
      // building to a sixth held "Charge!" note. Real ballpark organs hammer
      // out this phrase to fire up the crowd between innings and on rallies.
      // The classic call is on the open notes G4-G4-G4-G4-G4 + C5 with the
      // crowd shouting "CHARGE!" on the last beat — but here we'll use the
      // five-note ascending lead-in (typical organ "ta-da-da-da-DAA") into
      // the held final note. Uses sawtooth oscillators with a sharp attack
      // for a bright, organ-pipe-like timbre.
      const melody = [
        { freq: 392.00, start: 0.00, dur: 0.18 },  // G4 ("DA")
        { freq: 392.00, start: 0.20, dur: 0.18 },  // G4 ("da")
        { freq: 392.00, start: 0.40, dur: 0.18 },  // G4 ("da")
        { freq: 392.00, start: 0.60, dur: 0.18 },  // G4 ("da")
        { freq: 392.00, start: 0.80, dur: 0.18 },  // G4 ("DAA")
        { freq: 523.25, start: 1.05, dur: 0.55 },  // C5 (the held "CHARGE!" note)
      ];
      melody.forEach(({ freq, start, dur }) => {
        // Layered sawtooth + sine for an organ-pipe timbre (saw = bright
        // edge, sine = warm fundamental).
        const oSaw = c.createOscillator(), oSine = c.createOscillator(), g = c.createGain();
        oSaw.type = 'sawtooth'; oSaw.frequency.setValueAtTime(freq, n + start);
        oSine.type = 'sine'; oSine.frequency.setValueAtTime(freq, n + start);
        // Bell-shaped envelope with a sharp attack and slow release — that
        // organ-ish "pop" you hear at every ballpark.
        g.gain.setValueAtTime(0.0001, n + start);
        g.gain.linearRampToValueAtTime(0.18, n + start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, n + start + dur);
        oSaw.connect(g); oSine.connect(g); g.connect(c.destination);
        oSaw.start(n + start); oSine.start(n + start);
        oSaw.stop(n + start + dur + 0.05); oSine.stop(n + start + dur + 0.05);
      });
    } else if (type === 'browWipe') {
      // Pitcher's brow wipe (Backlog #113) — a soft brushy whoosh
      // representing the cloth-on-skin friction. Single ~280ms filtered noise
      // sweep (180→90Hz) with a small mid-osc layer. Intentionally very
      // muted (peak gain 0.12) so it reads as quiet foreground ritual without
      // dominating the pre-pitch beat.
      const bwDur = 0.28, bwB = c.createBuffer(1, Math.ceil(c.sampleRate * bwDur), c.sampleRate), bwD = bwB.getChannelData(0);
      for (let i = 0; i < bwD.length; i++) {
        const t = i / c.sampleRate;
        const env = Math.sin((t / bwDur) * Math.PI); // bell-shaped envelope
        const sweep = (180 - 90 * (t / bwDur));
        bwD[i] = ((Math.random() * 2 - 1) * 0.18
               + Math.sin(t * sweep) * 0.10) * env;
      }
      const bwS = c.createBufferSource(); bwS.buffer = bwB; const bwG = c.createGain();
      bwG.gain.setValueAtTime(0.0001, n); bwG.gain.linearRampToValueAtTime(0.12, n + 0.05);
      bwG.gain.exponentialRampToValueAtTime(0.001, n + bwDur);
      bwS.connect(bwG); bwG.connect(c.destination); bwS.start(n);
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
function SVGPitcher({ x, y, color = '#1e40af', phase = 'idle', fromStretch = false, headShake = false, headNod = false }) {
  // Throwing-arm angle: full windup tilts the arm farther back (-60°); stretch
  // (set position) uses a more compact load (~-30°). Throw angle is identical
  // either way so the release point lands in the same spot.
  const a = phase === 'windup' ? (fromStretch ? -30 : -60) : phase === 'throw' ? 40 : 0;
  // Tip of the cap pose (Backlog #100) — pitcher tips his cap toward a fielder
  // who just saved him with a defensive gem (web gem, diving stop, robbed HR,
  // outfield assist at home). The throwing arm rises to the cap brim, the cap
  // briefly lifts, then settles back. ~1.4s gesture. Pure flavor — release
  // point and mechanics unchanged. No glove/ball on the throwing arm — this is
  // a between-pitch acknowledgment, not a delivery.
  if (phase === 'tipCap') {
    return (<g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" />
      {/* Body */}
      <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
      {/* Legs — relaxed stance, slight feet apart */}
      <line x1={0} y1={8} x2={-3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={0} y1={8} x2={3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Glove arm hangs at side */}
      <line x1={0} y1={2} x2={-5} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* Throwing arm raised to the cap brim — shoulder→elbow→hand. The
          dipping motion is keyTimes 0/0.5/1 with the hand at the cap brim
          throughout, then briefly tipping the cap before settling. */}
      <line x1={0} y1={2} x2={3} y2={-3} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={3} y1={-3} x2={1} y2={-9} stroke={color} strokeWidth={2} strokeLinecap="round">
        <animate attributeName="y2" values="-9;-7;-9" keyTimes="0;0.5;1" dur="1.4s" fill="freeze" />
      </line>
      {/* Head */}
      <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
      {/* Cap — gently lifts up by ~1.4px then settles back as the tip happens */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 0.6,-1.4; 0,0" keyTimes="0;0.5;1" dur="1.4s" fill="freeze" />
        <path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} />
      </g>
    </g>);
  }
  // Fist pump pose (Backlog #129) — pitcher punches his throwing fist
  // down sharply after a clutch strikeout in a late, close game. Arm
  // starts bent at chest level with the forearm pointed UP (closed fist),
  // then animates DOWN over ~280ms via <animateTransform>. The body
  // crouches slightly forward as the pump lands and snaps back. A closed-
  // fist circle (smaller than the open-glove ball, r=1.6) is drawn at the
  // hand tip. The pose holds ~700ms total before the live component
  // re-renders back to idle.
  if (phase === 'fistPump') {
    return (
      <g key="fistPump" transform={`translate(${x},${y})`}>
        <ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" />
        {/* Body — slight forward crouch as the fist drives down. The crouch
            keyframes 0→0.4→1 push the torso slightly down/forward as the
            pump lands, then settle back. */}
        <g>
          <animateTransform attributeName="transform" type="translate"
            values="0,0; 0,1.2; 0,0.6" keyTimes="0;0.4;1" dur="0.7s" fill="freeze" />
          <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
          {/* Legs — feet planted wide, slight lean forward */}
          <line x1={0} y1={8} x2={-3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
          <line x1={0} y1={8} x2={3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
          {/* Glove arm — hangs at side, tightening down to the body */}
          <line x1={0} y1={2} x2={-5} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
          {/* Throwing arm — animates the elbow→hand from "forearm pointed up"
              (chest level, fist at y=-8) DOWN to a "punched-down" position
              (hand at y=10, near the hip). The shoulder→elbow stays steady;
              only the elbow→hand line drives the visible pump motion. The
              closed-fist circle follows the hand tip via matching
              <animate> on cx/cy. */}
          <line x1={0} y1={2} x2={3} y2={-2} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <line x1={3} y1={-2} x2={3} y2={-8} stroke={color} strokeWidth={2} strokeLinecap="round">
            <animate attributeName="x2" values="3;4;5" keyTimes="0;0.4;1" dur="0.28s" fill="freeze" />
            <animate attributeName="y2" values="-8;6;10" keyTimes="0;0.4;1" dur="0.28s" fill="freeze" />
          </line>
          {/* Closed fist circle — smaller than the open-glove ball */}
          <circle cx={3} cy={-8} r={1.6} fill={color} stroke="#000" strokeWidth={0.4}>
            <animate attributeName="cx" values="3;4;5" keyTimes="0;0.4;1" dur="0.28s" fill="freeze" />
            <animate attributeName="cy" values="-8;6;10" keyTimes="0;0.4;1" dur="0.28s" fill="freeze" />
          </circle>
          {/* Head — stays mostly level, slight tilt down as the pump lands */}
          <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
          <path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} />
        </g>
      </g>
    );
  }
  // Brow-wipe pose (Backlog #113) — between pitches in late innings, the
  // pitcher takes a beat to wipe sweat from his brow with his forearm. The
  // throwing arm bends up to the forehead, the forearm sweeps across the brow
  // over ~700ms via <animate> on the hand position, and the head tilts
  // slightly down as the arm sweeps. A small "sweat drop" ellipse appears at
  // the brow and fades to indicate the wipe-off moment. Pure cosmetic — fires
  // only in the 6th inning or later when the pitcher has thrown 50+ pitches.
  if (phase === 'wipeBrow') {
    return (
      <g key="wipeBrow" transform={`translate(${x},${y})`}>
        <ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" />
        {/* Body — slight forward lean as the pitcher takes a breather */}
        <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        {/* Legs — relaxed stance */}
        <line x1={0} y1={8} x2={-3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={0} y1={8} x2={3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Glove arm — hangs at side, holding the ball */}
        <line x1={0} y1={2} x2={-5} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <circle cx={-5.5} cy={6.5} r={2.2} fill="#7a3a12" stroke="#3a1a08" strokeWidth={0.5} />
        {/* Throwing arm — shoulder→elbow up to the brow, forearm sweeping
            across. The hand sweeps from the front of the forehead to the back
            of the head as the wipe happens. */}
        <line x1={0} y1={2} x2={3} y2={-3} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={3} y1={-3} x2={-1} y2={-8} stroke={color} strokeWidth={2} strokeLinecap="round">
          <animate attributeName="x2" values="3;-1;-5" keyTimes="0;0.5;1" dur="0.7s" fill="freeze" />
          <animate attributeName="y2" values="-7;-8;-7" keyTimes="0;0.5;1" dur="0.7s" fill="freeze" />
        </line>
        {/* Head — slightly tilted down as the arm sweeps across the brow */}
        <g>
          <animateTransform attributeName="transform" type="translate"
            values="0,0; 0,0.4; 0,0" keyTimes="0;0.5;1" dur="0.7s" fill="freeze" />
          <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
          <path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} />
        </g>
        {/* Small "sweat drop" ellipse that appears at the brow and fades —
            indicates the wipe-off moment. */}
        <ellipse cx={-3} cy={-3} rx={0.9} ry={1.3} fill="#9ddff8" opacity="0">
          <animate attributeName="opacity" values="0.7;0;0" keyTimes="0;0.45;1" dur="0.7s" fill="freeze" />
          <animate attributeName="cy" values="-3;-1;-1" keyTimes="0;0.45;1" dur="0.7s" fill="freeze" />
        </ellipse>
      </g>
    );
  }
  // Check-the-runner pose (Backlog #116) — with a runner on 1B and < 2 outs,
  // the pitcher comes set and visibly turns his head over his right shoulder
  // to check the runner before delivering. The body holds a compact stretch
  // stance (glove arm folded across the chest holding the ball), the
  // throwing arm hangs at the side, and the head + cap group rotates ~48°
  // over ~700ms (turn out → hold → snap back). Pure pre-pitch atmosphere —
  // completes the runner-on-first defensive ritual story alongside F1B holds
  // the runner (#106), runner leadoff (#70), F1B stretch (#114), and the
  // pickoff throw (#64).
  if (phase === 'checkRunner') {
    return (
      <g key="checkRunner" transform={`translate(${x},${y})`}>
        <ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" />
        {/* Body — compact set/stretch stance */}
        <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        {/* Legs — feet planted, slightly turned, ready to fire over to 1B */}
        <line x1={0} y1={8} x2={-2} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={0} y1={8} x2={3} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Glove arm folded across the chest, holding the ball (glove disk) */}
        <line x1={0} y1={2} x2={-2.5} y2={-1} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={2} x2={2.5} y2={-1} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <circle cx={0} cy={-2} r={3} fill="#7a3a12" stroke="#3a1a08" strokeWidth={0.5} />
        {/* Head + cap — rotates over the right shoulder toward 1B and snaps
            back. Pivot is around the neck (0,-2). Positive rotation in our
            SVG = clockwise = toward screen-right = toward 1B (which sits at
            F.B1.x=420 vs P.x=310). */}
        <g>
          <animateTransform attributeName="transform" type="rotate"
            values="0,0,-2; 48,0,-2; 48,0,-2; 0,0,-2" keyTimes="0;0.22;0.7;1" dur="0.7s" fill="freeze" />
          <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
          <path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} />
        </g>
      </g>
    );
  }
  // Stretch idle pose (Backlog #74): legs pull together, glove rises to chest
  // height with the ball hidden behind it. The unmistakable real-baseball "set"
  // stance every pitcher uses with men on base.
  if (fromStretch && phase === 'idle') {
    return (<g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" />
      <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
      {/* Legs pulled in tight — set position */}
      <line x1={0} y1={8} x2={-2} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={0} y1={8} x2={2} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Both arms folded forward, hands meeting at chest */}
      <line x1={0} y1={2} x2={3} y2={-1} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={0} y1={2} x2={-3} y2={-1} stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* Glove disk concealing the ball at chest height */}
      <circle cx={0} cy={-2} r={3} fill="#7a3a12" stroke="#3a1a08" strokeWidth={0.5} />
      <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
      <path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} />
    </g>);
  }
  // Pitcher head-shake / shake-off (Backlog #104) — when `headShake` is true,
  // the head + cap rotate left/right ~4 times over 600ms. Pure cosmetic — the
  // pitcher visibly waves off the catcher's first sign, and the catcher will
  // flash a fresh sign right after. Only applied to the standard pose; the
  // tipCap and fromStretch idle poses are not shake-off candidates.
  // Pitcher head-nod / sign acceptance (Backlog #131) — when `headNod` is true
  // (and headShake is not), the head + cap tilt forward and back twice over
  // 500ms (a "yes" gesture). Pure cosmetic companion to the shake-off — when
  // the pitcher ACCEPTS the catcher's sign rather than waving it off. Adds
  // pre-pitch ritual variety without competing with the shake-off animation
  // (mutually exclusive). The rotate pivot at (0,2) is the base of the neck so
  // the head tips forward (chin to chest) rather than the whole body bending.
  return (<g transform={`translate(${x},${y})`}><ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" /><line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" /><line x1={0} y1={8} x2={-3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={8} x2={3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><g transform={`rotate(${a},0,2)`}><line x1={0} y1={2} x2={8} y2={-4} stroke={color} strokeWidth={2} strokeLinecap="round" />{phase !== 'throw' && <circle cx={9} cy={-5} r={2.5} fill="#fff" stroke="#c00" strokeWidth={.5} />}</g><g key={headShake ? 'shake' : (headNod ? 'nod' : 'still')}>{headShake && (<animateTransform attributeName="transform" type="rotate" values="0,0,-2; -14,0,-2; 12,0,-2; -12,0,-2; 10,0,-2; 0,0,-2" keyTimes="0;0.18;0.4;0.6;0.8;1" dur="0.6s" fill="freeze" />)}{headNod && !headShake && (<animateTransform attributeName="transform" type="rotate" values="0,0,2; -18,0,2; 0,0,2; -18,0,2; 0,0,2" keyTimes="0;0.25;0.5;0.75;1" dur="0.5s" fill="freeze" />)}<circle cx={0} cy={-5} r={5} fill="#f5d0a0" /><path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} /></g></g>);
}
function SVGBatter({ x, y, color = '#dc2626', phase = 'stance', side = 'R', chokeUp = false }) {
  if (phase === 'gone') return null;
  const l = side === 'L', f = l ? -1 : 1, s = phase === 'swing';
  const isBatFlip = phase === 'batFlip';
  const isStepOut = phase === 'stepOut';
  const isHbp = phase === 'hbp';
  const isBrushback = phase === 'brushback';
  const isCleatKnock = phase === 'cleatKnock';
  const isTipCapFan = phase === 'tipCapFan';
  // Two-strike approach (Backlog #128) — when chokeUp is true AND the batter
  // is in a standard idle/swing-anticipation pose (not a special-pose phase
  // like hbp, brushback, batFlip, etc.), shift the bat-grip hands up by
  // ~3px on the bat barrel (the bat reads as "choked up") and crouch the
  // torso ~1px lower for a more compact, defensive stance. Pure cosmetic —
  // applied only to the default standing pose at the bottom of this
  // component.
  const applyChokeUp = chokeUp && !isBatFlip && !isStepOut && !isHbp && !isBrushback && !isCleatKnock && !isTipCapFan;
  // Cleat-knock pre-pitch routine (Backlog #109) — between pitches the batter
  // lifts his front foot up and taps the cleat with the bat barrel to knock
  // out infield dirt, then sets it back down. Pure pre-pitch flavor (~10% of
  // first pitches of an at-bat). The whole cycle runs ~700ms before the
  // standard stance is restored and the pitcher begins his windup. We pose a
  // single keyframe (foot up, bat tipped down to meet it) and let the
  // <animate> elements drive the lift / lower / lift / lower cycle so the
  // routine reads as a deliberate two-tap. The animation re-mounts via the
  // batterPhase key so each new at-bat restarts cleanly.
  if (isCleatKnock) {
    return (
      <g key={`cleat-${side}`} transform={`translate(${x},${y})`}>
        <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" />
        {/* Body — slight forward lean as the batter glances down at his foot */}
        <line x1={0} y1={0} x2={1 * f} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        {/* Back leg — stays planted on the back of the box */}
        <line x1={1 * f} y1={8} x2={-3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Front leg — animates between planted (y2=14) and lifted (y2=10) so
            the cleat hovers above the dirt while it's being tapped. Two-tap
            cycle: lift → tap → lower → lift → tap → lower. */}
        <line x1={1 * f} y1={8} x2={3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round">
          <animate attributeName="y2" values="14;10;14;10;14" keyTimes="0;0.2;0.45;0.65;1" dur="0.75s" fill="freeze" />
          <animate attributeName="x2" values={`${3 * f};${5 * f};${3 * f};${5 * f};${3 * f}`} keyTimes="0;0.2;0.45;0.65;1" dur="0.75s" fill="freeze" />
        </line>
        {/* Front arm reaches across the body to grip the bat lower for the
            tap — bat held one-handed with the barrel down toward the cleat. */}
        <line x1={0} y1={2} x2={4 * f} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Back arm hangs at the side as the batter taps */}
        <line x1={0} y1={2} x2={-3 * f} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Bat — barrel-down to tap the lifted cleat. Tilts to the front-foot
            side and reaches down to the y level of the lifted foot. Animation
            on the bottom point traces the bat tip with the cleat tap. */}
        <line x1={4 * f} y1={6} x2={5 * f} y2={12} stroke="#b8860b" strokeWidth={2.5} strokeLinecap="round">
          <animate attributeName="y2" values="12;9;12;9;12" keyTimes="0;0.2;0.45;0.65;1" dur="0.75s" fill="freeze" />
          <animate attributeName="x2" values={`${5 * f};${5 * f};${5 * f};${5 * f};${5 * f}`} keyTimes="0;0.2;0.45;0.65;1" dur="0.75s" fill="freeze" />
        </line>
        {/* Small dust puff that fires on each cleat tap — a tiny ellipse at
            the foot position that pulses opacity to read as kicked-up dirt. */}
        <ellipse cx={5 * f} cy={11} rx={2.2} ry={0.8} fill="#c9a25c" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0;0.6;0" keyTimes="0;0.22;0.4;0.67;1" dur="0.75s" fill="freeze" />
          <animate attributeName="rx" values="1.5;2.6;1.5;2.6;1.5" keyTimes="0;0.22;0.4;0.67;1" dur="0.75s" fill="freeze" />
        </ellipse>
        {/* Head — tilted slightly down to look at the cleat */}
        <circle cx={1 * f} cy={-4} r={5} fill="#f5d0a0" />
        <path d={`M${-4 * f},-5 Q${1 * f},-12 ${6 * f},-5`} fill={color} />
      </g>
    );
  }
  const stepOffset = isStepOut ? 12 * f : 0;
  // Brushback / "chin music" recoil pose (Backlog #94) — batter ducks back away
  // from a high-and-tight pitch. Distinct from HBP (where the ball actually
  // hits the body) — here the ball whistles past, the batter bails out, but
  // the bat stays in the load position and there's no impact dust. Body
  // shifts ~7px back from the plate, head leans back, eyes tracking the ball.
  if (isBrushback) {
    const bbShift = -7 * f; // shift away from the plate
    const tiltDeg = -10 * f; // lean back to dodge the pitch
    return (
      <g transform={`translate(${x + bbShift},${y}) rotate(${tiltDeg})`}>
        <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" />
        {/* Body — slightly bent back as the batter dodges */}
        <line x1={0} y1={0} x2={-1 * f} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        {/* Legs — wide stance with weight on back leg as he bails out */}
        <line x1={-1 * f} y1={8} x2={-5 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={-1 * f} y1={8} x2={3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Front arm pulled back from the bat — bat still held by back hand */}
        <line x1={0} y1={2} x2={-2 * f} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={-2 * f} y1={6} x2={-5 * f} y2={3} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Bat held lower, away from the strike zone */}
        <g transform={`rotate(${50 * f},${5 * f},0)`}>
          <line x1={5 * f} y1={0} x2={5 * f} y2={-14} stroke="#b8860b" strokeWidth={2.5} strokeLinecap="round" />
        </g>
        {/* Head, tilted back watching the ball whistle past */}
        <circle cx={1 * f} cy={-6} r={5} fill="#f5d0a0" />
        <path d={`M${-4 * f},-7 Q${1 * f},-14 ${6 * f},-7`} fill={color} />
      </g>
    );
  }
  const ba = s ? (l ? -70 : 70) : (l ? 30 : -30);
  const batDown = isStepOut ? 60 * f : ba;
  // HBP recoil pose (Idea #88) — batter is hit by a pitch and recoils away from
  // the plate. The body shifts ~6px away from the pitcher, leans back (tilts
  // ~12deg toward batter's back side), and the arms curl toward the body in a
  // protective gesture as the bat drops. Distinct from stepOut (which is a
  // pre-pitch deliberate adjustment) — this is a sudden involuntary flinch.
  if (isHbp) {
    const hbpShift = -8 * f; // shift away from the plate (toward dugout)
    const tiltDeg = -14 * f; // lean back as the body recoils
    return (
      <g transform={`translate(${x + hbpShift},${y}) rotate(${tiltDeg})`}>
        <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" />
        {/* Body (slightly bent forward from impact) */}
        <line x1={0} y1={0} x2={-2 * f} y2={9} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        {/* Legs in recoil — wider stance, knees bending */}
        <line x1={-2 * f} y1={9} x2={-6 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={-2 * f} y1={9} x2={2 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Arms curled inward (protective flinch) */}
        <line x1={0} y1={2} x2={-3 * f} y2={5} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={-3 * f} y1={5} x2={-1 * f} y2={1} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={2} x2={3 * f} y2={5} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={3 * f} y1={5} x2={1 * f} y2={1} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Bat dropped — hangs limp at side */}
        <g transform={`rotate(${75 * f},${4 * f},2)`}>
          <line x1={4 * f} y1={2} x2={4 * f} y2={-12} stroke="#b8860b" strokeWidth={2.5} strokeLinecap="round" />
        </g>
        {/* Head, slightly tilted in pain */}
        <circle cx={-1 * f} cy={-5} r={5} fill="#f5d0a0" />
        <path d={`M${-6 * f},-6 Q${-1 * f},-13 ${4 * f},-6`} fill={color} />
        {/* Pained expression — small grimace mark */}
        <line x1={-3 * f} y1={-3} x2={-1 * f} y2={-3} stroke="#000" strokeWidth={0.6} strokeLinecap="round" opacity={0.6} />
      </g>
    );
  }
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
  // Tip-cap-to-fan pose (Backlog #133) — after a fan in the stands grabs a
  // souvenir foul ball (Backlog #81), ~35% chance the batter visibly tips his
  // cap toward the fan as a friendly acknowledgment before settling back in.
  // Pose: standard stance, but the front arm (closer to the camera) rises to
  // touch the cap brim. The head tips slightly forward (a "thanks" nod). The
  // bat is set down off-screen visually — held vertically in the back hand at
  // the side. Pure cosmetic flavor — no gameplay effect.
  if (isTipCapFan) {
    return (
      <g key={`tcf-${side}`} transform={`translate(${x},${y})`}>
        <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" />
        {/* Body — upright, normal stance */}
        <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        {/* Legs — square stance */}
        <line x1={0} y1={8} x2={-3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={0} y1={8} x2={3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Front arm raised to cap brim — animates up over the first 320ms,
            holds for 700ms, lowers over the last 280ms. Total cycle 1300ms,
            matching the auto-clear timer in the parent component. */}
        <g>
          <line x1={0} y1={2} x2={-3 * f} y2={-3} stroke={color} strokeWidth={2} strokeLinecap="round">
            <animate attributeName="y2" values="2;-3;-3;2" keyTimes="0;0.25;0.78;1" dur="1.3s" fill="freeze" />
            <animate attributeName="x2" values={`${-1 * f};${-3 * f};${-3 * f};${-1 * f}`} keyTimes="0;0.25;0.78;1" dur="1.3s" fill="freeze" />
          </line>
          {/* Forearm to fingertips at cap brim — touching the front of the cap */}
          <line x1={-3 * f} y1={-3} x2={-3 * f} y2={-7} stroke={color} strokeWidth={2} strokeLinecap="round">
            <animate attributeName="y2" values="2;-7;-7;2" keyTimes="0;0.25;0.78;1" dur="1.3s" fill="freeze" />
            <animate attributeName="x2" values={`${-1 * f};${-3 * f};${-3 * f};${-1 * f}`} keyTimes="0;0.25;0.78;1" dur="1.3s" fill="freeze" />
            <animate attributeName="y1" values="2;-3;-3;2" keyTimes="0;0.25;0.78;1" dur="1.3s" fill="freeze" />
            <animate attributeName="x1" values={`${-1 * f};${-3 * f};${-3 * f};${-1 * f}`} keyTimes="0;0.25;0.78;1" dur="1.3s" fill="freeze" />
          </line>
        </g>
        {/* Back arm — drops to hold the bat at the side */}
        <line x1={0} y1={2} x2={5 * f} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Bat held vertically at side in the back hand — pointing down,
            relaxed grip as the batter pauses to tip his cap. */}
        <line x1={5 * f} y1={7} x2={5 * f} y2={14} stroke="#b8860b" strokeWidth={2.5} strokeLinecap="round" />
        {/* Head — slight forward nod synchronized with the cap-tip raise */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0,0,2; -8,0,2; -8,0,2; 0,0,2" keyTimes="0;0.25;0.78;1" dur="1.3s" fill="freeze" />
          <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
          <path d={`M${-5 * f},-6 Q0,-13 ${5 * f},-6`} fill={color} />
        </g>
      </g>
    );
  }
  // Two-strike choke-up offsets (Backlog #128) — small subtle visual shift:
  // bat grip rises ~3px on the barrel (rotation origin shifts from y=-2 to
  // y=-5 and bat-line start point shifts from y1=-2 to y1=-5 — the upper
  // hand is now 3px higher on the bat so the visible barrel above the grip
  // is shorter), and the torso crouches ~1px lower (bottom of torso line
  // shifts from y2=8 to y2=9). Hands/arms/head positions otherwise unchanged.
  const cuGripDy = applyChokeUp ? -3 : 0;        // bat grip rises on barrel
  const cuTorsoDy = applyChokeUp ? 1 : 0;         // torso bottom drops slightly
  const batGripY = -2 + cuGripDy;
  const torsoBottomY = 8 + cuTorsoDy;
  return (<g transform={`translate(${x + stepOffset},${y})`}>
    <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" />
    <line x1={0} y1={0} x2={0} y2={torsoBottomY} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
    <line x1={0} y1={torsoBottomY} x2={-3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <line x1={0} y1={torsoBottomY} x2={3 * f} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    {isStepOut && <line x1={-2 * f} y1={1} x2={-8 * f} y2={-3} stroke={color} strokeWidth={2} strokeLinecap="round" />}
    <g transform={`rotate(${batDown},${6 * f},${batGripY})`}><line x1={6 * f} y1={batGripY} x2={6 * f} y2={-18} stroke="#b8860b" strokeWidth={2.5} strokeLinecap="round" /></g>
    <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
    <path d={`M${-5 * f},-6 Q0,-13 ${5 * f},-6`} fill={color} />
  </g>);
}
function SVGCatcher({ x, y, color = '#1e40af', isMoving = false, signs = 0, lookingUp = false, blocking = false, framing = false }) {
  const b = isMoving ? Math.sin(Date.now() / 50) * 2 : 0;
  // Catcher's signs — flashing fingers between the catcher's legs during the pitcher's windup.
  // `signs` is a number (1–4) indicating how many fingers are extended (as real catchers do).
  const signCount = signs > 0 && !isMoving ? Math.min(4, Math.max(1, signs)) : 0;
  // Blocked-pitch / pitch-in-the-dirt dive pose (Backlog #112) — when `blocking`
  // is true, the catcher dives forward with both arms extended down-and-out, the
  // glove hand reaching forward to smother the ball, the throwing arm braced for
  // balance, and the body shifted ~3px forward. Three small tan dust-puff
  // ellipses fade out in front of the catcher as the dive happens, suggesting
  // kicked-up dirt as he gets in front of the bouncing ball. The pose composes
  // with the standard crouch position (the figure remains low and forward, just
  // shifted toward home plate). Pure cosmetic — no gameplay effect, fired only
  // on ~4% of bases-empty ball outcomes.
  if (blocking) {
    return (
      <g transform={`translate(${x + 3},${y + b + 1})`}>
        <ellipse cx={0} cy={9} rx={7} ry={2.2} fill="rgba(0,0,0,.12)" />
        {/* Torso — angled forward, body lunging at the ball */}
        <line x1={-2} y1={-3} x2={2} y2={5} stroke={color} strokeWidth={3} strokeLinecap="round" />
        {/* Legs — back leg planted for braking, front leg extended forward */}
        <line x1={2} y1={5} x2={-3} y2={3} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={-3} y1={3} x2={-5} y2={9} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={2} y1={5} x2={6} y2={5} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={6} y1={5} x2={8} y2={9} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Throwing arm — braced down-and-back for balance */}
        <line x1={-2} y1={-3} x2={-7} y2={2} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Glove arm — extended forward-and-down to smother the ball */}
        <line x1={2} y1={-3} x2={9} y2={3} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={11} cy={5} r={4.6} fill="#8B4513" stroke="#5a3010" strokeWidth={0.6} />
        {/* Head — slightly forward and down, eyes tracking the ball */}
        <circle cx={2} cy={-8} r={5} fill="#f5d0a0" />
        <path d={`M-3,-9 Q2,-16 7,-9`} fill={color} />
        <rect x={-1.5} y={-7} width={7} height={5} rx={1} fill="none" stroke="#555" strokeWidth={.7} opacity={.5}/>
        {/* Three small dust-puff ellipses fading out in front of the dive */}
        <ellipse cx={6} cy={11} rx={1.6} ry={0.7} fill="#c9a25c" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0" keyTimes="0;0.35;1" dur="0.7s" fill="freeze" />
          <animate attributeName="rx" values="1.2;2.4;3.2" keyTimes="0;0.35;1" dur="0.7s" fill="freeze" />
        </ellipse>
        <ellipse cx={9} cy={10} rx={1.4} ry={0.6} fill="#c9a25c" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" keyTimes="0;0.45;1" dur="0.7s" fill="freeze" begin="0.1s" />
          <animate attributeName="rx" values="1.0;2.0;2.8" keyTimes="0;0.45;1" dur="0.7s" fill="freeze" begin="0.1s" />
        </ellipse>
        <ellipse cx={12} cy={11} rx={1.3} ry={0.5} fill="#c9a25c" opacity="0">
          <animate attributeName="opacity" values="0;0.4;0" keyTimes="0;0.5;1" dur="0.65s" fill="freeze" begin="0.18s" />
          <animate attributeName="rx" values="0.9;1.8;2.4" keyTimes="0;0.5;1" dur="0.65s" fill="freeze" begin="0.18s" />
        </ellipse>
      </g>
    );
  }
  // Mask-toss / pop-up tracking pose (Backlog #98) — when `lookingUp` is true,
  // the mask is hidden (it has been flung off via the MaskToss SVG), the glove
  // arm is raised straight up to track the falling popup overhead, the
  // throwing arm rises slightly for balance, and the head tilts skyward. This
  // pose composes with the existing torso/legs so the catcher remains
  // recognizably crouched but visibly chasing a popup.
  if (lookingUp) {
    return (
      <g transform={`translate(${x},${y + b})`}>
        <ellipse cx={0} cy={8} rx={6} ry={2} fill="rgba(0,0,0,.1)" />
        {/* Torso */}
        <line x1={0} y1={-4} x2={0} y2={2} stroke={color} strokeWidth={3} strokeLinecap="round" />
        {/* Legs — same crouch as the standard pose */}
        <line x1={0} y1={2} x2={-5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={-5} y1={0} x2={-5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={0} y1={2} x2={5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={5} y1={0} x2={5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Glove arm raised straight up overhead — tracking the popup */}
        <line x1={0} y1={-4} x2={2} y2={-15} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={2.6} cy={-17} r={4.6} fill="#8B4513" stroke="#5a3010" strokeWidth={0.6} />
        {/* Throwing arm raised partway for balance */}
        <line x1={0} y1={-4} x2={-6} y2={-10} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Head — slightly higher and tilted back to read as "looking up" */}
        <circle cx={-1} cy={-10} r={5} fill="#f5d0a0" />
        {/* Cap — sits on the back of the head as he tilts up */}
        <path d={`M-6,-11 Q-1,-18 4,-11`} fill={color} />
        {/* No mask rectangle — the mask has been tossed off */}
      </g>
    );
  }
  // Pitch-framing animation (Backlog #130) — when `framing` is true, the
  // catcher's glove subtly rotates inward toward the strike zone after the
  // catch. The glove drifts from its standard catch position (9.5, -3.5)
  // slightly inward and down (toward 6, -1) over 280ms, holds, then returns
  // over 320ms — a ~700ms cycle. Pure visual companion to the framing
  // mechanic that occasionally converts a borderline ball into a called
  // strike. The glove pivots from its standard position so the inward motion
  // reads as "subtly nudging the call" without exaggerated motion that would
  // look unrealistic.
  return (<g transform={`translate(${x},${y + b})`}><ellipse cx={0} cy={8} rx={6} ry={2} fill="rgba(0,0,0,.1)" /><line x1={0} y1={-4} x2={0} y2={2} stroke={color} strokeWidth={3} strokeLinecap="round" /><line x1={0} y1={2} x2={-5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={-5} y1={0} x2={-5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={0} y1={2} x2={5} y2={0} stroke={color} strokeWidth={2.2} strokeLinecap="round" /><line x1={5} y1={0} x2={5} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" />{framing ? (
    <g key={`framing-${Date.now()}`}>
      <circle cx={9.5} cy={-3.5} r={4.5} fill="#8B4513" stroke="#5a3010" strokeWidth={.6}>
        <animate attributeName="cx" values="9.5;6.5;6.5;9.5" keyTimes="0;0.4;0.65;1" dur="0.7s" fill="freeze" />
        <animate attributeName="cy" values="-3.5;-1.5;-1.5;-3.5" keyTimes="0;0.4;0.65;1" dur="0.7s" fill="freeze" />
      </circle>
    </g>
  ) : (
    <circle cx={9.5} cy={-3.5} r={4.5} fill="#8B4513" stroke="#5a3010" strokeWidth={.6} />
  )}<circle cx={0} cy={-9} r={5} fill="#f5d0a0" /><path d={`M-5,-10 Q0,-17 5,-10`} fill={color} /><rect x={-3.5} y={-8} width={7} height={5} rx={1} fill="none" stroke="#555" strokeWidth={.7} opacity={.5}/>{signCount > 0 && (
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
// Third base coach giving signs (Idea #82) — small SVG figure positioned in the
// foul-territory coach's box just outside 3B. During the pitcher's windup, the
// coach animates a sequence of signs (touch cap → ear → chest → belt → swipe)
// to mirror real pre-pitch signaling. Companion to the catcher's sign animation
// (Backlog #57). Pure cosmetic — no gameplay effect.
//
// Sign sequence is keyed by `signKey` so each new windup remounts the SVG and
// restarts all <animate> elements cleanly. Phase 'windup' shows the animated
// arm; any other phase renders the coach standing neutral with arms at sides.
function SVGThirdBaseCoach({ x, y, color = '#1a1a1a', phase = 'idle', signKey = 0 }) {
  const isWindup = phase === 'windup';
  return (
    <g key={`coach3b-${signKey}-${phase}`} transform={`translate(${x},${y})`}>
      {/* Coach's box outline — tan-gray dirt rectangle the coach stands in */}
      <rect x={-9} y={6} width={18} height={11} rx={1} fill="#c9a25c" opacity={0.45} stroke="#8a7038" strokeWidth={0.4} />
      <ellipse cx={0} cy={14} rx={5} ry={1.6} fill="rgba(0,0,0,.18)" />
      {/* Body / torso */}
      <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      {/* Legs — slight stance, not walking */}
      <line x1={0} y1={8} x2={-2.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={0} y1={8} x2={2.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Left arm — usually hangs at side; during signs, gestures down to thigh ("steal" indicator) */}
      <line x1={0} y1={2} x2={-5} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round">
        {isWindup && (
          <>
            <animate attributeName="x2" values="-5;-5;-3;-5" keyTimes="0;0.55;0.7;1" dur="0.9s" fill="freeze" />
            <animate attributeName="y2" values="6;6;9;6" keyTimes="0;0.55;0.7;1" dur="0.9s" fill="freeze" />
          </>
        )}
      </line>
      {/* Right arm — animates through sign positions during windup. Each
          keyTime touches a different signal location: cap, ear, chest, belt. */}
      {isWindup ? (
        <>
          <line x1={0} y1={2} x2={3} y2={-4} stroke={color} strokeWidth={2.2} strokeLinecap="round">
            <animate attributeName="x2" values="6;1;3;0;5" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
            <animate attributeName="y2" values="6;-7;-2;3;5" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
          </line>
          {/* Hand circle — follows the right-arm tip so you can see the touch points */}
          <circle r={1.3} fill="#f5d0a0" stroke={color} strokeWidth={0.4}>
            <animate attributeName="cx" values="6;1;3;0;5" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
            <animate attributeName="cy" values="6;-7;-2;3;5" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
          </circle>
        </>
      ) : (
        <line x1={0} y1={2} x2={5} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      )}
      {/* Head */}
      <circle cx={0} cy={-5} r={4} fill="#f5d0a0" />
      {/* Cap */}
      <path d={`M-4.5,-6 Q0,-12 4.5,-6`} fill={color} />
      {/* Cap brim */}
      <path d={`M-4.7,-5 L4.7,-5 L3.5,-3.7 L-3.5,-3.7 Z`} fill={color} opacity={0.88} />
    </g>
  );
}
// First base coach (Backlog #92) — visual companion to SVGThirdBaseCoach. A small
// SVG figure stationed in the foul-territory coach's box just outside 1B. During
// the pitcher's windup, the coach claps and gestures encouragement (right arm
// raised + clapping motion) — pure pre-pitch atmosphere. Wears the BATTING team's
// colors (`offColor`) so he reads as the offensive coach, matching the 3B coach.
//
// Companion gives the diamond a coherent pre-pitch "story" — catcher signs to
// the pitcher, 3B coach signs to the batter, 1B coach claps for the runners.
// Pure cosmetic — no gameplay effect. `signKey` re-mounts the SVG so the
// clapping motion restarts cleanly with each new windup.
function SVGFirstBaseCoach({ x, y, color = '#1a1a1a', phase = 'idle', signKey = 0 }) {
  const isWindup = phase === 'windup';
  return (
    <g key={`coach1b-${signKey}-${phase}`} transform={`translate(${x},${y})`}>
      {/* Coach's box outline — tan-gray dirt rectangle the coach stands in */}
      <rect x={-9} y={6} width={18} height={11} rx={1} fill="#c9a25c" opacity={0.45} stroke="#8a7038" strokeWidth={0.4} />
      <ellipse cx={0} cy={14} rx={5} ry={1.6} fill="rgba(0,0,0,.18)" />
      {/* Body / torso */}
      <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      {/* Legs — slight stance, not walking */}
      <line x1={0} y1={8} x2={-2.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={0} y1={8} x2={2.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Arms — clapping motion during windup. Both arms swing in/out at chest
          height to read as a "let's go!" clap. Outside windup, arms hang at sides. */}
      {isWindup ? (
        <>
          {/* Left arm — clapping toward center */}
          <line x1={0} y1={2} x2={-5} y2={1} stroke={color} strokeWidth={2.2} strokeLinecap="round">
            <animate attributeName="x2" values="-5;-1.5;-4;-1.5;-5" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
            <animate attributeName="y2" values="1;0;1;0;1" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
          </line>
          {/* Right arm — clapping toward center */}
          <line x1={0} y1={2} x2={5} y2={1} stroke={color} strokeWidth={2.2} strokeLinecap="round">
            <animate attributeName="x2" values="5;1.5;4;1.5;5" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
            <animate attributeName="y2" values="1;0;1;0;1" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
          </line>
          {/* Two small "clap" indicator dots that briefly appear at the meeting point */}
          <circle r={1.0} fill="#ffffff" stroke={color} strokeWidth={0.4} opacity={0}>
            <animate attributeName="cx" values="-1;0;-1;0;-1" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
            <animate attributeName="cy" values="0;0;0;0;0" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
            <animate attributeName="opacity" values="0;0.85;0;0.85;0" keyTimes="0;0.25;0.5;0.75;1" dur="0.9s" fill="freeze" />
          </circle>
        </>
      ) : (
        <>
          <line x1={0} y1={2} x2={-5} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <line x1={0} y1={2} x2={5} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {/* Head */}
      <circle cx={0} cy={-5} r={4} fill="#f5d0a0" />
      {/* Cap */}
      <path d={`M-4.5,-6 Q0,-12 4.5,-6`} fill={color} />
      {/* Cap brim */}
      <path d={`M-4.7,-5 L4.7,-5 L3.5,-3.7 L-3.5,-3.7 Z`} fill={color} opacity={0.88} />
    </g>
  );
}
// Rosin bag pickup animation (Backlog #84) — atmospheric pre-pitch flavor that
// every real pitcher does between pitches. The bag itself is a small canvas-tan
// pouch sitting in the dirt just behind the rubber. When `rosinAct` is active,
// the pitcher silhouette walks back, bends down to pick up the bag, claps it
// against his throwing hand (with three expanding chalk-puff circles fading
// out), then walks back to the rubber. Total cycle: 1.6s. Pure cosmetic — no
// pitch is thrown during the animation, no card is drawn, no count change.
//
// `rosinKey` forces the SVG to remount on each trigger so all <animate> elements
// restart cleanly. The moving pitcher silhouette is rendered HERE (instead of
// by the static SVGPitcher) so this component owns its full motion via SVG
// transforms — when this is active, the static pitcher is suppressed.
function RosinBagAct({ x, y, color = '#1e40af', rosinKey = 0 }) {
  // The bag sits ~14px behind the rubber (toward 2B). The pitcher walks back
  // from rubber (y=0) to bag (y=12) over the first 22% of the cycle, picks up
  // and claps with chalk puff at 22–55%, walks forward at 55–85%, settles at
  // 85–100% before the pitch begins.
  return (
    <g key={`rosin-${rosinKey}`} transform={`translate(${x},${y})`}>
      {/* Rosin bag — small canvas-tan pouch with tied-off top, sits behind rubber */}
      <g transform="translate(0, 14)">
        <ellipse cx={0} cy={1.4} rx={3.2} ry={1.1} fill="rgba(0,0,0,.18)" />
        <rect x={-2.6} y={-1.6} width={5.2} height={3.2} rx={1.4} fill="#e8d8a4" stroke="#7a6438" strokeWidth={0.4} />
        {/* Tied-off top — small dark cinch band */}
        <line x1={-1.0} y1={-1.6} x2={1.0} y2={-1.6} stroke="#7a6438" strokeWidth={0.6} strokeLinecap="round" />
        {/* Light sheen on the bag */}
        <ellipse cx={-0.6} cy={-0.6} rx={1.4} ry={0.5} fill="#f7ecc8" opacity={0.7} />
      </g>
      {/* Pitcher silhouette — animates a walk-back-bend-clap-walk-forward cycle */}
      <g>
        {/* Top-level translate: pitcher slides between rubber (0,0) and bag (0,12) */}
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 0,4; 0,12; 0,12; 0,12; 0,4; 0,0; 0,0"
          keyTimes="0; 0.12; 0.22; 0.40; 0.55; 0.70; 0.85; 1"
          dur="1.6s" fill="freeze" />
        {/* Body parts — drawn around local origin (0,0). Shadow at +14, head at -5. */}
        <ellipse cx={0} cy={14} rx={6} ry={2.5} fill="rgba(0,0,0,.12)" />
        <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        <line x1={0} y1={8} x2={-3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={0} y1={8} x2={3.5} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Throwing arm — hangs at side, animates a clap motion at 0.40–0.55 */}
        <line x1={0} y1={2} x2={6} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round">
          <animate attributeName="x2" values="6;6;9;3;9;6;6" keyTimes="0;0.32;0.40;0.48;0.55;0.65;1" dur="1.6s" fill="freeze" />
          <animate attributeName="y2" values="6;6;3;-1;3;6;6" keyTimes="0;0.32;0.40;0.48;0.55;0.65;1" dur="1.6s" fill="freeze" />
        </line>
        {/* Glove arm — hangs at side */}
        <line x1={0} y1={2} x2={-5} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Head */}
        <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
        {/* Cap */}
        <path d={`M-5.5,-6 Q0,-13 5.5,-6`} fill={color} />
      </g>
      {/* Chalk puff — three expanding circles that bloom at the clap moment */}
      {[0, 1, 2].map(i => (
        <circle key={`puff-${i}`} cx={3 + (i - 1) * 1.4} cy={2 + (i - 1) * 0.4} r={0.8} fill="#f5e9c8" opacity={0}>
          <animate attributeName="r" values="0.8; 0.8; 3.5; 5.2" keyTimes="0; 0.46; 0.58; 0.72" dur="1.6s" fill="freeze" />
          <animate attributeName="opacity" values="0; 0; 0.85; 0" keyTimes="0; 0.46; 0.55; 0.72" dur="1.6s" fill="freeze" />
          <animate attributeName="cy" values={`${2 + (i - 1) * 0.4}; ${2 + (i - 1) * 0.4}; ${0 + (i - 1) * 0.4}; ${-4 + (i - 1) * 0.4}`} keyTimes="0; 0.46; 0.58; 0.72" dur="1.6s" fill="freeze" />
        </circle>
      ))}
    </g>
  );
}
function SVGUmpire({ x, y, phase = 'idle' }) {
  // Classic umpire "punch out" call on strikeouts — right arm pumps up.
  // Ejection (Backlog #95) — "you're outta here!" thumb-jab gesture: the
  // right arm thrusts straight out to the side with a closed fist + thumb
  // extended upward. Distinct from punchOut (which pumps up overhead).
  // Plate sweep (Backlog #102) — bent-over silhouette with whisk broom
  // sweeping back-and-forth across home plate. Triggered between half-
  // innings ~50% of the time. The body group tilts forward and the
  // broom-arm sweeps left/right with tiny dust puffs.
  const isPunchOut = phase === 'punchOut';
  const isEject = phase === 'eject';
  const isPlateSweep = phase === 'plateSweep';
  // Infield fly rule (Backlog #140) — the umpire raises one arm straight up
  // overhead with the index finger extended toward the sky, the universal
  // "infield fly — batter is out" signal. Distinct from punchOut (a closed
  // fist pumped up on strikeouts) by the straight-up arm and pointed finger.
  const isInfieldFly = phase === 'infieldFly';
  if (isInfieldFly) {
    return (<g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.1)"/>
      <line x1={0} y1={0} x2={0} y2={8} stroke="#222" strokeWidth={3} strokeLinecap="round"/>
      <line x1={0} y1={8} x2={-3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
      <line x1={0} y1={8} x2={3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
      {/* Left arm hangs at the side */}
      <line x1={0} y1={2} x2={-6} y2={8} stroke="#222" strokeWidth={2} strokeLinecap="round"/>
      {/* Right arm raised dead-straight overhead — animates up from chest */}
      <line x1={0} y1={2} x2={2} y2={-9} stroke="#222" strokeWidth={2.2} strokeLinecap="round">
        <animate attributeName="x2" values="6;2;2" dur="0.4s" fill="freeze" />
        <animate attributeName="y2" values="2;-9;-9" dur="0.4s" fill="freeze" />
      </line>
      {/* Hand at the top of the raised arm */}
      <circle cx={2} cy={-9} r={1.8} fill="#f5d0a0" stroke="#222" strokeWidth={0.4}>
        <animate attributeName="cy" values="2;-9;-9" dur="0.4s" fill="freeze" />
      </circle>
      {/* Extended index finger pointing to the sky — the classic IFR signal */}
      <line x1={2} y1={-10} x2={2} y2={-14} stroke="#f5d0a0" strokeWidth={1.1} strokeLinecap="round">
        <animate attributeName="y1" values="1;-10;-10" dur="0.4s" fill="freeze" />
        <animate attributeName="y2" values="-3;-14;-14" dur="0.4s" fill="freeze" />
      </line>
      <circle cx={0} cy={-5} r={5} fill="#f5d0a0"/>
      <path d={`M-6,-6 Q0,-14 6,-6`} fill="#222"/>
    </g>);
  }
  if (isPlateSweep) {
    return (<g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.1)"/>
      {/* Whole body group rotated forward at the waist toward the plate */}
      <g transform="rotate(-22, 0, 6)">
        {/* Torso */}
        <line x1={0} y1={0} x2={0} y2={8} stroke="#222" strokeWidth={3} strokeLinecap="round"/>
        {/* Legs — straight, bracing position */}
        <line x1={0} y1={8} x2={-3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
        <line x1={0} y1={8} x2={3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
        {/* Left arm — bracing forward */}
        <line x1={0} y1={2} x2={-4} y2={9} stroke="#222" strokeWidth={2} strokeLinecap="round"/>
        {/* Right arm sweeping the broom back and forth across the plate */}
        <line x1={0} y1={2} x2={6} y2={11} stroke="#222" strokeWidth={2.2} strokeLinecap="round">
          <animate attributeName="x2" values="-4;8;-4;8;-4" dur="2.2s" repeatCount="indefinite" />
        </line>
        {/* Whisk-broom handle (tan) — anchored at hand end */}
        <line x1={6} y1={11} x2={9} y2={14} stroke="#7a4a18" strokeWidth={1.8} strokeLinecap="round">
          <animate attributeName="x1" values="-4;8;-4;8;-4" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="x2" values="-2;11;-2;11;-2" dur="2.2s" repeatCount="indefinite" />
        </line>
        {/* Bristle fan — three dark bristles fanned from the broom tip */}
        {[-1.5, 0, 1.5].map((dx, i) => (
          <line key={`br-${i}`} x1={9} y1={14} x2={9 + dx} y2={17} stroke="#3a2a14" strokeWidth={1} strokeLinecap="round">
            <animate attributeName="x1" values="-2;11;-2;11;-2" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="x2" values={`${-2 + dx};${11 + dx};${-2 + dx};${11 + dx};${-2 + dx}`} dur="2.2s" repeatCount="indefinite" />
          </line>
        ))}
        {/* Tiny dust puffs that fade in/out under the broom on each pass */}
        {[0, 1, 2].map(i => (
          <circle key={`dust-${i}`} cx={2 + i * 3} cy={16} r={1.2} fill="#d4a574" opacity={0.6}>
            <animate attributeName="cy" values="16;14;16;14;16" dur="2.2s" repeatCount="indefinite" begin={`${i * 0.18}s`} />
            <animate attributeName="opacity" values="0.55;0.1;0.55;0.1;0.55" dur="2.2s" repeatCount="indefinite" begin={`${i * 0.18}s`} />
          </circle>
        ))}
        {/* Head — angled down looking at the plate */}
        <circle cx={1} cy={-3} r={5} fill="#f5d0a0"/>
        <path d={`M-5,-4 Q1,-12 7,-4`} fill="#222"/>
      </g>
    </g>);
  }
  if (isEject) {
    return (<g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.1)"/>
      <line x1={0} y1={0} x2={0} y2={8} stroke="#222" strokeWidth={3} strokeLinecap="round"/>
      <line x1={0} y1={8} x2={-3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
      <line x1={0} y1={8} x2={3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
      {/* Left arm — pulls back to balance the ejection thrust */}
      <line x1={0} y1={2} x2={-5} y2={6} stroke="#222" strokeWidth={2} strokeLinecap="round"/>
      {/* Right arm — thrusts out and angles up: classic "YOU'RE GONE!" gesture */}
      <line x1={0} y1={2} x2={11} y2={-3} stroke="#222" strokeWidth={2.4} strokeLinecap="round">
        <animate attributeName="x2" values="3;11;11" dur="0.45s" fill="freeze" />
        <animate attributeName="y2" values="3;-3;-3" dur="0.45s" fill="freeze" />
      </line>
      {/* Closed fist + extended thumb at the end of the right arm */}
      <circle cx={11} cy={-3} r={2.2} fill="#f5d0a0" stroke="#222" strokeWidth={0.5}>
        <animate attributeName="cx" values="3;11;11" dur="0.45s" fill="freeze" />
        <animate attributeName="cy" values="3;-3;-3" dur="0.45s" fill="freeze" />
      </circle>
      <line x1={11} y1={-3} x2={13} y2={-7} stroke="#f5d0a0" strokeWidth={1.2} strokeLinecap="round">
        <animate attributeName="x1" values="3;11;11" dur="0.45s" fill="freeze" />
        <animate attributeName="y1" values="3;-3;-3" dur="0.45s" fill="freeze" />
        <animate attributeName="x2" values="5;13;13" dur="0.45s" fill="freeze" />
        <animate attributeName="y2" values="-1;-7;-7" dur="0.45s" fill="freeze" />
      </line>
      <circle cx={0} cy={-5} r={5} fill="#f5d0a0"/>
      <path d={`M-6,-6 Q0,-14 6,-6`} fill="#222"/>
    </g>);
  }
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
// SV1BUmpire (Backlog #118) — first base umpire stationed in foul
// territory just past 1B. Renders three phases:
//   - 'idle'    → standing relaxed, both arms at sides (default)
//   - 'outCall' → classic OUT signal: right arm raised straight up with
//                 closed fist (the universal MLB "you're out" gesture).
//                 The arm pumps up over 350ms via animated x2/y2 on the
//                 forearm + hand circle, holds for the badge duration.
//   - 'safeCall'→ SAFE signal: both arms spread wide horizontally at
//                 shoulder height, palms down (the universal MLB "safe"
//                 gesture). Both arms animate outward over 350ms.
// Pure cosmetic — adds authentic broadcast flavor on every play at first.
// Distinct from the home-plate SVGUmpire which handles K punch-outs,
// ejections, and plate sweeps.
function SV1BUmpire({ x, y, phase = 'idle' }) {
  const isOut = phase === 'outCall';
  const isSafe = phase === 'safeCall';
  return (<g transform={`translate(${x},${y})`}>
    {/* Shadow at feet */}
    <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.1)"/>
    {/* Torso */}
    <line x1={0} y1={0} x2={0} y2={8} stroke="#222" strokeWidth={3} strokeLinecap="round"/>
    {/* Legs — slight stance, both planted */}
    <line x1={0} y1={8} x2={-3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
    <line x1={0} y1={8} x2={3} y2={14} stroke="#222" strokeWidth={2.2} strokeLinecap="round"/>
    {isOut ? (
      <g>
        {/* Left arm hangs at side, slightly back to balance the raised arm */}
        <line x1={0} y1={2} x2={-5} y2={7} stroke="#222" strokeWidth={2} strokeLinecap="round"/>
        {/* Right arm — punches STRAIGHT UP, closed fist at the apex.
            Animated to rise quickly from chest-level to fully overhead. */}
        <line x1={0} y1={2} x2={2} y2={-10} stroke="#222" strokeWidth={2.4} strokeLinecap="round">
          <animate attributeName="x2" values="5;2;2" dur="0.35s" fill="freeze" />
          <animate attributeName="y2" values="3;-12;-10" dur="0.35s" fill="freeze" />
        </line>
        {/* Closed fist at the end of the raised arm */}
        <circle cx={2} cy={-11} r={2.2} fill="#f5d0a0" stroke="#222" strokeWidth={0.5}>
          <animate attributeName="cx" values="6;2;2" dur="0.35s" fill="freeze" />
          <animate attributeName="cy" values="3;-13;-11" dur="0.35s" fill="freeze" />
        </circle>
      </g>
    ) : isSafe ? (
      <g>
        {/* Both arms spread wide horizontally — classic SAFE signal.
            Each arm animates outward from chest-fold to fully extended. */}
        <line x1={0} y1={2} x2={-9} y2={2} stroke="#222" strokeWidth={2.4} strokeLinecap="round">
          <animate attributeName="x2" values="-3;-10;-9" dur="0.35s" fill="freeze" />
          <animate attributeName="y2" values="4;1;2" dur="0.35s" fill="freeze" />
        </line>
        <line x1={0} y1={2} x2={9} y2={2} stroke="#222" strokeWidth={2.4} strokeLinecap="round">
          <animate attributeName="x2" values="3;10;9" dur="0.35s" fill="freeze" />
          <animate attributeName="y2" values="4;1;2" dur="0.35s" fill="freeze" />
        </line>
        {/* Open hands (flat palms) at the end of each extended arm */}
        <circle cx={-9} cy={2} r={1.8} fill="#f5d0a0" stroke="#222" strokeWidth={0.4}>
          <animate attributeName="cx" values="-3;-10;-9" dur="0.35s" fill="freeze" />
        </circle>
        <circle cx={9} cy={2} r={1.8} fill="#f5d0a0" stroke="#222" strokeWidth={0.4}>
          <animate attributeName="cx" values="3;10;9" dur="0.35s" fill="freeze" />
        </circle>
      </g>
    ) : (
      <g>
        {/* Idle pose — both arms hang relaxed at sides */}
        <line x1={0} y1={2} x2={-5} y2={8} stroke="#222" strokeWidth={2} strokeLinecap="round"/>
        <line x1={0} y1={2} x2={5} y2={8} stroke="#222" strokeWidth={2} strokeLinecap="round"/>
      </g>
    )}
    {/* Head */}
    <circle cx={0} cy={-5} r={5} fill="#f5d0a0"/>
    {/* Umpire cap — classic dark brim */}
    <path d={`M-6,-6 Q0,-14 6,-6`} fill="#222"/>
  </g>);
}
function SVGManager({ x, y, progress = 0, phase = 'walk' }) {
  // Manager ejection (Backlog #95) — when phase==='argue', the manager is
  // standing at home plate gesturing heatedly with both arms thrown up in
  // protest. When phase==='walk', the standard walking animation plays. The
  // arms wave alternately to read as continuous arguing rather than a frozen
  // pose.
  const walkCycle = Math.sin(progress * Math.PI * 8) * 2;
  const isArgue = phase === 'argue';
  if (isArgue) {
    // Animated arm-flap: arms swing between fully overhead and chest-high to
    // read as heated arguing. Two arms alternate so the motion looks natural.
    return (
      <g transform={`translate(${x},${y})`}>
        <ellipse cx={0} cy={14} rx={5} ry={2} fill="rgba(0,0,0,.12)" />
        <line x1={0} y1={0} x2={0} y2={8} stroke="#1a1a1a" strokeWidth={2.8} strokeLinecap="round" />
        <line x1={0} y1={8} x2={-3} y2={14} stroke="#1a1a1a" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={0} y1={8} x2={3} y2={14} stroke="#1a1a1a" strokeWidth={2.2} strokeLinecap="round" />
        {/* Left arm — up-flap (overhead → out → overhead) */}
        <line x1={0} y1={2} x2={-5} y2={-8} stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round">
          <animate attributeName="x2" values="-5;-9;-5;-9;-5" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="y2" values="-8;-2;-8;-2;-8" dur="0.9s" repeatCount="indefinite" />
        </line>
        {/* Right arm — opposite phase (out → overhead → out) for an alternating wave */}
        <line x1={0} y1={2} x2={9} y2={-2} stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round">
          <animate attributeName="x2" values="9;5;9;5;9" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="y2" values="-2;-8;-2;-8;-2" dur="0.9s" repeatCount="indefinite" />
        </line>
        <circle cx={0} cy={-5} r={5} fill="#f5d0a0" />
        <path d="M-5.5,-6 Q0,-13 5.5,-6" fill="#1a1a1a" />
        {/* Small "shout" text bubble above the manager's head */}
        <text x={0} y={-13} textAnchor="middle" fontSize={5} fontWeight="bold" fill="#dc2626" opacity={0.85}>
          !!
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.5s" repeatCount="indefinite" />
        </text>
      </g>
    );
  }
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

// On-deck batter (Backlog #110) — the next-up hitter taking slow practice
// swings in the on-deck circle. Pure cosmetic atmospheric layer that
// completes the pre-pitch story alongside the 3B/1B coaches and catcher
// signs. Renders a kneeling figure in the batting team's colors with a bat
// that swings through a continuous ~2.5s loop using SMIL animateTransform.
// `facing` controls which way the batter faces: 'R' (toward 1B / home plate
// on the right) or 'L' (toward 3B / home plate on the left). The arm + bat
// group rotates around the chest-height pivot so the swing arc reads as
// "load → contact → follow-through → load".
function SVGOnDeckBatter({ x, y, color = '#dc2626', facing = 'R' }) {
  const f = facing === 'L' ? -1 : 1;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* On-deck circle — circular dirt patch on the grass, slightly oval to
          read with perspective. Two layered ellipses give it depth. */}
      <ellipse cx={0} cy={11} rx={13} ry={4} fill="#a87f4a" opacity={0.55} />
      <ellipse cx={0} cy={11} rx={11.5} ry={3.2} fill="#8b6432" opacity={0.45} />
      {/* Shadow under the kneeling figure */}
      <ellipse cx={0} cy={10} rx={5.5} ry={1.8} fill="rgba(0,0,0,.28)" />
      {/* Back (kneeling) leg — knee on the ground, foot tucked under */}
      <line x1={0} y1={2} x2={-3 * f} y2={9} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Front (planted) leg — bent knee in front of the body */}
      <line x1={0} y1={2} x2={5 * f} y2={9} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={5 * f} y1={9} x2={7 * f} y2={11} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Torso — slight forward lean */}
      <line x1={0} y1={-3} x2={0.5 * f} y2={2} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
      {/* Arms + bat: the entire arm-and-bat group rotates around (0,-1) — the
          shoulder/chest pivot. Keyframes: load behind shoulder (-75°), pause,
          quick swing through contact (0° → +50°), brief follow-through, then
          back to load. ~2.5s repeat. */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`${-75 * f},0,-1; ${-70 * f},0,-1; ${-60 * f},0,-1; ${10 * f},0,-1; ${55 * f},0,-1; ${30 * f},0,-1; ${-50 * f},0,-1; ${-75 * f},0,-1`}
          keyTimes="0;0.25;0.36;0.46;0.55;0.66;0.85;1"
          dur="2.5s"
          repeatCount="indefinite"
        />
        {/* Forearm extending from the shoulder pivot out to the hands */}
        <line x1={0} y1={-1} x2={6 * f} y2={1} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
        {/* Bat — extends from the hands outward, slight upward angle when
            loaded over the shoulder. Knob at the hand-end, barrel tapering. */}
        <line x1={6 * f} y1={1} x2={18 * f} y2={-6} stroke="#5a3010" strokeWidth={1.8} strokeLinecap="round" />
        {/* Bat knob — small dot at the hand-end */}
        <circle cx={6 * f} cy={1} r={1.1} fill="#3a1a08" />
      </g>
      {/* Head */}
      <circle cx={0} cy={-7} r={4} fill="#f5d0a0" />
      {/* Batting helmet — symmetric dome covering the crown of the head in
          the team's color. */}
      <path d={`M-4.5,-7 Q0,-13 4.5,-7 Z`} fill={color} />
      {/* Ear flap — sticks out on the side facing the pitcher (i.e. on the
          `facing` side). 2px square just below the helmet line. */}
      <rect x={2 * f - 0.8} y={-7.5} width={1.8} height={2.6} rx={0.4} fill={color} />
    </g>
  );
}

// Bat boy / girl retrieving the bat (Backlog #121) — atmospheric figure
// that emerges from the batting team's dugout after ~30% of strikeouts,
// jogs to home plate, bends down to pick up the bat the batter left
// behind, then jogs back. Pure cosmetic — no gameplay effect. Suppressed
// during dropped 3rd strikes (the play is still live and the batter is
// sprinting to 1B with the bat) and during manager ejections (the
// manager is at home plate arguing — focus stays there).
//
// `phase`: 'walkOut' (toward home plate), 'pickup' (bending at plate),
// 'walkBack' (returning to dugout). During walkBack, the bat boy is
// holding the bat at a downward angle.
// `progress`: 0..1 raw progress through the current phase (used to
// drive the walk-cycle leg animation).
// `color`: the batting team's color (worn on cap + small uniform stripe).
function SVGBatBoy({ x, y, color = '#dc2626', phase = 'walkOut', progress = 0 }) {
  // Walk cycle — same staggered-leg animation as SVGManager but a touch
  // quicker so the figure reads as a young hustle rather than a slow
  // manager stroll.
  const walkCycle = Math.sin(progress * Math.PI * 10) * 1.6;
  const isPickup = phase === 'pickup';
  const isWalkBack = phase === 'walkBack';
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Drop shadow — slightly larger during pickup (figure is lower) */}
      <ellipse cx={0} cy={11} rx={4} ry={1.6} fill="rgba(0,0,0,.18)" />
      {isPickup ? (
        // PICKUP POSE — bent over at the waist, hands reaching for the bat
        // near the ground. Body line tilts forward, head drops down, both
        // arms extend toward the ground with a hand at the bat.
        <g>
          {/* Body — bent forward from the waist */}
          <line x1={0} y1={2} x2={3} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
          {/* Back legs — planted, slightly bent */}
          <line x1={3} y1={7} x2={1} y2={11} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
          <line x1={3} y1={7} x2={5} y2={11} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
          {/* Arms reaching down toward the bat */}
          <line x1={2} y1={3} x2={6} y2={8} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
          <line x1={2} y1={3} x2={7} y2={9} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
          {/* The bat — small horizontal stick at the pickup point */}
          <line x1={5} y1={10} x2={11} y2={10} stroke="#5a3010" strokeWidth={1.5} strokeLinecap="round" />
          <circle cx={5} cy={10} r={0.9} fill="#3a1a08" />
          {/* Head — dipped down with cap visible from above */}
          <circle cx={3} cy={1} r={3.5} fill="#f5d0a0" />
          <path d="M-0.5,0.5 Q3,-4 6.5,0.5 Z" fill={color} />
          {/* Cap brim */}
          <ellipse cx={5.5} cy={-1.5} rx={1.6} ry={0.6} fill={color} />
        </g>
      ) : (
        // WALKING POSE — upright, jogging with alternating legs. During
        // walkBack the bat is held diagonally in the right hand.
        <g>
          {/* Body */}
          <line x1={0} y1={-1} x2={0} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
          {/* Legs — alternating walk cycle (sin-based) */}
          <line x1={0} y1={7} x2={-2 + walkCycle} y2={11} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
          <line x1={0} y1={7} x2={2 - walkCycle} y2={11} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
          {/* Arms — opposite phase from legs (left arm forward when right
              leg forward). On walkBack one arm is locked carrying the bat. */}
          {isWalkBack ? (
            <>
              {/* Left arm — natural walking swing (opposite phase from legs) */}
              <line x1={0} y1={1} x2={-2 - walkCycle * 0.6} y2={4} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
              {/* Right arm — locked down at side carrying the bat */}
              <line x1={0} y1={1} x2={3} y2={5} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
              {/* Bat — held diagonally pointing down-and-back */}
              <line x1={3} y1={5} x2={7} y2={11} stroke="#5a3010" strokeWidth={1.5} strokeLinecap="round" />
              <circle cx={3} cy={5} r={0.9} fill="#3a1a08" />
            </>
          ) : (
            <>
              {/* Both arms swinging in natural opposite-phase to legs */}
              <line x1={0} y1={1} x2={-2 - walkCycle * 0.6} y2={4} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
              <line x1={0} y1={1} x2={2 + walkCycle * 0.6} y2={4} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
            </>
          )}
          {/* Head */}
          <circle cx={0} cy={-4} r={3.6} fill="#f5d0a0" />
          {/* Cap dome */}
          <path d="M-4,-4.5 Q0,-9 4,-4.5 Z" fill={color} />
          {/* Cap brim — facing forward in walk direction */}
          <ellipse cx={0} cy={-6.5} rx={3.2} ry={0.7} fill={color} />
        </g>
      )}
    </g>
  );
}

// SVGCurtainCall (Backlog #141) — after a truly big home run (grand slam,
// multi-homer game, or a go-ahead blast in the 7th inning or later), the home
// crowd calls the hero back out of the dugout for a curtain call. A small
// figure stands at the top step in front of the home dugout, raises his
// batting helmet overhead, and waves it side-to-side to acknowledge the
// roaring crowd before ducking back inside. Pure cosmetic — fires after the
// trot completes. The figure wears the batting team's color.
function SVGCurtainCall({ x, y, color = '#b91c1c' }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Drop shadow */}
      <ellipse cx={0} cy={12} rx={4.5} ry={1.7} fill="rgba(0,0,0,.18)" />
      {/* Subtle body bob as he waves */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-0.8;0,0" dur="0.6s" repeatCount="indefinite" />
        {/* Torso */}
        <line x1={0} y1={-1} x2={0} y2={7} stroke={color} strokeWidth={2.3} strokeLinecap="round" />
        {/* Legs — planted, standing tall */}
        <line x1={0} y1={7} x2={-2.5} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={7} x2={2.5} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Left arm — raised and held up acknowledging the crowd */}
        <line x1={0} y1={0} x2={-5} y2={-5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx={-5} cy={-5} r={1} fill="#f5d0a0" />
        {/* Head — bare (helmet is off, being waved) */}
        <circle cx={0} cy={-5} r={3.4} fill="#f5d0a0" />
        {/* Hair sweep */}
        <path d="M-3.3,-5.6 Q0,-9.2 3.3,-5.6 Z" fill="#3a2a18" />
        {/* Right arm + helmet — raised overhead, waving side-to-side. The
            whole group rotates about the shoulder so the helmet sweeps. */}
        <g transform="rotate(0, 0, 0)">
          <animateTransform attributeName="transform" type="rotate" values="-14,0,0;14,0,0;-14,0,0" dur="0.7s" repeatCount="indefinite" />
          {/* Upper arm + forearm reaching up */}
          <line x1={0} y1={0} x2={3} y2={-8} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
          {/* Hand */}
          <circle cx={3} cy={-8} r={1} fill="#f5d0a0" />
          {/* The waved batting helmet (dome + brim) in the team color */}
          <path d="M0.6,-9.2 Q3,-13 5.4,-9.2 Z" fill={color} stroke="#1a1a1a" strokeWidth={0.4} />
          <ellipse cx={3} cy={-9} rx={3} ry={0.9} fill={color} stroke="#1a1a1a" strokeWidth={0.4} />
        </g>
      </g>
    </g>
  );
}

// SVGWalkOffMob (Backlog #145) — after a walk-off win, the home team pours out
// of the dugout and mobs the hero at home plate, jumping and waving their arms,
// while a teammate dumps the Gatorade cooler over the pile. Pure cosmetic; fires
// only at game-over inside the pre-post-game window. Self-animating SVG (the bob,
// the tipping cooler, and the falling droplets all loop via SMIL).
function SVGWalkOffMob({ x, y, color = '#b91c1c' }) {
  // Six figures clustered around the plate, each jumping on a staggered cycle.
  const figs = [
    { dx: 0,   dy: 0, delay: 0.00, s: 1.00 },
    { dx: -7,  dy: 2, delay: 0.12, s: 0.92 },
    { dx: 7,   dy: 2, delay: 0.24, s: 0.92 },
    { dx: -13, dy: 4, delay: 0.06, s: 0.84 },
    { dx: 13,  dy: 4, delay: 0.18, s: 0.84 },
    { dx: 0,   dy: 6, delay: 0.30, s: 0.78 },
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Group shadow under the pile */}
      <ellipse cx={0} cy={14} rx={21} ry={3.2} fill="rgba(0,0,0,.20)" />
      {figs.map((f, i) => (
        <g key={`wom-${i}`} transform={`translate(${f.dx},${f.dy}) scale(${f.s})`}>
          <g>
            {/* Jumping bob — staggered start so the mob bounces chaotically */}
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-4.5;0,0" dur="0.5s" begin={`${f.delay}s`} repeatCount="indefinite" />
            {/* Torso */}
            <line x1={0} y1={-1} x2={0} y2={7} stroke={color} strokeWidth={2.3} strokeLinecap="round" />
            {/* Legs */}
            <line x1={0} y1={7} x2={-2.5} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <line x1={0} y1={7} x2={2.5} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
            {/* Both arms thrown up in celebration */}
            <line x1={0} y1={0} x2={-5} y2={-6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
            <line x1={0} y1={0} x2={5} y2={-6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
            <circle cx={-5} cy={-6} r={1} fill="#f5d0a0" />
            <circle cx={5} cy={-6} r={1} fill="#f5d0a0" />
            {/* Head + cap (dome + brim) */}
            <circle cx={0} cy={-5} r={3.2} fill="#f5d0a0" />
            <path d="M-3.2,-6 Q0,-9.4 3.2,-6 Z" fill={color} />
            <rect x={-3.6} y={-6.4} width={7.2} height={1} rx={0.5} fill={color} />
          </g>
        </g>
      ))}
      {/* Gatorade cooler dumping over the pile — orange cooler tilts and blue
          liquid rains down onto the mob. */}
      <g transform="translate(2,-20)">
        {/* Cooler body, tipping forward on a loop */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-8,0,4;118,0,4;118,0,4;-8,0,4" keyTimes="0;0.25;0.8;1" dur="1.6s" repeatCount="indefinite" />
          <rect x={-3.5} y={-9} width={7} height={9} rx={1.5} fill="#ea580c" stroke="#9a3412" strokeWidth={0.5} />
          <rect x={-3.7} y={-9.6} width={7.4} height={1.8} rx={0.9} fill="#fb923c" />
        </g>
        {/* Falling Gatorade droplets */}
        {[-9, -5, -1, 3, 7, 11].map((dx, i) => (
          <circle key={`gd-${i}`} cx={dx} cy={2} r={1.3} fill="#38bdf8" opacity={0.85}>
            <animate attributeName="cy" values="2;24" dur="0.7s" begin={`${0.3 + i * 0.1}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0" dur="0.7s" begin={`${0.3 + i * 0.1}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    </g>
  );
}

// SVGHighFiveLine (Backlog #147) — after a home run, the hitter's teammates
// line up at the dugout step and mob him with a row of high-fives as he jogs
// back in. The hero stands at center with both arms up while greeters flank him
// on both sides, each reaching an inside arm toward him for the slap. The
// raised hands pulse and the figures bob via SMIL — pure cosmetic, fires after
// the HR trot completes. Wears the batting team's color. Fires for BOTH teams
// (every dugout greets a home run), unlike the home-only curtain call.
function SVGHighFiveLine({ x, y, color = '#b91c1c' }) {
  // Five greeters flanking the hero; `hand` points the slap arm toward center.
  const greeters = [
    { dx: -20, hand: 1,  delay: 0.00 },
    { dx: -11, hand: 1,  delay: 0.14 },
    { dx: 12,  hand: -1, delay: 0.06 },
    { dx: 21,  hand: -1, delay: 0.20 },
    { dx: 29,  hand: -1, delay: 0.26 },
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Group shadow under the greeting line */}
      <ellipse cx={4} cy={13} rx={27} ry={2.6} fill="rgba(0,0,0,.18)" />
      {greeters.map((gr, i) => (
        <g key={`hfl-${i}`} transform={`translate(${gr.dx},0)`}>
          <g>
            {/* Subtle bob, staggered so the line ripples */}
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-1.4;0,0" dur="0.55s" begin={`${gr.delay}s`} repeatCount="indefinite" />
            {/* Torso */}
            <line x1={0} y1={-1} x2={0} y2={7} stroke={color} strokeWidth={2.1} strokeLinecap="round" />
            {/* Legs */}
            <line x1={0} y1={7} x2={-2.2} y2={12} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
            <line x1={0} y1={7} x2={2.2} y2={12} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
            {/* Outside arm relaxed at side (away from the hero) */}
            <line x1={0} y1={0} x2={-gr.hand * 4} y2={3} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
            {/* Inside arm raised toward the hero for the high-five — hand pulses */}
            <line x1={0} y1={0} x2={gr.hand * 4.5} y2={-5} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
            <circle cx={gr.hand * 4.5} cy={-5} r={1.2} fill="#f5d0a0">
              <animate attributeName="r" values="1.2;1.7;1.2" dur="0.4s" begin={`${gr.delay}s`} repeatCount="indefinite" />
            </circle>
            {/* Head + cap */}
            <circle cx={0} cy={-5} r={3} fill="#f5d0a0" />
            <path d="M-3,-5.8 Q0,-9 3,-5.8 Z" fill={color} />
            <rect x={-3.3} y={-6.2} width={6.6} height={0.9} rx={0.5} fill={color} />
          </g>
        </g>
      ))}
      {/* The home-run hero at center, both arms up, bobbing as he's mobbed */}
      <g transform="translate(0,0)">
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="0.5s" repeatCount="indefinite" />
          <line x1={0} y1={-1} x2={0} y2={7} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
          <line x1={0} y1={7} x2={-2.6} y2={12} stroke={color} strokeWidth={2.1} strokeLinecap="round" />
          <line x1={0} y1={7} x2={2.6} y2={12} stroke={color} strokeWidth={2.1} strokeLinecap="round" />
          {/* Both arms thrown up to slap hands */}
          <line x1={0} y1={0} x2={-5} y2={-5.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <line x1={0} y1={0} x2={5} y2={-5.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <circle cx={-5} cy={-5.5} r={1.1} fill="#f5d0a0" />
          <circle cx={5} cy={-5.5} r={1.1} fill="#f5d0a0" />
          {/* Head + batting helmet (dome + thin brim) */}
          <circle cx={0} cy={-5} r={3.3} fill="#f5d0a0" />
          <path d="M-3.3,-5.8 Q0,-9.4 3.3,-5.8 Z" fill={color} stroke="#1a1a1a" strokeWidth={0.3} />
        </g>
      </g>
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

function StrikeoutKs({ kCount, kHistory = [], side = 'home' }) {
  // Display K signs along the outfield fence, stadium-style.
  // Backlog #107 — called strikeouts ('L' in kHistory) render with a backwards "K"
  // per the classic baseball scoring tradition (a swinging K is a forward K, a
  // called K is a backwards K). The history array stores 'L' or 'S' per K, in
  // chronological order. Falls back to all-forward K's if no history is provided
  // (legacy save compatibility).
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
        // Determine K type from kHistory (defaults to 'S' if history is missing or
        // shorter than count — defensive for legacy saves).
        const kType = (Array.isArray(kHistory) && i < kHistory.length) ? kHistory[i] : 'S';
        const isLooking = kType === 'L';
        return (
          <g key={`k-${side}-${i}`} transform={`translate(${col},${kY})`}>
            <title>{isLooking ? 'Strikeout looking — backwards K' : 'Strikeout swinging'}</title>
            <rect x={-5.5} y={-7} width={11} height={14} rx={1.5} fill="#fff" stroke="#c00" strokeWidth={0.8} opacity={0.92} />
            {/* The text is wrapped in a scaled group so a called strikeout flips horizontally
                without disturbing the white rect frame around it. */}
            <g transform={isLooking ? 'scale(-1, 1)' : undefined}>
              <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fill="#c00" fontSize="9" fontWeight="bold" fontFamily="sans-serif">K</text>
            </g>
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

// Home-run-robbing leap (Backlog #72) — a fielder springs vertically at the
// outfield wall and snags a ball that was about to clear the fence. Renders
// at the catch point (just above and slightly inside the outfield wall) and
// animates: (1) a small fielder silhouette leaping straight up with arms
// extended overhead, (2) a baseball captured in the raised glove, (3) a
// gold "ROBBED!" text floating upward, and (4) a subtle sparkle burst at
// the snare moment. Auto-clears after ~1.6s.
function RobbedHRLeap({ x, y, color = '#1e40af' }) {
  if (!x || !y) return null;
  // The leap takes the fielder from a "set at the wall" pose up ~22px and back down.
  // The ball is snared at peak height and held overhead through the descent.
  return (
    <g>
      {/* Shadow at landing point — pulses outward as the fielder rises and falls */}
      <ellipse cx={x} cy={y + 16} rx={6} ry={1.6} fill="rgba(0,0,0,.22)">
        <animate attributeName="rx" values="6;3;6" dur="1.2s" fill="freeze" />
        <animate attributeName="opacity" values="0.4;0.18;0.4" dur="1.2s" fill="freeze" />
      </ellipse>
      {/* Fielder silhouette — rises ~22px, hangs at peak, descends */}
      <g>
        <animateTransform attributeName="transform" type="translate" values={`0,0; 0,-22; 0,-22; 0,0`} keyTimes="0;0.4;0.7;1" dur="1.2s" fill="freeze" />
        {/* Body */}
        <rect x={x - 3} y={y - 4} width={6} height={14} fill={color} />
        {/* Head */}
        <circle cx={x} cy={y - 7} r={3} fill="#f5d0a0" stroke="#000" strokeWidth={0.4} />
        {/* Cap brim */}
        <path d={`M${x - 3},${y - 8.5} Q${x},${y - 11} ${x + 3.5},${y - 8.5}`} fill={color} stroke="#000" strokeWidth={0.3} />
        {/* Legs in tuck (slightly bent) */}
        <line x1={x - 2} y1={y + 10} x2={x - 3} y2={y + 14} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
        <line x1={x + 2} y1={y + 10} x2={x + 3} y2={y + 14} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
        {/* Glove arm raised overhead at full extension */}
        <line x1={x - 1} y1={y - 4} x2={x - 4} y2={y - 14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Glove disk (rust brown) holding the ball */}
        <circle cx={x - 5} cy={y - 16} r={3.2} fill="#8b4513" stroke="#000" strokeWidth={0.4} />
        {/* Ball captured in glove */}
        <circle cx={x - 5} cy={y - 16} r={1.6} fill="#fff" stroke="#c00" strokeWidth={0.4} />
        {/* Off arm braced against the wall */}
        <line x1={x + 1} y1={y - 4} x2={x + 6} y2={y - 8} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      </g>
      {/* Sparkle burst at peak — fires at 0.4s when the snag happens */}
      {[0, 1, 2, 3, 4].map(i => {
        const a = (i / 5) * Math.PI * 2;
        const dx = Math.cos(a) * 8, dy = Math.sin(a) * 8;
        return (
          <line key={`rs${i}`} x1={x - 5} y1={y - 38} x2={x - 5 + dx} y2={y - 38 + dy} stroke="#fbbf24" strokeWidth={1.4} strokeLinecap="round" opacity={0}>
            <animate attributeName="opacity" values="0;0.95;0" keyTimes="0;0.05;1" begin="0.4s" dur="0.7s" fill="freeze" />
          </line>
        );
      })}
      {/* "ROBBED!" text floating up and fading out */}
      <text x={x} y={y - 24} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="sans-serif" stroke="#000" strokeWidth={0.5} paintOrder="stroke" opacity={0}>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.45;0.85;1" begin="0.4s" dur="1.1s" fill="freeze" />
        <animate attributeName="y" from={y - 24} to={y - 44} begin="0.4s" dur="1.1s" fill="freeze" />
        ROBBED!
      </text>
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

// Sun flare (Backlog #77 — Lost in the sun). Bright golden burst overlay at
// the outfielder's position when he loses the fly ball in the afternoon sun.
// Two crossed sun-rays (4-spoke star), a glaring radial glow that fades, a
// floating "☀ LOST IN THE SUN!" text rising and fading, and three small
// drifting "shielding hand" indicator dots. Day-game flavor only — gating to
// !isNightGame is the caller's responsibility.
function SunFlare({ x, y }) {
  if (x == null || y == null) return null;
  return (
    <g>
      {/* Bright radial glare disc — fades out as the play unfolds */}
      <circle cx={x} cy={y} r={5} fill="#fde68a" opacity={0.9}>
        <animate attributeName="r" from="4" to="22" dur="1.1s" fill="freeze" />
        <animate attributeName="opacity" from="0.9" to="0" dur="1.1s" fill="freeze" />
      </circle>
      {/* Inner solid sun core */}
      <circle cx={x} cy={y} r={3} fill="#fbbf24" opacity={0.95}>
        <animate attributeName="r" from="2" to="9" dur="0.8s" fill="freeze" />
        <animate attributeName="opacity" from="0.95" to="0" dur="0.9s" fill="freeze" />
      </circle>
      {/* Four sun rays — vertical/horizontal cross pattern stretching outward */}
      {[0, 1, 2, 3].map(i => {
        const angle = i * 45;
        const dx = Math.cos(angle * Math.PI / 180);
        const dy = Math.sin(angle * Math.PI / 180);
        const len = 14;
        return (
          <line key={`sf-ray-${i}`}
            x1={x - dx * 4} y1={y - dy * 4}
            x2={x + dx * len} y2={y + dy * len}
            stroke="#fbbf24" strokeWidth={1.6} strokeLinecap="round" opacity={0.85}>
            <animate attributeName="opacity" from="0.95" to="0" dur="0.95s" fill="freeze" />
            <animate attributeName="x2" from={x + dx * 4} to={x + dx * (len + 6)} dur="0.95s" fill="freeze" />
            <animate attributeName="y2" from={y + dy * 4} to={y + dy * (len + 6)} dur="0.95s" fill="freeze" />
          </line>
        );
      })}
      {/* Floating "☀ LOST!" text — gold, slight rise as it fades */}
      <text x={x} y={y - 16} textAnchor="middle" fill="#b45309" fontSize="10" fontWeight="bold" fontFamily="sans-serif" stroke="#fff" strokeWidth={0.7} paintOrder="stroke" opacity={1}>
        <animate attributeName="y" from={y - 12} to={y - 30} dur="1.3s" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="1.3s" fill="freeze" />
        ☀ LOST!
      </text>
      {/* Three small "shielding hand" indicator dots — tiny brown dots above the head */}
      {[0, 1, 2].map(i => {
        const dx = (i - 1) * 3;
        return (
          <circle key={`sf-shield-${i}`} cx={x + dx} cy={y - 8} r={1.2} fill="#7c2d12" opacity={0.7}>
            <animate attributeName="cy" from={y - 8} to={y - 14} dur="0.6s" fill="freeze" />
            <animate attributeName="opacity" from="0.7" to="0" dur="0.6s" fill="freeze" />
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

// Bang-bang play at first (Backlog #75) — small batter-runner sprite slides
// headfirst into 1B with a kicked dust puff and a floating "BANG-BANG!" text,
// timed to the throw arriving in the first baseman's glove. Pure flavor — the
// outcome is unchanged (still a groundout). The slide direction is from home
// plate toward first base (i.e., approaching the bag from the upper-right of
// the bag's base coordinates), so the runner kicks dust trailing behind.
function BangBangPlay({ x, y, color = '#dc2626' }) {
  if (x == null || y == null) return null;
  // Approach axis runs from HP toward B1 — a roughly +110, -105 vector. We
  // animate the runner sliding from a point ~24px shy of the bag (down-and-
  // right of B1) up onto the bag itself.
  const startX = x + 22, startY = y + 16;
  const midX = x + 8, midY = y + 6;
  const endX = x - 2, endY = y;
  return (
    <g>
      {/* Slide track shadow — extended ellipse trailing the runner */}
      <ellipse cx={startX} cy={startY + 4} rx={14} ry={3.2} fill="rgba(0,0,0,.18)">
        <animate attributeName="opacity" values="0;0.35;0" keyTimes="0;0.55;1" dur="0.9s" fill="freeze" />
        <animate attributeName="cx" values={`${startX};${midX};${endX}`} dur="0.9s" fill="freeze" />
        <animate attributeName="cy" values={`${startY + 4};${midY + 4};${endY + 4}`} dur="0.9s" fill="freeze" />
      </ellipse>
      {/* Sliding runner silhouette — body lean toward 1B, arms extended forward */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values={`${startX},${startY}; ${midX},${midY}; ${endX},${endY}`}
          keyTimes="0;0.55;1" dur="0.9s" fill="freeze" />
        {/* Body (lean angled toward 1B) */}
        <line x1={6} y1={2} x2={-8} y2={6} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
        {/* Trailing leg */}
        <line x1={-8} y1={6} x2={-12} y2={10} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Lead arm reaching for the bag */}
        <line x1={6} y1={2} x2={12} y2={-1} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Head */}
        <circle cx={5} cy={-2} r={3.2} fill="#f5d0a0" />
      </g>
      {/* Dust puff trailing the slide path — three particles */}
      {[0, 1, 2].map(i => {
        const px = startX - i * 4;
        const py = startY + 4;
        return (
          <circle key={`bb-dust-${i}`} cx={px} cy={py} r={1.2} fill="#d4a574" opacity={0.6}>
            <animate attributeName="r" from="1" to="4.5" dur="0.9s" begin={`${0.05 * i}s`} fill="freeze" />
            <animate attributeName="opacity" from="0.6" to="0" dur="0.9s" begin={`${0.05 * i}s`} fill="freeze" />
            <animate attributeName="cy" from={py} to={py + 3} dur="0.9s" begin={`${0.05 * i}s`} fill="freeze" />
            <animate attributeName="cx" from={px} to={px + 4} dur="0.9s" begin={`${0.05 * i}s`} fill="freeze" />
          </circle>
        );
      })}
      {/* Floating "BANG-BANG!" call text above the bag */}
      <text x={x} y={y - 14} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#f59e0b" stroke="#000" strokeWidth="0.5" paintOrder="stroke" fontFamily="sans-serif">
        <animate attributeName="y" from={y - 14} to={y - 30} dur="1.1s" begin="0.25s" fill="freeze" />
        <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.25s" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="0.6s" begin="0.85s" fill="freeze" />
        BANG-BANG!
      </text>
    </g>
  );
}

/**
 * DIVING STOP (Backlog #93)
 * Spectacular defensive infield play. Renders a fielder fully extended in mid-air
 * — body horizontal, arms outstretched toward the ball, with two trailing dust
 * puffs behind him as he hits the dirt. The dive animates over ~700ms: the
 * fielder slides into position from a starting "ready stance" toward the catch
 * point, glove arm extends fully, body lays out flat, and dust puffs bloom
 * behind. After the catch, a small floating gold "WHAT A PLAY!" text rises and
 * fades. Pure cosmetic — outcome is still a routine groundOut, but with extra
 * dramatic flair. Companion to web-gem leap (RobbedHRLeap, fly outs).
 *
 * Position (x, y) is the catch point — typically the standard infielder
 * coordinate. The dive direction (`dir`) is +1 (toward right field, e.g. 2B/SS
 * diving toward the gap) or -1 (toward left field, e.g. 3B/F1B diving toward
 * the line); affects which side the dust trails on.
 */
function DivingStop({ x, y, color = '#1e40af', dir = 1 }) {
  if (x == null || y == null) return null;
  // Body starts upright at offsetX away from the catch point, animates to
  // horizontal layout AT the catch point. dir = +1 means dive to the right
  // (body extends rightward), dir = -1 means dive left (body extends leftward).
  const startOff = -10 * dir; // start back/up
  const endOff = 8 * dir;     // body fully extended past catch point
  return (
    <g>
      {/* Dust shadow trailing the body — extended ellipse */}
      <ellipse cx={x + startOff} cy={y + 6} rx={6} ry={1.6} fill="rgba(0,0,0,.22)">
        <animate attributeName="opacity" values="0;0.4;0" keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
        <animate attributeName="cx" values={`${x + startOff};${x};${x + endOff * 0.6}`} dur="0.7s" fill="freeze" />
        <animate attributeName="rx" values="6;11;14" dur="0.7s" fill="freeze" />
      </ellipse>
      {/* Diving body — animates from upright crouch to fully horizontal layout.
          We render the silhouette around its catch-point origin so the body
          extends past the ball position toward the dive direction. */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values={`${startOff},${-4}; 0,0; ${endOff * 0.5},2`}
          keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
        {/* Torso — line that rotates from upright to horizontal */}
        <line x1={0} y1={0} x2={-6 * dir} y2={4} stroke={color} strokeWidth={2.8} strokeLinecap="round">
          <animate attributeName="x2" values={`${-2 * dir};${-6 * dir};${-9 * dir}`} keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
          <animate attributeName="y2" values="6;4;3" keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
        </line>
        {/* Trailing leg — extends back behind the dive */}
        <line x1={-6 * dir} y1={4} x2={-12 * dir} y2={6} stroke={color} strokeWidth={2.2} strokeLinecap="round">
          <animate attributeName="x2" values={`${-9 * dir};${-12 * dir};${-15 * dir}`} keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
          <animate attributeName="y2" values="9;6;5" keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
        </line>
        {/* Glove arm — extends FULL toward the catch point at the dive's apex */}
        <line x1={0} y1={0} x2={6 * dir} y2={-1} stroke={color} strokeWidth={2.4} strokeLinecap="round">
          <animate attributeName="x2" values={`${4 * dir};${8 * dir};${10 * dir}`} keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
          <animate attributeName="y2" values="0;-1;0" keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
        </line>
        {/* Glove circle at the arm tip — captures the ball */}
        <circle r={2.4} fill="#7a4a1a" stroke={color} strokeWidth={0.5}>
          <animate attributeName="cx" values={`${4 * dir};${8 * dir};${10 * dir}`} keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
          <animate attributeName="cy" values="0;-1;0" keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
        </circle>
        {/* Throwing arm — folded under body during dive */}
        <line x1={0} y1={0} x2={-3 * dir} y2={2} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Head — small forward-tilted */}
        <circle cx={3 * dir} cy={-2} r={3.2} fill="#f5d0a0">
          <animate attributeName="cx" values={`${1 * dir};${3 * dir};${5 * dir}`} keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
        </circle>
        {/* Cap */}
        <path d={`M${0 * dir},-3 Q${3 * dir},-7 ${6 * dir},-3`} fill={color}>
          <animateTransform attributeName="transform" type="translate"
            values={`${1 * dir},0; ${3 * dir},0; ${5 * dir},0`}
            keyTimes="0;0.55;1" dur="0.7s" fill="freeze" />
        </path>
      </g>
      {/* Dust puff trail — three particles bloom behind the body as it hits dirt */}
      {[0, 1, 2].map(i => {
        const px = x + (startOff - i * 3 * dir);
        const py = y + 4;
        return (
          <circle key={`ds-dust-${i}`} cx={px} cy={py} r={1.0} fill="#d4a574" opacity={0.65}>
            <animate attributeName="r" from="0.8" to="5" dur="0.7s" begin={`${0.08 * i}s`} fill="freeze" />
            <animate attributeName="opacity" from="0.65" to="0" dur="0.7s" begin={`${0.08 * i}s`} fill="freeze" />
            <animate attributeName="cy" from={py} to={py + 4} dur="0.7s" begin={`${0.08 * i}s`} fill="freeze" />
          </circle>
        );
      })}
      {/* Floating gold "WHAT A PLAY!" text above the catch */}
      <text x={x} y={y - 14} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#fbbf24" stroke="#000" strokeWidth="0.5" paintOrder="stroke" fontFamily="sans-serif">
        <animate attributeName="y" from={y - 14} to={y - 32} dur="1.0s" begin="0.35s" fill="freeze" />
        <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.35s" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="0.6s" begin="0.95s" fill="freeze" />
        WHAT A PLAY!
      </text>
    </g>
  );
}

/**
 * F1B STRETCH (Backlog #114)
 * First baseman stretches off the bag to receive a throw. The most universally
 * recognizable defensive pose in baseball — foot anchored on first, body
 * extended forward toward the throw, glove arm fully outstretched. Fires when
 * the ball is in flight to first base on routine groundouts (and throwing-
 * error wild throws). Renders an overlay sprite at (x, y) ≈ first base for
 * ~750ms: a short pre-stretch loading pose followed by the full extension
 * pose with arm and torso reaching toward the throw. Pure cosmetic — outcome
 * unchanged. Companion to the existing "First baseman holds the runner"
 * static pose (Backlog #106) which covers the pre-pitch holding posture; this
 * covers the actual catch moment.
 *
 * `throwFrom` is the throw origin point — used to angle the glove toward
 * where the throw is coming from. `color` is the defensive team's color.
 */
function F1BStretch({ x, y, color = '#1e40af', throwFrom }) {
  if (x == null || y == null) return null;
  // Compute the angle from the bag toward the throw origin so the body and
  // glove reach naturally toward the incoming ball. Default to leaning
  // toward home plate / infield if no throw origin provided.
  const tfx = throwFrom?.x != null ? throwFrom.x : x - 60;
  const tfy = throwFrom?.y != null ? throwFrom.y : y - 30;
  const dx = tfx - x, dy = tfy - y;
  const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const ux = dx / len, uy = dy / len; // unit vector toward throw
  // Glove reach distance — start at modest, extend to full at apex
  const reach1 = 5, reach2 = 11;
  const gx1 = ux * reach1, gy1 = uy * reach1;
  const gx2 = ux * reach2, gy2 = uy * reach2;
  // Front foot extension toward throw (slight); back foot anchors on bag
  const bag_dx = ux * 2, bag_dy = uy * 2; // body leans forward
  return (
    <g>
      {/* Body shadow */}
      <ellipse cx={x} cy={y + 16} rx={7} ry={2.5} fill="rgba(0,0,0,.18)">
        <animate attributeName="rx" values="6;8;7" keyTimes="0;0.5;1" dur="0.75s" fill="freeze" />
      </ellipse>
      {/* Stretched fielder — body, legs, glove arm extending toward throw */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values={`${x},${y}; ${x + bag_dx},${y + bag_dy}; ${x + bag_dx * 0.6},${y + bag_dy * 0.6}`}
          keyTimes="0;0.5;1" dur="0.75s" fill="freeze" />
        {/* Body line — torso angled forward toward the throw */}
        <line x1={0} y1={0} x2={ux * 2} y2={8 + uy * 1} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        {/* Back leg — anchored back to the bag (foot on first) */}
        <line x1={ux * 2} y1={8 + uy * 1} x2={-ux * 4} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Front leg — extended forward in the stretch direction */}
        <line x1={ux * 2} y1={8 + uy * 1} x2={ux * 5} y2={14 + uy * 1} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Throwing arm — balanced back, opposite of the stretch */}
        <line x1={0} y1={2} x2={-ux * 4} y2={2 + uy * 0.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Glove arm — animates from short reach to full extension toward the throw */}
        <line x1={0} y1={0} x2={gx1} y2={gy1} stroke={color} strokeWidth={2.4} strokeLinecap="round">
          <animate attributeName="x2" values={`${ux * 3};${gx2};${gx2 * 0.85}`} keyTimes="0;0.5;1" dur="0.75s" fill="freeze" />
          <animate attributeName="y2" values={`${uy * 3};${gy2};${gy2 * 0.85}`} keyTimes="0;0.5;1" dur="0.75s" fill="freeze" />
        </line>
        {/* Glove circle at arm tip — captures the ball at the apex */}
        <circle r={3.3} fill="#8B4513" stroke="#5a3010" strokeWidth={0.6}>
          <animate attributeName="cx" values={`${ux * 3};${gx2};${gx2 * 0.85}`} keyTimes="0;0.5;1" dur="0.75s" fill="freeze" />
          <animate attributeName="cy" values={`${uy * 3};${gy2};${gy2 * 0.85}`} keyTimes="0;0.5;1" dur="0.75s" fill="freeze" />
        </circle>
        {/* Head — tilts slightly toward the throw */}
        <circle cx={ux * 1} cy={-5 + uy * 0.5} r={5} fill="#f5d0a0" />
        {/* Cap */}
        <path d={`M${ux * 1 - 5.5},${-6 + uy * 0.5} Q${ux * 1},${-13 + uy * 0.5} ${ux * 1 + 5.5},${-6 + uy * 0.5}`} fill={color} />
      </g>
    </g>
  );
}

/**
 * FLYING HELMET (Backlog #96)
 * Cosmetic flair fired alongside hard slides at the bases. The runner's batting
 * helmet pops off, arcs through the air with a tumbling spin, and lands in the
 * dirt with a small puff. Used at three trigger points: bang-bang plays at first,
 * close plays at the plate, and outfield-assist gun-downs at home. Pure flavor —
 * no gameplay effect — but adds a moment of physical drama to the most exciting
 * defensive plays in baseball. Position (x, y) is where the helmet starts (the
 * runner's head); `dir` is +1 (helmet flies to the right) or -1 (left).
 */
function FlyingHelmet({ x, y, color = '#dc2626', dir = -1 }) {
  if (x == null || y == null) return null;
  // Parabolic arc: starts at runner's head, peaks ~24px up and ~14px in the
  // dive direction, lands ~28px out at field level. Tumbles 540° on the way.
  const startX = x, startY = y;
  const midX = x + dir * 14, midY = y - 24;
  const endX = x + dir * 28, endY = y + 5;
  const spinDeg = dir * 540; // multi-revolution tumble
  return (
    <g>
      {/* The flying helmet — translate group wraps a rotation group so the spin
          stays anchored at the helmet's local origin while the whole piece arcs. */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values={`${startX},${startY}; ${midX},${midY}; ${endX},${endY}`}
          keyTimes="0;0.5;1" dur="0.75s" fill="freeze" />
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0" to={`${spinDeg}`} dur="0.75s" fill="freeze" />
          {/* Helmet dome — half-ellipse top */}
          <path d="M-4.4,0.5 Q-4.4,-4.2 0,-4.2 Q4.4,-4.2 4.4,0.5 Z" fill={color} stroke="#000" strokeWidth="0.4" />
          {/* Brim — slight horizontal lip */}
          <path d="M-5,0.5 L5,0.5 L4.4,1.6 L-4.4,1.6 Z" fill={color} stroke="#000" strokeWidth="0.4" />
          {/* Earflap (small darker patch) */}
          <ellipse cx={-2} cy={-0.5} rx={1.4} ry={1.6} fill="#000" opacity={0.32} />
          {/* Subtle highlight */}
          <line x1={-1.5} y1={-3.4} x2={1.6} y2={-3.4} stroke="#fff" strokeWidth={0.5} opacity={0.5} />
        </g>
        {/* Fade out slightly as the helmet settles */}
        <animate attributeName="opacity" values="1;1;0.85" keyTimes="0;0.7;1" dur="0.75s" fill="freeze" />
      </g>
      {/* Small dust puff at the landing point */}
      <circle cx={endX} cy={endY + 1.5} r={1} fill="#d4a574" opacity={0}>
        <animate attributeName="r" from="0.8" to="5.5" dur="0.45s" begin="0.7s" fill="freeze" />
        <animate attributeName="opacity" values="0;0.55;0" keyTimes="0;0.35;1" dur="0.45s" begin="0.7s" fill="freeze" />
        <animate attributeName="cy" from={endY + 1.5} to={endY - 0.5} dur="0.45s" begin="0.7s" fill="freeze" />
      </circle>
    </g>
  );
}

/**
 * CATCHER'S MASK TOSS ON POP-UP (Backlog #98)
 * On foulOut outcomes (which default to the catcher fielding the popup behind
 * home plate), the catcher whips his mask off and circles under the falling
 * pop-up before squeezing it for the out. Renders a small dark mask cage that
 * tumbles through a parabolic arc (peak ~22px up, ~30px lateral toss away from
 * the plate) over 900ms with 720° rotation, then a small dirt-puff at the
 * landing point. Pure cosmetic — fires alongside the existing foul-ball flight
 * to the catcher and the standard foul-out out resolution. Companion to the
 * skyward-glove pose change on SVGCatcher (`lookingUp` prop) so the catcher is
 * visibly tracking the popup overhead while the mask tumbles away.
 *
 * `dir` controls which side the mask flies (-1 = toward dugout-side foul
 * territory, +1 = toward the other foul line).
 */
function MaskToss({ x, y, dir = -1 }) {
  if (x == null || y == null) return null;
  const startX = x, startY = y;
  const midX = x + dir * 18, midY = y - 22;
  const endX = x + dir * 30, endY = y + 12;
  const spinDeg = dir * 720; // multi-revolution tumble
  return (
    <g>
      {/* Outer translate group sweeps the mask through the arc */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values={`${startX},${startY}; ${midX},${midY}; ${endX},${endY}`}
          keyTimes="0;0.5;1" dur="0.9s" fill="freeze" />
        {/* Inner rotate group spins the mask in place during the arc */}
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0" to={`${spinDeg}`} dur="0.9s" fill="freeze" />
          {/* Mask body — small dark rectangle with rounded corners */}
          <rect x={-4} y={-3} width={8} height={6} rx={1.2} ry={1.2}
                fill="#3a3a3a" stroke="#1a1a1a" strokeWidth={0.5} />
          {/* Cage bars — three horizontal lines + two verticals capture the
              "wire cage" look of a real catcher's mask */}
          <line x1={-3.4} y1={-1.6} x2={3.4} y2={-1.6} stroke="#1f1f1f" strokeWidth={0.4} />
          <line x1={-3.4} y1={0} x2={3.4} y2={0} stroke="#1f1f1f" strokeWidth={0.4} />
          <line x1={-3.4} y1={1.6} x2={3.4} y2={1.6} stroke="#1f1f1f" strokeWidth={0.4} />
          <line x1={-1.5} y1={-2.6} x2={-1.5} y2={2.6} stroke="#1f1f1f" strokeWidth={0.4} />
          <line x1={1.5} y1={-2.6} x2={1.5} y2={2.6} stroke="#1f1f1f" strokeWidth={0.4} />
          {/* Subtle leather-trim highlight along the top */}
          <line x1={-3.6} y1={-2.4} x2={3.6} y2={-2.4} stroke="#5a3010" strokeWidth={0.5} opacity={0.6} />
          {/* Strap that hangs off the back of the mask as it spins */}
          <line x1={4} y1={-1} x2={6} y2={1} stroke="#5a3010" strokeWidth={0.6} opacity={0.85} />
        </g>
        {/* Slight fade as the mask settles */}
        <animate attributeName="opacity" values="1;1;0.9" keyTimes="0;0.85;1" dur="0.9s" fill="freeze" />
      </g>
      {/* Small dirt puff blooming at the landing point */}
      <circle cx={endX} cy={endY + 1.5} r={1} fill="#c9b59a" opacity={0}>
        <animate attributeName="r" from="0.8" to="5.2" dur="0.42s" begin="0.85s" fill="freeze" />
        <animate attributeName="opacity" values="0;0.6;0" keyTimes="0;0.4;1" dur="0.42s" begin="0.85s" fill="freeze" />
        <animate attributeName="cy" from={endY + 1.5} to={endY - 1} dur="0.42s" begin="0.85s" fill="freeze" />
      </circle>
    </g>
  );
}

/**
 * FRESH BALL TOSS from home plate umpire to pitcher (Backlog #135).
 * After HRs and fan-grab fouls, the game ball is "gone" (over the fence or in
 * the stands). In real baseball, the home plate umpire pulls a new ball out
 * of his ball bag and tosses it underhanded to the pitcher. Pure atmospheric
 * flavor — a tiny white ball arcs from F.HP up over the diamond and lands at
 * the pitcher's mound over ~700ms with a soft arc. The pitcher is rendered
 * standing at the mound during this animation (the standard idle stance), so
 * the toss reads as completing in his glove.
 *
 * Implementation: a single small `<circle>` with two `<animate>` elements on
 * cx/cy that drive a parabolic-feel motion (using nested keyframes for the
 * arc), plus a slight scale-pulse on arrival so the ball appears to "settle"
 * in the pitcher's glove. The umpire's right arm visibly extends forward and
 * up during the toss via the existing `'idle'` stance (no special umpire
 * pose is needed — the toss is fast enough that the gesture reads as a
 * casual underhand flip).
 */
function FreshBallToss({ from, to }) {
  if (!from || !to) return null;
  // Parabolic arc — peak at midpoint, peakY ~ midY - 18 for a soft underhand toss
  const midX = (from.x + to.x) / 2;
  const peakY = Math.min(from.y, to.y) - 18;
  return (
    <g>
      {/* The ball — small white circle with a faint red stitch line. Two-keyframe
          translate on cx drives the horizontal flight; cy uses three keyframes
          (start → peak → end) for the parabolic arc. */}
      <circle r={1.8} fill="#fff" stroke="#c00" strokeWidth={0.35} opacity={0.95}>
        <animate attributeName="cx" values={`${from.x};${midX};${to.x}`} keyTimes="0;0.5;1" dur="0.7s" fill="freeze" />
        <animate attributeName="cy" values={`${from.y};${peakY};${to.y}`} keyTimes="0;0.5;1" dur="0.7s" fill="freeze" />
        {/* Brief fade-out on arrival as the ball settles into the pitcher's glove */}
        <animate attributeName="opacity" values="0.95;0.95;0.95;0" keyTimes="0;0.85;0.92;1" dur="0.85s" fill="freeze" />
      </circle>
    </g>
  );
}

/**
 * MANAGER CHALLENGE / REPLAY REVIEW (Idea #80)
 * Translucent slate panel covering the field area while the umpires review the
 * close call. A spinning indicator animates during the "reviewing..." phase,
 * then fades out and reveals the verdict text ("CALL STANDS" in red or
 * "CALL OVERTURNED — SAFE!" in emerald). Mounted via a `key` so the inner
 * <animate> elements remount cleanly each time the component appears.
 *
 * Phases:
 *   - reviewing  → "UNDER REVIEW" + spinner (0 → ~1.6s)
 *   - confirmed  → red "CALL STANDS — OUT!" verdict (~1.6 → 2.6s)
 *   - overturned → emerald "CALL OVERTURNED — SAFE!" verdict (~1.6 → 2.6s)
 */
function ChallengeReview({ phase = 'reviewing' }) {
  if (!phase) return null;
  const isVerdict = phase === 'confirmed' || phase === 'overturned';
  const verdictColor = phase === 'overturned' ? '#10b981' : '#dc2626';
  const verdictText = phase === 'overturned' ? 'CALL OVERTURNED — SAFE!' : 'CALL STANDS — OUT!';
  return (
    <g>
      {/* Translucent dark panel covering the upper field area so the verdict pops */}
      <rect x={120} y={140} width={400} height={130} rx={10} ry={10} fill="rgba(15,23,42,0.78)" stroke="#475569" strokeWidth={1.5}>
        <animate attributeName="opacity" from="0" to="1" dur="0.25s" fill="freeze" />
      </rect>
      {/* "UNDER REVIEW" header label */}
      <text x={320} y={170} textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="sans-serif" fill="#e2e8f0" letterSpacing="2">
        UNDER REVIEW
      </text>
      {/* Sub-label: "MANAGER CHALLENGE — PLAY AT FIRST" */}
      <text x={320} y={186} textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="sans-serif" fill="#94a3b8" letterSpacing="1">
        MANAGER CHALLENGE — PLAY AT FIRST
      </text>
      {!isVerdict && (
        // Spinning indicator during reviewing phase — three rotating dots
        <g transform="translate(320,222)">
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.9s" repeatCount="indefinite" />
            <circle cx={-16} cy={0} r={3.6} fill="#60a5fa" opacity={0.95} />
            <circle cx={0} cy={0} r={3.6} fill="#60a5fa" opacity={0.6} />
            <circle cx={16} cy={0} r={3.6} fill="#60a5fa" opacity={0.3} />
          </g>
        </g>
      )}
      {!isVerdict && (
        <text x={320} y={252} textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#cbd5e1" fontStyle="italic">
          Reviewing the play at first...
        </text>
      )}
      {isVerdict && (
        // Verdict box — sharp red or emerald banner
        <g>
          <rect x={150} y={205} width={340} height={42} rx={6} ry={6} fill={verdictColor} stroke="#fff" strokeWidth={1.5}>
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" />
          </rect>
          <text x={320} y={232} textAnchor="middle" fontSize="14" fontWeight="900" fontFamily="sans-serif" fill="#fff" letterSpacing="1.2">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" />
            {verdictText}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * FOUL BALL INTO STANDS — fan grabs a souvenir (Idea #81)
 * Small fan figure standing in the stands area, raises both arms overhead, and
 * a baseball lands in his hands. Ball arcs in from the field, the fan reaches
 * up at the moment of catch, and a "SOUVENIR!" text floats up and fades.
 *
 * Position is provided by the parent (anchored to a stands-area coordinate
 * scaled to the foul direction the batter naturally pulls). Pure cosmetic —
 * the foul ball still counts as a strike per the existing engine logic.
 */
// Hit-by-pitch impact effect (Idea #88) — small dust-puff cloud that erupts
// at the body location where the pitch struck the batter, plus a brief floating
// "OUCH!" text. Three small puffs expand outward over 600ms with staggered
// begin times, then a ricochet ball line indicating the ball bouncing away
// from the contact point. Pure cosmetic — fires alongside the batter recoil
// pose. Position is anchored to the batter's box, with `bodyPart` driving
// where on the body the impact lands (elbow, back, foot, etc.).
function HbpImpact({ x, y, side = 'R', bodyPart = 'elbow' }) {
  if (x == null || y == null) return null;
  const f = side === 'L' ? -1 : 1;
  // Map body parts to vertical offsets relative to the batter's center
  // (negative = upper body, positive = lower body)
  const partOffset = {
    elbow: -2,
    shoulder: -4,
    back: -1,
    hip: 4,
    leg: 8,
    foot: 12,
    knee: 7,
  }[bodyPart] || 0;
  const ix = x + (-3 * f); // impact slightly toward inside of batter
  const iy = y + partOffset;
  return (
    <g>
      {/* Three expanding dust puffs at the impact point */}
      {[0, 1, 2].map(i => {
        const angle = -90 + (i - 1) * 35; // fan upward and to the sides
        const dx = Math.cos(angle * Math.PI / 180) * 4;
        const dy = Math.sin(angle * Math.PI / 180) * 4;
        return (
          <circle key={`puff-${i}`} cx={ix} cy={iy} r={1.2} fill="#d4c4a8" opacity={0.85}>
            <animate attributeName="r" values="1.2;3.6;5.0" keyTimes="0;0.5;1" dur="0.6s"
              begin={`${i * 0.04}s`} fill="freeze" />
            <animate attributeName="cx" values={`${ix};${ix + dx};${ix + dx * 1.5}`} keyTimes="0;0.5;1" dur="0.6s"
              begin={`${i * 0.04}s`} fill="freeze" />
            <animate attributeName="cy" values={`${iy};${iy + dy};${iy + dy * 1.5}`} keyTimes="0;0.5;1" dur="0.6s"
              begin={`${i * 0.04}s`} fill="freeze" />
            <animate attributeName="opacity" values="0.85;0.55;0" keyTimes="0;0.5;1" dur="0.6s"
              begin={`${i * 0.04}s`} fill="freeze" />
          </circle>
        );
      })}
      {/* Ricochet ball — bounces off the body, tumbles toward the dirt at
          batter's feet. Small white dot with a brief streak of motion. */}
      <circle cx={ix} cy={iy} r={1.6} fill="#fff" stroke="#c00" strokeWidth={0.4} opacity={0.95}>
        <animate attributeName="cx" values={`${ix};${ix + 6 * f};${ix + 14 * f};${ix + 18 * f}`}
          keyTimes="0;0.3;0.7;1" dur="0.85s" fill="freeze" />
        <animate attributeName="cy" values={`${iy};${iy - 3};${iy + 6};${iy + 14}`}
          keyTimes="0;0.3;0.7;1" dur="0.85s" fill="freeze" />
        <animate attributeName="opacity" values="0.95;0.95;0.6;0" keyTimes="0;0.5;0.8;1" dur="0.85s" fill="freeze" />
      </circle>
      {/* "OUCH!" text floats up briefly after the impact */}
      <text x={x + 4 * f} y={y - 12} textAnchor="middle" fontSize="7" fontWeight="bold"
        fontFamily="sans-serif" fill="#fbbf24" stroke="#000" strokeWidth={0.4} paintOrder="stroke" opacity={0}>
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.2;0.35;0.75;1" dur="1.2s" fill="freeze" />
        <animate attributeName="y" values={`${y - 12};${y - 12};${y - 22}`} keyTimes="0;0.35;1" dur="1.2s" fill="freeze" />
        OUCH!
      </text>
    </g>
  );
}

function FanSouvenirCatch({ x, y }) {
  if (x == null || y == null) return null;
  // Fan body sits at (x, y). Ball arrives from above-and-toward-field direction
  // and lands at the fan's raised hands (y - 8).
  return (
    <g>
      {/* Ball arcing in from the field — fades in at start, lands at fan hands */}
      <circle cx={x + 22} cy={y + 26} r={2.5} fill="#fff" stroke="#c00" strokeWidth={0.5} opacity={0}>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.7;1" dur="1.2s" fill="freeze" />
        <animate attributeName="cx" values={`${x + 22};${x + 12};${x + 4};${x}`} keyTimes="0;0.4;0.7;1" dur="0.7s" fill="freeze" />
        <animate attributeName="cy" values={`${y + 26};${y + 4};${y - 4};${y - 8}`} keyTimes="0;0.4;0.7;1" dur="0.7s" fill="freeze" />
      </circle>
      {/* Fan silhouette with raised arms — appears just before ball arrives */}
      <g opacity={0}>
        <animate attributeName="opacity" values="0;1;1" keyTimes="0;0.25;1" dur="1.5s" fill="freeze" />
        {/* Body / torso */}
        <rect x={x - 3} y={y} width={6} height={9} fill="#1e3a5f" />
        {/* Head */}
        <circle cx={x} cy={y - 3} r={2.6} fill="#f5d0a0" stroke="#000" strokeWidth={0.3} />
        {/* Cap brim */}
        <path d={`M${x - 3},${y - 4.5} Q${x},${y - 6.5} ${x + 3},${y - 4.5}`} fill="#1e3a5f" stroke="#000" strokeWidth={0.25} />
        {/* Both arms raised overhead — first low, then up to catch the ball */}
        <line x1={x - 2} y1={y + 1} x2={x - 4} y2={y - 8} stroke="#1e3a5f" strokeWidth={1.8} strokeLinecap="round">
          <animate attributeName="x2" values={`${x - 4};${x - 2}`} keyTimes="0;1" dur="0.5s" begin="0.3s" fill="freeze" />
          <animate attributeName="y2" values={`${y - 8};${y - 10}`} keyTimes="0;1" dur="0.5s" begin="0.3s" fill="freeze" />
        </line>
        <line x1={x + 2} y1={y + 1} x2={x + 4} y2={y - 8} stroke="#1e3a5f" strokeWidth={1.8} strokeLinecap="round">
          <animate attributeName="x2" values={`${x + 4};${x + 2}`} keyTimes="0;1" dur="0.5s" begin="0.3s" fill="freeze" />
          <animate attributeName="y2" values={`${y - 8};${y - 10}`} keyTimes="0;1" dur="0.5s" begin="0.3s" fill="freeze" />
        </line>
        {/* Hands ready to catch */}
        <circle cx={x - 2} cy={y - 9} r={1.2} fill="#f5d0a0" />
        <circle cx={x + 2} cy={y - 9} r={1.2} fill="#f5d0a0" />
      </g>
      {/* Two neighboring "background" fans cheering, smaller and dimmer */}
      <g opacity={0.55}>
        <animate attributeName="opacity" values="0;0.55;0.55" keyTimes="0;0.3;1" dur="1.5s" fill="freeze" />
        {[-9, 9].map((dx, i) => (
          <g key={`bgfan-${i}`} transform={`translate(${x + dx},${y + 1})`}>
            <rect x={-2} y={2} width={4} height={6} fill="#475569" />
            <circle cx={0} cy={-1} r={2} fill="#f5d0a0" />
            <line x1={-1.5} y1={3} x2={-2.5} y2={-3} stroke="#475569" strokeWidth={1.4} strokeLinecap="round" />
            <line x1={1.5} y1={3} x2={2.5} y2={-3} stroke="#475569" strokeWidth={1.4} strokeLinecap="round" />
          </g>
        ))}
      </g>
      {/* "SOUVENIR!" text floating up and fading after the catch */}
      <text x={x} y={y - 16} textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="sans-serif" fill="#fbbf24" stroke="#000" strokeWidth={0.4} paintOrder="stroke" opacity={0}>
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.45;0.55;0.85;1" dur="1.6s" fill="freeze" />
        <animate attributeName="y" values={`${y - 16};${y - 16};${y - 32}`} keyTimes="0;0.5;1" dur="1.6s" fill="freeze" />
        SOUVENIR!
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
 * CROWD WAVE (Backlog #78)
 * Atmospheric "the wave" rolling across the stadium stands during half-inning
 * transitions in mid-innings. A row of stylized fan silhouettes pops up
 * sequentially left-to-right, each fan rising ~8px and back over ~420ms with
 * staggered begin times so you see a clean wave traveling across the upper
 * stands. The full wave traverses the stadium twice for ~3.6s, dimming
 * slightly in night mode to read as flood-lit rather than daylight-bright.
 *
 * Purely cosmetic — no gameplay effect. Trigger conditions: half-inning
 * transitions in innings 4-7 inclusive (kept off the 7th inning stretch
 * frame so the two animations don't visually compete), 25% per eligible
 * transition, never during the bottom of the 9th+ where everyone's
 * focused on the game.
 */
function CrowdWave({ visible, isNightGame = false }) {
  if (!visible) return null;
  // 18 fan clusters spread across the stands area above the field.
  // Each cluster is a small group of three "head" dots with a torso block.
  const N = 18;
  const startX = 70;
  const endX = 550;
  const spacing = (endX - startX) / (N - 1);
  const baseY = 56;             // Resting y for the cluster (top of stands)
  const wavePeak = 9;           // How high each cluster rises during the wave
  const totalDur = 3.6;         // Full animation length, two passes left-to-right
  const passDur = totalDur / 2; // Each pass lasts half the total
  // Random palette of hat / shirt colors so the crowd reads as a mosaic of fans.
  const hatPalette = ['#fbbf24', '#3b82f6', '#dc2626', '#f97316', '#22c55e', '#a855f7', '#facc15', '#06b6d4', '#fff'];
  const skinTone = '#f5d4a8';
  const opacity = isNightGame ? 0.85 : 1;
  return (
    <g opacity={opacity}>
      {/* "WAVE!" banner that fades in for the first ~300ms then sticks while the wave runs */}
      <g transform="translate(310, 38)">
        <rect x={-32} y={-7} width={64} height={14} rx={3} fill="#0b1a33" stroke="#fbbf24" strokeWidth={0.7} opacity={0.9}>
          <animate attributeName="opacity" values="0;0.92;0.92;0" keyTimes="0;0.1;0.85;1" dur={`${totalDur}s`} fill="freeze" />
        </rect>
        <text x={0} y={2.4} textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">
          🌊 THE WAVE!
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={`${totalDur}s`} fill="freeze" />
        </text>
      </g>
      {Array.from({ length: N }, (_, i) => {
        const x = startX + i * spacing;
        const hatColor = hatPalette[i % hatPalette.length];
        // Each cluster's lift starts when the wave front reaches it. Two passes
        // means each cluster fires twice, at i/N during pass 1 and (i+0)/N+0.5
        // during pass 2 (relative to totalDur).
        const beg1 = (i / N) * passDur;
        const beg2 = passDur + (i / N) * passDur;
        const liftDur = 0.42;
        return (
          <g key={`crowd-wave-${i}`} transform={`translate(${x},${baseY})`}>
            {/* Animated lift transform — fans rise then sit back down */}
            <g>
              <animateTransform attributeName="transform" type="translate"
                values={`0 0;0 ${-wavePeak};0 0`} keyTimes="0;0.5;1"
                begin={`${beg1}s;${beg2}s`} dur={`${liftDur}s`} fill="remove" />
              {/* Torso */}
              <rect x={-3} y={0} width={6} height={5} rx={1} fill={hatColor} opacity={0.95} />
              {/* Head */}
              <circle cx={0} cy={-2.6} r={1.7} fill={skinTone} />
              {/* Cap */}
              <path d={`M ${-1.9} -3.5 Q 0 -5.2 ${1.9} -3.5 L ${2.2} -2.6 L ${-2.2} -2.6 Z`} fill={hatColor} opacity={0.95} />
              {/* Raised arms — only visible during the lift via simple opacity sync */}
              <line x1={-2.5} y1={-1.5} x2={-4} y2={-5.5} stroke={skinTone} strokeWidth={0.9} strokeLinecap="round">
                <animate attributeName="opacity" values="0;1;0" keyTimes="0;0.5;1"
                  begin={`${beg1}s;${beg2}s`} dur={`${liftDur}s`} fill="remove" />
              </line>
              <line x1={2.5} y1={-1.5} x2={4} y2={-5.5} stroke={skinTone} strokeWidth={0.9} strokeLinecap="round">
                <animate attributeName="opacity" values="0;1;0" keyTimes="0;0.5;1"
                  begin={`${beg1}s;${beg2}s`} dur={`${liftDur}s`} fill="remove" />
              </line>
            </g>
          </g>
        );
      })}
    </g>
  );
}

/**
 * RALLY CAPS (Backlog #149)
 * Classic fan superstition: when the batting team is rallying late (7th inning
 * or later) while trailing, the crowd turns their caps inside-out for good luck.
 * A row of stylized fans across the upper stands wear upturned "rally caps"
 * (brim flipped up, distinct from the brim-down caps used in the wave) and bob
 * with nervous, staggered energy while a pulsing "🧢 RALLY CAPS!" banner hovers
 * above. Visibility is derived LIVE from game state (rally brewing + batting
 * team trailing + 7th inning or later), so the caps appear and clear on their
 * own as the situation changes — no timers, no state cell. Purely cosmetic; no
 * gameplay effect. Dimmed slightly in night mode to read as flood-lit.
 */
function RallyCaps({ active, color = '#fbbf24', isNightGame = false }) {
  if (!active) return null;
  const N = 16;
  const startX = 80;
  const endX = 540;
  const spacing = (endX - startX) / (N - 1);
  const baseY = 54;                 // Resting y for each fan cluster (upper stands)
  const skinTone = '#f5d4a8';
  // A mosaic of cap colors so the crowd reads as a real mixed-fan upper deck.
  const capPalette = ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#06b6d4', '#f97316', '#fff'];
  const opacity = isNightGame ? 0.85 : 1;
  return (
    <g opacity={opacity}>
      {/* Pulsing "RALLY CAPS!" banner — breathes continuously while active. */}
      <g transform="translate(310, 36)">
        <rect x={-46} y={-7} width={92} height={14} rx={3} fill="#0b1a33" stroke={color} strokeWidth={0.8} opacity={0.92}>
          <animate attributeName="opacity" values="0.62;0.96;0.62" dur="1.1s" repeatCount="indefinite" />
        </rect>
        <text x={0} y={2.4} textAnchor="middle" fill={color} fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">
          🧢 RALLY CAPS!
        </text>
      </g>
      {Array.from({ length: N }, (_, i) => {
        const x = startX + i * spacing;
        const capColor = capPalette[i % capPalette.length];
        // Stagger the nervous bob so the row shimmers rather than moving in lockstep.
        const bobDur = 0.7 + (i % 4) * 0.12;
        const beginOff = (i % 5) * 0.13;
        return (
          <g key={`rally-cap-${i}`} transform={`translate(${x},${baseY})`}>
            <g>
              <animateTransform attributeName="transform" type="translate"
                values="0 0;0 -2.4;0 0" keyTimes="0;0.5;1"
                dur={`${bobDur}s`} begin={`${beginOff}s`} repeatCount="indefinite" />
              {/* Torso */}
              <rect x={-3} y={0} width={6} height={5} rx={1} fill={capColor} opacity={0.95} />
              {/* Head */}
              <circle cx={0} cy={-2.6} r={1.7} fill={skinTone} />
              {/* Inside-out "rally cap" — the wave's brim-down cap shape flipped
                  vertically so the brim sticks UP and the crown curves down over
                  the head. The flipped brim is the visual tell of a rally cap. */}
              <path d={`M ${-1.9} -4.5 Q 0 -2.8 ${1.9} -4.5 L ${2.2} -5.4 L ${-2.2} -5.4 Z`} fill={capColor} opacity={0.95} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

/**
 * GROUNDS CREW DRAGGING THE INFIELD (Backlog #90)
 * Atmospheric mid-game tradition shown during the half-inning transition between
 * the top and bottom of the 5th inning. Three small grounds-crew silhouettes pull
 * weighted drag-mats / rakes diagonally across the infield dirt while three
 * trailing dust-puff plumes drift behind each one. Lasts ~3.5s before play
 * resumes. Pure cosmetic — no gameplay effect. Dims slightly in night mode to
 * read as flood-lit rather than daylight-bright.
 */
function GroundsCrew({ visible, isNightGame = false }) {
  if (!visible) return null;
  // Three crew members walk diagonally from the right side of the infield to
  // the left side, dragging mats behind them. Each starts at a slightly
  // different infield Y so the three rakes draw parallel lines across the dirt.
  // Coordinates are tuned to the existing F.HP / F.B2 layout (HP ~ y=355, B2 ~ y=255).
  const crew = [
    { startX: 360, startY: 248, endX: 200, endY: 268, beg: 0,    color: '#1f2937' },
    { startX: 380, startY: 278, endX: 220, endY: 298, beg: 0.18, color: '#1f2937' },
    { startX: 400, startY: 308, endX: 240, endY: 328, beg: 0.36, color: '#1f2937' },
  ];
  const dur = 3.0;       // walking sweep duration (seconds)
  const totalDur = 3.5;  // overall visibility window
  const opacity = isNightGame ? 0.78 : 1;
  return (
    <g opacity={opacity}>
      {/* "GROUNDS CREW" banner that fades in then out */}
      <g transform="translate(310, 200)">
        <rect x={-44} y={-7} width={88} height={14} rx={3} fill="#3a2e1a" stroke="#fbbf24" strokeWidth={0.7} opacity={0.92}>
          <animate attributeName="opacity" values="0;0.92;0.92;0" keyTimes="0;0.1;0.85;1" dur={`${totalDur}s`} fill="freeze" />
        </rect>
        <text x={0} y={2.4} textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">
          🧹 GROUNDS CREW
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={`${totalDur}s`} fill="freeze" />
        </text>
      </g>
      {crew.map((c, i) => {
        // Each crew member animates from start to end via translate offsets.
        const dx = c.endX - c.startX;
        const dy = c.endY - c.startY;
        // Three trailing dust puffs per crew member, staggered along the path.
        return (
          <g key={`gc-${i}`}>
            {/* Crew member silhouette + drag mat */}
            <g transform={`translate(${c.startX},${c.startY})`}>
              <animateTransform attributeName="transform" type="translate"
                values={`${c.startX} ${c.startY};${c.endX} ${c.endY}`}
                keyTimes="0;1" begin={`${c.beg}s`} dur={`${dur}s`} fill="freeze" />
              {/* Walking arm-bobble — body sways gently as they walk */}
              <g>
                <animateTransform attributeName="transform" type="translate"
                  values="0 0;0 -0.8;0 0" keyTimes="0;0.5;1"
                  begin={`${c.beg}s`} dur="0.36s" repeatCount="8" />
                {/* Torso */}
                <rect x={-2.2} y={-2} width={4.4} height={5} rx={0.8} fill={c.color} opacity={0.96} />
                {/* Head */}
                <circle cx={0} cy={-4} r={1.4} fill="#e6c79a" />
                {/* Cap */}
                <path d={`M -1.6 -4.8 Q 0 -6 1.6 -4.8 L 1.9 -4 L -1.9 -4 Z`} fill="#1e3a5f" opacity={0.92} />
                {/* Trailing arm holding rake handle */}
                <line x1={1.6} y1={-1} x2={5.5} y2={2.5} stroke="#e6c79a" strokeWidth={0.9} strokeLinecap="round" />
                {/* Rake / drag mat behind them — wood handle + brown mat */}
                <line x1={5.5} y1={2.5} x2={9.5} y2={4} stroke="#7a5a32" strokeWidth={1.2} strokeLinecap="round" />
                <rect x={9} y={3} width={5} height={2.2} rx={0.4} fill="#5a3a18" opacity={0.85} />
                <rect x={9} y={3} width={5} height={2.2} rx={0.4} fill="none" stroke="#3e2a10" strokeWidth={0.4} />
                {/* Forward arm — front-leading swing */}
                <line x1={-1.6} y1={-1} x2={-3.4} y2={1.5} stroke="#e6c79a" strokeWidth={0.9} strokeLinecap="round" />
                {/* Legs — alternating stride */}
                <line x1={-1} y1={3} x2={-1.6} y2={6} stroke={c.color} strokeWidth={1.2} strokeLinecap="round" />
                <line x1={1} y1={3} x2={1.6} y2={6} stroke={c.color} strokeWidth={1.2} strokeLinecap="round" />
              </g>
            </g>
            {/* Three trailing dust puffs along the diagonal path — drift up and fade */}
            {[0, 1, 2].map(p => {
              // Each puff appears at a fraction of the path, behind the rake.
              const frac = 0.3 + p * 0.22;
              const px = c.startX + dx * frac + 11; // offset back behind the rake
              const py = c.startY + dy * frac + 4;
              return (
                <circle key={`gc-${i}-p-${p}`}
                  cx={px} cy={py} r={1}
                  fill="#c9b59a" opacity={0}>
                  <animate attributeName="r" values="1;3.6;5.2"
                    keyTimes="0;0.5;1"
                    begin={`${c.beg + dur * frac}s`} dur="0.7s" fill="freeze" />
                  <animate attributeName="opacity" values="0;0.55;0"
                    keyTimes="0;0.4;1"
                    begin={`${c.beg + dur * frac}s`} dur="0.7s" fill="freeze" />
                  <animate attributeName="cy" values={`${py};${py - 4}`}
                    keyTimes="0;1"
                    begin={`${c.beg + dur * frac}s`} dur="0.7s" fill="freeze" />
                </circle>
              );
            })}
          </g>
        );
      })}
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

function BaseballField({ bases, outs = 0, defColor, offColor, ballPos, ballTrail = [], pitchPhase, batterPhase, showFW, fwKey, movingRunners, movingFielder, batterSide = 'R', platePlay = null, isPlayoff = false, pitchingChange = null, homeColor = '#b91c1c', awayColor = '#1e40af', homeKs = 0, awayKs = 0, homeKHistory = [], awayKHistory = [], isNightGame = false, webGem = null, errorBobble = null, umpirePhase = 'idle', crowdReactions = [], pitchLocations = [], inning = 1, catcherSigns = 0, bullpenActive = false, reliefColor = '#1e40af', moundVisit = null, brokenBat = null, pickoffDive = null, shiftType = null, leadCaution = 1, robbedHRLeap = null, bangBangPlay = null, sunFlare = null, crowdWaveActive = false, crowdWaveKey = 0, challengeReview = null, fanCatch = null, coachSignKey = 0, rosinAct = null, rosinKey = 0, hbpImpact = null, groundsCrewActive = false, groundsCrewKey = 0, divingStop = null, ejectionAct = null, ejectionUmpireActive = false, flyingHelmet = null, maskToss = null, catcherLookingUp = false, pitcherTipCap = false, pitcherShakeOff = false, catcherBlocking = false, pitcherBrowWipe = false, pitcherCheckRunner = false, f1bStretch = null, umpire1BPhase = 'idle', batBoyAct = null, chokeUp = false, fistPump = null, catcherFraming = false, pitcherHeadNod = false, freshBallToss = null, infieldIn = false, curtainCall = null, pitcherCover = null, walkOffMob = null, highFiveLine = null, rallyCaps = null }) {
  const hp = F.HP, isLefty = batterSide === 'L';
  // Defensive shift positions — SS and 2B reposition for pull-hitting sluggers.
  // The shift is cosmetic: it only affects where the static fielder SVGs are drawn.
  // Fielder animations (groundouts, flyouts, etc.) still emanate from the original
  // F.SS / F.F2B coordinates so the existing animation logic is unchanged.
  const ssPosBase = shiftType && SHIFT_POS[shiftType] ? SHIFT_POS[shiftType].SS : F.SS;
  const f2bPosBase = shiftType && SHIFT_POS[shiftType] ? SHIFT_POS[shiftType].F2B : F.F2B;
  // OF shift positions (Backlog #136) — when a slugger is at the plate the
  // three OFs slide toward his pull side just like the infield does. Lefty
  // pull: LF cheats toward CF, CF cheats toward RF, RF hugs the line. Righty
  // pull: mirrored — RF cheats toward CF, CF cheats toward LF, LF hugs the
  // line. Pure render-position swap; animation paths still emanate from
  // F.LF/F.CF/F.RF coordinates so all existing fly-ball / chase logic works.
  const lfPos = shiftType && SHIFT_POS[shiftType] ? SHIFT_POS[shiftType].LF : F.LF;
  const cfPos = shiftType && SHIFT_POS[shiftType] ? SHIFT_POS[shiftType].CF : F.CF;
  const rfPos = shiftType && SHIFT_POS[shiftType] ? SHIFT_POS[shiftType].RF : F.RF;
  // Infield drawn in (Backlog #138) — late-inning situations with a runner on
  // 3rd and < 2 outs in a close game, the four infielders render ~14-18px
  // closer to home plate. Real MLB tactical positioning to "cut down the run
  // at the plate" — trades range for a faster throw home. Pure cosmetic
  // render-position shift; all fielder animation paths (groundouts, flyouts,
  // diving stops, comebackers, etc.) still emanate from the standard
  // F.F1B / F.F2B / F.SS / F.F3B coordinates per the existing animation
  // system, so gameplay outcomes and fielding distributions are completely
  // unchanged. Offsets are calibrated per position so each IF reads as
  // visibly "in" but doesn't break the natural diamond geometry. Composes
  // with the existing shift (#66/#136) by applying the draw-in delta to
  // whichever base position is already rendering — so a sluggish pull-side
  // alignment + drawn-in produces both effects simultaneously.
  const ssDIin = infieldIn ? { x: 5, y: 18 } : { x: 0, y: 0 };
  const f2bDIin = infieldIn ? { x: -5, y: 18 } : { x: 0, y: 0 };
  const f3bDIin = infieldIn ? { x: 9, y: 13 } : { x: 0, y: 0 };
  const f1bDIin = infieldIn ? { x: -9, y: 13 } : { x: 0, y: 0 };
  const ssPos = { x: ssPosBase.x + ssDIin.x, y: ssPosBase.y + ssDIin.y };
  const f2bPos = { x: f2bPosBase.x + f2bDIin.x, y: f2bPosBase.y + f2bDIin.y };
  const f3bPosIn = { x: F.F3B.x + f3bDIin.x, y: F.F3B.y + f3bDIin.y };
  const f1bPosIn = { x: F.F1B.x + f1bDIin.x, y: F.F1B.y + f1bDIin.y };
  const batterX = isLefty ? hp.x + 25 : hp.x - 25;
  // Pitcher works from the stretch (set position) whenever a runner is on base —
  // a fundamental real-baseball cue (Backlog #74). Pickoff throws temporarily
  // suppress the stretch idle pose because the throwing animation handles its
  // own framing. Pure cosmetic; release point and mechanics are unchanged.
  const fromStretch = Array.isArray(bases) && bases.some(r => r);
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
        {/* Crowd wave (Backlog #78) — atmospheric "the wave" rolling across the
            stands during mid-inning half-inning transitions. Keyed so each
            trigger restarts the SVG animation cleanly. */}
        <g key={`crowd-wave-${crowdWaveKey}`}>
          <CrowdWave visible={crowdWaveActive} isNightGame={isNightGame} />
        </g>
        {/* Rally caps (Backlog #149) — fans flip their caps inside-out when the
            batting team is rallying late while trailing. Visibility is derived
            live from game state (passed as the `rallyCaps` object or null). */}
        <RallyCaps active={!!rallyCaps} color={rallyCaps ? rallyCaps.color : '#fbbf24'} isNightGame={isNightGame} />
        {/* Grounds crew dragging the infield (Backlog #90) — atmospheric
            tradition between top and bottom of the 5th inning. Keyed so each
            trigger restarts the SVG animation cleanly. */}
        <g key={`grounds-crew-${groundsCrewKey}`}>
          <GroundsCrew visible={groundsCrewActive} isNightGame={isNightGame} />
        </g>
        <OutOfTownTicker isNightGame={isNightGame} />
        <BullpenWarmup visible={bullpenActive} reliefColor={reliefColor} isNightGame={isNightGame} />
        <Dugouts homeColor={homeColor} awayColor={awayColor} />
        {/* On-deck batter (Backlog #110) — the next-up hitter takes slow
            practice swings in the on-deck circle on the batting team's side.
            Home team batting → on-deck near the home dugout (3B side, x≈165);
            Away team batting → on-deck near the away dugout (1B side, x≈455).
            Pure cosmetic — completes the pre-pitch story alongside the
            coaches, catcher signs, and runner leadoffs. We compare offColor
            to homeColor to know which team is batting without needing an
            extra prop (the field component already receives both). */}
        {(() => {
          const homeBatting = offColor === homeColor;
          const odX = homeBatting ? 165 : 455;
          const odY = 462;
          const odFacing = homeBatting ? 'R' : 'L';
          return <SVGOnDeckBatter x={odX} y={odY} color={offColor} facing={odFacing} />;
        })()}
        <StrikeoutKs kCount={homeKs} kHistory={homeKHistory} side="home" />
        <StrikeoutKs kCount={awayKs} kHistory={awayKHistory} side="away" />
        {pitchingChange && <SVGManager x={pitchingChange.x} y={pitchingChange.y} progress={pitchingChange.progress} />}
        {/* Manager ejection (Backlog #95) — manager walks from his dugout to
            home plate to argue, gets tossed, then walks back. Uses SVGManager
            with phase='argue' during the home-plate argument. */}
        {ejectionAct && <SVGManager x={ejectionAct.x} y={ejectionAct.y} progress={ejectionAct.progress} phase={ejectionAct.phase === 'argue' ? 'argue' : 'walk'} />}
        {/* Bat boy retrieving the bat (Backlog #121) — small atmospheric
            figure that emerges from the batting team's dugout after a
            strikeout, jogs to home plate, picks up the bat, jogs back.
            Pure cosmetic. */}
        {batBoyAct && <SVGBatBoy x={batBoyAct.x} y={batBoyAct.y} color={batBoyAct.color} phase={batBoyAct.phase} progress={batBoyAct.progress} />}
        {/* Curtain call (Backlog #141) — the hero emerges from the home dugout
            to wave his helmet to the roaring crowd after a huge home run. */}
        {curtainCall && <SVGCurtainCall x={curtainCall.x} y={curtainCall.y} color={curtainCall.color} />}
        {/* Walk-off dog pile (Backlog #145) — the home team mobs the hero at
            home plate with a Gatorade dump after a walk-off win. */}
        {walkOffMob && <SVGWalkOffMob x={walkOffMob.x} y={walkOffMob.y} color={walkOffMob.color} />}
        {highFiveLine && <SVGHighFiveLine x={highFiveLine.x} y={highFiveLine.y} color={highFiveLine.color} />}
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
        {movingFielder?.id !== 'LF' && <SVGFielder x={lfPos.x} y={lfPos.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'CF' && <SVGFielder x={cfPos.x} y={cfPos.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'RF' && <SVGFielder x={rfPos.x} y={rfPos.y} color={defColor} glove="left" />}
        {movingFielder?.id !== 'F3B' && <SVGFielder x={f3bPosIn.x} y={f3bPosIn.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'SS' && <SVGFielder x={ssPos.x} y={ssPos.y} color={defColor} glove="right" />}
        {movingFielder?.id !== 'F2B' && <SVGFielder x={f2bPos.x} y={f2bPos.y} color={defColor} glove="left" />}
        {/* First baseman holds the runner (Backlog #106) — when there's a runner on 1B
            with fewer than 2 outs (the classic "holding the runner" scenario), the 1B
            renders pressed up against the bag with his foot on first, glove ready for
            a pickoff throw. With 2 outs the 1B plays at his normal depth — real-life
            convention since holding the runner with 2 outs sacrifices defensive coverage
            for a base that doesn't matter. Pure cosmetic; complements the existing
            runner-leadoff animation (Backlog #70) to complete the pre-pitch story. */}
        {movingFielder?.id !== 'F1B' && (
          (bases[0] && outs < 2)
            ? <SVGFielder x={F.B1.x - 4} y={F.B1.y - 2} color={defColor} glove="left" />
            : <SVGFielder x={f1bPosIn.x} y={f1bPosIn.y} color={defColor} glove="left" />
        )}
        {movingFielder?.id !== 'C' && !moundVisit && <SVGCatcher x={F.C.x} y={F.C.y - 8} color={defColor} signs={catcherSigns} lookingUp={catcherLookingUp} blocking={catcherBlocking} framing={catcherFraming} />}
        {/* Third base coach giving signs (Idea #82) — animated through cap/ear/chest/belt
            during the pitcher's windup. Pure cosmetic, lives in foul territory just
            outside 3B in the coach's box. The defensive team's color is never used here
            — coaches dress in the BATTING team's colors (offColor). */}
        <SVGThirdBaseCoach x={F.B3.x - 22} y={F.B3.y + 16} color={offColor} phase={pitchPhase} signKey={coachSignKey} />
        {/* First base coach (Backlog #92) — visual companion to the 3B coach.
            Clapping motion during the pitcher's windup. Lives in the foul-territory
            coach's box just outside 1B, mirrored on the opposite side of the diamond. */}
        <SVGFirstBaseCoach x={F.B1.x + 22} y={F.B1.y + 16} color={offColor} phase={pitchPhase} signKey={coachSignKey} />
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
        {/* Pitcher covers first base (Backlog #143) — the pitcher sprinting from
            the mound to cover the bag on a 3-1 putout. Rendered as a hustling
            fielder sprite; the mound pitcher render below is suppressed while
            this is active so only one pitcher figure is ever on screen. */}
        {pitcherCover && <SVGFielder x={pitcherCover.x} y={pitcherCover.y} color={pitcherCover.color} isMoving={true} glove="left" />}
        {/* Rosin bag pickup (Backlog #84) — when active, the moving pitcher
            silhouette is rendered HERE (with the bag and chalk puff). The
            static pitcher SVG below is suppressed during the cycle. */}
        {rosinAct && <RosinBagAct x={F.P.x} y={F.P.y - 14} color={defColor} rosinKey={rosinKey} />}
        {!rosinAct && !pitcherCover && <SVGPitcher key={fistPump ? `fp-${fistPump.ts}` : (pitcherHeadNod ? 'p-nod' : 'p-std')} x={F.P.x} y={F.P.y - 14} color={fistPump?.color || defColor} phase={fistPump ? 'fistPump' : (pitcherTipCap ? 'tipCap' : (pitcherBrowWipe ? 'wipeBrow' : (pitcherCheckRunner ? 'checkRunner' : pitchPhase)))} fromStretch={fromStretch} headShake={pitcherShakeOff} headNod={pitcherHeadNod} />}
        <SVGUmpire x={umpirePhase === 'plateSweep' ? F.HP.x : (310 + (batterSide === 'L' ? -18 : 18))} y={umpirePhase === 'plateSweep' ? (F.HP.y - 6) : (F.UMP.y - 12)} phase={ejectionUmpireActive ? 'eject' : umpirePhase} />
        {/* First base umpire (Backlog #118) — stationed in foul territory
            just past 1B. Re-keyed by phase so the OUT / SAFE animations
            remount cleanly each trigger (the SMIL <animate> elements need
            a key change to restart from frame 0). Position: x=442 (just
            past F.B1.x=420 toward foul territory), y=312 (slightly above
            the bag line, where a real 1B ump stands). */}
        <SV1BUmpire key={`ump1b-${umpire1BPhase}`} x={F.B1.x + 22} y={F.B1.y - 13} phase={umpire1BPhase} />
        <SVGBatter x={batterX} y={F.HP.y - 5} color={offColor} phase={batterPhase} side={batterSide} chokeUp={chokeUp} />
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
        {/* Fresh ball toss from HP umpire to pitcher (Backlog #135) — fires
            after HRs and fan-grab fouls. Rendered with a fresh key on each
            toss so the SMIL animations remount cleanly and replay from
            frame 0. */}
        {freshBallToss && <FreshBallToss key={`fbt-${freshBallToss.ts}`} from={F.HP} to={{ x: F.P.x, y: F.P.y - 4 }} />}
        {brokenBat && <BrokenBat x={brokenBat.x} y={brokenBat.y} side={brokenBat.side} />}
        {robbedHRLeap && <RobbedHRLeap x={robbedHRLeap.x} y={robbedHRLeap.y} color={robbedHRLeap.color} />}
        {sunFlare && <SunFlare x={sunFlare.x} y={sunFlare.y} />}
        {/* Hit-by-pitch impact effect (Idea #88) — dust puffs, ricochet ball,
            and "OUCH!" text at the contact point. Renders alongside the
            batter's recoil pose. */}
        {hbpImpact && <HbpImpact x={hbpImpact.x} y={hbpImpact.y} side={hbpImpact.side} bodyPart={hbpImpact.bodyPart} />}
        {/* Pickoff dive — runner briefly slides back to 1B, 2B, or 3B
            (Backlog #64, #120, #124). Ball is rendered by ballPos. The `base`
            field on pickoffDive selects which bag the slide-back renders at:
            'B1' (default), 'B2', or 'B3'. The lateral direction flips for 2B
            and 3B so the slide reads naturally — at 1B the runner slides back
            from the lead-off direction (toward 2B) so the body trails
            right-to-left; at 2B the runner slides back from the lead toward 3B
            (mirrored horizontally); at 3B the runner dives back from the lead
            toward HP (mirrored like 2B but anchored on the 3B-side of the
            diamond with a small ox offset that mirrors the 1B offset). */}
        {pickoffDive && (() => {
          const isB2 = pickoffDive.base === 'B2';
          const isB3 = pickoffDive.base === 'B3';
          const bag = isB2 ? F.B2 : (isB3 ? F.B3 : F.B1);
          const ox = isB2 ? 0 : (isB3 ? 6 : -6);
          const oy = isB2 ? 4 : 2;
          // Horizontal flip multiplier — 1B keeps the original orientation;
          // 2B and 3B mirror so the body trails away from the lead direction.
          const f = (isB2 || isB3) ? -1 : 1;
          return (
            <g transform={`translate(${bag.x + ox},${bag.y + oy})`}>
              {/* Sliding diver silhouette pointing toward the bag */}
              <ellipse cx={0} cy={6} rx={8} ry={2} fill="rgba(0,0,0,.18)">
                <animate attributeName="opacity" values="0;0.3;0" dur="0.9s" fill="freeze" />
              </ellipse>
              <line x1={-8 * f} y1={2} x2={6 * f} y2={4} stroke={pickoffDive.color || '#b91c1c'} strokeWidth={2.6} strokeLinecap="round">
                <animate attributeName="x1" values={`${-4 * f};${-10 * f};${-8 * f}`} dur="0.9s" fill="freeze" />
              </line>
              <circle cx={7 * f} cy={2} r={3.2} fill="#f5d0a0" />
              {/* Dust puff */}
              {[0, 1, 2].map(i => (
                <circle key={`pod-${i}`} cx={(-3 - i * 2) * f} cy={5} r={1.2} fill="#d4a574" opacity={0.55}>
                  <animate attributeName="r" from="1" to="3.5" dur="0.9s" fill="freeze" />
                  <animate attributeName="opacity" from="0.55" to="0" dur="0.9s" fill="freeze" />
                  <animate attributeName="cy" from="5" to={5 + (i - 1) * 2} dur="0.9s" fill="freeze" />
                </circle>
              ))}
            </g>
          );
        })()}
        {/* Bang-bang play at first (Backlog #75) — sliding runner overlay timed to the throw */}
        {bangBangPlay && (
          <BangBangPlay x={F.B1.x} y={F.B1.y} color={bangBangPlay.color} />
        )}
        {/* Diving stop by infielder (Backlog #93) — laid-out fielder at the catch point */}
        {divingStop && (
          <DivingStop key={`ds-${divingStop.x}-${divingStop.y}`} x={divingStop.x} y={divingStop.y} color={divingStop.color} dir={divingStop.dir} />
        )}
        {/* First baseman stretch (Backlog #114) — F1B extends fully to receive a
            throw at first base on routine groundouts. Re-keyed by throwFrom so the
            animateTransform / animate elements remount cleanly each trigger. */}
        {f1bStretch && (
          <F1BStretch key={`f1bs-${f1bStretch.throwFrom?.x ?? 0}-${f1bStretch.throwFrom?.y ?? 0}-${f1bStretch.keyId ?? 0}`} x={F.B1.x} y={F.B1.y - 2} color={f1bStretch.color} throwFrom={f1bStretch.throwFrom} />
        )}
        {/* Flying helmet (Backlog #96) — runner's helmet pops off and arcs through
            the air during a hard slide. Re-keyed by x,y so the SVG remounts
            cleanly each trigger and the animateTransform restarts from frame 0. */}
        {flyingHelmet && (
          <FlyingHelmet key={`helm-${flyingHelmet.x}-${flyingHelmet.y}-${flyingHelmet.dir}`} x={flyingHelmet.x} y={flyingHelmet.y} color={flyingHelmet.color} dir={flyingHelmet.dir} />
        )}
        {/* Catcher's mask toss (Backlog #98) — on foulOut outcomes, the catcher
            flings his mask off in foul territory while tracking the popup
            overhead. Re-keyed by x,y,dir so the animateTransform restarts
            cleanly each trigger. */}
        {maskToss && (
          <MaskToss key={`mt-${maskToss.x}-${maskToss.y}-${maskToss.dir}`} x={maskToss.x} y={maskToss.y} dir={maskToss.dir} />
        )}
        {/* Foul ball into stands (Idea #81) — fan reaches up for a souvenir */}
        {fanCatch && (
          <FanSouvenirCatch key={`fan-${fanCatch.x}-${fanCatch.y}`} x={fanCatch.x} y={fanCatch.y} />
        )}
        {/* Manager challenge / replay review (Idea #80) — full-field review overlay */}
        {challengeReview && (
          <ChallengeReview key={`cr-${challengeReview.phase}`} phase={challengeReview.phase} />
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
  // Stadium organ "CHARGE!" fanfare (Backlog #125) — when active, displays a
  // pulsing yellow-on-blue "🎵 CHARGE!" pill in the info bar while the iconic
  // organ riff plays between half-innings. ~20% chance per eligible
  // transition. Pure cosmetic atmospheric flavor — no gameplay effect.
  const [organCharge, setOrganCharge] = useState(false);
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
  // Launch angle (Backlog #118) — Statcast-style "LA: XX°" pill displayed
  // alongside exit velo on contact plays. Auto-clears after 2.5s like exitVelo.
  const [launchAngle, setLaunchAngle] = useState(null);
  // Bat speed (Backlog #122) — Statcast-style "BAT SPEED: XX.X mph" pill
  // displayed alongside exit velo / LA on contact plays. Completes the modern
  // Statcast quartet every broadcast graphic shows in 2024+. Auto-clears
  // after 2.5s like exitVelo so all three contact-play pills disappear together.
  const [batSpeed, setBatSpeed] = useState(null);
  // First-to-third on a single (Backlog #123) — aggressive baserunning badge
  // payload: { batter, runner, team }. Fires when a runner on 1B legs out
  // first-to-third on a single (~18% of single + runner-on-1B-only situations
  // with < 2 outs). Auto-clears after 3.5s.
  const [firstTo3rdBadge, setFirstTo3rdBadge] = useState(null);
  // First base umpire phase (Backlog #118) — 'idle' / 'outCall' / 'safeCall'.
  // Set when a play at first happens (groundout = OUT, infield single /
  // throwing error = SAFE). Auto-clears back to 'idle' after the signal
  // animation completes (~1.2s).
  const [umpire1BPhase, setUmpire1BPhase] = useState('idle');
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
  const [walkUpMusic, setWalkUpMusic] = useState(null); // { name, title, artist } — atmospheric walk-up song marquee
  const [robbedHRBadge, setRobbedHRBadge] = useState(null); // { batter, fielder, team } — "ROBBED AT THE WALL!" info-bar flash
  const [robbedHRLeap, setRobbedHRLeap] = useState(null); // { x, y, color } — fielder leaping at the wall to rob a HR
  const [cycleWatch, setCycleWatch] = useState(null); // { batter: 'name', team: 0|1, completed: bool }
  const [showPostGame, setShowPostGame] = useState(false);
  const [crowdReactions, setCrowdReactions] = useState([]); // floating text bubbles in stands
  const [grooveBadge, setGrooveBadge] = useState(null); // { type: 'groove'|'struggling', team: 'name' }
  const [pitchLocations, setPitchLocations] = useState([]); // K-Zone pitch dots: [{ x, y, type: 'strike'|'ball'|'foul' }]
  const [catcherSigns, setCatcherSigns] = useState(0); // 0 = hidden, 1-4 = number of fingers flashed during windup
  const [firstPitchStrikeBadge, setFirstPitchStrikeBadge] = useState(null); // brief "1ST-PITCH STRIKE" flash, { team: 'name' }
  const [moundVisit, setMoundVisit] = useState(null); // { x, y, progress, phase } — catcher walking to mound
  const [grdBadge, setGrdBadge] = useState(null); // brief "GROUND RULE DOUBLE" badge flash, { team: 0|1 }
  const [pickoffBadge, setPickoffBadge] = useState(null); // brief "PICKOFF!" or "CLOSE AT 1ST" badge, { outcome: 'out'|'safe', team: 0|1, base?: 'B1'|'B2'|'B3', source?: 'pitcher'|'catcher' }
  const [pickoffDive, setPickoffDive] = useState(null); // brief "runner dives back" animation, { color }
  // Cap-tip-to-fan badge (Backlog #133) — after a fan-grab souvenir foul, ~35%
  // of the time the batter tips his cap toward the fan in the stands. Brief
  // emerald badge flashes in the info bar while the gesture plays.
  const [capTipFanBadge, setCapTipFanBadge] = useState(null); // { batter, team } — "🧢 TIPS HIS CAP" badge flash
  // Fresh ball toss from home plate umpire to pitcher (Backlog #135). Fires
  // after HRs and fan-grab fouls when the game ball is "gone" and the umpire
  // reaches into his ball bag for a new one. `freshBallToss` drives a tiny
  // SVG ball arcing from HP → P over ~700ms; `freshBallTossBadge` controls a
  // brief "🥎 NEW BALL" pulse in the info bar.
  const [freshBallToss, setFreshBallToss] = useState(null); // { ts: timestamp } or null
  const [freshBallTossBadge, setFreshBallTossBadge] = useState(false);
  // Infield fly rule (Backlog #140) — flashes an info-bar badge and drives the
  // home-plate umpire's "infield fly — batter out" raised-finger signal on
  // qualifying infield popups (runners on 1st & 2nd, fewer than 2 outs).
  const [infieldFlyBadge, setInfieldFlyBadge] = useState(null); // { batter, fielder, team } or null
  // Curtain call (Backlog #141) — drives the SVGCurtainCall figure (hero
  // emerging from the dugout to wave his helmet to the crowd) and its badge
  // after a huge home run.
  const [curtainCall, setCurtainCall] = useState(null); // { x, y, color } or null
  const [curtainCallBadge, setCurtainCallBadge] = useState(null); // { batter, reason, team } or null
  const [leadCaution, setLeadCaution] = useState(1); // Runner leadoff scale 0..1 — drops after a pickoff throw so the next 1-2 leads read as cautious, then decays back to full.
  const [brokenBat, setBrokenBat] = useState(null); // { x, y, side: 'L'|'R' } — flying bat-barrel piece
  const [passedBallBadge, setPassedBallBadge] = useState(null); // { batter, team } — dropped 3rd strike badge flash
  const [pitchClockBadge, setPitchClockBadge] = useState(null); // { team: 'name', violator: 'pitcher'|'batter' } — modern MLB pitch clock violation flash
  const [bangBangPlay, setBangBangPlay] = useState(null); // { color } — sliding-runner SVG at 1B during a bang-bang groundout
  const [bangBangBadge, setBangBangBadge] = useState(null); // brief "BANG-BANG PLAY" badge flash on close infield outs, { team: 0|1 }
  const [ciBadge, setCiBadge] = useState(null); // Catcher's interference (Backlog #76) — { batter, team: 0|1 }
  const [lostInSunBadge, setLostInSunBadge] = useState(null); // Lost in the sun (Backlog #77) — { batter, fielder, team: 0|1 }
  // Dropped fly ball error badge (Backlog #103) — flashes when a routine fly
  // out is converted to a 2-base error. Tooltip identifies the fielder, the
  // error code (E7/E8/E9), and the batter who reached second on the gaffe.
  const [droppedFlyBadge, setDroppedFlyBadge] = useState(null); // { batter, fielder, errCode, team: 0|1 }
  const [sunFlare, setSunFlare] = useState(null); // { x, y } — gold sun-burst overlay at fielder when ball is lost in the sun
  const [challengeReview, setChallengeReview] = useState(null); // Manager challenge / replay review (Idea #80) — { phase: 'reviewing' | 'confirmed' | 'overturned' }
  const [challengeBadge, setChallengeBadge] = useState(null); // Brief "CHALLENGE!" badge in info bar — { batter, team: 0|1, overturned: bool }
  const [fanCatch, setFanCatch] = useState(null); // Foul ball into stands (Idea #81) — { x, y } anchors a fan-grab SVG in the stands
  // Third base coach giving signs (Idea #82) — coachSignKey forces the SVG to remount
  // each pitch so the sign sequence restarts cleanly with every windup.
  const [coachSignKey, setCoachSignKey] = useState(0);
  // Inside-the-park home run (Idea #83) — pulsing badge in the info bar when a
  // would-be triple becomes a four-bagger because the runner outruns the relay.
  const [insideTheParkBadge, setInsideTheParkBadge] = useState(null); // { batter, team: 0|1 }
  // Crowd wave (Backlog #78) — atmospheric "the wave" rolling across the stands
  // during mid-inning half-inning transitions. crowdWaveActive controls visibility,
  // crowdWaveKey forces the SVG animation to restart cleanly each trigger.
  const [crowdWaveActive, setCrowdWaveActive] = useState(false);
  const [crowdWaveKey, setCrowdWaveKey] = useState(0);
  // Grounds crew dragging the infield (Backlog #90) — atmospheric mid-game
  // tradition triggered between top and bottom of the 5th inning. Three crew
  // members drag rakes diagonally across the infield with trailing dust-puffs.
  // groundsCrewActive controls visibility, groundsCrewKey forces SVG remount.
  const [groundsCrewActive, setGroundsCrewActive] = useState(false);
  const [groundsCrewKey, setGroundsCrewKey] = useState(0);
  // Position player pitching (Backlog #79) — boolean per team. When the losing
  // team is down by 8+ runs in the 8th inning or later, they bring in a position
  // player to mop up. While active, walk and HR rates spike; pure visual + a
  // small-but-realistic mechanical effect. Persists for the rest of the game.
  const [posPitcherActive, setPosPitcherActive] = useState([false, false]);
  // Rosin bag pickup (Backlog #84) — atmospheric pre-pitch flavor. When active,
  // the static pitcher is hidden and a moving pitcher silhouette walks back to
  // the bag, claps it, and walks back. Pure cosmetic, no mechanical effect.
  // `rosinKey` forces the SVG to remount each trigger so the animation cleanly
  // restarts. `rosinTriggeredRef` blocks recursion when doDrawCard re-invokes.
  const [rosinAct, setRosinAct] = useState(null); // null | { } — active flag
  const [rosinKey, setRosinKey] = useState(0);
  const rosinTriggeredRef = useRef(false);
  // Triple play (Backlog #85) — pulsing fuchsia-to-emerald gradient badge that
  // flashes in the info bar when a doubleplay converts to a 3-out triple play.
  const [tripleplayBadge, setTripleplayBadge] = useState(null); // { batter, team: 0|1 }
  // Foul tip strikeout (Backlog #86) — pulsing slate-to-cyan gradient badge that
  // flashes in the info bar when a 2-strike foul ball is squeezed by the catcher
  // for strike three. Pure flavor on top of the standard strikeout pathway.
  const [foulTipBadge, setFoulTipBadge] = useState(null); // { batter, team: 0|1 }
  // Stadium attendance (Backlog #87) — fictional attendance figure for the game,
  // generated once at game start with a realistic distribution. Displayed in the
  // info bar as a small "ATT: XX,XXX" pill, persisted on gs.current.attendance.
  const [attendance, setAttendance] = useState(null); // { display: '41,283', raw: 41283 }
  // Hit-by-pitch reaction (Idea #88) — visualizes the moment a pitch strikes
  // the batter. `hbpImpact` drives the dust-puff + ricochet SVG at the contact
  // point; `hbpBadge` flashes a brief slate "🩹 HIT BY PITCH" pill in the info
  // bar identifying the body part hit.
  const [hbpImpact, setHbpImpact] = useState(null); // { x, y, side, bodyPart }
  const [hbpBadge, setHbpBadge] = useState(null); // { batter, bodyPart, team: 0|1 }
  // Outfield assist at home (Idea #89) — pulsing emerald-to-amber gradient
  // badge that flashes in the info bar when an outfielder guns down a runner
  // trying to score from third on a single. Companion to the existing
  // close-play-at-the-plate logic, but for the OUT call instead of SAFE.
  const [outfieldAssistBadge, setOutfieldAssistBadge] = useState(null); // { batter, fielder, runner, team: 0|1 }
  // Outfield assist at THIRD (Backlog #146) — runner from 1B gunned down trying
  // to stretch a single into a "first-to-third." { batter, fielder, runner, team }.
  const [outfieldAssist3BBadge, setOutfieldAssist3BBadge] = useState(null);
  // Texas leaguer / bloop single (Backlog #91) — pulsing teal gradient badge
  // that flashes in the info bar when a single is re-narrated as a soft
  // bloop hit dropping between infield and outfield. Pure cosmetic.
  const [texasLeaguerBadge, setTexasLeaguerBadge] = useState(null); // { batter, team: 0|1 }
  // Diving stop by infielder (Backlog #93) — pulsing emerald-to-amber gradient
  // badge in the info bar + an SVG overlay at the catch point showing the
  // fielder horizontally extended in mid-air. Pure flavor — outcome unchanged.
  const [divingStop, setDivingStop] = useState(null); // { x, y, color, dir }
  const [divingStopBadge, setDivingStopBadge] = useState(null); // { fielder, batter, team: 0|1 }
  // Pitcher comebacker (Backlog #126) — ~5% of groundOuts re-narrated as a
  // 1-3 putout. Pulsing emerald-to-amber "🎯 COMEBACKER!" info-bar badge.
  // Pure flavor — outcome stays a groundOut.
  const [comebackerBadge, setComebackerBadge] = useState(null); // { pitcher, batter, team: 0|1 }
  // Fielder's choice (Backlog #137) — ~50% of groundOut + runner-on-1B-only
  // outcomes get re-narrated as an explicit force play at second. Pulsing
  // amber-to-slate "↔ FIELDER'S CHOICE" info-bar badge. Pure narration /
  // badge layer on top of the existing engine behavior (the engine already
  // produces batter-safe-at-1B + runner-out-at-2B for this exact scenario).
  const [fieldersChoiceBadge, setFieldersChoiceBadge] = useState(null); // { batter, runner, fielder, team: 0|1 }
  const [hitAndRunBadge, setHitAndRunBadge] = useState(null); // { batter, runner, team: 0|1 } (Backlog #148)
  // Foul ball straight back to the screen (Backlog #127) — ~30% of plain
  // foul-ball strikes re-narrated as "off the screen" with a high upward
  // trajectory over the catcher's head into the protective netting. Pulsing
  // slate-to-cyan "🥅 STRAIGHT BACK" info-bar badge. Pure cosmetic — still a
  // strike per the existing engine logic.
  const [backstopBadge, setBackstopBadge] = useState(null); // { batter, team: 0|1 }
  // Two-strike approach / choke-up (Backlog #128) — pure cosmetic flag set
  // when the count crosses from 1 to 2 strikes. Drives a pulsing slate-to-cyan
  // "🎯 TWO-STRIKE APPROACH" pill in the info bar (auto-clears at 1.6s) and
  // — independently of the badge — the SVGBatter pose receives a `chokeUp`
  // prop derived directly from `gs.current.count.strikes === 2` so the choke-up
  // stance shows whenever the count is at 2 strikes (not just for the badge
  // window). Not persisted to playHistory.
  const [chokeUpBadge, setChokeUpBadge] = useState(null); // { batter, team: 0|1 }
  // Pitcher fist pump on clutch K (Backlog #129) — visual + audio celebration
  // when the defensive pitcher records a big strikeout (inning ≥ 7, RISP or
  // inning-ending K with runners, defensive team leading by 1-3, 70% roll).
  // `fistPumpAct` drives the SVGPitcher to the 'fistPump' phase; `fistPumpBadge`
  // flashes a red-to-amber "💪 FIST PUMP!" pill in the info bar. Suppressed
  // during manager ejections (#95) and dropped-3rd-strikes (live play).
  const [fistPumpAct, setFistPumpAct] = useState(null); // { color, ts }
  const [fistPumpBadge, setFistPumpBadge] = useState(null); // { batter, pitcher, team: 0|1 }
  // Brushback / chin music (Backlog #94) — high-and-tight ball that the batter
  // ducks away from. `brushbackBadge` flashes a brief red "🎵 CHIN MUSIC"
  // pill in the info bar. The batter's recoil pose is driven via the existing
  // `batterPhase` state ('brushback' phase). Pure flavor — still a ball, no
  // statistical change.
  const [brushbackBadge, setBrushbackBadge] = useState(null); // { batter, team: 0|1 }
  // Manager ejection (Backlog #95) — manager comes out from the dugout to
  // argue a strikeout call and gets tossed by the home plate umpire. Pure
  // flavor — strikeout still counts. `ejectionAct` drives an SVG manager
  // figure and an ejecting umpire pose; `ejectionBadge` flashes a brief
  // "🚪 EJECTED!" pill in the info bar.
  const [ejectionAct, setEjectionAct] = useState(null); // { x, y, phase: 'walk'|'argue'|'walkOff', dugoutX, dugoutY }
  const [ejectionBadge, setEjectionBadge] = useState(null); // { manager: 'team name manager', team: 0|1 }
  const [ejectionUmpireActive, setEjectionUmpireActive] = useState(false); // umpire is in 'eject' pose
  // Bat boy retrieving the bat (Backlog #121) — atmospheric figure that
  // emerges from the batting team's dugout after ~30% of strikeouts, jogs
  // to home plate, bends to pick up the bat, then jogs back. Pure cosmetic
  // — no gameplay effect. Suppressed during dropped 3rd strikes (still
  // live) and manager ejections (manager owns home plate). The state
  // payload drives x/y position, phase ('walkOut'|'pickup'|'walkBack'),
  // raw progress (0..1), and team color.
  const [batBoyAct, setBatBoyAct] = useState(null); // { x, y, phase, progress, color }
  // Flying helmet (Backlog #96) — runner's batting helmet pops off on a hard
  // slide. Triggered alongside bang-bang plays at first, close plays at the
  // plate, and outfield-assist gun-downs at home. Pure cosmetic flair.
  const [flyingHelmet, setFlyingHelmet] = useState(null); // { x, y, color, dir: -1|1 }
  // Squeeze play (Backlog #97) — bunt with a runner on 3rd and <2 outs is
  // re-narrated as a squeeze. The runner from 3rd already scores on a bunt by
  // the existing engine logic, so this is pure flavor: special narration,
  // badge, and sound effect on top of the standard bunt pathway.
  const [squeezeBadge, setSqueezeBadge] = useState(null); // { batter, runner, team: 0|1 }
  // Catcher's mask toss on pop-up (Backlog #98) — `maskToss` drives the
  // tumbling-mask SVG flying off in foul territory; `catcherLookingUp`
  // briefly switches the catcher's pose to glove-overhead while tracking the
  // popup; `maskTossBadge` flashes a brief slate "🎭 MASK OFF!" pill in the
  // info bar. Pure cosmetic — fires on ~75% of foulOuts (where the catcher is
  // already the receiver per the default narration sub).
  const [maskToss, setMaskToss] = useState(null); // { x, y, dir: -1|1 }
  const [catcherLookingUp, setCatcherLookingUp] = useState(false);
  const [maskTossBadge, setMaskTossBadge] = useState(null); // { batter, team: 0|1 }
  // Infield single beat-out (Backlog #99) — ~7% of routine groundOuts convert
  // to infield singles before calculatePlayResult runs. The conversion is
  // re-mapped at the engine level (oc → 'single') so the standard single
  // pathway handles runner advancement. `infieldSingleBadge` flashes a brief
  // teal "⚡ INFIELD SINGLE" pill in the info bar.
  const [infieldSingleBadge, setInfieldSingleBadge] = useState(null); // { batter, fielder, team: 0|1 }
  // Tip of the cap to a fielder (Backlog #100) — after a defensive web gem,
  // diving stop, robbed HR, or outfield assist at home, ~70% chance the
  // pitcher tips his cap toward the fielder who saved him. `pitcherTipCap`
  // (boolean) drives the SVGPitcher pose to the `tipCap` phase for ~1.4s.
  // `tipCapBadge` flashes a brief slate "🎩 TIP OF THE CAP" pill in the info
  // bar with a hover tooltip naming the pitcher and fielder.
  const [pitcherTipCap, setPitcherTipCap] = useState(false);
  const [tipCapBadge, setTipCapBadge] = useState(null); // { fielder, team: 0|1 }
  // Steal of home (Backlog #101) — ~0.5% chance per non-contact pitch with a
  // runner on 3B and < 2 outs (and inning ≥ 2). The runner breaks for home
  // as the pitch is delivered. ~55% success. `stealHomeBadge` flashes a brief
  // red-to-amber "⚡ STEAL OF HOME!" pill in the info bar with a hover tooltip
  // naming the runner and outcome. The animation uses the standard runner-
  // animation system and standard pitch flight to the catcher.
  const [stealHomeBadge, setStealHomeBadge] = useState(null); // { runner, success, team: 0|1 }
  // Double steal (Backlog #144) — runners on 1st & 2nd both break on the pitch.
  // Badge reflects whether the trail runner was safe at 2B or gunned down.
  const [doubleStealBadge, setDoubleStealBadge] = useState(null); // { team, trailSuccess, leadName, trailName } or null
  // Walk-off dog pile (Backlog #145) — drives the SVGWalkOffMob figures + Gatorade
  // dump at home plate after a walk-off win. Pure cosmetic terminal celebration.
  const [walkOffMob, setWalkOffMob] = useState(null); // { x, y, color } or null
  // Dugout high-five greeting line (Backlog #147) — drives the SVGHighFiveLine
  // figures at the batting team's dugout after a home run. { x, y, color } or null.
  const [highFiveLine, setHighFiveLine] = useState(null);
  // Pitcher shake-off (Backlog #104) — ~25% chance during the catcher's signs
  // animation that the pitcher visibly shakes off the first sign. The catcher
  // then cycles to a fresh sign, and the pitch is delayed by ~700ms. Pure
  // cosmetic — no gameplay effect.
  // `pitcherShakeOff` (boolean) drives the SVGPitcher to render with a head-
  // shake transform for 600ms. `shakeOffBadge` flashes a brief slate "🤔
  // SHAKE-OFF" pill in the info bar with a hover tooltip.
  const [pitcherShakeOff, setPitcherShakeOff] = useState(false);
  const [shakeOffBadge, setShakeOffBadge] = useState(null); // { team: 0|1 }
  // Throwing error on routine groundouts (Backlog #105) — ~1.2% of routine
  // groundOuts convert to a throwing error. The infielder fields cleanly but
  // the throw sails wide / pulls the first baseman off the bag, the batter
  // reaches first safely. Stat-wise treated as an ERROR (no hit credit, AB
  // charged, defensive errors increment). `throwErrorBadge` flashes a brief
  // rose-to-red "✗ THROWING ERROR (Ex)" pill in the info bar.
  const [throwErrorBadge, setThrowErrorBadge] = useState(null); // { batter, fielder, errCode, team: 0|1 }
  // Productive out (Backlog #108) — routine groundOut to the right side with a
  // runner on 2B and < 2 outs that moves the runner up to 3B. ~35% of
  // qualifying groundouts. Pure tactical realism — the out is still recorded,
  // but the runner is now 90 feet from home, in scoring position for the next
  // batter. `productiveOutBadge` flashes a brief amber-to-emerald
  // "↗ PRODUCTIVE OUT" pill in the info bar so the player can see the rare
  // small-ball moment when it happens.
  const [productiveOutBadge, setProductiveOutBadge] = useState(null); // { batter, runner, team: 0|1 }
  // Tag-up advance (Backlog #142) — brief "🏃 TAG & ADVANCE" pill when a runner
  // tags from 2B and takes third on a deep fly out. { runner, team: 0|1 }.
  const [tagUpBadge, setTagUpBadge] = useState(null);
  // Pitcher covers first (Backlog #143) — the pitcher figure breaking from the
  // mound to cover first base on a 3-1 putout, { x, y, color }, plus the badge.
  const [pitcherCover, setPitcherCover] = useState(null);
  const [pitcherCoverBadge, setPitcherCoverBadge] = useState(null); // { team: 0|1 }
  // Sacrifice bunt (Backlog #111) — designed bunt with a runner on 1st or 2nd
  // (but not 3rd; that's a squeeze) and < 2 outs where the batter trades the
  // out for moving the lead runner over. Engine already advances the runner
  // on every bunt, so this badge is the visible flair that distinguishes a
  // sacrifice from an unintentional bunt-out. ~55% of qualifying bunts.
  const [sacBuntBadge, setSacBuntBadge] = useState(null); // { batter, runner, advancedTo, team: 0|1 }
  const [dragBuntBadge, setDragBuntBadge] = useState(null); // Backlog #139: drag-bunt single (bases-empty bunt that beat the throw) — { batter, team: 0|1 }
  // Catcher's blocked pitch in the dirt (Backlog #112) — ~4% of bases-empty
  // ball outcomes get re-narrated as a pitch bouncing in the dirt that the
  // catcher dives to block. `catcherBlocking` (boolean) drives the SVGCatcher
  // to render with a forward-dive pose for ~700ms. `blockedPitchBadge`
  // flashes a brief slate-to-cyan "🛡 BLOCKED IN THE DIRT" pill in the info
  // bar. Pure cosmetic — still scored as a regular ball.
  const [catcherBlocking, setCatcherBlocking] = useState(false);
  const [blockedPitchBadge, setBlockedPitchBadge] = useState(null); // { team: 0|1 }
  // Pitcher's brow wipe (Backlog #113) — pre-pitch atmospheric flavor for
  // fatigued pitchers in the 6th inning or later with 50+ pitches thrown.
  // ~8% chance per pitch. `pitcherBrowWipe` (boolean) drives the SVGPitcher
  // to render with a wipeBrow pose for ~700ms before the windup. Mutually
  // exclusive with stepOut / cleatKnock / shakeOff.
  const [pitcherBrowWipe, setPitcherBrowWipe] = useState(false);
  const [browWipeBadge, setBrowWipeBadge] = useState(null); // { team: 0|1 }
  // Pitcher check-the-runner at 1B (Backlog #116) — when there's a runner on
  // 1B and < 2 outs, ~35% chance per pitch the pitcher comes set and visibly
  // turns his head over his right shoulder to check the runner before
  // pitching. `pitcherCheckRunner` (boolean) drives the SVGPitcher to render
  // the checkRunner phase for ~700ms. Mutually exclusive with stepOut /
  // cleatKnock / shakeOff / browWipe — only one pre-pitch atmosphere per
  // pitch to keep pacing brisk. Pure cosmetic — no gameplay effect.
  const [pitcherCheckRunner, setPitcherCheckRunner] = useState(false);
  const [checkRunnerBadge, setCheckRunnerBadge] = useState(null); // { team: 0|1 }
  // Catcher framing pitches (Backlog #130) — one of baseball's most studied
  // modern defensive skills. ~15% of `ball` outcomes get a framing attempt by
  // the catcher; ~30% of those convert to a called strike when the umpire
  // bites on the borderline call. Gated to count.balls < 3 AND count.strikes
  // < 2 (no walk-prevention, no surprise strikeouts). Mutually exclusive
  // with brushback (chin music is too far off the plate) and blocked pitches
  // (already a special-trajectory case). `catcherFraming` (boolean) drives
  // the SVGCatcher to render with a subtle glove-rotation-inward animation
  // for ~700ms after the catch. `framingBadge` flashes a pulsing slate-to-
  // cyan "👁 PITCH FRAMED!" pill in the info bar ONLY when the framing
  // actually converted the call (no badge on the cosmetic-only attempts —
  // the visual + sound carry those, the badge is reserved for the moment
  // the umpire actually rings it up).
  const [catcherFraming, setCatcherFraming] = useState(false);
  const [framingBadge, setFramingBadge] = useState(null); // { team: 0|1 }
  // Pitcher's sign acceptance nod (Backlog #131) — pure-cosmetic companion to
  // the shake-off (Backlog #104). When the pitcher does NOT shake off the
  // catcher's first sign, ~20% chance per pitch he gives a small confirmation
  // nod accepting the sign before delivering. Mutually exclusive with all
  // other pre-pitch atmospheres (stepOut / cleatKnock / shakeOff / browWipe /
  // checkRunner) so only one pre-pitch ritual fires per pitch (pacing brisk).
  // `pitcherHeadNod` (boolean) drives the SVGPitcher to render with a small
  // head-tilt-forward animation (~500ms). `signNodBadge` flashes a brief
  // slate "👌 SIGN ACCEPTED" pill. Pure cosmetic — no sound (head nods are
  // silent in real life), no gameplay effect.
  const [pitcherHeadNod, setPitcherHeadNod] = useState(false);
  const [signNodBadge, setSignNodBadge] = useState(null); // { team: 0|1 }
  // First baseman stretch on throws to first (Backlog #114) — when the ball
  // is in flight to first base on routine groundouts (and throwing-error wild
  // throws), the first baseman briefly shifts to a "stretch" pose: foot
  // anchored on the bag, body extended toward the throw, glove arm fully
  // outstretched. ~750ms pose. `f1bStretch` payload: { color, throwFrom: {x,y} }.
  // Pure cosmetic — outcome unchanged. Companion to "First baseman holds the
  // runner" (Backlog #106) which covers the pre-pitch holding pose.
  const [f1bStretch, setF1bStretch] = useState(null);
  // Battle at-bat indicator (Backlog #115) — when an at-bat reaches 7+ pitches
  // the batter is "battling" the pitcher. Display a pulsing red-to-amber
  // "🥊 BATTLE!" pill in the info bar with the current pitch count and a
  // hover tooltip explaining the threshold. Reads directly from
  // gs.current.currentABPitches so no separate badge state is needed — the
  // value is updated alongside the pitchCount increment. Pure cosmetic —
  // no gameplay effect. `battleSoundFired` tracks whether the threshold-
  // crossing crowd murmur has already played in the current AB so we don't
  // re-fire it on every pitch past 7.
  const battleSoundFiredRef = useRef(false);
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
  const pitcherCoverAnimRef = useRef(null); // rAF id for the pitcher-cover-first sprite (Backlog #143)
  const playIdRef = useRef(0);
  const prevLeadRef = useRef(null); // 0 = away leads, 1 = home leads, null = tied

  useEffect(() => { sndRef.current = soundOn; spdRef.current = autoSpeed; }, [soundOn, autoSpeed]);
  useEffect(() => { return () => { if (animRef.current) cancelAnimationFrame(animRef.current); if (runnerAnimRef.current) cancelAnimationFrame(runnerAnimRef.current); if (fielderAnimRef.current) cancelAnimationFrame(fielderAnimRef.current); if (plateAnimRef.current) cancelAnimationFrame(plateAnimRef.current); if (moundVisitRef.current) cancelAnimationFrame(moundVisitRef.current); if (pitcherCoverAnimRef.current) cancelAnimationFrame(pitcherCoverAnimRef.current); }; }, []);
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
    // Walk-up music marquee (Backlog #72) — atmospheric chyron showing the batter's
    // walk-up song. Deterministic per player name so each batter consistently gets
    // the same song. Auto-clears after 3.4s, slightly longer than the stats chyron
    // so the song lingers a beat after the at-bat begins.
    const song = getWalkUpSong(activeBatter);
    setWalkUpMusic({ name: activeBatter, title: song.title, artist: song.artist });
    const timer = setTimeout(() => setWalkUpStats(null), 2800);
    const musicTimer = setTimeout(() => setWalkUpMusic(null), 3400);
    return () => { clearTimeout(timer); clearTimeout(musicTimer); };
  }, [activeBatter, phase]);

  function rerender() { setRenderTick(t => t + 1); }
  function triggerFireworks() { setShowFW(true); setFwKey(k => k + 1); setTimeout(() => setShowFW(false), 4500); }
  // Walk-off dog pile (Backlog #145) — teammates mob the hero at home plate and
  // dump the Gatorade cooler after a walk-off win. The mob shows for ~3.2s, which
  // fits inside the ~3.5s window before the post-game modal appears. Pure cosmetic.
  function triggerWalkOffMob() {
    setWalkOffMob({ x: 310, y: 416, color: '#b91c1c' });
    if (sndRef.current) setTimeout(() => playSoundLocal('dogPile'), 500);
    setTimeout(() => setWalkOffMob(null), 3200);
  }
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

  // Pitcher-covers-first sprite animator (Backlog #143) — drives a single fielder
  // figure from the mound (F.P) to first base (F.B1) on a 3-1 putout. Dedicated
  // ref + state cell so it never collides with the receiver `movingFielder`. The
  // mound SVGPitcher render is suppressed while `pitcherCover` is set, so only one
  // pitcher figure is ever on screen.
  function animatePitcherCover(sPos, ePos, dur, color) {
    const s = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - s) / dur);
      setPitcherCover({ x: lerp(sPos.x, ePos.x, t), y: lerp(sPos.y, ePos.y, t), color });
      if (t < 1) pitcherCoverAnimRef.current = requestAnimationFrame(tick);
    }
    pitcherCoverAnimRef.current = requestAnimationFrame(tick);
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
    // Stadium attendance (Backlog #87): generate a fictional figure using a triangular
    // distribution (averaging two uniforms) so values cluster around the mean rather
    // than skew flat. Base range 18,000–48,000. Playoff games get a +8,000 bump
    // (sold-out feel), night games get a +2,500 nudge (after-work crowds). Cap at 50,000.
    const baseAtt = Math.floor(18000 + ((Math.random() + Math.random()) / 2) * 30000);
    const playoffBoost = isPlayoff ? 8000 : 0;
    const nightBoost = isNightGame ? 2500 : 0;
    const attRaw = Math.min(50000, baseAtt + playoffBoost + nightBoost);
    const attDisplay = attRaw.toLocaleString('en-US');
    gs.current.attendance = attRaw;
    setAttendance({ raw: attRaw, display: attDisplay });
    setLog([{ text: `⚾ Play Ball! ${teams[0].name} at ${teams[1].name}`, type: 'info' }, { text: `📋 Attendance: ${attDisplay}`, type: 'info' }]);
    setPlayHistory([]); setReplayIdx(-1); setHalfStartIdx(0); setDrawnPile([]); setDispensedCard(null); setDispensing(false); setOutcome(null); setShowFW(false); setAutoPlay(false); setBallPos(null); setPitchPhase('idle'); setBatterPhase('stance'); setAnnounceText(''); setExitVelo(null); setHrDistance(null); setPopTime(null); setPlatePlay(null); setUmpirePhase('idle'); setScoringFlash(null); setPitchMilestone(null); setClutchBadge(null); setLeadChangeBadge(null); setCycleWatch(null); setWalkUpStats(null); setWalkUpMusic(null); setRobbedHRBadge(null); setRobbedHRLeap(null); setCrowdReactions([]); setGrooveBadge(null); setPitchLocations([]); setErrorBobble(null); setCatcherSigns(0); setFirstPitchStrikeBadge(null); setMoundVisit(null); setGrdBadge(null); setPickoffBadge(null); setPickoffDive(null); setLeadCaution(1); setBrokenBat(null); setPassedBallBadge(null); setPitchClockBadge(null); setBangBangPlay(null); setBangBangBadge(null); setCiBadge(null); setLostInSunBadge(null); setSunFlare(null); setDroppedFlyBadge(null); setChallengeReview(null); setChallengeBadge(null); setFanCatch(null); setCoachSignKey(0); setInsideTheParkBadge(null); setCrowdWaveActive(false); setCrowdWaveKey(0); setGroundsCrewActive(false); setGroundsCrewKey(0); setPosPitcherActive([false, false]); setRosinAct(null); setRosinKey(0); rosinTriggeredRef.current = false; setTripleplayBadge(null); setFoulTipBadge(null); setHbpImpact(null); setHbpBadge(null); setOutfieldAssistBadge(null); setTexasLeaguerBadge(null); setDivingStop(null); setDivingStopBadge(null); setBrushbackBadge(null); setEjectionAct(null); setEjectionBadge(null); setEjectionUmpireActive(false); setFlyingHelmet(null); setSqueezeBadge(null); setMaskToss(null); setCatcherLookingUp(false); setMaskTossBadge(null); setInfieldSingleBadge(null); setPitcherTipCap(false); setTipCapBadge(null); setStealHomeBadge(null); setPitcherShakeOff(false); setShakeOffBadge(null); setThrowErrorBadge(null); setProductiveOutBadge(null); setTagUpBadge(null); if (pitcherCoverAnimRef.current) cancelAnimationFrame(pitcherCoverAnimRef.current); setPitcherCover(null); setPitcherCoverBadge(null); setSacBuntBadge(null); setDragBuntBadge(null); setCatcherBlocking(false); setBlockedPitchBadge(null); setPitcherBrowWipe(false); setBrowWipeBadge(null); setPitcherCheckRunner(false); setCheckRunnerBadge(null); setF1bStretch(null); setLaunchAngle(null); setUmpire1BPhase('idle'); setBatBoyAct(null); setBatSpeed(null); setFirstTo3rdBadge(null); setOrganCharge(false); setComebackerBadge(null); setFieldersChoiceBadge(null); setHitAndRunBadge(null); setBackstopBadge(null); setChokeUpBadge(null); setFistPumpAct(null); setFistPumpBadge(null); setCatcherFraming(false); setFramingBadge(null); setPitcherHeadNod(false); setSignNodBadge(null); setCapTipFanBadge(null); setFreshBallToss(null); setFreshBallTossBadge(false); setInfieldFlyBadge(null); setCurtainCall(null); setCurtainCallBadge(null); setDoubleStealBadge(null); setWalkOffMob(null); setHighFiveLine(null); setOutfieldAssist3BBadge(null); battleSoundFiredRef.current = false; prevLeadRef.current = null; setShowPostGame(false); setActiveBatter(teams[0].players[0]); shuffleDeck(); setPhase('playing'); rerender();
  }

  function doDrawCard() {
    if (procRef.current || gs.current.gameOver) return;
    procRef.current = true; setReplayIdx(-1);
    const thisPlayId = ++playIdRef.current;
    const bt = gs.current.half, batter = teams[bt].players[gs.current.batterIdx[bt]];
    setActiveBatter(batter);

    // Position player pitching (Backlog #79) — when the losing team is down by
    // 8+ runs in the 8th inning or later, they bring in a position player to
    // mop up. Once activated, the flag persists for the rest of the game.
    // Defensive team here is `1 - bt`; if their score trails the batting team
    // by 8 or more, they're the ones putting in the position player.
    if (!gs.current.gameOver && gs.current.inning >= 8) {
      const defIdx = 1 - bt;
      if (!posPitcherActive[defIdx]) {
        const defRuns = gs.current.innings[defIdx].reduce((a, b) => a + b, 0);
        const batRuns = gs.current.innings[bt].reduce((a, b) => a + b, 0);
        // Activate when the defensive team trails by 8+ — they're losing badly,
        // so this is when real teams pull a position player off the bench.
        if (batRuns - defRuns >= 8) {
          const next = [...posPitcherActive]; next[defIdx] = true;
          setPosPitcherActive(next);
          addLog(`${teams[defIdx].name} bring in a position player to pitch!`, 'info');
        }
      }
    }

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
      // Errant pickoff throw (Backlog #134) — ~5% of pickoff attempts sail wide
      // of the bag. Resolved FIRST so wild throws short-circuit the normal
      // out/safe roll. Charged as a throwing error to the defense, runner
      // advances one base. Re-rolled below: pickoffOut is the standard 14%
      // chance among the REMAINING (non-wild) attempts.
      const pickoffWild = Math.random() < 0.05;
      const pickoffOut = !pickoffWild && Math.random() < 0.14;
      const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
      const poTexts = pickoffWild
        ? [
            `WILD PICKOFF THROW! The ball sails into right field — ${runnerName} hustles to second!`,
            `Throwing error on the pickoff! ${runnerName} pops up and races safely to second base.`,
            `Pickoff throw is WIDE OF THE BAG! ${runnerName} alertly takes second on the gaffe.`
          ]
        : pickoffOut
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
        // Wild pickoff throw to 1B (Backlog #134) — ball sails past the bag
        // into the foul-side stands/right-field area. Runner advances to 2B,
        // defense charged with a throwing error.
        if (pickoffWild) {
          const wildTarget = { x: F.B1.x + 30, y: F.B1.y + 22 }; // past 1B toward RF/foul side
          animateBall([...linePts(F.P, F.B1, 8), ...linePts(F.B1, wildTarget, 8)], 700, () => {
            if (sndRef.current) playSoundLocal('wildPickoff');
            setBallPos(null);
            // ErrorBobble overlay at 1B where the throw skipped past
            setErrorBobble({ x: F.B1.x, y: F.B1.y - 4 });
            setTimeout(() => setErrorBobble(null), 1300);
            // Runner pops up (skip the dive) and sprints 1B → 2B
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              animateRunners([[F.B1, F.B2]], offColor, 850);
              setTimeout(() => {
                if (playIdRef.current !== thisPlayId) return;
                gs.current.bases[0] = null;
                gs.current.bases[1] = runnerName;
                gs.current.errors[1 - bt]++;
                // Wild-throw badge — distinct from pickoff out / safe
                setPickoffBadge({ outcome: 'wild', team: 1 - bt, base: 'B1' });
                setTimeout(() => setPickoffBadge(null), 3000);
                let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
                setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: false, pickoffBase: 'B1', pickoffWild: true }]);
                // Ball back to pitcher after a beat (ball was retrieved from RF)
                setTimeout(() => {
                  if (playIdRef.current !== thisPlayId) return;
                  animateBall(linePts(wildTarget, F.P, 14), 600, () => {
                    setBallPos(null);
                    procRef.current = false;
                    rerender();
                  });
                }, 400);
              }, 850);
            }, 150);
          });
          return;
        }
        // Ball from P → F1B
        animateBall(linePts(F.P, F.B1, 14), 380, () => {
          setBallPos(null);
          if (sndRef.current) playSoundLocal('glovePop');
          // Show runner diving back (brief animation) — Backlog #64
          setPickoffDive({ color: offColor, base: 'B1' });
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

    // Pickoff move to 2nd base (Backlog #120): ~1.2% chance per pitch with a
    // runner on 2nd (only). Companion to the existing pickoff-at-first (Backlog
    // #64). The pitcher spins through a half-turn and throws to the shortstop
    // (or second baseman) covering 2B. Picks are rarer at 2B than at 1B in real
    // MLB (the throw is longer and the runner gets a better view of the pitcher),
    // so the trigger rate is lower (1.2% vs 2.2%) — but the surprise factor is
    // higher (the runner often isn't expecting it), so the success rate is a
    // bit higher (~18% vs 14%). Does NOT count as a pitch: no card drawn, no
    // pitch count increment, ball/strike count untouched. If the pickoff is the
    // 3rd out, transitions the half-inning. Suppressed when there's also a
    // runner on 1B — in that case the pitcher's pickoff move should target the
    // lead runner at 1B (the existing 1B-pickoff block above already covers
    // that case and takes priority).
    if (gs.current.bases[1] && !gs.current.bases[0] && !gs.current.gameOver && Math.random() < 0.012) {
      const preBases = [...gs.current.bases];
      const runnerName = gs.current.bases[1];
      // Errant pickoff throw to 2B (Backlog #134) — ~5% wild throw. Runner
      // advances to 3B, defense charged with a throwing error.
      const pickoffWild = Math.random() < 0.05;
      const pickoffOut = !pickoffWild && Math.random() < 0.18;
      const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
      const poTexts = pickoffWild
        ? [
            `WILD PICKOFF THROW! The ball sails into center — ${runnerName} alertly takes THIRD on the gaffe!`,
            `Throwing error at second! ${runnerName} pops up and races safely to third base.`,
            `The pickoff throw is OFF THE MARK! ${runnerName} alertly advances to third.`
          ]
        : pickoffOut
        ? [
            `PICKOFF AT SECOND! ${runnerName} is caught leaning — the throw beats him to the bag!`,
            `Got him at second! The pitcher spins and fires — ${runnerName} is OUT!`,
            `Spectacular pickoff at second base! ${runnerName} couldn't dive back in time.`
          ]
        : [
            `Throw down to second — ${runnerName} dives back safely.`,
            `Pickoff attempt at second! ${runnerName} scrambles back to the bag just in time.`,
            `The pitcher spins and throws to second — ${runnerName} gets back. No play.`
          ];
      const poText = pick(poTexts);
      setAnnounceText(poText);
      addLog(poText, 'play');
      setPitchPhase('windup');
      setTimeout(() => {
        if (playIdRef.current !== thisPlayId) return;
        setPitchPhase('idle');
        // Wild pickoff throw to 2B (Backlog #134) — ball sails into shallow CF.
        if (pickoffWild) {
          const wildTarget = { x: F.B2.x + 4, y: F.B2.y - 28 }; // past 2B toward CF
          animateBall([...linePts(F.P, F.B2, 8), ...linePts(F.B2, wildTarget, 8)], 760, () => {
            if (sndRef.current) playSoundLocal('wildPickoff');
            setBallPos(null);
            setErrorBobble({ x: F.B2.x, y: F.B2.y - 4 });
            setTimeout(() => setErrorBobble(null), 1300);
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              animateRunners([[F.B2, F.B3]], offColor, 850);
              setTimeout(() => {
                if (playIdRef.current !== thisPlayId) return;
                gs.current.bases[1] = null;
                gs.current.bases[2] = runnerName;
                gs.current.errors[1 - bt]++;
                setPickoffBadge({ outcome: 'wild', team: 1 - bt, base: 'B2' });
                setTimeout(() => setPickoffBadge(null), 3000);
                let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
                setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: false, pickoffBase: 'B2', pickoffWild: true }]);
                setTimeout(() => {
                  if (playIdRef.current !== thisPlayId) return;
                  animateBall(linePts(wildTarget, F.P, 14), 620, () => {
                    setBallPos(null);
                    procRef.current = false;
                    rerender();
                  });
                }, 400);
              }, 850);
            }, 150);
          });
          return;
        }
        // Ball from P → F.B2 (slightly longer flight than P → F.B1)
        animateBall(linePts(F.P, F.B2, 14), 420, () => {
          setBallPos(null);
          if (sndRef.current) playSoundLocal('glovePop');
          // Show runner diving back to 2B (brief animation, mirrored horizontally)
          setPickoffDive({ color: offColor, base: 'B2' });
          setTimeout(() => setPickoffDive(null), 900);
          setTimeout(() => {
            if (playIdRef.current !== thisPlayId) return;
            if (pickoffOut) {
              gs.current.bases[1] = null;
              gs.current.outs++;
              // Count as caught-stealing for the runner (per official scoring)
              if (statsRef.current[bt][runnerName]) statsRef.current[bt][runnerName].cs++;
              setPickoffBadge({ outcome: 'out', team: 1 - bt, base: 'B2' });
              setTimeout(() => setPickoffBadge(null), 2600);
              let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
              setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: true, pickoffBase: 'B2' }]);
              // 3rd out check — if pickoff ends the half-inning, transition (or end game)
              if (gs.current.outs >= 3) {
                const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
                const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
                const isTopOf9thPlus = bt === 0 && gs.current.inning >= 9;
                const isBotOf9thPlus = bt === 1 && gs.current.inning >= 9;
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
              setPickoffBadge({ outcome: 'safe', team: 1 - bt, base: 'B2' });
              setTimeout(() => setPickoffBadge(null), 2200);
              // Runner plays the next pitch cautiously — smaller lead, then decays back to full.
              setLeadCaution(0.35);
              setTimeout(() => setLeadCaution(0.65), 2400);
              setTimeout(() => setLeadCaution(1), 4800);
              let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
              setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: false, pickoffBase: 'B2' }]);
              // Ball back to pitcher
              animateBall(linePts(F.B2, F.P, 12), 380, () => {
                setBallPos(null);
                procRef.current = false;
                rerender();
              });
            }
          }, 480);
        });
      }, 470);
      return;
    }

    // Pickoff move to 3rd base (Backlog #124): ~0.4% chance per pitch with a
    // runner on 3rd (only). Completes the pickoff trilogy alongside Backlog
    // #64 (1B) and #120 (2B). Real-MLB pickoffs at 3B are exceptionally rare —
    // the throw is awkward (across the body), the consequences of a wild
    // throw are catastrophic (runner scores), and most baserunners take only
    // small leads at 3B. So the trigger rate is intentionally lowest of the
    // three (~0.4% vs 2.2% at 1B and 1.2% at 2B). The surprise factor is
    // highest, though, so the success rate is bumped to ~25% (vs 14% at 1B
    // and 18% at 2B) — when this play actually happens, the runner is usually
    // truly napping. Does NOT count as a pitch: no card drawn, no pitch count
    // increment, ball/strike count untouched. If the pickoff is the 3rd out,
    // transitions the half-inning. Suppressed when there's a runner on 1B or
    // 2B (those cases are owned by the higher-priority pickoff blocks above,
    // which target the lead steal threat). Also suppressed in extra innings
    // since the Manfred ghost runner makes pickoff plays at 3B unrealistic
    // (the ghost runner would be on 2B, not 3B, at the start of the half).
    if (gs.current.bases[2] && !gs.current.bases[0] && !gs.current.bases[1] && !gs.current.gameOver && Math.random() < 0.004) {
      const preBases = [...gs.current.bases];
      const runnerName = gs.current.bases[2];
      // Errant pickoff throw to 3B (Backlog #134) — ~5% wild throw. Runner
      // SCORES from third! Devastating — runs are credited to the batting
      // team, defense charged with a throwing error, walk-off check fires
      // in the bottom of the 9th+.
      const pickoffWild = Math.random() < 0.05;
      const pickoffOut = !pickoffWild && Math.random() < 0.25;
      const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
      const poTexts = pickoffWild
        ? [
            `WILD PICKOFF THROW TO THIRD! The ball sails past the bag — ${runnerName} BOLTS for home... SAFE! A run scores on the error!`,
            `DEVASTATING throwing error at third! ${runnerName} sprints home and SCORES on the wild throw!`,
            `${runnerName} reads the wild pickoff throw perfectly — sprints down the line and TOUCHES HOME! Run scores on the pitcher's gaffe!`
          ]
        : pickoffOut
        ? [
            `PICKOFF AT THIRD! ${runnerName} is caught napping — the throw beats him to the bag!`,
            `Stunning pickoff at third base! ${runnerName} drifted off the bag and is OUT!`,
            `${runnerName} is OUT! The pitcher spins and fires across his body — got him at third!`
          ]
        : [
            `Throw down to third — ${runnerName} dives back safely.`,
            `Pickoff attempt at third base! ${runnerName} scrambles back to the bag just in time.`,
            `The pitcher spins and throws to third — ${runnerName} gets back. No play.`
          ];
      const poText = pick(poTexts);
      setAnnounceText(poText);
      addLog(poText, 'play');
      setPitchPhase('windup');
      setTimeout(() => {
        if (playIdRef.current !== thisPlayId) return;
        setPitchPhase('idle');
        // Wild pickoff throw to 3B (Backlog #134) — ball sails past the bag
        // into LF/foul side; the runner SCORES from third on the error.
        if (pickoffWild) {
          const wildTarget = { x: F.B3.x - 30, y: F.B3.y + 22 }; // past 3B toward LF/foul side
          animateBall([...linePts(F.P, F.B3, 8), ...linePts(F.B3, wildTarget, 8)], 720, () => {
            if (sndRef.current) playSoundLocal('wildPickoff');
            setBallPos(null);
            setErrorBobble({ x: F.B3.x, y: F.B3.y - 4 });
            setTimeout(() => setErrorBobble(null), 1300);
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              // Runner sprints 3B → HP, slightly slower to convey the "did he risk it?" dash
              animateRunners([[F.B3, F.HP]], offColor, 1100);
              setTimeout(() => {
                if (playIdRef.current !== thisPlayId) return;
                gs.current.bases[2] = null;
                gs.current.errors[1 - bt]++;
                // Credit the run to the batting team
                gs.current.innings[bt][gs.current.innings[bt].length - 1] += 1;
                setScoringFlash({ team: bt, runs: 1 });
                setTimeout(() => setScoringFlash(null), 2000);
                // Lead change detection
                const wpAway = gs.current.innings[0].reduce((a, b) => a + b, 0);
                const wpHome = gs.current.innings[1].reduce((a, b) => a + b, 0);
                const wpLead = wpAway > wpHome ? 0 : wpHome > wpAway ? 1 : null;
                if (wpLead !== prevLeadRef.current) {
                  if (wpLead === null) { setLeadChangeBadge({ type: 'tied', teamName: teams[bt].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
                  else if (prevLeadRef.current !== null && wpLead !== prevLeadRef.current) { setLeadChangeBadge({ type: 'leadChange', teamName: teams[wpLead].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
                }
                prevLeadRef.current = wpLead;
                setPickoffBadge({ outcome: 'wild', team: 1 - bt, base: 'B3' });
                setTimeout(() => setPickoffBadge(null), 3000);
                let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
                setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: false, pickoffBase: 'B3', pickoffWild: true, wildPickoffRuns: 1 }]);
                // Walk-off check: a wild pickoff at 3B in the bottom of the 9th+ that scores the go-ahead run ends the game.
                if (bt === 1 && gs.current.inning >= 9) {
                  const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
                  const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
                  if (homeTotal > awayTotal) {
                    gs.current.gameOver = true;
                    gs.current.message = `${teams[1].name} win on a walk-off wild pickoff throw! Final: ${homeTotal}-${awayTotal}`;
                    triggerFireworks(); triggerFireworks();
                    if (sndRef.current) setTimeout(() => playSoundLocal('walkOff'), 400);
                    setTimeout(() => setAnnounceText(`WALK-OFF! Wild pickoff throw lets ${runnerName} score! ${teams[1].name} win!`), 600);
                    setAutoPlay(false);
                    procRef.current = false;
                    setTimeout(() => setShowPostGame(true), 3500);
                    rerender();
                    return;
                  }
                }
                setTimeout(() => {
                  if (playIdRef.current !== thisPlayId) return;
                  animateBall(linePts(wildTarget, F.P, 14), 600, () => {
                    setBallPos(null);
                    procRef.current = false;
                    rerender();
                  });
                }, 400);
              }, 1100);
            }, 150);
          });
          return;
        }
        // Ball from P → F.B3 (similar flight time to P → F.B1 — the throw is
        // diagonally across the diamond)
        animateBall(linePts(F.P, F.B3, 14), 400, () => {
          setBallPos(null);
          if (sndRef.current) playSoundLocal('glovePop');
          // Show runner diving back to 3B (brief animation, mirrored horizontally)
          setPickoffDive({ color: offColor, base: 'B3' });
          setTimeout(() => setPickoffDive(null), 900);
          setTimeout(() => {
            if (playIdRef.current !== thisPlayId) return;
            if (pickoffOut) {
              gs.current.bases[2] = null;
              gs.current.outs++;
              // Count as caught-stealing for the runner (per official scoring)
              if (statsRef.current[bt][runnerName]) statsRef.current[bt][runnerName].cs++;
              setPickoffBadge({ outcome: 'out', team: 1 - bt, base: 'B3' });
              setTimeout(() => setPickoffBadge(null), 2600);
              let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
              setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: true, pickoffBase: 'B3' }]);
              // 3rd out check — if pickoff ends the half-inning, transition (or end game)
              if (gs.current.outs >= 3) {
                const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
                const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
                const isTopOf9thPlus = bt === 0 && gs.current.inning >= 9;
                const isBotOf9thPlus = bt === 1 && gs.current.inning >= 9;
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
              setPickoffBadge({ outcome: 'safe', team: 1 - bt, base: 'B3' });
              setTimeout(() => setPickoffBadge(null), 2200);
              // Runner plays the next pitch cautiously — smaller lead, then decays back to full.
              setLeadCaution(0.35);
              setTimeout(() => setLeadCaution(0.65), 2400);
              setTimeout(() => setLeadCaution(1), 4800);
              let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
              setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: false, pickoffBase: 'B3' }]);
              // Ball back to pitcher
              animateBall(linePts(F.B3, F.P, 12), 380, () => {
                setBallPos(null);
                procRef.current = false;
                rerender();
              });
            }
          }, 480);
        });
      }, 470);
      return;
    }

    // Catcher's snap-throw pickoff to 2nd base (Backlog #132): ~0.5% chance per
    // pitch with a runner on 2nd ONLY (no runner on 1B — that scenario is
    // already owned by the pitcher's 1B pickoff block, which targets the lead
    // runner). Companion to the pitcher pickoff trilogy (Backlog #64, #120,
    // #124). In real MLB, the catcher's snap-throw to 2B is a SURPRISE play —
    // the catcher receives the pitch, pops up from his crouch, and fires a
    // throw across the infield to catch a runner taking too aggressive a lead.
    // Because both the pitcher's 2B pickoff (1.2%, fires first in the cascade)
    // and the catcher's snap-throw (0.5%, this block) target the same runner-
    // on-2B state, the combined effective rate is ~1.7% per pitch — realistic
    // for the rate of "pickoff threats" a runner at 2B faces. The success
    // rate is bumped to ~20% (vs 18% for the pitcher's spin-and-throw at 2B)
    // because the snap throw is a true surprise tactic — the runner isn't
    // watching the catcher between pitches. Does NOT count as a pitch: no card
    // drawn, no pitch count increment, ball/strike count untouched. If the
    // pickoff is the 3rd out, transitions the half-inning. Mutually exclusive
    // with the pitcher's 2B pickoff above (which returned early if it fired).
    if (gs.current.bases[1] && !gs.current.bases[0] && !gs.current.gameOver && Math.random() < 0.005) {
      const preBases = [...gs.current.bases];
      const runnerName = gs.current.bases[1];
      // Errant catcher snap-throw to 2B (Backlog #134) — ~5% wild throw. Runner
      // advances to 3B; defense charged with a throwing error (E2 — catcher).
      const pickoffWild = Math.random() < 0.05;
      const pickoffOut = !pickoffWild && Math.random() < 0.20;
      const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
      const poTexts = pickoffWild
        ? [
            `WILD SNAP THROW BY THE CATCHER! The ball sails into center — ${runnerName} alertly takes THIRD on the error!`,
            `Catcher's snap throw goes WIDE OF SECOND! ${runnerName} scrambles up and races to third base.`,
            `Throwing error on the catcher! The snap throw misses the bag and ${runnerName} advances to third.`
          ]
        : pickoffOut
        ? [
            `Catcher snap throw — GOT HIM! ${runnerName} is OUT at second!`,
            `SNAP THROW BY THE CATCHER! ${runnerName} drifted too far — picked off at second!`,
            `Catcher pops up and FIRES to second — ${runnerName} is OUT! Surprise pickoff!`
          ]
        : [
            `Catcher's snap throw down to second — ${runnerName} dives back safely.`,
            `Snap throw by the catcher! ${runnerName} scrambles back to the bag just in time.`,
            `The catcher fires to second on a surprise snap throw — ${runnerName} gets back. No play.`
          ];
      const poText = pick(poTexts);
      setAnnounceText(poText);
      addLog(poText, 'play');
      // No pitch phase change — the ball is at the catcher, who's snap-throwing
      // it directly to 2B. We use 'idle' phase since the pitcher isn't moving.
      setPitchPhase('idle');
      setTimeout(() => {
        if (playIdRef.current !== thisPlayId) return;
        // Wild catcher snap throw to 2B (Backlog #134) — ball sails into shallow CF
        // past 2B; runner advances to 3B; defense charged E2.
        if (pickoffWild) {
          if (sndRef.current) playSoundLocal('catcherSnap');
          const wildTarget = { x: F.B2.x + 4, y: F.B2.y - 28 }; // past 2B toward CF
          animateBall([...linePts(F.HP, F.B2, 10), ...linePts(F.B2, wildTarget, 8)], 820, () => {
            if (sndRef.current) playSoundLocal('wildPickoff');
            setBallPos(null);
            setErrorBobble({ x: F.B2.x, y: F.B2.y - 4 });
            setTimeout(() => setErrorBobble(null), 1300);
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              animateRunners([[F.B2, F.B3]], offColor, 850);
              setTimeout(() => {
                if (playIdRef.current !== thisPlayId) return;
                gs.current.bases[1] = null;
                gs.current.bases[2] = runnerName;
                gs.current.errors[1 - bt]++;
                setPickoffBadge({ outcome: 'wild', team: 1 - bt, base: 'B2', source: 'catcher' });
                setTimeout(() => setPickoffBadge(null), 3000);
                let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
                setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: false, pickoffBase: 'B2', pickoffSource: 'catcher', pickoffWild: true }]);
                // Ball back to home (the relay route, since the play started at HP)
                setTimeout(() => {
                  if (playIdRef.current !== thisPlayId) return;
                  animateBall(linePts(wildTarget, F.HP, 14), 640, () => {
                    setBallPos(null);
                    procRef.current = false;
                    rerender();
                  });
                }, 400);
              }, 850);
            }, 150);
          });
          return;
        }
        // Ball from HP (catcher) → F.B2 (a longer flight than P→B2 since HP is
        // farther from B2 than the mound is). Snap-throw sound fires at start.
        if (sndRef.current) playSoundLocal('catcherSnap');
        animateBall(linePts(F.HP, F.B2, 16), 460, () => {
          setBallPos(null);
          if (sndRef.current) playSoundLocal('glovePop');
          // Show runner diving back to 2B (brief animation, mirrored horizontally)
          setPickoffDive({ color: offColor, base: 'B2' });
          setTimeout(() => setPickoffDive(null), 900);
          setTimeout(() => {
            if (playIdRef.current !== thisPlayId) return;
            if (pickoffOut) {
              gs.current.bases[1] = null;
              gs.current.outs++;
              // Count as caught-stealing for the runner (per official scoring)
              if (statsRef.current[bt][runnerName]) statsRef.current[bt][runnerName].cs++;
              setPickoffBadge({ outcome: 'out', team: 1 - bt, base: 'B2', source: 'catcher' });
              setTimeout(() => setPickoffBadge(null), 2600);
              let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
              setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: true, pickoffBase: 'B2', pickoffSource: 'catcher' }]);
              // 3rd out check — if pickoff ends the half-inning, transition (or end game)
              if (gs.current.outs >= 3) {
                const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
                const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
                const isTopOf9thPlus = bt === 0 && gs.current.inning >= 9;
                const isBotOf9thPlus = bt === 1 && gs.current.inning >= 9;
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
              setPickoffBadge({ outcome: 'safe', team: 1 - bt, base: 'B2', source: 'catcher' });
              setTimeout(() => setPickoffBadge(null), 2200);
              // Runner plays the next pitch cautiously — smaller lead, then decays back to full.
              setLeadCaution(0.35);
              setTimeout(() => setLeadCaution(0.65), 2400);
              setTimeout(() => setLeadCaution(1), 4800);
              let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
              setPlayHistory(p => [...p, { card: null, outcome: 'pickoff', narration: poText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, pileSnapshot: cp, isPickoff: true, pickoffOut: false, pickoffBase: 'B2', pickoffSource: 'catcher' }]);
              // Ball back to the catcher (after a beat at the bag) — the SS/2B
              // jogs the ball back to home via the relay route. We use a single
              // animation back to HP since the relay is short and cosmetic.
              animateBall(linePts(F.B2, F.HP, 14), 420, () => {
                setBallPos(null);
                procRef.current = false;
                rerender();
              });
            }
          }, 480);
        });
      }, 470);
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

    // Rosin bag pickup (Backlog #84) — atmospheric pre-pitch flavor. ~6% per
    // pitch chance (gated to bases-empty situations and never in the first 8
    // pitches of the game) the pitcher walks back to the rosin bag, picks it
    // up, and claps it on his throwing hand with a small puff of chalk dust.
    // Pure cosmetic — no pitch is thrown, no card is drawn, no count change.
    // After the 1.6s cycle, doDrawCard is re-invoked so the actual pitch flows
    // naturally. `rosinTriggeredRef` prevents the recursive call from firing
    // the rosin animation again.
    const rosinDefIdx = 1 - gs.current.half;
    if (!rosinTriggeredRef.current && !gs.current.gameOver && !hasRunnerOnBase
        && gs.current.pitchCount[rosinDefIdx] >= 8 && Math.random() < 0.06) {
      rosinTriggeredRef.current = true;
      setRosinKey(k => k + 1);
      setRosinAct({ active: true });
      // Schedule the rosin clap sound near the middle of the cycle (~720ms in)
      if (sndRef.current) setTimeout(() => playSoundLocal('rosinClap'), 720);
      // After the full 1.6s cycle completes, clear the overlay, release the
      // procRef, and re-invoke doDrawCard so the regular pitch flow runs.
      // The rosinTriggeredRef guard is reset at the START of the recursive
      // call's next pitch (after the actual pitch resolves) — but here we
      // reset it via a small follow-up timer so the next at-bat can roll
      // for a rosin trigger again.
      setTimeout(() => {
        if (playIdRef.current !== thisPlayId) {
          // The play was preempted (e.g., game ended). Clear state but skip recursion.
          setRosinAct(null);
          rosinTriggeredRef.current = false;
          return;
        }
        setRosinAct(null);
        procRef.current = false;
        doDrawCard();
        // Reset the recursion-guard a short while after the recursive call so
        // the NEXT pitch (a totally fresh doDrawCard invocation) can trigger
        // a rosin act on its own. 800ms is well after the recursive doDrawCard
        // has already run its rosin check, so the guard works correctly.
        setTimeout(() => { rosinTriggeredRef.current = false; }, 800);
      }, 1600);
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

    // Catcher's interference (Backlog #76) — rare defensive infraction: ~0.15% per pitch
    // chance the catcher's mitt clips the bat as the batter swings. Per real MLB scoring,
    // the batter is awarded first base, runners advance only when forced, and the at-bat
    // is NOT charged as an at-bat (no AB increment). Treated like balk/pickoff in our
    // engine: no card is drawn, no pitch count increment, count is unchanged. The CI is
    // attributed to the catcher, charged to the defensive team's error column (real MLB
    // scoring: catcher's interference is an error in the box score even though the runner
    // didn't reach by mishandled batted ball).
    if (!gs.current.gameOver && Math.random() < 0.0015) {
      const preBases = [...gs.current.bases];
      const ciRes = resolveWalkForce([...gs.current.bases], batter);
      const ciTexts = [
        `Catcher's interference! ${batter}'s bat clipped the catcher's mitt — he's awarded first base.${ciRes.runs > 0 ? ' Run scores from third!' : ''}`,
        `The umpire calls catcher's interference! ${batter} reaches on the infraction.${ciRes.runs > 0 ? ' Runner scores from third!' : ''}`,
        `Bat hits the mitt! ${batter} takes first on catcher's interference — no at-bat charged.${ciRes.runs > 0 ? ' Run home from third!' : ''}`
      ];
      const ciNarText = pick(ciTexts);
      setAnnounceText(ciNarText);
      addLog(ciNarText, 'play');
      setPitchPhase('windup');
      setTimeout(() => {
        if (playIdRef.current !== thisPlayId) return;
        setPitchPhase('throw');
        // Brief swing — bat clips the mitt as it comes through.
        setBatterPhase('swing');
        if (sndRef.current) playSoundLocal('catchersInterference');
        setTimeout(() => {
          if (playIdRef.current !== thisPlayId) return;
          setPitchPhase('idle');
          setBatterPhase('stance');
          // Animate the batter trotting to 1B and any forced runners advancing.
          const rps = computeRunnerPaths(preBases, 'walk');
          animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', 800);
          setTimeout(() => {
            if (playIdRef.current !== thisPlayId) return;
            // Apply state mutations:
            // - bases updated to forced-walk advancement
            // - runs scored if a force pushed a runner home from 3rd
            // - error charged to defensive team (CI is an error per scoring rules)
            // - reachedBase / rallyCount / halfInningReached treated as a baserunner reaching
            // - count is reset (CI ends the plate appearance, no AB charged)
            // - batter index advances
            // - groove streak resets, struggling tracker increments
            gs.current.bases = ciRes.bases;
            if (ciRes.runs > 0) {
              gs.current.innings[bt][gs.current.innings[bt].length - 1] += ciRes.runs;
              setScoringFlash({ team: bt, runs: ciRes.runs });
              setTimeout(() => setScoringFlash(null), 2000);
              // Lead change detection on CI-scored runs
              const ciAway = gs.current.innings[0].reduce((a, b) => a + b, 0);
              const ciHome = gs.current.innings[1].reduce((a, b) => a + b, 0);
              const ciLead = ciAway > ciHome ? 0 : ciHome > ciAway ? 1 : null;
              if (ciLead !== prevLeadRef.current) {
                if (ciLead === null) { setLeadChangeBadge({ type: 'tied', teamName: teams[bt].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
                else if (prevLeadRef.current !== null && ciLead !== prevLeadRef.current) { setLeadChangeBadge({ type: 'leadChange', teamName: teams[ciLead].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
              }
              prevLeadRef.current = ciLead;
            }
            gs.current.errors[1 - bt]++;
            gs.current.reachedBase[bt]++;
            gs.current.rallyCount++;
            gs.current.consecutiveRetired[1 - bt] = 0;
            gs.current.halfInningReached++;
            setGrooveBadge(prev => prev?.type === 'groove' && prev.team === teams[1 - bt].name ? null : prev);
            if (gs.current.halfInningReached >= 3) setGrooveBadge({ type: 'struggling', team: teams[1 - bt].name });
            gs.current.count = { balls: 0, strikes: 0 };
            gs.current.currentABPitches = 0;
            battleSoundFiredRef.current = false;
            gs.current.batterIdx[bt] = (gs.current.batterIdx[bt] + 1) % 9;
            setActiveBatter(teams[bt].players[gs.current.batterIdx[bt]]);
            setCiBadge({ batter, team: bt });
            setTimeout(() => setCiBadge(null), 3200);
            let cp; setDrawnPile(prev => { cp = [...prev]; return cp; });
            setPlayHistory(p => [...p, { card: null, outcome: 'catchersInterference', narration: ciNarText, dir: 'none', sub: '', variant: 0, isHR: false, batter, preBases, team: bt, resultData: ciRes, pileSnapshot: cp, isCI: true, ciRuns: ciRes.runs }]);
            // Walk-off CI in the bottom of the 9th+ if the forced run wins it
            if (ciRes.runs > 0 && bt === 1 && gs.current.inning >= 9) {
              const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
              const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
              if (homeTotal > awayTotal) {
                gs.current.gameOver = true;
                gs.current.message = `${teams[1].name} win on catcher's interference! Final: ${homeTotal}-${awayTotal}`;
                triggerFireworks(); triggerFireworks();
                if (sndRef.current) setTimeout(() => playSoundLocal('walkOff'), 400);
                setTimeout(() => setAnnounceText(`WALK-OFF! ${teams[1].name} win on catcher's interference!`), 600);
                setAutoPlay(false);
                setTimeout(() => setShowPostGame(true), 3500);
              }
            }
            procRef.current = false;
            rerender();
          }, 850);
        }, 380);
      }, 450);
      return;
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
          gs.current.currentABPitches = 0;
          battleSoundFiredRef.current = false;
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
    // HR robbery (Backlog #72): ~3% of would-be home runs are caught at the wall by a
    // leaping outfielder. The HR is converted to a fly out before res / nar are
    // computed so all downstream logic (no fireworks, no runs scored, +1 out, batter
    // doesn't trot the bases) flows naturally. We force variant=2 in the narration
    // override below so the ball animation finishes deep at the wall (where the leap
    // happens), and we tag the outcome via isRobbedHR so the swing block knows to fire
    // the leap SVG, badge, and sound. Purely a statistical re-mapping — no special
    // engine plumbing needed beyond the cosmetic flag.
    let isRobbedHR = false;
    if (oc === 'homeRun' && Math.random() < 0.03) {
      isRobbedHR = true;
      oc = 'flyOut';
    }
    // Inside-the-park home run (Idea #83): ~3% of would-be triples convert to
    // inside-the-park homers. The runner sprints all the way home before the
    // outfielder can relay the throw in. Re-mapped to oc === 'homeRun' BEFORE
    // calculatePlayResult so all downstream logic — runner advancement (everyone
    // scores), HR stat increment on the batter, and runner-paths in the
    // animation block — flows naturally through the standard HR pathway. The
    // isInsideThePark flag is threaded through narration override, badge,
    // play history, and replay so the visual / sound flavor differs from a
    // typical "ball over the wall" HR even though the engine treats them the
    // same way mechanically.
    let isInsideThePark = false;
    if (!isRobbedHR && oc === 'triple' && Math.random() < 0.03) {
      isInsideThePark = true;
      oc = 'homeRun';
    }
    // Lost in the sun (Backlog #77) — day games only. ~1.5% of fly outs become
    // singles when the outfielder shields his eyes and the ball drops in front
    // of him. The conversion happens BEFORE calculatePlayResult so runner
    // advancement uses the new (single) outcome — no special engine plumbing,
    // just a statistical re-mapping. Suppressed when the play is a robbed-HR
    // (the leap-at-the-wall has its own narration and animation flavor) or
    // already flagged as a sac fly upgrade. The isLostInSun flag is threaded
    // through narration override, animation overlay, and play history.
    let isLostInSun = false;
    if (!isNightGame && !isRobbedHR && oc === 'flyOut' && Math.random() < 0.015) {
      isLostInSun = true;
      oc = 'single';
    }
    // Dropped fly ball error (Backlog #103) — ~1.5% of routine fly outs convert
    // to a 2-base error (E7/E8/E9). The outfielder gets a glove on it and the
    // ball clanks off the leather: batter takes second, runners advance two
    // bases (uses the standard 'double' advancement pathway). Suppressed when
    // the play is already a robbed HR (the wall leap has its own narration)
    // or a lost-in-sun play (also a flyOut conversion). The conversion happens
    // BEFORE calculatePlayResult so all downstream logic — runner advancement
    // (everyone moves two bags), no out, charged as an error to the defense —
    // flows naturally through the standard double pathway. The isDroppedFly
    // flag is threaded into narration override, animation overlay
    // (ErrorBobble at the OF target), badge, sound, and play history for
    // replay parity.
    let isDroppedFly = false;
    if (!isRobbedHR && !isLostInSun && oc === 'flyOut' && Math.random() < 0.015) {
      isDroppedFly = true;
      oc = 'double';
    }
    // Position player pitching (Backlog #79) — skews outcomes toward more
    // walks and homers when a position player is on the mound. Realistic
    // late-game blowout effect — they don't have major-league stuff, so
    // strikes get nibbled into balls and routine outs get turned around for
    // souvenirs. Suppressed when this same pitch is already a robbed HR or
    // lost-in-sun (those are mid-flight conversions and shouldn't double up).
    const _ppDefIdx = 1 - bt;
    if (!isRobbedHR && !isLostInSun && posPitcherActive[_ppDefIdx]) {
      // Strikes / fouls become balls (poor command) — ~22% / ~14%
      if (oc === 'strike' && Math.random() < 0.22) oc = 'ball';
      else if (oc === 'foulBall' && Math.random() < 0.14) oc = 'ball';
      // Routine fly outs / line outs become homers (no velocity) — ~22%
      else if ((oc === 'flyOut' || oc === 'lineOut') && Math.random() < 0.22) oc = 'homeRun';
      // Routine grounders sneak through for singles — ~16%
      else if (oc === 'groundOut' && Math.random() < 0.16) oc = 'single';
    }
    // Foul tip strikeout (Backlog #86) — on 2-strike counts, ~12% of foul balls
    // are actually foul tips squeezed by the catcher for strike three. Per real
    // MLB rules, a foul tip on 2 strikes that's caught cleanly is a strikeout.
    // We re-map oc from 'foulBall' to 'strikeout' BEFORE calculatePlayResult
    // and narrateLocal so all downstream logic — out increment, K credit on
    // pitcher, count reset, batter advance, umpire punch-out, strikeout crowd
    // reaction — flows through the standard strikeout pathway with no special
    // engine plumbing. The isFoulTip flag is threaded through narration
    // override, badge / sound trigger, and play history for replay parity.
    let isFoulTip = false;
    if (oc === 'foulBall' && gs.current.count.strikes === 2 && Math.random() < 0.12) {
      isFoulTip = true;
      oc = 'strikeout';
    }
    // Throwing error on routine groundouts (Backlog #105) — ~1.2% of routine
    // groundOut outcomes convert to a throwing error. The infielder fields the
    // ball cleanly but his throw to first sails wide / pulls the first baseman
    // off the bag, and the batter reaches safely. The conversion happens
    // BEFORE calculatePlayResult so all downstream logic — runner advancement
    // (uses standard 'single' pathway, batter to 1B, no out) — flows naturally.
    // Stat-wise treated as an ERROR (no hit credit, AB charged, defensive
    // errors increment, no RBI on runs scored). Gated to:
    //   - !gs.current.bases[0]: no force-play / DP scenarios (the throw would
    //     go to second on a force, simplifying the engine logic)
    //   - !posPitcherActive[defTeam]: position-player-pitching already converts
    //     groundOuts to singles at 16% (compounding would over-skew totals)
    // Suppressed downstream (after narration runs) when bang-bang / diving
    // stop / challenge / infield single already triggered, but those rolls all
    // check on oc === 'groundOut', and we re-map oc to 'single' before they
    // fire — so automatic mutual exclusion works naturally.
    let isThrowError = false;
    {
      const _isPpActive = posPitcherActive[1 - bt];
      if (oc === 'groundOut' && !gs.current.bases[0] && !_isPpActive && Math.random() < 0.012) {
        isThrowError = true;
        oc = 'single';
      }
    }
    // Infield single beat-out (Backlog #99) — ~7% of routine groundOut outcomes
    // convert to infield singles when the batter beats the throw to first by a
    // half-step. The conversion happens BEFORE calculatePlayResult so all
    // downstream logic (single-runner advancement, batter to 1B, no out, hit
    // credit) flows naturally through the standard single pathway. Gated to
    //   - !gs.current.bases[0]: no force-play / DP scenarios
    //   - !posPitcherActive[defTeam]: position-player-pitching already converts
    //     groundOuts to singles at 16% (compounding would over-skew totals)
    // Suppressed downstream (after narration runs) when bang-bang / diving
    // stop / challenge already triggered, but those rolls all check on
    // oc === 'groundOut', and we re-map oc to 'single' before they fire — so
    // automatic mutual exclusion works naturally.
    let isInfieldSingle = false;
    {
      const _isPpActive = posPitcherActive[1 - bt];
      if (oc === 'groundOut' && !gs.current.bases[0] && !_isPpActive && Math.random() < 0.07) {
        isInfieldSingle = true;
        oc = 'single';
      }
    }
    const defTeam = 1 - bt;
    gs.current.pitchCount[defTeam]++;
    const pc = gs.current.pitchCount[defTeam];
    // Battle at-bat tracking (Backlog #115) — increment per-AB pitch count
    // alongside the per-pitcher pitchCount. Defensive against legacy game
    // states that didn't initialize the field.
    if (gs.current.currentABPitches == null) gs.current.currentABPitches = 0;
    gs.current.currentABPitches++;
    // Threshold-crossing crowd murmur — fires exactly once per AB when the
    // count hits 7 (transitioning from 6 → 7). A subtle reverb-style murmur
    // representing the crowd starting to react to the long at-bat. We use
    // the existing 'crowdCheer' sound at a low volume by triggering a brief
    // crowd reaction in the existing crowd-reaction system.
    if (gs.current.currentABPitches === 7 && !battleSoundFiredRef.current) {
      battleSoundFiredRef.current = true;
      // Use the existing crowd-reaction system to add a brief murmur over
      // the field — the offensive team's fans appreciate the long battle.
      triggerCrowdReaction('hit', bt);
    }
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
    // Suppress GRD when this double was just re-mapped from a dropped fly
    // ball error (Backlog #103) — those plays already have their own bobble
    // / E7-9 narration and should not also be tagged "ground rule double."
    const isGRD = oc === 'double' && !isDroppedFly && Math.random() < 0.06;
    // Triple play (Backlog #85) — ~10% of double-play outcomes that fire with
    // 0 outs AND runners on both 1st AND 2nd convert to a 3-out triple play
    // (the runner from 2nd is also caught in the rundown). Real MLB averages
    // ~4-5 TPs per 2,430 games (~0.2% per defensive opportunity) — our rate
    // is more generous so players see one occasionally, but it's still
    // genuinely rare enough to read as a highlight when it happens.
    //
    // Mechanically: bump res.outsAdded from 2 → 3, clear all bases, and set
    // runs to 0. The 3rd out before any runner crosses home means no runs
    // can possibly score on the play. Downstream, processOutcome will see
    // nO = 3 and the half-inning will transition normally.
    const isTriplePlay = oc === 'doublePlay' && gs.current.outs === 0
      && gs.current.bases[0] && gs.current.bases[1] && Math.random() < 0.10;
    if (isTriplePlay) {
      res.outsAdded = 3;
      res.nextBases = [null, null, null];
      res.runs = 0;
    }
    // Outfield assist at home (Idea #89) — ~10% of singles where a runner
    // scores from third get gunned out at the plate by the outfielder. We
    // mutate the pre-computed res in place: decrement res.runs (the run is no
    // longer credited), increment res.outsAdded (the runner is OUT at home),
    // and leave nextBases as-is (the runner from 3B already left bases[2] via
    // advanceRunners; the batter still safely reaches 1B). The flag is
    // threaded through narration override, badge, ball-relay animation, and
    // play history for replay parity. Suppressed when the play already has
    // 2 outs AND the assist would end the inning before runs scored — then
    // there's no run to suppress (this is just a defensive check; res.runs
    // will be 0 in that case anyway).
    let isOutfieldAssist = false;
    if (oc === 'single' && !isInfieldSingle && gs.current.bases[2] && res.runs >= 1
        && gs.current.outs <= 1 && Math.random() < 0.10) {
      isOutfieldAssist = true;
      res.runs -= 1;        // Run is wiped — runner gunned out at the plate
      res.outsAdded += 1;   // OF assist counts as an out
    }
    // Texas leaguer / bloop single (Backlog #91) — ~12% of singles get
    // re-narrated as a soft "Texas leaguer" or "blooper" that drops between
    // the infielders and outfielders. Pure flavor: outcome is still a single,
    // batter still reaches first, runners advance one base. Suppressed when
    // the play is already a different special-flavor case (lost in sun,
    // outfield assist, infield single) — those have their own narration
    // and shouldn't double up.
    let isTexasLeaguer = false;
    if (oc === 'single' && !isLostInSun && !isOutfieldAssist && !isInfieldSingle && Math.random() < 0.12) {
      isTexasLeaguer = true;
    }
    // Productive out (Backlog #108) — a routine groundOut to the right side
    // (between the pitcher, second baseman, and first baseman) with a runner
    // on 2B and < 2 outs is real-baseball "small ball": the batter trades a
    // hit for advancing the runner ninety feet into scoring position. ~35% of
    // qualifying groundouts. We require:
    //   - oc still 'groundOut' (infield singles and throw errors already
    //     converted to 'single' upstream, so they're naturally excluded)
    //   - no runner on 1B (otherwise we'd have a force at 2B — runner from 2B
    //     advances to 3B by force anyway, handled by calculatePlayResult)
    //   - a runner on 2B (the runner who'll move up)
    //   - fewer than 2 outs (3rd out ends the inning; no advancement matters)
    // Mutation: move the runner from 2B → 3B. We safely overwrite
    // res.nextBases[2] because by this point it's already null (either bases
    // [2] was empty pre-play, or a runner on 3B already scored when the
    // groundout was fielded — both leave 3B open in the post-play state).
    let isProductiveOut = false;
    if (oc === 'groundOut' && !gs.current.bases[0] && gs.current.bases[1]
        && gs.current.outs < 2 && Math.random() < 0.35) {
      isProductiveOut = true;
      res.nextBases = [...res.nextBases];
      res.nextBases[2] = gs.current.bases[1];
      res.nextBases[1] = null;
    }
    // Aggressive baserunning — first-to-third on a single (Backlog #123).
    // ~18% of singles with a runner on 1B only (bases [r1, null, null]) and
    // < 2 outs convert to a "1st-to-3rd" play — the runner from 1B reads the
    // ball into the gap, gets a great jump, and the 3B coach waves him home
    // to third instead of stopping at 2nd. Common real-MLB tactical play:
    // a sharp single to right field with a fast runner aboard. Suppressed
    // when the play is already a special-flavor case that mutates res in a
    // conflicting way: outfield assist (the runner from 3B is being gunned
    // down — flavor focus stays there), infield single (batter just barely
    // beats it out; runner from 1B almost never goes 1-to-3 on those), texas
    // leaguer (bloop fell in shallow — runner can't get the read he needs),
    // throw error (runner advances on a botched throw — different flavor),
    // or lost in the sun (already a single-conversion with sun-flare flair).
    //
    // Mutation: shift the runner that advanceRunners placed at nb[1] (the
    // runner from 1B) up to nb[2] (3rd base). nb[0] still holds the batter.
    // This produces post-state [batter, null, runner] — runner now in
    // scoring position, batter standing on first. No change to res.runs
    // (no run scored from the move) or res.outsAdded (no out recorded —
    // the runner made it safely).
    let isFirstToThird = false;
    let firstTo3rdRunnerName = null;
    if (oc === 'single' && !isOutfieldAssist && !isInfieldSingle && !isTexasLeaguer
        && !isThrowError && !isLostInSun
        && gs.current.bases[0] && !gs.current.bases[1] && !gs.current.bases[2]
        && gs.current.outs < 2 && Math.random() < 0.18) {
      isFirstToThird = true;
      firstTo3rdRunnerName = gs.current.bases[0];
      res.nextBases = [...res.nextBases];
      res.nextBases[2] = res.nextBases[1]; // runner from 1B → 3B
      res.nextBases[1] = null;
    }
    // Outfield assist at THIRD (Backlog #146) — the aggressive-baserunning
    // DOWNSIDE companion to first-to-third (#123). On the same base state
    // (runner on 1B only, < 2 outs, single) a runner who did NOT already make
    // it first-to-third (~18%) instead tries to stretch the single and is
    // GUNNED DOWN at third base by the outfielder's throw — ~7% of the
    // remaining ~82%, so ~5.7% of qualifying singles. The batter still keeps
    // his single (he reaches first); the runner is OUT at 3B and no run scores.
    // Mutation: erase the runner advanceRunners placed at nb[1] and add an out.
    // Post-state [batter, null, null]. Mutually exclusive with first-to-third
    // and the other single-flavor cases. The `outs < 2` gate guarantees the
    // assist can never be the 3rd out (max nO = 2), so the inning never ends on
    // the play and the deferred base-state write stays safe — same invariant
    // the gun-down-at-home (#89) and first-to-third paths rely on.
    let isOutfieldAssist3B = false;
    let oa3RunnerName = null;
    if (oc === 'single' && !isFirstToThird && !isOutfieldAssist && !isInfieldSingle
        && !isTexasLeaguer && !isThrowError && !isLostInSun
        && gs.current.bases[0] && !gs.current.bases[1] && !gs.current.bases[2]
        && gs.current.outs < 2 && Math.random() < 0.07) {
      isOutfieldAssist3B = true;
      oa3RunnerName = gs.current.bases[0];
      res.nextBases = [...res.nextBases];
      res.nextBases[1] = null; // runner gunned down — off the bases
      res.outsAdded += 1;      // OF assist counts as an out
    }
    // Hit and run (Backlog #148) — the offense calls a hit-and-run: the runner on
    // 1B breaks with the pitch and the batter is obligated to put the ball in
    // play. On a ground ball, the runner's head start lets him beat the throw to
    // second, so the defense can only retire the BATTER at first — the classic
    // "stay out of the double play" payoff that also moves the runner ninety feet
    // into scoring position. Gated to a grounder with a runner on 1B ONLY (2B and
    // 3B open), fewer than 2 outs, and NOT a two-strike count (a hit-and-run is
    // rarely called with two strikes, where a whiff means an easy caught-stealing).
    // ~14% of qualifying grounders. Where the engine's default is a fielder's
    // choice (runner forced at 2B, batter safe at 1B), the hit-and-run FLIPS the
    // result: batter OUT at first, runner SAFE at second. Post-state
    // [null, runner, null], exactly +1 out. The `outs < 2` gate guarantees that
    // +1 out can never be the 3rd out (max total = 2), so the inning never ends on
    // the play and the deferred base-state write at the runner-trot completion
    // stays safe — the same invariant the stolen base (#6), double steal (#144),
    // first-to-third (#123), and tag-up (#142) paths all rely on. Live-only: no
    // simulateGameInstant mirror, consistent with the other base-state offensive
    // plays (steals) the season sim doesn't model. Scope note: only the
    // `groundOut` path is modeled; the rarer literal `doublePlay` outcome keeps
    // its standard turn-two animation rather than being converted here, to keep
    // the edit surface small and the double-play relay logic untouched.
    let isHitAndRun = false;
    let hitAndRunRunnerName = null;
    if (oc === 'groundOut' && !isThrowError
        && gs.current.bases[0] && !gs.current.bases[1] && !gs.current.bases[2]
        && gs.current.outs < 2
        && (gs.current.count?.strikes ?? 0) < 2
        && Math.random() < 0.14) {
      isHitAndRun = true;
      hitAndRunRunnerName = gs.current.bases[0];
      res.nextBases = [null, gs.current.bases[0], null]; // runner 1B → 2B (safe), batter out at first
      res.outsAdded = 1;  // exactly one out — the batter at first
      res.runs = 0;
    }
    const nar = narrateLocal(oc, batter, gs.current.bases, res.runs, gs.current.outs, Math.floor(Math.random() * 5));
    // Triple play narration override — three rare-call variants picked at
    // random, dropping in the selected infielder for flavor. We piggyback on
    // the doubleplay narration's `selectedInf` by re-running the inf-pick
    // here (deterministic enough — picks any non-catcher infielder).
    if (isTriplePlay) {
      // Exclude 'the catcher' (always) and 'the pitcher' (added to INF_MAP
      // for Backlog #126 comebacker — pitchers don't start 5-4-3 double-plays).
      const _infKeys = Object.keys(INF_MAP).filter(k => k !== 'the catcher' && k !== 'the pitcher');
      const _selInf = pick(_infKeys);
      const tpTexts = [
        `TRIPLE PLAY!! ${_selInf} starts a 5-4-3 around the horn — three outs on one swing! Unbelievable!`,
        `TRIPLE PLAY! ${batter} grounds into a once-in-a-season play — the defense turns three!`,
        `Unbelievable! TRIPLE PLAY! ${_selInf} flips it for a force at second, then the relay to first, and they get the lead runner too!`
      ];
      nar.text = pick(tpTexts);
      nar.sub = _selInf; // ensures the static fielder animation goes to the right infielder
      nar.isTriplePlay = true;
    }
    if (isGRD) {
      const grdTexts = [
        `Ground rule double! The ball bounces over the wall into the stands.${res.runs > 0 ? ` ${res.runs === 1 ? '1 run scores!' : `${res.runs} runs score!`}` : ''}`,
        `GROUND RULE DOUBLE! A one-hopper that carries right over the fence.${res.runs > 0 ? ` ${res.runs === 1 ? '1 run scores!' : `${res.runs} runs score!`}` : ''}`,
        `That ball takes a high bounce and sails over the wall — ground rule double for ${batter}.${res.runs > 0 ? ` ${res.runs === 1 ? '1 run scores!' : `${res.runs} runs score!`}` : ''}`
      ];
      nar.text = pick(grdTexts);
      nar.isGRD = true;
    }
    // Foul tip strikeout narration override (Backlog #86) — three "tick-and-squeeze"
    // variants that play up the dramatic close call. The engine-side conversion
    // happened earlier (oc → 'strikeout'); here we just swap in the foul-tip
    // flavor on top of the standard strikeout narration.
    if (isFoulTip) {
      const ftTexts = [
        `FOUL TIP STRIKE THREE! ${batter} just nicks it — and the catcher squeezes it for the K!${gs.current.outs >= 2 ? ' That retires the side!' : ''}`,
        `Foul tip into the mitt! Strike three on ${batter} — the catcher held on!${gs.current.outs >= 2 ? ' Three up, three down!' : ''}`,
        `${batter} fouls it back... straight into the catcher's glove! That's the strikeout!${gs.current.outs >= 2 ? ' The inning is over!' : ''}`
      ];
      nar.text = pick(ftTexts);
      nar.isFoulTip = true;
    }
    // Outfield assist at home narration override (Idea #89) — three "gunned-down
    // at the plate" variants that name the OF making the throw and the runner
    // who didn't make it. Force nar.sub to an outfield position so the ball
    // animation lands at an OF coordinate (the relay starts from the OF).
    if (isOutfieldAssist) {
      const ofChoices = ['lf', 'cf', 'rf'];
      if (!ofChoices.includes(nar.sub)) nar.sub = pick(ofChoices);
      nar.dir = 'out';
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
      const runnerName = gs.current.bases[2];
      const oaTexts = [
        `${batter} singles to ${fielderName.replace(' fielder', '')}! ${runnerName} tries to score from third — but the throw is in time! OUT at the plate!`,
        `Base hit by ${batter}! ${runnerName} rounds third heading home... HE'S OUT! The ${fielderName} guns him down!`,
        `Single to ${fielderName.replace(' fielder', '')}! Here's the throw to the plate... TAGGED OUT! What an arm from the ${fielderName}!`
      ];
      nar.text = pick(oaTexts);
      nar.isOutfieldAssist = true;
      nar.oaRunner = runnerName;
      nar.oaFielder = fielderName;
      // Flying helmet (Backlog #96) — ~75% chance the runner's helmet pops off
      // on the desperate slide into home plate. Higher than other slide
      // triggers because the runner is sliding hard in vain on a known close
      // play. Roll here so live + replay both see the same outcome.
      nar.helmetOff = Math.random() < 0.75;
    }
    // First-to-third narration override (Backlog #123) — append a "digging
    // for third!" tag to the base single narration so the announcer call
    // matches the aggressive baserunning we just mutated into res.nextBases.
    // The base hit narration is preserved (the batter still got a single);
    // we just add the runner's hustle to the call. Force nar.sub to an OF
    // position so the ball animation lands in the outfield (where a real
    // first-to-third hit goes — sharp single to the gaps, RF in particular).
    if (isFirstToThird) {
      const ofChoices = ['lf', 'cf', 'rf'];
      if (!ofChoices.includes(nar.sub)) nar.sub = pick(ofChoices);
      nar.dir = 'out';
      const lastName = (firstTo3rdRunnerName || '').split(' ').slice(-1)[0] || 'the runner';
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
      const ftTexts = [
        `${batter} singles to ${fielderName.replace(' fielder', '')} — and ${lastName} is DIGGING for THIRD! He's safe at third base!`,
        `Sharp single to ${fielderName.replace(' fielder', '')} by ${batter}! ${lastName} rounds second hard — heading for third! SAFE!`,
        `Base hit by ${batter}! ${lastName} reads it perfectly off the bat — first to third on the single! Aggressive baserunning!`
      ];
      nar.text = pick(ftTexts);
      nar.isFirstToThird = true;
      nar.firstTo3rdRunner = firstTo3rdRunnerName;
    }
    // Outfield assist at third narration override (Backlog #146) — three
    // "gunned-down at third" variants naming the OF making the throw and the
    // runner who didn't make it. Force nar.sub to an OF position so the ball
    // animation originates in the outfield (the relay starts there).
    if (isOutfieldAssist3B) {
      const ofChoices = ['lf', 'cf', 'rf'];
      if (!ofChoices.includes(nar.sub)) nar.sub = pick(ofChoices);
      nar.dir = 'out';
      const lastName = (oa3RunnerName || '').split(' ').slice(-1)[0] || 'the runner';
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
      const oa3Texts = [
        `${batter} singles to ${fielderName.replace(' fielder', '')} — and ${lastName} tries for third! Here comes the throw... HE'S OUT! Gunned down at third base!`,
        `Base hit by ${batter}! ${lastName} digs for third... but the ${fielderName} guns him down! OUT at third!`,
        `Single to ${fielderName.replace(' fielder', '')}! ${lastName} gets too aggressive — the throw to third NAILS him! What an arm from the ${fielderName}!`
      ];
      nar.text = pick(oa3Texts);
      nar.isOutfieldAssist3B = true;
      nar.oa3Runner = oa3RunnerName;
      nar.oa3Fielder = fielderName;
      // Flying helmet (Backlog #96) — ~70% chance the runner's helmet pops off
      // on the desperate slide into third on a known close play. Roll here so
      // live + replay both see the same outcome.
      nar.helmetOff = Math.random() < 0.70;
    }
    // Hit and run narration override (Backlog #148) — re-narrate the grounder as
    // a hit-and-run that beat the throw to second and stayed out of the double
    // play. Force nar.sub to a middle infielder (SS or 2B — the fielders who'd
    // normally turn two) so the announcer call and the ball routing stay
    // coherent. Three variants naming the runner who advanced into scoring
    // position. The engine mutation (batter out, runner safe at 2B) already
    // happened above; this is the narration/flag layer the badge, sound,
    // persistence, and replay read from.
    if (isHitAndRun) {
      if (nar.sub !== 'the shortstop' && nar.sub !== 'the second baseman') {
        nar.sub = Math.random() < 0.5 ? 'the shortstop' : 'the second baseman';
      }
      const harLast = (hitAndRunRunnerName || '').split(' ').slice(-1)[0] || 'the runner';
      const harTexts = [
        `Hit and run is ON! ${harLast} breaks with the pitch — ${batter} grounds it to ${nar.sub} — they get ${batter} at first, but ${harLast} cruises into second! The hit-and-run stays out of the double play!`,
        `${harLast} is off with the pitch! ${batter} puts it on the ground to ${nar.sub} — only play is at first. ${batter} is out, but ${harLast} slides in SAFE at second on the hit-and-run!`,
        `Perfect hit-and-run! ${harLast} running on the pitch, ${batter} grounds out to ${nar.sub} — no chance for two. ${harLast} advances to second, and a sure double play is avoided!`,
      ];
      nar.text = pick(harTexts);
      nar.isHitAndRun = true;
      nar.harRunner = hitAndRunRunnerName;
    }
    // Web gem / diving catch detection (~15% on fly outs and line outs that aren't sac flies).
    // Suppressed when the play is a robbed-HR conversion — the leap-at-the-wall has its
    // own dedicated narration and animation flavor.
    const isWebGem = !isRobbedHR && ['flyOut', 'lineOut'].includes(oc) && !res.isSacFly && Math.random() < 0.15;
    if (isWebGem) {
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : nar.sub === 'rf' ? 'right fielder' : nar.sub;
      const gemTexts = [
        `WHAT A CATCH! The ${fielderName} makes a spectacular diving grab to rob ${batter}!`,
        `WEB GEM! An incredible leaping catch by the ${fielderName}! ${batter} can't believe it!`,
        `UNBELIEVABLE! The ${fielderName} lays out full extension for a jaw-dropping catch on ${batter}!`
      ];
      nar.text = pick(gemTexts);
    }
    // Infield fly rule (Backlog #140) — when a fair fly ball can be caught by an
    // infielder with ordinary effort, with runners on 1st & 2nd (or bases
    // loaded) and fewer than 2 outs, the umpire declares the batter out and the
    // force is removed. ~40% of qualifying flyOuts are re-narrated as an infield
    // fly: the popup is routed to an infielder (dir 'inf'), the umpire raises his
    // finger, and the runners hold. The engine already produces exactly this
    // base-state (batter out, runners hold) for a non-sac-fly flyOut, so this is
    // purely a narration / umpire-signal / badge layer — no engine mutation, no
    // stat change. Mutually exclusive with the web gem (a diving outfield catch,
    // not an infield popup), a robbed HR (a wall catch), and any sac fly (a deep
    // fly, by definition not catchable by an infielder with ordinary effort).
    let isInfieldFly = false;
    if (oc === 'flyOut' && !res.isSacFly && !isRobbedHR && !isWebGem
        && gs.current.bases[0] && gs.current.bases[1]
        && gs.current.outs < 2
        && Math.random() < 0.40) {
      isInfieldFly = true;
      // Route the popup to an infielder so the ball arcs up and comes down in
      // the infield. Force dir 'inf' + an infielder sub; getBallTgtLocal('inf')
      // resolves the target to that fielder's position and the flyOut branch in
      // the swing handler animates the catch there.
      const iffFielder = pick(['the shortstop', 'the second baseman', 'the third baseman', 'the first baseman']);
      nar.dir = 'inf';
      nar.sub = iffFielder;
      const iffCap = iffFielder.charAt(0).toUpperCase() + iffFielder.slice(1);
      const iffTexts = [
        `Infield fly! The umpire signals — ${batter} is automatically out. ${iffCap} settles under it for the easy catch.`,
        `Popped up on the infield — INFIELD FLY RULE! ${batter} is out, the runners hold. ${iffCap} makes the routine grab.`,
        `Up goes the umpire's finger — infield fly! ${batter}'s out automatically. A can of corn for ${iffCap}.`,
      ];
      nar.text = pick(iffTexts);
      nar.isInfieldFly = true;
    }
    // HR robbery narration override (Backlog #72) — the would-be home run was caught
    // at the wall. Force the catch direction to an outfield position so animations
    // and the leap SVG land in the right spot. Tag isRobbedHR for the swing handler
    // and replay engine.
    if (isRobbedHR) {
      // narrateLocal may have set sub to an infield position since oc is now flyOut;
      // for a robbed HR we always want an outfield direction since the ball was in flight.
      const ofChoices = ['lf', 'cf', 'rf'];
      if (!ofChoices.includes(nar.sub)) nar.sub = pick(ofChoices);
      nar.dir = 'out';
      nar.variant = 2; // deepest catch — ball was carrying to the wall
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
      // If the catch happens with a runner tagging up from 3B (less than 2 outs),
      // calculatePlayResult will have already credited res.runs=1 (sac fly path).
      // Append a runner-scores tag to the narration so the play description matches.
      const tagSuffix = res.runs > 0 ? ' Runner tags from third and scores on the catch!' : '';
      const robbedTexts = [
        `ROBBED AT THE WALL! The ${fielderName} leaps and reaches over the fence to steal a home run from ${batter}!${tagSuffix}`,
        `WHAT A CATCH! The ${fielderName} climbs the wall and brings ${batter}'s would-be homer back into the park!${tagSuffix}`,
        `UNBELIEVABLE! ${batter} is robbed at the wall — the ${fielderName} timed his leap perfectly!${tagSuffix}`
      ];
      nar.text = pick(robbedTexts);
      nar.isRobbedHR = true;
    }
    // Lost in the sun (Backlog #77) — narration override. The play was already
    // re-mapped to oc === 'single' above, so calculatePlayResult / nar / animation
    // pathways already do the right thing (runners advance one base, batter to 1B,
    // outfielder fields the ball as a base hit). Here we just swap in distinctive
    // narration variants and force the direction to an outfield position so the
    // sun flare overlay lands at the fielder. The flag is threaded into play
    // history for replay parity, and the swing handler fires the SunFlare,
    // badge, and sound when nar.isLostInSun is set.
    if (isLostInSun) {
      const ofChoices = ['lf', 'cf', 'rf'];
      if (!ofChoices.includes(nar.sub)) nar.sub = pick(ofChoices);
      nar.dir = 'out';
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
      const sunTexts = [
        `LOST IN THE SUN! The ${fielderName} shields his eyes — the ball drops in for a base hit by ${batter}!`,
        `${batter} sends one to the outfield — and the ${fielderName} loses it in the afternoon sun! Single!`,
        `Tough day game out there! The ${fielderName} can't pick it up against the sky and ${batter} reaches on a base hit.`
      ];
      nar.text = pick(sunTexts);
      nar.isLostInSun = true;
    }
    // Dropped fly ball error narration override (Backlog #103) — the play was
    // re-mapped to oc === 'double' BEFORE calculatePlayResult so all downstream
    // logic (batter to 2B, runners advance two bases) flows through the
    // standard double pathway. Here we override the canned "drives a double"
    // narration with three "ball clanks off the glove" variants and force
    // nar.sub to an outfield direction so the ball animation lands at an OF
    // coordinate where the bobble overlay fires. The fielder slot is captured
    // as E7/E8/E9 for badge text. Pure narration / overlay / badge / sound
    // layer — no engine plumbing beyond the conversion + flag threading.
    if (isDroppedFly) {
      const ofChoices = ['lf', 'cf', 'rf'];
      if (!ofChoices.includes(nar.sub)) nar.sub = pick(ofChoices);
      nar.dir = 'out';
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
      const errCode = nar.sub === 'lf' ? 'E7' : nar.sub === 'cf' ? 'E8' : 'E9';
      const dfTexts = [
        `DROPPED! The ${fielderName} gets a glove on it but it CLANKS OFF — ${errCode}, ${batter} takes second on the error!`,
        `Routine fly to the ${fielderName} — and he DROPS IT! Boots it for an error (${errCode}). ${batter} hustles into second.`,
        `Off the heel of the glove! The ${fielderName} can't squeeze it — ${errCode} on the play, ${batter} pulls into second standing up.`
      ];
      nar.text = pick(dfTexts);
      nar.isDroppedFly = true;
      nar.dropFielder = fielderName;
      nar.dropErrCode = errCode;
    }
    // Infield single narration override (Backlog #99) — the play was re-mapped
    // to oc === 'single' BEFORE calculatePlayResult, so all downstream logic
    // (single-runner advancement, batter to 1B, hit credit, no out) flows
    // naturally through the standard single pathway. Here we override the
    // canned outfield-single narration with three "beat-out at first"
    // variants and force nar.sub to an INFIELD position so the ball
    // animation lands at an infielder coordinate (the slow roller / chopper
    // is fielded in the infield, not the outfield). Suppresses the Texas
    // leaguer / outfield assist overrides (those are mid-flight conversions
    // that fire on the same outcome, but the infieldSingle conversion has
    // already happened so isTexasLeaguer / isOutfieldAssist will be false
    // for these plays).
    if (isInfieldSingle && !isTexasLeaguer && !isOutfieldAssist) {
      // Use INF_MAP-compatible keys so the standard fielder routing works for
      // both the live-play and replay branches (INF_MAP[nar.sub] → field key).
      const infChoices = ['the shortstop', 'the second baseman', 'the third baseman', 'the first baseman'];
      const isFielder = pick(infChoices);
      nar.sub = isFielder;
      nar.dir = 'inf'; // valid getBallTgtLocal direction that routes through INF_MAP
      const isTexts = [
        `INFIELD SINGLE! ${batter} legs out a slow roller toward ${isFielder} — beats the throw to first!`,
        `${batter} beats the throw to first! ${isFielder} fields it cleanly... but the throw is JUST late! Infield base hit!`,
        `Slow chopper toward ${isFielder} — ${batter} hustles down the line and beats it out! Infield single!`
      ];
      nar.text = pick(isTexts);
      nar.isInfieldSingle = true;
      nar.isFielder = isFielder;
    }
    // Throwing error narration override (Backlog #105) — fired when the
    // groundOut → single conversion was tagged as a throwing error. Pick an
    // INFIELD position to field the ball cleanly, then narrate the wild
    // throw (E5/E6/E4/E3 depending on the fielder slot). Set the dir to
    // 'inf' so the ball animation lands at an infielder coordinate, matching
    // the infield single ball-flight pattern. Three new narration variants.
    // Suppressed on Texas leaguer / outfield assist (mid-OF-flight overrides
    // that don't apply here since we re-mapped from groundOut).
    if (isThrowError && !isInfieldSingle && !isTexasLeaguer && !isOutfieldAssist) {
      const infChoices = ['the shortstop', 'the second baseman', 'the third baseman', 'the first baseman'];
      const errMap = {
        'the shortstop': 'E6',
        'the second baseman': 'E4',
        'the third baseman': 'E5',
        'the first baseman': 'E3'
      };
      const teFielder = pick(infChoices);
      const errCode = errMap[teFielder];
      nar.sub = teFielder;
      nar.dir = 'inf';
      const teTexts = [
        `THROWING ERROR! ${teFielder} fields the grounder cleanly but airmails the throw to first — ${errCode}, ${batter} reaches safely!`,
        `${teFielder} bobbles the transfer... no, gloves it clean — but the throw PULLS the first baseman off the bag! ${errCode} on the play, ${batter} is safe at first.`,
        `Routine grounder to ${teFielder} — and the throw SAILS into the dugout! ${errCode}! ${batter} gets a free trip to first.`
      ];
      nar.text = pick(teTexts);
      nar.isThrowError = true;
      nar.teFielder = teFielder;
      nar.teErrCode = errCode;
    }
    // Texas leaguer / bloop single narration override (Backlog #91) — soft
    // floating hit that drops between the infielders and outfielders. Force
    // an outfield direction so the ball animation lands in shallow OF, and
    // pick a between-position fielder name (e.g., "between the shortstop
    // and the left fielder") for added flavor. Three narration variants.
    // Productive out narration override (Backlog #108) — re-narrate the routine
    // groundout as a deliberate "right-side ground ball, runner moves up to
    // third" call. Force nar.sub to one of the right-side infielders (1B, 2B,
    // or pitcher) so the ball trajectory lands where a real-baseball
    // productive groundout would. Tag isProductiveOut so the swing handler
    // can flash the badge and the play history preserves the flag for replay
    // parity.
    if (isProductiveOut) {
      // Force nar.sub to a right-side infielder (1B or 2B). Both are in INF_MAP
      // so the standard groundOut fielder animation routes correctly. The
      // pitcher is also a realistic right-side fielder, but he isn't in
      // INF_MAP — narrating "to the pitcher" would fall back to SS for the
      // animation, mismatching the call. So we keep it clean here.
      const rightSide = ['the first baseman', 'the second baseman'];
      nar.sub = pick(rightSide);
      nar.dir = 'inf';
      const runnerName = gs.current.bases[1];
      const lastName = (runnerName || '').split(' ').slice(-1)[0];
      // If a runner on 3B also scored on this groundout, append a run-scoring
      // tag so the announcer call matches the scoreboard. `res.runs` reflects
      // the calculatePlayResult mutation made just above.
      const poScoreSuffix = res.runs > 0 ? (res.runs === 1 ? ' 1 run scores!' : ` ${res.runs} runs score!`) : '';
      const poTexts = [
        `${batter} grounds out to ${nar.sub} — a productive out! ${lastName} moves up to third.${poScoreSuffix}`,
        `${batter} hits it to the right side — out at first, but ${lastName} advances to third base.${poScoreSuffix}`,
        `Smart at-bat by ${batter}! Grounder to ${nar.sub} — he's out, but ${lastName} is now ninety feet from home.${poScoreSuffix}`,
      ];
      nar.text = pick(poTexts);
      nar.isProductiveOut = true;
      nar.poRunner = runnerName;
    }
    // Tag-up advance on a deep fly out (Backlog #142) — one of baseball's most
    // fundamental baserunning plays. On a deep fly ball to the OUTFIELD with
    // fewer than 2 outs, the runner on 2B can tag up after the catch and take
    // third. The engine holds all runners on a non-sac flyOut/lineOut (only the
    // runner on 3B scores, via the sac-fly path), so this fills a real gap.
    // ~35% of qualifying catches. Gated to OUTFIELD directions (nar.dir is
    // lf/cf/rf) — a popup or line drive to an infielder is too quick to tag on.
    // Mutually exclusive with the sac fly (runner already scored from 3B), the
    // infield fly (a popup; batter out, runners hold), the web gem (a running/
    // diving catch — no clean tag) and the robbed HR (a wall catch). Mutation:
    // move the runner from 2B → 3B (3B is guaranteed open here — any runner on
    // 3B with < 2 outs converted to a sac fly upstream). Batter is still out; no
    // run scores; no AB/H/RBI change. Mirrored in simulateGameInstant + replay.
    let isTagUp = false;
    if (['flyOut', 'lineOut'].includes(oc) && !res.isSacFly && !nar.isInfieldFly
        && !isWebGem && !isRobbedHR
        && (nar.dir === 'lf' || nar.dir === 'cf' || nar.dir === 'rf')
        && gs.current.bases[1] && gs.current.outs < 2 && !res.nextBases[2]
        && Math.random() < 0.35) {
      isTagUp = true;
      res.nextBases = [...res.nextBases];
      res.nextBases[2] = gs.current.bases[1];
      res.nextBases[1] = null;
      const tagRunner = gs.current.bases[1];
      const tagRunnerLast = (tagRunner || '').split(' ').slice(-1)[0] || 'the runner';
      const tuTexts = [
        ` ${tagRunnerLast} tags up and takes third!`,
        ` ${tagRunnerLast} tags and motors into third on the throw!`,
        ` And ${tagRunnerLast} tags up — he's in standing at third!`,
      ];
      nar.text = nar.text + pick(tuTexts);
      nar.isTagUp = true;
      nar.tagUpRunner = tagRunner;
      nar.tagUpTo = 3;
    }
    if (isTexasLeaguer) {
      const ofChoices = ['lf', 'cf', 'rf'];
      if (!ofChoices.includes(nar.sub)) nar.sub = pick(ofChoices);
      nar.dir = 'out';
      const gapDescriptors = nar.sub === 'lf'
        ? ['between short and left', 'just over the shortstop', 'in front of the left fielder']
        : nar.sub === 'rf'
          ? ['between second and right', 'just over the second baseman', 'in front of the right fielder']
          : ['into shallow center', 'in front of the center fielder', 'just over the diving second baseman'];
      const tlTexts = [
        `Texas leaguer! ${batter} blooped one ${pick(gapDescriptors)} — just out of reach! Base hit!`,
        `${batter} gets just enough wood on it — a soft floater drops in ${pick(gapDescriptors)} for a single!`,
        `Bloop hit! ${batter} loops one ${pick(gapDescriptors)} — and it falls in for a base hit!`
      ];
      nar.text = pick(tlTexts);
      nar.isTexasLeaguer = true;
    }
    // Squeeze play narration override (Backlog #97) — bunt with a runner on
    // 3rd and fewer than 2 outs is re-narrated as a designed squeeze. The
    // runner from 3rd already scores on every bunt per the existing engine
    // logic (calculatePlayResult mutates `r++` when bases[2] is set), so this
    // is purely a narration / badge / sound layer — no statistical change, no
    // simulateGameInstant mirror needed. ~30% chance whenever the conditions
    // are right. We attribute the run to the runner already on third for the
    // badge tooltip + replay parity.
    const isSqueeze = oc === 'bunt' && gs.current.bases[2] !== null && gs.current.outs < 2 && Math.random() < 0.30;
    if (isSqueeze) {
      const squeezeRunner = gs.current.bases[2];
      const sqTarget = nar.sub || pick(['the third baseman', 'the pitcher', 'the catcher']);
      const sqTexts = [
        `SQUEEZE PLAY! ${batter} drops a perfect bunt toward ${sqTarget} — ${squeezeRunner} sprints home from third! Run scores!`,
        `Suicide squeeze! ${batter} lays it down — ${squeezeRunner} was already running! ${squeezeRunner} crosses the plate!`,
        `SQUEEZE BUNT! ${batter} bunts toward ${sqTarget} — and here comes ${squeezeRunner} from third! He scores!`
      ];
      nar.text = pick(sqTexts);
      nar.isSqueeze = true;
      nar.squeezeRunner = squeezeRunner;
    }
    // Sacrifice bunt narration override (Backlog #111) — bunt with a runner on
    // 1st or 2nd (but NOT 3rd; that's the squeeze, handled above) and fewer
    // than 2 outs, where the batter was retired, gets re-narrated as a
    // designed sacrifice. The bunt engine (calculatePlayResult) already
    // advances runners regardless of out/safe, so this is purely a
    // narration / badge / sound layer — no statistical change, no
    // simulateGameInstant mirror needed. We fire ~55% of the time when
    // conditions are right since real-MLB managers call a sacrifice on the
    // majority of "small-ball" bunt situations. Mutually exclusive with the
    // squeeze (different runner state — squeeze requires bases[2], sac bunt
    // forbids it). Suppressed if the batter beat the throw (outsAdded === 0
    // means the bunt was an infield single, not a sacrifice).
    const sacBuntEligible = oc === 'bunt'
      && res.outsAdded > 0
      && !nar.isSqueeze
      && gs.current.bases[2] === null
      && (gs.current.bases[0] !== null || gs.current.bases[1] !== null)
      && gs.current.outs < 2;
    const isSacBunt = sacBuntEligible && Math.random() < 0.55;
    if (isSacBunt) {
      // Identify the lead runner advancing — prefer the runner on 2nd (who
      // moves to 3rd, ninety feet from home) over the runner on 1st (who
      // moves into scoring position). Used for badge tooltip + replay parity.
      const leadRunner = gs.current.bases[1] || gs.current.bases[0];
      const advancedTo = gs.current.bases[1] ? 'third' : 'second';
      const sbTarget = nar.sub || pick(['the third baseman', 'the pitcher', 'the first baseman']);
      const lastName = (leadRunner || '').split(' ').slice(-1)[0];
      const sbTexts = [
        `SAC BUNT! ${batter} gives himself up — drops it down to ${sbTarget}, ${lastName} moves to ${advancedTo}.`,
        `Textbook sacrifice bunt by ${batter} toward ${sbTarget} — out at first, but ${lastName} advances to ${advancedTo}. Small ball wins the day.`,
        `${batter} squares early and lays one down to ${sbTarget} — easy out, but ${lastName} is now at ${advancedTo}. Productive at-bat.`
      ];
      nar.text = pick(sbTexts);
      nar.isSacBunt = true;
      nar.sacBuntRunner = leadRunner;
      nar.sacBuntAdvancedTo = advancedTo;
    }
    // Drag bunt single narration override (Backlog #139) — when a bunt with
    // BASES EMPTY (no force play, no squeeze context, no sacrifice context)
    // beats the throw to first, re-narrate as an explicit "drag bunt single"
    // rather than the misleading default "sacrifice bunt to X" copy. The
    // engine's `calculatePlayResult` already produces the ~25% beat-the-throw
    // rate on bunts (`if (Math.random() < 0.25) outsAdded = 0`), and the
    // existing bunt-hit stat path (`oc === 'bunt' && res.outsAdded === 0`)
    // already credits the hit and increments team hits. So this is purely a
    // narration / badge / sound layer on top of the existing safe-bunt
    // pathway. Mutually exclusive with squeeze (bases[2] required) and
    // sac bunt (bases[0] or bases[1] required + res.outsAdded > 0) by virtue
    // of the bases-empty gate. No out count gate — a drag bunt that beats
    // the throw counts as a hit regardless of how many outs there are. No
    // `simulateGameInstant` mirror needed — the engine output is identical
    // (still a hit), and the sim doesn't render narration / badges anyway.
    const isDragBunt = oc === 'bunt'
      && res.outsAdded === 0
      && !nar.isSqueeze
      && !nar.isSacBunt
      && gs.current.bases[0] === null
      && gs.current.bases[1] === null
      && gs.current.bases[2] === null;
    if (isDragBunt) {
      const dbTarget = nar.sub || pick(['the third baseman', 'the pitcher', 'the first baseman']);
      const dbTexts = [
        `DRAG BUNT! ${batter} drops one down the line toward ${dbTarget} and BEATS the throw to first! Infield single!`,
        `${batter} catches the defense napping with a perfect drag bunt toward ${dbTarget} — and he's SAFE at first! Bunt single!`,
        `${batter} pushes a beautiful bunt toward ${dbTarget} — sprints down the line — and BEATS the throw! Drag bunt single!`
      ];
      nar.text = pick(dbTexts);
      nar.isDragBunt = true;
    }
    // Inside-the-park home run narration override (Idea #83) — convert the
    // canned HR narration into a "ball-stays-in-the-park, runner-circles-em"
    // call. Force nar.dir to 'out' and nar.sub to a deep outfield position
    // (with a slight bias to CF — the gap where most ITPHRs happen) so the
    // ball animation lands in the deepest part of the park. Variant 2 keeps
    // the trajectory deep and rolling rather than soaring over the fence.
    if (isInsideThePark) {
      // ~50% CF, 25% LF, 25% RF — biases the ball into the gap or off the wall.
      const r = Math.random();
      nar.sub = r < 0.5 ? 'cf' : r < 0.75 ? 'lf' : 'rf';
      nar.dir = 'out';
      nar.variant = 2;
      const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
      const itpTexts = [
        `INSIDE THE PARK! ${batter} drives one to the gap — the ${fielderName} chases it down, but ${batter} is rounding third... HE'S GOING ALL THE WAY! INSIDE-THE-PARK HOME RUN!`,
        `AROUND THE BASES! ${batter} hits one off the wall — no chance for the cutoff man! INSIDE-THE-PARK HOME RUN for ${batter}!`,
        `${batter} legs out an INSIDE-THE-PARK HOMER! Ball rattles around in the corner, the ${fielderName} can't catch up — and ${batter} beats the throw to the plate!`
      ];
      nar.text = pick(itpTexts);
      nar.isInsideThePark = true;
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
    // Bang-bang play at first (Backlog #75) — ~15% of routine groundouts get a
    // dramatic close-call treatment: the runner slides headfirst into 1B with a
    // dust puff timed to the ball's arrival, info-bar badge flashes, and three
    // alternative narration variants fire. Pure flavor — outcome is unchanged.
    // Gated to groundOuts where the throw actually goes to 1B (no force at 2B),
    // and disabled for double plays. We compute it BEFORE narration is finalized
    // so we can swap the narration text in.
    // Suppress bang-bang at first when the play is already a "productive out"
    // narration — the focus is on the runner advancing, not the close call.
    const isBangBang = oc === 'groundOut' && !gs.current.bases[0] && !nar.isProductiveOut && Math.random() < 0.15;
    if (isBangBang) {
      const bbTexts = [
        `Bang-bang play at first — ${batter} is OUT by a step!`,
        `Just barely got him at first! ${batter} grounded out — close one!`,
        `Photo finish at the bag — OUT! ${batter} hustled all the way down the line.`,
      ];
      nar.text = pick(bbTexts);
      nar.isBangBang = true;
      // Flying helmet (Backlog #96) — ~50% chance the helmet pops off on the
      // headfirst slide. Roll here so live + replay both see the same outcome
      // via the persisted `helmetOff` flag on playHistory.
      nar.helmetOff = Math.random() < 0.5;
    }
    // Diving stop by infielder (Backlog #93) — ~6% of routine groundouts get
    // re-narrated as a spectacular diving stop. The fielder lays out fully
    // extended, gloves the ball, pops up, and throws to first to retire the
    // runner. Outcome stays groundOut — pure flavor on top of the standard
    // groundout pathway. Suppress when bang-bang or challenge already triggered
    // (mutually exclusive flavor cases). We pre-pick the fielder here so the
    // narration text and the visual point use the same infielder consistently.
    const isDivingStop = oc === 'groundOut' && !nar.isBangBang && !nar.isChallenge && !nar.isProductiveOut && !nar.isHitAndRun && Math.random() < 0.06;
    if (isDivingStop) {
      // Pick an infielder (not the catcher, not the pitcher). Use the
      // existing `nar.sub` if it's already an infielder, else pick fresh.
      const infOptions = ['the shortstop', 'the second baseman', 'the third baseman', 'the first baseman'];
      const dsFielder = pick(infOptions);
      const dsTexts = [
        `WHAT A PLAY! ${dsFielder.charAt(0).toUpperCase() + dsFielder.slice(1)} dives full extension to glove the grounder — pops up and throws to first for the OUT!`,
        `DIVING STOP by ${dsFielder}! Spectacular play! He throws on from his knees — got ${batter} at first!`,
        `${batter.split(' ').slice(-1)[0]} hammers a grounder — ${dsFielder} lays out for a phenomenal stop! Quick recovery, throw to first — OUT!`,
      ];
      nar.text = pick(dsTexts);
      nar.isDivingStop = true;
      nar.dsFielder = dsFielder;
      // Force nar.sub to the chosen infielder so the standard fielder-animate
      // block routes the ball-throw to the same person making the dive.
      nar.sub = dsFielder;
    }
    // Pitcher comebacker / 1-3 putout (Backlog #126) — ~5% of routine groundOut
    // outcomes get re-narrated as a sharp comebacker right at the pitcher. The
    // pitcher fields the ball cleanly (or knocks it down) and throws to first
    // for the out. Outcome stays groundOut — pure flavor on top of the standard
    // groundout pathway. Mutually exclusive with bang-bang / diving stop /
    // productive out / challenge (each is its own flavor case on the same
    // groundOut). Force nar.sub = 'the pitcher' so the standard fielder-animate
    // block routes the ball through F.P (the pitcher's mound) and then on to
    // first base — same pathway as any other infielder, just with the pitcher
    // as the chosen fielder via the new INF_MAP entry.
    const isComebacker = oc === 'groundOut' && !nar.isBangBang && !nar.isDivingStop && !nar.isProductiveOut && !nar.isChallenge && !nar.isHitAndRun && Math.random() < 0.05;
    if (isComebacker) {
      // The game doesn't model a specific pitcher name (teams have a flat
      // `players` array, no positional roster). For narration purposes we
      // use the generic "the pitcher" — same convention as INF_MAP entries.
      // The cbPitcher field is persisted to playHistory so replay shows the
      // same attribution. Pitcher-name placeholder format ("The pitcher")
      // capitalized at sentence start, lowercase mid-sentence for natural
      // flow.
      const cbTexts = [
        `Comebacker! The pitcher knocks it down and throws to first for the out!`,
        `Right back at the pitcher! He fields it cleanly — 1-3 putout!`,
        `${batter} smashes one up the middle — but the pitcher reacts in time! Throw to first... OUT!`,
      ];
      nar.text = pick(cbTexts);
      nar.isComebacker = true;
      nar.cbPitcher = 'the pitcher';
      // Force nar.sub to 'the pitcher' so the standard fielder-animate block
      // routes ball-throw through F.P. The new INF_MAP entry maps it cleanly.
      nar.sub = 'the pitcher';
    }
    // Fielder's choice (Backlog #137) — ~50% of `groundOut` outcomes with the
    // runner-on-1B-only base state (no other runners, < 2 outs) get re-narrated
    // as an explicit fielder's choice: the infielder fields the grounder,
    // throws to 2B for the force out on the lead runner, and the batter
    // reaches first safely on the throw. The existing engine pathway at
    // calculatePlayResult line 707-711 ALREADY produces FC base-state behavior
    // for groundOut+bases[0]: nextBases[0]=batter, runner-from-1B is gone
    // (forced out at 2B), outsAdded=1. The ball animation at line ~8803
    // already routes through F.B2 when r1=true (force play at 2B, not 1B).
    // So this is purely a narration / badge / sound layer making the existing
    // FC behavior visible — no engine mutation, no stat change. Suppress on
    // every other groundOut flavor case to keep the focus on the FC moment.
    let isFieldersChoice = false;
    let fcRunnerName = null;
    if (oc === 'groundOut'
        && gs.current.bases[0] && !gs.current.bases[1] && !gs.current.bases[2]
        && gs.current.outs < 2
        && !nar.isBangBang && !nar.isProductiveOut && !nar.isDivingStop
        && !nar.isChallenge && !nar.isComebacker && !nar.isHitAndRun
        && Math.random() < 0.50) {
      isFieldersChoice = true;
      fcRunnerName = gs.current.bases[0];
      // Last-name preferred for snappier narration (matches the existing
      // first-to-third / productive-out runner attribution convention).
      const fcRunnerLast = fcRunnerName.split(' ').slice(-1)[0];
      // Re-pick a right-side or middle infielder so the narration mentions
      // the natural force-play fielder (SS or 2B — same fielder that the
      // animation routes through). Falls back to nar.sub if it's already a
      // middle infielder, otherwise overrides to keep the narration coherent
      // with the ball trajectory.
      let fcFielder = nar.sub;
      if (fcFielder !== 'the shortstop' && fcFielder !== 'the second baseman') {
        fcFielder = Math.random() < 0.55 ? 'the shortstop' : 'the second baseman';
        nar.sub = fcFielder; // ensures the animateFielder block routes through the right infielder
      }
      const fcTexts = [
        `Fielder's choice! ${batter} grounds to ${fcFielder} — the throw to second forces ${fcRunnerLast}, ${batter} safe at first.`,
        `${batter} hits one to ${fcFielder} — they go to second for the force on ${fcRunnerLast}! ${batter} beats the relay and reaches first on the fielder's choice.`,
        `Fielder's choice by ${fcFielder}! ${fcRunnerLast} forced out at second base. ${batter} reaches first on the play.`,
      ];
      nar.text = pick(fcTexts);
      nar.isFieldersChoice = true;
      nar.fcRunner = fcRunnerName;
    }
    // Tip of the cap (Backlog #100) — after a defensive gem (web gem, diving
    // stop, robbed HR, or outfield assist at home), ~70% chance the pitcher
    // tips his cap toward the fielder who saved him. Pure flavor — purely a
    // post-play visual / sound / badge layered on top of the gem's existing
    // animation flow. Gated to a single roll: if any of the four flags is set,
    // we may fire one tip-cap. The fielder name is captured so the badge and
    // replay can render the correct attribution.
    if ((isWebGem || nar.isRobbedHR || nar.isDivingStop || nar.isOutfieldAssist) && Math.random() < 0.70) {
      let tcFielder = 'the fielder';
      if (nar.isRobbedHR) {
        tcFielder = nar.sub === 'lf' ? 'the left fielder' : nar.sub === 'cf' ? 'the center fielder' : 'the right fielder';
      } else if (nar.isOutfieldAssist) {
        tcFielder = nar.oaFielder || 'the outfielder';
      } else if (nar.isDivingStop) {
        tcFielder = nar.dsFielder || 'the infielder';
      } else if (isWebGem) {
        tcFielder = nar.sub === 'lf' ? 'the left fielder' : nar.sub === 'cf' ? 'the center fielder' : nar.sub === 'rf' ? 'the right fielder' : nar.sub;
      }
      nar.fireTipCap = true;
      nar.tipCapFielder = tcFielder;
    }
    // Brushback / chin music (Backlog #94) — ~3.5% of `ball` outcomes get
    // re-narrated as a high-and-tight "purpose pitch" that the batter has to
    // dodge. Pure flavor — the pitch is still scored as a regular ball, no
    // statistical change, no walk forced. Gated to early-count situations
    // (0–1 strikes) and a mild "narrative pretext" — runners on base, a
    // batter who's already hit the pitcher hard this game, or a high-leverage
    // late inning — so it doesn't fire on every random ball-1 in the 1st.
    // The conversion fires AFTER `narrateLocal` so we just override the
    // text and flag `nar.isBrushback` for the swing handler to pick up.
    const _bbStrikes = gs.current.count.strikes;
    const _bbBatterStats = statsRef.current[bt][batter];
    const _bbHotBatter = _bbBatterStats && (_bbBatterStats.h || 0) >= 2;
    const _bbHasRunner = gs.current.bases.some(r => r);
    const _bbLateInning = gs.current.inning >= 7;
    const _bbContext = _bbHasRunner || _bbHotBatter || _bbLateInning;
    const isBrushback = oc === 'ball' && _bbStrikes <= 1 && _bbContext && Math.random() < 0.035;
    if (isBrushback) {
      const bbTexts = [
        `Chin music! ${batter} ducks out of the way as a heater sails high and tight! Ball.`,
        `${batter} bails out — that fastball came up and in! The umpire calls it a ball.`,
        `Brushback pitch! ${batter} hits the dirt as the ball whistles past. Ball, no count change on a free one.`,
      ];
      nar.text = pick(bbTexts);
      nar.isBrushback = true;
    }
    // Manager challenge / replay review (Idea #80) — ~4% chance on close groundouts
    // at first base in the 6th inning or later. The defensive manager runs out to
    // challenge the call. ~70% of challenges are upheld (the call stands — out),
    // ~30% are overturned (runner ruled safe → batter ends up on 1B with a single).
    //
    // The ball animation always runs as a groundOut (ball → fielder → throw to 1B)
    // so the user sees the close call. After the ball arrives at 1B, the review
    // overlay appears (~1.6s reviewing + ~1.0s verdict). If overturned, we then
    // animate the batter trotting HP→B1 and apply a "ruled safe" single result.
    // The pre-computed `res` (groundOut) is preserved for the upheld case;
    // `nar.challengeOverturnedRes` carries the hypothetical single result for the
    // swing handler to apply if overturned.
    // Suppress challenge review when the play has already been re-narrated as a
    // productive out — the focus is on the runner advancing to 3B, and the
    // outcome state already reflects the productive advancement.
    if (oc === 'groundOut' && !gs.current.bases[0] && !nar.isProductiveOut && !nar.isComebacker && gs.current.inning >= 6 && Math.random() < 0.04) {
      const challengeOverturned = Math.random() < 0.30;
      if (challengeOverturned) {
        // Compute the "ruled safe" single result up-front so the swing handler
        // can apply it cleanly when the verdict comes back. Bases / outs are
        // captured pre-out, exactly the state we want to advance from.
        const safeRes = calculatePlayResult(gs.current, 'single', batter);
        nar.challengeOverturnedRes = safeRes;
        // The bang-bang flag was set on the groundOut; clear it since the
        // outcome will be a single after review. Same goes for the helmet-off
        // roll that piggybacks on bang-bang — the slide doesn't happen since
        // the play is overturned to a single.
        nar.isBangBang = false;
        nar.helmetOff = false;
      }
      const reviewTexts = challengeOverturned
        ? [
            `Manager challenges the call! After review... CALL OVERTURNED — ${batter} is SAFE at first! Single!`,
            `Under review at first... and the umpires reverse the call — ${batter} reaches on a base hit!`,
            `Replay review: the original out call is OVERTURNED. ${batter} beats the throw — single ruled!`,
          ]
        : [
            `Manager challenges! After review, the call STANDS — ${batter} is OUT at first.`,
            `Replay review at first... and the original ruling is confirmed. ${batter} grounded out.`,
            `Under review... CALL STANDS. ${batter} grounded out, the throw was in time.`,
          ];
      nar.text = pick(reviewTexts);
      nar.isChallenge = true;
      nar.challengeOverturned = challengeOverturned;
    }
    // Foul ball into stands — fan grabs a souvenir (Idea #81). ~25% chance on
    // any foul ball that the ball arcs into the stands and a fan reaches up to
    // snag it. Pure cosmetic — the foul ball still counts as a strike per the
    // existing engine logic. Anchored to a stands-area coordinate scaled to
    // the foul direction the batter naturally pulls (lefties pull right,
    // righties pull left).
    const isFanGrab = oc === 'foulBall' && Math.random() < 0.25;
    if (isFanGrab) {
      const foulSide = batterSide === 'L' ? 1 : -1;
      // Fan position in stands (above home plate, beyond foul line).
      // BaseballField viewBox spans roughly x=[0..620], y=[0..520].
      // Place fan in stands area on the foul side, well above the play.
      const fanX = F.HP.x + foulSide * (130 + Math.random() * 30);
      const fanY = 80 + Math.random() * 14; // stands area near top of field
      nar.isFanGrab = true;
      nar.fanGrab = { x: fanX, y: fanY };
      // Decorative narration — append a brief "into the stands" tag, but only
      // when narrateLocal didn't already produce a long sentence. Variant 0–2
      // exist for foulBall so this just adds a visual flair to the broadcast.
      const fgTexts = [
        `${nar.text} A fan in the stands snags the souvenir!`,
        `${nar.text} Lucky fan reaches up for the souvenir!`,
        `${nar.text} The ball sails into the stands — and a fan grabs it!`,
      ];
      nar.text = pick(fgTexts);
    }
    // Foul ball straight back to the screen (Backlog #127) — ~30% of plain
    // foul-ball strikes (NOT foulOut, NOT foulTip) take a "straight back"
    // trajectory: the batter just barely tips the ball off the top of the
    // bat and it sails up and backward over the catcher's head into the
    // protective netting. Suppressed when a fan-grab souvenir already fired
    // (those send the ball into the foul-side stands instead — different
    // trajectory) and when the play is a foulTip (a 2-strike strikeout
    // conversion that already has its own visual flair). Pure cosmetic —
    // still counts as a strike per the existing engine logic. The ball
    // trajectory override is consumed by the swing handler in the foulBall
    // branch (line ~7455 sibling).
    const isBackstop = oc === 'foulBall' && !nar.isFanGrab && !nar.isFoulTip && Math.random() < 0.30;
    if (isBackstop) {
      const _bsStrikes = gs.current.count.strikes < 2 ? gs.current.count.strikes + 1 : 2;
      const bsTexts = [
        `Foul straight back! Off the screen behind the plate. Strike ${_bsStrikes}.`,
        `Fouled back over the catcher's head! Into the netting. Strike ${_bsStrikes}.`,
        `${batter} barely gets a piece of it — straight back to the screen! Strike ${_bsStrikes}.`,
      ];
      nar.text = pick(bsTexts);
      nar.isBackstop = true;
    }
    // Manager ejection (Backlog #95) — ~1.8% chance per strikeout (called or
    // swinging) on close-count strikeouts (1-2, 2-2, 3-2 — counts where a
    // borderline call could plausibly anger the offensive manager). After the
    // K, the offensive team's manager comes out to argue, gestures heatedly,
    // and gets tossed by the home plate umpire with the classic thumb-jab
    // "you're outta here!" gesture. Pure flavor — strikeout still counts, no
    // gameplay change. The flag is threaded into play history so replay
    // mirrors the live animation. Suppressed when bD is already a special
    // case (dropped 3rd strike — the play is still live and there's no time
    // for an argument). The pre-K count is inspected since the count resets
    // on the strikeout: we recover it from gs.current.count BEFORE the
    // strikeout has been processed (this code runs in narrateLocal phase,
    // before count mutations).
    const _ejPreBalls = gs.current.count.balls;
    const _ejPreStrikes = gs.current.count.strikes;
    const _ejCloseCount = (_ejPreStrikes === 2) && (_ejPreBalls === 1 || _ejPreBalls === 2 || _ejPreBalls === 3);
    const isEjection = oc === 'strikeout' && !nar.isDropped3rd && !nar.isFoulTip && _ejCloseCount && Math.random() < 0.018;
    if (isEjection) {
      const _ejTeamName = teams[bt].name;
      const ejTexts = [
        `${nar.text} ${_ejTeamName} manager storms out to argue the call... and HE'S EJECTED! The home plate umpire tosses him!`,
        `${nar.text} ${_ejTeamName} manager comes out HOT — and the umpire signals... YOU'RE OUTTA HERE! Manager EJECTED!`,
        `${nar.text} ${_ejTeamName} manager rushes the plate to argue — and there's the thumb! The skipper has been TOSSED!`,
      ];
      nar.text = pick(ejTexts);
      nar.isEjection = true;
      nar.ejectionTeamName = _ejTeamName;
    }
    // Catcher's mask toss on pop-up (Backlog #98) — fires on ~75% of foulOut
    // outcomes. Pure flavor — fires alongside the standard foulOut catch
    // animation. The catcher whips his mask off in foul territory while
    // tracking the popup overhead, then squeezes the ball for the out. Persists
    // `nar.isMaskToss` so the swing handler triggers the SVG/sound/badge and
    // replay mirrors live behavior identically. No mechanical effect — runs
    // on top of the standard foulOut pathway.
    if (oc === 'foulOut' && Math.random() < 0.75) {
      nar.isMaskToss = true;
    }
    // Catcher's blocked pitch in the dirt (Backlog #112) — ~4% of `ball`
    // outcomes get re-narrated as a pitch that bounces in the dirt and the
    // catcher dives forward to block it. Gated to bases-empty (so no
    // wild-pitch behavior is needed) and mutually exclusive with brushback
    // (already has its own special-trajectory pitch). Pure flavor — still
    // scored as a regular ball. Persists `nar.isBlocked` so the swing handler
    // re-routes the ball trajectory to the dirt and fires the dive pose,
    // dust puffs, sound, and badge. Replay mirrors live behavior identically.
    if (oc === 'ball' && !nar.isBrushback
        && !gs.current.bases[0] && !gs.current.bases[1] && !gs.current.bases[2]
        && Math.random() < 0.04) {
      // Pick a fresh pitch type for the dirt-block narration. The standard
      // 'ball' narration already mentioned a pitch type internally but didn't
      // expose it on `nar`, so we choose one here (a curveball or slider is
      // the most realistic pitch to bounce in the dirt, but we allow any).
      const _bpPt = pick(['curveball', 'slider', 'changeup', 'fastball']);
      const _bpB = gs.current.count.balls + 1;
      const _bpS = gs.current.count.strikes;
      const blkTexts = [
        `${_bpPt.charAt(0).toUpperCase() + _bpPt.slice(1)} in the dirt — and the catcher SMOTHERS it! Ball ${_bpB}-${_bpS}.`,
        `Bounced ${_bpPt} — blocked by the catcher! Ball ${_bpB}-${_bpS}.`,
        `Tough block by the catcher on a ${_bpPt} in the dirt — keeps it in front. Ball ${_bpB}-${_bpS}.`,
      ];
      nar.text = pick(blkTexts);
      nar.isBlocked = true;
    }
    // Catcher framing pitches (Backlog #130) — one of baseball's most studied
    // modern defensive skills. ~15% of `ball` outcomes get a framing attempt
    // by the catcher; ~30% of those convert to a called strike when the
    // umpire bites on the borderline call. Gated to count.balls < 3 AND
    // count.strikes < 2 — no walk-prevention (a 3-ball count where the call
    // converts would steal a walk, which is much bigger than stealing a
    // borderline strike), no surprise strikeouts (a 2-strike count where the
    // call converts would generate a K out of thin air). Mutually exclusive
    // with brushback (chin music is too far off the plate to frame),
    // blocked pitches (the ball is in the dirt — nothing to frame), and
    // 4-ball walks (the 4th ball can't be framed mid-AB). The successful-
    // frame conversion re-maps `oc` from 'ball' to 'strike' BEFORE the
    // downstream pitch-flight + processOutcome run — so the count
    // increments naturally through the strike pathway, no special engine
    // plumbing needed. Even without conversion, the framing animation
    // (catcher's glove rotates subtly inward toward the strike zone after
    // the catch) and the soft `frameMitt` leather creak still play, since
    // that's what the catcher actually did regardless of how the ump called
    // it. The badge only flashes when the call converts (the visual carries
    // the cosmetic-only attempts — the badge is reserved for the moment the
    // umpire actually rings it up).
    if (oc === 'ball' && !nar.isBrushback && !nar.isBlocked
        && gs.current.count.balls < 3 && gs.current.count.strikes < 2
        && Math.random() < 0.15) {
      nar.isFraming = true;
      if (Math.random() < 0.30) {
        nar.isFramed = true;
        oc = 'strike';
        const _frPt = pick(['curveball', 'slider', 'sinker', 'fastball', 'changeup']);
        const _frB = gs.current.count.balls;
        const _frS = gs.current.count.strikes + 1; // count after the strike increments
        const frTexts = [
          `The catcher held it dead still — the umpire calls strike on the borderline ${_frPt}! Count ${_frB}-${_frS}.`,
          `Beautifully framed ${_frPt} by the catcher — and he gets the call! Strike ${_frB}-${_frS}.`,
          `Right on the corner — the catcher snags it and the ump rings it up. Strike ${_frB}-${_frS}.`,
        ];
        nar.text = pick(frTexts);
      }
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
    // Steal of home (Backlog #101) — ~0.5% chance per non-contact pitch with a
    // runner on 3B and < 2 outs (and inning ≥ 2). One of baseball's rarest and
    // most exciting plays — the runner breaks for home as the pitch is
    // delivered, slides under the catcher's tag (or gets gunned down).
    // ~55% success rate (slightly lower than regular SBs since the catcher is
    // right there waiting). Mutually exclusive with regular stolen base events
    // (rare to have multiple steals in flight on one pitch).
    let stealHomeEvent = null;
    if (!stolenBaseEvent && isNonContactPitch && gs.current.bases[2] && gs.current.outs < 2 && gs.current.inning >= 2 && Math.random() < 0.005) {
      stealHomeEvent = { runner: gs.current.bases[2], success: Math.random() < 0.55 };
    }
    // Double steal (Backlog #144) — with runners on 1st AND 2nd (3B open) and
    // < 2 outs, ~5% chance on a non-contact pitch that BOTH runners break. The
    // existing single-steal candidate logic above can't produce this (a 1B→2B
    // steal requires 2B empty), so a true double steal was structurally
    // impossible before. The lead runner (2B→3B) goes uncontested; the defense's
    // only play is the throw through to 2B for the trail runner, who is safe
    // ~82% and gunned down ~18%. Mutually exclusive with the single steal and
    // steal of home. Gated to outs < 2 so a caught trail runner can never be the
    // 3rd out (the inning never ends on the play — same invariant the other
    // steal paths rely on).
    let doubleStealEvent = null;
    if (!stolenBaseEvent && !stealHomeEvent && isNonContactPitch
      && gs.current.bases[0] && gs.current.bases[1] && !gs.current.bases[2]
      && gs.current.outs < 2 && Math.random() < 0.05) {
      doubleStealEvent = { leadName: gs.current.bases[1], trailName: gs.current.bases[0], trailSuccess: Math.random() < 0.82 };
    }

    const doesStepOut = Math.random() < 0.15;
    const stepOutDelay = doesStepOut ? 1200 : 0;
    // Cleat-knock pre-pitch routine (Backlog #109) — ~10% chance the batter taps
    // the dirt out of his cleats with the bat before settling in. Mutually
    // exclusive with stepOut (only one pre-pitch routine per pitch, to keep
    // pacing brisk). Suppressed for HBP outcomes (the pitch is already a
    // special-trajectory case) and when a stolen-base or steal-of-home event
    // is queued for this pitch (those plays need their own deliberate timing).
    // Pure cosmetic — no gameplay effect. Adds a small ~750ms window where the
    // cleatKnock pose animates the foot lift + bat tap cycle.
    const doesCleatKnock = !doesStepOut && !stealHomeEvent && !stolenBaseEvent && !doubleStealEvent && oc !== 'hbp' && Math.random() < 0.10;
    const cleatKnockDelay = doesCleatKnock ? 750 : 0;
    // Catcher flashes signs (1-4 fingers) between his legs during the windup — the classic
    // pre-pitch tell. A fresh random count is picked per pitch so signs animate visibly.
    const signCount = 1 + Math.floor(Math.random() * 4);
    // Pitcher shake-off (Backlog #104) — ~25% chance the pitcher shakes off the
    // first sign and the catcher cycles to a fresh one. Suppressed when the
    // batter steps out (no time for both pre-pitch atmospheres on one pitch),
    // when there's a steal-of-home or stolen-base event in flight (don't
    // delay the deliberate timing of those plays), and on HBP outcomes (the
    // pitch is already a special-trajectory case).
    // Pitcher shake-off is suppressed when the cleat-knock routine is in flight
    // too — pacing-wise we don't want two pre-pitch atmospheres stacked on the
    // same pitch.
    const doesShakeOff = !doesStepOut && !doesCleatKnock && !stealHomeEvent && !stolenBaseEvent && !doubleStealEvent && oc !== 'hbp' && Math.random() < 0.25;
    const shakeOffDelay = doesShakeOff ? 700 : 0;
    // Pitcher's brow wipe (Backlog #113) — pre-pitch atmospheric flavor for
    // fatigued pitchers in the 6th inning or later when the defensive pitcher
    // has thrown 50+ pitches (so the gesture reads as "this guy is working").
    // ~8% chance per pitch. Mutually exclusive with stepOut / cleatKnock /
    // shakeOff so only one pre-pitch atmosphere fires per pitch (pacing
    // brisk). Suppressed during stolen-base / steal-of-home events (those
    // need their own timing) and on HBP outcomes (special-trajectory pitch).
    // Adds 750ms to the pitch-timing pipeline alongside the other delays.
    const doesBrowWipe = !doesStepOut && !doesCleatKnock && !doesShakeOff
      && !stealHomeEvent && !stolenBaseEvent && !doubleStealEvent && oc !== 'hbp'
      && gs.current.inning >= 6 && gs.current.pitchCount[defTeam] >= 50
      && Math.random() < 0.08;
    const browWipeDelay = doesBrowWipe ? 750 : 0;
    // Pitcher check-the-runner at 1B (Backlog #116) — when there's a runner on
    // 1B and < 2 outs (the classic "holding the runner" scenario), ~35% chance
    // per pitch the pitcher visibly turns his head over his right shoulder to
    // check the runner before delivering. Mutually exclusive with stepOut /
    // cleatKnock / shakeOff / browWipe so only one pre-pitch atmosphere fires
    // per pitch (pacing brisk). Suppressed during stolen-base / steal-of-home
    // events (those have their own dedicated timing) and on HBP outcomes
    // (special-trajectory pitch). Adds ~700ms to the pitch-timing pipeline.
    // Pure cosmetic — no gameplay effect — completes the runner-on-first
    // defensive ritual story alongside F1B holds the runner (#106), runner
    // leadoff (#70), F1B stretch (#114), and pickoff (#64).
    const doesCheckRunner = !doesStepOut && !doesCleatKnock && !doesShakeOff && !doesBrowWipe
      && !stealHomeEvent && !stolenBaseEvent && !doubleStealEvent && oc !== 'hbp'
      && gs.current.bases[0] && gs.current.outs < 2
      && Math.random() < 0.35;
    const checkRunnerDelay = doesCheckRunner ? 700 : 0;
    // Pitcher's sign acceptance nod (Backlog #131) — pure-cosmetic companion
    // to shake-off. When the pitcher does NOT shake off, ~20% chance per
    // pitch he gives a small confirmation nod accepting the catcher's first
    // sign before delivering. Mutually exclusive with all other pre-pitch
    // atmospheres (stepOut / cleatKnock / shakeOff / browWipe / checkRunner)
    // so only one pre-pitch ritual fires per pitch (pacing brisk).
    // Suppressed during stolen-base / steal-of-home events (those have their
    // own dedicated timing) and on HBP outcomes (special-trajectory pitch).
    // Adds ~500ms to the pitch-timing pipeline alongside the other delays.
    // Completes the pre-pitch ritual story alongside shake-off (#104), 3B/1B
    // coaches (#82/#92), catcher signs (#57), check-the-runner (#116), and
    // the rest of the pre-pitch atmospheres — every pitch now has either an
    // accept or a decline visible on the mound.
    const doesSignNod = !doesStepOut && !doesCleatKnock && !doesShakeOff && !doesBrowWipe && !doesCheckRunner
      && !stealHomeEvent && !stolenBaseEvent && !doubleStealEvent && oc !== 'hbp'
      && Math.random() < 0.20;
    const signNodDelay = doesSignNod ? 500 : 0;
    if (doesStepOut) {
      setBatterPhase('stepOut');
      setTimeout(() => setBatterPhase('stance'), 800);
      // Third base coach sign animation (Idea #82) — bump the key to remount
      // the SVG so the sign sequence restarts cleanly on every windup.
      setTimeout(() => { setPitchPhase('windup'); setCatcherSigns(signCount); setCoachSignKey(k => k + 1); }, stepOutDelay);
    } else if (doesCleatKnock) {
      // Cleat-knock pre-pitch routine (Backlog #109) — show the batter tapping
      // dirt out of his cleats for ~700ms, then settle back to stance and
      // begin the windup. Mirrors the stepOut timing pattern so existing
      // downstream delays (stepOutDelay/shakeOffDelay/cleatKnockDelay) can be
      // summed cleanly when the pitch flies later in this same effect.
      setBatterPhase('cleatKnock');
      setTimeout(() => setBatterPhase('stance'), 700);
      setTimeout(() => { setPitchPhase('windup'); setCatcherSigns(signCount); setCoachSignKey(k => k + 1); }, cleatKnockDelay);
    } else if (doesBrowWipe) {
      // Brow wipe pre-pitch routine (Backlog #113) — show the pitcher wiping
      // sweat from his brow for ~700ms before the windup. The wipeBrow pose
      // takes priority over the standard pitchPhase render (see BaseballField),
      // so we set the flag here and clear it after the gesture completes.
      // The batter stays in his standard stance. The catcher's signs and
      // coaches' gestures still fire on the windup transition that comes
      // after the wipe completes.
      setPitcherBrowWipe(true);
      setBrowWipeBadge({ team: defTeam });
      if (sndRef.current) playSoundLocal('browWipe');
      setBatterPhase('stance');
      setTimeout(() => setPitcherBrowWipe(false), 700);
      setTimeout(() => setBrowWipeBadge(null), 1600);
      setTimeout(() => { setPitchPhase('windup'); setCatcherSigns(signCount); setCoachSignKey(k => k + 1); }, browWipeDelay);
    } else if (doesCheckRunner) {
      // Check-the-runner pre-pitch routine (Backlog #116) — show the pitcher
      // come set and turn his head over his right shoulder to look at the
      // runner on 1B for ~700ms, then return to forward and begin the windup.
      // The checkRunner pose takes priority over the standard pitchPhase
      // render (see BaseballField), so we set the flag here and clear it
      // after the gesture completes. The batter stays in his standard stance.
      // Pure cosmetic — no sound (real head-checks are silent).
      setPitcherCheckRunner(true);
      setCheckRunnerBadge({ team: defTeam });
      setBatterPhase('stance');
      setTimeout(() => setPitcherCheckRunner(false), 700);
      setTimeout(() => setCheckRunnerBadge(null), 1600);
      setTimeout(() => { setPitchPhase('windup'); setCatcherSigns(signCount); setCoachSignKey(k => k + 1); }, checkRunnerDelay);
    } else if (doesSignNod) {
      // Sign acceptance nod (Backlog #131) — show the catcher's signs first,
      // THEN fire the nod ~250ms in so the visual reads as "see the sign →
      // nod yes → deliver." The nod itself is a forward head-tilt cycled
      // twice over 500ms (handled by the SVGPitcher's headNod prop). The
      // batter stays in his standard stance. No sound (silent gesture).
      // After the nod completes, the windup phase fires through the same
      // signNodDelay-aligned timeout pattern as the other rituals.
      setBatterPhase('stance');
      setCatcherSigns(signCount); setCoachSignKey(k => k + 1);
      // Pitcher accepts the sign — small forward head-nod gesture.
      setTimeout(() => {
        setPitcherHeadNod(true);
        setSignNodBadge({ team: defTeam });
      }, 100);
      setTimeout(() => setPitcherHeadNod(false), 100 + 520);
      setTimeout(() => setSignNodBadge(null), 1600);
      setTimeout(() => { setPitchPhase('windup'); }, signNodDelay);
    } else {
      setPitchPhase('windup'); setBatterPhase('stance'); setCatcherSigns(signCount); setCoachSignKey(k => k + 1);
    }
    // Pitcher shake-off animation (Backlog #104). Fires +200ms after the catcher
    // flashes the first sign; lasts 600ms; then a fresh signCount is set on the
    // catcher (guaranteed different from the first sign) and the pitch
    // proceeds normally after the additional shakeOffDelay.
    if (doesShakeOff) {
      setTimeout(() => {
        setPitcherShakeOff(true);
        setShakeOffBadge({ team: defTeam });
        if (sndRef.current) playSoundLocal('shakeOff');
      }, stepOutDelay + 200);
      setTimeout(() => {
        setPitcherShakeOff(false);
        // Pick a fresh sign count, guaranteed different from the original
        const altCount = ((signCount - 1 + 1 + Math.floor(Math.random() * 3)) % 4) + 1;
        setCatcherSigns(altCount === signCount ? (signCount % 4) + 1 : altCount);
        setCoachSignKey(k => k + 1);
      }, stepOutDelay + 800);
      setTimeout(() => setShakeOffBadge(null), stepOutDelay + 2400);
    }
    setTimeout(() => {
      setPitchPhase('throw'); setCatcherSigns(0);
      // Hit-by-pitch reaction (Idea #88) — redirect the pitch to the batter's
      // body and fire the recoil pose + dust-puff impact + thud sound + badge.
      // The ball travels from P to the batter's body offset (rather than the
      // catcher's mitt), the batter recoils, the impact effect plays, and after
      // a brief beat the standard processOutcome flow runs (forced runners
      // advance, batter awarded 1B). Suppresses the regular ball-back-to-pitcher
      // animation since the ball already careened off the body.
      if (oc === 'hbp') {
        const bodyPart = nar.bodyPart || 'elbow';
        const partOffset = { elbow: -2, shoulder: -4, back: -1, hip: 4, leg: 8, foot: 12, knee: 7 }[bodyPart] || 0;
        const batterTargetX = (batterSide === 'L' ? F.HP.x + 25 : F.HP.x - 25);
        const batterTargetY = F.HP.y - 5 + partOffset;
        animateBall(linePts(F.P, { x: batterTargetX, y: batterTargetY }, 16), 600, () => {
          setBallPos(null);
          setBatterPhase('hbp');
          setHbpImpact({ x: batterTargetX, y: batterTargetY, side: batterSide, bodyPart });
          if (sndRef.current) playSoundLocal('hbpThud');
          setHbpBadge({ batter, bodyPart, team: bt });
          setTimeout(() => setHbpBadge(null), 3200);
          setTimeout(() => setHbpImpact(null), 1300);
          setTimeout(() => {
            // Reset batter pose then run processOutcome (which will move runners
            // and advance the batter to 1B per the standard HBP pathway).
            setBatterPhase('stance');
            processOutcome(oc, card, nar, false, res);
          }, 1100);
        });
        return; // skip the standard catcher-mitt path
      }
      // Brushback / chin music (Backlog #94) — re-route the pitch up and in
      // toward the batter's head, fire the recoil pose + brushback whistle
      // sound + badge, then carry the ball on to the catcher's mitt for the
      // standard ball-back-to-pitcher flow. The batter recoils on contact-
      // adjacent timing (the moment the ball gets close), then resets to
      // stance after the ball passes. Pure flavor — still scored as a ball.
      if (oc === 'ball' && nar.isBrushback) {
        const chinX = F.HP.x + (batterSide === 'L' ? 8 : -8); // up and in
        const chinY = F.HP.y - 22; // high — at the batter's chin level
        animateBall(linePts(F.P, { x: chinX, y: chinY }, 16), 500, () => {
          // Ball is whistling past the batter — recoil now and play the
          // brushback whistle sound. The pitch then continues to the catcher.
          setBatterPhase('brushback');
          if (sndRef.current) playSoundLocal('brushback');
          setBrushbackBadge({ batter, team: bt });
          setTimeout(() => setBrushbackBadge(null), 3200);
          // Carry the ball on past the batter's head into the catcher's mitt
          animateBall(linePts({ x: chinX, y: chinY }, F.C, 14), 280, () => {
            setBallPos(null);
            // After a brief beat, batter resets to stance and the standard
            // ball-back-to-pitcher flow runs (just like a regular ball).
            setTimeout(() => setBatterPhase('stance'), 250);
            setTimeout(() => {
              animateBall(linePts(F.C, F.P, 16), 500, () => {
                setBallPos(null);
                processOutcome(oc, card, nar, false, res);
              });
            }, 350);
          });
        });
        return; // skip the standard catcher-mitt path
      }
      // Catcher's blocked pitch in the dirt (Backlog #112) — re-route the
      // pitch low and short so it lands in the dirt just in front of home
      // plate, fire the catcher's dive pose + dust puffs + blockedPitch sound
      // + badge, then animate the ball back to the pitcher for the standard
      // ball-back-to-pitcher flow. Pure flavor — still scored as a ball.
      if (oc === 'ball' && nar.isBlocked) {
        const dirtX = F.HP.x - 4;
        const dirtY = F.HP.y + 14; // low — into the dirt in front of the plate
        animateBall(linePts(F.P, { x: dirtX, y: dirtY }, 16), 540, () => {
          // Ball hits the dirt — fire the catcher's dive pose and sound. The
          // ball stops in front of the plate while the catcher smothers it.
          setCatcherBlocking(true);
          if (sndRef.current) playSoundLocal('blockedPitch');
          setBlockedPitchBadge({ team: defTeam });
          setTimeout(() => setBlockedPitchBadge(null), 3000);
          // After the catcher smothers, animate the ball back to the pitcher
          // and clear the dive pose. The standard processOutcome flow runs
          // just like any regular ball.
          setTimeout(() => {
            setCatcherBlocking(false);
            setBallPos(null);
            setTimeout(() => {
              animateBall(linePts({ x: dirtX, y: dirtY }, F.P, 16), 520, () => {
                setBallPos(null);
                processOutcome(oc, card, nar, false, res);
              });
            }, 200);
          }, 700);
        });
        return; // skip the standard catcher-mitt path
      }
      animateBall(linePts(F.P, { x: F.HP.x, y: F.HP.y - 5 }, 16), 550, () => {
        if (!doesSwing(oc)) {
          if (stealHomeEvent) {
            // Steal of home (Backlog #101) — runner breaks from 3B as the pitch
            // is delivered. The pitch arrives at the catcher; the runner slides
            // home; the catcher tags or misses. Run scores on success, runner
            // is out on failure. The original pitch outcome (ball/strike/foul)
            // still applies after the steal resolves.
            const she = stealHomeEvent;
            const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
            // Runner B3 → HP, ~900ms (slightly slower than regular steals)
            animateRunners([[F.B3, F.HP]], offColor, 900);
            setStealHomeBadge({ runner: she.runner, success: she.success, team: bt });
            setTimeout(() => setStealHomeBadge(null), 3500);
            if (she.success) {
              if (sndRef.current) setTimeout(() => playSoundLocal('stealHomeSafe'), 100);
              setTimeout(() => {
                if (playIdRef.current !== thisPlayId) return;
                // Run scores — clear runner from 3B, increment inning runs
                gs.current.bases[2] = null;
                gs.current.innings[bt][gs.current.innings[bt].length - 1] += 1;
                if (statsRef.current[bt][she.runner]) statsRef.current[bt][she.runner].sb++;
                // Scoring play flash
                setScoringFlash({ team: bt, runs: 1 });
                setTimeout(() => setScoringFlash(null), 2000);
                // Lead change detection
                const awayTotal = gs.current.innings[0].reduce((a, b) => a + b, 0);
                const homeTotal = gs.current.innings[1].reduce((a, b) => a + b, 0);
                const lead = awayTotal > homeTotal ? 0 : homeTotal > awayTotal ? 1 : null;
                if (lead !== prevLeadRef.current) {
                  if (lead === null) { setLeadChangeBadge({ type: 'tied', teamName: teams[bt].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
                  else if (prevLeadRef.current !== null && lead !== prevLeadRef.current) { setLeadChangeBadge({ type: 'leadChange', teamName: teams[lead].name }); setTimeout(() => setLeadChangeBadge(null), 3500); }
                }
                prevLeadRef.current = lead;
                const shTexts = [
                  `STEAL OF HOME! ${she.runner} breaks for the plate as the pitch is delivered — and slides in SAFE! Run scores!`,
                  `INCREDIBLE! ${she.runner} steals home! He gets in just under the tag — what a play!`,
                  `${she.runner} BREAKS FOR HOME! It's a steal of home — and ${she.runner} crosses the plate ahead of the tag!`,
                ];
                const shText = pick(shTexts);
                addLog(shText, 'play'); setAnnounceText(shText);
                // Walk-off check: home team in bottom of 9th+ takes the lead on the steal
                if (bt === 1 && gs.current.inning >= 9 && homeTotal > awayTotal) {
                  gs.current.gameOver = true;
                  gs.current.message = `${teams[1].name} win on a walk-off steal of home! Final: ${homeTotal}-${awayTotal}`;
                  triggerFireworks(); triggerFireworks();
                  if (sndRef.current) setTimeout(() => playSoundLocal('walkOff'), 400);
                  setTimeout(() => setAnnounceText(`WALK-OFF STEAL OF HOME! ${teams[1].name} win!`), 600);
                  setAutoPlay(false);
                  setTimeout(() => setShowPostGame(true), 3500);
                }
                rerender();
              }, 900);
            } else {
              if (sndRef.current) setTimeout(() => playSoundLocal('stealHomeOut'), 100);
              setTimeout(() => {
                if (playIdRef.current !== thisPlayId) return;
                // Caught stealing — runner out at the plate, increment outs.
                // We gated the trigger to outs < 2 so this never makes a 3rd out.
                gs.current.bases[2] = null;
                gs.current.outs++;
                if (statsRef.current[bt][she.runner]) statsRef.current[bt][she.runner].cs++;
                const shTexts = [
                  `STEAL OF HOME ATTEMPT! ${she.runner} breaks from third — but the catcher TAGS HIM OUT at the plate!`,
                  `${she.runner} tries to steal home — and the catcher gets him at the plate! Big out for the defense!`,
                  `${she.runner} BREAKS FOR HOME — but he's gunned down at the plate! What a play by the catcher!`,
                ];
                const shText = pick(shTexts);
                addLog(shText, 'play'); setAnnounceText(shText);
                rerender();
              }, 900);
            }
            // After the steal resolves, recompute the play result with the
            // updated state (run scored / out added / runner from 3B gone) and
            // process the original pitch outcome (ball/strike/foul). The ball
            // animates back to the pitcher exactly like a regular pitch.
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              if (gs.current.gameOver) {
                // Walk-off ended the game — don't process the pitch outcome.
                setBallPos(null);
                procRef.current = false;
                return;
              }
              const postStealRes = calculatePlayResult(gs.current, oc, batter);
              animateBall(linePts(F.C, F.P, 16), 500, () => { setBallPos(null); processOutcome(oc, card, nar, false, postStealRes); });
            }, 1300);
          } else if (stolenBaseEvent) {
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
          } else if (doubleStealEvent) {
            // Double steal (Backlog #144) — runners on 1st & 2nd both break as
            // the pitch is delivered. Lead runner takes 3B uncontested; the throw
            // goes through to 2B for the trail runner (safe ~82% / out ~18%). The
            // original pitch outcome (ball/strike/foul) still applies after the
            // steal resolves, exactly like the single-steal path above.
            const dse = doubleStealEvent;
            const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
            // Statcast pop-time readout — the throw goes to 2B for the back-end
            // runner. Biased slightly slower when the trail runner is safe.
            const popBase = dse.trailSuccess ? 2.04 : 1.88;
            const popTimeVal = Math.round((popBase + (Math.random() - 0.5) * 0.20) * 100) / 100;
            setPopTime(popTimeVal);
            setTimeout(() => setPopTime(null), 2800);
            // Both runners motor at once: lead 2B→3B, trail 1B→2B
            animateRunners([[F.B2, F.B3], [F.B1, F.B2]], offColor, 850);
            setDoubleStealBadge({ team: bt, trailSuccess: dse.trailSuccess, leadName: dse.leadName, trailName: dse.trailName });
            setTimeout(() => setDoubleStealBadge(null), 3500);
            if (sndRef.current) setTimeout(() => playSoundLocal('doubleSteal'), 600);
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              // Lead runner always advances to 3B
              gs.current.bases[2] = dse.leadName; gs.current.bases[1] = null;
              if (statsRef.current[bt][dse.leadName]) statsRef.current[bt][dse.leadName].sb++;
              if (dse.trailSuccess) {
                // Trail runner safe at 2B — double steal complete
                gs.current.bases[1] = dse.trailName; gs.current.bases[0] = null;
                if (statsRef.current[bt][dse.trailName]) statsRef.current[bt][dse.trailName].sb++;
                const t = `DOUBLE STEAL! ${dse.leadName} swipes third and ${dse.trailName} takes second — they pull off the double steal!`;
                addLog(t, 'play'); setAnnounceText(t);
              } else {
                // Trail runner gunned down at 2B; lead runner still safe at 3B.
                // outs < 2 was gated at detection, so this is never the 3rd out.
                gs.current.bases[0] = null; gs.current.outs++;
                if (statsRef.current[bt][dse.trailName]) statsRef.current[bt][dse.trailName].cs++;
                const t = `DOUBLE STEAL ATTEMPT! ${dse.leadName} takes third easily — but ${dse.trailName} is GUNNED DOWN at second base!`;
                addLog(t, 'play'); setAnnounceText(t);
              }
              rerender();
            }, 850);
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              const postStealRes = calculatePlayResult(gs.current, oc, batter);
              animateBall(linePts(F.C, F.P, 16), 500, () => { setBallPos(null); processOutcome(oc, card, nar, false, postStealRes); });
            }, 1200);
          } else {
            // Catcher framing animation (Backlog #130) — fires when the catcher
            // has held onto the ball with no steal interruption. The framing
            // animation runs during the 300ms hold window before the ball
            // returns to the pitcher. Visual: subtle glove rotation inward
            // toward the strike zone. Sound: soft `frameMitt` leather creak.
            // Badge: only flashes if the umpire actually converted the call
            // (nar.isFramed) — the cosmetic-only attempts let the visual +
            // sound carry the moment. We use `nar.isFraming` as the gate so
            // the animation always plays on framing attempts; we use
            // `nar.isFramed` as the gate so the badge only flashes on
            // conversions. Same approach is mirrored in `replayPlay` below.
            if (nar.isFraming) {
              setCatcherFraming(true);
              if (sndRef.current) playSoundLocal('frameMitt');
              setTimeout(() => setCatcherFraming(false), 800);
              if (nar.isFramed) {
                setFramingBadge({ team: defTeam });
                setTimeout(() => setFramingBadge(null), 2400);
              }
            }
            setTimeout(() => { animateBall(linePts(F.C, F.P, 16), 500, () => { setBallPos(null); processOutcome(oc, card, nar, false, res); }); }, 300);
          }
        }
      });
    }, 550 + stepOutDelay + shakeOffDelay + cleatKnockDelay + browWipeDelay + checkRunnerDelay + signNodDelay);
    // Broken bat: ~4% chance on weak-contact outcomes. The bat visibly splinters
    // as the batter swings — barrel piece spins away, splinters scatter, CRACK!
    // Purely visual/sound flavor — no mechanical effect on the outcome.
    const isWeakContact = ['groundOut', 'flyOut', 'single', 'foulOut', 'lineOut'].includes(oc);
    const isBrokenBat = isWeakContact && Math.random() < 0.04;
    if (doesSwing(oc)) {
      setTimeout(() => {
        setBatterPhase(oc === 'bunt' ? 'bunt' : 'swing');
        // Foul tip strikeout (Backlog #86) — suppress the standard 'hit' contact sound
        // and play the bespoke 'foulTip' sound (sharp tick + glove-pop) instead. The
        // bat barely grazes the ball into the catcher's mitt — completely different
        // sonic profile from a normal foul or hit. Also flash the slate-to-cyan
        // info-bar badge and trigger a strikeout-style crowd reaction.
        if (nar.isFoulTip) {
          if (sndRef.current) playSoundLocal('foulTip');
          setFoulTipBadge({ batter, team: bt });
          setTimeout(() => setFoulTipBadge(null), 3000);
        } else if (sndRef.current && !['ball', 'strike', 'walk', 'hbp'].includes(oc)) {
          playSoundLocal('hit');
        }
        // Broken bat flourish: trigger a flying barrel piece and a wood-crack sound
        // right on contact. Position is the batter's box (opposite side of home plate
        // from which hand they bat with), so the barrel flies toward the mound/infield.
        // Suppressed on foul tips since the bat barely grazes the ball — no break.
        if (isBrokenBat && !nar.isFoulTip) {
          const bbX = F.HP.x + (batterSide === 'L' ? -14 : 14);
          const bbY = F.HP.y - 14;
          setBrokenBat({ x: bbX, y: bbY, side: batterSide });
          if (sndRef.current) setTimeout(() => playSoundLocal('batCrack'), 20);
          setTimeout(() => setBrokenBat(null), 950);
        }
        // Squeeze play (Backlog #97) — when a bunt is re-narrated as a designed
        // squeeze, flash the amber-to-emerald "🎯 SQUEEZE PLAY!" info-bar badge
        // and play the bespoke three-stage `squeezePlay` sound (bat tap +
        // pounding footfalls + crowd surge). Pure flavor — no mechanical
        // change. Fires on every bunt that's been flagged as a squeeze; lives
        // only here in the swing handler since the bunt outcome already does
        // the right thing downstream (runner from 3rd already scores).
        if (nar.isSqueeze) {
          setSqueezeBadge({ batter, runner: nar.squeezeRunner || 'the runner', team: bt });
          setTimeout(() => setSqueezeBadge(null), 3500);
          if (sndRef.current) setTimeout(() => playSoundLocal('squeezePlay'), 80);
        }
        // Productive out badge (Backlog #108) — flash the amber-to-emerald
        // "↗ PRODUCTIVE OUT" pill when a routine groundout moved the runner
        // from 2B up to 3B. Pure cosmetic accent; runner advancement is
        // already baked into res.nextBases (see the engine-side mutation).
        // The runner path from `computeRunnerPaths` already animates the
        // [b2, b3] move for any groundOut so the visual matches the state.
        if (nar.isProductiveOut) {
          setProductiveOutBadge({ batter, runner: nar.poRunner || 'the runner', team: bt });
          setTimeout(() => setProductiveOutBadge(null), 3500);
        }
        // Sacrifice bunt badge (Backlog #111) — flash the amber-to-indigo
        // "🎯 SAC BUNT" pill when a bunt is re-narrated as a designed
        // sacrifice. Pure cosmetic accent; runner advancement is already
        // baked into res.nextBases by the bunt engine. Mutually exclusive
        // with the squeeze badge (different runner state).
        if (nar.isSacBunt) {
          setSacBuntBadge({
            batter,
            runner: nar.sacBuntRunner || 'the lead runner',
            advancedTo: nar.sacBuntAdvancedTo || 'the next bag',
            team: bt,
          });
          setTimeout(() => setSacBuntBadge(null), 3500);
          // Reuse the squeezePlay sound — both are small-ball bat-on-ball taps.
          // Sound is cued ~80ms after the bat contact so it lines up with the
          // bunt animation in the same way as the squeeze does.
          if (sndRef.current) setTimeout(() => playSoundLocal('squeezePlay'), 80);
        }
        // Drag bunt single badge (Backlog #139) — flash the teal-to-cyan
        // "🐎 DRAG BUNT SINGLE!" pill when the bases-empty bunt beats the
        // throw to first. Fires the bespoke `dragBunt` sound (soft bunt tap +
        // pounding footfalls + late glove-pop at the bag — capturing the full
        // rhythm of the play). Pure cosmetic accent; the hit credit is
        // already baked into the existing `oc === 'bunt' && res.outsAdded === 0`
        // stat path. Mutually exclusive with squeeze and sac-bunt badges by
        // construction (different runner state and out state).
        if (nar.isDragBunt) {
          setDragBuntBadge({ batter, team: bt });
          setTimeout(() => setDragBuntBadge(null), 3500);
          if (sndRef.current) setTimeout(() => playSoundLocal('dragBunt'), 80);
          // Trigger a brief offensive-crowd reaction for the hustle hit
          // (similar to first-to-third and infield-single moments).
          if (sndRef.current) setTimeout(() => triggerCrowdReaction('hit', bt), 1500);
        }
        // First-to-third badge (Backlog #123) — flash the amber-to-emerald
        // "🏃 1ST-TO-3RD!" pill when a runner goes first-to-third on a single.
        // Runner-path mutation is handled below in the rps block. Trigger a
        // brief offensive-crowd reaction to match the broadcast moment when
        // fans react to aggressive baserunning.
        if (nar.isFirstToThird) {
          const lastName = (nar.firstTo3rdRunner || '').split(' ').slice(-1)[0] || 'the runner';
          setFirstTo3rdBadge({ batter, runner: lastName, team: bt });
          setTimeout(() => setFirstTo3rdBadge(null), 3500);
          // Fire the standard hit crowd reaction a beat after the slide
          // completes so it reads as fans cheering the hustle.
          if (sndRef.current) setTimeout(() => triggerCrowdReaction('hit', bt), 1800);
        }
        // Comebacker badge (Backlog #126) — flash the emerald-to-amber
        // "🎯 COMEBACKER!" pill when a groundOut is re-narrated as a
        // 1-3 putout (ball right back at the pitcher). The standard
        // ball-throw routing handles the rest (HP → F.P → F.B1 via the
        // 'the pitcher' INF_MAP entry).
        if (nar.isComebacker) {
          const cbPitcherLast = (nar.cbPitcher || '').split(' ').slice(-1)[0] || 'the pitcher';
          setComebackerBadge({ pitcher: cbPitcherLast, batter, team: 1 - bt });
          setTimeout(() => setComebackerBadge(null), 3500);
          // The new `comebacker` sound effect plays the three-stage layer
          // (bat crack → pitcher mitt pop → 1B glove pop) over ~620ms,
          // cued at ~60ms after bat contact to line up with the ball's
          // sharp travel back to the mound.
          if (sndRef.current) setTimeout(() => playSoundLocal('comebacker'), 60);
        }
        // Hit and run badge (Backlog #148) — flash the emerald-to-sky
        // "🏃 HIT & RUN!" pill when a grounder with the runner going stays out
        // of the double play (batter out at first, runner safe at second). The
        // engine mutation already set res.nextBases / outsAdded; the runner-path
        // animation (1B→2B) and the ball-routing override (throw to first) handle
        // the visuals. Fires the bespoke `hitAndRun` sound (ground-ball contact →
        // footfalls → glove pop at the bag) ~60ms after contact, and a brief
        // offensive-crowd reaction a beat later for the heads-up baserunning.
        if (nar.isHitAndRun) {
          const harLast = (nar.harRunner || '').split(' ').slice(-1)[0] || 'the runner';
          setHitAndRunBadge({ batter, runner: harLast, team: bt });
          setTimeout(() => setHitAndRunBadge(null), 3500);
          if (sndRef.current) setTimeout(() => playSoundLocal('hitAndRun'), 60);
          if (sndRef.current) setTimeout(() => triggerCrowdReaction('hit', bt), 1500);
        }
        setAnnounceText(nar.text);
        // Exit velocity display (Statcast-style)
        const ev = generateExitVelo(oc);
        if (ev) { setExitVelo(ev); setTimeout(() => setExitVelo(null), 2500); }
        // Launch angle display (Backlog #118, Statcast-style) — shown alongside
        // exit velo on every contact play. Completes the modern broadcast trio
        // (exit velo, distance, launch angle). Auto-clears at the same time as
        // exit velo so the two pills disappear together.
        const la = generateLaunchAngle(oc);
        if (la !== null) { setLaunchAngle(la); setTimeout(() => setLaunchAngle(null), 2500); }
        // Bat speed display (Backlog #122, Statcast-style) — completes the
        // modern Statcast quartet (EV / Dist / LA / Bat Speed) every broadcast
        // graphic shows in 2024+. Auto-clears alongside exit velo so all the
        // contact-play pills disappear together. Returns null for non-contact
        // outcomes so the pill stays clean on balls / strikes.
        const bs = generateBatSpeed(oc);
        if (bs !== null) { setBatSpeed(bs); setTimeout(() => setBatSpeed(null), 2500); }
        // HR distance readout (Statcast-style) — show alongside exit velo on home runs
        if (oc === 'homeRun') {
          const dist = generateHRDistance(ev);
          if (dist) { setHrDistance(dist); setTimeout(() => setHrDistance(null), 3500); }
        }
        if (['single', 'double', 'triple', 'homeRun', 'error', 'groundOut', 'doublePlay', 'bunt'].includes(oc) || ((res.isSacFly || nar.isTagUp) && ['flyOut', 'lineOut'].includes(oc))) {
           const runnerOc = oc === 'bunt' ? 'single' : (res.isSacFly ? 'sacFly' : oc);
           let rps = computeRunnerPaths([...gs.current.bases], runnerOc);
           // Tag-up advance (Backlog #142) — computeRunnerPaths has no flyOut/
           // lineOut case (runners normally hold on a fly out), so build the
           // runner path explicitly: the runner on 2B tags up and advances to
           // 3B after the catch. Mirrored in replayPlay below.
           if (nar.isTagUp && !res.isSacFly) {
             rps = [];
             if (nar.tagUpTo === 3) rps.push([F.B2, F.B3]);
           }
           // First-to-third path override (Backlog #123) — when the runner from 1B
           // legs out an extra base on a single, extend his path from [b1, b2]
           // to [b1, b2, b3] so the visual matches the post-state runner on 3B.
           // computeRunnerPaths for single pushes paths in order: oldBases[2],
           // oldBases[1], oldBases[0], then batter. With only oldBases[0] set
           // (the precondition for this trigger), rps[0] is the [b1, b2] path —
           // we extend it in place.
           // The outfield-assist-at-third (Backlog #146) shares the same path:
           // the runner from 1B motors to 3B (where he's gunned down). The base
           // state write at trot completion sets [batter, null, null], so the
           // runner vanishes from 3B as the tag lands.
           if ((nar.isFirstToThird || nar.isOutfieldAssist3B) && oc === 'single') {
             for (let i = 0; i < rps.length; i++) {
               if (rps[i].length === 2 && rps[i][0].x === F.B1.x && rps[i][0].y === F.B1.y) {
                 rps[i] = [F.B1, F.B2, F.B3];
                 break;
               }
             }
           }
           // Inside-the-park HR (Idea #83) — batter sprints all four bases full speed
           // (no leisurely trot). Use a slightly faster duration than the standard HR
           // trot so the run reads as urgent, with a final dive into home.
           const troDur = oc === 'homeRun' ? (nar.isInsideThePark ? 5400 : 6500) : 2500;
           // First-to-third uses a slightly longer trot so the runner has time
           // to make the extra ninety feet — animateRunners interpolates the
           // entire path over troDur, and a 3-segment path needs more time
           // than a 2-segment one to feel natural.
           const ftTrotDur = ((nar.isFirstToThird || nar.isOutfieldAssist3B) && oc === 'single') ? 3200 : troDur;
           animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', ftTrotDur);
           if (rps.some(p => p[0].x === F.HP.x)) {
             if (oc === 'homeRun' && !nar.isInsideThePark) {
               // Bat flip: swing → batFlip (400ms) → gone (after 800ms flip animation)
               setTimeout(() => setBatterPhase('batFlip'), 400);
               setTimeout(() => setBatterPhase('gone'), 1200);
             } else {
               // ITPHR: no bat flip — batter drops the bat and sprints out of the box.
               setTimeout(() => setBatterPhase('gone'), 500);
             }
           }
           setTimeout(() => { if (playIdRef.current === thisPlayId) { gs.current.bases = res.nextBases; rerender(); } }, ftTrotDur);
           // Fresh ball toss from HP umpire to pitcher (Backlog #135) — fires
           // after HRs only (ball went over the fence, gone). Inside-the-park
           // HRs do NOT trigger this since the ball stayed in play and was
           // relayed back through the cutoff. Timed ~700ms after the trot
           // completes so the celebration breathes before the umpire flips
           // a new ball to the mound.
           if (oc === 'homeRun' && !nar.isInsideThePark) {
             setTimeout(() => {
               if (playIdRef.current !== thisPlayId) return;
               if (gs.current.gameOver) return; // don't toss over the post-game modal
               setFreshBallToss({ ts: Date.now() });
               setFreshBallTossBadge(true);
               if (sndRef.current) playSoundLocal('freshBall');
               setTimeout(() => setFreshBallToss(null), 900);
               setTimeout(() => setFreshBallTossBadge(false), 1600);
             }, ftTrotDur + 700);
           }
           // Curtain call (Backlog #141) — after a truly big home run (grand
           // slam, multi-homer game, or a go-ahead blast in the 7th inning or
           // later by the HOME team), the home crowd roars the hero back out of
           // the dugout for a curtain call. Eligibility is decided in
           // processOutcome (where the batter's HR total and the post-HR score
           // are final) and stashed on nar.isCurtainCall. Fires ~1100ms after
           // the trot completes — just after the fresh-ball toss — so the
           // visual order reads: trot → new ball → curtain call. Suppressed if
           // the game ended on the HR (walk-offs have their own celebration).
           if (oc === 'homeRun') {
             setTimeout(() => {
               if (playIdRef.current !== thisPlayId) return;
               if (gs.current.gameOver) return;
               if (!nar.isCurtainCall) return;
               const ccColor = bt === 1 ? '#b91c1c' : '#1e40af';
               setCurtainCall({ x: 112, y: 414, color: ccColor });
               setCurtainCallBadge({ batter, reason: nar.ccReason || 'big home run', team: bt });
               if (sndRef.current) playSoundLocal('curtainCall');
               setTimeout(() => setCurtainCall(null), 2800);
               setTimeout(() => setCurtainCallBadge(null), 3400);
             }, ftTrotDur + 1100);
           }
           // Dugout high-five greeting line (Backlog #147) — after the hitter
           // rounds the bases on a home run, his teammates mob him at the dugout
           // with a row of high-fives. Fires ~900ms after the trot completes (as
           // the hero reaches the dugout). Unlike the home-only curtain call this
           // fires for BOTH teams, at the batting team's dugout. Suppressed when
           // a curtain call is eligible for THIS team's dugout (home team big HR)
           // so the two dugout celebrations never overlap, and suppressed if the
           // game ended on the swing (the walk-off mob owns the celebration).
           if (oc === 'homeRun') {
             setTimeout(() => {
               if (playIdRef.current !== thisPlayId) return;
               if (gs.current.gameOver) return;
               if (bt === 1 && nar.isCurtainCall) return; // home dugout already busy with the curtain call
               const hflColor = bt === 1 ? '#b91c1c' : '#1e40af';
               const hflX = bt === 1 ? 98 : 522; // home dugout (left) vs away dugout (right)
               setHighFiveLine({ x: hflX, y: 414, color: hflColor });
               if (sndRef.current) playSoundLocal('dugoutCheer');
               setTimeout(() => setHighFiveLine(null), 2600);
             }, ftTrotDur + 900);
           }
        } else if (nar.isDropped3rd) {
           // Dropped third strike: batter sprints HP → 1B while the catcher scrambles.
           // Preserve any existing runners on 2B/3B by only animating the batter.
           const troDur = 2200;
           animateRunners([[F.HP, F.B1]], bt === 0 ? '#b91c1c' : '#1e40af', troDur);
           setTimeout(() => setBatterPhase('gone'), 500);
           setTimeout(() => { if (playIdRef.current === thisPlayId) { gs.current.bases = res.nextBases; rerender(); } }, troDur);
        }
      }, 1050 + stepOutDelay + shakeOffDelay + cleatKnockDelay + browWipeDelay + checkRunnerDelay + signNodDelay);
      setTimeout(() => {
        setPitchPhase('idle'); setOutcome(oc);
        const ba = genBallAnimLocal(oc, nar.dir, nar.sub, nar.variant, isGRD);
        // Foul ball into stands (Idea #81) — override the foul-ball arc so the ball
        // sails all the way up into the stands area where the fan is positioned.
        // The fan SVG itself has an internal "ball arrives in raised hands" frame
        // that fires at the same beat for a clean continuous catch.
        if (nar.isFanGrab && nar.fanGrab && oc === 'foulBall') {
          const fanTarget = { x: nar.fanGrab.x, y: nar.fanGrab.y + 4 };
          ba.path = arcPts(F.HP, fanTarget, 90, 28);
          ba.target = fanTarget;
          ba.dur = 1700;
        }
        // Foul ball straight back to the screen (Backlog #127) — override the
        // standard foul-ball arc with a high upward-and-backward trajectory:
        // the ball sails up and back over the catcher's head and lands in the
        // protective netting behind home plate. Distinct from the fan-grab
        // arc (which sends the ball to the foul-side stands) and the standard
        // foul-line trajectory (which heads to the foul-line corners).
        if (nar.isBackstop && oc === 'foulBall') {
          const bsSide = Math.random() < 0.5 ? -1 : 1; // small left/right jitter
          const bsTarget = { x: F.HP.x + bsSide * 4, y: F.HP.y - 32 };
          // Higher arc height (52) and shorter dur than the standard foul to
          // read as a sharp upward pop straight back to the screen.
          ba.path = arcPts(F.HP, bsTarget, 52, 22);
          ba.target = bsTarget;
          ba.dur = 1300;
          // Flash the "STRAIGHT BACK" badge and queue the new screenHit
          // sound timed to land just as the ball reaches the netting.
          setBackstopBadge({ batter, team: bt });
          setTimeout(() => setBackstopBadge(null), 2400);
          if (sndRef.current) setTimeout(() => playSoundLocal('screenHit'), 280);
        }
        // Inside-the-park home run (Idea #83) — override the standard HR
        // ball-over-the-wall trajectory with a triple-style "deep into the gap,
        // ball stays in play, fielder chases it down" path. The ball bounces
        // into the corner and the fielder relays it back, but the runner has
        // already rounded the bases. We push a slightly slower duration so the
        // ball is still in flight as the runner is rounding 2nd/3rd, then the
        // OF chase fires the badge and the inside-the-park sound right as the
        // batter is crossing home.
        if (nar.isInsideThePark && oc === 'homeRun') {
          const tgt = getBallTgtLocal(nar.dir, 'triple', nar.sub, 2);
          // Ball arcs into the deepest part of the park (similar to a deep triple),
          // then carries off the wall and skips along the warning track.
          const wallY = FENCE_Y + 6;
          const fenceHit = { x: tgt.x, y: wallY };
          const carom = { x: tgt.x + (Math.random() < 0.5 ? -22 : 22), y: wallY + 26 };
          ba.path = [...arcPts({ x: F.HP.x, y: F.HP.y - 10 }, fenceHit, 78, 18), ...linePts(fenceHit, carom, 8)];
          ba.target = carom;
          ba.dur = 2900;
          ba.carom = true;
          // Show the badge during the play and play the special ITPHR sound
          // timed to peak as the runner rounds third.
          setInsideTheParkBadge({ batter, team: bt });
          setTimeout(() => setInsideTheParkBadge(null), 4500);
          if (sndRef.current) setTimeout(() => playSoundLocal('insideTheParkHR'), ba.dur * 0.4);
        }
        // Ground rule double: flash a badge and play a fence-hit sound at the bounce moment.
        if (isGRD) {
          setGrdBadge({ team: bt });
          setTimeout(() => setGrdBadge(null), 3200);
          if (sndRef.current) setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.5);
        }
        // Texas leaguer / bloop single (Backlog #91) — override the standard
        // single ball trajectory with a higher, softer arc that lands SHORTER
        // (in the shallow OF / between IF and OF) rather than carrying out to
        // a clean OF position. Lerp factor of 0.55 puts the ball roughly in
        // the gap between SS / 2B and the OF instead of a true OF base hit.
        // Higher arc height (60 vs default 35) reads visibly as a soft pop-up.
        if (nar.isTexasLeaguer && oc === 'single') {
          const ofPos = F[OF_MAP[nar.sub] || 'CF'];
          const dropX = lerp(F.HP.x, ofPos.x, 0.55) + (Math.random() - 0.5) * 8;
          const dropY = lerp(F.HP.y, ofPos.y, 0.58) + (Math.random() - 0.5) * 6;
          const dropPt = { x: dropX, y: dropY };
          ba.path = arcPts({ x: F.HP.x, y: F.HP.y - 10 }, dropPt, 60, 22);
          ba.target = dropPt;
          ba.dur = 1900;
          // Flash the badge and play the bespoke "soft thwack + descending whoosh
          // + grass thud" sound timed to peak as the ball drops in.
          setTexasLeaguerBadge({ batter, team: bt });
          setTimeout(() => setTexasLeaguerBadge(null), 3200);
          if (sndRef.current) playSoundLocal('texasLeaguer');
        }
        // Infield single (Backlog #99) — override the standard single trajectory
        // (which would carry the ball into the outfield) with a groundOut-style
        // path that lands at the infielder. The standard single pathway later
        // animates the runner trotting to 1B; we just need to make the ball
        // visually go to the infielder and then a (late) throw to first.
        // Duration is shortened to ~1000ms (matches groundOut timing) so the
        // batter beats the throw beat-for-beat. The runner trot is unchanged
        // so the batter still appears at 1B at the standard time.
        if (nar.isInfieldSingle && oc === 'single') {
          const infFk = INF_MAP[nar.sub] || 'SS';
          const infPos = F[infFk];
          ba.path = linePts({ x: F.HP.x, y: F.HP.y - 10 }, infPos, 16);
          ba.target = infPos;
          ba.dur = 1000;
          // Flash the teal "INFIELD SINGLE" badge and play the bespoke sound
          // (sharp thwack + pounding footfalls + late glove-pop). The late
          // glove-pop in the sound effect lands ~480ms in, aligned with the
          // throw arriving JUST after the runner.
          setInfieldSingleBadge({ batter, fielder: nar.isFielder || 'the infielder', team: bt });
          setTimeout(() => setInfieldSingleBadge(null), 3200);
          if (sndRef.current) playSoundLocal('infieldSingle');
        }
        // Throwing error (Backlog #105) — same trajectory pattern as infield
        // single (ball lands at the infielder for the clean field), but
        // followed by a wild-throw animation toward the dugout/foul side
        // past 1B and an ErrorBobble overlay at first base where the
        // first baseman lunges helplessly. Reuses the existing bobble sound.
        if (nar.isThrowError && oc === 'single') {
          const infFk = INF_MAP[nar.sub] || 'SS';
          const infPos = F[infFk];
          ba.path = linePts({ x: F.HP.x, y: F.HP.y - 10 }, infPos, 16);
          ba.target = infPos;
          ba.dur = 1000;
          // Flash the rose-red "THROWING ERROR (Ex)" badge and play the
          // bobble sound at the moment the wild throw sails past first base.
          setThrowErrorBadge({ batter, fielder: nar.teFielder || 'the infielder', errCode: nar.teErrCode || 'E?', team: bt });
          setTimeout(() => setThrowErrorBadge(null), 3200);
          // Stage 1: clean field — sound of bat-on-ball already plays via the
          // standard ball-flight path. Stage 2: at +1100ms, the wild throw
          // animation: ball animates from infielder past 1B toward foul
          // territory, bobble overlay fires at the bag, error sound plays.
          setTimeout(() => {
            if (playIdRef.current !== thisPlayId) return;
            // Wild-throw animation: ball flies from infielder PAST first base
            // and into the dugout/foul territory.
            const wildTarget = { x: F.B1.x + 24, y: F.B1.y + 18 };
            animateBall(linePts(infPos, wildTarget, 14), 600, () => { setBallPos(null); });
            if (sndRef.current) playSoundLocal('bobble');
            // Bobble / error overlay at first base where the throw should
            // have arrived — first baseman gets a glove on it but it sails by.
            setErrorBobble({ x: F.B1.x, y: F.B1.y - 4 });
            setTimeout(() => setErrorBobble(null), 1300);
            // Defensive crowd error reaction
            triggerCrowdReaction('error', bt);
          }, 1100);
        }
        if (sndRef.current && ba.carom && !isGRD) { setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.65); }
        if (sndRef.current && oc === 'homeRun' && (nar.sub === 'lf' || nar.sub === 'rf') && Math.random() < 0.35) { setTimeout(() => playSoundLocal('foulPole'), ba.dur * 0.5); }
        const isH = ['single', 'double', 'triple', 'error'].includes(oc), isG = ['groundOut', 'doublePlay', 'bunt'].includes(oc);
        if (['flyOut', 'lineOut', 'foulOut'].includes(oc)) {
          const fk = (oc === 'foulOut') ? 'C' : (OF_MAP[nar.sub] || INF_MAP[nar.sub]);
          if (fk) animateFielder(fk, F[fk], ba.target, ba.dur);
          // Infield fly rule (Backlog #140) — fire the umpire's raised-finger
          // signal while the popup is in the air (~500ms in), flash the info-bar
          // badge, and punctuate the routine catch with a glove pop at ball
          // arrival. The batter is already out via the standard flyOut pathway,
          // so this is purely the signal + badge layer. The home-plate umpire is
          // idle on flyOuts, so setting the 'infieldFly' phase here is safe.
          if (nar.isInfieldFly) {
            setTimeout(() => { if (playIdRef.current === thisPlayId) setUmpirePhase('infieldFly'); }, 500);
            setTimeout(() => { if (playIdRef.current === thisPlayId) setUmpirePhase('idle'); }, 500 + 1900);
            setInfieldFlyBadge({ batter, fielder: nar.sub, team: 1 - bt });
            setTimeout(() => setInfieldFlyBadge(null), 3500);
            if (sndRef.current) setTimeout(() => playSoundLocal('glovePop'), ba.dur);
          }
          // Tag-up advance badge (Backlog #142) — flash the sky-to-emerald
          // "🏃 TAG & ADVANCE" pill when the runner on 2B tags up and takes
          // third on a deep fly out. Fired at ball-arrival (the catch — the
          // moment the runner may legally leave the bag), with a routine glove
          // pop. Runner advancement is already baked into res.nextBases and the
          // runner-path animation set up above.
          if (nar.isTagUp) {
            const tuLast = (nar.tagUpRunner || '').split(' ').slice(-1)[0] || 'the runner';
            setTimeout(() => { if (playIdRef.current === thisPlayId) { setTagUpBadge({ runner: tuLast, team: bt }); setTimeout(() => setTagUpBadge(null), 3500); } }, ba.dur);
            if (sndRef.current) setTimeout(() => playSoundLocal('glovePop'), ba.dur);
          }
          // Catcher's mask toss on pop-up (Backlog #98) — fires on ~75% of
          // foulOut outcomes. Mask flies away in foul territory while the
          // catcher tracks the popup overhead. Timing:
          //   t=0           ball leaves the bat (high arc, dur=2200ms)
          //   t=ba.dur*0.45 catcher whips mask off + glove rises overhead +
          //                  maskToss SVG starts its 900ms tumble
          //                  + maskToss sound plays (the leather-creak +
          //                  cage-on-dirt clatter)
          //   t=ba.dur      ball arrives in the catcher's glove (existing flow)
          //   t=ba.dur+400  catcher resets to standard pose
          // The mask is anchored at the catcher's face position (just to the
          // right of the catcher's torso) and tossed in the direction OPPOSITE
          // to the catch point's foul side — so the mask flies clear of the
          // path the catcher needs to track. dir: +1 = right toss (when ball
          // is going to left foul), -1 = left toss (when ball is going to right).
          if (oc === 'foulOut' && nar.isMaskToss && ba.target) {
            const tossDir = (ba.target.x >= F.HP.x) ? -1 : 1; // toss away from popup direction
            const tossX = F.C.x;
            const tossY = F.C.y - 14; // anchored at the catcher's face
            const tossStart = Math.round(ba.dur * 0.45);
            // Mask tumbles off, catcher pose flips to glove-overhead
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              setMaskToss({ x: tossX, y: tossY, dir: tossDir });
              setCatcherLookingUp(true);
              if (sndRef.current) playSoundLocal('maskToss');
              setMaskTossBadge({ batter, team: bt });
            }, tossStart);
            // Auto-clear the mask toss SVG after its 900ms animation completes,
            // and reset the catcher pose ~400ms after the catch (the popup is
            // safely in the glove and he's about to walk back to crouch).
            setTimeout(() => { if (playIdRef.current === thisPlayId) setMaskToss(null); }, tossStart + 1100);
            setTimeout(() => { if (playIdRef.current === thisPlayId) setCatcherLookingUp(false); }, ba.dur + 400);
            setTimeout(() => { if (playIdRef.current === thisPlayId) setMaskTossBadge(null); }, ba.dur + 2800);
          }
          // Web gem sparkle effect at catch point
          if (isWebGem && ba.target) {
            setTimeout(() => { setWebGem({ x: ba.target.x, y: ba.target.y }); setTimeout(() => setWebGem(null), 1200); }, ba.dur);
            setTimeout(() => triggerCrowdReaction('webGem', bt), ba.dur + 200);
          }
          // HR robbery leap (Backlog #72): fire the leap animation at the catch point
          // (anchored slightly toward the wall from the OF target so the leap visually
          // lands at the fence). Flash the "ROBBED!" badge and play the rising-whoosh +
          // glove-pop sound timed to the ball's arrival. Reuse the web-gem-style crowd
          // reaction so the stands erupt.
          if (isRobbedHR && ba.target) {
            const leapY = Math.max(FENCE_Y + 2, ba.target.y - 4);
            const leapColor = bt === 0 ? '#b91c1c' : '#1e40af'; // defensive team color (opposite of batting team)
            const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
            setTimeout(() => { setRobbedHRLeap({ x: ba.target.x, y: leapY, color: leapColor }); setTimeout(() => setRobbedHRLeap(null), 1500); }, ba.dur - 300);
            setTimeout(() => setRobbedHRBadge({ batter, fielder: fielderName, team: bt }), ba.dur - 100);
            setTimeout(() => setRobbedHRBadge(null), ba.dur + 3200);
            if (sndRef.current) setTimeout(() => playSoundLocal('hrRobbed'), ba.dur - 320);
            setTimeout(() => triggerCrowdReaction('webGem', bt), ba.dur + 200);
          }
        } else if (isG) {
          const fk = INF_MAP[nar.sub] || 'SS'; animateFielder(fk, F[fk], ba.target, ba.dur);
        } else if (nar.isInsideThePark && oc === 'homeRun') {
          // Inside-the-park HR (Idea #83) — outfielder sprints into the corner to
          // chase the ball as it caroms off the wall. Same animation pattern as
          // a triple/double — fielder leaves their position, runs to the
          // ba.target carom point, and stays there as the runner flies around
          // the bases. Reuse `animateFielder` to drive the OF run, with a
          // slightly longer duration than the ball flight so the chase reads
          // as the relay struggling to catch up.
          const ofk = OF_MAP[nar.sub] || 'CF';
          animateFielder(ofk, F[ofk], ba.target, ba.dur + 600);
          // Fence-hit sound at the bounce moment (the ball ricochets off the wall)
          if (sndRef.current) setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.55);
          // Trigger a home-crowd web-gem-style reaction as the runner is rounding
          // the bases — the stands erupt for the heroics.
          setTimeout(() => triggerCrowdReaction('webGem', bt), ba.dur + 600);
        } else if (isH && !isGRD) {
          // Infield single (Backlog #99) — fielder is an INFIELDER, not the
          // standard OF. Route the chase animation through the infielder.
          // Throwing error (Backlog #105) — same fielder routing as infield
          // single (the ball is fielded by the infielder, the wild throw is
          // a separate animation handled in the trajectory override above).
          // For all other singles/doubles/triples/errors, the OF chase fires.
          if ((nar.isInfieldSingle || nar.isThrowError) && oc === 'single') {
            const infFk = INF_MAP[nar.sub] || 'SS';
            animateFielder(infFk, F[infFk], ba.target, ba.dur);
          } else {
            const ofk = OF_MAP[nar.sub] || 'CF'; animateFielder(ofk, F[ofk], ba.target, ba.dur + 500);
          }
          // Error bobble animation at the fielder's target position
          if (oc === 'error' && ba.target) {
            setTimeout(() => {
              setErrorBobble({ x: ba.target.x, y: ba.target.y });
              if (sndRef.current) playSoundLocal('bobble');
              setTimeout(() => setErrorBobble(null), 1300);
            }, ba.dur + 200);
          }
          // Lost in the sun overlay (Backlog #77) — sun flare burst at the fielder's
          // target position when the ball is lost in the afternoon sun. Time the
          // flare to the moment the ball "should have" been caught (ba.dur), so
          // the sun-burst lands as the ball drops in. The fielder's animation
          // (already running via animateFielder) will read as a missed reach.
          if (nar.isLostInSun && ba.target) {
            const fielderName = nar.sub === 'lf' ? 'left fielder' : nar.sub === 'cf' ? 'center fielder' : 'right fielder';
            setTimeout(() => {
              setSunFlare({ x: ba.target.x, y: ba.target.y });
              if (sndRef.current) playSoundLocal('lostInSun');
              setTimeout(() => setSunFlare(null), 1400);
            }, ba.dur - 80);
            setTimeout(() => setLostInSunBadge({ batter, fielder: fielderName, team: bt }), ba.dur - 60);
            setTimeout(() => setLostInSunBadge(null), ba.dur + 3200);
            setTimeout(() => triggerCrowdReaction('error', bt), ba.dur + 250);
          }
          // Dropped fly ball error overlay (Backlog #103) — error bobble burst
          // at the OF target as the ball clanks off the leather. Time the
          // bobble to the moment the ball arrives (ba.dur), so the puff lands
          // as the catch should have happened. Reuse the existing 'bobble'
          // sound (clean fielding-error transient) — same engine as
          // oc === 'error' on infield bobbles.
          if (nar.isDroppedFly && ba.target) {
            const fielderName = nar.dropFielder || 'right fielder';
            const errCode = nar.dropErrCode || 'E9';
            setTimeout(() => {
              setErrorBobble({ x: ba.target.x, y: ba.target.y });
              if (sndRef.current) playSoundLocal('bobble');
              setTimeout(() => setErrorBobble(null), 1300);
            }, ba.dur - 40);
            setTimeout(() => setDroppedFlyBadge({ batter, fielder: fielderName, errCode, team: bt }), ba.dur - 20);
            setTimeout(() => setDroppedFlyBadge(null), ba.dur + 3200);
            setTimeout(() => triggerCrowdReaction('error', bt), ba.dur + 250);
          }
        }
        animateBall(ba.path, ba.dur, () => {
          if (isGRD) {
            // Dead ball — it's in the stands. No throw-back; just pause briefly
            // for the runners to reach their limit before resolving the outcome.
            setTimeout(() => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }, 700);
          } else if (nar.isInsideThePark && oc === 'homeRun') {
            // Inside-the-park HR (Idea #83) — relay throw back from the corner
            // through the cutoff (SS) toward home. Lands too late: by the time
            // the ball arrives at the plate, the runner has already crossed.
            // We hold processOutcome until the runner trot completes (handled
            // by the troDur timer above), so we just animate the throw chain
            // here for the visual.
            setTimeout(() => animateBall(linePts(ba.target, F.SS, 16), 650, () => animateBall(linePts(F.SS, F.HP, 16), 600, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); })), 400);
          } else if (nar.isOutfieldAssist && oc === 'single') {
            // Outfield assist at home (Idea #89) — OF gets the ball, fires a
            // missile to the catcher at home plate to gun down the runner from
            // 3B. Animate ball: OF target → cutoff (SS) → home plate. Timed so
            // the throw arrives at HP just after the runner (the standard
            // runner trot is ~2500ms; the throw chain lands ~50ms later for a
            // bang-bang OUT call). After the tag, throw back to the pitcher to
            // close out the play. The runner-out + crowd reaction + badge +
            // glove-pop fire as the ball arrives at the plate.
            setTimeout(() => {
              setOutfieldAssistBadge({ batter, fielder: nar.oaFielder, runner: nar.oaRunner, team: bt });
              setTimeout(() => setOutfieldAssistBadge(null), 3500);
              animateBall(linePts(ba.target, F.SS, 16), 360, () => {
                animateBall(linePts(F.SS, F.HP, 16), 380, () => {
                  // The throw arrives — runner is gunned down at the plate.
                  if (sndRef.current) playSoundLocal('gunDownAtPlate');
                  // Fire the home crowd web-gem-style reaction for the defensive heroics.
                  triggerCrowdReaction('webGem', 1 - bt);
                  // Flying helmet (Backlog #96) — runner slides hard in vain trying
                  // to beat the throw home. Helmet pops off as the catcher's tag
                  // lands. Higher chance here than other slides because the runner
                  // is sliding desperately into a known close play.
                  if (nar.helmetOff) {
                    const runnerColor = bt === 0 ? '#b91c1c' : '#1e40af';
                    setTimeout(() => {
                      setFlyingHelmet({ x: F.HP.x - 12, y: F.HP.y - 8, color: runnerColor, dir: -1 });
                      if (sndRef.current) setTimeout(() => playSoundLocal('helmetThump'), 720);
                      setTimeout(() => setFlyingHelmet(null), 850);
                    }, 80);
                  }
                  setTimeout(() => {
                    animateBall(linePts(F.HP, F.P, 16), 480, () => {
                      setBallPos(null); setMovingFielder(null);
                      processOutcome(oc, card, nar, true, res);
                    });
                  }, 350);
                });
              });
            }, 100);
          } else if (nar.isOutfieldAssist3B && oc === 'single') {
            // Outfield assist at THIRD (Backlog #146) — the OF fields the single
            // and fires to third base to gun down the runner trying to stretch
            // from 1B. Animate ball: OF target → cutoff (SS) → third base. After
            // the tag, throw back to the pitcher. Badge + crowd reaction + glove
            // pop fire as the ball arrives at the bag. Mirrors the gun-down-at-
            // home (#89) relay structure, just targeting 3B instead of the plate.
            setTimeout(() => {
              setOutfieldAssist3BBadge({ batter, fielder: nar.oa3Fielder, runner: nar.oa3Runner, team: bt });
              setTimeout(() => setOutfieldAssist3BBadge(null), 3500);
              animateBall(linePts(ba.target, F.SS, 16), 360, () => {
                animateBall(linePts(F.SS, F.B3, 16), 380, () => {
                  // The throw arrives — runner is gunned down at third base.
                  if (sndRef.current) playSoundLocal('gunDownAtPlate');
                  // Fire the defensive crowd web-gem-style reaction for the heroics.
                  triggerCrowdReaction('webGem', 1 - bt);
                  // Flying helmet (Backlog #96) — runner slides hard in vain
                  // trying to beat the throw to third. Helmet pops off as the tag
                  // lands. Higher chance because it's a known desperate close play.
                  if (nar.helmetOff) {
                    const runnerColor = bt === 0 ? '#b91c1c' : '#1e40af';
                    setTimeout(() => {
                      setFlyingHelmet({ x: F.B3.x - 10, y: F.B3.y - 8, color: runnerColor, dir: -1 });
                      if (sndRef.current) setTimeout(() => playSoundLocal('helmetThump'), 720);
                      setTimeout(() => setFlyingHelmet(null), 850);
                    }, 80);
                  }
                  setTimeout(() => {
                    animateBall(linePts(F.B3, F.P, 16), 460, () => {
                      setBallPos(null); setMovingFielder(null);
                      processOutcome(oc, card, nar, true, res);
                    });
                  }, 350);
                });
              });
            }, 100);
          } else if (isH) {
            // Infield single (Backlog #99) — relay throw goes infielder → 1B (late
            // — the runner has already crossed) → P. Shorter throw chain than the
            // standard single's "OF → SS cutoff → P" path. The throw to 1B is
            // a beat behind the runner per the late-glove-pop in the bespoke
            // sound. Standard isH timing pause (600ms) preserved for the runner
            // trot animation (animateRunners is set up in the runner-paths block).
            if (nar.isInfieldSingle && oc === 'single') {
              // 1B umpire SAFE call (Backlog #118) — runner beats the throw by
              // a half-step. The umpire spreads both arms wide (classic SAFE
              // signal) as the late relay arrives at 1B. Timed to land just
              // as the ball reaches the bag (200ms pre-pause + 380ms throw).
              setTimeout(() => {
                setUmpire1BPhase('safeCall');
                setTimeout(() => setUmpire1BPhase('idle'), 1200);
              }, 200 + 380);
              setTimeout(() => animateBall(linePts(ba.target, F.B1, 16), 380, () => animateBall(linePts(F.B1, F.P, 16), 480, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); })), 200);
            } else if (nar.isThrowError && oc === 'single') {
              // Throwing error (Backlog #105) — the wild throw past 1B was
              // already animated above (~1100ms after ball-arrival). After
              // that animation completes, retrieve the ball back to the
              // pitcher and call processOutcome. The 1700ms total wait gives
              // the wild throw + bobble overlay time to finish.
              // 1B umpire SAFE call (Backlog #118) — the throw sails past 1B,
              // batter reaches safely. Spread-arms SAFE signal fires as the
              // wild throw sails past (~1300ms after ball-arrival, just after
              // the ErrorBobble overlay lands).
              setTimeout(() => {
                setUmpire1BPhase('safeCall');
                setTimeout(() => setUmpire1BPhase('idle'), 1200);
              }, 1300);
              setTimeout(() => animateBall(linePts({ x: F.B1.x + 24, y: F.B1.y + 18 }, F.P, 16), 600, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }), 1700);
            } else {
              setTimeout(() => animateBall(linePts(ba.target, F.SS, 16), 550, () => animateBall(linePts(F.SS, F.P, 16), 550, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); })), 600);
            }
          } else if (isG) {
            // Diving stop (Backlog #93) — fielder lays out at the catch point with
            // dust puffs, distinctive sound, info-bar badge, and a defensive web-gem
            // crowd reaction. Pure flavor on top of the standard groundout. Pre-fires
            // immediately on ball-arrival; we extend the standard 300ms pause so the
            // ~700ms dive animation has time to play before the throw to first.
            const isDS = !!nar.isDivingStop && ba.target;
            if (isDS) {
              const defColor = bt === 0 ? '#1e40af' : '#b91c1c';
              const dsDir = ba.target.x >= F.HP.x ? 1 : -1; // +1 dive toward right side, -1 dive toward left
              setDivingStop({ x: ba.target.x, y: ba.target.y, color: defColor, dir: dsDir });
              setTimeout(() => setDivingStop(null), 1100);
              setDivingStopBadge({ batter, fielder: nar.dsFielder || 'the infielder', team: 1 - bt });
              setTimeout(() => setDivingStopBadge(null), 3200);
              if (sndRef.current) playSoundLocal('divingStop');
              // Defensive web-gem-style crowd reaction (the home/defensive crowd erupts).
              triggerCrowdReaction('webGem', 1 - bt);
            }
            // Fielder's choice (Backlog #137) — fire the FC badge alongside
            // the throw-to-2B animation that the standard groundOut+runner-on-1B
            // pathway already produces. The lead runner forced out at 2B is
            // captured via nar.fcRunner. Auto-clear after 3.2s. Pure narration /
            // badge layer — no animation override, no engine mutation.
            if (nar.isFieldersChoice) {
              const fcRunnerLast = (nar.fcRunner || '').split(' ').slice(-1)[0] || 'the runner';
              setFieldersChoiceBadge({
                batter,
                runner: fcRunnerLast,
                fielder: nar.sub || 'the infielder',
                team: 1 - bt,
              });
              setTimeout(() => setFieldersChoiceBadge(null), 3200);
            }
            setTimeout(() => {
              // Hit and run (Backlog #148) — the runner from 1B is moving on the
              // pitch and beats the force, so the defense's only play is the BATTER
              // at first (not the force at second). Treat the throw as a no-force
              // out at first: `forceAt2B` is false for a hit-and-run even though a
              // runner occupies 1B, which routes the ball to F.B1 and lets the
              // 1B-stretch + 1B umpire OUT-call fire below. The runner's 1B→2B path
              // is animated separately (computeRunnerPaths groundOut) and the base
              // write [null, runner, null] leaves him safe at second.
              const r1 = !!gs.current.bases[0], hnr = !!nar.isHitAndRun, forceAt2B = r1 && !hnr, cb = forceAt2B ? F.B2 : F.B1, fk = INF_MAP[nar.sub] || 'SS', rfk = forceAt2B ? (fk === 'SS' || fk === 'F3B' ? 'F2B' : 'SS') : 'F1B';
              // Pitcher covers first on a 3-1 putout (Backlog #143) — when the
              // first baseman ranges off the bag to field the grounder, the
              // pitcher must sprint over to cover first and take the toss. Fires
              // ~65% of the time the 1B fields a routine grounder with the play
              // at first (no force at 2B). The pitcher figure breaks from the
              // mound to the bag (the mound pitcher render is suppressed while
              // pitcherCover is set); the 1B who fielded it is NOT sent to the
              // bag, and the 1B-stretch overlay is skipped. Suppressed on the
              // special groundOut flavor cases so their own animations own the
              // beat. Pure cosmetic — the out is recorded exactly as a normal
              // groundout. nar.isPitcherCover persists the flag for replay.
              const pitcherCovers = !r1 && nar.sub === 'the first baseman'
                && !nar.isChallenge && !nar.isThrowError && !nar.isComebacker
                && !nar.isDivingStop && !nar.isFieldersChoice && !nar.isBangBang
                && !nar.isProductiveOut && Math.random() < 0.65;
              if (pitcherCovers) {
                nar.isPitcherCover = true;
                const coverColor = bt === 0 ? '#1e40af' : '#b91c1c';
                animatePitcherCover(F.P, F.B1, 380, coverColor);
                setPitcherCoverBadge({ team: 1 - bt });
                setTimeout(() => { if (playIdRef.current === thisPlayId) setPitcherCoverBadge(null); }, 3200);
                if (sndRef.current) setTimeout(() => playSoundLocal('glovePop'), 400);
              } else {
                animateFielder(rfk, F[rfk], cb, 300);
              }
              // Bang-bang play (Backlog #75) — kick off the runner-slide overlay
              // ~120ms before the ball arrives at 1B so the slide and the glove
              // pop land at roughly the same beat. Auto-clear after the slide.
              if (nar.isBangBang && !r1) {
                const runnerColor = bt === 0 ? '#b91c1c' : '#1e40af';
                setTimeout(() => { setBangBangPlay({ color: runnerColor }); setTimeout(() => setBangBangPlay(null), 1100); }, 280);
                setBangBangBadge({ team: bt });
                setTimeout(() => setBangBangBadge(null), 3000);
                if (sndRef.current) setTimeout(() => playSoundLocal('bangBang'), 380);
                // Flying helmet (Backlog #96) — ~50% chance the runner's helmet pops
                // off on the headfirst slide into 1B. Fired alongside the bang-bang
                // SVG, anchored just above first base where the slide lands.
                if (nar.helmetOff) {
                  setTimeout(() => {
                    const helmDir = bt === 0 ? -1 : -1; // helmet flies away toward foul territory
                    setFlyingHelmet({ x: F.B1.x - 4, y: F.B1.y - 6, color: runnerColor, dir: helmDir });
                    if (sndRef.current) setTimeout(() => playSoundLocal('helmetThump'), 720);
                    setTimeout(() => setFlyingHelmet(null), 850);
                  }, 360);
                }
              }
              // First baseman stretch (Backlog #114) — fire just before the ball-
              // to-first animation begins so the glove extension apex (~375ms in)
              // aligns with the ball's arrival (~400ms ball-flight). Only fires
              // when the throw is going to first base (no force play at second).
              // Pure cosmetic overlay — the standard moving sprite still renders
              // beneath, but the stretch silhouette captures the dramatic catch.
              // Uses `!forceAt2B` so a hit-and-run (runner on 1B but the play is at
              // first) also gets the stretch + 1B OUT-call, while a fielder's
              // choice (force at second) correctly does not.
              if (!forceAt2B) {
                // 1B-stretch silhouette — skipped when the pitcher is covering
                // first (Backlog #143): on a 3-1 putout the pitcher (not the 1B)
                // receives at the bag, so the 1B doesn't stretch.
                if (!pitcherCovers) {
                  const f1bStretchColor = bt === 0 ? '#1e40af' : '#b91c1c';
                  setF1bStretch({ color: f1bStretchColor, throwFrom: { x: ba.target.x, y: ba.target.y }, keyId: Date.now() });
                  setTimeout(() => setF1bStretch(null), 800);
                }
                // 1B umpire OUT call (Backlog #118) — fires ~420ms after the
                // throw begins, timed to land just after the ball arrives at
                // 1B (~400ms ball-flight). The umpire punches his right arm
                // up with a closed fist (classic OUT signal). Held for 1.2s
                // then snaps back to idle. Suppressed during throwing-error
                // and challenge plays — those have their own resolution flow
                // that overrides the routine "out at first" beat.
                if (!nar.isThrowError && !nar.isChallenge && !nar.isInfieldSingle) {
                  setTimeout(() => {
                    setUmpire1BPhase('outCall');
                    setTimeout(() => setUmpire1BPhase('idle'), 1200);
                  }, 420);
                }
              }
              animateBall(linePts(ba.target, cb, 16), 400, () => {
                if (oc === 'doublePlay' && r1) {
                  if (nar.isTriplePlay) {
                    // Triple play (Backlog #85) — 4-stop ball relay: cb (2B) → 1B → 3B → P.
                    // The 3B catch is the third out (tagging the runner who advanced from 1B
                    // and got too aggressive). Three rapid-fire mitt pops + fanfare swell
                    // play at the start of the relay; a glovePop fires at 3B for the third
                    // out beat. Fireworks erupt for the rare three-outs-on-one-swing event.
                    if (sndRef.current) playSoundLocal('triplePlay');
                    setTripleplayBadge({ batter, team: bt });
                    setTimeout(() => setTripleplayBadge(null), 4500);
                    // Crowd reaction (defensive — the home crowd erupts when the home team
                    // turns three; uses the same defensive-play reaction pool as web gems).
                    setTimeout(() => triggerCrowdReaction('webGem', bt), 600);
                    // Double fireworks burst — once at the start of the relay, again at the
                    // third out for that "we did it!" feel.
                    triggerFireworks();
                    setTimeout(() => triggerFireworks(), 700);
                    animateBall(linePts(cb, F.B1, 16), 350, () =>
                      animateBall(linePts(F.B1, F.B3, 16), 400, () => {
                        if (sndRef.current) playSoundLocal('glovePop');
                        animateBall(linePts(F.B3, F.P, 16), 400, () => {
                          setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res);
                        });
                      })
                    );
                  } else {
                    if (sndRef.current) playSoundLocal('doublePlayTurn');
                    animateBall(linePts(cb, F.B1, 16), 400, () => animateBall(linePts(F.B1, F.P, 16), 400, () => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }));
                  }
                }
                else if (nar.isChallenge) {
                  // Manager challenge / replay review (Idea #80) — hold the play,
                  // run the review overlay (~1.6s reviewing + ~1.0s verdict), then:
                  //   UPHELD     → process the original groundOut result.
                  //   OVERTURNED → animate batter HP→1B, then process as a single
                  //                using the pre-computed challengeOverturnedRes.
                  setBallPos(null); setMovingFielder(null);
                  setChallengeBadge({ batter, team: bt, overturned: nar.challengeOverturned });
                  setChallengeReview({ phase: 'reviewing' });
                  if (sndRef.current) playSoundLocal('challengeBuzz');
                  setTimeout(() => {
                    if (playIdRef.current !== thisPlayId) return;
                    setChallengeReview({ phase: nar.challengeOverturned ? 'overturned' : 'confirmed' });
                  }, 1600);
                  setTimeout(() => {
                    if (playIdRef.current !== thisPlayId) return;
                    setChallengeReview(null);
                    setTimeout(() => setChallengeBadge(null), 2200);
                    if (nar.challengeOverturned) {
                      // Animate the batter ruled-safe at first, then process as single
                      const runnerColor = bt === 0 ? '#b91c1c' : '#1e40af';
                      animateRunners([[F.HP, F.B1]], runnerColor, 1100);
                      setBatterPhase('gone');
                      setTimeout(() => {
                        if (playIdRef.current !== thisPlayId) return;
                        processOutcome('single', card, nar, true, nar.challengeOverturnedRes);
                      }, 1200);
                    } else {
                      processOutcome(oc, card, nar, true, res);
                    }
                  }, 2600);
                }
                else animateBall(linePts(cb, F.P, 16), 400, () => { setBallPos(null); setMovingFielder(null); setPitcherCover(null); processOutcome(oc, card, nar, true, res); });
              });
            }, isDS ? 800 : 300);
          } else if (nar.isDropped3rd) {
            // Ball reaches the catcher, who can't hold on — passed-ball sound fires,
            // the ball dribbles free, and we hold briefly while the batter sprints to 1B.
            if (sndRef.current) playSoundLocal('passedBall');
            setTimeout(() => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }, 900);
          } else if (nar.isFanGrab && oc === 'foulBall' && nar.fanGrab) {
            // Foul ball into stands (Idea #81) — fan reaches up and snags a souvenir.
            // Fire the fan-catch SVG at the moment the ball arrives, play the cheer
            // sound, then process the foul outcome (still counts as a strike per the
            // standard foulBall pathway). Auto-clear the SVG after its animation.
            setFanCatch({ x: nar.fanGrab.x, y: nar.fanGrab.y });
            if (sndRef.current) playSoundLocal('fanCheer');
            setTimeout(() => setFanCatch(null), 1700);
            setTimeout(() => { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }, 600);
            // Fresh ball toss from HP umpire to pitcher (Backlog #135) — the
            // foul ball is in the stands (gone). Fires ~1900ms after the fan
            // grabs it (the fan-catch celebration runs ~1700ms; the toss
            // begins just as the celebration is winding down). Suppressed
            // when the cap-tip-to-fan gesture is in progress so the two
            // gestures don't overlap; the toss waits for the cap-tip.
            setTimeout(() => {
              if (playIdRef.current !== thisPlayId) return;
              if (gs.current.gameOver) return;
              setFreshBallToss({ ts: Date.now() });
              setFreshBallTossBadge(true);
              if (sndRef.current) playSoundLocal('freshBall');
              setTimeout(() => setFreshBallToss(null), 900);
              setTimeout(() => setFreshBallTossBadge(false), 1600);
            }, 1900);
            // Cap-tip-to-fan (Backlog #133) — ~35% chance the batter tips his
            // cap toward the fan in the stands after the catch. Fires ~900ms
            // after the fan grabs the ball (just as the fan-catch SVG is
            // mid-celebration). The batterPhase setter overrides the brief
            // 'swing'→'stance' transition that happens during processOutcome
            // — we set it back to 'stance' after the 1300ms cap-tip cycle.
            if (Math.random() < 0.35) {
              const tcfBatter = batter;
              const tcfTeam = bt;
              setTimeout(() => {
                if (playIdRef.current !== thisPlayId) return;
                if (gs.current.gameOver) return;
                setBatterPhase('tipCapFan');
                setCapTipFanBadge({ batter: tcfBatter, team: tcfTeam });
                if (sndRef.current) playSoundLocal('capTipFan');
              }, 900);
              setTimeout(() => {
                if (playIdRef.current !== thisPlayId) return;
                setBatterPhase('stance');
                setCapTipFanBadge(null);
              }, 900 + 1300);
              // Mark for play history persistence so replays mirror the gesture.
              nar.isCapTipFan = true;
            }
          } else { setBallPos(null); setMovingFielder(null); processOutcome(oc, card, nar, true, res); }
        });
      }, 1100 + stepOutDelay + shakeOffDelay + cleatKnockDelay + browWipeDelay + checkRunnerDelay + signNodDelay);
    } else setTimeout(() => setAnnounceText(nar.text), 1100 + stepOutDelay + shakeOffDelay + cleatKnockDelay + browWipeDelay + checkRunnerDelay + signNodDelay);
  }

  function processOutcome(oc, card, nar, animated = false, result = null) {
    const g = gs.current, bt = g.half, bat = teams[bt].players[g.batterIdx[bt]], S = statsRef.current[bt][bat];
    const res = result || calculatePlayResult(g, oc, bat);
    // Tip of the cap (Backlog #100) — fire the pitcher's brief tip-cap pose
    // after a defensive gem (web gem, diving stop, robbed HR, outfield assist).
    // The roll was made in narrateLocal and stashed on `nar.fireTipCap` with
    // the fielder name; here we simply trigger the visual / sound / badge with
    // a small delay so the gem has time to settle visually first. Pure cosmetic
    // — no gameplay effect. The defensive team is `1 - bt`.
    if (nar.fireTipCap) {
      const tcFielder = nar.tipCapFielder || 'the fielder';
      const tcTeam = 1 - bt;
      setTimeout(() => {
        if (gs.current.gameOver) return;
        setPitcherTipCap(true);
        setTipCapBadge({ fielder: tcFielder, team: tcTeam });
        if (sndRef.current) playSoundLocal('tipCap');
      }, 700);
      setTimeout(() => setPitcherTipCap(false), 700 + 1400);
      setTimeout(() => setTipCapBadge(null), 700 + 2400);
    }
    // Capture pre-play state for clutch hit detection
    const preOuts = g.outs;
    const preRISP = g.bases[1] !== null || g.bases[2] !== null; // runners in scoring position
    let nO = g.outs + res.outsAdded, bD = false, isCalledK = false, isBallFourWalk = false;
    // Two-strike approach (Backlog #128) — capture pre-pitch strike count so
    // we can detect a 1→2 transition below and flash the choke-up badge.
    const _preStrikesCU = (g.count?.strikes ?? 0);
    if (oc === 'ball') { g.count.balls++; addPitchLocation('ball'); if (g.count.balls >= 4) { bD = true; isBallFourWalk = true; } }
    else if (oc === 'strike') { g.count.strikes++; addPitchLocation('strike'); if (g.count.strikes >= 3) { nO++; bD = true; isCalledK = true; } }
    else if (oc === 'foulBall') { addPitchLocation('foul'); if (g.count.strikes < 2) g.count.strikes++; }
    else if (doesSwing(oc) || ['walk', 'hbp'].includes(oc)) bD = true;
    // Two-strike approach badge (Backlog #128) — only flash the pill when the
    // strike count just crossed FROM 1 TO 2 (avoid re-firing on foul balls
    // that hold strikes at 2). The SVGBatter chokeUp prop is driven directly
    // off the live count, so the visual stance shows for the rest of the AB
    // regardless of this badge timing.
    if ((oc === 'strike' || oc === 'foulBall') && _preStrikesCU === 1 && (g.count?.strikes ?? 0) === 2) {
      setChokeUpBadge({ batter: bat, team: bt });
      setTimeout(() => setChokeUpBadge(null), 1600);
    }
    // Dropped fly ball error (Backlog #103) — re-mapped from flyOut to 'double'
    // for advancement, but stat-wise it's still an ERROR: no hit credit, no
    // team-hit increment, AB still charged. The defense gets charged with an
    // error (handled below alongside oc === 'error').
    if (bD) { S.ab++; if (!nar.isDroppedFly && !nar.isThrowError && ['single', 'double', 'triple', 'homeRun'].includes(oc)) { S.h++; if (oc === 'homeRun') S.hr++; g.hits[bt]++; } if (oc === 'bunt' && res.outsAdded === 0) { S.h++; g.hits[bt]++; } g.count = { balls: 0, strikes: 0 }; g.batterIdx[bt] = (g.batterIdx[bt] + 1) % 9; g.currentABPitches = 0; battleSoundFiredRef.current = false; }
    if (res.runs > 0) {
      g.innings[bt][g.innings[bt].length - 1] += res.runs;
      // Scoring play flash — highlight scoreboard R column with floating "+X" badge
      setScoringFlash({ team: bt, runs: res.runs });
      setTimeout(() => setScoringFlash(null), 2000);
    }
    // RBI tracking: credit batter for runs on hits, sac flies, walks/HBP (bases loaded), groundouts, bunts
    // No RBI on errors or double plays (standard baseball scoring)
    if (res.runs > 0 && oc !== 'error' && !nar.isDroppedFly && !nar.isThrowError && oc !== 'doublePlay') S.rbi += res.runs;
    if (oc === 'error' || nar.isDroppedFly || nar.isThrowError) g.errors[1 - bt]++;
    // Clutch hit detection: hit with RISP and 2 outs (dropped fly errors don't count as hits)
    const isHit = (!nar.isDroppedFly && !nar.isThrowError && ['single', 'double', 'triple', 'homeRun'].includes(oc)) || (oc === 'bunt' && res.outsAdded === 0);
    if (isHit && preRISP && preOuts === 2) {
      S.clutchHits++;
      setClutchBadge({ batter: bat, team: bt });
      setTimeout(() => setClutchBadge(null), 3000);
    }
    // Cycle watch: track hit types per batter and detect when nearing or completing the cycle
    // (dropped fly errors and throwing errors don't count as a "single" toward the cycle)
    if (!nar.isDroppedFly && !nar.isThrowError && ['single', 'double', 'triple', 'homeRun'].includes(oc)) {
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
      // Track K type for backwards-K display (Backlog #107) — 'L' for looking
      // (called strike three), 'S' for swinging (card-mapped strikeout or foul tip
      // strikeout). Per real baseball scoring tradition, looking K's get a backwards
      // "K" on the fence display. Defensive against legacy games saved before this
      // field existed (kHistory may be undefined on a freshly-loaded older save).
      if (!g.kHistory) g.kHistory = [[], []];
      g.kHistory[1 - bt].push(isCalledK ? 'L' : 'S');
      // Umpire punch-out animation on strikeouts — but NOT on a dropped 3rd strike,
      // where the play is still live and the ump is tracking the batter's dash to 1B.
      if (!isDropped3rd) {
        setUmpirePhase('punchOut');
        setTimeout(() => setUmpirePhase('idle'), 1200);
      }
      // Pitcher fist pump on clutch K (Backlog #129) — fires when the defensive
      // pitcher records a "big" strikeout: inning ≥ 7, runners in scoring
      // position (or the K is the 3rd out of the inning with any runner on),
      // the defensive team leads by 1-3 runs (close game), and a 70% roll.
      // Suppressed during manager ejections (#95 — pitcher focus shifts to the
      // home-plate scrum) and on dropped 3rd strikes (the play is still live).
      // The pre-K bases come from g.bases (not yet mutated to res.nextBases at
      // this point — that happens at the bottom of processOutcome). Defensive
      // against legacy save state via ?. / ?? defaults.
      const fpInning = gs.current?.inning ?? 0;
      const fpPreBases = Array.isArray(g.bases) ? g.bases : [null, null, null];
      const fpAwayScore = (gs.current?.innings?.[0] || []).reduce((a, b) => a + b, 0);
      const fpHomeScore = (gs.current?.innings?.[1] || []).reduce((a, b) => a + b, 0);
      // bt is the batting team; defensive team is 1-bt. Defensive lead is
      // (def score) − (batting score).
      const fpDefIdx = 1 - bt;
      const fpDefScore = fpDefIdx === 0 ? fpAwayScore : fpHomeScore;
      const fpOffScore = fpDefIdx === 0 ? fpHomeScore : fpAwayScore;
      const fpDefLead = fpDefScore - fpOffScore;
      const fpRISP = !!fpPreBases[1] || !!fpPreBases[2];
      const fpRunnersOn = !!fpPreBases[0] || fpRISP;
      const fpIsInningEnder = nO >= 3 && fpRunnersOn;
      const fpClose = fpDefLead >= 1 && fpDefLead <= 3;
      const fpEligible = !isDropped3rd && !nar.isEjection && fpInning >= 7 && (fpRISP || fpIsInningEnder) && fpClose && Math.random() < 0.70;
      if (fpEligible) {
        nar.isFistPump = true;
        const fpColor = bt === 0 ? '#1e40af' : '#b91c1c'; // defensive team color
        const fpPitcherName = teams[fpDefIdx]?.players?.[8] || 'the pitcher';
        // Visual fires immediately (alongside the punchOut); the sound is
        // delayed ~120ms so the audio lands just as the arm punches down.
        setFistPumpAct({ color: fpColor, ts: Date.now() });
        setTimeout(() => setFistPumpAct(null), 1100);
        setFistPumpBadge({ batter: bat, pitcher: fpPitcherName, team: fpDefIdx });
        setTimeout(() => setFistPumpBadge(null), 2800);
        if (sndRef.current) setTimeout(() => playSoundLocal('fistPump'), 120);
      }
    }
    // Manager ejection (Backlog #95) — fire the dugout-to-plate animation,
    // ejection badge, and "you're outta here!" umpire pose after the strikeout
    // has been processed. The animation is staged: at +1300ms (after punchOut
    // finishes) the manager walks from his dugout to home plate, argues for
    // ~2.0s while the umpire transitions to the eject pose, then walks back.
    // Pure flavor — no mechanical effect on the game state.
    if (nar.isEjection && oc === 'strikeout') {
      const _ejTeamName = nar.ejectionTeamName || teams[bt].name;
      const _ejIsHomeTeam = bt === 1; // home team's manager comes from the home dugout
      const _ejDugoutX = _ejIsHomeTeam ? 522 : 98;
      const _ejDugoutY = 430;
      const _ejPlateX = F.HP.x + (_ejIsHomeTeam ? 30 : -30); // approach plate from the team's side
      const _ejPlateY = F.HP.y - 4;
      // Stage 1: manager walks from dugout to home plate (1.0s)
      const ejWalkOutDur = 1000;
      const ejArgueDur = 1900;
      const ejWalkBackDur = 1000;
      // Wait for the punchOut animation to finish before the manager bursts out.
      setTimeout(() => {
        // Walk-out animation
        const sStart = performance.now();
        const tickWalk = (now) => {
          const rawT = Math.min(1, (now - sStart) / ejWalkOutDur);
          const x = lerp(_ejDugoutX, _ejPlateX, rawT);
          const y = lerp(_ejDugoutY, _ejPlateY, rawT);
          setEjectionAct({ x, y, progress: rawT, phase: 'walk' });
          if (rawT < 1) requestAnimationFrame(tickWalk);
          else {
            // Stage 2: argue at the plate (1.9s)
            setEjectionAct({ x: _ejPlateX, y: _ejPlateY, progress: 1, phase: 'argue' });
            // Eject the manager halfway through the argument — umpire makes the thumb-jab.
            setTimeout(() => {
              setEjectionUmpireActive(true);
              if (sndRef.current) playSoundLocal('ejection');
              setEjectionBadge({ team: bt, manager: `${_ejTeamName} manager` });
              // Trigger a crowd reaction (boos for the home crowd if home team's
              // manager is ejected, cheers/jeers from the visiting fans either way).
              triggerCrowdReaction('strikeout', bt);
            }, 700);
            // Stage 3: walk back to dugout (1.0s)
            setTimeout(() => {
              const sBack = performance.now();
              const tickBack = (now2) => {
                const rawT2 = Math.min(1, (now2 - sBack) / ejWalkBackDur);
                const x2 = lerp(_ejPlateX, _ejDugoutX, rawT2);
                const y2 = lerp(_ejPlateY, _ejDugoutY, rawT2);
                setEjectionAct({ x: x2, y: y2, progress: rawT2, phase: 'walkOff' });
                if (rawT2 < 1) requestAnimationFrame(tickBack);
                else {
                  setEjectionAct(null);
                  setEjectionUmpireActive(false);
                  // Clear the badge a moment after the manager exits the field
                  setTimeout(() => setEjectionBadge(null), 600);
                }
              };
              requestAnimationFrame(tickBack);
            }, ejArgueDur);
          }
        };
        requestAnimationFrame(tickWalk);
      }, 1300);
    }
    // Bat boy retrieves the bat (Backlog #121) — atmospheric figure emerges
    // from the batting team's dugout after a strikeout, jogs to home plate,
    // bends to grab the bat the batter left behind, and jogs back. Pure
    // cosmetic — no gameplay effect. Suppressed during dropped 3rd strikes
    // (the play is still live and the batter has the bat as he sprints to
    // 1B) and during manager ejections (the manager is at home plate
    // arguing — focus belongs there). ~30% trigger rate so it's a recurring
    // but not overwhelming flavor moment. Fires after a 1300ms delay so the
    // umpire's punch-out finishes first.
    if ((oc === 'strikeout' || isCalledK) && !isDropped3rd && !nar.isEjection && !gs.current.gameOver && Math.random() < 0.3) {
      // Home batting (bt === 1) → bat boy from the home (left) dugout at
      // x=98; away batting → right dugout at x=522. Matches the Dugouts
      // component convention (home stripe on the left dugout) and the
      // on-deck batter rendering (home batting on the left-side foul
      // territory). The figure jogs along y=430 to home plate at F.HP.
      const bbIsHomeTeam = bt === 1;
      const bbDugoutX = bbIsHomeTeam ? 98 : 522;
      const bbDugoutY = 430;
      // Stop a few px short of home plate so the figure doesn't visually
      // overlap with the catcher / umpire / batter SVGs.
      const bbPlateX = F.HP.x + (bbIsHomeTeam ? -22 : 22); // approach from the team's dugout side
      const bbPlateY = F.HP.y - 2;
      // Home team wears red (#b91c1c), away team wears blue (#1e40af) — same
      // palette used throughout the rest of the field rendering.
      const bbColor = bbIsHomeTeam ? '#b91c1c' : '#1e40af';
      const bbWalkOutDur = 1000;
      const bbPickupDur = 500;
      const bbWalkBackDur = 1000;
      // Wait for the umpire punchOut animation (1200ms) to finish before
      // the bat boy emerges so the visual order reads: K → punch-out → bat
      // boy retrieves the bat.
      setTimeout(() => {
        if (gs.current.gameOver) return;
        // Stage 1: walk out from dugout to home plate
        const sStart = performance.now();
        const tickOut = (now) => {
          const rawT = Math.min(1, (now - sStart) / bbWalkOutDur);
          const x = lerp(bbDugoutX, bbPlateX, rawT);
          const y = lerp(bbDugoutY, bbPlateY, rawT);
          setBatBoyAct({ x, y, phase: 'walkOut', progress: rawT, color: bbColor });
          if (rawT < 1) requestAnimationFrame(tickOut);
          else {
            // Stage 2: pickup pose held briefly at home plate
            setBatBoyAct({ x: bbPlateX, y: bbPlateY, phase: 'pickup', progress: 0, color: bbColor });
            // Stage 3: walk back to dugout, carrying the bat
            setTimeout(() => {
              const sBack = performance.now();
              const tickBack = (now2) => {
                const rawT2 = Math.min(1, (now2 - sBack) / bbWalkBackDur);
                const x2 = lerp(bbPlateX, bbDugoutX, rawT2);
                const y2 = lerp(bbPlateY, bbDugoutY, rawT2);
                setBatBoyAct({ x: x2, y: y2, phase: 'walkBack', progress: rawT2, color: bbColor });
                if (rawT2 < 1) requestAnimationFrame(tickBack);
                else setBatBoyAct(null);
              };
              requestAnimationFrame(tickBack);
            }, bbPickupDur);
          }
        };
        requestAnimationFrame(tickOut);
      }, 1300);
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

    // Curtain call eligibility (Backlog #141) — decide here, where S.hr is
    // already incremented (the bD stat block above) and the inning runs are
    // already credited to g.innings, whether this home run earns a curtain
    // call. Only the HOME team (bt === 1) gets one — a road player wouldn't be
    // called back out by the home crowd. Qualifies on: a grand slam, a
    // multi-homer game (the batter's 2nd+ HR), or a go-ahead blast in the 7th
    // inning or later (the batting team was tied-or-behind before the swing and
    // ahead after). The flag is read by the deferred curtain-call timer in the
    // swing handler / replay and is persisted to play history for replay
    // parity. Walk-off HRs are naturally excluded later (the timer bails when
    // gs.current.gameOver is set).
    if (oc === 'homeRun' && bt === 1) {
      const ccAwayTot = g.innings[0].reduce((a, b) => a + b, 0);
      const ccHomeTot = g.innings[1].reduce((a, b) => a + b, 0);
      const ccBefore = ccHomeTot - res.runs; // home score before this HR's runs
      const ccGoAhead = g.inning >= 7 && ccBefore <= ccAwayTot && ccHomeTot > ccAwayTot;
      const ccMulti = S.hr >= 2;
      const ccGrand = res.runs === 4;
      if (ccGoAhead || ccMulti || ccGrand) {
        nar.isCurtainCall = true;
        nar.ccReason = ccGrand ? 'grand slam' : ccMulti ? `${S.hr}-homer game` : 'go-ahead blast';
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
      // Flying helmet (Backlog #96) — ~50% chance the helmet pops off on the
      // hard slide into home plate. Anchored just up-and-left of HP so the
      // helmet arcs out toward foul territory beyond third base. Live-only
      // (close-play-at-the-plate is not persisted to playHistory, so replay
      // doesn't show the slide and doesn't need the helmet either).
      if (Math.random() < 0.5) {
        const runnerColor = bt === 0 ? '#b91c1c' : '#1e40af';
        setTimeout(() => {
          setFlyingHelmet({ x: F.HP.x - 10, y: F.HP.y - 8, color: runnerColor, dir: -1 });
          if (sndRef.current) setTimeout(() => playSoundLocal('helmetThump'), 720);
          setTimeout(() => setFlyingHelmet(null), 850);
        }, 1100);
      }
    }

    addLog(nar.text, oc === 'homeRun' ? 'homer' : 'play');
    let cp; setDrawnPile(prev => { cp = [...prev, card]; return cp; });
    setPlayHistory(p => [...p, { card, outcome: oc, narration: nar.text, dir: nar.dir, sub: nar.sub, variant: nar.variant, isHR: oc === 'homeRun', batter: bat, preBases: [...g.bases], team: bt, resultData: res, pileSnapshot: cp, isGRD: nar.isGRD || false, isDropped3rd: !!nar.isDropped3rd, isRobbedHR: !!nar.isRobbedHR, isBangBang: !!nar.isBangBang, isLostInSun: !!nar.isLostInSun, isChallenge: !!nar.isChallenge, challengeOverturned: !!nar.challengeOverturned, isFanGrab: !!nar.isFanGrab, fanGrab: nar.fanGrab || null, isInsideThePark: !!nar.isInsideThePark, isTriplePlay: !!nar.isTriplePlay, isFoulTip: !!nar.isFoulTip, hbpBodyPart: oc === 'hbp' ? (nar.bodyPart || 'elbow') : null, isOutfieldAssist: !!nar.isOutfieldAssist, oaRunner: nar.oaRunner || null, oaFielder: nar.oaFielder || null, isOutfieldAssist3B: !!nar.isOutfieldAssist3B, oa3Runner: nar.oa3Runner || null, oa3Fielder: nar.oa3Fielder || null, isTexasLeaguer: !!nar.isTexasLeaguer, isDivingStop: !!nar.isDivingStop, dsFielder: nar.dsFielder || null, isBrushback: !!nar.isBrushback, isEjection: !!nar.isEjection, ejectionTeamName: nar.ejectionTeamName || null, helmetOff: !!nar.helmetOff, isSqueeze: !!nar.isSqueeze, squeezeRunner: nar.squeezeRunner || null, isMaskToss: !!nar.isMaskToss, isInfieldSingle: !!nar.isInfieldSingle, isFielder: nar.isFielder || null, fireTipCap: !!nar.fireTipCap, tipCapFielder: nar.tipCapFielder || null, isDroppedFly: !!nar.isDroppedFly, dropFielder: nar.dropFielder || null, dropErrCode: nar.dropErrCode || null, isThrowError: !!nar.isThrowError, teFielder: nar.teFielder || null, teErrCode: nar.teErrCode || null, isProductiveOut: !!nar.isProductiveOut, poRunner: nar.poRunner || null, isSacBunt: !!nar.isSacBunt, sacBuntRunner: nar.sacBuntRunner || null, sacBuntAdvancedTo: nar.sacBuntAdvancedTo || null, isDragBunt: !!nar.isDragBunt, isBlocked: !!nar.isBlocked, isFirstToThird: !!nar.isFirstToThird, firstTo3rdRunner: nar.firstTo3rdRunner || null, isComebacker: !!nar.isComebacker, cbPitcher: nar.cbPitcher || null, isFieldersChoice: !!nar.isFieldersChoice, fcRunner: nar.fcRunner || null, isBackstop: !!nar.isBackstop, isFistPump: !!nar.isFistPump, fpPitcher: nar.isFistPump ? (teams[1 - bt]?.players?.[8] || null) : null, isFraming: !!nar.isFraming, isFramed: !!nar.isFramed, isCapTipFan: !!nar.isCapTipFan, isInfieldFly: !!nar.isInfieldFly, isCurtainCall: !!nar.isCurtainCall, ccReason: nar.ccReason || null, isTagUp: !!nar.isTagUp, tagUpRunner: nar.tagUpRunner || null, tagUpTo: nar.tagUpTo || null, isPitcherCover: !!nar.isPitcherCover, isHitAndRun: !!nar.isHitAndRun, harRunner: nar.harRunner || null }]);
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
      triggerWalkOffMob(); // Backlog #145 — teammates mob the hero + Gatorade dump
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
    // Grounds crew dragging the infield (Backlog #90) — atmospheric tradition
    // shown ALWAYS at the half-inning transition between top and bottom of
    // the 5th (the classic "middle of the 5th" infield drag). Suppressed if
    // the game has ended in the top of the 5th (extremely unlikely but safe).
    const isMiddleOfFifth = g.half === 0 && g.inning === 5 && !g.gameOver;
    // Crowd wave (Backlog #78) — eligible during mid-inning transitions in
    // innings 4-7 (skipping the stretch frame, the grounds-crew drag, and
    // any game-ending half), at 25% per eligible transition. Suppressed when
    // game is over so it doesn't play over the post-game modal.
    const crowdWaveEligible = !g.gameOver && !is7thStretch && !isMiddleOfFifth
      && g.inning >= 4 && g.inning <= 7
      && Math.random() < 0.25;
    // Umpire plate sweep (Backlog #102) — between half-innings, the home plate
    // umpire bends down with a small whisk broom and dusts off the plate. Pure
    // atmospheric flavor; no mechanical effect. ~50% chance per transition.
    // Suppressed when the game is over (don't sweep into the post-game modal),
    // when the 7th-inning stretch is firing (already a long pause), and when
    // the grounds crew is dragging the infield in the middle of the 5th
    // (already a long animation). Plays alongside the inning summary so it
    // does NOT add any extra delay — the sweep starts as the summary appears
    // and ends ~200ms before the summary clears. Still allowed during a crowd
    // wave because the wave is a stadium-wide overlay and the umpire is in
    // the foreground at home plate.
    const plateSweepEligible = !g.gameOver && !is7thStretch && !isMiddleOfFifth
      && Math.random() < 0.5;
    if (plateSweepEligible) {
      setUmpirePhase('plateSweep');
      // Clear the sweep ~200ms before the inning summary clears (2500ms above)
      // so the umpire is already standing back upright when the next half-
      // inning begins drawing.
      setTimeout(() => setUmpirePhase('idle'), 2300);
      // Soft "swish-swish" sound on the sweep — uses the existing groundsCrew
      // sound (low broom-on-dirt rasp) at low volume, fired ~150ms in so it
      // syncs with the first sweep stroke.
      if (sndRef.current) setTimeout(() => playSoundLocal('plateSweep'), 150);
    }
    // Stadium organ "CHARGE!" fanfare (Backlog #125) — iconic ballpark organ
    // riff that fires up the crowd between half-innings. ~20% chance per
    // eligible transition. Plays alongside the inning summary card so it
    // adds zero extra delay — the riff starts ~250ms after the summary
    // appears (so the 7-note phrase wraps up before the summary clears at
    // 2500ms) and the badge auto-clears at 2400ms (just before the summary).
    // Suppressed when the game is over (don't blast organ over the post-
    // game modal), during the 7th-inning stretch (the stretch has its OWN
    // organ "Take Me Out to the Ball Game" sound and a stretch banner —
    // they would step on each other), during the middle-of-the-5th grounds-
    // crew drag (its own long atmospheric moment), and while the crowd wave
    // is firing (avoid sound clutter). Sums to roughly one "CHARGE!" call
    // every 5 transitions = ~3-4 per 9-inning game, matching real-ballpark
    // pacing where you hear it a handful of times per game on rally moments.
    const organChargeEligible = !g.gameOver && !is7thStretch && !isMiddleOfFifth
      && !crowdWaveEligible
      && Math.random() < 0.2;
    if (organChargeEligible) {
      setOrganCharge(true);
      if (sndRef.current) setTimeout(() => playSoundLocal('organCharge'), 250);
      // Clear the badge ~100ms before the inning summary clears so the badge
      // doesn't briefly show on top of the next half-inning's first frame.
      setTimeout(() => setOrganCharge(false), 2400);
    }
    setTimeout(() => {
      setInningSummary(null);
      const doTransition = () => {
        if (g.half === 1) { g.inning++; g.half = 0; g.innings[0].push(0); g.innings[1].push(0); } else g.half = 1;
        g.outs = 0; g.bases = [null, null, null]; g.count = { balls: 0, strikes: 0 }; g.rallyCount = 0; g.halfInningReached = 0; g.currentABPitches = 0; battleSoundFiredRef.current = false;
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
      } else if (isMiddleOfFifth) {
        // Grounds crew drag (Backlog #90) — bump key so SVG <animate>
        // elements remount and start fresh, then show the crew for ~3.5s
        // before resuming play. Pure cosmetic.
        setGroundsCrewKey(k => k + 1);
        setGroundsCrewActive(true);
        setTimeout(() => { setGroundsCrewActive(false); doTransition(); }, 3500);
      } else if (crowdWaveEligible) {
        // Trigger the wave for ~3.6s before resuming play. Increment the key so
        // SVG <animate> elements remount and start fresh each trigger.
        setCrowdWaveKey(k => k + 1);
        setCrowdWaveActive(true);
        setTimeout(() => { setCrowdWaveActive(false); doTransition(); }, 3600);
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
    // Catcher's interference replay (Backlog #76) — no card, no pitch flight.
    // Show windup → swing → bat-clips-mitt sound → forced runners advance, batter
    // trots to 1B. Mirrors the live-game timing.
    if (p.isCI) {
      setDrawnPile(p.pileSnapshot || []);
      setOutcome(null); setAnnounceText(p.narration); setPitchPhase('windup'); setBatterPhase('stance'); setActiveBatter(p.batter);
      setTimeout(() => {
        setPitchPhase('throw'); setBatterPhase('swing');
        if (sndRef.current) playSoundLocal('catchersInterference');
        setTimeout(() => {
          setPitchPhase('idle'); setBatterPhase('stance');
          const rps = computeRunnerPaths(p.preBases, 'walk');
          animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', 800);
          setCiBadge({ batter: p.batter, team: bt });
          setTimeout(() => setCiBadge(null), 3200);
          setTimeout(() => { procRef.current = false; }, 900);
        }, 380);
      }, 450);
      return;
    }
    // Pickoff replay (Backlog #64, #120, #124, #132) — no card, no pitch. Windup
    // → throw to 1B, 2B, or 3B → dive-back → (out or safe). The `pickoffBase`
    // field on the play history selects which base the throw goes to; the
    // `pickoffSource` field selects whether the throw originated from the
    // pitcher (default — F.P) or the catcher (Backlog #132 snap throw — F.HP).
    // Legacy plays default to source=pitcher and base=B1 for save compatibility.
    if (p.isPickoff) {
      setDrawnPile(p.pileSnapshot || []);
      setOutcome(null); setAnnounceText(p.narration); setPitchPhase('idle'); setBatterPhase('stance'); setActiveBatter(p.batter);
      const offColor = bt === 0 ? '#b91c1c' : '#1e40af';
      const poBase = (p.pickoffBase === 'B2' || p.pickoffBase === 'B3') ? p.pickoffBase : 'B1';
      const poBag = poBase === 'B2' ? F.B2 : (poBase === 'B3' ? F.B3 : F.B1);
      const isCatcherSnap = p.pickoffSource === 'catcher';
      // Throw origin: pitcher (F.P) for standard pickoffs, home plate (F.HP)
      // for the catcher's snap throw. The catcher snap is longer (HP→B2 vs
      // P→B2) so we use slightly longer ball-flight durations.
      const poOrigin = isCatcherSnap ? F.HP : F.P;
      const poBallOutDur = isCatcherSnap
        ? 460  // catcher snap-throw → 2B is a long throw
        : (poBase === 'B2' ? 420 : (poBase === 'B3' ? 400 : 380));
      const poBallBackDur = isCatcherSnap
        ? 420  // ball relays back to home (not mound) on catcher snap
        : (poBase === 'B2' ? 380 : (poBase === 'B3' ? 380 : 360));
      const poBallReturn = isCatcherSnap ? F.HP : F.P;
      // Only the pitcher's pickoff fires a windup pose — the catcher's snap is
      // instant (no windup, just pop-and-throw).
      if (!isCatcherSnap) setPitchPhase('windup');
      // Errant pickoff throw replay (Backlog #134) — when persisted with
      // p.pickoffWild, mirror the wild-throw animation: ball overshoots the
      // bag into the foul/OF area, ErrorBobble flashes at the bag, the
      // runner sprints to the next base, and the rose-colored wild badge
      // fires. On the 3B variant the runner scores (visual: HP arrival).
      if (p.pickoffWild) {
        const wildTarget = poBase === 'B1'
          ? { x: F.B1.x + 30, y: F.B1.y + 22 }
          : (poBase === 'B2' ? { x: F.B2.x + 4, y: F.B2.y - 28 } : { x: F.B3.x - 30, y: F.B3.y + 22 });
        const runnerPath = poBase === 'B1'
          ? [F.B1, F.B2]
          : (poBase === 'B2' ? [F.B2, F.B3] : [F.B3, F.HP]);
        const runnerDur = poBase === 'B3' ? 1100 : 850;
        const wildBallFlightDur = isCatcherSnap ? 820 : (poBase === 'B2' ? 760 : (poBase === 'B3' ? 720 : 700));
        const wildReturnTarget = isCatcherSnap ? F.HP : F.P;
        const wildReturnDur = isCatcherSnap ? 640 : (poBase === 'B2' ? 620 : (poBase === 'B3' ? 600 : 600));
        setTimeout(() => {
          setPitchPhase('idle');
          if (isCatcherSnap && sndRef.current) playSoundLocal('catcherSnap');
          animateBall([...linePts(poOrigin, poBag, 8), ...linePts(poBag, wildTarget, 8)], wildBallFlightDur, () => {
            if (sndRef.current) playSoundLocal('wildPickoff');
            setBallPos(null);
            setErrorBobble({ x: poBag.x, y: poBag.y - 4 });
            setTimeout(() => setErrorBobble(null), 1300);
            setTimeout(() => {
              animateRunners([runnerPath], offColor, runnerDur);
              setTimeout(() => {
                setPickoffBadge({ outcome: 'wild', team: 1 - bt, base: poBase, source: isCatcherSnap ? 'catcher' : 'pitcher' });
                setTimeout(() => setPickoffBadge(null), 3000);
                setTimeout(() => {
                  animateBall(linePts(wildTarget, wildReturnTarget, 14), wildReturnDur, () => { setBallPos(null); procRef.current = false; });
                }, 400);
              }, runnerDur);
            }, 150);
          });
        }, 450);
        return;
      }
      setTimeout(() => {
        setPitchPhase('idle');
        // Catcher snap-throw plays the dedicated catcherSnap sound at the
        // start of the ball flight; the pitcher's pickoff plays no special
        // sound on throw (just glovePop at arrival).
        if (isCatcherSnap && sndRef.current) playSoundLocal('catcherSnap');
        animateBall(linePts(poOrigin, poBag, 14), poBallOutDur, () => {
          setBallPos(null);
          if (sndRef.current) playSoundLocal('glovePop');
          setPickoffDive({ color: offColor, base: poBase });
          setTimeout(() => setPickoffDive(null), 900);
          if (p.pickoffOut) {
            setPickoffBadge({ outcome: 'out', team: 1 - bt, base: poBase, source: isCatcherSnap ? 'catcher' : 'pitcher' });
            setTimeout(() => setPickoffBadge(null), 2600);
            setTimeout(() => { procRef.current = false; }, 950);
          } else {
            setPickoffBadge({ outcome: 'safe', team: 1 - bt, base: poBase, source: isCatcherSnap ? 'catcher' : 'pitcher' });
            setTimeout(() => setPickoffBadge(null), 2200);
            setTimeout(() => {
              animateBall(linePts(poBag, poBallReturn, 12), poBallBackDur, () => { setBallPos(null); procRef.current = false; });
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
    setCoachSignKey(k => k + 1); // restart 3B coach sign animation on replay
    // Hit-by-pitch replay (Idea #88) — redirect the pitch flight to the batter's
    // body, then fire the recoil pose + dust-puff impact + thud sound + badge at
    // identical timings to live play. Mirrors the live-game flow exactly. After
    // the impact resolves, the standard runner-advance + announce flow is
    // applied via the timeout chain below (no swing branch fires for HBP).
    if (p.outcome === 'hbp') {
      const replayBatterSide = (PLAYER_HANDS[p.batter] === 'L' || PLAYER_HANDS[p.batter] === 'S') ? 'L' : 'R';
      const bodyPart = p.hbpBodyPart || 'elbow';
      const partOffset = { elbow: -2, shoulder: -4, back: -1, hip: 4, leg: 8, foot: 12, knee: 7 }[bodyPart] || 0;
      const batterTargetX = (replayBatterSide === 'L' ? F.HP.x + 25 : F.HP.x - 25);
      const batterTargetY = F.HP.y - 5 + partOffset;
      setTimeout(() => {
        setPitchPhase('throw'); setCatcherSigns(0);
        animateBall(linePts(F.P, { x: batterTargetX, y: batterTargetY }, 16), 600, () => {
          setBallPos(null);
          setBatterPhase('hbp');
          setHbpImpact({ x: batterTargetX, y: batterTargetY, side: replayBatterSide, bodyPart });
          if (sndRef.current) playSoundLocal('hbpThud');
          setHbpBadge({ batter: p.batter, bodyPart, team: bt });
          setTimeout(() => setHbpBadge(null), 3200);
          setTimeout(() => setHbpImpact(null), 1300);
          setTimeout(() => {
            setBatterPhase('stance'); setAnnounceText(p.narration);
            // Forced runners advance per the HBP pathway (uses preBases + 'walk'-style force).
            const rps = computeRunnerPaths(p.preBases, 'walk');
            if (rps.length) animateRunners(rps, bt === 0 ? '#b91c1c' : '#1e40af', 800);
            setTimeout(() => { procRef.current = false; }, 900);
          }, 1100);
        });
      }, 550);
      return;
    }
    // Brushback / chin music replay (Backlog #94) — re-route the pitch up
    // and in toward the batter's head, fire the recoil pose + brushback
    // whistle sound + badge, then carry the ball on to the catcher's mitt.
    // Mirrors the live-play timing exactly. Standard ball-replay flow is
    // suppressed since this branch handles the entire pitch flight.
    if (p.outcome === 'ball' && p.isBrushback) {
      const replayBatterSide = (PLAYER_HANDS[p.batter] === 'L' || PLAYER_HANDS[p.batter] === 'S') ? 'L' : 'R';
      const chinX = F.HP.x + (replayBatterSide === 'L' ? 8 : -8);
      const chinY = F.HP.y - 22;
      setTimeout(() => {
        setPitchPhase('throw'); setCatcherSigns(0);
        animateBall(linePts(F.P, { x: chinX, y: chinY }, 16), 500, () => {
          setBatterPhase('brushback');
          if (sndRef.current) playSoundLocal('brushback');
          setBrushbackBadge({ batter: p.batter, team: bt });
          setTimeout(() => setBrushbackBadge(null), 3200);
          animateBall(linePts({ x: chinX, y: chinY }, F.C, 14), 280, () => {
            setBallPos(null);
            setTimeout(() => setBatterPhase('stance'), 250);
            setTimeout(() => { setPitchPhase('idle'); setAnnounceText(p.narration); procRef.current = false; }, 600);
          });
        });
      }, 550);
      return;
    }
    // Catcher's blocked pitch replay (Backlog #112) — re-route the pitch low
    // and short so it lands in the dirt just in front of home plate, fire the
    // catcher's dive pose + dust puffs + blockedPitch sound + badge, then
    // animate the ball back to the pitcher. Mirrors the live-play timing
    // exactly. Standard ball-replay flow is suppressed since this branch
    // handles the entire pitch flight.
    if (p.outcome === 'ball' && p.isBlocked) {
      const dirtX = F.HP.x - 4;
      const dirtY = F.HP.y + 14;
      setTimeout(() => {
        setPitchPhase('throw'); setCatcherSigns(0);
        animateBall(linePts(F.P, { x: dirtX, y: dirtY }, 16), 540, () => {
          setCatcherBlocking(true);
          if (sndRef.current) playSoundLocal('blockedPitch');
          setBlockedPitchBadge({ team: 1 - bt });
          setTimeout(() => setBlockedPitchBadge(null), 3000);
          setTimeout(() => {
            setCatcherBlocking(false);
            setBallPos(null);
            setTimeout(() => {
              animateBall(linePts({ x: dirtX, y: dirtY }, F.P, 16), 520, () => {
                setBallPos(null);
                setPitchPhase('idle');
                setAnnounceText(p.narration);
                procRef.current = false;
              });
            }, 200);
          }, 700);
        });
      }, 550);
      return;
    }
    setTimeout(() => { setPitchPhase('throw'); setCatcherSigns(0); animateBall(linePts(F.P, { x: F.HP.x, y: F.HP.y - 5 }, 16), 550); }, 550);
    // Catcher framing replay (Backlog #130) — when the persisted play history
    // has nar.isFraming = true, fire the catcher's subtle glove-rotation-inward
    // animation + frameMitt sound at the same timing as the live-play catch
    // (the catcher catches the ball ~1100ms into the replay, after which the
    // framing animation runs over the next ~800ms). Only flash the badge when
    // the framing actually converted the call (p.isFramed). Companion to the
    // sign-acceptance nod which doesn't need replay parity (it's a pre-pitch
    // ritual that has no persisted footprint — the pitcher's pre-pitch
    // animation isn't replayed in the historical view, just the pitch itself).
    if (p.isFraming) {
      setTimeout(() => {
        setCatcherFraming(true);
        if (sndRef.current) playSoundLocal('frameMitt');
        setTimeout(() => setCatcherFraming(false), 800);
        if (p.isFramed) {
          setFramingBadge({ team: 1 - bt });
          setTimeout(() => setFramingBadge(null), 2400);
        }
      }, 1100);
    }
    setTimeout(() => {
      if (doesSwing(p.outcome)) {
        setBatterPhase('swing');
        // Foul tip strikeout replay (Backlog #86) — suppress the standard 'hit'
        // contact sound and play the bespoke foulTip sound (tick + glove-pop) at
        // identical timing to live play. Also flash the badge.
        if (p.isFoulTip) {
          if (sndRef.current) playSoundLocal('foulTip');
          setFoulTipBadge({ batter: p.batter, team: bt });
          setTimeout(() => setFoulTipBadge(null), 3000);
        } else if (sndRef.current && !['ball', 'strike', 'walk', 'hbp'].includes(p.outcome)) {
          playSoundLocal('hit');
        }
        if (p.isDropped3rd) {
          // Dropped 3rd replay — batter sprints to 1B instead of being retired.
          animateRunners([[F.HP, F.B1]], bt === 0 ? '#b91c1c' : '#1e40af', 2200);
          setTimeout(() => setBatterPhase('gone'), 500);
        } else {
          // Inside-the-park HR uses a slightly faster trot so the run reads as
          // urgent vs the leisurely standard HR celebration.
          const trotDur = p.outcome === 'homeRun' ? (p.isInsideThePark ? 5400 : 6500) : 2500;
          // First-to-third replay (Backlog #123) — mirror the live runner-path
          // override so the runner from 1B visibly motors to 3B on the single,
          // not just to 2B. Also extend trot duration to 3200ms so the runner
          // has time to make the extra ninety feet, matching live play.
          const rrps = computeRunnerPaths([...p.preBases], p.outcome === 'bunt' ? 'single' : p.outcome);
          // First-to-third (#123) AND outfield-assist-at-third (#146) share the
          // runner path: the runner from 1B motors to 3B (safe on #123, gunned
          // down on #146). Extend [b1,b2] → [b1,b2,b3] to mirror live play.
          if ((p.isFirstToThird || p.isOutfieldAssist3B) && p.outcome === 'single') {
            for (let i = 0; i < rrps.length; i++) {
              if (rrps[i].length === 2 && rrps[i][0].x === F.B1.x && rrps[i][0].y === F.B1.y) {
                rrps[i] = [F.B1, F.B2, F.B3];
                break;
              }
            }
          }
          // Tag-up advance replay (Backlog #142) — computeRunnerPaths returns []
          // for a flyOut/lineOut (runners normally hold), so build the runner
          // path explicitly to mirror the live 2B → 3B tag, matching live play.
          if (p.isTagUp && ['flyOut', 'lineOut'].includes(p.outcome)) {
            rrps.length = 0;
            if (p.tagUpTo === 3) rrps.push([F.B2, F.B3]);
          }
          const finalTrotDur = ((p.isFirstToThird || p.isOutfieldAssist3B) && p.outcome === 'single') ? 3200 : trotDur;
          animateRunners(rrps, bt === 0 ? '#b91c1c' : '#1e40af', finalTrotDur);
          // Fresh ball toss replay (Backlog #135) — mirror the live HR
          // post-trot umpire ball-flip at identical timing. Skipped on
          // inside-the-park HRs (ball stayed in play). Skipped if the
          // game ended on this play (no toss over the post-game modal).
          if (p.outcome === 'homeRun' && !p.isInsideThePark) {
            setTimeout(() => {
              if (gs.current.gameOver) return;
              setFreshBallToss({ ts: Date.now() });
              setFreshBallTossBadge(true);
              if (sndRef.current) playSoundLocal('freshBall');
              setTimeout(() => setFreshBallToss(null), 900);
              setTimeout(() => setFreshBallTossBadge(false), 1600);
            }, finalTrotDur + 700);
          }
          // Curtain call replay (Backlog #141) — mirror the live post-trot
          // curtain-call figure + sound + badge at identical timing using the
          // persisted p.isCurtainCall flag. Skipped if the game ended on this
          // play (consistent with live). The team color is derived from the
          // persisted play's team (curtain calls only fire for the home team).
          if (p.outcome === 'homeRun' && p.isCurtainCall) {
            setTimeout(() => {
              if (gs.current.gameOver) return;
              const ccColor = bt === 1 ? '#b91c1c' : '#1e40af';
              setCurtainCall({ x: 112, y: 414, color: ccColor });
              setCurtainCallBadge({ batter: p.batter, reason: p.ccReason || 'big home run', team: bt });
              if (sndRef.current) playSoundLocal('curtainCall');
              setTimeout(() => setCurtainCall(null), 2800);
              setTimeout(() => setCurtainCallBadge(null), 3400);
            }, finalTrotDur + 1100);
          }
          // Dugout high-five greeting line replay (Backlog #147) — mirror the
          // live post-trot dugout mob at identical timing for BOTH teams.
          // Suppressed for the home team when a curtain call replays (same
          // dugout) and if the game ended on this play.
          if (p.outcome === 'homeRun') {
            setTimeout(() => {
              if (gs.current.gameOver) return;
              if (bt === 1 && p.isCurtainCall) return;
              const hflColor = bt === 1 ? '#b91c1c' : '#1e40af';
              const hflX = bt === 1 ? 98 : 522;
              setHighFiveLine({ x: hflX, y: 414, color: hflColor });
              if (sndRef.current) playSoundLocal('dugoutCheer');
              setTimeout(() => setHighFiveLine(null), 2600);
            }, finalTrotDur + 900);
          }
        }
      }
    }, 1050);
    setTimeout(() => {
      setPitchPhase('idle'); setAnnounceText(p.narration);
      const ba = genBallAnimLocal(p.outcome, p.dir, p.sub, p.variant, p.isGRD || false);
      // Foul ball into stands replay (Idea #81) — re-route the ball arc to the
      // fan position so the visual matches the live play.
      if (p.isFanGrab && p.fanGrab && p.outcome === 'foulBall') {
        const fanTarget = { x: p.fanGrab.x, y: p.fanGrab.y + 4 };
        ba.path = arcPts(F.HP, fanTarget, 90, 28);
        ba.target = fanTarget;
        ba.dur = 1700;
      }
      // Foul ball straight back to the screen replay (Backlog #127) — mirror
      // the live trajectory override, badge, and sound at identical timings.
      // The +/- jitter is randomized at replay (not persisted) because it
      // only affects the lateral position of the ball by 4px — visually
      // indistinguishable from the live play.
      if (p.isBackstop && p.outcome === 'foulBall') {
        const bsSide = Math.random() < 0.5 ? -1 : 1;
        const bsTarget = { x: F.HP.x + bsSide * 4, y: F.HP.y - 32 };
        ba.path = arcPts(F.HP, bsTarget, 52, 22);
        ba.target = bsTarget;
        ba.dur = 1300;
        setBackstopBadge({ batter: p.batter, team: bt });
        setTimeout(() => setBackstopBadge(null), 2400);
        if (sndRef.current) setTimeout(() => playSoundLocal('screenHit'), 280);
      }
      // Inside-the-park HR replay (Idea #83) — mirror the deep-ball-stays-in-park
      // trajectory used at draw time so the visual matches the live play. Anchor
      // the carom point near the fielder's natural position so the OF chase is
      // authentic.
      if (p.isInsideThePark && p.outcome === 'homeRun') {
        const tgt = getBallTgtLocal(p.dir, 'triple', p.sub, 2);
        const wallY = FENCE_Y + 6;
        const fenceHit = { x: tgt.x, y: wallY };
        const carom = { x: tgt.x + 18, y: wallY + 26 };
        ba.path = [...arcPts({ x: F.HP.x, y: F.HP.y - 10 }, fenceHit, 78, 18), ...linePts(fenceHit, carom, 8)];
        ba.target = carom;
        ba.dur = 2900;
        ba.carom = true;
      }
      if (p.isGRD) {
        setGrdBadge({ team: bt });
        setTimeout(() => setGrdBadge(null), 3200);
        if (sndRef.current) setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.5);
      }
      // Texas leaguer / bloop single replay (Backlog #91) — mirror the live-play
      // ball trajectory override (higher arc, shorter target between IF and OF),
      // flash the badge, and play the bespoke soft-thwack-and-thud sound. The
      // standard hit-replay flow already handles runner advancement on a single.
      if (p.isTexasLeaguer && p.outcome === 'single') {
        const ofPos = F[OF_MAP[p.sub] || 'CF'];
        const dropX = lerp(F.HP.x, ofPos.x, 0.55);
        const dropY = lerp(F.HP.y, ofPos.y, 0.58);
        const dropPt = { x: dropX, y: dropY };
        ba.path = arcPts({ x: F.HP.x, y: F.HP.y - 10 }, dropPt, 60, 22);
        ba.target = dropPt;
        ba.dur = 1900;
        setTexasLeaguerBadge({ batter: p.batter, team: bt });
        setTimeout(() => setTexasLeaguerBadge(null), 3200);
        if (sndRef.current) playSoundLocal('texasLeaguer');
      }
      // Infield single replay (Backlog #99) — mirror the live-play ball
      // trajectory override (groundOut-style line to the infielder, dur 1000ms),
      // flash the teal "INFIELD SINGLE" badge, and play the bespoke
      // thwack+footfalls+late-glove-pop sound. The standard hit-replay flow
      // handles runner advancement on a single (the batter trots to 1B).
      if (p.isInfieldSingle && p.outcome === 'single') {
        const infFk = INF_MAP[p.sub] || 'SS';
        const infPos = F[infFk];
        ba.path = linePts({ x: F.HP.x, y: F.HP.y - 10 }, infPos, 16);
        ba.target = infPos;
        ba.dur = 1000;
        setInfieldSingleBadge({ batter: p.batter, fielder: p.isFielder || 'the infielder', team: bt });
        setTimeout(() => setInfieldSingleBadge(null), 3200);
        if (sndRef.current) playSoundLocal('infieldSingle');
      }
      // Throwing error replay (Backlog #105) — mirror the live-play trajectory
      // override (groundOut-style line to the infielder), flash the rose-red
      // "THROWING ERROR (Ex)" badge, then at +1100ms fire the wild-throw
      // animation past 1B + ErrorBobble overlay + bobble sound + crowd react.
      if (p.isThrowError && p.outcome === 'single') {
        const infFk = INF_MAP[p.sub] || 'SS';
        const infPos = F[infFk];
        ba.path = linePts({ x: F.HP.x, y: F.HP.y - 10 }, infPos, 16);
        ba.target = infPos;
        ba.dur = 1000;
        setThrowErrorBadge({ batter: p.batter, fielder: p.teFielder || 'the infielder', errCode: p.teErrCode || 'E?', team: bt });
        setTimeout(() => setThrowErrorBadge(null), 3200);
        setTimeout(() => {
          const wildTarget = { x: F.B1.x + 24, y: F.B1.y + 18 };
          animateBall(linePts(infPos, wildTarget, 14), 600, () => { setBallPos(null); });
          if (sndRef.current) playSoundLocal('bobble');
          setErrorBobble({ x: F.B1.x, y: F.B1.y - 4 });
          setTimeout(() => setErrorBobble(null), 1300);
          triggerCrowdReaction('error', bt);
        }, 1100);
      }
      if (['flyOut', 'lineOut', 'foulOut'].includes(p.outcome)) { const fk = (p.outcome === 'foulOut') ? 'C' : (OF_MAP[p.sub] || INF_MAP[p.sub]); if (fk) animateFielder(fk, F[fk], ba.target, ba.dur); }
      else if (['groundOut', 'doublePlay', 'bunt'].includes(p.outcome)) { const fk = INF_MAP[p.sub] || 'SS'; animateFielder(fk, F[fk], ba.target, ba.dur); }
      // Infield fly rule replay (Backlog #140) — mirror the live umpire's
      // raised-finger signal + badge + routine glove pop at identical timings.
      // The ball already routes to the infield because p.sub was persisted as
      // an infielder (the flyOut replay branch above uses INF_MAP[p.sub]).
      if (p.isInfieldFly && p.outcome === 'flyOut') {
        setTimeout(() => setUmpirePhase('infieldFly'), 500);
        setTimeout(() => setUmpirePhase('idle'), 500 + 1900);
        setInfieldFlyBadge({ batter: p.batter, fielder: p.sub, team: 1 - bt });
        setTimeout(() => setInfieldFlyBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('glovePop'), ba.dur);
      }
      else if (p.isInsideThePark && p.outcome === 'homeRun') { const ofk = OF_MAP[p.sub] || 'CF'; animateFielder(ofk, F[ofk], ba.target, ba.dur + 600); if (sndRef.current) setTimeout(() => playSoundLocal('fenceHit'), ba.dur * 0.55); }
      else if ((p.isInfieldSingle || p.isThrowError) && p.outcome === 'single') { const infFk = INF_MAP[p.sub] || 'SS'; animateFielder(infFk, F[infFk], ba.target, ba.dur); }
      else if (['single', 'double', 'triple', 'error'].includes(p.outcome) && !p.isGRD) { const ofk = OF_MAP[p.sub] || 'CF'; animateFielder(ofk, F[ofk], ba.target, ba.dur + 500); }
      // Tag-up advance replay (Backlog #142) — mirror the live badge + glove pop
      // at the catch. The runner-path animation is handled by the rrps override
      // above; the advanced base state comes from the persisted result.
      if (p.isTagUp && ['flyOut', 'lineOut'].includes(p.outcome)) {
        const tuLast = (p.tagUpRunner || '').split(' ').slice(-1)[0] || 'the runner';
        setTagUpBadge({ runner: tuLast, team: bt });
        setTimeout(() => setTagUpBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('glovePop'), ba.dur);
      }
      // Pitcher-covers-first replay (Backlog #143) — mirror the live pitcher-
      // cover sprite + badge + glove pop, timed so the pitcher reaches the bag
      // at the catch (ba.dur). The sprite clears shortly after so the mound
      // pitcher reappears.
      if (p.isPitcherCover && p.outcome === 'groundOut') {
        const coverColor = bt === 0 ? '#1e40af' : '#b91c1c';
        setTimeout(() => animatePitcherCover(F.P, F.B1, 380, coverColor), Math.max(0, ba.dur - 380));
        setPitcherCoverBadge({ team: 1 - bt });
        setTimeout(() => setPitcherCoverBadge(null), 3200);
        if (sndRef.current) setTimeout(() => playSoundLocal('glovePop'), ba.dur);
        setTimeout(() => setPitcherCover(null), ba.dur + 700);
      }
      // Catcher's mask toss replay (Backlog #98) — mirror the live-play mask
      // toss, catcher pose flip, sound, and badge at identical timings.
      if (p.outcome === 'foulOut' && p.isMaskToss && ba.target) {
        const tossDir = (ba.target.x >= F.HP.x) ? -1 : 1;
        const tossX = F.C.x;
        const tossY = F.C.y - 14;
        const tossStart = Math.round(ba.dur * 0.45);
        setTimeout(() => {
          setMaskToss({ x: tossX, y: tossY, dir: tossDir });
          setCatcherLookingUp(true);
          if (sndRef.current) playSoundLocal('maskToss');
          setMaskTossBadge({ batter: p.batter, team: bt });
        }, tossStart);
        setTimeout(() => setMaskToss(null), tossStart + 1100);
        setTimeout(() => setCatcherLookingUp(false), ba.dur + 400);
        setTimeout(() => setMaskTossBadge(null), ba.dur + 2800);
      }
      animateBall(ba.path, ba.dur, () => { setBallPos(null); setMovingFielder(null); procRef.current = false; });
      if (p.outcome === 'doublePlay' && sndRef.current) {
        if (p.isTriplePlay) {
          // Triple play replay (Backlog #85) — fire the triplePlay sound, badge,
          // crowd reaction, and double fireworks burst at identical timings to
          // live play. The ball animation already replayed via the standard
          // doublePlay path; we just layer the special-case effects on top.
          setTimeout(() => playSoundLocal('triplePlay'), ba.dur + 350);
          setTripleplayBadge({ batter: p.batter, team: bt });
          setTimeout(() => setTripleplayBadge(null), 4500);
          setTimeout(() => triggerCrowdReaction('webGem', bt), ba.dur + 700);
          setTimeout(() => triggerFireworks(), ba.dur + 350);
          setTimeout(() => triggerFireworks(), ba.dur + 1050);
        } else {
          setTimeout(() => playSoundLocal('doublePlayTurn'), ba.dur + 350);
        }
      }
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
      // Pitcher fist pump replay (Backlog #129) — mirror the live-play visual,
      // badge, and sound at identical timings on persisted clutch K's.
      // Suppressed during dropped 3rd strikes and manager ejections to match
      // the live gating in processOutcome.
      if (p.isFistPump && p.outcome === 'strikeout' && !p.isDropped3rd && !p.isEjection) {
        const fpDefIdx = 1 - bt;
        const fpColor = bt === 0 ? '#1e40af' : '#b91c1c';
        const fpPitcherName = p.fpPitcher || teams[fpDefIdx]?.players?.[8] || 'the pitcher';
        setFistPumpAct({ color: fpColor, ts: Date.now() });
        setTimeout(() => setFistPumpAct(null), 1100);
        setFistPumpBadge({ batter: p.batter, pitcher: fpPitcherName, team: fpDefIdx });
        setTimeout(() => setFistPumpBadge(null), 2800);
        if (sndRef.current) setTimeout(() => playSoundLocal('fistPump'), 120);
      }
      // Manager ejection replay (Backlog #95) — mirror the live-play dugout-
      // to-plate animation, the "argue" pose, the umpire eject gesture, the
      // ejection sound, and the badge at identical timings to live play.
      // Pure flavor — strikeout still scores normally.
      if (p.isEjection && p.outcome === 'strikeout' && !p.isDropped3rd && !p.isFoulTip) {
        const _ejTeamName = p.ejectionTeamName || teams[bt].name;
        const _ejIsHomeTeam = bt === 1;
        const _ejDugoutX = _ejIsHomeTeam ? 522 : 98;
        const _ejDugoutY = 430;
        const _ejPlateX = F.HP.x + (_ejIsHomeTeam ? 30 : -30);
        const _ejPlateY = F.HP.y - 4;
        const ejWalkOutDur = 1000;
        const ejArgueDur = 1900;
        const ejWalkBackDur = 1000;
        setTimeout(() => {
          const sStart = performance.now();
          const tickWalk = (now) => {
            const rawT = Math.min(1, (now - sStart) / ejWalkOutDur);
            const x = lerp(_ejDugoutX, _ejPlateX, rawT);
            const y = lerp(_ejDugoutY, _ejPlateY, rawT);
            setEjectionAct({ x, y, progress: rawT, phase: 'walk' });
            if (rawT < 1) requestAnimationFrame(tickWalk);
            else {
              setEjectionAct({ x: _ejPlateX, y: _ejPlateY, progress: 1, phase: 'argue' });
              setTimeout(() => {
                setEjectionUmpireActive(true);
                if (sndRef.current) playSoundLocal('ejection');
                setEjectionBadge({ team: bt, manager: `${_ejTeamName} manager` });
                triggerCrowdReaction('strikeout', bt);
              }, 700);
              setTimeout(() => {
                const sBack = performance.now();
                const tickBack = (now2) => {
                  const rawT2 = Math.min(1, (now2 - sBack) / ejWalkBackDur);
                  const x2 = lerp(_ejPlateX, _ejDugoutX, rawT2);
                  const y2 = lerp(_ejPlateY, _ejDugoutY, rawT2);
                  setEjectionAct({ x: x2, y: y2, progress: rawT2, phase: 'walkOff' });
                  if (rawT2 < 1) requestAnimationFrame(tickBack);
                  else {
                    setEjectionAct(null);
                    setEjectionUmpireActive(false);
                    setTimeout(() => setEjectionBadge(null), 600);
                  }
                };
                requestAnimationFrame(tickBack);
              }, ejArgueDur);
            }
          };
          requestAnimationFrame(tickWalk);
        }, 1300);
      }
      // Error bobble animation on replay
      if (p.outcome === 'error' && ba.target) { setTimeout(() => { setErrorBobble({ x: ba.target.x, y: ba.target.y }); if (sndRef.current) playSoundLocal('bobble'); setTimeout(() => setErrorBobble(null), 1300); }, ba.dur + 200); }
      // HR robbery leap on replay (Backlog #72) — mirror the live-game leap, badge, and sound.
      if (p.isRobbedHR && ba.target) {
        const leapY = Math.max(FENCE_Y + 2, ba.target.y - 4);
        const leapColor = bt === 0 ? '#b91c1c' : '#1e40af';
        const fielderName = p.sub === 'lf' ? 'left fielder' : p.sub === 'cf' ? 'center fielder' : 'right fielder';
        setTimeout(() => { setRobbedHRLeap({ x: ba.target.x, y: leapY, color: leapColor }); setTimeout(() => setRobbedHRLeap(null), 1500); }, ba.dur - 300);
        setTimeout(() => setRobbedHRBadge({ batter: p.batter, fielder: fielderName, team: bt }), ba.dur - 100);
        setTimeout(() => setRobbedHRBadge(null), ba.dur + 3200);
        if (sndRef.current) setTimeout(() => playSoundLocal('hrRobbed'), ba.dur - 320);
      }
      // Lost-in-the-sun replay (Backlog #77) — fire the sun-burst overlay + badge
      // + sound at the OF target as the ball drops in. The play was already stored
      // with outcome === 'single' (re-mapped at draw time), so the standard hit
      // animation block above already does the right thing for runners.
      if (p.isLostInSun && ba.target) {
        const fielderName = p.sub === 'lf' ? 'left fielder' : p.sub === 'cf' ? 'center fielder' : 'right fielder';
        setTimeout(() => {
          setSunFlare({ x: ba.target.x, y: ba.target.y });
          if (sndRef.current) playSoundLocal('lostInSun');
          setTimeout(() => setSunFlare(null), 1400);
        }, ba.dur - 80);
        setTimeout(() => setLostInSunBadge({ batter: p.batter, fielder: fielderName, team: bt }), ba.dur - 60);
        setTimeout(() => setLostInSunBadge(null), ba.dur + 3200);
      }
      // Dropped fly ball error replay (Backlog #103) — fire the bobble
      // overlay + badge + sound at the OF target. The play was already stored
      // with outcome === 'double' (re-mapped at draw time), so the standard
      // hit animation block above already handles runner advancement.
      if (p.isDroppedFly && ba.target) {
        const fielderName = p.dropFielder || (p.sub === 'lf' ? 'left fielder' : p.sub === 'cf' ? 'center fielder' : 'right fielder');
        const errCode = p.dropErrCode || (p.sub === 'lf' ? 'E7' : p.sub === 'cf' ? 'E8' : 'E9');
        setTimeout(() => {
          setErrorBobble({ x: ba.target.x, y: ba.target.y });
          if (sndRef.current) playSoundLocal('bobble');
          setTimeout(() => setErrorBobble(null), 1300);
        }, ba.dur - 40);
        setTimeout(() => setDroppedFlyBadge({ batter: p.batter, fielder: fielderName, errCode, team: bt }), ba.dur - 20);
        setTimeout(() => setDroppedFlyBadge(null), ba.dur + 3200);
      }
      // Outfield assist at home replay (Idea #89) — flash the badge, play the
      // gunDownAtPlate sound, and trigger a defensive crowd reaction at
      // identical timings to live play. The standard hit-replay flow above
      // already animates the ball arriving at the OF target; we just layer
      // the assist-specific flair on top so the visual reads as "OUT at the
      // plate" instead of a clean single.
      if (p.isOutfieldAssist && p.outcome === 'single') {
        setOutfieldAssistBadge({ batter: p.batter, fielder: p.oaFielder || 'left fielder', runner: p.oaRunner || 'the runner', team: bt });
        setTimeout(() => setOutfieldAssistBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('gunDownAtPlate'), ba.dur + 400);
        setTimeout(() => triggerCrowdReaction('webGem', 1 - bt), ba.dur + 600);
        // Flying helmet replay (Backlog #96) — runner's helmet pops off on the
        // desperate slide into home. Mirror the live trigger using the
        // persisted helmetOff flag, timed to the throw arrival at the plate.
        if (p.helmetOff) {
          const runnerColor3 = bt === 0 ? '#b91c1c' : '#1e40af';
          setTimeout(() => {
            setFlyingHelmet({ x: F.HP.x - 12, y: F.HP.y - 8, color: runnerColor3, dir: -1 });
            if (sndRef.current) setTimeout(() => playSoundLocal('helmetThump'), 720);
            setTimeout(() => setFlyingHelmet(null), 850);
          }, ba.dur + 480);
        }
      }
      // Outfield assist at THIRD replay (Backlog #146) — flash the badge, play
      // the gunDownAtPlate sound, and trigger a defensive crowd reaction at
      // identical timings to live play. The standard hit-replay flow already
      // animates the ball to the OF target and the runner to 3B; we layer the
      // assist flair so the replay reads as "OUT at third" instead of a clean
      // first-to-third single.
      if (p.isOutfieldAssist3B && p.outcome === 'single') {
        setOutfieldAssist3BBadge({ batter: p.batter, fielder: p.oa3Fielder || 'left fielder', runner: p.oa3Runner || 'the runner', team: bt });
        setTimeout(() => setOutfieldAssist3BBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('gunDownAtPlate'), ba.dur + 400);
        setTimeout(() => triggerCrowdReaction('webGem', 1 - bt), ba.dur + 600);
        // Flying helmet replay (Backlog #96) — runner's helmet pops off on the
        // desperate slide into third. Mirror the live trigger via helmetOff.
        if (p.helmetOff) {
          const runnerColor3b = bt === 0 ? '#b91c1c' : '#1e40af';
          setTimeout(() => {
            setFlyingHelmet({ x: F.B3.x - 10, y: F.B3.y - 8, color: runnerColor3b, dir: -1 });
            if (sndRef.current) setTimeout(() => playSoundLocal('helmetThump'), 720);
            setTimeout(() => setFlyingHelmet(null), 850);
          }, ba.dur + 480);
        }
      }
      // Bang-bang play replay (Backlog #75) — fire the slide overlay + badge + sound
      // timed to the throw arriving at 1B. Only fires when the throw actually went
      // to first (no runner on 1B at the time of the play).
      if (p.isBangBang && !p.preBases[0]) {
        const runnerColor = bt === 0 ? '#b91c1c' : '#1e40af';
        setTimeout(() => { setBangBangPlay({ color: runnerColor }); setTimeout(() => setBangBangPlay(null), 1100); }, ba.dur - 120);
        setBangBangBadge({ team: bt });
        setTimeout(() => setBangBangBadge(null), 3000);
        if (sndRef.current) setTimeout(() => playSoundLocal('bangBang'), ba.dur - 20);
        // Flying helmet replay (Backlog #96) — mirror the live helmet pop
        // exactly using the persisted helmetOff flag. Anchored to the same
        // position and dir as the live trigger so the visual lands identically.
        if (p.helmetOff) {
          const runnerColor2 = bt === 0 ? '#b91c1c' : '#1e40af';
          setTimeout(() => {
            setFlyingHelmet({ x: F.B1.x - 4, y: F.B1.y - 6, color: runnerColor2, dir: -1 });
            if (sndRef.current) setTimeout(() => playSoundLocal('helmetThump'), 720);
            setTimeout(() => setFlyingHelmet(null), 850);
          }, ba.dur - 40);
        }
      }
      // Squeeze play replay (Backlog #97) — flash the squeeze badge and play
      // the squeezePlay sound at identical timings to live play. The bunt
      // outcome already replays normally through the standard bunt pathway
      // (runner from 3rd scores via the existing engine logic), so this just
      // layers the squeeze-specific flair on top.
      if (p.isSqueeze && p.outcome === 'bunt') {
        setSqueezeBadge({ batter: p.batter, runner: p.squeezeRunner || 'the runner', team: bt });
        setTimeout(() => setSqueezeBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('squeezePlay'), 80);
      }
      // Productive out replay (Backlog #108) — flash the productive-out badge
      // at the same timing as live play. No mechanical mutation here: the
      // runner advancement is already encoded in p.resultData.nextBases (the
      // 2B → 3B move was applied at the time of the original play), so the
      // standard runner-animation path replays correctly. Pure flavor layer.
      if (p.isProductiveOut && p.outcome === 'groundOut') {
        setProductiveOutBadge({ batter: p.batter, runner: p.poRunner || 'the runner', team: bt });
        setTimeout(() => setProductiveOutBadge(null), 3500);
      }
      // First-to-third replay (Backlog #123) — flash the 1ST-TO-3RD badge at
      // identical timing to live play. The runner-path override is handled in
      // the rps block above (rrps extension); this just adds the badge flair.
      if (p.isFirstToThird && p.outcome === 'single') {
        const ftLastName = (p.firstTo3rdRunner || '').split(' ').slice(-1)[0] || 'the runner';
        setFirstTo3rdBadge({ batter: p.batter, runner: ftLastName, team: bt });
        setTimeout(() => setFirstTo3rdBadge(null), 3500);
      }
      // Sacrifice bunt replay (Backlog #111) — flash the sac-bunt badge and
      // reuse the squeezePlay sound at identical timings to live play. The
      // bunt outcome already replays normally (runner advancement is encoded
      // in p.resultData.nextBases from the original play), so this just
      // layers the sacrifice-specific flair on top.
      if (p.isSacBunt && p.outcome === 'bunt') {
        setSacBuntBadge({
          batter: p.batter,
          runner: p.sacBuntRunner || 'the lead runner',
          advancedTo: p.sacBuntAdvancedTo || 'the next bag',
          team: bt,
        });
        setTimeout(() => setSacBuntBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('squeezePlay'), 80);
      }
      // Drag bunt single replay (Backlog #139) — flash the drag-bunt badge and
      // play the bespoke `dragBunt` sound at identical timings to live play.
      // The bunt outcome already replays normally (batter reaches first via
      // the standard p.resultData), so this just layers the drag-bunt-specific
      // flair on top.
      if (p.isDragBunt && p.outcome === 'bunt') {
        setDragBuntBadge({ batter: p.batter, team: bt });
        setTimeout(() => setDragBuntBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('dragBunt'), 80);
      }
      // First baseman stretch replay (Backlog #114) — fire the stretch overlay
      // shortly after the ball reaches the infielder (simulating the throw-to-
      // first arrival). Only fires when the throw actually went to first (no
      // runner on 1B at the time of the play). Skip during throwing-error
      // replays (the existing wild-throw animation handles 1B drama there) and
      // during diving-stop replays (focus stays on the dive). Replay does not
      // animate the throw-to-1B leg itself; the overlay alone implies the
      // catch beat.
      if (['groundOut', 'doublePlay'].includes(p.outcome) && !p.preBases[0] && !p.isThrowError && !p.isDivingStop && !p.isChallenge && ba.target) {
        const f1bRepColor = bt === 0 ? '#1e40af' : '#b91c1c';
        setTimeout(() => {
          setF1bStretch({ color: f1bRepColor, throwFrom: { x: ba.target.x, y: ba.target.y }, keyId: Date.now() });
          setTimeout(() => setF1bStretch(null), 800);
        }, ba.dur + 100);
        // 1B umpire OUT call replay (Backlog #118) — mirror the live
        // out-call timing (fires shortly after the ball reaches the bag).
        setTimeout(() => {
          setUmpire1BPhase('outCall');
          setTimeout(() => setUmpire1BPhase('idle'), 1200);
        }, ba.dur + 420);
      }
      // 1B umpire SAFE call replay (Backlog #118) — fire on infield singles
      // and throwing errors. Mirrors live timing: infield single's late
      // relay arrives, ump spreads arms; throwing error's wild throw sails
      // past, ump spreads arms.
      if (p.outcome === 'single' && (p.isInfieldSingle || p.isThrowError) && ba.target) {
        const safeDelay = p.isInfieldSingle ? (ba.dur + 580) : (ba.dur + 1300);
        setTimeout(() => {
          setUmpire1BPhase('safeCall');
          setTimeout(() => setUmpire1BPhase('idle'), 1200);
        }, safeDelay);
      }
      // Pitcher comebacker replay (Backlog #126) — fire the badge and sound
      // at identical timing to live play. The ball trajectory is naturally
      // replayed via the persisted nar.sub === 'the pitcher' (saved as
      // p.sub on playHistory), which routes through F.P via INF_MAP. So no
      // explicit trajectory override is needed in the replay branch.
      if (p.isComebacker && p.outcome === 'groundOut') {
        const cbPitcherLast = (p.cbPitcher || '').split(' ').slice(-1)[0] || 'the pitcher';
        setComebackerBadge({ pitcher: cbPitcherLast, batter: p.batter, team: 1 - bt });
        setTimeout(() => setComebackerBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('comebacker'), 60);
      }
      // Fielder's choice replay (Backlog #137) — fire the FC badge at the same
      // beat that live play fires it (alongside the throw-to-2B animation). No
      // sound or visual override needed — the standard groundOut+runner-on-1B
      // animation pathway naturally replays from p.sub via the existing
      // INF_MAP routing. Delay matches the live ~600ms pause before the
      // fielder animation starts so the badge surfaces with the force throw.
      if (p.isFieldersChoice && p.outcome === 'groundOut') {
        const fcRunnerLast = (p.fcRunner || '').split(' ').slice(-1)[0] || 'the runner';
        setTimeout(() => {
          setFieldersChoiceBadge({
            batter: p.batter,
            runner: fcRunnerLast,
            fielder: p.sub || 'the infielder',
            team: 1 - bt,
          });
          setTimeout(() => setFieldersChoiceBadge(null), 3200);
        }, ba.dur + 100);
      }
      // Hit and run replay (Backlog #148) — fire the badge, the bespoke
      // `hitAndRun` sound, and the brief offensive-crowd reaction at the same
      // beats as live play. The runner-path animation (1B → 2B) and the
      // post-state [null, runner, null] are reproduced by the standard
      // computeRunnerPaths('groundOut') pathway from p.preBases + p.resultData,
      // so no ball-routing override is needed here — only the cosmetic layer.
      if (p.isHitAndRun && p.outcome === 'groundOut') {
        const harLast = (p.harRunner || '').split(' ').slice(-1)[0] || 'the runner';
        setHitAndRunBadge({ batter: p.batter, runner: harLast, team: bt });
        setTimeout(() => setHitAndRunBadge(null), 3500);
        if (sndRef.current) setTimeout(() => playSoundLocal('hitAndRun'), 60);
        if (sndRef.current) setTimeout(() => triggerCrowdReaction('hit', bt), 1500);
      }
      // Diving stop replay (Backlog #93) — fire the dive SVG, badge, sound, and
      // crowd reaction at the catch point timed to the moment the ball arrives
      // at the fielder. Identical timing to live play.
      if (p.isDivingStop && p.outcome === 'groundOut' && ba.target) {
        const defColor = bt === 0 ? '#1e40af' : '#b91c1c';
        const dsDir = ba.target.x >= F.HP.x ? 1 : -1;
        setTimeout(() => {
          setDivingStop({ x: ba.target.x, y: ba.target.y, color: defColor, dir: dsDir });
          setTimeout(() => setDivingStop(null), 1100);
          setDivingStopBadge({ batter: p.batter, fielder: p.dsFielder || 'the infielder', team: 1 - bt });
          setTimeout(() => setDivingStopBadge(null), 3200);
          if (sndRef.current) playSoundLocal('divingStop');
          triggerCrowdReaction('webGem', 1 - bt);
        }, ba.dur);
      }
      // Tip of the cap replay (Backlog #100) — fire the pitcher's tip-cap pose,
      // badge, and soft sound after the gem play settles. Mirrors the live
      // processOutcome flow: 700ms after the play (giving the gem visual time
      // to land), 1.4s pose, 2.4s badge. Tied to the persisted `fireTipCap`
      // flag and `tipCapFielder` name so the attribution is identical to live
      // play. Pure cosmetic — no state mutation.
      if (p.fireTipCap) {
        const tcFielder = p.tipCapFielder || 'the fielder';
        const tcTeam = 1 - bt;
        const tcDelay = ba.dur + 1100; // a beat after the play resolves
        setTimeout(() => {
          setPitcherTipCap(true);
          setTipCapBadge({ fielder: tcFielder, team: tcTeam });
          if (sndRef.current) playSoundLocal('tipCap');
        }, tcDelay);
        setTimeout(() => setPitcherTipCap(false), tcDelay + 1400);
        setTimeout(() => setTipCapBadge(null), tcDelay + 2400);
      }
      // Manager challenge / replay review (Idea #80) — replay the review overlay,
      // badge, and verdict timing identical to live play. Note: live overturned
      // calls store outcome as 'groundOut' (the original out call); the review
      // overlay shows the overturn UI and the runner-safe animation, but the
      // persisted result is the original groundOut. On replay we replay the
      // overlay flavor but skip the result mutation (state is read from history).
      if (p.isChallenge) {
        const reviewDelay = ba.dur + 200;
        setTimeout(() => {
          setChallengeBadge({ batter: p.batter, team: bt, overturned: !!p.challengeOverturned });
          setChallengeReview({ phase: 'reviewing' });
          if (sndRef.current) playSoundLocal('challengeBuzz');
        }, reviewDelay);
        setTimeout(() => setChallengeReview({ phase: p.challengeOverturned ? 'overturned' : 'confirmed' }), reviewDelay + 1600);
        setTimeout(() => { setChallengeReview(null); setChallengeBadge(null); }, reviewDelay + 2800);
      }
      // Foul ball into stands replay (Idea #81) — fire the fan-grab SVG and cheer
      // sound at the moment the ball arrives at the fan position. The ball arc
      // was redirected at draw time; here we mirror the visual.
      if (p.isFanGrab && p.fanGrab && p.outcome === 'foulBall') {
        // Override the ball animation in flight by setting fanCatch when ball arrives.
        const arriveAt = ba.dur - 50;
        setTimeout(() => {
          setFanCatch({ x: p.fanGrab.x, y: p.fanGrab.y });
          if (sndRef.current) playSoundLocal('fanCheer');
          setTimeout(() => setFanCatch(null), 1700);
        }, arriveAt);
        // Cap-tip-to-fan replay (Backlog #133) — mirror the live timing exactly.
        // Fires 900ms after the fan grabs the ball, lasts 1300ms, then the
        // batter returns to stance. The badge mirrors the live UI flash.
        if (p.isCapTipFan) {
          setTimeout(() => {
            setBatterPhase('tipCapFan');
            setCapTipFanBadge({ batter: p.batter, team: p.team });
            if (sndRef.current) playSoundLocal('capTipFan');
          }, arriveAt + 900);
          setTimeout(() => {
            setBatterPhase('stance');
            setCapTipFanBadge(null);
          }, arriveAt + 900 + 1300);
        }
        // Fresh ball toss replay (Backlog #135) — mirror live timing exactly.
        // The HP ump flips a new ball to the mound ~1900ms after the fan
        // grabs the souvenir.
        setTimeout(() => {
          if (gs.current.gameOver) return;
          setFreshBallToss({ ts: Date.now() });
          setFreshBallTossBadge(true);
          if (sndRef.current) playSoundLocal('freshBall');
          setTimeout(() => setFreshBallToss(null), 900);
          setTimeout(() => setFreshBallTossBadge(false), 1600);
        }, arriveAt + 1900);
      }
      // Inside-the-park HR replay (Idea #83) — flash the badge and play the
      // ITPHR fanfare sound at the same beat as live play. Fireworks from p.isHR
      // already fire above. Suppresses the regular HR ball-over-fence flow by
      // virtue of the carom-trajectory override applied earlier in this block.
      if (p.isInsideThePark && p.outcome === 'homeRun') {
        setInsideTheParkBadge({ batter: p.batter, team: bt });
        setTimeout(() => setInsideTheParkBadge(null), 4500);
        if (sndRef.current) setTimeout(() => playSoundLocal('insideTheParkHR'), ba.dur * 0.4);
      }
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

  // Infield drawn in (Backlog #138) — late-inning tactical positioning where
  // the four infielders play ~14-18px closer to home plate to "cut down the
  // run at the plate." Live-derived from gs state (no setTimeout / no state
  // cell needed): fires when (a) the game is in the 6th inning or later, (b)
  // there's a runner on 3rd, (c) fewer than 2 outs (so the inning won't
  // naturally end on the next out), and (d) the score is close (defense
  // leads by ≤1, or is tied, or is down by ≤1 — situations where one run
  // genuinely matters). Pure visual cue: fielder animation paths are
  // unchanged, so gameplay outcomes and fielding distributions are completely
  // unaffected. Pairs naturally with the existing infield shift (#66) and
  // outfield shift (#136) — the three defensive positioning concepts now
  // form a complete set: shift (left/right for the hitter), draw-in (closer
  // for the runner), and the standard alignment everywhere else.
  const infieldIn = useMemo(() => {
    if (!gs.current || gs.current.gameOver) return false;
    // Use the same display state the field is rendering — during replay, the
    // bases are the historical preBases for the replayed play; otherwise the
    // live gs.current.bases.
    const b = (replayIdx !== -1 && playHistory[replayIdx]) ? playHistory[replayIdx].preBases : gs.current.bases;
    if (!b || !b[2]) return false;
    if ((gs.current.outs ?? 0) >= 2) return false;
    if ((gs.current.inning ?? 1) < 6) return false;
    // Score gate — only draw in when the run on 3B actually matters. The
    // defending team is `1 - gs.current.half`. Drawn-in fires when the
    // defense leads by ≤1 OR is tied OR is down by ≤1.
    const aw = (gs.current.innings?.[0] || []).reduce((s, v) => s + (v || 0), 0);
    const hm = (gs.current.innings?.[1] || []).reduce((s, v) => s + (v || 0), 0);
    const defIdx = 1 - (gs.current.half ?? 0);
    const defScore = defIdx === 1 ? hm : aw;
    const offScore = defIdx === 1 ? aw : hm;
    const diff = defScore - offScore;
    return diff >= -1 && diff <= 1;
  }, [replayIdx, playHistory, renderTick]);

  // Rally caps (Backlog #149) — fans flip their caps inside-out when the
  // batting team is rallying late while trailing. Derived live from gs state:
  // 7th inning or later, a rally brewing (2+ consecutive baserunners, the same
  // counter that drives the RALLY! badge), and the BATTING team behind on the
  // scoreboard. Live play only (suppressed during replay since the rally count
  // and live score aren't reconstructable from a single play's preBases). The
  // returned object carries the batting team's color for the banner; null hides
  // the caps. Pure cosmetic.
  const rallyCaps = useMemo(() => {
    if (!gs.current || gs.current.gameOver) return null;
    if (replayIdx !== -1) return null;
    if ((gs.current.inning ?? 1) < 7) return null;
    if ((gs.current.rallyCount ?? 0) < 2) return null;
    const aw = (gs.current.innings?.[0] || []).reduce((s, v) => s + (v || 0), 0);
    const hm = (gs.current.innings?.[1] || []).reduce((s, v) => s + (v || 0), 0);
    const offIdx = gs.current.half ?? 0; // 0 = away batting (top), 1 = home batting (bottom)
    const offScore = offIdx === 1 ? hm : aw;
    const defScore = offIdx === 1 ? aw : hm;
    if (offScore >= defScore) return null; // only when the batting team is trailing
    // Batting-team color: home (bottom, half===1) is red, away (top) is blue.
    return { color: offIdx === 1 ? '#b91c1c' : '#1e40af' };
  }, [replayIdx, renderTick]);

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10 font-sans text-gray-900">
        <h1 className="text-4xl font-black text-blue-900 mb-2 tracking-tight uppercase">⚾ Card Baseball v80</h1>
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
        {/* Stadium attendance display (Backlog #87) — atmospheric "ATT: XX,XXX" pill,
            generated once at game start. Stadium-seat icon + bold label + figure. */}
        {attendance && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-800 to-slate-700 text-white border border-slate-900 normal-case" title={`Today's announced attendance: ${attendance.display}`}>
            <span className="text-amber-300 mr-1">🏟</span>
            <span className="text-slate-300 tracking-widest mr-1">ATT</span>
            <span className="text-white font-mono">{attendance.display}</span>
          </span>
        )}
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
        {/* Infield shift badge (Backlog #66) — defense has shifted against a pull slugger.
            Backlog #136: also covers the outfield shift since both fire on the same
            slugger detection — the badge tooltip now mentions both the infield and
            outfield repositioning so the visual makes sense to the viewer. */}
        {infieldShift && !gs.current.gameOver && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-slate-700 text-white border border-slate-800" title={`Full shift on for ${activeBatter} — both the infield (2B/SS) and outfield (LF/CF/RF) have pulled to the ${infieldShift === 'L' ? 'right' : 'left'} side.`}>
            FULL SHIFT
          </span>
        )}
        {/* Infield drawn in badge (Backlog #138) — defense has pulled the
            infielders ~14-18px closer to home plate to cut down the run at
            the plate. Late innings + runner on 3B + < 2 outs + close score.
            Derived live from gs state (same dependencies as the infieldIn
            useMemo above); no setTimeout — stays visible while the situation
            persists, clears the moment the outs reach 2, the runner scores,
            or the inning ends. Pure cosmetic tactical positioning indicator.
            Coexists with FULL SHIFT (#66/#136) — sluggers up with runner on
            3B in a close late-inning game would show BOTH. */}
        {infieldIn && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-600 to-slate-800 text-white border border-slate-900" title={`Infield drawn in — the defense has pulled the infielders closer to home plate to cut down the run from third on a grounder. Close game, runner on 3B, fewer than 2 outs.`}>
            🛡 INFIELD IN
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
        {/* Bang-bang play badge (Backlog #75) — pulsing close-call indicator on routine groundouts */}
        {bangBangBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-amber-500 text-white border border-amber-700" title="Bang-bang play at first — runner just barely beat... and was OUT.">
            BANG-BANG PLAY
          </span>
        )}
        {/* Pickoff badge — flashes on every pickoff attempt (green for successful
            out, amber for a safe dive-back). Covers both pickoff at 1st (Backlog
            #64) and pickoff at 2nd (Backlog #120). The badge text adds "AT 2ND"
            when the base is 2nd so the broadcast moment reads correctly. */}
        {pickoffBadge && (() => {
          const baseName = pickoffBadge.base === 'B3' ? 'third' : (pickoffBadge.base === 'B2' ? 'second' : 'first');
          // Catcher's snap-throw pickoff (Backlog #132) prepends "CATCHER " to
          // the badge text so it's clear who made the play. Pitcher pickoffs
          // (default) read with the standard PICKOFF / THROW TO labels.
          const isCatcher = pickoffBadge.source === 'catcher';
          const outText = isCatcher
            ? (pickoffBadge.base === 'B3' ? 'CATCHER PICKOFF AT 3RD!' : (pickoffBadge.base === 'B2' ? 'CATCHER PICKOFF AT 2ND!' : 'CATCHER PICKOFF!'))
            : (pickoffBadge.base === 'B3' ? 'PICKOFF AT 3RD!' : (pickoffBadge.base === 'B2' ? 'PICKOFF AT 2ND!' : 'PICKOFF!'));
          const safeText = isCatcher
            ? (pickoffBadge.base === 'B3' ? 'SNAP THROW TO 3RD' : (pickoffBadge.base === 'B2' ? 'SNAP THROW TO 2ND' : 'CATCHER SNAP THROW'))
            : (pickoffBadge.base === 'B3' ? 'THROW TO 3RD' : (pickoffBadge.base === 'B2' ? 'THROW TO 2ND' : 'THROW OVER'));
          const titleSrc = isCatcher ? 'Catcher pops up and snap-throws' : 'Pickoff';
          // Wild pickoff throw (Backlog #134) — rose-colored badge for the
          // dreaded "errant throw" outcome. Text differs by base since the
          // consequence is different (1B→2B, 2B→3B, 3B→runner scores).
          if (pickoffBadge.outcome === 'wild') {
            const wildText = pickoffBadge.base === 'B3'
              ? 'WILD THROW — RUN SCORES!'
              : (pickoffBadge.base === 'B2' ? 'WILD THROW — RUNNER TAKES 3RD!' : 'WILD THROW — RUNNER TAKES 2ND!');
            const wildTitle = pickoffBadge.base === 'B3'
              ? `${titleSrc} sails wide of third — the runner sprints home and SCORES on the error.`
              : `${titleSrc} sails wide of ${baseName} — the runner advances on the throwing error.`;
            return (
              <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border bg-rose-600 text-white border-rose-700" title={wildTitle}>
                ✗ {wildText}
              </span>
            );
          }
          return (
            <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${pickoffBadge.outcome === 'out' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-amber-200 text-amber-900 border-amber-400'}`} title={pickoffBadge.outcome === 'out' ? `${titleSrc} — runner caught leaning off ${baseName} base.` : `${titleSrc} to ${baseName} — runner dove back safely.`}>
              {pickoffBadge.outcome === 'out' ? outText : safeText}
            </span>
          );
        })()}
        {/* Cap-tip-to-fan (Backlog #133) — after a fan-grab souvenir foul,
            ~35% of the time the batter tips his cap toward the fan. Brief
            emerald badge flashes during the gesture. */}
        {capTipFanBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${capTipFanBadge.team === 0 ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-emerald-700 text-white border-emerald-800'}`} title={`${capTipFanBadge.batter} tips his cap toward the fan in the stands who grabbed the souvenir foul. Pure classy ballpark gesture.`}>
            🧢 {capTipFanBadge.batter} TIPS HIS CAP
          </span>
        )}
        {/* Fresh ball toss from HP umpire to pitcher (Backlog #135) — after
            HRs and fan-grab fouls, the umpire flips a new ball out to the
            mound. Brief slate-on-slate pulse for the ritual moment. */}
        {freshBallTossBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-slate-200 text-slate-800 border border-slate-400" title="Home plate umpire flips a fresh ball to the pitcher — the game ball is gone (over the fence or in the stands).">
            🥎 NEW BALL
          </span>
        )}
        {/* Infield fly rule (Backlog #140) — the umpire declares the batter
            out on a catchable infield popup with runners on 1st & 2nd (or
            loaded) and fewer than 2 outs. */}
        {infieldFlyBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-white border border-amber-700" title={`Infield fly rule — ${infieldFlyBadge.batter} is automatically out on the catchable popup to ${infieldFlyBadge.fielder}. The force is removed, so the runners are no longer forced to advance.`}>
            ☝️ INFIELD FLY — BATTER OUT
          </span>
        )}
        {/* Curtain call (Backlog #141) — the home crowd roars the hero back
            out of the dugout after a huge home run. */}
        {curtainCallBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-rose-500 to-amber-500 text-white border border-rose-700" title={`Curtain call! The crowd brings ${curtainCallBadge.batter} back out of the dugout to wave his helmet after a ${curtainCallBadge.reason}.`}>
            🎩 CURTAIN CALL — {(curtainCallBadge.batter || '').split(' ').slice(-1)[0]}
          </span>
        )}
        {/* Dropped-third-strike (passed ball) badge (Backlog #67) — batter reaches 1B on a K */}
        {passedBallBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-yellow-500 text-yellow-900 border border-yellow-700" title={`Dropped third strike! ${passedBallBadge.batter} reaches first — K recorded, but the catcher couldn't hold on.`}>
            DROPPED 3RD STRIKE
          </span>
        )}
        {/* HR robbery badge (Backlog #72) — fielder leapt at the wall and robbed a HR */}
        {robbedHRBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-amber-400 text-amber-900 border border-amber-600" title={`The ${robbedHRBadge.fielder} robbed ${robbedHRBadge.batter} of a home run — leapt at the wall and brought it back!`}>
            🧤 ROBBED AT THE WALL!
          </span>
        )}
        {/* Inside-the-park HR badge (Idea #83) — runner sprinted all four bases */}
        {insideTheParkBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-emerald-500 to-amber-400 text-white border border-emerald-700" title={`${insideTheParkBadge.batter} legged out an inside-the-park home run — beat the relay to the plate!`}>
            🏃‍♂️ INSIDE THE PARK!
          </span>
        )}
        {/* Triple play badge (Backlog #85) — three outs on one swing */}
        {tripleplayBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-fuchsia-600 to-emerald-500 text-white border border-fuchsia-800" title={`${tripleplayBadge.batter} grounds into a triple play — three outs on a single swing! One of baseball's rarest events.`}>
            ⚡ TRIPLE PLAY!
          </span>
        )}
        {/* Foul tip strikeout badge (Backlog #86) — 2-strike foul ball squeezed by the catcher for K3 */}
        {foulTipBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-600 to-cyan-500 text-white border border-slate-700" title={`${foulTipBadge.batter} fouled the 2-strike pitch directly into the catcher's mitt — that's a strikeout per MLB Rule 5.09(a)(3).`}>
            💨 FOUL TIP — STRIKE 3!
          </span>
        )}
        {/* Hit-by-pitch badge (Idea #88) — batter wears one and takes first base */}
        {hbpBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-rose-600 text-white border border-rose-800" title={`${hbpBadge.batter} hit by a pitch on the ${hbpBadge.bodyPart}. Awarded first base.`}>
            🩹 HIT BY PITCH
          </span>
        )}
        {/* Outfield assist at home badge (Idea #89) — runner gunned down at the plate */}
        {outfieldAssistBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-emerald-600 to-amber-500 text-white border border-emerald-800" title={`${outfieldAssistBadge.fielder} guns down ${outfieldAssistBadge.runner} at the plate trying to score from third on ${outfieldAssistBadge.batter}'s single. Defensive web gem!`}>
            🎯 ASSIST! OUT AT HOME!
          </span>
        )}
        {/* Outfield assist at THIRD badge (Backlog #146) — runner from 1B gunned
            down trying to stretch a single into a first-to-third */}
        {outfieldAssist3BBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-emerald-600 to-amber-500 text-white border border-emerald-800" title={`${outfieldAssist3BBadge.fielder} guns down ${outfieldAssist3BBadge.runner} trying to stretch ${outfieldAssist3BBadge.batter}'s single into a first-to-third. OUT at third base — defensive assist!`}>
            🎯 ASSIST! OUT AT 3RD!
          </span>
        )}
        {/* Texas leaguer / bloop single badge (Backlog #91) — soft floating hit
            that drops between the infielders and outfielders */}
        {texasLeaguerBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-teal-500 to-cyan-600 text-white border border-teal-700" title={`${texasLeaguerBadge.batter} blooped a soft floater that dropped between the infielders and outfielders for a base hit.`}>
            🪂 TEXAS LEAGUER
          </span>
        )}
        {/* Diving stop by infielder badge (Backlog #93) — spectacular defensive
            web gem on a routine groundout */}
        {divingStopBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-emerald-600 to-amber-500 text-white border border-emerald-800" title={`${divingStopBadge.fielder} laid out for a spectacular diving stop on ${divingStopBadge.batter}'s grounder. Defensive web gem!`}>
            🥎 DIVING STOP!
          </span>
        )}
        {/* Pitcher comebacker badge (Backlog #126) — ball hit sharply right
            back at the pitcher for a 1-3 putout. Pure flavor on a groundOut. */}
        {comebackerBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-emerald-600 to-amber-500 text-white border border-emerald-800" title={`Comebacker! ${comebackerBadge.batter} smashed one right at ${comebackerBadge.pitcher}, who fielded it cleanly and threw to first — 1-3 putout.`}>
            🎯 COMEBACKER!
          </span>
        )}
        {/* Pitcher covers first badge (Backlog #143) — the 1B ranged off the bag
            to field it, so the pitcher sprinted over to cover first. 3-1 putout. */}
        {pitcherCoverBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-blue-600 to-slate-700 text-white border border-blue-800" title={`3-1 putout — the first baseman ranged off the bag to field the grounder, so the pitcher sprinted over to cover first base and took the toss for the out.`}>
            ⚾ PITCHER COVERS 1ST
          </span>
        )}
        {/* Fielder's choice badge (Backlog #137) — runner forced out at 2B,
            batter safe at 1B. Pure narration / badge layer on the existing
            engine pathway that already produces the FC base-state result. */}
        {fieldersChoiceBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-amber-500 to-slate-600 text-white border border-amber-700" title={`Fielder's choice — ${fieldersChoiceBadge.fielder} threw to second to force out ${fieldersChoiceBadge.runner}. ${fieldersChoiceBadge.batter} reaches first safely on the play (AB but no hit, no error).`}>
            ↔ FIELDER'S CHOICE
          </span>
        )}
        {/* Backstop foul ball badge (Backlog #127) — foul ball straight back
            over the catcher's head into the protective netting. */}
        {backstopBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-600 to-cyan-600 text-white border border-slate-800" title={`${backstopBadge.batter} fouled the ball straight back over the catcher's head into the protective screen behind home plate.`}>
            🥅 STRAIGHT BACK
          </span>
        )}
        {/* Two-strike approach badge (Backlog #128) — flashes briefly when
            the count crosses to 2 strikes. The batter's stance also shifts
            to a choke-up pose for the rest of the at-bat. */}
        {chokeUpBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-600 to-cyan-600 text-white border border-slate-800" title={`Batter chokes up on the bat with two strikes — protecting the plate.`}>
            🎯 TWO-STRIKE APPROACH
          </span>
        )}
        {/* Pitcher fist pump badge (Backlog #129) — defensive pitcher punches
            his fist down after a clutch late-inning strikeout in a close game. */}
        {fistPumpBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-red-600 to-amber-500 text-white border border-red-800" title={`Pitcher pumps his fist after a clutch strikeout — that's a big moment!`}>
            💪 FIST PUMP!
          </span>
        )}
        {/* Brushback / chin music badge (Backlog #94) — high-and-tight ball
            that the batter ducks away from */}
        {brushbackBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-red-600 to-orange-500 text-white border border-red-800" title={`${brushbackBadge.batter} bailed out of a high-and-tight pitch. Chin music — purely a ball, but a message was sent.`}>
            🎵 CHIN MUSIC
          </span>
        )}
        {/* Manager ejection badge (Backlog #95) — manager argued the call and
            got tossed by the home plate umpire */}
        {ejectionBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-zinc-800 to-rose-700 text-white border border-zinc-900" title={`${ejectionBadge.manager} has been ejected by the home plate umpire after arguing the strikeout call.`}>
            🚪 EJECTED!
          </span>
        )}
        {/* Squeeze play badge (Backlog #97) — bunt with a runner on 3rd was
            a designed squeeze; the runner crossed the plate as the bunt was
            laid down. Pure flavor on top of the standard bunt pathway. */}
        {squeezeBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-amber-500 to-emerald-600 text-white border border-amber-700" title={`Squeeze play! ${squeezeBadge.batter} laid down the bunt while ${squeezeBadge.runner} sprinted home from third.`}>
            🎯 SQUEEZE PLAY!
          </span>
        )}
        {/* Catcher's mask toss badge (Backlog #98) — flashes when the catcher
            whips his mask off to track and catch a popup behind home plate.
            Pure flavor — outcome is still a foulOut. */}
        {maskTossBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-600 to-slate-800 text-white border border-slate-900" title={`The catcher tossed his mask off to track ${maskTossBadge.batter}'s pop-up behind the plate.`}>
            🎭 MASK OFF!
          </span>
        )}
        {/* Infield single badge (Backlog #99) — flashes when a routine
            groundOut is converted to an infield single (batter beats the
            throw to first by a half-step). The hit is real — runner advances
            and the batter gets credit on the box score. */}
        {infieldSingleBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-teal-500 to-cyan-600 text-white border border-teal-700" title={`${infieldSingleBadge.batter} legged out an infield single past ${infieldSingleBadge.fielder} — beat the throw to first.`}>
            ⚡ INFIELD SINGLE
          </span>
        )}
        {/* Tip of the cap badge (Backlog #100) — pitcher acknowledges a fielder
            who saved him with a defensive gem. */}
        {tipCapBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-500 to-slate-700 text-white border border-slate-800" title={`The pitcher tips his cap to ${tipCapBadge.fielder} for that defensive gem. Classic baseball respect.`}>
            🎩 TIP OF THE CAP
          </span>
        )}
        {/* Steal of home badge (Backlog #101) — runner from 3B breaks for home
            on the pitch. Color reflects the outcome (emerald for SAFE, red for
            CAUGHT). One of baseball's rarest plays. */}
        {stealHomeBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${stealHomeBadge.success ? 'bg-gradient-to-r from-emerald-500 to-amber-500 text-white border-emerald-700' : 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-800'}`} title={stealHomeBadge.success ? `${stealHomeBadge.runner} stole home! One of baseball's rarest plays.` : `${stealHomeBadge.runner} caught stealing home — desperate gamble cut down at the plate.`}>
            ⚡ STEAL OF HOME — {stealHomeBadge.success ? 'SAFE!' : 'OUT!'}
          </span>
        )}
        {/* Double steal badge (Backlog #144) — runners on 1st & 2nd both break
            on the pitch. Green when the trail runner is safe, red when he's
            thrown out at second (the lead runner always takes third). */}
        {doubleStealBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${doubleStealBadge.trailSuccess ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white border-emerald-700' : 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-800'}`} title={doubleStealBadge.trailSuccess ? `Double steal! ${doubleStealBadge.leadName} takes third and ${doubleStealBadge.trailName} takes second.` : `${doubleStealBadge.leadName} swipes third, but ${doubleStealBadge.trailName} is caught stealing at second.`}>
            🏃🏃 DOUBLE STEAL — {doubleStealBadge.trailSuccess ? 'SAFE!' : 'CAUGHT!'}
          </span>
        )}
        {/* Pitcher shake-off badge (Backlog #104) — pitcher waves off the
            catcher's first sign and a fresh sign cycles. Pure pre-pitch
            ritual flavor — no gameplay effect. */}
        {shakeOffBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-500 to-slate-700 text-white border border-slate-800" title="Pitcher shakes off the catcher's first sign — they cycle to a different pitch call.">
            🤔 SHAKE-OFF
          </span>
        )}
        {/* Throwing error badge (Backlog #105) — infielder fields a routine
            grounder cleanly but the throw pulls the first baseman off the
            bag. Reaches on error — no hit credit, AB charged. */}
        {throwErrorBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-rose-500 to-red-600 text-white border border-red-800" title={`${throwErrorBadge.errCode} — ${throwErrorBadge.fielder} airmailed the throw to first. ${throwErrorBadge.batter} reaches safely on the throwing error.`}>
            ✗ THROWING ERROR ({throwErrorBadge.errCode})
          </span>
        )}
        {/* Productive out badge (Backlog #108) — batter grounds to the right
            side and trades the out for advancing the runner from 2B to 3B.
            Small-ball moment that puts the runner ninety feet from home. */}
        {productiveOutBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-amber-500 to-emerald-600 text-white border border-emerald-700" title={`${productiveOutBadge.batter} grounded to the right side — ${productiveOutBadge.runner} advances from second to third.`}>
            ↗ PRODUCTIVE OUT
          </span>
        )}
        {/* Tag-up advance badge (Backlog #142) — runner tags from 2B and takes
            third on a deep fly out. Batter is out; no run scores. */}
        {tagUpBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-sky-500 to-emerald-600 text-white border border-emerald-700" title={`Tag-up advance — ${tagUpBadge.runner} tagged from second base after the catch and took third. The batter is out and no run scores, but the runner is now ninety feet from home in scoring position.`}>
            🏃 TAG &amp; ADVANCE
          </span>
        )}
        {/* Sacrifice bunt badge (Backlog #111) — designed bunt that trades the
            batter's out for moving the lead runner over (1B→2B, or 2B→3B).
            Mutually exclusive with the squeeze badge (which fires when a
            runner is on 3rd) and with the productive-out badge (which is for
            groundouts, not bunts). */}
        {sacBuntBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-amber-500 to-indigo-600 text-white border border-indigo-700" title={`Sacrifice bunt! ${sacBuntBadge.batter} gave himself up to move ${sacBuntBadge.runner} to ${sacBuntBadge.advancedTo}.`}>
            🎯 SAC BUNT
          </span>
        )}
        {/* Drag bunt single badge (Backlog #139) — the bases-empty bunt that
            beat the throw to first. The batter pushed/dragged a soft bunt down
            the line specifically to leg out a hit, not to sacrifice. Mutually
            exclusive with the squeeze badge (which requires a runner on 3rd)
            and with the sac-bunt badge (which requires the batter to be
            retired). Real-broadcast moment whenever a speedster catches the
            defense napping with a perfect drag bunt. */}
        {dragBuntBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-teal-500 to-cyan-600 text-white border border-cyan-700" title={`Drag bunt single! ${dragBuntBadge.batter} pushed a perfect bunt down the line and beat the throw to first base. Counted as a hit — no out.`}>
            🐎 DRAG BUNT SINGLE!
          </span>
        )}
        {/* First-to-third badge (Backlog #123) — aggressive baserunning! Runner
            on 1st reads the single to the gap and motors all the way to third
            instead of stopping at second. Sets up scoring position for the
            next batter. Real-broadcast moment whenever a runner gets a great
            jump on a sharp single to the outfield. */}
        {firstTo3rdBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-amber-500 to-emerald-600 text-white border border-emerald-700" title={`Aggressive baserunning! ${firstTo3rdBadge.runner} hustled from first to third on a single by ${firstTo3rdBadge.batter}.`}>
            🏃 1ST-TO-3RD!
          </span>
        )}
        {/* Hit and run badge (Backlog #148) — the runner went with the pitch on a
            grounder, beating the throw to second so the only out is the batter at
            first. Stays out of the double play and moves the runner into scoring
            position. */}
        {hitAndRunBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-emerald-500 to-sky-600 text-white border border-sky-700" title={`Hit and run! ${hitAndRunBadge.runner} broke with the pitch — ${hitAndRunBadge.batter} grounds out at first, but the runner advances safely to second and the double play is avoided.`}>
            🏃 HIT &amp; RUN!
          </span>
        )}
        {/* Catcher's blocked pitch badge (Backlog #112) — pitch bounced in the
            dirt and the catcher dove forward to smother it. Pure flavor — still
            scored as a regular ball. */}
        {blockedPitchBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-500 to-cyan-600 text-white border border-cyan-700" title="Pitch bounces in the dirt — the catcher dives to block it. Still a ball.">
            🛡 BLOCKED IN THE DIRT
          </span>
        )}
        {/* Pitcher's brow wipe badge (Backlog #113) — late-inning fatigued
            pitcher takes a beat to wipe sweat from his brow before the pitch.
            Pure pre-pitch ritual flavor — no gameplay effect. */}
        {browWipeBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-500 to-amber-600 text-white border border-amber-700" title="Pitcher takes a beat to wipe sweat between pitches — late innings can be exhausting.">
            💧 WIPING THE BROW
          </span>
        )}
        {/* Check-the-runner badge (Backlog #116) — pitcher comes set and
            glances over his right shoulder to check the runner at 1B before
            delivering. Pure pre-pitch ritual flavor — no gameplay effect. */}
        {checkRunnerBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-600 to-sky-700 text-white border border-sky-800" title="Pitcher comes set and checks the runner on first before delivering — keeping him close to the bag.">
            👀 CHECKING THE RUNNER
          </span>
        )}
        {/* Catcher framing converted-call badge (Backlog #130) — only flashes
            when the catcher's subtle glove-turn-toward-the-zone actually
            convinced the umpire to call strike on a borderline ball. The
            cosmetic-only framing attempts let the visual + sound carry the
            moment; this badge is reserved for the moment the umpire actually
            rings up the borderline pitch. */}
        {framingBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-500 to-cyan-600 text-white border border-cyan-800" title="The catcher subtly turned the glove toward the strike zone — and the umpire bit on the borderline call! Counted as a strike.">
            👁 PITCH FRAMED!
          </span>
        )}
        {/* Pitcher sign acceptance nod badge (Backlog #131) — flashes briefly
            when the pitcher accepts the catcher's first sign rather than
            shaking it off. Pure pre-pitch ritual flavor — no gameplay effect.
            Companion to the shake-off badge (#104). */}
        {signNodBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-slate-500 to-slate-700 text-white border border-slate-800" title="Pitcher nods his approval of the catcher's first sign — no shake-off, ready to deliver.">
            👌 SIGN ACCEPTED
          </span>
        )}
        {/* Battle at-bat badge (Backlog #115) — when the current at-bat reaches
            7+ pitches, the batter is "battling" the pitcher. Reads directly from
            gs.current.currentABPitches so it updates live with each pitch and
            clears when the AB ends (count reset). Pure cosmetic indicator —
            no gameplay effect. Real broadcasts always note the long at-bat. */}
        {!gs.current.gameOver && (gs.current.currentABPitches || 0) >= 7 && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-red-600 to-amber-500 text-white border border-red-700" title={`${gs.current.currentABPitches}-pitch at-bat — the batter is battling the pitcher.`}>
            🥊 BATTLE! {gs.current.currentABPitches}p
          </span>
        )}
        {/* Stadium organ "CHARGE!" fanfare badge (Backlog #125) — appears
            between half-innings when the iconic ballpark organ riff fires.
            Pure cosmetic atmospheric flavor — no gameplay effect. Yellow-on-
            navy palette matching classic ballpark scoreboard aesthetics. */}
        {organCharge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-blue-900 to-blue-800 text-yellow-300 border border-yellow-400" title="The ballpark organ plays the classic 'CHARGE!' fanfare to fire up the crowd between innings.">
            🎵 CHARGE!
          </span>
        )}
        {/* Save opportunity badge (Backlog #68) — defensive team is nursing a late-game save-situation lead */}
        {!gs.current.gameOver && saveOpportunity(gs.current, 1 - gs.current.half) && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-violet-600 text-white border border-violet-700" title={`${teams[1 - gs.current.half].name} is in a save situation — lead of 3 or fewer, or tying run reachable, in the 9th+`}>
            SAVE OPP
          </span>
        )}
        {/* Catcher's interference badge (Backlog #76) — bat clipped the catcher's mitt, batter awarded 1B */}
        {ciBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-slate-600 text-white border border-slate-700" title={`Catcher's interference on ${ciBadge.batter} — bat clipped the catcher's mitt. Batter awarded first base, no at-bat charged. Charged as an error to the defense.`}>
            CATCHER'S INTERFERENCE
          </span>
        )}
        {/* Lost-in-the-sun badge (Backlog #77) — day-game outfielder lost the fly ball in the sun */}
        {lostInSunBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-amber-300 text-amber-900 border border-amber-500" title={`The ${lostInSunBadge.fielder} lost the fly ball in the sun! ${lostInSunBadge.batter} reaches on the misjudged play.`}>
            ☀ LOST IN THE SUN!
          </span>
        )}
        {/* Dropped fly ball error badge (Backlog #103) — outfielder bobbles a routine fly ball, charged with a 2-base error */}
        {droppedFlyBadge && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r from-rose-500 to-red-600 text-white border border-red-800" title={`${droppedFlyBadge.errCode} — the ${droppedFlyBadge.fielder} dropped a routine fly ball. ${droppedFlyBadge.batter} hustles into second on the error.`}>
            ✗ DROPPED FLY ({droppedFlyBadge.errCode})
          </span>
        )}
        {/* Pitch clock violation flash (Backlog #69) — modern MLB rule, automatic ball/strike */}
        {pitchClockBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${pitchClockBadge.violator === 'pitcher' ? 'bg-red-600 text-white border-red-800' : 'bg-orange-600 text-white border-orange-800'}`} title={`Pitch clock violation — ${pitchClockBadge.violator === 'pitcher' ? 'automatic ball, pitcher was late to set' : 'automatic strike, batter not alert in the box'}`}>
            ⏱ PITCH CLOCK ({pitchClockBadge.violator.toUpperCase()})
          </span>
        )}
        {/* Manager challenge / replay review flash (Idea #80) — close call under review */}
        {challengeBadge && (
          <span className={`animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${challengeBadge.overturned ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-700 text-white border-slate-800'}`} title={`Manager challenge on the play at first — ${challengeBadge.overturned ? `OVERTURNED! ${challengeBadge.batter} ruled safe.` : `CALL STANDS — ${challengeBadge.batter} is out.`}`}>
            🚩 CHALLENGE — {challengeBadge.overturned ? 'OVERTURNED' : 'STANDS'}
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
        {/* Position player pitching badge (Backlog #79) — losing team has put a
            position player on the mound in a late-game blowout. Walk and HR
            rates spike while active; persists for the rest of the game. */}
        {!gs.current.gameOver && posPitcherActive[1 - gs.current.half] && (
          <span className="animate-pulse px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-fuchsia-600 text-white border border-fuchsia-700" title={`${teams[1 - gs.current.half].name} has a position player on the mound — walk and HR rates spike while he's pitching.`}>
            ⚾ POSITION PLAYER PITCHING
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

      <BaseballField bases={displayBases} outs={gs.current.outs} defColor={gs.current.half === 0 ? '#1e40af' : '#b91c1c'} offColor={gs.current.half === 0 ? '#b91c1c' : '#1e40af'} ballPos={ballPos} ballTrail={ballTrail} pitchPhase={pitchPhase} batterPhase={batterPhase} showFW={showFW} fwKey={fwKey} movingRunners={movingRunners} movingFielder={movingFielder} batterSide={batterSide} platePlay={platePlay} isPlayoff={isPlayoff} pitchingChange={pitchingChange} homeColor={'#b91c1c'} awayColor={'#1e40af'} homeKs={gs.current.kCount[1]} awayKs={gs.current.kCount[0]} homeKHistory={gs.current.kHistory ? gs.current.kHistory[1] : []} awayKHistory={gs.current.kHistory ? gs.current.kHistory[0] : []} isNightGame={isNightGame} webGem={webGem} errorBobble={errorBobble} umpirePhase={umpirePhase} crowdReactions={crowdReactions} pitchLocations={pitchLocations} inning={gs.current.inning} catcherSigns={catcherSigns} bullpenActive={!gs.current.gameOver && gs.current.pitchCount[1 - gs.current.half] >= 80 && gs.current.pitchCount[1 - gs.current.half] < 120} reliefColor={(1 - gs.current.half) === 1 ? '#b91c1c' : '#1e40af'} moundVisit={moundVisit} brokenBat={brokenBat} pickoffDive={pickoffDive} shiftType={infieldShift} leadCaution={leadCaution} robbedHRLeap={robbedHRLeap} bangBangPlay={bangBangPlay} sunFlare={sunFlare} crowdWaveActive={crowdWaveActive} crowdWaveKey={crowdWaveKey} challengeReview={challengeReview} fanCatch={fanCatch} coachSignKey={coachSignKey} rosinAct={rosinAct} rosinKey={rosinKey} hbpImpact={hbpImpact} groundsCrewActive={groundsCrewActive} groundsCrewKey={groundsCrewKey} divingStop={divingStop} ejectionAct={ejectionAct} ejectionUmpireActive={ejectionUmpireActive} flyingHelmet={flyingHelmet} maskToss={maskToss} catcherLookingUp={catcherLookingUp} pitcherTipCap={pitcherTipCap} pitcherShakeOff={pitcherShakeOff} catcherBlocking={catcherBlocking} pitcherBrowWipe={pitcherBrowWipe} pitcherCheckRunner={pitcherCheckRunner} f1bStretch={f1bStretch} umpire1BPhase={umpire1BPhase} batBoyAct={batBoyAct} chokeUp={(gs.current?.count?.strikes ?? 0) === 2} fistPump={fistPumpAct} catcherFraming={catcherFraming} pitcherHeadNod={pitcherHeadNod} freshBallToss={freshBallToss} infieldIn={infieldIn} curtainCall={curtainCall} pitcherCover={pitcherCover} walkOffMob={walkOffMob} highFiveLine={highFiveLine} rallyCaps={rallyCaps} />

      <div className="max-w-[750px] mx-auto flex flex-col items-start mt-2 px-2 text-gray-900">
        <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-sm text-[9px] font-black uppercase">At Bat</span>
            <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-sm text-[8px] font-bold" title={`#${gs.current.batterIdx[gs.current.half] + 1} in the lineup`}>#{gs.current.batterIdx[gs.current.half] + 1}</span>
            <span className="font-bold text-slate-800 text-[12px] tracking-tight">{activeBatter}</span>
            {(() => { const hand = PLAYER_HANDS[activeBatter] || 'R'; const handLabel = hand === 'S' ? 'Switch' : hand === 'L' ? 'Left' : 'Right'; const handColor = hand === 'L' ? 'bg-sky-100 text-sky-700 border-sky-300' : hand === 'S' ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-gray-100 text-gray-600 border-gray-300'; return <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${handColor}`} title={`Bats ${handLabel}`}>{hand === 'S' ? 'S' : hand}</span>; })()}
            {(() => {
              // Multi-hit / cold-streak badge (Backlog #21 + #117). Three
              // mutually-exclusive states for the current batter's day:
              //   • HOT  — 2+ hits in the game (pulsing orange)
              //   • h-ab — exactly 1 hit so far (yellow chip showing pace)
              //   • COLD — 0-for-3+ slump (pulsing sky-blue, Backlog #117)
              // Cold is the natural counterpart to HOT — every batter is
              // either hot, neutral, or cold in real broadcasts. Threshold of
              // 3 AB avoids flagging a batter as cold on a single 0-for-1.
              const s = statsRef.current[gs.current.half]?.[activeBatter];
              if (!s) return null;
              if (s.h >= 2) return <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase animate-pulse" title={`${s.h}-for-${s.ab} today`}>HOT</span>;
              if (s.h >= 1) return <span className="bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-[8px] font-bold" title={`${s.h}-for-${s.ab} today`}>{s.h}-{s.ab}</span>;
              if (s.ab >= 3) return <span className="bg-sky-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase animate-pulse" title={`0-for-${s.ab} today — slumping`}>🥶 COLD</span>;
              return null;
            })()}
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

      {/* Walk-up music marquee (Backlog #72) — atmospheric "now playing" chyron when a batter steps in */}
      {walkUpMusic && !gs.current.gameOver && (
        <div className="max-w-[750px] mx-auto px-2 overflow-hidden mt-1">
          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-900 via-fuchsia-800 to-purple-900 text-white px-3 py-0.5 rounded-full shadow-md text-[10px] font-bold tracking-wide border border-purple-400"
            style={{ animation: 'fadeInUp 0.4s ease-out' }}
            title={`${walkUpMusic.name}'s walk-up song`}
          >
            <span className="text-pink-200 text-[11px]">♪</span>
            <span className="text-purple-200 uppercase text-[8px] tracking-widest">Walk-up</span>
            <span className="text-white font-black italic">{walkUpMusic.title}</span>
            <span className="text-purple-300">—</span>
            <span className="text-purple-100 font-semibold">{walkUpMusic.artist}</span>
            <span className="text-pink-200 text-[11px]">♪</span>
          </div>
        </div>
      )}

      <div className="max-w-[750px] mx-auto my-2 text-center min-h-[40px]">
        <div className="bg-blue-900 text-white inline-block px-6 py-2 rounded-full italic font-bold shadow-md text-sm">
          {announceText || "Ready for pitch..."}
        </div>
        {(exitVelo || launchAngle !== null || batSpeed !== null || hrDistance || popTime) && (
          <div className="mt-1 flex justify-center items-center gap-1.5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            {exitVelo && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm border ${exitVelo >= 100 ? 'bg-red-100 text-red-800 border-red-300' : exitVelo >= 90 ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                <span className="uppercase opacity-60">Exit Velo</span>
                <span className="text-[12px]">{exitVelo}</span>
                <span className="uppercase opacity-60">mph</span>
              </span>
            )}
            {launchAngle !== null && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm border ${launchAngle >= 25 && launchAngle <= 35 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : launchAngle > 35 ? 'bg-sky-100 text-sky-800 border-sky-300' : launchAngle >= 8 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`} title={launchAngle >= 25 && launchAngle <= 35 ? 'Sweet spot — barrel zone!' : launchAngle > 35 ? 'Fly ball trajectory' : launchAngle >= 8 ? 'Line drive' : 'Ground ball'}>
                <span className="uppercase opacity-60">LA</span>
                <span className="text-[12px]">{launchAngle}°</span>
              </span>
            )}
            {batSpeed !== null && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm border ${batSpeed >= 78 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : batSpeed >= 72 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`} title={batSpeed >= 78 ? 'Elite bat speed!' : batSpeed >= 72 ? 'Above-average bat speed' : 'Below-average bat speed'}>
                <span className="uppercase opacity-60">Bat Speed</span>
                <span className="text-[12px]">{batSpeed.toFixed(1)}</span>
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