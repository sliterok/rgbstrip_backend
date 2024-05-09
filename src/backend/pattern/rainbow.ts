import { HSLToRGB } from 'src/helpers'
import { IColorGetter } from 'src/typings'

export const getRainbowColor: IColorGetter = index => {
	const color = (Date.now() / 16 + index) % 360
	return HSLToRGB(color, 50, 100)
}
