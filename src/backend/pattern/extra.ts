import { IColorGetter, IArrColor } from 'src/typings'
import { hslToRgb } from 'src/helpers'

export const getHeartbeatColor: IColorGetter = (_, t) => {
	const beat = Math.sin(t / 300) ** 2
	const beat2 = Math.sin(t / 600) ** 2
	const intensity = Math.max(beat, beat2)
	if (intensity > 0.9 && lastIntensity <= 0.9) {
		currentColor = hslToRgb(Math.random() * 360, 1, 0.5)
	}
	lastIntensity = intensity
	return currentColor.map(c => Math.round(c * intensity)) as IArrColor
}

let currentColor: IArrColor = [255, 0, 0]
let lastIntensity = 0
