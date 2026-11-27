// main.js — Gobble Dash: the game loop, the state machine, collisions and
// scoring. Wires turkey, farmer, levels, audio, input and render together.

import { createTurkey, resetTurkey, turkeyJump, turkeyHide, turkeyStumble, updateTurkey, GROUND_Y, TURKEY_HOME_X } from './turkey.js';
import { createFarmer, resetFarmer, farmerGap, farmerStartSearch, updateFarmer } from './farmer.js';
import { stageForDistance, spawnNext, spawnGapFor, mulberry32, ESCAPE_DISTANCE } from './levels.js';
import {
  createAudio, audioUnlock, playGobble, playJump, playPickup, playHit,
  playAlarm, playCaught, playEscaped, playClick, toggleMute, updateMusic,
} from './audio.js';
import { createInput, attachInput } from './input.js';
import { drawScene } from './render.js';
import { stageShot } from './shots.js';

function readBest() {
  try {
    return Number(localStorage.getItem('gobble-dash-best') || 0);
  } catch {
    return 0;
  }
}

function saveBest(best) {
  try {
    localStorage.setItem('gobble-dash-best', String(best));
  } catch {
    // Storage unavailable (sandboxed frame): best score just isn't kept.
  }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

export function createGame() {
  return {
    state: 'title', // 'title' | 'playing' | 'paused' | 'caught' | 'escaped'
    turkey: createTurkey(),
    farmer: createFarmer(),
    obstacles: [],
    score: 0,
    distance: 0,
    best: readBest(),
    stage: stageForDistance(0),
    scroll: 0,
    speed: 250,
    spawnIn: 320,
    rng: mulberry32(20261127),
    time: 0,
    flash: '',
    flashTimer: 0,
    muted: false,
  };
}

const game = createGame();
const input = createInput();
const audio = createAudio();

// Debug handle for automated play-testing (read-only inspection).
window.__gobbleGame = game;

function setStatus(message) {
  statusEl.textContent = message;
}

function startRun() {
  resetTurkey(game.turkey);
  resetFarmer(game.farmer);
  game.obstacles = [];
  game.score = 0;
  game.distance = 0;
  game.stage = stageForDistance(0);
  game.scroll = 0;
  game.speed = 250;
  game.spawnIn = 320;
  game.rng = mulberry32((Math.random() * 1e9) | 0);
  game.state = 'playing';
  game.flash = '';
  audioUnlock(audio);
  playGobble(audio);
  setStatus('Run! The farmer is chasing you.');
}

function endRun(escaped, reason) {
  game.state = escaped ? 'escaped' : 'caught';
  game.endReason = reason || (escaped ? 'escaped' : 'caught');
  if (game.score > game.best) {
    game.best = game.score;
    saveBest(game.best);
  }
  if (escaped) {
    playEscaped(audio);
    setStatus(`Escaped! Score ${game.score}.`);
  } else {
    playCaught(audio);
    setStatus(`Caught! Score ${game.score}. Press Enter to run again.`);
  }
}

function togglePause() {
  if (game.state === 'playing') {
    game.state = 'paused';
    setStatus('Paused.');
  } else if (game.state === 'paused') {
    game.state = 'playing';
    setStatus('Running again.');
  }
}

attachInput(canvas, input, {
  onPause: togglePause,
  onMute: () => {
    game.muted = toggleMute(audio);
    setStatus(game.muted ? 'Sound off.' : 'Sound on.');
  },
  onConfirm: () => {
    if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') startRun();
  },
});

// Clicking the big on-screen buttons starts / restarts the run.
function handleClick() {
  if (game.state === 'title') {
    const { clickX, clickY } = input;
    if (clickX > 320 && clickX < 640 && clickY > 380 && clickY < 436) startRun();
  } else if (game.state === 'caught' || game.state === 'escaped') {
    const { clickX, clickY } = input;
    if (clickX > 320 && clickX < 640 && clickY > 350 && clickY < 406) startRun();
  }
}

function turkeyHits(obstacle) {
  const t = game.turkey;
  // The swinging knife only hurts while it hangs low.
  if (obstacle.kind === 'knife') {
    const swing = Math.abs(Math.sin(obstacle.swing || 0));
    if (swing < 0.55) return false;
  }
  // Puddles slow you down instead of hurting.
  if (obstacle.kind === 'puddle') return false;
  if (obstacle.kind === 'corn' || obstacle.kind === 'haystack') return false;
  return (
    t.x + t.w - 8 > obstacle.x + 4 &&
    t.x + 8 < obstacle.x + obstacle.w - 4 &&
    t.y + t.h - 4 > obstacle.y + 4 &&
    t.y + 4 < obstacle.y + obstacle.h
  );
}

function updatePlaying(dt) {
  const turkey = game.turkey;
  const farmer = game.farmer;

  // Speed: sprint with Right, dawdle with Left. Stages get faster.
  const stageBoost = game.distance / ESCAPE_DISTANCE * 90;
  let speed = 250 + stageBoost;
  if (input.right) speed += 70;
  if (input.left) speed -= 80;
  game.speed = Math.max(140, speed);

  if (input.jumpPressed) {
    if (turkeyJump(turkey)) playJump(audio);
    input.jumpPressed = false;
  }
  if (input.down && !turkey.hidden) {
    const stack = game.obstacles.find(
      (o) => o.kind === 'haystack' && Math.abs(o.x + o.w / 2 - (turkey.x + turkey.w / 2)) < 70,
    );
    if (stack && turkeyHide(turkey)) {
      farmerStartSearch(farmer, stack.x);
      game.flash = 'HIDDEN! The farmer is searching the hay…';
      game.flashTimer = 2.2;
      playGobble(audio);
    }
  }

  updateTurkey(turkey, dt, input, game.speed);
  updateFarmer(farmer, turkey, dt, game.speed, turkey.stumbleTimer > 0);

  game.distance += (game.speed * dt) / 12;
  game.scroll += game.speed * dt;
  game.score += Math.floor(game.speed * dt * 0.12);
  game.stage = stageForDistance(game.distance);

  // Spawn ahead.
  game.spawnIn -= game.speed * dt;
  if (game.spawnIn <= 0) {
    const next = spawnNext(game.stage.id, game.distance, game.rng);
    if (next) game.obstacles.push(next);
    game.spawnIn = spawnGapFor(game.distance, game.rng);
  }

  // Move the world, swing the knives, roll the pins.
  for (const o of game.obstacles) {
    o.x -= game.speed * dt;
    if (o.kind === 'knife') o.swing += (o.swingSpeed || 2) * dt;
    if (o.kind === 'rollingpin') o.x += (o.vx || 0) * dt;
  }
  game.obstacles = game.obstacles.filter((o) => o.x + o.w > -140);

  // Puddles: slow the turkey and let the farmer gain.
  const inPuddle = game.obstacles.some(
    (o) => o.kind === 'puddle' && turkey.x + turkey.w > o.x && turkey.x < o.x + o.w && turkey.onGround,
  );
  if (inPuddle) game.speed *= 0.82;

  // Collisions and pickups. Hidden in hay, the turkey can't be hit or fed.
  for (const o of game.obstacles) {
    if (turkey.hidden) break;
    if (o.kind === 'corn') {
      const overlap =
        turkey.x + turkey.w > o.x && turkey.x < o.x + o.w &&
        turkey.y + turkey.h > o.y && turkey.y < o.y + o.h;
      if (overlap && !o.taken) {
        o.taken = true;
        turkey.corn += 1;
        game.score += 100;
        farmer.x = Math.max(0, farmer.x - 22);
        playPickup(audio);
      }
      continue;
    }
    if (o.taken || o.passed) continue;
    if (turkey.invulnTimer > 0) continue;
    if (turkeyHits(o)) {
      o.taken = true;
      turkeyStumble(turkey);
      farmer.x += 46;
      game.flash = 'OUCH! The farmer is closing in!';
      game.flashTimer = 1.2;
      playHit(audio);
      if (turkey.lives <= 0) {
        endRun(false, 'knocked');
        return;
      }
    } else if (!o.passed && o.x + o.w < turkey.x) {
      o.passed = true;
      game.score += o.score;
      farmer.x = Math.max(0, farmer.x - 10);
    }
  }
  game.obstacles = game.obstacles.filter((o) => !o.taken);

  // A lunging farmer whiffs if the turkey is airborne: he stumbles past.
  if (farmer.mood === 'lunge' && !turkey.onGround) {
    farmer.mood = 'chase';
    farmer.x = Math.max(0, farmer.x - 90);
    game.flash = 'HE MISSED! Jumped right over him!';
    game.flashTimer = 1.4;
    playGobble(audio);
  }

  // Farmer proximity warnings.
  const gap = farmerGap(turkey, farmer);
  if (gap < 70 && farmer.shoutCooldown <= 0) {
    farmer.shoutCooldown = 2.5;
    playAlarm(audio);
    game.flash = 'THE FARMER IS RIGHT BEHIND YOU — SPRINT!';
    game.flashTimer = 1.6;
  }

  // Caught: the farmer closed the gap.
  if (gap <= 4) {
    endRun(false, 'caught');
    return;
  }

  // Escaped: reached the woods at the end of the kitchen.
  if (game.distance >= ESCAPE_DISTANCE) {
    game.score += 1000;
    endRun(true);
    return;
  }

  if (game.flashTimer > 0) game.flashTimer -= dt;
  updateMusic(audio, dt, true);
}

function update(dt) {
  game.time += dt;
  if (game.state === 'playing' && !game.shotFrozen) updatePlaying(dt);
  if (input.anyPressed) {
    if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') {
      // Enter starts; clicks on buttons are handled by coordinates.
      if (input.clicked) handleClick();
    }
    input.anyPressed = false;
    input.clicked = false;
  }
  if (game.state === 'title') {
    // The title screen idles with the turkey waiting in the farmyard.
    game.turkey.runPhase += dt * 2;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  drawScene(ctx, game, game.time);
  // Flash banner for spotted / hit / hidden moments.
  if (game.flashTimer > 0 && game.state === 'playing') {
    ctx.save();
    ctx.fillStyle = 'rgba(43, 26, 18, 0.8)';
    ctx.fillRect(180, 84, 600, 40);
    ctx.fillStyle = '#ffd23f';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(game.flash, 480, 105);
    ctx.restore();
  }
  requestAnimationFrame(frame);
}

// Screenshot staging: ?shot=start|play|end&seed=N renders a fixed moment
// of the game for the entry's screenshots. See shots.js.
const params = new URLSearchParams(location.search);
if (params.has('shot')) {
  stageShot(game, params.get('shot'), Number(params.get('seed') || 1));
}

requestAnimationFrame(frame);
