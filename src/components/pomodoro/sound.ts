// Avisos sonoros sintetizados com Web Audio (sem arquivos de áudio).
// Navegadores só liberam áudio após um gesto do usuário, então o contexto é
// criado/retomado por `unlockAudio()` ao iniciar o timer.
let context: AudioContext | null = null

function getContext() {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  context ??= new AudioContext()
  return context
}

export function unlockAudio() {
  try {
    const ctx = getContext()
    if (ctx?.state === 'suspended') void ctx.resume()
  } catch {
    // sem áudio disponível: o timer segue funcionando em silêncio
  }
}

function beep(
  ctx: AudioContext,
  frequency: number,
  start: number,
  length = 0.18,
) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  // rampas curtas evitam o "clique" no início e no fim da nota
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + length + 0.02)
}

function play(notes: { frequency: number; offset: number; length?: number }[]) {
  try {
    const ctx = getContext()
    if (!ctx) return
    void ctx.resume()
    const now = ctx.currentTime
    for (const note of notes) {
      beep(ctx, note.frequency, now + note.offset, note.length)
    }
  } catch {
    // ignora falhas de áudio
  }
}

// fim de uma fase: beep duplo
export function playPhaseEnd() {
  play([
    { frequency: 880, offset: 0 },
    { frequency: 880, offset: 0.25 },
  ])
}

// fim de todas as sessões: arpejo ascendente
export function playCycleComplete() {
  play([
    { frequency: 523.25, offset: 0 },
    { frequency: 659.25, offset: 0.18 },
    { frequency: 783.99, offset: 0.36 },
    { frequency: 1046.5, offset: 0.54, length: 0.5 },
  ])
}
