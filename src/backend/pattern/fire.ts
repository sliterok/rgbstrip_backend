import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { pixelsCount, normalNoise } from '../shared'

export const getFireColor: IColorGetter = (index, time) => {
	const x = index / pixelsCount
	const t = time / 1000
	const hue = 20 + normalNoise(x * 3, t) * 20 + normalNoise(t, x) * 10
	const light = 0.4 + normalNoise(x, t * 2) * 0.3
	return hslToRgb(hue, 1, light)
}
