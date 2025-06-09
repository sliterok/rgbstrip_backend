import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'

export const getBreatheColor: IColorGetter = (_, time) => {
	const t = time / 1000
	const hue = (t * 20) % 360
	const light = 0.5 + 0.25 * Math.sin(t / 2)
	return hslToRgb(hue, 1, light)
}
