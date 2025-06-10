import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { dynamic } from '../shared'

export const getBreatheColor: IColorGetter = (_, time) => {
	const t = time / 1000
	const baseHue = (t * 20) % 360
	const baseLight = 0.5 + 0.25 * Math.sin(t / 2)

	if (dynamic.overrideRatio > 0 && dynamic.breatheHue === undefined) {
		dynamic.breatheHue = baseHue
	} else if (dynamic.overrideRatio === 0 && dynamic.breatheHue !== undefined) {
		dynamic.breatheHue = undefined
	}

	const hue = dynamic.breatheHue ?? baseHue
	let amplitude = 0.25 * (1 - dynamic.overrideRatio)
	if (dynamic.overrideRatio > 0.8) amplitude = 0
	const light = 0.5 + amplitude * Math.sin(t / 2)
	return hslToRgb(hue, 1, light)
}
