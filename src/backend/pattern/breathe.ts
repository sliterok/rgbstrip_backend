import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { dynamic, pixelsCount } from '../shared'

const hueOffsets = Array.from({ length: pixelsCount }, () => Math.random() * 360)
const phaseOffsets = Array.from({ length: pixelsCount }, () => Math.random() * Math.PI * 2)
const amplitudeFactors = Array.from({ length: pixelsCount }, () => 0.8 + Math.random() * 0.4)

export const getBreatheColor: IColorGetter = (index, time) => {
	const t = time / 1000
	const baseHue = (t * 20) % 360

	if (dynamic.overrideRatio > 0 && dynamic.breatheHue === undefined) {
		dynamic.breatheHue = baseHue
	} else if (dynamic.overrideRatio === 0 && dynamic.breatheHue !== undefined) {
		dynamic.breatheHue = undefined
	}

	const hue = (dynamic.breatheHue ?? baseHue + hueOffsets[index]) % 360
	let amplitude = 0.25 * amplitudeFactors[index] * (1 - dynamic.overrideRatio)
	if (dynamic.overrideRatio > 0.8) amplitude = 0
	const phase = phaseOffsets[index]
	const light = 0.5 + amplitude * Math.sin(t / 2 + phase)
	return hslToRgb(hue, 1, light)
}
