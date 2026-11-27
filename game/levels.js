// levels.js — the three stages of the escape and everything that spawns in them.
// Farmyard -> Barn -> Kitchen, then the freedom gate. Difficulty grows with distance.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const STAGES = [
  {
    id: 'farmyard',
    name: 'THE FARMYARD',
    from: 0,
    to: 600,
    sky: '#f7c873',
    skyTop: '#f2a65a',
    ground: '#8a5a2b',
    grass: '#7fae4c',
    hint: 'Run! The farmer is right behind you — jump the fences, grab the corn!',
  },
  {
    id: 'barn',
    name: 'THE BARN',
    from: 600,
    to: 1200,
    sky: '#e8955a',
    skyTop: '#c96f3f',
    ground: '#6e4520',
    grass: '#a8873c',
    hint: 'Through the barn! Haystacks hide you — press DOWN beside one.',
  },
  {
    id: 'kitchen',
    name: 'THE KITCHEN',
    from: 1200,
    to: 1800,
    sky: '#d97b4f',
    skyTop: '#a34d33',
    ground: '#5d3a22',
    grass: '#b0713a',
    hint: 'The kitchen! Mind the oven and the swinging carving knife!',
  },
];

export const ESCAPE_DISTANCE = 1800;

export function stageForDistance(distance) {
  for (const stage of STAGES) {
    if (distance < stage.to) return stage;
  }
  return STAGES[STAGES.length - 1];
}

export function stageIndexForDistance(distance) {
  for (let i = 0; i < STAGES.length; i++) {
    if (distance < STAGES[i].to) return i;
  }
  return STAGES.length - 1;
}

// Obstacle kinds. width/height are in canvas pixels; jumpOver tells the
// player the obstacle is cleared by jumping, hideBehind by hiding in hay.
export const OBSTACLES = {
  fence: { kind: 'fence', w: 26, h: 64, score: 50, label: 'Fence' },
  haybale: { kind: 'haybale', w: 54, h: 52, score: 50, label: 'Hay bale' },
  puddle: { kind: 'puddle', w: 90, h: 14, score: 30, label: 'Mud puddle' },
  haystack: { kind: 'haystack', w: 74, h: 92, score: 0, label: 'Haystack', hide: true },
  oven: { kind: 'oven', w: 92, h: 118, score: 120, label: 'Hot oven' },
  knife: { kind: 'knife', w: 30, h: 110, score: 150, label: 'Carving knife' },
  rollingpin: { kind: 'rollingpin', w: 64, h: 26, score: 80, label: 'Rolling pin' },
};

function pickObstacle(stageId, rng) {
  if (stageId === 'farmyard') {
    const roll = rng();
    if (roll < 0.42) return 'fence';
    if (roll < 0.68) return 'haybale';
    if (roll < 0.86) return 'puddle';
    return 'haystack';
  }
  if (stageId === 'barn') {
    const roll = rng();
    if (roll < 0.34) return 'fence';
    if (roll < 0.58) return 'haybale';
    if (roll < 0.74) return 'puddle';
    if (roll < 0.9) return 'haystack';
    return 'rollingpin';
  }
  // kitchen
  const roll = rng();
  if (roll < 0.3) return 'oven';
  if (roll < 0.58) return 'knife';
  if (roll < 0.74) return 'rollingpin';
  if (roll < 0.88) return 'haybale';
  return 'puddle';
}

// Decide the next thing to spawn ahead of the player. Returns a fresh
// obstacle (or a corn pickup) placed at screen x, or null for a breather.
export function spawnNext(stageId, distance, rng) {
  const roll = rng();
  // Corn pickups: a little arc of three, or a single cob.
  if (roll < 0.22) {
    const y = 300 + Math.floor(rng() * 60);
    return { kind: 'corn', x: 1020, y, w: 30, h: 30, score: 100, label: 'Corn' };
  }
  const kind = pickObstacle(stageId, rng);
  const def = OBSTACLES[kind];
  const groundY = 452;
  const obstacle = {
    kind,
    x: 1020 + Math.floor(rng() * 120),
    y: groundY - def.h,
    w: def.w,
    h: def.h,
    score: def.score,
    label: def.label,
    hide: Boolean(def.hide),
    passed: false,
    swing: rng() * Math.PI * 2,
  };
  // Knives hang from the ceiling beam and swing; ovens sit on the floor.
  if (kind === 'knife') {
    obstacle.y = 150;
    obstacle.swingSpeed = 1.6 + rng() * 1.2;
  }
  if (kind === 'rollingpin') {
    obstacle.y = groundY - 26;
    obstacle.vx = -(60 + rng() * 60);
  }
  return obstacle;
}

// How far apart spawns are, in pixels of travel. Tighter as stages advance.
export function spawnGapFor(distance, rng) {
  const stage = stageIndexForDistance(distance);
  const base = [300, 250, 205][stage];
  return base + rng() * 160;
}
