// turkey.js — the player: a turkey called Tom, running for his life.
// Owns the turkey's position, jumping, hiding and stumble state.

export const GROUND_Y = 452;
export const TURKEY_HOME_X = 210;

export function createTurkey() {
  return {
    x: TURKEY_HOME_X,
    y: GROUND_Y - 64,
    w: 52,
    h: 64,
    vy: 0,
    onGround: true,
    hidden: false,
    hideTimer: 0,
    stumbleTimer: 0,
    invulnTimer: 0, // brief grace after a hit: no double punishment
    lives: 3,
    corn: 0,
    runPhase: 0,
    facing: 1,
    gobbleCooldown: 0,
  };
}

export function resetTurkey(turkey) {
  const fresh = createTurkey();
  Object.assign(turkey, fresh);
}

// Jump only from the ground, and not while hidden in hay.
export function turkeyJump(turkey) {
  if (turkey.onGround && !turkey.hidden && turkey.stumbleTimer <= 0) {
    turkey.vy = -640;
    turkey.onGround = false;
    return true;
  }
  return false;
}

// Duck into a haystack. Returns true when the hide starts.
export function turkeyHide(turkey) {
  if (turkey.onGround && !turkey.hidden) {
    turkey.hidden = true;
    turkey.hideTimer = 2.4;
    return true;
  }
  return false;
}

export function turkeyStumble(turkey) {
  turkey.stumbleTimer = 0.9;
  turkey.invulnTimer = 1.2;
  turkey.lives -= 1;
}

export function turkeyUnhide(turkey) {
  turkey.hidden = false;
  turkey.hideTimer = 0;
}

export function updateTurkey(turkey, dt, input, speed) {
  // Sprinting (hold Right) pushes the turkey ahead; dawdling (hold Left)
  // lets the farmer close in. The turkey drifts back home otherwise.
  const targetX = input.right
    ? TURKEY_HOME_X + 70
    : input.left
      ? TURKEY_HOME_X - 60
      : TURKEY_HOME_X;
  turkey.x += (targetX - turkey.x) * Math.min(1, dt * 3.2);

  if (turkey.hidden) {
    turkey.hideTimer -= dt;
    if (turkey.hideTimer <= 0) turkeyUnhide(turkey);
  }

  if (turkey.stumbleTimer > 0) turkey.stumbleTimer -= dt;
  if (turkey.invulnTimer > 0) turkey.invulnTimer -= dt;
  if (turkey.gobbleCooldown > 0) turkey.gobbleCooldown -= dt;

  // Gravity and landing.
  if (!turkey.onGround) {
    turkey.vy += 1500 * dt;
    turkey.y += turkey.vy * dt;
    if (turkey.y >= GROUND_Y - turkey.h) {
      turkey.y = GROUND_Y - turkey.h;
      turkey.vy = 0;
      turkey.onGround = true;
    }
  }

  turkey.runPhase += dt * (speed / 28);
}
