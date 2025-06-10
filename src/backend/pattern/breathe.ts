import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { dynamic } from '../shared'

export const getBreatheColor: IColorGetter = (_, time) => {
	const t = time / 1000
	const baseHue = (t * 20) % 360
	const baseLight = 0.5 + 0.25 * Math.sin(t / 2)

	if (dynamic.overrideRatio > 0 && dynamic.breatheHue === undefined) {
		dynamic.breatheHue = baseHue
		dynamic.breatheLight = baseLight
	} else if (dynamic.overrideRatio === 0 && dynamic.breatheHue !== undefined) {
		dynamic.breatheHue = undefined
		dynamic.breatheLight = undefined
	}

	const startHue = dynamic.breatheHue ?? baseHue
	const startLight = dynamic.breatheLight ?? baseLight
	const light = startLight + (0.5 - startLight) * dynamic.overrideRatio
	return hslToRgb(startHue, 1, light)
}
