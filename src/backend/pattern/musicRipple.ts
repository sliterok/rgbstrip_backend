import { IColorGetter, IColorMapper, IArrColor } from 'src/typings'
import { callIndexedGetter } from './mappers'
import { pixelsCount, hueToColor } from '../shared'
import { settings } from 'src/settings'
import { audioState, AudioEvent } from '../wsAudio'

interface Ripple {
	pos: number
	radius: number
	speed: number
	color: IArrColor
}

let ripples: Ripple[] = []
let lastTime = Date.now()

function spawnRipple(evt: AudioEvent) {
	const { r, g, b } = hueToColor(evt.hue).rgb()
	ripples.push({ pos: Math.random() * pixelsCount, radius: 1, speed: 50 + evt.level * 200, color: [r, g, b] })
}

function update(time: number) {
	const dt = (time - lastTime) * settings.effectSpeed
	lastTime = time
	while (audioState.events.length) {
		const evt = audioState.events.shift()!
		spawnRipple(evt)
	}
	ripples.forEach(r => (r.radius += (r.speed * dt) / 1000))
	ripples = ripples.filter(r => r.radius < pixelsCount * 2)
}

export const getMusicRippleColor: IColorGetter = (index, time) => {
	if (index === 0) update(time)
	let r = 0
	let g = 0
	let b = 0
	for (const ripple of ripples) {
		const dist = Math.abs(index - ripple.pos)
		const t = ripple.radius > 0 ? 1 - dist / ripple.radius : dist === 0 ? 1 : 0
		if (t > 0) {
			r += ripple.color[0] * t
			g += ripple.color[1] * t
			b += ripple.color[2] * t
		}
	}
	return [Math.min(255, Math.round(r)), Math.min(255, Math.round(g)), Math.min(255, Math.round(b))]
}

export function resetMusicRipples() {
	ripples = []
	lastTime = 0
}

export const musicRippleMapper: IColorMapper = () => callIndexedGetter(getMusicRippleColor)
