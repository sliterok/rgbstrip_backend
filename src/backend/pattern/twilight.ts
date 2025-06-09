import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { pixelsCount } from '../shared'

export const getTwilightColor: IColorGetter = (index, time) => {
	const x = index / pixelsCount
	const t = time / 1000
	const hue = 260 + 20 * Math.sin(t / 5 + x)
	const sat = 0.5 + 0.2 * Math.sin(t / 7)
	const light = 0.3 + (0.2 * (Math.sin(t / 6 + x * 2) + 1)) / 2
	return hslToRgb(hue, sat, light)
}
