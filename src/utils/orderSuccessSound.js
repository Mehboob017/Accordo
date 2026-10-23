let audioContext = null;
let audioBuffer = null;
let loadingPromise = null;
let unlocked = false;

const SOUND_URL = '/assets/sounds/order-success.mp3';

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    audioContext = new AudioContext();
  }

  return audioContext;
};

const loadSound = async () => {
  if (typeof window === 'undefined') return null;

  if (audioBuffer) {
    return audioBuffer;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  const context = getAudioContext();

  if (!context) {
    return null;
  }

  loadingPromise = fetch(SOUND_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${response.status}`);
      }

      return response.arrayBuffer();
    })
    .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
    .then((decodedBuffer) => {
      audioBuffer = decodedBuffer;
      return decodedBuffer;
    })
    .catch((error) => {
      console.warn('[OrderSuccessSound] Failed to load:', error);
      loadingPromise = null;
      return null;
    });

  return loadingPromise;
};

/**
 * Call this from a real user interaction:
 * click / tap / pointerdown / keydown.
 */
export const unlockOrderSuccessSound = async () => {
  const context = getAudioContext();

  if (!context) {
    return false;
  }

  try {
    if (context.state === 'suspended') {
      await context.resume();
    }

    unlocked = context.state === 'running';

    // Start loading the sound while we have user interaction.
    loadSound();

    return unlocked;
  } catch (error) {
    console.warn('[OrderSuccessSound] Unable to unlock:', error);
    return false;
  }
};

/**
 * Play the confirmation sound.
 */
export const playOrderSuccessSound = async () => {
  const context = getAudioContext();

  if (!context) {
    return false;
  }

  try {
    if (context.state === 'suspended') {
      await context.resume();
    }

    const buffer = await loadSound();

    if (!buffer) {
      return false;
    }

    if (context.state !== 'running') {
      return false;
    }

    const source = context.createBufferSource();
    const gainNode = context.createGain();

    source.buffer = buffer;

    // Confirmation sound volume.
    gainNode.gain.value = 0.75;

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start(0);

    unlocked = true;

    return true;
  } catch (error) {
    console.warn('[OrderSuccessSound] Playback blocked:', error);
    return false;
  }
};

export const isOrderSuccessSoundUnlocked = () => {
  return unlocked;
};