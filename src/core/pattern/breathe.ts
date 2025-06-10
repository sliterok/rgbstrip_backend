import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { dynamic } from '../shared'
import { settings } from 'src/settings'

export const getBreatheColor: IColorGetter = (_, time) => {
	const t = (time * settings.effectSpeed) / 1000
	const hue = (t * 20) % 360
	let amplitude = 0.25 * (1 - dynamic.overrideRatio)
	if (dynamic.overrideRatio > 0.8) amplitude = 0
	const light = 0.5 + amplitude * Math.sin(t / 2)
	return hslToRgb(hue, 1, light)
}
