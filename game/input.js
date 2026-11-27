// input.js — keyboard, mouse and touch. One small module, every control.

export function createInput() {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    jumpPressed: false, // edge-triggered: consumed by the game loop
    anyPressed: false, // edge-triggered: any key or click
    clickX: 0,
    clickY: 0,
    clicked: false, // edge-triggered: consumed by the game loop
  };
}

function keyName(code) {
  if (code === 'ArrowLeft' || code === 'KeyA') return 'left';
  if (code === 'ArrowRight' || code === 'KeyD') return 'right';
  if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') return 'up';
  if (code === 'ArrowDown' || code === 'KeyS') return 'down';
  return null;
}

export function attachInput(canvas, input, handlers) {
  window.addEventListener('keydown', (event) => {
    const name = keyName(event.code);
    if (name) {
      event.preventDefault();
      if (!event.repeat) {
        if (name === 'up') input.jumpPressed = true;
        input.anyPressed = true;
      }
      input[name] = true;
    }
    if (event.code === 'KeyP' && !event.repeat) handlers.onPause();
    if (event.code === 'KeyM' && !event.repeat) handlers.onMute();
    if (event.code === 'Enter' && !event.repeat) {
      input.anyPressed = true;
      handlers.onConfirm();
    }
  });

  window.addEventListener('keyup', (event) => {
    const name = keyName(event.code);
    if (name) input[name] = false;
  });

  function pointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    input.clickX = ((event.clientX - rect.left) / rect.width) * 960;
    input.clickY = ((event.clientY - rect.top) / rect.height) * 540;
    input.clicked = true;
    input.anyPressed = true;
  }
  canvas.addEventListener('pointerdown', pointerDown);

  // Touch: left half = slow down, right half = sprint, swipe up = jump.
  let touchStartY = 0;
  canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    touchStartY = event.touches[0].clientY;
    pointerDown(event.touches[0]);
  }, { passive: false });
  canvas.addEventListener('touchend', (event) => {
    event.preventDefault();
    const dy = touchStartY - event.changedTouches[0].clientY;
    if (dy > 40) input.jumpPressed = true;
  }, { passive: false });
}
