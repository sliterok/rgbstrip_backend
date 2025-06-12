import { IColorGetter, IArrColor } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { settings } from 'src/settings'
import { pixelsCount, hueToColor } from '../shared'
import { audioState } from '../wsAudio'

export const getHeartbeatColor: IColorGetter = (_, time) => {
	const cycle = 1000
	const t = (time * settings.effectSpeed) % cycle

	if (t < lastHeartbeat) {
		prevHeartbeat = nextHeartbeat
		nextHeartbeat = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastHeartbeat = t

	const fade = Math.min(t / 200, 1)
	const baseColor = prevHeartbeat.map((c, i) => c + (nextHeartbeat[i] - c) * fade) as IArrColor

	const first = pulseIntensity(t, 0)
	const second = pulseIntensity(t, 250)
	const intensity = Math.min(1, Math.max(first, second) * (1 + audioState.beat))

	return baseColor.map(c => Math.round(c * intensity)) as IArrColor
}

const pulseDuration = 200
function pulseIntensity(t: number, offset: number) {
	const dt = t - offset
	if (dt < 0 || dt >= pulseDuration) return 0
	const ratio = dt / pulseDuration
	return Math.sin(ratio * Math.PI)
}

export const getStrobeColor: IColorGetter = (_, time) => {
	const interval = 200
	const t = (time * settings.effectSpeed) % interval
	if (t < lastStrobe) {
		strobeColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastStrobe = t
	return t < 40 * (1 + audioState.beat) ? strobeColor : [0, 0, 0]
}

export const getPulseColor: IColorGetter = (_, time) => {
	const cycle = 1000
	const t = (time * settings.effectSpeed) % cycle
	if (t < lastPulse) {
		pulseColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastPulse = t
	const intensity = Math.min(1, Math.sin((t / cycle) * Math.PI) * (1 + audioState.beat))
	return pulseColor.map(c => Math.round(c * intensity)) as IArrColor
}

export const getGradientPulseColor: IColorGetter = (index, time) => {
	const t = time * settings.effectSpeed
	const hueSpan = 60
	const hue = (t / 16 + (index / pixelsCount) * hueSpan) % 360
	const { r, g, b } = hueToColor(hue).rgb()
	const cycle = 1000
	const pulse = t % cycle
	const intensity = Math.min(1, Math.sin((pulse / cycle) * Math.PI) * (1 + audioState.beat))
	return [Math.round(r * intensity), Math.round(g * intensity), Math.round(b * intensity)] as IArrColor
}

export const getMultiPulseColor: IColorGetter = (index, time) => {
	const cycle = 1000
	const t = (time * settings.effectSpeed) % cycle
	if (t < lastMultiPulse) {
		multiPulseColors = multiPulseColors.map(() => hslToRgb(Math.random() * 360, 1, 0.5))
	}
	lastMultiPulse = t
	const segment = Math.min(Math.floor((index / pixelsCount) * multiPulseColors.length), multiPulseColors.length - 1)
	const intensity = Math.min(1, Math.sin((t / cycle) * Math.PI) * (1 + audioState.beat))
	return multiPulseColors[segment].map((c: number) => Math.round(c * intensity)) as IArrColor
}

let strobeColor: IArrColor = [255, 255, 255]
let lastStrobe = 0
let pulseColor: IArrColor = [255, 0, 0]
let lastPulse = 0
let multiPulseColors: IArrColor[] = Array(4)
	.fill(null)
	.map(() => hslToRgb(Math.random() * 360, 1, 0.5))
let lastMultiPulse = 0
let prevHeartbeat: IArrColor = hslToRgb(Math.random() * 360, 1, 0.5)
let nextHeartbeat: IArrColor = prevHeartbeat
let lastHeartbeat = 0
