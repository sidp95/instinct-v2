// Sound utilities for the app
// Uses Web Audio API for better iOS Safari support

let audioContext = null;
let swipeBuffer = null;
let isUnlocked = false;
let isLoading = false;

/**
 * Get or create the AudioContext
 */
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Load the swipe sound into a buffer
 */
async function loadSwipeSound() {
  if (swipeBuffer || isLoading) return swipeBuffer;

  isLoading = true;
  try {
    const ctx = getAudioContext();
    const response = await fetch('/sounds/swipe.mp3');
    const arrayBuffer = await response.arrayBuffer();
    swipeBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.log('[Sound] Swipe sound loaded successfully');
    return swipeBuffer;
  } catch (e) {
    console.error('[Sound] Failed to load swipe sound:', e);
    return null;
  } finally {
    isLoading = false;
  }
}

/**
 * Play the swipe sound effect using Web Audio API
 */
export function playSwipeSound() {
  try {
    if (!swipeBuffer) {
      console.log('[Sound] Buffer not loaded yet, skipping');
      return;
    }

    const ctx = getAudioContext();

    // Resume context if suspended (iOS requirement)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create a new buffer source for each play
    const source = ctx.createBufferSource();
    source.buffer = swipeBuffer;

    // Add gain node for volume control
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.5;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(0);
    console.log('[Sound] Playing swipe sound');
  } catch (e) {
    console.error('[Sound] Error playing swipe:', e);
  }
}

/**
 * Unlock audio on first user interaction (iOS requirement)
 * Must be called from a user gesture (touchstart, click, etc.)
 */
export async function unlockAudio() {
  if (isUnlocked) return;

  console.log('[Sound] Attempting to unlock audio...');

  try {
    const ctx = getAudioContext();

    // Resume the audio context (required on iOS)
    if (ctx.state === 'suspended') {
      await ctx.resume();
      console.log('[Sound] AudioContext resumed');
    }

    // Play a silent buffer to fully unlock
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    // Now load the actual sound
    await loadSwipeSound();

    isUnlocked = true;
    console.log('[Sound] Audio unlocked successfully!');
  } catch (e) {
    console.error('[Sound] Failed to unlock audio:', e);
  }
}

/**
 * Preload sounds (call early in app lifecycle)
 */
export function preloadSounds() {
  // Just initialize the context, don't load yet (needs user interaction)
  getAudioContext();
}

/**
 * Check if audio is unlocked
 */
export function isAudioUnlocked() {
  return isUnlocked;
}
