import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { pixelsCount, normalNoise } from '../shared'

export const getPlasmaColor: IColorGetter = (index, time) => {
	const x = index / pixelsCount
	const t = time / 1000

	const wave1 = Math.sin(t / 5 + x * 4)
	const wave2 = Math.sin(t / 7 - x * 7)
	const wave3 = Math.sin(t / 11 + x * 13)
	const hueBase = (wave1 + wave2 + wave3) * 60
	const hueNoise = normalNoise(t / 3, x) * 60
	const hue = (hueBase + hueNoise + t * 10) % 360

	const lightness = 0.5 + 0.1 * Math.sin(t / 3 + x * 2)

	return hslToRgb(hue, 1, lightness)
}
