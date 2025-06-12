import { IColorGetter } from 'src/typings'
import { hslToRgb } from 'src/helpers'
import { pixelsCount } from '../shared'
import { settings } from 'src/settings'
import { audioState } from '../wsAudio'

export const getWaveColor: IColorGetter = (index, time) => {
	const x = index / pixelsCount
	const t = (time * settings.effectSpeed) / 1000
	const hue = (t * 15 + x * 120) % 360
	const light = 0.5 + 0.25 * Math.sin(x * 4 - t) * (1 + audioState.beat)
	return hslToRgb(hue, 1, light)
}
