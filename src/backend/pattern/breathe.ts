import { IColorGetter } from 'src/typings'
import { hslToRgb, clamp, smoothStep } from 'src/helpers'
import { dynamic } from '../shared'

export const getBreatheColor: IColorGetter = (_, time) => {
	const t = time / 1000
	const baseHue = (t * 20) % 360
	const ratio = clamp(0, dynamic.overrideRatio, 1)

	const freezeAt = 0.6
	if (ratio >= freezeAt && dynamic.breatheHue === undefined) {
		dynamic.breatheHue = baseHue
	} else if (ratio < freezeAt && dynamic.breatheHue !== undefined) {
		dynamic.breatheHue = undefined
	}

	const tFreeze = smoothStep(ratio, freezeAt, 1)
	const lockHue = dynamic.breatheHue
	const hue = lockHue === undefined ? baseHue : lockHue * tFreeze + baseHue * (1 - tFreeze)

	const baseAmp = 0.25 * Math.sin((1 - ratio) * Math.PI * 0.5)
	const amplitude = baseAmp * (1 - tFreeze)
	const light = 0.5 + amplitude * Math.sin(t / 2)
	return hslToRgb(hue, 1, light)
}
