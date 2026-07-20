import type { PlaySoundOptions } from "@/types/audio";

/*
  Holds the lazily created shared audio output until `getAudioContext` assigns it
*/
let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/*
  Maps each `dataUri` to its decoded buffer so decode work runs once per sound
*/
const bufferCache = new Map<string, AudioBuffer>();

async function decodeAudio(dataUri: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(dataUri);
  if (cached) return cached;

  const audioCtx = getAudioContext();
  const base64 = dataUri.split(",")[1];

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const buffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
  bufferCache.set(dataUri, buffer);
  return buffer;
}

export async function playSound(
  dataUri: string,
  { volume = 1, playbackRate = 1 }: PlaySoundOptions = {},
): Promise<void> {
  const audioCtx = getAudioContext();

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  const buffer = await decodeAudio(dataUri);
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();

  source.buffer = buffer;
  source.playbackRate.value = playbackRate;
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(0);
}
