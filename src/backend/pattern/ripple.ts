import { IColorMapper, IArrColor, IColorGetter } from 'src/typings'
import { callIndexedGetter } from './mappers'
import { pixelsCount, hueToColor } from '../shared'
import { dynamic } from '../shared'
import { settings } from 'src/settings'

interface Ripple {
	pos: number
	radius: number
	speed: number
	color: IArrColor
}

let ripples: Ripple[] = []
let lastTime = Date.now()

function update(time: number) {
	const dt = (time - lastTime) * settings.effectSpeed
	lastTime = time
	ripples.forEach(r => (r.radius += (r.speed * dt) / 30))
	ripples = ripples.filter(r => r.radius < pixelsCount)
	if (settings.music && dynamic.audioLevel > Math.random()) {
		const { r, g, b } = hueToColor(dynamic.audioHue).rgb()
		const speed = 0.5 + dynamic.audioLevel * 5
		ripples.push({ pos: Math.random() * pixelsCount, radius: 1, speed, color: [r, g, b] })
	}
}

const getRippleColor: IColorGetter = (index, time) => {
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

export const musicRippleMapper: IColorMapper = () => callIndexedGetter(getRippleColor)
