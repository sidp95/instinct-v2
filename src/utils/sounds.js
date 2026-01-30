// Sound utilities for the app
// Uses Web Audio API with HTML5 Audio fallback for iOS Safari support

let audioContext = null;
let swipeBuffer = null;
let isUnlocked = false;
let unlockAttempted = false;

// Also keep HTML5 Audio as fallback
let htmlAudio = null;

/**
 * Get or create the AudioContext
 */
function getAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[Sound] AudioContext created, state:', audioContext.state);
    } catch (e) {
      console.error('[Sound] Failed to create AudioContext:', e);
    }
  }
  return audioContext;
}

/**
 * Get HTML5 Audio element as fallback
 */
function getHtmlAudio() {
  if (!htmlAudio) {
    htmlAudio = new Audio('/sounds/swipe.mp3');
    htmlAudio.preload = 'auto';
    htmlAudio.volume = 0.5;
    console.log('[Sound] HTML5 Audio element created');
  }
  return htmlAudio;
}

/**
 * Load the swipe sound into a buffer
 */
async function loadSwipeSound() {
  if (swipeBuffer) return swipeBuffer;

  try {
    const ctx = getAudioContext();
    if (!ctx) return null;

    console.log('[Sound] Loading swipe.mp3...');
    const response = await fetch('/sounds/swipe.mp3');

    if (!response.ok) {
      console.error('[Sound] Failed to fetch swipe.mp3:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('[Sound] Got array buffer, size:', arrayBuffer.byteLength);

    swipeBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.log('[Sound] Swipe sound decoded successfully, duration:', swipeBuffer.duration);
    return swipeBuffer;
  } catch (e) {
    console.error('[Sound] Failed to load swipe sound:', e);
    return null;
  }
}

/**
 * Play the swipe sound effect
 */
export function playSwipeSound() {
  console.log('[Sound] playSwipeSound called, isUnlocked:', isUnlocked);

  // Try Web Audio API first
  if (swipeBuffer && audioContext) {
    try {
      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        console.log('[Sound] Resuming suspended AudioContext...');
        audioContext.resume();
      }

      const source = audioContext.createBufferSource();
      source.buffer = swipeBuffer;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.5;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);
      console.log('[Sound] Playing via Web Audio API');
      return;
    } catch (e) {
      console.error('[Sound] Web Audio playback failed:', e);
    }
  }

  // Fallback to HTML5 Audio
  try {
    const audio = getHtmlAudio();
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        console.log('[Sound] Playing via HTML5 Audio');
      }).catch(e => {
        console.log('[Sound] HTML5 Audio play failed:', e.message);
      });
    }
  } catch (e) {
    console.error('[Sound] All audio playback failed:', e);
  }
}

/**
 * Unlock audio on first user interaction (iOS requirement)
 * Must be called from a user gesture (touchstart, click, etc.)
 */
export async function unlockAudio() {
  if (isUnlocked) {
    console.log('[Sound] Already unlocked');
    return;
  }

  if (unlockAttempted) {
    console.log('[Sound] Unlock already attempted, waiting...');
    return;
  }

  unlockAttempted = true;
  console.log('[Sound] ===== UNLOCK AUDIO STARTING =====');

  try {
    // Step 1: Create and resume AudioContext
    const ctx = getAudioContext();
    if (ctx) {
      console.log('[Sound] AudioContext state before resume:', ctx.state);

      if (ctx.state === 'suspended') {
        await ctx.resume();
        console.log('[Sound] AudioContext resumed, state:', ctx.state);
      }

      // Step 2: Play silent buffer to fully unlock iOS
      const silentBuffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(ctx.destination);
      source.start(0);
      console.log('[Sound] Silent buffer played');
    }

    // Step 3: Also unlock HTML5 Audio
    const audio = getHtmlAudio();
    audio.muted = true;
    try {
      await audio.play();
      audio.pause();
      audio.muted = false;
      audio.currentTime = 0;
      console.log('[Sound] HTML5 Audio unlocked');
    } catch (e) {
      console.log('[Sound] HTML5 Audio unlock failed:', e.message);
    }

    // Step 4: Load the actual sound
    await loadSwipeSound();

    isUnlocked = true;
    console.log('[Sound] ===== AUDIO UNLOCKED SUCCESSFULLY =====');
  } catch (e) {
    console.error('[Sound] Unlock failed:', e);
    // Still mark as attempted so we don't keep trying
  }
}

/**
 * Preload sounds - call early but note actual unlock needs user gesture
 */
export function preloadSounds() {
  console.log('[Sound] Preloading...');
  getAudioContext();
  getHtmlAudio();
}

/**
 * Check if audio is unlocked
 */
export function isAudioUnlocked() {
  return isUnlocked;
}
