import { IColorGetter } from 'src/typings'
import { hueToColor } from '../shared'

export const getRainbowColor: IColorGetter = (index, time) => {
	const hue = (time / 16 + index) % 360
	const { r, g, b } = hueToColor(hue).rgb()
	return [r, g, b]
}
