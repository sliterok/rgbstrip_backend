import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { dynamic } from '../shared'

export const getBreatheColor: IColorGetter = (_, time) => {
	const t = time / 1000
	const baseHue = (t * 20) % 360

	const freezeAt = 0.6
	if (dynamic.overrideRatio >= freezeAt && dynamic.breatheHue === undefined) {
		dynamic.breatheHue = baseHue
	} else if (dynamic.overrideRatio < freezeAt && dynamic.breatheHue !== undefined) {
		dynamic.breatheHue = undefined
	}

	const hue = dynamic.breatheHue ?? baseHue
	const ratio = Math.min(1, Math.max(0, dynamic.overrideRatio))
	let amplitude = 0.25 * Math.sin((1 - ratio) * Math.PI * 0.5)
	const light = 0.5 + amplitude * Math.sin(t / 2)
	return hslToRgb(hue, 1, light)
}
