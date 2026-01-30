// Sound utilities for the app
// Handles iOS audio restrictions by unlocking on first user interaction

let swipeAudio = null;
let audioUnlocked = false;

function getSwipeAudio() {
  if (!swipeAudio) {
    swipeAudio = new Audio('/sounds/swipe.mp3');
    swipeAudio.volume = 0.5;
    swipeAudio.preload = 'auto';
  }
  return swipeAudio;
}

/**
 * Play the swipe sound effect
 */
export function playSwipeSound() {
  try {
    const audio = getSwipeAudio();
    // Reset to start if already playing
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignore errors - audio may not be unlocked yet on iOS
    });
  } catch (e) {
    // Ignore audio errors
  }
}

/**
 * Unlock audio on first user interaction (iOS requirement)
 * Call this on touchstart/mousedown events
 */
export function unlockAudio() {
  if (audioUnlocked) return;
  try {
    const audio = getSwipeAudio();
    // Play and immediately pause to unlock
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audioUnlocked = true;
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Preload sounds (call early in app lifecycle)
 */
export function preloadSounds() {
  getSwipeAudio();
}
