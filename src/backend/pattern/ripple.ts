import { IColorMapper, IArrColor, IColorGetter } from 'src/typings'
import { callIndexedGetter } from './mappers'
import { pixelsCount, hueToColor } from '../shared'
import { settings } from 'src/settings'

interface Ripple {
	pos: number
	radius: number
	speed: number
	color: IArrColor
}

let ripples: Ripple[] = []
let lastTime = Date.now()
let spawnTimer = 0
const spawnInterval = 1000

function spawnRipple() {
	const { r, g, b } = hueToColor(Math.random() * 360).rgb()
	ripples.push({ pos: Math.random() * pixelsCount, radius: 1, speed: 50, color: [r, g, b] })
}

function update(time: number) {
	const dt = (time - lastTime) * settings.effectSpeed
	lastTime = time
	spawnTimer += dt
	while (spawnTimer >= spawnInterval) {
		spawnTimer -= spawnInterval
		spawnRipple()
	}
	ripples.forEach(r => (r.radius += (r.speed * dt) / 1000))
	ripples = ripples.filter(r => r.radius < pixelsCount * 2)
}

export const getRippleColor: IColorGetter = (index, time) => {
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

export function resetRipples() {
	ripples = []
	lastTime = 0
	spawnTimer = 0
}

export const rippleMapper: IColorMapper = () => callIndexedGetter(getRippleColor)
