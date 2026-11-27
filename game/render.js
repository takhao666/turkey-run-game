// render.js — every pixel of Gobble Dash is drawn here with canvas paths:
// the turkey, the farmer, the farm, the barn, the kitchen, the HUD and the
// title and end screens. Autumn palette throughout, readable at a glance.

import { GROUND_Y } from './turkey.js';
import { farmerGap } from './farmer.js';

const W = 960;
const H = 540;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function outlineText(ctx, str, x, y, size, color, align) {
  ctx.font = `bold ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(60, 25, 5, 0.85)';
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// ---------------------------------------------------------------- turkey
export function drawTurkey(ctx, turkey, t) {
  const x = turkey.x;
  const y = turkey.y;
  // Blink while invulnerable after a hit.
  if (turkey.invulnTimer > 0 && Math.floor(t * 12) % 2 === 0) return;
  const legSwing = turkey.onGround ? Math.sin(turkey.runPhase) * 8 : 4;
  ctx.save();
  if (turkey.hidden) ctx.globalAlpha = 0.25;

  // Tail fan: five autumn feathers.
  const fanColors = ['#b5651d', '#d2691e', '#cd853f', '#8b4513', '#e07b39'];
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(x - 16, y + 26);
    ctx.rotate(i * 0.42 - Math.PI / 2);
    ctx.fillStyle = fanColors[i + 2];
    ctx.beginPath();
    ctx.ellipse(0, -26, 9, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7c873';
    ctx.beginPath();
    ctx.ellipse(0, -40, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Legs.
  ctx.strokeStyle = '#e8a33d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 46);
  ctx.lineTo(x - 4 + legSwing, y + 62);
  ctx.moveTo(x + 6, y + 46);
  ctx.lineTo(x + 6 - legSwing, y + 62);
  ctx.stroke();

  // Body.
  ctx.fillStyle = '#7a4a21';
  ellipse(ctx, x, y + 26, 26, 22);
  ctx.fillStyle = '#8b5a2b';
  ellipse(ctx, x, y + 22, 22, 17);

  // Wing.
  ctx.fillStyle = '#5d3a17';
  ctx.beginPath();
  ctx.ellipse(x - 2, y + 26, 14, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head.
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(x + 16, y - 6, 8, 16, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c98d5f';
  ellipse(ctx, x + 20, y - 20, 11, 10);
  // Beak.
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.moveTo(x + 29, y - 22);
  ctx.lineTo(x + 42, y - 18);
  ctx.lineTo(x + 29, y - 15);
  ctx.closePath();
  ctx.fill();
  // Wattle.
  ctx.fillStyle = '#d9382b';
  ctx.beginPath();
  ctx.ellipse(x + 28, y - 12, 4, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eye.
  ctx.fillStyle = '#1c0f08';
  ellipse(ctx, x + 23, y - 23, 2.6, 2.6);
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, x + 24, y - 24, 1, 1);

  // "!" when stumbling.
  if (turkey.stumbleTimer > 0) {
    outlineText(ctx, '!', x + 34, y - 44, 30, '#ffd23f', 'center');
  }
  ctx.restore();
}

// ---------------------------------------------------------------- farmer
export function drawFarmer(ctx, farmer, t) {
  const x = farmer.x;
  const y = farmer.y;
  const stride = Math.sin(farmer.stride) * 10;
  const lunging = farmer.mood === 'lunge';
  const searching = farmer.mood === 'search';

  ctx.save();
  // Legs: blue overalls, running stride.
  ctx.strokeStyle = '#2f4d7a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 62);
  ctx.lineTo(x + 18 + stride, y + 94);
  ctx.moveTo(x + 34, y + 62);
  ctx.lineTo(x + 34 - stride, y + 94);
  ctx.stroke();

  // Body: red checked shirt under overalls.
  ctx.fillStyle = '#b03a2e';
  roundRect(ctx, x + 6, y + 30, 40, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#2f4d7a';
  roundRect(ctx, x + 10, y + 44, 32, 22, 5);
  ctx.fill();

  // Arms: one pumps, one holds the pitchfork.
  ctx.strokeStyle = '#b03a2e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 38);
  ctx.lineTo(x - 2, y + 52 - stride * 0.6);
  ctx.stroke();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 46, y + 34);
  ctx.lineTo(x + 58, y - 6);
  ctx.stroke();
  // Pitchfork tines.
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 58 + i * 6, y - 6);
    ctx.lineTo(x + 58 + i * 6, y - 20);
    ctx.stroke();
  }

  // Head and straw hat.
  ctx.fillStyle = '#e8b98a';
  ellipse(ctx, x + 26, y + 18, 13, 13);
  ctx.fillStyle = '#d2691e';
  ctx.beginPath();
  ctx.ellipse(x + 26, y + 8, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8c15a';
  ctx.beginPath();
  ctx.ellipse(x + 26, y + 2, 12, 7, 0, Math.PI, 0);
  ctx.fill();
  // Angry eyes and moustache.
  ctx.strokeStyle = '#1c0f08';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 12);
  ctx.lineTo(x + 24, y + 15);
  ctx.moveTo(x + 34, y + 12);
  ctx.lineTo(x + 28, y + 15);
  ctx.stroke();
  ctx.fillStyle = '#6e4520';
  ctx.beginPath();
  ctx.ellipse(x + 26, y + 26, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  if (lunging) outlineText(ctx, 'GOTCHA!', x + 26, y - 30, 22, '#ff5a3c', 'center');
  if (farmer.mood === 'windup') outlineText(ctx, '!', x + 26, y - 30, 30, '#ff5a3c', 'center');
  if (searching) outlineText(ctx, '?', x + 26, y - 26, 28, '#ffd23f', 'center');
  ctx.restore();
}

// ------------------------------------------------------------- obstacles
export function drawObstacle(ctx, o, t) {
  ctx.save();
  if (o.kind === 'fence') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(o.x, o.y + 8, 6, o.h - 8);
    ctx.fillRect(o.x + o.w - 6, o.y + 8, 6, o.h - 8);
    ctx.fillStyle = '#a9713a';
    ctx.fillRect(o.x - 4, o.y + 14, o.w + 8, 9);
    ctx.fillRect(o.x - 4, o.y + 36, o.w + 8, 9);
  } else if (o.kind === 'haybale') {
    ctx.fillStyle = '#d9a441';
    ellipse(ctx, o.x + o.w / 2, o.y + o.h / 2, o.w / 2, o.h / 2);
    ctx.strokeStyle = '#a97b1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, o.w / 2 - 7, o.h / 2 - 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, o.w / 2 - 14, o.h / 2 - 14, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (o.kind === 'puddle') {
    ctx.fillStyle = '#6b4a2f';
    ellipse(ctx, o.x + o.w / 2, o.y + o.h / 2, o.w / 2, o.h / 2);
    ctx.fillStyle = '#8a6a45';
    ellipse(ctx, o.x + o.w / 2 - 12, o.y + o.h / 2, o.w / 4, o.h / 4);
  } else if (o.kind === 'haystack') {
    ctx.fillStyle = '#e0aa3e';
    ctx.beginPath();
    ctx.moveTo(o.x, o.y + o.h);
    ctx.quadraticCurveTo(o.x + o.w / 2, o.y - 14, o.x + o.w, o.y + o.h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b57f1d';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(o.x + (o.w * i) / 4, o.y + o.h * 0.35);
      ctx.lineTo(o.x + (o.w * i) / 4, o.y + o.h - 4);
      ctx.stroke();
    }
    text(ctx, 'HIDE ↓', o.x + o.w / 2, o.y - 16, 13, '#fff3d0', 'center');
  } else if (o.kind === 'oven') {
    ctx.fillStyle = '#3d3d3d';
    roundRect(ctx, o.x, o.y, o.w, o.h, 8);
    ctx.fill();
    ctx.fillStyle = '#222';
    roundRect(ctx, o.x + 10, o.y + 14, o.w - 20, 52, 6);
    ctx.fill();
    // Fire glow inside the oven window.
    const flicker = 0.7 + Math.sin(t * 11 + o.x) * 0.3;
    ctx.fillStyle = `rgba(255, ${Math.floor(120 + 60 * flicker)}, 30, 0.95)`;
    roundRect(ctx, o.x + 14, o.y + 18, o.w - 28, 44, 4);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.fillRect(o.x + 8, o.y + 74, o.w - 16, 6);
    ctx.fillStyle = '#c0392b';
    ellipse(ctx, o.x + o.w / 2, o.y + 94, 10, 6);
    text(ctx, 'HOT!', o.x + o.w / 2, o.y - 12, 14, '#ff6b4a', 'center');
  } else if (o.kind === 'knife') {
    const swing = Math.sin(o.swing || 0) * 0.55;
    ctx.save();
    ctx.translate(o.x + o.w / 2, 120);
    ctx.rotate(swing);
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.lineTo(0, 0);
    ctx.stroke();
    // Blade: broad carving knife.
    ctx.fillStyle = '#dfe6ea';
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(13, 0);
    ctx.lineTo(5, 92);
    ctx.lineTo(-5, 92);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9aa5ab';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 88);
    ctx.stroke();
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(-13, -4, 26, 10);
    ctx.restore();
    text(ctx, '!', o.x + o.w / 2, 250, 20, '#ff5a3c', 'center');
  } else if (o.kind === 'rollingpin') {
    ctx.fillStyle = '#c98d5f';
    roundRect(ctx, o.x, o.y, o.w, o.h, 12);
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(o.x - 8, o.y + 8, 10, 10);
    ctx.fillRect(o.x + o.w - 2, o.y + 8, 10, 10);
  } else if (o.kind === 'corn') {
    ctx.fillStyle = '#f2c230';
    ellipse(ctx, o.x + 15, o.y + 15, 12, 15);
    ctx.fillStyle = '#e8a020';
    for (let r = 0; r < 3; r++) {
      ctx.fillRect(o.x + 6, o.y + 6 + r * 9, 18, 2);
    }
    ctx.fillStyle = '#5d8a3c';
    ctx.beginPath();
    ctx.moveTo(o.x + 15, o.y + 2);
    ctx.lineTo(o.x + 26, o.y - 8);
    ctx.lineTo(o.x + 15, o.y - 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ------------------------------------------------------------ background
export function drawBackground(ctx, stage, scroll, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(1, stage.sky);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 380);

  // Sun and drifting clouds.
  ctx.fillStyle = '#fff3c4';
  ellipse(ctx, 830, 70, 34, 34);
  ctx.fillStyle = 'rgba(255, 250, 230, 0.85)';
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 340 + scroll * 0.12 + t * 6) % 1100) - 80;
    ellipse(ctx, cx, 60 + i * 34, 46, 16);
    ellipse(ctx, cx + 30, 66 + i * 34, 34, 13);
  }

  if (stage.id === 'farmyard') {
    // Distant red barn and autumn trees.
    ctx.fillStyle = '#a93226';
    ctx.fillRect(120 - (scroll * 0.3 % 960), 250, 130, 110);
    ctx.fillStyle = '#7a241a';
    ctx.beginPath();
    ctx.moveTo(110 - (scroll * 0.3 % 960), 250);
    ctx.lineTo(185 - (scroll * 0.3 % 960), 205);
    ctx.lineTo(260 - (scroll * 0.3 % 960), 250);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const tx = ((i * 210 + 60 - scroll * 0.45) % 1050 + 1050) % 1050 - 40;
      ctx.fillStyle = '#6e4520';
      ctx.fillRect(tx, 300, 10, 60);
      ctx.fillStyle = ['#d2691e', '#b5651d', '#cd853f'][i % 3];
      ellipse(ctx, tx + 5, 285, 42, 34);
    }
  } else if (stage.id === 'barn') {
    // Barn interior: wooden beams and hanging lanterns.
    ctx.fillStyle = 'rgba(90, 50, 20, 0.35)';
    ctx.fillRect(0, 0, W, 90);
    ctx.fillStyle = '#5d3a17';
    for (let i = 0; i < 5; i++) ctx.fillRect(i * 220 - (scroll * 0.2 % 220), 0, 26, 360);
    ctx.fillStyle = '#ffdf8a';
    for (let i = 0; i < 3; i++) {
      const lx = ((i * 330 + 120 - scroll * 0.2) % 1050 + 1050) % 1050 - 40;
      ellipse(ctx, lx, 120, 12, 18);
    }
  } else {
    // Kitchen: pale checkered wall tiles and a window with the farm outside.
    ctx.fillStyle = '#f3e2c7';
    ctx.fillRect(0, 0, W, 380);
    ctx.fillStyle = '#e9cda6';
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 16; x++) {
        if ((x + y) % 2 === 0) ctx.fillRect(x * 64, y * 64, 64, 64);
      }
    }
    ctx.fillStyle = '#7fb3d5';
    roundRect(ctx, 620, 50, 220, 150, 10);
    ctx.fill();
    ctx.fillStyle = '#f7c873';
    ellipse(ctx, 790, 100, 26, 26);
    ctx.fillStyle = '#7fae4c';
    ctx.fillRect(620, 165, 220, 35);
  }

  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, W, 12);
  // Fence posts scrolling past.
  ctx.fillStyle = '#6e4520';
  for (let i = 0; i < 8; i++) {
    const fx = ((i * 140 - scroll) % 1120 + 1120) % 1120 - 80;
    ctx.fillRect(fx, GROUND_Y - 26, 8, 26);
  }
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, GROUND_Y - 22, W, 6);

  // Falling autumn leaves.
  ctx.fillStyle = 'rgba(214, 105, 30, 0.8)';
  for (let i = 0; i < 10; i++) {
    const lx = ((i * 137 + t * 30) % 1000) - 20;
    const ly = ((i * 89 + t * 55) % 380);
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(t * 2 + i);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
}

// ------------------------------------------------------------------- HUD
export function drawHUD(ctx, game) {
  const { turkey, farmer, score, distance, stage } = game;
  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 18, 0.72)';
  roundRect(ctx, 12, 10, 936, 52, 10);
  ctx.fill();

  text(ctx, `SCORE ${score}`, 28, 36, 22, '#ffd23f');
  text(ctx, `${Math.floor(distance)} m`, 250, 36, 22, '#ffffff');
  text(ctx, stage.name, 400, 36, 18, '#ffb37a', 'center');
  text(ctx, `CORN ${turkey.corn}`, 560, 36, 18, '#f2c230', 'center');

  // Lives as hearts.
  for (let i = 0; i < 3; i++) {
    const hx = 660 + i * 30;
    ctx.fillStyle = i < turkey.lives ? '#e63946' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx, 32, 8, 0, Math.PI * 2);
    ctx.arc(hx + 12, 32, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 6, 36);
    ctx.lineTo(hx + 18, 36);
    ctx.lineTo(hx + 6, 50);
    ctx.closePath();
    ctx.fill();
  }

  // Farmer proximity gauge.
  const gap = Math.max(0, Math.min(300, farmerGap(turkey, farmer)));
  const danger = gap < 90;
  text(ctx, 'FARMER', 760, 26, 13, danger ? '#ff6b4a' : '#ffd9a0');
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(ctx, 760, 36, 170, 12, 6);
  ctx.fill();
  ctx.fillStyle = danger ? '#ff5a3c' : '#7fae4c';
  const w = Math.max(8, (gap / 300) * 170);
  roundRect(ctx, 760, 36, w, 12, 6);
  ctx.fill();
  if (danger) {
    text(ctx, 'HE IS CLOSE!', 845, 58, 11, '#ff8a70', 'center');
  }
  ctx.restore();
}

// --------------------------------------------------------------- screens
function drawButton(ctx, x, y, w, h, label) {
  ctx.fillStyle = '#e07b39';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = '#fff3d0';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, 24, '#fff3d0', 'center');
}

export function drawTitle(ctx, game, t) {
  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 18, 0.45)';
  ctx.fillRect(0, 0, W, H);
  outlineText(ctx, 'GOBBLE DASH', W / 2, 110, 72, '#ffd23f', 'center');
  outlineText(ctx, "A TURKEY'S GREAT ESCAPE", W / 2, 168, 26, '#fff3d0', 'center');

  text(ctx, 'Thanksgiving is coming. The farmer wants you for dinner.', W / 2, 216, 19, '#ffffff', 'center');
  text(ctx, 'Outrun him from the farmyard, through the barn, out of the kitchen —', W / 2, 244, 19, '#ffffff', 'center');
  text(ctx, 'and reach the woods 1800 m away to be FREE.', W / 2, 272, 19, '#ffffff', 'center');

  text(ctx, '← → run   •   SPACE jump   •   ↓ hide in a haystack   •   grab corn', W / 2, 318, 17, '#ffd9a0', 'center');
  text(ctx, 'Jump fences and ovens — time the swinging carving knife!', W / 2, 344, 17, '#ffd9a0', 'center');

  if (game.shotFrozen || Math.floor(t * 2) % 2 === 0) {
    drawButton(ctx, W / 2 - 160, 380, 320, 56, '▶  START THE ESCAPE');
  }
  if (game.best > 0) text(ctx, `Best score: ${game.best}`, W / 2, 468, 16, '#fff3d0', 'center');
  text(ctx, 'A turkey called Tom • A very hungry farmer • One big dinner to dodge', W / 2, 500, 14, '#d9a05a', 'center');
  ctx.restore();
}

export function drawEnd(ctx, game, t) {
  const escaped = game.state === 'escaped';
  ctx.save();
  ctx.fillStyle = escaped ? 'rgba(31, 90, 40, 0.55)' : 'rgba(90, 20, 10, 0.55)';
  ctx.fillRect(0, 0, W, H);

  if (escaped) {
    outlineText(ctx, 'ESCAPED!', W / 2, 120, 72, '#7be495', 'center');
    text(ctx, 'Tom made it to the woods — no Thanksgiving dinner this year!', W / 2, 178, 20, '#ffffff', 'center');
    text(ctx, 'The farmer is still searching the barn. Somewhere.', W / 2, 208, 18, '#d9f2d9', 'center');
  } else {
    outlineText(ctx, 'CAUGHT!', W / 2, 120, 72, '#ff6b4a', 'center');
    if (game.endReason === 'knocked') {
      text(ctx, 'Three hard knocks — and the farmer caught up while you stumbled.', W / 2, 178, 20, '#ffffff', 'center');
    } else {
      text(ctx, 'The farmer got you… Thanksgiving dinner is served.', W / 2, 178, 20, '#ffffff', 'center');
    }
    text(ctx, 'But every turkey deserves a second chance. Run again!', W / 2, 208, 18, '#ffd9a0', 'center');
  }

  text(ctx, `SCORE  ${game.score}      DISTANCE  ${Math.floor(game.distance)} m      CORN  ${game.turkey.corn}`, W / 2, 268, 22, '#ffd23f', 'center');
  text(ctx, `Best score: ${game.best}`, W / 2, 306, 17, '#fff3d0', 'center');
  if (game.shotFrozen || Math.floor(t * 2) % 2 === 0) {
    drawButton(ctx, W / 2 - 160, 350, 320, 56, '↻  RUN AGAIN');
  }
  text(ctx, 'Press Enter or click to run again', W / 2, 440, 15, '#ffd9a0', 'center');
  ctx.restore();
}

export function drawPaused(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 18, 0.6)';
  ctx.fillRect(0, 0, W, H);
  outlineText(ctx, 'PAUSED', W / 2, 240, 56, '#fff3d0', 'center');
  text(ctx, 'Press P to keep running', W / 2, 300, 18, '#ffd9a0', 'center');
  ctx.restore();
}

// The woods at the end of the run: freedom, green and gold.
export function drawWoods(ctx, scroll, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#7fb069');
  sky.addColorStop(1, '#a3c585');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 380);
  ctx.fillStyle = '#fff3c4';
  ellipse(ctx, 830, 70, 34, 34);
  ctx.fillStyle = 'rgba(255, 250, 230, 0.85)';
  ellipse(ctx, 200, 80, 46, 16);
  ellipse(ctx, 560, 55, 40, 14);
  // Pine trees and autumn oaks.
  for (let i = 0; i < 7; i++) {
    const tx = ((i * 160 + 40 - scroll * 0.3) % 1100 + 1100) % 1100 - 60;
    ctx.fillStyle = '#5d3a17';
    ctx.fillRect(tx, 320, 12, 60);
    if (i % 2 === 0) {
      ctx.fillStyle = '#2f6b3a';
      ctx.beginPath();
      ctx.moveTo(tx + 6, 190);
      ctx.lineTo(tx - 34, 330);
      ctx.lineTo(tx + 46, 330);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#d2691e';
      ellipse(ctx, tx + 6, 280, 46, 40);
    }
  }
  ctx.fillStyle = '#6b8e4e';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = '#7fae4c';
  ctx.fillRect(0, GROUND_Y, W, 12);
  // Falling leaves.
  ctx.fillStyle = 'rgba(214, 105, 30, 0.8)';
  for (let i = 0; i < 10; i++) {
    const lx = ((i * 137 + t * 30) % 1000) - 20;
    const ly = ((i * 89 + t * 55) % 380);
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(t * 2 + i);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
}

// Main scene painter: background, entities, HUD, then the state overlay.
export function drawScene(ctx, game, t) {
  if (game.state === 'escaped') {
    drawWoods(ctx, game.scroll, t);
  } else {
    drawBackground(ctx, game.stage, game.scroll, t);
  }
  for (const o of game.obstacles) drawObstacle(ctx, o, t);
  if (game.turkey.hidden) {
    // The turkey is inside the haystack: draw only a few tail feathers.
    const stack = game.obstacles.find((o) => o.kind === 'haystack' && Math.abs(o.x - game.turkey.x) < 90);
    if (stack) {
      ctx.fillStyle = '#b5651d';
      ctx.beginPath();
      ctx.ellipse(stack.x + stack.w / 2, stack.y + 6, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    drawTurkey(ctx, game.turkey, t);
  }
  drawFarmer(ctx, game.farmer, t);
  if (game.state === 'playing' || game.state === 'paused') drawHUD(ctx, game);
  if (game.state === 'title') drawTitle(ctx, game, t);
  if (game.state === 'caught' || game.state === 'escaped') drawEnd(ctx, game, t);
  if (game.state === 'paused') drawPaused(ctx);
}
