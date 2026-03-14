export function formatDecimalHours(decimalHours: number | string | undefined | null): string {
    if (decimalHours === undefined || decimalHours === null || decimalHours === '--') return '--'

    let value = 0
    if (typeof decimalHours === 'string') {
        const num = parseFloat(decimalHours)
        if (isNaN(num)) return '--'
        value = num
    } else {
        value = decimalHours
    }

    if (value === 0) return '0h'

    const isNegative = value < 0
    const absValue = Math.abs(value)

    const hours = Math.floor(absValue)
    const decimalPart = absValue - hours
    const minutes = Math.round(decimalPart * 60)

    let result = ''

    if (hours > 0) {
        result += `${hours}h`
    }

    if (minutes > 0) {
        result += hours > 0 ? ` ${minutes}m` : `${minutes}m`
    }

    if (hours === 0 && minutes === 0) return '0h'

    return isNegative ? `-${result}` : result
}