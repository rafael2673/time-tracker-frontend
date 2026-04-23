export function formatDecimalHours(decimalHours: number, showSign: boolean = true): string {
  const isNegative = decimalHours < 0
  const absoluteHours = Math.abs(decimalHours)
  const hours = Math.floor(absoluteHours)
  const minutes = Math.round((absoluteHours - hours) * 60)
  
  const sign = isNegative ? '-' : '+'
  const formattedHours = hours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  
  if (!showSign) {
    return `${formattedHours}:${formattedMinutes}`
  }
  
  return `${sign}${formattedHours}:${formattedMinutes}`
}
