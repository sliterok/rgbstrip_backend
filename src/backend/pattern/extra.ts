import { IColorGetter, IArrColor } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { settings } from 'src/settings'
import { pixelsCount, hueToColor } from '../shared'
import { audioState } from '../wsAudio'

export const getHeartbeatColor: IColorGetter = (_, time) => {
	const beat = settings.syncToMusic && audioState.bpm ? 60000 / audioState.bpm : 1000
	const cycle = beat
	const t = (time * settings.effectSpeed) % cycle

	if (t < lastHeartbeat) {
		prevHeartbeat = nextHeartbeat
		nextHeartbeat = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastHeartbeat = t

	const fade = Math.min(t / 200, 1)
	const baseColor = prevHeartbeat.map((c, i) => c + (nextHeartbeat[i] - c) * fade) as IArrColor

	const first = pulseIntensity(t, 0, cycle)
	const second = pulseIntensity(t, cycle / 4, cycle)
	const intensity = Math.max(first, second)

	return baseColor.map(c => Math.round(c * intensity)) as IArrColor
}

const pulseBaseDuration = 200
function pulseIntensity(t: number, offset: number, cycle: number) {
	const duration = settings.syncToMusic ? cycle * (pulseBaseDuration / 1000) : pulseBaseDuration
	const dt = t - offset
	if (dt < 0 || dt >= duration) return 0
	const ratio = dt / duration
	return Math.sin(ratio * Math.PI)
}

export const getStrobeColor: IColorGetter = (_, time) => {
	const interval = settings.syncToMusic && audioState.bpm ? 60000 / audioState.bpm : 200
	const t = (time * settings.effectSpeed) % interval
	if (t < lastStrobe) {
		strobeColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastStrobe = t
	const flash = settings.syncToMusic ? interval * 0.2 : 40
	return t < flash ? strobeColor : [0, 0, 0]
}

export const getPulseColor: IColorGetter = (_, time) => {
	const target = settings.syncToMusic && audioState.bpm ? 60000 / audioState.bpm : 1000

	if (!lastPulseTime) {
		lastPulseTime = time
		pulseCycle = target
	}

	const dt = (time - lastPulseTime) * settings.effectSpeed
	lastPulseTime = time
	pulsePhase += dt / pulseCycle

	if (pulsePhase >= 1) {
		pulsePhase %= 1
		pulseColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}

	pulseCycle = target

	const intensity = Math.sin(pulsePhase * Math.PI)
	return pulseColor.map(c => Math.round(c * intensity)) as IArrColor
}

export const getGradientPulseColor: IColorGetter = (index, time) => {
	const t = time * settings.effectSpeed
	const hueSpan = 60
	const hue = (t / 16 + (index / pixelsCount) * hueSpan) % 360
	const { r, g, b } = hueToColor(hue).rgb()
	const cycle = 1000
	const pulse = t % cycle
	const intensity = Math.sin((pulse / cycle) * Math.PI)
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
	const intensity = Math.sin((t / cycle) * Math.PI)
	return multiPulseColors[segment].map((c: number) => Math.round(c * intensity)) as IArrColor
}

let strobeColor: IArrColor = [255, 255, 255]
let lastStrobe = 0
let pulseColor: IArrColor = [255, 0, 0]
let pulseCycle = 1000
let pulsePhase = 0
let lastPulseTime = 0
let multiPulseColors: IArrColor[] = Array(4)
	.fill(null)
	.map(() => hslToRgb(Math.random() * 360, 1, 0.5))
let lastMultiPulse = 0
let prevHeartbeat: IArrColor = hslToRgb(Math.random() * 360, 1, 0.5)
let nextHeartbeat: IArrColor = prevHeartbeat
let lastHeartbeat = 0

export function resetExtraPatterns() {
	strobeColor = [255, 255, 255]
	lastStrobe = 0
	pulseColor = [255, 0, 0]
	pulseCycle = 1000
	pulsePhase = 0
	lastPulseTime = 0
	multiPulseColors = Array(4)
		.fill(null)
		.map(() => hslToRgb(Math.random() * 360, 1, 0.5))
	lastMultiPulse = 0
	prevHeartbeat = hslToRgb(Math.random() * 360, 1, 0.5)
	nextHeartbeat = prevHeartbeat
	lastHeartbeat = 0
}
