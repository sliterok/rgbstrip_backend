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
let cooldowns: number[] = []
let hueShift = 0
const attenuation = 0.9
const speed = 60
const spawnCooldown = 100

function spawnRipple(bin: number, mag: number, avg: number) {
	const hue = (bin / audioState.bins.length) * 360 + hueShift
	const brightness = Math.min(1, mag / (avg * 2))
	const pos = (bin / audioState.bins.length) * pixelsCount
	ripples.push({ pos, radius: 1, brightness, hue })
	ripples.push({ pos: pixelsCount - pos, radius: 1, brightness, hue })
}

function update(time: number) {
	const dt = (time - lastTime) * settings.effectSpeed
	lastTime = time
	hueShift = (hueShift + dt * 0.05) % 360
	const bins = audioState.bins
	if (bins && bins.length) {
		if (averages.length !== bins.length) {
			averages = bins.slice()
			cooldowns = new Array(bins.length).fill(0)
		}
		for (let i = 0; i < bins.length; i++) {
			const m = bins[i]
			averages[i] = averages[i] * 0.9 + m * 0.1
			cooldowns[i] -= dt
			if (m > averages[i] * 1.5 && cooldowns[i] <= 0) {
				spawnRipple(i, m, averages[i])
				cooldowns[i] = spawnCooldown
			}
		}
	}
	ripples.forEach(r => {
		r.radius += (speed * dt) / 1000
		r.brightness *= Math.pow(attenuation, dt / 16)
	})
	ripples = ripples.filter(r => r.brightness > 0.05)
}

export const getFftMirrorColor: IColorGetter = (index, time) => {
	if (index === 0) update(time)
	let r = 0
	let g = 0
	let b = 0
	for (const ripple of ripples) {
		const dist = Math.abs(index - ripple.pos)
		if (dist <= ripple.radius) {
			const intensity = (ripple.brightness * (1 - dist / ripple.radius)) / ripple.radius
			const { r: rr, g: gg, b: bb } = hueToColor(ripple.hue).rgb()
			r += rr * intensity
			g += gg * intensity
			b += bb * intensity
		}
	}
	return [Math.min(255, Math.round(r)), Math.min(255, Math.round(g)), Math.min(255, Math.round(b))]
}

export function resetFftMirror() {
	ripples = []
	lastTime = 0
	averages = []
	cooldowns = []
	hueShift = 0
}

export const fftMirrorMapper: IColorMapper = () => callIndexedGetter(getFftMirrorColor)
