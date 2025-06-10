import { IColorGetter, IArrColor } from 'src/typings'
import { hslToRgb } from 'src/helpers'

export const getHeartbeatColor: IColorGetter = (_, time) => {
	const cycle = 1000
	const t = time % cycle

	if (t < lastBeat) {
		beatColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastBeat = t

	let intensity = 0
	if (t < 120) {
		intensity = 1 - t / 120
	} else if (t >= 250 && t < 370) {
		intensity = 1 - (t - 250) / 120
	}

	return beatColor.map(c => Math.round(c * intensity)) as IArrColor
}

export const getStrobeColor: IColorGetter = (_, time) => {
	const interval = 200
	const t = time % interval
	if (t < lastStrobe) {
		strobeColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastStrobe = t
	return t < 40 ? strobeColor : [0, 0, 0]
}

export const getPulseColor: IColorGetter = (_, time) => {
	const cycle = 1000
	const t = time % cycle
	if (t < lastPulse) {
		pulseColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastPulse = t
	const intensity = Math.sin((t / cycle) * Math.PI)
	return pulseColor.map(c => Math.round(c * intensity)) as IArrColor
}

let beatColor: IArrColor = [255, 0, 0]
let lastBeat = 0
let strobeColor: IArrColor = [255, 255, 255]
let lastStrobe = 0
let pulseColor: IArrColor = [255, 0, 0]
let lastPulse = 0
