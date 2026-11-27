// shots.js — stages a fixed, deterministic moment of the game for each
// screenshot: the title screen, a mid-run chase, and the escaped ending.
// Used only through ?shot=start|play|end&seed=N in the page URL.

import { stageForDistance, mulberry32 } from './levels.js';
import { GROUND_Y } from './turkey.js';

export function stageShot(game, shot, seed) {
  const rng = mulberry32((seed || 1) * 7919 + 13);
  game.time = 3.2;
  // Freeze the simulation at the staged moment: the screenshot shows this
  // exact frame of the game, rendered live by the game's own code.
  game.shotFrozen = true;

  if (shot === 'start') {
    game.state = 'title';
    game.best = 2450;
    game.turkey.x = 300;
    game.turkey.y = GROUND_Y - 64;
    game.farmer.x = 120;
    game.farmer.y = GROUND_Y - 96;
    game.obstacles = [
      { kind: 'haystack', x: 620, y: GROUND_Y - 92, w: 74, h: 92, label: 'Haystack', hide: true },
      { kind: 'fence', x: 780, y: GROUND_Y - 64, w: 26, h: 64, label: 'Fence' },
      { kind: 'corn', x: 520, y: 330, w: 30, h: 30, label: 'Corn' },
    ];
    game.stage = stageForDistance(0);
    return;
  }

  if (shot === 'end') {
    game.state = 'escaped';
    game.score = 12840;
    game.distance = 1800;
    game.best = 12840;
    game.turkey.corn = 17;
    game.turkey.x = 300;
    game.turkey.y = GROUND_Y - 64;
    game.farmer.x = 40;
    game.farmer.y = GROUND_Y - 96;
    game.farmer.mood = 'search';
    game.stage = stageForDistance(1800);
    game.obstacles = [
      { kind: 'haystack', x: 700, y: GROUND_Y - 92, w: 74, h: 92, label: 'Haystack', hide: true },
    ];
    return;
  }

  // 'play' — a busy mid-run in the kitchen: the turkey sprinting past the
  // oven, the farmer close behind, a swinging knife ahead, corn to grab.
  game.state = 'playing';
  game.score = 7420;
  game.distance = 1345;
  game.best = 7420;
  game.stage = stageForDistance(1345);
  game.scroll = 1345 * 12;
  game.turkey.corn = 11;
  game.turkey.lives = 2;
  game.turkey.x = 210;
  game.turkey.y = GROUND_Y - 64;
  game.turkey.vy = 0;
  game.turkey.onGround = true;
  game.turkey.runPhase = 1.2;
  game.farmer.x = 70;
  game.farmer.y = GROUND_Y - 96;
  game.farmer.mood = 'chase';
  game.obstacles = [
    { kind: 'oven', x: 480, y: GROUND_Y - 118, w: 92, h: 118, score: 120, label: 'Hot oven' },
    { kind: 'knife', x: 660, y: 150, w: 30, h: 110, score: 150, label: 'Carving knife', swing: 0.9, swingSpeed: 2.1 },
    { kind: 'corn', x: 400, y: 300, w: 30, h: 30, label: 'Corn' },
    { kind: 'corn', x: 440, y: 270, w: 30, h: 30, label: 'Corn' },
    { kind: 'rollingpin', x: 800, y: GROUND_Y - 26, w: 64, h: 26, score: 80, label: 'Rolling pin', vx: -90 },
    { kind: 'haystack', x: 850, y: GROUND_Y - 92, w: 74, h: 92, label: 'Haystack', hide: true },
  ];
  game.flash = 'THE FARMER IS RIGHT BEHIND YOU — SPRINT!';
  game.flashTimer = 30;
  void rng;
}
