import { IColorGetter, IColorMapper } from 'src/typings'
import { callIndexedGetter } from './mappers'
import { pixelsCount, hueToColor } from '../shared'
import { settings } from 'src/settings'
import { audioState } from '../wsAudio'

interface Ripple {
	pos: number
	radius: number
	brightness: number
	hue: number
}

let ripples: Ripple[] = []
let lastTime = Date.now()
let averages: number[] = []
let hueShift = 0
const attenuation = 0.9
const speed = 60

function spawnRipple(bin: number, mag: number) {
	const hue = (bin / audioState.bins.length) * 360 + hueShift
	ripples.push({
		pos: Math.random() * pixelsCount,
		radius: 1,
		brightness: Math.min(1, mag),
		hue,
	})
}

function update(time: number) {
	const dt = (time - lastTime) * settings.effectSpeed
	lastTime = time
	hueShift = (hueShift + dt * 0.05) % 360
	const bins = audioState.bins
	if (bins && bins.length) {
		if (averages.length !== bins.length) averages = bins.slice()
		for (let i = 0; i < bins.length; i++) {
			const m = bins[i]
			averages[i] = averages[i] * 0.9 + m * 0.1
			if (m > averages[i] * 1.5) spawnRipple(i, m)
		}
	}
	ripples.forEach(r => {
		r.radius += (speed * dt) / 1000
		r.brightness *= Math.pow(attenuation, dt / 16)
	})
	ripples = ripples.filter(r => r.brightness > 0.05)
}

export const getFftRandomColor: IColorGetter = (index, time) => {
	if (index === 0) update(time)
	let r = 0
	let g = 0
	let b = 0
	for (const ripple of ripples) {
		const dist = Math.abs(index - ripple.pos)
		if (dist <= ripple.radius) {
			const intensity = ripple.brightness * (1 - dist / ripple.radius)
			const { r: rr, g: gg, b: bb } = hueToColor(ripple.hue).rgb()
			r += rr * intensity
			g += gg * intensity
			b += bb * intensity
		}
	}
	return [Math.min(255, Math.round(r)), Math.min(255, Math.round(g)), Math.min(255, Math.round(b))]
}

export function resetFftRandom() {
	ripples = []
	lastTime = Date.now()
	averages = []
	hueShift = 0
}

export const fftRandomMapper: IColorMapper = () => callIndexedGetter(getFftRandomColor)
