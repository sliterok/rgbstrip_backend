import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { pixelsCount } from '../shared'
import { settings } from 'src/settings'

export const getWaveColor: IColorGetter = (index, time) => {
	const x = index / pixelsCount
	const t = (time * settings.effectSpeed) / 1000
	const hue = (t * 15 + x * 120) % 360
	const light = 0.5 + 0.25 * Math.sin(x * 4 - t)
	return hslToRgb(hue, 1, light)
}
