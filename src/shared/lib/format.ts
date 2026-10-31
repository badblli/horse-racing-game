const distanceFormat = new Intl.NumberFormat('en-US')

/** `1600` → `"1,600 m"` */
export function formatDistance(meters: number): string {
  return `${distanceFormat.format(meters)} m`
}

/** Race time in seconds as minutes, seconds and hundredths: `97.84` → `"1:37.84"` */
export function formatRaceTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`Invalid race time: ${seconds}`)
  }
  // Round once to hundredths so 59.996 carries over to "1:00.00" instead of "0:60.00".
  const hundredths = Math.round(seconds * 100)
  const minutes = Math.floor(hundredths / 6000)
  const wholeSeconds = Math.floor((hundredths % 6000) / 100)
  return `${minutes}:${pad2(wholeSeconds)}.${pad2(hundredths % 100)}`
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}
