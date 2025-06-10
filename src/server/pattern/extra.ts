import { IColorGetter, IArrColor } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { settings } from 'src/settings'

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
	const intensity = Math.max(first, second)

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
	return t < 40 ? strobeColor : [0, 0, 0]
}

export const getPulseColor: IColorGetter = (_, time) => {
	const cycle = 1000
	const t = (time * settings.effectSpeed) % cycle
	if (t < lastPulse) {
		pulseColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastPulse = t
	const intensity = Math.sin((t / cycle) * Math.PI)
	return pulseColor.map(c => Math.round(c * intensity)) as IArrColor
}

let strobeColor: IArrColor = [255, 255, 255]
let lastStrobe = 0
let pulseColor: IArrColor = [255, 0, 0]
let lastPulse = 0
let prevHeartbeat: IArrColor = hslToRgb(Math.random() * 360, 1, 0.5)
let nextHeartbeat: IArrColor = prevHeartbeat
let lastHeartbeat = 0
