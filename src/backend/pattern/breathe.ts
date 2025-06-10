import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { dynamic } from '../shared'

export const getBreatheColor: IColorGetter = (_, time) => {
	const t = time / 1000
	const baseHue = (t * 20) % 360
	const ratio = Math.max(0, Math.min(1, dynamic.overrideRatio))

	const freezeAt = 0.6
	if (ratio >= freezeAt && dynamic.breatheHue === undefined) {
		dynamic.breatheHue = baseHue
	} else if (ratio < freezeAt && dynamic.breatheHue !== undefined) {
		dynamic.breatheHue = undefined
	}

	let hue = baseHue
	if (dynamic.breatheHue !== undefined && ratio >= freezeAt) {
		const lockHue = dynamic.breatheHue
		const tFreeze = (ratio - freezeAt) / (1 - freezeAt)
		hue = lockHue * tFreeze + baseHue * (1 - tFreeze)
	}

	const amplitude = 0.25 * Math.sin((1 - ratio) * Math.PI * 0.5)
	const light = 0.5 + amplitude * Math.sin(t / 2)
	return hslToRgb(hue, 1, light)
}
