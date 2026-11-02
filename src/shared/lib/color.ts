export const LIGHT_INK = '#FFFFFF'
export const DARK_INK = '#1D1D1F'

/** WCAG relative luminance of a `#RRGGBB` color. */
export function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const [red, green, blue] = channels as [number, number, number]
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

/** WCAG contrast ratio, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (lighter! + 0.05) / (darker! + 0.05)
}

/** White or charcoal, whichever reads better on `background`. */
export function readableInk(background: string): string {
  return contrastRatio(background, LIGHT_INK) >= contrastRatio(background, DARK_INK)
    ? LIGHT_INK
    : DARK_INK
}

/** `hex`, darkened only as far as it takes to read as text on `background` (WCAG AA, 4.5:1). */
export function readableText(hex: string, background: string = LIGHT_INK): string {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
  for (let factor = 1; factor > 0; factor -= 0.01) {
    const candidate = `#${channels
      .map((value) =>
        Math.round(value * factor)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`
    if (contrastRatio(candidate, background) >= 4.5) return candidate
  }
  return DARK_INK
}
