export const PALETTES = [
  { id: 'ocean', label: 'Oceano', swatch: 'bg-palette-ocean' },
  { id: 'midnight', label: 'Meia-noite', swatch: 'bg-palette-midnight' },
  { id: 'green', label: 'Verde', swatch: 'bg-palette-green' },
  { id: 'orange', label: 'Laranja', swatch: 'bg-palette-orange' },
  { id: 'pink', label: 'Rosa', swatch: 'bg-palette-pink' },
] as const

export type PaletteId = (typeof PALETTES)[number]['id']

export const DEFAULT_PALETTE: PaletteId = 'ocean'
const STORAGE_KEY = 'palette'

export function isPaletteId(value: unknown): value is PaletteId {
  return PALETTES.some((palette) => palette.id === value)
}

export function getPalette(): PaletteId {
  const current = document.documentElement.dataset.palette
  return isPaletteId(current) ? current : DEFAULT_PALETTE
}

export function setPalette(id: PaletteId) {
  document.documentElement.dataset.palette = id
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // storage indisponível: a paleta vale só nesta sessão
  }
}

// Roda antes da hidratação (script inline no <head>) para evitar flash.
export const PALETTE_INIT_SCRIPT = `(function(){try{var p=window.localStorage.getItem('${STORAGE_KEY}');var ok=${JSON.stringify(PALETTES.map((p) => p.id))};if(p&&ok.indexOf(p)>-1){document.documentElement.setAttribute('data-palette',p)}}catch(e){}})();`
