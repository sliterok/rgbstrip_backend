import { IColorGetter } from 'src/typings'
import { hueToColor } from '../shared'
import { settings } from 'src/settings'

export const getRainbowColor: IColorGetter = (index, time) => {
	const t = time * settings.effectSpeed
	const hue = (t / 16 + index) % 360
	const { r, g, b } = hueToColor(hue).rgb()
	return [r, g, b]
}
