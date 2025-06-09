import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { pixelsCount, normalNoise } from '../shared'

export const getOceanColor: IColorGetter = (index, time) => {
	const x = index / pixelsCount
	const t = time / 1000
	const wave = Math.sin(t / 6 + x * 3) + Math.sin(t / 8 - x * 5)
	const hue = 190 + wave * 10 + normalNoise(x, t) * 5
	const light = 0.5 + 0.1 * Math.sin(t / 4 + x * 2)
	return hslToRgb(hue, 0.7, light)
}
