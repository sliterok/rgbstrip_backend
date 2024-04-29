import { settings } from './settings'

export const rgbToHex = (r: number, g: number, b: number) =>
	'#' +
	[r, g, b]
		.map(x => {
			const hex = x.toString(16)
			return hex.length === 1 ? '0' + hex : hex
		})
		.join('')

export function hexToRgb(hex: string) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0]
}

export const HSLToRGB = (h: number, s: number, l: number) => {
	s /= 100
	l /= 100
	const k = (n: number) => (n + h / 30) % 12
	const a = s * Math.min(l, 1 - l)
	const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
	return [255 * f(0), 255 * f(8), 255 * f(4)]
}

export const clamp = (min: number, num: number, max: number) => Math.min(Math.max(num, min), max)

export function getTime(hours: number, minutes: number) {
	return hours + minutes / 60
}

export const preWakeupTime = getTime(7, 30)
export const wakeupTime = getTime(8, 50)
export const sleepTime = getTime(23, 30)
export const wakeupTimeWeekend = getTime(10, 0)
export const sleepTimeWeekend = getTime(23, 58)

export function getTargetTime() {
	const d = new Date()
	const time = getTime(d.getHours(), d.getMinutes())
	const day = d.getDay()

	const isWeekend = [6, 7].includes(day)

	if (time >= (isWeekend ? sleepTimeWeekend : sleepTime)) return true
	else if (time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) return true
}

export function getCurrentMode() {
	if (getTargetTime() && !settings.nightOverride) return 0
	else if (settings.away && !settings.geoOverride) return 4 // when away
	else return settings.mode
}
