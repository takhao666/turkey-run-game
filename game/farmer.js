// farmer.js — the farmer: he chases, he searches, and when he gets close
// he corners the turkey and lunges. Three AI moods, one grumpy farmer.

export function createFarmer() {
  return {
    x: 30,
    y: 452 - 96,
    w: 56,
    h: 96,
    mood: 'chase', // 'chase' | 'search' | 'windup' | 'lunge'
    searchTimer: 0,
    windupTimer: 0,
    lungeTimer: 0,
    searchX: 0,
    stride: 0,
    shoutCooldown: 0,
  };
}

export function resetFarmer(farmer) {
  Object.assign(farmer, createFarmer());
}

// The farmer's gap behind the turkey, in pixels. Zero means caught.
export function farmerGap(turkey, farmer) {
  return turkey.x - (farmer.x + farmer.w);
}

// Called when the turkey ducks into a haystack: the farmer stops at the
// haystack and searches it, giving the turkey a breather.
export function farmerStartSearch(farmer, haystackX) {
  farmer.mood = 'search';
  farmer.searchTimer = 2.2;
  farmer.searchX = haystackX;
}

export function updateFarmer(farmer, turkey, dt, worldSpeed, danger) {
  if (farmer.shoutCooldown > 0) farmer.shoutCooldown -= dt;

  if (farmer.mood === 'search') {
    farmer.searchTimer -= dt;
    // Shuffle around the haystack, peering into it.
    farmer.x += Math.sin(farmer.searchTimer * 9) * 26 * dt;
    farmer.stride += dt * 4;
    if (farmer.searchTimer <= 0) {
      farmer.mood = 'chase';
      // The search cost him: he lost ground while the turkey slipped away.
      farmer.x = Math.min(farmer.x, turkey.x - 170);
    }
    return;
  }

  // Wind-up: he rears back, telegraphing the grab. Jump it and he whiffs.
  if (farmer.mood === 'windup') {
    farmer.windupTimer -= dt;
    farmer.stride += dt * 2;
    if (farmer.windupTimer <= 0) {
      farmer.mood = 'lunge';
      farmer.lungeTimer = 0.45;
    }
    return;
  }

  if (farmer.mood === 'lunge') {
    farmer.lungeTimer -= dt;
    farmer.x += 380 * dt;
    farmer.stride += dt * 22;
    if (farmer.lungeTimer <= 0) farmer.mood = 'chase';
    return;
  }

  // Chase: the farmer runs in the same world as the turkey, so what matters
  // is his speed against the turkey's. At a steady run he slowly loses
  // ground; dawdling lets him close in, sprinting shakes him off.
  const gap = farmerGap(turkey, farmer);
  const cruise = 240;
  let vel = cruise - worldSpeed;
  if (gap > 260) vel += 46; // far behind: he hurries
  if (gap < 120) vel += 40; // smells dinner: he hurries more
  if (danger) vel += 30; // the turkey is stumbling: press the advantage
  farmer.x += vel * dt;
  farmer.stride += dt * (Math.abs(vel) / 14 + 6);

  // Cornered: close enough and he winds up for the grab — jump to dodge.
  if (gap < 46 && farmer.lungeTimer <= 0) {
    farmer.mood = 'windup';
    farmer.windupTimer = 0.5;
  }
}
